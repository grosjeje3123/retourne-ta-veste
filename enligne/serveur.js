'use strict';
/* Retourne ta veste en ligne : ce serveur sert le site et arbitre les parties entre deux joueurs.
   Le moteur du jeu (site/moteur.js) tourne ici. Chaque coup est vérifié avant d'être joué, et chaque
   joueur ne reçoit que ce qu'il a le droit de voir : la main adverse, la carte action adverse et la
   pioche restent cachées. Les deux joueurs voient la partie de leur côté (« moi » en bas, « l'adversaire »
   en haut) : le serveur retourne la vue pour l'invité.

   Deux façons de jouer : entre amis (un code à partager), ou en partie rapide contre le premier joueur
   en attente. Seules les parties rapides comptent au classement des victoires.
   Chaque joueur a un profil (pseudo et avatar) ; le navigateur garde un secret, le serveur n'en garde
   que l'empreinte. Les profils et le classement sont dans donnees/joueurs.json.

   Lancement : node serveur.js   (variables : PORT=8080, HOTE=127.0.0.1, APDA_DON=lien de dons, ORIGINES=liste,
   DONNEES=dossier des profils)
   Derrière Caddy (HTTPS), le serveur n'écoute qu'en local. */

const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT) || 8080;
const HOTE = process.env.HOTE || '127.0.0.1';
const SITE = path.join(__dirname, 'site');
const DON = process.env.APDA_DON || '';
const ORIGINES = (process.env.ORIGINES || '').split(',').map(s => s.trim()).filter(Boolean);
const DONNEES = process.env.DONNEES || path.join(__dirname, 'donnees');

const LIMITES = {
  salles: 2000,               // parties ouvertes en même temps
  connexionsParIP: 20,
  taille: 2048,               // octets par message
  messages: 40, fenetre: 10e3,// au plus 40 messages par 10 secondes et par connexion
  attenteInvite: 60 * 60e3,   // une partie créée attend son invité une heure
  inactivite: 2 * 60 * 60e3,  // une partie sans aucun coup pendant deux heures est fermée
  retour: 2 * 60e3,           // un joueur déconnecté a deux minutes pour revenir
  tempsCoup: Number(process.env.TEMPS_COUP) || 3 * 60e3,   // partie rapide : trois minutes pour jouer, sinon défaite par forfait
  profilsParIP: 30,           // nouveaux profils par heure et par adresse
  parPaireParJour: 5          // classement : au plus cinq parties comptées par jour entre deux mêmes joueurs
};
// Règles des parties rapides : les mêmes pour tout le monde
const STANDARD = { plateau: 'grand', lieu: 'hasard', distribution: 'equilibre', proche: true, coalition: true, diagonales: true, actions: true, transparence: false, secondTour: false };

/* ---------- Données et moteur ---------- */
const bac = { window: {} };
vm.createContext(bac);
vm.runInContext(fs.readFileSync(path.join(SITE, 'donnees.js'), 'utf8'), bac, { filename: 'donnees.js' });
const D = bac.window.APDA;
const M = require(path.join(SITE, 'moteur.js'));
M.charger(D.CANDIDATS.map(c => c.valeurs));
const NB = D.CANDIDATS.length, NB_ACT = D.ACTIONS.length, A = M.A;
const P = require(path.join(SITE, 'profil.js'));
const PERSONNALITES = D.CANDIDATS.map(c => [c.nom, c.court]).concat(D.ACTIONS.map(a => [a.nom || '', a.court || '']));
const LIEUX = ['hemicycle', 'republique', 'trocadero', 'senat', 'chateau', 'tele', 'buvette'];
const BANCS_PAR_LIEU = 4;

function hasard(n) { return crypto.randomInt(n); }
function melanger(t) { for (let i = t.length - 1; i > 0; i--) { const j = hasard(i + 1); [t[i], t[j]] = [t[j], t[i]]; } return t; }
function suite(n) { return Array.from({ length: n }, (_, i) => i); }
function force(c) { const v = D.CANDIDATS[c].valeurs; return v[0] + v[1] + v[2] + v[3]; }

// Dix cartes au hasard, coupées en deux mains de même total à 2 points près (comme dans le jeu solo)
function donneEquilibree() {
  for (let essai = 0; ; essai++) {
    const ids = melanger(suite(NB)), dix = ids.slice(0, 10);
    const T = dix.reduce((a, c) => a + force(c), 0);
    let best = [], bd = Infinity;
    for (let m = 1; m < 1024; m += 2) {
      let n = 0, sx = 0;
      for (let k = 0; k < 10; k++) if (m >> k & 1) { n++; sx += force(dix[k]); }
      if (n !== 5) continue;
      const d = Math.abs(2 * sx - T);
      if (d < bd) { bd = d; best = [m]; } else if (d === bd) best.push(m);
    }
    if (bd > 2 && essai < 40) continue;
    const choix = best[hasard(best.length)], a = [], b = [];
    for (let k = 0; k < 10; k++) (choix >> k & 1 ? a : b).push(dix[k]);
    return hasard(2) ? [a, b, ids.slice(10)] : [b, a, ids.slice(10)];
  }
}

