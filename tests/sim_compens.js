// Compensations pour le premier joueur (variante en 7e argument : base, show1, plus2, prot, neuf, double, deux1 ;
// R = vraie règle « le second garde une carte », O = prime d'ouverture, RO = les deux).
// Audit d'équilibre : IA contre IA au même niveau, mains à égalité, réglages par défaut du jeu.
// Usage : node sim_audit.js <parties> <niveau> <taille> <actions 0|1> [graine]
global.window = {}; require('/home/claude/carte2/donnees.js'); const D = window.APDA;
const M = require('/home/claude/carte2/moteur.js'); const vals = D.CANDIDATS.map(c => c.valeurs); M.charger(vals);
const V = process.argv[7] || 'base'; const N = +process.argv[2] || 200, niv = process.argv[3] || 'assemblee', taille = +process.argv[4] || 4, avecActions = process.argv[5] !== '0';
let seed = +process.argv[6] || 2027; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const melanger = t => { for (let i = t.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [t[i], t[j]] = [t[j], t[i]]; } return t; };
const tot = c => vals[c].reduce((a, b) => a + b, 0), NA = D.ACTIONS.length;
function miroir(s) {
  const e = M.cloner(s), inv = x => (x === 0 || x === 1 ? 1 - x : x);
  for (let i = 0; i < e.N; i++) { e.own[i] = inv(e.own[i]); e.org[i] = inv(e.org[i]); }
  e.mains = [e.mains[1], e.mains[0]]; e.act = [e.act[1], e.act[0]]; e.score = [e.score[1], e.score[0]]; e.dbl = [e.dbl[1], e.dbl[0]]; e.quota = [e.quota[1], e.quota[0]];
  e.trait = 1 - e.trait; e.susp = inv(e.susp); e.bracCible = inv(e.bracCible); e.revCible = inv(e.revCible); e.vacc = inv(e.vacc); e.procl = inv(e.procl); e.garde = inv(e.garde); e.rep = inv(e.rep); if (e.gel) e.gel = [e.gel[1], e.gel[0]]; if (e.aura) e.aura = [e.aura[1], e.aura[0]];
  return e;
}
function inconnues(vue) { const vus = new Set(vue.mains[1]); for (let i = 0; i < vue.N; i++) if (vue.crd[i] >= 0) vus.add(vue.crd[i]); return [...Array(vals.length).keys()].filter(c => !vus.has(c)); }
function donne() {
  const c = melanger([...Array(vals.length).keys()]), dix = c.slice(0, 10), T = dix.reduce((a, x) => a + tot(x), 0);
  let best = [], bd = Infinity;
  for (let m = 0; m < 1024; m++) { let n = 0, sx = 0; for (let k = 0; k < 10; k++) if (m >> k & 1) { n++; sx += tot(dix[k]); } if (n !== 5 || !(m & 1)) continue; const d = Math.abs(2 * sx - T); if (d < bd) { bd = d; best = [m]; } else if (d === bd) best.push(m); }
  const m = best[(rnd() * best.length) | 0], a = [], b = []; for (let k = 0; k < 10; k++) (m >> k & 1 ? a : b).push(dix[k]);
  return rnd() < .5 ? [a, b, c.slice(10)] : [b, a, c.slice(10)];
}
const quand = {}, nj = {}; const LISTE = process.env.ACTS ? process.env.ACTS.split(',').map(Number) : null; const dist = {}; const siege = [0, 0], prem = { g: 0, n: 0, p: 0 }, parAct = {}, coups = [], jouees = {}; let restes = 0, t0 = Date.now(), ecartScore = 0;
for (let g = 0; g < N; g++) {
  const [m0, m1, pi] = donne(), premier = g % 2;
  const a0 = avecActions ? (LISTE ? LISTE[g % LISTE.length] : g % NA) : null; let a1 = avecActions ? (rnd() * (NA - 1)) | 0 : null; if (avecActions && a1 >= a0) a1++;
  const bancs = taille === 4 ? melanger([...Array(16).keys()]).slice(0, process.env.BANCS ? +process.env.BANCS : /^A/.test(V) ? M.nbBancs(rnd) : 2 + ((rnd() * 5) | 0)) : [];
  // « garde » : le second joueur ne pose que 4 cartes et garde la cinquième en main (elle compte pour lui) ; ici, sa plus faible ou une au hasard
  if (V === 'garde' || V === 'gardeH') { const m = premier === 0 ? m1 : m0; const i = V === 'gardeH' ? (rnd() * 5) | 0 : m.indexOf(m.slice().sort((x, y) => tot(x) - tot(y))[0]); m.splice(i, 1); }
  const s = M.nouvelle({ mainJ: m0, mainIA: m1, pioche: pi.slice(0, 6), actJ: a0, actIA: a1, premier, ordre: /^A/.test(V), garde: /R/.test(V) ? 1 - premier : null, ouverture: /O/.test(V), proche: process.env.PROCHE !== '0', coalition: process.env.COAL !== '0', diagonales: process.env.DIAG !== '0', taille, bancs });
  M.debutTour(s, premier);
  if (V === 'show1' || V === 'deux1') s.show = 1;             // la première carte du premier joueur gagne +1 partout
  if (V === 'double') s.dbl[1 - premier] = 1;                  // le second joueur pose deux cartes d'affilée à son premier tour : le premier a le dernier mot
  let garde = 0, n = 0, nPrem = 0, nSec = 0;
  while (!s.fin && garde++ < 80) {
    if (/S/.test(V) && s.trait !== premier && !nSec) s.show = 1;   // S : la première carte du second joueur gagne +1 partout
    const p = s.trait, vue = p === M.IA ? s : miroir(s);
    if (avecActions && s.act[p] >= 0) {
      const act = M.choisirAction(vue, niv, M.mainVisible(vue, M.J, false) ? null : inconnues(vue), rnd);
      if (act) { const a = s.act[p]; let arg = act.arg; if (p === 0) { quand[a] = (quand[a] || 0) + n; nj[a] = (nj[a] || 0) + 1; } M.jouerAction(s, a, arg, []); jouees[a] = (jouees[a] || 0) + 1; if (s.fin || s.trait !== p) continue; }
    }
    const v2 = p === M.IA ? s : miroir(s), coup = M.choisirPose(v2, niv, M.mainVisible(v2, M.J, false) ? null : inconnues(v2), rnd);
    if (!coup) { s.fin = true; break; }
    M.poser(s, coup.carte, coup.cell, []); n++;
    if (p !== premier) { nSec++; if (nSec === 1 && /P/.test(V)) s.prot[coup.cell] = 1; if (nSec === 2 && V === 'A2') s.prot[coup.cell] = 1; }   // P : la première carte du second joueur ne peut pas être retournée
    if (p === premier) { nPrem++;
      if (nPrem === 1 && V === 'plus2') for (let k = 0; k < 4; k++) s.bst[coup.cell * 4 + k] += 2;
      if (nPrem === 1 && V === 'prot') s.prot[coup.cell] = 1;
      if (nPrem === 1 && V === 'deux1' && !s.fin) { /* +1 aussi sur la deuxième carte : posé au tour suivant */ s.__deux = 1; } }
    if (V === 'deux1' && s.__deux && !s.fin && s.trait === premier && nPrem === 1) s.show = 1;
    if (V === 'silence' && n === 9 && !s.fin) { s.susp = 1 - s.trait; s.suspOn = 1; }   // la dernière carte de la partie ne retourne rien
    if (V === 'neuf' && n === 9) s.fin = true;                 // le second joueur garde sa dernière carte en main
  }
  coups.push(n); restes += s.vides; ecartScore += Math.abs(s.score[0] - s.score[1]);
  const w = M.gagnant(s); if (w >= 0) siege[w]++;
  const dd = s.score[premier] - s.score[1 - premier]; dist[dd] = (dist[dd] || 0) + 1;
  if (w < 0) prem.n++; else if (w === premier) prem.g++; else prem.p++;
  if (avecActions) { const r = parAct[a0] = parAct[a0] || { g: 0, n: 0, p: 0 }; if (w < 0) r.n++; else if (w === 0) r.g++; else r.p++; }
}
const pc = (a, b) => (100 * a / b).toFixed(1) + ' %';
console.log(`[${V}${process.env.BANCS ? ' · ' + process.env.BANCS + ' sièges bloqués' : ''}] ${N} parties · ${niv} · plateau ${taille}×${taille} · actions ${avecActions ? 'oui' : 'non'} · proche ${process.env.PROCHE !== '0'} coalition ${process.env.COAL !== '0'} diagonales ${process.env.DIAG !== '0'} · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
console.log(`contrôle (les deux sièges doivent être proches) : siège 0 ${siege[0]} · siège 1 ${siege[1]}`);
console.log(`premier joueur : gagne ${pc(prem.g, N)} · nul ${pc(prem.n, N)} · perd ${pc(prem.p, N)} · poses/partie ${(coups.reduce((a, b) => a + b, 0) / N).toFixed(1)} · sièges restés vides ${(restes / N).toFixed(1)} · écart de score moyen ${(ecartScore / N).toFixed(1)}`);
console.log('  écart de sièges (premier − second) :', Object.keys(dist).map(Number).sort((a, b) => a - b).map(k => k + ': ' + (100 * dist[k] / N).toFixed(0) + ' %').join(' · '));
if (avecActions) Object.keys(parAct).map(a => ({ a: D.ACTIONS[a].court, r: parAct[a], j: nj[a] || 0, q: nj[a] ? (quand[a] / nj[a]).toFixed(1) : '-' })).sort((x, y) => (y.r.g - y.r.p) / (y.r.g + y.r.n + y.r.p) - (x.r.g - x.r.p) / (x.r.g + x.r.n + x.r.p))
  .forEach(x => { const t = x.r.g + x.r.n + x.r.p; console.log(`  ${x.a.padEnd(15)} gagne ${pc(x.r.g, t).padStart(7)} · perd ${pc(x.r.p, t).padStart(7)} · nul ${pc(x.r.n, t).padStart(7)} · net ${((x.r.g - x.r.p) * 100 / t).toFixed(0).padStart(4)} · jouée ${(100 * x.j / t).toFixed(0)} % après ${x.q} poses (${t} parties)`); });
