"""Fait jouer des combats IA contre IA et affiche le taux de victoire de chaque candidat.

    python3 baston/tests/simulation.py [combats par duel, 80 par défaut]

Il faut Playwright (pip install playwright) et Chrome ou Chromium. Chaque candidat doit rester entre 45 % et 55 %,
aucun combat ne doit rester sans vainqueur. À relancer après tout changement de coups, de défense ou d'objets.
"""
import asyncio, json, os, shutil, sys
from playwright.async_api import async_playwright

PAGE = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'jeu', 'index.html'))
N = int(sys.argv[1]) if len(sys.argv) > 1 else 80
JS = '''(n) => {
  const B = window.__baston, G = B.G, ids = Object.keys(B.CHARS), M = {}, T = []; let bloques = 0;
  for (const a of ids) M[a] = [];
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) { let wa = 0;
    for (let r = 0; r < n; r++) {
      B.startMatch({ players: r % 2 ? [{ch:ids[j],ctrl:'ai'},{ch:ids[i],ctrl:'ai'}] : [{ch:ids[i],ctrl:'ai'},{ch:ids[j],ctrl:'ai'}] });
      let k = 0; while (G.phase !== 'over' && k < 60 * 600) { B.update(); k++; }
      if (!G.winner) { bloques++; continue; } T.push(k / 60); if (G.winner.ch.id === ids[i]) wa++; }
    M[ids[i]].push(100 * wa / n); M[ids[j]].push(100 - 100 * wa / n); }
  T.sort((a, b) => a - b); const victoires = {};
  for (const a of ids) victoires[a] = Math.round(M[a].reduce((x, y) => x + y, 0) / M[a].length);
  return { victoires, dureeMediane: Math.round(T[T.length >> 1]), bloques };
}'''

async def main():
    chrome = shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('chromium-browser')
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=chrome, args=['--no-sandbox'])
        pg = await b.new_page(); erreurs = []
        pg.on('pageerror', lambda e: erreurs.append(str(e)))
        await pg.goto(PAGE); await pg.wait_for_function('() => window.__baston')
        for objets in (False, True):
            await pg.evaluate('(o) => { window.__baston.OPT.items = o; }', objets)
            r = await pg.evaluate(JS, N)
            print('objets' if objets else 'sans objets', json.dumps(r, ensure_ascii=False))
        print('erreurs :', erreurs or 'aucune')
        await b.close()

asyncio.run(main())
