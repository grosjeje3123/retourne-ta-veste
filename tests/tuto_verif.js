// Rejoue les trois leçons du tutoriel avec le moteur, telles que jeu.js les scénarise.
global.window = {}; require('/home/claude/carte2/donnees.js'); const C = window.APDA.CANDIDATS;
const M = require('/home/claude/carte2/moteur.js'); M.charger(C.map(c => c.valeurs));
const J = M.J, IA = M.IA, nom = i => C[i].court;
const etat = s => [...s.own].map((o, i) => o < 0 ? '.' : (o === J ? 'J' : 'I')).join('') + ' ' + s.score.join('-');
// Leçon 1
let s = M.nouvelle({ mainJ: [16, 26, 21, 18, 22], mainIA: [23, 24, 27, 25, 19], pioche: [], premier: IA, taille: 3, bancs: [] });
let e = []; M.poser(s, 23, 4, e); console.log('L1 IA', nom(23), etat(s), 'trait', s.trait);
e = []; M.poser(s, 16, 3, e); console.log('L1 J', nom(16), etat(s), e.map(x => x.t).join(','));
e = []; M.poser(s, 24, 5, e); console.log('L1 IA', nom(24), etat(s), e.map(x => x.t).join(','));
e = []; M.poser(s, 26, 1, e); console.log('L1 J', nom(26), etat(s), e.map(x => x.t).join(','), 'fin', s.fin, 'trait', s.trait);
// Leçon 2
s = M.nouvelle({ mainJ: [21, 28, 18, 22, 25], mainIA: [16, 23, 24, 27, 17], pioche: [], premier: J, taille: 3, bancs: [], proche: true, coalition: true });
[[16, 1], [23, 3], [24, 5], [27, 7]].forEach(([c, cell]) => { s.trait = IA; s.poses = 1; M.poser(s, c, cell, []); });
console.log('L2 pré', etat(s), 'trait', s.trait, 'poses', s.poses, 'tour', s.tour, 'mains', s.mains.map(m => m.length));
e = []; M.poser(s, 21, 0, e); console.log('L2 J', nom(21), etat(s), e.map(x => x.t).join(','), 'trait', s.trait);
e = []; M.poser(s, 17, 6, e); console.log('L2 IA', nom(17), etat(s), e.map(x => x.t).join(','));
e = []; M.poser(s, 28, 8, e); console.log('L2 J', nom(28), etat(s), e.map(x => x.t).join(','), 'fin', s.fin);
// Leçon 3
let v = 0, d = 0, n = 0;
for (let k = 0; k < 300; k++) {
  s = M.nouvelle({ mainJ: (process.env.MJ || "24,16,21,26,27").split(",").map(Number), mainIA: (process.env.MI || "20,17,28,23,19").split(",").map(Number), pioche: [], premier: J, taille: 3, bancs: [], proche: true, coalition: true, actJ: 0, actIA: -1, ordre: true });
  e = []; M.poser(s, 24, 4, e);
  if (!k) console.log('L3 J', nom(24), etat(s), e.map(x => x.t).join(','), 'val', [...M.valeursCase(s, 4)]);
  e = []; M.poser(s, 20, 1, e);
  if (!k) console.log('L3 IA', nom(20), etat(s), e.map(x => x.t).join(','), 'cibles 49.3', JSON.stringify(M.ciblesAction(s, 0)));
  e = []; M.jouerAction(s, 0, k % 2 ? 1 : 4, e);
  if (k < 2) console.log('L3 49.3 sur', k % 2 ? 1 : 4, etat(s), e.map(x => x.t).join(','), 'trait', s.trait, 'val', [...M.valeursCase(s, k % 2 ? 1 : 4)]);
  // suite : le joueur joue comme une IA « mairie » (débutant), l'IA aussi
  let g = 0;
  while (!s.fin && g++ < 30) {
    const p = s.trait, c = p === IA ? M.choisirPose(s, 'mairie', null) : (() => { const t = M.cloner(s); /* joueur débutant : au hasard */ const m = s.mains[J], vides = M.casesVides(s); return { carte: m[(Math.random() * m.length) | 0], cell: vides[(Math.random() * vides.length) | 0] }; })();
    if (!c) break; M.poser(s, c.carte, c.cell, []);
  }
  const w = M.gagnant(s); if (w === J) v++; else if (w === IA) d++; else n++;
  if (!k) console.log('L3 fin', etat(s), 'mains', s.mains.map(m => m.length));
}
console.log('L3 joueur au hasard : V', v, 'N', n, 'D', d);