function lireOpts(o) {
  o = o && typeof o === 'object' ? o : {};
  return {
    plateau: o.plateau === 'classique' ? 'classique' : 'grand',
    lieu: LIEUX.includes(o.lieu) ? o.lieu : 'hasard',
    distribution: o.distribution === 'hasard' ? 'hasard' : 'equilibre',
    proche: o.proche !== false, coalition: o.coalition !== false, diagonales: o.diagonales !== false,
    actions: o.actions !== false, transparence: !!o.transparence, secondTour: o.secondTour !== false
  };
}

/* ---------- Profils et classement ---------- */
const FICHIER = path.join(DONNEES, 'joueurs.json');
let joueurs = {};                 // empreinte du secret → { p: pseudo, a: avatar, v, d, e, c: créé, u: dernière partie }
try { joueurs = JSON.parse(fs.readFileSync(FICHIER, 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
const parCle = new Map();         // clé du pseudo → empreinte, pour l'unicité
for (const [id, j] of Object.entries(joueurs)) parCle.set(P.cle(j.p), id);
let motsEnPlus = [];              // donnees/mots-interdits.txt : un mot par ligne, rechargé toutes les cinq minutes
function lireMots() {
  try { motsEnPlus = fs.readFileSync(path.join(DONNEES, 'mots-interdits.txt'), 'utf8').split('\n').map(x => x.trim()).filter(x => x && x[0] !== '#'); }
  catch (e) { motsEnPlus = []; }
}
lireMots();
let enregistrement = null, cacheClassement = null;
function sauver() {
  cacheClassement = null;
  if (enregistrement) return;
  enregistrement = setTimeout(() => {
    enregistrement = null;
    fs.mkdirSync(DONNEES, { recursive: true });
    const tmp = FICHIER + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(joueurs));
    fs.renameSync(tmp, FICHIER);   // écriture atomique : jamais de fichier à moitié écrit
  }, 1500);
}
function empreinte(secret) { return crypto.createHash('sha256').update(secret).digest('base64url').slice(0, 24); }
const creations = new Map();      // adresse → horodatages des profils créés
// Vérifie le profil envoyé ; le crée ou le met à jour. Renvoie { id, j } ou { raison }
function identite(profil, ip) {
  if (!profil || typeof profil.secret !== 'string' || !/^[A-Za-z0-9_-]{20,100}$/.test(profil.secret)) return { raison: 'Profil illisible : recrée-le.' };
  const pseudo = P.nettoyer(profil.pseudo), raison = P.refus(pseudo, PERSONNALITES, motsEnPlus);
  if (raison) return { raison };
  if (!P.avatarValide(profil.avatar)) return { raison: 'Avatar inconnu.' };
  const id = empreinte(profil.secret), cle = P.cle(pseudo), pris = parCle.get(cle);
  if (pris && pris !== id) return { raison: 'Ce pseudo est déjà pris : choisis-en un autre.' };
  const avatar = { i: profil.avatar.i, c: profil.avatar.c };
  let j = joueurs[id];
  if (!j) {
    const t = Date.now(), h = (creations.get(ip) || []).filter(x => t - x < 3600e3);
    if (h.length >= LIMITES.profilsParIP) return { raison: 'Trop de profils créés depuis cette connexion, réessaie plus tard.' };
    h.push(t); creations.set(ip, h);
    j = joueurs[id] = { p: pseudo, a: avatar, v: 0, d: 0, e: 0, c: t, u: 0 };
    parCle.set(cle, id); sauver();
  } else if (j.p !== pseudo || j.a.i !== avatar.i || j.a.c !== avatar.c) {
    if (P.cle(j.p) !== cle) { parCle.delete(P.cle(j.p)); parCle.set(cle, id); }
    j.p = pseudo; j.a = avatar; sauver();
  }
  return { id, j };
}
function public_(id) { const j = joueurs[id]; return j ? { pseudo: j.p, avatar: j.a } : { pseudo: 'Invité', avatar: null }; }
function classement() {
  if (cacheClassement) return cacheClassement;
  cacheClassement = Object.entries(joueurs).filter(([, j]) => j.v + j.d + j.e > 0)
    .map(([id, j]) => ({ id, p: j.p, a: j.a, v: j.v, n: j.v + j.d + j.e }))
    .sort((x, y) => y.v - x.v || y.v / y.n - x.v / x.n || x.n - y.n || x.p.localeCompare(y.p));
  return cacheClassement;
}
const paires = new Map();         // « id:id:jour » → parties comptées aujourd'hui
function jour() { return new Date().toISOString().slice(0, 10); }
// Inscrit le résultat d'une partie rapide : gagnant 0 ou 1 (place dans la salle), -1 pour une égalité
function compter(salle, gagnant) {
  if (!salle.classee || salle.compte === salle.numero) return;
  salle.compte = salle.numero;
  const ids = salle.joueurs.map(x => x && x.id), [a, b] = ids;
  if (!a || !b || a === b || !joueurs[a] || !joueurs[b]) return;
  const k = [a, b].sort().join(':') + ':' + jour(), n = (paires.get(k) || 0) + 1;
  paires.set(k, n);
  if (n > LIMITES.parPaireParJour) return;
  if (gagnant < 0) { joueurs[a].e++; joueurs[b].e++; }
  else { joueurs[ids[gagnant]].v++; joueurs[ids[1 - gagnant]].d++; }
  joueurs[a].u = joueurs[b].u = Date.now();
  sauver();
}
function resultat(s) { return M.gagnant(s); }   // la carte « Proclamé » départage une égalité

/* ---------- Ce que voit chaque joueur ---------- */
// Pour l'invité (place 1), tout est retourné : il se voit en 0 (« toi ») et voit son adversaire en 1.
function vue(salle, p) {
  const s = salle.s, adv = 1 - p, inv = p === 1;
  const t = x => (x === 0 || x === 1) && inv ? 1 - x : x;
  const deux = arr => [arr[p], arr[adv]];
  const voitTout = s.fin || salle.opts.transparence || (s.revT > 0 && s.revCible === adv);
  const vus = salle.revelees[p];
  return {
    taille: s.taille, N: s.N, diag: s.diag,
    own: Array.from(s.own, t), crd: Array.from(s.crd), org: Array.from(s.org, t),
    bst: Array.from(s.bst), prot: Array.from(s.prot), quota: [-1, -1],
    // Main adverse : les cartes cachées deviennent des jetons négatifs, un par place (-2, -3…)
    mains: [s.mains[p].slice(), s.mains[adv].map((c, k) => voitTout || vus.has(c) ? c : -2 - k)],
    act: [s.act[p], s.act[adv] >= 0 ? (s.fin ? s.act[adv] : 99) : -1],
    trait: t(s.trait), poses: s.poses, dbl: deux(s.dbl),
    susp: t(s.susp), suspOn: s.suspOn, bracC: s.bracC, bracT: s.bracT, bracCible: t(s.bracCible),
    revCible: t(s.revCible), revT: s.revT, edito: s.edito, show: s.show, vacc: t(s.vacc), procl: t(s.procl), garde: t(s.garde), rep: t(s.rep), ouv: s.ouv, gel: deux(s.gel), aura: deux(s.aura),
    pioche: s.pioche.map(() => -1),
    score: deux(s.score), vides: s.vides, fin: s.fin, tour: s.tour,
    proche: s.proche, coalition: s.coalition,
    // Compte en Suisse : on ne voit que le sien ; l'adversaire sait seulement qu'il y en a un (-2)
    suisse: [s.suisse[p], s.suisse[adv] >= 0 ? (s.fin ? s.suisse[adv] : -2) : -1],
    oubli: s.oubli, oubliCamp: t(s.oubliCamp), muets: s.muets.slice(), clos: s.clos, oubliCompte: s.oubliCompte | 0
  };
}

/* ---------- Salles ---------- */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';   // sans 0/O, 1/I/L
const salles = new Map();
function nouveauCode() {
  for (;;) {
    let c = '';
    for (let i = 0; i < 4; i++) c += ALPHABET[hasard(ALPHABET.length)];
    if (!salles.has(c)) return c;
  }
}
function jeton() { return crypto.randomBytes(18).toString('base64url'); }

function envoyer(ws, m) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(m)); }
function aJoueur(salle, p, m) { const j = salle.joueurs[p]; if (j) envoyer(j.ws, m); }
function erreur(ws, raison, code) { envoyer(ws, { t: 'erreur', raison, code: code || '' }); }

