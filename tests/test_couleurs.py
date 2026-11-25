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
    def page(w, h, sombre=False):
        ctx = nav.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2, color_scheme='dark' if sombre else 'light')
        pg = ctx.new_page()
        pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
        pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
        pg.on('pageerror', lambda e: erreurs.append(str(e)))
        pg.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' else None)
        pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
        return pg
    pg = page(1200, 900)
    pg.goto('file:///home/claude/carte2/index.html#cartes')
    pg.wait_for_timeout(1200)
    infos = pg.evaluate("""() => Array.from(document.querySelectorAll('#table-candidats .recto.candidat')).map(r => {
      const i = r.querySelector('.infos'); const cs = getComputedStyle(r);
      return [r.querySelector('h3').textContent, r.dataset.bloc, cs.getPropertyValue('--bloc').trim(), i.scrollHeight > i.clientHeight + 1,
              !!r.querySelector('.axe'), r.querySelector('.axe i') ? r.querySelector('.axe i').getBoundingClientRect().left - r.querySelector('.axe').getBoundingClientRect().left : null]; })""")
    for n, b, c, deb, axe, x in infos:
        print(f'{n:22} {b:15} {c:8} débord={deb} jauge={axe} x={x if x is None else round(x)}')
    print('nb cartes candidat :', len(infos))
    pg.query_selector('#table-candidats').screenshot(path=f'{OUT}/couleurs-table.png')
    pg.query_selector('.nuancier').screenshot(path=f'{OUT}/nuancier.png')
    print('bouton flottant en haut :', pg.evaluate("document.getElementById('cta-flottant').classList.contains('visible')"))
    pg.evaluate("window.scrollTo(0, 2500)"); pg.wait_for_timeout(500)
    print('bouton flottant après défilement :', pg.evaluate("document.getElementById('cta-flottant').classList.contains('visible')"))
    pg.screenshot(path=f'{OUT}/cta-flottant.png')
    pg.click('#cta-flottant'); pg.wait_for_timeout(500)
    print('vue après clic :', pg.evaluate("location.hash"), pg.evaluate("document.getElementById('vue-jeu').hidden"))
    # Jeu, bureau
    pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(600)
    pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); choisir_niveau(pg); pg.wait_for_timeout(2500)
    for k in range(3):
        c = pg.query_selector('#main-joueur .carte-main:not([disabled])')
        if not c: break
        c.click(); pg.wait_for_timeout(200)
        cases = pg.query_selector_all('.case.libre.jouable')
        if not cases: break
        cases[[4, 0, 8][k] % len(cases)].click(); pg.wait_for_timeout(4500)
    pg.screenshot(path=f'{OUT}/couleurs-jeu.png')
    c = pg.query_selector('#main-joueur .carte-main:not([disabled])')
    if c:
        c.click(); pg.wait_for_timeout(200); pg.click('#b-details'); pg.wait_for_timeout(500)
        pg.screenshot(path=f'{OUT}/couleurs-fiche.png')
    # Jeu, mobile
    pm = page(390, 844)
    pm.goto('file:///home/claude/carte2/index.html#jouer'); pm.wait_for_timeout(600)
    pm.click('#t-solo'); pm.wait_for_timeout(250); pm.click('#b-libre'); choisir_niveau(pm); pm.wait_for_timeout(2500)
    c = pm.query_selector('#main-joueur .carte-main:not([disabled])')
    if c:
        c.click(); pm.wait_for_timeout(200); cases = pm.query_selector_all('.case.libre.jouable')
        if cases: cases[0].click(); pm.wait_for_timeout(4500)
    pm.screenshot(path=f'{OUT}/couleurs-mobile.png')
    print('largeur mobile :', pm.evaluate('document.documentElement.scrollWidth'))
    # Collection, thème sombre
    ps = page(1200, 900, sombre=True)
    ps.goto('file:///home/claude/carte2/index.html#cartes'); ps.wait_for_timeout(900)
    ps.query_selector('.nuancier').screenshot(path=f'{OUT}/nuancier-sombre.png')
    nav.close()
print('Erreurs :', erreurs or 'aucune')
