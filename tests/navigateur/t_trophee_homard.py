import json, re
from playwright.sync_api import sync_playwright
def choisir_niveau(pg):
    """Solo : après le mode, l'adversaire. On garde le niveau mémorisé (la première manche de Carrière saute cette étape)."""
    pg.wait_for_timeout(250)
    b = pg.query_selector('#niveaux .b-niveau.actuel') or pg.query_selector('#niveaux .b-niveau')
    if b: b.click()

src = open('t_actions_fleches.py').read(); INIT = src[src.index('INIT = """') + 10: src.index('"""\nQUI')]
tt = open('t_trophees.py').read(); exec(tt[tt.index('def etat(pg)'):tt.index('def jouer(pg')])
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    for graine in (7, 21, 33, 58, 91, 12, 3, 44):
        ctx = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        pg = ctx.new_page(); err = []
        pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
        pg.on('pageerror', lambda e: err.append(str(e)))
        pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
        pg.add_init_script(INIT % (graine, 12, 13) + "\ntry { localStorage.setItem('hemicycle-options', JSON.stringify({ v: 2, niveau: 'mairie', regles: 'fleches' })); } catch (e) {}")
        pg.emulate_media(reduced_motion='reduce')
        pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(500)
        pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); choisir_niveau(pg)
        res = None
        for _ in range(300):
            if fini(pg): break
            if pg.query_selector('#main-joueur .carte-main:not([disabled])') and pg.inner_text('#perchoir-texte').startswith('À toi'):
                lignes = [l for l in pg.inner_text('#journal').split('\n') if l.strip()]
                ipose = min([k for k, l in enumerate(lignes) if 'L’IA pose' in l], default=-1)   # le journal met la ligne la plus récente en tête
                pris = ipose >= 0 and any('change' in l for l in lignes[:ipose]) and not any('Tu poses' in l or 'Tu joues' in l for l in lignes[:ipose])
                if pris and res is None and pg.query_selector('#b-action'):
                    nom = re.search(r'pose (.+?) au ', lignes[ipose]).group(1)
                    pg.click('#b-action'); pg.wait_for_timeout(200)
                    bj = pg.query_selector('#b-jouer-action:not([disabled])')
                    if bj:
                        bj.click(); pg.wait_for_timeout(300)
                        cibles = pg.query_selector_all('.case.cible'); bonne = [c for c in cibles if nom in (c.get_attribute('aria-label') or '') + c.inner_text()]
                        if bonne:
                            bonne[0].click(); pg.wait_for_timeout(2500); e = etat(pg); res = ('bonne cible ' + nom, bool(e['f'].get('addition'))); break
                        elif cibles:
                            cibles[0].click(); pg.wait_for_timeout(2500); e = etat(pg); res = ('autre cible', bool(e['f'].get('addition'))); break
                    else: pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
                c = pg.query_selector('#main-joueur .carte-main:not([disabled])')
                if c:
                    c.click(); pg.wait_for_timeout(120); cs = pg.query_selector('.case.libre.jouable'); cs and cs.click()
            pg.wait_for_timeout(250)
        print('graine', graine, res, err[:1] or ''); ctx.close()
        if res and res[0].startswith('bonne'): break
