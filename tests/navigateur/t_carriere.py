"""Teste la Carrière : réglages, main, partie, prise ou perte, classeur.
Usage : t_carriere.py largeur hauteur suffixe niveau [cinq]"""
import sys, time, json
from playwright.sync_api import sync_playwright
def choisir_niveau(pg):
    """Solo : après le mode, l'adversaire. On garde le niveau mémorisé (la première manche de Carrière saute cette étape)."""
    pg.wait_for_timeout(250)
    b = pg.query_selector('#niveaux .b-niveau.actuel') or pg.query_selector('#niveaux .b-niveau')
    if b: b.click()

F = 'file:///home/claude/polices/node_modules/@fontsource'
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url({F}/{pkg}/files/{pkg}-latin-{w}-normal.woff2) format('woff2')}}\n"
              for fam, pkg, ws in [('Fraunces','fraunces',(600,900)),('Atkinson Hyperlegible','atkinson-hyperlegible',(400,700)),('JetBrains Mono','jetbrains-mono',(400,700))] for w in ws)
L, H, suf, niveau = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3], sys.argv[4]
cinq = len(sys.argv) > 5 and sys.argv[5] == 'cinq'
O = '/tmp/fete'
erreurs = []
def classeur(pg): return pg.evaluate("JSON.parse(localStorage.getItem('hemicycle-classeur') || 'null')")
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    ctx = nav.new_context(viewport={'width': L, 'height': H}, device_scale_factor=2 if L < 600 else 1)
    pg = ctx.new_page()
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    pg.add_init_script("""try{localStorage.setItem('hemicycle-carriere-ouverte','1');}catch(e){}""")   # la Carrière ouverte d'office : ces tests portent sur elle
    pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
    pg.on('console', lambda m: erreurs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: erreurs.append('pageerror: ' + str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    pg.goto('file:///home/claude/carte2/index.html#cartes')
    pg.evaluate("localStorage.removeItem('hemicycle-classeur'); localStorage.removeItem('hemicycle-options')")
    if cinq:
        pg.evaluate("localStorage.setItem('hemicycle-classeur', JSON.stringify({v:1, cartes:['attal','autain','bardella','baroin','batho'], main:[], gains:0, pertes:0}))")
    pg.goto('about:blank'); pg.goto('file:///home/claude/carte2/index.html#jouer')
    pg.wait_for_timeout(800)
    pg.evaluate("n => localStorage.setItem('hemicycle-options', JSON.stringify({v: 2, niveau: n, actions: false}))", niveau)
    pg.reload(); pg.wait_for_timeout(700)
    pg.screenshot(path=f'{O}/{suf}-0-reglages.png', full_page=False)
    print('tuile deck :', pg.inner_text('#t-deck-sous'))
    pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-carriere'); choisir_niveau(pg)
    pg.wait_for_selector('#b-go-carriere', timeout=8000)
    pg.wait_for_timeout(300)
    pg.screenshot(path=f'{O}/{suf}-1-main.png')
    cl = classeur(pg); print('classeur créé :', len(cl['cartes']), cl['cartes'], '| neuf', cl.get('neuf'))
    print('cartes proposées :', pg.evaluate("document.querySelectorAll('.vivier [data-c]').length"), '| choisies :', pg.evaluate("document.querySelectorAll('.vivier [aria-pressed=true]').length"))
    print('texte :', pg.inner_text('#dialogue').replace('\n', ' | ')[:400])
    # Essai : retirer une carte puis la remettre
    pg.click('.vivier [aria-pressed=true]'); print('après retrait, bouton actif ?', pg.is_enabled('#b-go-carriere'))
    pg.click('#b-plus-fortes'); print('plus fortes, bouton actif ?', pg.is_enabled('#b-go-carriere'))
    pg.click('#b-go-carriere')
    pg.wait_for_timeout(400)
    print('journal :', pg.inner_text('#journal').replace('\n', ' | ')[:300])
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
    print('fin :', fin)
    pg.wait_for_selector('#voile:not([hidden])', timeout=8000)
    pg.wait_for_timeout(500)
    pg.screenshot(path=f'{O}/{suf}-2-fin.png')
    print('dialogue :', pg.inner_text('#dialogue').replace('\n', ' | ')[:500])
    print('boutons du pied actifs :', pg.evaluate("[...document.querySelectorAll('#dialogue .pied button')].map(b => b.id + (b.disabled ? ':off' : ':on')).join(', ')"))
    cl = classeur(pg); print('classeur après la fin :', len(cl['cartes']), '| gains', cl['gains'], 'pertes', cl['pertes'])
    if pg.query_selector('[data-prise]:not([disabled])'):
        pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
        print('Échap pendant la prise : bilan toujours ouvert ?', pg.is_visible('#voile'))
        pg.click('[data-prise]:not([disabled])'); pg.wait_for_timeout(300)
        pg.screenshot(path=f'{O}/{suf}-3-prise.png')
        print('message :', pg.inner_text('#prise-msg'))
        print('boutons du pied actifs :', pg.evaluate("[...document.querySelectorAll('#dialogue .pied button')].map(b => b.id + (b.disabled ? ':off' : ':on')).join(', ')"))
        cl = classeur(pg); print('classeur après la prise :', len(cl['cartes']), '| gains', cl['gains'])
    # Le classeur depuis les réglages
    pg.click('#b-menu-fin') if pg.is_enabled('#b-menu-fin') else None
    pg.wait_for_timeout(300)
    if pg.query_selector('#b-classeur'):
        pg.click('#b-classeur'); pg.wait_for_timeout(300)
        pg.screenshot(path=f'{O}/{suf}-4-classeur.png')
        print('album :', pg.inner_text('#classeur-compte'), '| cartes affichées', pg.evaluate("document.querySelectorAll('.classeur .mc').length"), '| absentes', pg.evaluate("document.querySelectorAll('.classeur .mc.absente').length"))
        pg.click('#b-retour-reglages'); pg.wait_for_timeout(200)
        print('retour aux réglages, Carrière toujours cochée ?', pg.is_checked('input[value="carriere"]'))
    print('largeur doc :', pg.evaluate('document.documentElement.scrollWidth'), '/', L)
    nav.close()
print('Erreurs :', erreurs or 'aucune')
