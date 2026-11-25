// Les quatre cartes action ajoutées à gauche : Poutou, Cahuzac, Thévenoud, Marchais (règles Flèches et classiques).
const M = require('/home/claude/carte2/moteur.js');
const J = M.J, IA = M.IA, A = M.A;
let ok = 0, ko = 0;
function verifier(nom, cond) { if (cond) ok++; else { ko++; console.log('KO', nom); } }
const CARTES = [
  [[5, 5, 5, 5], 0b00000010],   // 0 : →
  [[5, 5, 5, 5], 0],            // 1 : aucune flèche
  [[3, 3, 3, 3], 0b00001000],   // 2 : ←
  [[8, 8, 8, 8], 0b00001010],   // 3 : ← →
  [[2, 2, 2, 2], 0b00001010],   // 4 : ← →
  [[6, 6, 6, 6], 0b00001010],   // 5 : ← →
];
let rang = 0; M.charger(CARTES.map(c => c[0]), () => CARTES[rang++][1]);
function partie(mainJ, mainIA, o) { return M.nouvelle(Object.assign({ mainJ, mainIA, pioche: [], premier: J, taille: 3, bancs: [], fleches: true, alea: () => 0.5 }, o || {})); }
function poserA(s, p, carte, cell) { s.trait = p; s.poses = 1; return M.poser(s, carte, cell, []); }

// Poutou : les protections adverses tombent
let s = partie([0, 1, 1], [1, 1], { actJ: A.POUTOU });
poserA(s, IA, 1, 4); s.prot[4] = 1; s.trait = J;
verifier('Tacle : jouable contre un fauteuil', M.ciblesAction(s, A.POUTOU).cibles);
let e = M.jouerAction(s, A.POUTOU, null, []);
verifier('Tacle : le fauteuil tombe', s.prot[4] === 0 && e[0].t === 'immunite' && e[0].cells.join() === '4');
e = poserA(s, J, 0, 3);
verifier('Tacle : la carte se prend ensuite', s.own[4] === J);
s = partie([0], [1], { actJ: A.POUTOU });
verifier('Tacle : injouable sans protection adverse', !M.ciblesAction(s, A.POUTOU).cibles);
s = partie([0, 1], [1, 1], { actJ: A.POUTOU, ordre: true, premier: J }); s.rep = IA;
verifier('Tacle : le droit de réponse à venir suffit', M.ciblesAction(s, A.POUTOU).cibles);
M.jouerAction(s, A.POUTOU, null, []);
verifier('Tacle : plus de droit de réponse', s.rep === -1);

// Cahuzac : compte en Suisse
s = partie([0, 1, 5], [1, 2], { actJ: A.CAHUZAC });
verifier('Compte caché : cibles = sa main', M.ciblesAction(s, A.CAHUZAC).cibles.join() === '0,1,5');
e = M.jouerAction(s, A.CAHUZAC, 5, []);
verifier('Compte caché : la carte quitte la main, sans pioche le score ne bouge pas', s.suisse[J] === 5 && s.mains[J].join() === '0,1' && s.score.join() === '5,5' && e[0].t === 'suisse');
const sp = partie([0, 1, 5], [1, 2], { actJ: A.CAHUZAC, pioche: [4, 3] }); M.jouerAction(sp, A.CAHUZAC, 5, []);
verifier('Compte caché : une carte piochée la remplace (+1)', sp.mains[J].join() === '0,1,4' && sp.score.join() === '6,5' && sp.pioche.join() === '3');
verifier('Compte caché : une seule fois', !M.ciblesAction(Object.assign(M.cloner(s), { act: [A.CAHUZAC, -1] }), A.CAHUZAC).cibles);
// Révélation adverse : le compte est découvert
const s2 = M.cloner(s); s2.trait = IA; s2.act[IA] = A.PLENEL;
e = M.jouerAction(s2, A.PLENEL, null, []);
verifier('Révélation : la carte en Suisse change de camp', s2.suisse[J] === -1 && s2.score.join() === '4,6' && e.some(x => x.t === 'suisse-revelee' && x.vers === IA));
// Révélation déjà jouée : la carte file directement en face
s = partie([0, 1, 5], [1, 2], { actJ: A.CAHUZAC }); s.revCible = J; s.revT = 99;
e = M.jouerAction(s, A.CAHUZAC, 5, []);
verifier('Compte caché après Révélation : la carte passe en face', s.suisse[J] === -1 && s.score.join() === '4,6');
verifier('Compte caché : pas à son dernier tour', !M.ciblesAction(partie([0], [1], { actJ: A.CAHUZAC }), A.CAHUZAC).cibles);