function tirerLieu(salle) {
  if (salle.opts.lieu !== 'hasard') return salle.opts.lieu;
  const autres = LIEUX.filter(l => l !== salle.lieu);
  return autres[hasard(autres.length)];
}
function tirerBancs() {
  const n = M.nbBancs(), cases = melanger(suite(16)).slice(0, n), t = {};
  cases.forEach(i => { t[i] = hasard(BANCS_PAR_LIEU); });
  return t;
}

function debutPour(salle, p) {
  const adv = salle.joueurs[1 - p];
  return {
    t: 'debut', code: salle.code, numero: salle.numero, second: salle.estSecond, classee: !!salle.classee,
    lieu: salle.lieu, bancs: salle.bancs, premier: salle.premier === p ? 'moi' : 'adv',
    opts: salle.opts, adversaire: adv ? public_(adv.id) : null, tempsCoup: salle.classee ? LIMITES.tempsCoup : 0, vue: vue(salle, p)
  };
}
// Partie rapide : celui qui a le trait doit jouer dans le temps imparti
function armerChrono(salle) {
  clearTimeout(salle.chrono);
  if (!salle.classee || !salle.s || salle.s.fin) return;
  salle.chrono = setTimeout(() => {
    if (!salles.has(salle.code) || !salle.s || salle.s.fin) return;
    const lent = salle.s.trait;
    compter(salle, 1 - lent);
    aJoueur(salle, lent, { t: 'forfait', raison: 'temps', gagnant: false });
    aJoueur(salle, 1 - lent, { t: 'forfait', raison: 'temps', gagnant: true });
    fermerSalle(salle);
  }, LIMITES.tempsCoup);
}

