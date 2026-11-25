from playwright.sync_api import sync_playwright
F = 'file:///home/claude/polices/node_modules/@fontsource'
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url({F}/{pkg}/files/{pkg}-latin-{w}-normal.woff2) format('woff2')}}\n" for fam, pkg, ws in [('Fraunces','fraunces',(600,900)),('Atkinson Hyperlegible','atkinson-hyperlegible',(400,700)),('JetBrains Mono','jetbrains-mono',(400,700))] for w in ws)
U = 'file:///home/claude/carte2/index.html'
CL = "{v:1,cartes:['attal','autain','bardella','baroin','batho','breton','glucksmann','ruffin','retailleau','tondelier','philippe','roussel'],album:['attal','autain','bardella','baroin','batho','breton','glucksmann','ruffin','retailleau','tondelier','philippe','roussel','hollande','sarkozy','le-pen','melenchon','macron','zemmour','castex','borne'],main:[],gains:9,pertes:3,manches:12,actions:['borne','valls','praud','bayrou','plenel','macron','attali','montebourg','morano']}"
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--allow-file-access-from-files'])
    def page():
        ctx = nav.new_context(viewport={'width':360,'height':640}, device_scale_factor=3, is_mobile=True, has_touch=True)
        pg = ctx.new_page()
        pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
        pg.add_init_script("try{localStorage.setItem('hemicycle-venu','1');localStorage.setItem('hemicycle-fleches-vu','1');localStorage.setItem('hemicycle-carriere-ouverte','1');localStorage.setItem('hemicycle-classeur',JSON.stringify(%s));}catch(e){}" % CL)
        return pg
    # 1. accueil
    pg = page(); pg.goto(U + '#jouer'); pg.wait_for_timeout(1500); pg.screenshot(path='ecran-1-accueil.png'); pg.context.close()
    # 2. partie en cours
    pg = page(); pg.goto(U + '#jouer'); pg.wait_for_timeout(700)
    pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); pg.wait_for_timeout(300)
    b = pg.query_selector('#niveaux .b-niveau.actuel') or pg.query_selector('#niveaux .b-niveau'); b and b.click()
    coups = 0
    for _ in range(400):
        t = pg.inner_text('#perchoir-texte')
        if t.startswith('À toi'):
            if coups == 3: break
            c = pg.query_selector('#main-joueur .carte-main:not([disabled])')
            if c:
                c.click(); pg.wait_for_timeout(150); k = pg.query_selector('.case.libre.jouable')
                if k: k.click(); coups += 1; pg.wait_for_timeout(600); continue
        pg.wait_for_timeout(150)
    pg.wait_for_timeout(1500); pg.screenshot(path='ecran-2-partie.png'); pg.context.close()
    # 3. Carrière : mon deck et les cartes action
    pg = page(); pg.goto(U + '#jouer'); pg.wait_for_timeout(700); pg.click('#t-deck'); pg.wait_for_timeout(1500); pg.screenshot(path='ecran-3-deck.png')
    pg.evaluate("document.getElementById('actions-compte').scrollIntoView()"); pg.wait_for_timeout(1200); pg.screenshot(path='ecran-4-actions.png'); pg.context.close()
    # 5. album des cartes
    pg = page(); pg.goto(U + '#album'); pg.wait_for_timeout(2000); pg.evaluate("document.getElementById('album-barre').scrollIntoView()"); pg.wait_for_timeout(1500); pg.screenshot(path='ecran-5-album.png'); pg.context.close()
    nav.close()
