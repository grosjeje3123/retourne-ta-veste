// Parties complètes : J joue au hasard (cartes action comprises), l'IA joue avec son moteur. On vérifie les invariants.
global.window = {}; require('/home/claude/carte2/donnees.js'); const D = window.APDA;
const M = require('/home/claude/carte2/moteur.js'); M.charger(D.CANDIDATS.map(c => c.valeurs));
const A = M.A, J = M.J, IA = M.IA, NB = D.CANDIDATS.length, NA = D.ACTIONS.length;
let graine = 12345; const alea = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
const melanger = t => { for (let i = t.length - 1; i > 0; i--) { const j = (alea() * (i + 1)) | 0; [t[i], t[j]] = [t[j], t[i]]; } return t; };
const un = t => t[(alea() * t.length) | 0];
const stats = {}; let parties = 0, egalites = 0, proclamees = 0;
function verifier(s, ctx) {
  let n = 0; const vus = new Set();
  for (let i = 0; i < s.N; i++) if (s.own[i] === 0 || s.own[i] === 1) { n++; if (s.crd[i] < 0) throw ctx + ' : case occupée sans carte'; if (vus.has(s.crd[i])) throw ctx + ' : carte en double'; vus.add(s.crd[i]); }
  for (const p of [0, 1]) for (const c of s.mains[p]) { if (vus.has(c)) throw ctx + ' : carte à la fois en main et posée'; vus.add(c); }
  const tot = s.score[0] + s.score[1], cartes = n + s.mains[0].length + s.mains[1].length;
  if (tot !== cartes) throw ctx + ' : score ' + s.score + ' pour ' + cartes + ' cartes';
  let vides = 0; for (let i = 0; i < s.N; i++) if (s.own[i] === -1) vides++;
  if (vides !== s.vides) throw ctx + ' : vides ' + s.vides + ' au lieu de ' + vides;
}
for (let g = 0; g < 600; g++) {
  const grand = g % 2 === 0, cartes = melanger([...Array(NB).keys()]);
  const n = 5, mainJ = cartes.slice(0, n), mainIA = cartes.slice(n, 2 * n), pioche = cartes.slice(2 * n, 2 * n + 6);
  // une nouvelle carte d'un côté au moins, une fois sur deux
  const actJ = g % 2 ? 12 + (g >> 1) % 7 : (alea() * NA) | 0, actIA = g % 3 ? 12 + (g >> 2) % 7 : (alea() * NA) | 0;
  const bancs = grand ? melanger([...Array(16).keys()]).slice(0, 3) : [];
  const s = M.nouvelle({ mainJ, mainIA, pioche, premier: g % 2, taille: grand ? 4 : 3, bancs, actJ, actIA, proche: true, coalition: true, diagonales: g % 3 === 0, ordre: g % 4 < 2 });
  M.debutTour(s, 0);
  let garde = 0;
  while (!s.fin && garde++ < 80) {
    const p = s.trait;
    if (p === J) {
      if (s.act[J] >= 0 && alea() < 0.35) {
        const a = s.act[J], c = M.ciblesAction(s, a);
        if (c.cibles) {
          let arg = null;
          if (a === A.VALLS || a === A.MACRON || a === A.MONTEBOURG) arg = [un(c.cibles[0]), un(c.cibles[1])];
          else if (a === A.BAYROU) arg = null;
          else if (a === A.PRAUD || a === A.BORNE || a === A.GAULLE || a === A.LARCHER || a === A.SARKO || a === A.RUGY || a === A.MONTCHALIN || a === A.ARNAULT) arg = un(c.cibles);
          M.jouerAction(s, a, arg, []); stats['J ' + D.ACTIONS[a].court] = (stats['J ' + D.ACTIONS[a].court] || 0) + 1;
          verifier(s, 'après action ' + a); if (s.fin || s.trait !== J) continue;
        }
      }
      const libres = M.casesVides(s); if (!s.mains[J].length || !libres.length) { s.fin = true; break; }
      M.poser(s, un(s.mains[J]), un(libres), []); verifier(s, 'après pose J'); if (s.show) throw 'show resté actif après la pose';
    } else {
      const niv = g % 4 === 0 ? 'mairie' : 'assemblee';
      const ch = M.choisirAction(s, niv, null, alea);
      if (ch) { const a = s.act[IA]; M.jouerAction(s, a, ch.arg, []); stats['IA ' + D.ACTIONS[a].court] = (stats['IA ' + D.ACTIONS[a].court] || 0) + 1; verifier(s, 'après action IA ' + a); if (s.fin || s.trait !== IA) continue; }
      const c = M.choisirPose(s, niv, null, alea); if (!c) { s.fin = true; break; }
      M.poser(s, c.carte, c.cell, []); verifier(s, 'après pose IA'); if (s.show) throw 'show resté actif après la pose IA';
    }
  }
  if (!s.fin) throw 'partie sans fin ' + g;
  parties++; if (s.score[0] === s.score[1]) { egalites++; if (s.procl >= 0) proclamees++; if (M.gagnant(s) !== (s.procl >= 0 ? s.procl : -1)) throw 'départage faux'; }
}
console.log(parties, 'parties sans écart d’invariant ;', egalites, 'égalités dont', proclamees, 'tranchées par Proclamé');
console.log(Object.entries(stats).filter(([k]) => /Rugy|Bachelot|Copé|Montebourg|Morano|Montchalin|Oudéa/.test(k)).map(([k, v]) => k + ' ' + v).join(' · '));
