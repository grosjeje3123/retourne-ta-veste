from playwright.sync_api import sync_playwright
def choisir_niveau(pg):
    """Solo : après le mode, l'adversaire. On garde le niveau mémorisé (la première manche de Carrière saute cette étape)."""
    pg.wait_for_timeout(250)
    b = pg.query_selector('#niveaux .b-niveau.actuel') or pg.query_selector('#niveaux .b-niveau')
    if b: b.click()

F = 'file:///home/claude/polices/node_modules/@fontsource'
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url({F}/{pkg}/files/{pkg}-latin-{w}-normal.woff2) format('woff2')}}\n"
              for fam, pkg, ws in [('Fraunces','fraunces',(600,900)),('Atkinson Hyperlegible','atkinson-hyperlegible',(400,700)),('JetBrains Mono','jetbrains-mono',(400,700))] for w in ws)
OUT = '/home/claude/tests/captures'
err = []
def centre(el):
    b = el.bounding_box(); return b['x'] + b['width'] / 2, b['y'] + b['height'] / 2
def attendre_mon_tour(pg):
    for _ in range(60):
        t = pg.inner_text('#perchoir-texte')
        if t.startswith('À toi') and pg.query_selector('#main-joueur .carte-main:not([disabled])'): return True
        pg.wait_for_timeout(300)
    return False
def nb_poses(pg): return pg.evaluate("Array.from(document.querySelectorAll('#journal li')).filter(l => l.textContent.startsWith('Tu poses')).length")
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--allow-file-access-from-files'])
    # 1. Souris, bureau
    ctx = nav.new_context(viewport={'width': 1280, 'height': 860}, device_scale_factor=2)
    pg = ctx.new_page()
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
    pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(700)
    pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); choisir_niveau(pg); pg.wait_for_timeout(800)
    print('mon tour :', attendre_mon_tour(pg))
    carte = pg.query_selector('#main-joueur .carte-main:not([disabled])')
    libre = pg.query_selector_all('#plateau .case.libre')[0]
    x0, y0 = centre(carte); x1, y1 = centre(libre)
    # Lâcher hors du plateau : rien n'est posé, la carte reste choisie
    pg.mouse.move(x0, y0); pg.mouse.down(); pg.mouse.move(x0 - 60, y0 + 40, steps=6); pg.mouse.move(x0 - 120, y0 + 300, steps=6)
    print('fantôme pendant le glisser :', bool(pg.query_selector('.fantome')))
    pg.mouse.up(); pg.wait_for_timeout(300)
    print('lâcher hors plateau → poses :', nb_poses(pg), '| carte choisie :', bool(pg.query_selector('#main-joueur .carte-main.sel')), '| fantôme retiré :', not pg.query_selector('.fantome'))
    # Glisser sur un siège libre
    carte = pg.query_selector('#main-joueur .carte-main:not([disabled])'); x0, y0 = centre(carte)
    pg.mouse.move(x0, y0); pg.mouse.down(); pg.mouse.move((x0 + x1) / 2, (y0 + y1) / 2, steps=8); pg.mouse.move(x1, y1, steps=8)
    print('siège survolé :', bool(pg.query_selector('.case.survolee')), '| perchoir :', pg.inner_text('#perchoir-texte'))
    pg.screenshot(path=f'{OUT}/glisser-souris.png')
    pg.mouse.up(); pg.wait_for_timeout(1200)
    print('après le lâcher → poses :', nb_poses(pg), '| journal :', pg.inner_text('#journal').split('\n')[0])
    ctx.close()
    # 2. Doigt, mobile (événements tactiles bruts)
    ctx = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, has_touch=True, is_mobile=True)
    pg = ctx.new_page()
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
    pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(700)
    pg.tap('#t-solo'); pg.wait_for_timeout(250); pg.tap('#b-libre'); choisir_niveau(pg); pg.wait_for_timeout(800)
    print('mobile, mon tour :', attendre_mon_tour(pg))
    cdp = ctx.new_cdp_session(pg)
    carte = pg.query_selector('#main-joueur .carte-main:not([disabled])')
    libre = pg.query_selector_all('#plateau .case.libre')[-1]
    libre.scroll_into_view_if_needed(); pg.wait_for_timeout(200)
    x0, y0 = centre(carte); x1, y1 = centre(libre)
    def toucher(t, x, y): cdp.send('Input.dispatchTouchEvent', {'type': t, 'touchPoints': [] if t == 'touchEnd' else [{'x': x, 'y': y, 'id': 1}]})
    toucher('touchStart', x0, y0)
    for k in range(1, 13): toucher('touchMove', x0 + (x1 - x0) * k / 12, y0 + (y1 - y0) * k / 12); pg.wait_for_timeout(16)
    print('mobile, siège survolé :', bool(pg.query_selector('.case.survolee')))
    pg.screenshot(path=f'{OUT}/glisser-doigt.png')
    toucher('touchEnd', x1, y1); pg.wait_for_timeout(1200)
    print('mobile, après le lâcher → poses :', nb_poses(pg), '| défilement horizontal :', pg.evaluate('document.documentElement.scrollWidth'))
    # Le simple toucher (carte puis siège) marche toujours
    if attendre_mon_tour(pg):
        pg.tap('#main-joueur .carte-main:not([disabled])'); pg.wait_for_timeout(250)
        pg.tap('#plateau .case.libre.jouable'); pg.wait_for_timeout(1200)
        print('mobile, toucher carte puis siège → poses :', nb_poses(pg))
    pg.screenshot(path=f'{OUT}/mobile-grand.png')
    ctx.close(); nav.close()
print('erreurs :', err or 'aucune')
