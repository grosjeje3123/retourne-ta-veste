from playwright.sync_api import sync_playwright
F = 'file:///home/claude/polices/node_modules/@fontsource'
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url({F}/{pkg}/files/{pkg}-latin-{w}-normal.woff2) format('woff2')}}\n"
              for fam, pkg, ws in [('Fraunces','fraunces',(600,900)),('Atkinson Hyperlegible','atkinson-hyperlegible',(400,700)),('JetBrains Mono','jetbrains-mono',(400,700))] for w in ws)
JS = '''() => Array.from(document.querySelectorAll('article.recto[aria-label^="Carte action"]')).map(e => {
  const f = e.getBoundingClientRect(), inf = e.querySelector('.infos'), src = e.querySelector('.sources'), r = inf.getBoundingClientRect();
  const s = src.getBoundingClientRect(), code = e.querySelector('.code').getBoundingClientRect();
  return [e.getAttribute('aria-label').replace('Carte action ', ''), Math.round(s.bottom - r.bottom), Math.round(code.height), Math.round(f.width)];
})'''
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    for (w, h, nom) in [(320, 700, 'petit'), (390, 844, 'tel'), (1280, 900, 'bureau'), (2500, 1300, 'large')]:
        ctx = nav.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1)
        pg = ctx.new_page()
        pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
        pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
        pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
        pg.goto('file:///home/claude/carte2/index.html#cartes'); pg.wait_for_timeout(1500)
        print(nom, '— carte : dépassement des sources sous le cadre (px, >0 = coupé), hauteur du titre')
        for nomc, dep, hc, lw in pg.evaluate(JS): print(f'   {nomc[:42]:44} {dep:5}  titre {hc}px  largeur {lw}')
        ctx.close()
    nav.close()