// Nouvelle partie dans la salle ; « mains » = [main de l'hôte, main de l'invité] pour un second tour
function lancer(salle, mains) {
  const o = salle.opts, grand = o.plateau === 'grand';
  let m0, m1, pioche;
  if (mains) { [m0, m1] = mains; pioche = salle.s.pioche.slice(); }
  else if (o.distribution === 'equilibre') [m0, m1, pioche] = donneEquilibree();
  else { const ids = melanger(suite(NB)); m0 = ids.slice(0, 5); m1 = ids.slice(5, 10); pioche = ids.slice(10); }
  const premier = mains ? 1 - salle.premier : hasard(2);
  if (!mains) salle.lieu = tirerLieu(salle);
  salle.bancs = grand ? tirerBancs() : {};
  const acts = melanger(suite(NB_ACT));
  salle.s = M.nouvelle({
    mainJ: m0, mainIA: m1, pioche, premier, taille: grand ? 4 : 3, bancs: Object.keys(salle.bancs).map(Number),
    actJ: o.actions ? acts[0] : -1, actIA: o.actions ? acts[1] : -1,
    proche: o.proche, coalition: o.coalition, diagonales: o.diagonales, ordre: true
  });
  salle.premier = premier; salle.estSecond = !!mains; salle.numero++;
  salle.revelees = [new Set(), new Set()];
  salle.envies = { revanche: [false, false], second: [false, false] };
  salle.derniere = Date.now();
  aJoueur(salle, 0, debutPour(salle, 0));
  aJoueur(salle, 1, debutPour(salle, 1));
  armerChrono(salle);
}

// Un coup joué : chacun reçoit sa vue, avec les événements à animer
function diffuser(salle, coup, evts) {
  salle.derniere = Date.now();
  if (salle.s.fin) { clearTimeout(salle.chrono); compter(salle, resultat(salle.s)); }
  else armerChrono(salle);
  for (let p = 0; p < 2; p++) {
    const c = Object.assign({}, coup, { qui: coup.qui === p ? 'moi' : 'adv' });
    if (c.a === A.BAYROU && coup.qui !== p) c.arg = coup.arg ? [-1, -1] : null;   // l'échange avec la pioche reste secret
    aJoueur(salle, p, { t: 'coup', numero: salle.numero, coup: c, evts, vue: vue(salle, p) });
  }
}

function estEntier(x) { return Number.isInteger(x); }
function dans(t, x) { return Array.isArray(t) && t.indexOf(x) >= 0; }

function jouerPose(salle, p, m) {
  const s = salle.s;
  if (!s || s.fin) return 'La partie est finie.';
  if (s.trait !== p) return 'Ce n’est pas ton tour.';
  if (!estEntier(m.carte) || !dans(s.mains[p], m.carte)) return 'Cette carte n’est pas dans ta main.';
  if (!estEntier(m.cell) || m.cell < 0 || m.cell >= s.N || s.own[m.cell] !== -1) return 'Ce siège n’est pas libre.';
  const evts = M.poser(s, m.carte, m.cell, []);
  diffuser(salle, { type: 'pose', qui: p, carte: m.carte, cell: m.cell }, evts);
  return null;
}

