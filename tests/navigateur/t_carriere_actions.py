"""Carrière : collection de cartes action. 5 au départ, jamais perdues, la carte de l'IA gagnée en la battant ;
en partie, ta carte action est tirée au hasard parmi celles de ta collection."""
import time, json, re
from playwright.sync_api import sync_playwright
ok, ko = 0, 0
def verifier(nom, cond, detail=''):
    global ok, ko
    if cond: ok += 1
    else: ko += 1; print('   KO ', nom, detail)
MES = ['borne', 'valls', 'praud', 'bayrou', 'plenel']
CL = {'v': 1, 'cartes': ['attal', 'autain', 'bardella', 'baroin', 'batho', 'breton', 'berge', 'bertrand'], 'main': [], 'gains': 1, 'pertes': 0, 'manches': 1, 'actions': MES}
err = []
def lancer(pg):
    pg.evaluate("localStorage.removeItem('hemicycle-partie-en-cours')")
    pg.goto('about:blank'); pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(500)
    pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-carriere'); pg.wait_for_timeout(250)
    b = pg.query_selector('#niveaux .b-niveau.actuel') or pg.query_selector('#niveaux .b-niveau')
    if b: b.click()
    pg.wait_for_selector('#b-go-carriere', timeout=8000); pg.wait_for_timeout(150)
    txt = pg.inner_text('#dialogue')
    pg.click('#b-go-carriere'); pg.wait_for_timeout(600)
    src = pg.get_attribute('#action-joueur img', 'src') or ''
    m = re.search(r'([^/]+)\.webp$', src)
    return (m.group(1) if m else None), txt
def classeur(pg): return pg.evaluate("JSON.parse(localStorage.getItem('hemicycle-classeur') || 'null')")
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    ctx = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.add_init_script("try{localStorage.setItem('hemicycle-venu','1');localStorage.setItem('hemicycle-carriere-ouverte','1');localStorage.setItem('hemicycle-fleches-vu','1');}catch(e){}")
    pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(400)
    # 1. Nouveau départ : 5 cartes action
    pg.evaluate("localStorage.removeItem('hemicycle-classeur'); localStorage.setItem('hemicycle-options', JSON.stringify({v: 2, niveau: 'mairie', actions: true}))")
    a, txt = lancer(pg)
    cl = classeur(pg)
    verifier('départ : 5 cartes action', len(cl.get('actions', [])) == 5, cl.get('actions'))
    verifier('ta carte action vient de ta collection', a in cl['actions'], a)
    verifier('« Ta main » annonce le tirage parmi tes cartes action', 'tirée au hasard parmi tes 5 cartes action' in txt, txt[:300])
    # 2. Carrière commencée avant les cartes action : on en reçoit 5, sans toucher au deck
    vieux = dict(CL); del vieux['actions']
    pg.evaluate("c => localStorage.setItem('hemicycle-classeur', JSON.stringify(c))", vieux)
    a, _ = lancer(pg); cl = classeur(pg)
    verifier('ancienne Carrière : 5 cartes action ajoutées, deck intact', len(cl['actions']) == 5 and len(cl['cartes']) == 8, (cl['actions'], cl['cartes']))
    # 3. Tirage : toujours dans la collection, et pas toujours la même
    pg.evaluate("c => localStorage.setItem('hemicycle-classeur', JSON.stringify(c))", CL)
    vus = []
    for _ in range(14):
        a, _ = lancer(pg); vus.append(a)
    verifier('14 parties : toujours une carte de la collection', all(x in MES for x in vus), vus)
    verifier('14 parties : le tirage varie', len(set(vus)) >= 3, vus)
    # 4. Jouer jusqu'à une victoire : la carte de l'IA rejoint la collection si elle est neuve ; une défaite n'en retire aucune
    gagne = perdu = False
    for essai in range(14):
        avant = classeur(pg)['actions'][:]
        lancer(pg)
        t0 = time.time(); fin = None
        while time.time() - t0 < 150:
            t = pg.inner_text('#perchoir-texte')
            if t in ('Partie gagnée.', 'Partie perdue.', 'Égalité.'): fin = t; break
            if t.startswith('À toi'):
                c = pg.query_selector('#main-joueur .carte-main:not([disabled])')
                if c:
                    c.click(); pg.wait_for_timeout(100)
                    k = pg.query_selector('.case.libre.jouable')
                    if k: k.click(); pg.wait_for_timeout(450); continue
            pg.wait_for_timeout(150)
        pg.wait_for_selector('#voile:not([hidden]) #dialogue .pied', timeout=10000); pg.wait_for_timeout(300)
        d = pg.inner_text('#dialogue'); apres = classeur(pg)['actions']
        if fin == 'Partie gagnée.':
            neuve = 'Nouvelle carte action' in d
            verifier('victoire : collection +1 si annonce, sinon inchangée', (len(apres) == len(avant) + 1) if neuve else (apres == avant), (avant, apres))
            verifier('victoire : les cartes déjà là restent', all(x in apres for x in avant))
            if neuve:
                gagne = True
                verifier('annonce : « ne se perd jamais » et le compte', 'ne se perd jamais' in d and (str(len(apres)) + ' sur 24') in d, d[:400])
                pg.screenshot(path='/tmp/dim/gain-action.png')
        elif fin == 'Partie perdue.':
            perdu = True
            verifier('défaite : aucune carte action perdue', apres == avant, (avant, apres))
        if gagne and perdu: break
    print('victoire avec gain vue :', gagne, '| défaite vue :', perdu)
    verifier('au moins une victoire avec une carte action gagnée', gagne)
    # 5. Mon deck : la collection de cartes action
    pg.evaluate("localStorage.removeItem('hemicycle-partie-en-cours')")
    pg.goto('about:blank'); pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(500)
    pg.click('#t-deck'); pg.wait_for_selector('.classeur-actions', timeout=5000)
    n = len(classeur(pg)['actions'])
    tot = pg.evaluate("document.querySelectorAll('.classeur-actions .case-classeur').length")
    absentes = pg.evaluate("document.querySelectorAll('.classeur-actions .case-classeur.absente').length")
    verifier('Mon deck : 24 cartes action, les manquantes grisées', tot == 24 and absentes == 24 - n, (tot, absentes, n))
    verifier('Mon deck : le compte', ('Mes cartes action : ' + str(n) + ' sur 24').replace(' :', ' :') in pg.inner_text('#actions-compte') or ('Mes cartes action : ' + str(n) + ' sur 24') in pg.inner_text('#actions-compte'), pg.inner_text('#actions-compte'))
    pg.screenshot(path='/tmp/dim/deck-actions.png', full_page=True)
    # 6. L'album de la page Cartes
    pg.goto('file:///home/claude/carte2/index.html#album'); pg.wait_for_timeout(900)
    na = pg.evaluate("document.querySelectorAll('#album-grille .album-case.action').length")
    nm = pg.evaluate("document.querySelectorAll('#album-grille .album-case.action.manque').length")
    gm = pg.evaluate("document.querySelectorAll('#table-actions .emplacement.manque').length")
    verifier('album : 24 cartes action, manquantes grisées (grille et fiches)', na == 24 and nm == 24 - n and gm == 24 - n, (na, nm, gm, n))
    verifier('aucune erreur JavaScript', not err, err[:3])
    nav.close()
print(f't_carriere_actions : {ok} OK, {ko} KO')
