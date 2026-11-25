// Rejoue les trois leçons du tutoriel des Flèches avec le moteur, telles que jeu.js les scénarise.
global.window = {}; require('/home/claude/carte2/donnees.js'); const C = window.APDA.CANDIDATS;
const M = require('/home/claude/carte2/moteur.js'); M.charger(C.map(c => c.valeurs));
const J = M.J, IA = M.IA, id = n => C.findIndex(c => c.court === n), noms = t => t.map(id);
const etat = s => [...s.own].map(o => o === -2 ? '#' : o < 0 ? '.' : o === J ? 'J' : 'I').join('') + ' ' + s.score.join('-');
const ev = e => e.map(x => x.t + (x.t === 'duel' ? `(${x.a}v${x.d}:${x.ra}/${x.rd}${x.gagne ? ' gagné' : ' perdu'})` : '') + '[' + x.cells + ']').join(' ') || 'rien';
let ko = 0; const verif = (nom, c) => { console.log((c ? 'ok  ' : 'KO  ') + nom); if (!c) ko++; };
// Leçon 1
let des = [], alea = () => des.length ? des.shift() : Math.random();
let s = M.nouvelle({ mainJ: noms(['Villepin', 'Cazeneuve', 'Batho', 'Breton', 'Polony']), mainIA: noms(['Lalanne', 'Riner', 'Pigasse', 'Leclerc', 'Branco']), pioche: [], premier: IA, taille: 3, bancs: [], fleches: true, alea });
let e = []; M.poser(s, id('Lalanne'), 4, e); console.log('L1 IA Lalanne   ', etat(s), ev(e));
e = []; M.poser(s, id('Villepin'), 3, e); console.log('L1 J  Villepin  ', etat(s), ev(e)); verif('L1 prise sans combat, 6-4', s.own[4] === J && e.length === 1 && e[0].t === 'base' && s.score.join() === '6,4');
e = []; M.poser(s, id('Riner'), 8, e); console.log('L1 IA Riner     ', etat(s), ev(e)); verif('L1 l’IA reprend par le coin, 5-5', s.own[4] === IA && e.length === 1 && e[0].t === 'base' && s.score.join() === '5,5');
e = []; M.poser(s, id('Cazeneuve'), 6, e); console.log('L1 J  Cazeneuve ', etat(s), ev(e)); verif('L1 reprise par le coin, 6-4', s.own[4] === J && s.own[8] === IA && e.length === 1 && e[0].t === 'base' && s.score.join() === '6,4');
// Leçon 2
des = [];
s = M.nouvelle({ mainJ: noms(['Villepin', 'Batho', 'Breton', 'Cazeneuve', 'Lassalle']), mainIA: noms(['Polony', 'Leclerc', 'Durif', 'Riner', 'Pigasse']), pioche: [], premier: J, taille: 3, bancs: [], fleches: true, alea });
[['Polony', 4], ['Leclerc', 1]].forEach(([c, cell]) => { s.trait = IA; s.poses = 1; M.poser(s, id(c), cell, []); }); s.trait = J;
console.log('L2 départ       ', etat(s), 'aperçu', JSON.stringify(M.apercuFleches(s, id('Villepin'), 3)));
des = [0.7, 0]; e = []; M.poser(s, id('Villepin'), 3, e); console.log('L2 J  Villepin  ', etat(s), ev(e));
verif('L2 duel 5 contre 1 gagné 4 à 1, combo sur Leclerc, 7-3', e[0].t === 'duel' && e[0].a === 5 && e[0].d === 1 && e[0].ra === 4 && e[0].rd === 1 && e[0].gagne && e[1].t === 'combo' && e[1].cells.join() === '1' && s.score.join() === '7,3');
des = [0.9, 0.9]; e = []; M.poser(s, id('Durif'), 6, e); console.log('L2 IA Durif     ', etat(s), ev(e));
verif('L2 Durif perd son duel (1 contre 1, égalité au défenseur), 8-2', e.length === 1 && e[0].t === 'duel' && !e[0].gagne && e[0].a === 1 && e[0].d === 1 && s.own[6] === J && s.own[3] === J && s.score.join() === '8,2');
// Leçon 3
let v = 0, n = 0, d = 0;
for (let k = 0; k < 400; k++) {
  s = M.nouvelle({ mainJ: noms(['Breton', 'Lassalle', 'Cazeneuve', 'Villepin', 'Batho']), mainIA: noms(['Riner', 'Leclerc', 'Pigasse', 'Lalanne', 'Branco']), pioche: [], premier: IA, taille: 4, bancs: [3, 12, 10], fleches: true, alea: Math.random, ordre: true });
  e = []; M.poser(s, id('Riner'), 5, e);
  let e2 = []; M.poser(s, id('Breton'), 6, e2);
  if (!k) { console.log('L3 IA Riner, J Breton', etat(s), ev(e), '|', ev(e2), 'prot', s.prot[6]); verif('L3 Breton prend Riner sans combat et devient indéboulonnable, 6-4', s.own[5] === J && s.prot[6] === 1 && e2[0].t === 'reponse' || (e2.some(x => x.t === 'base') && s.prot[6] === 1 && s.score.join() === '6,4')); }
  let g = 0;
  while (!s.fin && g++ < 30) {
    let c;
    if (s.trait === IA) c = M.choisirPose(s, 'mairie', null);
    else { const m = s.mains[J], vd = M.casesVides(s); c = { carte: m[(Math.random() * m.length) | 0], cell: vd[(Math.random() * vd.length) | 0] }; }
    if (!c) break; M.poser(s, c.carte, c.cell, []);
  }
  const w = M.gagnant(s); if (w === J) v++; else if (w === IA) d++; else n++;
  if (!k) console.log('L3 fin', etat(s), 'mains', s.mains.map(m => m.length).join('/'));
}
console.log('L3, joueur qui pose au hasard : V', v, 'N', n, 'D', d, 'sur 400');
console.log(ko ? ko + ' KO' : 'tout est conforme'); process.exit(ko ? 1 : 0);
