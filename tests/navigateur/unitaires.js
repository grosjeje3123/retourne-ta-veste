global.window = {}; require('/home/claude/carte2/donnees.js'); const D = window.APDA;
const M = require('/home/claude/carte2/moteur.js'); M.charger(D.CANDIDATS.map(c => c.valeurs));
const A = M.A, J = 0, IA = 1, assert = require('assert');
const V = D.CANDIDATS.map(c => c.valeurs), somme = i => V[i].reduce((a, b) => a + b, 0);
const ordre = [...Array(V.length).keys()].sort((a, b) => somme(b) - somme(a));
const forte = ordre[0], faibles = ordre.slice(-6);
function partie(actJ, actIA) {
  const s = M.nouvelle({ mainJ: [faibles[0], faibles[1], faibles[2], ordre[1], ordre[2]], mainIA: [forte, faibles[3], faibles[4], faibles[5], ordre[3]], pioche: [], premier: J, taille: 3, bancs: [], actJ, actIA, proche: false, coalition: false, diagonales: false });
  M.debutTour(s, 0); return s;
}
// Le Homard : J invite une carte de l'IA, qui retourne dans sa main
let s = partie(A.RUGY, A.PLENEL);
M.poser(s, faibles[0], 0, []);                 // J pose au siège 1
M.poser(s, faibles[3], 4, []);                 // IA pose au centre
let sc = s.score.slice(), mainIA = s.mains[IA].length, vides = s.vides;
M.jouerAction(s, A.RUGY, 4, []);
assert.strictEqual(s.own[4], -1); assert.ok(s.mains[IA].includes(faibles[3])); assert.strictEqual(s.mains[IA].length, mainIA + 1);
assert.strictEqual(s.vides, vides + 1); assert.deepStrictEqual(s.score, sc);
console.log('Le Homard : ok');
// Vaccination : J se vaccine, la carte la plus forte de l'IA ne prend rien, puis la protection tombe au tour suivant de J
s = partie(A.BACHELOT, A.PLENEL);
M.poser(s, faibles[0], 1, []);                 // J au siège 2 (haut milieu)
M.poser(s, faibles[3], 8, []);                 // IA loin
M.jouerAction(s, A.BACHELOT, null, []); assert.strictEqual(s.vacc, J);
M.poser(s, faibles[1], 3, []);                 // J au siège 4 (milieu gauche)
let avant = s.own.slice();
M.poser(s, forte, 0, []);                      // l'IA pose sa meilleure carte au coin, voisine des sièges 2 et 4
assert.strictEqual(s.own[1], J); assert.strictEqual(s.own[3], J);
assert.strictEqual(s.trait, J); assert.strictEqual(s.vacc, -1);   // retour du tour de J : fin de la vaccination
console.log('Vaccination : ok (aucune prise, puis protection levée)');
// Relocalisation : une carte de J déménage et prend à son arrivée
s = partie(A.MONTEBOURG, A.PLENEL);
M.poser(s, ordre[1], 8, []);                   // J pose une forte carte dans un coin
M.poser(s, faibles[3], 0, []);                 // IA pose une faible carte au coin opposé
const c = M.ciblesAction(s, A.MONTEBOURG); assert.ok(c.cibles[0].includes(8) && c.cibles[1].includes(1));
M.jouerAction(s, A.MONTEBOURG, [8, 1], []);
assert.strictEqual(s.own[8], -1); assert.strictEqual(s.crd[1], ordre[1]); assert.strictEqual(s.own[1], J);
console.log('Relocalisation : ok, la carte voisine passe ' + (s.own[0] === J ? 'chez J' : 'pas (valeurs insuffisantes)'));
// Ça suffit ! : l'action de l'IA est annulée
s = partie(A.MORANO, A.BORNE);
const ev = M.jouerAction(s, A.MORANO, null, []);
assert.strictEqual(s.act[IA], -1); assert.strictEqual(ev[0].carte, A.BORNE);
assert.strictEqual(M.ciblesAction(s, A.MORANO).cibles, null);
console.log('Ça suffit ! : ok');
// Proclamé : départage d'une égalité
s = partie(A.COPE, A.PLENEL); M.jouerAction(s, A.COPE, null, []);
s.score = [5, 5]; assert.strictEqual(M.gagnant(s), J); s.score = [4, 6]; assert.strictEqual(M.gagnant(s), IA);
s.procl = -1; s.score = [5, 5]; assert.strictEqual(M.gagnant(s), -1);
console.log('Proclamé : ok');
// Cour des comptes : une carte de J posée avant une voisine faible la prend après coup
{
  const OPPC = [2, 3, 0, 1];
  // J pose au centre (siège 5) ; l'IA pose au-dessus (siège 2), sans prendre : on cherche un couple qui s'y prête
  let trouve = null;
  for (const x of ordre.slice(0, 12)) for (const y of ordre.slice(-12)) if (x !== y && V[x][0] > V[y][2] && V[y][2] <= V[x][0]) { trouve = [x, y]; break; }
  const [x, y] = trouve;
  const s2 = M.nouvelle({ mainJ: [x, faibles[0], faibles[1]], mainIA: [y, faibles[4], faibles[5]], pioche: [], premier: J, taille: 3, bancs: [], actJ: A.MONTCHALIN, actIA: A.PLENEL, proche: false, coalition: false, diagonales: false });
  M.debutTour(s2, 0);
  assert.strictEqual(M.ciblesAction(s2, A.MONTCHALIN).cibles, null);       // rien à contrôler sur un plateau vide
  M.poser(s2, x, 4, []);
  M.poser(s2, y, 1, []);                                                    // y attaque x par son bas : V[y][2] contre V[x][0]
  assert.strictEqual(s2.own[1], IA); assert.strictEqual(s2.own[4], J);
  const c2 = M.ciblesAction(s2, A.MONTCHALIN); assert.deepStrictEqual(c2.cibles, [4]);
  const ev2 = M.jouerAction(s2, A.MONTCHALIN, 4, []);
  assert.strictEqual(ev2[0].t, 'controle'); assert.strictEqual(s2.own[1], J); assert.strictEqual(s2.trait, J);
  assert.deepStrictEqual(s2.score, [6, 4]);
  console.log('Cour des comptes : ok (la voisine posée après coup est prise, J garde la main)');
  // Séance suspendue : le contrôle n'est pas jouable
  const s3 = M.cloner(s2); s3.suspOn = 1; assert.strictEqual(M.ciblesAction(s3, A.MONTCHALIN).cibles, null);
}
// Djadja show : la carte posée ce tour gagne +3 partout, ce qui transforme une égalité en prise
{
  let duo = null;
  for (const x of ordre) for (const y of ordre) if (!duo && x !== y && V[x][2] === V[y][0] && V[x][2] < 10) duo = [x, y];
  const [x, y] = duo;
  const base = () => { const s = M.nouvelle({ mainJ: [x, faibles[0]], mainIA: [y, faibles[4]], pioche: [], premier: IA, taille: 3, bancs: [], actJ: A.OUDEA, actIA: A.PLENEL, proche: false, coalition: false, diagonales: false }); M.debutTour(s, 0); M.poser(s, y, 4, []); return s; };
  const sans = base(); M.poser(sans, x, 1, []); assert.strictEqual(sans.own[4], IA);              // égalité : pas de prise
  const avec = base(); M.jouerAction(avec, A.OUDEA, null, []); assert.strictEqual(avec.show, 3);
  M.poser(avec, x, 1, []);
  assert.deepStrictEqual([0, 1, 2, 3].map(k => avec.bst[4 + k]), [3, 3, 3, 3]); assert.strictEqual(avec.show, 0);
  assert.strictEqual(avec.own[4], J);
  console.log('Djadja show : ok (+3 sur les quatre côtés, l’égalité devient une prise)');
}
// Ordre de jeu équilibré : le second garde une carte ; grand plateau = droit de réponse ; petit plateau = prime d'ouverture
{
  const partie = (taille, premier) => {
    const s = M.nouvelle({ mainJ: [0, 1, 2, 3, 4], mainIA: [5, 6, 7, 8, 9], pioche: [], premier, taille, bancs: taille === 4 ? [0, 3, 12, 15] : [], proche: true, coalition: true, diagonales: true, ordre: true });
    M.debutTour(s, 0);
    let n = 0, premiereDuSecond = -1, premiere = -1;
    while (!s.fin && n < 20) { const p = s.trait, cell = M.casesVides(s)[0]; M.poser(s, s.mains[p][0], cell, []); if (n === 0) premiere = cell; if (p !== premier && premiereDuSecond < 0) premiereDuSecond = cell; n++; }
    return { s, n, premiere, premiereDuSecond };
  };
  for (const premier of [J, IA]) {
    const g = partie(4, premier), second = 1 - premier;
    assert.strictEqual(g.n, 9); assert.strictEqual(g.s.mains[premier].length, 0); assert.strictEqual(g.s.mains[second].length, 1);
    assert.strictEqual(g.s.prot[g.premiereDuSecond], 1); assert.strictEqual(Array.from(g.s.prot).reduce((a, b) => a + b, 0), 1);
    assert.strictEqual(g.s.own[g.premiereDuSecond], second);                                    // indéboulonnable : elle n'a pas changé de camp
    assert.strictEqual(g.s.score[0] + g.s.score[1], 10); assert.strictEqual(Array.from(g.s.bst).reduce((a, b) => a + b, 0), 0);
    const p = partie(3, premier);
    assert.strictEqual(p.n, 9); assert.strictEqual(p.s.mains[second].length, 1);
    assert.deepStrictEqual([0, 1, 2, 3].map(k => p.s.bst[p.premiere * 4 + k]), [1, 1, 1, 1]); assert.strictEqual(Array.from(p.s.bst).reduce((a, b) => a + b, 0), 4);
    assert.strictEqual(Array.from(p.s.prot).reduce((a, b) => a + b, 0), 0);
  }
  // Sans l'option, rien ne change : 10 poses sur le grand plateau
  const s0 = M.nouvelle({ mainJ: [0, 1, 2, 3, 4], mainIA: [5, 6, 7, 8, 9], pioche: [], premier: J, taille: 4, bancs: [0, 3] }); M.debutTour(s0, 0);
  let n0 = 0; while (!s0.fin && n0 < 20) { M.poser(s0, s0.mains[s0.trait][0], M.casesVides(s0)[0], []); n0++; if (!s0.mains[0].length && !s0.mains[1].length) break; }
  assert.strictEqual(n0, 10);
  // L'IA qui garde une carte ne pose jamais sa plus faible tant qu'elle en a d'autres
  const faible = [5, 6, 7, 8, 9].sort((a, b) => V[a].reduce((x, y) => x + y, 0) - V[b].reduce((x, y) => x + y, 0))[0];
  const s1 = M.nouvelle({ mainJ: [0, 1, 2, 3, 4], mainIA: [5, 6, 7, 8, 9], pioche: [], premier: J, taille: 4, bancs: [0, 3, 12, 15], proche: true, coalition: true, diagonales: true, ordre: true }); M.debutTour(s1, 0);
  while (!s1.fin) { if (s1.trait === J) M.poser(s1, s1.mains[J][0], M.casesVides(s1)[0], []); else { const c = M.choisirPose(s1, 'assemblee', null); assert.notStrictEqual(c.carte, faible); M.poser(s1, c.carte, c.cell, []); } }
  assert.deepStrictEqual(s1.mains[IA], [faible]);
  // À son dernier coup, l'IA sait que l'adversaire ne peut plus répondre (sa main est vide ou réduite à la carte gardée)
  console.log('Ordre de jeu : ok (9 poses, carte gardée, droit de réponse, prime d’ouverture, l’IA garde sa plus faible)');
}

