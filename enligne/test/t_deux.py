"""Deux navigateurs jouent une partie complète l'un contre l'autre via le serveur local.
Vérifie : création, lien d'invitation, tirage, coups alternés, plateaux identiques (vus de chaque côté),
main adverse jamais transmise, cartes action, fin de partie cohérente, revanche, coupure et reprise.
Usage : t_deux.py [port] [reglages]   (reglages : classique, transparence, sans-actions)"""
import json, sys, time
from playwright.sync_api import sync_playwright
def choisir_niveau(pg):
    """Solo : après le mode, l'adversaire. On garde le niveau mémorisé (la première manche de Carrière saute cette étape)."""
    pg.wait_for_timeout(250)
    b = pg.query_selector('#niveaux .b-niveau.actuel') or pg.query_selector('#niveaux .b-niveau')
    if b: b.click()


PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8099
REG = sys.argv[2] if len(sys.argv) > 2 else ''
BASE = f'http://127.0.0.1:{PORT}/'
OUT = '/tmp/fete'
erreurs, fuites, refus = [], [], []

def suivre(nom, pg):
    pg.on('pageerror', lambda e: erreurs.append(f'{nom} pageerror: {e}'))
    pg.on('console', lambda m: erreurs.append(f'{nom} console: {m.text}') if m.type == 'error' else None)
    def ws(w):
        def recu(payload):
            try: m = json.loads(payload)
            except Exception: return
            if m.get('t') == 'erreur': refus.append(f"{nom}: {m.get('raison')}")
            v = m.get('vue')
            if v and not v['fin'] and 'transparence' not in REG:
                visibles = [c for c in v['mains'][1] if c >= 0]
                if len(visibles) > 1: fuites.append(f'{nom}: main adverse visible {visibles}')
        w.on('framereceived', recu)
    pg.on('websocket', ws)

def plateau(pg):
    """Le plateau tel qu'affiché : liste de (camp, nom) par siège, du point de vue de ce joueur."""
    return pg.evaluate("""() => [...document.querySelectorAll('#plateau .case')].map(c => {
        const mc = c.querySelector('.mc'); if (c.classList.contains('banc')) return 'banc';
        return mc ? (mc.classList.contains('j') ? 'moi:' : 'adv:') + mc.querySelector('.mn').textContent : '';
    })""")

def miroir(t):
    return [x.replace('moi:', 'X:').replace('adv:', 'moi:').replace('X:', 'adv:') if ':' in x else x for x in t]

def jouer_un_coup(pg, nom, essai_action):
    """Joue si c'est son tour : une carte action une fois si possible, sinon une pose. Renvoie ce qui a été fait."""
    txt = pg.inner_text('#perchoir-texte')
    if not (txt.startswith('À toi') or 'en main' in txt or txt.startswith('Édito')):
        return None
    if essai_action and pg.query_selector('#b-action'):
        pg.click('#b-action'); pg.wait_for_timeout(250)
        b = pg.query_selector('#b-jouer-action:not([disabled])')
        if b:
            code = pg.inner_text('#dialogue h2')
            b.click(); pg.wait_for_timeout(350)
            if pg.query_selector('[data-cote]'): pg.click('[data-cote="0"]'); pg.wait_for_timeout(300)
            for _ in range(20):   # Le Plan : on attend les cartes de la pioche envoyées par le serveur
                if pg.query_selector('#b-garder') or not pg.query_selector('#voile:not([hidden])'): break
                pg.wait_for_timeout(100)
            if pg.query_selector('#b-garder'):
                p_ = pg.query_selector('[data-p]'); m_ = pg.query_selector('[data-m]')
                if p_ and m_: p_.click(); pg.wait_for_timeout(100); pg.query_selector('[data-m]').click(); pg.wait_for_timeout(100); pg.click('#b-echanger')
                else: pg.click('#b-garder')
                pg.wait_for_timeout(300)
            for _ in range(2):
                c = pg.query_selector('.case.cible, #main-joueur .carte-main.cible, #main-ia .carte-main.cible')
                if c: c.click(); pg.wait_for_timeout(500)
            return 'action'
        pg.click('[data-fermer]'); pg.wait_for_timeout(150)
    carte = pg.query_selector('#main-joueur .carte-main:not([disabled])')
    if carte:
        carte.click(); pg.wait_for_timeout(120)
        k = pg.query_selector('.case.libre.jouable')
        if k: k.click(); return 'pose'
    return None

