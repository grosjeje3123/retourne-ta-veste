"""Trophées cachés liés à une carte action : la carte du joueur est imposée, on lit les drapeaux relevés."""
import json, re
from playwright.sync_api import sync_playwright
def choisir_niveau(pg):
    """Solo : après le mode, l'adversaire. On garde le niveau mémorisé (la première manche de Carrière saute cette étape)."""
    pg.wait_for_timeout(250)
    b = pg.query_selector('#niveaux .b-niveau.actuel') or pg.query_selector('#niveaux .b-niveau')
    if b: b.click()

src = open('t_actions_fleches.py').read(); INIT = src[src.index('INIT = """') + 10: src.index('"""\nQUI')]
tt = open('t_trophees.py').read(); exec(tt[tt.index('def etat(pg)'):tt.index('def ouvrir(nav')])
CAS = [(16, 'suffit', 'Ça suffit !'), (22, 'taire', 'Taisez-vous !'), (12, 'addition', 'Le Homard'), (14, 'proclame', 'Proclamé'), (21, 'phobie', 'La Phobie'), (20, 'suisse', 'Compte caché')]
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    for a, drapeau, nom in CAS:
        vu = None
        for graine in (7, 21, 33, 58, 91, 12):
            ctx = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
            pg = ctx.new_page(); err = []
            pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
            pg.on('pageerror', lambda e: err.append(str(e)))
            pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
            pg.add_init_script(INIT % (graine, a, 13) + "\ntry { localStorage.setItem('hemicycle-options', JSON.stringify({ v: 2, niveau: 'mairie', regles: 'fleches' })); } catch (e) {}")
            pg.emulate_media(reduced_motion='reduce')
            pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(500)
            pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); choisir_niveau(pg)
            titre = jouer(pg, action=True); pg.wait_for_timeout(500); e = etat(pg)
            if err: print('   ERREUR', nom, graine, err[:1])
            if e and a in [int(k) for k in e['actions']] and vu is None: vu = False
            if e and e['f'].get(drapeau): vu = (graine, titre); ctx.close(); break
            ctx.close()
        print(f"{nom:16s} {'drapeau « ' + drapeau + ' » relevé (graine %d, %s)' % vu if vu else 'carte jouée, condition non remplie sur ces graines' if vu is False else 'carte non jouée'}")
