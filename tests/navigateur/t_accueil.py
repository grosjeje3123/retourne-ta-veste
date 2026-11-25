"""Accueil du jeu : tuiles, panneaux Solo / Mon deck / Réglages / En ligne, partie libre et Carrière, reprise, fin de partie."""
import sys
from playwright.sync_api import sync_playwright
def choisir_niveau(pg):
    """Solo : après le mode, l'adversaire. On garde le niveau mémorisé (la première manche de Carrière saute cette étape)."""
    pg.wait_for_timeout(250)
    b = pg.query_selector('#niveaux .b-niveau.actuel') or pg.query_selector('#niveaux .b-niveau')
    if b: b.click()

F = 'file:///home/claude/polices/node_modules/@fontsource'
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url({F}/{pkg}/files/{pkg}-latin-{w}-normal.woff2) format('woff2')}}\n"
              for fam, pkg, ws in [('Fraunces','fraunces',(600,900)),('Atkinson Hyperlegible','atkinson-hyperlegible',(400,700)),('JetBrains Mono','jetbrains-mono',(400,700))] for w in ws)
INIT = """window.__graine = %d;
Math.random = (function(){ var s = window.__graine; return function(){ s = (s * 16807) %% 2147483647; return (s - 1) / 2147483646; }; })();"""
URL = sys.argv[1] if len(sys.argv) > 1 else 'file:///home/claude/carte2/index.html'
def attendre_tour(pg):
    for _ in range(120):
        if pg.query_selector('#voile:not([hidden]) #b-revanche, #voile:not([hidden]) #b-second'): return False
        t = pg.inner_text('#perchoir-texte')
        if pg.query_selector('#main-joueur .carte-main:not([disabled])') and not t.startswith('L’IA'): return True
        pg.wait_for_timeout(250)
    return False
def jouer_partie(pg, max_coups=12):
    for _ in range(max_coups):
        if not attendre_tour(pg): break
        c = pg.query_selector('#main-joueur .carte-main:not([disabled])')
        if not c: break
        c.click(); pg.wait_for_timeout(120)
        case = pg.query_selector('.case.libre.jouable')
        if not case: break
        case.click(); pg.wait_for_timeout(900)
    for _ in range(40):
        if pg.query_selector('#voile:not([hidden]) #b-revanche, #voile:not([hidden]) #b-second'): return True
        pg.wait_for_timeout(250)
    return False
