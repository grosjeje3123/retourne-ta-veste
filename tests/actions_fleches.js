// Cartes action en Flèches : le joueur 0 a la carte étudiée, le joueur 1 une autre au hasard ; mains de même cote, ordre de jeu compensé.
// node actions_fleches.js <parties par carte> [profondeur des poses=3] [cartes : 0,4,9]   → net = victoires − défaites du porteur
global.window = {}; require('/home/claude/carte2/donnees.js'); const D = window.APDA;
const M = require('/home/claude/carte2/moteur.js'); M.charger(D.CANDIDATS.map(c => c.valeurs));

const N = +process.argv[2] || 100, prof = +process.argv[3] || 3, NA = D.ACTIONS.length;
const LISTE = process.argv[4] ? process.argv[4].split(',').map(Number) : [...Array(NA).keys()];
let seed = +process.env.GRAINE || 2027; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const melanger = t => { for (let i = t.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [t[i], t[j]] = [t[j], t[i]]; } return t; };
function miroir(s) {
  const e = M.cloner(s), inv = x => (x === 0 || x === 1 ? 1 - x : x), sw = t => t ? [t[1], t[0]] : t;
  for (let i = 0; i < e.N; i++) { e.own[i] = inv(e.own[i]); e.org[i] = inv(e.org[i]); }
  e.mains = sw(e.mains); e.act = sw(e.act); e.score = sw(e.score); e.dbl = sw(e.dbl); e.quota = sw(e.quota); e.gel = sw(e.gel); e.aura = sw(e.aura);
  e.trait = 1 - e.trait; e.susp = inv(e.susp); e.bracCible = inv(e.bracCible); e.revCible = inv(e.revCible); e.vacc = inv(e.vacc); e.procl = inv(e.procl); e.garde = inv(e.garde); e.rep = inv(e.rep);
  return e;
}
function inconnues(vue) { const vus = new Set(vue.mains[1]); for (let i = 0; i < vue.N; i++) if (vue.crd[i] >= 0) vus.add(vue.crd[i]); return [...Array(D.CANDIDATS.length).keys()].filter(c => !vus.has(c)); }
const t0 = Date.now(), res = {};
LISTE.forEach(a0 => {
  const r = res[a0] = { g: 0, n: 0, p: 0, jouee: 0, quand: 0 };
  for (let g = 0; g < N; g++) {
    const [m0, m1, pi] = M.donneFleches(rnd), premier = g % 2;
    let a1 = (rnd() * (NA - 1)) | 0; if (a1 >= a0) a1++;
    const s = M.nouvelle({ mainJ: m0, mainIA: m1, pioche: pi.slice(0, 6), actJ: a0, actIA: a1, premier, taille: 4, bancs: melanger([...Array(16).keys()]).slice(0, (rnd() * 7) | 0), fleches: true, alea: rnd, ordre: true });
    let garde = 0, n = 0;
    while (!s.fin && garde++ < 80) {
      const p = s.trait;
      if (s.act[p] >= 0) {
        const vue = p === M.IA ? s : miroir(s);
        const act = M.choisirAction(vue, 'assemblee', M.mainVisible(vue, M.J, false) ? null : inconnues(vue), rnd);
        if (act) { const a = s.act[p]; if (p === 0) { r.jouee++; r.quand += n; } M.jouerAction(s, a, act.arg, []); if (s.fin || s.trait !== p) continue; }
      }
      const v2 = p === M.IA ? s : miroir(s), coup = M.choisirPose(v2, prof, M.mainVisible(v2, M.J, false) ? null : inconnues(v2), rnd);
      if (!coup) { s.fin = true; break; }
      M.poser(s, coup.carte, coup.cell, []); n++;
    }
    const w = M.gagnant(s); if (w < 0) r.n++; else if (w === 0) r.g++; else r.p++;
  }
  const t = r.g + r.n + r.p;
  console.log(`${D.ACTIONS[a0].court.padEnd(14)} gagne ${(100 * r.g / t).toFixed(0).padStart(3)} % · nul ${(100 * r.n / t).toFixed(0).padStart(3)} % · perd ${(100 * r.p / t).toFixed(0).padStart(3)} % · net ${(100 * (r.g - r.p) / t).toFixed(0).padStart(4)} · jouée ${(100 * r.jouee / t).toFixed(0)} % des parties, après ${r.jouee ? (r.quand / r.jouee).toFixed(1) : '-'} poses`);
});
console.log(`${((Date.now() - t0) / (N * LISTE.length)).toFixed(0)} ms/partie`);