function jouerAction(salle, p, m) {
  const s = salle.s, a = m.a;
  if (!s || s.fin) return 'La partie est finie.';
  if (s.trait !== p) return 'Ce n’est pas ton tour.';
  if (!estEntier(a) || s.act[p] !== a) return 'Tu n’as pas cette carte action.';
  const c = M.ciblesAction(s, a);
  if (!c.cibles) return c.raison || 'Cette carte ne se joue pas maintenant.';
  let arg = null;
  const x = m.arg;
  switch (a) {
    case A.BORNE: case A.GAULLE: case A.LARCHER: case A.RUGY: case A.MONTCHALIN: case A.ARNAULT: case A.MARCHAIS: case A.CAHUZAC: case A.ATTALI:
      if (!dans(c.cibles, x)) return 'Cible refusée.';
      arg = x; break;
    case A.MONTEBOURG:
      if (!Array.isArray(x) || !dans(c.cibles[0], x[0]) || !dans(c.cibles[1], x[1])) return 'Cibles refusées.';
      arg = [x[0], x[1]]; break;
    case A.VALLS:
      if (!Array.isArray(x) || !dans(c.cibles[0], x[0]) || !dans(c.cibles[1], x[1])) return 'Cibles refusées.';
      arg = [x[0], x[1]]; break;
    case A.MACRON:
      if (!Array.isArray(x) || !dans(c.cibles[0], x[0]) || !dans(c.cibles[1], x[1])) return 'Cibles refusées.';
      arg = [x[0], x[1]]; break;
    case A.SARKO: case A.THEVENOUD:   // le joueur désigne une place dans la main adverse, sans en connaître la carte
      if (!estEntier(x) || x < 0 || x >= s.mains[1 - p].length) return 'Cible refusée.';
      arg = s.mains[1 - p][x]; break;
    case A.BAYROU:
      if (x != null) {
        if (!Array.isArray(x) || !dans(s.pioche.slice(0, 3), x[0]) || !dans(s.mains[p], x[1])) return 'Échange refusé.';
        arg = [x[0], x[1]];
      }
      break;
    default: arg = null;
  }
  const ancienne = a === A.MACRON ? s.crd[arg[0]] : a === A.RUGY ? s.crd[arg] : -1;
  const evts = M.jouerAction(s, a, arg, []);
  if (a === A.SARKO || a === A.THEVENOUD) salle.revelees[p].add(arg);                 // la carte sous bracelet se montre à celui qui l'a posé
  if (a === A.MACRON) salle.revelees[1 - p].add(ancienne);       // la carte qui retourne en main était sur la table
  if (a === A.RUGY) salle.revelees[p].add(ancienne);             // la carte invitée à dîner aussi, et rentre chez l'adversaire
  diffuser(salle, { type: 'action', qui: p, a, arg }, evts);
  return null;
}

// Second tour : chacun reprend les cartes qu'il détient (plateau et main)
function mainsDuSecondTour(s) {
  const m = [[], []];
  for (let i = 0; i < s.N; i++) if (s.own[i] === 0 || s.own[i] === 1) m[s.own[i]].push(s.crd[i]);
  return [m[0].concat(s.mains[0]), m[1].concat(s.mains[1])];
}

function fermerSalle(salle) {
  clearTimeout(salle.chrono);
  for (const j of salle.joueurs) if (j) { clearTimeout(j.minuteur); if (j.ws) j.ws.salle = null; }
  salles.delete(salle.code);
}
// Un joueur s'en va (ou ne revient pas) : en partie rapide inachevée, il perd par forfait
function quitterSalle(salle, raison, partant) {
  const enCours = salle.s && !salle.s.fin;
  if (raison === 'parti' && partant >= 0 && enCours) compter(salle, 1 - partant);
  for (let p = 0; p < 2; p++) {
    const j = salle.joueurs[p];
    if (j && j.ws && p !== partant) envoyer(j.ws, { t: 'adversaire', etat: raison, forfait: !!(salle.classee && enCours && raison === 'parti') });
  }
  fermerSalle(salle);
}
// File d'attente des parties rapides
const file = [];
function retirerDeLaFile(ws) { for (let k = file.length - 1; k >= 0; k--) if (file[k].ws === ws || file[k].ws.readyState !== 1) file.splice(k, 1); }

