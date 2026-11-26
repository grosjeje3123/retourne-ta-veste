/* Trophées de Retourne ta veste : la liste, l'état gardé sur l'appareil, et les règles d'obtention.
   Aucune dépendance au jeu : jeu.js rapporte des faits (un duel gagné, une fin de partie…), ce module dit ce qui vient d'être débloqué.
   Ils se gagnent contre l'IA, hors tutoriel et hors jeu en ligne. Rien ne quitte l'appareil. */
(function (racine) {
  'use strict';
  var CLE = 'hemicycle-trophees';
  var RANGS = { platine: 'Platine', or: 'Or', argent: 'Argent', bronze: 'Bronze' };

  function vide() {
    return { v: 1, obtenus: {}, parties: 0, victoires: 0, serie: 0, serieMax: 0, serieElysee: 0, serieElyseeMax: 0, parcours: 0, parcoursMax: 0,
             lieuxJ: {}, lieuxG: {}, actions: {}, anecdotes: 0, duels: 0, combos: 0, duelsDefav: 0, niveaux: {}, deck: 0, album: 0, f: {} };
  }
  function nb(o) { return Object.keys(o || {}).length; }
  function fait(k) { return function (e) { return [e.f[k] ? 1 : 0, 1]; }; }
  function compte(k, n) { return function (e) { return [Math.min(e[k] || 0, n), n]; }; }
  function niveau(k, n) { return function (e) { return [Math.min(e.niveaux[k] | 0, n), n]; }; }   // victoires contre ce niveau

  function liste(cfg) {
    var NA = cfg.actions, NC = cfg.cartes, NL = cfg.lieux;
    return [
      // Bronze : découvrir
      { id: 'mandat', rang: 'bronze', nom: 'Premier mandat', desc: 'Gagner une partie.', p: compte('victoires', 1) },
      { id: 'eleve', rang: 'bronze', nom: 'Élève appliqué', desc: 'Finir le tutoriel.', p: fait('tuto') },
      { id: 'entree', rang: 'bronze', nom: 'Entrée en politique', desc: 'Jouer sa première partie de Carrière.', p: fait('carriere') },
      { id: 'prise', rang: 'bronze', nom: 'Première prise', desc: 'Gagner une carte à l’adversaire en Carrière.', p: fait('prise') },
      { id: 'maire', rang: 'bronze', nom: 'Monsieur le Maire', desc: 'Battre 3 fois l’IA au niveau Mairie.', p: niveau('mairie', 3) },
      { id: 'duel', rang: 'bronze', nom: 'Duel au sommet', desc: 'Gagner 10 duels de flèches.', p: compte('duels', 10) },
      { id: 'combo', rang: 'bronze', nom: 'Effet d’entraînement', desc: 'Réussir 10 combos.', p: compte('combos', 10) },
      { id: 'lobbyiste', rang: 'bronze', nom: 'Lobbyiste', desc: 'Jouer 5 cartes action différentes.', p: function (e) { return [Math.min(nb(e.actions), 5), 5]; } },
      { id: 'ballottage', rang: 'bronze', nom: 'Ballottage', desc: 'Finir une partie à égalité.', p: fait('egalite') },
      { id: 'tour', rang: 'bronze', nom: 'Tour de France', desc: 'Jouer dans les ' + NL + ' lieux.', p: function (e) { return [Math.min(nb(e.lieuxJ), NL), NL]; } },
      { id: 'savais', rang: 'bronze', nom: 'Le savais-tu ?', desc: 'Lire 10 anecdotes de fin de partie.', p: compte('anecdotes', 10) },
      { id: 'habitue', rang: 'bronze', nom: 'Habitué', desc: 'Jouer 20 parties.', p: compte('parties', 20) },
      // Argent : maîtriser
      { id: 'depute', rang: 'argent', nom: 'Député', desc: 'Battre 5 fois l’IA au niveau Assemblée.', p: niveau('assemblee', 5) },
      { id: 'raz', rang: 'argent', nom: 'Raz-de-marée', desc: 'Gagner 7-3 ou mieux contre l’Assemblée ou l’Élysée.', p: fait('raz') },
      { id: 'remontada', rang: 'argent', nom: 'Remontada', desc: 'Mené 3-7 ou pire, gagner quand même contre l’Assemblée ou l’Élysée.', p: fait('remontada') },
      { id: 'filet', rang: 'argent', nom: 'Coup de filet', desc: 'Retourner 4 cartes en un seul coup.', p: fait('filet') },
      { id: 'improbable', rang: 'argent', nom: 'Contre toute attente', desc: 'Gagner un duel à moins de 15 % de chances.', p: fait('improbable') },
      { id: 'second', rang: 'argent', nom: 'Second tour', desc: 'Gagner un second tour.', p: fait('second') },
      { id: 'sansmains', rang: 'argent', nom: 'Sans les mains', desc: 'Battre l’Assemblée ou l’Élysée sans jouer sa carte action.', p: fait('sansMains') },
      { id: 'chelem', rang: 'argent', nom: 'Grand chelem', desc: 'Gagner dans les ' + NL + ' lieux.', p: function (e) { return [Math.min(nb(e.lieuxG), NL), NL]; } },
      { id: 'carnet', rang: 'argent', nom: 'Carnet d’adresses', desc: 'Avoir joué les ' + NA + ' cartes action.', p: function (e) { return [Math.min(nb(e.actions), NA), NA]; } },
      { id: 'majorite', rang: 'argent', nom: 'Majorité absolue', desc: 'Avoir ' + (Math.floor(NC / 2) + 1) + ' cartes sur ' + NC + ' dans son deck.', p: compte('deck', Math.floor(NC / 2) + 1) },
      { id: 'grace', rang: 'argent', nom: 'État de grâce', desc: '5 victoires de suite.', p: compte('serieMax', 5) },
      { id: 'cumul', rang: 'argent', nom: 'Cumul des mandats', desc: '25 victoires.', p: compte('victoires', 25) },
      // Or : les exploits
      { id: 'elysee', rang: 'or', nom: 'Locataire de l’Élysée', desc: 'Battre 5 fois l’IA au niveau Élysée.', p: niveau('elysee', 5) },
      { id: 'sansfilet', rang: 'or', nom: 'Sans filet', desc: 'Battre l’Élysée sans jouer sa carte action.', p: fait('sansFilet') },
      { id: 'plebiscite', rang: 'or', nom: 'Plébiscite', desc: 'Gagner 8-2 ou mieux contre l’Élysée.', p: fait('plebiscite') },
      { id: 'parcours', rang: 'or', nom: 'Parcours sans faute', desc: 'Battre Mairie, Assemblée et Élysée d’affilée.', p: compte('parcoursMax', 3) },
      { id: 'indetronable', rang: 'or', nom: 'Indétrônable', desc: '3 victoires de suite contre l’Élysée.', p: compte('serieElyseeMax', 3) },
      { id: 'maitre', rang: 'or', nom: 'Maître des flèches', desc: 'Gagner 25 duels défavorables.', p: compte('duelsDefav', 25) },
      { id: 'collection', rang: 'or', nom: 'Collection complète', desc: 'Avoir eu au moins une fois chacune des ' + NC + ' cartes (album complet).', p: compte('album', NC) },
      { id: 'briscard', rang: 'or', nom: 'Vieux briscard', desc: '100 victoires.', p: compte('victoires', 100) },
      // Cachés : « ??? » jusqu'au déblocage
      { id: 'yeux', rang: 'argent', cache: true, nom: 'Les yeux dans les yeux', desc: 'Gagner avec une carte planquée en Suisse, sans se faire prendre.', p: fait('suisse') },
      { id: 'voix', rang: 'argent', cache: true, nom: '98 voix d’avance', desc: 'Se proclamer vainqueur, puis gagner la partie.', p: fait('proclame') },
      { id: 'suffit', rang: 'bronze', cache: true, nom: 'Ça suffit !', desc: 'Annuler la carte action adverse.', p: fait('suffit') },
      { id: 'taire', rang: 'bronze', cache: true, nom: 'Taisez-vous !', desc: 'Faire taire une carte qui a au moins 5 flèches.', p: fait('taire') },
      { id: 'addition', rang: 'argent', cache: true, nom: 'L’addition, s’il vous plaît', desc: 'Renvoyer au Homard une carte qui venait de te prendre un siège.', p: fait('addition') },
      { id: 'phobie', rang: 'argent', cache: true, nom: 'Phobie administrative', desc: 'Faire oublier à l’adversaire de déclarer une carte, qui ne compte pas à la fin.', p: fait('phobie') },
      { id: 'girouette', rang: 'bronze', cache: true, nom: 'Girouette', desc: 'Voir une même carte changer de camp 4 fois dans une partie.', p: fait('girouette') },
      { id: 'deroute', rang: 'bronze', cache: true, nom: 'Soirée électorale difficile', desc: 'Perdre 2-8 ou pire.', p: fait('deroute') }
    ];
  }

  function creer(stockage, config) {
    var cfg = { actions: 23, cartes: 43, lieux: 6 }, k;
    for (k in (config || {})) cfg[k] = config[k];
    var L = liste(cfg);
    L.push({ id: 'platine', rang: 'platine', nom: 'Président de tout', desc: 'Obtenir tous les autres trophées.',
             p: function (e) { var n = 0; L.forEach(function (t) { if (t.id !== 'platine' && e.obtenus[t.id]) n++; }); return [n, L.length - 1]; } });
    var e = vide(), lu = null;
    try { lu = stockage.lire(); } catch (err) { lu = null; }
    if (lu && typeof lu === 'object') {
      for (k in e) if (lu[k] != null && typeof lu[k] === typeof e[k]) e[k] = lu[k];
    }
    function sauver() { try { stockage.ecrire(e); } catch (err) {} }
    // Ce qui vient d'être débloqué, dans l'ordre de la liste (le platine en dernier)
    function verifier(maintenant) {
      var neufs = [];
      L.forEach(function (t) {
        if (e.obtenus[t.id]) return;
        var p = t.p(e);
        if (p[0] >= p[1]) { e.obtenus[t.id] = maintenant || Date.now(); neufs.push(t); }
      });
      sauver();
      return neufs;
    }
    return {
      RANGS: RANGS,
      etat: function () { return e; },
      marquer: function (drapeau) { e.f[drapeau] = 1; },
      action: function (id) { e.actions[id] = 1; },
      duelGagne: function () { e.duels++; },
      combo: function () { e.combos++; },
      duelDefavorable: function () { e.duelsDefav++; },
      anecdote: function () { e.anecdotes++; },
      deck: function (n) { e.deck = n | 0; },
      album: function (n) { e.album = Math.max(e.album | 0, n | 0); },   // l'album ne recule jamais : une carte perdue reste collectionnée
      // Parties jouées avant l'arrivée des trophées : on reprend ce que le jeu sait déjà
      rattraper: function (x) {
        e.victoires = Math.max(e.victoires, x.victoires | 0); e.parties = Math.max(e.parties, x.parties | 0);
        if (x.tuto) e.f.tuto = 1;
        if (x.carriere) e.f.carriere = 1;
        if (x.prise) e.f.prise = 1;
        if (x.deck != null) e.deck = x.deck | 0;
        if (x.album != null) e.album = Math.max(e.album | 0, x.album | 0);
      },
      /* Fin d'une partie contre l'IA. r : 'v', 'd' ou 'n' ; ecart : sièges du joueur moins ceux de l'IA ; mene : le pire écart subi en cours de partie. */
      finPartie: function (x) {
        e.parties++;
        if (x.lieu) e.lieuxJ[x.lieu] = 1;
        if (x.carriere) e.f.carriere = 1;
        if (x.phobie) e.f.phobie = 1;
        if (x.r === 'n') { e.f.egalite = 1; return; }   // un ballottage ne casse aucune série : le second tour tranchera
        if (x.r === 'v') {
          e.victoires++; e.serie++; e.serieMax = Math.max(e.serieMax, e.serie);
          var fort = x.niveau === 'assemblee' || x.niveau === 'elysee';   // les exploits ne comptent pas contre la Mairie
          if (x.niveau) e.niveaux[x.niveau] = (e.niveaux[x.niveau] | 0) + 1;
          if (x.lieu) e.lieuxG[x.lieu] = 1;
          if (x.ecart >= 4 && fort) e.f.raz = 1;
          if (x.ecart >= 6 && x.niveau === 'elysee') e.f.plebiscite = 1;
          if (x.mene <= -4 && fort) e.f.remontada = 1;
          if (x.second) e.f.second = 1;
          if (x.avaitAction && !x.actionJouee && fort) { e.f.sansMains = 1; if (x.niveau === 'elysee') e.f.sansFilet = 1; }
          if (x.proclame) e.f.proclame = 1;
          if (x.suisse) e.f.suisse = 1;
          e.parcours = x.niveau === 'mairie' ? 1 : x.niveau === 'assemblee' ? (e.parcours === 1 ? 2 : 0) : x.niveau === 'elysee' ? (e.parcours === 2 ? 3 : 0) : 0;
          e.parcoursMax = Math.max(e.parcoursMax, e.parcours);
          if (e.parcours === 3) e.parcours = 0;
          if (x.niveau === 'elysee') { e.serieElysee++; e.serieElyseeMax = Math.max(e.serieElyseeMax, e.serieElysee); }
        } else {
          e.serie = 0; e.parcours = 0;
          if (x.niveau === 'elysee') e.serieElysee = 0;
          if (x.ecart <= -6) e.f.deroute = 1;
        }
      },
      verifier: verifier,
      // Pour l'affichage : chaque trophée avec sa date d'obtention (0 sinon) et sa progression
      liste: function () { return L.map(function (t) { return { id: t.id, rang: t.rang, nom: t.nom, desc: t.desc, cache: !!t.cache, obtenu: e.obtenus[t.id] || 0, prog: t.p(e) }; }); },
      total: function () { return [nb(e.obtenus), L.length]; },
      remettreAZero: function () { e = vide(); sauver(); }
    };
  }

  var api = {
    CLE: CLE, RANGS: RANGS, creer: creer,
    // Dans le navigateur : l'état vit dans le stockage local de l'appareil
    local: function (config) {
      return creer({
        lire: function () { return JSON.parse(localStorage.getItem(CLE)); },
        ecrire: function (e) { localStorage.setItem(CLE, JSON.stringify(e)); }
      }, config);
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.HemicycleTrophees = api;
})(typeof window !== 'undefined' ? window : this);
