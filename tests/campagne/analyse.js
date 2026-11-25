global.window = {}; require('/home/claude/carte2/donnees.js'); const D = window.APDA;
const M = require('/home/claude/carte2/moteur.js'); M.charger(D.CANDIDATS.map(c => c.valeurs));
const fs = require('fs');
const lire = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
const pct = x => (100 * x).toFixed(1).padStart(5) + ' %';
const ic = (p, n) => (196 * Math.sqrt(p * (1 - p) / n)).toFixed(1);   // demi-intervalle à 95 %, en points
const R = {};
// ---- base
const B = lire('base1.jsonl').concat(lire('base2.jsonl'));
const n = B.length; R.n = n;
const pts = (w, camp) => w === camp ? 1 : w < 0 ? 0.5 : 0;
// Q1 premier joueur
let vp = 0, nul = 0; B.forEach(r => { if (r.w < 0) nul++; else if (r.w === r.premier) vp++; });
const dec = n - nul;
console.log(`\n=== Q1 Premier joueur (${n} parties, IA Assemblée contre IA Assemblée) ===`);
console.log(`ballottages ${pct(nul / n)} · parmi les parties tranchées, le premier gagne ${pct(vp / dec)} (± ${ic(vp / dec, dec)})`);
// Q6 places bloquées
console.log(`\n=== Q6 Places bloquées ===`);
for (let k = 0; k <= 6; k++) {
  const t = B.filter(r => r.nb === k); if (!t.length) continue;
  const nu = t.filter(r => r.w < 0).length, d = t.length - nu, p1 = t.filter(r => r.w >= 0 && r.w === r.premier).length;
  const du = t.reduce((a, r) => a + r.duels, 0) / t.length, ec = t.reduce((a, r) => a + Math.abs(r.sc[0] - r.sc[1]), 0) / t.length;
  console.log(`${k} bloquée(s) · ${String(t.length).padStart(5)} parties · ballottage ${pct(nu / t.length)} · 1er gagne ${pct(p1 / d)} · duels/partie ${du.toFixed(1)} · écart moyen ${ec.toFixed(1)} sièges`);
}
// Q2 cartes
console.log(`\n=== Q2 Cartes candidates : points du camp qui l’a en main (victoire 1, ballottage ½), attendu 50 % ===`);
const C = D.CANDIDATS.map(() => ({ n: 0, p: 0 }));
B.forEach(r => { r.m0.forEach(c => { C[c].n++; C[c].p += pts(r.w, 0); }); r.m1.forEach(c => { C[c].n++; C[c].p += pts(r.w, 1); }); });
const lignesC = C.map((x, i) => ({ i, nom: D.CANDIDATS[i].court || D.CANDIDATS[i].nom, n: x.n, t: x.p / x.n, cote: M.coteFleches(i), fl: M.flechesDe ? M.flechesDe(i) : null, st: M.statsFleches(D.CANDIDATS[i].valeurs) })).sort((a, b) => b.t - a.t);
lignesC.forEach(l => console.log(`${l.nom.padEnd(22)} ${pct(l.t)} (± ${ic(l.t, l.n)}) · ${String(l.n).padStart(5)} mains · cote ${l.cote} · A/D ${l.st}`));
R.cartes = lignesC;
// Q3 cartes action
console.log(`\n=== Q3 Cartes action : points du camp qui la détient, attendu 50 % ; jouée = part des parties où l’IA la joue ===`);
const A = D.ACTIONS.map(() => ({ n: 0, p: 0, j: 0 }));
B.forEach(r => { [[r.a0, 0], [r.a1, 1]].forEach(([a, camp]) => { A[a].n++; A[a].p += pts(r.w, camp); if (r.joue[camp] >= 0) A[a].j++; }); });
const lignesA = A.map((x, i) => ({ i, nom: D.ACTIONS[i].court, n: x.n, t: x.p / x.n, j: x.j / x.n })).sort((a, b) => b.t - a.t);
lignesA.forEach(l => console.log(`${l.nom.padEnd(16)} ${pct(l.t)} (± ${ic(l.t, l.n)}) · jouée ${pct(l.j)} · ${l.n}`));
R.actions = lignesA;
// Q4 dés
const Dd = lire('des1.jsonl');
if (Dd.length) {
  let chg = 0, paires = 0, chgSans = 0, du = 0, su = 0;
  Dd.forEach(r => { for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) { paires++; if (r.w[a] !== r.w[b]) chg++; } if (r.w0 !== r.w[0]) chgSans++; du += r.duels.reduce((a, b) => a + b, 0); su += r.surprises.reduce((a, b) => a + b, 0); });
  console.log(`\n=== Q4 Part du hasard (${Dd.length} donnes rejouées 3 fois avec d’autres dés) ===`);
  console.log(`même donne, mêmes choix, autres dés : le résultat change ${pct(chg / paires)} du temps`);
  console.log(`avec dés contre sans dés (la Cour tranche) : différent ${pct(chgSans / Dd.length)}`);
  console.log(`duels par partie ${(du / Dd.length / 3).toFixed(1)} · duel gagné par le « moins fort » (contre Attaque > Défense) ${pct(su / du)}`);
}
const N2 = lire('niv2.jsonl');
if (N2.length) {
  const f = (k) => { let v = 0, nu = 0; N2.forEach(r => { const w = r[k], fort = r.fort; if (w < 0) nu++; else if (w === fort) v++; }); return [v / (N2.length - nu), nu / N2.length]; };
  const [a, an] = f('w'), [b, bn] = f('wt');
  console.log(`\nAssemblée contre Mairie : le meilleur gagne ${pct(a)} avec dés (ballottage ${pct(an)}), ${pct(b)} sans dés (ballottage ${pct(bn)}) · ${N2.length} donnes`);
}
// Q5 carrière
for (const [f, lib] of [['car_aa.jsonl', 'joueur Assemblée, IA Assemblée'], ['car_ae.jsonl', 'joueur Assemblée, IA Élysée (main +6)'], ['car_ma.jsonl', 'joueur Mairie, IA Assemblée'], ['car_mm.jsonl', 'joueur Mairie, IA Mairie (main −6)']]) {
  const T = lire(f); if (!T.length) continue;
  let v = 0, d = 0, apresD = [0, 0], apres2D = [0, 0], apresV = [0, 0], plancher = 0, decks = [], serie5 = 0;
  T.forEach(c => {
    let pire = 0, cour = 0;
    c.hist.forEach((h, m) => {
      if (h[0] === 0) v++; else if (h[0] === 1) d++;
      const prec = m > 0 ? c.hist[m - 1][0] : null, prec2 = m > 1 ? c.hist[m - 2][0] : null;
      if (h[0] >= 0) {
        if (prec === 1) { apresD[0]++; if (h[0] === 0) apresD[1]++; }
        if (prec === 0) { apresV[0]++; if (h[0] === 0) apresV[1]++; }
        if (prec === 1 && prec2 === 1) { apres2D[0]++; if (h[0] === 0) apres2D[1]++; }
      }
      if (h[0] === 1) { cour++; pire = Math.max(pire, cour); } else if (h[0] === 0) cour = 0;
      if (h[1] <= 5) plancher++;
    });
    if (pire >= 5) serie5++;
    decks.push(c.hist.map(h => h[1]));
  });
  const moy = k => (decks.reduce((a, t) => a + t[Math.min(k, t.length - 1)], 0) / decks.length).toFixed(1);
  console.log(`\n=== Q5 Carrière : ${lib} · ${T.length} carrières de ${T[0].hist.length} manches ===`);
  console.log(`victoires ${pct(v / (v + d))} · après une défaite ${pct(apresD[1] / apresD[0])} · après deux défaites ${pct(apres2D[1] / apres2D[0])} · après une victoire ${pct(apresV[1] / apresV[0])}`);
  console.log(`deck moyen : départ 8 → manche 5 ${moy(4)} → 10 ${moy(9)} → 20 ${moy(19)} → 30 ${moy(29)} · temps passé au plancher (5 cartes) ${pct(plancher / (T.length * T[0].hist.length))} · carrières avec une série de 5 défaites ${pct(serie5 / T.length)}`);
}
fs.writeFileSync('resume.json', JSON.stringify(R));
