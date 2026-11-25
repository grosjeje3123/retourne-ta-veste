const M = require('/home/claude/carte2/moteur.js');
const vals = JSON.parse(require('fs').readFileSync('/home/claude/tests/vals.json','utf8'));
M.charger(vals);
let seed = 12345; function rnd(){ seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
function melanger(t){ for (let i=t.length-1;i>0;i--){ const j=(rnd()*(i+1))|0; [t[i],t[j]]=[t[j],t[i]]; } return t; }
const stats = {proche:0, coalition:0, domino:0, base:0, poses:0, actions:0, parties:0, vJ:0, vIA:0, nul:0, tempsMax:{}};
function partie(nivJ, nivIA, opts){
  const cartes = melanger([...Array(16).keys()]);
  const acts = melanger([...Array(12).keys()]);
  const taille = opts.taille || 3;
  const bancs = taille === 4 ? melanger([...Array(16).keys()]).slice(0, 2 + ((rnd()*5)|0)) : [];
  const s = M.nouvelle({mainJ:cartes.slice(0,5), mainIA:cartes.slice(5,10), pioche:cartes.slice(10), actJ: opts.actions?acts[0]:-1, actIA: opts.actions?acts[1]:-1, premier: rnd()<.5?0:1, proche:opts.proche, coalition:opts.coalition, taille, bancs, diagonales: opts.diag});
  if (s.vides !== taille*taille - bancs.length) throw new Error('vides');
  let garde = 0;
  while (!s.fin && garde++ < 60){
    const p = s.trait;
    // vue de chaque camp : on joue « IA » des deux côtés en inversant les camps
    const vue = p === M.IA ? s : miroir(s);
    const inconnues = opts.transparence ? null : inconnuesPour(vue);
    const t0 = Date.now();
    const act = M.choisirAction(vue, p === M.IA ? nivIA : nivJ, inconnues, rnd);
    if (act){ stats.actions++; M.jouerAction(s, s.act[p], act.arg, []); verifier(s); if (s.fin || s.trait !== p) continue; }
    const vue2 = p === M.IA ? s : miroir(s);
    const coup = M.choisirPose(vue2, p === M.IA ? nivIA : nivJ, opts.transparence ? null : inconnuesPour(vue2), rnd);
    const dt = Date.now() - t0; const k = (p===M.IA?nivIA:nivJ); stats.tempsMax[k] = Math.max(stats.tempsMax[k]||0, dt);
    if (!coup) throw new Error('pas de coup');
    if (s.mains[p].indexOf(coup.carte) < 0) throw new Error('carte pas en main ' + coup.carte);
    if (s.own[coup.cell] !== -1) throw new Error('siège non libre ' + coup.cell + ' (' + s.own[coup.cell] + ')');
    const ev = [];
    M.poser(s, coup.carte, coup.cell, ev); stats.poses++;
    ev.forEach(e => { if (stats[e.t] !== undefined && e.cells.length) stats[e.t]++; if (e.t === 'base' && e.diag && e.diag.length) stats.diagonales = (stats.diagonales||0) + e.diag.length; if (e.t === 'base') stats.prises = (stats.prises||0) + e.cells.length; });
    verifier(s);
  }
  if (!s.fin) throw new Error('partie non finie');
  const owned = [0,0]; for (let i=0;i<s.N;i++) if (s.own[i] >= 0) owned[s.own[i]]++;
  for (const b of bancs) if (s.own[b] !== M.BANC) throw new Error('banc occupé');
  if (taille === 4 && (s.mains[0].length || s.mains[1].length)) throw new Error('cartes restées en main sur le grand plateau');
  stats.finTour = (stats.finTour||0) + s.tour;
  if (owned[0] + s.mains[0].length !== s.score[0] || owned[1] + s.mains[1].length !== s.score[1]) throw new Error('score incohérent ' + owned + ' ' + s.mains.map(m=>m.length) + ' ' + s.score);
  stats.parties++;
  if (s.score[0] > s.score[1]) stats.vJ++; else if (s.score[1] > s.score[0]) stats.vIA++; else stats.nul++;
}
function verifier(s){ if (s.score[0] + s.score[1] !== 10) throw new Error('somme != 10'); }
// Miroir : échange les camps pour réutiliser l'IA côté joueur
function miroir(s){
  const e = M.cloner(s);
  for (let i=0;i<e.N;i++){ if (e.own[i]>=0) e.own[i] = 1-e.own[i]; if (e.org[i]>=0) e.org[i]=1-e.org[i]; }
  e.mains = [e.mains[1], e.mains[0]]; e.act = [e.act[1], e.act[0]]; e.score=[e.score[1],e.score[0]]; e.dbl=[e.dbl[1],e.dbl[0]]; e.quota=[e.quota[1],e.quota[0]];
  e.trait = 1 - e.trait; if (e.susp>=0) e.susp = 1-e.susp; if (e.bracCible>=0) e.bracCible = 1-e.bracCible; if (e.revCible>=0) e.revCible=1-e.revCible;
  return e;
}
function inconnuesPour(vue){
  const vus = new Set(vue.mains[1]); for (let i=0;i<vue.N;i++) if (vue.crd[i]>=0) vus.add(vue.crd[i]);
  return [...Array(16).keys()].filter(c => !vus.has(c));
}
const args = process.argv.slice(2);
const N = +args[0] || 50;
const opts = {actions: true, proche: true, coalition: true, transparence: args.includes('transparence'), taille: args.includes('grand') ? 4 : 3, diag: args.includes('diag')};
const nivJ = args[1] || 'assemblee', nivIA = args[2] || 'assemblee';
const t = Date.now();
for (let i=0;i<N;i++) partie(nivJ, nivIA, opts);
console.log(nivJ, 'vs', nivIA, JSON.stringify(stats), 'en', Date.now()-t, 'ms');
