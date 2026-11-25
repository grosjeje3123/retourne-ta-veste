"""Tutoriel « Première séance » : les trois leçons jouées au téléphone, garde-fous des étapes guidées, fin, passage, reprise."""
import sys, json
from playwright.sync_api import sync_playwright
def choisir_niveau(pg):
    """Solo : après le mode, l'adversaire. On garde le niveau mémorisé (la première manche de Carrière saute cette étape)."""
    pg.wait_for_timeout(250)
    b = pg.query_selector('#niveaux .b-niveau.actuel') or pg.query_selector('#niveaux .b-niveau')
    if b: b.click()

F = 'file:///home/claude/polices/node_modules/@fontsource'
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url({F}/{pkg}/files/{pkg}-latin-{w}-normal.woff2) format('woff2')}}\n"
              for fam, pkg, ws in [('Fraunces','fraunces',(600,900)),('Atkinson Hyperlegible','atkinson-hyperlegible',(400,700)),('JetBrains Mono','jetbrains-mono',(400,700))] for w in ws)
URL = sys.argv[1] if len(sys.argv) > 1 else 'file:///home/claude/carte2/index.html'
W, H = (int(sys.argv[2]), int(sys.argv[3])) if len(sys.argv) > 3 else (390, 844)
TEL = W < 700
err, ko = [], []
def verifier(nom, cond):
    print(('   ok  ' if cond else '   KO  ') + nom)
    if not cond: ko.append(nom)
