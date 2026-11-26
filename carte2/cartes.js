/* Rendu des cartes (recto candidat, recto action, dos guilloché) : partagé par la collection et le jeu. */
(function(){
  var D = window.APDA, VERIFIE = D.VERIFIE;

  function chiffre(v){ return String(v); }
  // Couleur du bord : le bloc officiel ; vert pour le parti Les Écologistes, classé à gauche
  function sans(t){ return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-'); }
  function teinte(c){ return /Écologistes/.test(c.blocSource) ? 'ecolo' : sans(c.bloc); }
  var POSITION = { 'extreme-gauche': 7, 'gauche': 28, 'centre': 50, 'droite': 72, 'extreme-droite': 93 };
  function axe(c){
    var x = POSITION[sans(c.bloc)];
    if (x == null) return '<span class="type">Carte candidat</span>';
    return '<span class="axe" aria-hidden="true" style="--x:' + x + '%"><i></i></span>';
  }
  // Pictogrammes des quatre côtés : urne, hémicycle, mairie, loupe
  var IC = '<svg class="picto" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">';
  var PICTOS = [
    IC + '<path d="M8 11.5V3.5h8v8"/><path d="M3.5 11.5h17v9h-17z"/><path d="M9 16h6"/></svg>',
    IC + '<path d="M3 9.5 12 4l9 5.5"/><path d="M5.5 11v6.5M10 11v6.5M14 11v6.5M18.5 11v6.5"/><path d="M3 20.5h18"/></svg>',
    IC + '<path d="M4.5 20.5v-9L12 7l7.5 4.5v9z"/><path d="M10 20.5v-5h4v5"/><path d="M12 7V2.5l4 1.5-4 1.5"/></svg>',
    IC + '<circle cx="10.5" cy="10.5" r="6.2"/><path d="M15.2 15.2 21 21"/></svg>'
  ];
  var FLECHES = ['↑', '→', '↓', '←'];
  function nombre(x){ return x.toLocaleString('fr-FR'); }
  // Le fait brut derrière chacun des quatre chiffres d'une carte
  function faits(c){
    var m = c.methode;
    return [
      m.voix ? nombre(m.voix) + ' voix, ' + m.election : m.election.charAt(0).toUpperCase() + m.election.slice(1),
      m.national ? nombre(m.national) + ' ans de mandat national' : 'Aucun mandat national',
      m.local ? nombre(m.local) + ' ans d’élu local' : 'Aucun mandat local',
      nombre(m.vues) + ' consultations de sa page Wikipédia par mois'
    ];
  }
  // Présidentielles déjà disputées (candidatures officielles avant 2027)
  function etoiles(c){ return c.annees.filter(function(a){ return /^20(0|1|2[0-2])/.test(a) && a.indexOf('2027') < 0; }).length; }
  function liens(c){ return c.sources.map(function(s){ return '<a href="' + s[1] + '" rel="noopener">' + s[0] + '</a>'; }).join(' · '); }
  function portrait(c, coin){
    return '<figure class="portrait"><img src="' + c.image + '" width="640" height="960" loading="lazy" decoding="async" alt="Portrait illustré de ' + c.nom + ', généré par IA">' + coin +
      '<span class="etiquette">' + c.etiquette + '</span><span class="tampon">' + c.tampon + '</span></figure>';
  }
  // Chaque chiffre sur le bord qu'il défend, avec son picto : ↑ en haut de la carte, → à droite, ↓ en bas, ← à gauche
  var COTE = ['h', 'd', 'b', 'g'];
  function pastille(c, i, f, cache){
    var v = c.valeurs[i];
    return '<b class="cote cote-' + COTE[i] + '" title="' + FLECHES[i] + ' ' + D.COTES[i] + ' ' + chiffre(v) + ' : ' + f[i] + '"' + (cache ? ' aria-hidden="true"' : '') + '>' + PICTOS[i] + '<span>' + chiffre(v) + '</span></b>';
  }

  function rectoAction(c, cache){
    var bloc = c.texte ? '<p>' + c.texte + '</p>' : '';
    if (c.barres){
      bloc += c.barres.lignes.map(function(l){
        return '<div class="ligne' + (l[2] ? ' elle' : '') + '"><span>' + l[0] + '</span><span class="barre"><i style="--v:' + l[1] + ';--max:' + c.barres.max + '"></i></span><b>' + (l[3] || l[1]) + '</b></div>';
      }).join('');
    }
    if (c.frise){
      bloc += '<ol class="frise">' + c.frise.map(function(f){ return '<li><b>' + f[0] + '</b><span>' + f[1] + '</span></li>'; }).join('') + '</ol>';
    }
    return '<article class="face recto"' + (cache ? ' aria-hidden="true"' : '') + ' aria-label="Carte action ' + c.code + ', ' + c.nom + '">' +
      '<div class="haut"><span class="type">' + c.type + '</span><span class="code">' + c.code + '</span></div>' +
      '<div class="panneau">' + portrait(c, '') +
        '<div class="infos">' +
          '<div class="identite"><h3>' + c.nom + '</h3><p class="role">' + c.role + '</p></div>' +
          '<div class="pouvoir"><p>' + c.pouvoir + '</p><p class="petit">' + c.petit + '</p></div>' +
          '<div class="vraie-vie"><p class="lib">' + c.vraieVie + '</p>' + bloc + '</div>' +
          '<p class="sources">Sources&nbsp;: ' + liens(c) + ' · vérifié le ' + (c.verifie || VERIFIE) + '</p>' +
        '</div>' +
      '</div></article>';
  }

  function rectoCandidat(c, cache){
    var v = c.valeurs, n = D.COTES, f = faits(c);
    var valeurs = '<span class="bords" role="img" aria-label="Valeurs : ' + n[0] + ' ' + v[0] + ' en haut, ' + n[1] + ' ' + v[1] + ' à droite, ' + n[2] + ' ' + v[2] + ' en bas, ' + n[3] + ' ' + v[3] + ' à gauche">' +
      [1, 2, 3].map(function(i){ return pastille(c, i, f); }).join('') + '</span>';
    var annees = c.annees.map(function(a, i){ return i === c.annees.length - 1 ? '<b>' + a + '</b>' : a; }).join(' · ');
    // Texte long (justice et phrase) : la carte resserre un peu ses caractères pour que tout tienne
    var long = (c.justice + (c.phrase || '')).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').length > 240;
    return '<article class="face recto candidat' + (long ? ' dense' : '') + '" data-bloc="' + teinte(c) + '"' + (cache ? ' aria-hidden="true"' : '') + ' aria-label="Carte candidat, ' + c.nom + ', bloc ' + c.bloc + '">' +
      '<div class="haut">' + axe(c) + pastille(c, 0, f, true) + '<span class="bloc">' + c.bloc + '</span></div>' +
      '<div class="panneau">' + portrait(c, valeurs) +
        '<div class="infos">' +
          '<div class="identite"><h3>' + c.nom + '</h3><p class="role">' + c.role + '</p></div>' +
          '<blockquote class="phrase"><p>«&nbsp;' + c.phrase + '&nbsp;»</p><footer>' + c.quand + '</footer></blockquote>' +
          '<dl class="faits">' +
            '<div><dt>Élysée</dt><dd class="annees">' + annees + '</dd></div>' +
            '<div><dt>Justice</dt><dd>' + c.justice + '</dd></div>' +
          '</dl>' +
          '<p class="sources">Bloc&nbsp;: ' + c.blocSource + ' · Sources&nbsp;: ' + liens(c) + ' · vérifié le ' + (c.verifie || VERIFIE) + '</p>' +
        '</div>' +
      '</div></article>';
  }

  function dos(cache){ return '<article class="face dos"' + (cache ? ' aria-hidden="true"' : ' aria-label="Dos de carte, commun à tout le jeu"') + '><svg class="guilloche" viewBox="0 0 200 320" aria-hidden="true"></svg></article>'; }

  // Dos guilloché
  var NS = 'http://www.w3.org/2000/svg';
  var JAUNE = '#f1fb4e', PAPIER = '#f8f9f6', ENCRE = '#15171a', compteur = 0;
  function el(tag, attrs, parent){ var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function anneau(cx, cy, R, a, n, ph){
    var d = '', N = 720;
    for (var i = 0; i <= N; i++){ var t = i / N * 2 * Math.PI, r = R + a * Math.sin(n * t + ph); d += (i ? 'L' : 'M') + (cx + r * Math.cos(t)).toFixed(2) + ' ' + (cy + r * Math.sin(t)).toFixed(2); }
    return d + 'Z';
  }
  function onde(x0, x1, y, a, per, ph){
    var d = '', N = 220;
    for (var i = 0; i <= N; i++){ var x = x0 + (x1 - x0) * i / N; d += (i ? 'L' : 'M') + x.toFixed(2) + ' ' + (y + a * Math.sin(x / per + ph)).toFixed(2); }
    return d;
  }
  function dessinerDos(svg){
    if (svg.childNodes.length) return;
    var idx = compteur++;
    var g = el('g', {fill:'none', 'stroke-linecap':'round'}, svg), k;
    el('rect', {x:7, y:7, width:186, height:306, rx:9, stroke:JAUNE, 'stroke-opacity':.85, 'stroke-width':.8}, g);
    el('rect', {x:11, y:11, width:178, height:298, rx:6, stroke:JAUNE, 'stroke-opacity':.45, 'stroke-width':.4}, g);
    for (k = 0; k < 6; k++){
      el('path', {d:onde(15, 185, 50, 3.2, 4.2, k * Math.PI / 3), stroke:JAUNE, 'stroke-opacity':.5, 'stroke-width':.35}, g);
      el('path', {d:onde(15, 185, 270, 3.2, 4.2, k * Math.PI / 3), stroke:JAUNE, 'stroke-opacity':.5, 'stroke-width':.35}, g);
    }
    for (k = 0; k < 18; k++) el('path', {d:anneau(100, 160, 62, 7, 18, k * 2 * Math.PI / 18), stroke:JAUNE, 'stroke-opacity':.55, 'stroke-width':.3}, g);
    for (k = 0; k < 12; k++) el('path', {d:anneau(100, 160, 42, 4.5, 10, k * 2 * Math.PI / 12), stroke:PAPIER, 'stroke-opacity':.42, 'stroke-width':.3}, g);
    [[28, 30], [172, 30], [28, 290], [172, 290]].forEach(function(c){
      for (var j = 0; j < 8; j++) el('path', {d:anneau(c[0], c[1], 9, 3, 6, j * Math.PI / 4), stroke:JAUNE, 'stroke-opacity':.6, 'stroke-width':.3}, g);
    });
    // Emblème : deux flèches qui tournent, une carte qui se retourne (« Retourne ta veste ») dans un médaillon
    el('circle', {cx:100, cy:160, r:24, fill:JAUNE, stroke:ENCRE, 'stroke-width':1}, svg);
    el('circle', {cx:100, cy:160, r:21, fill:'none', stroke:ENCRE, 'stroke-width':.4}, svg);
    el('rect', {x:94.5, y:152.5, width:11, height:15, rx:1.8, fill:'none', stroke:ENCRE, 'stroke-width':1.8, transform:'rotate(-14 100 160)'}, svg);
    el('path', {d:'M86.0 153.4 A 15.5 15.5 0 0 1 113.4 152.2', fill:'none', stroke:ENCRE, 'stroke-width':2.4, 'stroke-linecap':'round'}, svg);
    el('path', {d:'M114.0 166.6 A 15.5 15.5 0 0 1 86.6 167.8', fill:'none', stroke:ENCRE, 'stroke-width':2.4, 'stroke-linecap':'round'}, svg);
    el('polygon', {points:'115.2,155.4 115.7,150.2 110.5,153.2', fill:ENCRE}, svg);
    el('polygon', {points:'84.8,164.6 84.3,169.8 89.5,166.8', fill:ENCRE}, svg);
    var defs = el('defs', {}, svg), id = 'cercle-texte-' + idx;
    el('path', {id:id, d:'M100 160 m-31 0 a31 31 0 1 1 62 0 a31 31 0 1 1 -62 0'}, defs);
    var texte = el('text', {'font-family':'JetBrains Mono, ui-monospace, monospace', 'font-size':4.6, 'font-weight':700, fill:PAPIER}, svg);
    var tp = el('textPath', {href:'#' + id, textLength:190, lengthAdjust:'spacing'}, texte);
    tp.textContent = 'RETOURNE TA VESTE · PRÉSIDENTIELLE 2027 · ';
  }
  function dessinerTousLesDos(racine){ Array.prototype.forEach.call((racine || document).querySelectorAll('svg.guilloche'), dessinerDos); }

  window.APDA_RENDU = { chiffre: chiffre, teinte: teinte, PICTOS: PICTOS, FLECHES: FLECHES, faits: faits, etoiles: etoiles, nombre: nombre, rectoAction: rectoAction, rectoCandidat: rectoCandidat, dos: dos, dessinerTousLesDos: dessinerTousLesDos };
})();
