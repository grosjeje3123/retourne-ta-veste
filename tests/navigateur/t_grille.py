import sys
from playwright.sync_api import sync_playwright
from PIL import Image
F = 'file:///home/claude/polices/node_modules/@fontsource'
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url({F}/{pkg}/files/{pkg}-latin-{w}-normal.woff2) format('woff2')}}\n"
              for fam, pkg, ws in [('Fraunces','fraunces',(600,900)),('Atkinson Hyperlegible','atkinson-hyperlegible',(400,700)),('JetBrains Mono','jetbrains-mono',(400,700))] for w in ws)
codes = sys.argv[1].split('|')
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    ctx = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
    pg = ctx.new_page()
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    pg.goto('file:///home/claude/carte2/index.html#cartes'); pg.wait_for_timeout(1500)
    pg.evaluate("() => { for (const e of document.querySelectorAll('a,button')) if (/Jouer/.test(e.textContent) && getComputedStyle(e).position === 'fixed') e.style.display = 'none'; }")
    ims = []
    for k, code in enumerate(codes):
        el = pg.query_selector(f'article.recto[aria-label^="Carte action {code}"]')
        el.scroll_into_view_if_needed(); pg.wait_for_timeout(300)
        el.screenshot(path=f'/tmp/bonus/g{k}.png'); ims.append(Image.open(f'/tmp/bonus/g{k}.png'))
    W = sum(i.width for i in ims) + 10 * len(ims); H = max(i.height for i in ims)
    out = Image.new('RGB', (W, H), (255, 255, 255)); x = 0
    for i in ims: out.paste(i, (x, 0)); x += i.width + 10
    out.save('/tmp/bonus/grille.png'); print(out.size)
    nav.close()
