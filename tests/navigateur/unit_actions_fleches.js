// Cartes action, règles Flèches : effets sur des cartes fabriquées (flèches imposées).
const M = require('/home/claude/carte2/moteur.js');
const J = M.J, IA = M.IA, A = M.A;
let ok = 0, ko = 0;
function verifier(nom, cond) { if (cond) ok++; else { ko++; console.log('KO', nom); } }
// bits 0 ↑, 1 →, 2 ↓, 3 ←, 4 ↗, 5 ↘, 6 ↙, 7 ↖
const CARTES = [
  [[5, 5, 5, 5], 0b00000010],   // 0 : → (A5 D5)
  [[5, 5, 5, 5], 0],            // 1 : aucune flèche
  [[3, 3, 3, 3], 0b00001000],   // 2 : ← (A3 D3)
  [[8, 8, 8, 8], 0b00001010],   // 3 : ← → (A8 D8)
  [[2, 2, 2, 2], 0b00001010],   // 4 : ← → (A2 D2)
  [[5, 5, 5, 5], 0b00000010],   // 5 : →
  [[5, 5, 5, 5], 0b00001000],   // 6 : ←
];
let rang = 0; M.charger(CARTES.map(c => c[0]), () => CARTES[rang++][1]);
function partie(mainJ, mainIA, o) { return M.nouvelle(Object.assign({ mainJ, mainIA, pioche: [], premier: IA, taille: 3, bancs: [], fleches: true, alea: () => 0.5 }, o || {})); }
function poserA(s, p, carte, cell) { s.trait = p; s.poses = 1; return M.poser(s, carte, cell, []); }

// Le Patron (Arnault) : la carte adverse rachetée quitte la partie, son siège devient un obstacle
let s = partie([1, 5], [1, 6], { actJ: A.ARNAULT }); poserA(s, IA, 1, 4); s.trait = J;
let c = M.ciblesAction(s, A.ARNAULT);
verifier('Rachat : cible = cartes adverses posées', c.cibles && c.cibles.join() === '4');
let e = M.jouerAction(s, A.ARNAULT, 4, []);
verifier('Rachat : la carte sort, le siège est bloqué, 9 cartes en jeu', s.own[4] === M.BANC && s.crd[4] === -1 && s.score[J] === 5 && s.score[IA] === 4 && e[0].t === 'rachat');
verifier('Rachat : pas de cible sans carte adverse', M.ciblesAction(partie([1], [1], { actJ: A.ARNAULT }), A.ARNAULT).cibles === null);

// Sous bracelet (Sarkozy) : jusqu'à la fin, la carte n'attaque plus et ne se défend plus
s = partie([0, 1, 5], [2, 1, 6], { actIA: A.SARKO });
s.trait = IA; M.jouerAction(s, A.SARKO, 0, []);
verifier('Bracelet : dure toute la partie', s.bracT >= 50 && s.bracC === 0);
poserA(s, IA, 6, 4);              // IA : ← en 4
e = poserA(s, J, 0, 3);           // J : → en 3, visait 6 qui a une flèche en retour : pas d'attaque sous bracelet
verifier('Bracelet : la carte posée n’attaque pas', s.own[4] === IA && e.some(x => x.t === 'bracelet'));
e = poserA(s, IA, 2, 0);          // carte 2 (←) en 0 ? non : on la met en 5, sa flèche ← vise 4 (à elle)… on teste la défense :
s = partie([0, 1], [5, 1], { actIA: A.SARKO }); s.trait = IA; M.jouerAction(s, A.SARKO, 0, []);
poserA(s, J, 0, 4);               // J pose 0 (→) en 4 : sous bracelet
e = poserA(s, IA, 5, 3);          // IA pose 5 (→) en 3 : vise 4 qui a… pas de flèche ← de toute façon
s = partie([6, 1], [5, 1], { actIA: A.SARKO }); s.trait = IA; M.jouerAction(s, A.SARKO, 6, []);
poserA(s, J, 6, 4);               // J pose 6 (←) en 4, sous bracelet
e = poserA(s, IA, 5, 3);          // IA pose 5 (→) en 3 : 6 a une flèche ← en retour, mais sous bracelet : prise sans combat
verifier('Bracelet : la carte ne se défend plus (prise sans combat)', s.own[4] === IA && e.length === 1 && e[0].t === 'base');

