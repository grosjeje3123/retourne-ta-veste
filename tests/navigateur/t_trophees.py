"""Trophées dans le navigateur (téléphone) : tuile, salle, bannière, comptage en vraie partie, cas exclus."""
import json, sys
from playwright.sync_api import sync_playwright
def choisir_niveau(pg):
    """Solo : après le mode, l'adversaire. On garde le niveau mémorisé (la première manche de Carrière saute cette étape)."""
    pg.wait_for_timeout(250)
    b = pg.query_selector('#niveaux .b-niveau.actuel') or pg.query_selector('#niveaux .b-niveau')
    if b: b.click()

INIT = """
window.__graine = %d;
Math.random = (function(){ var s = window.__graine; return function(){ s = (s * 16807) %% 2147483647; return (s - 1) / 2147483646; }; })();
try { localStorage.setItem('hemicycle-fleches-vu', '1'); var pre = %s; Object.keys(pre).forEach(function(k){ if (localStorage.getItem(k) == null) localStorage.setItem(k, JSON.stringify(pre[k])); }); } catch (e) {}
window.__toasts = [];
document.addEventListener('DOMContentLoaded', function(){ var el = document.getElementById('trophee'); if (!el) return;
  new MutationObserver(function(){ var b = el.querySelector('b'); if (b && window.__toasts[window.__toasts.length - 1] !== b.textContent) window.__toasts.push(b.textContent); }).observe(el, { childList: true, subtree: true }); });
"""
ok = ko = 0
def t(nom, cond, detail=''):
    global ok, ko
    if cond: ok += 1; print('   ok ', nom)
    else: ko += 1; print('   KO ', nom, detail)
def etat(pg): return pg.evaluate("JSON.parse(localStorage.getItem('hemicycle-trophees') || 'null')")
def fini(pg): return bool(pg.query_selector('#voile:not([hidden]) #b-menu-fin'))
def jouer(pg, action=False):
    """Joue une partie entière au plus simple ; renvoie le titre du bilan."""
    faite = False
    for _ in range(400):
        if fini(pg): break
        if pg.query_selector('#main-joueur .carte-main:not([disabled])') and pg.inner_text('#perchoir-texte').startswith('À toi'):
            if action and not faite and pg.query_selector('#b-action'):
                faite = True
                pg.click('#b-action'); pg.wait_for_timeout(200)
                bj = pg.query_selector('#b-jouer-action:not([disabled])')
                if bj:
                    bj.click(); pg.wait_for_timeout(300)
                    for _ in range(3):
                        if pg.is_visible('#b-echanger'): pg.click('[data-p]'); pg.click('[data-m]'); pg.click('#b-echanger'); break
                        c = pg.query_selector('.case.cible, #main-ia .carte-main.cible, #main-joueur .carte-main.cible')
                        if not c: break
                        c.click(); pg.wait_for_timeout(400)
                    pg.wait_for_timeout(2600); continue
                else: pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
            c = pg.query_selector('#main-joueur .carte-main:not([disabled])')
            if c:
                c.click(); pg.wait_for_timeout(120)
                cs = pg.query_selector('.case.libre.jouable')
                if cs: cs.click()
        pg.wait_for_timeout(250)
    pg.wait_for_timeout(600)
    return pg.inner_text('#titre-dialogue') if fini(pg) else None
