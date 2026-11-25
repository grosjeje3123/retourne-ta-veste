"""Joue chacune des cinq nouvelles cartes action dans le navigateur (téléphone), vérifie qu'elles s'appliquent sans erreur."""
from playwright.sync_api import sync_playwright
F = 'file:///home/claude/polices/node_modules/@fontsource'
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url({F}/{pkg}/files/{pkg}-latin-{w}-normal.woff2) format('woff2')}}\n"
              for fam, pkg, ws in [('Fraunces','fraunces',(600,900)),('Atkinson Hyperlegible','atkinson-hyperlegible',(400,700)),('JetBrains Mono','jetbrains-mono',(400,700))] for w in ws)
VOULUS = ['Le Homard', 'Vaccination', 'Proclamé', 'Relocalisation', 'Ça suffit !']
INIT = "window.__graine = %d; Math.random = (function(){ var s = window.__graine; return function(){ s = (s * 16807) %% 2147483647; return (s - 1) / 2147483646; }; })();"
def ouvrir(nav, graine):
    ctx = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); err = []
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    pg.add_init_script(INIT % graine)
    pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(700)
    pg.click('#form-regles button[type="submit"]'); pg.wait_for_timeout(1200)
    return ctx, pg, err
def attendre_tour(pg):
    for _ in range(60):
        t = pg.inner_text('#perchoir-texte')
        if t.startswith('À toi') or 'en main' in t: return True
        if pg.query_selector('#voile:not([hidden]) #b-revanche, #voile:not([hidden]) #b-second'): return False
        pg.wait_for_timeout(300)
    return False
def poser(pg):
    c = pg.query_selector('#main-joueur .carte-main:not([disabled])')
    if not c: return False
    c.click(); pg.wait_for_timeout(200)
    case = pg.query_selector('.case.libre.jouable')
    if not case: return False
    case.click(); pg.wait_for_timeout(1800); return True
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    trouves = {}
    for graine in range(1, 400):
        if len(trouves) == len(VOULUS): break
        ctx, pg, err = ouvrir(nav, graine)
        b = pg.query_selector('#b-action')
        lab = b.get_attribute('aria-label') if b else ''
        for v in VOULUS:
            if v not in trouves and ('action : ' + v + ',') in lab: trouves[v] = graine
        ctx.close()
    print('graines :', trouves)
    for code, graine in trouves.items():
        ctx, pg, err = ouvrir(nav, graine)
        joue = False
        for tour in range(6):
            if not attendre_tour(pg): break
            if tour >= 1 and not joue:
                pg.click('#b-action'); pg.wait_for_timeout(300)
                bj = pg.query_selector('#b-jouer-action:not([disabled])')
                if bj:
                    bj.click(); pg.wait_for_timeout(400)
                    for _ in range(2):
                        cible = pg.query_selector('.case.cible')
                        if cible: cible.click(); pg.wait_for_timeout(700)
                    pg.wait_for_timeout(2200); joue = True
                    journal = pg.inner_text('#journal')
                    pg.screenshot(path=f'/tmp/bonus/action-{code[:6]}.png')
                    print(f'{code:15} jouée · journal : {journal.splitlines()[0][:110]}')
                    if not attendre_tour(pg): break
                else:
                    raison = pg.inner_text('#dialogue'); pg.click('[data-fermer]'); pg.wait_for_timeout(200)
            if not poser(pg): break
        if not joue: print(f'{code:15} pas jouable dans cette partie')
        print('   erreurs :', err or 'aucune')
        ctx.close()
    nav.close()
