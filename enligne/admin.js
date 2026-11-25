'use strict';
/* Modération du classement de L'Hémicycle.

   Le serveur garde les profils en mémoire et réécrit donnees/joueurs.json : arrête-le avant de modifier
   un profil, sinon ta modification serait écrasée.
     sudo systemctl stop hemicycle
     node admin.js renomme "Pseudo à changer"
     sudo systemctl start hemicycle

   Commandes :
     node admin.js liste [n]            les n premiers du classement (20 par défaut)
     node admin.js cherche <texte>      les profils dont le pseudo contient ce texte
     node admin.js renomme "<pseudo>"   remplace ce pseudo par un nom de la maison ; le joueur garde ses résultats
     node admin.js efface "<pseudo>"    supprime le profil et ses résultats
     node admin.js interdit <mot>       refuse ce mot dans les pseudos à venir (serveur lancé ou non, pris en compte sous 5 minutes)

   Le dossier des données est ./donnees, ou celui de la variable DONNEES (comme pour le serveur). */
const fs = require('fs');
const path = require('path');
const P = require(path.join(__dirname, 'site', 'profil.js'));
const DONNEES = process.env.DONNEES || path.join(__dirname, 'donnees');
const FICHIER = path.join(DONNEES, 'joueurs.json');
const [commande, ...args] = process.argv.slice(2);

function lire() {
  try { return JSON.parse(fs.readFileSync(FICHIER, 'utf8')); }
  catch (e) { if (e.code === 'ENOENT') return {}; throw e; }
}
function ecrire(joueurs) {
  fs.mkdirSync(DONNEES, { recursive: true });
  const tmp = FICHIER + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(joueurs));
  fs.renameSync(tmp, FICHIER);
}
function trouver(joueurs, pseudo) {
  const cle = P.cle(pseudo || '');
  const id = Object.keys(joueurs).find(k => P.cle(joueurs[k].p) === cle);
  if (!id) { console.error(`Aucun profil « ${pseudo} ».`); process.exit(1); }
  return id;
}
function ligne(j, rang) {
  const n = j.v + j.d + j.e;
  return `${String(rang).padStart(4)}  ${j.p.padEnd(30)} ${String(j.v).padStart(4)} victoire(s) / ${n} partie(s)`;
}

const joueurs = lire();
switch (commande) {
  case 'liste': {
    const n = Number(args[0]) || 20;
    const t = Object.values(joueurs).filter(j => j.v + j.d + j.e > 0)
      .sort((x, y) => y.v - x.v || y.v / (y.v + y.d + y.e) - x.v / (x.v + x.d + x.e));
    console.log(`${t.length} joueur(s) classé(s), ${Object.keys(joueurs).length} profil(s) en tout.`);
    t.slice(0, n).forEach((j, k) => console.log(ligne(j, k + 1)));
    break;
  }
  case 'cherche': {
    const q = P.cle(args.join(' '));
    Object.values(joueurs).filter(j => P.cle(j.p).includes(q)).forEach(j => console.log(ligne(j, '-')));
    break;
  }
  case 'renomme': {
    const id = trouver(joueurs, args.join(' '));
    const pris = new Set(Object.values(joueurs).map(j => P.cle(j.p)));
    let nom;
    do { nom = P.auHasard(); } while (pris.has(P.cle(nom)));
    console.log(`« ${joueurs[id].p} » devient « ${nom} ».`);
    joueurs[id].p = nom;
    ecrire(joueurs);
    break;
  }
  case 'efface': {
    const id = trouver(joueurs, args.join(' '));
    console.log(`Profil « ${joueurs[id].p} » effacé.`);
    delete joueurs[id];
    ecrire(joueurs);
    break;
  }
  case 'interdit': {
    const mot = args.join(' ').trim();
    if (!mot) { console.error('Quel mot ?'); process.exit(1); }
    fs.mkdirSync(DONNEES, { recursive: true });
    fs.appendFileSync(path.join(DONNEES, 'mots-interdits.txt'), mot + '\n');
    console.log(`« ${mot} » sera refusé dans les nouveaux pseudos. Pour un pseudo déjà pris, utilise « renomme ».`);
    break;
  }
  default:
    console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].replace('/* ', '').replace(/^'use strict';\n/, ''));
}
