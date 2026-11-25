"""Vérifie que les chiffres posés sur les bords ne chevauchent rien : grandes cartes de la collection et petites cartes du jeu."""
import json
from playwright.sync_api import sync_playwright
F = 'file:///home/claude/polices/node_modules/@fontsource'
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url({F}/{pkg}/files/{pkg}-latin-{w}-normal.woff2) format('woff2')}}\n"
              for fam, pkg, ws in [('Fraunces','fraunces',(600,900)),('Atkinson Hyperlegible','atkinson-hyperlegible',(400,700)),('JetBrains Mono','jetbrains-mono',(400,700))] for w in ws)
JS_GRANDES = """() => {
  const r = el => { if (!el || !el.textContent.trim() && !el.querySelector('svg')) return null; const b = el.getBoundingClientRect(); return b.width ? b : null; };
  const touche = (a, b) => a && b && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
  const pb = [];
  document.querySelectorAll('#vue-cartes .face.candidat').forEach(f => {
    const nom = f.getAttribute('aria-label'), q = s => r(f.querySelector(s));
    const P = { h: q('.cote-h'), d: q('.cote-d'), b: q('.cote-b'), g: q('.cote-g') };
    const autres = { axe: q('.axe'), bloc: q('.haut .bloc'), etiquette: q('.etiquette'), ia: q('.mention-ia'), tampon: q('.tampon') };
    const carte = f.getBoundingClientRect();
    for (const [k, p] of Object.entries(P)) {
      if (!p) { pb.push(nom + ' : pas de chiffre ' + k); continue; }
      if (p.left < carte.left || p.right > carte.right || p.top < carte.top || p.bottom > carte.bottom) pb.push(nom + ' : chiffre ' + k + ' hors de la carte');
      for (const [n, o] of Object.entries(autres)) if (touche(p, o)) pb.push(nom + ' : chiffre ' + k + ' sur ' + n);
      for (const [k2, p2] of Object.entries(P)) if (k2 > k && touche(p, p2)) pb.push(nom + ' : chiffres ' + k + ' et ' + k2);
    }
  });
  return { n: document.querySelectorAll('#vue-cartes .face.candidat').length, pb };
}"""
JS_PETITES = """() => {
  const touche = (a, b) => a && b && a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
  const pb = []; let n = 0;
  document.querySelectorAll('#vue-jeu .mc:not(.dos-mini)').forEach(mc => {
    n++;
    const nom = (mc.querySelector('.mn') || {}).textContent, R = s => [...mc.querySelectorAll(s)].map(e => e.getBoundingClientRect());
    const P = R('.mv b'), autres = R('.etoiles').concat(R('.badge')).concat(R('.mn')), carte = mc.getBoundingClientRect();
    P.forEach((p, i) => {
      if (p.left < carte.left || p.right > carte.right) pb.push(nom + ' : chiffre ' + i + ' déborde');
      autres.forEach((o, j) => { if (touche(p, o)) pb.push(nom + ' : chiffre ' + i + ' sur un élément ' + j); });
      P.forEach((q, j) => { if (j > i && touche(p, q)) pb.push(nom + ' : chiffres ' + i + ' et ' + j); });
    });
  });
  return { n, pb };
}"""
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    for L, H in ((1200, 900), (390, 844)):
        pg = nav.new_page(viewport={'width': L, 'height': H})
        pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
        pg.add_init_script("""try{var o=JSON.parse(localStorage.getItem('hemicycle-options')||'{}');if(!o.regles){o.regles='classique';localStorage.setItem('hemicycle-options',JSON.stringify(o));}}catch(e){}""")   # ces tests portent sur les regles classiques
        pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
        pg.goto('file:///home/claude/carte2/index.html#cartes'); pg.wait_for_timeout(1200)
        g = pg.evaluate(JS_GRANDES)
        print(f'{L}px, grandes cartes : {g["n"]} | problèmes : {g["pb"][:8] or "aucun"}')
        pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(700)
        pg.click('#t-deck')   # Mon deck : l'album montre toutes les petites cartes
        pg.wait_for_selector('.classeur', timeout=8000); pg.wait_for_timeout(400)
        v = pg.evaluate(JS_PETITES.replace('#vue-jeu .mc', '#dialogue .mc'))
        print(f'{L}px, petites cartes (album) : {v["n"]} | problèmes : {v["pb"][:8] or "aucun"}')
        if L == 390: pg.screenshot(path='/tmp/fete/album-mobile.png')
        pg.close()
    nav.close()
