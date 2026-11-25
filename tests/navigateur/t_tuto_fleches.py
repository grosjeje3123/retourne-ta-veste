"""Tutoriel des Flèches : les trois leçons au téléphone, garde-fous, fin, passage, reprise, puis une partie normale."""
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
W, H = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv) > 2 else (390, 844)
TEL = W < 700
err, ko = [], []
def verifier(nom, cond):
    print(('   ok  ' if cond else '   KO  ') + nom)
    if not cond: ko.append(nom)
def etiquette(pg): return pg.inner_text('#tuto-etiquette') if pg.is_visible('#tuto') else ''
def score(pg): return pg.inner_text('#score-j') + '-' + pg.inner_text('#score-ia')
def haut_plateau(pg): return round(pg.evaluate("document.getElementById('plateau').getBoundingClientRect().top + window.scrollY"))
def attendre_etape(pg, n=120):
    for _ in range(n):
        if pg.is_visible('#voile #b-carriere-tuto'): return 'fin'
        if pg.query_selector('.duel-des'): pg.wait_for_timeout(200); continue
        if pg.is_visible('#tuto-suivant'): return 'bouton'
        if pg.query_selector('#b-action.tuto-cible'): return 'action'
        if pg.query_selector('#main-joueur .carte-main.tuto-cible:not([disabled])'): return 'pose'
        if not pg.is_visible('#tuto') and pg.query_selector('#main-joueur .carte-main:not([disabled])') and pg.inner_text('#perchoir-texte').startswith('À toi'): return 'libre'
        pg.wait_for_timeout(150)
    return '?'
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    ctx = nav.new_context(viewport={'width': W, 'height': H}, device_scale_factor=2, is_mobile=TEL, has_touch=TEL)
    pg = ctx.new_page()
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(800)
    print('1. Accueil d’un nouveau joueur')
    verifier('tuile « Première séance », pas de lien « Tutoriel » en bas', pg.is_visible('#t-tuto') and not pg.is_visible('#b-tuto-accueil'))
    pg.click('#t-solo'); pg.wait_for_timeout(300)
    verifier('bouton Tutoriel dans Solo', pg.is_visible('#b-tuto'))
    pg.click('#b-libre'); choisir_niveau(pg); pg.wait_for_timeout(300)
    verifier('première partie : règles, avec « Tutoriel » et « Jouer »', pg.is_visible('#b-tuto-fleches') and pg.is_visible('#b-go-fleches'))
    pg.click('#b-tuto-fleches'); pg.wait_for_timeout(600)
    print('2. Les leçons')
    verifier('leçon 1/3, plateau de 9 sièges, cartes en habit Flèches', etiquette(pg).upper().startswith('LEÇON 1/3') and pg.eval_on_selector_all('#plateau .case', 'e => e.length') == 9 and pg.eval_on_selector_all('#main-joueur .mv b.fl', 'e => e.length') >= 5)
    hauts, vus, libre_vu, fin = [], [], False, False
    for tour in range(70):
        quoi = attendre_etape(pg); lec = etiquette(pg)
        if pg.is_visible('#tuto'): hauts.append((lec[:9], haut_plateau(pg)))
        cle = lec[:9] + ' ' + quoi
        if cle not in vus:
            vus.append(cle); pg.screenshot(path='/tmp/tuto/tf-%02d.png' % len(vus))
        if quoi == 'bouton':
            txt = pg.inner_text('#tuto-texte')
            if 'Pris sans combat' in txt: verifier('leçon 1 : prise sans combat, 6 à 4', score(pg) == '6-4')
            if 'par le coin' in txt: verifier('leçon 1 : l’IA reprend par le coin, 5 à 5', score(pg) == '5-5')
            if 'sans défense là où' in txt: verifier('leçon 1 : reprise par le coin, 6 à 4', score(pg) == '6-4')
            if 'duel gagné' in txt: verifier('leçon 2 : duel 4 contre 1 gagné et combo, 7 à 3', score(pg) == '7-3' and '4 contre 1' in txt)
            if 'Raté pour l’IA' in txt: verifier('leçon 2 : Durif perd son duel, 8 à 2', score(pg) == '8-2')
            if 'fauteuil violet' in txt: verifier('leçon 3 : Breton prend Riner, indéboulonnable, 6 à 4', score(pg) == '6-4' and pg.eval_on_selector_all('#plateau .mc:not(.verso) .badge', 'e => e.length') == 1 and pg.eval_on_selector_all('#plateau .case', 'e => e.length') == 16)
            pg.click('#tuto-suivant'); pg.wait_for_timeout(250)
        elif quoi == 'pose':
            n_ok = pg.eval_on_selector_all('#main-joueur .carte-main:not([disabled])', 'e => e.length')
            if n_ok != 1: verifier('une seule carte jouable à l’étape guidée (' + str(n_ok) + ')', False)
            pg.click('#main-joueur .carte-main.tuto-cible', force=True); pg.wait_for_timeout(150)
            msg = pg.inner_text('#perchoir-texte')
            if 'Polony' in pg.inner_text('#tuto-texte'): verifier('leçon 2 : la ligne sous le score annonce « duel 5 contre 1 (80 %) »', 'duel 5 contre 1 (80 %)' in msg)
            if 'Lalanne' in pg.inner_text('#tuto-texte') and 'jaune' in pg.inner_text('#tuto-texte'): verifier('leçon 1 : la ligne annonce « prise sans combat »', 'prise sans combat' in msg)
            avant = pg.eval_on_selector_all('#plateau .case.libre', 'e => e.length')
            mauvais = pg.query_selector('#plateau .case.libre:not(.tuto-cible)')
            if mauvais:
                mauvais.click(); pg.wait_for_timeout(200)
                if pg.eval_on_selector_all('#plateau .case.libre', 'e => e.length') != avant: verifier('un mauvais siège ne prend pas la carte', False)
            pg.click('#plateau .case.tuto-cible', force=True); pg.wait_for_timeout(400)
        elif quoi == 'action':
            verifier('leçon 3 : étape carte action, Leclerc posé à l’écart, 6 à 4', score(pg) == '6-4' and 'carte action' in pg.inner_text('#tuto-texte'))
            verifier('leçon 3 : main bloquée pendant l’étape action', pg.eval_on_selector_all('#main-joueur .carte-main:not([disabled])', 'e => e.length') == 0)
            pg.click('#b-action', force=True); pg.wait_for_timeout(300)
            verifier('leçon 3 : la carte action est le 49.3, jouable', '49.3' in pg.inner_text('#dialogue') and bool(pg.query_selector('#b-jouer-action:not([disabled])')))
            pg.click('#b-jouer-action'); pg.wait_for_timeout(300)
            cibles = pg.query_selector_all('.case.cible')
            verifier('leçon 3 : une seule cible, Leclerc', len(cibles) == 1)
            cibles[0].click(); pg.wait_for_timeout(3200)
            verifier('leçon 3 : 49.3 adopté, 7 à 3', score(pg) == '7-3', score(pg)) if False else verifier('leçon 3 : 49.3 adopté, 7 à 3', score(pg) == '7-3')
        elif quoi == 'libre':
            if not libre_vu:
                libre_vu = True
                verifier('fin de partie libre : bulle fermée, camp IA revenu, IA « Tutoriel »', not pg.is_visible('#tuto') and pg.is_visible('#main-ia') and 'Tutoriel' in pg.inner_text('#nom-adv'))
            pg.click('#main-joueur .carte-main:not([disabled])'); pg.wait_for_timeout(120)
            pg.click('#plateau .case.libre.jouable'); pg.wait_for_timeout(700)
        elif quoi == 'fin':
            fin = True; break
        else:
            verifier('étape reconnue (bloqué sur « ' + lec + ' » : ' + pg.inner_text('#perchoir-texte') + ')', False); break
    print('3. Fin du tutoriel')
    verifier('panneau de fin ouvert', fin)
    pg.wait_for_timeout(300); pg.screenshot(path='/tmp/tuto/tf-fin.png')
    par_lecon = {}
    for l, h in hauts: par_lecon.setdefault(l, []).append(h)
    print('   haut du plateau par leçon :', {k: (min(v), max(v)) for k, v in par_lecon.items()})
    print('   positions du plateau par leçon :', {k: (min(v), max(v)) for k, v in par_lecon.items()})
    verifier('le plateau ne saute pas de plus de 12 px dans une leçon', all(max(v) - min(v) <= 12 for v in par_lecon.values()))
    verifier('Carrière pas encore ouverte : le bouton propose une partie libre', pg.inner_text('#b-carriere-tuto') == 'Partie libre' and 'Encore 3 parties libres' in pg.inner_text('#dialogue'))
    verifier('résumé des règles des Flèches', 'combo' in pg.inner_text('#dialogue').lower() and 'indéboulonnable' in pg.inner_text('#dialogue'))
    verifier('tutoriel des Flèches noté comme fait', json.loads(pg.evaluate("localStorage.getItem('hemicycle-tuto-fleches')") or '{}').get('fait') == 1)
    verifier('bilan des parties intact', pg.evaluate("localStorage.getItem('hemicycle-bilan')") in (None, '{"v":0,"d":0,"n":0}'))
    verifier('tu as gardé une carte en main', pg.eval_on_selector_all('#main-joueur .carte-main', 'e => e.length') == 1 and pg.eval_on_selector_all('#main-ia .carte-main', 'e => e.length') == 0)
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
    tro = pg.evaluate("JSON.parse(localStorage.getItem('hemicycle-trophees') || '{}')")
    verifier('trophée Élève appliqué obtenu à la fin du tutoriel, sans compter de partie', 'eleve' in tro.get('obtenus', {}) and tro.get('parties', 0) == 0)
    print('5. Une partie normale après le tutoriel')
    pg.click('#t-solo'); pg.wait_for_timeout(300); pg.click('#b-libre'); choisir_niveau(pg); pg.wait_for_timeout(6500)
    verifier('pas de panneau de règles (tutoriel déjà fait), pas de bulle, niveau affiché', not pg.is_visible('#b-go-fleches') and not pg.is_visible('#tuto') and 'Tutoriel' not in pg.inner_text('#nom-adv'))
    for _ in range(60):
        if pg.query_selector('#main-joueur .carte-main:not([disabled])') or pg.query_selector('#main-joueur .carte-main'): break
        pg.wait_for_timeout(200)
    verifier('vrai plateau, aucune carte grisée ni siège entouré', pg.eval_on_selector_all('#plateau .case', 'e => e.length') == 16 and pg.eval_on_selector_all('.tuto-hors, .tuto-cible', 'e => e.length') == 0)
    print('erreurs :', err if err else 'aucune', '·', 'ÉCHECS : ' + str(ko) if ko else 'tout passe')