def etiquette(pg): return pg.inner_text('#tuto-etiquette') if pg.is_visible('#tuto') else ''
def score(pg): return pg.inner_text('#score-j') + '-' + pg.inner_text('#score-ia')
def haut_plateau(pg): return round(pg.evaluate("document.getElementById('plateau').getBoundingClientRect().top + window.scrollY"))
def attendre_etape(pg, n=80):
    """Attend qu'il y ait quelque chose à faire : bouton de bulle, carte ou action guidée, tour libre, panneau de fin."""
    for _ in range(n):
        if pg.is_visible('#voile #b-carriere-tuto'): return 'fin'
        if pg.is_visible('#tuto-suivant'): return 'bouton'
        if pg.query_selector('#main-joueur .carte-main.tuto-cible:not([disabled])'): return 'pose'
        if pg.query_selector('#b-action.tuto-cible'): return 'action'
        if not pg.is_visible('#tuto') and pg.query_selector('#main-joueur .carte-main:not([disabled])') and pg.inner_text('#perchoir-texte').startswith('À toi'): return 'libre'
        pg.wait_for_timeout(150)
    return '?'
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    ctx = nav.new_context(viewport={'width': W, 'height': H}, device_scale_factor=2, is_mobile=TEL, has_touch=TEL)
    pg = ctx.new_page()
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    pg.goto(URL + '#jouer'); pg.wait_for_timeout(800)
    print('1. Accueil d’un nouveau joueur')
    verifier('tuile « Première séance » visible', pg.is_visible('#t-tuto'))
    verifier('bas de l’accueil sans lien « Tutoriel » (il est dans Solo)', not pg.is_visible('#b-tuto-accueil'))
    pg.screenshot(path='/tmp/tuto/1-accueil.png')
    pg.click('#t-solo'); pg.wait_for_timeout(300)
    verifier('bouton Tutoriel dans Solo', pg.is_visible('#b-tuto'))
    pg.screenshot(path='/tmp/tuto/1-solo.png')
    pg.click('[data-fermer]'); pg.wait_for_timeout(200)
    pg.click('#t-tuto'); pg.wait_for_timeout(500)
    print('2. Leçon 1')
    verifier('bulle visible, leçon 1 sur 3', etiquette(pg).upper().startswith('LEÇON 1/3'))
    verifier('camp IA masqué au téléphone' if TEL else 'camp IA visible sur grand écran', pg.is_visible('#main-ia') != TEL)
    verifier('toutes les cartes bloquées pendant la bulle', pg.eval_on_selector_all('#main-joueur .carte-main:not([disabled])', 'e => e.length') == 0)
    hauts, tailles, vus, lecons = [], [], [], {}
    fin = False
    for tour in range(60):
        quoi = attendre_etape(pg)
        lec = etiquette(pg)
        if pg.is_visible('#tuto'):
            hauts.append(haut_plateau(pg)); tailles.append(round(pg.evaluate("document.getElementById('tuto').getBoundingClientRect().height")))
        cle = lec[:13] + ' ' + quoi
        if cle not in vus:
            vus.append(cle)
            pg.screenshot(path='/tmp/tuto/etape-%02d.png' % len(vus))
        if quoi == 'bouton':
            txt = pg.inner_text('#tuto-texte')
            if 'Coalition' in txt: verifier('leçon 2 : Coalition + domino, 10 à 0', score(pg) == '10-0')
            if 'peu près' in txt: verifier('leçon 2 : À peu près d’accord, 7 à 3', score(pg) == '7-3')
            if '5 bat 1' in txt: verifier('leçon 1 : première prise, 6 à 4', score(pg) == '6-4')
            if 'Cazeneuve reprend' in txt: verifier('leçon 1 : l’IA reprend, 5 à 5', score(pg) == '5-5')
            if 'rien ne bouge' in txt: verifier('leçon 1 : reprise par le haut, 6 à 4', score(pg) == '6-4')
            if 'sans vote' in txt: verifier('leçon 3 : 49.3 joué, 5 à 5', score(pg) == '5-5')
            pg.click('#tuto-suivant'); pg.wait_for_timeout(250)
        elif quoi == 'pose':
            n_ok = pg.eval_on_selector_all('#main-joueur .carte-main:not([disabled])', 'e => e.length')
            if n_ok != 1: verifier('une seule carte jouable à l’étape guidée (' + str(n_ok) + ')', False)
            # garde-fou : on choisit la carte, puis on touche un mauvais siège
            pg.click('#main-joueur .carte-main.tuto-cible', force=True); pg.wait_for_timeout(150)
            avant = pg.eval_on_selector_all('#plateau .case.libre', 'e => e.length')
            mauvais = pg.query_selector('#plateau .case.libre:not(.tuto-cible)')
            if mauvais:
                mauvais.click(); pg.wait_for_timeout(200)
                if pg.eval_on_selector_all('#plateau .case.libre', 'e => e.length') != avant: verifier('un mauvais siège ne prend pas la carte', False)
            if 'Cazeneuve au centre' in pg.inner_text('#tuto-texte'):
                # la carte action n'est pas jouable avant son étape
                pg.click('#b-action'); pg.wait_for_timeout(250)
                verifier('carte action refusée hors de son étape', pg.is_disabled('#b-jouer-action'))
                pg.click('#voile [data-fermer]'); pg.wait_for_timeout(200)
            nb = pg.eval_on_selector_all('#plateau .case.tuto-cible.jouable', 'e => e.length')
            if nb != 1: verifier('un seul siège proposé (' + str(nb) + ')', False)
            pg.click('#plateau .case.tuto-cible', force=True); pg.wait_for_timeout(400)
        elif quoi == 'action':
            verifier('leçon 3 : l’IA a pris le centre, 4 à 6', score(pg) == '4-6')
            verifier('cartes de la main bloquées pendant l’étape action', pg.eval_on_selector_all('#main-joueur .carte-main:not([disabled])', 'e => e.length') == 0)
            pg.click('#b-action', force=True); pg.wait_for_timeout(300)
            pg.screenshot(path='/tmp/tuto/action-panneau.png')
            pg.click('#b-jouer-action'); pg.wait_for_timeout(300)
            verifier('deux cartes à reprendre au choix', pg.eval_on_selector_all('#plateau .case.cible', 'e => e.length') == 2)
            # annuler puis recommencer : l'étape ne doit pas avancer
            pg.click('#b-annuler'); pg.wait_for_timeout(300)
            verifier('après annulation, l’étape action est toujours là', bool(pg.query_selector('#b-action.tuto-cible')))
            pg.click('#b-action', force=True); pg.wait_for_timeout(300); pg.click('#b-jouer-action'); pg.wait_for_timeout(300)
            pg.click('#plateau .case.cible >> nth=1'); pg.wait_for_timeout(600)
        elif quoi == 'libre':
            if 'libre' not in lecons:
                lecons['libre'] = 1
                verifier('fin de partie libre : bulle fermée, camp IA revenu', not pg.is_visible('#tuto') and pg.is_visible('#main-ia'))
                verifier('IA « Tutoriel », pas de carte action adverse', 'Tutoriel' in pg.inner_text('#nom-adv') and pg.inner_text('#action-ia').strip() == '')
            pg.click('#main-joueur .carte-main:not([disabled])'); pg.wait_for_timeout(120)
            pg.click('#plateau .case.libre.jouable'); pg.wait_for_timeout(700)
        elif quoi == 'fin':
            fin = True; break
        else:
            verifier('étape reconnue (bloqué sur « ' + lec + ' » : ' + pg.inner_text('#perchoir-texte') + ')', False); break
    print('3. Fin du tutoriel')
    verifier('panneau de fin ouvert', fin)
    pg.wait_for_timeout(300)
    pg.screenshot(path='/tmp/tuto/fin.png')
    verifier('étapes vues : ' + str(len(vus)), len(vus) >= 9)
    print('   plateau : haut entre', min(hauts), 'et', max(hauts), 'px · bulle entre', min(tailles), 'et', max(tailles), 'px')
    verifier('le plateau ne saute pas de plus de 12 px entre deux bulles', max(hauts) - min(hauts) <= 12)
    verifier('tutoriel noté comme fait', json.loads(pg.evaluate("localStorage.getItem('hemicycle-tuto')") or '{}').get('fait') == 1)
    verifier('bilan des parties intact (le tutoriel ne compte pas)', pg.evaluate("localStorage.getItem('hemicycle-bilan')") in (None, '{"v":0,"d":0,"n":0}'))
    verifier('une carte reste dans la main de l’IA', pg.eval_on_selector_all('#main-ia .carte-main', 'e => e.length') == 1)
    pg.click('#b-menu-tuto'); pg.wait_for_timeout(500)
    verifier('retour à l’accueil, sans « Reprendre » ni « Première séance »', pg.is_visible('#accueil') and not pg.is_visible('#t-reprendre') and not pg.is_visible('#t-tuto'))
    print('4. Rejouer, quitter en cours, reprendre')
    pg.click('#t-solo'); pg.wait_for_timeout(300); pg.click('#b-tuto'); pg.wait_for_timeout(500)
    pg.click('#tuto-suivant'); pg.wait_for_timeout(1900)
    verifier('relancé : étape de pose de la leçon 1', attendre_etape(pg) == 'pose')
    pg.click('#b-accueil'); pg.wait_for_timeout(500)
    verifier('« Reprendre » propose le tutoriel', pg.is_visible('#t-reprendre') and 'Tutoriel' in pg.inner_text('#t-reprendre-sous'))
    pg.click('#t-reprendre'); pg.wait_for_timeout(400)
    verifier('reprise : la bulle et le coup guidé sont là', pg.is_visible('#tuto') and bool(pg.query_selector('#main-joueur .carte-main.tuto-cible')))
    pg.click('#tuto-passer'); pg.wait_for_timeout(500)
    verifier('« Passer » ramène à l’accueil, plus rien à reprendre', pg.is_visible('#accueil') and not pg.is_visible('#t-reprendre'))
    print('5. Une partie normale après le tutoriel')
    pg.evaluate("localStorage.setItem('hemicycle-options', JSON.stringify(Object.assign(JSON.parse(localStorage.getItem('hemicycle-options')||'{}'), {plateau:'classique', v:2})))")
    pg.click('#t-solo'); pg.wait_for_timeout(300); pg.click('#b-libre'); choisir_niveau(pg); pg.wait_for_timeout(6500)
    verifier('partie libre : pas de bulle, niveau affiché', not pg.is_visible('#tuto') and 'Tutoriel' not in pg.inner_text('#nom-adv') and pg.is_visible('#main-ia'))
    for _ in range(40):
        if pg.query_selector('#main-joueur .carte-main:not([disabled])'): break
        pg.wait_for_timeout(200)
    verifier('toutes les cartes de la main sont jouables', pg.eval_on_selector_all('#main-joueur .carte-main:not([disabled])', 'e => e.length') >= 4)
    verifier('aucune carte grisée ni siège entouré', pg.eval_on_selector_all('.tuto-hors, .tuto-cible', 'e => e.length') == 0)
    pg.screenshot(path='/tmp/tuto/apres.png')
    print('erreurs :', err if err else 'aucune', '·', 'ÉCHECS : ' + str(ko) if ko else 'tout passe')
