// Sauvegarde de la partie en cours : exporter → JSON → importer doit redonner un état identique, et la suite de la partie doit être la même.
global.window = {}; require('/home/claude/carte2/donnees.js'); const D = window.APDA;
const M = require('/home/claude/carte2/moteur.js'); M.charger(D.CANDIDATS.map(c => c.valeurs));
let ok = 0, ko = 0; const verifier = (n, c) => { if (c) ok++; else { ko++; console.log('KO', n); } };
let seed = 77; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const graine = g => { let x = g; return () => (x = (x * 48271) % 2147483647) / 2147483647; };
function finir(s, g) {   // termine la partie de façon déterministe (l'IA joue les deux camps sur son propre état)
  const r = graine(g); s.alea = s.fl ? r : null; let garde = 0;
  while (!s.fin && garde++ < 80) {
    if (s.act[s.trait] >= 0 && s.trait === M.IA) { const a = M.choisirAction(s, 'assemblee', null, r); if (a) { M.jouerAction(s, s.act[s.trait], a.arg, []); continue; } }
    const c = M.choisirPose(s, 1, null, r); if (!c) break; M.poser(s, c.carte, c.cell, []);
  }
  const e = M.exporter(s); return JSON.stringify(Object.keys(e).sort().map(k => [k, e[k]]));
}
for (let g = 0; g < 200; g++) {
  const fl = g % 2 === 0, taille = g % 3 === 0 ? 3 : 4;
  const [m0, m1, pi] = fl ? M.donneFleches(rnd) : [[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12]];
  const s = M.nouvelle({ mainJ: m0, mainIA: m1, pioche: pi.slice(0, 6), actJ: g % 24, actIA: (g * 7) % 24, premier: g % 2, taille, bancs: taille === 4 ? [g % 16] : [], fleches: fl, alea: fl ? rnd : null, ordre: true });
  const k = (rnd() * 6) | 0; let garde = 0;
  while (!s.fin && garde++ < k) { const c = M.choisirPose(s, 1, null, rnd); if (!c) break; M.poser(s, c.carte, c.cell, []); }
  const txt = JSON.stringify(M.exporter(s)), t = M.importer(JSON.parse(txt));
  verifier('aller-retour identique ' + g, JSON.stringify(M.exporter(t)) === txt);
  verifier('tableaux typés rétablis ' + g, t.own instanceof Int8Array && t.bst instanceof Int8Array && t.prot instanceof Uint8Array && t.own.length === t.N);
  verifier('grille rétablie ' + g, t.vs === s.vs);
  verifier('dés rétablis ' + g, fl ? typeof t.alea === 'function' : t.alea === null);
  verifier('même suite de partie ' + g, finir(M.cloner(Object.assign(s, {})), g) === finir(t, g));
}
let refus = 0; try { M.importer({ N: 9, own: [1, 2] }); } catch (e) { refus = 1; }
verifier('sauvegarde abîmée refusée', refus);
console.log(`unit_sauvegarde : ${ok} OK, ${ko} KO`); process.exit(ko ? 1 : 0);
