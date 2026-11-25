"""Captures : réglage « Le savais-tu ? » et une bulle sur grand écran."""
import importlib.util, sys
from playwright.sync_api import sync_playwright
spec = importlib.util.spec_from_file_location('tb', '/tmp/bonus/t_bulles_lib.py')
F = 'file:///home/claude/polices/node_modules/@fontsource'
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url({F}/{pkg}/files/{pkg}-latin-{w}-normal.woff2) format('woff2')}}\n"
              for fam, pkg, ws in [('Fraunces','fraunces',(600,900)),('Atkinson Hyperlegible','atkinson-hyperlegible',(400,700)),('JetBrains Mono','jetbrains-mono',(400,700))] for w in ws)
INIT = """
window.__graine = 11;
Math.random = (function(){ var s = window.__graine; return function(){ s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();
"""
def attendre_tour(pg):
    for _ in range(90):
        t = pg.inner_text('#perchoir-texte')
        if t.startswith('À toi') or 'en main' in t or t.startswith('Djadja') or t.startswith('Édito'): return True
        if pg.query_selector('#voile:not([hidden]) #b-revanche, #voile:not([hidden]) #b-second'): return False
        pg.wait_for_timeout(250)
    return False
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    err = []
    # 1. le réglage, au téléphone
    ctx = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); pg.on('pageerror', lambda e: err.append(str(e)))
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(700)
    fs = pg.query_selector('fieldset:has(input[name="anecdotes"])')
    print('fieldset trouvé :', bool(fs))
    if fs:
        fs.scroll_into_view_if_needed(); pg.wait_for_timeout(200)
        fs.screenshot(path='/tmp/reglage-anecdotes.png')
        print('coché par défaut :', pg.is_checked('input[name="anecdotes"]'))
    ctx.close()
    # 2. une bulle sur grand écran
    ctx = nav.new_context(viewport={'width': 1280, 'height': 860})
    pg = ctx.new_page(); pg.on('pageerror', lambda e: err.append(str(e)))
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    pg.add_init_script(INIT)
    pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(600)
    pg.click('#form-regles button[type="submit"]'); pg.wait_for_timeout(1200)
    vu = False
    for _ in range(12):
        if not attendre_tour(pg): break
        c = pg.query_selector('#main-joueur .carte-main:not([disabled])')
        if not c: break
        c.click(); pg.wait_for_timeout(150)
        case = pg.query_selector('.case.libre.jouable')
        if not case: break
        case.click(); pg.wait_for_timeout(1300)
        if pg.is_visible('#bulle'):
            pg.screenshot(path='/tmp/bulle-bureau.png'); vu = True
            # fermer d'un clic
            pg.click('#bulle-fermer'); pg.wait_for_timeout(200)
            print('fermée au clic :', not pg.is_visible('#bulle'))
            break
    print('bulle vue sur grand écran :', vu, '· erreurs :', err or 'aucune')
    nav.close()
