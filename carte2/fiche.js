/* Fiche détaillée d'une carte candidat : le verso factuel, ouvert depuis la collection.
   Deux onglets, Parcours et Idées. Les données viennent de fiches.js, l'export public :
   il ne contient que ce qui a été validé, et aucune donnée judiciaire à ce stade.
   Tout est écrit en textContent : aucun texte des données n'est interprété comme du HTML. */
(function(){
  var D = window.APDA;
  if (!D || !D.FICHES || !D.CANDIDATS) return;

  function cle(n){ return String(n).replace(/‑/g, '-').normalize('NFC'); }
  var FICHES = {}, CARTES = {};
  Object.keys(D.FICHES).forEach(function(n){ FICHES[cle(n)] = D.FICHES[n]; });
  D.CANDIDATS.forEach(function(c){ CARTES[cle(c.nom)] = c; });

  var THEMES = [['retraites', 'Retraites'], ['depenses', 'Dépenses publiques'], ['energie', 'Énergie'], ['immigration', 'Immigration'], ['ecole', 'École']];
  // Même couleur de bord que la carte (cartes.js) : le bloc officiel, vert pour Les Écologistes
  function sans(t){ return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-'); }
  function teinte(c){ return /Écologistes/.test(c.blocSource || '') ? 'ecolo' : sans(c.bloc); }

  function el(tag, cls, texte){
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (texte != null) e.textContent = texte;
    return e;
  }
  function lien(s){
    var a = el('a', null, s[0] + (s[2] ? ', ' + s[2] : ''));
    a.href = s[1]; a.rel = 'noopener'; a.target = '_blank';
    return a;
  }
  function rubrique(titre){ return el('h3', 'fiche-rub', titre); }

  // ---- la boîte de dialogue, créée une fois
  var dlg = el('dialog', 'fiche');
  dlg.setAttribute('aria-labelledby', 'fiche-titre');
  dlg.innerHTML =
    '<div class="fiche-carte">' +
      '<header class="fiche-tete">' +
        '<img class="fiche-mini" alt="" width="240" height="300">' +
        '<div class="fiche-id"><p class="fiche-type"></p><h2 id="fiche-titre"></h2><p class="fiche-statut"></p></div>' +
        '<button type="button" class="fiche-fermer" aria-label="Fermer la fiche">×</button>' +
      '</header>' +
      '<div class="fiche-onglets" role="tablist" aria-label="Rubriques de la fiche">' +
        '<button type="button" role="tab" id="fo-parcours" aria-controls="fp-parcours" aria-selected="true">Parcours</button>' +
        '<button type="button" role="tab" id="fo-idees" aria-controls="fp-idees" aria-selected="false" tabindex="-1">Idées</button>' +
      '</div>' +
      '<section class="fiche-panneau" role="tabpanel" id="fp-parcours" aria-labelledby="fo-parcours" tabindex="0"></section>' +
      '<section class="fiche-panneau" role="tabpanel" id="fp-idees" aria-labelledby="fo-idees" tabindex="0" hidden></section>' +
      '<footer class="fiche-pied"></footer>' +
    '</div>';
  document.body.appendChild(dlg);
  var onglets = [].slice.call(dlg.querySelectorAll('[role="tab"]'));
  var declencheur = null;

  function choisir(o, focus){
    onglets.forEach(function(x){
      var oui = x === o;
      x.setAttribute('aria-selected', String(oui));
      x.tabIndex = oui ? 0 : -1;
      dlg.querySelector('#' + x.getAttribute('aria-controls')).hidden = !oui;
    });
    if (focus) o.focus();
  }
  onglets.forEach(function(o, i){
    o.addEventListener('click', function(){ choisir(o, false); });
    o.addEventListener('keydown', function(e){
      var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!n) return;
      e.preventDefault();
      choisir(onglets[(i + n + onglets.length) % onglets.length], true);
    });
  });
  dlg.querySelector('.fiche-fermer').addEventListener('click', function(){ dlg.close(); });
  dlg.addEventListener('click', function(e){ if (e.target === dlg) dlg.close(); });   // clic sur le fond
  dlg.addEventListener('close', function(){ if (declencheur) declencheur.focus(); });

  function parcours(f){
    var p = el('div');
    var id = f.identite || {}, lignes = [['Naissance', id.naissance], ['Formation', id.formation], ['Parti', id.parti]].filter(function(x){ return x[1]; });
    if (lignes.length){
      p.appendChild(rubrique('Identité'));
      var dl = el('dl', 'fiche-id-liste');
      lignes.forEach(function(x){ dl.appendChild(el('dt', null, x[0])); dl.appendChild(el('dd', null, x[1])); });
      p.appendChild(dl);
    }
    if (f.mandats && f.mandats.length){
      p.appendChild(rubrique('Mandats et fonctions'));
      var ol = el('ol', 'fiche-frise');
      f.mandats.forEach(function(m){
        var li = el('li');
        li.appendChild(el('b', null, m.periode));
        li.appendChild(el('span', null, m.intitule));
        ol.appendChild(li);
      });
      p.appendChild(ol);
    }
    p.appendChild(rubrique('Au Parlement'));
    var parl = el('p', 'fiche-encart', (f.parlement && f.parlement.detail) || 'Pas de mandat parlementaire en cours.');
    if (f.parlement && f.parlement.lien_votes){
      parl.appendChild(document.createTextNode(' '));
      var a = lien(['Ses votes sur le site officiel', f.parlement.lien_votes]);
      parl.appendChild(a);
    }
    p.appendChild(parl);
    if (f.mandats_sources && f.mandats_sources.length){
      var s = el('p', 'fiche-sources', 'Sources : ');
      f.mandats_sources.forEach(function(x, i){ if (i) s.appendChild(document.createTextNode(' · ')); s.appendChild(lien(x)); });
      p.appendChild(s);
    }
    return p;
  }

  function idees(f){
    var p = el('div'), pr = f.programme || {};
    p.appendChild(el('p', 'fiche-chapo', pr.reference ? pr.statut.charAt(0).toUpperCase() + pr.statut.slice(1) + ' · ' + pr.reference : (pr.statut ? pr.statut.charAt(0).toUpperCase() + pr.statut.slice(1) + '.' : '')));
    THEMES.forEach(function(t){
      var m = pr.mesures && pr.mesures[t[0]], bloc = el('div', 'fiche-theme' + (m ? '' : ' vide'));
      bloc.appendChild(el('h3', 'fiche-rub', t[1]));
      if (m){
        bloc.appendChild(el('p', 'fiche-mesure', m.texte));
        var s = el('p', 'fiche-sources'); s.appendChild(lien(m.source)); bloc.appendChild(s);
      } else {
        bloc.appendChild(el('p', 'fiche-mesure', 'Pas de proposition identifiée dans les sources consultées.'));
      }
      p.appendChild(bloc);
    });
    p.appendChild(el('p', 'fiche-note', 'Les mêmes cinq thèmes pour toutes les fiches. Une case vide n’est pas une position : c’est une proposition que nous n’avons pas trouvée, ou pas encore pu vérifier.'));
    return p;
  }

  function ouvrir(nom, depuis){
    var f = FICHES[cle(nom)], c = CARTES[cle(nom)];
    if (!f || !c) return;
    declencheur = depuis || null;
    dlg.querySelector('.fiche-carte').setAttribute('data-bloc', teinte(c));
    var img = dlg.querySelector('.fiche-mini'); img.src = c.mini;
    dlg.querySelector('.fiche-type').textContent = 'Fiche factuelle · vérifiée le ' + (D.VERIFIE_FICHES || '');
    dlg.querySelector('#fiche-titre').textContent = c.nom;
    dlg.querySelector('.fiche-statut').textContent = f.candidature || c.etiquette;
    var pp = dlg.querySelector('#fp-parcours'), pi = dlg.querySelector('#fp-idees');
    pp.textContent = ''; pp.appendChild(parcours(f));
    pi.textContent = ''; pi.appendChild(idees(f));
    var pied = dlg.querySelector('.fiche-pied');
    pied.textContent = 'Chaque fait renvoie à sa source. Aucune note, aucun classement.';
    if (window.APDA_CONTACT){
      pied.appendChild(document.createTextNode(' '));
      var a = el('a', null, 'Signaler une erreur'); a.href = window.APDA_CONTACT; a.rel = 'noopener';
      pied.appendChild(a);
    }
    choisir(onglets[0], false);
    dlg.showModal();
    dlg.querySelector('.fiche-fermer').focus();
  }

  window.APDA_FICHE = {
    existe: function(nom){ return !!FICHES[cle(nom)]; },
    ouvrir: ouvrir
  };
})();
