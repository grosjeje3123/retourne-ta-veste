"""Règles Flèches : chacune des 19 cartes action jouée dans le navigateur (téléphone), côté joueur puis côté IA.
La carte est imposée en interceptant HemicycleMoteur.nouvelle (rien ne change dans le jeu)."""
import sys, json
from playwright.sync_api import sync_playwright
def choisir_niveau(pg):
    """Solo : après le mode, l'adversaire. On garde le niveau mémorisé (la première manche de Carrière saute cette étape)."""
    pg.wait_for_timeout(250)
    b = pg.query_selector('#niveaux .b-niveau.actuel') or pg.query_selector('#niveaux .b-niveau')
    if b: b.click()

INIT = """
window.__graine = %d; window.__actJ = %d; window.__actIA = %d;
Math.random = (function(){ var s = window.__graine; return function(){ s = (s * 16807) %% 2147483647; return (s - 1) / 2147483646; }; })();
try { localStorage.setItem('hemicycle-fleches-vu', '1'); } catch (e) {}
(function(){ var m; Object.defineProperty(window, 'HemicycleMoteur', { configurable: true, get: function(){ return m; }, set: function(v){
  var orig = v.nouvelle; v.nouvelle = function(o){ o.actJ = window.__actJ; o.actIA = window.__actIA; var r = orig(o); (window.__appels = window.__appels || []).push(JSON.stringify(r.act) + ' fl ' + r.fl); return r; }; m = v; } }); })();
"""
QUI = sys.argv[1] if len(sys.argv) > 1 else 'tout'
LISTE = [int(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 else list(range(24))
def ouvrir(nav, graine, aj, ai):
    ctx = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); err = []
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.add_init_script(INIT % (graine, aj, ai))
    pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(500)
    pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); choisir_niveau(pg); pg.wait_for_timeout(1200)
    return ctx, pg, err
def fini(pg): return bool(pg.query_selector('#voile:not([hidden]) #b-revanche, #voile:not([hidden]) #b-menu-fin'))
def attendre_tour(pg):
    for _ in range(120):
        if fini(pg): return False
        if pg.query_selector('#main-joueur .carte-main:not([disabled])') and pg.inner_text('#perchoir-texte').startswith('À toi'): return True
        pg.wait_for_timeout(250)
    return False
def poser(pg):
    c = pg.query_selector('#main-joueur .carte-main:not([disabled])')
    if not c: return False
    c.click(); pg.wait_for_timeout(150)
    case = pg.query_selector('.case.libre.jouable')
    if not case: return False
    case.click(); pg.wait_for_timeout(1200); return True
def coherent(pg):
    e = pg.evaluate("""() => { const j = document.querySelectorAll('#plateau .mc.j:not(.verso)').length + document.querySelectorAll('#main-joueur .carte-main').length,
        i = document.querySelectorAll('#plateau .mc.ia:not(.verso)').length + document.querySelectorAll('#main-ia .carte-main').length;
        const sj = document.querySelectorAll('#action-joueur .slot-suisse').length, si = document.querySelectorAll('#action-ia .slot-suisse').length;   // compte en Suisse
        return [j + sj, i + si, sj + si, +document.getElementById('score-j').textContent, +document.getElementById('score-ia').textContent]; }""")
    e = [e[0], e[1], e[3], e[4], e[2]]   # [j, ia, score j, score ia, comptes en Suisse]
    if (e[0] == e[2] and e[1] == e[3] and e[0] + e[1] in ((9, 10, 11) if e[4] else (9, 10))): return True   # Compte caché : une carte repiochée en plus
    return 'Compte en Suisse découvert' in pg.evaluate("document.getElementById('journal').textContent")   # carte saisie : comptée sans être visible
