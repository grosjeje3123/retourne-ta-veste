/* Moteur de « L'Hémicycle » : règles de Triple Triad adaptées (plateau 3×3, ou 4×4 avec bancs bloqués), cartes action et IA.
   Aucune dépendance au DOM : ce fichier tourne aussi sous Node pour les tests. */
(function (racine) {
  'use strict';
  var J = 0, IA = 1, BANC = -2;   // own : -1 siège libre, -2 siège bloqué (banc), 0 ou 1 propriétaire
  var OPP = [2, 3, 0, 1];
  var GRILLES = {};
  // grille(n)[case] = liste de [côté, case voisine] pour un plateau n × n
  function grille(n) {
    if (GRILLES[n]) return GRILLES[n];
    var t = [];
    for (var i = 0; i < n * n; i++) {
      var r = (i / n) | 0, c = i % n, v = [];
      if (r > 0) v.push([0, i - n]);
      if (c < n - 1) v.push([1, i + 1]);
      if (r < n - 1) v.push([2, i + n]);
      if (c > 0) v.push([3, i - 1]);
      t.push(v);
    }
    return (GRILLES[n] = t);
  }
  var VOISINS = grille(3);
  // Index des cartes action, dans l'ordre du fichier de données
  var A = { BORNE: 0, VALLS: 1, BRAUN: 2, GAULLE: 3, SARKO: 4, MACRON: 5, LEMAIRE: 6, LARCHER: 7, ARNAULT: 8, PRAUD: 9, BAYROU: 10, PLENEL: 11 };

  var VAL = [];            // VAL[carte] = [haut, droite, bas, gauche]
  function charger(valeurs) { VAL = valeurs.map(function (x) { return x.slice(); }); }

  // o.taille : 3 (classique) ou 4 (grand hémicycle) ; o.bancs : cases bloquées
  function nouvelle(o) {
    var n = o.taille || 3, N = n * n, bancs = o.bancs || [];
    var s = {
      taille: n, N: N, vs: grille(n),
      own: new Int8Array(N).fill(-1), crd: new Int8Array(N).fill(-1), org: new Int8Array(N).fill(-1),
      bst: new Int8Array(N * 4), prot: new Uint8Array(N), quota: [-1, -1],
      mains: [o.mainJ.slice(), o.mainIA.slice()],
      act: [o.actJ == null ? -1 : o.actJ, o.actIA == null ? -1 : o.actIA],
      trait: o.premier, poses: 1, dbl: [0, 0],
      susp: -1, suspOn: 0,
      bracC: -1, bracT: 0, bracCible: -1,
      revCible: -1, revT: 0,
      edito: -1,
      pioche: (o.pioche || []).slice(),
      score: [5, 5], vides: N - bancs.length, fin: false, tour: 1,
      proche: o.proche ? 1 : 0, coalition: o.coalition ? 1 : 0
    };
    bancs.forEach(function (b) { s.own[b] = BANC; });
    return s;
  }

  function cloner(s) {
    return {
      taille: s.taille, N: s.N, vs: s.vs, quota: s.quota.slice(),
      own: s.own.slice(), crd: s.crd.slice(), org: s.org.slice(), bst: s.bst.slice(), prot: s.prot.slice(),
      mains: [s.mains[0].slice(), s.mains[1].slice()], act: s.act.slice(),
      trait: s.trait, poses: s.poses, dbl: s.dbl.slice(),
      susp: s.susp, suspOn: s.suspOn, bracC: s.bracC, bracT: s.bracT, bracCible: s.bracCible,
      revCible: s.revCible, revT: s.revT, edito: s.edito, pioche: s.pioche.slice(),
      score: s.score.slice(), vides: s.vides, fin: s.fin, tour: s.tour,
      proche: s.proche, coalition: s.coalition
    };
  }

  function val(s, cell, side) { var x = VAL[s.crd[cell]][side] + s.bst[cell * 4 + side]; return x > 10 ? 10 : x; }
  function valeursCase(s, cell) { return [val(s, cell, 0), val(s, cell, 1), val(s, cell, 2), val(s, cell, 3)]; }
  function sousBracelet(s, carte) { return s.bracT > 0 && s.bracC === carte; }

  function retourner(s, cell, p) { s.own[cell] = p; s.score[p]++; s.score[1 - p]--; }

  // Résout les prises après la pose (ou la passation) d'une carte du joueur p en « cell ».
  function resoudre(s, p, cell, evts) {
    if (s.suspOn) { if (evts) evts.push({ t: 'suspendu', cells: [] }); return; }
    if (sousBracelet(s, s.crd[cell])) { if (evts) evts.push({ t: 'bracelet', cells: [] }); return; }
    var adv = 1 - p, vs = s.vs[cell], paires = [], k, q;
    for (k = 0; k < vs.length; k++) {
      var n = vs[k][1];
      if (s.own[n] >= 0) paires.push([n, val(s, cell, vs[k][0]), val(s, n, OPP[vs[k][0]])]);
    }
    var speciaux = [];
    if (paires.length >= 2) {
      if (s.proche) {
        var m = paires.filter(function (x) { return Math.abs(x[1] - x[2]) <= 1; });
        if (m.length >= 2) {
          var pr = [];
          m.forEach(function (x) { if (s.own[x[0]] === adv && !s.prot[x[0]]) { retourner(s, x[0], p); pr.push(x[0]); speciaux.push(x[0]); } });
          if (evts) evts.push({ t: 'proche', cells: pr, paires: m.map(function (x) { return x[0]; }) });
        }
      }
      if (s.coalition) {
        var sommes = {};
        paires.forEach(function (x) { var sm = x[1] + x[2]; (sommes[sm] = sommes[sm] || []).push(x); });
        var co = [], toutes = [];
        Object.keys(sommes).forEach(function (sm) {
          if (sommes[sm].length >= 2) sommes[sm].forEach(function (x) {
            toutes.push(x[0]);
            if (s.own[x[0]] === adv && !s.prot[x[0]]) { retourner(s, x[0], p); co.push(x[0]); speciaux.push(x[0]); }
          });
        });
        if (toutes.length && evts) evts.push({ t: 'coalition', cells: co, paires: toutes });
      }
    }
    var base = [];
    for (k = 0; k < paires.length; k++) {
      q = paires[k];
      if (s.own[q[0]] === adv && !s.prot[q[0]] && q[1] > q[2]) { retourner(s, q[0], p); base.push(q[0]); }
    }
    if (base.length && evts) evts.push({ t: 'base', cells: base });
    // Effet domino : les cartes prises par « À peu près d'accord » ou « Coalition » prennent à leur tour
    var file = speciaux.slice(), dom = [];
    while (file.length) {
      var x = file.shift();
      if (sousBracelet(s, s.crd[x])) continue;
      var vx = s.vs[x];
      for (k = 0; k < vx.length; k++) {
        var nn = vx[k][1];
        if (s.own[nn] === adv && !s.prot[nn] && val(s, x, vx[k][0]) > val(s, nn, OPP[vx[k][0]])) {
          retourner(s, nn, p); dom.push(nn); file.push(nn);
        }
      }
    }
    if (dom.length && evts) evts.push({ t: 'domino', cells: dom });
  }

  function retirer(main, carte) { var i = main.indexOf(carte); if (i >= 0) main.splice(i, 1); return i >= 0; }

  // Pose une carte de la main du joueur au trait. Renvoie la liste des événements.
  function poser(s, carte, cell, evts) {
    var p = s.trait;
    retirer(s.mains[p], carte);
    // Vue de l'IA : la main adverse est un vivier de cartes possibles, mais elle n'en pose que « quota »
    if (s.quota[p] > 0 && --s.quota[p] === 0) s.mains[p] = [];
    s.own[cell] = p; s.crd[cell] = carte; s.org[cell] = p; s.vides--;
    if (s.edito >= 0) { s.bst[cell * 4 + s.edito] += 2; s.edito = -1; }
    resoudre(s, p, cell, evts);
    s.poses--;
    if (s.vides === 0) { s.fin = true; return evts; }
    if (s.poses > 0 && s.mains[p].length > 0) return evts;
    finTour(s);
    return evts;
  }

  function finTour(s) {
    var p = s.trait;
    if (s.susp === p && !s.suspOn) s.suspOn = 1;
    if (s.bracT > 0 && s.bracCible === p) { s.bracT--; if (!s.bracT) s.bracC = -1; }
    if (s.revT > 0 && s.revCible === p) { s.revT--; if (!s.revT) s.revCible = -1; }
    s.edito = -1;
    s.trait = 1 - p;
    s.tour++;
    debutTour(s, 0);
  }

  function debutTour(s, garde) {
    if (s.vides === 0) { s.fin = true; return; }
    var p = s.trait;
    if (s.susp === p && s.suspOn) { s.susp = -1; s.suspOn = 0; }
    s.poses = 1;
    if (s.dbl[p]) { s.poses = 2; s.dbl[p] = 0; }
    if (s.mains[p].length === 0) {
      if (garde > 2) { s.fin = true; return; }
      s.trait = 1 - p; s.tour++;
      debutTour(s, garde + 1);
    }
  }

  function casesVides(s) { var t = []; for (var i = 0; i < s.N; i++) if (s.own[i] === -1) t.push(i); return t; }
  function nbSur(s, p) { var n = 0; for (var i = 0; i < s.N; i++) if (s.own[i] === p) n++; return n; }
  // Poses qui restent dans la partie : sièges libres ou cartes en main, le plus petit des deux
  function placesRestantes(s) { return Math.min(s.vides, s.mains[0].length + s.mains[1].length); }

  /* ---------- Cartes action ---------- */
  // Cibles possibles d'une carte action pour le joueur au trait. Renvoie null si injouable, avec la raison dans .raison.
  function ciblesAction(s, a) {
    var p = s.trait, adv = 1 - p, i, t = [];
    var res = { cibles: null, raison: '' };
    var flipsBloques = s.suspOn ? 'Séance suspendue : aucune carte ne peut changer de camp.' : '';
    switch (a) {
      case A.BORNE:
        if (flipsBloques) { res.raison = flipsBloques; break; }
        if (nbSur(s, adv) >= 5) { res.raison = 'Censure : l’adversaire tient la majorité absolue (5 sièges ou plus).'; break; }
        for (i = 0; i < s.N; i++) if (s.own[i] === adv && !s.prot[i]) t.push(i);
        if (!t.length) { res.raison = 'Aucune carte adverse à prendre sur le plateau.'; break; }
        res.cibles = t; break;
      case A.VALLS:
        if (flipsBloques) { res.raison = flipsBloques; break; }
        var mien = [], sien = [];
        for (i = 0; i < s.N; i++) { if (s.own[i] === p && !s.prot[i]) mien.push(i); if (s.own[i] === adv && !s.prot[i]) sien.push(i); }
        if (!mien.length || !sien.length) { res.raison = 'Il faut une carte à toi et une carte adverse sur le plateau.'; break; }
        res.cibles = [mien, sien]; break;
      case A.BRAUN:
        res.cibles = []; break;
      case A.GAULLE:
        if (flipsBloques) { res.raison = flipsBloques; break; }
        for (i = 0; i < s.N; i++) if (s.own[i] === adv && s.org[i] === p && !s.prot[i]) t.push(i);
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
        res.cibles = []; break;
      case A.LARCHER:
        for (i = 0; i < s.N; i++) if (s.own[i] === p && !s.prot[i]) t.push(i);
        if (!t.length) { res.raison = 'Il faut une de tes cartes sur le plateau.'; break; }
        res.cibles = t; break;
      case A.ARNAULT:
        if (s.mains[p].length < 2 || s.vides < 2) { res.raison = 'Il faut deux cartes en main et deux sièges libres.'; break; }
        if (s.poses > 1) { res.raison = 'Tu poses déjà deux cartes ce tour-ci.'; break; }
        res.cibles = []; break;
      case A.PRAUD:
        res.cibles = [0, 1, 2, 3]; break;
      case A.BAYROU:
        if (!s.pioche.length) { res.raison = 'La pioche est vide.'; break; }
        res.cibles = s.pioche.slice(0, 3); break;
      case A.PLENEL:
        res.cibles = []; break;
    }
    return res;
  }

  // Applique une carte action. arg dépend de la carte (case, paire de cases, carte, côté…). Renvoie des événements.
  function jouerAction(s, a, arg, evts) {
    var p = s.trait, adv = 1 - p;
    evts = evts || [];
    s.act[p] = -1;
    switch (a) {
      case A.BORNE: retourner(s, arg, p); evts.push({ t: 'action', cells: [arg] }); break;
      case A.VALLS: retourner(s, arg[0], adv); retourner(s, arg[1], p); evts.push({ t: 'action', cells: [arg[0], arg[1]] }); break;
      case A.BRAUN: s.susp = p; s.suspOn = 0; break;
      case A.GAULLE: retourner(s, arg, p); evts.push({ t: 'action', cells: [arg] }); break;
      case A.SARKO: s.bracC = arg; s.bracT = 2; s.bracCible = adv; break;
      case A.MACRON:
        var cell = arg[0], carte = arg[1], ancienne = s.crd[cell];
        retirer(s.mains[p], carte); s.mains[p].push(ancienne);
        s.crd[cell] = carte; s.prot[cell] = 0;
        for (var k = 0; k < 4; k++) s.bst[cell * 4 + k] = 0;
        evts.push({ t: 'passation', cells: [cell], ancienne: ancienne });
        resoudre(s, p, cell, evts);
        break;
      case A.LEMAIRE: s.dbl[p] = 1; finTour(s); break;
      case A.LARCHER: s.prot[arg] = 1; evts.push({ t: 'fauteuil', cells: [arg] }); break;
      case A.ARNAULT: s.poses = 2; break;
      case A.PRAUD: s.edito = arg; break;
      case A.BAYROU:
        if (arg) {
          var iP = s.pioche.indexOf(arg[0]);
          retirer(s.mains[p], arg[1]); s.mains[p].push(arg[0]);
          s.pioche.splice(iP, 1); s.pioche.push(arg[1]);
        }
        break;
      case A.PLENEL: s.revCible = adv; s.revT = 2; break;
    }
    return evts;
  }

  function mainVisible(s, k, transparence) { return transparence || (s.revT > 0 && s.revCible === k); }

  /* ---------- IA ---------- */
  function evaluer(s) {
    var v = s.score[IA] - s.score[J], e = 0;
    for (var i = 0; i < s.N; i++) {
      if (s.own[i] < 0) continue;
      var vs = s.vs[i], sg = s.own[i] === IA ? 1 : -1;
      for (var k = 0; k < vs.length; k++) if (s.own[vs[k][1]] === -1) e += sg * (val(s, i, vs[k][0]) - 5.5) * 0.025;
      if (s.prot[i]) e += sg * 0.25;
    }
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
    if (s.fin || s.vides === 0) return (s.score[IA] - s.score[J]) * 10;
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
    if (inconnues) { e.mains[J] = inconnues.slice(); e.quota[J] = s.mains[J].length; }
    return e;
  }

  function racineMeilleure(s, prof, budget) {
    var kids = enfants(s), best = null, bestV = -Infinity;
    for (var i = 0; i < kids.length; i++) {
      var v = minimax(kids[i].e, prof - 1, bestV, Infinity);
      if (interrompu) return null;
      if (v > bestV) { bestV = v; best = kids[i]; }
    }
    return best ? { carte: best.carte, cell: best.cell, v: bestV } : null;
  }

  // Valeur (pour l'IA) d'un état où c'est encore à l'IA de poser, à profondeur fixe.
  function valeurEtat(s, prof) {
    deadline = Infinity; interrompu = false;
    if (s.fin || s.vides === 0) return (s.score[IA] - s.score[J]) * 10;
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
      var v = minimax(kids[i].e, prof - 1, -Infinity, Infinity);
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
    if (a === A.PLENEL) return (inconnues && s.tour <= 4 && alea() < 0.5) ? { arg: null } : null;
    if (a === A.BAYROU) return planBayrou(s);
    if (a === A.SARKO && inconnues) return placesRestantes(s) >= 4 && alea() < 0.35 ? { arg: s.mains[J][(alea() * s.mains[J].length) | 0] } : null;
    // Grand plateau : recherche moins profonde et en faisceau, pour décider vite
    var grand = s.taille > 3;
    var prof = grand ? 2 : (niveau === 'elysee' ? 3 : 2);
    largeur = grand ? 10 : Infinity;
    var base = valeurEtat(v, prof);
    var plans = plansAction(v, a, c.cibles, alea);
    var best = null, bestG = -Infinity, profPlan = (a === A.LEMAIRE || a === A.ARNAULT) ? prof + 1 : prof;
    plans.forEach(function (arg) {
      var e = cloner(v);
      jouerAction(e, a, arg, null);
      var g = valeurEtat(e, profPlan) - base;
      if (g > bestG) { bestG = g; best = arg; }
    });
    largeur = Infinity;
    if (!plans.length) return null;
    var reste = placesRestantes(s);
    var dernier = s.mains[IA].length <= 1 || reste <= 2;
    var prise = a === A.BORNE || a === A.GAULLE || a === A.VALLS;
    var seuil = prise ? (reste <= 4 ? 12 : 28) : 9;
    if (dernier) seuil = 1;
    return bestG >= seuil ? { arg: best } : null;
  }

  function plansAction(s, a, cibles, alea) {
    var out = [];
    switch (a) {
      case A.BORNE: case A.GAULLE: case A.LARCHER: case A.PRAUD: case A.SARKO: return cibles.slice();
      case A.VALLS: cibles[0].forEach(function (x) { cibles[1].forEach(function (y) { out.push([x, y]); }); }); return out;
      case A.MACRON: cibles[0].forEach(function (x) { cibles[1].forEach(function (y) { out.push([x, y]); }); }); return out;
      case A.BRAUN: case A.LEMAIRE: case A.ARNAULT: case A.PLENEL: return [null];
      case A.BAYROU: return [null];
    }
    return out;
  }

  function force(carte) { var v = VAL[carte]; return v[0] + v[1] + v[2] + v[3]; }
  function planBayrou(s) {
    var top = s.pioche.slice(0, 3), main = s.mains[IA];
    if (!top.length || !main.length || placesRestantes(s) < 5) return null;
    var meilleure = top.slice().sort(function (x, y) { return force(y) - force(x); })[0];
    var pire = main.slice().sort(function (x, y) { return force(x) - force(y); })[0];
    return force(meilleure) - force(pire) >= 4 ? { arg: [meilleure, pire] } : null;
  }

  function argAuHasard(s, a, cibles, alea) {
    function un(t) { return t[(alea() * t.length) | 0]; }
    switch (a) {
      case A.VALLS: case A.MACRON: return [un(cibles[0]), un(cibles[1])];
      case A.BRAUN: case A.LEMAIRE: case A.ARNAULT: case A.PLENEL: return null;
      case A.BAYROU: var pl = planBayrou(s); return pl ? pl.arg : null;
      default: return un(cibles);
    }
  }

  var api = {
    J: J, IA: IA, BANC: BANC, A: A, VOISINS: VOISINS, OPP: OPP, grille: grille,
    charger: charger, nouvelle: nouvelle, cloner: cloner, val: val, valeursCase: valeursCase,
    poser: poser, finTour: finTour, debutTour: debutTour, casesVides: casesVides, nbSur: nbSur, placesRestantes: placesRestantes,
    ciblesAction: ciblesAction, jouerAction: jouerAction, mainVisible: mainVisible, sousBracelet: sousBracelet,
    choisirPose: choisirPose, choisirAction: choisirAction, evaluer: evaluer
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.HemicycleMoteur = api;
})(typeof window !== 'undefined' ? window : this);
