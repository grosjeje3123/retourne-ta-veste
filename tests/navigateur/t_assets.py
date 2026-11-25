from playwright.sync_api import sync_playwright
bloques = []
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    ctx = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
    erreurs = []
    pg.on('pageerror', lambda e: erreurs.append(str(e)))
    pg.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' else None)
    def route(r):
        if r.request.url.startswith('file://'): r.continue_()
        else: bloques.append(r.request.url); r.abort()
    pg.route('**/*', route)
    pg.goto('file:///home/claude/apk/assets/index.html')
    pg.wait_for_timeout(1200)
    print('polices :', pg.evaluate("[...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight).join(', ')"))
    pg.screenshot(path='/tmp/fete/appli-1-cartes.png')
    pg.goto('file:///home/claude/apk/assets/index.html#jouer'); pg.wait_for_timeout(900)
    pg.click('#form-regles button[type="submit"]')
    for _ in range(60):
        if pg.inner_text('#perchoir-texte').startswith('À toi'): break
        pg.wait_for_timeout(150)
    pg.tap('#main-joueur .carte-main'); pg.wait_for_timeout(200)
    k = pg.query_selector('.case.libre.jouable')
    if k: k.tap()
    pg.wait_for_timeout(1500)
    pg.screenshot(path='/tmp/fete/appli-2-jeu.png')
    print('localStorage :', pg.evaluate("Object.keys(localStorage).join(', ')"))
    nav.close()
print('requêtes réseau bloquées :', bloques or 'aucune')
print('erreurs :', erreurs or 'aucune')
