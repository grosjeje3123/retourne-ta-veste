"""Règles Flèches (par défaut) : première partie, parties libres complètes, Carrière, retour aux règles classiques par les réglages."""
import sys, json
from playwright.sync_api import sync_playwright
def choisir_niveau(pg):
    """Solo : après le mode, l'adversaire. On garde le niveau mémorisé (la première manche de Carrière saute cette étape)."""
    pg.wait_for_timeout(250)
    b = pg.query_selector('#niveaux .b-niveau.actuel') or pg.query_selector('#niveaux .b-niveau')
    if b: b.click()

W, H = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv) > 2 else (390, 844)
err, ko = [], []
def verifier(nom, cond):
    print(('   ok  ' if cond else '   KO  ') + nom)
    if not cond: ko.append(nom)
def fini(pg): return pg.is_visible('#voile #b-revanche') or pg.is_visible('#voile #b-menu-fin')
def jouer(pg):
    """Joue jusqu'au panneau de fin ; renvoie (poses du joueur, duels vus, scores cohérents)."""
    coups, duels, coherent = 0, 0, True
    for _ in range(700):
        if fini(pg): break
        if pg.query_selector('.fete') and pg.is_visible('.fete'): pg.mouse.click(5, 5); pg.wait_for_timeout(300); continue
        if pg.query_selector('.duel-des'): duels += 1; pg.wait_for_timeout(1500); continue
        if pg.query_selector('#main-joueur .carte-main:not([disabled])') and pg.inner_text('#perchoir-texte').startswith('À toi'):
            etat = pg.evaluate("""() => { const j = document.querySelectorAll('#plateau .mc.j:not(.verso)').length + document.querySelectorAll('#main-joueur .carte-main').length,
                i = document.querySelectorAll('#plateau .mc.ia:not(.verso)').length + document.querySelectorAll('#main-ia .carte-main').length;
                return [j, i, +document.getElementById('score-j').textContent, +document.getElementById('score-ia').textContent]; }""")
            if etat[0] != etat[2] or etat[1] != etat[3] or etat[0] + etat[1] != 10: coherent = False; print('      score incohérent', etat)
            pg.click('#main-joueur .carte-main:not([disabled])'); pg.wait_for_timeout(100)
            libres = pg.query_selector_all('#plateau .case.libre.jouable')
            libres[(coups * 5) % len(libres)].click(); coups += 1
            pg.wait_for_timeout(500); continue
        pg.wait_for_timeout(150)
    return coups, duels, coherent
