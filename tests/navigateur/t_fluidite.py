"""Fluidité des mises en scène des cartes action, processeur ralenti (téléphone d'entrée de gamme)."""
import sys
from playwright.sync_api import sync_playwright
def choisir_niveau(pg):
    """Solo : après le mode, l'adversaire. On garde le niveau mémorisé (la première manche de Carrière saute cette étape)."""
    pg.wait_for_timeout(250)
    b = pg.query_selector('#niveaux .b-niveau.actuel') or pg.query_selector('#niveaux .b-niveau')
    if b: b.click()

src = open('t_actions_fleches.py').read()
INIT = src[src.index('INIT = """') + 10: src.index('"""\nQUI')]
FREIN = int(sys.argv[1]) if len(sys.argv) > 1 else 6
MESURE = """() => new Promise(ok => { var t0 = performance.now(), d = [], av = t0;
  function f(t){ d.push(t - av); av = t; if (t - t0 < 2100) requestAnimationFrame(f); else { d.shift(); d.sort((a,b)=>a-b);
    ok({ n: d.length, moy: d.reduce((a,b)=>a+b,0)/d.length, p95: d[Math.floor(d.length*.95)], max: d[d.length-1], longues: d.filter(x => x > 50).length }); } }
  requestAnimationFrame(f); })"""
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    for style in ('', 'pluie', 'manga', 'canon', 'geant'):
        ctx = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2)
        pg = ctx.new_page()
        pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
        pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
        pg.add_init_script(INIT % (21, 14, 13) + ("\nwindow.__stylePluie = '%s';" % style if style else "\nwindow.__sansPluie = 1;"))
        pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(500)
        pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); choisir_niveau(pg); pg.wait_for_timeout(1200)
        cdp = ctx.new_cdp_session(pg)
        for _ in range(80):
            if pg.query_selector('#main-joueur .carte-main:not([disabled])') and pg.inner_text('#perchoir-texte').startswith('À toi') and pg.query_selector('#b-action'):
                cdp.send('Emulation.setCPUThrottlingRate', {'rate': FREIN})
                if style:
                    pg.click('#b-action'); pg.wait_for_timeout(600)
                    pg.evaluate("document.querySelector('#b-jouer-action').click()")
                r = pg.evaluate(MESURE)
                print(f"{style or 'repos (sans carte)':20s} {1000/r['moy']:5.1f} img/s · 95 % des images sous {r['p95']:5.1f} ms · pire {r['max']:5.0f} ms · images > 50 ms : {r['longues']}")
                break
            pg.wait_for_timeout(250)
        ctx.close()
