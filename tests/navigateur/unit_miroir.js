// Face-à-face : jouer un coup puis retourner l'état = retourner l'état puis jouer le même coup (aucun champ de camp oublié).
global.window = {}; require('/home/claude/carte2/donnees.js'); const D = window.APDA;
const M = require('/home/claude/carte2/moteur.js'); M.charger(D.CANDIDATS.map(c => c.valeurs));
let ok = 0, ko = 0, premierKO = null; const v = (n, c) => { if (c) ok++; else { ko++; if (!premierKO) premierKO = n; } };
const gen = g => { let x = g; return () => (x = (x * 48271) % 2147483647) / 2147483647; };
const canon = s => { const e = M.exporter(s); return JSON.stringify(Object.keys(e).filter(k => e[k] !== undefined).sort().map(k => [k, e[k]])); };
let seed = 99; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const NA = D.ACTIONS.length; let coups = 0, actions = 0;
for (let g = 0; g < 600; g++) {
  const fl = g % 4 !== 3, [m0, m1, pi] = fl ? M.donneFleches(rnd) : [[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13]];
  const s = M.nouvelle({ mainJ: m0, mainIA: m1, pioche: pi.slice(0, 6), actJ: g % NA, actIA: (g * 7 + 3) % NA, premier: g % 2, taille: 4, bancs: [g % 16, (g * 5 + 2) % 16].filter((x, i, t) => t.indexOf(x) === i), fleches: fl, alea: fl ? rnd : null, ordre: true });
  v('double miroir ' + g, canon(M.miroir(M.miroir(s))) === canon(s));
  let garde = 0;
  while (!s.fin && garde++ < 60) {
    const p = s.trait, gr = (rnd() * 1e9) | 0;
    // une action jouable du camp au trait, une fois sur deux
    if (s.act[p] >= 0 && rnd() < 0.5) {
      const vue = p === M.IA ? s : M.miroir(s), a = M.choisirAction(vue, 'mairie', null, rnd);
      if (a) {
        const A1 = M.cloner(s); A1.alea = s.fl ? gen(gr) : null; Object.assign(A1, { tranche: s.tranche, saisies: s.saisies, oubliCompte: s.oubliCompte });
        const B1 = M.miroir(A1); B1.alea = s.fl ? gen(gr) : null;
        M.jouerAction(A1, s.act[p], a.arg, []); M.jouerAction(B1, B1.act[1 - p], a.arg, []);
        v('action ' + D.ACTIONS[s.act[p]].court + ' partie ' + g, canon(M.miroir(B1)) === canon(A1)); actions++;
        s.alea = s.fl ? gen(gr) : null; M.jouerAction(s, s.act[p], a.arg, []); continue;
      }
    }
    const vue = p === M.IA ? s : M.miroir(s), c = M.choisirPose(vue, 'mairie', null, rnd); if (!c) break;
    const A1 = M.miroir(M.miroir(s)); A1.alea = s.fl ? gen(gr) : null;
    const B1 = M.miroir(s); B1.alea = s.fl ? gen(gr) : null;
    M.poser(A1, c.carte, c.cell, []); M.poser(B1, c.carte, c.cell, []);
    v('pose partie ' + g, canon(M.miroir(B1)) === canon(A1)); coups++;
    s.alea = s.fl ? gen(gr) : null; M.poser(s, c.carte, c.cell, []);
  }
  v('gagnant symétrique ' + g, M.gagnant(M.miroir(s)) === (M.gagnant(s) < 0 ? M.gagnant(s) : 1 - M.gagnant(s)));
}
console.log(`unit_miroir : ${ok} OK, ${ko} KO (${coups} poses, ${actions} actions)` + (premierKO ? ' · premier KO : ' + premierKO : ''));
process.exit(ko ? 1 : 0);
