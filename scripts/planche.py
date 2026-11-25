import sys
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
F = 'file:///home/claude/polices/node_modules/@fontsource'
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url({F}/{pkg}/files/{pkg}-latin-{w}-normal.woff2) format('woff2')}}\n"
              for fam, pkg, ws in [('Fraunces','fraunces',(600,900)),('Atkinson Hyperlegible','atkinson-hyperlegible',(400,700)),('JetBrains Mono','jetbrains-mono',(400,700))] for w in ws)
page_html, dossier, sortie = sys.argv[1], sys.argv[2], sys.argv[3]
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--allow-file-access-from-files'])
    pg = nav.new_page(viewport={'width': 1200, 'height': 900}, device_scale_factor=2)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    pg.goto('file://' + page_html); pg.wait_for_timeout(1200)
    pg.query_selector('.carte-seule').screenshot(path=f'{dossier}/dos.png')
    nav.close()
cartes = [Image.open(f'{dossier}/carte{k}.png').convert('RGB') for k in range(19)]
dos = Image.open(f'{dossier}/dos.png').convert('RGB')
W, H = 396, 635; G = 28; M = 48; T = 70
def tuile(im): return im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
cols = 4
lignes = [cartes[i:i+4] for i in range(0, 16, 4)] + [cartes[16:19] + [dos]]
largeur = M*2 + cols*W + (cols-1)*G
hauteur = M + T + 4*(H+G) + T + H + M
fond = Image.new('RGB', (largeur, hauteur), (241, 238, 228))
d = ImageDraw.Draw(fond)
gras = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 30)
y = M
d.text((M, y), "Deck de lancement · 16 cartes candidat", font=gras, fill=(15, 95, 102)); y += T
for i, ligne in enumerate(lignes):
    if i == 4:
        d.text((M, y), "Cartes action · 3 cartes, et le dos commun", font=gras, fill=(90, 45, 140)); y += T
    for j, im in enumerate(ligne):
        t = tuile(im); fond.paste(t, (M + j*(W+G), y))
    y += H + G
fond.save(sortie, quality=88)
print(fond.size)
