"""Carrière verrouillée : s'ouvre seule après le tutoriel et 3 parties libres ; reste ouverte ; déjà ouverte pour qui a un deck."""
from playwright.sync_api import sync_playwright
def choisir_niveau(pg):
    """Solo : après le mode, l'adversaire. On garde le niveau mémorisé (la première manche de Carrière saute cette étape)."""
    pg.wait_for_timeout(250)
    b = pg.query_selector('#niveaux .b-niveau.actuel') or pg.query_selector('#niveaux .b-niveau')
    if b: b.click()

F = 'file:///home/claude/polices/node_modules/@fontsource'
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url({F}/{pkg}/files/{pkg}-latin-{w}-normal.woff2) format('woff2')}}\n"
              for fam, pkg, ws in [('Fraunces','fraunces',(600,900)),('Atkinson Hyperlegible','atkinson-hyperlegible',(400,700)),('JetBrains Mono','jetbrains-mono',(400,700))] for w in ws)
ko, err = [], []
def verifier(nom, c):
    print(('   ok  ' if c else '   KO  ') + nom)
    if not c: ko.append(nom)
def page(nav, init):
    pg = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True).new_page()
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    pg.add_init_script("if (!sessionStorage.getItem('init')) { sessionStorage.setItem('init', '1'); " + init + " }")
    pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(500)
    return pg
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    pg = page(nav, "localStorage.setItem('hemicycle-tuto-fleches', JSON.stringify({fait: 1})); localStorage.setItem('hemicycle-libres', '2'); localStorage.setItem('hemicycle-fleches-vu', '1');")
    pg.click('#t-solo'); pg.wait_for_timeout(300)
    verifier('tutoriel fait, 2 parties libres : encore verrouillée (« fait », « 2 sur 3 »)', 'fait' in pg.inner_text('#b-carriere') and '2 sur 3' in pg.inner_text('#b-carriere') and not pg.query_selector('button#b-carriere'))
    pg.screenshot(path='/tmp/tuto/verrou.png')
    pg.click('#b-libre'); choisir_niveau(pg); pg.wait_for_timeout(6000)
    for _ in range(600):
        if pg.is_visible('#voile #b-revanche'): break
        if pg.query_selector('#main-joueur .carte-main:not([disabled])') and pg.inner_text('#perchoir-texte').startswith('À toi'):
            pg.click('#main-joueur .carte-main:not([disabled])'); pg.click('#plateau .case.libre.jouable'); pg.wait_for_timeout(400)
        pg.wait_for_timeout(150)
    verifier('troisième partie libre finie', pg.is_visible('#voile #b-revanche'))
    pg.click('#b-menu-fin'); pg.wait_for_timeout(400); pg.click('#t-solo'); pg.wait_for_timeout(300)
    verifier('la Carrière s’ouvre toute seule', bool(pg.query_selector('button#b-carriere')))
    pg.evaluate("localStorage.removeItem('hemicycle-tuto-fleches'); localStorage.setItem('hemicycle-libres', '0')")
    pg.reload(); pg.wait_for_timeout(500); pg.click('#t-solo'); pg.wait_for_timeout(300)
    verifier('une fois ouverte, elle le reste', bool(pg.query_selector('button#b-carriere')))
    pg.context.close()
    pg = page(nav, "localStorage.setItem('hemicycle-classeur', JSON.stringify({v: 1, cartes: ['macron', 'le-pen', 'melenchon', 'bardella', 'attal'], main: [], gains: 2, pertes: 1}));")
    pg.click('#t-solo'); pg.wait_for_timeout(300)
    verifier('joueur qui a déjà un deck : Carrière ouverte', bool(pg.query_selector('button#b-carriere')))
    pg.context.close()
print('erreurs :', err or 'aucune', '·', 'ÉCHECS : ' + str(ko) if ko else 'tout passe')