with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    ca = nav.new_context(viewport={'width': 1280, 'height': 860})
    cb = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    A = ca.new_page(); B = cb.new_page()
    A.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    A.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
    suivre('A', A); suivre('B', B)
    A.goto(BASE + '#jouer'); A.wait_for_timeout(700)
    o = {'v': 2}
    if 'classique' in REG: o['plateau'] = 'classique'
    if 'transparence' in REG: o['transparence'] = True
    if 'sans-actions' in REG: o['actions'] = False
    A.evaluate("o => localStorage.setItem('hemicycle-options', JSON.stringify(o))", o); A.reload(); A.wait_for_timeout(600)
    A.click('#t-ligne'); A.wait_for_timeout(300); A.click('#b-multi-ligne'); A.wait_for_timeout(300)
    print('panneau En ligne :', A.inner_text('#titre-dialogue'), '| modes :', A.eval_on_selector_all('.mode b', 'e => e.map(x => x.textContent)'))
    A.click('#b-ami')
    # Premier passage en ligne : le profil d'abord (pseudo au hasard, avatar par défaut)
    A.wait_for_selector('#champ-pseudo', timeout=5000)
    A.screenshot(path=f'{OUT}/ligne-profil.png')
    A.fill('#champ-pseudo', 'Macron 2027'); A.click('#b-profil-ok'); A.wait_for_timeout(150)
    print('pseudo interdit refusé dans le navigateur :', A.inner_text('#msg-pseudo'))
    A.click('#b-pseudo-hasard'); pseudoA = A.input_value('#champ-pseudo'); A.click('.picto-av[data-i="4"]'); A.click('#b-profil-ok')
    A.wait_for_selector('#lien-ligne', timeout=5000)
    lien = A.input_value('#lien-ligne'); code = A.inner_text('.code-partie')
    print('code :', code, '| lien :', lien, '| adresse de A :', A.url)
    A.screenshot(path=f'{OUT}/ligne-0-attente.png')
    B.goto(lien)
    B.wait_for_selector('#champ-pseudo', timeout=5000)
    B.click('#b-pseudo-hasard'); pseudoB = B.input_value('#champ-pseudo'); B.click('#b-profil-ok')
    t0 = time.time()
    for _ in range(80):
        if A.inner_text('#perchoir-texte').startswith(('À toi', 'Ton adversaire')) and B.inner_text('#perchoir-texte').startswith(('À toi', 'Ton adversaire')): break
        A.wait_for_timeout(150)
    print('partie lancée en', round(time.time() - t0, 1), 's | A :', A.inner_text('#perchoir-texte'), '| B :', B.inner_text('#perchoir-texte'))
    print('lieux :', A.inner_text('#lieu-jeu').split('\n')[0], '/', B.inner_text('#lieu-jeu').split('\n')[0], '| A voit :', A.inner_text('#nom-adv'), '| B voit :', B.inner_text('#nom-adv'), '| pseudos attendus :', pseudoB, '/', pseudoA)
    ecarts, coups, actions = 0, 0, {'A': 0, 'B': 0}
    t0 = time.time()
    while time.time() - t0 < 150:
        if A.query_selector('#voile:not([hidden]) #b-revanche, #voile:not([hidden]) #b-second') and B.query_selector('#voile:not([hidden]) #b-revanche, #voile:not([hidden]) #b-second'):
            break
        fait = False
        for nom, pg in (('A', A), ('B', B)):
            r = jouer_un_coup(pg, nom, actions[nom] == 0 and coups >= 2)
            if r:
                fait = True; coups += 1
                if r == 'action': actions[nom] += 1
                pg.wait_for_timeout(1700)
                # Après chaque coup, les deux plateaux doivent dire la même chose
                for _ in range(20):
                    pa, pb = plateau(A), plateau(B)
                    if pa == miroir(pb): break
                    A.wait_for_timeout(200)
                else:
                    ecarts += 1; print('ÉCART après le coup', coups, pa, pb)
                if coups == 3: A.screenshot(path=f'{OUT}/ligne-1-A.png'); B.screenshot(path=f'{OUT}/ligne-1-B.png')
        if not fait: A.wait_for_timeout(250)
    A.wait_for_timeout(500)
    A.screenshot(path=f'{OUT}/ligne-2-fin-A.png'); B.screenshot(path=f'{OUT}/ligne-2-fin-B.png')
    fa = A.inner_text('#dialogue').replace('\n', ' | ')[:160]; fb = B.inner_text('#dialogue').replace('\n', ' | ')[:160]
    print('coups :', coups, '| actions jouées :', actions, '| écarts de plateau :', ecarts)
    print('fin A :', fa); print('fin B :', fb)
    # Revanche (ou second tour) : il faut les deux
    bouton = '#b-second' if A.query_selector('#b-second') else '#b-revanche'
    A.click(bouton); A.wait_for_timeout(400)
    print('A attend :', A.inner_text('#envie-ligne'), '| B voit :', B.inner_text('#envie-ligne'))
    B.click(bouton)
    for _ in range(60):
        if A.query_selector('#voile[hidden]') and A.inner_text('#perchoir-texte').startswith(('À toi', 'Ton adversaire')) and B.inner_text('#perchoir-texte').startswith(('À toi', 'Ton adversaire')): break
        A.wait_for_timeout(150)
    print('nouvelle manche :', A.inner_text('#perchoir-texte'), '/', B.inner_text('#perchoir-texte'), '| journal A :', A.inner_text('#journal').split('\n')[0])
    # Deux coups, puis B perd la connexion et revient par le lien
    for _ in range(2):
        for pg in (A, B):
            if jouer_un_coup(pg, '', False): pg.wait_for_timeout(1600)
    avant = plateau(A)
    B.close()
    A.wait_for_timeout(800)
    print('A après la coupure :', A.inner_text('#perchoir-texte'), '|', A.inner_text('#journal').split('\n')[0])
    B = cb.new_page(); suivre('B2', B)
    B.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    B.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
    B.goto(lien)
    for _ in range(40):
        if B.inner_text('#perchoir-texte').startswith(('À toi', 'Ton adversaire')): break
        B.wait_for_timeout(150)
    B.wait_for_timeout(400)
    print('B revenu :', B.inner_text('#perchoir-texte'), '| plateau identique :', plateau(B) == miroir(avant), '| A :', A.inner_text('#journal').split('\n')[0])
    B.screenshot(path=f'{OUT}/ligne-3-reprise-B.png')
    # B quitte : A est prévenu
    B.click('#b-accueil'); B.wait_for_timeout(400)
    B.click('#t-solo'); B.wait_for_timeout(250); B.click('#b-libre'); choisir_niveau(B); B.wait_for_timeout(800)
    print('A après le départ de B :', A.inner_text('#dialogue').replace('\n', ' | ')[:120] if A.query_selector('#voile:not([hidden])') else '(rien)')
    print('B joue contre l’IA :', B.inner_text('#nom-adv'))
    nav.close()
print('main adverse transmise :', fuites[:3] or 'jamais')
print('coups refusés par le serveur :', refus or 'aucun')
print('erreurs :', erreurs or 'aucune')
