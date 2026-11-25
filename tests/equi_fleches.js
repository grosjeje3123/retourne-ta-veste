// Équilibrage des Flèches : IA contre IA, les deux camps au même niveau, mains tirées au hasard ou à cote égale.
// node equi_fleches.js N niveau [options]   · env : ORDRE=garde|… COTE=1 BANCS=n EGAL=att
global.window = {}; require('/home/claude/carte2/donnees.js'); const C = window.APDA.CANDIDATS;
const M = require('/home/claude/carte2/moteur.js'); M.charger(C.map(c => c.valeurs));
const N = +process.argv[2] || 200, niv = isNaN(+process.argv[3]) ? (process.argv[3] || 'assemblee') : +process.argv[3], niv0 = process.env.NIV0 ? (isNaN(+process.env.NIV0) ? process.env.NIV0 : +process.env.NIV0) : niv;
const opt = JSON.parse(process.env.OPT || '{}');
function melanger(t) { for (let i = t.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [t[i], t[j]] = [t[j], t[i]]; } return t; }
function retourne(s) { const e = M.cloner(s); e.own = e.own.map(o => o === 0 ? 1 : o === 1 ? 0 : o); e.mains = [e.mains[1], e.mains[0]]; e.score = [e.score[1], e.score[0]]; e.trait = 1; if (e.garde >= 0) e.garde = 1 - e.garde; if (e.rep >= 0) e.rep = 1 - e.rep; if (e.bou != null && e.bou >= 0) e.bou = 1 - e.bou; return e; }
let favo = [0, 0, 0], nfav = 0, dcote = 0; let prem = [0, 0, 0], j0 = [0, 0, 0], duels = 0, gagnes = 0, combos = 0, prises = 0, ecart = 0, t0 = Date.now(), stats = C.map(() => [0, 0, 0]);
for (let g = 0; g < N; g++) {
  let mj, mi;
  if (process.env.COTE) { const d = M.donneFleches(Math.random); mj = d[0]; mi = d[1]; }
  else { const ids = melanger(C.map((_, i) => i)); mj = ids.slice(0, 5); mi = ids.slice(5, 10); }
  const nb = process.env.BANCS ? +process.env.BANCS : (Math.random() * 7) | 0, bancs = melanger([...Array(16).keys()]).slice(0, nb), premier = g % 2;
  const extra = {}; if (process.env.GARDE) extra.garde = 1 - premier; if (process.env.REP === 'premier') extra.reponse = premier; if (process.env.REP === 'second') extra.reponse = 1 - premier;
  const s = M.nouvelle(Object.assign({ mainJ: mj, mainIA: mi, pioche: [], premier, taille: 4, bancs, fleches: true, alea: Math.random }, extra, opt));
  let gd = 0;
  while (!s.fin && gd++ < 40) {
    const c = s.trait === M.IA ? M.choisirPose(s, niv, null) : M.choisirPose(retourne(s), niv0, null);
    if (!c) { console.log('pas de coup'); break; }
    const ev = []; M.poser(s, c.carte, c.cell, ev);
    ev.forEach(x => { if (x.t === 'duel') { duels++; if (x.gagne) gagnes++; } if (x.t === 'combo') combos++; if (x.t === 'base') prises += x.cells.length; });
  }
  const cj = mj.reduce((x, c) => x + M.coteFleches(c), 0), ci = mi.reduce((x, c) => x + M.coteFleches(c), 0); dcote += Math.abs(cj - ci);
  if (cj !== ci) { const fav = cj > ci ? 0 : 1, w0 = M.gagnant(s); favo[w0 === fav ? 0 : w0 < 0 ? 1 : 2]++; nfav++; }
  const w = M.gagnant(s); prem[w === premier ? 0 : w < 0 ? 1 : 2]++; j0[w === 0 ? 0 : w < 0 ? 1 : 2]++; ecart += Math.abs(s.score[0] - s.score[1]);
  mj.forEach(c => stats[c][w === 0 ? 0 : w < 0 ? 1 : 2]++); mi.forEach(c => stats[c][w === 1 ? 0 : w < 0 ? 1 : 2]++);
}
const pc = t => t.map(x => Math.round(100 * x / N) + '%').join('/');
console.log(`${N} parties niv ${niv}${niv0 !== niv ? ' (joueur0 : ' + niv0 + ')' : ''} ${JSON.stringify(opt)} · premier V/N/D ${pc(prem)} · joueur0 V/N/D ${pc(j0)} · duels ${(duels / N).toFixed(1)} (gagnés ${Math.round(100 * gagnes / Math.max(1, duels))}%) combos ${(combos / N).toFixed(1)} prises ${(prises / N).toFixed(1)} écart ${(ecart / N).toFixed(1)} · ${((Date.now() - t0) / N).toFixed(0)} ms/partie`);
console.log(`   écart moyen de cote ${(dcote / N).toFixed(1)} · la main la mieux cotée V/N/D ${favo.map(x => Math.round(100 * x / Math.max(1, nfav)) + '%').join('/')} (sur ${nfav} parties inégales)`);
if (process.env.CARTES) { require('fs').writeFileSync(process.env.CARTES, JSON.stringify(stats)); }
