"""Assemble l'APK final, l'aligne et le signe (schéma de signature APK v2).

Entrées :
  base.apk     manifeste binaire + resources.arsc + res/, produits par ARSCLib (Outil build projet base.apk)
  classes.dex  l'activité WebView, assemblée avec smali
  assets/      le site embarqué (index.html, scripts, images, polices)
Sortie : sortie/apeupresdaccord.apk

Alignement : chaque fichier stocké sans compression (resources.arsc, images, polices) commence sur un
multiple de 4 octets, grâce au champ « extra » 0xD935 qu'utilise zipalign.
Signature v2 : suffisante dès Android 7 (minSdk 24). Clé et certificat dans cle/ (créés au premier passage).
"""
import hashlib
import os
import struct
import sys
import zipfile
from datetime import datetime, timedelta, timezone

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.x509.oid import NameOID

ICI = os.path.dirname(os.path.abspath(__file__))
STOCKES = ('.png', '.webp', '.jpg', '.woff2', '.arsc')
DATE = (1981, 1, 1, 1, 1, 2)


def entrees():
    """(nom, octets, compresser) dans l'ordre d'écriture."""
    t = []
    with zipfile.ZipFile(os.path.join(ICI, 'base.apk')) as z:
        for info in z.infolist():
            t.append((info.filename, z.read(info.filename)))
    t.append(('classes.dex', open(os.path.join(ICI, 'classes.dex'), 'rb').read()))
    racine = os.path.join(ICI, 'assets')
    for dossier, _, fichiers in sorted(os.walk(racine)):
        for f in sorted(fichiers):
            chemin = os.path.join(dossier, f)
            t.append(('assets/' + os.path.relpath(chemin, racine).replace(os.sep, '/'), open(chemin, 'rb').read()))
    ordre = {'AndroidManifest.xml': 0, 'resources.arsc': 1, 'classes.dex': 2}
    t.sort(key=lambda e: (ordre.get(e[0], 3), e[0]))
    return [(nom, data, not nom.endswith(STOCKES)) for nom, data in t]


def ecrire_zip_aligne(chemin):
    with open(chemin, 'wb') as fp, zipfile.ZipFile(fp, 'w') as z:
        for nom, data, compresser in entrees():
            zi = zipfile.ZipInfo(nom, date_time=DATE)
            zi.create_system = 0
            zi.external_attr = 0
            if compresser:
                zi.compress_type = zipfile.ZIP_DEFLATED
            else:
                zi.compress_type = zipfile.ZIP_STORED
                debut = fp.tell() + 30 + len(nom.encode('utf-8')) + 6
                pad = (-debut) % 4
                zi.extra = struct.pack('<HHH', 0xD935, 2 + pad, 4) + b'\0' * pad
            z.writestr(zi, data, compress_type=zi.compress_type, compresslevel=9 if compresser else None)


def cle_et_certificat():
    dossier = os.path.join(ICI, 'cle')
    os.makedirs(dossier, exist_ok=True)
    fc, fk = os.path.join(dossier, 'certificat.pem'), os.path.join(dossier, 'cle.pem')
    if os.path.exists(fc) and os.path.exists(fk):
        cle = serialization.load_pem_private_key(open(fk, 'rb').read(), password=None)
        return cle, x509.load_pem_x509_certificate(open(fc, 'rb').read())
    cle = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    nom = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, 'A peu pres d accord'), x509.NameAttribute(NameOID.COUNTRY_NAME, 'FR')])
    maintenant = datetime.now(timezone.utc)
    cert = (x509.CertificateBuilder().subject_name(nom).issuer_name(nom).public_key(cle.public_key())
            .serial_number(x509.random_serial_number()).not_valid_before(maintenant - timedelta(days=1))
            .not_valid_after(maintenant + timedelta(days=365 * 30)).sign(cle, hashes.SHA256()))
    open(fk, 'wb').write(cle.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()))
    open(fc, 'wb').write(cert.public_bytes(serialization.Encoding.PEM))
    os.chmod(fk, 0o600)
    return cle, cert


def lp(b):
    return struct.pack('<I', len(b)) + b


def signer_v2(entree, sortie):
    data = open(entree, 'rb').read()
    eocd = data.rfind(b'PK\x05\x06')
    assert eocd >= 0 and len(data) - eocd == 22, 'EOCD introuvable ou commentaire inattendu'
    taille_cd, debut_cd = struct.unpack('<II', data[eocd + 12:eocd + 20])
    sections = (data[:debut_cd], data[debut_cd:debut_cd + taille_cd], data[eocd:])
    morceaux = []
    for sec in sections:
        for i in range(0, len(sec), 1 << 20):
            m = sec[i:i + (1 << 20)]
            morceaux.append(hashlib.sha256(b'\xa5' + struct.pack('<I', len(m)) + m).digest())
    resume = hashlib.sha256(b'\x5a' + struct.pack('<I', len(morceaux)) + b''.join(morceaux)).digest()
    ALGO = 0x0103   # RSASSA-PKCS1-v1_5 avec SHA2-256
    cle, cert = cle_et_certificat()
    donnees = (lp(lp(struct.pack('<I', ALGO) + lp(resume)))
               + lp(lp(cert.public_bytes(serialization.Encoding.DER)))
               + lp(b''))
    sig = cle.sign(donnees, padding.PKCS1v15(), hashes.SHA256())
    signataire = (lp(donnees) + lp(lp(struct.pack('<I', ALGO) + lp(sig)))
                  + lp(cle.public_key().public_bytes(serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo)))
    valeur = lp(lp(signataire))
    paire = struct.pack('<Q', 4 + len(valeur)) + struct.pack('<I', 0x7109871A) + valeur
    taille = len(paire) + 8 + 16
    bloc = struct.pack('<Q', taille) + paire + struct.pack('<Q', taille) + b'APK Sig Block 42'
    fin = sections[2][:16] + struct.pack('<I', debut_cd + len(bloc)) + sections[2][20:]
    open(sortie, 'wb').write(sections[0] + bloc + sections[1] + fin)


if __name__ == '__main__':
    os.makedirs(os.path.join(ICI, 'sortie'), exist_ok=True)
    brut = os.path.join(ICI, 'sortie', 'non-signe.apk')
    final = os.path.join(ICI, 'sortie', sys.argv[1] if len(sys.argv) > 1 else 'apeupresdaccord.apk')
    ecrire_zip_aligne(brut)
    signer_v2(brut, final)
    os.remove(brut)
    print(final, os.path.getsize(final), 'octets')
