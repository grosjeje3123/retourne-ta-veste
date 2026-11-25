"""Copie le site (carte2) dans un dossier autonome, avec les polices embarquées au lieu de Google Fonts.
Usage : preparer_site.py <dossier de sortie>   (sert pour le serveur en ligne comme pour l'appli Android)"""
import os, re, shutil, sys
SRC, POL = '/home/claude/carte2', '/home/claude/polices/node_modules/@fontsource'
OUT = sys.argv[1]
JS = ['cartes.js', 'donnees.js', 'moteur.js', 'sons.js', 'tetes.js', 'profil.js', 'trophees.js', 'jeu.js']
POLICES = [('Fraunces', 'fraunces', (600, 900)), ('Atkinson Hyperlegible', 'atkinson-hyperlegible', (400, 700)), ('JetBrains Mono', 'jetbrains-mono', (400, 700))]
shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(OUT + '/img/mini'); os.makedirs(OUT + '/polices')
for f in JS: shutil.copy(f'{SRC}/{f}', OUT)
# Seuls les portraits des cartes du jeu partent (pas les essais restés dans le dossier)
SLUGS = sorted(set(re.findall(r"img/([a-z0-9\-]+)-couleur\.webp", open(SRC + '/donnees.js', encoding='utf-8').read())))
for s in SLUGS:
    shutil.copy(f'{SRC}/img/{s}-couleur.webp', OUT + '/img')
    shutil.copy(f'{SRC}/img/mini/{s}.webp', OUT + '/img/mini')
# Décors illustrés des lieux
shutil.copytree(SRC + '/img/decors', OUT + '/img/decors')
shutil.copy(SRC + '/img/logo-titre.webp', OUT + '/img')   # logo de l'accueil
for f in ('favicon-32.png', 'icone-180.png'): shutil.copy(SRC + '/img/' + f, OUT + '/img')   # icônes du site
shutil.copytree(SRC + '/img/pluie', OUT + '/img/pluie')   # objets des animations de cartes action
for fam, pkg, ws in POLICES:
    for w in ws: shutil.copy(f'{POL}/{pkg}/files/{pkg}-latin-{w}-normal.woff2', OUT + '/polices')
html = open(SRC + '/index.html', encoding='utf-8').read()
css = '<style>/* Polices embarquées : aucune requête vers un service tiers */\n' + ''.join(
    f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};font-display:swap;src:url(polices/{pkg}-latin-{w}-normal.woff2) format('woff2')}}\n"
    for fam, pkg, ws in POLICES for w in ws) + '</style>'
html = html.replace('<link rel="preconnect" href="https://fonts.googleapis.com">\n', '')
html, n = re.subn(r'<link href="https://fonts\.googleapis\.com/css2[^>]*>', lambda m: css, html)
assert n == 1 and 'fonts.googleapis' not in html
# Icône d'onglet : le « ≈ » des dos de cartes (celle de l'appli Android)
shutil.copy('/home/claude/apk/projet/resources/package_1/res/mipmap-xhdpi/ic_launcher.png', OUT + '/icone.png')
html = html.replace('<title>', '<link rel="icon" type="image/png" href="icone.png">\n<title>', 1)
open(OUT + '/index.html', 'w', encoding='utf-8').write(html)
print(OUT, sum(len(f) for _, _, f in os.walk(OUT)), 'fichiers')