def ouvrir(nav, graine, pre=None, niveau='mairie', transparence=False):
    ctx = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); err = []
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pre = dict(pre or {}); pre['hemicycle-options'] = {'v': 2, 'niveau': niveau, 'transparence': transparence, 'regles': 'fleches'}
    pg.add_init_script(INIT % (graine, json.dumps(pre)))
    pg.emulate_media(reduced_motion='reduce')   # parties plus rapides ; les bannières restent
    pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(500)
    return ctx, pg, err
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    print('1. Accueil et salle des trophées, joueur tout neuf')
    ctx, pg, err = ouvrir(nav, 7)
    t('tuile Trophées visible : 0 sur 41', pg.is_visible('#t-trophees') and pg.inner_text('#t-trophees-sous') == '0 sur 41', pg.inner_text('#t-trophees'))
    pg.click('#t-trophees'); pg.wait_for_timeout(300)
    n = pg.evaluate("[document.querySelectorAll('#dialogue .trophee').length, document.querySelectorAll('#dialogue .trophee.secret').length, document.querySelectorAll('#dialogue .trophee.obtenu').length, document.querySelectorAll('#dialogue .tr-titre').length]")
    t('41 trophées listés, 8 cachés en « ??? », aucun obtenu, 5 groupes', n == [41, 8, 0, 5], n)
    t('aucun nom de trophée caché ne fuit', not any(x in pg.inner_text('#dialogue') for x in ('Girouette', 'yeux dans les yeux', 'Soirée électorale')))
    debord = pg.evaluate("(() => { var d = document.getElementById('dialogue'); return d.scrollWidth > d.clientWidth + 1 || [...d.querySelectorAll('.trophee')].some(e => e.scrollWidth > e.clientWidth + 1); })()")
    t('rien ne déborde à 390 px', not debord)
    pg.screenshot(path='/tmp/pl/troph_salle.png'); pg.click('#dialogue [data-fermer]'); pg.wait_for_timeout(200)
    pg.screenshot(path='/tmp/pl/troph_accueil.png')
    print('2. Une vraie partie contre la Mairie')
    pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); choisir_niveau(pg)
    titre = jouer(pg, action=True); e = etat(pg); pg.wait_for_timeout(4200)
    bil = pg.evaluate("JSON.parse(localStorage.getItem('hemicycle-bilan'))")
    t('partie finie, comptée une fois', titre and e and e['parties'] == 1 and len(e['lieuxJ']) == 1, (titre, e and e['parties']))
    t('victoires alignées sur le bilan du jeu', e['victoires'] == bil['v'], (e['victoires'], bil))
    t('carte action jouée comptée', len(e['actions']) == 1, e['actions'])
    gagne = bil['v'] == 1
    if gagne: t('victoire : Premier mandat obtenu (pas encore Monsieur le Maire), bannière vue', 'mandat' in e['obtenus'] and 'maire' not in e['obtenus'] and 'Premier mandat' in pg.evaluate('window.__toasts'), pg.evaluate('window.__toasts'))
    else: t('défaite ou égalité : pas de Premier mandat', 'mandat' not in e['obtenus'])
    print('     bilan :', titre, '· bannières :', pg.evaluate('window.__toasts'), '· drapeaux :', sorted(e['f']))
    t('aucune erreur', not err, err[:2]); ctx.close()
    print('3. Compteur au seuil : la 20e partie débloque Habitué, avec sa bannière')
    ctx, pg, err = ouvrir(nav, 21, {'hemicycle-trophees': {'v': 1, 'parties': 19, 'obtenus': {}}, 'hemicycle-bilan': {'v': 0, 'd': 19, 'n': 0}})
    pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); choisir_niveau(pg)
    jouer(pg); pg.wait_for_timeout(4500); e = etat(pg)
    t('Habitué obtenu et annoncé', 'habitue' in e['obtenus'] and 'Habitué' in pg.evaluate('window.__toasts'), (e['obtenus'], pg.evaluate('window.__toasts')))
    pg.screenshot(path='/tmp/pl/troph_toast.png') if pg.evaluate("document.getElementById('trophee').classList.contains('on')") else None
    pg.click('#b-menu-fin'); pg.wait_for_timeout(400)
    t('la tuile de l’accueil suit', pg.inner_text('#t-trophees-sous') == f"{len(e['obtenus'])} sur 41", pg.inner_text('#t-trophees-sous'))
    pg.click('#t-trophees'); pg.wait_for_timeout(300)
    t('la salle montre l’obtenu et une progression en cours', pg.evaluate("document.querySelectorAll('#dialogue .trophee.obtenu').length") == len(e['obtenus']) and 'sur 7' in pg.inner_text('#dialogue'))   # 7 lieux, buvette comprise
    pg.screenshot(path='/tmp/pl/troph_salle2.png')
    t('aucune erreur', not err, err[:2]); ctx.close()
    print('4. Joueur d’avant les trophées : rattrapage sans bannière')
    ctx, pg, err = ouvrir(nav, 5, {'hemicycle-bilan': {'v': 12, 'd': 8, 'n': 1}, 'hemicycle-tuto-fleches': {'fait': 1}})
    e = etat(pg)
    t('Premier mandat, Élève appliqué et Habitué déjà acquis', all(x in e['obtenus'] for x in ('mandat', 'eleve', 'habitue')) and e['victoires'] == 12, e['obtenus'])
    t('pas de bannière au lancement', pg.evaluate('window.__toasts') == [])
    t('tuile : 3 sur 41', pg.inner_text('#t-trophees-sous') == '3 sur 41', pg.inner_text('#t-trophees-sous')); ctx.close()
    print('5. Option Transparence : la partie ne compte pas')
    ctx, pg, err = ouvrir(nav, 33, transparence=True)
    pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); choisir_niveau(pg)
    titre = jouer(pg); pg.wait_for_timeout(1500); e = etat(pg)
    t('partie jouée mais rien de compté', titre and (not e or (e['parties'] == 0 and not e['f'])), e and (e['parties'], e['f']))
    t('aucune erreur', not err, err[:2]); ctx.close()
    print('6. Plusieurs parties : les faits de jeu remontent')
    vus = set(); parties = 0; duels = 0
    for g in (58, 91, 12):
        ctx, pg, err = ouvrir(nav, g)
        pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); choisir_niveau(pg)
        jouer(pg, action=True); pg.wait_for_timeout(800); e = etat(pg); vus |= set(e['f']); parties += e['parties']; duels += e['duels']
        t(f'graine {g} : aucune erreur', not err, err[:2]); ctx.close()
    t('3 parties comptées, duels gagnés comptés', parties == 3 and duels > 0, (parties, duels))
    print('     drapeaux relevés :', sorted(vus))
print(f'Trophées (navigateur) : {ok} OK, {ko} KO'); sys.exit(1 if ko else 0)
