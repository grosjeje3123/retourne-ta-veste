"""Carrière : la prise (victoire) et la perte (défaite) bien visibles ; l'IA n'a que des cartes qu'on n'a pas."""
from playwright.sync_api import sync_playwright
def choisir_niveau(pg):
    """Solo : après le mode, l'adversaire. On garde le niveau mémorisé (la première manche de Carrière saute cette étape)."""
    pg.wait_for_timeout(250)
    b = pg.query_selector('#niveaux .b-niveau.actuel') or pg.query_selector('#niveaux .b-niveau')
    if b: b.click()

import importlib.util
spec = importlib.util.spec_from_file_location('acc', '/tmp/bonus/t_accueil_lib.py')
F = 'file:///home/claude/polices/node_modules/@fontsource'
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url({F}/{pkg}/files/{pkg}-latin-{w}-normal.woff2) format('woff2')}}\n"
              for fam, pkg, ws in [('Fraunces','fraunces',(600,900)),('Atkinson Hyperlegible','atkinson-hyperlegible',(400,700)),('JetBrains Mono','jetbrains-mono',(400,700))] for w in ws)
URL = 'file:///home/claude/carte2/index.html'
def attendre_tour(pg):
    for _ in range(120):
        if pg.query_selector('#voile:not([hidden]) #b-revanche, #voile:not([hidden]) #b-second'): return False
        t = pg.inner_text('#perchoir-texte')
        if pg.query_selector('#main-joueur .carte-main:not([disabled])') and not t.startswith('L’IA'): return True
        pg.wait_for_timeout(250)
    return False
def partie(pg, deck, niveau, graine):
    pg.add_init_script("window.__graine = %d; Math.random = (function(){ var s = window.__graine; return function(){ s = (s * 16807) %% 2147483647; return (s - 1) / 2147483646; }; })();" % graine)
    pg.goto(URL + '#jouer'); pg.wait_for_timeout(500)
    slugs = pg.evaluate("""d => { const C = window.APDA.CANDIDATS.map(c => ({ s: c.mini.match(/([^\\/]+)\\.webp$/)[1], f: c.valeurs.reduce((a, b) => a + b, 0) })).sort((a, b) => a.f - b.f);
      return (d === 'fort' ? C.slice(-8) : C.slice(0, 8)).map(x => x.s); }""", deck)
    pg.evaluate("([s, n]) => { localStorage.setItem('hemicycle-classeur', JSON.stringify({ v: 1, cartes: s, main: [], gains: 0, pertes: 0 })); localStorage.setItem('hemicycle-options', JSON.stringify({ v: 2, niveau: n })); }", [slugs, niveau])
    pg.reload(); pg.wait_for_timeout(600)
    pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-carriere'); choisir_niveau(pg)
    pg.wait_for_selector('#b-go-carriere', timeout=10000); pg.wait_for_timeout(200)
    pg.click('#b-plus-fortes'); pg.wait_for_timeout(150)
    pg.screenshot(path=f'/tmp/main-{deck}.png')
    pg.click('#b-go-carriere'); pg.wait_for_timeout(600)
    for _ in range(12):
        if not attendre_tour(pg): break
        c = pg.query_selector('#main-joueur .carte-main:not([disabled])'); c.click(); pg.wait_for_timeout(120)
        k = pg.query_selector('.case.libre.jouable')
        if not k: break
        k.click(); pg.wait_for_timeout(900)
    for _ in range(40):
        if pg.query_selector('#voile:not([hidden]) #b-revanche, #voile:not([hidden]) #b-second'): break
        pg.wait_for_timeout(250)
    return slugs
err = []
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    for deck, niveau, graine in (('fort', 'mairie', 5), ('fort', 'mairie', 9), ('faible', 'elysee', 3), ('faible', 'elysee', 8)):
        ctx = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        pg = ctx.new_page(); pg.on('pageerror', lambda e: err.append(str(e)))
        pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
        pg.add_init_script("""try{localStorage.setItem('hemicycle-carriere-ouverte','1');}catch(e){}""")   # la Carrière ouverte d'office : ces tests portent sur elle
        pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
        pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
        slugs = partie(pg, deck, niveau, graine)
        titre = pg.inner_text('#titre-dialogue')
        prise = pg.query_selector('#vivier-prise'); perte = pg.query_selector('.carte-perdue')
        print(f'{deck}/{niveau}/{graine} : {titre} · prise : {bool(prise)} · perte : {bool(perte)}')
        if prise:
            cartes = pg.eval_on_selector_all('#vivier-prise [data-prise]', 'e => e.map(x => x.className)')
            print('   cartes de l’IA :', len(cartes), '· déjà à moi :', sum('deja' in c for c in cartes))
            pg.query_selector('#vivier-prise').scroll_into_view_if_needed()
            pg.screenshot(path='/tmp/prise-avant.png')
            pg.click('#vivier-prise [data-prise]:not([disabled])'); pg.wait_for_timeout(400)
            pg.screenshot(path='/tmp/prise-apres.png')
            print('   ', pg.inner_text('#prise-msg'))
        if perte:
            pg.screenshot(path='/tmp/perte.png')
        ctx.close()
    nav.close()
print('erreurs :', err or 'aucune')
