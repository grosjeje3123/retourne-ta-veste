"""Tutoriel : au glisser-déposer, seul le siège de la leçon accepte la carte."""
from playwright.sync_api import sync_playwright
err = []
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    pg = nav.new_context(viewport={'width': 1280, 'height': 860}).new_page()
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(700)
    pg.click('#t-solo'); pg.wait_for_timeout(300); pg.click('#b-tuto'); pg.wait_for_timeout(400); pg.click('#tuto-suivant')
    pg.wait_for_selector('#main-joueur .carte-main.tuto-cible:not([disabled])', timeout=8000)
    def centre(sel):
        b = pg.query_selector(sel).bounding_box(); return b['x'] + b['width'] / 2, b['y'] + b['height'] / 2
    def glisser(vers):
        x, y = centre('#main-joueur .carte-main.tuto-cible, #main-joueur .carte-main.sel'); x2, y2 = centre(vers)
        pg.mouse.move(x, y); pg.mouse.down(); pg.mouse.move(x + 12, y + 12, steps=3); pg.mouse.move(x2, y2, steps=8)
        surv = pg.eval_on_selector_all('#plateau .case.survolee', 'e => e.length'); pg.mouse.up(); pg.wait_for_timeout(500); return surv
    s1 = glisser('#plateau .case[data-i="0"]')
    libres1 = pg.eval_on_selector_all('#plateau .case.libre', 'e => e.length')
    print('mauvais siège : survol', s1, '· sièges libres', libres1, '→', 'ok' if s1 == 0 and libres1 == 8 else 'KO')
    # une autre carte de la main ne se laisse pas prendre
    autre = pg.query_selector('#main-joueur .carte-main[disabled]'); b = autre.bounding_box()
    pg.mouse.move(b['x'] + 20, b['y'] + 20); pg.mouse.down(); pg.mouse.move(b['x'] + 60, b['y'] + 60, steps=4)
    fant = pg.eval_on_selector_all('.fantome', 'e => e.length'); pg.mouse.up(); pg.wait_for_timeout(200)
    print('carte hors leçon : fantôme', fant, '→', 'ok' if fant == 0 else 'KO')
    s2 = glisser('#plateau .case[data-i="3"]'); pg.wait_for_timeout(900)
    libres2 = pg.eval_on_selector_all('#plateau .case.libre', 'e => e.length')
    print('bon siège : survol', s2, '· sièges libres', libres2, '· score', pg.inner_text('#score-j') + '-' + pg.inner_text('#score-ia'), '→', 'ok' if s2 == 1 and libres2 == 7 else 'KO')
    print('erreurs :', err or 'aucune')
