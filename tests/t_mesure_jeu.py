import sys
from playwright.sync_api import sync_playwright
def choisir_niveau(pg):
    """Solo : après le mode, l'adversaire. On garde le niveau mémorisé (la première manche de Carrière saute cette étape)."""
    pg.wait_for_timeout(250)
    b = pg.query_selector('#niveaux .b-niveau.actuel') or pg.query_selector('#niveaux .b-niveau')
    if b: b.click()

URL = sys.argv[1] if len(sys.argv) > 1 else 'file:///home/claude/apk/assets/index.html'
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    for (w, h) in [(360, 740), (390, 844), (412, 915)]:
        ctx = nav.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2, is_mobile=True, has_touch=True)
        pg = ctx.new_page()
        pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
        pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
        pg.goto(URL + '#jouer'); pg.wait_for_timeout(700)
        pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); choisir_niveau(pg); pg.wait_for_timeout(4200)
        r = pg.evaluate("""() => { const q = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom)]; };
          return { tete: q('.tete-jeu'), campIA: q('.camp-ia'), lieu: q('#lieu-jeu'), tetePlateau: q('.tete-plateau'), plateau: q('#plateau'), legende: q('.legende-cotes'), campJ: q('.camp-joueur'), mainJ: q('#main-joueur'), tapis: q('.tapis') }; }""")
        print(w, 'x', h, r)
        ctx.close()
    nav.close()
