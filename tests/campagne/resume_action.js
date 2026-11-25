global.window = {}; require('/home/claude/carte2/donnees.js'); const D = window.APDA;
const fs = require('fs'); const t = {};
process.argv.slice(2).forEach(f => fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).forEach(r => {
  const x = t[r.a0] = t[r.a0] || { n: 0, p: 0, j: 0, prem: 0, np: 0 }; x.n++; x.p += r.w === 0 ? 1 : r.w < 0 ? 0.5 : 0; if (r.joue) x.j++;
  if (r.w >= 0) { x.np++; if (r.w === r.premier) x.prem++; } }));
Object.keys(t).forEach(a => { const x = t[a], p = x.p / x.n; console.log(`${D.ACTIONS[a].court.padEnd(15)} ${(100 * p).toFixed(1)} % ± ${(196 * Math.sqrt(p * (1 - p) / x.n)).toFixed(1)} · jouée ${(100 * x.j / x.n).toFixed(0)} % · ${x.n} parties`); });
