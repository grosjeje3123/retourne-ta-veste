// Variante « Flèches » : règles du moteur, sur des cartes fabriquées (flèches imposées).
const M = require('/home/claude/carte2/moteur.js');
const J = M.J, IA = M.IA;
let ok = 0, ko = 0;
function verifier(nom, cond) { if (cond) ok++; else { ko++; console.log('KO', nom); } }
// cartes : [valeurs, masque] ; bits 0 ↑, 1 →, 2 ↓, 3 ←, 4 ↗, 5 ↘, 6 ↙, 7 ↖
const CARTES = [
  [[5, 5, 5, 5], 0b00000010],   // 0 : flèche → (force 5)
  [[5, 5, 5, 5], 0],            // 1 : aucune flèche
  [[3, 3, 3, 3], 0b00001000],   // 2 : flèche ← (force 3)
  [[3, 3, 3, 3], 0b00001010],   // 3 : flèches ← et → (force 3)
  [[5, 5, 5, 5], 0b00000110],   // 4 : flèches → et ↓
  [[8, 2, 2, 8], 0b10000000],   // 5 : flèche ↖ (force 5 = moyenne de 8 et 2... (8+8)/2 = 8)
  [[5, 5, 5, 5], 0b00100000],   // 6 : flèche ↘
  [[9, 9, 9, 9], 0b00001000],   // 7 : flèche ← (force 9)
];
M.charger(CARTES.map(c => c[0]), v => CARTES[CARTES.findIndex(c => c[0] === v || (c[0].join() === v.join()))][1]);
// charger() reçoit des copies : on retrouve le masque par l'ordre d'appel
let rang = 0; M.charger(CARTES.map(c => c[0]), () => CARTES[rang++][1]);
verifier('masques chargés', M.fleches(0) === 2 && M.fleches(1) === 0 && M.fleches(5) === 128);
function des(...t) { let i = 0; return () => t[i++ % t.length]; }
function partie(mainJ, mainIA, alea) { return M.nouvelle({ mainJ, mainIA, pioche: [], premier: IA, taille: 3, bancs: [], fleches: true, alea }); }