/* ---------- Messages ---------- */
function traiter(ws, m) {
  const salle = ws.salle, p = ws.place;
  switch (m.t) {
    case 'creer': {
      if (salle) return erreur(ws, 'Tu es déjà dans une partie.');
      if (salles.size >= LIMITES.salles) return erreur(ws, 'Trop de parties en cours, réessaie dans un moment.');
      const ident = identite(m.profil, ws.ip);
      if (ident.raison) return erreur(ws, ident.raison, 'profil');
      retirerDeLaFile(ws);
      const code = nouveauCode(), j = { ws, jeton: jeton(), minuteur: null, id: ident.id };
      const s = { code, opts: lireOpts(m.opts), joueurs: [j, null], s: null, numero: 0, lieu: null, cree: Date.now(), derniere: Date.now() };
      salles.set(code, s);
      ws.salle = s; ws.place = 0;
      return envoyer(ws, { t: 'cree', code, jeton: j.jeton, opts: s.opts });
    }
    case 'rejoindre': {
      if (salle) return erreur(ws, 'Tu es déjà dans une partie.');
      const code = String(m.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const s = salles.get(code);
      if (!s) return erreur(ws, 'Aucune partie avec ce code. Vérifie-le auprès de ton ami.', 'inconnu');
      if (s.joueurs[1]) return erreur(ws, 'Cette partie est déjà complète.', 'complet');
      const ident = identite(m.profil, ws.ip);
      if (ident.raison) return erreur(ws, ident.raison, 'profil');
      if (ident.id === s.joueurs[0].id) return erreur(ws, 'C’est ta propre partie : envoie le lien à quelqu’un d’autre.', 'soi');
      retirerDeLaFile(ws);
      const j = { ws, jeton: jeton(), minuteur: null, id: ident.id };
      s.joueurs[1] = j; ws.salle = s; ws.place = 1;
      envoyer(ws, { t: 'rejoint', code, jeton: j.jeton, opts: s.opts });
      aJoueur(s, 0, { t: 'adversaire', etat: 'arrive' });
      return lancer(s);
    }
    case 'reprendre': {   // retour après une coupure de réseau
      const s = salles.get(String(m.code || '').toUpperCase());
      const k = s ? s.joueurs.findIndex(j => j && j.jeton === m.jeton) : -1;
      if (!s || k < 0) return erreur(ws, 'Cette partie n’existe plus.', 'perdue');
      const j = s.joueurs[k];
      if (j.ws && j.ws !== ws) { j.ws.salle = null; try { j.ws.close(4000, 'remplacé'); } catch (e) {} }
      clearTimeout(j.minuteur); j.minuteur = null; j.ws = ws;
      ws.salle = s; ws.place = k;
      envoyer(ws, { t: 'repris', code: s.code, place: k, opts: s.opts, attente: !s.joueurs[1 - k], classee: !!s.classee });
      if (s.s) envoyer(ws, Object.assign(debutPour(s, k), { t: 'etat', envies: s.envies && { revanche: s.envies.revanche[1 - k], second: s.envies.second[1 - k] } }));
      return aJoueur(s, 1 - k, { t: 'adversaire', etat: 'revenu' });
    }
    case 'poser': case 'action': {
      if (!salle || !salle.s) return erreur(ws, 'Pas de partie en cours.');
      if (m.numero !== salle.numero) return;   // coup d'une partie précédente
      const raison = m.t === 'poser' ? jouerPose(salle, p, m) : jouerAction(salle, p, m);
      if (raison) erreur(ws, raison, 'coup');
      return;
    }
    case 'plan': {   // Le Plan : les trois cartes du dessus de la pioche, pour celui qui tient la carte
      const s = salle && salle.s;
      if (!s || s.fin || s.trait !== p || s.act[p] !== A.BAYROU) return erreur(ws, 'Le Plan n’est pas jouable maintenant.', 'coup');
      return envoyer(ws, { t: 'plan', top: s.pioche.slice(0, 3) });
    }
    case 'revanche': case 'second': {
      if (!salle || !salle.s || !salle.s.fin) return;
      const s = salle.s, egalite = M.gagnant(s) < 0;   // une victoire proclamée n'appelle pas de second tour
      if (m.t === 'second' && !(egalite && salle.opts.secondTour)) return;
      salle.envies[m.t][p] = true;
      if (salle.envies[m.t][0] && salle.envies[m.t][1]) return lancer(salle, m.t === 'second' ? mainsDuSecondTour(s) : null);
      return aJoueur(salle, 1 - p, { t: 'envie', quoi: m.t });
    }
    case 'quitter': {
      retirerDeLaFile(ws);
      if (!salle) return;
      ws.salle = null;
      return quitterSalle(salle, 'parti', p);
    }
    case 'chercher': {   // partie rapide : on prend le premier joueur en attente, sinon on attend
      if (salle) return erreur(ws, 'Tu es déjà dans une partie.');
      const ident = identite(m.profil, ws.ip);
      if (ident.raison) return erreur(ws, ident.raison, 'profil');
      ws.ident = ident.id;
      retirerDeLaFile(ws);
      for (let k = file.length - 1; k >= 0; k--) if (file[k].id === ident.id) { envoyer(file[k].ws, { t: 'remplace' }); file.splice(k, 1); }   // un seul onglet en file
      if (!file.length) {
        file.push({ ws, id: ident.id, depuis: Date.now() });
        return envoyer(ws, { t: 'recherche', enLigne: wss.clients.size });
      }
      if (salles.size >= LIMITES.salles) return erreur(ws, 'Trop de parties en cours, réessaie dans un moment.');
      const autre = file.shift(), code = nouveauCode();
      const s = { code, opts: lireOpts(STANDARD), classee: true, s: null, numero: 0, lieu: null, cree: Date.now(), derniere: Date.now(),
        joueurs: [{ ws: autre.ws, jeton: jeton(), minuteur: null, id: autre.id }, { ws, jeton: jeton(), minuteur: null, id: ident.id }] };
      salles.set(code, s);
      [autre.ws, ws].forEach((w, k) => { w.salle = s; w.place = k; envoyer(w, { t: 'trouve', code, jeton: s.joueurs[k].jeton, opts: s.opts }); });
      return lancer(s);
    }
    case 'annuler': return retirerDeLaFile(ws);
    case 'profil': {   // mise à jour du pseudo ou de l'avatar, hors partie
      const ident = identite(m.profil, ws.ip);
      return ident.raison ? erreur(ws, ident.raison, 'profil') : envoyer(ws, { t: 'profil', pseudo: ident.j.p });
    }
    case 'classement': {
      const t = classement();
      let moi = null;
      if (m.profil && typeof m.profil.secret === 'string' && /^[A-Za-z0-9_-]{20,100}$/.test(m.profil.secret)) {
        const id = empreinte(m.profil.secret), j = joueurs[id];
        if (j) { const k = t.findIndex(x => x.id === id); moi = { rang: k >= 0 ? k + 1 : 0, pseudo: j.p, avatar: j.a, v: j.v, d: j.d, e: j.e }; }
      }
      return envoyer(ws, { t: 'classement', total: t.length, enLigne: wss.clients.size, enFile: file.length,
        top: t.slice(0, 50).map(x => [x.p, x.a, x.v, x.n]), moi });
    }
    case 'oublier': {   // efface son profil et ses résultats
      if (!m.profil || typeof m.profil.secret !== 'string') return;
      const id = empreinte(m.profil.secret), j = joueurs[id];
      if (j) { parCle.delete(P.cle(j.p)); delete joueurs[id]; sauver(); }
      return envoyer(ws, { t: 'oublie' });
    }
  }
}

/* ---------- Serveur web ---------- */
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8'
};
function entetes(req) {
  // connect-src nomme aussi wss://hôte : certains navigateurs n'y rangent pas encore les WebSocket de 'self'
  const hote = String(req.headers.host || '').replace(/[^A-Za-z0-9.:\-\[\]]/g, '');
  return {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'SAMEORIGIN',
    'Content-Security-Policy': `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'${hote ? ` wss://${hote} ws://${hote}` : ''}; base-uri 'self'; form-action 'none'; frame-ancestors 'self'`
  };
}
// La page d'accueil reçoit l'adresse du serveur de parties (et le lien de dons, s'il y en a un)
let accueil = null;
function pageAccueil() {
  if (accueil) return accueil;
  const brut = fs.readFileSync(path.join(SITE, 'index.html'), 'utf8');
  const reglage = `window.APDA_DON = ${JSON.stringify(DON)}; window.APDA_EN_LIGNE = '/ws';`;
  if (!brut.includes("window.APDA_DON = '';")) throw new Error('index.html : réglage APDA_DON introuvable');
  return (accueil = Buffer.from(brut.replace("window.APDA_DON = '';", reglage)));
}

