from playwright.sync_api import sync_playwright
F = 'file:///home/claude/polices/node_modules/@fontsource'
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url({F}/{pkg}/files/{pkg}-latin-{w}-normal.woff2) format('woff2')}}\n"
              for fam, pkg, ws in [('Fraunces','fraunces',(600,900)),('Atkinson Hyperlegible','atkinson-hyperlegible',(400,700)),('JetBrains Mono','jetbrains-mono',(400,700))] for w in ws)
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    pg = nav.new_page(viewport={'width': 1280, 'height': 860})
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    pg.goto('file:///home/claude/carte2/index.html#cartes'); pg.evaluate("localStorage.clear()")
    pg.goto('about:blank'); pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(700)
    pg.click('#form-regles button[type="submit"]')
    for _ in range(80):
        if pg.inner_text('#perchoir-texte').startswith('À toi'): break
        pg.wait_for_timeout(150)
    pg.click('#main-joueur .carte-main'); pg.wait_for_timeout(150)
    pg.click('#b-details'); pg.wait_for_timeout(400)
    pg.screenshot(path='/tmp/fete/details.png')
    nav.close()
