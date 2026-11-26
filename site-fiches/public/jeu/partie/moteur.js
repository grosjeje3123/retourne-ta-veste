/* Moteur de « L'Hémicycle » : cartes qui se prennent par leurs côtés (plateau 3×3, ou 4×4 avec bancs bloqués ; diagonales en option), cartes action et IA.
   Aucune dépendance au DOM : ce fichier tourne aussi sous Node pour les tests. */
(function (racine) {
  'use strict';
  var J = 0, IA = 1, BANC = -2;   // own : -1 siège libre, -2 siège bloqué (banc), 0 ou 1 propriétaire
  // Côtés 0 ↑, 1 →, 2 ↓, 3 ← ; coins (règle des diagonales) 4 ↗, 5 ↘, 6 ↙, 7 ↖
  var OPP = [2, 3, 0, 1, 6, 7, 4, 5];
  var COIN = [null, null, null, null, [0, 1], [1, 2], [2, 3], [3, 0]];   // un coin = ses deux côtés
  var GRILLES = {};
  // grille(n, diag)[case] = liste de [côté ou coin, case voisine] pour un plateau n × n
  function grille(n, diag) {
    var cle = n + (diag ? 'd' : '');
    if (GRILLES[cle]) return GRILLES[cle];
    var t = [];
    for (var i = 0; i < n * n; i++) {
      var r = (i / n) | 0, c = i % n, v = [];
      if (r > 0) v.push([0, i - n]);
      if (c < n - 1) v.push([1, i + 1]);
      if (r < n - 1) v.push([2, i + n]);
      if (c > 0) v.push([3, i - 1]);
      if (diag) {
        if (r > 0 && c < n - 1) v.push([4, i - n + 1]);
        if (r < n - 1 && c < n - 1) v.push([5, i + n + 1]);
        if (r < n - 1 && c > 0) v.push([6, i + n - 1]);
        if (r > 0 && c > 0) v.push([7, i - n - 1]);
      }
      t.push(v);
    }
    return (GRILLES[cle] = t);
  }
  var VOISINS = grille(3);
  // Index des cartes action, dans l'ordre du fichier de données
  // Réglages des cartes action (campagne d'équilibrage) : modifiables pour les simulations
  // Valeurs de la variante Flèches (campagne d'équilibrage de nov. 2026) ; la version classique garde les siennes.
  var REG = { borne: 2, praud: 2, plenel: 3, oudea: 3, rugySort: 1, djadjaProt: 1 };
  var A = { BORNE: 0, VALLS: 1, BRAUN: 2, GAULLE: 3, SARKO: 4, MACRON: 5, LEMAIRE: 6, LARCHER: 7, ARNAULT: 8, PRAUD: 9, BAYROU: 10, PLENEL: 11,
             RUGY: 12, BACHELOT: 13, COPE: 14, MONTEBOURG: 15, MORANO: 16, MONTCHALIN: 17, OUDEA: 18,
             POUTOU: 19, CAHUZAC: 20, THEVENOUD: 21, MARCHAIS: 22, ATTALI: 23 };

  var VAL = [];            // VAL[carte] = [haut, droite, bas, gauche]
  function charger(valeurs, regleFleches) { VAL = valeurs.map(function (x) { return x.slice(); }); FLE = VAL.map(regleFleches || flechesDe); }

  // o.taille : 3 (classique) ou 4 (grand hémicycle) ; o.bancs : cases bloquées
  function nouvelle(o) {
    var n = o.taille || 3, N = n * n, bancs = o.bancs || [];
    var s = {
      taille: n, N: N, diag: o.diagonales ? 1 : 0, vs: grille(n, !!o.diagonales || !!o.fleches),
      fl: o.fleches ? 1 : 0, alea: o.fleches && o.alea ? o.alea : null,   // variante « Flèches » ; alea : les dés des duels (absent dans les copies de l'IA)
      own: new Int8Array(N).fill(-1), crd: new Int8Array(N).fill(-1), org: new Int8Array(N).fill(-1),
      bst: new Int8Array(N * 4), prot: new Uint8Array(N), quota: [-1, -1],
      mains: [o.mainJ.slice(), o.mainIA.slice()],
      act: [o.actJ == null ? -1 : o.actJ, o.actIA == null ? -1 : o.actIA],
      trait: o.premier, poses: 1, dbl: [0, 0],
      susp: -1, suspOn: 0,
      bracC: -1, bracT: 0, bracCible: -1,
      revCible: -1, revT: 0,
      edito: -1,
      vacc: -1, procl: -1, show: 0, gel: [0, 0], aura: [0, 0],
      // Ordre de jeu équilibré (o.ordre) : le second joueur garde sa dernière carte en main, elle compte pour lui.
      // Grand plateau : « droit de réponse », sa première carte est indéboulonnable.
      // Petit plateau : « prime d'ouverture », la première carte de la partie gagne +1 partout.
      garde: o.ordre ? 1 - o.premier : (o.garde == null ? -1 : o.garde),
      rep: o.ordre && n > 3 ? 1 - o.premier : (o.reponse == null ? -1 : o.reponse),
      ouv: (o.ordre ? n === 3 : o.ouverture) ? 1 : 0,
      pioche: (o.pioche || []).slice(),
      score: [5, 5], vides: N - bancs.length, fin: false, tour: 1,
      proche: o.proche ? 1 : 0, coalition: o.coalition ? 1 : 0,
      suisse: [-1, -1], oubli: -1, oubliCamp: -1, muets: [], clos: 0
    };
    bancs.forEach(function (b) { s.own[b] = BANC; });
    return s;
  }

  function cloner(s) {
    return {
      taille: s.taille, N: s.N, diag: s.diag, vs: s.vs, quota: s.quota.slice(),
      own: s.own.slice(), crd: s.crd.slice(), org: s.org.slice(), bst: s.bst.slice(), prot: s.prot.slice(),
      mains: [s.mains[0].slice(), s.mains[1].slice()], act: s.act.slice(),
      trait: s.trait, poses: s.poses, dbl: s.dbl.slice(),
      susp: s.susp, suspOn: s.suspOn, bracC: s.bracC, bracT: s.bracT, bracCible: s.bracCible,
      revCible: s.revCible, revT: s.revT, edito: s.edito, pioche: s.pioche.slice(),
      vacc: s.vacc == null ? -1 : s.vacc, procl: s.procl == null ? -1 : s.procl, show: s.show | 0,
      gel: s.gel ? s.gel.slice() : [0, 0], aura: s.aura ? s.aura.slice() : [0, 0], garde: s.garde == null ? -1 : s.garde, rep: s.rep == null ? -1 : s.rep, ouv: s.ouv ? 1 : 0,
      score: s.score.slice(), vides: s.vides, fin: s.fin, tour: s.tour,
      proche: s.proche, coalition: s.coalition, fl: s.fl ? 1 : 0,
      suisse: s.suisse ? s.suisse.slice() : [-1, -1], oubli: s.oubli == null ? -1 : s.oubli, oubliCamp: s.oubliCamp == null ? -1 : s.oubliCamp,
      muets: s.muets ? s.muets.slice() : [], clos: s.clos | 0
    };
  }

  // Sauvegarde de la partie en cours : l'état devient du JSON pur (tableaux typés étiquetés, grille et dés recalculés au retour).
  function exporter(s) {
    var o = {};
    Object.keys(s).forEach(function (k) {
      var v = s[k];
      if (k === 'vs' || k === 'alea' || typeof v === 'function') return;
      if (v instanceof Int8Array) o[k] = { __t: 'i8', d: Array.prototype.slice.call(v) };
      else if (v instanceof Uint8Array) o[k] = { __t: 'u8', d: Array.prototype.slice.call(v) };
      else o[k] = v;
    });
    return o;
  }
  function importer(o) {
    var s = {};
    Object.keys(o).forEach(function (k) {
      var v = o[k];
      if (v && v.__t === 'i8') s[k] = Int8Array.from(v.d);
      else if (v && v.__t === 'u8') s[k] = Uint8Array.from(v.d);
      else s[k] = v;
    });
    if (!(s.own instanceof Int8Array) || !(s.bst instanceof Int8Array) || s.own.length !== s.N) throw new Error('sauvegarde illisible');
    s.vs = grille(s.taille, !!(s.diag || s.fl));
    s.alea = s.fl ? Math.random : null;
    return s;
  }

  // Face-à-face (deux joueurs sur un téléphone) : l'état vu de l'autre camp. Les camps 0 et 1 sont échangés partout ;
  // le reste (cartes, cases, dés) ne bouge pas. miroir(miroir(s)) redonne s.
  var CAMPS_TAB = ['quota', 'mains', 'act', 'dbl', 'gel', 'aura', 'score', 'suisse'],
      CAMPS_VAL = ['trait', 'susp', 'bracCible', 'revCible', 'vacc', 'procl', 'garde', 'rep', 'oubliCamp'];
  function miroir(s) {
    var e = {}, inv = function (x) { return x === 0 || x === 1 ? 1 - x : x; };
    Object.keys(s).forEach(function (k) { e[k] = s[k]; });
    e.own = s.own.map(inv); e.org = s.org.map(inv);
    e.bst = s.bst.slice(); e.prot = s.prot.slice(); e.crd = s.crd.slice();
    e.pioche = s.pioche.slice(); e.muets = (s.muets || []).slice();
    CAMPS_TAB.forEach(function (k) { if (Array.isArray(s[k])) e[k] = [s[k][1], s[k][0]].map(function (x) { return Array.isArray(x) ? x.slice() : x; }); });
    CAMPS_VAL.forEach(function (k) { if (s[k] != null) e[k] = inv(s[k]); });
    if (s.saisies) e.saisies = s.saisies.map(function (x) { return [x[0], inv(x[1])]; });
    return e;
  }

  function val(s, cell, side) {
    if (side > 3) { var c = COIN[side]; return val(s, cell, c[0]) + val(s, cell, c[1]); }
    var x = VAL[s.crd[cell]][side] + s.bst[cell * 4 + side]; return x > 10 ? 10 : x < 1 ? 1 : x;
  }
  function valeursCase(s, cell) { return [val(s, cell, 0), val(s, cell, 1), val(s, cell, 2), val(s, cell, 3)]; }
  function sousBracelet(s, carte) { return s.bracT > 0 && s.bracC === carte; }
  // Carte qui ne peut pas changer de camp : indéboulonnable (Larcher) ou vaccinée (Bachelot, jusqu'au prochain tour de son camp)
  function intouchable(s, cell) { return !!s.prot[cell] || (s.vacc >= 0 && s.own[cell] === s.vacc); }

  function retourner(s, cell, p) { s.own[cell] = p; s.score[p]++; s.score[1 - p]--; }

  // Résout les prises après la pose (ou la passation) d'une carte du joueur p en « cell ».
  // « simple » : chiffre contre chiffre seulement, sans À peu près d'accord ni Coalition (cartes action qui font rejouer une carte posée).
  function resoudre(s, p, cell, evts, simple) {
    if (s.suspOn) { if (evts) evts.push({ t: 'suspendu', cells: [] }); return; }
    if (sousBracelet(s, s.crd[cell])) { if (evts) evts.push({ t: 'bracelet', cells: [] }); return; }
    var adv = 1 - p, vs = s.vs[cell], paires = [], k, q;
    for (k = 0; k < vs.length; k++) {
      var n = vs[k][1];
      if (s.own[n] >= 0) paires.push([n, val(s, cell, vs[k][0]), val(s, n, OPP[vs[k][0]]), vs[k][0]]);
    }
    // « À peu près d'accord » et « Coalition » ne jouent que sur les côtés, jamais sur les coins
    var cotes = s.diag ? paires.filter(function (x) { return x[3] < 4; }) : paires;
    var speciaux = [];
    if (cotes.length >= 2 && !simple) {
      if (s.proche) {
        var m = cotes.filter(function (x) { return Math.abs(x[1] - x[2]) <= 1; });
        if (m.length >= 2) {
          var pr = [];
          m.forEach(function (x) { if (s.own[x[0]] === adv && !intouchable(s, x[0])) { retourner(s, x[0], p); pr.push(x[0]); speciaux.push(x[0]); } });
          if (evts) evts.push({ t: 'proche', cells: pr, paires: m.map(function (x) { return x[0]; }) });
        }
      }
      if (s.coalition) {
        var sommes = {};
        cotes.forEach(function (x) { var sm = x[1] + x[2]; (sommes[sm] = sommes[sm] || []).push(x); });
        var co = [], toutes = [];
        Object.keys(sommes).forEach(function (sm) {
          if (sommes[sm].length >= 2) sommes[sm].forEach(function (x) {
            toutes.push(x[0]);
            if (s.own[x[0]] === adv && !intouchable(s, x[0])) { retourner(s, x[0], p); co.push(x[0]); speciaux.push(x[0]); }
          });
        });
        if (toutes.length && evts) evts.push({ t: 'coalition', cells: co, paires: toutes });
      }
    }
    var base = [], diag = [];
    for (k = 0; k < paires.length; k++) {
      q = paires[k];
      if (s.own[q[0]] === adv && !intouchable(s, q[0]) && q[1] > q[2]) { retourner(s, q[0], p); base.push(q[0]); if (q[3] > 3) diag.push(q[0]); }
    }
    if (base.length && evts) evts.push({ t: 'base', cells: base, diag: diag });
    // Effet domino : les cartes prises par « À peu près d'accord » ou « Coalition » prennent à leur tour
    var file = speciaux.slice(), dom = [];
    while (file.length) {
      var x = file.shift();
      if (sousBracelet(s, s.crd[x])) continue;
      var vx = s.vs[x];
      for (k = 0; k < vx.length; k++) {
        var nn = vx[k][1];
        if (s.own[nn] === adv && !intouchable(s, nn) && val(s, x, vx[k][0]) > val(s, nn, OPP[vx[k][0]])) {
          retourner(s, nn, p); dom.push(nn); file.push(nn);
        }
      }
    }
    if (dom.length && evts) evts.push({ t: 'domino', cells: dom });
  }


  /* ---------- Variante « Flèches » (à l'essai) ----------
     Chaque carte porte des flèches : sur ses côtés forts (au moins la moyenne de la carte, ou 7 et plus), et sur les coins dont les deux côtés font au moins cette moyenne.
     À la pose, chaque flèche qui touche une carte adverse l'attaque. Pas de flèche en retour : la carte est prise.
     Une flèche en retour : duel aux dés, l'attaquant tire entre 1 et son Attaque, le défenseur entre 1 et sa Défense, le plus grand gagne, égalité au défenseur.
     Attaque = moyenne arrondie d'Urnes et de Buzz (la popularité) ; Défense = moyenne arrondie d'Expérience et de Terrain (l'ancrage).
     Le vaincu change de camp et entraîne les cartes de son camp qu'il pointait (combo). Un duel perdu arrête tout. */
  var FLE = [];            // FLE[carte] = masque de 8 bits, un par direction (0 ↑, 1 →, 2 ↓, 3 ←, 4 ↗, 5 ↘, 6 ↙, 7 ↖)
  function flechesDe(v) {
    var m = (v[0] + v[1] + v[2] + v[3]) / 4, k = 0, i;
    for (i = 0; i < 4; i++) if (v[i] >= m || v[i] >= 7) k |= 1 << i;
    for (i = 4; i < 8; i++) if ((v[COIN[i][0]] + v[COIN[i][1]]) / 2 >= m) k |= 1 << i;
    return k;
  }
  function fleches(carte) { return FLE[carte] | 0; }
  // Deux chiffres par carte : [Attaque, Défense]
  function statsFleches(v) { return [Math.round((v[0] + v[3]) / 2), Math.round((v[1] + v[2]) / 2)]; }
  // Chance de gagner un duel : tirage de 1 à « a » contre tirage de 1 à « d », victoire si strictement plus grand
  function chanceDuel(a, d) { var g = 0; for (var x = 1; x <= a; x++) g += Math.min(x - 1, d); return g / (a * d); }
  // Ce que la carte du joueur p, déjà en « cell », attaque : prises sûres et duels (du plus favorable au moins favorable)
  function attaques(s, p, cell) {
    var vs = s.vs[cell], m = muette(s, s.crd[cell]) ? 0 : FLE[s.crd[cell]], libres = [], duels = [], proteges = [];
    for (var k = 0; k < vs.length; k++) {
      var dir = vs[k][0], n = vs[k][1];
      if (!((m >> dir) & 1) || s.own[n] !== 1 - p) continue;
      if (intouchable(s, n)) { proteges.push(n); continue; }   // indéboulonnable ou vaccinée : ni prise, ni défiée (on le signale au joueur)
      if (((FLE[s.crd[n]] >> OPP[dir]) & 1) && !sousBracelet(s, s.crd[n]) && !muette(s, s.crd[n])) {   // sous bracelet : elle ne se défend plus
        var a = statsFleches(valeursCase(s, cell))[0], d = statsFleches(valeursCase(s, n))[1];
        duels.push({ cell: n, dir: dir, a: a, d: d, p: chanceDuel(a, d) });
      } else libres.push(n);
    }
    duels.sort(function (x, y) { return y.p - x.p; });
    return { libres: libres, duels: duels, proteges: proteges };
  }
  function apercuFleches(s, carte, cell) {
    var e = cloner(s); e.own[cell] = s.trait; e.crd[cell] = carte;
    return attaques(e, s.trait, cell);
  }
  // Les cartes du camp « camp » que la carte en « cell » pointe : elles suivent le vaincu
  function entrainees(s, cell, camp) {
    var vs = s.vs[cell], m = muette(s, s.crd[cell]) ? 0 : FLE[s.crd[cell]], t = [];
    for (var k = 0; k < vs.length; k++) if (((m >> vs[k][0]) & 1) && s.own[vs[k][1]] === camp && !intouchable(s, vs[k][1])) t.push(vs[k][1]);
    return t;
  }
  function resoudreFleches(s, p, cell, evts) {
    if (s.suspOn) { if (evts) evts.push({ t: 'suspendu', cells: [] }); return; }                    // Suspension de séance
    if (sousBracelet(s, s.crd[cell])) { if (evts) evts.push({ t: 'bracelet', cells: [] }); return; }  // sous bracelet : elle n'attaque pas
    var adv = 1 - p, at = attaques(s, p, cell), k;
    if (at.proteges.length && evts) evts.push({ t: 'protegee', cells: [], proteges: at.proteges.slice(), vaccin: at.proteges.map(function (x) { return !s.prot[x]; }) });
    for (k = 0; k < at.duels.length; k++) {
      var du = at.duels[k], ra, rd, gagne, suite;
      if (s.own[du.cell] !== adv) continue;   // déjà entraînée par un duel gagné juste avant
      if (s.alea && !s.tranche) { ra = 1 + ((s.alea() * du.a) | 0); rd = 1 + ((s.alea() * du.d) | 0); gagne = ra > rd; }
      else if (s.tranche) { gagne = du.a > du.d; ra = du.a; rd = du.d; }
      else if (s.sorts && s.sorts.length) { gagne = s.sorts.shift(); ra = du.a; rd = du.d; }   // l'IA examine une issue précise de ce duel
      else { gagne = du.p >= 0.5; ra = du.a; rd = du.d; }   // plus loin dans sa réflexion, elle compte un duel comme gagné s'il est favorable
      if (gagne) {
        suite = entrainees(s, du.cell, adv);
        retourner(s, du.cell, p);
        if (evts) evts.push({ t: 'duel', tranche: !!s.tranche, de: cell, cible: du.cell, a: du.a, d: du.d, ra: ra, rd: rd, gagne: true, cells: [du.cell], vers: p });
        suite.forEach(function (x) { retourner(s, x, p); });
        if (suite.length && evts) evts.push({ t: 'combo', cells: suite, vers: p });
      } else {
        var tient = intouchable(s, cell);   // indéboulonnable : le duel est perdu, mais la carte reste en place et n'entraîne personne
        suite = tient ? [] : entrainees(s, cell, p);
        if (!tient) retourner(s, cell, adv);
        if (evts) evts.push({ t: 'duel', tranche: !!s.tranche, de: cell, cible: du.cell, a: du.a, d: du.d, ra: ra, rd: rd, gagne: false, cells: tient ? [] : [cell], vers: adv });
        suite.forEach(function (x) { retourner(s, x, adv); });
        if (suite.length && evts) evts.push({ t: 'combo', cells: suite, vers: adv });
        return;
      }
    }
    var pr = at.libres.filter(function (x) { return s.own[x] === adv; });
    pr.forEach(function (x) { retourner(s, x, p); });
    if (pr.length && evts) evts.push({ t: 'base', cells: pr, vers: p, diag: [] });
  }
  // Cote d'une carte, pour distribuer des mains de même force. Ajustée sur 5 000 parties simulées (tests/cote_fleches.js) :
  // la part de victoires d'une carte suit surtout son nombre de flèches, puis son Attaque, puis sa Défense (R² = 0,78).
  function coteFleches(carte) {
    var st = statsFleches(VAL[carte]), m = FLE[carte], nf = 0;
    while (m) { nf += m & 1; m >>= 1; }
    return 2 * st[0] + st[1] + 7 * nf;
  }
  // Dix cartes au hasard, coupées en deux mains de cinq dont les cotes totales sont les plus proches possible
  function donneFleches(alea) {
    alea = alea || Math.random;
    var ids = [], i, j, x;
    for (i = 0; i < VAL.length; i++) ids.push(i);
    for (i = ids.length - 1; i > 0; i--) { j = (alea() * (i + 1)) | 0; x = ids[i]; ids[i] = ids[j]; ids[j] = x; }
    var dix = ids.slice(0, 10), total = 0, best = [], bd = Infinity, m, k;
    for (k = 0; k < 10; k++) total += coteFleches(dix[k]);
    for (m = 1; m < 1024; m += 2) {   // la première carte reste dans la main A : chaque partage est vu une fois
      var nb = 0, sx = 0;
      for (k = 0; k < 10; k++) if ((m >> k) & 1) { nb++; sx += coteFleches(dix[k]); }
      if (nb !== 5) continue;
      var d = Math.abs(2 * sx - total);
      if (d < bd) { bd = d; best = [m]; } else if (d === bd) best.push(m);
    }
    m = best[(alea() * best.length) | 0];
    var a = [], b = [];
    for (k = 0; k < 10; k++) (((m >> k) & 1) ? a : b).push(dix[k]);
    return alea() < 0.5 ? [a, b, ids.slice(10)] : [b, a, ids.slice(10)];
  }
  // Pour l'IA : une carte est exposée par chaque siège libre d'où on pourrait la prendre sans duel (côté sans flèche)
  function expositionFleches(s) {
    var e = 0;
    for (var i = 0; i < s.N; i++) {
      if (s.own[i] < 0) continue;
      var vs = s.vs[i], m = FLE[s.crd[i]], sg = s.own[i] === IA ? 1 : -1;
      for (var k = 0; k < vs.length; k++) if (s.own[vs[k][1]] === -1) e += sg * (((m >> vs[k][0]) & 1) ? 0.03 : -0.05);
    }
    return e;
  }

  // Cartes qu'un joueur peut encore poser : celui qui « garde » conserve toujours une carte en main (elle compte pour lui).
  // Dans la vue de l'IA, la main adverse est un vivier : c'est alors le quota qui fait foi.
  function posables(s, p) { return s.quota[p] > 0 ? s.quota[p] : s.mains[p].length - (s.garde === p ? 1 : 0) - (s.gel ? s.gel[p] : 0); }

  function retirer(main, carte) { var i = main.indexOf(carte); if (i >= 0) main.splice(i, 1); return i >= 0; }

  // Pose une carte de la main du joueur au trait. Renvoie la liste des événements.
  function poser(s, carte, cell, evts) {
    var p = s.trait;
    retirer(s.mains[p], carte);
    // Vue de l'IA : la main adverse est un vivier de cartes possibles, mais elle n'en pose que « quota »
    if (s.quota[p] > 0 && --s.quota[p] === 0) s.mains[p] = [];
    s.own[cell] = p; s.crd[cell] = carte; s.org[cell] = p; s.vides--;
    if (s.edito >= 0) { for (var ke = 0; ke < 4; ke++) s.bst[cell * 4 + ke] += ke === s.edito ? 3 : 1; s.edito = -1; }   // Édito : +3 d'un côté, +1 ailleurs
    if (s.show) { for (var k = 0; k < 4; k++) s.bst[cell * 4 + k] += s.show; s.show = 0; if (s.fl && REG.djadjaProt) s.prot[cell] = 1; }   // Djadja show : +3 partout (Flèches : et indéboulonnable)
    if (s.aura[p]) { for (var ka = 0; ka < 4; ka++) s.bst[cell * 4 + ka] += s.aura[p]; }   // Édito quotidien : +1 partout sur chaque carte posée
    if (s.ouv) { for (var k2 = 0; k2 < 4; k2++) s.bst[cell * 4 + k2] += 1; s.ouv = 0; if (evts) evts.push({ t: 'ouverture', cells: [cell] }); }   // prime d'ouverture : +1 partout
    if (s.rep === p) { s.prot[cell] = 1; s.rep = -1; if (evts) evts.push({ t: 'reponse', cells: [cell] }); }   // droit de réponse : indéboulonnable
    if (s.fl) resoudreFleches(s, p, cell, evts); else resoudre(s, p, cell, evts);
    s.poses--;
    if (s.vides === 0) { terminer(s); return evts; }
    if (s.poses > 0 && posables(s, p) > 0) return evts;
    finTour(s);
    return evts;
  }

  function finTour(s) {
    var p = s.trait;
    if (s.susp === p && !s.suspOn) s.suspOn = 1;
    if (s.bracT > 0 && s.bracCible === p) { s.bracT--; if (!s.bracT) s.bracC = -1; }
    if (s.revT > 0 && s.revCible === p) { s.revT--; if (!s.revT) s.revCible = -1; }
    s.edito = -1; s.show = 0;
    s.trait = 1 - p;
    s.tour++;
    debutTour(s, 0);
  }

  function debutTour(s, garde) {
    if (s.vides === 0) { terminer(s); return; }
    var p = s.trait;
    if (s.susp === p && s.suspOn) { s.susp = -1; s.suspOn = 0; }
    if (s.vacc === p) s.vacc = -1;
    s.poses = 1;
    if (s.dbl[p]) { s.poses = 2; s.dbl[p] = 0; }
    if (posables(s, p) <= 0) {
      if (garde > 2) { terminer(s); return; }
      s.trait = 1 - p; s.tour++;
      debutTour(s, garde + 1);
    }
  }

  // Fin de partie. Phobie administrative (Thévenoud) : la carte « oubliée » ne compte pas si elle est restée dans le camp visé
  function campDe(s, carte) {
    for (var k = 0; k < 2; k++) if (s.mains[k].indexOf(carte) >= 0 || (s.suisse && s.suisse[k] === carte)) return k;
    for (var i = 0; i < s.N; i++) if (s.crd[i] === carte && s.own[i] >= 0) return s.own[i];
    return -1;
  }
  function terminer(s) {
    s.fin = true;
    if (s.clos) return;
    s.clos = 1;
    if (s.oubli >= 0 && campDe(s, s.oubli) === s.oubliCamp) { s.score[s.oubliCamp]--; s.oubliCompte = 1; }
  }
  // Taisez-vous ! (Marchais) : en Flèches, la carte n'a plus de flèche
  function muette(s, carte) { return !!(s.muets && s.muets.length && s.muets.indexOf(carte) >= 0); }

  // Grand plateau : 4 à 7 sièges bloqués, donc 9 à 12 sièges libres pour 9 cartes posées
  function nbBancs(alea) { return 4 + (((alea || Math.random)() * 4) | 0); }
  function casesVides(s) { var t = []; for (var i = 0; i < s.N; i++) if (s.own[i] === -1) t.push(i); return t; }
  function nbSur(s, p) { var n = 0; for (var i = 0; i < s.N; i++) if (s.own[i] === p) n++; return n; }
  // Poses qui restent dans la partie : sièges libres ou cartes en main, le plus petit des deux
  function placesRestantes(s) { return Math.min(s.vides, Math.max(0, posables(s, 0)) + Math.max(0, posables(s, 1))); }

  /* ---------- Cartes action ---------- */
  // Cibles possibles d'une carte action pour le joueur au trait. Renvoie null si injouable, avec la raison dans .raison.
  function ciblesAction(s, a) {
    var p = s.trait, adv = 1 - p, i, t = [];
    var res = { cibles: null, raison: '' };
    var flipsBloques = s.suspOn ? 'Séance suspendue : aucune carte ne peut changer de camp.' : '';
    switch (a) {
      case A.BORNE:
        if (flipsBloques) { res.raison = flipsBloques; break; }
        if (posables(s, p) < 2) { res.raison = 'Trop tard : cette carte ne se joue pas à ton dernier tour.'; break; }
        if (nbSur(s, adv) >= 5) { res.raison = 'Censure : l’adversaire tient la majorité absolue (5 sièges ou plus).'; break; }
        for (i = 0; i < s.N; i++) if (s.own[i] === adv && !intouchable(s, i)) t.push(i);
        if (!t.length) { res.raison = 'Aucune carte adverse à prendre sur le plateau.'; break; }
        res.cibles = t; break;
      case A.VALLS:
        if (posables(s, p) < 2) { res.raison = 'Trop tard : cette carte ne se joue pas à ton dernier tour.'; break; }
        if (flipsBloques) { res.raison = flipsBloques; break; }
        var mien = [], sien = [];
        for (i = 0; i < s.N; i++) { if (s.own[i] === p && !intouchable(s, i)) mien.push(i); if (s.own[i] === adv && !intouchable(s, i)) sien.push(i); }
        if (!mien.length || !sien.length) { res.raison = 'Il faut une carte à toi et une carte adverse sur le plateau.'; break; }
        res.cibles = [mien, sien]; break;
      case A.BRAUN:
        res.cibles = []; break;
      case A.GAULLE:
        if (flipsBloques) { res.raison = flipsBloques; break; }
        for (i = 0; i < s.N; i++) if (s.own[i] === adv && s.org[i] === p && !intouchable(s, i)) t.push(i);
        if (!t.length) { res.raison = 'Aucune de tes cartes n’est passée chez l’adversaire.'; break; }
        res.cibles = t; break;
      case A.SARKO:
        if (!s.mains[adv].length) { res.raison = 'L’adversaire n’a plus de carte en main.'; break; }
        res.cibles = s.mains[adv].slice(); break;
      case A.MACRON:
        for (i = 0; i < s.N; i++) if (s.own[i] === p) t.push(i);
        if (!t.length) { res.raison = 'Il faut une de tes cartes sur le plateau.'; break; }
        if (!s.mains[p].length) { res.raison = 'Il faut une carte en main.'; break; }
        res.cibles = [t, s.mains[p].slice()]; break;
      case A.LEMAIRE:
        if (posables(s, p) < 3) { res.raison = 'Trop tard : il te faut encore trois cartes à poser.'; break; }
        res.cibles = []; break;
      case A.LARCHER:
        for (i = 0; i < s.N; i++) if (s.own[i] === p && !s.prot[i]) t.push(i);
        if (!t.length) { res.raison = 'Il faut une de tes cartes sur le plateau.'; break; }
        res.cibles = t; break;
      case A.ARNAULT:
        if (s.fl) { for (i = 0; i < s.N; i++) if (s.own[i] === adv && !intouchable(s, i)) t.push(i); if (!t.length) { res.raison = 'Aucune carte adverse à racheter.'; break; } res.cibles = t; break; }
        if (s.vides < 2) { res.raison = 'Il faut au moins deux sièges libres : un à racheter, un pour ta carte.'; break; }
        res.cibles = casesVides(s); break;
      case A.PRAUD:
        res.cibles = []; break;
      case A.POUTOU:   // pas d'immunité ouvrière : il faut une protection adverse à faire tomber
        if (s.vacc === adv || s.rep === adv) { res.cibles = []; break; }
        for (i = 0; i < s.N; i++) if (s.own[i] === adv && s.prot[i]) { res.cibles = []; break; }
        if (!res.cibles) res.raison = 'Aucune carte adverse n’est protégée.';
        break;
      case A.CAHUZAC:   // compte en Suisse : une carte de ta main, mais il t'en faut encore une à poser
        if (s.suisse && s.suisse[p] >= 0) { res.raison = 'Tu as déjà un compte en Suisse.'; break; }
        if (posables(s, p) < 2) { res.raison = 'Il te faut au moins deux cartes à poser.'; break; }
        res.cibles = s.mains[p].slice(); break;
      case A.THEVENOUD:   // phobie administrative : une carte de la main adverse
        if (!s.mains[adv].length) { res.raison = 'L’adversaire n’a plus de carte en main.'; break; }
        res.cibles = s.mains[adv].slice(); break;
      case A.MARCHAIS:   // Taisez-vous ! : une carte adverse posée
        for (i = 0; i < s.N; i++) if (s.own[i] === adv && !intouchable(s, i) && !muette(s, s.crd[i])) t.push(i);
        if (!t.length) { res.raison = 'Aucune carte adverse à faire taire.'; break; }
        res.cibles = t; break;
      case A.ATTALI:   // le mentor de tout bord : une de tes cartes posées grandit et repart à l'attaque
        if (flipsBloques) { res.raison = flipsBloques; break; }
        if (posables(s, p) < 2) { res.raison = 'Trop tard : cette carte ne se joue pas à ton dernier tour.'; break; }
        for (i = 0; i < s.N; i++) if (s.own[i] === p && !muette(s, s.crd[i]) && !sousBracelet(s, s.crd[i])) t.push(i);
        if (!t.length) { res.raison = 'Tu n’as encore aucune carte posée à faire grandir.'; break; }
        res.cibles = t; break;
      case A.BAYROU:
        if (!s.pioche.length) { res.raison = 'La pioche est vide.'; break; }
        res.cibles = s.pioche.slice(0, 3); break;
      case A.PLENEL:
        res.cibles = []; break;
      case A.RUGY:   // invitation à dîner : une carte adverse quitte le plateau (sauf indéboulonnable)
        for (i = 0; i < s.N; i++) if (s.own[i] === adv && !s.prot[i]) t.push(i);
        if (!t.length) { res.raison = 'Aucune carte adverse à inviter à dîner.'; break; }
        res.cibles = t; break;
      case A.BACHELOT: case A.COPE:
        res.cibles = []; break;
      case A.MONTEBOURG:
        for (i = 0; i < s.N; i++) if (s.own[i] === p && !s.prot[i]) t.push(i);
        var libres = casesVides(s);
        if (!t.length) { res.raison = 'Il faut une de tes cartes sur le plateau.'; break; }
        if (!libres.length) { res.raison = 'Aucun siège libre où déménager.'; break; }
        res.cibles = [t, libres]; break;
      case A.MORANO:
        if (s.act[adv] < 0) { res.raison = 'L’adversaire n’a plus de carte action à annuler.'; break; }
        res.cibles = []; break;
      case A.MONTCHALIN:   // contrôle a posteriori : une de tes cartes rejuge ses voisines adverses
        if (flipsBloques) { res.raison = flipsBloques; break; }
        if (posables(s, p) < 2) { res.raison = 'Trop tard : cette carte ne se joue pas à ton dernier tour.'; break; }
        for (i = 0; i < s.N; i++) if (s.own[i] === p && !sousBracelet(s, s.crd[i]) && (s.fl ? aDesCibles(s, p, i) : voisinesAdverses(s, i, adv))) t.push(i);
        if (!t.length) { res.raison = s.fl ? 'Aucune de tes cartes ne pointe de flèche vers une carte adverse.' : 'Aucune de tes cartes n’a de voisine adverse à contrôler.'; break; }
        res.cibles = t; break;
      case A.OUDEA:
        res.cibles = []; break;
    }
    return res;
  }
  // Une carte déjà posée se bat de nouveau (Mercato, Relocalisation, Contrôle) : chiffre contre chiffre en classique, ses flèches en Flèches
  function rejouer(s, p, cell, evts) { if (s.fl) resoudreFleches(s, p, cell, evts); else resoudre(s, p, cell, evts, true); }
  // Voisines adverses qu'une carte pourrait encore prendre (ni indéboulonnables ni vaccinées)
  function aDesCibles(s, p, cell) { var at = attaques(s, p, cell); return at.libres.length + at.duels.length > 0; }
  function voisinesAdverses(s, cell, adv) {
    var vs = s.vs[cell], n = 0;
    for (var k = 0; k < vs.length; k++) if (s.own[vs[k][1]] === adv && !intouchable(s, vs[k][1])) n++;
    return n;
  }

  // Applique une carte action. arg dépend de la carte (case, paire de cases, carte, côté…). Renvoie des événements.
  function jouerAction(s, a, arg, evts) {
    var p = s.trait, adv = 1 - p;
    evts = evts || [];
    s.act[p] = -1;
    switch (a) {
      case A.BORNE:   // passage en force : la carte change de camp, mais en sort fragilisée (-1 partout)
        retourner(s, arg, p); for (var kb = 0; kb < 4; kb++) s.bst[arg * 4 + kb] -= s.fl ? REG.borne : 1;
        evts.push({ t: 'action', cells: [arg] }); break;
      case A.VALLS:   // mercato : échange de camp, puis la recrue rejuge ses voisines, chiffre contre chiffre
        retourner(s, arg[0], adv); retourner(s, arg[1], p); evts.push({ t: 'action', cells: [arg[0], arg[1]], vers: [adv, p] });
        rejouer(s, p, arg[1], evts); break;
      case A.BRAUN: s.susp = p; s.suspOn = 0; break;
      case A.GAULLE: retourner(s, arg, p); evts.push({ t: 'action', cells: [arg] }); break;
      case A.SARKO: s.bracC = arg; s.bracT = s.fl ? 99 : 2; s.bracCible = adv; break;   // Flèches : jusqu'à la fin, ni attaque ni défense
      case A.MACRON:
        var cell = arg[0], carte = arg[1], ancienne = s.crd[cell];
        retirer(s.mains[p], carte); s.mains[p].push(ancienne);
        s.crd[cell] = carte; s.prot[cell] = 0;
        for (var k = 0; k < 4; k++) s.bst[cell * 4 + k] = 0;
        evts.push({ t: 'passation', cells: [cell], ancienne: ancienne });
        if (s.fl) resoudreFleches(s, p, cell, evts); else resoudre(s, p, cell, evts);
        break;
      case A.LEMAIRE: s.dbl[p] = 1; finTour(s); break;
      case A.LARCHER:   // la carte choisie et la prochaine posée (Flèches comprises : 45 % avec la carte choisie seule, 50,7 % ainsi, campagne de nov. 2026)
        s.prot[arg] = 1; if (s.rep < 0) s.rep = p; evts.push({ t: 'fauteuil', cells: [arg] }); break;
      case A.ARNAULT:   // rachat : un siège libre est retiré du jeu, plus personne ne peut s'y asseoir
        if (s.fl) { s.score[s.own[arg]]--;   // Flèches : la carte adverse rachetée quitte la partie, son siège avec
          s.own[arg] = BANC; s.crd[arg] = -1; s.org[arg] = -1; evts.push({ t: 'rachat', cells: [], cell: arg }); break; }
        s.own[arg] = BANC; s.vides--;
        evts.push({ t: 'rachat', cells: [], cell: arg });
        break;
      case A.PRAUD: s.aura[p] = s.fl ? REG.praud : 1; evts.push({ t: 'edito', cells: [] }); break;
      case A.POUTOU:   // les protections adverses tombent : fauteuils, vaccin, et la future carte indéboulonnable
        var tombees = [];
        for (var ip = 0; ip < s.N; ip++) if (s.own[ip] === adv && (s.prot[ip] || s.vacc === adv)) { s.prot[ip] = 0; tombees.push(ip); }
        if (s.vacc === adv) s.vacc = -1;
        if (s.rep === adv) s.rep = -1;
        evts.push({ t: 'immunite', cells: tombees }); break;
      case A.CAHUZAC:   // la carte part en Suisse et compte pour toi ; si Mediapart (Révélation) est déjà passé, elle file en face
        retirer(s.mains[p], arg);
        if (s.revT > 0 && s.revCible === p) { s.score[p]--; s.score[adv]++; s.saisies = (s.saisies || []).concat([[arg, adv]]); evts.push({ t: 'suisse-revelee', cells: [], carte: arg, vers: adv }); }
        else { s.suisse[p] = arg; evts.push({ t: 'suisse', cells: [], carte: arg }); }
        if (s.pioche.length) { var tiree = s.pioche.shift(); s.mains[p].push(tiree); s.score[p]++; evts.push({ t: 'pioche', cells: [], carte: tiree }); }   // et une carte fraîche pour la remplacer (mesuré : -14 sans)
        break;
      case A.THEVENOUD: s.oubli = arg; s.oubliCamp = adv; evts.push({ t: 'oubli', cells: [], carte: arg }); break;
      case A.MARCHAIS:
        s.muets = (s.muets || []).concat([s.crd[arg]]);
        if (!s.fl) for (var km = 0; km < 4; km++) s.bst[arg * 4 + km] -= 3;   // classique : la carte perd 3 partout
        evts.push({ t: 'muette', cells: [arg] }); break;
      case A.ATTALI:   // le mentor : +2 sur les quatre côtés (10 au plus ; en Flèches, +2 en Attaque et en Défense), puis la carte repart à l'attaque
        for (var kt = 0; kt < 4; kt++) s.bst[arg * 4 + kt] += 2;
        evts.push({ t: 'mentor', cells: [arg] });
        rejouer(s, p, arg, evts);   // mesuré : +10 ainsi, -10 avec le seul bonus (l'IA ne le jouait presque jamais)
        break;
      case A.BAYROU:
        if (arg) {
          var iP = s.pioche.indexOf(arg[0]);
          retirer(s.mains[p], arg[1]); s.mains[p].push(arg[0]);
          s.pioche.splice(iP, 1); s.pioche.push(arg[1]);
        }
        break;
      case A.PLENEL: s.revCible = adv; s.revT = s.fl ? REG.plenel : 99;   // main ouverte (Flèches : pendant ses trois prochains tours ; classique : jusqu'à la fin)
        if (s.suisse && s.suisse[adv] >= 0) {   // et le compte en Suisse est découvert : la carte change de camp
          var dec = s.suisse[adv]; s.suisse[adv] = -1; s.score[adv]--; s.score[p]++; s.saisies = (s.saisies || []).concat([[dec, p]]);
          evts.push({ t: 'suisse-revelee', cells: [], carte: dec, vers: p });
        }
        break;
      case A.RUGY:   // la carte quitte l'hémicycle et retourne dans la main de son camp
        var invitee = s.crd[arg], hote = s.own[arg];
        s.own[arg] = -1; s.crd[arg] = -1; s.org[arg] = -1; s.prot[arg] = 0; s.vides++;
        for (var k2 = 0; k2 < 4; k2++) s.bst[arg * 4 + k2] = 0;
        if (s.fl && REG.rugySort) s.score[hote]--;   // Flèches : elle quitte la partie
        else { s.mains[hote].push(invitee); s.gel[hote]++; }   // elle reste à table : son camp garde une carte de plus en main
        evts.push({ t: 'homard', cells: [], cell: arg, carte: invitee });
        break;
      case A.BACHELOT: s.vacc = p; evts.push({ t: 'vaccin', cells: [] }); break;
      case A.COPE: s.procl = p; break;
      case A.MONTEBOURG:   // la carte déménage sur un siège libre et s'y bat de nouveau
        var de = arg[0], vers = arg[1];
        s.own[vers] = p; s.crd[vers] = s.crd[de]; s.org[vers] = s.org[de];
        for (var k3 = 0; k3 < 4; k3++) { s.bst[vers * 4 + k3] = s.bst[de * 4 + k3]; s.bst[de * 4 + k3] = 0; }
        s.own[de] = -1; s.crd[de] = -1; s.org[de] = -1;
        evts.push({ t: 'demenage', cells: [], de: de, vers: vers });
        rejouer(s, p, vers, evts);
        break;
      case A.MORANO:
        evts.push({ t: 'annule', cells: [], carte: s.act[adv] });
        s.act[adv] = -1;
        break;
      case A.MONTCHALIN:   // la carte se bat de nouveau, sur place, comme si elle venait d'être posée
        evts.push({ t: 'controle', cells: [], cell: arg });
        if (s.fl) s.tranche = 1;   // la Cour tranche : pas de dés, Attaque contre Défense
        rejouer(s, p, arg, evts); s.tranche = 0;
        break;
      case A.OUDEA: s.show = s.fl ? REG.oudea : 3; evts.push({ t: 'show', cells: [] }); break;
    }
    return evts;
  }

  // Gagnant : 0, 1, ou -1 pour un ballottage ; « Proclamé » (Copé) départage une égalité
  function gagnant(s) { return s.score[0] > s.score[1] ? 0 : s.score[0] < s.score[1] ? 1 : (s.procl >= 0 ? s.procl : -1); }
  function valeurFinale(s) { var d = s.score[IA] - s.score[J]; return d * 10 + (d === 0 && s.procl >= 0 ? (s.procl === IA ? 5 : -5) : 0); }

  function mainVisible(s, k, transparence) { return transparence || (s.revT > 0 && s.revCible === k); }

  /* ---------- IA ---------- */
  function evaluer(s) {
    var v = s.score[IA] - s.score[J], e = 0;
    if (s.fl) return v + expositionFleches(s);
    for (var i = 0; i < s.N; i++) {
      if (s.own[i] < 0) continue;
      var vs = s.vs[i], sg = s.own[i] === IA ? 1 : -1;
      for (var k = 0; k < vs.length; k++) if (s.own[vs[k][1]] === -1) {
        var cote = vs[k][0], vc = val(s, i, cote);
        e += sg * (cote > 3 ? (vc - 11) * 0.0125 : (vc - 5.5) * 0.025);
      }
      if (s.prot[i]) e += sg * 0.25;
    }
    if (s.procl >= 0) e += (s.procl === IA ? 1 : -1) * 0.3;
    return v + e;
  }

  function enfants(s) {
    var p = s.trait, main = s.mains[p], vides = casesVides(s), out = [];
    for (var a = 0; a < main.length; a++) for (var b = 0; b < vides.length; b++) {
      var e = cloner(s);
      poser(e, main[a], vides[b], null);
      out.push({ carte: main[a], cell: vides[b], e: e, g: e.score[p] - s.score[p] });
    }
    out.sort(function (x, y) { return y.g - x.g; });
    return out;
  }

  var deadline = Infinity, interrompu = false, noeuds = 0, largeur = Infinity;
  function minimax(s, prof, alpha, beta) {
    if (s.fin || s.vides === 0) return valeurFinale(s);
    if (prof === 0) return evaluer(s) * 10;
    if ((++noeuds & 1023) === 0 && Date.now() > deadline) interrompu = true;
    if (interrompu) return 0;
    var kids = enfants(s), max = s.trait === IA, best = max ? -Infinity : Infinity;
    for (var i = 0; i < kids.length && i < largeur; i++) {
      var v = minimax(kids[i].e, prof - 1, alpha, beta);
      if (max) { if (v > best) best = v; if (best > alpha) alpha = best; }
      else { if (v < best) best = v; if (best < beta) beta = best; }
      if (alpha >= beta) break;
    }
    return best;
  }

  // Ce que l'IA sait : sans transparence, la main du joueur est remplacée par toutes les cartes qu'elle ne voit pas.
  function vueIA(s, inconnues) {
    var e = cloner(s);
    if (inconnues) { e.quota[J] = posables(s, J); e.mains[J] = e.quota[J] > 0 ? inconnues.slice() : []; }
    // L'IA qui garde une carte choisit d'avance laquelle : sa plus faible (elle ne sera pas posée)
    if (e.garde === IA && e.mains[IA].length > 1) {
      var m = e.mains[IA], f = 0, somme = e.fl ? coteFleches : function (c) { return VAL[c][0] + VAL[c][1] + VAL[c][2] + VAL[c][3]; };
      for (var i = 1; i < m.length; i++) if (somme(m[i]) < somme(m[f])) f = i;
      m.splice(f, 1); e.garde = -1;
    }
    return e;
  }

  // Valeur d'un coup à la racine. Variante « Flèches » : l'IA pèse chaque issue des duels du coup
  // (perdre le premier, gagner le premier puis perdre le deuxième…, tout gagner), chacune avec sa probabilité.
  function valeurCoup(s, kid, prof, alpha) {
    var du = s.fl ? apercuFleches(s, kid.carte, kid.cell).duels : [];
    if (!du.length) return minimax(kid.e, prof - 1, alpha, Infinity);
    var total = 0, pr = 1;
    for (var i = 0; i <= du.length; i++) {
      var p = i < du.length ? pr * (1 - du[i].p) : pr;
      if (p > 0.001) {
        var e = cloner(s), sc = [];
        for (var j = 0; j < i; j++) sc.push(true);
        if (i < du.length) sc.push(false);
        e.sorts = sc; poser(e, kid.carte, kid.cell, null); e.sorts = null;
        total += p * minimax(e, prof - 1, -Infinity, Infinity);
        if (interrompu) return 0;
      }
      if (i < du.length) pr *= du[i].p;
    }
    return total;
  }

  function racineMeilleure(s, prof, budget) {
    var kids = enfants(s), best = null, bestV = -Infinity;
    for (var i = 0; i < kids.length; i++) {
      var v = valeurCoup(s, kids[i], prof, bestV);
      if (interrompu) return null;
      if (v > bestV) { bestV = v; best = kids[i]; }
    }
    return best ? { carte: best.carte, cell: best.cell, v: bestV } : null;
  }

  // Valeur (pour l'IA) d'un état où c'est encore à l'IA de poser, à profondeur fixe.
  function valeurEtat(s, prof) {
    deadline = Infinity; interrompu = false;
    if (s.fin || s.vides === 0) return valeurFinale(s);
    return minimax(s, prof, -Infinity, Infinity);
  }

  function choisirPose(s, niveau, inconnues, alea) {
    alea = alea || Math.random;
    var v = vueIA(s, inconnues);
    if (niveau === 'mairie') {
      var kids = enfants(v);
      if (alea() < 0.4) { var k = kids[(alea() * kids.length) | 0]; return { carte: k.carte, cell: k.cell }; }
      var top = kids.filter(function (x) { return x.g === kids[0].g; });
      var c = top[(alea() * top.length) | 0];
      return { carte: c.carte, cell: c.cell };
    }
    if (typeof niveau === 'number') {   // profondeur fixe, pour les simulations d'équilibrage
      deadline = Infinity; interrompu = false; largeur = niveau > 2 ? 14 : Infinity;
      var rn = racineMeilleure(v, niveau); largeur = Infinity; return rn;
    }
    if (niveau === 'assemblee') {
      deadline = Infinity; interrompu = false; largeur = Infinity;
      return racineMeilleure(v, 2);
    }
    // Élysée, main du joueur cachée : on tire plusieurs mains plausibles et on garde le coup le meilleur en moyenne
    if (inconnues) return pimc(s, inconnues, alea);
    // Élysée, mains connues : approfondissement itératif dans un budget de temps
    var debut = Date.now(), res = null, fin = placesRestantes(s);
    deadline = debut + 900; interrompu = false; noeuds = 0;
    for (var prof = 2; prof <= fin; prof++) {
      largeur = s.taille > 3 && prof > 2 ? 14 : Infinity;   // grand plateau : au-delà de 2 coups, faisceau des 14 meilleurs
      var r = racineMeilleure(v, prof);
      if (!r) break;
      res = r;
      if (Date.now() - debut > 450) break;
    }
    interrompu = false; largeur = Infinity;
    if (!res) { deadline = Infinity; res = racineMeilleure(v, 2); }
    return res;
  }

  function valeursRacine(s, prof) {
    var kids = enfants(s), out = [];
    for (var i = 0; i < kids.length; i++) {
      var v = valeurCoup(s, kids[i], prof, -Infinity);
      if (interrompu) return null;
      out.push({ k: kids[i].carte * 16 + kids[i].cell, carte: kids[i].carte, cell: kids[i].cell, v: v });
    }
    return out;
  }

  function pimc(s, inconnues, alea) {
    var n = s.mains[J].length, debut = Date.now(), total = {}, info = {}, nEch = 6, fin = placesRestantes(s);
    largeur = Infinity;
    for (var e = 0; e < nEch; e++) {
      var pool = inconnues.slice();
      for (var i = pool.length - 1; i > 0; i--) { var j = (alea() * (i + 1)) | 0, t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
      var v = vueIA(s, pool.slice(0, n));
      var reste = 700 - (Date.now() - debut);
      if (reste < 60) break;
      deadline = Date.now() + reste / (nEch - e); interrompu = false;
      var res = null;
      for (var prof = 2; prof <= fin; prof++) { var r = valeursRacine(v, prof); if (!r) break; res = r; }
      interrompu = false;
      if (!res) { deadline = Infinity; res = valeursRacine(v, 1); }
      res.forEach(function (x) { total[x.k] = (total[x.k] || 0) + x.v; info[x.k] = x; });
    }
    var best = null, bv = -Infinity;
    Object.keys(total).forEach(function (k) { if (total[k] > bv) { bv = total[k]; best = info[k]; } });
    deadline = Infinity;
    return best ? { carte: best.carte, cell: best.cell } : null;
  }

  // L'IA décide si elle joue sa carte action ce tour-ci, et comment. Renvoie null ou {arg}.
  function choisirAction(s, niveau, inconnues, alea) {
    alea = alea || Math.random;
    var a = s.act[IA];
    if (a < 0) return null;
    var c = ciblesAction(s, a);
    if (!c.cibles) return null;
    var v = vueIA(s, inconnues);
    if (niveau === 'mairie') {
      if (alea() > 0.25) return null;
      return { arg: argAuHasard(s, a, c.cibles, alea) };
    }
    // Cartes d'information : règles simples, sans recherche
    if (a === A.PLENEL) return inconnues ? { arg: null } : null;   // le scoop sert dès le début, tant que la main adverse est cachée
    if (a === A.BAYROU) return planBayrou(s);
    if (a === A.SARKO && inconnues) return placesRestantes(s) >= 4 && alea() < 0.35 ? { arg: s.mains[J][(alea() * s.mains[J].length) | 0] } : null;
    if (a === A.PRAUD) return { arg: null };
    if (a === A.THEVENOUD) return { arg: s.mains[J][(alea() * s.mains[J].length) | 0] };   // la carte « oubliée » ne comptera pas : tout de suite                                  // l'édito quotidien profite à chaque carte posée ensuite : tout de suite
    if (a === A.COPE) return { arg: null };                                   // sans contrepartie : autant se proclamer tout de suite
    if (a === A.MORANO) return (s.tour >= 2 || alea() < 0.5) ? { arg: null } : null;   // couper l'adversaire avant qu'il ne joue sa carte
    // Grand plateau : recherche moins profonde et en faisceau, pour décider vite
    var grand = s.taille > 3;
    var prof = grand ? 2 : (niveau === 'elysee' ? 3 : 2);
    largeur = grand ? 10 : Infinity;
    var base = valeurEtat(v, prof);
    var plans = plansAction(v, a, c.cibles, alea);
    var best = null, bestG = -Infinity, profPlan = a === A.LEMAIRE ? prof + 1 : prof;
    plans.forEach(function (arg) {
      var e = cloner(v);
      jouerAction(e, a, arg, null);
      var g = valeurEtat(e, profPlan) - base;
      if (g > bestG) { bestG = g; best = arg; }
    });
    largeur = Infinity;
    if (!plans.length) return null;
    var reste = placesRestantes(s);
    var tot = a === A.BORNE || a === A.MONTCHALIN || a === A.VALLS || a === A.ATTALI;   // cartes interdites au dernier tour
    var dernier = posables(s, IA) <= (tot ? 2 : 1) || reste <= 2;
    var prise = a === A.BORNE || a === A.GAULLE;
    // Cartes de protection (suspension, vaccination) : à garder pour le dernier mot adverse, sauf gros coup paré plus tôt
    var parade = a === A.BRAUN || a === A.BACHELOT;
    var seuil = a === A.GAULLE ? 12 : prise ? (reste <= 4 ? 12 : 28) : parade ? (posables(v, J) <= 1 ? 1 : 28) : 9;
    if (a === A.LARCHER && posables(v, J) <= 1) seuil = 1;   // dernier moment utile pour mettre une carte à l'abri
    if (a === A.ATTALI && posables(v, IA) <= 2) seuil = 1;   // dernier tour où le Mentor se joue encore : ne pas le garder pour rien
    if (dernier) seuil = 1;
    if (a === A.LEMAIRE) seuil = posables(v, IA) <= 3 ? 1 : Infinity;   // dernier moment où « On verra demain » reste jouable
    return bestG >= seuil ? { arg: best } : null;
  }

  function plansAction(s, a, cibles, alea) {
    var out = [];
    switch (a) {
      case A.BORNE: case A.GAULLE: case A.LARCHER: case A.SARKO: case A.ARNAULT: return cibles.slice();
      case A.VALLS: cibles[0].forEach(function (x) { cibles[1].forEach(function (y) { out.push([x, y]); }); }); return out;
      case A.MACRON: cibles[0].forEach(function (x) { cibles[1].forEach(function (y) { out.push([x, y]); }); }); return out;
      case A.BRAUN: case A.LEMAIRE: case A.PLENEL: case A.PRAUD: return [null];
      case A.BAYROU: return [null];
      case A.BACHELOT: case A.COPE: case A.MORANO: case A.OUDEA: return [null];
      case A.RUGY: case A.MONTCHALIN: case A.MARCHAIS: case A.CAHUZAC: case A.ATTALI: return cibles.slice();
      case A.POUTOU: return [null];
      case A.MONTEBOURG:   // beaucoup de déménagements possibles : on garde les 8 qui prennent le plus tout de suite
        cibles[0].forEach(function (x) { cibles[1].forEach(function (y) {
          var e = cloner(s); jouerAction(e, a, [x, y], null); out.push({ arg: [x, y], g: e.score[s.trait] - s.score[s.trait] });
        }); });
        out.sort(function (u, w) { return w.g - u.g; });
        return out.slice(0, 8).map(function (u) { return u.arg; });
    }
    return out;
  }

  function force(carte) { var v = VAL[carte]; return v[0] + v[1] + v[2] + v[3]; }
  function planBayrou(s) {
    var top = s.pioche.slice(0, 3), main = s.mains[IA];
    if (!top.length || !main.length || placesRestantes(s) < 5) return null;
    var f = s.fl ? coteFleches : force, ecart = s.fl ? 9 : 4;
    var meilleure = top.slice().sort(function (x, y) { return f(y) - f(x); })[0];
    var pire = main.slice().sort(function (x, y) { return f(x) - f(y); })[0];
    return f(meilleure) - f(pire) >= ecart ? { arg: [meilleure, pire] } : null;
  }

  function argAuHasard(s, a, cibles, alea) {
    function un(t) { return t[(alea() * t.length) | 0]; }
    switch (a) {
      case A.VALLS: case A.MACRON: case A.MONTEBOURG: return [un(cibles[0]), un(cibles[1])];
      case A.BRAUN: case A.LEMAIRE: case A.PLENEL: case A.PRAUD: case A.BACHELOT: case A.COPE: case A.MORANO: case A.OUDEA: case A.POUTOU: return null;
      case A.BAYROU: var pl = planBayrou(s); return pl ? pl.arg : null;
      default: return un(cibles);
    }
  }

  var api = {
    J: J, IA: IA, BANC: BANC, A: A, REG: REG, VOISINS: VOISINS, OPP: OPP, COIN: COIN, grille: grille,
    charger: charger, nouvelle: nouvelle, cloner: cloner, exporter: exporter, importer: importer, miroir: miroir, val: val, valeursCase: valeursCase,
    poser: poser, finTour: finTour, debutTour: debutTour, casesVides: casesVides, nbSur: nbSur, placesRestantes: placesRestantes, posables: posables, nbBancs: nbBancs,
    ciblesAction: ciblesAction, jouerAction: jouerAction, mainVisible: mainVisible, sousBracelet: sousBracelet,
    intouchable: intouchable, gagnant: gagnant,
    choisirPose: choisirPose, choisirAction: choisirAction, evaluer: evaluer, muette: muette, campDe: campDe,
    fleches: fleches, flechesDe: flechesDe, statsFleches: statsFleches, coteFleches: coteFleches, donneFleches: donneFleches, chanceDuel: chanceDuel, apercuFleches: apercuFleches
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.HemicycleMoteur = api;
})(typeof window !== 'undefined' ? window : this);
