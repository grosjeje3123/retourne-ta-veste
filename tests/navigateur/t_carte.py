import sys
from playwright.sync_api import sync_playwright
F = 'file:///home/claude/polices/node_modules/@fontsource'
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url({F}/{pkg}/files/{pkg}-latin-{w}-normal.woff2) format('woff2')}}\n"
              for fam, pkg, ws in [('Fraunces','fraunces',(600,900)),('Atkinson Hyperlegible','atkinson-hyperlegible',(400,700)),('JetBrains Mono','jetbrains-mono',(400,700))] for w in ws)
sortie = sys.argv[1]
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    pg = nav.new_page(viewport={'width': 1200, 'height': 900}, device_scale_factor=1.5)
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    pg.goto('file:///home/claude/carte2/index.html#cartes'); pg.wait_for_timeout(900)
    cartes = pg.query_selector_all('.retournable')
    print(len(cartes), 'cartes')
    # Trois cartes côte à côte : celles qui ont étiquette longue, tampon et bloc
    bb = [c.bounding_box() for c in cartes[:3]]
    x0 = min(b['x'] for b in bb); y0 = min(b['y'] for b in bb); x1 = max(b['x'] + b['width'] for b in bb); y1 = max(b['y'] + b['height'] for b in bb)
    pg.screenshot(path=sortie, full_page=True, clip={'x': x0 - 8, 'y': y0 - 8, 'width': x1 - x0 + 16, 'height': y1 - y0 + 16})
    nav.close()
