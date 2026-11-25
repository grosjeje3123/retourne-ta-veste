"""Fabrique le bundle Play Store (.aab) à partir de l'APK assemblé : aapt2 convert (format proto), rangement en module base/, BundleConfig, puis signature jarsigner avec la clé d'envoi (cle/envoi.p12)."""
import subprocess, sys, zipfile, os
AAPT2 = '/usr/local/lib/python3.13/site-packages/aapt2/bin/Linux/aapt2'
apk, sortie = sys.argv[1], sys.argv[2]
tmp = '/tmp/aab_fab'; os.makedirs(tmp, exist_ok=True)
with zipfile.ZipFile(apk) as z, zipfile.ZipFile(tmp + '/nu.apk', 'w', zipfile.ZIP_DEFLATED) as o:
    for i in z.infolist():
        if not i.filename.startswith('META-INF/'): o.writestr(i, z.read(i.filename))
subprocess.run([AAPT2, 'convert', '--output-format', 'proto', '-o', tmp + '/proto.apk', tmp + '/nu.apk'], check=True)
ver = b'1.15.6'; inner = b'\x12' + bytes([len(ver)]) + ver; cfg = b'\x0a' + bytes([len(inner)]) + inner
STOCKES = ('.png', '.webp', '.jpg', '.woff2')
with zipfile.ZipFile(tmp + '/proto.apk') as z, zipfile.ZipFile(sortie, 'w', zipfile.ZIP_DEFLATED) as o:
    o.writestr('BundleConfig.pb', cfg)
    for i in z.infolist():
        n = i.filename; d = z.read(n)
        if n == 'AndroidManifest.xml': c = 'base/manifest/AndroidManifest.xml'
        elif n == 'resources.pb': c = 'base/resources.pb'
        elif n.endswith('.dex'): c = 'base/dex/' + n
        elif n.startswith(('res/', 'assets/')): c = 'base/' + n
        else: continue
        o.writestr(zipfile.ZipInfo(c, date_time=(1981, 1, 1, 1, 1, 2)), d, zipfile.ZIP_STORED if n.endswith(STOCKES) else zipfile.ZIP_DEFLATED)
cle = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cle')
subprocess.run(['jarsigner', '-keystore', cle + '/envoi.p12', '-storetype', 'PKCS12', '-storepass', open(cle + '/envoi.mdp').read().strip(),
                '-sigalg', 'SHA256withRSA', '-digestalg', 'SHA-256', sortie, 'retournetaveste'], check=True, capture_output=True)
print(sortie, os.path.getsize(sortie), 'octets')