const serveur = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end(); }
  let chemin;
  try { chemin = decodeURIComponent(new URL(req.url, 'http://local').pathname); } catch (e) { res.writeHead(400); return res.end(); }
  if (chemin === '/favicon.ico') chemin = '/icone.png';
  if (chemin === '/' || chemin === '/index.html') {
    const page = pageAccueil();
    res.writeHead(200, Object.assign({ 'Content-Type': TYPES['.html'], 'Content-Length': page.length, 'Cache-Control': 'no-cache' }, entetes(req)));
    return res.end(req.method === 'HEAD' ? undefined : page);
  }
  const fichier = path.normalize(path.join(SITE, chemin));
  const type = TYPES[path.extname(fichier).toLowerCase()];
  if (!fichier.startsWith(SITE + path.sep) || !type || chemin.includes('\0')) { res.writeHead(404); return res.end(); }
  fs.stat(fichier, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, entetes(req)); return res.end('Introuvable'); }
    res.writeHead(200, Object.assign({ 'Content-Type': type, 'Content-Length': st.size, 'Cache-Control': type.startsWith('image/') || type === 'font/woff2' ? 'public, max-age=604800' : 'no-cache' }, entetes(req)));
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(fichier).on('error', () => res.destroy()).pipe(res);
  });
});

