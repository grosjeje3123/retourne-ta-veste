"""Vérifie la signature APK v2 (empreintes des sections + signature RSA) sans outil Android."""
import hashlib, struct, sys
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
d = open(sys.argv[1], 'rb').read()
e = d.rfind(b'PK\x05\x06'); cd_taille, cd_debut = struct.unpack('<II', d[e + 12:e + 20])
assert d[cd_debut - 16:cd_debut] == b'APK Sig Block 42'
taille = struct.unpack('<Q', d[cd_debut - 24:cd_debut - 16])[0]; bloc_debut = cd_debut - taille - 8
paires = d[bloc_debut + 8:cd_debut - 24]; i = 0; v2 = None
while i < len(paires):
    n = struct.unpack('<Q', paires[i:i + 8])[0]; ident = struct.unpack('<I', paires[i + 8:i + 12])[0]
    if ident == 0x7109871a: v2 = paires[i + 12:i + 8 + n]
    i += 8 + n
def lp(b, i): n = struct.unpack('<I', b[i:i + 4])[0]; return b[i + 4:i + 4 + n], i + 4 + n
signataires, _ = lp(v2, 0); signataire, _ = lp(signataires, 0)
donnees, j = lp(signataire, 0); signatures, j = lp(signataire, j); cle, j = lp(signataire, j)
empreintes, k = lp(donnees, 0); emp, _ = lp(empreintes, 0); algo = struct.unpack('<I', emp[:4])[0]; attendue, _ = lp(emp, 4)
sig, _ = lp(signatures, 0); algo_sig = struct.unpack('<I', sig[:4])[0]; valeur, _ = lp(sig, 4)
eocd = bytearray(d[e:]); eocd[16:20] = struct.pack('<I', bloc_debut)
morceaux = []
for section in (d[:bloc_debut], d[cd_debut:e], bytes(eocd)):
    for x in range(0, len(section), 1 << 20):
        c = section[x:x + (1 << 20)]; morceaux.append(hashlib.sha256(b'\xa5' + struct.pack('<I', len(c)) + c).digest())
calculee = hashlib.sha256(b'\x5a' + struct.pack('<I', len(morceaux)) + b''.join(morceaux)).digest()
print('algorithme', hex(algo), '· empreinte des sections :', 'OK' if calculee == attendue else 'FAUSSE')
pub = serialization.load_der_public_key(cle)
pad = padding.PKCS1v15() if algo_sig == 0x0103 else padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=32)
pub.verify(valeur, donnees, pad, hashes.SHA256()); print('signature RSA : OK')
