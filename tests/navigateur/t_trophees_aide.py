import json
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
