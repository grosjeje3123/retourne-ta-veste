// Cherche, avec le moteur lui-même, des cartes qui rendent chaque leçon du tutoriel exacte.
global.window = {}; require('/home/claude/carte2/donnees.js'); const D = window.APDA, C = D.CANDIDATS;
const M = require('/home/claude/carte2/moteur.js'); const V = C.map(c => c.valeurs); M.charger(V);
const J = M.J, IA = M.IA, n = C.length, nom = i => C[i].court + '[' + V[i].join(',') + ' ' + C[i].bloc + ']';
const H = 0, Dr = 1, B = 2, G = 3;
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const mel = t => { t = t.slice(); for (let i = t.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [t[i], t[j]] = [t[j], t[i]]; } return t; };
const SEUL = process.argv[2] || '';   // ex. Divers : casting sans gauche ni droite
const ids = mel([...Array(n).keys()]).filter(i => !SEUL || C[i].bloc === SEUL);
function etat(o, pre) {   // pré-poses : [joueur, carte, case]
  const s = M.nouvelle(Object.assign({ pioche: [], taille: 3, bancs: [] }, o));
  for (const [p, c, cell] of pre) { s.trait = p; s.poses = 1; M.poser(s, c, cell, []); }
  return s;
}
function pose(s, p, c, cell) { s.trait = p; s.poses = 1; const e = []; M.poser(s, c, cell, e); return e; }
// Leçon 1 : X (IA) au centre ; A à gauche prend X ; Y à droite la reprend ; B au-dessus la reprend. Marges nettes, blocs variés.
let l1 = null;
for (const X of ids) { if (l1) break; for (const A of ids) { if (l1) break; if (A === X || V[A][Dr] - V[X][G] < 2) continue;
  for (const Y of ids) { if (l1) break; if (Y === X || Y === A || V[Y][G] - V[X][Dr] < 2) continue;
    for (const Bc of ids) { if (Bc === X || Bc === A || Bc === Y || V[Bc][B] - V[X][H] < 2) continue;
      if (!SEUL && new Set([C[X].bloc, C[A].bloc, C[Y].bloc, C[Bc].bloc]).size < 4) continue;
      const s = M.nouvelle({ mainJ: [A, Bc], mainIA: [X, Y], pioche: [], premier: IA, taille: 3, bancs: [] });
      pose(s, IA, X, 4); const e1 = pose(s, J, A, 3); if (s.own[4] !== J) continue;
      pose(s, IA, Y, 5); if (s.own[4] !== IA || s.own[3] !== J) continue;
      pose(s, J, Bc, 1); if (s.own[4] !== J || s.own[5] !== IA) continue;
      l1 = { X, A, Y, B: Bc }; break; } } } }
console.log('Leçon 1 :', l1 && Object.entries(l1).map(([k, v]) => k + '=' + v + ' ' + nom(v)).join(' | '));
// Leçon 2 : IA pré-posées P(1) Q(3) R(5) T(7). C en 0 : À peu près d'accord sans être plus fort. IA pose U en 6 (rien ne bouge).
// D en 8 : Coalition sur R et T (sans être plus fort, ni à 1 près), puis T retourne U par effet domino.
let l2 = null; const pris = new Set(Object.values(l1 || {}));
const libres = SEUL ? ids : ids.filter(i => !pris.has(i));
for (const P of libres) { if (l2) break; for (const Q of libres) { if (l2) break; if (Q === P) continue;
  for (const Cc of libres) { if (l2) break; if (Cc === P || Cc === Q) continue;
    const d1 = V[P][G] - V[Cc][Dr], d2 = V[Q][H] - V[Cc][B]; if (!(d1 >= 0 && d1 <= 1 && d2 >= 0 && d2 <= 1) || d1 + d2 === 0) continue;   // jamais plus fort, à 1 près des deux côtés
    for (const R of libres) { if (l2) break; if ([P, Q, Cc].includes(R)) continue;
      for (const T of libres) { if (l2) break; if ([P, Q, Cc, R].includes(T)) continue;
        for (const Dd of libres) { if (l2) break; if ([P, Q, Cc, R, T].includes(Dd)) continue;
          const a = V[Dd][H], b = V[R][B], c = V[Dd][G], d = V[T][Dr];
          if (a + b !== c + d || a >= b || c >= d || Math.abs(a - b) <= 1 && Math.abs(c - d) <= 1) continue;
          for (const U of libres) { if ([P, Q, Cc, R, T, Dd].includes(U)) continue;
            if (!(V[T][G] > V[U][Dr])) continue;   // domino : T, retournée, bat U
            if (!SEUL && (new Set([P, Q, R, T, U].map(i => C[i].bloc)).size < 3 || C[Cc].bloc === C[Dd].bloc)) continue;
            const s = etat({ mainJ: [Cc, Dd], mainIA: [P, Q, R, T, U], premier: J, proche: true, coalition: true }, [[IA, P, 1], [IA, Q, 3], [IA, R, 5], [IA, T, 7]]);
            const e1 = pose(s, J, Cc, 0); if (!e1.some(x => x.t === 'proche') || e1.some(x => x.t === 'coalition' || x.t === 'domino') || s.own[1] !== J || s.own[3] !== J || s.own[5] !== IA || s.own[7] !== IA) continue;
            const e2 = pose(s, IA, U, 6); if (s.own[3] !== J || s.own[7] !== IA || s.own[6] !== IA || e2.some(x => x.cells && x.cells.length)) continue;
            const e3 = pose(s, J, Dd, 8); if (!e3.some(x => x.t === 'coalition') || !e3.some(x => x.t === 'domino') || e3.some(x => x.t === 'proche')) continue;
            if ([0, 1, 3, 5, 6, 7, 8].some(i => s.own[i] !== J)) continue;
            l2 = { P, Q, R, T, U, C: Cc, D: Dd, evts: e3.map(x => x.t).join(',') }; break; } } } } } } }
console.log('Leçon 2 :', l2 && Object.entries(l2).map(([k, v]) => k + '=' + (typeof v === 'number' ? v + ' ' + nom(v) : v)).join(' | '));
