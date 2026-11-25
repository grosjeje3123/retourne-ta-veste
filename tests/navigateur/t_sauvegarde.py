"""Partie en cours sauvegardée : on recharge l'appli en pleine partie, « Reprendre » la retrouve à l'identique ; tutoriel non gardé ; sauvegarde abîmée ignorée."""
import json, sys
from playwright.sync_api import sync_playwright
sys.path.insert(0, '/home/claude/tests/navigateur')
from t_trophees_aide import choisir_niveau, jouer, fini, INIT
ok = ko = 0
def t(nom, cond, detail=''):
    global ok, ko
    if cond: ok += 1; print('   ok ', nom)
    else: ko += 1; print('   KO ', nom, detail)
CLE = 'hemicycle-partie-en-cours'
def sauve(pg): return pg.evaluate("JSON.parse(localStorage.getItem('%s') || 'null')" % CLE)
def plateau(pg): return pg.eval_on_selector_all('#plateau .case', 'e => e.map(x => (x.querySelector(".carte") ? x.querySelector(".carte").className + "|" + (x.querySelector(".carte").dataset.carte || x.textContent.trim().slice(0, 30)) : x.className.includes("banc") ? "banc" : "-"))')
def a_toi(pg): return pg.query_selector('#main-joueur .carte-main:not([disabled])') and pg.inner_text('#perchoir-texte').startswith('À toi')
def attendre_tour(pg, n=80):
    for _ in range(n):
        if a_toi(pg) or fini(pg): return True
        pg.wait_for_timeout(250)
    return False
def poser(pg):
    c = pg.query_selector('#main-joueur .carte-main:not([disabled])'); c.click(); pg.wait_for_timeout(120)
    pg.query_selector('.case.libre.jouable').click()
def ouvrir(nav, graine, pre=None, adresse='#jouer'):
    ctx = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); err = []
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pre = dict(pre or {}); pre.setdefault('hemicycle-options', {'v': 2, 'niveau': 'assemblee', 'regles': 'fleches'}); pre.setdefault('hemicycle-tuto-fleches', {'fait': 1})
    pg.add_init_script(INIT % (graine, json.dumps(pre)))
    pg.emulate_media(reduced_motion='reduce')
    pg.goto('file:///home/claude/carte2/index.html' + adresse); pg.wait_for_timeout(600)
    return ctx, pg, err
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    print('1. Partie libre : trois coups, on ferme, on revient')
    ctx, pg, err = ouvrir(nav, 11)
    t('pas de sauvegarde au départ, pas de tuile « Reprendre »', sauve(pg) is None and not pg.is_visible('#t-reprendre'))
    pg.click('#t-solo'); pg.wait_for_timeout(300); pg.click('#b-libre'); choisir_niveau(pg)
    attendre_tour(pg)
    for _ in range(3):
        poser(pg); pg.wait_for_timeout(300); attendre_tour(pg)
    av = sauve(pg); pl = plateau(pg); jr = pg.inner_html('#journal'); lieu = pg.evaluate("document.body.dataset.lieu || document.querySelector('#vue-jeu').className")
    t('la partie est sauvegardée à chaque coup', av and av['v'] == 1 and av['s']['trait'] == 0 and sum(1 for x in av['s']['crd']['d'] if x >= 0) >= 5, av and av['s']['crd'])
    pg.reload(); pg.wait_for_timeout(900)
    t('au relancement : directement dans la partie', pg.is_visible('#vue-jeu') and not pg.is_visible('#accueil'))
    t('« Reprendre » : le même plateau', plateau(pg) == pl, (plateau(pg), pl))
    t('le même journal', pg.inner_html('#journal') == jr)
    t('le même lieu', (pg.evaluate("document.body.dataset.lieu || document.querySelector('#vue-jeu').className")) == lieu)
    t('c’est bien à moi de jouer', a_toi(pg))
    ap = sauve(pg); t('état moteur identique', ap['s'] == av['s'])
    print('2. Fermer pendant le tour de l’IA')
    poser(pg); pg.wait_for_timeout(80)
    s2 = sauve(pg)
    pg.reload(); pg.wait_for_timeout(900)
    t('reprise directe', pg.is_visible('#vue-jeu'))
    t('l’IA reprend son tour puis me rend la main', attendre_tour(pg) and (fini(pg) or a_toi(pg)))
    print('3. Finir la partie : la sauvegarde disparaît')
    titre = jouer(pg)
    t('partie finie', bool(titre), titre)
    t('plus de sauvegarde', sauve(pg) is None)
    pg.reload(); pg.wait_for_timeout(900)
    t('plus de tuile « Reprendre » au relancement', not pg.is_visible('#t-reprendre'))
    t('aucune erreur', not err, err[:3]); ctx.close()
    print('4. Carrière : la manche est reprise avec ses mains')
    ctx, pg, err = ouvrir(nav, 5, {'hemicycle-carriere-ouverte': 1})
    pg.click('#t-solo'); pg.wait_for_timeout(300); pg.click('#b-carriere'); choisir_niveau(pg)
    pg.wait_for_selector('#b-go-carriere', timeout=8000); pg.wait_for_timeout(300); pg.click('#b-go-carriere'); pg.wait_for_timeout(600)
    attendre_tour(pg); poser(pg); pg.wait_for_timeout(300); attendre_tour(pg)
    c = sauve(pg); t('carrière sauvegardée avec ses mains', c and c['carriere'] and len(c['carriere']['mainJ']) >= 5, c and c.get('carriere'))
    pg.reload(); pg.wait_for_timeout(900)
    pg.evaluate("history.back()"); pg.wait_for_timeout(400)
    vis = pg.is_visible('#t-reprendre')
    t('retour à l’accueil : « Reprendre » dit Carrière', vis and 'Carrière' in pg.inner_text('#t-reprendre-sous'), pg.inner_text('#t-reprendre-sous') if vis else 'tuile cachée')
    if vis: pg.click('#t-reprendre')
    pg.wait_for_timeout(500); attendre_tour(pg)
    titre = jouer(pg); t('la manche se termine normalement', bool(titre), titre)
    t('aucune erreur', not err, err[:3]); ctx.close()
    print('5. Tutoriel jamais sauvegardé ; sauvegarde abîmée ignorée')
    ctx, pg, err = ouvrir(nav, 3)
    pg.click('#t-solo'); pg.wait_for_timeout(300); pg.click('#b-tuto'); pg.wait_for_timeout(1200)
    t('tutoriel : pas de sauvegarde', sauve(pg) is None)
    ctx.close()
    ctx, pg, err = ouvrir(nav, 3, {CLE: {'v': 1, 's': {'N': 16, 'own': [1, 2]}, 'lieu': 'senat'}})
    t('sauvegarde abîmée : accueil normal, pas de « Reprendre »', pg.is_visible('#accueil') and not pg.is_visible('#t-reprendre'))
    t('et elle est effacée', sauve(pg) is None)
    t('aucune erreur', not err, err[:3]); ctx.close()
    nav.close()
print(f'\nt_sauvegarde : {ok} OK, {ko} KO'); sys.exit(1 if ko else 0)
