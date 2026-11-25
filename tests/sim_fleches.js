// Variante « Flèches » : parties IA contre IA, invariants et équilibre premier/second joueur.
global.window = {}; require('/home/claude/carte2/donnees.js'); const C = window.APDA.CANDIDATS;
const M = require('/home/claude/carte2/moteur.js'); const COIN = M.COIN, MODE = +process.env.MODE || 0;
const regles = { 1: v => { const m = (v[0]+v[1]+v[2]+v[3]) / 4; let k = 0; for (let i = 0; i < 4; i++) if (v[i] >= m || v[i] >= 7) k |= 1 << i; for (let i = 4; i < 8; i++) if ((v[COIN[i][0]] + v[COIN[i][1]]) / 2 >= m) k |= 1 << i; return k; },
  2: v => { const m = (v[0]+v[1]+v[2]+v[3]) / 4; let k = 0; for (let i = 0; i < 4; i++) if (v[i] >= m || v[i] >= 6) k |= 1 << i; for (let i = 4; i < 8; i++) if ((v[COIN[i][0]] + v[COIN[i][1]]) / 2 >= Math.min(m, 6)) k |= 1 << i; return k; },
  3: v => { const m = Math.min((v[0]+v[1]+v[2]+v[3]) / 4, 5); let k = 0; for (let i = 0; i < 4; i++) if (v[i] >= m) k |= 1 << i; for (let i = 4; i < 8; i++) if ((v[COIN[i][0]] + v[COIN[i][1]]) / 2 >= m) k |= 1 << i; return k; } };
M.charger(C.map(c => c.valeurs), regles[MODE]);
const N = +process.argv[2] || 200, niv = process.argv[3] || 'assemblee';
const pop = x => { let n = 0; while (x) { n += x & 1; x >>= 1; } return n; };
const h = {}; C.forEach((c, i) => { const n = pop(M.fleches(i)); h[n] = (h[n] || 0) + 1; }); console.log('flèches par carte', JSON.stringify(h));
console.log('chances : 8 contre 4', M.chanceDuel(8, 4).toFixed(2), '· 5 contre 5', M.chanceDuel(5, 5).toFixed(2), '· 10 contre 1', M.chanceDuel(10, 1).toFixed(2), '· 3 contre 9', M.chanceDuel(3, 9).toFixed(2));
function melanger(t) { for (let i = t.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [t[i], t[j]] = [t[j], t[i]]; } return t; }
let sp = 0, hist = Array(10).fill(0); let res = [0, 0, 0], prem = [0, 0, 0], duels = 0, gagnes = 0, combos = 0, prises = 0, t0 = Date.now(), pb = 0;
for (let g = 0; g < N; g++) {
  const ids = melanger(C.map((_, i) => i)), nb = process.env.BANCS ? +process.env.BANCS : (Math.random() * 7) | 0, bancs = melanger([...Array(16).keys()]).slice(0, nb), premier = g % 2;
  const s = M.nouvelle({ mainJ: ids.slice(0, 5), mainIA: ids.slice(5, 10), pioche: [], premier, taille: 4, bancs, fleches: true, alea: Math.random });
  let gd = 0;
  while (!s.fin && gd++ < 40) {
    const p = s.trait;
    // l'IA joue pour les deux camps : on retourne la vue pour le joueur 0
    let c;
    if (p === M.IA) c = M.choisirPose(s, niv, null);
    else { const e = M.cloner(s); e.own = e.own.map(o => o === 0 ? 1 : o === 1 ? 0 : o); e.mains = [e.mains[1], e.mains[0]]; e.score = [e.score[1], e.score[0]]; e.trait = 1; c = M.choisirPose(e, niv, null); }
    if (!c) { pb++; break; }
    const ev = []; M.poser(s, c.carte, c.cell, ev);
    ev.forEach(x => { if (x.t === 'duel') { duels++; if (x.gagne) gagnes++; const pp = M.chanceDuel(x.a, x.d); sp += pp; hist[Math.min(9, (pp * 10) | 0)]++; } if (x.t === 'combo') combos++; if (x.t === 'base') prises += x.cells.length; });
    let sj = s.mains[0].length, si = s.mains[1].length; for (let i = 0; i < s.N; i++) { if (s.own[i] === 0) sj++; if (s.own[i] === 1) si++; }
    if (sj !== s.score[0] || si !== s.score[1] || sj + si !== 10) { pb++; console.log('score incohérent', sj, si, s.score); }
  }
  if (!s.fin || s.mains[0].length || s.mains[1].length) pb++;
  const w = M.gagnant(s); res[w === 0 ? 0 : w === 1 ? 2 : 1]++; prem[w === premier ? 0 : w < 0 ? 1 : 2]++;
}
console.log('chance moyenne des duels joués', (sp / duels).toFixed(2), 'histogramme par dixième', hist.join(' '));
console.log(N, 'parties', niv, '· joueur0 V/N/D', res.join('/'), '· premier joueur V/N/D', prem.join('/'), '· duels/partie', (duels / N).toFixed(1), 'gagnés', Math.round(100 * gagnes / duels) + '%', '· combos/partie', (combos / N).toFixed(1), '· prises sûres/partie', (prises / N).toFixed(1), '· anomalies', pb, '·', ((Date.now() - t0) / N).toFixed(0), 'ms/partie');
