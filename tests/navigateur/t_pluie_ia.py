import sys
from playwright.sync_api import sync_playwright
def choisir_niveau(pg):
    """Solo : après le mode, l'adversaire. On garde le niveau mémorisé (la première manche de Carrière saute cette étape)."""
    pg.wait_for_timeout(250)
    b = pg.query_selector('#niveaux .b-niveau.actuel') or pg.query_selector('#niveaux .b-niveau')
    if b: b.click()

src = open('t_actions_fleches.py').read()
INIT = src[src.index('INIT = """') + 10: src.index('"""\nQUI')]
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    for style in sys.argv[1].split(','):
        ctx = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        pg = ctx.new_page()
        pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
        pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
        pg.add_init_script(INIT % (21, 13, 11) + "\nwindow.__stylePluie = '%s';" % style)
        pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(500)
        pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); choisir_niveau(pg); pg.wait_for_timeout(800)
        vu = False
        for k in range(400):
            if pg.evaluate("!document.getElementById('annonce').hidden"):
                cache = pg.evaluate("(() => { var e = document.getElementById('pluie'); return !e.hidden && /manga|geant/.test(e.className) && e.children.length > 0; })()"); pg.screenshot(path=f'/tmp/pl/ia_{style}_0.png'); pg.wait_for_timeout(450); pg.screenshot(path=f'/tmp/pl/ia_{style}.png'); print(style, 'annonce affichée · mise en scène plein écran encore là :', cache)
                vu = True; break
            c = pg.query_selector('#main-joueur .carte-main:not([disabled])')
            if c and pg.inner_text('#perchoir-texte').startswith('À toi'):
                c.click(); pg.wait_for_timeout(120); cs = pg.query_selector('.case.libre.jouable'); cs and cs.click()
            pg.wait_for_timeout(60)
        if not vu: print(style, 'IA : carte pas jouée')
        ctx.close()
