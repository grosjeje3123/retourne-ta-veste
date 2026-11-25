"""Joue chacune des sept cartes bonus dans le navigateur (téléphone), côté joueur puis côté IA.
La carte action est imposée en interceptant HemicycleMoteur.nouvelle (aucun changement dans le jeu)."""
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
INIT = """
window.__graine = %d; window.__actJ = %d; window.__actIA = %d;
Math.random = (function(){ var s = window.__graine; return function(){ s = (s * 16807) %% 2147483647; return (s - 1) / 2147483646; }; })();
(function(){ var m; Object.defineProperty(window, 'HemicycleMoteur', { configurable: true, get: function(){ return m; }, set: function(v){
  var orig = v.nouvelle; v.nouvelle = function(o){ if (window.__actJ >= 0) o.actJ = window.__actJ; if (window.__actIA >= 0) o.actIA = window.__actIA; return orig(o); }; m = v; } }); })();
"""
CODES = {0: '49.3', 1: 'Mercato', 6: 'Pas candidat', 7: 'Le Fauteuil', 8: 'Le Patron', 9: 'Édito', 12: 'Le Homard', 17: 'Cour des comptes', 18: 'Djadja show'}
def ouvrir(nav, graine, aj, ai):
    ctx = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); err = []
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    pg.add_init_script(INIT % (graine, aj, ai))
    pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(600)
    pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); choisir_niveau(pg); pg.wait_for_timeout(1200)
    return ctx, pg, err
def attendre_tour(pg):
    for _ in range(80):
        t = pg.inner_text('#perchoir-texte')
        if t.startswith('À toi') or 'en main' in t or t.startswith('Djadja') or t.startswith('Édito'): return True
        if pg.query_selector('#voile:not([hidden]) #b-revanche, #voile:not([hidden]) #b-second'): return False
        pg.wait_for_timeout(300)
    return False
def poser(pg):
    c = pg.query_selector('#main-joueur .carte-main:not([disabled])')
    if not c: return False
    c.click(); pg.wait_for_timeout(200)
    case = pg.query_selector('.case.libre.jouable')
    if not case: return False
    case.click(); pg.wait_for_timeout(1700); return True
def journal(pg): return pg.inner_text('#journal')
ok = True
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    # Côté joueur : chaque carte bonus, jouée dès qu'elle est jouable
    for a in sorted(CODES):
        joue = False
        for graine in (7, 21, 33, 58):
            ctx, pg, err = ouvrir(nav, graine, a, 13)
            for tour in range(8):
                if not attendre_tour(pg): break
                if not joue and tour >= 1:
                    pg.click('#b-action'); pg.wait_for_timeout(300)
                    bj = pg.query_selector('#b-jouer-action:not([disabled])')
                    if bj:
                        bj.click(); pg.wait_for_timeout(400)
                        for _ in range(2):
                            cible = pg.query_selector('.case.cible')
                            if cible: cible.click(); pg.wait_for_timeout(600)
                        pg.wait_for_timeout(1600); joue = True
                        if a == 18:
                            pg.screenshot(path='/tmp/bonus/joueur-show.png')
                            boosts = pg.eval_on_selector_all('#main-joueur .mv b.boost', 'e => e.length')
                            print(f'   main après Djadja show : {boosts} chiffres en violet ; perchoir « {pg.inner_text("#perchoir-texte")} »')
                        if a == 17: pg.screenshot(path='/tmp/bonus/joueur-cour.png')
                        if a == 8: pg.screenshot(path='/tmp/joueur-rachat.png')
                        if a == 9: pg.screenshot(path='/tmp/joueur-edito.png')
                        print(f'J {CODES[a]:17} jouée (graine {graine}) · {journal(pg).splitlines()[0][:120]}')
                        if not attendre_tour(pg): break
                    else:
                        pg.click('[data-fermer]'); pg.wait_for_timeout(200)
                if not poser(pg): break
            if err: ok = False; print('   ERREURS :', err[:3])
            ctx.close()
            if joue: break
        if not joue: print(f'J {CODES[a]:17} jamais jouable sur ces graines'); ok = False
    # Côté IA : l'IA reçoit la carte bonus, le joueur pose jusqu'à la fin
    for a in sorted(CODES):
        vu = False
        for graine in (5, 19, 44):
            ctx, pg, err = ouvrir(nav, graine, 13, a)
            for _ in range(12):
                if not attendre_tour(pg): break
                if CODES[a] in journal(pg): vu = True
                if not poser(pg): break
            if CODES[a] in journal(pg): vu = True
            if err: ok = False; print('   ERREURS :', err[:3])
            ctx.close()
            if vu: break
        print(f'IA {CODES[a]:17} ' + ('jouée par l’IA' if vu else 'pas jouée par l’IA sur ces graines'))
    nav.close()
print('BILAN :', 'aucune erreur' if ok else 'à revoir')