ko = []
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    noms = None
    if QUI in ('tout', 'joueur'):
        for a in LISTE:
            joue, vu = False, ''
            for graine in ((7, 21, 33, 58, 91) if QUI == 'joueur' else (7, 21, 33, 58, 91, 12, 44, 3, 66, 81)):
                autre = (a + 5) % 19
                if autre == 16: autre = 13   # pas de « Ça suffit ! » en face : il annulerait la carte étudiée
                ctx, pg, err = ouvrir(nav, graine, a, autre)
                if noms is None: noms = pg.evaluate("() => window.APDA.ACTIONS.map(x => x.code)")
                bon = True
                for tour in range(8):
                    if not attendre_tour(pg): break
                    if not coherent(pg): bon = False
                    if not joue and tour >= 1 and pg.query_selector('#b-action'):
                        pg.click('#b-action'); pg.wait_for_timeout(250)
                        texte = pg.inner_text('#dialogue')
                        bj = pg.query_selector('#b-jouer-action:not([disabled])')
                        if bj:
                            bj.click(); pg.wait_for_timeout(350)
                            for _ in range(3):
                                if pg.is_visible('#b-echanger'):
                                    pg.click('[data-p]'); pg.click('[data-m]'); pg.click('#b-echanger'); pg.wait_for_timeout(500); break
                                cible = pg.query_selector('.case.cible, #main-ia .carte-main.cible, #main-joueur .carte-main.cible')
                                if not cible: break
                                cible.click(); pg.wait_for_timeout(500)
                            for _ in range(40):
                                if 'Tu joues' in pg.inner_text('#journal'): break
                                pg.wait_for_timeout(150)
                            joue = 'Tu joues' in pg.inner_text('#journal')
                            vu = [l for l in pg.inner_text('#journal').splitlines() if 'Tu joues' in l][:1]
                            if not attendre_tour(pg): break
                            if not coherent(pg): bon = False
                        else:
                            pg.click('[data-fermer]'); pg.wait_for_timeout(150)
                    if not poser(pg): break
                rate = 0
                for _ in range(60):
                    if fini(pg): break
                    if attendre_tour(pg): poser(pg)
                    else:
                        rate += 1
                        if rate > 2: break
                termine = fini(pg)
                ctx.close()
                if err or not bon or not termine:
                    ko.append(f'J {a}'); print(f'   KO joueur {noms[a]} graine {graine} : erreurs {err[:2]} · scores cohérents {bon} · fin {termine}')
                if joue: break
            print(f'J  {noms[a]:17} ' + (f'jouée · {vu[0][:110] if vu else ""}' if joue else 'jamais jouable sur ces graines'))
            if not joue: ko.append(f'J {a} pas jouée')
    if QUI in ('tout', 'ia'):
        for a in LISTE:
            vu = False
            for graine in (5, 19, 44, 63, 7, 21, 33, 58):
                ctx, pg, err = ouvrir(nav, graine, -1, a)
                if noms is None: noms = pg.evaluate("() => window.APDA.ACTIONS.map(x => x.code)")
                bon = True
                for _ in range(14):
                    if fini(pg): break
                    if 'Jouée' in pg.inner_html('#action-ia'): vu = True   # le journal ne garde que les derniers coups : on regarde l'emplacement de la carte
                    if not attendre_tour(pg): continue
                    if not coherent(pg): bon = False
                    if not poser(pg): break
                for _ in range(60):
                    if fini(pg): break
                    pg.wait_for_timeout(250)
                vu = vu or 'Jouée' in pg.inner_html('#action-ia') or noms[a] in pg.inner_text('#journal')
                termine = fini(pg)
                ctx.close()
                if err or not bon or not termine:
                    ko.append(f'IA {a}'); print(f'   KO IA {noms[a]} graine {graine} : erreurs {err[:2]} · scores cohérents {bon} · fin {termine}')
                if vu: break
            print(f'IA {noms[a]:17} ' + ('jouée par l’IA' if vu else 'pas jouée par l’IA sur ces graines'))
    nav.close()
print('BILAN :', 'aucune erreur' if not ko else str(ko))
