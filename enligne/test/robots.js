'use strict';
/* Banc d'essai du serveur : deux robots jouent des parties entières, cartes action comprises.
   Ils choisissent leurs coups avec le moteur, mais uniquement à partir de ce que le serveur leur montre.
   On vérifie à chaque coup que les deux vues racontent la même partie (l'une retournée par rapport à
   l'autre), que la main adverse ne fuit jamais, et que le serveur ne refuse aucun coup légal.
   Usage : node test/robots.js [parties] [port] */
const WebSocket = require('ws');
const fs = require('fs'), path = require('path'), vm = require('vm');
const SITE = path.join(__dirname, '..', 'site');
const bac = { window: {} }; vm.createContext(bac);
vm.runInContext(fs.readFileSync(path.join(SITE, 'donnees.js'), 'utf8'), bac);
const M = require(path.join(SITE, 'moteur.js'));
M.charger(bac.window.APDA.CANDIDATS.map(c => c.valeurs));
const A = M.A, NOMS_A = Object.keys(A);
const PARTIES = Number(process.argv[2]) || 30, PORT = Number(process.argv[3]) || 8099;
const stats = { parties: 0, coups: 0, actions: {}, refus: [], ecarts: [], fuites: [], scores: [] };

function etatDepuisVue(v) {
  const s = M.cloner(Object.assign({}, v, { vs: M.grille(v.taille, !!v.diag) }));
  s.own = Int8Array.from(v.own); s.crd = Int8Array.from(v.crd); s.org = Int8Array.from(v.org);
  s.bst = Int8Array.from(v.bst); s.prot = Uint8Array.from(v.prot);
  return s;
}
const un = t => t[Math.floor(Math.random() * t.length)];
const inv = x => (x === 0 || x === 1) ? 1 - x : x;

function robot(nom, premier) {
  return new Promise((ok, ko) => {
    const ws = new WebSocket(`ws://127.0.0.1:${PORT}/ws`, { headers: { Origin: `http://127.0.0.1:${PORT}` } });
    const r = { nom, ws, vue: null, numero: 0, fin: false, plan: null, code: null, envoyer: m => ws.send(JSON.stringify(m)) };
    ws.on('open', () => { r.envoyer(premier); ok(r); });
    ws.on('error', ko);
    ws.on('message', d => {
      const m = JSON.parse(d);
      if (m.t === 'cree') r.code = m.code;
      if (m.t === 'erreur') stats.refus.push(`${nom}: ${m.raison}`);
      if (m.t === 'plan' && r.plan) { const f = r.plan; r.plan = null; f(m.top); }
      if (m.t === 'debut') { r.n = 0; r.legit = new Set(); r.transparence = m.opts.transparence; }
      if (m.t === 'coup') {
        r.n = (r.n || 0) + 1;
        // Seules cartes adverses qu'on a le droit de voir : celle qu'on a mise sous bracelet, celle que la Passation renvoie en main
        if (m.coup.qui === 'moi' && (m.coup.a === A.SARKO || m.coup.a === A.THEVENOUD)) r.legit.add(m.coup.arg);
        (m.evts || []).forEach(e => { if (e.t === 'passation' && m.coup.qui === 'adv') r.legit.add(e.ancienne); });
        // Le Homard : la carte qu'on a invitée à dîner rentre, à découvert, dans la main adverse
        (m.evts || []).forEach(e => { if (e.t === 'homard' && m.coup.qui === 'moi') r.legit.add(e.carte); });
      }
      if (m.vue) {
        r.vue = m.vue; r.numero = m.numero;
        const v = m.vue, ouverte = v.fin || r.transparence || (v.revT > 0 && v.revCible === 1);
        if (!ouverte) v.mains[1].forEach(c => { if (c >= 0 && !r.legit.has(c)) stats.fuites.push(`${nom} voit ${c}`); });
        if (r.surVue) r.surVue();
      }
    });
  });
}

function choisir(r) {
  const v = r.vue, s = etatDepuisVue(v);
  if (v.fin || v.trait !== 0) return null;
  if (v.act[0] >= 0 && Math.random() < 0.45) {
    const a = v.act[0], c = M.ciblesAction(s, a);
    if (c.cibles) {
      let arg = null;
      switch (a) {
        case A.BORNE: case A.GAULLE: case A.LARCHER: case A.RUGY: case A.MONTCHALIN: case A.ARNAULT: case A.MARCHAIS: case A.CAHUZAC: case A.ATTALI: arg = un(c.cibles); break;
        case A.VALLS: case A.MACRON: case A.MONTEBOURG: arg = [un(c.cibles[0]), un(c.cibles[1])]; break;
        case A.SARKO: case A.THEVENOUD: arg = Math.floor(Math.random() * v.mains[1].length); break;   // une place dans la main adverse
        case A.BAYROU: return { t: 'plan', a };
      }
      return { t: 'action', numero: r.numero, a, arg };
    }
  }
  const libres = []; for (let i = 0; i < v.N; i++) if (v.own[i] === -1) libres.push(i);
  return { t: 'poser', numero: r.numero, carte: un(v.mains[0]), cell: un(libres) };
}