// 1. prise sans combat : la carte visée n'a pas de flèche en retour
let s = partie([0], [1], des(0.5)), e = [];
M.poser(s, 1, 1, []); M.poser(s, 0, 0, e);
verifier('prise sans combat', s.own[1] === J && e.length === 1 && e[0].t === 'base' && s.score[J] === 6 && s.score[IA] === 4);
// pas de flèche vers la carte : rien
s = partie([0], [1], des(0.5)); M.poser(s, 1, 3, []); e = []; M.poser(s, 0, 0, e);
verifier('pas de flèche, pas de prise', s.own[3] === IA && e.length === 0);
// 2. duel gagné
s = partie([0], [2], des(0.99, 0)); M.poser(s, 2, 1, []); e = []; M.poser(s, 0, 0, e);
verifier('duel gagné', s.own[1] === J && e[0].t === 'duel' && e[0].gagne && e[0].ra === 5 && e[0].rd === 1 && e[0].a === 5 && e[0].d === 3);
// duel perdu : la carte posée passe à l'adversaire
s = partie([0], [2], des(0, 0.99)); M.poser(s, 2, 1, []); e = []; M.poser(s, 0, 0, e);
verifier('duel perdu', s.own[0] === IA && s.own[1] === IA && !e[0].gagne && e[0].vers === IA && s.score[J] === 4 && s.score[IA] === 6);
// égalité : au défenseur
s = partie([0], [2], des(0.5, 0.99)); M.poser(s, 2, 1, []); e = []; M.poser(s, 0, 0, e);
verifier('égalité au défenseur (3 contre 3)', e[0].ra === 3 && e[0].rd === 3 && !e[0].gagne && s.own[0] === IA);
// 3. combo : le vaincu entraîne la carte de son camp qu'il pointait
s = partie([0, 1], [3, 1], des(0.99, 0));
M.poser(s, 3, 1, []); M.poser(s, 1, 8, []); M.poser(s, 1, 2, []);   // IA en 1 (← →), joueur en 8, IA en 2
e = []; M.poser(s, 0, 0, e);
verifier('combo après duel gagné', s.own[1] === J && s.own[2] === J && e.length === 2 && e[1].t === 'combo' && e[1].cells.join() === '2');
// combo à l'envers : duel perdu, la carte posée entraîne celle qu'elle pointait
s = partie([1, 4], [2, 1], des(0, 0.99));
M.poser(s, 2, 1, []); M.poser(s, 1, 3, []); M.poser(s, 1, 8, []);   // IA en 1 (←), joueur en 3, IA en 8
e = []; M.poser(s, 4, 0, e);
verifier('combo après duel perdu', s.own[0] === IA && s.own[3] === IA && e[1].t === 'combo' && e[1].vers === IA && s.score[J] === 3);
// 4. diagonale : force = moyenne des deux côtés
s = partie([5], [1], des(0.5)); M.poser(s, 1, 0, []); e = []; M.poser(s, 5, 4, e);
verifier('prise en diagonale', s.own[0] === J);
verifier('Attaque = Urnes et Buzz, Défense = Expérience et Terrain', M.statsFleches([8, 2, 2, 8]).join() === '8,2' && M.statsFleches([1, 4, 4, 6]).join() === '4,4' && M.statsFleches([9, 10, 8, 10]).join() === '10,9');
// 5. duels dans l'ordre du plus favorable, un duel perdu arrête tout (la prise sans combat n'a pas lieu)
s = partie([4, 1], [7, 1], des(0, 0.99));
M.poser(s, 1, 3, []); M.poser(s, 1, 8, []); M.poser(s, 7, 1, []);   // IA en 3 (sans flèche) et en 1 (← force 9), joueur en 8
e = []; M.poser(s, 4, 0, e);
verifier('duel perdu : pas de prise ensuite', s.own[0] === IA && s.own[3] === IA && e.filter(x => x.t === 'base').length === 0);
// 6. chances et copies
verifier('chances de duel', Math.abs(M.chanceDuel(8, 4) - 22 / 32) < 1e-9 && Math.abs(M.chanceDuel(5, 5) - 0.4) < 1e-9 && M.chanceDuel(1, 9) === 0);
s = partie([0], [2], des(0, 0.99)); M.poser(s, 2, 1, []);
const c = M.cloner(s); verifier('la copie garde la variante, pas les dés', c.fl === 1 && !c.alea);
M.poser(c, 0, 0, []); verifier('copie : duel 5 contre 3 compté gagné (69 %)', c.own[1] === J && s.own[1] === IA);
const ap = M.apercuFleches(s, 0, 0); verifier('aperçu', ap.duels.length === 1 && ap.duels[0].a === 5 && ap.duels[0].d === 3 && ap.libres.length === 0 && s.own[0] === -1);
// 7. fin de partie : 10 cartes posées sur le grand plateau, score = cartes sur le plateau
global.window = {}; require('/home/claude/carte2/donnees.js'); M.charger(window.APDA.CANDIDATS.map(x => x.valeurs));
s = M.nouvelle({ mainJ: [0, 1, 2, 3, 4], mainIA: [5, 6, 7, 8, 9], pioche: [], premier: J, taille: 4, bancs: [0, 5, 10, 15, 3, 12], fleches: true, alea: Math.random });
let g = 0; while (!s.fin && g++ < 20) { const m = s.mains[s.trait], v = M.casesVides(s); M.poser(s, m[0], v[0], []); }
verifier('partie complète : 10 poses, mains vides', s.fin && g === 10 && !s.mains[0].length && !s.mains[1].length && s.score[0] + s.score[1] === 10 && M.nbSur(s, 0) === s.score[0]);
const pop = x => { let n = 0; while (x) { n += x & 1; x >>= 1; } return n; };
verifier('chaque carte a au moins une flèche', window.APDA.CANDIDATS.every((_, i) => pop(M.fleches(i)) >= 1));
console.log('Flèches :', ok, 'OK,', ko, 'KO');
process.exit(ko ? 1 : 0);