def attendre_main(pg):
    for _ in range(80):
        if pg.query_selector('#main-joueur .carte-main'): return
        pg.wait_for_timeout(200)
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    ctx = nav.new_context(viewport={'width': W, 'height': H}, device_scale_factor=1, is_mobile=W < 700, has_touch=W < 700)
    pg = ctx.new_page()
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
    pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(o.actions==null){o.actions=false;localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # le déroulé de base, sans carte action (t_actions_fleches.py les teste)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(700)
    print('1. Première partie')
    verifier('accueil : tutoriel proposé', pg.is_visible('#t-tuto'))
    verifier('pied de l’accueil : seulement le calcul des points et les crédits', pg.inner_text('.accueil-liens').replace('\n', ' ').split() == ['Le', 'calcul', 'des', 'points', '·', 'Crédits'])
    pg.click('#t-options'); pg.wait_for_timeout(300); pg.click('#b-voir-regles'); pg.wait_for_timeout(300)
    verifier('« Comment jouer » : les règles des Flèches', 'duel' in pg.inner_text('#dialogue').lower() and 'indéboulonnable' in pg.inner_text('#dialogue'))
    pg.click('#voile [data-fermer]'); pg.wait_for_timeout(200)
    pg.click('#t-solo'); pg.wait_for_timeout(300)
    verifier('Solo : Carrière, Partie libre, Tutoriel', pg.is_visible('#b-carriere') and pg.is_visible('#b-libre') and pg.is_visible('#b-tuto'))
    pg.click('#b-libre'); choisir_niveau(pg); pg.wait_for_timeout(300)
    verifier('première partie : les règles d’abord', pg.is_visible('#b-go-fleches') and 'Attaque' in pg.inner_text('#dialogue'))
    pg.click('#b-go-fleches'); pg.wait_for_timeout(6200)
    verifier('grand plateau de 16 sièges', pg.eval_on_selector_all('#plateau .case', 'e => e.length') == 16)
    nb_bancs = pg.eval_on_selector_all('#plateau .case.banc', 'e => e.length')
    verifier('3 à 5 places bloquées (' + str(nb_bancs) + ')', 3 <= nb_bancs <= 5)
    verifier('pas de carte action (réglage décoché)', pg.inner_text('#action-joueur').strip() == '' and pg.inner_text('#action-ia').strip() == '')
    attendre_main(pg)
    verifier('main : flèches et bandeau Attaque/Défense, plus de chiffres de côté', pg.eval_on_selector_all('#main-joueur .mv b.fl', 'e => e.length') >= 5 and pg.eval_on_selector_all('#main-joueur .mv b:not(.fl)', 'e => e.length') == 0 and pg.eval_on_selector_all('#main-joueur .mn-fl .st', 'e => e.length') == 10)
    deb = pg.evaluate("""() => { let pb = 0; document.querySelectorAll('#main-joueur .mc').forEach(mc => { const r = mc.getBoundingClientRect(); mc.querySelectorAll('.mv b.fl, .mn-fl .st').forEach(b => { const q = b.getBoundingClientRect(); if (q.left < r.left - 1 || q.right > r.right + 1 || q.top < r.top - 1 || q.bottom > r.bottom + 1) pb++; }); }); return pb; }""")
    verifier('flèches et chiffres dans le cadre des cartes', deb == 0)
    print('2. Trois parties libres')
    total_duels = 0
    for n in range(3):
        coups, duels, coherent = jouer(pg); total_duels += duels
        sj, si = pg.inner_text('#score-j'), pg.inner_text('#score-ia')
        mj, mi = pg.eval_on_selector_all('#main-joueur .carte-main', 'e => e.length'), pg.eval_on_selector_all('#main-ia .carte-main', 'e => e.length')
        verifier('partie %d finie : %d poses, score %s-%s, cohérent, une carte gardée (%d/%d)' % (n + 1, coups, sj, si, mj, mi), fini(pg) and coups in (4, 5) and coherent and int(sj) + int(si) == 10 and mj + mi == 1 and (mj == 1) == (coups == 4))
        verifier('plateau final : 9 cartes, une indéboulonnable', pg.eval_on_selector_all('#plateau .case .rot', 'e => e.length') == 9 and pg.eval_on_selector_all('#plateau .mc:not(.verso) .badge', 'e => e.length') == 1)
        if n < 2:
            pg.click('#b-revanche'); pg.wait_for_timeout(6200)
            verifier('revanche : mêmes règles', pg.eval_on_selector_all('#plateau .case', 'e => e.length') == 16)
    print('   duels vus sur trois parties :', total_duels)
    b = json.loads(pg.evaluate("localStorage.getItem('hemicycle-bilan')") or '{}')
    verifier('le bilan compte les trois parties', b.get('v', 0) + b.get('d', 0) + b.get('n', 0) == 3)
    print('3. Carrière')
    pg.click('#b-menu-fin'); pg.wait_for_timeout(500)
    pg.click('#t-solo'); pg.wait_for_timeout(300)
    txt = pg.inner_text('#b-carriere')
    verifier('Carrière verrouillée : tutoriel à faire, 3 parties libres sur 3', 'verrouillée' in txt.lower() and 'à faire' in txt and '3 sur 3' in txt)
    pg.click('#b-carriere'); choisir_niveau(pg); pg.wait_for_timeout(300)
    verifier('un clic sur la Carrière verrouillée ne lance rien', pg.is_visible('#b-ouvrir-carriere'))
    pg.click('#b-ouvrir-carriere'); pg.wait_for_timeout(300)
    verifier('« Je connais déjà les règles » ouvre la Carrière', pg.is_visible('button#b-carriere'))
    pg.click('#b-carriere'); choisir_niveau(pg)
    pg.wait_for_selector('#b-go-carriere', timeout=15000); pg.wait_for_timeout(300)
    verifier('choix de la main : cartes en habit Flèches', pg.eval_on_selector_all('#dialogue .vivier .mv b.fl', 'e => e.length') >= 8 and pg.eval_on_selector_all('#dialogue .vivier .mn-fl', 'e => e.length') == 8)
    pg.click('#b-go-carriere'); pg.wait_for_timeout(1500)
    attendre_main(pg)
    verifier('première manche de Carrière contre l’IA Mairie', 'Mairie' in pg.inner_text('#nom-adv') and 'Première manche de Carrière' in pg.evaluate("document.getElementById('journal').textContent"))
    verifier('Carrière : grand plateau, flèches', pg.eval_on_selector_all('#plateau .case', 'e => e.length') == 16 and pg.eval_on_selector_all('#main-joueur .mv b.fl', 'e => e.length') >= 4)
    coups, duels, coherent = jouer(pg)
    txt = pg.inner_text('#dialogue')
    verifier('Carrière finie (%d poses), score cohérent' % coups, fini(pg) and coherent)
    cl = json.loads(pg.evaluate("localStorage.getItem('hemicycle-classeur')") or '{}')
    print('   fin :', txt.split('\n')[0], '· deck :', len(cl.get('cartes', [])), 'cartes')
    if pg.query_selector('#dialogue .prise .choix-carte:not([disabled])'):
        verifier('carte à prendre : habit Flèches', pg.eval_on_selector_all('#dialogue .prise .mn-fl', 'e => e.length') >= 1)
    print('4. Réglages : retour aux règles classiques')
    pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(700)
    pg.click('#t-options'); pg.wait_for_timeout(300)
    verifier('réglages : Flèches cochées, options classiques masquées', pg.is_checked('input[name="regles"][value="fleches"]') and not pg.is_visible('input[name="coalition"]') and pg.is_visible('input[name="transparence"]'))
    pg.click('input[name="regles"][value="classique"] + span'); pg.wait_for_timeout(200)
    verifier('en classique, les options reviennent', pg.is_visible('input[name="coalition"]') and pg.is_visible('input[name="plateau"]'))
    pg.click('input[name="plateau"][value="classique"] + span'); pg.click('#form-options button[type="submit"]'); pg.wait_for_timeout(400)
    pg.click('#t-solo'); pg.wait_for_timeout(300)
    verifier('Solo classique : Tutoriel', pg.is_visible('#b-tuto'))
    pg.click('#b-libre'); choisir_niveau(pg); pg.wait_for_timeout(6500); attendre_main(pg)
    verifier('partie classique : 9 sièges, chiffres de côté, pas de flèches', pg.eval_on_selector_all('#plateau .case', 'e => e.length') == 9 and pg.eval_on_selector_all('.mv b.fl', 'e => e.length') == 0 and pg.eval_on_selector_all('#main-joueur .mv b', 'e => e.length') >= 16)
    pg.click('#b-accueil'); pg.wait_for_timeout(400); pg.click('#t-options'); pg.wait_for_timeout(300)
    pg.click('input[name="regles"][value="fleches"] + span'); pg.click('#form-options button[type="submit"]'); pg.wait_for_timeout(400)
    pg.click('#t-solo'); pg.wait_for_timeout(300); pg.click('#b-libre'); choisir_niveau(pg); pg.wait_for_timeout(6500); attendre_main(pg)
    verifier('retour aux Flèches sans recharger', pg.eval_on_selector_all('#plateau .case', 'e => e.length') == 16 and pg.eval_on_selector_all('#main-joueur .mv b.fl', 'e => e.length') >= 4)
    print('erreurs :', err if err else 'aucune', '·', 'ÉCHECS : ' + str(ko) if ko else 'tout passe')
