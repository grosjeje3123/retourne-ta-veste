"""Fabrique l'APK de « Baston sur les toits » à partir de ../jeu/index.html.

    python3 baston/android/fabriquer.py 0.8        → baston/android/build/sortie/baston-sur-les-toits-0.8.apk

Réutilise les outils du dossier apk/ du dépôt (smali, ARSCLib, assembler.py). Il faut Java et le paquet Python
« cryptography ». La clé de signature est lue dans baston/android/cle/ (cle.pem et certificat.pem) : elle n'est
pas dans le dépôt. Sans elle, une nouvelle clé est créée et l'APK ne s'installera pas par-dessus une version
signée avec l'ancienne. Penser à augmenter versionCode et versionName dans projet/AndroidManifest.xml.
"""
import os, re, shutil, subprocess, sys

ICI = os.path.dirname(os.path.abspath(__file__))
APK = os.path.join(ICI, '..', '..', 'apk')
B = os.path.join(ICI, 'build')

POLICES = """<style>
@font-face{font-family:"Bowlby One";font-weight:400;font-display:swap;src:url(polices/bowlby-one-latin-400-normal.woff2) format("woff2")}
@font-face{font-family:"Archivo Narrow";font-weight:500;font-display:swap;src:url(polices/archivo-narrow-latin-500-normal.woff2) format("woff2")}
@font-face{font-family:"Archivo Narrow";font-weight:700;font-display:swap;src:url(polices/archivo-narrow-latin-700-normal.woff2) format("woff2")}
.planche,.planche-note,#planche-msg{display:none!important}
</style>
"""

def run(*cmd, cwd=B):
    subprocess.run(cmd, cwd=cwd, check=True)

version = sys.argv[1] if len(sys.argv) > 1 else 'test'
cle = os.path.join(B, 'cle')
garde = os.path.join(ICI, 'cle')
shutil.rmtree(B, ignore_errors=True)
os.makedirs(os.path.join(B, 'assets'))
for d in ('outils', 'outil-src'):
    shutil.copytree(os.path.join(APK, d), os.path.join(B, d))
shutil.copy(os.path.join(APK, 'assembler.py'), B)
shutil.copytree(os.path.join(ICI, 'projet'), os.path.join(B, 'projet'))
shutil.copytree(os.path.join(ICI, 'polices'), os.path.join(B, 'assets', 'polices'))
if os.path.isdir(garde):
    shutil.copytree(garde, cle)

# La page du jeu, avec les polices embarquées (pas de réseau dans l'appli) et sans l'import de planches
page = open(os.path.join(ICI, '..', 'jeu', 'index.html'), encoding='utf-8').read()
page, n = re.subn(r'<link rel="preconnect"[^>]*>\s*<link rel="preconnect"[^>]*>\s*<link href="https://fonts.googleapis.com[^>]*>', '', page)
assert n == 1, 'liens Google Fonts introuvables dans jeu/index.html'
open(os.path.join(B, 'assets', 'index.html'), 'w', encoding='utf-8').write(page.replace('</title>', '</title>\n' + POLICES, 1))

run('java', '-jar', 'outils/smali.jar', 'assemble', '--api', '24', '-o', 'classes.dex', os.path.join(ICI, 'smali'))
run('javac', '-cp', '../outils/ARSCLib.jar', 'Outil.java', cwd=os.path.join(B, 'outil-src'))
run('java', '-cp', 'outils/ARSCLib.jar:outil-src', 'Outil', 'build', 'projet', 'base.apk')
run(sys.executable, 'assembler.py', 'baston-sur-les-toits-%s.apk' % version)
if not os.path.isdir(garde):
    shutil.copytree(cle, garde)
    print('Nouvelle clé de signature créée dans baston/android/cle/ : à conserver précieusement.')
