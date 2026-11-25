import sys, time
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
largeur = int(sys.argv[1]) if len(sys.argv) > 1 else 1280
hauteur = int(sys.argv[2]) if len(sys.argv) > 2 else 860
suffixe = sys.argv[3] if len(sys.argv) > 3 else 'bureau'
reglages = sys.argv[4] if len(sys.argv) > 4 else ''
erreurs = []
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--allow-file-access-from-files'])
    ctx = nav.new_context(viewport={'width': largeur, 'height': hauteur}, device_scale_factor=2)
    pg = ctx.new_page()
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
    pg.on('console', lambda m: erreurs.append('console ' + m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: erreurs.append('pageerror: ' + str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    pg.goto('file:///home/claude/carte2/index.html#jouer')
    pg.wait_for_timeout(900)
    pg.screenshot(path=f'{OUT}/{suffixe}-0-reglages.png')
    o = {'v': 2}
    if 'classique' in reglages: o['plateau'] = 'classique'
    if 'primaire' in reglages: o['donne'] = 'primaire'
    if 'elysee' in reglages: o['niveau'] = 'elysee'
    if 'transparence' in reglages: o['transparence'] = True
    pg.evaluate("o => localStorage.setItem('hemicycle-options', JSON.stringify(o))", o)
    pg.reload(); pg.wait_for_timeout(700)
    pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); choisir_niveau(pg)
    pg.wait_for_timeout(600)
    if 'primaire' in reglages:
        for k in range(30):
            if pg.query_selector('#b-fin-primaire') and not pg.query_selector('#b-fin-primaire').is_disabled():
                break
            b = pg.query_selector('.vivier .choix-carte:not([disabled])')
            if b:
                b.click()
            pg.wait_for_timeout(900)
        pg.screenshot(path=f'{OUT}/{suffixe}-0b-primaire.png')
        pg.click('#b-fin-primaire')
        pg.wait_for_timeout(500)
    tours = 0
    t0 = time.time()
    capt = 0
    action_jouee = False
    while time.time() - t0 < 150:
        if pg.query_selector('#voile:not([hidden]) #b-revanche, #voile:not([hidden]) #b-second'):
            break
        texte = pg.inner_text('#perchoir-texte')
        if texte.startswith('À toi') or 'en main' in texte or texte.startswith('Édito'):
            # Une fois, on tente la carte action si elle est jouable sans cible
            if not action_jouee and pg.query_selector('#b-action') and tours >= 1:
                pg.click('#b-action'); pg.wait_for_timeout(300)
                if capt == 0:
                    pg.screenshot(path=f'{OUT}/{suffixe}-2-action.png'); capt = 1
                b = pg.query_selector('#b-jouer-action:not([disabled])')
                action_jouee = True
                if b:
                    b.click(); pg.wait_for_timeout(500)
                    # Cible éventuelle
                    if pg.query_selector('[data-cote]'):
                        pg.click('[data-cote="0"]'); pg.wait_for_timeout(300)
                    if pg.query_selector('#b-garder'):
                        pg.click('#b-garder'); pg.wait_for_timeout(300)
                    for _ in range(2):
                        c = pg.query_selector('.case.cible, #main-joueur .carte-main.cible, #main-ia .carte-main.cible')
                        if c:
                            c.click(); pg.wait_for_timeout(600)
                    pg.wait_for_timeout(1500)
                    continue
                else:
                    pg.click('[data-fermer]'); pg.wait_for_timeout(200)
            carte = pg.query_selector('#main-joueur .carte-main:not([disabled])')
            if carte:
                carte.click(); pg.wait_for_timeout(250)
                case = pg.query_selector('.case.libre.jouable')
                if case:
                    case.hover(); pg.wait_for_timeout(200)
                    if tours == 1:
                        pg.screenshot(path=f'{OUT}/{suffixe}-1-apercu.png')
                    case.click(); tours += 1
                    pg.wait_for_timeout(900)
                    if tours == 3:
                        pg.screenshot(path=f'{OUT}/{suffixe}-3-milieu.png')
                    continue
        pg.wait_for_timeout(400)
    pg.wait_for_timeout(1600)
    pg.screenshot(path=f'{OUT}/{suffixe}-4-fin.png')
    fin = pg.inner_text('#dialogue') if pg.query_selector('#voile:not([hidden])') else '(pas de panneau de fin)'
    print('Tours joués :', tours, '| durée', round(time.time() - t0, 1), 's')
    print('Fin :', fin.replace('\n', ' | ')[:200])
    print('Journal :', pg.inner_text('#journal').replace('\n', ' | ')[:900])
    # Détection de débordement horizontal
    print('Largeur doc :', pg.evaluate('document.documentElement.scrollWidth'), '/', largeur)
    print('Plateau :', pg.evaluate("document.querySelectorAll('#plateau .case').length"), 'cases,', pg.evaluate("document.querySelectorAll('#plateau .case.banc').length"), 'bancs,',
          pg.evaluate("document.querySelectorAll('#plateau .case .mc').length"), 'cartes posées | hauteur du tapis :', pg.evaluate("Math.round(document.querySelector('.tapis').getBoundingClientRect().bottom + scrollY)"))
    nav.close()
print('Erreurs :', erreurs or 'aucune')
