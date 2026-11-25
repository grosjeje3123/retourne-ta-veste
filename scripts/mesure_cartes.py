import sys
from playwright.sync_api import sync_playwright
F = 'file:///home/claude/polices/node_modules/@fontsource'
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url({F}/{pkg}/files/{pkg}-latin-{w}-normal.woff2) format('woff2')}}\n"
              for fam, pkg, ws in [('Fraunces','fraunces',(600,900)),('Atkinson Hyperlegible','atkinson-hyperlegible',(400,700)),('JetBrains Mono','jetbrains-mono',(400,700))] for w in ws)
page_html = sys.argv[1]; sortie = sys.argv[2]
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--allow-file-access-from-files'])
    pg = nav.new_page(viewport={'width': 1200, 'height': 900}, device_scale_factor=2)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    pg.goto('file://' + page_html)
    # Les portraits sont en chargement différé : on force le chargement avant les captures
    pg.evaluate("() => document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager')")
    pg.wait_for_function("() => Array.from(document.images).every(i => i.complete)", timeout=60000)
    pg.wait_for_timeout(600)
    infos = pg.evaluate("""() => Array.from(document.querySelectorAll('.retournable .recto')).map(r => {
      const i = r.querySelector('.infos');
      return [r.querySelector('h3').textContent, i.scrollHeight, i.clientHeight];
    })""")
    for nom, sh, ch in infos:
        print(f"{nom:24s} contenu {sh:4d}px / place {ch:4d}px {'DÉBORDE' if sh > ch + 1 else 'ok'}")
    nav.close()
