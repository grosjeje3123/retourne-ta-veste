"""Parties complètes au téléphone : les bulles « Le savais-tu ? » apparaissent, jamais sur deux poses de suite, sans erreur."""
from playwright.sync_api import sync_playwright
F = 'file:///home/claude/polices/node_modules/@fontsource'
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url({F}/{pkg}/files/{pkg}-latin-{w}-normal.woff2) format('woff2')}}\n"
              for fam, pkg, ws in [('Fraunces','fraunces',(600,900)),('Atkinson Hyperlegible','atkinson-hyperlegible',(400,700)),('JetBrains Mono','jetbrains-mono',(400,700))] for w in ws)
INIT = """
window.__graine = %d;
Math.random = (function(){ var s = window.__graine; return function(){ s = (s * 16807) %% 2147483647; return (s - 1) / 2147483646; }; })();
window.__bulles = [];
document.addEventListener('DOMContentLoaded', function(){
  var b = document.getElementById('bulle');
  new MutationObserver(function(){ if (!b.hidden) window.__bulles.push({ t: document.getElementById('bulle-texte').textContent, occ: document.querySelectorAll('#plateau .case:not(.libre):not(.banc)').length }); })
    .observe(b, { attributes: true, attributeFilter: ['hidden', 'class'] });
});
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
    total, erreurs, capture = 0, [], False
    for graine in (3, 11, 29, 47):
        ctx = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        pg = ctx.new_page()
        pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
        pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
        pg.on('pageerror', lambda e: erreurs.append(str(e)))
        pg.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' else None)
        pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
        pg.add_init_script(INIT % graine)
        pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(600)
        pg.click('#form-regles button[type="submit"]'); pg.wait_for_timeout(1200)
        for _ in range(12):
            if not attendre_tour(pg): break
            c = pg.query_selector('#main-joueur .carte-main:not([disabled])')
            if not c: break
            c.click(); pg.wait_for_timeout(150)
            case = pg.query_selector('.case.libre.jouable')
            if not case: break
            case.click(); pg.wait_for_timeout(1500)
            if not capture and pg.is_visible('#bulle'):
                pg.screenshot(path='/tmp/bulle-tel.png'); capture = True
        b = pg.evaluate('window.__bulles')
        # une entrée par apparition (le passage hidden→visible et la classe « entre » peuvent doubler) : on dédoublonne
        vus = []
        for x in b:
            if not vus or vus[-1]['t'] != x['t']: vus.append(x)
        total += len(vus)
        ecarts = [vus[i + 1]['occ'] - vus[i]['occ'] for i in range(len(vus) - 1)]
        print(f'graine {graine}: {len(vus)} bulle(s), écarts de poses {ecarts}')
        for x in vus: print('   ·', x['t'][:110])
        ctx.close()
    nav.close()
    print('total', total, '· erreurs :', erreurs[:3] or 'aucune')
