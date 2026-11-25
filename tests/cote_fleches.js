// Cote des cartes en Flèches : part de victoires quand la carte est en main (parties simulées), puis ajustement linéaire sur Attaque, Défense et nombre de flèches.
global.window = {}; require('/home/claude/carte2/donnees.js'); const C = window.APDA.CANDIDATS;
const M = require('/home/claude/carte2/moteur.js'); M.charger(C.map(c => c.valeurs));
const st = JSON.parse(require('fs').readFileSync(process.argv[2]));
const pop = x => { let n = 0; while (x) { n += x & 1; x >>= 1; } return n; };
const L = C.map((c, i) => { const [a, d] = M.statsFleches(c.valeurs), nf = pop(M.fleches(i)), [v, n, p] = st[i], tot = v + n + p; return { nom: c.court, a, d, nf, y: (v + n / 2) / tot, tot }; });
// moindres carrés : y = b0 + b1·a + b2·d + b3·nf
function regress(X, y) { const k = X[0].length, A = Array.from({ length: k }, () => Array(k + 1).fill(0));
  X.forEach((x, r) => { for (let i = 0; i < k; i++) { for (let j = 0; j < k; j++) A[i][j] += x[i] * x[j]; A[i][k] += x[i] * y[r]; } });
  for (let i = 0; i < k; i++) { let m = i; for (let r = i + 1; r < k; r++) if (Math.abs(A[r][i]) > Math.abs(A[m][i])) m = r; [A[i], A[m]] = [A[m], A[i]];
    for (let r = 0; r < k; r++) if (r !== i) { const f = A[r][i] / A[i][i]; for (let j = i; j <= k; j++) A[r][j] -= f * A[i][j]; } }
  return A.map((row, i) => row[k] / row[i]); }
const y = L.map(l => l.y), moy = y.reduce((a, b) => a + b, 0) / y.length;
function essai(nom, f) { const X = L.map(f), b = regress(X, y); let sr = 0, st2 = 0; L.forEach((l, i) => { const p = X[i].reduce((s, x, j) => s + x * b[j], 0); sr += (l.y - p) ** 2; st2 += (l.y - moy) ** 2; }); console.log(nom.padEnd(28), 'R² =', (1 - sr / st2).toFixed(3), 'coef', b.map(x => x.toFixed(4)).join(' ')); return b; }
essai('attaque seule', l => [1, l.a]); essai('défense seule', l => [1, l.d]); essai('flèches seules', l => [1, l.nf]);
essai('attaque + défense', l => [1, l.a, l.d]);
const b = essai('attaque + défense + flèches', l => [1, l.a, l.d, l.nf]);
essai('somme des 4 chiffres', l => [1, C[L.indexOf(l)].valeurs.reduce((s, x) => s + x, 0)]);
L.sort((p, q) => q.y - p.y);
console.log('meilleures :', L.slice(0, 6).map(l => `${l.nom} ${l.a}/${l.d} ${l.nf}fl ${(100 * l.y).toFixed(0)}%`).join(' · '));
console.log('plus faibles :', L.slice(-6).map(l => `${l.nom} ${l.a}/${l.d} ${l.nf}fl ${(100 * l.y).toFixed(0)}%`).join(' · '));
console.log('étendue', (100 * L[L.length - 1].y).toFixed(0) + '% à ' + (100 * L[0].y).toFixed(0) + '%', '· parties par carte ~', Math.round(L.reduce((s, l) => s + l.tot, 0) / L.length));
