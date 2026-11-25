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
erreurs = []
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--allow-file-access-from-files'])
    def page(w, h):
        ctx = nav.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2)
        pg = ctx.new_page()
        pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
        pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
        pg.on('pageerror', lambda e: erreurs.append(str(e)))
        pg.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' else None)
        pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
        return pg
    # 1. Collection, bureau : débordements et retournement
    pg = page(1200, 900)
    pg.goto('file:///home/claude/carte2/index.html#cartes')
    pg.wait_for_timeout(1200)
    infos = pg.evaluate("""() => Array.from(document.querySelectorAll('.retournable .recto')).map(r => {
      const i = r.querySelector('.infos'); return [r.querySelector('h3').textContent, i.scrollHeight, i.clientHeight]; })""")
    deb = [n for n, sh, ch in infos if sh > ch + 1]
    print('Cartes :', len(infos), '| débordements :', deb or 'aucun')
    pg.click('.emplacement:first-child .retourner')
    pg.wait_for_timeout(900)
    print('Retournement :', pg.evaluate("document.querySelector('.retournable').classList.contains('retournee')"))
    pg.query_selector('#table-candidats').screenshot(path=f'{OUT}/coll-candidats.png')
    pg.query_selector('#methode').screenshot(path=f'{OUT}/coll-methode.png')
    # 2. Lien vers le jeu depuis la collection
    pg.click('.cta')
    pg.wait_for_timeout(700)
    print('Vue jeu visible :', pg.is_visible('#vue-jeu'), '| collection cachée :', not pg.is_visible('#vue-cartes'))
    pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); choisir_niveau(pg)
    pg.wait_for_timeout(3300)  # tirage au sort compris
    for _ in range(40):  # l'IA peut commencer, voire jouer d'abord sa carte action : on attend notre tour
        if pg.inner_text('#perchoir-texte').startswith('À toi'): break
        pg.wait_for_timeout(250)
    for _ in range(2):
        c = pg.query_selector('#main-joueur .carte-main:not([disabled])')
        if c:
            c.click(); pg.wait_for_timeout(200)
            cs = pg.query_selector('.case.libre.jouable')
            if cs: cs.click()
            pg.wait_for_timeout(3500)
    # Retournement en jeu : on déclenche l'animation sur une carte posée et on photographie à mi-course
    ok = pg.evaluate("""() => { const r = document.querySelector('.case .rot'); if (!r) return false; r.classList.add('bascule'); return true; }""")
    if ok:
        pg.wait_for_timeout(330)
        pg.query_selector('#plateau').screenshot(path=f'{OUT}/jeu-retournement.png')
    print('Carte posée pour le test de retournement :', ok)
    pg.click('#b-accueil'); pg.wait_for_timeout(400); pg.click('#lien-cartes')
    pg.wait_for_timeout(500)
    print('Retour collection :', pg.is_visible('#vue-cartes'))
    # 3. Mobile : jeu en haut de page, et tableau de la méthode
    pm = page(390, 844)
    pm.goto('file:///home/claude/carte2/index.html#jouer')
    pm.wait_for_timeout(800)
    pm.click('#t-solo'); pm.wait_for_timeout(250); pm.click('#b-libre'); choisir_niveau(pm)
    pm.wait_for_timeout(4200)  # tirage au sort compris
    pm.evaluate('window.scrollTo(0,0)')
    pm.wait_for_timeout(200)
    pm.screenshot(path=f'{OUT}/mobile-haut.png')
    print('Mobile, hauteur du jeu :', pm.evaluate("document.querySelector('.tapis').getBoundingClientRect().bottom"), 'px')
    pm.goto('file:///home/claude/carte2/index.html#methode')
    pm.wait_for_timeout(900)
    pm.screenshot(path=f'{OUT}/mobile-methode.png')
    print('Largeur doc mobile :', pm.evaluate('document.documentElement.scrollWidth'))
    nav.close()
print('Erreurs :', erreurs or 'aucune')
