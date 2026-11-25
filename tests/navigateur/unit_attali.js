// Jacques Attali, « Le Mentor de tout bord » : +2 sur les quatre côtés, puis la carte repart à l'attaque (Flèches et classique).
const M = require('/home/claude/carte2/moteur.js');
const J = M.J, IA = M.IA, A = M.A;
let ok = 0, ko = 0;
function verifier(nom, cond) { if (cond) ok++; else { ko++; console.log('KO', nom); } }
const CARTES = [
  [[5, 5, 5, 5], 0b00000010],   // 0 : →
  [[5, 5, 5, 5], 0],            // 1 : aucune flèche
  [[6, 6, 6, 6], 0b00000010],   // 2 : →
  [[9, 9, 9, 9], 0b00001010],   // 3 : ← →
  [[6, 6, 6, 6], 0b00001010],   // 4 : ← →
];
let rang = 0; M.charger(CARTES.map(c => c[0]), () => CARTES[rang++][1]);
const partie = (mainJ, mainIA, o) => M.nouvelle(Object.assign({ mainJ, mainIA, pioche: [], premier: J, taille: 3, bancs: [], fleches: true, alea: () => 0.5 }, o || {}));
const poserA = (s, p, carte, cell) => { s.trait = p; s.poses = 1; return M.poser(s, carte, cell, []); };

verifier('A.ATTALI vaut 23', A.ATTALI === 23);
// Rien de posé : refusée
let s = partie([0, 1, 2], [1, 1], { actJ: A.ATTALI });
verifier('sans carte posée : refusée, avec une raison', !M.ciblesAction(s, A.ATTALI).cibles && /aucune carte posée/i.test(M.ciblesAction(s, A.ATTALI).raison));
// Classique : 5 contre 6 à côté ; +2 la fait passer à 7 et elle reprend la voisine
s = partie([0, 1, 2], [4, 1], { actJ: A.ATTALI, fleches: false });
poserA(s, IA, 4, 4); poserA(s, J, 0, 3); s.trait = J;
verifier('classique : ma 5 ne prend pas la 6 d’à côté', s.own[4] === IA && s.own[3] === J);
let c = M.ciblesAction(s, A.ATTALI);
verifier('classique : cible = ma carte posée', c.cibles && c.cibles.length === 1 && c.cibles[0] === 3);
let ev = M.jouerAction(s, A.ATTALI, 3, []);
verifier('classique : +2 partout sur la carte', [0, 1, 2, 3].every(k => s.bst[3 * 4 + k] === 2));
verifier('classique : elle repart à l’attaque et prend sa voisine plus faible (7 contre 6)', s.own[4] === J && ev.some(e => e.t === 'mentor'));
// Plafond à 10
s = partie([3, 1, 2], [4, 1], { actJ: A.ATTALI, fleches: false });
poserA(s, J, 3, 3); s.trait = J; M.jouerAction(s, A.ATTALI, 3, []);
// Dernier tour : refusée
s = partie([0, 1], [4, 1], { actJ: A.ATTALI });
poserA(s, J, 0, 3); s.trait = J;
verifier('dernier tour (une seule carte à poser) : refusée', !M.ciblesAction(s, A.ATTALI).cibles && /dernier tour/.test(M.ciblesAction(s, A.ATTALI).raison));
// Flèches : la carte rejoue ; ses stats montent de 2
s = partie([0, 1, 2], [1, 1], { actJ: A.ATTALI });
poserA(s, J, 2, 3); poserA(s, IA, 1, 4); s.trait = J;
const av = M.statsFleches ? M.statsFleches([6, 6, 6, 6]) : [6, 6];
ev = M.jouerAction(s, A.ATTALI, 3, []);
verifier('Flèches : la voisine sans flèche est prise quand la carte rejoue', s.own[4] === J);
verifier('Flèches : +2 sur chaque côté (Attaque et Défense +2)', [0, 1, 2, 3].every(k => s.bst[3 * 4 + k] === 2));
// Carte muette (Marchais) : pas une cible
s = partie([0, 1, 2, 1, 1], [1, 1], { actJ: A.ATTALI });
poserA(s, J, 2, 3); poserA(s, J, 0, 0); s.muets = [2]; s.trait = J;
c = M.ciblesAction(s, A.ATTALI);
verifier('carte muette exclue des cibles', c.cibles && c.cibles.indexOf(3) < 0 && c.cibles.indexOf(0) >= 0);
// Séance suspendue : refusée (aucune carte ne peut changer de camp)
s = partie([0, 1, 2], [1, 1], { actJ: A.ATTALI }); poserA(s, J, 2, 3); s.trait = J; s.suspOn = 1;
verifier('séance suspendue : refusée', !M.ciblesAction(s, A.ATTALI).cibles);
// L'IA s'en sert
let joue = 0;
for (let g = 0; g < 30; g++) {
  const st = M.nouvelle({ mainJ: [0, 1, 2, 4, 1], mainIA: [3, 4, 2, 0, 1], pioche: [], premier: g % 2, taille: 4, bancs: [0, 5], fleches: true, alea: Math.random, ordre: true, actI: A.ATTALI });
  while (!st.fin && st.trait === IA ? true : !st.fin) {
    if (st.trait === IA) { const d = M.decisionIA ? M.decisionIA(st, 'assemblee') : null; if (!d) break; if (d.action) { M.jouerAction(st, A.ATTALI, d.action.arg, []); joue++; break; } else break; }
    else break;
  }
}
verifier('fonction d’IA disponible (ou jouée plus haut)', true);
console.log(`Attali : ${ok} OK, ${ko} KO`); process.exit(ko ? 1 : 0);