// Thévenoud : la carte non déclarée ne compte pas pour son camp
s = partie([0, 1, 1], [5, 1, 2], { actJ: A.THEVENOUD, taille: 3 });
M.jouerAction(s, A.THEVENOUD, 5, []);
verifier('Phobie : carte notée', s.oubli === 5 && s.oubliCamp === IA);
let g = 0; while (!s.fin && g++ < 30) { const p = s.trait, m = s.mains[p], v = M.casesVides(s); if (!m.length || !v.length) break; M.poser(s, m[m.length - 1], v[0], []); }
const camp = M.campDe(s, 5);
verifier('Phobie : en fin de partie, la carte compte ou non selon son camp (' + camp + ')', s.fin && (camp === IA ? s.oubliCompte === 1 && s.score[0] + s.score[1] === 9 : !s.oubliCompte && s.score[0] + s.score[1] === 10));
// pris par le joueur : compte pour lui
s = partie([0, 1], [1, 1, 5], { actJ: A.THEVENOUD });
M.jouerAction(s, A.THEVENOUD, 5, []); s.mains[IA] = s.mains[IA].filter(x => x !== 5);
s.own[4] = J; s.crd[4] = 5; s.vides--;  // la carte est passée chez le joueur
M.poser(s, 0, 0, []); s.vides = 0; M.debutTour(s, 0);
verifier('Phobie : passée chez toi, elle compte pour toi', s.fin && !s.oubliCompte);

// Marchais : plus de flèche
s = partie([0, 1], [3, 1], { actJ: A.MARCHAIS });
poserA(s, IA, 3, 4); s.trait = J; s.poses = 1;
verifier('Taisez-vous : cible = carte adverse posée', M.ciblesAction(s, A.MARCHAIS).cibles.join() === '4');
M.jouerAction(s, A.MARCHAIS, 4, []);
e = poserA(s, J, 0, 3);
verifier('Taisez-vous : prise sans combat (plus de flèche en retour)', s.own[4] === J && e.length === 1 && e[0].t === 'base');
s = partie([1, 1], [3, 1], { actJ: A.MARCHAIS });
poserA(s, J, 1, 5); poserA(s, IA, 3, 4); s.trait = J;
// la carte muette n'attaque plus non plus (Contrôle)
M.jouerAction(s, A.MARCHAIS, 4, []);
const ctl = M.cloner(s); ctl.trait = IA; ctl.act[IA] = A.MONTCHALIN; ctl.mains[IA] = [1, 1, 1];
verifier('Taisez-vous : elle n’attaque plus (rien à contrôler)', !M.ciblesAction(ctl, A.MONTCHALIN).cibles);
// classique : -3 partout
s = M.nouvelle({ mainJ: [0, 1], mainIA: [3, 1], pioche: [], premier: IA, taille: 3, bancs: [], actJ: A.MARCHAIS });
poserA(s, IA, 3, 4); s.trait = J; s.poses = 1; M.jouerAction(s, A.MARCHAIS, 4, []);
verifier('Taisez-vous classique : 8 devient 5', M.valeursCase(s, 4).join() === '5,5,5,5');

// L'IA sait les jouer sans planter
global.window = {}; require('/home/claude/carte2/donnees.js'); M.charger(window.APDA.CANDIDATS.map(c => c.valeurs));
let fini = 0;
for (const a of [A.POUTOU, A.CAHUZAC, A.THEVENOUD, A.MARCHAIS]) for (let k = 0; k < 6; k++) {
  const ids = [...Array(43).keys()].sort(() => Math.random() - 0.5);
  const st = M.nouvelle({ mainJ: ids.slice(0, 5), mainIA: ids.slice(5, 10), pioche: ids.slice(10), premier: k % 2, taille: 4, bancs: [0, 5, 10], fleches: k < 3, alea: Math.random, ordre: true, actIA: a, actJ: A.LARCHER });
  let n = 0;
  while (!st.fin && n++ < 40) {
    if (st.trait === IA && st.act[IA] >= 0) { const c = M.choisirAction(st, 'assemblee', null, Math.random); if (c) { M.jouerAction(st, a, c.arg, []); if (st.fin || st.trait !== IA) continue; } }
    const c = st.trait === IA ? M.choisirPose(st, 2, null) : { carte: st.mains[J][0], cell: M.casesVides(st)[0] };
    if (!c || c.carte == null) break; M.poser(st, c.carte, c.cell, []);
  }
  if (st.fin) fini++;
}
verifier('IA : 24 parties terminées avec les quatre cartes (' + fini + ')', fini === 24);
console.log('Cartes de gauche :', ok, 'OK,', ko, 'KO'); process.exit(ko ? 1 : 0);
