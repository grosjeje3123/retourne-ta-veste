"""Pluie d'objets au lancement d'une carte action : captures en cours d'animation, et le calque disparaît ensuite."""
import sys
from playwright.sync_api import sync_playwright
def choisir_niveau(pg):
    """Solo : après le mode, l'adversaire. On garde le niveau mémorisé (la première manche de Carrière saute cette étape)."""
    pg.wait_for_timeout(250)
    b = pg.query_selector('#niveaux .b-niveau.actuel') or pg.query_selector('#niveaux .b-niveau')
    if b: b.click()

src = open('t_actions_fleches.py').read()
INIT = src[src.index('INIT = """') + 10: src.index('"""\nQUI')]
LISTE = [int(x) for x in sys.argv[1].split(',')] if len(sys.argv) > 1 else [14, 21, 20, 22, 0]
STYLE = sys.argv[2] if len(sys.argv) > 2 else ''
ok = True
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    for a in LISTE:
        ctx = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        pg = ctx.new_page(); err = []
        pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
        pg.on('pageerror', lambda e: err.append(str(e)))
        pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
        pg.add_init_script(INIT % (21, a, 13) + ("\nwindow.__stylePluie = '%s';" % STYLE if STYLE else ''))
        pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(500)
        pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); choisir_niveau(pg); pg.wait_for_timeout(1200)
        vu = False
        for _ in range(80):
            if pg.query_selector('#main-joueur .carte-main:not([disabled])') and pg.inner_text('#perchoir-texte').startswith('À toi') and pg.query_selector('#b-action'):
                pg.click('#b-action'); pg.wait_for_timeout(250)
                bj = pg.query_selector('#b-jouer-action:not([disabled])')
                if not bj:
                    pg.keyboard.press('Escape'); c = pg.query_selector('#main-joueur .carte-main:not([disabled])'); c.click(); pg.wait_for_timeout(150)
                    pg.query_selector('.case.libre.jouable').click(); pg.wait_for_timeout(2500); continue
                bj.click(); pg.wait_for_timeout(300)
                cible = pg.query_selector('.case.cible, #main-ia .carte-main.cible, #main-joueur .carte-main.cible')
                if cible: cible.click()
                pg.wait_for_timeout(550); pg.screenshot(path=f'/tmp/pl/pluie_{a}{STYLE}_a.png')
                n = pg.evaluate("document.querySelectorAll('#pluie:not([hidden]) i, #pluie:not([hidden]) .mg-case').length")
                pg.wait_for_timeout(500); pg.screenshot(path=f'/tmp/pl/pluie_{a}{STYLE}_b.png')
                pg.wait_for_timeout(3200)
                reste = pg.evaluate("!document.getElementById('pluie').hidden")
                print(a, 'objets :', n, '· calque encore là après 4 s :', reste, '· erreurs :', err[:2] or 'aucune')
                ok = ok and n > 0 and not reste and not err; vu = True; break
            pg.wait_for_timeout(250)
        if not vu: print(a, 'carte pas jouée'); ok = False
        ctx.close()
print('tout passe' if ok else 'ÉCHEC')
