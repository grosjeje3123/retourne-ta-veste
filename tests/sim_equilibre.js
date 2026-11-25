// Combien pèse la donne ? Parties IA contre IA, même niveau, en notant l'écart de points entre les deux mains.
const M = require('/home/claude/carte2/moteur.js');
const vals = JSON.parse(require('fs').readFileSync('/home/claude/tests/vals.json','utf8'));
M.charger(vals);
let seed = +process.argv[3] || 777; function rnd(){ seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
function melanger(t){ for (let i=t.length-1;i>0;i--){ const j=(rnd()*(i+1))|0; [t[i],t[j]]=[t[j],t[i]]; } return t; }
const tot = c => vals[c].reduce((a,b)=>a+b,0);
function miroir(s){
  const e = M.cloner(s);
  for (let i=0;i<e.own.length;i++){ if (e.own[i]>=0) e.own[i] = 1-e.own[i]; if (e.org[i]>=0) e.org[i]=1-e.org[i]; }
  e.mains = [e.mains[1], e.mains[0]]; e.act = [e.act[1], e.act[0]]; e.score=[e.score[1],e.score[0]]; e.dbl=[e.dbl[1],e.dbl[0]];
  e.trait = 1 - e.trait; if (e.susp>=0) e.susp = 1-e.susp; if (e.bracCible>=0) e.bracCible = 1-e.bracCible; if (e.revCible>=0) e.revCible=1-e.revCible;
  if (e.quota) e.quota = [e.quota[1], e.quota[0]];
  return e;
}
function inconnuesPour(vue){
  const vus = new Set(vue.mains[1]); for (let i=0;i<vue.own.length;i++) if (vue.crd[i]>=0) vus.add(vue.crd[i]);
  return [...Array(vals.length).keys()].filter(c => !vus.has(c));
}
function donne(mode){
  const c = melanger([...Array(vals.length).keys()]);
  if (mode !== 'equilibre') return [c.slice(0,5), c.slice(5,10), c.slice(10)];
  const dix = c.slice(0,10), T = dix.reduce((a,x)=>a+tot(x),0);
  let best = [], bd = Infinity;
  for (let m = 0; m < 1024; m++){ let n=0,sx=0; for (let k=0;k<10;k++) if (m>>k&1){ n++; sx+=tot(dix[k]); } if (n!==5 || !(m&1)) continue;
    const d = Math.abs(2*sx - T); if (d < bd){ bd = d; best = [m]; } else if (d === bd) best.push(m); }
  const m = best[(rnd()*best.length)|0], a = [], b = [];
  for (let k=0;k<10;k++) (m>>k&1 ? a : b).push(dix[k]);
  return rnd() < .5 ? [a, b, c.slice(10)] : [b, a, c.slice(10)];
}
const mode = process.argv[2] || 'hasard', N = +process.argv[4] || 200, niv = process.argv[5] || 'assemblee', taille = +process.argv[6] || 3;
let ecarts = [], fortGagne = 0, fortPerd = 0, nul = 0;
const t0 = Date.now();
for (let g = 0; g < N; g++){
  const [mj, mi, pi] = donne(mode);
  const acts = melanger([...Array(12).keys()]);
  const blocs = taille === 4 ? melanger([...Array(16).keys()]).slice(0, 2 + ((rnd()*5)|0)) : [];
  const s = M.nouvelle({mainJ: mj, mainIA: mi, pioche: pi, actJ: acts[0], actIA: acts[1], premier: rnd()<.5?0:1, proche: true, coalition: true, taille, blocs});
  let garde = 0;
  while (!s.fin && garde++ < 60){
    const p = s.trait, vue = p === M.IA ? s : miroir(s);
    const act = M.choisirAction(vue, niv, inconnuesPour(vue), rnd);
    if (act){ M.jouerAction(s, s.act[p], act.arg, []); if (s.fin || s.trait !== p) continue; }
    const vue2 = p === M.IA ? s : miroir(s);
    const coup = M.choisirPose(vue2, niv, inconnuesPour(vue2), rnd);
    M.poser(s, coup.carte, coup.cell, []);
  }
  const e = mj.reduce((a,x)=>a+tot(x),0) - mi.reduce((a,x)=>a+tot(x),0);
  ecarts.push(Math.abs(e));
  if (e === 0 || s.score[0] === s.score[1]) { if (s.score[0] === s.score[1]) nul++; continue; }
  if ((e > 0) === (s.score[0] > s.score[1])) fortGagne++; else fortPerd++;
}
ecarts.sort((a,b)=>a-b);
const moy = ecarts.reduce((a,b)=>a+b,0)/ecarts.length;
console.log(mode, 'taille', taille, niv, 'parties', N, '| écart moyen', moy.toFixed(1), '| médiane', ecarts[N>>1], '| ≥ 20 points :', Math.round(100*ecarts.filter(x=>x>=20).length/N)+' %',
  '| la main la plus forte gagne', fortGagne, 'perd', fortPerd, 'nuls', nul, '→', Math.round(100*fortGagne/(fortGagne+fortPerd))+' %', '|', Date.now()-t0, 'ms');
