"""Ordre de jeu équilibré : annonce au tirage, 9 poses, carte gardée par le second, droit de réponse (grand), prime d'ouverture (petit)."""
import json
from playwright.sync_api import sync_playwright
def choisir_niveau(pg):
    """Solo : après le mode, l'adversaire. On garde le niveau mémorisé (la première manche de Carrière saute cette étape)."""
    pg.wait_for_timeout(250)
    b = pg.query_selector('#niveaux .b-niveau.actuel') or pg.query_selector('#niveaux .b-niveau')
    if b: b.click()

F = 'file:///home/claude/polices/node_modules/@fontsource'
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url({F}/{pkg}/files/{pkg}-latin-{w}-normal.woff2) format('woff2')}}\n"
              for fam, pkg, ws in [('Fraunces','fraunces',(600,900)),('Atkinson Hyperlegible','atkinson-hyperlegible',(400,700)),('JetBrains Mono','jetbrains-mono',(400,700))] for w in ws)
URL = 'file:///home/claude/carte2/index.html'
ESPION = """(function(){ var v; Object.defineProperty(window, 'HemicycleMoteur', { configurable: true, get: function(){ return v; }, set: function(m){ var n = m.nouvelle; m.nouvelle = function(o){ var s = n(o); window.__s = s; window.__o = o; return s; }; v = m; } }); })();"""
def attendre_tour(pg):
    for _ in range(140):
        if pg.query_selector('#voile:not([hidden]) #b-revanche, #voile:not([hidden]) #b-second'): return False
        t = pg.inner_text('#perchoir-texte')
        if pg.query_selector('#main-joueur .carte-main:not([disabled])') and not t.startswith('L’IA') and pg.is_hidden('#tirage'): return True
        pg.wait_for_timeout(250)
    return False
err = []
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    for plateau, graine in (('grand', 3), ('grand', 4), ('grand', 6), ('classique', 3), ('classique', 4), ('classique', 6)):
        ctx = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        pg = ctx.new_page(); pg.on('pageerror', lambda e: err.append(str(e)))
        pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
        pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
        pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
        pg.add_init_script(ESPION + "window.__graine = %d; Math.random = (function(){ var s = window.__graine; return function(){ s = (s * 16807) %% 2147483647; return (s - 1) / 2147483646; }; })();" % graine)
        pg.goto(URL + '#jouer'); pg.wait_for_timeout(500)
        pg.evaluate("p => localStorage.setItem('hemicycle-options', JSON.stringify({ v: 2, plateau: p, actions: false }))", plateau)
        pg.reload(); pg.wait_for_timeout(600)
        pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); choisir_niveau(pg)
        try: pg.wait_for_function("document.getElementById('tirage-regle').textContent.length > 5", timeout=15000)
        except Exception: print('  (annonce non vue)', err, pg.inner_text('#perchoir-texte'), pg.is_visible('#accueil'), pg.is_visible('#voile')); ctx.close(); continue
        annonce = pg.inner_text('#tirage-resultat') + ' — ' + pg.inner_text('#tirage-regle')
        if graine == 3: pg.screenshot(path=f'/tmp/ordre-tirage-{plateau}.png')
        messages = []; poses = 0
        for _ in range(8):
            if not attendre_tour(pg): break
            m = pg.inner_text('#perchoir-texte')
            if m not in messages: messages.append(m)
            if poses == 0 and graine in (3, 4): pg.screenshot(path=f'/tmp/ordre-debut-{plateau}-{graine}.png')
            c = pg.query_selector('#main-joueur .carte-main:not([disabled])'); c.click(); pg.wait_for_timeout(120)
            k = pg.query_selector('.case.libre.jouable')
            if not k: break
            k.click(); poses += 1; pg.wait_for_timeout(1100)
        for _ in range(40):
            if pg.query_selector('#voile:not([hidden]) #b-revanche, #voile:not([hidden]) #b-second'): break
            pg.wait_for_timeout(250)
        e = pg.evaluate("""() => { const s = window.__s, o = window.__o; let pos = 0, prot = [], bst = 0;
          for (let i = 0; i < s.N; i++) { if (s.own[i] === 0 || s.own[i] === 1) pos++; if (s.prot[i]) prot.push(s.org[i]); for (let k = 0; k < 4; k++) bst += s.bst[i * 4 + k]; }
          return { premier: o.premier, bancs: o.bancs.length, posees: pos, mains: [s.mains[0].length, s.mains[1].length], prot, bst, fin: s.fin, score: s.score.join('-'), garde: s.garde }; }""")
        second = 1 - e['premier']
        ok = e['fin'] and e['posees'] == 9 and e['mains'][second] == 1 and e['mains'][e['premier']] == 0 and (e['prot'] == [second] if plateau == 'grand' else (e['bst'] == 4 and e['prot'] == []))
        print(f"{plateau}/{graine} : {'OK ' if ok else 'ÉCHEC '}{annonce}\n     {json.dumps(e)} · mes poses {poses}\n     messages : {messages[:4]}")
        if graine == 3: pg.screenshot(path=f'/tmp/ordre-fin-{plateau}.png')
        ctx.close()
    nav.close()
print('erreurs :', err or 'aucune')