// Cartes action retouchées (équilibrage du 20 novembre 2026)
{
  const neuve = (actJ, premier) => { const s = M.nouvelle({ mainJ: [0, 1, 2, 3, 4], mainIA: [5, 6, 7, 8, 9], pioche: [20, 21, 22], premier: premier == null ? J : premier, taille: 4, bancs: [0, 3, 12, 15], actJ, actIA: A.PLENEL, proche: true, coalition: true, diagonales: true, ordre: true }); M.debutTour(s, 0); return s; };
  const somme = t => Array.from(t).reduce((a, b) => a + b, 0);
  // Arnault : rachat d'un siège libre
  let s = neuve(A.ARNAULT); let c = M.ciblesAction(s, A.ARNAULT); assert.strictEqual(c.cibles.length, 12);
  M.jouerAction(s, A.ARNAULT, 5, []); assert.strictEqual(s.own[5], -2); assert.strictEqual(s.vides, 11); assert.ok(M.casesVides(s).indexOf(5) < 0); assert.strictEqual(s.act[J], -1);
  // Praud : édito quotidien, +1 partout sur chaque carte posée ensuite par son camp seulement
  s = neuve(A.PRAUD); M.jouerAction(s, A.PRAUD, null, []); M.poser(s, 0, 1, []);
  assert.deepStrictEqual([0, 1, 2, 3].map(k => s.bst[1 * 4 + k]), [1, 1, 1, 1]);
  M.poser(s, 5, 10, []); assert.strictEqual(somme([0, 1, 2, 3].map(k => s.bst[10 * 4 + k])), 0);
  M.poser(s, 1, 2, []); assert.deepStrictEqual([0, 1, 2, 3].map(k => s.bst[2 * 4 + k]), [1, 1, 1, 1]);
  // Borne : la carte prise perd 1 partout ; interdite au dernier tour
  s = neuve(A.BORNE); M.poser(s, 0, 1, []); M.poser(s, 5, 10, []);
  M.jouerAction(s, A.BORNE, 10, []); assert.strictEqual(s.own[10], J); assert.deepStrictEqual([0, 1, 2, 3].map(k => s.bst[10 * 4 + k]), [-1, -1, -1, -1]);
  s = neuve(A.BORNE); s.mains[J] = [0]; M.poser(s, 0, 1, []); s.trait = J; s.mains[J] = [1]; s.own[10] = IA; s.crd[10] = 5;
  assert.ok(/dernier tour/.test(M.ciblesAction(s, A.BORNE).raison || ''));
  // Le Maire : il faut encore trois cartes à poser
  s = neuve(A.LEMAIRE); assert.ok(M.ciblesAction(s, A.LEMAIRE).cibles); s.mains[J] = [0, 1]; assert.ok(/trois cartes/.test(M.ciblesAction(s, A.LEMAIRE).raison));
  // Larcher : la carte choisie, puis la prochaine posée, sont indéboulonnables
  s = neuve(A.LARCHER); M.poser(s, 0, 1, []); M.poser(s, 5, 10, []);
  M.jouerAction(s, A.LARCHER, 1, []); assert.strictEqual(s.prot[1], 1); M.poser(s, 1, 2, []); assert.strictEqual(s.prot[2], 1);
  M.poser(s, 6, 11, []); M.poser(s, 2, 4, []); assert.strictEqual(s.prot[4], 0);
  // de Rugy : la carte invitée rentre en main et y reste (une carte de plus à garder)
  s = neuve(A.RUGY); M.poser(s, 0, 1, []); M.poser(s, 5, 10, []);
  const avant = M.posables(s, IA); M.jouerAction(s, A.RUGY, 10, []);
  assert.strictEqual(s.own[10], -1); assert.ok(s.mains[IA].indexOf(5) >= 0); assert.strictEqual(M.posables(s, IA), avant); assert.strictEqual(s.gel[IA], 1);
  // Plenel : main ouverte jusqu'à la fin
  s = neuve(A.PLENEL); M.jouerAction(s, A.PLENEL, null, []); for (let n = 0; n < 6 && !s.fin; n++) M.poser(s, s.mains[s.trait][0], M.casesVides(s)[0], []);
  assert.ok(M.mainVisible(s, IA, false));
  console.log('Cartes retouchées : ok (rachat, édito quotidien, 49.3 fragilisé, On verra demain, Fauteuil, Homard, Scoop)');
}