function comparer(a, b, quand) {
  const va = a.vue, vb = b.vue;
  if (!va || !vb || a.numero !== b.numero || a.n !== b.n) return;   // l'un des deux n'a pas encore reçu le dernier coup
  const pareil = va.own.every((x, i) => x === inv(vb.own[i])) && va.crd.every((x, i) => x === vb.crd[i]) &&
    va.score[0] === vb.score[1] && va.score[1] === vb.score[0] && va.trait === inv(vb.trait) && va.fin === vb.fin &&
    va.mains[0].length === vb.mains[1].length && va.mains[1].length === vb.mains[0].length &&
    va.vacc === inv(vb.vacc) && va.procl === inv(vb.procl) && va.show === vb.show && va.bst.every((x, i) => x === vb.bst[i]) && va.act[0] === (vb.act[1] === 99 ? va.act[0] : vb.act[1]);
  if (!pareil) stats.ecarts.push(quand);
}

const P = require(path.join(SITE, 'profil.js'));
const crypto = require('crypto');
// Une petite équipe de robots aux profils fixes (le serveur limite les créations de profils par adresse)
const EQUIPE = Array.from({ length: 6 }, (_, k) => ({ secret: crypto.randomBytes(24).toString('base64url'), pseudo: 'Robot ' + (k + 1) + ' ' + crypto.randomBytes(3).toString('hex'), avatar: P.avatarAuHasard() }));
let tourDeRole = 0;
function profilRobot() { return EQUIPE[tourDeRole++ % EQUIPE.length]; }
async function unePartie(opts) {
  const h = await robot('hôte', { t: 'creer', opts, profil: profilRobot() });
  for (let k = 0; !h.code; k++) { if (k > 400) throw new Error('création refusée : ' + stats.refus.slice(-1)); await new Promise(r => setTimeout(r, 5)); }
  const g = await robot('invité', { t: 'rejoindre', code: h.code, profil: profilRobot() });
  const fin = new Promise(resolve => {
    const tour = () => {
      comparer(h, g, `partie ${stats.parties + 1}, coup ${stats.coups}`);
      if (h.vue && g.vue && h.vue.fin && g.vue.fin && h.numero === g.numero && h.n === g.n) {
        if (!h.compte) { h.compte = true; stats.scores.push(h.vue.score[0] + '-' + h.vue.score[1]); }
        return resolve();
      }
      for (const r of [h, g]) {
        if (!r.vue || r.attend) continue;
        const coup = choisir(r);
        if (!coup) continue;
        r.attend = true;
        if (coup.t === 'plan') {
          r.plan = top => {
            const echange = Math.random() < 0.6 && top.length && r.vue.mains[0].length ? [un(top), un(r.vue.mains[0])] : null;
            r.envoyer({ t: 'action', numero: r.numero, a: A.BAYROU, arg: echange });
          };
          r.envoyer({ t: 'plan' });
          stats.actions.BAYROU = (stats.actions.BAYROU || 0) + 1;
        } else {
          if (coup.t === 'action') { const n = NOMS_A[coup.a]; stats.actions[n] = (stats.actions[n] || 0) + 1; }
          stats.coups++;
          r.envoyer(coup);
        }
      }
    };
    for (const r of [h, g]) r.surVue = () => { r.attend = false; setImmediate(tour); };
    setImmediate(tour);
  });
  const delai = new Promise((_, ko) => setTimeout(() => ko(new Error('partie bloquée')), 15000));
  await Promise.race([fin, delai]);
  h.ws.close(); g.ws.close();
  stats.parties++;
}

(async () => {
  const reglages = [
    {}, { plateau: 'classique' }, { transparence: true }, { diagonales: false, proche: false },
    { distribution: 'hasard', lieu: 'senat' }, { coalition: false, plateau: 'classique', diagonales: false }
  ];
  const t0 = Date.now();
  for (let k = 0; k < PARTIES; k++) {
    try { await unePartie(reglages[k % reglages.length]); }
    catch (e) { console.log('ÉCHEC partie', k + 1, e.message); stats.ecarts.push('bloquée ' + (k + 1)); }
  }
  console.log(`${stats.parties} parties, ${stats.coups} coups en ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  console.log('cartes action jouées :', JSON.stringify(stats.actions));
  console.log('écarts entre les deux vues :', stats.ecarts.length ? stats.ecarts.slice(0, 5) : 'aucun');
  console.log('coups refusés :', stats.refus.length ? stats.refus.slice(0, 8) : 'aucun');
  console.log('cartes adverses vues sans en avoir le droit :', stats.fuites.length ? stats.fuites.slice(0, 5) : 'aucune');
  console.log('scores :', stats.scores.slice(0, 12).join(' '));
  process.exit(stats.ecarts.length || stats.refus.length || stats.fuites.length ? 1 : 0);
})();
