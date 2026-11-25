// Retouches de la campagne d'équilibrage (Flèches seulement ; le classique garde ses valeurs).
global.window = {}; require('/home/claude/carte2/donnees.js'); const D = window.APDA;
const M = require('/home/claude/carte2/moteur.js'); M.charger(D.CANDIDATS.map(c => c.valeurs));
const J = M.J, IA = M.IA, A = M.A; let ok = 0, ko = 0; const v = (n, c) => { if (c) ok++; else { ko++; console.log('KO', n); } };
const partie = (fl, o) => M.nouvelle(Object.assign({ mainJ: [0, 1, 2, 3, 4], mainIA: [5, 6, 7, 8, 9], pioche: [], premier: J, taille: 4, bancs: [], fleches: fl, alea: () => 0.5 }, o));
const poserA = (s, p, c, cell) => { s.trait = p; s.poses = 1; return M.poser(s, c, cell, []); };
for (const fl of [true, false]) {
  const nom = fl ? 'Flèches' : 'classique';
  let s = partie(fl, { actJ: A.BORNE }); poserA(s, IA, 5, 0); s.trait = J; M.jouerAction(s, A.BORNE, 0, []);
  v(nom + ' : 49.3 retire ' + (fl ? 2 : 1), s.own[0] === J && s.bst[0] === (fl ? -2 : -1));
  s = partie(fl, { actJ: A.PRAUD }); M.jouerAction(s, A.PRAUD, null, []); s.trait = J; s.poses = 1; M.poser(s, 0, 5, []);
  v(nom + ' : édito quotidien +' + (fl ? 2 : 1), s.bst[5 * 4] === (fl ? 2 : 1));
  s = partie(fl, { actJ: A.PLENEL }); M.jouerAction(s, A.PLENEL, null, []);
  v(nom + ' : scoop, main adverse visible', M.mainVisible(s, IA, false));
  for (let k = 0; k < 3; k++) { s.trait = IA; M.finTour(s); }
  v(nom + ' : scoop ' + (fl ? 'fini après trois tours adverses' : 'jusqu’à la fin'), M.mainVisible(s, IA, false) === !fl);
  s = partie(fl, { actJ: A.RUGY }); poserA(s, IA, 5, 0); s.trait = J; const sc = s.score[IA]; M.jouerAction(s, A.RUGY, 0, []);
  v(nom + ' : Lassay, le siège se libère', s.own[0] === -1);
  v(nom + ' : Lassay, ' + (fl ? 'la carte quitte la partie' : 'la carte rentre en main et compte'), fl ? (s.score[IA] === sc - 1 && !s.mains[IA].includes(5)) : (s.score[IA] === sc && s.mains[IA].includes(5)));
  s = partie(fl, { actJ: A.OUDEA }); M.jouerAction(s, A.OUDEA, null, []); s.poses = 1; M.poser(s, 0, 5, []);
  v(nom + ' : Djadja +3', s.bst[5 * 4] === 3);
  v(nom + ' : Djadja ' + (fl ? 'indéboulonnable' : 'sans protection'), !!s.prot[5] === fl);
}
console.log(`Équilibrage : ${ok} OK, ${ko} KO`); process.exit(ko ? 1 : 0);
