"""Joue une partie rapide puis photographie la fête de fin de partie.
Usage : t_fete.py largeur hauteur suffixe [passer]"""
import sys, time
from playwright.sync_api import sync_playwright
F = 'file:///home/claude/polices/node_modules/@fontsource'
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url({F}/{pkg}/files/{pkg}-latin-{w}-normal.woff2) format('woff2')}}\n"
              for fam, pkg, ws in [('Fraunces','fraunces',(600,900)),('Atkinson Hyperlegible','atkinson-hyperlegible',(400,700)),('JetBrains Mono','jetbrains-mono',(400,700))] for w in ws)
L = int(sys.argv[1]); H = int(sys.argv[2]); suf = sys.argv[3]; passer = len(sys.argv) > 4 and sys.argv[4] == 'passer'
erreurs = []
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    ctx = nav.new_context(viewport={'width': L, 'height': H}, device_scale_factor=2 if L < 600 else 1)
    pg = ctx.new_page()
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
    pg.on('console', lambda m: erreurs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: erreurs.append('pageerror: ' + str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    pg.goto('file:///home/claude/carte2/index.html#jouer')
    pg.wait_for_timeout(700)
    pg.click('input[name="actions"]')   # sans carte action, pour aller vite
    pg.click('#form-regles button[type="submit"]')
    t0 = time.time(); fin = None
    while time.time() - t0 < 120:
        txt = pg.inner_text('#perchoir-texte')
        if txt in ('Partie gagnée.', 'Partie perdue.', 'Égalité.'):
            fin = txt; break
        if txt.startswith('À toi'):
            c = pg.query_selector('#main-joueur .carte-main:not([disabled])')
            if c:
                c.click(); pg.wait_for_timeout(120)
                k = pg.query_selector('.case.libre.jouable')
                if k: k.click(); pg.wait_for_timeout(500); continue
        pg.wait_for_timeout(150)
    tf = time.time()
    print('fin :', fin, 'après', round(tf - t0, 1), 's')
    if passer:
        pg.wait_for_timeout(700)
        pg.mouse.click(L // 2, 40)
        pg.wait_for_timeout(250)
        print('passer : bilan ouvert ?', pg.is_visible('#voile'), '| fête en sortie ?', pg.evaluate("document.getElementById('fete').classList.contains('fin')"))
    else:
        for ms in (500, 1100, 1700, 2500):
            pg.wait_for_timeout(max(0, int(ms - (time.time() - tf) * 1000)))
            pg.screenshot(path=f'/tmp/fete/{suf}-{ms}.png')
        print('têtes :', pg.evaluate("document.querySelectorAll('#fete .tete').length"), '| confettis :', pg.evaluate("document.querySelectorAll('#fete .cf').length"))
        pg.wait_for_timeout(max(0, int(3600 - (time.time() - tf) * 1000)))
        print('bilan ouvert à 3,6 s ?', pg.is_visible('#voile'))
        pg.screenshot(path=f'/tmp/fete/{suf}-3600.png')
        pg.wait_for_timeout(3000)
        print('fête nettoyée à 6,6 s ?', pg.evaluate("document.getElementById('fete').hidden"), pg.evaluate("document.getElementById('fete').innerHTML.length"))
        pg.click('#b-revanche, #b-second')
        pg.wait_for_timeout(400)
        print('après revanche, fête cachée ?', pg.evaluate("document.getElementById('fete').hidden"))
    nav.close()
print('Erreurs :', erreurs or 'aucune')
