'use strict';
/* Parties rapides et classement : file d'attente, résultats comptés, forfaits (abandon, temps écoulé),
   plafond par paire, pseudos uniques, effacement du profil, enregistrement sur disque.
   Lancer le serveur avec TEMPS_COUP=1500 et un dossier DONNEES vide. Usage : node test/classee.js [port] [dossier] */
const WebSocket = require('ws');
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const SITE = path.join(__dirname, '..', 'site');
const bac = { window: {} }; vm.createContext(bac);
vm.runInContext(fs.readFileSync(path.join(SITE, 'donnees.js'), 'utf8'), bac);
const M = require(path.join(SITE, 'moteur.js'));
M.charger(bac.window.APDA.CANDIDATS.map(c => c.valeurs));
const PORT = Number(process.argv[2]) || 8099, DOSSIER = process.argv[3] || '/tmp/hemi-donnees';
const pause = ms => new Promise(r => setTimeout(r, ms));
let echecs = 0;
function verifier(ok, quoi) { console.log((ok ? 'ok    ' : 'ÉCHEC ') + quoi); if (!ok) echecs++; }
function profil(nom) { return { secret: crypto.randomBytes(24).toString('base64url'), pseudo: nom, avatar: { i: 2, c: 1 } }; }

function client(p) {
  return new Promise(ok => {
    const ws = new WebSocket(`ws://127.0.0.1:${PORT}/ws`, { headers: { Origin: `http://127.0.0.1:${PORT}` } });
    const c = { ws, p, recus: [], vue: null, numero: 0, joue: true, envoyer: m => ws.send(JSON.stringify(m)) };
    ws.on('message', d => {
      const m = JSON.parse(d); c.recus.push(m);
      if (m.vue) { c.vue = m.vue; c.numero = m.numero; if (c.joue) setImmediate(() => jouer(c)); }
    });
    ws.on('open', () => ok(c));
  });
}
function jouer(c) {   // un coup légal au hasard quand c'est son tour
  const v = c.vue;
  if (!v || v.fin || v.trait !== 0 || c.envoye === c.recus.length) return;
  c.envoye = c.recus.length;
  const libres = []; for (let i = 0; i < v.N; i++) if (v.own[i] === -1) libres.push(i);
  c.envoyer({ t: 'poser', numero: c.numero, carte: v.mains[0][Math.floor(Math.random() * v.mains[0].length)], cell: libres[Math.floor(Math.random() * libres.length)] });
}
const dernier = (c, t) => [...c.recus].reverse().find(m => m.t === t);
async function attendre(f, ms = 4000) { for (let t = 0; t < ms; t += 20) { if (f()) return true; await pause(20); } return false; }
async function classement(c) { const n = c.recus.length; c.envoyer({ t: 'classement', profil: { secret: c.p.secret } }); await attendre(() => c.recus.slice(n).some(m => m.t === 'classement')); return dernier(c, 'classement'); }

