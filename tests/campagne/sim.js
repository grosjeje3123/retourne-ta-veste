// Campagne d'équilibrage — Flèches (règles par défaut). node sim.js <mode> <parties> <graine> > sortie.jsonl
// modes : base (premier joueur, cartes, cartes action, places bloquées), des (part du hasard), niveaux (écart d'IA avec et sans dés), carriere (spirale)
global.window = {}; require('/home/claude/carte2/donnees.js'); const D = window.APDA;
const M = require('/home/claude/carte2/moteur.js'); M.charger(D.CANDIDATS.map(c => c.valeurs));
if (process.env.REG) Object.assign(M.REG, JSON.parse(process.env.REG));
const BMIN = +(process.env.BMIN || 0), BMAX = +(process.env.BMAX || 6);
const [mode, NB, GR] = [process.argv[2], +process.argv[3] || 100, +process.argv[4] || 1];
const NA = D.ACTIONS.length, NC = D.CANDIDATS.length;
const gen = g => { let x = g % 2147483646 + 1; return () => (x = (x * 48271) % 2147483647) / 2147483647; };
const rnd = gen(GR * 7919 + 13);
const melanger = (t, r) => { for (let i = t.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [t[i], t[j]] = [t[j], t[i]]; } return t; };
function miroir(s) {
  const e = M.cloner(s), inv = x => (x === 0 || x === 1 ? 1 - x : x), sw = t => t ? [t[1], t[0]] : t;
  for (let i = 0; i < e.N; i++) { e.own[i] = inv(e.own[i]); e.org[i] = inv(e.org[i]); }
  e.mains = sw(e.mains); e.act = sw(e.act); e.score = sw(e.score); e.dbl = sw(e.dbl); e.quota = sw(e.quota); e.gel = sw(e.gel); e.aura = sw(e.aura);
  e.trait = 1 - e.trait; e.susp = inv(e.susp); e.bracCible = inv(e.bracCible); e.revCible = inv(e.revCible); e.vacc = inv(e.vacc); e.procl = inv(e.procl); e.garde = inv(e.garde); e.rep = inv(e.rep);
  e.suisse = sw(e.suisse); e.oubliCamp = inv(e.oubliCamp);
  return e;
}
function inconnues(vue) { const vus = new Set(vue.mains[1]); for (let i = 0; i < vue.N; i++) if (vue.crd[i] >= 0) vus.add(vue.crd[i]); return [...Array(NC).keys()].filter(c => !vus.has(c)); }
// Joue une partie. niv = [niveau camp 0, niveau camp 1] : 'mairie' | 'assemblee' | nombre (profondeur)
function jouer(o) {
  const ia = o.ia || rnd, des = o.des || rnd;
  const s = M.nouvelle({ mainJ: o.m0, mainIA: o.m1, pioche: o.pi, actJ: o.a0, actIA: o.a1, premier: o.premier, taille: 4, bancs: o.bancs, fleches: true, alea: des, ordre: true });
  if (o.tranche) s.tranche = 1;
  let garde = 0, duels = 0, gagnes = 0, surprises = 0, joue = [-1, -1], poses = 0;
  const compter = ev => ev.forEach(e => { if (e.t === 'duel' && !e.tranche) { duels++; if (e.gagne) gagnes++; if (e.gagne !== (e.a > e.d)) surprises++; } });
  while (!s.fin && garde++ < 90) {
    const p = s.trait, niv = o.niv[p], vue = p === M.IA ? s : miroir(s), inc = M.mainVisible(vue, M.J, false) ? null : inconnues(vue);
    if (s.act[p] >= 0) {
      const act = M.choisirAction(vue, niv === 'mairie' ? 'mairie' : 'assemblee', inc, ia);
      if (act) { const a = s.act[p], ev = []; joue[p] = poses; M.jouerAction(s, a, act.arg, ev); compter(ev); if (s.fin || s.trait !== p) continue; }
    }
    const coup = M.choisirPose(vue, niv, inc, ia);
    if (!coup) { s.fin = true; break; }
    const ev = []; M.poser(s, coup.carte, coup.cell, ev); compter(ev); poses++;
  }
  return { w: M.gagnant(s), sc: s.score.slice(), duels, gagnes, surprises, joue, poses };
}
function donne(r) {
  const [m0, m1, pi] = M.donneFleches(r), acts = melanger([...Array(NA).keys()], r);
  return { m0, m1, pi, a0: acts[0], a1: acts[1], bancs: melanger([...Array(16).keys()], r).slice(0, BMIN + ((r() * (BMAX - BMIN + 1)) | 0)) };
}
const sortir = o => process.stdout.write(JSON.stringify(o) + '\n');
const t0 = Date.now();
if (mode === 'base') {
  // deux IA de même niveau (Assemblée), donne équilibrée, la donne est jouée deux fois en échangeant le premier joueur
  for (let g = 0; g < NB; g++) {
    const d = donne(rnd);
    for (const premier of [0, 1]) { const r = jouer(Object.assign({ premier, niv: ['assemblee', 'assemblee'] }, d)); sortir({ g, premier, m0: d.m0, m1: d.m1, a0: d.a0, a1: d.a1, nb: d.bancs.length, ...r }); }
  }
} else if (mode === 'action') {
  // une carte action étudiée (camp 0), l'autre au hasard ; chaque donne jouée deux fois (premier joueur échangé)
  const liste = process.argv[5].split(',').map(Number);
  for (const a0 of liste) for (let g = 0; g < NB; g++) {
    const d = donne(rnd); d.a0 = a0; if (d.a1 === a0) d.a1 = (a0 + 1 + ((rnd() * (NA - 1)) | 0)) % NA;
    for (const premier of [0, 1]) { const r = jouer(Object.assign({ premier, niv: ['assemblee', 'assemblee'] }, d)); sortir({ a0, premier, nb: d.bancs.length, w: r.w, joue: r.joue[0] >= 0 }); }
  }
} else if (mode === 'des') {
  // même donne, mêmes IA (même graine de décision) ; seuls les dés changent : le vainqueur change-t-il ? + sans dés (la Cour tranche)
  for (let g = 0; g < NB; g++) {
    const d = donne(rnd), premier = g % 2, gi = (rnd() * 1e9) | 0;
    const res = [1, 2, 3].map(k => jouer(Object.assign({ premier, niv: ['assemblee', 'assemblee'], ia: gen(gi), des: gen(gi + 1000 * k) }, d)));
    const sansDes = jouer(Object.assign({ premier, niv: ['assemblee', 'assemblee'], ia: gen(gi), tranche: 1 }, d));
    sortir({ g, w: res.map(r => r.w), w0: sansDes.w, duels: res.map(r => r.duels), surprises: res.map(r => r.surprises) });
  }
} else if (mode === 'niveaux') {
  // l'écart d'habileté pèse-t-il plus que les dés ? Assemblée contre Mairie, avec et sans dés
  for (let g = 0; g < NB; g++) {
    const d = donne(rnd), premier = g % 2, fort = (g >> 1) % 2;
    const niv = fort ? ['mairie', 'assemblee'] : ['assemblee', 'mairie'];
    const a = jouer(Object.assign({ premier, niv }, d)), b = jouer(Object.assign({ premier, niv, tranche: 1 }, d));
    sortir({ g, fort, w: a.w, wt: b.w });
  }
} else if (mode === 'carriere') {
  // Carrière simulée : deck de départ 8 cartes moyennes, meilleure main, main de l'IA ajustée, prise / perte de carte. niveau humain simulé = argv[5]
  const joueur = process.argv[5] === 'mairie' ? 'mairie' : 'assemblee', niveauIA = process.argv[6] || 'assemblee', MANCHES = +process.argv[7] || 30;
  const cote = i => M.coteFleches(i), total = m => m.reduce((a, c) => a + cote(c), 0);
  const ECART = { mairie: -6, assemblee: 0, elysee: 6 };
  const tri = [...Array(NC).keys()].sort((a, b) => cote(a) - cote(b)), depart = tri.slice(Math.round(NC * 0.25), Math.round(NC * 0.8));
  for (let c = 0; c < NB; c++) {
    let deck = melanger(depart.slice(), rnd).slice(0, 8), album = new Set(), manches = 0, gains = 0, pertes = 0, hist = [];
    for (let m = 0; m < MANCHES; m++) {
      const main = deck.slice().sort((a, b) => cote(b) - cote(a)).slice(0, 5);
      const premiere = !(manches || gains || pertes), niv = premiere ? 'mairie' : niveauIA;
      const cible = total(main) + Math.round((ECART[niv] - (deck.length <= 6 ? +(process.env.AIDE || 0) : 0)) * 2.3), reste = [...Array(NC).keys()].filter(i => !main.includes(i));
      album.forEach(() => 0); deck.forEach(i => album.add(i));
      const jamais = reste.filter(i => !album.has(i)), perdues = reste.filter(i => album.has(i) && !deck.includes(i)), deja = reste.filter(i => deck.includes(i)), neuves = jamais.length >= 5 || !process.env.ALBUM ? (process.env.ALBUM ? jamais : reste.filter(i => !deck.includes(i))) : jamais.concat(perdues);
      let mieux = null, sc = Infinity;
      for (let e = 0; e < 800 && sc > 1; e++) { const t = neuves.length >= 5 ? melanger(neuves.slice(), rnd).slice(0, 5) : neuves.concat(melanger(deja.slice(), rnd).slice(0, 5 - neuves.length)); const x = Math.abs(total(t) - cible); if (x < sc) { sc = x; mieux = t; } }
      const acts = melanger([...Array(NA).keys()], rnd);
      const pi = melanger(reste.filter(i => !mieux.includes(i)), rnd).slice(0, 6);
      let r, tours = 0;
      do { r = jouer({ m0: main, m1: mieux, pi, a0: acts[0], a1: acts[1], premier: (rnd() * 2) | 0, bancs: melanger([...Array(16).keys()], rnd).slice(0, (rnd() * 7) | 0), niv: [joueur, niv === 'mairie' ? 'mairie' : 'assemblee'] }); } while (r.w < 0 && ++tours < 3);   // ballottage : la manche reste ouverte
      if (r.w === 0) { gains++; manches++; const prise = mieux.filter(i => !deck.includes(i)).sort((a, b) => (album.has(a) - album.has(b)) || (cote(b) - cote(a)))[0]; if (prise != null) deck.push(prise); }
      else if (r.w === 1) { pertes++; manches++; if (deck.length > 5) { const k = main[(rnd() * 5) | 0]; deck = deck.filter(x => x !== k); }
        else if (process.env.RECASE) { const k = main[(rnd() * 5) | 0], nv = melanger(depart.filter(x => !deck.includes(x)), rnd)[0]; deck = deck.filter(x => x !== k).concat([nv]); } }
      deck.forEach(i => album.add(i)); hist.push([r.w, deck.length, total(main), album.size]);
    }
    sortir({ c, joueur, niveauIA, hist });
  }
}
process.stderr.write(`${mode} ${NB} : ${((Date.now() - t0) / 1000).toFixed(0)} s\n`);
