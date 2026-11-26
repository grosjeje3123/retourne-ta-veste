/* Retourne ta veste : interface du jeu (plateau, mains, cartes action, IA, primaire). */
(function(){
  'use strict';
  var D = window.APDA, R = window.APDA_RENDU, M = window.HemicycleMoteur;
  var CAND = D.CANDIDATS, ACT = D.ACTIONS, J = M.J, IA = M.IA, A = M.A, COTES = D.COTES;
  var S = window.HemicycleSons || { jouer: function(){}, actif: function(){ return false; }, regler: function(){}, deverrouiller: function(){} };
  var RIV = CAND.length - 1;  // rivaux de chaque candidat : la note vaut 1 + 9 × devancés ÷ RIV
  var FLECHES = ['↑', '→', '↓', '←'];
  M.charger(CAND.map(function(c){ return c.valeurs; }));

  function $(id){ return document.getElementById(id); }
  var reduit = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var survol = window.matchMedia && matchMedia('(hover: hover)').matches;
  function attendre(ms){ return new Promise(function(r){ setTimeout(r, reduit ? Math.min(ms, 90) : ms); }); }
  function melanger(t){ for (var i = t.length - 1; i > 0; i--){ var j = (Math.random() * (i + 1)) | 0, x = t[i]; t[i] = t[j]; t[j] = x; } return t; }
  function suite16(n){ var t = []; for (var i = 0; i < n; i++) t.push(i); return t; }

  /* ---------- Réglages et bilan, gardés dans ce navigateur ---------- */
  var OPTS_DEF = { v: 2, contre: 'ia', plateau: 'grand', lieu: 'hasard', distribution: 'equilibre', niveau: 'assemblee', proche: true, coalition: true, diagonales: true, actions: true, transparence: false, secondTour: true, anecdotes: true, donne: '', regles: 'fleches' };
  function brut(cle){ try { return JSON.parse(localStorage.getItem(cle)); } catch (e){ return null; } }
  function lire(cle, def){ return Object.assign({}, def, brut(cle) || {}); }
  function ecrire(cle, v){ try { localStorage.setItem(cle, JSON.stringify(v)); } catch (e){} }
  var opts = lire('hemicycle-options', OPTS_DEF);
  // Réglages enregistrés avant la donne équilibrée : l'ancien « au hasard » devient la donne équilibrée
  (function(){ var b = brut('hemicycle-options'); if (b && !b.v && b.distribution === 'hasard') opts.distribution = 'equilibre'; opts.v = 2; })();
  // La donne de la partie libre (à égalité, au hasard, la primaire) : reprise de l'ancien réglage « Les cartes »
  if (['equilibre', 'hasard', 'primaire'].indexOf(opts.donne) < 0) opts.donne = opts.distribution !== 'carriere' ? opts.distribution : 'equilibre';
  var bilan = lire('hemicycle-bilan', { v: 0, d: 0, n: 0 });
  var NIVEAUX = { mairie: 'Mairie', assemblee: 'Assemblée', elysee: 'Élysée' };

  var ui = { s: null, sel: -1, mode: null, occupe: false, revelees: {}, premier: J, dejaOuvert: false, actionsJouees: [false, false], derniereAction: [-1, -1], annulee: [-1, -1], bancs: {}, lieu: null, ignorerClic: false, enLigne: null, partie: 0, tuto: null, variante: null };
  // Contre l'IA ou contre un ami en ligne : le nom de l'adversaire, et les règles de la partie en cours
  function adv(maj){ var L = ui.enLigne; if (ui.local) return echapper(ui.local.noms[1 - ui.local.vue]); return L ? (L.adversaire ? echapper(L.adversaire.pseudo) : maj ? 'Ton adversaire' : 'ton adversaire') : (maj ? 'L’IA' : 'l’IA'); }
  function echapper(t){ return String(t).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function regle(k){ return ui.variante === 'fleches' ? (k === 'plateau' ? 'grand' : k === 'transparence' || k === 'actions' ? opts[k] : false) : ui.tuto ? ui.tuto.lecons[ui.tuto.lecon].regles[k] : ui.enLigne && ui.enLigne.opts ? ui.enLigne.opts[k] : opts[k]; }
  function niveauIA(){ return ui.tuto || (ui.carriere && ui.carriere.facile) ? 'mairie' : opts.niveau; }

  /* ---------- Petites pièces de rendu ---------- */
  var SVG_FAUTEUIL = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#f8f9f6" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h10v8H7z"/><path d="M5 11h14v4H5z"/><path d="M7 15v6M17 15v6"/></svg>';
  var SVG_BRACELET = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#f8f9f6" stroke-width="2.4"><circle cx="12" cy="14" r="6.5"/><rect x="8.5" y="2.5" width="7" height="5.5" rx="1.2" fill="#f8f9f6"/></svg>';
  var SVG_MUET = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#f8f9f6" stroke-width="2.4" stroke-linecap="round"><path d="M6 13c2 2.5 10 2.5 12 0"/><path d="M4 4l16 16"/></svg>';
  var SVG_OUBLI = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#f8f9f6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h4"/><path d="M4 21L20 5"/></svg>';
  var SVG_VACCIN = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#f8f9f6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l4 4M19 5l-3 3M14.5 5.5l4 4M13 7L5.5 14.5l4 4L17 11M7.5 16.5L3 21"/></svg>';
  var DOS_SVG = '<svg viewBox="0 0 80 100"><rect x="5" y="5" width="70" height="90" rx="5" fill="none" stroke="#f1fb4e" stroke-opacity=".75" stroke-width="1.2"/><rect x="9" y="9" width="62" height="82" rx="3" fill="none" stroke="#f1fb4e" stroke-opacity=".35" stroke-width=".6"/><circle cx="40" cy="50" r="15" fill="#f1fb4e" stroke="#15171a" stroke-width="1"/><rect x="36.3" y="45" width="7.4" height="10" rx="1.2" fill="none" stroke="#15171a" stroke-width="1.4" transform="rotate(-14 40 50)"/><path d="M30.9 45.8A10 10 0 0 1 48.7 45.0M49.1 54.2A10 10 0 0 1 31.3 55.0" fill="none" stroke="#15171a" stroke-width="1.8" stroke-linecap="round"/><polygon points="50.0,47.3 50.4,43.6 46.6,45.8" fill="#15171a"/><polygon points="30.0,52.7 29.6,56.4 33.4,54.2" fill="#15171a"/></svg>';
  var VERSO = '<span class="mc dos-mini verso" aria-hidden="true">' + DOS_SVG + '</span>';
  var DOS_MINI = '<span class="mc dos-mini" aria-hidden="true">' + DOS_SVG + '</span>';

  function etiquette(idx, v, own){
    var c = CAND[idx];
    return c.nom + (own === J ? ', ta carte' : own === IA ? ', carte de ' + adv() : '') + ' : ' + COTES.map(function(n, k){ return n + ' ' + v[k]; }).join(', ');
  }
  // Variante « Flèches » : les huit directions, dans l'ordre du moteur (↑ → ↓ ← ↗ ↘ ↙ ↖)
  var DIRS = ['h', 'd', 'b', 'g', 'hd', 'bd', 'bg', 'hg'], NOM_DIR = ['↑', '→', '↓', '←', '↗', '↘', '↙', '↖'];
  var SVG_FLECHE = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1.2 11 10.4H1Z"/></svg>';
  var SVG_ATT = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 .8 10.6 7H7.6v4.2H4.4V7H1.4Z"/></svg>';
  var SVG_DEF = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 .8 10.6 2.4v3.4c0 2.7-1.9 4.6-4.6 5.4C3.3 10.4 1.4 8.5 1.4 5.8V2.4Z"/></svg>';
  function flDe(c){ return ui.s && ui.s.fl && !M.muette(ui.s, c) ? M.fleches(c) : 0; }
  function marques(c){ var s = ui.s; return { muette: !!(s && M.muette(s, c)), oubli: !!(s && s.oubli === c) }; }
  // Les règles du jeu : les Flèches, sauf réglage « Règles classiques » (en ligne et tutoriel restent en classique)
  function reglesFleches(){ return opts.regles !== 'classique'; }
  // Textes imprimés sur les cartes action : version Flèches quand ce sont les règles en cours (donnees.js : pouvoirFl, petitFl)
  function textesActions(){
    var f = reglesFleches();
    ACT.forEach(function(c, i){
      if (c.pouvoirClassique == null){ c.pouvoirClassique = c.pouvoir; c.petitClassique = c.petit; }
      c.pouvoir = f && c.pouvoirFl ? c.pouvoirFl : c.pouvoirClassique;
      c.petit = f && c.petitFl ? c.petitFl : c.petitClassique;
      var face = document.querySelectorAll('#table-actions .emplacement')[i];   // l'album, s'il est déjà dessiné
      var pv = face && face.querySelector('.pouvoir');
      if (pv) pv.innerHTML = '<p>' + c.pouvoir + '</p><p class="petit">' + c.petit + '</p>';
    });
  }
  var CLE_FL = 'hemicycle-fleches-vu';
  textesActions();
  function etiquetteFl(idx, v, own){
    var c = CAND[idx], m = M.fleches(idx), st = M.statsFleches(v);
    return c.nom + (own === J ? ', ta carte' : own === IA ? ', carte de ' + adv() : '') + ' : attaque ' + st[0] + ', défense ' + st[1] + ', flèches ' + NOM_DIR.filter(function(d, i){ return (m >> i) & 1; }).join(' ');
  }
  function htmlMini(idx, o){
    o = o || {};
    var c = CAND[idx], v = o.v || c.valeurs, b = o.b || [0, 0, 0, 0];
    var cls = 'mc ' + (o.own === IA ? 'ia' : o.own === J ? 'j' : 'n') + (o.cls ? ' ' + o.cls : '');
    // Un gros chiffre par bord ; le <i> en dessous dessine son contour clair, lisible sur n'importe quel portrait
    if (o.fl == null) o.fl = reglesFleches() && !ui.enLigne && !ui.tuto ? M.fleches(idx) : 0;   // hors partie (deck, main de Carrière, prise) : l'habit des règles en cours
    var st = o.fl ? M.statsFleches(v) : null;
    var vals = o.fl ? DIRS.map(function(k, i){ return (o.fl >> i) & 1 ? '<b class="fl fl-' + k + '">' + SVG_FLECHE + '</b>' : ''; }).join('') :
      ['h', 'd', 'b', 'g'].map(function(k, i){ var n = R.chiffre(v[i]); return '<b class="' + k + (b[i] ? ' boost' : '') + '"><i>' + n + '</i>' + n + '</b>'; }).join('');
    var badges = (o.prot ? '<span class="badge" title="Indéboulonnable">' + SVG_FAUTEUIL + '</span>' : '') +
                 (o.bracelet ? '<span class="badge" title="Sous bracelet">' + SVG_BRACELET + '</span>' : '') +
                 (o.vaccin ? '<span class="badge" title="Vaccinée">' + SVG_VACCIN + '</span>' : '') +
                 (o.muette ? '<span class="badge" title="Muette (Taisez-vous !)">' + SVG_MUET + '</span>' : '') +
                 (o.oubli ? '<span class="badge" title="Non déclarée (Phobie administrative)">' + SVG_OUBLI + '</span>' : '');
    var et = o.fl ? 0 : R.etoiles(c), etoiles = et ? '<span class="etoiles" aria-hidden="true" title="' + et + ' présidentielle' + (et > 1 ? 's' : '') + ' déjà disputée' + (et > 1 ? 's' : '') + '">' + '★★★★'.slice(0, et) + '</span>' : '';
    return '<span class="' + cls + '" data-bloc="' + R.teinte(c) + '"><img src="' + c.mini + '" alt="" width="240" height="300" decoding="async"><span class="mv" aria-hidden="true">' + vals + '</span>' + etoiles + (st ? '<span class="mn mn-fl"><b class="st att" title="Attaque">' + SVG_ATT + st[0] + '</b><span class="nom">' + c.court + '</span><b class="st def" title="Défense">' + SVG_DEF + st[1] + '</b></span>' : '<span class="mn">' + c.court + '</span>') + badges + '</span>';
  }
  function htmlAction(a, jouee){
    var c = ACT[a];
    return '<span class="ma' + (jouee ? ' jouee' : '') + '"><img src="' + c.mini + '" alt="" width="240" height="300"><span class="ma-code">' + c.code + '</span></span>';
  }
  function nomCase(i){ return 'siège ' + (i + 1); }

  /* ---------- Lieux : le plateau change de décor, et chaque décor a ses obstacles (les « bancs ») ---------- */
  var IC = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
  var PIN = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg>';
  function banc(nom, court, detail, dessin){ return { nom: nom, court: court, detail: detail, svg: IC + dessin + '</svg>' }; }
  // Décors illustrés des lieux, vus d'en haut (img/decors)
  var DECORS_IMG = { hemicycle: 1, republique: 1, trocadero: 1, senat: 1, tele: 1, chateau: 1, buvette: 1 };
  var LIEUX = [
    { id: 'hemicycle', nom: 'L’hémicycle', sous: 'Assemblée nationale', note: 'Le Palais-Bourbon, là où siègent les députés.', bancs: [
      banc('Banc du gouvernement', 'Gouvernement', 'Réservé aux ministres.', '<path d="M4 6h16v5H4z"/><path d="M2.5 11h19v3.5h-19z"/><path d="M5 14.5V19M19 14.5V19"/>'),
      banc('Tribune', 'Tribune', 'On y parle, on ne s’y assoit pas.', '<rect x="6" y="11.5" width="12" height="9.5" rx="1"/><path d="M3.5 11.5h17"/><path d="M12 15v3"/><path d="M12 11.5V8"/><rect x="10.4" y="2.5" width="3.2" height="5.5" rx="1.6"/>'),
      banc('Tribune de presse', 'Presse', 'Réservée aux journalistes.', '<rect x="2.5" y="7" width="19" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.6"/><path d="M8 7l1.6-2.6h4.8L16 7"/><path d="M18 10h.01"/>'),
      banc('Siège vacant', 'Vacant', 'En attente d’une législative partielle.', '<g stroke-dasharray="2.2 2.4"><path d="M7 3h10v8H7z"/><path d="M5 11h14v4H5z"/><path d="M7 15v6M17 15v6"/></g>')
    ] },
    { id: 'republique', nom: 'Place de la République', sous: 'les rassemblements de la gauche', note: 'Jean-Luc Mélenchon y a conclu sa marche pour la VIe République, le 18 mars 2017.', bancs: [
      banc('Statue de la République', 'Marianne', 'Elle ne cède jamais sa place.', '<path d="M6.5 21h11M8.5 21v-4h7v4"/><path d="M12 17v-7"/><circle cx="12" cy="6.5" r="2"/><path d="M9 13l3-3 3 3"/><path d="M15 10l2.5-6"/>'),
      banc('Camion-sono', 'Sono', 'Réservé aux slogans.', '<rect x="2.5" y="9.5" width="12" height="7.5" rx="1"/><path d="M14.5 12.5h4l3 3v1.5h-7z"/><circle cx="6.5" cy="18.5" r="1.6"/><circle cx="17.5" cy="18.5" r="1.6"/><path d="M6 9.5V7l5-2.5v5"/>'),
      banc('Banderole', 'Banderole', 'On la porte, on ne s’y assoit pas.', '<path d="M4 4v17M20 4v17"/><path d="M4 6.5h16v6.5H4z"/><path d="M7.5 9.75h9"/>'),
      banc('Stand merguez', 'Merguez', 'Le vrai cœur du cortège.', '<path d="M3.5 11h17"/><path d="M5.5 11l1.6 8h9.8l1.6-8"/><path d="M8 7.5c1.2-1.2 2.6-1.2 4 0s2.8 1.2 4 0"/>')
    ] },
    { id: 'trocadero', nom: 'Le Trocadéro', sous: 'les grands meetings de la droite', note: 'Nicolas Sarkozy (2012), François Fillon (2017) et Éric Zemmour (2022) y ont réuni leurs partisans.', bancs: [
      banc('Tour Eiffel', 'Tour Eiffel', 'Vue imprenable, mais pas de siège.', '<path d="M12 2v3M10.5 5h3"/><path d="M10.8 5L8 21M13.2 5L16 21"/><path d="M9.3 12.5h5.4"/><path d="M6 21h3c0-2 1.3-3.4 3-3.4s3 1.4 3 3.4h3"/>'),
      banc('Écran géant', 'Écran', 'Pour voir l’orateur de loin.', '<rect x="3" y="4" width="18" height="11" rx="1.5"/><path d="M12 15v5M8 20h8"/>'),
      banc('Drapeaux', 'Drapeaux', 'Distribués à l’entrée.', '<path d="M5 21V4"/><path d="M5 4h8l-1.5 3L13 10H5"/><path d="M14 21V9"/><path d="M14 9h6l-1 2.5 1 2.5h-6"/>'),
      banc('Fontaines', 'Fontaines', 'Baignade interdite.', '<path d="M3.5 18h17"/><path d="M6 18v2.5h12V18"/><path d="M12 18V8"/><path d="M12 8c-2-3.2-5-3.2-6.2 0M12 8c2-3.2 5-3.2 6.2 0"/>')
    ] },
    { id: 'senat', nom: 'Les cuisines du Sénat', sous: 'chez Gérard Larcher', note: 'Au palais du Luxembourg, que préside Gérard Larcher.', bancs: [
      banc('Piano de cuisson', 'Piano', 'Chaud devant !', '<rect x="3" y="12" width="18" height="9" rx="1"/><path d="M3 15.5h18"/><path d="M7 12V9h10v3"/><path d="M9 6.5c0-1 1-1.2 1-2.5M12 6.5c0-1 1-1.2 1-2.5M15 6.5c0-1 1-1.2 1-2.5"/>'),
      banc('Chariot de fromages', 'Fromages', 'Ne pas s’asseoir dessus.', '<path d="M3 16l11-8.5 7 4.5v4z"/><path d="M3 16v3h18v-3"/><circle cx="9" cy="17.6" r=".9"/><circle cx="15.5" cy="13.2" r=".9"/>'),
      banc('Chambre froide', 'Frigo', 'Trop froid pour siéger.', '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M10 4.6L12 6l2-1.4M10 19.4L12 18l2 1.4"/>'),
      banc('Passe', 'Service', 'On y crie « Service ! ».', '<path d="M4 18.5h16"/><path d="M6 18.5a6 6 0 0 1 12 0"/><path d="M12 12.5V10.5M10.5 10.5h3"/>')
    ] },
    { id: 'chateau', nom: 'L’Élysée', sous: 'le Château', note: 'Le palais de la présidence de la République.', bancs: [
      banc('Perron', 'Perron', 'Pour la photo, pas pour s’asseoir.', '<path d="M3 20.5h18"/><path d="M5 20.5v-3h14v3"/><path d="M7 17.5v-3h10v3"/><path d="M9 14.5v-3h6v3"/>'),
      banc('Salon doré', 'Salon doré', 'Dorures à ne pas rayer.', '<rect x="4" y="4" width="16" height="16" rx="1"/><rect x="7.5" y="7.5" width="9" height="9"/><path d="M4 4l3.5 3.5M20 4l-3.5 3.5M4 20l3.5-3.5M20 20l-3.5-3.5"/>'),
      banc('Garde républicaine', 'Garde', 'Elle ne quitte pas son poste.', '<path d="M7 15a5 5 0 0 1 10 0v2H7z"/><path d="M5.5 17h13"/><path d="M12 10V4.5c2 0 3.6 1.1 4.2 3"/>'),
      banc('Pelouse', 'Pelouse', 'Interdite au public.', '<path d="M12 21v-6.5"/><circle cx="12" cy="9" r="5.5"/><path d="M7.5 21h9"/>')
    ] },
    { id: 'tele', nom: 'Le plateau télé', sous: 'le débat de l’entre-deux-tours', note: 'Le studio du grand débat télévisé.', bancs: [
      banc('Chrono', 'Chrono', 'Temps de parole décompté.', '<circle cx="12" cy="13.5" r="7"/><path d="M12 13.5V9.5"/><path d="M10 3h4M12 3v3.5"/>'),
      banc('Caméra', 'Caméra', 'Gros plan, pas de chaise.', '<rect x="3" y="7" width="12" height="10" rx="1.5"/><path d="M15 10.5l6-3v9l-6-3"/>'),
      banc('Régie', 'Régie', 'C’est ici qu’on coupe les micros.', '<path d="M6 4v16M12 4v16M18 4v16"/><rect x="4.5" y="13" width="3" height="3" rx=".5"/><rect x="10.5" y="7" width="3" height="3" rx=".5"/><rect x="16.5" y="11" width="3" height="3" rx=".5"/>'),
      banc('Maquillage', 'Maquillage', 'Un raccord poudre avant l’antenne.', '<rect x="8" y="12.5" width="8" height="8.5" rx="1"/><path d="M8 15.5h8"/><path d="M9.5 12.5V8.2L14.5 5v7.5"/>')
    ] },
    { id: 'buvette', nom: 'La buvette', sous: 'Assemblée nationale', note: 'Le café des députés, au Palais-Bourbon&nbsp;: on y refait la séance.', bancs: [
      banc('Comptoir', 'Comptoir', 'Réservé au service.', '<path d="M3 11h18"/><path d="M5 11v9M19 11v9"/><path d="M5 20h14"/><path d="M8 11V7h2v4M14 11V5.5h2.5V11"/>'),
      banc('Machine à café', 'Café', 'En panne, comme toujours.', '<rect x="5" y="4" width="14" height="6" rx="1"/><path d="M7 10v3M17 10v3"/><path d="M8.5 15h6v2.5a3 3 0 0 1-6 0z"/><path d="M14.5 16h1.5a1.2 1.2 0 0 1 0 2.4h-1.5"/><path d="M4 21h16"/>'),
      banc('Table réservée', 'Réservée', 'Pour les ministres, évidemment.', '<ellipse cx="12" cy="10" rx="8" ry="2.5"/><path d="M12 12.5V20M8.5 20h7"/><path d="M10 4h4v3h-4z"/>'),
      banc('Ardoise', 'Ardoise', 'Le plat du jour, à la craie.', '<rect x="5" y="3.5" width="14" height="11" rx="1"/><path d="M8 7.5h8M8 10.5h5"/><path d="M8 14.5L6 21M16 14.5l2 6.5"/>')
    ] }
  ];
  function lieuParId(id){ for (var i = 0; i < LIEUX.length; i++) if (LIEUX[i].id === id) return LIEUX[i]; return LIEUX[0]; }
  // Au hasard : jamais deux fois de suite le même lieu
  function choisirLieu(){
    if (opts.lieu && opts.lieu !== 'hasard') return lieuParId(opts.lieu);
    var autres = LIEUX.filter(function(l){ return !ui.lieu || l.id !== ui.lieu.id; });
    return autres[(Math.random() * autres.length) | 0];
  }
  function appliquerLieu(){
    var l = ui.lieu || LIEUX[0], t = document.querySelector('#vue-jeu .tapis'), e = $('lieu-jeu'), c = document.querySelector('#vue-jeu .centre');
    if (t) t.setAttribute('data-lieu', l.id);
    var d = $('decor'); if (d) d.innerHTML = DECORS_IMG[l.id] ? '<img src="img/decors/' + l.id + '.webp" alt="" decoding="async">' : '';
    if (e){ e.innerHTML = '<b>' + PIN + l.nom + '</b><span>' + l.sous + '</span>'; e.title = l.note; }
    if (c) c.setAttribute('aria-label', 'Le plateau : ' + l.nom);
  }
  // Grand plateau : de 4 à 7 obstacles, places et natures tirées au hasard à chaque partie
  function tirerBancs(nombre){
    var n = nombre == null ? M.nbBancs() : nombre, cases = melanger(suite16(16)).slice(0, n), t = {}, nb = ui.lieu.bancs.length;
    cases.forEach(function(i){ t[i] = (Math.random() * nb) | 0; });
    return t;
  }
  function bancDe(i){ return (ui.lieu || LIEUX[0]).bancs[ui.bancs[i] || 0]; }

  /* ---------- Rendu de la partie ---------- */
  function rendrePlateau(ownAff){
    var s = ui.s, h = '';
    var pl = $('plateau');
    pl.classList.toggle('n4', s.taille === 4);
    pl.setAttribute('aria-label', 'Plateau de ' + s.N + ' sièges');
    for (var i = 0; i < s.N; i++){
      var cls = 'case', inner = '', label;
      if (s.own[i] === M.BANC){
        var b = bancDe(i);
        h += '<span class="case banc" data-i="' + i + '" role="img" aria-label="Siège ' + (i + 1) + ' : ' + b.nom + ', bloqué. ' + b.detail + '" title="' + b.nom + ' : ' + b.detail + '">' +
          '<span class="banc-plaque">' + b.svg + '<b>' + b.court + '</b></span></span>';
        continue;
      }
      if (s.own[i] < 0){
        label = 'Siège ' + (i + 1) + ', libre';
        cls += ' libre';
      } else {
        var own = ownAff ? ownAff[i] : s.own[i];
        var v = M.valeursCase(s, i), b = [0, 1, 2, 3].map(function(k){ return s.bst[i * 4 + k]; });
        var vaccinee = s.vacc >= 0 && s.own[i] === s.vacc;
        inner = '<span class="rot">' + htmlMini(s.crd[i], { own: own, v: v, b: b, prot: s.prot[i], bracelet: M.sousBracelet(s, s.crd[i]), vaccin: vaccinee, fl: flDe(s.crd[i]), muette: marques(s.crd[i]).muette, oubli: marques(s.crd[i]).oubli }) + VERSO + '</span>';
        label = 'Siège ' + (i + 1) + ' : ' + (s.fl ? etiquetteFl(s.crd[i], v, own) : etiquette(s.crd[i], v, own)) + (s.prot[i] ? ', indéboulonnable' : '') + (vaccinee ? ', vaccinée' : '');
      }
      h += '<button type="button" class="' + cls + '" data-i="' + i + '" aria-label="' + label + '">' + inner + '</button>';
    }
    $('plateau').innerHTML = h;
    marquer();
  }

  function rendreMains(){
    var s = ui.s, h = '';
    // Djadja show (+3), prime d'ouverture (+1), édito quotidien (+1) : la main affiche déjà le bonus de la carte qui va entrer en scène
    var show = (s.trait === J ? (s.show | 0) + (s.ouv ? 1 : 0) : 0) + (s.aura && s.aura[J] ? s.aura[J] : 0);
    s.mains[J].forEach(function(c){
      var sel = ui.sel === c, brac = M.sousBracelet(s, c);
      var v = show ? CAND[c].valeurs.map(function(x){ return Math.min(10, x + show); }) : CAND[c].valeurs;
      h += '<button type="button" class="carte-main' + (sel ? ' sel' : '') + '" data-c="' + c + '" aria-pressed="' + sel + '" aria-label="' + (s.fl ? etiquetteFl(c, v, J) : etiquette(c, v, J)) + (brac ? ', sous bracelet' : '') + '">' + htmlMini(c, { own: J, bracelet: brac, v: v, b: show ? [1, 1, 1, 1] : null, fl: flDe(c), oubli: s.oubli === c }) + '</button>';
    });
    $('main-joueur').innerHTML = h || '<p class="main-vide">Main vide</p>';
    var visible = M.mainVisible(s, IA, regle('transparence'));
    h = '';
    s.mains[IA].forEach(function(c, k){
      var montre = visible || ui.revelees[c];
      var contenu = montre ? htmlMini(c, { own: IA, bracelet: M.sousBracelet(s, c), fl: flDe(c), oubli: s.oubli === c }) : DOS_MINI;
      var lab = montre ? etiquette(c, CAND[c].valeurs, IA) : 'Carte cachée de ' + adv() + ', numéro ' + (k + 1);
      h += '<button type="button" class="carte-main ia" data-c="' + c + '" aria-label="' + lab + '" tabindex="-1">' + contenu + '</button>';
    });
    $('main-ia').innerHTML = h || '<p class="main-vide">Main vide</p>';
    $('oeil-ia').hidden = !(s.revT > 0 && s.revCible === J);
    $('oeil-j').hidden = !(s.revT > 0 && s.revCible === IA);
    var bd = $('b-details');
    if (ui.sel >= 0){ bd.hidden = false; bd.textContent = 'Voir la carte de ' + CAND[ui.sel].court; } else bd.hidden = true;
    marquer();
  }

  function htmlSuisse(k){
    var s = ui.s, c = s.suisse ? s.suisse[k] : -1;
    if (c == null || c === -1) return '';   // -2 : en ligne, le compte adverse existe mais reste secret
    return '<span class="slot-suisse" title="Compte en Suisse : elle compte pour ' + (k === J ? 'toi' : adv()) + '">En Suisse&nbsp;: <b>' + (k === J ? CAND[c].court : 'une carte') + '</b></span>';
  }
  function rendreActions(){
    var s = ui.s, aj = s.act[J], ai = s.act[IA];
    rendreActions2(); $('action-joueur').insertAdjacentHTML('beforeend', htmlSuisse(J)); $('action-ia').insertAdjacentHTML('beforeend', htmlSuisse(IA));
  }
  function rendreActions2(){
    var s = ui.s, aj = s.act[J], ai = s.act[IA];
    if (aj >= 0) $('action-joueur').innerHTML = '<button type="button" class="slot-btn" id="b-action" aria-label="Ta carte action : ' + ACT[aj].code + ', ' + ACT[aj].nom + '">' + htmlAction(aj) + '<span class="slot-lib">Ta carte action</span></button>';
    else $('action-joueur').innerHTML = ui.derniereAction[J] >= 0 ? '<span class="slot-btn inerte">' + htmlAction(ui.derniereAction[J], true) + '<span class="slot-lib">Jouée</span></span>' :
      ui.annulee[J] >= 0 ? '<span class="slot-btn inerte annulee">' + htmlAction(ui.annulee[J], true) + '<span class="slot-lib">Annulée</span></span>' : '';
    if (ai >= 0) $('action-ia').innerHTML = '<span class="slot-btn inerte"><span class="ma ma-dos"><span class="ma-code">?</span></span><span class="slot-lib">Carte action de ' + adv() + '</span></span>';
    else $('action-ia').innerHTML = ui.derniereAction[IA] >= 0 ? '<span class="slot-btn inerte">' + htmlAction(ui.derniereAction[IA], true) + '<span class="slot-lib">Jouée</span></span>' :
      ui.annulee[IA] >= 0 ? '<span class="slot-btn inerte annulee">' + htmlAction(ui.annulee[IA], true) + '<span class="slot-lib">Annulée</span></span>' : '';
  }

  function rendreScore(){
    var s = ui.s, sj = s.score[J], si = s.score[IA], c = '';
    for (var k = 0; k < 10; k++){
      var t = Math.PI - k * Math.PI / 9, x = 110 + 82 * Math.cos(t), y = 96 - 82 * Math.sin(t);
      c += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="10" class="' + (k < sj ? 'siege-j' : k >= 10 - si ? 'siege-ia' : 'siege-vide') + '"/>';   // un siège racheté (Le Patron) ne compte pour personne
    }
    $('hemi').innerHTML = c;
    $('score-j').textContent = sj; $('score-ia').textContent = si;
    var pr = s.procl >= 0 ? (s.procl === J ? 'Égalité = victoire pour toi' : 'Égalité = victoire pour ' + adv()) : '';
    $('procl').textContent = pr; $('procl').hidden = !pr;
    $('tableau').setAttribute('aria-label', 'Sièges : toi ' + sj + ', ' + adv() + ' ' + si + ' sur ' + (sj + si) + '. Majorité absolue à ' + (((sj + si) >> 1) + 1) + '.' + (pr ? ' ' + pr + ' (Proclamé).' : ''));
  }

  function rendreTout(){ rendrePlateau(); rendreMains(); rendreActions(); rendreScore(); ajusterPlateau(); }

  // Écran en hauteur (téléphone, tablette) : le plateau rétrécit juste ce qu'il faut pour que ta main reste visible sans faire défiler
  var plateauAjuste = 0;
  function ajusterPlateau(){
    var pl = $('plateau'), mj = $('main-joueur');
    if (!pl || !mj) return;
    if (window.innerWidth > 860 || window.innerWidth > window.innerHeight || $('vue-jeu').hidden){
      if (plateauAjuste){ pl.style.removeProperty('--case'); plateauAjuste = 0; }
      return;
    }
    if (!mj.querySelector('.carte-main') && !plateauAjuste) return;   // main pas encore distribuée : rien à mesurer
    pl.style.removeProperty('--case');
    var c = pl.querySelector('.case'); if (!c) return;
    var rc = c.getBoundingClientRect(), w0 = rc.width, ratio = rc.height / rc.width;
    var n = pl.classList.contains('n4') ? 4 : 3, y = window.scrollY || 0;
    var bas = Math.max(mj.getBoundingClientRect().bottom, $('action-joueur').getBoundingClientRect().bottom) + y;
    var trop = bas + 10 - window.innerHeight;
    var mini = n === 4 ? 52 : 60;
    if (trop <= 0 || w0 <= mini){ plateauAjuste = 0; return; }
    var w = Math.max(mini, Math.floor(w0 - trop / (n * ratio)));
    pl.style.setProperty('--case', w + 'px'); plateauAjuste = w;
  }
  var minuteurAjuste = null;
  function observerHauteurs(){   // une consigne, un tutoriel ou un nom qui change de hauteur : le plateau se recale
    if (!window.ResizeObserver) return;
    var ro = new ResizeObserver(function(){ if (!$('vue-jeu').hidden) ajusterPlateau(); });
    ['tuto', 'lieu-jeu', 'main-ia', 'main-joueur', 'action-joueur'].forEach(function(id){ if ($(id)) ro.observe($(id)); });
    ['.camp-ia', '.tete-plateau', '.camp-joueur'].forEach(function(q){ var e = document.querySelector(q); if (e) ro.observe(e); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observerHauteurs); else observerHauteurs();
  window.addEventListener('resize', function(){ clearTimeout(minuteurAjuste); minuteurAjuste = setTimeout(function(){ libererPerchoir(); ajusterPlateau(); }, 120); });

  function perchoir(txt, annulable){
    $('perchoir-texte').textContent = txt;
    $('b-annuler').hidden = !annulable;
    // Écran en hauteur : la consigne ne doit pas pousser ta main hors de l'écran. Sa hauteur ne fait que grandir pendant la partie, et le plateau s'ajuste une fois.
    var pe = document.querySelector('.perchoir');
    if (plateauAjuste || window.innerWidth <= 860){
      var hp = pe.offsetHeight;
      if (hp > (+pe.dataset.haut || 0) + 1){ pe.dataset.haut = hp; pe.style.minHeight = hp + 'px'; ajusterPlateau(); }
    }
  }
  function libererPerchoir(){ var pe = document.querySelector('.perchoir'); if (pe){ delete pe.dataset.haut; pe.style.minHeight = ''; } }
  function noter(txt){
    var li = document.createElement('li');
    li.innerHTML = txt;
    var j = $('journal');
    j.insertBefore(li, j.firstChild);
    while (j.children.length > 7) j.removeChild(j.lastChild);
  }
  var minuteurBanniere = null;
  function banniere(txt, duree){
    var b = $('banniere');
    b.textContent = txt; b.classList.add('on');
    clearTimeout(minuteurBanniere);
    minuteurBanniere = setTimeout(function(){ b.classList.remove('on'); }, reduit ? 700 : (duree || 1050));
  }

  // Met en évidence ce qui est cliquable selon la situation
  function marquer(){
    var s = ui.s; if (!s) return;
    var tourJ = !ui.occupe && !s.fin && s.trait === J;
    var g = etapeTuto(), gp = g && g.t === 'pose' && tourJ && !ui.mode ? g : null;
    var cases = $('plateau').querySelectorAll('.case');
    var cibles = ui.mode ? ui.mode.ciblesCases || [] : [];
    Array.prototype.forEach.call(cases, function(el){
      var i = +el.dataset.i;
      el.classList.toggle('jouable', tourJ && !ui.mode && ui.sel >= 0 && s.own[i] === -1 && (!g || (!!gp && gp.cell === i)));
      el.classList.toggle('tuto-cible', !!gp && gp.cell === i);
      el.classList.toggle('cible', !!ui.mode && cibles.indexOf(i) >= 0);
    });
    var mains = $('main-joueur').querySelectorAll('.carte-main');
    var ciblesMain = ui.mode ? ui.mode.ciblesMain || [] : null;
    Array.prototype.forEach.call(mains, function(el){
      var c = +el.dataset.c;
      el.classList.toggle('cible', !!ciblesMain && ciblesMain.indexOf(c) >= 0);
      el.disabled = !tourJ || (!!ui.mode && !(ciblesMain && ciblesMain.indexOf(c) >= 0)) || (!!g && !ui.mode && !(gp && gp.carte === c));
      el.classList.toggle('tuto-cible', !!gp && gp.carte === c && ui.sel !== c);
      el.classList.toggle('tuto-hors', !!g && tourJ && !ui.mode && (g.t === 'action' || (!!gp && gp.carte !== c)));
    });
    var ciblesIA = ui.mode ? ui.mode.ciblesIA || [] : [];
    Array.prototype.forEach.call($('main-ia').querySelectorAll('.carte-main'), function(el){
      var ok = !!ui.mode && ciblesIA.indexOf(+el.dataset.c) >= 0;
      el.classList.toggle('cible', ok);
      el.tabIndex = ok ? 0 : -1;
    });
    var ba = $('b-action');
    if (ba) ba.classList.toggle('tuto-cible', !!g && g.t === 'action' && tourJ && !ui.mode);
  }


  /* ---------- Pluie d'objets au lancement d'une carte action ---------- */
  // Petits dessins vectoriels (viewBox 40×40), même trait d'encre que les cartes. Purement décoratif : rien n'attend la fin de la pluie.
  var ENC = ' stroke="#15171a" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"';
  var OBJETS = {
    tampon: '<rect x="3" y="11" width="34" height="18" rx="3" fill="#fff8" stroke="#c8102e" stroke-width="3"/><text x="20" y="25" font-family="Arial,sans-serif" font-size="12" font-weight="900" fill="#c8102e" text-anchor="middle">49.3</text>',
    ballon: '<circle cx="20" cy="20" r="16" fill="#fff"' + ENC + '/><path d="M20 13l6.2 4.5-2.4 7.3h-7.6l-2.4-7.3z" fill="#15171a"/><path d="M20 13V4.5M26.2 17.5l8-3M23.8 24.8l5 6.6M16.2 24.8l-5 6.6M13.8 17.5l-8-3"' + ENC + '/>',
    sonnette: '<path d="M18 4h4v6h-4z" fill="#8a5a2b"' + ENC + '/><path d="M9 31c2-3 3-7 3-12a8 8 0 0 1 16 0c0 5 1 9 3 12z" fill="#e9b949"' + ENC + '/><circle cx="20" cy="33.5" r="3" fill="#e9b949"' + ENC + '/>',
    micro: '<rect x="12" y="3" width="16" height="21" rx="8" fill="#a9b1ba"' + ENC + '/><path d="M12 10h16M12 15h16M12 20h16" stroke="#5d656e" stroke-width="1.5"/><path d="M20 24v9M12 35h16"' + ENC + '/>',
    bracelet: '<ellipse cx="20" cy="19" rx="14" ry="9" fill="none" stroke="#15171a" stroke-width="5"/><rect x="12" y="23" width="16" height="11" rx="3" fill="#3a3f46"' + ENC + '/><circle cx="20" cy="28.5" r="2" fill="#5fd068"/>',
    cle: '<circle cx="11" cy="20" r="7.5" fill="#e9b949"' + ENC + '/><circle cx="11" cy="20" r="2.6" fill="#f4f1e8"' + ENC + '/><path d="M18 17.5h18v5h-3v5h-4v-5h-3v4h-4v-4h-4z" fill="#e9b949"' + ENC + '/>',
    gilet: '<path d="M13 4l-7 3 1 10-2 4v14h30V21l-2-4 1-10-7-3-7 12z" fill="#e6f200"' + ENC + '/><path d="M20 16v19M5 24h30M5 29h30" stroke="#15171a" stroke-width="1.5"/><path d="M5.5 25h29v3h-29z" fill="#9aa0aa"/>',
    livre: '<path d="M8 6h22a3 3 0 0 1 3 3v25H12a4 4 0 0 1-4-4z" fill="#2f6db5"' + ENC + '/><path d="M8 30a4 4 0 0 1 4-4h21" fill="none"' + ENC + '/><path d="M15 12h12M15 16h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/>',
    fauteuil: '<rect x="10" y="4" width="20" height="20" rx="5" fill="#b3202a"' + ENC + '/><rect x="5" y="15" width="7" height="14" rx="3" fill="#c8323c"' + ENC + '/><rect x="28" y="15" width="7" height="14" rx="3" fill="#c8323c"' + ENC + '/><rect x="10" y="21" width="20" height="8" rx="2" fill="#d94550"' + ENC + '/><path d="M8 29v6M32 29v6"' + ENC + '/>',
    piece: '<circle cx="20" cy="20" r="15" fill="#e9b949"' + ENC + '/><circle cx="20" cy="20" r="11" fill="none" stroke="#b8860b" stroke-width="1.5"/><text x="20" y="26" font-family="Arial,sans-serif" font-size="17" font-weight="900" fill="#8a5a0b" text-anchor="middle">€</text>',
    tele: '<path d="M14 4l6 7 6-7"' + ENC + ' fill="none"/><rect x="4" y="11" width="32" height="23" rx="4" fill="#3a3f46"' + ENC + '/><rect x="8" y="15" width="24" height="15" rx="2" fill="#8fc3ea"/><path d="M11 26h8" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>',
    plan: '<rect x="5" y="7" width="30" height="26" rx="2" fill="#2f6db5"' + ENC + '/><path d="M10 12h11v11H10zM21 17h9v11h-9M10 23v5h11" fill="none" stroke="#fff" stroke-width="1.6"/>',
    journal: '<rect x="4" y="7" width="32" height="26" rx="1.5" fill="#f4f1e8"' + ENC + '/><path d="M8 13h24" stroke="#15171a" stroke-width="3.5"/><rect x="8" y="17" width="10" height="11" fill="#a9b1ba"/><path d="M21 18h11M21 22h11M21 26h11" stroke="#5d656e" stroke-width="1.6"/>',
    homard: '<path d="M16 6c-1-2-3-3-5-3M24 6c1-2 3-3 5-3" fill="none"' + ENC + '/><path d="M14 15c-5-1-9-5-8-10 1 3 4 4 6 3-1-2 0-4 2-4 1 4 2 7 2 9" fill="#d8342c"' + ENC + '/><path d="M26 15c5-1 9-5 8-10-1 3-4 4-6 3 1-2 0-4-2-4-1 4-2 7-2 9" fill="#d8342c"' + ENC + '/><ellipse cx="20" cy="20" rx="6" ry="9" fill="#d8342c"' + ENC + '/><path d="M15 29h10l-1 3h-8zM14 32h12l-2 5h-8z" fill="#e0483f"' + ENC + '/><circle cx="18" cy="15" r="1" fill="#15171a"/><circle cx="22" cy="15" r="1" fill="#15171a"/>',
    seringue: '<g transform="rotate(-40 20 20)"><rect x="9" y="15" width="19" height="10" rx="1.5" fill="#e6f4f8"' + ENC + '/><rect x="10" y="16.5" width="11" height="7" fill="#7fc8a9"/><path d="M28 20h9M3 20h6M3 15v10M13 15v-2M24 15v-2"' + ENC + '/></g>',
    painchoc: '<path d="M1.5 19.5h37M1.5 25h37" stroke="#4a2814" stroke-width="3.4" stroke-linecap="round"/><path d="M4 27c0-7 2-12 8-12h16c6 0 8 5 8 12 0 2-1 3-3 3H7c-2 0-3-1-3-3z" fill="#e2a54a"' + ENC + '/><path d="M6 21.5c8-2 20-2 28 0M5.5 26c9-1.5 20-1.5 29 0" fill="none" stroke="#b06f22" stroke-width="1.5" stroke-linecap="round"/><path d="M11 18c4-1 10-1 14 0" stroke="#f6d38c" stroke-width="2" fill="none" stroke-linecap="round"/>',
    mariniere: '<path d="M14 5l-9 6 4 7 4-3v20h14V15l4 3 4-7-9-6c-1 3-3.5 4.5-6 4.5S15 8 14 5z" fill="#fff"' + ENC + '/><path d="M13 19h14M13 24h14M13 29h14" stroke="#1f3f8f" stroke-width="2.6"/>',
    stop: '<path d="M14 3h12l9 9v12l-9 9H14l-9-9V12z" fill="#c8102e"' + ENC + ' transform="translate(0 2)"/><text x="20" y="24" font-family="Arial,sans-serif" font-size="9.5" font-weight="900" fill="#fff" text-anchor="middle">STOP</text>',
    loupe: '<path d="M25 25l10 10" stroke="#15171a" stroke-width="5.5" stroke-linecap="round"/><circle cx="17" cy="17" r="11" fill="#dff1f7" fill-opacity=".85" stroke="#15171a" stroke-width="3"/><path d="M11 15a6 6 0 0 1 5-5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>',
    note: '<path d="M15 30V10l17-5v20" fill="none"' + ENC + ' stroke-width="2.6"/><path d="M15 15l17-5" stroke="#15171a" stroke-width="4"/><ellipse cx="11" cy="30" rx="5" ry="3.8" fill="#c2338b"' + ENC + '/><ellipse cx="28" cy="25" rx="5" ry="3.8" fill="#c2338b"' + ENC + '/>',
    sifflet: '<path d="M30 15c4 2 5 8 1 11" fill="none"' + ENC + '/><path d="M3 11h20a11 11 0 1 1-11 11v-3H3z" fill="#c9ced4"' + ENC + '/><circle cx="23" cy="22" r="3.2" fill="#5d656e"/><path d="M6 14h9" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>',
    carton: '<rect x="11" y="5" width="18" height="27" rx="2.5" fill="#f2c500"' + ENC + ' transform="rotate(10 20 20)"/>',
    billet: '<rect x="3" y="10" width="34" height="20" rx="2" fill="#8cc084"' + ENC + '/><rect x="6" y="13" width="28" height="14" rx="1" fill="none" stroke="#3e7a3a" stroke-width="1.2"/><circle cx="20" cy="20" r="5" fill="#b9dcb2" stroke="#3e7a3a" stroke-width="1.2"/><text x="20" y="23.5" font-family="Arial,sans-serif" font-size="9" font-weight="900" fill="#3e7a3a" text-anchor="middle">€</text>',
    suisse: '<rect x="6" y="6" width="28" height="28" rx="2" fill="#d52b1e"' + ENC + '/><path d="M17 11h6v6h6v6h-6v6h-6v-6h-6v-6h6z" fill="#fff"/>',
    impots: '<path d="M8 3h17l8 8v26H8z" fill="#fff"' + ENC + '/><path d="M25 3v8h8" fill="#e6e8eb"' + ENC + '/><rect x="11" y="7" width="10" height="5" fill="#2f6db5"/><path d="M11 17h18M11 21h18M11 25h12M11 29h7" stroke="#8a929b" stroke-width="1.5"/><text x="27" y="33" font-family="Arial,sans-serif" font-size="8" font-weight="900" fill="#c8102e" text-anchor="middle">€</text>',
    couronne: '<path d="M6 30l-1-17 8 7 7-12 7 12 8-7-1 17z" fill="#e9b949"' + ENC + '/><rect x="6" y="29" width="28" height="6" rx="1.5" fill="#d9a12a"' + ENC + '/><circle cx="20" cy="22" r="3" fill="#c8102e"' + ENC + '/><circle cx="5" cy="13" r="2.2" fill="#e9b949"' + ENC + '/><circle cx="20" cy="7.5" r="2.2" fill="#e9b949"' + ENC + '/><circle cx="35" cy="13" r="2.2" fill="#e9b949"' + ENC + '/>',
    bulle: '<path d="M5 6h30v20H17l-8 7v-7H5z" fill="#fff"' + ENC + '/><path d="M12 11h16M12 16h16M12 21h9" stroke="#8a929b" stroke-width="1.5"/><path d="M7 31L33 3" stroke="#c8102e" stroke-width="3.5" stroke-linecap="round"/>'
  };
  // Pour chaque carte : ses objets, leur façon de tomber (tombe, volette, file) et, parfois, un gros tampon au milieu
  var PLUIE = {};
  PLUIE[A.BORNE] = { o: ['tampon'], gros: '49.3' };
  PLUIE[A.VALLS] = { o: ['ballon'] };
  PLUIE[A.BRAUN] = { o: ['sonnette'] };
  PLUIE[A.GAULLE] = { o: ['micro'] };
  PLUIE[A.SARKO] = { o: ['bracelet'] };
  PLUIE[A.MACRON] = { o: ['gilet'] };
  PLUIE[A.LEMAIRE] = { o: ['livre'] };
  PLUIE[A.LARCHER] = { o: ['fauteuil'] };
  PLUIE[A.ARNAULT] = { o: ['piece'] };
  PLUIE[A.PRAUD] = { o: ['tele'] };
  PLUIE[A.BAYROU] = { o: ['plan'], m: 'volette' };
  PLUIE[A.PLENEL] = { o: ['journal'], m: 'volette' };
  PLUIE[A.RUGY] = { o: ['homard'] };
  PLUIE[A.BACHELOT] = { o: ['seringue'] };
  PLUIE[A.COPE] = { o: ['painchoc'] };
  PLUIE[A.MONTEBOURG] = { o: ['mariniere'], m: 'volette' };
  PLUIE[A.MORANO] = { o: ['stop'] };
  PLUIE[A.MONTCHALIN] = { o: ['loupe'] };
  PLUIE[A.OUDEA] = { o: ['note'], m: 'volette' };
  PLUIE[A.POUTOU] = { o: ['sifflet', 'carton'] };
  PLUIE[A.CAHUZAC] = { o: ['billet', 'billet', 'billet', 'suisse'], m: 'file' };
  PLUIE[A.THEVENOUD] = { o: ['impots'], m: 'volette' };
  PLUIE[A.MARCHAIS] = { o: ['bulle'], gros: 'Chut&nbsp;!' };
  PLUIE[A.ATTALI] = { o: ['couronne'] };   // le faiseur de rois
  // Les mêmes objets en illustrations (img/pluie) ; le dessin vectoriel reste en secours
  var IMG_PLUIE = {}; 'ballon billet bracelet bulle carton couronne gilet fauteuil homard impots journal livre loupe mariniere micro note painchoc piece plan seringue sifflet sonnette stop suisse tampon tele'.split(' ').forEach(function(n){ IMG_PLUIE[n] = 1; });
  setTimeout(function(){ Object.keys(IMG_PLUIE).forEach(function(n){ new Image().src = 'img/pluie/' + n + '.webp'; }); }, 2500);   // chargées d'avance, sans retarder l'ouverture
  function objetPluie(nom){ return IMG_PLUIE[nom] ? '<img src="img/pluie/' + nom + '.webp" alt="" draggable="false">' : '<svg viewBox="0 0 40 40" aria-hidden="true">' + OBJETS[nom] + '</svg>'; }
  var pluie_ = { m: 0, s: 0 };
  // Quatre mises en scène, tirées au hasard à chaque carte action (jamais deux fois la même de suite)
  var STYLES_PLUIE = ['pluie', 'manga', 'canon', 'geant'], dernierStyle = '';
  function pluieAction(a, p){
    var def = PLUIE[a], el = $('pluie');
    if (!def || !el || reduit) return;
    var choix = STYLES_PLUIE.filter(function(x){ return x !== dernierStyle; });
    var style = window.__stylePluie || choix[Math.floor(Math.random() * choix.length)];
    dernierStyle = style;
    var r = ({ pluie: scenePluie, manga: sceneManga, canon: sceneCanon, geant: sceneGeant })[style](a, def, p);
    clearTimeout(pluie_.m); clearTimeout(pluie_.s);
    el.className = 'pluie ' + r.cls; el.innerHTML = r.h; el.hidden = false;
    if (r.secousse != null) pluie_.s = setTimeout(secouerTapis, r.secousse * 1000);
    S.jouer(r.son);
    pluie_.m = setTimeout(function(){ el.hidden = true; el.innerHTML = ''; el.className = 'pluie'; repeindre(); }, r.fin * 1000 + 150);    return style === 'manga' || style === 'geant' ? r.fin : 0;   // durée pendant laquelle le centre de l'écran est occupé
  }
  function secouerTapis(){
    var t = document.querySelector('#vue-jeu .tapis'); if (!t) return;
    t.classList.remove('secoue'); void t.offsetWidth; t.classList.add('secoue');
    setTimeout(function(){ t.classList.remove('secoue'); }, 420);
  }
  // 1. La pluie : les objets tombent, volettent ou filent vers la Suisse
  function scenePluie(a, def){
    var larg = window.innerWidth || 1000, n = larg < 520 ? 13 : 20, mode = def.m || 'tombe', h = '', fin = 0;
    for (var i = 0; i < n; i++){
      var nom = def.o[i % def.o.length], t = auPif(0, 0.75), d = mode === 'volette' ? auPif(2, 2.5) : mode === 'file' ? auPif(1.2, 1.7) : auPif(1.3, 1.9);
      fin = Math.max(fin, t + d);
      h += '<i style="--x:' + ((i + Math.random()) * 100 / n - 4).toFixed(1) + 'vw;--y:' + auPif(4, 80).toFixed(1) + 'vh;--l:' + auPif(larg < 520 ? 40 : 52, larg < 520 ? 58 : 76).toFixed(0) + 'px;--r:' + auPif(-30, 30).toFixed(0) +
        'deg;--rr:' + auPif(-260, 260).toFixed(0) + 'deg;--t:' + t.toFixed(2) + 's;--d:' + d.toFixed(2) + 's">' + objetPluie(nom) + '</i>';
    }
    if (def.gros) h += '<b class="gros">' + def.gros + '</b>';
    return { h: h, cls: mode, fin: Math.max(fin, 2), son: 'stPluie' };
  }
  // 2. Le manga : traits de vitesse, portrait en gros plan, onomatopée géante, l'écran tremble
  function sceneManga(a){
    var h = '<div class="mg-fond"></div><svg class="mg-traits" viewBox="-50 -50 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">';
    for (var k = 0; k < 64; k++){
      var ang = (k + Math.random() * 0.6) / 64 * Math.PI * 2, l = auPif(0.6, 2.2) * Math.PI / 180, r0 = auPif(19, 30);
      var p = function(an, r){ return (Math.cos(an) * r).toFixed(1) + ' ' + (Math.sin(an) * r).toFixed(1); };
      h += '<path d="M' + p(ang - l, 95) + 'L' + p(ang, r0) + 'L' + p(ang + l, 95) + 'Z"/>';
    }
    var cri = ACT[a].code.replace(/&nbsp;/g, ' ').replace(/\s*!\s*$/, '').toUpperCase() + '\u00a0!!', lignes = [cri];
    if (cri.length > 13 && cri.indexOf(' ') > 0){   // un cri long passe sur deux lignes, coupé au plus près du milieu
      var mots = cri.split(' '), best = null;
      for (var k = 1; k < mots.length; k++){ var l1 = mots.slice(0, k).join(' '), l2 = mots.slice(k).join(' '), m = Math.max(l1.length, l2.length); if (!best || m < best[0]) best = [m, l1, l2]; }
      lignes = [best[1], best[2]];
    }
    var lg = Math.max.apply(null, lignes.map(function(x){ return x.length; })), taille = Math.min(13, 72 / Math.max(lg, 4));
    h += '</svg><div class="mg-case"><img src="' + ACT[a].image + '" alt=""></div><b class="mg-cri" style="--fs:' + taille.toFixed(1) + 'vw">' + lignes.join('<br>') + '</b>';
    return { h: h, cls: 'manga', fin: 1.9, secousse: 0.22, son: 'stManga' };
  }
  // 3. Le canon : des dizaines de mini-objets jaillissent de la carte action et retombent en tourbillonnant
  function sceneCanon(a, def, p){
    var larg = window.innerWidth || 1000, haut = window.innerHeight || 800, n = larg < 520 ? 60 : 100, h = '', fin = 0;
    var slot = $(p === IA ? 'action-ia' : 'action-joueur'), rc = slot && slot.getBoundingClientRect(), enHaut = p === IA;
    var ox = Math.min(larg * 0.78, Math.max(larg * 0.22, rc && rc.width ? rc.left + rc.width / 2 : larg / 2)), oy = rc && rc.height ? rc.top + rc.height / 2 : (enHaut ? haut * 0.12 : haut * 0.86);
    for (var i = 0; i < n; i++){
      var t = auPif(0, 0.3), d = auPif(1.4, 2.1); fin = Math.max(fin, t + d);
      h += '<i style="--ox:' + ox.toFixed(0) + 'px;--oy:' + oy.toFixed(0) + 'px;--dx:' + auPif(-48, 48).toFixed(1) + 'vw;--up:' + (enHaut ? -auPif(0, 14) : -auPif(22, 62)).toFixed(1) + 'vh;--l:' + auPif(16, larg < 520 ? 28 : 34).toFixed(0) +
        'px;--rr:' + auPif(-720, 720).toFixed(0) + 'deg;--t:' + t.toFixed(2) + 's;--d:' + d.toFixed(2) + 's">' + objetPluie(def.o[i % def.o.length]) + '</i>';
    }
    if (def.gros) h += '<b class="gros">' + def.gros + '</b>';
    return { h: h, cls: 'canon', fin: Math.max(fin, 2), son: 'stCanon' };
  }
  // 4. L'objet géant : il tombe du ciel et rebondit sur le plateau, ou il traverse l'écran
  function sceneGeant(a, def){
    var nom = def.o[Math.floor(Math.random() * def.o.length)], passe = def.m === 'file' || Math.random() < 0.45;
    return { h: '<i class="geant">' + objetPluie(nom) + '</i>', cls: 'geant ' + (passe ? 'passe' : 'chute'), fin: passe ? 2 : 1.9, secousse: passe ? null : 0.62, son: passe ? 'stPasse' : 'stChute' };
  }

  /* ---------- Trophées ---------- */
  var TR = null;   // les trophées, créés à l'initialisation (trophees.js)
  var SVG_COUPE = '<svg class="coupe" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v5.5a5 5 0 0 1-10 0z"/><path d="M7 5H3.8v1.4A3.6 3.6 0 0 0 7.4 10M17 5h3.2v1.4a3.6 3.6 0 0 1-3.6 3.6" fill="none"/><path d="M12 13.5V17M8 21h8M9.5 17h5v4h-5z"/></svg>';
  function suiviNeuf(){ return { mene: 0, bascules: {}, avaitAction: false, actionJouee: false, poseIA: null, proclame: false, second: false, fini: false }; }
  // Ils se gagnent contre l'IA : ni tutoriel, ni partie en ligne, ni mains à découvert
  function tropheesActifs(){ return !!(TR && ui.tr && ui.s && !ui.enLigne && !ui.tuto && !ui.local && !regle('transparence')); }
  function nbFleches(carte){ var m = M.fleches(carte), n = 0; for (var b = 0; b < 8; b++) if ((m >> b) & 1) n++; return n; }
  // Après une pose (cell : le siège) ou une carte action (cell : null) : duels, combos, cartes retournées, retard au score
  function suiviCoup(p, avant, evts, cell){
    if (!tropheesActifs()) return;
    var s = ui.s, tr = ui.tr, prises = [0, 0];
    (evts || []).forEach(function(e){
      if (e.t === 'duel' && (p === J) === !!e.gagne){
        TR.duelGagne();
        if (!e.tranche){ var ch = M.chanceDuel(e.a, e.d), cj = p === J ? ch : 1 - ch; if (cj < 0.5) TR.duelDefavorable(); if (cj < 0.15) TR.marquer('improbable'); }
      }
      if (p === J && (e.t === 'combo' || (e.t === 'domino' && e.cells && e.cells.length))) TR.combo();
    });
    for (var i = 0; i < s.N; i++){
      if (avant[i] < 0 || s.own[i] < 0 || avant[i] === s.own[i]) continue;
      prises[s.own[i]]++;
      var c = s.crd[i]; tr.bascules[c] = (tr.bascules[c] || 0) + 1;
      if (tr.bascules[c] >= 4) TR.marquer('girouette');
    }
    if (p === J && prises[J] >= 4) TR.marquer('filet');
    if (p === IA && cell != null) tr.poseIA = { cell: cell, prises: prises[IA] };
    tr.mene = Math.min(tr.mene, s.score[J] - s.score[IA]);
    annoncerTrophees();
  }
  // Bannière de déblocage, comme sur console : un trophée à la fois
  var fileTrophees = [], tropheeAffiche = false;
  function annoncerTrophees(delai){
    if (!TR) return;
    var neufs = TR.verifier();
    if (!neufs.length) return;
    neufs.forEach(function(t){ fileTrophees.push(t); });
    majTuileTrophees();
    setTimeout(depilerTrophee, delai || 0);
  }
  function depilerTrophee(){
    var el = $('trophee');
    if (tropheeAffiche || !fileTrophees.length || !el) return;
    var t = fileTrophees.shift();
    tropheeAffiche = true;
    el.className = 'trophee-toast ' + t.rang;
    el.innerHTML = SVG_COUPE + '<span><small>' + (t.cache ? 'Trophée caché' : 'Trophée') + ' · ' + TR.RANGS[t.rang] + '</small><b>' + t.nom + '</b><i>' + t.desc + '</i></span>';
    el.hidden = false; void el.offsetWidth; el.classList.add('on');
    S.jouer('trophee', { platine: t.rang === 'platine' });
    setTimeout(function(){
      el.classList.remove('on');
      setTimeout(function(){ el.hidden = true; tropheeAffiche = false; depilerTrophee(); }, 320);
    }, t.rang === 'platine' ? 5200 : reduit ? 2400 : 3400);
  }
  function majTuileTrophees(){
    var sous = $('t-trophees-sous'), barre = $('t-trophees-barre');
    if (!TR || !sous) return;
    var tot = TR.total();
    sous.textContent = tot[0] + ' sur ' + tot[1];
    if (barre) barre.style.width = Math.round(100 * tot[0] / tot[1]) + '%';
  }
  function dateCourte(ts){ var d = new Date(ts); return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear(); }
  function ouvrirTrophees(){
    if (!TR) return;
    var L = TR.liste(), tot = TR.total();
    function ligne(t){
      var secret = t.cache && !t.obtenu, enCours = !t.obtenu && !secret && t.prog[1] > 1;
      return '<li class="trophee ' + t.rang + (t.obtenu ? ' obtenu' : '') + (secret ? ' secret' : '') + '">' + SVG_COUPE +
        '<span class="tr-texte"><b>' + (secret ? '???' : t.nom) + '</b><i>' + (secret ? 'Trophée caché' : t.desc) + '</i>' +
        (enCours ? '<span class="tr-barre"><span style="width:' + Math.round(100 * t.prog[0] / t.prog[1]) + '%"></span></span>' : '') + '</span>' +
        '<span class="tr-etat">' + (t.obtenu ? '<span class="tr-ok">Obtenu</span> ' + dateCourte(t.obtenu) : enCours ? t.prog[0] + ' sur ' + t.prog[1] : '') + '</span></li>';
    }
    function groupe(titre, filtre){
      var x = L.filter(filtre), n = x.filter(function(t){ return t.obtenu; }).length;
      return '<h3 class="tr-titre">' + titre + ' <small>' + n + ' sur ' + x.length + '</small></h3><ul class="trophees">' + x.map(ligne).join('') + '</ul>';
    }
    function rang(r){ return function(t){ return t.rang === r && !t.cache; }; }
    ouvrirPanneau('<h2 id="titre-dialogue">Trophées</h2>' +
      '<p class="tr-bilan"><b>' + tot[0] + '</b> sur ' + tot[1] + '<span class="tr-barre grande"><span style="width:' + Math.round(100 * tot[0] / tot[1]) + '%"></span></span></p>' +
      groupe('Platine', rang('platine')) + groupe('Or', rang('or')) + groupe('Argent', rang('argent')) + groupe('Bronze', rang('bronze')) +
      groupe('Cachés', function(t){ return t.cache; }) +
      '<p class="aide">Les trophées se gagnent contre l’IA, en partie libre ou en Carrière&nbsp;: pas dans le tutoriel, ni en ligne, ni avec l’option Transparence. Ils restent sur cet appareil.</p>' +
      '<div class="pied"><button type="button" class="bouton" data-fermer>Fermer</button></div>');
  }

  /* ---------- Animations ---------- */
  // Certains téléphones Android laissent des points après les animations : on redessine le tapis entier
  function repeindre(){ var t = document.querySelector('#vue-jeu .tapis'); if (t) requestAnimationFrame(function(){ t.classList.toggle('repeint'); }); }
  var LIB_EVT = { proche: 'À peu près d’accord !', coalition: 'Coalition !', domino: 'Effet domino !', suspendu: 'Séance suspendue', bracelet: 'Sous bracelet',
    ouverture: 'Prime d’ouverture : +1 partout', reponse: 'Droit de réponse : indéboulonnable', muette: 'Taisez-vous !', mentor: 'Le Mentor : +2 partout', immunite: 'Pas d’immunité ouvrière !' };
  // Même mouvement que les cartes de la collection : un tour complet, le dos passe à mi-course
  async function basculer(cell, own){
    var rot = $('plateau').querySelector('.case[data-i="' + cell + '"] .rot');
    if (!rot) return;
    var el = rot.firstChild;
    rot.classList.add('bascule');
    await attendre(150);   // avec cette courbe, la carte montre son dos vers 150 ms : on change la couleur à ce moment
    el.classList.toggle('j', own === J); el.classList.toggle('ia', own === IA);
    await attendre(590);
    rot.classList.remove('bascule');
    var cas = rot.parentNode;
    cas.classList.add('eclat', own === J ? 'pour-j' : 'pour-ia');
    setTimeout(function(){ cas.classList.remove('eclat', 'pour-j', 'pour-ia'); }, 650);
  }
  async function animerEvenements(affiche, evts, p){
    var total = 0;
    for (var k = 0; k < evts.length; k++){
      var e = evts[k];
      if (e.t === 'duel') await animerDuel(e, p);
      if (e.t === 'combo'){ banniere('Combo !'); S.jouer('domino'); await attendre(550); }
      if (e.t === 'protegee'){   // la flèche vise une carte qui ne bouge pas : on le dit, sinon « il ne se passe rien »
        var noms = e.proteges.map(function(x){ return CAND[ui.s.crd[x]].court; }).join(' et '), vac = e.vaccin.every(Boolean);
        e.proteges.forEach(function(x){ var c = $('plateau').querySelector('.case[data-i="' + x + '"]'); if (c){ c.classList.remove('bouclier'); void c.offsetWidth; c.classList.add('bouclier'); } });
        banniere(vac ? 'Vaccinée !' : 'Indéboulonnable !', 900); S.jouer('fauteuil'); await attendre(650);
        noter('<b>' + noms + '</b>&nbsp;: ' + (vac ? 'vaccinée' + (e.proteges.length > 1 ? 's' : '') + ' ce tour-ci' : 'indéboulonnable' + (e.proteges.length > 1 ? 's' : '')) + ', la flèche ne prend rien.');
      }
      if (LIB_EVT[e.t] && (e.cells.length || e.t === 'suspendu' || e.t === 'bracelet')){ banniere(LIB_EVT[e.t]); S.jouer(e.t); await attendre(550); }
      if (e.t === 'passation' || e.t === 'fauteuil' || e.t === 'ouverture' || e.t === 'reponse') continue;
      for (var n = 0; n < e.cells.length; n++){
        var cell = e.cells[n], own = Array.isArray(e.vers) ? e.vers[n] : e.vers != null ? e.vers : ui.s.own[cell];   // variante « Flèches » : une carte peut changer deux fois de camp dans le même coup
        if (affiche[cell] === own) continue;
        affiche[cell] = own;
        S.jouer('bascule', { pour: own === J ? 'j' : 'ia', rang: total });
        total++;
        await basculer(cell, own);
      }
    }
    return total;
  }
  // Duel de la variante « Flèches » : les deux tirages s'affichent sur les cartes, le plus grand l'emporte
  // Duel : les deux dés roulent au milieu de l'écran ; les deux cartes concernées restent entourées sur le plateau
  async function animerDuel(e, p){
    var s = ui.s, ca = $('plateau').querySelector('.case[data-i="' + e.de + '"]'), cc = $('plateau').querySelector('.case[data-i="' + e.cible + '"]');
    var na = CAND[s.crd[e.de]].court, nd = CAND[s.crd[e.cible]].court, campA = p, campD = 1 - p;
    [ca, cc].forEach(function(el){ if (el) el.classList.add('en-duel'); });
    function camp(nom, qui, role, max, cote){
      return '<div class="dd-camp ' + cote + '"><span class="dd-nom ' + (qui === J ? 'moi' : 'lui') + '">' + nom + '</span>' +
        '<span class="de-face"><i></i><i></i><i></i><i></i><b>' + (e.tranche ? max : '?') + '</b></span>' +
        '<span class="dd-lib"><b>' + role + (e.tranche ? ' ' + max : '') + '</b>' + (e.tranche ? '' : '<br>dé de 1 à ' + max) + '</span></div>';
    }
    var o = document.createElement('div'); o.className = 'duel-des' + (e.tranche ? ' fixe' : ' roule'); o.setAttribute('aria-hidden', 'true');
    o.innerHTML = '<div class="dd-boite"><p class="dd-titre">' + (e.tranche ? 'La Cour tranche' : 'Duel aux dés&nbsp;!') + '</p><div class="dd-des">' +
      camp(na, campA, 'Attaque', e.tranche ? e.ra : e.a, 'att') + '<span class="dd-contre">contre</span>' + camp(nd, campD, 'Défense', e.tranche ? e.rd : e.d, 'def') + '</div></div>';
    document.body.appendChild(o);
    var des = o.querySelectorAll('.de-face b'), camps = o.querySelectorAll('.dd-camp');
    S.jouer('coalition');
    await attendre(reduit ? 200 : 420);
    if (!e.tranche){
      S.jouer('des');
      if (!reduit){
        var t0 = Date.now();
        while (Date.now() - t0 < 700){ des[0].textContent = 1 + ((Math.random() * e.a) | 0); des[1].textContent = 1 + ((Math.random() * e.d) | 0); await attendre(65); }
      }
    }
    des[0].textContent = e.ra; des[1].textContent = e.rd;
    o.classList.remove('roule'); o.classList.add('pose');
    camps[e.gagne ? 0 : 1].classList.add('gagne'); camps[e.gagne ? 1 : 0].classList.add('perd');
    o.querySelector('.dd-titre').textContent = e.ra + ' contre ' + e.rd + ' : ' + (e.gagne ? na : nd) + ' l’emporte';
    noter(e.tranche ? 'La Cour tranche&nbsp;: <b>' + na + '</b>, attaque ' + e.a + ', contre <b>' + nd + '</b>, défense ' + e.d + '&nbsp;: ' + (e.gagne ? na : nd) + ' l’emporte.' :
      'Duel aux dés&nbsp;: <b>' + na + '</b> lance un dé de 1 à ' + e.a + ' et fait ' + e.ra + ', <b>' + nd + '</b> un dé de 1 à ' + e.d + ' et fait ' + e.rd + '&nbsp;: ' + (e.gagne ? na : nd) + ' l’emporte.');
    await attendre(reduit ? 900 : 1300);
    o.classList.add('sort');
    await attendre(reduit ? 0 : 230);
    if (o.parentNode) o.parentNode.removeChild(o);
    [ca, cc].forEach(function(el){ if (el) el.classList.remove('en-duel'); });
  }
  function enDiagonale(evts){ var n = 0; evts.forEach(function(e){ if (e.t === 'base' && e.diag) n += e.diag.length; }); return n; }
  async function animerPose(p, carte, cell, avant, evts){
    var aff = avant.slice(); aff[cell] = p;
    rendrePlateau(aff);
    var el = $('plateau').querySelector('.case[data-i="' + cell + '"] .mc');
    if (el) el.classList.add('pose');
    S.jouer('pose');
    rendreMains(); rendreActions();
    noter((p === J ? 'Tu poses <b>' : adv(true) + ' pose <b>') + CAND[carte].court + '</b> au ' + nomCase(cell) + '.');
    await attendre(380);
    var n = await animerEvenements(aff, evts, p), nd = enDiagonale(evts);
    if (n) noter((n === 1 ? '1 carte change de camp' : n + ' cartes changent de camp') + (nd ? (nd === n ? (n === 1 ? ', en diagonale.' : ', toutes en diagonale.') : ', dont ' + nd + ' en diagonale.') : '.'));
    rendreScore();
    apresPose(carte);
    suiviCoup(p, avant, evts, cell);
    repeindre();
  }

  /* ---------- Déroulé d'une partie ---------- */
  function inconnuesPourIA(){
    var s = ui.s;
    if (M.mainVisible(s, J, regle('transparence'))) return null;
    var vus = {}, i;
    s.mains[IA].forEach(function(c){ vus[c] = 1; });
    for (i = 0; i < s.N; i++) if (s.crd[i] >= 0) vus[s.crd[i]] = 1;
    return suite16(CAND.length).filter(function(c){ return !vus[c]; });
  }

  async function jouerCoup(carte, cell){
    var s = ui.s, no = ui.partie;
    ui.occupe = true; ui.sel = -1; effacerApercu();
    if (ui.enLigne){ clearTimeout(ui.enLigne.minuteur); marquer(); envoyerLigne({ t: 'poser', numero: ui.enLigne.numero, carte: carte, cell: cell }); return; }
    var avant = Array.prototype.slice.call(s.own), evts = [];
    if (etapeTuto()) ui.tuto.fait = true;
    M.poser(s, carte, cell, evts);
    await animerPose(J, carte, cell, avant, evts);
    if (ui.partie !== no) return;
    await suite();
  }

  async function suite(){
    var s = ui.s;
    rendreTout();
    sauverPartie();
    if (ui.local && !s.fin && s.trait === IA) return passerLaMain();
    if (etapeTuto() || (ui.tuto && ui.tuto.fait)) return suiteTuto();
    if (s.fin) return finPartie();
    if (s.trait === IA) return ui.enLigne ? attendreAdversaire() : tourIA();
    var L = ui.enLigne;
    if (L && L.tempsCoup){
      clearTimeout(L.minuteur);
      L.minuteur = setTimeout(function(){
        if (ui.enLigne === L && ui.s && !ui.s.fin && ui.s.trait === J){ banniere('Plus que 30 secondes !', 1600); S.jouer('suspendu'); perchoir('Plus que 30 secondes pour jouer, sinon la partie est perdue.'); }
      }, Math.max(5000, L.tempsCoup - 40000));
    }
    ui.occupe = false;
    perchoir(messageTour());
    marquer();
  }
  function messageTour(){
    var s = ui.s, g = etapeTuto();
    if (g && g.t === 'pose' && s.fl && ui.sel === g.carte){
      var at = M.apercuFleches(s, g.carte, g.cell), quoi = at.duels.length ? 'duel ' + at.duels[0].a + ' contre ' + at.duels[0].d + ' (' + Math.round(at.duels[0].p * 100) + ' %)' : at.libres.length ? 'prise sans combat' : '';
      return 'Touche le siège entouré de jaune' + (quoi ? ' : ' + quoi : '') + '.';
    }
    if (g) return g.t === 'pose' ? (ui.sel === g.carte ? 'Touche maintenant le siège entouré de jaune.' : 'Glisse ' + CAND[g.carte].court + ' sur le siège entouré de jaune.') :
      g.t === 'action' ? 'Touche ta carte action, puis « Jouer cette carte ».' : 'Lis la bulle, puis continue.';
    if (ui.sel >= 0) return CAND[ui.sel].court + ' en main : choisis un siège libre.';
    if (s.show) return 'À toi. Djadja show : ta carte gagne +3' + (s.fl ? ' et sera indéboulonnable.' : ' sur ses quatre côtés.');
    if (s.ouv) return 'À toi. Prime d’ouverture : ta première carte gagne +1 partout.';
    if (s.rep === J) return ui.derniereAction[J] === A.LARCHER ? 'À toi. Le Fauteuil : ta prochaine carte sera indéboulonnable.' : 'À toi. Droit de réponse : ta première carte sera indéboulonnable.';
    if (s.garde === J && M.posables(s, J) === 1 && s.poses < 2) return 'À toi, dernière pose : la carte que tu gardes en main compte pour toi.';
    return s.poses > 1 ? 'À toi : pose encore une carte.' : 'À toi : glisse une carte sur un siège libre.';
  }

  async function tourIA(){
    var s = ui.s, no = ui.partie;
    ui.occupe = true; marquer();
    perchoir('L’IA réfléchit…');
    await attendre(450);
    if (ui.partie !== no) return;
    var act = s.act[IA] >= 0 ? M.choisirAction(s, niveauIA(), inconnuesPourIA()) : null;
    if (act){
      await jouerActionAnimee(IA, s.act[IA], act.arg);
      if (ui.partie !== no) return;
      if (s.fin) return finPartie();
      if (s.trait !== IA) return suite();
    }
    while (!s.fin && s.trait === IA){
      perchoir('L’IA réfléchit…');
      await attendre(60);
      if (ui.partie !== no) return;
      var coup = M.choisirPose(s, niveauIA(), inconnuesPourIA());
      if (!coup) break;
      var avant = Array.prototype.slice.call(s.own), evts = [];
      M.poser(s, coup.carte, coup.cell, evts);
      await animerPose(IA, coup.carte, coup.cell, avant, evts);
      if (ui.partie !== no) return;
      if (!s.fin && s.trait === IA) await attendre(350);
    }
    if (ui.partie !== no) return;
    return suite();
  }

  /* ---------- « Le savais-tu ? » : une anecdote sourcée, dans le bilan de fin de partie ----------
     Pendant la partie, on note seulement les cartes posées et les cartes action jouées. À la fin, on choisit
     une anecdote encore jamais vue : d'abord une rencontre (deux cartes liées toutes deux en jeu), puis une carte,
     une action ou le décor de la partie, puis l'histoire des présidentielles. Chaque anecdote n'est montrée
     qu'une fois (mémoire du navigateur) ; quand tout a été vu, tout recommence. */
  function normNom(n){ return String(n).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[‐-―-]/g, '-').toLowerCase(); }
  function indices(liste, noms){ return (noms || []).map(function(n){ var k = normNom(n); for (var i = 0; i < liste.length; i++) if (normNom(liste[i].court) === k) return i; return -1; }); }
  var ANEC = (D.ANECDOTES || []).map(function(x){
    var ic = indices(CAND, x.cartes), ia = indices(ACT, x.actions);
    return { id: x.id, texte: x.texte, sources: x.sources, lieu: x.lieu || '', ic: ic, ia: ia, rencontre: ic.length + ia.length > 1 };
  }).filter(function(x){ return x.ic.indexOf(-1) < 0 && x.ia.indexOf(-1) < 0; });
  var CLE_ANEC = 'hemicycle-anecdotes';
  var anec = { poses: {}, actions: {} };
  function vuesAnec(){ var v = brut(CLE_ANEC); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function reinitAnecdotes(){ anec.poses = {}; anec.actions = {}; }
  function apresPose(carte){ anec.poses[carte] = true; }
  function apresAction(a){ anec.actions[a] = true; }
  function auHasard(t){ return t.length ? t[(Math.random() * t.length) | 0] : null; }
  function choisirAnecdote(){
    if (opts.anecdotes === false || !ANEC.length || !ui.s) return null;
    var v = vuesAnec(), t = ANEC.filter(function(x){ return !v[x.id]; });
    if (!t.length){ v = {}; t = ANEC.slice(); }   // tout a été vu : on recommence
    var s = ui.s, lieu = ui.lieu ? ui.lieu.id : '';
    function posee(c){ if (anec.poses[c]) return true; for (var i = 0; i < s.N; i++) if (s.own[i] >= 0 && s.crd[i] === c) return true; return false; }
    function enJeu(x){ return x.ic.length + x.ia.length > 0 && x.ic.every(posee) && x.ia.every(function(a){ return anec.actions[a]; }); }
    var x = auHasard(t.filter(function(y){ return y.rencontre && enJeu(y); })) ||
      auHasard(t.filter(function(y){ return !y.rencontre && (y.lieu ? y.lieu === lieu : enJeu(y)); })) ||
      auHasard(t.filter(function(y){ return !y.lieu && !y.ic.length && !y.ia.length; })) ||
      auHasard(t);
    if (x){ v[x.id] = 1; ecrire(CLE_ANEC, v); }
    return x;
  }
  function htmlAnecdote(){
    var x = choisirAnecdote();
    if (!x) return '';
    if (TR && !ui.enLigne){ TR.anecdote(); setTimeout(annoncerTrophees, 600); }
    return '<aside class="savais" aria-label="Le savais-tu ?"><p class="savais-titre">Le savais-tu&nbsp;?</p><p class="savais-texte">' + x.texte + '</p>' +
      '<p class="savais-source">' + (x.sources.length > 1 ? 'Sources' : 'Source') + '&nbsp;: ' +
      x.sources.map(function(q){ return '<a href="' + q[1] + '" target="_blank" rel="noopener">' + q[0] + '</a>'; }).join(' · ') + '</p></aside>';
  }

  /* ---------- Cartes action ---------- */
  var TEXTE_ACTION = {};
  function fl(){ return !!(ui.s && ui.s.fl); }
  function partout(){ return fl() ? ' en Attaque et en Défense' : ' partout'; }
  TEXTE_ACTION[A.BORNE] = function(qui, a){ return qui + ' 49.3 : <b>' + CAND[ui.s.crd[a]].court + '</b> passe dans ' + (qui === 'Tu joues' ? 'ton' : 'son') + ' camp, sans vote, et perd ' + (fl() ? 2 : 1) + partout() + '.'; };
  TEXTE_ACTION[A.VALLS] = function(qui, a){ return qui + ' Mercato : <b>' + CAND[ui.s.crd[a[0]]].court + '</b> et <b>' + CAND[ui.s.crd[a[1]]].court + '</b> changent de camp, et la recrue ' + (fl() ? 'attaque avec ses flèches.' : 'rejuge ses voisines.'); };
  TEXTE_ACTION[A.BRAUN] = function(qui){ return qui + ' Suspension de séance : jusqu’à ' + (qui === 'Tu joues' ? 'ton' : 'son') + ' prochain tour, plus aucune carte ne changera de camp.'; };
  TEXTE_ACTION[A.GAULLE] = function(qui, a){ return qui + ' L’Appel : <b>' + CAND[ui.s.crd[a]].court + '</b> revient au bercail.'; };
  TEXTE_ACTION[A.SARKO] = function(qui, a){ return qui + ' Bracelet : <b>' + CAND[a].court + '</b>' + (fl() ? ' n’attaque plus et ne se défend plus, jusqu’à la fin.' : ' ne retourne plus rien pendant deux tours.'); };
  TEXTE_ACTION[A.MACRON] = function(qui, a){ return qui + ' Passation : <b>' + CAND[a[1]].court + '</b> remplace <b>' + CAND[ui.s.crd[a[0]]].court + '</b>, qui retourne en main.'; };
  TEXTE_ACTION[A.LEMAIRE] = function(qui){ return qui + ' Pas candidat : on verra demain. Tour passé, deux cartes au prochain.'; };
  TEXTE_ACTION[A.LARCHER] = function(qui, a){ return qui + ' Le Fauteuil : <b>' + CAND[ui.s.crd[a]].court + '</b> devient indéboulonnable, ' + (qui === 'Tu joues' ? 'ta' : 'sa') + ' prochaine carte posée aussi.'; };
  TEXTE_ACTION[A.ARNAULT] = function(qui, a){ return fl() ? qui + ' Le Patron : la carte <b>' + CAND[ui.s.crd[a]].court + '</b> est rachetée et quitte la partie, son siège avec.' : qui + ' Le Patron : rachat du ' + nomCase(a) + ', plus personne ne peut s’y asseoir.'; };
  TEXTE_ACTION[A.PRAUD] = function(qui){ return qui + ' Édito : jusqu’à la fin, chaque carte ' + (qui === 'Tu joues' ? 'que tu poses' : 'qu’il pose') + ' gagne +' + (fl() ? 2 : 1) + partout() + '.'; };
  TEXTE_ACTION[A.BAYROU] = function(qui, a, p){ return qui + ' Le Plan : ' + (a ? (p === J ? '<b>' + CAND[a[0]].court + '</b> sort de la pioche, <b>' + CAND[a[1]].court + '</b> y entre.' : 'une carte de sa main change avec la pioche.') : 'regard sur la pioche, main inchangée.'); };
  TEXTE_ACTION[A.RUGY] = function(qui, a){ return qui + ' Le Homard : <b>' + CAND[ui.s.crd[a]].court + '</b> part dîner à l’hôtel de Lassay et ne reviendra pas s’asseoir' + (fl() ? '&nbsp;: elle ne compte plus.' : '.'); };
  TEXTE_ACTION[A.BACHELOT] = function(qui){ var moi = qui === 'Tu joues'; return qui + ' Vaccination : jusqu’à ' + (moi ? 'ton' : 'son') + ' prochain tour, ' + (moi ? 'tes' : 'ses') + ' cartes ne peuvent plus être retournées.'; };
  TEXTE_ACTION[A.COPE] = function(qui){ return qui + ' Proclamé : en cas d’égalité à la fin, ' + (qui === 'Tu joues' ? 'c’est toi qui l’emportes.' : adv() + ' l’emporte.'); };
  TEXTE_ACTION[A.MONTEBOURG] = function(qui, a){ return qui + ' Relocalisation : <b>' + CAND[ui.s.crd[a[0]]].court + '</b> déménage au ' + nomCase(a[1]) + ' et s’y bat de nouveau, ' + (fl() ? 'flèches en avant.' : 'chiffre contre chiffre.'); };
  TEXTE_ACTION[A.MORANO] = function(qui, a, p){ var x = ui.s.act[1 - p], nom = x >= 0 && x < ACT.length ? ' (' + ACT[x].code + ')' : ''; return qui + ' Ça suffit ! : la carte action de ' + (p === J ? adv() : 'toi') + nom + ' est annulée.'; };
  TEXTE_ACTION[A.PLENEL] = function(qui){ return qui + ' Révélation : ' + (qui === 'Tu joues' ? 'la main de ' + adv() + ' est' : 'ta main est') + ' à découvert ' + (fl() ? 'pendant trois tours.' : 'jusqu’à la fin.'); };
  TEXTE_ACTION[A.MONTCHALIN] = function(qui, a){ return qui + ' Cour des comptes : contrôle a posteriori, <b>' + CAND[ui.s.crd[a]].court + '</b> ' + (fl() ? 'attaque de nouveau, et la Cour tranche sans dés.' : 'rejuge ses voisines, chiffre contre chiffre.'); };
  TEXTE_ACTION[A.POUTOU] = function(qui){ return qui + ' Le Tacle : pas d’immunité ouvrière, les protections ' + (qui === 'Tu joues' ? 'de ' + adv() : 'de tes cartes') + ' tombent.'; };
  TEXTE_ACTION[A.CAHUZAC] = function(qui, a, p){ return qui + ' Compte caché : ' + (p === J ? '<b>' + CAND[a].court + '</b> part' : 'une carte part') + ' en Suisse, et compte pour ' + (p === J ? 'toi' : adv()) + '.'; };
  TEXTE_ACTION[A.THEVENOUD] = function(qui, a, p){ return qui + ' La Phobie : <b>' + CAND[a].court + '</b> n’est pas déclarée et ne comptera pas pour ' + (p === J ? adv() : 'toi') + ', sauf si elle change de camp.'; };
  TEXTE_ACTION[A.ATTALI] = function(qui, a){ return qui + ' Le Mentor de tout bord : <b>' + CAND[ui.s.crd[a]].court + '</b> ' + (fl() ? 'gagne 2 en Attaque et en Défense, et attaque de nouveau.' : 'gagne 2 partout et repart à l’attaque.'); };
  TEXTE_ACTION[A.MARCHAIS] = function(qui, a){ return qui + ' Taisez-vous ! : <b>' + CAND[ui.s.crd[a]].court + '</b> ' + (fl() ? 'perd toutes ses flèches, jusqu’à la fin.' : 'perd 3 partout.'); };
  TEXTE_ACTION[A.OUDEA] = function(qui){ var moi = qui === 'Tu joues'; return qui + ' Djadja show : ' + (moi ? 'ta' : 'sa') + ' carte de ce tour gagne +3' + (fl() ? ' en Attaque et en Défense, et devient indéboulonnable.' : ' sur ses quatre côtés.'); };
  // Un son par carte action, le même que l'on joue soi-même ou que ce soit l'IA
  var SON_ACTION = {};
  SON_ACTION[A.BORNE] = 'tampon'; SON_ACTION[A.VALLS] = 'mercato'; SON_ACTION[A.BRAUN] = 'suspendu'; SON_ACTION[A.GAULLE] = 'appel';
  SON_ACTION[A.SARKO] = 'bracelet'; SON_ACTION[A.MACRON] = 'passation'; SON_ACTION[A.LEMAIRE] = 'bof'; SON_ACTION[A.LARCHER] = 'fauteuil';
  SON_ACTION[A.ARNAULT] = 'caisse'; SON_ACTION[A.PRAUD] = 'jingle'; SON_ACTION[A.BAYROU] = 'reflexion'; SON_ACTION[A.PLENEL] = 'scoop';
  SON_ACTION[A.RUGY] = 'homard'; SON_ACTION[A.BACHELOT] = 'vaccin'; SON_ACTION[A.COPE] = 'proclame'; SON_ACTION[A.MONTEBOURG] = 'relocalisation'; SON_ACTION[A.MORANO] = 'suffit';
  SON_ACTION[A.MONTCHALIN] = 'audit'; SON_ACTION[A.OUDEA] = 'show';
  SON_ACTION[A.ATTALI] = 'audit'; SON_ACTION[A.POUTOU] = 'suffit'; SON_ACTION[A.CAHUZAC] = 'caisse'; SON_ACTION[A.THEVENOUD] = 'bof'; SON_ACTION[A.MARCHAIS] = 'suffit';

  async function annoncerActionIA(a, texte){
    var c = ACT[a], el = $('annonce');
    var effet = texte.slice(texte.indexOf(' : ') + 3);
    el.innerHTML = htmlAction(a) + '<div><p class="annonce-titre">' + adv(true) + ' joue ' + c.code + '</p><p>' + effet.charAt(0).toUpperCase() + effet.slice(1) + '</p><p class="annonce-nom">' + c.nom + '</p></div>';
    el.hidden = false;
    await attendre(2100);
    el.hidden = true;
  }

  async function jouerActionAnimee(p, a, arg, distant){
    var s = ui.s, qui = p === J ? 'Tu joues' : adv(true) + ' joue';
    var texte = TEXTE_ACTION[a](qui, arg, p);
    S.jouer(SON_ACTION[a] || 'action');
    var masque = pluieAction(a, p) || 0;
    if (p === IA){
      if (masque) await attendre(masque * 1000 - 200);   // manga, objet géant : ils cacheraient l'explication, on la montre juste après
      await annoncerActionIA(a, texte);
    } else banniere(ACT[a].code);
    var avant = Array.prototype.slice.call(s.own);
    if ((a === A.SARKO || a === A.THEVENOUD) && p === J) ui.revelees[arg] = true;   // la carte visée se retourne : on voit laquelle
    if (a === A.MARCHAIS){
      var muet = $('plateau').querySelector('.case[data-i="' + arg + '"]');
      if (muet){ muet.classList.add('bouclier'); await attendre(520); }
    }
    if (a === A.ARNAULT && fl()){
      var rachetee = $('plateau').querySelector('.case[data-i="' + arg + '"]');
      if (rachetee){ rachetee.classList.add('invitee'); await attendre(520); }
    }
    if (a === A.RUGY){
      if (p === J) ui.revelees[s.crd[arg]] = true;   // la carte invitée était sur la table : on la voit rentrer dans la main adverse
      var invitee = $('plateau').querySelector('.case[data-i="' + arg + '"]');
      if (invitee){ invitee.classList.add('invitee'); await attendre(520); }
    }
    if (a === A.MONTCHALIN){   // la carte contrôlée passe sous la loupe avant de rejuger ses voisines
      var ctl = $('plateau').querySelector('.case[data-i="' + arg + '"]');
      if (ctl){ ctl.classList.add('controlee'); await attendre(760); }
    }
    // Trophées : ce qu'il faut lire avant que la carte ne change le plateau
    var trAv = tropheesActifs() && p === J ? { fleches: a === A.MARCHAIS && s.fl ? nbFleches(s.crd[arg]) : 0,
      homard: a === A.RUGY && !!ui.tr.poseIA && ui.tr.poseIA.cell === arg && ui.tr.poseIA.prises > 0 } : null;
    ui.derniereAction[p] = a;
    var evts;
    if (distant){ ui.s = etatDepuisVue(distant.vue); evts = distant.evts; }
    else evts = M.jouerAction(s, a, arg, []);
    (evts || []).forEach(function(x){
      if (x.t === 'pioche') noter(p === J ? 'Tu pioches <b>' + CAND[x.carte].court + '</b> pour la remplacer.' : adv(true) + ' pioche une carte pour la remplacer.');
      if (x.t === 'suisse-revelee') noter('Compte en Suisse découvert&nbsp;: <b>' + CAND[x.carte].court + '</b> compte désormais pour ' + (x.vers === J ? 'toi' : adv()) + '.');
      if (x.t === 'immunite' && x.cells.length) x.cells.forEach(function(i){ var c = $('plateau').querySelector('.case[data-i="' + i + '"]'); if (c) c.classList.add('bouclier'); });
    });
    if ((evts || []).some(function(x){ return x.t === 'suisse-revelee'; })) banniere('Compte découvert !', 1100);
    if (a === A.MORANO){ var an = (evts || []).filter(function(x){ return x.t === 'annule'; })[0]; ui.annulee[1 - p] = an && an.carte >= 0 && an.carte < ACT.length ? an.carte : -1; }
    noter(texte);
    if (a === A.MONTEBOURG){
      var affm = avant.slice(); affm[arg[0]] = -1; affm[arg[1]] = p;
      rendrePlateau(affm);
      var elm = $('plateau').querySelector('.case[data-i="' + arg[1] + '"] .mc');
      if (elm) elm.classList.add('pose');
      await attendre(380);
      await animerEvenements(affm, evts, p);
    } else if (a === A.MACRON){
      var aff = avant.slice();
      rendrePlateau(aff);
      var el = $('plateau').querySelector('.case[data-i="' + arg[0] + '"] .mc');
      if (el) el.classList.add('pose');
      rendreMains();
      await attendre(380);
      await animerEvenements(aff, evts, p);
    } else if (evts.length){
      rendrePlateau(avant.slice());
      await attendre(150);
      await animerEvenements(avant.slice(), evts, p);
    }
    rendreTout();
    apresAction(a);
    if (trAv && tropheesActifs()){
      TR.action(a); ui.tr.actionJouee = true;
      if (trAv.fleches >= 5) TR.marquer('taire');
      if (trAv.homard) TR.marquer('addition');
      if (a === A.COPE) ui.tr.proclame = true;
      if (a === A.MORANO && (evts || []).some(function(x){ return x.t === 'annule' && x.carte >= 0 && x.carte < ACT.length; })) TR.marquer('suffit');
    }
    suiviCoup(p, avant, evts, null);
    repeindre();
    await attendre(250);
  }

  function ouvrirAction(){
    var s = ui.s, a = s.act[J];
    if (a < 0) return;
    var dispo = !ui.occupe && !s.fin && s.trait === J && !ui.mode;
    var c = M.ciblesAction(s, a);
    var g = etapeTuto();
    var raison = g && g.t !== 'action' ? 'Pas tout de suite : termine d’abord l’étape de la leçon.' : !dispo ? 'Attends ton tour pour la jouer.' : (c.cibles ? '' : c.raison);
    ouvrirPanneau('<h2 id="titre-dialogue">Ta carte action</h2>' +
      '<div class="carte-dialogue"><div class="carte-seule">' + R.rectoAction(ACT[a], false) + '</div></div>' +
      (a === A.BORNE ? '<p class="aide">Parade&nbsp;: si ' + adv() + ' tient la majorité absolue du plateau (5 sièges ou plus), la censure passe et le 49.3 n’est pas jouable.</p>' : '') +
      (a === A.BRAUN ? '<p class="aide">La suspension commence juste après ta pose de ce tour.</p>' : '') +
      (a === A.COPE ? '<p class="aide">Elle ne compte qu’en cas d’égalité à la fin&nbsp;: tu gagnes alors au lieu du ballottage, sans second tour.</p>' : '') +
      (a === A.MONTEBOURG ? '<p class="aide">Tu poses ensuite ta carte du tour comme d’habitude.</p>' : '') +
      (a === A.MONTCHALIN ? '<p class="aide">' + (fl() ? 'Elle attaque comme si elle venait d’être posée, mais sans dés&nbsp;: Attaque contre Défense, le plus grand gagne, l’égalité profite au défenseur. Un duel perdu te la coûte.' : 'Elle prend les voisines adverses qu’elle bat.') + ' Tu poses ensuite ta carte du tour.</p>' : '') +
      (a === A.VALLS && fl() ? '<p class="aide">La recrue attaque comme si elle venait d’être posée&nbsp;: un duel perdu te la reprend.</p>' : '') +
      (a === A.POUTOU ? '<p class="aide">Fauteuils, vaccin, et la carte indéboulonnable que ' + adv() + ' n’a pas encore posée&nbsp;: tout tombe. Tu poses ensuite ta carte du tour.</p>' : '') +
      (a === A.CAHUZAC ? '<p class="aide">La carte quitte ta main mais compte pour toi à la fin, et tu en pioches une autre. Si ' + adv() + ' joue Révélation (Mediapart), le compte est découvert et la carte passe chez ' + (ui.enLigne ? 'lui' : 'elle') + '.</p>' : '') +
      (a === A.THEVENOUD ? '<p class="aide">Si elle est encore dans le camp de ' + adv() + ' à la fin, en main ou sur le plateau, elle ne compte pas. Prends-la, et elle compte pour toi.</p>' : '') +
      (a === A.MARCHAIS ? '<p class="aide">' + (fl() ? 'Sans flèche, elle n’attaque plus et ne se défend plus&nbsp;: on la prend sans combat, de tous les côtés.' : 'Ses quatre chiffres baissent de 3 (1 au moins).') + '</p>' : '') +
      (a === A.ATTALI ? '<p class="aide">' + (fl() ? 'Elle gagne 2 en Attaque et en Défense, jusqu’à la fin (10 au plus), puis attaque comme si elle venait d’être posée, avec les dés&nbsp;: un duel perdu te la coûte. Ses flèches ne changent pas.' : 'Ses quatre chiffres gagnent 2 (10 au plus), puis elle reprend ses voisines plus faibles.') + ' Pas à ton dernier tour. Tu poses ensuite ta carte du tour.</p>' : '') +
      (a === A.OUDEA ? '<p class="aide">Sur la carte que tu poses juste après (' + (fl() ? '10 au plus' : '10 au plus par côté') + ').</p>' : '') +
      (a === A.ARNAULT ? '<p class="aide">' + (fl() ? 'La carte rachetée ne compte plus pour personne, et son siège devient un obstacle. Tu poses ensuite ta carte du tour.' : 'Le siège racheté devient un obstacle. Tu poses ensuite ta carte du tour ailleurs.') + '</p>' : '') +
      (a === A.SARKO && fl() ? '<p class="aide">Une fois posée, elle ne prend rien, et ses flèches ne la protègent plus&nbsp;: on la prend sans combat.</p>' : '') +
      (a === A.RUGY ? '<p class="aide">La carte invitée retourne dans la main de ' + adv() + ', qui devra garder une carte de plus en main jusqu’à la fin (elle compte toujours pour lui).</p>' : '') +
      (a === A.LEMAIRE ? '<p class="aide">À jouer tant qu’il te reste au moins trois cartes à poser.</p>' : '') +
      ((a === A.BORNE || a === A.MONTCHALIN || a === A.VALLS) ? '<p class="aide">Pas à ton dernier tour&nbsp;: il doit te rester au moins deux cartes à poser.</p>' : '') +
      ((a === A.MONTCHALIN || a === A.MONTEBOURG || a === A.VALLS) && !fl() ? '<p class="aide">Chiffre contre chiffre&nbsp;: sans À peu près d’accord ni Coalition.</p>' : '') +
      (raison ? '<p class="aide fort">' + raison + '</p>' : '') +
      '<div class="pied"><button type="button" class="bouton-sec" data-fermer>Fermer</button><button type="button" class="bouton" id="b-jouer-action"' + (raison ? ' disabled' : '') + '>Jouer cette carte</button></div>');
    var b = $('b-jouer-action');
    if (b) b.addEventListener('click', function(){ fermerPanneau(); lancerAction(a, c.cibles); });
  }

  function lancerAction(a, cibles){
    var s = ui.s;
    switch (a){
      case A.BRAUN: case A.LEMAIRE: case A.PLENEL: case A.PRAUD: case A.BACHELOT: case A.COPE: case A.MORANO: case A.OUDEA: case A.POUTOU:
        appliquerActionJoueur(a, null); return;
      case A.CAHUZAC:
        ui.mode = { a: a, etape: 0, ciblesMain: cibles };
        perchoir('Compte caché : choisis la carte de ta main qui part en Suisse.', true);
        break;
      case A.THEVENOUD:
        ui.mode = { a: a, etape: 0, ciblesIA: cibles };
        perchoir('La Phobie : choisis une carte dans la main de ' + adv() + '.', true);
        break;
      case A.ATTALI:
        ui.mode = { a: a, etape: 0, ciblesCases: cibles };
        perchoir('Le Mentor de tout bord : choisis ta carte posée qui va grandir.', true);
        break;
      case A.MARCHAIS:
        ui.mode = { a: a, etape: 0, ciblesCases: cibles };
        perchoir('Taisez-vous ! : choisis la carte de ' + adv() + ' à faire taire.', true);
        break;
      case A.ARNAULT:
        ui.mode = { a: a, etape: 0, ciblesCases: cibles };
        perchoir(fl() ? 'Le Patron : choisis la carte de ' + adv() + ' que tu rachètes.' : 'Le Patron : choisis le siège libre que tu rachètes.', true);
        break;
      case A.RUGY:
        ui.mode = { a: a, etape: 0, ciblesCases: cibles };
        perchoir('Le Homard : choisis une carte de ' + adv() + ' à inviter à dîner.', true);
        break;
      case A.MONTCHALIN:
        ui.mode = { a: a, etape: 0, ciblesCases: cibles };
        perchoir(fl() ? 'Cour des comptes : choisis la carte qui attaque de nouveau.' : 'Cour des comptes : choisis la carte qui rejuge ses voisines.', true);
        break;
      case A.MONTEBOURG:
        ui.mode = { a: a, etape: 0, choix: [], ciblesCases: cibles[0], suite: cibles[1] };
        perchoir('Relocalisation : choisis la carte qui déménage.', true);
        break;
      case A.BAYROU: return ui.enLigne ? demanderPlan() : ouvrirPlan(cibles);
      case A.BORNE: case A.GAULLE: case A.LARCHER:
        ui.mode = { a: a, etape: 0, ciblesCases: cibles };
        perchoir(a === A.LARCHER ? 'Le Fauteuil : choisis une de tes cartes.' : a === A.BORNE ? '49.3 : choisis une carte de ' + adv() + '.' : 'L’Appel : choisis une de tes cartes passées chez l’IA.', true);
        break;
      case A.VALLS:
        ui.mode = { a: a, etape: 0, choix: [], ciblesCases: cibles[0], suite: cibles[1] };
        perchoir('Mercato : choisis d’abord une de tes cartes.', true);
        break;
      case A.MACRON:
        ui.mode = { a: a, etape: 0, choix: [], ciblesCases: cibles[0], suite: cibles[1] };
        perchoir('Passation : choisis la carte qui quitte son siège.', true);
        break;
      case A.SARKO:
        ui.mode = { a: a, etape: 0, ciblesIA: cibles };
        perchoir('Bracelet : choisis une carte dans la main de ' + adv() + '.', true);
        break;
    }
    ui.sel = -1;
    rendreMains(); marquer();
  }

  async function appliquerActionJoueur(a, arg){
    ui.mode = null; ui.occupe = true; marquer();
    if (ui.enLigne){
      // Le Bracelet vise une place dans la main adverse : on ne connaît pas forcément la carte
      envoyerLigne({ t: 'action', numero: ui.enLigne.numero, a: a, arg: a === A.SARKO || a === A.THEVENOUD ? ui.s.mains[IA].indexOf(arg) : arg });
      return;
    }
    if (etapeTuto()) ui.tuto.fait = true;
    await jouerActionAnimee(J, a, arg);
    await suite();
  }

  function clicCible(type, valeur){
    var m = ui.mode; if (!m) return;
    if (m.a === A.VALLS || m.a === A.MACRON || m.a === A.MONTEBOURG){
      if (m.etape === 0){
        m.choix.push(valeur); m.etape = 1;
        if (m.a === A.VALLS){ m.ciblesCases = m.suite; perchoir('Mercato : choisis maintenant une carte de ' + adv() + '.', true); }
        else if (m.a === A.MONTEBOURG){ m.ciblesCases = m.suite; perchoir('Relocalisation : choisis le siège libre où elle s’installe.', true); }
        else { m.ciblesCases = []; m.ciblesMain = m.suite; perchoir('Passation : choisis la carte de ta main qui prend le siège.', true); }
        marquer(); return;
      }
      m.choix.push(valeur);
      return appliquerActionJoueur(m.a, m.choix.slice());
    }
    appliquerActionJoueur(m.a, valeur);
  }

  function annulerMode(){
    if (!ui.mode) return;
    ui.mode = null; suite();
  }

  function ouvrirPlan(top){
    var s = ui.s, choixP = -1, choixM = -1;
    function rendre(){
      var h = '<h2 id="titre-dialogue">Le Plan</h2><p>Les trois cartes du dessus de la pioche. Prends-en une et rends une carte de ta main, ou garde ta main.</p>' +
        '<p class="sous-titre">Pioche</p><div class="rangee">' + top.map(function(c){ return '<button type="button" class="choix-carte' + (choixP === c ? ' pris' : '') + '" data-p="' + c + '" aria-pressed="' + (choixP === c) + '" aria-label="' + etiquette(c, CAND[c].valeurs) + '">' + htmlMini(c) + '</button>'; }).join('') + '</div>' +
        '<p class="sous-titre">Ta main</p><div class="rangee">' + s.mains[J].map(function(c){ return '<button type="button" class="choix-carte' + (choixM === c ? ' pris' : '') + '" data-m="' + c + '" aria-pressed="' + (choixM === c) + '" aria-label="' + etiquette(c, CAND[c].valeurs) + '">' + htmlMini(c, { own: J }) + '</button>'; }).join('') + '</div>' +
        '<div class="pied"><button type="button" class="bouton-sec" id="b-garder">Garder ma main</button><button type="button" class="bouton" id="b-echanger"' + (choixP >= 0 && choixM >= 0 ? '' : ' disabled') + '>Échanger</button></div>';
      $('dialogue').innerHTML = h;
      Array.prototype.forEach.call($('dialogue').querySelectorAll('[data-p]'), function(b){ b.addEventListener('click', function(){ choixP = +b.dataset.p; rendre(); }); });
      Array.prototype.forEach.call($('dialogue').querySelectorAll('[data-m]'), function(b){ b.addEventListener('click', function(){ choixM = +b.dataset.m; rendre(); }); });
      $('b-garder').addEventListener('click', function(){ fermerPanneau(); appliquerActionJoueur(A.BAYROU, null); });
      $('b-echanger').addEventListener('click', function(){ fermerPanneau(); appliquerActionJoueur(A.BAYROU, [choixP, choixM]); });
    }
    ouvrirPanneau('');
    rendre();
    $('dialogue').querySelector('button').focus();
  }

  /* ---------- Aperçu au survol ---------- */
  function effacerApercu(){
    Array.prototype.forEach.call($('plateau').querySelectorAll('.menace'), function(el){ el.classList.remove('menace'); });
  }
  function apercu(cell){
    var s = ui.s;
    if (!s || ui.occupe || ui.mode || s.trait !== J || ui.sel < 0 || s.own[cell] !== -1) return;
    effacerApercu();
    if (s.fl) return apercuFleches(cell);
    var e = M.cloner(s), evts = [];
    M.poser(e, ui.sel, cell, evts);
    var n = 0, special = [];
    for (var i = 0; i < s.N; i++) if (s.own[i] === IA && e.own[i] === J){ n++; var el = $('plateau').querySelector('.case[data-i="' + i + '"]'); if (el) el.classList.add('menace'); }
    evts.forEach(function(x){ if ((x.t === 'proche' || x.t === 'coalition') && x.cells.length) special.push(LIB_EVT[x.t].replace(' !', '')); });
    var nd = enDiagonale(evts);
    if (nd) special.push(nd === n ? (n === 1 ? 'en diagonale' : 'toutes en diagonale') : 'dont ' + nd + ' en diagonale');
    perchoir(n ? 'Ici, ' + CAND[ui.sel].court + ' prend ' + n + ' carte' + (n > 1 ? 's' : '') + (special.length ? ' (' + special.join(', ') + ')' : '') + '.' : 'Ici, ' + CAND[ui.sel].court + ' ne prend rien.');
  }

  function apercuFleches(cell){
    var s = ui.s, at = M.apercuFleches(s, ui.sel, cell), nom = CAND[ui.sel].court, t = [];
    at.libres.concat(at.duels.map(function(d){ return d.cell; })).forEach(function(i){ var el = $('plateau').querySelector('.case[data-i="' + i + '"]'); if (el) el.classList.add('menace'); });
    if (at.libres.length) t.push(at.libres.length + ' prise' + (at.libres.length > 1 ? 's' : '') + ' sans combat');
    at.proteges.forEach(function(i){ t.push(CAND[s.crd[i]].court + (s.prot[i] ? ' indéboulonnable' : ' vaccinée') + ', intouchable'); });
    at.duels.forEach(function(d){ t.push('duel ' + d.a + ' contre ' + d.d + ' (' + Math.round(d.p * 100) + ' %)'); });
    perchoir(t.length ? 'Ici, ' + nom + ' : ' + t.join(', ') + '.' : 'Ici, ' + nom + ' n’attaque personne.');
  }

  /* ---------- Panneaux ---------- */
  var dernierFocus = null;
  function ouvrirPanneau(html){
    dernierFocus = document.activeElement;
    $('dialogue').innerHTML = html;
    $('voile').hidden = false;
    var f = $('dialogue').querySelector('.pied .bouton:not([disabled])') || $('dialogue').querySelector('button:not([disabled]), input, a');
    if (f) try { f.focus({ preventScroll: true }); } catch (e){ f.focus(); }
    $('dialogue').scrollTop = 0;
    R.dessinerTousLesDos($('dialogue'));
  }
  function fermerPanneau(){
    $('voile').hidden = true;
    $('dialogue').innerHTML = '';
    if (dernierFocus && document.body.contains(dernierFocus)) try { dernierFocus.focus(); } catch (e){}
  }

  function nombre(x){ return x.toLocaleString('fr-FR'); }
  function calculCarte(idx){
    var c = CAND[idx], m = c.methode, bruts = R.faits(c);
    return '<ul class="calcul-carte">' + [0, 1, 2, 3].map(function(k){
      var n = m.devance[k], x = 1 + 9 * n / RIV, x1 = Math.round(x * 10) / 10;
      var xs = nombre(x1 === Math.round(x) && x !== Math.round(x) ? Math.round(x * 100) / 100 : x1);  // 8,04 plutôt que « 8, arrondi à 8 »
      var dev = n === 0 ? 'ne devance aucun rival' : 'devance ' + n + ' rival' + (n > 1 ? 's' : '').replace('rivals', 'rivaux') + ' sur ' + RIV;
      if (n > 1) dev = 'devance ' + n + ' rivaux sur ' + RIV;
      return '<li><b>' + FLECHES[k] + '<i class="pi">' + R.PICTOS[k] + '</i>' + COTES[k] + ' ' + R.chiffre(c.valeurs[k]) + '</b><br>' + bruts[k] + '. ' + dev.charAt(0).toUpperCase() + dev.slice(1) +
        '&nbsp;: 1 + 9 × ' + n + ' ÷ ' + RIV + ' = ' + xs + (Math.round(x) === x ? '' : ', arrondi à ' + Math.round(x)) + '.</li>';
    }).join('') + '</ul>';
  }
  function montrerCarte(idx){
    ouvrirPanneau('<h2 id="titre-dialogue" class="cache-visuel">' + CAND[idx].nom + '</h2><div class="carte-dialogue"><div class="carte-seule">' + R.rectoCandidat(CAND[idx], false) + '</div></div>' +
      '<p class="sous-titre">D’où viennent ses quatre chiffres</p>' + calculCarte(idx) +
      '<p class="aide">Même calcul pour les ' + CAND.length + ' candidats&nbsp;: <button type="button" class="lien-inline" data-calcul>la règle de calcul</button>, et <a href="#pts-' + slugDe(idx) + '">sa ligne dans le tableau des points</a>.</p>' +
      '<div class="pied"><button type="button" class="bouton" data-fermer>Fermer</button></div>');
  }
  function ouvrirCalcul(){
    var corps = document.querySelector('#regle .regle-corps');
    ouvrirPanneau('<h2 id="titre-dialogue">La règle de calcul</h2><div class="regle-corps">' + (corps ? corps.innerHTML : '') + '</div>' +
      '<div class="pied"><button type="button" class="bouton" data-fermer>Fermer</button></div>');
  }

  function texteBilan(){
    var t = bilan.v + bilan.d + bilan.n;
    return t ? 'Ton bilan ici&nbsp;: ' + bilan.v + ' victoire' + (bilan.v > 1 ? 's' : '') + ' · ' + bilan.d + ' défaite' + (bilan.d > 1 ? 's' : '') + ' · ' + bilan.n + ' ballottage' + (bilan.n > 1 ? 's' : '') + '.' : '';
  }

  /* ---------- Accueil : Solo, En ligne, Mon deck, Réglages ----------
     L'accueil se pose sur le tapis à la place de l'arène ; chaque tuile ouvre son panneau. En partie,
     « ← Menu » y ramène sans arrêter la partie, qu'une tuile « Reprendre » permet de retrouver. */
  function champRadio(nom, val, titre, detail){
    return '<label><input type="radio" name="' + nom + '" value="' + val + '"' + (opts[nom] === val ? ' checked' : '') + '><span>' + titre + (detail ? '<small>' + detail + '</small>' : '') + '</span></label>';
  }
  function champCoche(nom, titre, detail, coche){
    return '<label><input type="checkbox" name="' + nom + '"' + ((coche == null ? opts[nom] : coche) ? ' checked' : '') + '><span>' + titre + (detail ? '<small>' + detail + '</small>' : '') + '</span></label>';
  }
  function enPartie(){ return !!(ui.s && !ui.s.fin) || !!(ui.enLigne && !ui.enLigne.fini && (ui.s || ui.enLigne.attente)); }
  function surAccueil(){ return !$('accueil').hidden; }
  /* ---------- Partie en cours gardée dans ce navigateur : on la retrouve au lancement suivant ---------- */
  var CLE_PARTIE = 'hemicycle-partie-en-cours', REGLES_GARDEES = ['niveau', 'plateau', 'proche', 'coalition', 'diagonales', 'actions', 'transparence', 'distribution'];
  function oublierPartie(){ try { localStorage.removeItem(CLE_PARTIE); } catch (e){} }
  function sauverPartie(){
    var s = ui.s;
    if (!s || s.fin || ui.tuto || ui.enLigne) return oublierPartie();
    var loc = null;
    if (ui.local){ var rv = [ui.local.rev[0] || {}, ui.local.rev[1] || {}]; rv[ui.local.vue] = ui.revelees; loc = { noms: ui.local.noms, vue: ui.local.vue, rev: rv, match: ui.local.match || null }; }
    var r = {}; REGLES_GARDEES.forEach(function(k){ r[k] = opts[k]; });
    try {
      ecrire(CLE_PARTIE, { v: 1, s: M.exporter(s), lieu: ui.lieu ? ui.lieu.id : null, bancs: ui.bancs, premier: ui.premier, revelees: ui.revelees,
        actionsJouees: ui.actionsJouees, derniereAction: ui.derniereAction, annulee: ui.annulee, carriere: ui.carriere || null, variante: ui.variante || null,
        tr: ui.tr || null, regles: r, local: loc, journal: $('journal').innerHTML, date: Date.now() });
    } catch (e){}
  }
  function restaurerPartie(){
    var o = brut(CLE_PARTIE);
    if (!o || o.v !== 1 || !o.s) return false;
    try {
      var s = M.importer(o.s);
      if (s.fin) throw new Error('finie');
      Object.keys(o.regles || {}).forEach(function(k){ if (REGLES_GARDEES.indexOf(k) >= 0) opts[k] = o.regles[k]; });
      ui.partie++;
      ui.variante = o.variante === 'fleches' ? 'fleches' : null;
      ui.lieu = lieuParId(o.lieu) || LIEUX[0]; appliquerLieu();
      ui.bancs = o.bancs || {}; ui.premier = o.premier; ui.revelees = o.revelees || {};
      ui.actionsJouees = o.actionsJouees || [false, false]; ui.derniereAction = o.derniereAction || [-1, -1]; ui.annulee = o.annulee || [-1, -1];
      ui.carriere = o.carriere || null; ui.tr = o.tr || suiviNeuf();
      ui.sel = -1; ui.mode = null; ui.occupe = false; ui.s = s;
      $('leg-coins').hidden = !!s.fl || !s.diag;
      document.querySelector('#vue-jeu .arene').classList.toggle('en-fleches', !!s.fl);
      var ol = o.local;
      ui.local = ol && Array.isArray(ol.noms) && ol.noms.length === 2 ? { noms: [String(ol.noms[0]), String(ol.noms[1])], vue: ol.vue === 1 ? 1 : 0, rev: Array.isArray(ol.rev) ? ol.rev : [{}, {}],
        match: ol.match && Array.isArray(ol.match.victoires) ? { victoires: [ol.match.victoires[0] | 0, ol.match.victoires[1] | 0], manche: ol.match.manche | 0 || 1, compte: !!ol.match.compte } : null } : null;
      reinitAnecdotes(); appliquerVueLocale();
      $('journal').innerHTML = typeof o.journal === 'string' ? o.journal : '';
      ui.aRelancer = true;
      return true;
    } catch (e){ ui.s = null; oublierPartie(); return false; }
  }
  function afficherAccueil(){
    if (!$('voile').hidden) fermerPanneau();
    $('accueil').hidden = false;
    document.querySelector('#vue-jeu .arene').hidden = true;
    $('vue-jeu').classList.add('sur-accueil');
    $('lien-cartes').hidden = false; $('b-accueil').hidden = true;
    majAccueil();
    repeindre();
  }
  // Le bouton « retour » (du navigateur ou du téléphone) ramène de la partie à l'accueil, sans l'arrêter
  function noterPartieDansHistorique(){ try { if (!(history.state && history.state.vue === 'partie')) history.pushState({ vue: 'partie' }, '', location.href); } catch (e){} }
  // Après un rechargement, la partie notée dans l'historique n'existe plus
  try { if (history.state && history.state.vue === 'partie') history.replaceState(null, '', location.href); } catch (e){}
  function allerAccueil(){
    retirerPasseMain();
    if (history.state && history.state.vue === 'partie'){ try { history.back(); return; } catch (e){} }
    afficherAccueil();
  }
  function afficherJeu(){
    noterPartieDansHistorique();
    majNomsAdversaire();
    $('accueil').hidden = true;
    document.querySelector('#vue-jeu .arene').hidden = false;
    $('vue-jeu').classList.remove('sur-accueil');
    $('lien-cartes').hidden = true; $('b-accueil').hidden = false;
    repeindre();
  }
  function majAccueil(){
    var L = ui.enLigne, n = classeur().cartes.length, rep = $('t-reprendre'), s = ui.s;
    rep.hidden = !enPartie();
    $('t-tuto').hidden = !rep.hidden || !!brut(cleTuto()) || bilan.v + bilan.d + bilan.n > 0;
    if (!rep.hidden){
      $('t-reprendre-sous').textContent = ui.tuto ? 'Tutoriel · leçon ' + (ui.tuto.lecon + 1) + ' sur ' + ui.tuto.lecons.length : L ? (L.attente && !s ? 'En attente de ton ami' : 'Partie en ligne' + (s ? ' · ' + s.score[J] + ' à ' + s.score[IA] : '')) :
        ui.local ? 'Face-à-face · ' + ui.local.noms[0] + ' ' + s.score[ui.local.vue === 0 ? J : IA] + ' à ' + s.score[ui.local.vue === 0 ? IA : J] + ' ' + ui.local.noms[1] :
        (ui.carriere ? 'Carrière' : 'Partie libre') + ' · ' + NIVEAUX[opts.niveau] + ' · ' + s.score[J] + ' à ' + s.score[IA];
    }
    $('t-deck-sous').innerHTML = n ? libelleClasseur(n) : 'Pas encore commencé&nbsp;: ' + DEPART_CLASSEUR + ' cartes au départ';
    $('t-ligne-sous').innerHTML = 'À deux sur ce téléphone, ou en ligne';
    $('accueil-bilan').innerHTML = texteBilan();
  }
  function reprendre(){
    afficherJeu();
    if (ui.local && ui.s && !ui.s.fin && !ui.tuto){   // face-à-face : on redemande qui tient le téléphone avant de montrer une main
      ui.aRelancer = false; repeindre();
      if (!$('passe-main')) passerLaMain(ui.s.trait === J);
      return;
    }
    if (ui.aRelancer && ui.s){ ui.aRelancer = false; repeindre(); suite(); return; }
    if (ui.enLigne && ui.enLigne.attente && !ui.s) montrerAttente();
  }
  // Un nouveau départ abandonne la partie en cours (en ligne : on quitte la table)
  function lancerSolo(mode, vu){
    if (ui.local) quitterLocal();
    if (reglesFleches() && !vu && !brut(CLE_FL) && !brut(cleTuto())) return ouvrirReglesFleches(mode);   // première partie sans tutoriel : les règles d'abord
    if (ui.enLigne) quitterLigne();
    ui.variante = reglesFleches() ? 'fleches' : null;
    opts.distribution = mode === 'carriere' ? 'carriere' : opts.donne;
    ecrire('hemicycle-options', opts);
    fermerPanneau();
    afficherJeu();
    nouvellePartie();
  }

  function ouvrirSolo(){
    var n = classeur().cartes.length, L = ui.enLigne, classee = !!(L && L.classee && ui.s && !ui.s.fin && !L.fini), ouverte = carriereOuverte();
    var donne = { equilibre: 'tirées au sort à égalité', hasard: 'tirées au sort', primaire: 'choisies tour à tour (la primaire)' }[opts.donne];
    ouvrirPanneau('<h2 id="titre-dialogue">Solo</h2><form id="form-solo">' +
      '<div class="modes">' +
        (ouverte ? '<button type="button" class="mode mode-principal" id="b-carriere"><b>Carrière</b><span>' + (n ? 'Ton deck (' + libelleClasseur(n) + ') contre l’IA. ' : 'Tu reçois ' + DEPART_CLASSEUR + ' cartes pour commencer. ') +
          'Gagne&nbsp;: tu prends une de ses cartes. Perds&nbsp;: elle t’en prend une.</span></button>' :
          '<div class="mode mode-verrou" id="b-carriere"><b>Carrière <i>verrouillée</i></b><span>' + texteVerrou() + '</span>' +
          '<button type="button" class="lien-inline" id="b-ouvrir-carriere">Je connais déjà les règles</button></div>') +
        '<button type="button" class="mode" id="b-libre"><b>Partie libre</b><span>Cinq cartes chacun, ' + donne + '. Rien à gagner ni à perdre.</span></button>' +
        '<button type="button" class="mode" id="b-tuto"><b>Tutoriel</b><span>Trois leçons guidées pour apprendre les règles en jouant. Trois minutes.</span></button>' +
      '</div>' +
      (classee ? '<p class="aide fort">Attention&nbsp;: quitter ta partie rapide en ligne la fait perdre.</p>' : '') +
      '<div class="pied"><button type="button" class="bouton-sec" data-fermer>Retour</button></div></form>');
    // La première manche de Carrière se joue d'office contre la Mairie : pas de niveau à choisir
    if (ouverte) $('b-carriere').addEventListener('click', function(){ if (premiereManche(classeur())) lancerSolo('carriere'); else ouvrirNiveau('carriere'); });
    else $('b-ouvrir-carriere').addEventListener('click', function(){ ecrire(CLE_CARRIERE, 1); ouvrirSolo(); });
    $('b-libre').addEventListener('click', function(){ ouvrirNiveau('libre'); });
    $('b-tuto').addEventListener('click', lancerTuto);
  }
  // Deuxième temps, une fois le mode choisi : l'adversaire. Le niveau de la dernière partie est mis en avant.
  function ouvrirNiveau(mode){
    function b(id, nom, sous){ return '<button type="button" class="mode b-niveau' + (opts.niveau === id ? ' actuel' : '') + '" data-niveau="' + id + '"><b>' + nom + '</b><span>' + sous + (opts.niveau === id ? ' · ton dernier choix' : '') + '</span></button>'; }
    ouvrirPanneau('<h2 id="titre-dialogue">' + (mode === 'carriere' ? 'Carrière' : 'Partie libre') + '</h2><p class="aide">Choisis ton adversaire.</p>' +
      '<div class="modes" id="niveaux">' + b('mairie', 'Mairie', 'Facile') + b('assemblee', 'Assemblée', 'Moyen') + b('elysee', 'Élysée', 'Difficile') + '</div>' +
      '<div class="pied"><button type="button" class="bouton-sec" id="b-retour-niveau">Retour</button></div>');
    Array.prototype.forEach.call($('niveaux').querySelectorAll('[data-niveau]'), function(x){
      x.addEventListener('click', function(){ opts.niveau = x.dataset.niveau; ecrire('hemicycle-options', opts); majNomsAdversaire(); lancerSolo(mode); });
    });
    $('b-retour-niveau').addEventListener('click', ouvrirSolo);
    var act = $('niveaux').querySelector('.actuel'); if (act) try { act.focus({ preventScroll: true }); } catch (e){}
  }

  // Les règles des Flèches. « mode » : montrées avant la toute première partie, avec un bouton pour la lancer.
  function ouvrirReglesFleches(mode, retour){
    ouvrirPanneau('<h2 id="titre-dialogue">Comment jouer</h2>' +
      '<ol class="regles">' +
        '<li>À chaque partie, on tire au sort <b>le lieu</b> et, à pile ou face, <b>qui commence</b>. Le plateau compte 16 sièges, dont 3 à 5 bloqués par le décor. Chacun reçoit <b>5 cartes</b>.</li>' +
        '<li>Chaque carte porte de petites <b>flèches</b>, jusqu’à huit, et deux chiffres&nbsp;: son <b>Attaque</b> (sa popularité&nbsp;: Urnes et Buzz) et sa <b>Défense</b> (son ancrage&nbsp;: Expérience et Terrain). Tout vient de faits publics (<button type="button" class="lien-inline" data-calcul>la règle de calcul</button>).</li>' +
        '<li>À ton tour, <b>glisse une carte sur un siège libre</b> (ou touche la carte, puis le siège). Chacune de ses flèches qui touche une carte adverse <b>l’attaque</b>.</li>' +
        '<li>La carte visée n’a <b>pas de flèche en retour</b>&nbsp;: elle est prise, sans combat.</li>' +
        '<li>Elle a une flèche en retour&nbsp;: <b>duel</b>. Tu tires un nombre entre 1 et ton Attaque, elle entre 1 et sa Défense. Le plus grand gagne, l’égalité profite au défenseur.</li>' +
        '<li><b>Combo</b>&nbsp;: la carte battue en duel change de camp et entraîne les cartes de son camp qu’elle pointait. Ça vaut aussi contre toi&nbsp;: un duel perdu, et ta carte passe en face avec celles qu’elle pointait.</li>' +
        (opts.actions ? '<li><b>Carte action</b>&nbsp;: chacun en reçoit une, à jouer une seule fois, à son tour, avant de poser. Touche-la pour lire son effet.</li>' : '') +
        '<li><b>Qui commence&nbsp;?</b> Poser en dernier est un gros avantage, alors le jeu compense. Celui qui commence pose ses 5 cartes et a le dernier mot&nbsp;; l’autre en pose 4, <b>garde la cinquième en main</b> (elle compte pour lui), et sa première carte est <b>indéboulonnable</b>&nbsp;: ni prise, ni défiée.</li>' +
        '<li>À la fin, chaque carte à ta couleur compte, sur le plateau comme en main&nbsp;: <b>6 sur 10, c’est la majorité absolue</b>. En <b>Carrière</b>, une victoire te fait prendre une carte de l’IA, une défaite t’en coûte une.</li>' +
      '</ol>' +
      '<p class="aide">Avant de lâcher une carte, la ligne sous le score annonce les prises et les chances de chaque duel. Tes cartes&nbsp;: fond surligneur. Celles de l’IA&nbsp;: fond nuit.</p>' +
      '<div class="pied">' + (mode ? '<button type="button" class="bouton-sec" id="b-retour-fleches">Retour</button><button type="button" class="bouton-sec" id="b-tuto-fleches">Tutoriel</button><button type="button" class="bouton" id="b-go-fleches">Jouer</button>' :
        (typeof retour === 'function' ? '<button type="button" class="bouton-sec" id="b-retour-fleches">Retour</button>' : '') + '<button type="button" class="bouton" data-fermer>Compris</button>') + '</div>');
    var br = $('b-retour-fleches');
    if (br) br.addEventListener('click', mode ? ouvrirSolo : retour);
    if (mode){
      $('b-go-fleches').addEventListener('click', function(){ ecrire(CLE_FL, 1); lancerSolo(mode, true); });
      $('b-tuto-fleches').addEventListener('click', lancerTuto);
    }
  }

  // Crédits : qui a fait quoi, d'où viennent les chiffres, les sons et les polices, et l'hommage
  // Politique de confidentialité : la même dans l'appli et sur sa page web (exigée par Google Play, même sans aucune donnée collectée)
  var POLITIQUE = '<p class="maj">Mise à jour le 24 novembre 2026.</p>' +
    '<p><b>En bref&nbsp;:</b> Retourne ta veste ne collecte aucune donnée personnelle. Pas de compte, pas de publicité, pas de mesure d’audience, aucun outil de suivi. Tout ce que le jeu retient reste sur ton téléphone.</p>' +
    '<h3>Qui édite le jeu</h3><p>Jérôme Hosdez, développeur indépendant. Pour toute question, écris à l’adresse e-mail indiquée sur la fiche du jeu sur Google Play.</p>' +
    '<h3>Ce que le jeu enregistre, et où</h3><p>Pour que tu retrouves ta progression, le jeu garde dans sa mémoire, sur ton appareil uniquement&nbsp;: tes réglages, ta partie en cours, ta collection de Carrière (cartes et cartes action), tes trophées, tes statistiques et les prénoms saisis en Face-à-face. Ces données ne sont envoyées nulle part&nbsp;: personne n’y a accès, pas même l’éditeur. L’appli Android ne demande d’ailleurs pas la permission d’accéder à Internet.</p>' +
    '<p>Si la sauvegarde Android est activée sur ton téléphone, ces données peuvent faire partie de ta sauvegarde Google personnelle, comme celles de tes autres applis. L’éditeur n’y a pas accès.</p>' +
    '<h3>Tout effacer</h3><p>Désinstalle le jeu, ou va dans les paramètres Android&nbsp;: Applications, Retourne ta veste, Stockage, Effacer les données. Dans le jeu, « Recommencer à zéro » efface aussi ta Carrière.</p>' +
    '<h3>Liens vers d’autres sites</h3><p>Les sources de l’album et le lien de don s’ouvrent dans ton navigateur. Ces sites ont leurs propres règles de confidentialité.</p>' +
    '<h3>Enfants</h3><p>Le jeu ne s’adresse pas spécialement aux enfants et ne collecte aucune donnée, quel que soit l’âge du joueur.</p>' +
    '<h3>Changements</h3><p>Si un jour le jeu propose des parties en ligne, cette politique sera mise à jour avant, et le jeu te préviendra.</p>';
  function ouvrirConfidentialite(){
    ouvrirPanneau('<h2 id="titre-dialogue">Confidentialité</h2><div class="credits politique">' + POLITIQUE + '</div>' +
      '<div class="pied"><button type="button" class="bouton-sec" id="b-retour-credits">Crédits</button><button type="button" class="bouton" data-fermer>Fermer</button></div>');
    $('b-retour-credits').addEventListener('click', ouvrirCredits);
  }
  function ouvrirCredits(){
    ouvrirPanneau('<h2 id="titre-dialogue">Crédits</h2>' +
      '<div class="credits">' +
        '<p><b>Retourne ta veste</b>&nbsp;: un jeu indépendant et humoristique, qui ne roule pour personne. Conçu par Jérôme Hosdez, sur son temps libre, avec l’aide de Claude (Anthropic).</p>' +
        '<p><b>Les chiffres</b> des cartes viennent de faits publics, chacun relié à sa source dans l’album. <b>Les portraits</b> sont générés par IA, avec le même traitement pour tous. <b>Les décors et les objets animés</b> le sont aussi.</p>' +
        '<p><b>Les sons</b> sont fabriqués par le jeu lui-même. L’ouverture et la fanfare de victoire reprennent La Marseillaise de Rouget de Lisle (1792, domaine public).</p>' +
        '<p><b>Les polices</b>&nbsp;: Fraunces, Atkinson Hyperlegible et JetBrains Mono, sous licence libre SIL Open Font License.</p>' +
        '<p><b>Confidentialité</b>&nbsp;: le jeu ne collecte aucune donnée, tout reste sur ton téléphone. <button type="button" class="lien-inline" id="b-confidentialite">Lire la politique de confidentialité</button></p>' +
        '<p class="hommage">Hommage aux jeux de cartes des RPG de nos années PlayStation, et à <b>Hiroyuki Ito</b> et <b>Hironobu Sakaguchi</b>, qui nous en ont donné le goût. Ce jeu n’a aucun lien avec eux.</p>' +
      '</div>' +
      '<div class="pied"><button type="button" class="bouton" data-fermer>Fermer</button></div>');
    $('b-confidentialite').addEventListener('click', ouvrirConfidentialite);
  }

  // Multijoueur : d'abord le choix, sur ce téléphone ou en ligne
  function ouvrirMulti(){
    ouvrirPanneau('<h2 id="titre-dialogue">Multijoueur</h2><div class="modes">' +
      '<button type="button" class="mode mode-principal" id="b-multi-local"><b>Face-à-face</b><span>À deux sur ce téléphone&nbsp;: le débat de l’entre-deux-tours. On se le passe à chaque tour.</span></button>' +
      '<button type="button" class="mode' + (ADRESSE_WS ? '' : ' mode-bientot') + '" id="b-multi-ligne"><b>En ligne' + (ADRESSE_WS ? '' : ' <small class="pastille-bientot">bientôt</small>') + '</b><span>Défier un ami avec un lien, ou une partie rapide contre un inconnu.</span></button>' +
      '</div><div class="pied"><button type="button" class="bouton-sec" data-fermer>Retour</button></div>');
    $('b-multi-local').addEventListener('click', ouvrirFaceAFace);
    $('b-multi-ligne').addEventListener('click', ouvrirEnLigne);
  }
  function ouvrirEnLigne(){
    if (!ADRESSE_WS){
      ouvrirPanneau('<h2 id="titre-dialogue">En ligne&nbsp;: bientôt</h2>' +
        '<p>Défier un ami avec un simple lien, ou jouer une partie rapide contre un inconnu, avec un classement. Le serveur de parties n’est pas encore branché ici.</p>' +
        '<div class="pied"><button type="button" class="bouton" data-fermer>Retour</button></div>');
      return;
    }
    var L = ui.enLigne, classee = !!(L && L.classee && ui.s && !ui.s.fin && !L.fini), p = profil();
    ouvrirPanneau('<h2 id="titre-dialogue">En ligne</h2>' +
      '<p class="ligne-profil" id="ligne-profil">' + (p ? 'Ton profil&nbsp;: ' + PR.avatarHtml(p.avatar, 24) + '<b>' + echapper(p.pseudo) + '</b> <button type="button" class="lien-inline" id="b-profil">Modifier</button>'
        : 'Tu choisiras ton pseudo et ton avatar avant de jouer. <button type="button" class="lien-inline" id="b-profil">Les choisir maintenant</button>') + '</p>' +
      '<div class="modes">' +
        '<button type="button" class="mode mode-principal" id="b-ami"><b>Défier un ami</b><span>Tu reçois un lien à lui envoyer. Vous jouez avec tes réglages.</span></button>' +
        '<button type="button" class="mode" id="b-inconnu"><b>Partie rapide</b><span>Contre le premier joueur en attente, avec les règles standard. Elle compte au classement.</span></button>' +
      '</div>' +
      '<p class="rejoindre-ligne"><label for="code-ligne">Un ami t’a envoyé un code&nbsp;?</label> <input type="text" id="code-ligne" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABCD"> ' +
        '<button type="button" class="bouton-sec" id="b-rejoindre">Rejoindre</button></p>' +
      (classee ? '<p class="aide fort">Attention&nbsp;: quitter ta partie rapide en cours la fait perdre.</p>' : '') +
      '<div class="pied"><button type="button" class="bouton-sec" id="b-classement">Classement</button><button type="button" class="bouton" data-fermer>Retour</button></div>');
    $('b-profil').addEventListener('click', function(){ ouvrirProfil(function(){ envoyerProfil(); ouvrirEnLigne(); }); });
    $('b-ami').addEventListener('click', function(){
      avecProfil(function(){
        fermerPanneau(); afficherJeu();
        demarrerLigne({ t: 'creer', profil: profilServeur(), opts: { plateau: opts.plateau, lieu: opts.lieu, distribution: opts.donne === 'hasard' ? 'hasard' : 'equilibre',
          proche: opts.proche, coalition: opts.coalition, diagonales: opts.diagonales, actions: opts.actions, transparence: opts.transparence, secondTour: opts.secondTour } });
        perchoir('Création de la partie…');
      });
    });
    $('b-inconnu').addEventListener('click', function(){ avecProfil(function(){ afficherJeu(); chercherPartie(); }); });
    $('b-rejoindre').addEventListener('click', function(){
      var champ = $('code-ligne');
      if (!rejoindreLigne(champ.value)){ champ.focus(); champ.setAttribute('aria-invalid', 'true'); return; }
      fermerPanneau();
    });
    $('code-ligne').addEventListener('keydown', function(ev){ if (ev.key === 'Enter'){ ev.preventDefault(); $('b-rejoindre').click(); } });
    $('b-classement').addEventListener('click', function(){ ouvrirClassement(true); });
  }

  function ouvrirOptions(){
    ouvrirPanneau('<h2 id="titre-dialogue">Réglages</h2><form id="form-options" data-regles="' + (reglesFleches() ? 'fleches' : 'classique') + '">' +
      '<fieldset><legend>Les règles du jeu</legend><div class="choix deux">' +
        champRadio('regles', 'fleches', 'Flèches', 'Flèches, duels et combos, sur le grand plateau.') +
        champRadio('regles', 'classique', 'Classiques', 'Chiffre contre chiffre sur les quatre côtés, avec cartes action et tutoriel.') +
      '</div></fieldset>' +
      '<fieldset class="seul-classique"><legend>Le plateau</legend><div class="choix deux">' +
        champRadio('plateau', 'grand', 'Grand plateau', '4 × 4 places, dont 4 à 7 bloquées par le décor, tirées au hasard à chaque partie.') +
        champRadio('plateau', 'classique', 'Plateau classique', '3 × 3 places, sans obstacle.') +
      '</div></fieldset>' +
      '<fieldset><legend>Le lieu</legend><div class="choix trois lieux">' +
        champRadio('lieu', 'hasard', 'Au hasard', 'Tiré au sort à chaque partie, avec le premier joueur.') +
        LIEUX.map(function(l){ return champRadio('lieu', l.id, l.nom, l.sous); }).join('') +
      '</div></fieldset>' +
      '<fieldset class="seul-classique"><legend>Options des règles classiques</legend><div class="choix deux">' +
        champCoche('proche', 'À peu près d’accord', 'Deux côtés égaux à 1 près&nbsp;: les cartes adverses concernées passent chez toi.') +
        champCoche('coalition', 'Coalition', 'Deux voisines qui font la même somme avec ta carte&nbsp;: même effet.') +
        champCoche('diagonales', 'Diagonales', 'Les cartes en diagonale s’affrontent aussi, coin contre coin.') +
        champCoche('secondTour', 'Second tour', 'En cas d’égalité, on rejoue avec les cartes gagnées.') +
      '</div></fieldset>' +
      '<fieldset><legend>La donne en partie libre</legend><div class="choix trois">' +
        champRadio('donne', 'equilibre', 'À égalité', 'Cinq cartes chacun, même total à 2 points près.') +
        champRadio('donne', 'hasard', 'Au hasard intégral', 'Comme elles tombent&nbsp;: la donne peut décider.') +
        champRadio('donne', 'primaire', 'La primaire', 'Dix cartes sur la table, chacun choisit à son tour.') +
      '</div></fieldset>' +
      '<fieldset><legend>Ambiance</legend><div class="choix deux">' +
        champCoche('actions', 'Cartes action', 'Une chacun, à jouer une fois dans la partie.') +
        champCoche('transparence', 'Transparence', 'Les deux mains se jouent à découvert.') +
        champCoche('sons', 'Sons rigolos', 'Bruitages et petites musiques.', S.actif()) +
        champCoche('anecdotes', 'Le savais-tu&nbsp;?', 'Avec le résultat, une anecdote sourcée sur une carte de la partie.') +
      '</div></fieldset>' +
      '<div class="pied"><button type="button" class="bouton-sec" id="b-voir-regles">Comment jouer&nbsp;?</button><button type="submit" class="bouton">Enregistrer</button></div></form>');
    function lireForm(f){
      opts.plateau = f.plateau.value; opts.lieu = f.lieu.value; opts.donne = f.donne.value; opts.regles = f.regles.value;
      textesActions();
      ['proche', 'coalition', 'diagonales', 'actions', 'transparence', 'secondTour', 'anecdotes'].forEach(function(k){ opts[k] = f[k].checked; });
      if (opts.distribution !== 'carriere') opts.distribution = opts.donne;
      ecrire('hemicycle-options', opts);
      if (f.sons.checked !== S.actif()){ S.regler(f.sons.checked); majSon(); }
    }
    $('form-options').addEventListener('submit', function(ev){ ev.preventDefault(); lireForm(ev.target); fermerPanneau(); if (surAccueil()) majAccueil(); });
    Array.prototype.forEach.call($('form-options').querySelectorAll('input[name="regles"]'), function(r){
      r.addEventListener('change', function(){ $('form-options').dataset.regles = r.value; });
    });
    $('b-voir-regles').addEventListener('click', function(){ lireForm($('form-options')); ouvrirRegles(ouvrirOptions); });
  }

  function majSon(){
    var bs = $('b-son'), on = S.actif();
    if (!bs) return;
    bs.setAttribute('aria-pressed', on ? 'true' : 'false');
    bs.title = on ? 'Couper les sons' : 'Remettre les sons';
    bs.classList.toggle('muet', !on);
  }
  function ouvrirRegles(retour){
    if (reglesFleches()) return ouvrirReglesFleches(null, retour);
    ouvrirPanneau('<h2 id="titre-dialogue">Comment jouer</h2>' +
      '<ol class="regles">' +
        '<li>À chaque partie, on tire au sort <b>le lieu</b> (l’hémicycle, la buvette de l’Assemblée, la place de la République, le Trocadéro, les cuisines du Sénat, l’Élysée ou un plateau télé) et, à pile ou face, <b>qui commence</b>. Le plateau compte <b>16 places</b>, dont 4 à 7 <b>bloquées par le décor</b> (banc du gouvernement, camion-sono, chariot de fromages…), placées au hasard. En version classique&nbsp;: 9 places, sans obstacle.</li>' +
        '<li>Chacun reçoit <b>5 cartes candidat</b>, avec le même total de points à 2 près. En <b>Carrière</b>, tu joues les cartes de ton deck&nbsp;: une victoire te fait prendre une carte de l’IA, une défaite lui en cède une, tirée au sort parmi les cinq jouées (ton deck garde toujours 5 cartes au moins&nbsp;: à ce plancher, une carte moyenne se recase chez toi en échange).</li>' +
        '<li>À ton tour, <b>glisse une carte sur un siège libre</b> (ou touche la carte, puis le siège). Chaque côté qui touche une carte de l’IA se compare au côté d’en face&nbsp;: <b>si ton chiffre est plus fort, la carte passe dans ton camp</b>. Un banc ne prend rien et ne se prend pas.</li>' +
        '<li>Les quatre chiffres d’une carte viennent de faits publics&nbsp;:<ul class="regles-cotes">' +
          '<li>↑<i class="pi">' + R.PICTOS[0] + '</i><b>Urnes</b>&nbsp;: son meilleur score en voix à une élection&nbsp;;</li>' +
          '<li>→<i class="pi">' + R.PICTOS[1] + '</i><b>Expérience</b>&nbsp;: ses années de mandat national&nbsp;;</li>' +
          '<li>↓<i class="pi">' + R.PICTOS[2] + '</i><b>Terrain</b>&nbsp;: ses années d’élu local&nbsp;;</li>' +
          '<li>←<i class="pi">' + R.PICTOS[3] + '</i><b>Buzz</b>&nbsp;: combien de fois on consulte sa page Wikipédia.</li></ul>' +
          'Sur chaque fait, on classe les ' + CAND.length + ' candidats&nbsp;: <b>le premier a 10, le dernier 1</b>, les autres entre les deux (<button type="button" class="lien-inline" data-calcul>la règle de calcul</button>). Les étoiles ★ comptent les présidentielles déjà disputées, sans effet sur le jeu.</li>' +
        '<li><b>À peu près d’accord</b>&nbsp;: si ta carte égale, à 1 près, les côtés de deux voisines ou plus, les cartes de l’IA parmi elles passent chez toi. <b>Coalition</b>&nbsp;: même chose quand deux voisines ou plus font la même somme avec ta carte. Les cartes prises ainsi déclenchent un <b>effet domino</b>.</li>' +
        '<li><b>Diagonales</b>&nbsp;: deux cartes posées en diagonale s’affrontent aussi, coin contre coin. Un coin vaut la somme des deux côtés qui le forment&nbsp;: le coin ↗ = ↑&nbsp;Urnes + →&nbsp;Expérience, face au coin ↙ = ↓&nbsp;Terrain + ←&nbsp;Buzz de la voisine. À peu près d’accord et Coalition ne jouent que sur les côtés.</li>' +
        '<li><b>Qui commence&nbsp;?</b> Poser en dernier est un gros avantage, alors le jeu compense. Celui qui commence pose ses 5 cartes et a le dernier mot&nbsp;; l’autre en pose 4 et <b>garde la cinquième en main</b>&nbsp;: elle compte pour lui. Sur le grand plateau, il a en plus un <b>droit de réponse</b>&nbsp;: sa première carte est indéboulonnable. Sur le plateau classique, celui qui commence touche une <b>prime d’ouverture</b>&nbsp;: sa première carte gagne +1 partout.</li>' +
        '<li><b>Carte action</b>&nbsp;: une chacun, à jouer à ton tour, avant de poser. Elle reste cachée chez l’IA jusqu’à ce qu’elle la joue.</li>' +
        '<li>Après 9 cartes posées, chaque carte de ta couleur compte, sur le plateau comme en main&nbsp;: <b>6 sur 10, c’est la majorité absolue</b>.</li>' +
      '</ol>' +
      '<p class="aide">Tes cartes&nbsp;: fond surligneur. Celles de l’IA&nbsp;: fond nuit. Le liseré du haut donne le bloc politique.</p>' +
      '<div class="pied">' + (typeof retour === 'function' ? '<button type="button" class="bouton-sec" id="b-retour-regles">Retour</button>' : '') + '<button type="button" class="bouton" data-fermer>Compris</button></div>');
    var b = $('b-retour-regles');
    if (b) b.addEventListener('click', retour);
  }

  /* ---------- Nouvelle partie, primaire, fin ---------- */
  function demarrer(mainJ, mainIA, pioche, premier){
    libererPerchoir();
    quitterTuto();
    ui.partie++;
    arreterFete();
    repeindre();
    var acts = melanger(suite16(ACT.length)), fl = ui.variante === 'fleches', grand = fl || opts.plateau === 'grand';
    // Carrière : ta carte action vient de ta collection (aussi au second tour)
    var forc = ui.actsCarriere || null; ui.actsCarriere = null;
    if (!forc && ui.carriere){ forc = tirerActionsCarriere(classeur()); ui.carriere.actIA = opts.actions ? forc[1] : -1; }
    if (forc) acts = forc;
    if (!ui.lieu){ ui.lieu = LIEUX[0]; appliquerLieu(); }
    ui.bancs = grand ? tirerBancs(fl ? 3 + ((Math.random() * 3) | 0) : null) : {};   // Flèches : de 3 à 5 places bloquées (au-delà, l'avantage du premier joueur varie trop : campagne d'équilibrage)
    ui.s = fl ? M.nouvelle({ mainJ: mainJ, mainIA: mainIA, pioche: pioche, premier: premier, taille: 4, bancs: Object.keys(ui.bancs).map(Number), actJ: opts.actions ? acts[0] : -1, actIA: opts.actions ? acts[1] : -1, fleches: true, alea: Math.random, ordre: true }) :
      M.nouvelle({ mainJ: mainJ, mainIA: mainIA, pioche: pioche, premier: premier, taille: grand ? 4 : 3, bancs: Object.keys(ui.bancs).map(Number),
      actJ: opts.actions ? acts[0] : -1, actIA: opts.actions ? acts[1] : -1, proche: opts.proche, coalition: opts.coalition, diagonales: opts.diagonales, ordre: true });
    ui.tr = suiviNeuf(); ui.tr.avaitAction = ui.s.act[J] >= 0;
    $('leg-coins').hidden = fl || !opts.diagonales;
    document.querySelector('#vue-jeu .arene').classList.toggle('en-fleches', fl);
    ui.sel = -1; ui.mode = null; ui.revelees = {}; ui.derniereAction = [-1, -1]; ui.annulee = [-1, -1]; ui.premier = premier;
    reinitAnecdotes();
    majNomsAdversaire();
    $('journal').innerHTML = '';
    if (ui.local) ui.local.rev = [{}, {}];
    if (ui.local && ui.local.match) noter('<b>Manche ' + ui.local.match.manche + '</b> du match&nbsp;: ' + echapper(ui.local.noms[0]) + ' ' + ui.local.match.victoires[0] + ' · ' + ui.local.match.victoires[1] + ' ' + echapper(ui.local.noms[1]) + ' (le premier à 3 victoires).');
    noter(ui.local ? 'Pile ou face&nbsp;: <b>' + echapper(ui.local.noms[premier === J ? 0 : 1]) + ' commence</b>.' : premier === J ? 'Pile ou face&nbsp;: <b>tu commences</b>.' : 'Pile ou face&nbsp;: <b>l’IA commence</b>.');
    var nb = Object.keys(ui.bancs).length;
    noter('Lieu&nbsp;: <b>' + ui.lieu.nom + '</b>' + (grand ? ', ' + nb + ' places bloquées cette fois-ci, ' + ui.s.vides + ' libres.' : '.'));
    rendreTout();
    suite();
  }

  function grandPlateau(){ return regle('plateau') === 'grand'; }
  // Tirage au sort mis en scène : le lieu s'annonce, puis la pièce dit qui ouvre la séance
  async function tirageAuSort(premier){
    var el = $('tirage'), piece = $('piece'), res = $('tirage-resultat');
    if (!el || !piece) return;
    $('tirage-lieu').innerHTML = PIN + ui.lieu.nom;
    $('tirage-sous').textContent = ui.lieu.sous;
    res.textContent = '';
    if ($('tirage-regle')) $('tirage-regle').textContent = '';
    piece.classList.remove('lance', 'pose-ia');
    piece.style.setProperty('--fin', premier === J ? '1800deg' : '1980deg');
    el.hidden = false;
    S.jouer(ui.lieu.id);
    await attendre(700);
    void piece.offsetWidth;   // relance l'animation d'une partie à l'autre
    if (reduit){ if (premier === IA) piece.classList.add('pose-ia'); }
    else piece.classList.add('lance');
    S.jouer('piece');
    await attendre(1250);
    res.textContent = ui.local ? ui.local.noms[premier === J ? ui.local.vue : 1 - ui.local.vue] + ' commence !' : premier === J ? 'Tu commences !' : adv(true) + ' commence !';
    var ligne = $('tirage-regle');
    if (ligne) ligne.textContent = grandPlateau()
      ? (premier === J ? adv(true) + ' garde sa dernière carte en main, et sa première carte sera indéboulonnable.' : 'Tu gardes ta dernière carte en main, et ta première carte sera indéboulonnable.')
      : (premier === J ? 'Prime d’ouverture : ta première carte gagne +1 partout.' : 'Prime d’ouverture : sa première carte gagne +1 partout.');
    S.jouer('tirage');
    await attendre(2400);
    el.hidden = true;
  }

  async function nouvellePartie(){
    var ids = melanger(suite16(CAND.length)), premier = Math.random() < 0.5 ? J : IA;
    if (ui.local){ retirerPasseMain(); ui.local.vue = 0; appliquerVueLocale(); }
    quitterTuto();
    ui.partie++;
    arreterFete();
    afficherJeu();
    ui.occupe = true; ui.sel = -1; ui.mode = null; ui.carriere = null;
    if (ui.s) marquer();
    ui.lieu = choisirLieu();
    appliquerLieu();
    perchoir('Tirage au sort…');
    await tirageAuSort(premier);
    if (opts.distribution === 'primaire') return primaire(ids.slice(0, 10), ids.slice(10), premier);
    if (opts.distribution === 'carriere') return composerMain(premier);
    if (ui.variante === 'fleches' && opts.distribution === 'equilibre'){   // mains de même cote (voir moteur : coteFleches)
      var df = M.donneFleches(Math.random);
      demarrer(df[0], df[1], df[2], premier);
      noter('Donne équilibrée&nbsp;: ' + total(df[0]) + ' points de cote en main pour toi, ' + total(df[1]) + ' pour l’IA.');
      return;
    }
    if (opts.distribution === 'equilibre'){
      var d = donneEquilibree();
      demarrer(d[0], d[1], d[2], premier);
      noter('Donne équilibrée&nbsp;: ' + total(d[0]) + ' points en main pour toi, ' + total(d[1]) + ' pour l’IA.');
      return;
    }
    demarrer(ids.slice(0, 5), ids.slice(5, 10), ids.slice(10), premier);
  }

  // Dix cartes au hasard, coupées en deux mains de même total (à 2 points près). Les chiffres des cartes ne changent pas.
  function total(main){ return main.reduce(function(a, c){ return a + cote(c); }, 0); }
  function donneEquilibree(){
    for (var essai = 0; ; essai++){
      var ids = melanger(suite16(CAND.length)), dix = ids.slice(0, 10), T = total(dix), best = [], bd = Infinity, m, k;
      for (m = 1; m < 1024; m += 2){
        var n = 0, sx = 0;
        for (k = 0; k < 10; k++) if (m >> k & 1){ n++; sx += force(dix[k]); }   // donne classique : toujours la somme des chiffres
        if (n !== 5) continue;
        var d = Math.abs(2 * sx - T);
        if (d < bd){ bd = d; best = [m]; } else if (d === bd) best.push(m);
      }
      if (bd > 2 && essai < 40) continue;
      var choix = best[(Math.random() * best.length) | 0], a = [], b = [];
      for (k = 0; k < 10; k++) (choix >> k & 1 ? a : b).push(dix[k]);
      return Math.random() < 0.5 ? [a, b, ids.slice(10)] : [b, a, ids.slice(10)];
    }
  }

  function force(c){ var v = CAND[c].valeurs; return v[0] + v[1] + v[2] + v[3]; }
  // Ce que pèse une carte dans une main : la somme de ses chiffres en classique, sa cote en Flèches (flèches, Attaque, Défense)
  function cote(c){ return reglesFleches() ? M.coteFleches(c) : force(c); }

  /* ---------- Carrière : un classeur de cartes à compléter, gardé dans ce navigateur ----------
     Départ : 8 cartes tirées au sort parmi les cartes moyennes. Avant chaque partie, on choisit 5 cartes du classeur.
     Victoire : on prend une carte de la main de l'IA, au choix. Défaite : l'IA en prend une, tirée au sort parmi
     les cinq jouées, sans jamais faire descendre le classeur sous 5 cartes. Ballottage : rien ne bouge.
     Les cartes sont rangées par leur nom de fichier, qui ne change pas quand on ajoute des candidats. */
  var CLE_CLASSEUR = 'hemicycle-classeur', MIN_CLASSEUR = 5, DEPART_CLASSEUR = 8;
  var ECART_NIVEAU = { mairie: -6, assemblee: 0, elysee: 6 };   // main de l'IA par rapport à la tienne, en points
  function slugDe(i){ var m = CAND[i].mini.match(/([^\/]+)\.webp$/); return m ? m[1] : String(i); }
  var PAR_SLUG = {};
  CAND.forEach(function(c, i){ PAR_SLUG[slugDe(i)] = i; });
  /* Cartes action de Carrière : on en reçoit DEPART_ACTIONS au départ, on gagne celle de l'IA en la battant, et on ne les perd jamais.
     En partie, la sienne reste tirée au hasard, mais parmi celles de sa collection. */
  var DEPART_ACTIONS = 5, PREFERE_NEUVE = 0.7;
  function slugAct(a){ var m = ACT[a].image.match(/([^\/]+?)(-couleur)?\.webp$/); return m ? m[1] : String(a); }
  var PAR_SLUG_ACT = {};
  ACT.forEach(function(c, a){ PAR_SLUG_ACT[slugAct(a)] = a; });
  function aAction(cl, a){ return (cl.actions || []).indexOf(slugAct(a)) >= 0; }
  function actionsDu(cl){ return suite16(ACT.length).filter(function(a){ return aAction(cl, a); }); }
  // [la tienne, celle de l'IA] : l'IA joue de préférence une carte que tu n'as pas encore, pour que la collection avance
  function tirerActionsCarriere(cl){
    var mes = actionsDu(cl);
    if (!mes.length) mes = suite16(ACT.length);
    var aj = mes[(Math.random() * mes.length) | 0];
    var neuves = suite16(ACT.length).filter(function(a){ return a !== aj && !aAction(cl, a); }), autres = suite16(ACT.length).filter(function(a){ return a !== aj; });
    var pool = neuves.length && Math.random() < PREFERE_NEUVE ? neuves : autres;
    return [aj, pool[(Math.random() * pool.length) | 0]];
  }
  // Victoire : la carte action de l'IA rejoint ta collection, si tu ne l'avais pas
  function gagnerAction(a){
    if (a == null || a < 0) return null;
    var cl = classeur();
    if (aAction(cl, a)) return null;
    cl.actions.push(slugAct(a)); sauverClasseur(cl);
    return { action: a, n: cl.actions.length };
  }
  function htmlGainAction(g){
    return '<div class="perte gain-action">' + htmlAction(g.action) + '<p><b>Nouvelle carte action&nbsp;!</b> ' + ACT[g.action].nom + ' (' + ACT[g.action].code + ') rejoint ta collection&nbsp;: ' + g.n + ' sur ' + ACT.length + '. Elle ne se perd jamais.</p></div>';
  }
  // Le deck de départ : des cartes moyennes, ni les plus faibles (trop dur) ni les plus fortes (rien à gagner)
  function cartesDeDepart(){
    var t = suite16(CAND.length).sort(function(a, b){ return cote(a) - cote(b); });
    return t.slice(Math.round(t.length * 0.25), Math.round(t.length * 0.8));
  }

  // Lit le classeur ; le crée (ou le complète, si des cartes ont disparu du jeu) au besoin
  function classeur(creer){
    var b = brut(CLE_CLASSEUR), cl = { v: 1, cartes: [], main: [], gains: 0, pertes: 0, neuf: false };
    if (b && Array.isArray(b.cartes)){
      cl.cartes = b.cartes.filter(function(s, k, t){ return s in PAR_SLUG && t.indexOf(s) === k; });
      cl.main = (b.main || []).filter(function(s){ return cl.cartes.indexOf(s) >= 0; });
      cl.gains = b.gains || 0; cl.pertes = b.pertes || 0; cl.neuf = !!b.neuf; cl.manches = b.manches || 0;
      cl.album = (Array.isArray(b.album) ? b.album : []).filter(function(s, k, t){ return s in PAR_SLUG && t.indexOf(s) === k; });
      cl.actions = (Array.isArray(b.actions) ? b.actions : []).filter(function(s, k, t){ return s in PAR_SLUG_ACT && t.indexOf(s) === k; });
    }
    if (!cl.actions) cl.actions = [];
    cl.album = unionAlbum(cl.album || [], cl.cartes);
    if (!creer) return cl;
    var vide = !cl.cartes.length, but = vide ? DEPART_CLASSEUR : MIN_CLASSEUR;
    if (cl.cartes.length < but){
      melanger(cartesDeDepart()).forEach(function(i){ var s = slugDe(i); if (cl.cartes.length < but && cl.cartes.indexOf(s) < 0) cl.cartes.push(s); });
      if (vide) cl.neuf = true;
      sauverClasseur(cl);
    }
    if (cl.actions.length < DEPART_ACTIONS){   // nouveau départ, ou Carrière commencée avant l'arrivée des cartes action
      melanger(suite16(ACT.length)).forEach(function(a){ var s = slugAct(a); if (cl.actions.length < DEPART_ACTIONS && cl.actions.indexOf(s) < 0) cl.actions.push(s); });
      sauverClasseur(cl);
    }
    return cl;
  }
  // L'album garde toutes les cartes gagnées une fois (même perdues ensuite) : c'est lui qui compte pour la collection complète
  function unionAlbum(a, b){ var r = a.slice(); b.forEach(function(s){ if (r.indexOf(s) < 0) r.push(s); }); return r; }
  function sauverClasseur(cl){ cl.album = unionAlbum(cl.album || [], cl.cartes); ecrire(CLE_CLASSEUR, cl); if (TR) TR.album(cl.album.length); }
  // Première manche de Carrière (aucune victoire ni défaite encore) : l'IA joue au niveau Mairie
  function premiereManche(cl){ return !(cl.manches || cl.gains || cl.pertes); }
  /* La Carrière s'ouvre après le tutoriel et trois parties libres, pour ne pas perdre ses cartes avant de connaître les règles.
     Une fois ouverte, elle le reste. Déjà ouverte pour qui a commencé une Carrière ; un lien « Je connais les règles » l'ouvre tout de suite. */
  var CLE_LIBRES = 'hemicycle-libres', CLE_CARRIERE = 'hemicycle-carriere-ouverte', LIBRES_REQUISES = 3;
  function tutoFait(){ return !!((brut(CLE_TUTO) || {}).fait || (brut('hemicycle-tuto-fleches') || {}).fait); }
  function partiesLibres(){ return +(brut(CLE_LIBRES) || 0) || 0; }
  function carriereOuverte(){
    if (brut(CLE_CARRIERE)) return true;
    if (classeur().cartes.length || (tutoFait() && partiesLibres() >= LIBRES_REQUISES)){ ecrire(CLE_CARRIERE, 1); return true; }
    return false;
  }
  function texteVerrou(){
    var l = Math.min(partiesLibres(), LIBRES_REQUISES);
    return 'S’ouvre après le tutoriel et ' + LIBRES_REQUISES + ' parties libres. Tutoriel&nbsp;: ' + (tutoFait() ? 'fait' : 'à faire') + ' · parties libres&nbsp;: ' + l + ' sur ' + LIBRES_REQUISES + '.';
  }
  function aCarte(cl, i){ return cl.cartes.indexOf(slugDe(i)) >= 0; }
  function dansAlbum(cl, i){ return (cl.album || []).indexOf(slugDe(i)) >= 0; }
  function libelleAlbum(cl){ var n = (cl.album || []).length, m = CAND.length - n; return 'Album&nbsp;: ' + n + '/' + CAND.length + (m ? ' · il t’en manque ' + m : ' · complet&nbsp;!'); }
  function cartesDu(cl){ return suite16(CAND.length).filter(function(i){ return aCarte(cl, i); }); }
  function meilleureMain(cl){ return cartesDu(cl).sort(function(a, b){ return cote(b) - cote(a); }).slice(0, 5); }
  // La main de l'IA : un total proche du tien, décalé selon le niveau, et uniquement des cartes que tu n'as pas (tant qu'il en reste)
  function mainIACarriere(mainJ, cl){
    var cible = total(mainJ) + Math.round((ECART_NIVEAU[premiereManche(cl) ? 'mairie' : opts.niveau] || 0) * (reglesFleches() ? 2.3 : 1));   // la cote des Flèches court sur une échelle 2,3 fois plus large
    var reste = suite16(CAND.length).filter(function(i){ return mainJ.indexOf(i) < 0; });
    // L'IA met d'abord en jeu les cartes jamais gagnées, puis celles que tu as perdues, puis les tiennes
    var jamais = reste.filter(function(i){ return !dansAlbum(cl, i); }), perdues = reste.filter(function(i){ return dansAlbum(cl, i) && !aCarte(cl, i); }), deja = reste.filter(function(i){ return aCarte(cl, i); });
    var mieux = null, score = Infinity;
    for (var essai = 0; essai < 800 && score > 1; essai++){
      var m = jamais.length >= 5 ? melanger(jamais.slice()).slice(0, 5) : jamais.concat(melanger(perdues.slice()).slice(0, 5 - jamais.length));
      if (m.length < 5) m = m.concat(melanger(deja.slice()).slice(0, 5 - m.length));
      var sc = Math.abs(total(m) - cible);
      if (sc < score){ score = sc; mieux = m; }
    }
    return mieux;
  }

  function libelleClasseur(n){ return n + ' carte' + (n > 1 ? 's' : '') + ' sur ' + CAND.length; }

  // Avant la partie : choisir ses cinq cartes
  function composerMain(premier){
    var cl = classeur(true), mes = cartesDu(cl), neuf = cl.neuf;
    var choisies = cl.main.map(function(s){ return PAR_SLUG[s]; });
    if (choisies.length !== 5) choisies = meilleureMain(cl);
    var avis = '';
    ui.occupe = true;
    function rendre(focus){
      var n = choisies.length;
      $('dialogue').innerHTML = '<h2 id="titre-dialogue">Ta main</h2>' +
        (neuf ? '<p class="aide fort">Ton deck de départ&nbsp;: ' + DEPART_CLASSEUR + ' cartes tirées au sort parmi les cartes moyennes. À toi de le compléter&nbsp;!</p>' : '') +
        '<p class="aide' + (avis ? ' fort' : '') + '" aria-live="polite">' + (avis || 'Choisis 5 cartes dans ton deck (' + libelleClasseur(mes.length) + ', <a href="#album">album ' + cl.album.length + '/' + CAND.length + '</a>)&nbsp;: ' + n + '/5.') + '</p>' +
        '<div class="vivier">' + mes.map(function(c){
          var on = choisies.indexOf(c) >= 0;
          return '<button type="button" class="choix-carte' + (on ? ' pris' : '') + '" data-c="' + c + '" aria-pressed="' + on + '" aria-label="' + etiquette(c, CAND[c].valeurs) + '">' + htmlMini(c, { own: on ? J : undefined }) + '</button>';
        }).join('') + '</div>' +
        (opts.actions ? '<p class="aide">Ta carte action sera tirée au hasard parmi tes ' + cl.actions.length + ' cartes action (sur ' + ACT.length + '). Bats l’IA pour gagner la sienne.</p>' : '') +
        '<p class="aide">Victoire&nbsp;: tu prends une carte de l’IA. Défaite&nbsp;: l’IA t’en prend une, tirée au sort parmi ces cinq' +
          (mes.length <= MIN_CLASSEUR ? ' (deck au plancher&nbsp;: une carte moyenne se recase alors chez toi)' : '') + '. Main de l’IA&nbsp;: ' +
          (opts.niveau === 'mairie' ? 'un peu moins forte que la tienne' : opts.niveau === 'elysee' ? 'un peu plus forte que la tienne' : 'de même force que la tienne') + ' (niveau ' + NIVEAUX[opts.niveau] + ').</p>' +
        '<div class="pied"><button type="button" class="bouton-sec" id="b-main-retour">Retour</button><button type="button" class="bouton-sec" id="b-plus-fortes">Les plus fortes</button><button type="button" class="bouton" id="b-go-carriere"' + (n === 5 ? '' : ' disabled') + '>À l’hémicycle&nbsp;!</button></div>';
      Array.prototype.forEach.call($('dialogue').querySelectorAll('.vivier [data-c]'), function(b){
        b.addEventListener('click', function(){
          var c = +b.dataset.c, k = choisies.indexOf(c);
          avis = '';
          if (k >= 0) choisies.splice(k, 1);
          else if (choisies.length < 5) choisies.push(c);
          else avis = 'Déjà 5 cartes&nbsp;: retire d’abord une carte de ta main.';
          S.jouer('clic'); rendre(c);
        });
      });
      $('b-plus-fortes').addEventListener('click', function(){ choisies = meilleureMain(cl); avis = ''; S.jouer('clic'); rendre(); });
      $('b-main-retour').addEventListener('click', function(){ ui.occupe = false; afficherAccueil(); });
      $('b-go-carriere').addEventListener('click', function(){ lancerCarriere(choisies.slice(), premier); });
      var f = focus != null ? $('dialogue').querySelector('.vivier [data-c="' + focus + '"]') : null;
      (f || $('b-go-carriere')).focus();
    }
    ouvrirPanneau('');
    rendre();
  }
  function lancerCarriere(mainJ, premier){
    var cl = classeur(true);
    cl.main = mainJ.map(slugDe); cl.neuf = false; sauverClasseur(cl);
    var mainIA = mainIACarriere(mainJ, cl), dans = {};
    mainJ.concat(mainIA).forEach(function(c){ dans[c] = true; });
    var pioche = melanger(suite16(CAND.length).filter(function(c){ return !dans[c]; }));
    var facile = premiereManche(cl), acts = tirerActionsCarriere(cl);
    fermerPanneau();
    ui.actsCarriere = acts;
    demarrer(mainJ.slice(), mainIA.slice(), pioche, premier);
    ui.carriere = { mainJ: mainJ.slice(), mainIA: mainIA.slice(), facile: facile, actIA: opts.actions ? acts[1] : -1 };
    majNomsAdversaire();
    if (facile) noter('Première manche de Carrière&nbsp;: l’IA joue au niveau <b>Mairie</b>, pour te laisser prendre tes marques.');
    noter('Carrière&nbsp;: ' + total(mainJ) + ' points' + (reglesFleches() ? ' de cote' : '') + ' en main pour toi, ' + total(mainIA) + ' pour l’IA.');
  }
  // Défaite : une des cinq cartes jouées part chez l'IA, au hasard (jamais sous le minimum)
  function perdreCarte(mainJ){
    var cl = classeur();
    var jouees = mainJ.filter(function(c){ return aCarte(cl, c); });
    if (!jouees.length) return { rien: true };
    var c = jouees[(Math.random() * jouees.length) | 0], s = slugDe(c), recase = -1;
    // Au plancher (5 cartes) : l'IA prend quand même une carte, mais une carte moyenne « se recase » chez toi (le deck change sans rétrécir)
    if (cl.cartes.length <= MIN_CLASSEUR){
      var libres = cartesDeDepart().filter(function(i){ return i !== c && !aCarte(cl, i); });
      if (!libres.length) return { rien: true };
      recase = libres[(Math.random() * libres.length) | 0];
    }
    cl.cartes = cl.cartes.filter(function(x){ return x !== s; });
    cl.main = cl.main.filter(function(x){ return x !== s; });
    if (recase >= 0) cl.cartes.push(slugDe(recase));
    cl.pertes++; sauverClasseur(cl);
    if (TR) TR.deck(cl.cartes.length);
    return { carte: c, recase: recase, reste: cl.cartes.length };
  }
  function htmlPerte(p){
    if (p.rien) return '<p class="aide">Ton deck n’a que ' + MIN_CLASSEUR + ' cartes&nbsp;: l’IA ne te prend rien cette fois.</p>';
    return '<div class="perte"><span class="carte-perdue">' + htmlMini(p.carte, { own: J }) + '</span><p>L’IA te prend <b>' + CAND[p.carte].nom + '</b>, tirée au sort parmi tes cinq cartes. Ton deck&nbsp;: ' + libelleClasseur(p.reste) + '.</p></div>' +
      (p.recase >= 0 ? '<div class="perte recase"><span class="carte-perdue">' + htmlMini(p.recase, { own: J }) + '</span><p><b>Recasage&nbsp;!</b> Ton deck est au plancher&nbsp;: <b>' + CAND[p.recase].nom + '</b> se recase chez toi. En politique, on ne reste jamais longtemps sans poste.</p></div>' : '');
  }
  // Victoire : choisir une carte dans la main de départ de l'IA
  function htmlPrise(cartes){
    var cl = classeur();
    if (!cartes.some(function(c){ return !aCarte(cl, c); }))
      return '<p class="aide">Toutes les cartes de l’IA sont déjà dans ton deck&nbsp;: pas de prise cette fois.</p>';
    return '<p class="prise-titre">Ta prise&nbsp;: choisis une carte de l’IA</p><p class="aide prise-album">' + libelleAlbum(cl) + '</p><div class="vivier prise" id="vivier-prise">' + cartes.map(function(c){
      var deja = aCarte(cl, c), neuve = !dansAlbum(cl, c), etat = deja ? 'Déjà à toi' : neuve ? 'Nouvelle' : 'À reprendre';
      return '<button type="button" class="choix-carte' + (deja ? ' deja' : neuve ? ' neuve' : ' reprise') + '" data-prise="' + c + '"' + (deja ? ' disabled' : '') + ' aria-label="' + etiquette(c, CAND[c].valeurs) + ', ' + etat.toLowerCase() + '">' +
        htmlMini(c, { own: IA }) + '<span class="' + (deja ? 'deja-lib' : 'etat-lib') + '" aria-hidden="true">' + etat + '</span></button>';
    }).join('') + '</div><p class="aide fort" id="prise-msg" aria-live="polite"></p>';
  }
  function brancherPrise(){
    var boutons = $('dialogue').querySelectorAll('[data-prise]:not([disabled])');
    if (!boutons.length) return;
    var pied = $('dialogue').querySelectorAll('.pied button');
    Array.prototype.forEach.call(pied, function(b){ b.disabled = true; });
    Array.prototype.forEach.call(boutons, function(b){
      b.addEventListener('click', function(){
        var c = +b.dataset.prise, cl = classeur();
        if (!aCarte(cl, c)){ cl.cartes.push(slugDe(c)); cl.gains++; sauverClasseur(cl); }
        if (TR){ TR.marquer('prise'); TR.deck(cl.cartes.length); annoncerTrophees(700); }
        S.jouer('coalition');
        b.classList.add('pris');
        $('vivier-prise').classList.add('choisie');
        Array.prototype.forEach.call($('dialogue').querySelectorAll('[data-prise]'), function(x){ x.disabled = true; });
        $('prise-msg').innerHTML = 'La carte ' + CAND[c].nom + ' rejoint ton deck&nbsp;: ' + libelleClasseur(cl.cartes.length) + '.';
        Array.prototype.forEach.call(pied, function(x){ x.disabled = false; });
        var rv = $('b-revanche'); if (rv) rv.focus();
      });
    });
    boutons[0].focus();
  }
  // L'album : toutes les cartes du jeu, en couleur celles du classeur
  function ouvrirClasseur(retour){
    var cl = classeur(), n = cl.cartes.length, arme = false;
    ouvrirPanneau('<h2 id="titre-dialogue">Mon deck</h2>' +
      (n ? '<p class="aide fort" id="classeur-compte">' + libelleClasseur(n) + '.</p>' : '<p class="aide fort" id="classeur-compte">Pas encore commencé&nbsp;: ta première partie en Carrière te donnera ' + DEPART_CLASSEUR + ' cartes.</p>') +
      '<p class="aide">En Carrière, chaque victoire te fait prendre une carte de l’IA, chaque défaite lui en cède une, tirée au sort parmi les cinq que tu as jouées. Ton deck garde toujours au moins ' + MIN_CLASSEUR + ' cartes&nbsp;: à ce plancher, une carte moyenne se recase chez toi à chaque défaite.</p>' +
      '<div class="classeur">' + CAND.map(function(c, i){
        var a = aCarte(cl, i);
        return '<span class="case-classeur" role="img" aria-label="' + (a ? etiquette(i, c.valeurs) : c.nom + ', pas encore dans ton deck') + '">' + htmlMini(i, { cls: a ? '' : 'absente' }) + '</span>';
      }).join('') + '</div>' +
      '<h3 class="titre-actions" id="actions-compte">Mes cartes action' + (cl.actions.length ? '&nbsp;: ' + cl.actions.length + ' sur ' + ACT.length : '') + '</h3>' +
      '<p class="aide">' + (cl.actions.length ? 'En Carrière, ta carte action est tirée au hasard parmi celles-ci. ' : 'Ta première partie en Carrière t’en donnera ' + DEPART_ACTIONS + '. ') +
        'Bats l’IA pour gagner la sienne. Une carte action ne se perd jamais.</p>' +
      '<div class="classeur classeur-actions">' + ACT.map(function(c, a){
        var on = aAction(cl, a);
        return '<span class="case-classeur' + (on ? '' : ' absente') + '" role="img" aria-label="Carte action ' + c.code + ', ' + c.nom + (on ? '' : ', pas encore dans ta collection') + '">' + htmlAction(a) + '</span>';
      }).join('') + '</div>' +
      '<div class="pied">' + (n ? '<button type="button" class="bouton-sec" id="b-raz-classeur">Recommencer à zéro</button>' : '') +
        '<button type="button" class="bouton" data-fermer>Retour</button></div>');
    var z = $('b-raz-classeur');
    if (z) z.addEventListener('click', function(){
      if (!arme){ arme = true; z.textContent = 'Sûr ? Tout le deck repart'; return; }
      try { localStorage.removeItem(CLE_CLASSEUR); } catch (e){}
      classeur(true);
      ouvrirClasseur(retour);
      $('classeur-compte').textContent = 'Nouveau départ : ' + DEPART_CLASSEUR + ' cartes tirées au sort parmi les cartes moyennes, et ' + DEPART_ACTIONS + ' cartes action.';
    });
  }

  function primaire(vivier, pioche, premier){
    var mains = [[], []], tour = 1 - premier; // celui qui joue en second choisit en premier
    ui.occupe = true;
    function choixIA(){
      var reste = vivier.filter(function(c){ return mains[0].indexOf(c) < 0 && mains[1].indexOf(c) < 0; });
      reste.sort(function(a, b){ return cote(b) - cote(a); });
      if (opts.niveau === 'mairie') return reste[(Math.random() * reste.length) | 0];
      return reste[opts.niveau === 'assemblee' && Math.random() < 0.3 ? Math.min(1, reste.length - 1) : 0];
    }
    function rendre(){
      var fini = mains[0].length === 5 && mains[1].length === 5;
      var h = '<h2 id="titre-dialogue">La primaire</h2><p class="aide fort" aria-live="polite">' +
        (fini ? 'Les listes sont bouclées.' : tour === J ? 'À toi de choisir (' + (mains[0].length + 1) + '/5).' : 'L’IA choisit…') + '</p>' +
        '<div class="vivier">' + vivier.map(function(c){
          var pris = mains[0].indexOf(c) >= 0 ? ' pris-j' : mains[1].indexOf(c) >= 0 ? ' pris-ia' : '';
          var dispo = !pris && tour === J && !fini;
          return '<button type="button" class="choix-carte' + pris + '" data-c="' + c + '"' + (dispo ? '' : ' disabled') + ' aria-label="' + etiquette(c, CAND[c].valeurs) + (pris ? (pris === ' pris-j' ? ', dans ta liste' : ', dans la liste de l’IA') : '') + '">' + htmlMini(c, { own: pris === ' pris-ia' ? IA : pris === ' pris-j' ? J : undefined }) + '</button>';
        }).join('') + '</div>' +
        '<p class="sous-titre">Ta liste&nbsp;: ' + (mains[0].map(function(c){ return CAND[c].court; }).join(', ') || '—') + '</p>' +
        '<p class="sous-titre">Liste de l’IA&nbsp;: ' + (mains[1].map(function(c){ return CAND[c].court; }).join(', ') || '—') + '</p>' +
        '<div class="pied"><button type="button" class="bouton" id="b-fin-primaire"' + (fini ? '' : ' disabled') + '>À l’hémicycle&nbsp;!</button></div>';
      $('dialogue').innerHTML = h;
      Array.prototype.forEach.call($('dialogue').querySelectorAll('.vivier [data-c]'), function(b){
        b.addEventListener('click', function(){ if (tour !== J) return; S.jouer('clic'); mains[0].push(+b.dataset.c); tour = IA; rendre(); avancer(); });
      });
      $('b-fin-primaire').addEventListener('click', function(){ fermerPanneau(); demarrer(mains[0], mains[1], melanger(pioche), premier); });
      var f = $('dialogue').querySelector('.vivier button:not([disabled])') || $('b-fin-primaire');
      if (f && !f.disabled) f.focus();
    }
    function avancer(){
      if (mains[0].length === 5 && mains[1].length === 5) return rendre();
      if (tour === IA){
        setTimeout(function(){ mains[1].push(choixIA()); S.jouer('clic'); tour = mains[0].length < 5 ? J : IA; rendre(); avancer(); }, reduit ? 80 : 650);
      } else if (mains[0].length >= 5){ tour = IA; avancer(); }
    }
    ouvrirPanneau('');
    rendre(); avancer();
  }

  /* ---------- La fête : les têtes du camp gagnant surgissent, chapeau pointu, langue de belle-mère et confettis ---------- */
  var COUL_FETE = ['#f1fb4e', '#ff5fa2', '#3fd0c9', '#ffae3b', '#9b6bff', '#f8f9f6', '#4aa8ff', '#ff6a3d'];
  var fete_ = { minuteurs: [], passer: null };
  function auPif(a, b){ return a + Math.random() * (b - a); }
  function couleurFete(sauf){ var c; do { c = COUL_FETE[(Math.random() * COUL_FETE.length) | 0]; } while (c === sauf); return c; }
  function apres(ms, f){ fete_.minuteurs.push(setTimeout(f, ms)); }
  // Chapeau pointu rayé, pompon en haut ; aucun identifiant SVG, il y en a plusieurs par page
  function chapeauSvg(c1, c2){
    function hw(y){ return (y - 6) / 58 * 25; }   // demi-largeur du cône à la hauteur y
    var bandes = [[17, 23], [31, 37], [45, 51]].map(function(b){
      var a = b[0], z = b[1];
      return '<path d="M' + (30 - hw(a + 4)).toFixed(1) + ' ' + (a + 4) + 'L' + (30 + hw(a - 2)).toFixed(1) + ' ' + (a - 2) + 'L' + (30 + hw(z - 2)).toFixed(1) + ' ' + (z - 2) + 'L' + (30 - hw(z + 4)).toFixed(1) + ' ' + (z + 4) + 'z" fill="' + c2 + '"/>';
    }).join('');
    var cone = 'M30 6L5 64Q30 71 55 64z';
    return '<path d="' + cone + '" fill="' + c1 + '"/>' + bandes + '<path d="' + cone + '" fill="none" stroke="#15171a" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path d="M30 6l-7-4M30 6l7-4M30 6V-3M30 6l-8 3M30 6l8 3" stroke="' + c2 + '" stroke-width="3.2" stroke-linecap="round"/>' +
      '<circle cx="30" cy="5" r="5" fill="#f8f9f6" stroke="#15171a" stroke-width="1.6"/>';
  }
  function confetto(canon){
    var w = auPif(7, 12), rond = Math.random() < 0.25;
    var st = '--c:' + couleurFete() + ';--w:' + w.toFixed(0) + 'px;--h:' + (rond ? w : auPif(10, 18)).toFixed(0) + 'px;--r:' + (rond ? '50%' : '2px') +
      ';--rot:' + auPif(-900, 900).toFixed(0) + 'deg;--rx:' + auPif(360, 1440).toFixed(0) + 'deg;';
    if (!canon) return '<i class="cf" style="' + st + '--x:' + auPif(0, 100).toFixed(1) + 'vw;--dx:' + auPif(-14, 14).toFixed(1) + 'vw;--d:' + auPif(2.6, 4.4).toFixed(2) + 's;--t:' + auPif(0, 1.5).toFixed(2) + 's"></i>';
    var g = canon === 'g', sens = g ? 1 : -1;
    return '<i class="cf canon" style="' + st + '--x:' + (g ? auPif(-2, 4) : auPif(96, 101)).toFixed(1) + 'vw;--px:' + (sens * auPif(8, 46)).toFixed(1) + 'vw;--py:' + (-auPif(45, 92)).toFixed(1) +
      'vh;--fx:' + (sens * auPif(14, 60)).toFixed(1) + 'vw;--d:' + auPif(2.4, 3.6).toFixed(2) + 's;--t:' + auPif(0, 0.18).toFixed(2) + 's"></i>';
  }
  function serpentin(){
    var d = 'M20 4c16 12-16 26 0 40s-16 28 0 42 16 28 0 42-16 26 0 38';
    return '<i class="sp" style="--x:' + auPif(4, 92).toFixed(1) + 'vw;--w:' + auPif(16, 26).toFixed(0) + 'px;--dx:' + auPif(-10, 10).toFixed(1) + 'vw;--rot:' + auPif(-160, 160).toFixed(0) +
      'deg;--rx:0deg;--d:' + auPif(3.2, 4.8).toFixed(2) + 's;--t:' + auPif(0, 1).toFixed(2) + 's"><svg viewBox="0 0 40 172" aria-hidden="true"><path d="' + d + '" fill="none" stroke="#15171a" stroke-width="7.5" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="' + couleurFete() + '" stroke-width="5" stroke-linecap="round"/></svg></i>';
  }
  // Les cartes d'un camp à la fin : celles du plateau à sa couleur, puis celles qui restent en main
  function campDe(s, qui){
    var t = [];
    for (var i = 0; i < s.N; i++) if (s.own[i] === qui) t.push(s.crd[i]);
    return t.concat(s.mains[qui] || []);
  }
  function teteHtml(c, k, n, ordre){
    var slug = (CAND[c].mini.match(/([^\/]+)\.webp$/) || [])[1];
    var p = (window.HemicycleTetes || {})[slug] || [50, 0, 50, 76, 66];   // chapeau x, y ; bouche x, y (en %)
    var c1 = couleurFete(), langue = '';
    if (n === 1 || k % 2 === 1){   // une tête sur deux souffle dans sa langue de belle-mère, vers l'extérieur
      langue = '<span class="langue ' + (k < (n - 1) / 2 ? 'g' : 'd') + '" style="left:' + p[2] + '%;top:' + p[3] + '%;--cl:' + couleurFete() + ';--rl:' + auPif(-20, -6).toFixed(0) + 'deg;--tl:' + auPif(1.05, 1.17).toFixed(2) + 's">' +
        '<i class="ruban"></i><i class="bout"></i><i class="bec"></i></span>';
    }
    return '<span class="tete" style="--t:' + (0.35 + ordre * 0.11).toFixed(2) + 's;--dd:' + auPif(0.3, 0.42).toFixed(2) + 's;--sw:' + auPif(3, 7).toFixed(1) + 'deg;z-index:' + (12 - 2 * Math.abs(k - (n - 1) / 2) | 0) + '">' +
      '<span class="tete-saute"><img src="' + CAND[c].mini + '" alt="" width="240" height="300" decoding="async">' + langue +
      '<svg class="chapeau" viewBox="0 -6 60 78" aria-hidden="true" style="left:' + p[0] + '%;top:' + p[1] + '%;--rh:' + auPif(-16, 16).toFixed(0) + 'deg">' + chapeauSvg(c1, couleurFete(c1)) + '</svg></span></span>';
  }
  // Seul le camp gagnant fait la fête : 'v' le tien, 'd' celui de l'IA (pas de fête en cas de ballottage)
  function fete(r){
    var f = $('fete'); if (!f || !ui.s) return;
    arreterFete();
    var cartes = melanger(campDe(ui.s, r === 'v' ? J : IA)), vu = {};
    cartes = cartes.filter(function(c){ return vu[c] ? false : (vu[c] = true); });
    var larg = window.innerWidth || 1000, etroit = larg < 520;
    cartes = cartes.slice(0, etroit ? 5 : larg < 900 ? 7 : 9);
    var n = cartes.length; if (!n) return;
    var l = Math.round(Math.max(66, Math.min(etroit ? 104 : 150, (larg - 16) / (n * 0.88))));
    // Du centre vers les bords
    var ordre = cartes.map(function(c, k){ return k; }).sort(function(x, y){ return Math.abs(x - (n - 1) / 2) - Math.abs(y - (n - 1) / 2); });
    var rang = {}; ordre.forEach(function(k, o){ rang[k] = o; });
    var h = '';
    if (!reduit){
      var i;
      for (i = 0; i < (etroit ? 46 : 80); i++) h += confetto(false);
      for (i = 0; i < (etroit ? 16 : 24); i++) h += confetto('g') + confetto('d');
      for (i = 0; i < (etroit ? 4 : 7); i++) h += serpentin();
    }
    h += '<div class="tetes" style="--l:' + l + 'px">' + cartes.map(function(c, k){ return teteHtml(c, k, n, rang[k]); }).join('') + '</div>';
    f.innerHTML = h; f.classList.remove('fin'); f.hidden = false;
    if (r === 'v') S.jouer('pop');
    ordre.forEach(function(k, o){ apres(Math.round((0.35 + o * 0.11) * 1000) + 230, function(){ S.jouer('hop', { rang: o }); }); });
    if (!reduit){
      apres(1380, function(){ S.jouer('cotillon', { f: 330 }); });
      apres(2980, function(){ S.jouer('cotillon', { f: 392 }); });
    }
  }
  function oublierPasser(){
    if (!fete_.passer) return;
    document.removeEventListener('pointerdown', fete_.passer, true);
    document.removeEventListener('keydown', fete_.passer, true);
    fete_.passer = null;
  }
  function arreterFete(){
    fete_.minuteurs.forEach(clearTimeout); fete_.minuteurs = []; oublierPasser();
    var f = $('fete'); if (f && !f.hidden){ f.hidden = true; f.innerHTML = ''; f.classList.remove('fin'); repeindre(); }
  }
  // Les têtes redescendent, les derniers confettis finissent de tomber derrière le bilan
  function congedierFete(){
    fete_.minuteurs.forEach(clearTimeout); fete_.minuteurs = []; oublierPasser();
    var f = $('fete'); if (!f || f.hidden) return;
    f.classList.add('fin');
    apres(reduit ? 0 : 2600, arreterFete);
  }

  function finPartie(){
    if (ui.tuto) return finTuto();
    if (ui.local && ui.local.vue === 1) basculerVue();   // le bilan se lit du côté du joueur 1
    var LO = ui.local;
    var s = ui.s, sj = s.score[J], si = s.score[IA];
    ui.occupe = true; marquer();
    var g = M.gagnant(s), r = g === J ? 'v' : g === IA ? 'd' : 'n', L = ui.enLigne, proclame = sj === si && g >= 0;
    if (!L && !LO){ bilan[r]++; ecrire('hemicycle-bilan', bilan); }   // le bilan compte les parties contre l'IA
    if (tropheesActifs() && !ui.tr.fini){
      ui.tr.fini = true;
      TR.finPartie({ r: r, niveau: niveauIA(), lieu: ui.lieu && ui.lieu.id, ecart: sj - si, mene: ui.tr.mene, second: ui.tr.second, avaitAction: ui.tr.avaitAction, actionJouee: ui.tr.actionJouee,
        proclame: ui.tr.proclame, suisse: !!s.suisse && s.suisse[J] >= 0, phobie: !!s.oubliCompte && s.oubliCamp === IA, carriere: !!ui.carriere });
      annoncerTrophees(r === 'n' ? 1500 : reduit ? 1700 : 3700);   // après la fête
    }
    if (!L && !LO && !ui.carriere) ecrire(CLE_LIBRES, partiesLibres() + 1);   // parties libres : elles ouvrent la Carrière
    if (ui.carriere && r !== 'n'){ var clm = classeur(); clm.manches = (clm.manches || 0) + 1; sauverClasseur(clm); }
    var titre = proclame ? (r === 'v' ? 'Victoire proclamée&nbsp;!' : adv(true) + ' se proclame vainqueur') : r === 'v' ? 'Majorité absolue&nbsp;!' : r === 'd' ? adv(true) + ' l’emporte' : 'Ballottage';
    var texte = proclame ? 'Cinq sièges partout, mais la carte Proclamé tranche' + (r === 'v' ? ' en ta faveur.' : ' pour ' + adv() + '.') :
      r === 'v' ? 'Tu remportes ' + sj + ' sièges sur ' + (sj + si) + '.' : r === 'd' ? adv(true) + ' remporte ' + si + ' sièges sur ' + (sj + si) + '.' : 'Cinq sièges partout.';
    var matchFini = false, matchTexte = '';
    if (LO && LO.match && !LO.match.compte){
      LO.match.compte = true;   // une seule fois par manche
      if (r !== 'n') LO.match.victoires[r === 'v' ? 0 : 1]++;
      var mv = LO.match.victoires; matchFini = mv[0] >= 3 || mv[1] >= 3;
      ecrire('hemicycle-local', { noms: LO.noms, match: true, suite: matchFini ? null : { victoires: mv.slice(), manche: LO.match.manche + 1 } });   // le match survit à la fermeture de l'appli entre deux manches
      matchTexte = '<p class="score-match">Match&nbsp;: ' + echapper(abrege(LO.noms[0])) + ' <b>' + mv[0] + '</b> · <b>' + mv[1] + '</b> ' + echapper(abrege(LO.noms[1])) +
        (matchFini ? '' : ' <small>· le premier à 3 victoires</small>') + '</p>';
    }
    if (LO){
      var nv = echapper(LO.noms[r === 'v' ? 0 : 1]), nd = echapper(LO.noms[r === 'v' ? 1 : 0]), sv = r === 'v' ? sj : si;
      titre = r === 'n' ? 'Ballottage' : proclame ? nv + ' se proclame vainqueur' : nv + ' l’emporte&nbsp;!';
      if (matchFini){ var gm = LO.match.victoires[0] >= 3 ? 0 : 1; titre = echapper(LO.noms[gm]) + ' remporte le match&nbsp;!'; }
      texte = r === 'n' ? 'Cinq sièges partout.' : proclame ? 'Cinq sièges partout, mais la carte Proclamé tranche pour ' + nv + '.' : nv + ' remporte ' + sv + ' sièges sur ' + (sj + si) + ' face à ' + nd + '.';
      if (matchFini) texte += ' Match gagné ' + Math.max.apply(null, LO.match.victoires) + ' à ' + Math.min.apply(null, LO.match.victoires) + '.';
    }
    banniere(proclame ? 'Proclamé !' : r === 'v' ? 'Majorité absolue !' : r === 'd' ? 'Battu de peu ?' : 'Ballottage !', 1300);
    S.jouer(r === 'v' ? 'victoire' : r === 'd' ? 'defaite' : 'ballottage');
    if (s.oubliCompte && s.oubli >= 0) noter('Phobie administrative&nbsp;: <b>' + CAND[s.oubli].court + '</b> n’a pas été déclarée, elle ne compte pas pour ' + (s.oubliCamp === J ? 'toi' : adv()) + '.');
    noter('<b>Fin de la partie</b>&nbsp;: ' + sj + ' siège' + (sj > 1 ? 's' : '') + ' pour toi, ' + si + ' pour ' + adv() + '.');
    perchoir(LO ? (r === 'n' ? 'Égalité.' : LO.noms[r === 'v' ? 0 : 1] + ' gagne.') : r === 'v' ? 'Partie gagnée.' : r === 'd' ? 'Partie perdue.' : 'Égalité.');
    var second = r === 'n' && regle('secondTour'), ouvert = false, fetee = r !== 'n';
    // Carrière : la manche se solde à la victoire ou à la défaite (un ballottage la laisse ouverte pour le second tour)
    var carriere = ui.carriere && r !== 'n' ? ui.carriere : null, perte = null;
    var gainAct = null;
    if (carriere){ ui.carriere = null; if (r === 'd') perte = perdreCarte(carriere.mainJ); else gainAct = gagnerAction(carriere.actIA); }
    if (fetee) fete(r);
    // Le bilan arrive après la fête ; un clic ou Échap pendant la fête y mène tout de suite
    function bilanFin(){
      if (ouvert) return;
      ouvert = true;
      congedierFete();
      ouvrirPanneau('<h2 id="titre-dialogue">' + titre + '</h2><p class="score-final"><span class="pastille j"></span> ' + (LO ? echapper(abrege(LO.noms[0])) : 'Toi') + ' <b>' + sj + '</b> · <b>' + si + '</b> ' + (LO ? echapper(abrege(LO.noms[1])) : L ? 'Adv.' : 'IA') + ' <span class="pastille ia"></span></p><p>' + texte + '</p>' +
        matchTexte + (perte ? htmlPerte(perte) : '') + (gainAct ? htmlGainAction(gainAct) : '') + (carriere && r === 'v' ? htmlPrise(carriere.mainIA) : '') +
        (second ? '<p class="aide">Second tour&nbsp;: chacun reprend les cinq cartes qu’il détient, et c’est reparti.</p>' : '') +
        htmlAnecdote() +
        (L ? (L.classee ? '<p class="aide" id="rang-ligne"></p>' : '') + '<p class="aide fort" id="envie-ligne" aria-live="polite"></p>' : LO ? '' : '<p class="aide">' + texteBilan() + '</p>') +
        (window.APDA_DON && r === 'v' && !L && !LO && bilan.v % 3 === 1 ? '<p class="aide">Ça t’a plu&nbsp;? <a href="' + window.APDA_DON + '" target="_blank" rel="noopener">Offrir un café au développeur</a>. Sans pub ni financement politique.</p>' : '') +
        '<div class="pied">' + (L ? '<button type="button" class="bouton-sec" id="b-quitter-ligne">Quitter</button>' : '<button type="button" class="bouton-sec" id="b-menu-fin">Menu</button>') +
        (second ? '<button type="button" class="bouton" id="b-second">Second tour</button>' : LO && LO.match ? '<button type="button" class="bouton" id="b-revanche">' + (matchFini ? 'Nouveau match' : 'Manche suivante') + '</button>' : '<button type="button" class="bouton" id="b-revanche">Revanche</button>') + '</div>');
      var bs = $('b-second'), br = $('b-revanche');
      if (L){   // en ligne : il faut être deux à vouloir rejouer
        $('b-quitter-ligne').addEventListener('click', function(){ quitterLigne(); afficherAccueil(); });
        [['second', bs], ['revanche', br]].forEach(function(x){
          if (x[1]) x[1].addEventListener('click', function(){ envoyerLigne({ t: x[0] }); x[1].disabled = true; x[1].textContent = 'En attente…'; afficherEnvie(); });
        });
        afficherEnvie();
        if (L.classee){
          L.surClassement = function(c){ var el = $('rang-ligne'); if (el && c && c.moi) el.innerHTML = texteRang(c.moi); };
          envoyerLigne({ t: 'classement', profil: { secret: (profil() || {}).secret } });
        }
        return;
      }
      $('b-menu-fin').addEventListener('click', allerAccueil);
      if (bs) bs.addEventListener('click', function(){
        var mj = [], mi = [];
        for (var i = 0; i < s.N; i++){ if (s.own[i] === J) mj.push(s.crd[i]); else if (s.own[i] === IA) mi.push(s.crd[i]); }
        mj = mj.concat(s.mains[J]); mi = mi.concat(s.mains[IA]);
        if (LO && LO.match) LO.match.compte = false;   // le second tour finit la même manche
        fermerPanneau(); demarrer(mj, mi, s.pioche.slice(), 1 - ui.premier);
        if (ui.tr) ui.tr.second = true;
      });
      if (br) br.addEventListener('click', function(){
        if (LO && LO.match){ if (matchFini) LO.match = { victoires: [0, 0], manche: 1 }; else { LO.match.manche++; } LO.match.compte = false; }
        fermerPanneau(); nouvellePartie();
      });
      if (carriere && r === 'v') brancherPrise();
    }
    apres(fetee ? (reduit ? 1500 : 3400) : (reduit ? 300 : 1400), bilanFin);
    fete_.passer = function(ev){
      if (ev.type === 'keydown'){
        if (ev.key !== 'Escape') return;
        ev.preventDefault(); ev.stopPropagation();   // sinon Échap refermerait aussitôt le bilan
      }
      bilanFin();
    };
    apres(350, function(){
      if (!fete_.passer) return;
      document.addEventListener('pointerdown', fete_.passer, true);
      document.addEventListener('keydown', fete_.passer, true);
    });
  }

  /* ---------- Tutoriel « Première séance » : trois leçons guidées, sur le plateau classique ----------
     Chaque leçon est une vraie position du moteur : rien n'est simulé, les prises viennent des chiffres des cartes
     (tests/tuto_verif.js rejoue les trois scénarios). Le casting ne compte que des cartes « Divers », pour ne
     mettre en scène aucun duel gauche contre droite. Étapes : info (bulle + bouton), ia (pose écrite d'avance),
     pose (seuls la carte et le siège de la leçon répondent), action (la carte action), libre (fin de partie normale). */
  var CLE_TUTO = 'hemicycle-tuto';
  var TUTO = [
    { titre: 'La prise', premier: IA, regles: {},
      mainJ: ['Villepin', 'Breton', 'Batho', 'Polony', 'Lalanne'], mainIA: ['Durif', 'Cazeneuve', 'Lagarde', 'Pigasse', 'Branco'],
      etapes: [
        { t: 'info', bouton: 'Suivant', txt: '<b>Bienvenue&nbsp;!</b> Une carte, quatre chiffres&nbsp;: un par côté. Le but&nbsp;: finir avec le plus de cartes à ta couleur.' },
        { t: 'ia', carte: 'Durif', cell: 4, txt: 'L’IA ouvre la séance…' },
        { t: 'pose', carte: 'Villepin', cell: 3, txt: 'L’IA a posé Durif. <b>Glisse Villepin sur le siège entouré de jaune</b>, à sa gauche&nbsp;: le <b>5</b> de Villepin fera face au <b>1</b> de Durif.' },
        { t: 'info', bouton: 'Suivant', txt: '<b>5 bat 1</b>&nbsp;: Durif passe à ta couleur. Te voilà à 6 sièges sur 10&nbsp;: c’est la <b>majorité absolue</b>.' },
        { t: 'ia', carte: 'Cazeneuve', cell: 5, txt: 'L’IA réplique…' },
        { t: 'info', bouton: 'Suivant', txt: 'Cazeneuve reprend Durif par la droite&nbsp;: <b>4 bat 1</b>. Une carte change de camp chaque fois qu’on la bat.' },
        { t: 'pose', carte: 'Breton', cell: 1, txt: 'À toi de le reprendre, par le haut cette fois. <b>Pose Breton au-dessus de Durif</b>&nbsp;: son <b>4</b> du bas contre le <b>1</b> du haut.' },
        { t: 'fin', bouton: 'Leçon 2', txt: 'Bien joué&nbsp;! <b>Côté contre côté, le plus grand chiffre prend la carte.</b> À égalité, rien ne bouge.' }
      ] },
    { titre: 'Les combinaisons', premier: J, regles: { proche: true, coalition: true },
      mainJ: ['Batho', 'Leclerc', 'Polony', 'Lalanne', 'Pigasse'], mainIA: ['Villepin', 'Durif', 'Cazeneuve', 'Lagarde', 'Riner'],
      prepose: [['Villepin', 1], ['Durif', 3], ['Cazeneuve', 5], ['Lagarde', 7]],
      etapes: [
        { t: 'info', bouton: 'Suivant', txt: 'Leçon 2&nbsp;: <b>prendre des cartes sans les battre</b>. L’IA en a déjà posé quatre. Tu vas en rallier deux d’un coup.' },
        { t: 'pose', carte: 'Batho', cell: 0, txt: '<b>Pose Batho dans le coin en haut à gauche.</b> Son 8 fait face au 9 de Villepin, son 1 au 1 de Durif&nbsp;: elle ne bat personne…' },
        { t: 'info', bouton: 'Suivant', txt: '<b>À peu près d’accord&nbsp;!</b> À 1 près de deux voisines (8 et 9, puis 1 et 1), ta carte les rallie toutes les deux.' },
        { t: 'ia', carte: 'Riner', cell: 6, txt: 'L’IA pose Riner dans un coin…' },
        { t: 'pose', carte: 'Leclerc', cell: 8, txt: 'Autre combinaison. <b>Pose Leclerc dans le coin en bas à droite</b> et compte&nbsp;: 1 + 7 avec Cazeneuve au-dessus, 3 + 5 avec Lagarde à gauche.' },
        { t: 'fin', bouton: 'Leçon 3', txt: '<b>Coalition&nbsp;!</b> Même somme des deux côtés, 8 et 8&nbsp;: tu prends les deux. Puis Lagarde bat Riner&nbsp;: <b>effet domino</b>.' }
      ] },
    { titre: 'La carte action', premier: J, ordre: true, action: 'Borne', regles: { proche: true, coalition: true },
      mainJ: ['Cazeneuve', 'Villepin', 'Batho', 'Breton', 'Lagarde'], mainIA: ['Lassalle', 'Riner', 'Leclerc', 'Durif', 'Branco'],
      etapes: [
        { t: 'info', bouton: 'Suivant', txt: 'Une vraie partie, maintenant. <b>Tu commences</b>&nbsp;: ta première carte touche la <b>prime d’ouverture</b>, +1 partout.' },
        { t: 'pose', carte: 'Cazeneuve', cell: 4, txt: '<b>Pose Cazeneuve au centre.</b> Ses quatre chiffres sont déjà gonflés de +1.' },
        { t: 'ia', carte: 'Lassalle', cell: 1, txt: 'L’IA répond…' },
        { t: 'action', txt: 'Aïe&nbsp;: le 10 de Lassalle écrase ton 6. Mais tu as une <b>carte action</b>, une seule par partie. <b>Touche ton 49.3</b>, entouré de jaune, joue-le, puis choisis la carte à reprendre.' },
        { t: 'info', bouton: 'C’est parti', txt: 'Adopté sans vote&nbsp;! <b>À toi de finir.</b> L’IA, qui joue en second, garde une carte en main&nbsp;: elle compte pour elle.' },
        { t: 'libre' }
      ] }
  ];
  /* Le tutoriel des Flèches : mêmes étapes, plus « des » (les tirages des duels, écrits d'avance pour que la leçon se déroule comme annoncé).
     Leçons 1 et 2 sur un plateau de 9 sièges, où les flèches se lisent mieux ; leçon 3 sur le vrai plateau. tests/tuto_fleches_verif.js rejoue le tout. */
  var TUTO_FL = [
    { titre: 'Les flèches', premier: IA, fleches: true, regles: {},
      mainJ: ['Villepin', 'Cazeneuve', 'Batho', 'Breton', 'Polony'], mainIA: ['Lalanne', 'Riner', 'Pigasse', 'Leclerc', 'Branco'],
      etapes: [
        { t: 'info', bouton: 'Suivant', txt: '<b>Bienvenue&nbsp;!</b> Le but&nbsp;: finir avec le plus de cartes à ta couleur. Chaque carte porte de petites <b>flèches</b> sur son bord.' },
        { t: 'ia', carte: 'Lalanne', cell: 4, txt: 'L’IA ouvre la séance…' },
        { t: 'pose', carte: 'Villepin', cell: 3, txt: 'L’IA a posé Lalanne&nbsp;: ses flèches ne partent que vers le haut. <b>Glisse Villepin sur le siège entouré de jaune</b>&nbsp;: sa flèche de droite visera Lalanne.' },
        { t: 'info', bouton: 'Suivant', txt: '<b>Pris sans combat&nbsp;:</b> ta flèche visait Lalanne, qui n’en avait aucune vers toi. 6 sièges sur 10, c’est la majorité.' },
        { t: 'ia', carte: 'Riner', cell: 8, txt: 'L’IA réplique…' },
        { t: 'info', bouton: 'Suivant', txt: 'Riner reprend Lalanne <b>par le coin</b>&nbsp;: les flèches en diagonale comptent aussi.' },
        { t: 'pose', carte: 'Cazeneuve', cell: 6, txt: 'À toi de le reprendre, par l’autre coin. <b>Pose Cazeneuve en bas à gauche</b>&nbsp;: sa flèche vers le haut à droite vise Lalanne, qui n’a rien de ce côté.' },
        { t: 'fin', bouton: 'Leçon 2', txt: 'Bien joué&nbsp;! <b>Tu attaques là où pointent tes flèches. Tu es sans défense là où tu n’en as pas.</b>' }
      ] },
    { titre: 'Le duel et le combo', premier: J, fleches: true, regles: {},
      mainJ: ['Villepin', 'Batho', 'Breton', 'Cazeneuve', 'Lassalle'], mainIA: ['Polony', 'Leclerc', 'Durif', 'Riner', 'Pigasse'],
      prepose: [['Polony', 4], ['Leclerc', 1]],
      etapes: [
        { t: 'info', bouton: 'Suivant', txt: 'Leçon 2. Quand la carte visée a <b>une flèche en retour</b>, elle se défend&nbsp;: c’est un <b>duel</b>. Regarde les deux chiffres en bas des cartes.' },
        { t: 'pose', carte: 'Villepin', cell: 3, des: [0.7, 0], txt: '<b>Pose Villepin à gauche de Polony.</b> Leurs flèches se font face. Ton <b>Attaque de 5</b> (en jaune) contre sa <b>Défense de 1</b> (en noir)&nbsp;: chacun tire un nombre jusqu’à son chiffre.' },
        { t: 'info', bouton: 'Suivant', txt: '<b>4 contre 1, duel gagné.</b> Et <b>combo</b>&nbsp;: Polony, battue, entraîne Leclerc qu’elle pointait. Un duel perdu t’aurait coûté Villepin.' },
        { t: 'ia', carte: 'Durif', cell: 6, des: [0.9, 0.9], txt: 'L’IA tente sa chance avec Durif…' },
        { t: 'fin', bouton: 'Leçon 3', txt: 'Raté pour l’IA&nbsp;: 1 contre 1, et <b>l’égalité profite au défenseur</b>. Durif est à toi. Avant de poser, lis tes chances sous le score.' }
      ] },
    { titre: 'La vraie partie', premier: IA, fleches: true, ordre: true, taille: 4, bancs: [3, 12, 10], action: 'Borne', regles: { plateau: 'grand' },
      mainJ: ['Breton', 'Lassalle', 'Cazeneuve', 'Villepin', 'Batho'], mainIA: ['Riner', 'Leclerc', 'Pigasse', 'Lalanne', 'Branco'],
      etapes: [
        { t: 'info', bouton: 'Suivant', txt: 'Le vrai plateau&nbsp;: 16 sièges, certains bloqués. <b>L’IA commence</b>&nbsp;; le jeu compense celui qui joue en second&nbsp;: toi.' },
        { t: 'ia', carte: 'Riner', cell: 5, txt: 'L’IA ouvre la séance…' },
        { t: 'pose', carte: 'Breton', cell: 6, txt: '<b>Pose Breton à droite de Riner.</b> Ta première carte sera <b>indéboulonnable</b>&nbsp;: ni prise, ni défiée, jusqu’à la fin.' },
        { t: 'info', bouton: 'Suivant', txt: 'Breton prend Riner et gagne son fauteuil&nbsp;: 6 sièges à 4.' },
        { t: 'ia', carte: 'Leclerc', cell: 15, txt: 'L’IA se met à l’abri, dans un coin…' },
        { t: 'action', txt: 'Hors de portée&nbsp;! Sors ta <b>carte action</b>, une seule par partie&nbsp;: <b>touche ton 49.3</b>, entouré de jaune, puis choisis Leclerc.' },
        { t: 'info', bouton: 'C’est parti', txt: 'Adopté sans vote&nbsp;! Chaque partie t’en donne une autre. <b>À toi de finir&nbsp;:</b> ta dernière carte restera en main et comptera pour toi.' },
        { t: 'libre' }
      ] }
  ];
  function cleTuto(){ return reglesFleches() ? 'hemicycle-tuto-fleches' : CLE_TUTO; }
  // Les leçons sont écrites avec des noms : on les traduit une fois en numéros de carte
  TUTO.concat(TUTO_FL).forEach(function(L){
    function num(nom){ return indices(CAND, [nom])[0]; }
    L.mainJ = L.mainJ.map(num); L.mainIA = L.mainIA.map(num);
    L.prepose = (L.prepose || []).map(function(x){ return [num(x[0]), x[1]]; });
    L.actJ = L.action ? indices(ACT, [L.action])[0] : -1;
    L.etapes.forEach(function(e){ if (e.carte != null) e.carte = num(e.carte); });
  });
  // L'étape guidée en cours (rien pendant la fin de partie libre de la leçon 3)
  function etapeTuto(){ var T = ui.tuto; return T && !T.libre ? T.lecons[T.lecon].etapes[T.etape] || null : null; }
  function tutoPermet(carte, cell){ var g = etapeTuto(); return !g || (g.t === 'pose' && g.carte === carte && g.cell === cell); }
  function bulleTuto(html, bouton, suivant){
    var T = ui.tuto, bs = $('tuto-suivant');
    $('tuto-etiquette').textContent = 'Leçon ' + (T.lecon + 1) + '/' + T.lecons.length + ' · ' + T.lecons[T.lecon].titre;
    $('tuto').setAttribute('aria-label', 'Tutoriel, leçon ' + (T.lecon + 1) + ' sur ' + T.lecons.length);
    $('tuto-texte').innerHTML = html;
    bs.hidden = !bouton; bs.textContent = bouton || '';
    T.suivant = suivant || null;
    $('tuto').hidden = false;
    document.querySelector('#vue-jeu .arene').classList.add('en-tuto');
  }
  function cacherBulle(){
    $('tuto').hidden = true;
    document.querySelector('#vue-jeu .arene').classList.remove('en-tuto');
  }
  function quitterTuto(){
    if (!ui.tuto) return;
    ui.tuto = null; ui.partie++; ui.sel = -1; ui.mode = null;
    if (ui.s) ui.s.fin = true;   // plus de partie à reprendre ; les animations en cours finissent sans rien casser
    cacherBulle();
    majNomsAdversaire();
  }
  // Tout premier démarrage sur cet appareil : ni partie, ni deck, ni tutoriel vu
  var CLE_VENU = 'hemicycle-venu';
  function premiereVisite(){ return !brut(CLE_VENU) && !tutoFait() && !brut(CLE_TUTO) && !brut('hemicycle-tuto-fleches') && bilan.v + bilan.d + bilan.n === 0 && !classeur().cartes.length && !enPartie(); }
  // Tout premier lancement : l'accueil d'abord (logo, Marseillaise), puis une invitation au tutoriel, sans l'imposer
  function accueillir(){
    apres(reduit ? 300 : 1600, function(){
      if ($('accueil').hidden || !$('voile').hidden || ui.s || ui.tuto) return;
      ouvrirPanneau('<h2 id="titre-dialogue">Bienvenue&nbsp;!</h2>' +
        '<p>Un jeu de cartes sur la présidentielle 2027&nbsp;: 43 personnalités, des chiffres publics, et beaucoup de retournements de veste.</p>' +
        '<p>Première fois&nbsp;? Trois petites leçons pour apprendre en jouant.</p>' +
        '<div class="pied"><button type="button" class="bouton-sec" id="b-bienvenue-plus-tard">Plus tard</button><button type="button" class="bouton" id="b-bienvenue-tuto">Apprendre en 3 minutes</button></div>');
      $('b-bienvenue-tuto').addEventListener('click', function(){ fermerPanneau(); lancerTuto(); });
      $('b-bienvenue-plus-tard').addEventListener('click', fermerPanneau);
      try { $('b-bienvenue-tuto').focus({ preventScroll: true }); } catch (e){}
    });
  }
  function lancerTuto(){
    if (ui.local) quitterLocal();
    if (ui.enLigne) quitterLigne();
    if (!$('voile').hidden) fermerPanneau();
    demarrerLecon(0, reglesFleches() ? TUTO_FL : TUTO);
  }
  function demarrerLecon(n, lecons){
    var L = lecons[n], bancs = L.bancs || [];
    ui.partie++;
    arreterFete();
    ui.carriere = null;
    ui.variante = null; document.querySelector('#vue-jeu .arene').classList.toggle('en-fleches', !!L.fleches);
    var T = ui.tuto = { lecons: lecons, lecon: n, etape: 0, libre: false, fait: false, suivant: null, des: [] };
    afficherJeu();
    ui.lieu = LIEUX[0]; appliquerLieu(); ui.bancs = {};
    bancs.forEach(function(i, k){ ui.bancs[i] = k % ui.lieu.bancs.length; });
    var s = ui.s = M.nouvelle({ mainJ: L.mainJ, mainIA: L.mainIA, pioche: [], premier: L.premier, taille: L.taille || 3, bancs: bancs, actJ: L.actJ, actIA: -1,
      proche: !!L.regles.proche, coalition: !!L.regles.coalition, diagonales: false, ordre: !!L.ordre, fleches: !!L.fleches,
      alea: function(){ return T.des.length ? T.des.shift() : Math.random(); } });   // duels des leçons : tirages écrits d'avance, puis de vrais dés
    // Cartes déjà en place au début de la leçon : l'IA les a posées, la main passe au joueur
    L.prepose.forEach(function(x){ s.trait = IA; s.poses = 1; M.poser(s, x[0], x[1], []); });
    if (L.prepose.length) s.trait = L.premier;
    $('leg-coins').hidden = true;
    ui.sel = -1; ui.mode = null; ui.revelees = {}; ui.derniereAction = [-1, -1]; ui.annulee = [-1, -1]; ui.premier = L.premier;
    reinitAnecdotes();
    majNomsAdversaire();
    $('journal').innerHTML = '';
    noter('Tutoriel, leçon ' + (n + 1) + '&nbsp;: <b>' + L.titre + '</b>.');
    ui.occupe = true;
    rendreTout();
    repeindre();
    tutoPas();
  }
  // Après un coup du joueur (ou une annulation) : on avance d'une étape si le coup de la leçon a été joué
  function suiteTuto(){
    var T = ui.tuto;
    if (T.fait){ T.fait = false; T.etape++; }
    return tutoPas();
  }
  async function tutoPas(){
    var T = ui.tuto, no = ui.partie, s = ui.s;
    if (!T) return;
    var e = T.lecons[T.lecon].etapes[T.etape];
    if (!e) return;
    if (e.des) T.des = e.des.slice();
    if (e.t === 'libre'){ T.libre = true; cacherBulle(); majNomsAdversaire(); return suite(); }
    if (e.t === 'ia'){
      ui.occupe = true; ui.sel = -1; rendreMains();
      bulleTuto(e.txt); perchoir('L’IA joue…');
      await attendre(850);
      if (ui.partie !== no || ui.tuto !== T) return;
      var avant = Array.prototype.slice.call(s.own), evts = [];
      M.poser(s, e.carte, e.cell, evts);
      await animerPose(IA, e.carte, e.cell, avant, evts);
      if (ui.partie !== no || ui.tuto !== T) return;
      rendreTout();
      await attendre(300);
      if (ui.partie !== no || ui.tuto !== T) return;
      T.etape++;
      return tutoPas();
    }
    if (e.t === 'info' || e.t === 'fin'){
      ui.occupe = true; ui.sel = -1; rendreMains();
      perchoir(e.t === 'fin' ? 'Leçon terminée.' : 'Lis la bulle, puis touche « ' + e.bouton + ' ».');
      bulleTuto(e.txt, e.bouton, function(){
        if (ui.tuto !== T) return;
        if (e.t === 'fin') return demarrerLecon(T.lecon + 1, T.lecons);
        T.etape++; tutoPas();
      });
      return;
    }
    // pose ou action : la main au joueur, pour le seul coup de la leçon
    ui.occupe = false;
    bulleTuto(e.txt);
    rendreMains(); rendreActions(); marquer();
    perchoir(messageTour());
  }
  // Fin de la leçon 3 : pas de bilan, pas de carte en jeu, juste le résumé et la suite
  function finTuto(){
    var s = ui.s, sj = s.score[J], si = s.score[IA], g = M.gagnant(s), r = g === J ? 'v' : g === IA ? 'd' : 'n', T = ui.tuto, no = ui.partie;
    ui.occupe = true; marquer();
    ecrire(T.lecons === TUTO_FL ? 'hemicycle-tuto-fleches' : CLE_TUTO, { fait: 1 });
    if (TR){ TR.marquer('tuto'); annoncerTrophees(reduit ? 1700 : 3700); }
    banniere(r === 'v' ? 'Majorité absolue !' : r === 'd' ? 'Battu de peu ?' : 'Ballottage !', 1300);
    S.jouer(r === 'v' ? 'victoire' : r === 'd' ? 'defaite' : 'ballottage');
    noter('<b>Fin du tutoriel</b>&nbsp;: ' + sj + ' siège' + (sj > 1 ? 's' : '') + ' pour toi, ' + si + ' pour l’IA.');
    perchoir('Tutoriel terminé.');
    var n = classeur().cartes.length;
    setTimeout(function(){
      if (ui.partie !== no || ui.tuto !== T) return;
      ouvrirPanneau('<h2 id="titre-dialogue">Tutoriel terminé</h2>' +
        '<p class="score-final"><span class="pastille j"></span> Toi <b>' + sj + '</b> · <b>' + si + '</b> IA <span class="pastille ia"></span></p>' +
        '<p>' + (r === 'v' ? 'Majorité absolue dès ta première vraie partie&nbsp;: tu es prêt.' : r === 'd' ? 'L’IA l’emporte cette fois. Peu importe&nbsp;: tu connais les règles.' : 'Cinq sièges partout&nbsp;: ballottage. Tu connais les règles, c’est l’essentiel.') + '</p>' +
        '<ul class="tuto-bilan">' + (T.lecons === TUTO_FL ?
          '<li><b>Les flèches</b>&nbsp;: tu attaques là où elles pointent, tu es sans défense là où tu n’en as pas.</li>' +
          '<li><b>Le duel</b>&nbsp;: flèche contre flèche, ton Attaque contre sa Défense, aux dés. L’égalité profite au défenseur.</li>' +
          '<li><b>Le combo</b>&nbsp;: la carte battue en duel entraîne celles de son camp qu’elle pointait.</li>' +
          '<li><b>L’ordre de jeu</b>&nbsp;: qui joue en second garde sa dernière carte en main, et sa première est indéboulonnable.</li>' :
          '<li><b>La prise</b>&nbsp;: côté contre côté, le plus grand chiffre prend la carte.</li>' +
          '<li><b>Les combinaisons</b>&nbsp;: À peu près d’accord (à 1 près de deux voisines), Coalition (même somme), puis effet domino.</li>' +
          '<li><b>La carte action</b>&nbsp;: une par partie, à jouer à ton tour, avant de poser.</li>' +
          '<li><b>L’ordre de jeu</b>&nbsp;: qui joue en second garde sa dernière carte en main, et elle compte pour lui.</li>') +
        '</ul>' +
        (carriereOuverte() ? '<p class="aide">En Carrière, ' + (n ? 'tu joues ton deck' : 'tu reçois ' + DEPART_CLASSEUR + ' cartes') + ' et tu gagnes celles de l’IA, une victoire après l’autre.</p>' :
          '<p class="aide">Encore ' + Math.max(1, LIBRES_REQUISES - partiesLibres()) + ' partie' + (LIBRES_REQUISES - partiesLibres() > 1 ? 's' : '') + ' libre' + (LIBRES_REQUISES - partiesLibres() > 1 ? 's' : '') + ' et la Carrière s’ouvre&nbsp;: tu y gagnes les cartes de l’IA, une victoire après l’autre.</p>') +
        '<div class="pied"><button type="button" class="bouton-sec" id="b-menu-tuto">Menu</button>' +
        (r === 'v' ? '' : '<button type="button" class="bouton-sec" id="b-rejouer-tuto">Rejouer la leçon</button>') +
        '<button type="button" class="bouton" id="b-carriere-tuto">' + (carriereOuverte() ? 'Jouer en Carrière' : 'Partie libre') + '</button></div>');
      $('b-menu-tuto').addEventListener('click', function(){ fermerPanneau(); quitterTuto(); allerAccueil(); });
      $('b-carriere-tuto').addEventListener('click', function(){ lancerSolo(carriereOuverte() ? 'carriere' : 'libre'); });
      var br = $('b-rejouer-tuto');
      if (br) br.addEventListener('click', function(){ fermerPanneau(); demarrerLecon(T.lecons.length - 1, T.lecons); });
    }, reduit ? 300 : 1400);
  }

  /* ---------- En ligne : « Défier un ami » ----------
     Le serveur (serveur.js) arbitre : on lui envoie ses coups, il renvoie à chacun la partie vue de son côté
     (toi en bas, ton adversaire en haut) et les événements à animer. La main adverse n'arrive jamais ici
     tant qu'elle est cachée : ses cartes sont des jetons négatifs. Sans serveur (fichier ouvert seul,
     artefact, appli), window.APDA_EN_LIGNE est vide et ce mode n'apparaît pas. */
  var ADRESSE_WS = window.APDA_EN_LIGNE || '';
  var CLE_LIGNE = 'hemicycle-ligne';
  function adresseWs(){ return /^wss?:/.test(ADRESSE_WS) ? ADRESSE_WS : (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + ADRESSE_WS; }
  function lienPartie(code){ return (window.APDA_SITE || location.origin + location.pathname) + '#jouer/' + code; }
  function etatDepuisVue(v){
    var s = M.cloner(Object.assign({}, v, { vs: M.grille(v.taille, !!v.diag) }));
    s.own = Int8Array.from(v.own); s.crd = Int8Array.from(v.crd); s.org = Int8Array.from(v.org);
    s.bst = Int8Array.from(v.bst); s.prot = Uint8Array.from(v.prot);
    return s;
  }
  /* ---------- Face-à-face : deux joueurs sur un même téléphone ----------
     Le moteur voit toujours le joueur qui tient le téléphone en J (en bas). Au changement de joueur, l'état est retourné (M.miroir)
     et les couleurs aussi : le joueur 1 garde le jaune, le joueur 2 le fond nuit, quel que soit celui qui joue. */
  function abrege(nom){ nom = String(nom || ''); return nom.length > 9 ? nom.slice(0, 8) + '…' : nom; }
  function appliquerVueLocale(){
    var inv = !!(ui.local && ui.local.vue === 1);
    document.body.classList.toggle('local-inverse', inv);
    document.body.classList.toggle('en-local', !!ui.local);
    majNomsAdversaire();
  }
  function basculerVue(){
    var L = ui.local; if (!L || !ui.s) return;
    L.rev[L.vue] = ui.revelees;
    ui.s = M.miroir(ui.s);
    L.vue = 1 - L.vue;
    ui.revelees = L.rev[L.vue] || {};
    ui.premier = 1 - ui.premier;
    ui.derniereAction = [ui.derniereAction[1], ui.derniereAction[0]];
    ui.annulee = [ui.annulee[1], ui.annulee[0]];
    ui.sel = -1; ui.mode = null;
    appliquerVueLocale();
  }
  function passerLaMain(reprise){
    var L = ui.local, cible = reprise ? L.vue : 1 - L.vue, nom = echapper(L.noms[cible]);
    ui.occupe = true; ui.sel = -1; ui.mode = null;
    var o = document.createElement('div'); o.className = 'passe-main' + (cible === 1 ? ' vers-j2' : ' vers-j1'); o.id = 'passe-main';
    o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-labelledby', 'passe-titre');
    o.innerHTML = '<div class="pm-boite"><p class="pm-sur">Face-à-face</p><h2 id="passe-titre">Au tour de <b>' + nom + '</b></h2>' +
      '<p>' + (reprise ? 'La partie reprend. Donne-lui le téléphone&nbsp;: c’est sa main qui va s’afficher.' : 'Passe-lui le téléphone. Pas de coup d’œil sur sa main&nbsp;!') + '</p>' +
      (L.match ? '<p class="pm-match">Manche ' + L.match.manche + ' · match ' + L.match.victoires[0] + '–' + L.match.victoires[1] + '</p>' : '') +
      '<p class="pm-score">' + echapper(L.noms[0]) + ' <b>' + ui.s.score[L.vue === 0 ? J : IA] + '</b> · <b>' + ui.s.score[L.vue === 0 ? IA : J] + '</b> ' + echapper(L.noms[1]) + '</p>' +
      '<button type="button" class="bouton" id="b-passe">C’est moi, ' + nom + '&nbsp;: j’y vais</button><button type="button" class="pm-menu" id="b-passe-menu">Menu</button></div>';
    document.body.appendChild(o);
    S.jouer('coalition');
    var b = $('b-passe'); try { b.focus({ preventScroll: true }); } catch (e){}
    $('b-passe-menu').addEventListener('click', function(){ retirerPasseMain(); ui.occupe = false; allerAccueil(); });
    b.addEventListener('click', function(){
      if (!reprise) basculerVue();
      if (o.parentNode) o.parentNode.removeChild(o);
      ui.occupe = false;
      rendreTout(); suite();
    });
  }
  function retirerPasseMain(){ var o = $('passe-main'); if (o && o.parentNode) o.parentNode.removeChild(o); }
  function quitterLocal(){ retirerPasseMain(); ui.local = null; appliquerVueLocale(); }
  // Lancement : deux prénoms, puis une partie libre avec les règles en cours
  function ouvrirFaceAFace(){
    var m = brut('hemicycle-local') || {}, p1 = m.noms ? m.noms[0] : ((profil() || {}).pseudo || 'Joueur 1'), p2 = m.noms ? m.noms[1] : 'Joueur 2';
    ouvrirPanneau('<h2 id="titre-dialogue">Face-à-face</h2><p class="aide">Le débat de l’entre-deux-tours, à deux sur ce téléphone. On se le passe à chaque tour.</p>' +
      (m.suite && m.noms && Array.isArray(m.suite.victoires) ? '<button type="button" class="mode mode-principal" id="b-continuer-match"><b>Continuer le match</b><span>' + echapper(m.noms[0]) + ' ' + (m.suite.victoires[0] | 0) + ' · ' + (m.suite.victoires[1] | 0) + ' ' + echapper(m.noms[1]) + ' · manche ' + (m.suite.manche | 0) + '</span></button><p class="aide">Ou une nouvelle rencontre&nbsp;:</p>' : '') +
      '<form id="form-local"><p class="ligne-nom"><span class="pastille j" aria-hidden="true"></span><label for="nom-j1">Joueur 1</label><input type="text" id="nom-j1" maxlength="20" autocomplete="off" spellcheck="false" value="' + echapper(p1) + '"></p>' +
      '<p class="ligne-nom"><span class="pastille ia" aria-hidden="true"></span><label for="nom-j2">Joueur 2</label><input type="text" id="nom-j2" maxlength="20" autocomplete="off" spellcheck="false" value="' + echapper(p2) + '"></p>' +
      '<fieldset class="format-local"><legend>Format</legend>' +
        '<label><input type="radio" name="format" value="1"' + (m.match ? '' : ' checked') + '> Une partie</label>' +
        '<label><input type="radio" name="format" value="5"' + (m.match ? ' checked' : '') + '> Match en 5 manches <small>(le premier à 3 victoires)</small></label></fieldset>' +
      '<p class="aide">Rien à gagner ni à perdre&nbsp;: pas de trophée, pas de carte en jeu.</p>' +
      '<div class="pied"><button type="button" class="bouton-sec" id="b-retour-local">Retour</button><button type="submit" class="bouton">C’est parti</button></div></form>');
    $('b-retour-local').addEventListener('click', ouvrirMulti);
    $('form-local').addEventListener('submit', function(ev){
      ev.preventDefault();
      var n1 = ($('nom-j1').value || '').trim() || 'Joueur 1', n2 = ($('nom-j2').value || '').trim() || 'Joueur 2';
      if (n1.toLowerCase() === n2.toLowerCase()){ n1 += ' (1)'; n2 += ' (2)'; }
      var enMatch = (document.querySelector('#form-local input[name=format]:checked') || {}).value === '5';
      ecrire('hemicycle-local', { noms: [n1, n2], match: enMatch });
      lancerLocal([n1, n2], enMatch ? { victoires: [0, 0], manche: 1 } : null);
    });
    var bc = $('b-continuer-match');
    if (bc) bc.addEventListener('click', function(){ lancerLocal(m.noms.slice(), { victoires: [m.suite.victoires[0] | 0, m.suite.victoires[1] | 0], manche: m.suite.manche | 0 || 1 }); });
  }
  function lancerLocal(noms, match){
    if (ui.enLigne) quitterLigne();
    ui.local = { noms: noms, vue: 0, rev: [{}, {}], match: match };
    ui.variante = reglesFleches() ? 'fleches' : null;
    opts.distribution = opts.donne === 'primaire' ? 'equilibre' : opts.donne;
    fermerPanneau(); afficherJeu(); appliquerVueLocale();
    nouvellePartie();
  }

  function majNomsAdversaire(){
    var l = !!ui.enLigne, n = $('nom-adv'), b = $('lib-adv'), f = document.querySelector('#piece .face-ia'), c = document.querySelector('#vue-jeu .camp-ia'), o = $('oeil-j');
    var a = l && ui.enLigne.adversaire, moi = profil(), nm = $('nom-moi');
    if (ui.local){ var Lc = ui.local, moiL = echapper(Lc.noms[Lc.vue]), luiL = echapper(Lc.noms[1 - Lc.vue]);
      if (n) n.textContent = Lc.noms[1 - Lc.vue]; if (nm) nm.textContent = Lc.noms[Lc.vue] + ' (à toi)'; if (b) b.textContent = abrege(Lc.noms[1 - Lc.vue]);
      var fj = document.querySelector('#piece .face-j'); if (fj) fj.textContent = abrege(Lc.noms[Lc.vue]); if (f) f.textContent = abrege(Lc.noms[1 - Lc.vue]);
      if (c) c.setAttribute('aria-label', 'Camp de ' + Lc.noms[1 - Lc.vue]); if (o) o.textContent = '· main adverse visible'; $('score-j').previousSibling.textContent = abrege(Lc.noms[Lc.vue]) + ' '; return; }
    var fj0 = document.querySelector('#piece .face-j'); if (fj0) fj0.textContent = 'Toi'; if ($('score-j').previousSibling) $('score-j').previousSibling.textContent = 'Toi ';
    if (n) n.innerHTML = a ? PR.avatarHtml(a.avatar, 22) + echapper(a.pseudo) : l ? 'Ton adversaire' : 'L’IA · <span id="niveau-ia">' + (ui.tuto ? 'Tutoriel' : NIVEAUX[niveauIA()]) + '</span>';
    if (nm) nm.innerHTML = l && moi ? PR.avatarHtml(moi.avatar, 22) + 'Toi' : 'Toi';
    if (b) b.textContent = l ? 'Adv.' : 'IA';
    if (f) f.textContent = l ? 'Adv.' : 'IA';
    if (c) c.setAttribute('aria-label', l ? 'Camp de ton adversaire' : 'Camp de l’IA');
    if (o) o.textContent = l ? '· main adverse visible' : '· main de l’IA visible';
  }
  function memoLigne(){ var m = brut(CLE_LIGNE); return m && m.code && m.jeton ? m : null; }
  function adresseJeu(code){ try { history.replaceState(history.state, '', code ? '#jouer/' + code : '#jouer'); } catch (e){} }

  // Ouvre la connexion et envoie le premier message : créer, rejoindre ou reprendre
  function demarrerLigne(premier){
    if (ui.local) quitterLocal();
    quitterTuto();
    quitterLigne(true);
    ui.partie++;
    afficherJeu();
    arreterFete();
    ui.enLigne = { ws: null, code: '', jeton: '', opts: null, numero: 0, file: Promise.resolve(), attente: false, fini: false, plan: null, envies: {}, essais: 0, coupe: false,
      premier: premier, adversaire: null, classee: premier.t === 'chercher', recherche: premier.t === 'chercher', minuteur: null, surClassement: null };
    ui.s = null; ui.occupe = true;
    majNomsAdversaire();
    ouvrirConnexion(premier);
  }
  function ouvrirConnexion(premier){
    var L = ui.enLigne, ws;
    try { ws = new WebSocket(adresseWs()); } catch (e){ return perteConnexion(); }
    L.ws = ws;
    ws.onopen = function(){ if (L.ws === ws) ws.send(JSON.stringify(premier)); };
    ws.onmessage = function(ev){
      var m; try { m = JSON.parse(ev.data); } catch (e){ return; }
      L.file = L.file.then(function(){ if (ui.enLigne === L) return recevoir(m); }).catch(function(e){ console.error(e); });
    };
    ws.onclose = function(){ if (ui.enLigne === L && L.ws === ws && !L.fini) reconnecter(); };
  }
  function envoyerLigne(m){ var L = ui.enLigne; if (L && L.ws && L.ws.readyState === 1) L.ws.send(JSON.stringify(m)); }
  // Coupure : on retente quelques fois, en reprenant sa place grâce au jeton
  function reconnecter(){
    var L = ui.enLigne;
    if (!L.code || !L.jeton || ++L.essais > 8) return perteConnexion();
    perchoir('Connexion perdue : je réessaie…');
    setTimeout(function(){ if (ui.enLigne === L && !L.fini) ouvrirConnexion({ t: 'reprendre', code: L.code, jeton: L.jeton }); }, Math.min(8000, 400 * Math.pow(2, L.essais)));
  }
  function quitterLigne(silencieux){
    var L = ui.enLigne;
    if (!L) return;
    L.fini = true;
    try { if (L.ws && L.ws.readyState === 1) L.ws.send(JSON.stringify({ t: 'quitter' })); if (L.ws) L.ws.close(); } catch (e){}
    ui.enLigne = null;
    try { localStorage.removeItem(CLE_LIGNE); } catch (e){}
    if (!silencieux) adresseJeu('');
    majNomsAdversaire();
  }
  function finLigne(titre, texte, classement){
    var L = ui.enLigne;
    if (L){ L.fini = true; clearTimeout(L.minuteur); try { if (L.ws) L.ws.close(); } catch (e){} }
    arreterFete();
    ui.occupe = true; marquer();
    ouvrirPanneau('<h2 id="titre-dialogue">' + titre + '</h2><p>' + texte + '</p>' +
      '<div class="pied">' + (classement ? '<button type="button" class="bouton-sec" id="b-classement-fin">Classement</button>' : '') +
      '<button type="button" class="bouton" id="b-fin-ligne">Menu</button></div>');
    $('b-fin-ligne').addEventListener('click', function(){ quitterLigne(); afficherAccueil(); });
    var bc = $('b-classement-fin'); if (bc) bc.addEventListener('click', function(){ quitterLigne(); ouvrirClassement(false); });
  }
  function perteConnexion(){ finLigne('Connexion perdue', 'Impossible de joindre le serveur de parties. Vérifie ta connexion, puis relance une partie.'); }

  async function recevoir(m){
    var L = ui.enLigne;
    switch (m.t){
      case 'cree':
        L.code = m.code; L.jeton = m.jeton; L.opts = m.opts; L.attente = true;
        ecrire(CLE_LIGNE, { code: m.code, jeton: m.jeton });
        adresseJeu(m.code);
        return montrerAttente();
      case 'rejoint':
        L.code = m.code; L.jeton = m.jeton; L.opts = m.opts;
        ecrire(CLE_LIGNE, { code: m.code, jeton: m.jeton });
        perchoir('Partie trouvée, on tire le lieu au sort…');
        return;
      case 'repris':
        L.essais = 0; L.opts = m.opts; L.attente = !!m.attente;
        if (L.attente) montrerAttente();
        return;
      case 'recherche': return montrerRecherche(m.enLigne);
      case 'trouve':
        L.code = m.code; L.jeton = m.jeton; L.opts = m.opts; L.classee = true; L.recherche = false;
        ecrire(CLE_LIGNE, { code: m.code, jeton: m.jeton });
        adresseJeu(m.code);
        S.jouer('jingle');
        perchoir('Adversaire trouvé !');
        return;
      case 'remplace': return finLigne('Recherche reprise ailleurs', 'Tu as lancé une partie rapide dans un autre onglet : elle continue là-bas.');
      case 'forfait':
        clearTimeout(L.minuteur);
        return finLigne(m.gagnant ? 'Victoire par forfait' : 'Temps écoulé', m.gagnant
          ? adv(true) + ' n’a pas joué à temps&nbsp;: la victoire est pour toi, et elle compte au classement.'
          : 'Tu n’as pas joué pendant trois minutes&nbsp;: la partie est perdue.', true);
      case 'classement': if (L.surClassement){ var g = L.surClassement; L.surClassement = null; g(m); } return;
      case 'debut': case 'etat':
        L.attente = false; L.essais = 0; L.recherche = false;
        if (m.adversaire) L.adversaire = m.adversaire;
        if (m.classee) L.classee = true;
        L.tempsCoup = m.tempsCoup || 0;
        return debutLigne(m, m.t === 'etat');
      case 'coup': return coupLigne(m);
      case 'plan': if (L.plan){ var f = L.plan; L.plan = null; f(m.top); } return;
      case 'envie': L.envies[m.quoi] = true; return afficherEnvie();
      case 'adversaire': return etatAdversaire(m.etat, m.forfait);
      case 'erreur':
        if (m.code === 'coup'){ ui.mode = null; ui.occupe = false; perchoir(m.raison); marquer(); return; }
        if (m.code === 'profil'){   // pseudo refusé ou déjà pris : on le corrige, puis on relance la même demande
          var demande = L.premier;
          quitterLigne(true);
          return ouvrirProfil(function(){ demarrerLigne(Object.assign({}, demande, { profil: profilServeur() })); }, m.raison);
        }
        return finLigne('Impossible de rejoindre', m.raison);
    }
  }

  function montrerAttente(){
    var L = ui.enLigne, lien = lienPartie(L.code);
    ouvrirPanneau('<h2 id="titre-dialogue">Défier un ami</h2><div data-garder>' +
      '<p>Envoie ce lien à ton ami&nbsp;: la partie commence dès qu’il l’ouvre.</p>' +
      '<p class="code-partie" aria-label="Code de la partie : ' + L.code.split('').join(' ') + '">' + L.code + '</p>' +
      '<p class="lien-partie"><input type="text" id="lien-ligne" readonly value="' + lien + '" aria-label="Lien de la partie"></p>' +
      '<p class="aide" id="attente-ligne" aria-live="polite">En attente de ton ami… Il peut aussi taper le code dans «&nbsp;En ligne&nbsp;».</p></div>' +
      '<div class="pied"><button type="button" class="bouton-sec" id="b-annuler-ligne">Annuler</button>' +
        (navigator.share ? '<button type="button" class="bouton-sec" id="b-partager-ligne">Partager</button>' : '') +
        '<button type="button" class="bouton" id="b-copier-ligne">Copier le lien</button></div>');
    perchoir('En attente de ton ami…');
    $('b-annuler-ligne').addEventListener('click', function(){ quitterLigne(); afficherAccueil(); ouvrirEnLigne(); });
    $('b-copier-ligne').addEventListener('click', function(){
      var champ = $('lien-ligne'), b = this;
      function ok(){ b.textContent = 'Lien copié'; S.jouer('clic'); }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(lien).then(ok, function(){ champ.select(); });
      else { champ.select(); try { if (document.execCommand('copy')) ok(); } catch (e){} }
    });
    var bp = $('b-partager-ligne');
    if (bp) bp.addEventListener('click', function(){ navigator.share({ title: 'Retourne ta veste', text: 'Je te défie à Retourne ta veste, le jeu de cartes de la présidentielle !', url: lien }).catch(function(){}); });
  }

  async function debutLigne(m, reprise){
    var L = ui.enLigne;
    quitterTuto();
    ui.variante = null; document.querySelector('#vue-jeu .arene').classList.remove('en-fleches');
    L.numero = m.numero; L.opts = m.opts; L.envies = {}; L.coupe = false;
    if (reprise && m.envies){ if (m.envies.revanche) L.envies.revanche = true; if (m.envies.second) L.envies.second = true; }
    arreterFete();
    if (!$('voile').hidden) fermerPanneau();
    ui.occupe = true; ui.sel = -1; ui.mode = null; ui.carriere = null; ui.revelees = {}; ui.derniereAction = [-1, -1]; ui.annulee = [-1, -1];
    ui.lieu = lieuParId(m.lieu); appliquerLieu();
    ui.bancs = {};
    Object.keys(m.bancs || {}).forEach(function(k){ ui.bancs[+k] = m.bancs[k]; });
    ui.premier = m.premier === 'moi' ? J : IA;
    majNomsAdversaire();
    if (!reprise && !m.second) await tirageAuSort(ui.premier);
    if (ui.enLigne !== L || L.numero !== m.numero) return;
    ui.s = etatDepuisVue(m.vue);
    if (!reprise) reinitAnecdotes();
    $('leg-coins').hidden = !L.opts.diagonales;
    $('journal').innerHTML = '';
    if (reprise) noter('Connexion rétablie.');
    else {
      noter(m.second ? 'Second tour&nbsp;: chacun reprend les cartes qu’il détient.' : 'Pile ou face&nbsp;: <b>' + (ui.premier === J ? 'tu commences' : adv() + ' commence') + '</b>.');
      var nb = Object.keys(ui.bancs).length;
      noter('Lieu&nbsp;: <b>' + ui.lieu.nom + '</b>' + (ui.s.taille === 4 ? ', ' + nb + ' places bloquées cette fois-ci, ' + ui.s.vides + ' libres.' : '.'));
    }
    rendreTout();
    return suite();
  }

  async function coupLigne(m){
    var L = ui.enLigne;
    if (!ui.s || m.numero !== L.numero) return;
    var c = m.coup, p = c.qui === 'moi' ? J : IA;
    effacerApercu();
    if (c.type === 'pose'){
      var avant = Array.prototype.slice.call(ui.s.own);
      ui.s = etatDepuisVue(m.vue);
      await animerPose(p, c.carte, c.cell, avant, m.evts);
    } else await jouerActionAnimee(p, c.a, c.arg, { vue: m.vue, evts: m.evts });
    return suite();
  }

  function attendreAdversaire(){
    ui.occupe = true; marquer();
    perchoir(ui.enLigne.coupe ? adv(true) + ' a perdu la connexion : on l’attend…' : adv(true) + ' réfléchit…');
  }
  function etatAdversaire(etat, forfait){
    var L = ui.enLigne;
    if (etat === 'arrive'){ var a = $('attente-ligne'); if (a) a.textContent = 'Ton ami est là, la partie commence !'; S.jouer('jingle'); return; }
    if (etat === 'coupe' || etat === 'revenu'){
      L.coupe = etat === 'coupe';
      if (ui.s && !ui.s.fin && ui.s.trait === IA) attendreAdversaire();
      else if (L.coupe) noter(adv(true) + ' a perdu la connexion. Deux minutes pour revenir.');
      if (etat === 'revenu') noter(adv(true) + ' est de retour.');
      return;
    }
    // parti, ou salle fermée faute d'activité
    if (etat === 'ferme') return finLigne('Partie fermée', 'La partie est restée trop longtemps sans activité.');
    if (forfait) return finLigne('Victoire par forfait', adv(true) + ' a quitté la partie&nbsp;: la victoire est pour toi, et elle compte au classement.', true);
    finLigne(adv(true) + ' a quitté la partie', 'Tu peux en lancer une autre.');
  }
  function afficherEnvie(){
    var L = ui.enLigne, el = $('envie-ligne');
    if (!L || !el) return;
    var moi = ($('b-revanche') || $('b-second') || {}).disabled;
    var quoi = L.envies.second ? 'le second tour' : L.envies.revanche ? 'sa revanche' : '';
    el.innerHTML = quoi ? (moi ? 'C’est parti !' : adv(true) + ' veut ' + quoi + '.') : (moi ? 'En attente de ' + adv() + '…' : '');
  }
  // Le Plan : les trois cartes de la pioche viennent du serveur, au moment de jouer la carte
  function demanderPlan(){
    ui.enLigne.plan = function(top){ ouvrirPlan(top); };
    envoyerLigne({ t: 'plan' });
  }
  function rejoindreLigne(code){
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length !== 4) return false;
    var m = memoLigne();
    if (ui.enLigne && ui.enLigne.code === code && !ui.enLigne.fini) return true;
    adresseJeu(code);
    if (m && m.code === code){ demarrerLigne({ t: 'reprendre', code: code, jeton: m.jeton }); perchoir('Retour dans la partie ' + code + '…'); return true; }
    avecProfil(function(){ demarrerLigne({ t: 'rejoindre', code: code, profil: profilServeur() }); perchoir('Connexion à la partie ' + code + '…'); });
    return true;
  }

  /* ---------- Profil, partie rapide, classement ---------- */
  var PR = window.HemicycleProfil, CLE_PROFIL = 'hemicycle-profil';
  function profil(){ var p = brut(CLE_PROFIL); return p && p.secret && p.pseudo && PR.avatarValide(p.avatar) ? p : null; }
  function profilServeur(){ var p = profil(); return p ? { secret: p.secret, pseudo: p.pseudo, avatar: p.avatar } : null; }
  function secretNeuf(){
    var b = new Uint8Array(24); (window.crypto || window.msCrypto).getRandomValues(b);
    return btoa(String.fromCharCode.apply(null, b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function personnalites(){ return CAND.map(function(c){ return [c.nom, c.court]; }).concat(ACT.map(function(a){ return [a.nom || '', a.court || '']; })); }
  function avecProfil(fn){ return profil() ? fn() : ouvrirProfil(fn); }
  // Choisir son pseudo et son avatar ; « Au hasard » pour qui a la flemme
  function ouvrirProfil(suite, message){
    var p = profil() || {}, pseudo = p.pseudo || '', av = p.avatar || PR.avatarAuHasard();
    ouvrirPanneau('<h2 id="titre-dialogue">Ton profil</h2><div data-garder>' +
      '<p class="aide">Ton pseudo et ton avatar apparaissent chez ton adversaire et dans le classement.</p>' +
      '<label class="sous-titre" for="champ-pseudo">Pseudo</label>' +
      '<p class="ligne-pseudo"><input type="text" id="champ-pseudo" maxlength="28" autocomplete="nickname" spellcheck="false" value="' + echapper(pseudo) + '" placeholder="Ton pseudo">' +
        '<button type="button" class="bouton-sec" id="b-pseudo-hasard">Au hasard</button></p>' +
      '<p class="aide fort" id="msg-pseudo" aria-live="polite">' + (message ? echapper(message) : '') + '</p>' +
      '<p class="sous-titre" id="t-avatar">Avatar</p><div class="choix-pictos" role="radiogroup" aria-labelledby="t-avatar">' +
        PR.PICTOS.map(function(x, i){ return '<button type="button" class="picto-av" data-i="' + i + '" role="radio" aria-checked="' + (i === av.i) + '" aria-label="' + x[0] + '"></button>'; }).join('') + '</div>' +
      '<div class="choix-couleurs" role="radiogroup" aria-label="Couleur de l’avatar">' +
        PR.COULEURS.map(function(x, k){ return '<button type="button" class="couleur-av" data-c="' + k + '" role="radio" aria-checked="' + (k === av.c) + '" aria-label="Couleur ' + (k + 1) + '" style="background:' + x[0] + '"></button>'; }).join('') + '</div>' +
      '<p class="apercu-profil" id="apercu-profil"></p>' +
      '<p class="aide">Rien d’autre n’est gardé&nbsp;: ni adresse e-mail, ni mot de passe. Ton profil vit dans ce navigateur.</p></div>' +
      '<div class="pied"><button type="button" class="bouton-sec" id="b-profil-annuler">Annuler</button><button type="button" class="bouton" id="b-profil-ok">Valider</button></div>');
    var champ = $('champ-pseudo');
    function maj(){
      Array.prototype.forEach.call($('dialogue').querySelectorAll('.picto-av'), function(b){
        var i = +b.dataset.i; b.setAttribute('aria-checked', i === av.i); b.innerHTML = PR.avatarHtml({ i: i, c: av.c }, 40);
      });
      Array.prototype.forEach.call($('dialogue').querySelectorAll('.couleur-av'), function(b){ b.setAttribute('aria-checked', +b.dataset.c === av.c); });
      $('apercu-profil').innerHTML = PR.avatarHtml(av, 34) + '<b>' + echapper(PR.nettoyer(champ.value) || '…') + '</b>';
    }
    maj();
    champ.addEventListener('input', function(){ $('msg-pseudo').textContent = ''; champ.removeAttribute('aria-invalid'); maj(); });
    $('b-pseudo-hasard').addEventListener('click', function(){ champ.value = PR.auHasard(); $('msg-pseudo').textContent = ''; S.jouer('clic'); maj(); });
    $('dialogue').querySelector('.choix-pictos').addEventListener('click', function(ev){ var b = ev.target.closest('.picto-av'); if (b){ av.i = +b.dataset.i; S.jouer('clic'); maj(); } });
    $('dialogue').querySelector('.choix-couleurs').addEventListener('click', function(ev){ var b = ev.target.closest('.couleur-av'); if (b){ av.c = +b.dataset.c; S.jouer('clic'); maj(); } });
    $('b-profil-annuler').addEventListener('click', function(){ ouvrirEnLigne(); });
    $('b-profil-ok').addEventListener('click', function(){
      var nom = PR.nettoyer(champ.value), raison = PR.refus(nom, personnalites());
      if (raison){ $('msg-pseudo').textContent = raison; champ.setAttribute('aria-invalid', 'true'); champ.focus(); return; }
      var ancien = profil();
      ecrire(CLE_PROFIL, { secret: ancien ? ancien.secret : secretNeuf(), pseudo: nom, avatar: { i: av.i, c: av.c } });
      fermerPanneau();
      if (suite) suite(); else ouvrirEnLigne();
    });
    champ.addEventListener('keydown', function(ev){ if (ev.key === 'Enter'){ ev.preventDefault(); $('b-profil-ok').click(); } });
    if (message){ champ.setAttribute('aria-invalid', 'true'); champ.focus(); }
  }
  function chercherPartie(){
    demarrerLigne({ t: 'chercher', profil: profilServeur() });
    perchoir('Recherche d’un adversaire…');
    montrerRecherche(0);
  }
  function montrerRecherche(n){
    var p = profil();
    ouvrirPanneau('<h2 id="titre-dialogue">Partie rapide</h2><div data-garder>' +
      '<p class="recherche"><span class="points" aria-hidden="true"><i></i><i></i><i></i></span> Recherche d’un adversaire…</p>' +
      '<p class="aide" aria-live="polite">' + (n ? n + ' joueur' + (n > 1 ? 's' : '') + ' connecté' + (n > 1 ? 's' : '') + '. ' : '') + 'La partie commence dès qu’un autre joueur lance une partie rapide.</p>' +
      (p ? '<p class="apercu-profil">' + PR.avatarHtml(p.avatar, 34) + '<b>' + echapper(p.pseudo) + '</b></p>' : '') +
      '<p class="aide">Règles standard&nbsp;: grand plateau, lieu tiré au sort, cartes données à égalité, toutes les règles et les cartes action. Trois minutes au plus pour jouer chaque coup.</p></div>' +
      '<div class="pied"><button type="button" class="bouton-sec" id="b-annuler-recherche">Annuler</button></div>');
    $('b-annuler-recherche').addEventListener('click', function(){ envoyerLigne({ t: 'annuler' }); quitterLigne(); afficherAccueil(); ouvrirEnLigne(); });
  }
  function texteRang(m){
    var n = m.v + m.d + m.e;
    if (!n) return 'Pas encore classé&nbsp;: une partie rapide et tu y es.';
    return 'Ton classement&nbsp;: <b>' + (m.rang === 1 ? '1<sup>er</sup>' : m.rang + '<sup>e</sup>') + '</b>, ' + m.v + ' victoire' + (m.v > 1 ? 's' : '') + ' sur ' + n + ' partie' + (n > 1 ? 's' : '') + '.';
  }
  // Une connexion courte suffit pour lire le classement hors partie
  function demanderClassement(fn, message){
    var p = profil(), m = message || { t: 'classement', profil: p ? { secret: p.secret } : null }, fini = false;
    function fin(x){ if (!fini){ fini = true; fn(x); } }
    if (ui.enLigne && ui.enLigne.ws && ui.enLigne.ws.readyState === 1 && !message){ ui.enLigne.surClassement = fin; envoyerLigne(m); return; }
    var ws;
    try { ws = new WebSocket(adresseWs()); } catch (e){ return fin(null); }
    var t = setTimeout(function(){ try { ws.close(); } catch (e){} fin(null); }, 7000);
    ws.onopen = function(){ ws.send(JSON.stringify(m)); };
    ws.onmessage = function(ev){ var x; try { x = JSON.parse(ev.data); } catch (e){ return; } clearTimeout(t); try { ws.close(); } catch (e){} fin(x); };
    ws.onerror = function(){ clearTimeout(t); fin(null); };
  }
  function ouvrirClassement(retour){
    ouvrirPanneau('<h2 id="titre-dialogue">Classement</h2><p class="aide" aria-live="polite">Chargement…</p>' +
      '<div class="pied"><button type="button" class="bouton" id="b-classement-retour">' + (retour ? 'Retour' : 'Fermer') + '</button></div>');
    function brancherRetour(){ $('b-classement-retour').addEventListener('click', function(){ if (retour) ouvrirEnLigne(); else fermerPanneau(); }); }
    brancherRetour();
    demanderClassement(function(c){
      if ($('titre-dialogue') == null || $('titre-dialogue').textContent !== 'Classement') return;
      if (!c || c.t !== 'classement'){ $('dialogue').querySelector('.aide').textContent = 'Classement indisponible pour le moment.'; return; }
      var p = profil(), moi = c.moi, arme = false;
      $('dialogue').innerHTML = '<h2 id="titre-dialogue">Classement</h2>' +
        '<p class="aide">Les victoires en partie rapide. ' + c.total + ' joueur' + (c.total > 1 ? 's' : '') + ' classé' + (c.total > 1 ? 's' : '') + ', ' + c.enLigne + ' connecté' + (c.enLigne > 1 ? 's' : '') + ' en ce moment.</p>' +
        (c.top.length ? '<ol class="classement">' + c.top.map(function(x, k){
          var c1 = moi && x[0] === moi.pseudo;
          return '<li' + (c1 ? ' class="moi"' : '') + '><span class="rang">' + (k + 1) + '</span>' + PR.avatarHtml(x[1], 28) + '<span class="pseudo">' + echapper(x[0]) + '</span>' +
            '<span class="score" title="' + x[2] + ' victoire' + (x[2] > 1 ? 's' : '') + ' sur ' + x[3] + ' partie' + (x[3] > 1 ? 's' : '') + '"><b>' + x[2] + '</b><span class="mot"> victoire' + (x[2] > 1 ? 's' : '') + '</span><small> / ' + x[3] + '</small></span></li>';
        }).join('') + '</ol>' : '<p>Personne n’est encore classé. La première partie rapide ouvre le bal.</p>') +
        '<p class="aide fort">' + (moi ? texteRang(moi) : p ? 'Pas encore classé&nbsp;: une partie rapide et tu y es.' : 'Pas encore de profil&nbsp;: tu le choisis au moment de jouer en ligne.') + '</p>' +
        '<div class="pied">' + (p ? '<button type="button" class="bouton-sec" id="b-oublier">Effacer mon profil</button><button type="button" class="bouton-sec" id="b-mon-profil">Mon profil</button>' : '') +
        '<button type="button" class="bouton" id="b-classement-retour">' + (retour ? 'Retour' : 'Fermer') + '</button></div>';
      brancherRetour();
      var bp = $('b-mon-profil'); if (bp) bp.addEventListener('click', function(){ ouvrirProfil(function(){ envoyerProfil(); ouvrirClassement(retour); }); });
      var bo = $('b-oublier');
      if (bo) bo.addEventListener('click', function(){
        if (!arme){ arme = true; bo.textContent = 'Sûr ? Profil et résultats effacés'; return; }
        demanderClassement(function(){ try { localStorage.removeItem(CLE_PROFIL); } catch (e){} ouvrirClassement(retour); }, { t: 'oublier', profil: { secret: p.secret } });
      });
    });
  }
  // Un pseudo changé hors partie est envoyé tout de suite, pour que le classement suive
  function envoyerProfil(){ var p = profilServeur(); if (p) demanderClassement(function(){}, { t: 'profil', profil: p }); }

  /* ---------- Événements ---------- */
  function brancher(){
    $('plateau').addEventListener('click', function(ev){
      if (ui.ignorerClic) return;
      var el = ev.target.closest('.case'); if (!el) return;
      var i = +el.dataset.i, s = ui.s; if (!s) return;
      if (ui.mode){ if ((ui.mode.ciblesCases || []).indexOf(i) >= 0) clicCible('case', i); return; }
      if (s.own[i] === M.BANC){ var b = bancDe(i); perchoir(b.nom + '\u00a0: ' + b.detail); return; }
      if (s.own[i] >= 0){ montrerCarte(s.crd[i]); return; }
      if (!ui.occupe && !s.fin && s.trait === J && ui.sel >= 0 && tutoPermet(ui.sel, i)) jouerCoup(ui.sel, i);
    });
    if (survol){
      $('plateau').addEventListener('mouseover', function(ev){ var el = ev.target.closest('.case.libre'); if (el) apercu(+el.dataset.i); });
      $('plateau').addEventListener('mouseleave', function(){ effacerApercu(); if (ui.s && !ui.occupe && !ui.mode && !ui.s.fin && ui.s.trait === J) perchoir(messageTour()); });
    }
    $('plateau').addEventListener('focusin', function(ev){ var el = ev.target.closest('.case.libre'); if (el) apercu(+el.dataset.i); });
    $('main-joueur').addEventListener('click', function(ev){
      if (ui.ignorerClic) return;
      var el = ev.target.closest('.carte-main'); if (!el || el.disabled) return;
      var c = +el.dataset.c, s = ui.s;
      if (ui.mode){ if ((ui.mode.ciblesMain || []).indexOf(c) >= 0) clicCible('main', c); return; }
      if (ui.occupe || s.trait !== J) return;
      ui.sel = ui.sel === c ? -1 : c;
      if (ui.sel >= 0) S.jouer('clic');
      effacerApercu(); rendreMains();
      var nouv = $('main-joueur').querySelector('[data-c="' + c + '"]'); if (nouv) nouv.focus();
      perchoir(messageTour());
    });
    brancherGlisser();
    $('main-ia').addEventListener('click', function(ev){
      var el = ev.target.closest('.carte-main'); if (!el || !ui.mode) return;
      var c = +el.dataset.c;
      if ((ui.mode.ciblesIA || []).indexOf(c) >= 0) clicCible('ia', c);
    });
    $('action-joueur').addEventListener('click', function(ev){ if (ev.target.closest('#b-action')) ouvrirAction(); });
    $('b-annuler').addEventListener('click', annulerMode);
    $('b-details').addEventListener('click', function(){ if (ui.sel >= 0) montrerCarte(ui.sel); });
    $('b-accueil').addEventListener('click', allerAccueil);
    window.addEventListener('popstate', function(){
      if ($('vue-jeu').hidden || !/^#jouer/.test(location.hash)) return;
      if (!(history.state && history.state.vue === 'partie') && !surAccueil()) afficherAccueil();
    });
    $('t-reprendre').addEventListener('click', reprendre);
    $('t-tuto').addEventListener('click', lancerTuto);
    $('tuto-suivant').addEventListener('click', function(){
      var T = ui.tuto, f = T && T.suivant;
      if (!f) return;
      T.suivant = null; S.jouer('clic'); f();
    });
    $('tuto-passer').addEventListener('click', function(){ ecrire(ui.tuto && ui.tuto.lecons === TUTO_FL ? 'hemicycle-tuto-fleches' : CLE_TUTO, { passe: 1 }); quitterTuto(); allerAccueil(); });
    $('t-solo').addEventListener('click', ouvrirSolo);
    $('t-ligne').addEventListener('click', ouvrirMulti);
    $('t-deck').addEventListener('click', function(){ ouvrirClasseur(); });
    $('t-options').addEventListener('click', ouvrirOptions);
    $('b-credits').addEventListener('click', ouvrirCredits);
    // Trophées : l'état de l'appareil, complété par ce que le jeu savait déjà (parties d'avant leur arrivée)
    if (window.HemicycleTrophees){
      try {
        TR = window.HemicycleTrophees.local({ actions: ACT.length, cartes: CAND.length, lieux: LIEUX.length });
        var clT = classeur();
        TR.rattraper({ victoires: bilan.v, parties: bilan.v + bilan.d + bilan.n, tuto: tutoFait(), carriere: !!(clT.manches || clT.gains || clT.pertes), prise: clT.gains > 0, deck: clT.cartes.length, album: (clT.album || []).length });
        TR.verifier();   // sans bannière : ce sont des trophées déjà mérités
      } catch (e){ TR = null; }
    }
    var tt = $('t-trophees');
    if (tt){ tt.hidden = !TR; tt.addEventListener('click', ouvrirTrophees); majTuileTrophees(); }
    // Sons : un bouton pour les couper, réglage mémorisé ; le premier geste dans le jeu les autorise
    var bs = $('b-son');
    if (bs){
      bs.addEventListener('click', function(){ S.regler(!S.actif()); majSon(); S.jouer('clic'); });
      majSon();
    }
    $('vue-jeu').addEventListener('pointerdown', function(){ S.deverrouiller(); }, { once: true });
    $('b-calcul').addEventListener('click', ouvrirCalcul);
    $('voile').addEventListener('click', function(ev){
      if (ev.target.closest('[data-calcul]')) return ouvrirCalcul();
      if (ev.target.closest('[data-fermer]')) return fermerPanneau();
      if (ev.target.closest('a[href="#methode"]')) fermerPanneau();
    });
    document.addEventListener('keydown', function(ev){
      if (ev.key !== 'Escape' || $('vue-jeu').hidden) return;
      if (!$('voile').hidden && !$('dialogue').querySelector('.vivier, [data-garder]')) return fermerPanneau();
      if (ui.mode) return annulerMode();
      if (ui.sel >= 0){ ui.sel = -1; rendreMains(); suite(); }
    });
  }

  /* ---------- Glisser-déposer : de la main vers un siège libre (souris, doigt ou stylet) ---------- */
  function brancherGlisser(){
    var gl = null;
    function survoler(i){
      if (!gl || gl.cible === i) return;
      gl.cible = i;
      var anc = $('plateau').querySelector('.case.survolee'); if (anc) anc.classList.remove('survolee');
      if (i >= 0){
        var el = $('plateau').querySelector('.case[data-i="' + i + '"]'); if (el) el.classList.add('survolee');
        apercu(i);
      } else { effacerApercu(); perchoir(messageTour()); }
    }
    function nettoyer(){
      if (!gl) return;
      if (gl.fantome && gl.fantome.parentNode){ gl.fantome.parentNode.removeChild(gl.fantome); repeindre(); }
      gl.el.classList.remove('glisse');
      document.body.classList.remove('glisse-en-cours');
      var anc = $('plateau').querySelector('.case.survolee'); if (anc) anc.classList.remove('survolee');
      effacerApercu();
      gl = null;
    }
    $('main-joueur').addEventListener('dragstart', function(ev){ ev.preventDefault(); });
    $('main-joueur').addEventListener('pointerdown', function(ev){
      if (ev.pointerType === 'mouse' && ev.button !== 0) return;
      var el = ev.target.closest('.carte-main'), s = ui.s;
      if (!el || el.disabled || !s || ui.mode || ui.occupe || s.fin || s.trait !== J) return;
      gl = { c: +el.dataset.c, el: el, x0: ev.clientX, y0: ev.clientY, id: ev.pointerId, actif: false, cible: -1, fantome: null };
    });
    document.addEventListener('pointermove', function(ev){
      if (!gl || ev.pointerId !== gl.id) return;
      if (!gl.actif){
        var dx = ev.clientX - gl.x0, dy = ev.clientY - gl.y0;
        if (dx * dx + dy * dy < 49) return;
        gl.actif = true;
        ui.sel = gl.c;
        var r = gl.el.getBoundingClientRect(), f = document.createElement('div');
        f.className = 'fantome'; f.style.width = r.width + 'px'; f.setAttribute('aria-hidden', 'true');
        f.innerHTML = gl.el.innerHTML;
        document.body.appendChild(f);
        gl.fantome = f; gl.w = r.width; gl.h = r.height;
        gl.el.classList.add('glisse'); document.body.classList.add('glisse-en-cours');
        marquer();
      }
      ev.preventDefault();
      gl.fantome.style.transform = 'translate(' + (ev.clientX - gl.w / 2) + 'px,' + (ev.clientY - gl.h * 0.55) + 'px) rotate(-4deg) scale(1.06)';
      var sous = document.elementFromPoint(ev.clientX, ev.clientY);
      var cas = sous && sous.closest ? sous.closest('#plateau .case') : null;
      survoler(cas && ui.s.own[+cas.dataset.i] === -1 && tutoPermet(gl.c, +cas.dataset.i) ? +cas.dataset.i : -1);
    }, { passive: false });
    document.addEventListener('pointerup', function(ev){
      if (!gl || ev.pointerId !== gl.id) return;
      if (!gl.actif){ gl = null; return; }   // simple clic : le gestionnaire de clic s'en occupe
      var carte = gl.c, cible = gl.cible, s = ui.s;
      nettoyer();
      ui.ignorerClic = true; setTimeout(function(){ ui.ignorerClic = false; }, 0);
      if (cible >= 0 && s.own[cible] === -1 && !ui.occupe && !s.fin && s.trait === J && tutoPermet(carte, cible)) jouerCoup(carte, cible);
      else { rendreMains(); perchoir(messageTour()); }
    });
    document.addEventListener('pointercancel', function(ev){
      if (!gl || ev.pointerId !== gl.id) return;
      var actif = gl.actif; nettoyer();
      if (actif){ rendreMains(); perchoir(messageTour()); }
    });
  }

  var branche = false;
  // Une fois par lancement : les premières notes de La Marseillaise. Dans un navigateur, le son attend le premier toucher.
  function ouverture(){
    if (S.enMarche && S.enMarche()) return S.jouer('ouverture');
    function auToucher(){
      document.removeEventListener('pointerdown', auToucher, true);
      if (!$('vue-jeu').hidden) S.jouer('ouverture');
    }
    document.addEventListener('pointerdown', auToucher, true);
  }

  window.HemicycleJeu = {
    fermer: function(){ arreterFete(); if (!$('voile').hidden) fermerPanneau(); if ($('tirage')) $('tirage').hidden = true; },
    ouvrir: function(code){
      if (!branche){ brancher(); appliquerLieu(); branche = true; ouverture(); }
      if (code && ADRESSE_WS){ ui.dejaOuvert = true; if (rejoindreLigne(code)) return; }
      if (ui.enLigne && ui.enLigne.attente){ afficherJeu(); return montrerAttente(); }
      if (!ui.s && !ui.enLigne && !ui.tuto && restaurerPartie()){ ecrire(CLE_VENU, 1); return reprendre(); }   // partie laissée en plan : on y retourne directement
      if (premiereVisite()){ ecrire(CLE_VENU, 1); afficherAccueil(); return accueillir(); }
      ecrire(CLE_VENU, 1);
      if (enPartie() && !surAccueil()) afficherJeu(); else afficherAccueil();
    }
  };
})();
