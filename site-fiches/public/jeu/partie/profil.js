/* Profils du jeu en ligne : un pseudo et un avatar, choisis avant de jouer.
   Le pseudo se tape librement, dans des limites vérifiées ici (et de nouveau par le serveur) :
   3 à 28 caractères, lettres, chiffres et quelques signes, pas d'insulte, pas le nom d'une personnalité du jeu.
   Pour qui a la flemme, « Au hasard » propose un nom de la maison : « Sénateur assoupi 88 », « Députée frondeuse 412 ».
   L'avatar est un picto du jeu sur une pastille de couleur. Partagé par le jeu (window.HemicycleProfil) et le serveur. */
(function (racine) {
  'use strict';
  var TITRES = [
    ['Député', 'Députée'], ['Sénateur', 'Sénatrice'], ['Maire', 'Maire'], ['Ministre', 'Ministre'],
    ['Conseiller', 'Conseillère'], ['Électeur', 'Électrice'], ['Militant', 'Militante'], ['Préfet', 'Préfète'],
    ['Assesseur', 'Assesseure'], ['Candidat', 'Candidate'], ['Questeur', 'Questrice'], ['Sondeur', 'Sondeuse'],
    ['Huissier', 'Huissière'], ['Suppléant', 'Suppléante'], ['Scrutateur', 'Scrutatrice'], ['Délégué', 'Déléguée']
  ];
  var ADJECTIFS = [
    ['frondeur', 'frondeuse'], ['indécis', 'indécise'], ['assoupi', 'assoupie'], ['pressé', 'pressée'], ['enrhumé', 'enrhumée'],
    ['optimiste', 'optimiste'], ['tatillon', 'tatillonne'], ['bavard', 'bavarde'], ['discret', 'discrète'], ['distrait', 'distraite'],
    ['ponctuel', 'ponctuelle'], ['enthousiaste', 'enthousiaste'], ['sceptique', 'sceptique'], ['matinal', 'matinale'], ['ému', 'émue'],
    ['têtu', 'têtue'], ['prudent', 'prudente'], ['remonté', 'remontée'], ['inoxydable', 'inoxydable'], ['imprévisible', 'imprévisible'],
    ['stagiaire', 'stagiaire'], ['chanceux', 'chanceuse'], ['stratège', 'stratège'], ['rêveur', 'rêveuse'], ['affamé', 'affamée'],
    ['débordé', 'débordée'], ['zélé', 'zélée'], ['flegmatique', 'flegmatique'], ['insomniaque', 'insomniaque'], ['malicieux', 'malicieuse'],
    ['tenace', 'tenace'], ['solennel', 'solennelle'], ['impatient', 'impatiente'], ['nostalgique', 'nostalgique'], ['espiègle', 'espiègle'],
    ['courtois', 'courtoise'], ['intrépide', 'intrépide'], ['pensif', 'pensive']
  ];
  // Pictos 24 × 24, au trait, dans le style des obstacles du plateau
  var PICTOS = [
    ['Urne', '<rect x="4" y="9.5" width="16" height="11.5" rx="1.5"/><path d="M8.5 13h7"/><path d="M9.5 9.5V3.5h5v6"/>'],
    ['Micro', '<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 10.5a6.5 6.5 0 0 0 13 0"/><path d="M12 17v4M8.5 21h7"/>'],
    ['Chapeau pointu', '<path d="M12 4.5L6 20h12z"/><path d="M8.2 14.5h7.6M10 9.8h4"/><circle cx="12" cy="3.3" r="1.6"/>'],
    ['Mégaphone', '<path d="M3 10v4h3l9 5V5l-9 5z"/><path d="M18.5 9a4 4 0 0 1 0 6"/>'],
    ['Cocarde', '<circle cx="12" cy="9.5" r="6"/><circle cx="12" cy="9.5" r="2.4"/><path d="M8.8 14.6L7 21l3-1.6 1-3M15.2 14.6L17 21l-3-1.6-1-3"/>'],
    ['Étoile', '<path d="M12 3l2.6 5.5 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.2l6-.7z"/>'],
    ['Lunettes', '<circle cx="7" cy="13.5" r="3.6"/><circle cx="17" cy="13.5" r="3.6"/><path d="M10.6 13h2.8"/><path d="M3.4 12.5L2.5 9M20.6 12.5l.9-3.5"/>'],
    ['Moustache', '<path d="M12 11.5c-2.2-3.4-6.5-3.2-8.5.6 2.6 2.6 5.8 1.6 8.5-.2 2.7 1.8 5.9 2.8 8.5.2-2-3.8-6.3-4-8.5-.6z"/>'],
    ['Café', '<path d="M4.5 9h11.5v5a5 5 0 0 1-5 5h-1.5a5 5 0 0 1-5-5z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8.5 3.5c0 1.6 1.5 1.6 1.5 3.2M12 3.5c0 1.6 1.5 1.6 1.5 3.2"/>'],
    ['Tour Eiffel', '<path d="M12 2v3M10.5 5h3"/><path d="M10.8 5L8 21M13.2 5L16 21"/><path d="M9.3 12.5h5.4"/><path d="M6 21h3c0-2 1.3-3.4 3-3.4s3 1.4 3 3.4h3"/>'],
    ['Fromage', '<path d="M3 16l11-8.5 7 4.5v4z"/><path d="M3 16v3h18v-3"/><circle cx="9" cy="17.6" r=".9"/><circle cx="15.5" cy="13.2" r=".9"/>'],
    ['Merguez', '<path d="M3.5 11h17"/><path d="M5.5 11l1.6 8h9.8l1.6-8"/><path d="M8 7.5c1.2-1.2 2.6-1.2 4 0s2.8 1.2 4 0"/>'],
    ['Caméra', '<rect x="3" y="7" width="12" height="10" rx="1.5"/><path d="M15 10.5l6-3v9l-6-3"/>'],
    ['Chrono', '<circle cx="12" cy="13.5" r="7"/><path d="M12 13.5V9.5"/><path d="M10 3h4M12 3v3.5"/>'],
    ['Fauteuil', '<path d="M7 3h10v8H7z"/><path d="M5 11h14v4H5z"/><path d="M7 15v6M17 15v6"/>'],
    ['À peu près', '<circle cx="12" cy="12" r="8.5"/><path d="M7.8 10.4c1.4-1.2 2.8-1.2 4.2.2s2.8 1.4 4.2 0M7.8 14.2c1.4-1.2 2.8-1.2 4.2.2s2.8 1.4 4.2 0"/>']
  ];
  // Couleurs de pastille ; le picto est clair sur les fonds sombres, encre sur les fonds clairs
  var COULEURS = [['#5a2d8c', '#f8f9f6'], ['#0f5f66', '#f8f9f6'], ['#f1fb4e', '#15171a'], ['#e0457b', '#f8f9f6'],
                  ['#2f7a3a', '#f8f9f6'], ['#15171a', '#f1fb4e'], ['#ffae3b', '#15171a'], ['#9fd8ff', '#15171a']];
  // Mots refusés. Les longs sont cherchés n'importe où (sans accents, espaces ni ponctuation, chiffres ramenés aux lettres) ;
  // les courts seulement comme mot entier, pour ne pas refuser « Député », « Unique » ou « Siège ».
  var MOTS_INTERDITS = ['connard', 'connasse', 'salope', 'salaud', 'putain', 'encule', 'enfoire', 'batard', 'niquer', 'niktamer',
    'gouine', 'tarlouze', 'negre', 'bougnoul', 'bicot', 'youpin', 'feuj', 'chintok', 'nazi', 'hitler', 'fuhrer', 'adolf', 'kkk',
    'jihad', 'djihad', 'daech', 'pedophile', 'violeur', 'couille', 'teub', 'zgeg', 'branle', 'sucemoi', 'suceur', 'tagueule',
    'fuck', 'bitch', 'whore', 'nigger', 'nigga', 'faggot', 'abruti', 'debile', 'trisomique', 'merde', 'porn', 'sexe', 'admin', 'moderat'];
  var MOTS_SEULS = ['pute', 'pd', 'pede', 'pedale', 'tapette', 'negro', 'heil', 'reich', 'isis', 'pedo', 'bite', 'chatte', 'cunt',
    'dick', 'pussy', 'mongol', 'cul', 'anus', 'ntm', 'fdp', 'tg', 'con', 'conne', 'nique', 'shit', 'sieg'];
  // Noms de famille courants qui ne doivent pas bloquer un pseudo s'ils y figurent (on bloque seulement s'il n'y a qu'eux)
  var NOMS_COMMUNS = ['philippe', 'breton', 'bertrand', 'hollande', 'leclerc', 'rousseau', 'lalanne', 'larcher', 'lagarde', 'arnault',
    'branco', 'durif', 'borne', 'royal', 'berge', 'faure', 'valls', 'riner', 'guedj', 'praud', 'attal'];

  function sansAccents(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function compact(s) {
    return sansAccents(s).replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's').replace(/7/g, 't')
      .replace(/@/g, 'a').replace(/\$/g, 's').replace(/[^a-z]/g, '');
  }
  function nettoyer(s) { return String(s == null ? '' : s).replace(/[‘’]/g, '’').replace(/\s+/g, ' ').trim(); }
  // Clé d'unicité : deux pseudos qui ne diffèrent que par la casse, les accents ou les espaces sont le même
  function cle(s) { return sansAccents(nettoyer(s)).replace(/[^a-z0-9]/g, ''); }

  // Personnalités du jeu : [nom complet, nom court] → on refuse le nom complet, et le nom court s'il est distinctif ou seul
  function refus(pseudo, personnalites, motsEnPlus) {
    var p = nettoyer(pseudo);
    if (p.length < 3) return 'Trois caractères au moins.';
    if (p.length > 28) return 'Vingt-huit caractères au plus.';
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿŒœ0-9 ’'._-]+$/.test(p)) return 'Lettres, chiffres, espaces, apostrophes, points, tirets seulement.';
    if (!/[A-Za-zÀ-ÖØ-öø-ÿŒœ]/.test(p)) return 'Il faut au moins une lettre.';
    var c = compact(p), mots = MOTS_INTERDITS.concat(motsEnPlus || []);
    var seuls = sansAccents(p).replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's').split(/[^a-z]+/);
    for (var k = 0; k < mots.length; k++) if (mots[k] && c.indexOf(compact(mots[k])) >= 0) return 'Ce pseudo n’est pas accepté.';
    for (k = 0; k < MOTS_SEULS.length; k++) if (seuls.indexOf(MOTS_SEULS[k]) >= 0 || c === MOTS_SEULS[k]) return 'Ce pseudo n’est pas accepté.';
    var nom = (personnalites || []).some(function (x) {
      var complet = compact(x[0]), court = compact(x[1] || '');
      return c.indexOf(complet) >= 0 || (court && (c === court || (court.length >= 5 && NOMS_COMMUNS.indexOf(court) < 0 && c.indexOf(court) >= 0)));
    });
    if (nom) return 'Pas de nom de personnalité du jeu, pour éviter toute confusion.';
    return '';
  }
  function avatarValide(a) {
    return !!a && typeof a.i === 'number' && a.i % 1 === 0 && a.i >= 0 && a.i < PICTOS.length &&
      typeof a.c === 'number' && a.c % 1 === 0 && a.c >= 0 && a.c < COULEURS.length;
  }
  function auHasard(alea) {
    alea = alea || Math.random;
    var g = alea() < 0.5 ? 0 : 1;
    return TITRES[Math.floor(alea() * TITRES.length)][g] + ' ' + ADJECTIFS[Math.floor(alea() * ADJECTIFS.length)][g] + ' ' + (1 + Math.floor(alea() * 999));
  }
  function avatarAuHasard(alea) { alea = alea || Math.random; return { i: Math.floor(alea() * PICTOS.length), c: Math.floor(alea() * COULEURS.length) }; }
  // Pastille HTML (côté navigateur)
  function avatarHtml(a, taille) {
    if (!avatarValide(a)) a = { i: PICTOS.length - 1, c: 0 };
    var col = COULEURS[a.c];
    return '<span class="avatar" style="--av-fond:' + col[0] + ';--av-trait:' + col[1] + (taille ? ';--av-taille:' + taille + 'px' : '') + '" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + PICTOS[a.i][1] + '</svg></span>';
  }
  var api = { nettoyer: nettoyer, cle: cle, refus: refus, avatarValide: avatarValide, auHasard: auHasard, avatarAuHasard: avatarAuHasard,
              avatarHtml: avatarHtml, PICTOS: PICTOS, COULEURS: COULEURS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.HemicycleProfil = api;
})(this);