serveur.on('clientError', (err, socket) => { if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\n\r\n'); else socket.destroy(); });

/* ---------- WebSocket ---------- */
const parIP = new Map();
function ipDe(req) {
  const local = /^(::1|127\.|::ffff:127\.)/.test(req.socket.remoteAddress || '');
  const fwd = local && req.headers['x-forwarded-for'];
  // Derrière Caddy : la dernière adresse est celle que le proxy a vue lui-même ; les précédentes viennent du client
  return (fwd ? String(fwd).split(',').pop().trim() : req.socket.remoteAddress) || '?';
}
function origineAcceptee(req) {
  const o = req.headers.origin;
  if (!o) return true;
  try {
    const h = new URL(o).host;
    return h === req.headers.host || ORIGINES.includes(o) || ORIGINES.includes(h);
  } catch (e) { return false; }
}

const wss = new WebSocketServer({ noServer: true, maxPayload: LIMITES.taille });
serveur.on('upgrade', (req, socket, tete) => {
  socket.on('error', () => socket.destroy());
  const ip = ipDe(req);
  if (new URL(req.url, 'http://local').pathname !== '/ws' || !origineAcceptee(req) || (parIP.get(ip) || 0) >= LIMITES.connexionsParIP) {
    socket.write('HTTP/1.1 403 Forbidden\r\n\r\n'); return socket.destroy();
  }
  wss.handleUpgrade(req, socket, tete, ws => {
    parIP.set(ip, (parIP.get(ip) || 0) + 1);
    ws.ip = ip; ws.vivant = true; ws.salle = null; ws.place = -1; ws.seau = [];
    ws.on('pong', () => { ws.vivant = true; });
    ws.on('error', e => { ws.terminate(); if (e.code !== 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH') console.error('[ws]', e.message); });   // sans écouteur, une erreur ferait tomber le serveur
    ws.on('message', (brut, binaire) => {
      const t = Date.now();
      ws.seau = ws.seau.filter(x => t - x < LIMITES.fenetre); ws.seau.push(t);
      if (binaire || ws.seau.length > LIMITES.messages) return ws.close(1008, 'trop de messages');
      let m;
      try { m = JSON.parse(brut); } catch (e) { return; }
      if (!m || typeof m !== 'object' || typeof m.t !== 'string') return;
      try { traiter(ws, m); } catch (e) { console.error('[message]', e); erreur(ws, 'Erreur du serveur.'); }
    });
    ws.on('close', () => {
      const n = (parIP.get(ip) || 1) - 1;
      if (n > 0) parIP.set(ip, n); else parIP.delete(ip);
      retirerDeLaFile(ws);
      const s = ws.salle;
      if (!s || !salles.has(s.code)) return;
      const k = ws.place, j = s.joueurs[k];
      if (!j || j.ws !== ws) return;
      j.ws = null;
      if (!s.joueurs[1 - k]) { salles.delete(s.code); return; }   // personne d'autre : la salle disparaît
      aJoueur(s, 1 - k, { t: 'adversaire', etat: 'coupe' });
      j.minuteur = setTimeout(() => { if (salles.has(s.code) && !j.ws) quitterSalle(s, 'parti', k); }, LIMITES.retour);
    });
  });
});

// Battement : on coupe les connexions mortes ; ménage des salles oubliées
setInterval(() => {
  wss.clients.forEach(ws => { if (!ws.vivant) return ws.terminate(); ws.vivant = false; try { ws.ping(); } catch (e) {} });
  const t = Date.now();
  for (const s of salles.values()) {
    const seule = !s.joueurs[1] && t - s.cree > LIMITES.attenteInvite;
    if (seule || t - s.derniere > LIMITES.inactivite) quitterSalle(s, 'ferme');
  }
}, 30e3).unref();
setInterval(() => {
  const t = Date.now(), auj = jour();
  for (const [id, j] of Object.entries(joueurs)) if (j.v + j.d + j.e === 0 && t - j.c > 7 * 86400e3) { parCle.delete(P.cle(j.p)); delete joueurs[id]; sauver(); }
  for (const k of paires.keys()) if (!k.endsWith(auj)) paires.delete(k);
  lireMots();
}, 5 * 60e3).unref();

serveur.listen(PORT, HOTE, () => console.log(`Retourne ta veste en ligne : http://${HOTE}:${PORT} (${NB} cartes)`));
module.exports = { serveur, salles, vue, joueurs };
