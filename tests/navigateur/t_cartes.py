from playwright.sync_api import sync_playwright
F = 'file:///home/claude/polices/node_modules/@fontsource'
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url({F}/{pkg}/files/{pkg}-latin-{w}-normal.woff2) format('woff2')}}\n"
              for fam, pkg, ws in [('Fraunces','fraunces',(600,900)),('Atkinson Hyperlegible','atkinson-hyperlegible',(400,700)),('JetBrains Mono','jetbrains-mono',(400,700))] for w in ws)
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    for (w, h, nom) in [(390, 844, 'tel'), (1280, 900, 'bureau')]:
        ctx = nav.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2)
        pg = ctx.new_page(); err = []
        pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
        pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
        pg.on('pageerror', lambda e: err.append(str(e)))
        pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
        pg.goto('file:///home/claude/carte2/index.html#cartes'); pg.wait_for_timeout(1500)
        for code in ['Cour des comptes', 'Djadja show']:
            el = pg.query_selector(f'article.recto[aria-label^="Carte action {code}"]')
            if not el: print('introuvable', code); continue
            el.scroll_into_view_if_needed(); pg.wait_for_timeout(600)
            # la carte peut être retournée (dos visible) : on photographie son conteneur
            box = el.evaluate_handle('e => e.closest(".carte") || e.parentElement')
            box.as_element().screenshot(path=f'/tmp/bonus/carte-{code[:4]}-{nom}.png')
            # débordements de texte dans la carte
            dep = el.evaluate('''e => Array.from(e.querySelectorAll("*")).filter(x => x.scrollHeight > x.clientHeight + 2 && getComputedStyle(x).overflow !== "visible").map(x => x.className).slice(0,5)''')
            print(nom, code, 'débordements :', dep or 'aucun')
        print(nom, 'erreurs :', err or 'aucune')
        ctx.close()
    nav.close()
