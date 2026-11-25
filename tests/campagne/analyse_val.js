global.window = {}; require('/home/claude/carte2/donnees.js'); const D = window.APDA;
const fs = require('fs'); const B = ['val1.jsonl', 'val2.jsonl'].flatMap(f => fs.readFileSync(f, 'utf8').trim().split('\n').map(JSON.parse));
const n = B.length, nul = B.filter(r => r.w < 0).length, p1 = B.filter(r => r.w >= 0 && r.w === r.premier).length;
console.log(`${n} parties · ballottage ${(100 * nul / n).toFixed(1)} % · le premier gagne ${(100 * p1 / (n - nul)).toFixed(1)} % des parties tranchées (± ${(196 * Math.sqrt(0.25 / (n - nul))).toFixed(1)})`);
for (let k = 3; k <= 5; k++) { const t = B.filter(r => r.nb === k), nu = t.filter(r => r.w < 0).length, p = t.filter(r => r.w >= 0 && r.w === r.premier).length; console.log(`  ${k} bloquées : 1er ${(100 * p / (t.length - nu)).toFixed(1)} % · ${t.length}`); }
const A = D.ACTIONS.map(() => ({ n: 0, p: 0, j: 0 }));
B.forEach(r => [[r.a0, 0], [r.a1, 1]].forEach(([a, c]) => { A[a].n++; A[a].p += r.w === c ? 1 : r.w < 0 ? 0.5 : 0; if (r.joue[c] >= 0) A[a].j++; }));
A.map((x, i) => [D.ACTIONS[i].court, x.p / x.n, x.j / x.n, x.n]).sort((a, b) => b[1] - a[1]).forEach(l => console.log(`${l[0].padEnd(15)} ${(100 * l[1]).toFixed(1)} % · jouée ${(100 * l[2]).toFixed(0)} % · ${l[3]}`));
const v = A.map(x => x.p / x.n); const m = v.reduce((a, b) => a + b) / v.length; console.log('écart-type entre cartes action', (100 * Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length)).toFixed(1), 'pts');
