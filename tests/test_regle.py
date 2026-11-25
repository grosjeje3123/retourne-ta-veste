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
    pg = page(1200, 900)
    pg.goto('file:///home/claude/carte2/index.html#cartes')
    pg.wait_for_timeout(1000)
    pg.query_selector('#regle').screenshot(path=f'{OUT}/regle-bureau.png')
    infos = pg.evaluate("""() => Array.from(document.querySelectorAll('.retournable .recto')).map(r => {
      const i = r.querySelector('.infos'); return [r.querySelector('h3').textContent, i.scrollHeight, i.clientHeight]; })""")
    print('débordements :', [n for n, a, b in infos if a > b + 1] or 'aucun')
    pg.click('#regle a[href="#methode"]'); pg.wait_for_timeout(500)
    print('défilement vers les données :', pg.evaluate("Math.round(document.getElementById('methode').getBoundingClientRect().top)"))
    pg.query_selector('#methode').screenshot(path=f'{OUT}/donnees-bureau.png')
    # Jeu : fiche d'une carte et panneau de calcul
    pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(600)
    pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); choisir_niveau(pg); pg.wait_for_timeout(2500)
    pg.click('#b-calcul'); pg.wait_for_timeout(300)
    pg.query_selector('#dialogue').screenshot(path=f'{OUT}/calcul-jeu.png')
    pg.click('[data-fermer]'); pg.wait_for_timeout(200)
    c = pg.query_selector('#main-joueur .carte-main:not([disabled])')
    if c:
        c.click(); pg.wait_for_timeout(200); pg.click('#b-details'); pg.wait_for_timeout(500)
        pg.evaluate("document.getElementById('dialogue').scrollTop = 99999"); pg.wait_for_timeout(200)
        pg.screenshot(path=f'{OUT}/fiche-calcul.png')
        print(pg.inner_text('.calcul-carte'))
    pm = page(390, 844)
    pm.goto('file:///home/claude/carte2/index.html#regle'); pm.wait_for_timeout(900)
    pm.screenshot(path=f'{OUT}/regle-mobile.png')
    print('largeur mobile :', pm.evaluate('document.documentElement.scrollWidth'))
    nav.close()
print('Erreurs :', erreurs or 'aucune')