// Le Fauteuil (Larcher) : la carte choisie, puis la prochaine posée (campagne de nov. 2026)
s = partie([1, 1, 5], [5, 6], { actJ: A.LARCHER }); poserA(s, J, 1, 4); s.trait = J;
M.jouerAction(s, A.LARCHER, 4, []);
verifier('Fauteuil : carte protégée, et la prochaine posée le sera', s.prot[4] === 1 && s.rep === J);
e = poserA(s, IA, 5, 3);
verifier('Fauteuil : ni prise, ni défiée, et on le signale', s.own[4] === J && e.length === 1 && e[0].t === 'protegee' && e[0].proteges.join() === '4' && !e[0].vaccin[0]);

// Cour des comptes (Montchalin) : la carte attaque de nouveau, duels sans dés
s = partie([3, 1, 1, 1], [2, 1, 1], { actJ: A.MONTCHALIN, alea: () => 0 });   // avec ces dés, 8 contre 3 perdrait (1 contre 1)
poserA(s, IA, 2, 4); poserA(s, J, 1, 0); s.own[3] = J; s.crd[3] = 3; s.org[3] = J; s.vides--; s.score[J]++; s.mains[J] = s.mains[J].filter(x => x !== 3);
s.trait = J; s.poses = 1;
c = M.ciblesAction(s, A.MONTCHALIN);
verifier('Contrôle : cible = cartes qui pointent une carte adverse', c.cibles && c.cibles.join() === '3');
e = M.jouerAction(s, A.MONTCHALIN, 3, []);
const du = e.find(x => x.t === 'duel');
verifier('Contrôle : la Cour tranche, 8 contre 3 gagné sans dés', du && du.tranche && du.gagne && du.ra === 8 && du.rd === 3 && s.own[4] === J);
s = partie([4, 1, 1, 1], [3, 1, 1], { actJ: A.MONTCHALIN, alea: () => 0.99 });
poserA(s, IA, 3, 4); s.own[3] = J; s.crd[3] = 4; s.org[3] = J; s.vides--; s.score[J]++; s.score[IA]; s.mains[J] = s.mains[J].filter(x => x !== 4); s.trait = J; s.poses = 1;
e = M.jouerAction(s, A.MONTCHALIN, 3, []);
verifier('Contrôle : 2 contre 8 perdu, la carte passe en face', s.own[3] === IA && e.find(x => x.t === 'duel' && !x.gagne && x.tranche));

// Mercato (Valls) : la recrue attaque avec ses flèches
s = partie([1, 1, 1], [0, 1, 1, 1], { actJ: A.VALLS });
poserA(s, J, 1, 8); poserA(s, IA, 0, 3); poserA(s, IA, 1, 4);   // IA : → en 3 (vise 4), IA : rien en 4
s.trait = J; s.poses = 1;
e = M.jouerAction(s, A.VALLS, [8, 3], []);
verifier('Mercato : la recrue prend sans combat', s.own[3] === J && s.own[4] === J && s.own[8] === IA && e[0].vers.join() === [IA, J].join());

// Suspension (Braun-Pivet) : aucune prise pendant le tour adverse
s = partie([1, 1], [0, 1], { actJ: A.BRAUN, premier: J });
M.jouerAction(s, A.BRAUN, null, []); poserA(s, J, 1, 4); s.trait = J; M.finTour(s);
e = M.poser(s, 0, 3, []);
verifier('Suspension : la flèche ne prend rien', s.own[4] === J && e.some(x => x.t === 'suspendu'));

// Relocalisation (Montebourg) : elle déménage et attaque
s = partie([0, 1], [1, 1], { actJ: A.MONTEBOURG });
poserA(s, J, 0, 8); poserA(s, IA, 1, 4); s.trait = J; s.poses = 1;
e = M.jouerAction(s, A.MONTEBOURG, [8, 3], []);
verifier('Relocalisation : prise sans combat après le déménagement', s.own[3] === J && s.own[8] === -1 && s.own[4] === J);

// Règles classiques : le Fauteuil protège aussi la prochaine carte, et ne touche à rien d'autre
s = M.nouvelle({ mainJ: [1, 1, 5], mainIA: [5, 6], pioche: [], premier: IA, taille: 3, bancs: [], actJ: A.LARCHER });
poserA(s, J, 1, 4); s.trait = J; M.jouerAction(s, A.LARCHER, 4, []);
verifier('Fauteuil classique : carte protégée, siège intact, prochaine carte protégée', s.prot[4] === 1 && s.own[4] === J && s.rep === J);
console.log('Cartes action en Flèches :', ok, 'OK,', ko, 'KO');
process.exit(ko ? 1 : 0);