def visible(pg, sel): return pg.is_visible(sel)
err = []
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    ctx = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.add_init_script("""try{localStorage.setItem('hemicycle-carriere-ouverte','1');}catch(e){}""")   # la Carrière ouverte d'office : ces tests portent sur elle
    pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    pg.add_init_script(INIT % 7)
    pg.goto(URL + '#jouer'); pg.wait_for_timeout(800)
    print('1. accueil visible :', visible(pg, '#accueil'), '· arène cachée :', not visible(pg, '#main-joueur'), '· panneau ouvert :', visible(pg, '#voile'))
    print('   tuiles :', pg.eval_on_selector_all('.tuile:not([hidden])', 'e => e.map(x => x.querySelector("b").textContent)'),
          '· tuile multijoueur :', 'Multijoueur' in pg.inner_text('#t-ligne'), '· lien cartes :', visible(pg, '#lien-cartes'))
    pg.screenshot(path='/tmp/accueil-tel.png')
    pg.click('#t-solo'); pg.wait_for_timeout(400)
    print('2. Solo :', pg.inner_text('#titre-dialogue'), '· modes :', pg.eval_on_selector_all('#form-solo .mode', 'e => e.map(x => x.id)'))
    pg.screenshot(path='/tmp/solo-tel.png')
    pg.click('#b-libre'); choisir_niveau(pg); pg.wait_for_timeout(600)
    print('3. partie libre lancée · « ← Menu » :', visible(pg, '#b-accueil'), '· accueil caché :', not visible(pg, '#accueil'))
    jb = pg.eval_on_selector('#journal', 'e => { var r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), e.children.length]; }')
    print('   journal (largeur, hauteur, lignes) :', jb)
    fini = jouer_partie(pg)
    print('4. fin de partie :', fini, '· boutons :', pg.eval_on_selector_all('#dialogue .pied button', 'e => e.map(x => x.textContent)'),
          '· anecdote :', (pg.inner_text('.savais-texte')[:80] if pg.query_selector('.savais') else 'AUCUNE'))
    pg.screenshot(path='/tmp/fin-tel.png')
    pg.click('#b-menu-fin'); pg.wait_for_timeout(400)
    print('5. retour accueil :', visible(pg, '#accueil'), '· reprendre affiché :', visible(pg, '#t-reprendre'), '· bilan :', pg.inner_text('#accueil-bilan'))
    # Carrière, puis « ← Menu » en pleine partie
    pg.click('#t-solo'); pg.wait_for_timeout(300)   # première manche de Carrière : Mairie d'office, pas de niveau à choisir
    pg.click('#b-carriere'); choisir_niveau(pg); pg.wait_for_timeout(300)
    for _ in range(30):
        if pg.query_selector('#b-go-carriere'): break
        pg.wait_for_timeout(250)
    print('6. Carrière, choix de la main :', pg.inner_text('#titre-dialogue'), '· boutons :', pg.eval_on_selector_all('#dialogue .pied button', 'e => e.map(x => x.textContent)'))
    pg.click('#b-go-carriere'); pg.wait_for_timeout(500)
    attendre_tour(pg)
    c = pg.query_selector('#main-joueur .carte-main:not([disabled])'); c.click(); pg.wait_for_timeout(120)
    pg.query_selector('.case.libre.jouable').click(); pg.wait_for_timeout(2500)
    pg.click('#b-accueil'); pg.wait_for_timeout(400)
    print('7. menu en partie · reprendre :', visible(pg, '#t-reprendre'), '→', pg.inner_text('#t-reprendre').replace('\n', ' | '))
    pg.screenshot(path='/tmp/accueil-reprendre-tel.png')
    pg.click('#t-options'); pg.wait_for_timeout(300)
    print('8. Réglages :', pg.eval_on_selector_all('#form-options legend', 'e => e.map(x => x.textContent)'))
    pg.screenshot(path='/tmp/reglages-tel.png', full_page=False)
    pg.click('input[name="sons"] + span'); pg.click('#form-options button[type="submit"]'); pg.wait_for_timeout(300)
    print('   son coupé :', pg.get_attribute('#b-son', 'aria-pressed'), '· options :', pg.evaluate("JSON.parse(localStorage.getItem('hemicycle-options')).niveau"))
    pg.click('#t-deck'); pg.wait_for_timeout(300)
    print('9. Mon deck :', pg.inner_text('#titre-dialogue'), '·', pg.inner_text('#classeur-compte'))
    pg.click('#dialogue [data-fermer]'); pg.wait_for_timeout(200)
    pg.click('#t-ligne'); pg.wait_for_timeout(300)
    print('10. Multijoueur :', pg.inner_text('#titre-dialogue'))
    pg.click('#b-multi-ligne'); pg.wait_for_timeout(300)
    print('    puis En ligne :', pg.inner_text('#titre-dialogue'))
    pg.click('#dialogue [data-fermer]'); pg.wait_for_timeout(200)
    pg.click('#t-options'); pg.wait_for_timeout(300); pg.click('#b-voir-regles'); pg.wait_for_timeout(300)
    print('11. Comment jouer (depuis les réglages) :', pg.inner_text('#titre-dialogue')); pg.click('#dialogue [data-fermer]'); pg.wait_for_timeout(200)
    pg.click('#t-reprendre'); pg.wait_for_timeout(500)
    print('12. reprise :', visible(pg, '#main-joueur'), '· accueil caché :', not visible(pg, '#accueil'))
    fini = jouer_partie(pg)
    print('13. Carrière finie :', fini, '· anecdote :', bool(pg.query_selector('.savais')), '· titre :', pg.inner_text('#titre-dialogue'))
    pg.screenshot(path='/tmp/fin-carriere-tel.png')
    # Aller-retour vers la collection : la vue revient sur l'accueil
    if pg.query_selector('#vivier-prise [data-prise]:not([disabled])'):   # victoire : on prend d'abord sa carte, le menu attend
        pg.click('#vivier-prise [data-prise]:not([disabled])'); pg.wait_for_timeout(400)
    pg.click('#b-menu-fin'); pg.wait_for_timeout(300)
    pg.click('#lien-cartes'); pg.wait_for_timeout(400)
    pg.goto(URL + '#jouer'); pg.wait_for_timeout(500)
    print('14. retour depuis les cartes → accueil :', visible(pg, '#accueil'))
    ctx.close()
    ctx = nav.new_context(viewport={'width': 1280, 'height': 860})
    pg = ctx.new_page(); pg.on('pageerror', lambda e: err.append(str(e)))
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.add_init_script("""try{localStorage.setItem('hemicycle-carriere-ouverte','1');}catch(e){}""")   # la Carrière ouverte d'office : ces tests portent sur elle
    pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    pg.goto(URL + '#jouer'); pg.wait_for_timeout(700)
    pg.screenshot(path='/tmp/accueil-bureau.png')
    ctx.close(); nav.close()
print('erreurs :', err or 'aucune')

# Bouton « retour » : de la partie à l'accueil, puis on quitte le jeu
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    pg = nav.new_page(viewport={'width': 390, 'height': 844})
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.add_init_script("""try{localStorage.setItem('hemicycle-carriere-ouverte','1');}catch(e){}""")   # la Carrière ouverte d'office : ces tests portent sur elle
    pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    pg.goto(URL + '#cartes'); pg.wait_for_timeout(500)
    pg.goto(URL + '#jouer'); pg.wait_for_timeout(600)
    pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); choisir_niveau(pg); pg.wait_for_timeout(500)
    attendre_tour(pg)
    pg.go_back(); pg.wait_for_timeout(500)
    print('15. retour en partie → accueil :', visible(pg, '#accueil'), '· reprendre :', visible(pg, '#t-reprendre'), '· adresse :', pg.evaluate('location.hash'))
    pg.click('#t-reprendre'); pg.wait_for_timeout(400)
    pg.click('#b-accueil'); pg.wait_for_timeout(500)
    print('16. « ← Menu » → accueil :', visible(pg, '#accueil'), '· adresse :', pg.evaluate('location.hash'))
    pg.go_back(); pg.wait_for_timeout(500)
    print('17. retour depuis l’accueil → cartes :', pg.evaluate('location.hash'), '· vue cartes :', visible(pg, '#vue-cartes'))
    nav.close()
print('erreurs (fin) :', err or 'aucune')
