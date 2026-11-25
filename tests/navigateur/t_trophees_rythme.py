"""À quel rythme tombent les trophées ? Un joueur neuf enchaîne des parties libres (jeu très simple : première carte, premier siège)."""
import json, sys
from playwright.sync_api import sync_playwright
tt = open('t_trophees.py').read(); exec(tt[tt.index('def etat(pg)'):tt.index('def ouvrir(nav')])
def choisir_niveau(pg):
    pg.wait_for_timeout(250); b = pg.query_selector('#niveaux .b-niveau.actuel'); b and b.click()
NIVEAU, N = sys.argv[1], int(sys.argv[2])
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    ctx = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.add_init_script("""try { if (!localStorage.getItem('hemicycle-venu')) { localStorage.setItem('hemicycle-venu', '1'); localStorage.setItem('hemicycle-fleches-vu', '1'); localStorage.setItem('hemicycle-tuto-fleches', '{"fait":1}');
        localStorage.setItem('hemicycle-options', JSON.stringify({ v: 2, niveau: '%s', regles: 'fleches' })); } } catch (e) {}""" % NIVEAU)
    pg.emulate_media(reduced_motion='reduce')
    pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(600)
    avant = set(etat(pg)['obtenus'])
    print('au départ (tutoriel fait) :', len(avant))
    pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); choisir_niveau(pg)
    for k in range(N):
        titre = jouer(pg, action=True); pg.wait_for_timeout(700)
        if pg.query_selector('[data-prise]:not([disabled])'): pg.click('[data-prise]:not([disabled])')
        e = etat(pg); neufs = [x for x in e['obtenus'] if x not in avant]; avant |= set(neufs)
        print(f"partie {k + 1:2d} · {(titre or '?')[:24]:24s} · total {len(avant):2d} · nouveaux : {', '.join(neufs) or '-'}", flush=True)
        b = pg.query_selector('#b-second') or pg.query_selector('#b-revanche')
        if not b: break
        b.click(); pg.wait_for_timeout(500)