(async () => {
  const A = await client(profil('Sénatrice testeuse')), B = await client(profil('Député testeur'));
  // 1. File d'attente : A attend, B arrive, la partie démarre
  A.envoyer({ t: 'chercher', profil: A.p });
  await attendre(() => dernier(A, 'recherche'));
  verifier(!!dernier(A, 'recherche'), 'A attend dans la file');
  B.envoyer({ t: 'chercher', profil: B.p });
  await attendre(() => dernier(A, 'debut') && dernier(B, 'debut'));
  const dA = dernier(A, 'debut');
  verifier(dA && dA.classee && dA.adversaire && dA.adversaire.pseudo === 'Député testeur', 'partie classée trouvée, A voit le pseudo de B');
  verifier(dA.opts.plateau === 'grand' && dA.opts.secondTour === false && dA.tempsCoup === 1500, 'règles standard et chrono transmis');
  // 2. Partie jouée jusqu'au bout
  await attendre(() => A.vue && A.vue.fin && B.vue && B.vue.fin, 20000);
  const sa = A.vue.score[0], sb = B.vue.score[0];
  await pause(200);
  let cA = await classement(A);
  const att = sa > sb ? [1, 0, 0] : sa < sb ? [0, 1, 0] : [0, 0, 1];
  verifier(cA.moi && cA.moi.v === att[0] && cA.moi.d === att[1] && cA.moi.e === att[2], `résultat compté pour A (${sa}-${sb})`);
  verifier(cA.total === 2 && cA.top.length === 2, 'deux joueurs au classement');
  // 3. Revanche à deux, puis abandon de B en cours de partie : victoire de A par forfait
  A.joue = B.joue = false;   // sinon les robots finissent la revanche avant l'abandon
  A.envoyer({ t: 'revanche' }); B.envoyer({ t: 'revanche' });
  await attendre(() => A.numero === 2 && B.numero === 2);
  const avant = (await classement(A)).moi;
  B.envoyer({ t: 'quitter' });
  await attendre(() => A.recus.some(m => m.t === 'adversaire' && m.etat === 'parti'));
  const dep = A.recus.find(m => m.t === 'adversaire' && m.etat === 'parti');
  verifier(dep && dep.forfait === true, 'A est prévenu d’une victoire par forfait');
  cA = await classement(A);
  verifier(cA.moi.v === avant.v + 1, 'le forfait compte une victoire pour A');
  // 4. Temps écoulé : C laisse filer son tour
  const C = await client(profil('Préfète chronométrée')), D = await client(profil('Questeur patient'));
  C.joue = false; D.joue = true;
  C.envoyer({ t: 'chercher', profil: C.p }); await pause(50); D.envoyer({ t: 'chercher', profil: D.p });
  await attendre(() => dernier(C, 'debut'));
  if (C.vue.trait !== 0) { C.joue = false; await attendre(() => C.vue.trait === 0, 3000); }
  await attendre(() => dernier(C, 'forfait'), 5000);
  const fC = dernier(C, 'forfait'), fD = dernier(D, 'forfait');
  verifier(fC && fC.raison === 'temps' && fC.gagnant === false && fD && fD.gagnant === true, 'temps écoulé : C perd, D gagne par forfait');
  // 5. Pseudo déjà pris, effacement, onglet en double
  const E = await client(profil('Députée Testeuse'));   // même pseudo que celui de A, à la casse près ? non : A est « Sénatrice testeuse »
  E.p.pseudo = 'senatrice  TESTEUSE';
  E.envoyer({ t: 'chercher', profil: E.p });
  await attendre(() => dernier(E, 'erreur'));
  verifier(dernier(E, 'erreur') && dernier(E, 'erreur').code === 'profil', 'pseudo déjà pris (casse et espaces ignorés) : refusé');
  E.p.pseudo = 'Macron 2027';
  const n0 = E.recus.length; E.envoyer({ t: 'chercher', profil: E.p });
  await attendre(() => E.recus.length > n0);
  verifier(E.recus.slice(n0).some(m => m.t === 'erreur' && m.code === 'profil'), 'nom de personnalité : refusé par le serveur aussi');
  const F1 = await client(profil('Huissière en double')), F2 = await client(F1.p);
  F1.envoyer({ t: 'chercher', profil: F1.p }); await attendre(() => dernier(F1, 'recherche'));
  F2.envoyer({ t: 'chercher', profil: F1.p }); await attendre(() => dernier(F1, 'remplace'));
  verifier(!!dernier(F1, 'remplace'), 'même profil dans un autre onglet : l’ancien est prévenu');
  F2.envoyer({ t: 'annuler' }); await pause(100);
  // 6. Effacement du profil de D
  D.envoyer({ t: 'oublier', profil: { secret: D.p.secret } }); await attendre(() => dernier(D, 'oublie'));
  const cD = await classement(D);
  verifier(cD.moi === null && !cD.top.some(x => x[0] === 'Questeur patient'), 'profil effacé : absent du classement');
  // 7. Enregistrement sur disque
  await pause(1800);
  const disque = JSON.parse(fs.readFileSync(path.join(DOSSIER, 'joueurs.json'), 'utf8'));
  verifier(Object.values(disque).some(j => j.p === 'Sénatrice testeuse' && j.v + j.d + j.e === 2), 'profils et résultats enregistrés dans joueurs.json');
  verifier(!JSON.stringify(disque).includes(A.p.secret), 'le secret n’est pas stocké, seulement son empreinte');
  console.log(echecs ? echecs + ' échec(s)' : 'tout est bon');
  process.exit(echecs ? 1 : 0);
})();
