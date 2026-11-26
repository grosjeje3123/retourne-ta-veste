/* Données des cartes de Retourne ta veste : partagées par la collection et le jeu. */
(function(){
var VERIFIE = '18/11/2026';

var CANDIDATS = [
  {
    nom: 'Nathalie Arthaud', bloc: 'Extrême gauche', image: 'img/arthaud-couleur.webp',
    etiquette: 'Candidate · déc. 2025', tampon: '4<sup>e</sup> candidature',
    role: 'Porte-parole de Lutte ouvrière', valeurs: [7, 1, 5, 1],
    phrase: 'Le véritable pouvoir n’est pas à l’Élysée.', quand: '26 septembre 2026 · premier meeting, Paris',
    annees: ['2012', '2017', '2022', '2027'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuancier 2026 (LO)', verifie: '25/11/2026',
    sources: [
      ['Slate', 'https://www.slate.fr/politique/election-presidentielle-2027-liste-candidats-declares-interesses-primaire-gauche-droite-extreme-lfi-rn-lr-ps-macron'],
      ['AFP / La Gazette', 'https://www.lagazettefrance.fr/article/plus-leon-trotski-que-leon-xiv-premier-meeting-de-campagne-pour-arthaud-et-lo'],
      ['Lutte ouvrière', 'https://www.lutte-ouvriere.org/medias/breve/fichiers/2026/05/20260516-reponseLO-NPA-R.pdf']
    ]
  },
  {
    nom: 'Jean-Luc Mélenchon', bloc: 'Extrême gauche', image: 'img/melenchon-couleur.webp',
    etiquette: 'Candidat · mai 2026', tampon: '4<sup>e</sup> candidature',
    role: 'Leader de La France insoumise', valeurs: [9, 10, 8, 10],
    phrase: 'Nous c’est carré. Il y a une équipe, un programme, un seul candidat.', quand: '3 mai 2026 · annonce de candidature, TF1',
    annees: ['2012', '2017', '2022', '2027'],
    justice: 'Condamné en 2019 pour rébellion (3 mois avec sursis, définitif). Trois condamnations pour diffamation ou injure (2021-2022), caractère définitif non établi&nbsp;; présumé innocent.',
    blocSource: 'nuancier 2026 (LFI), validé par le Conseil d’État', verifie: '25/11/2026',
    horsCarte: [
      ['Plainte pour injure d’une adversaire politique (propos de 2011)', 'Relaxe définitive (Cour de cassation, 28&nbsp;février 2017)', [['Politis', 'https://www.politis.fr/articles/2014/04/fasciste-marine-le-pen-deboutee-de-sa-plainte-contre-melenchon-26558'], ['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/fasciste-marine-le-pen-definitivement-deboutee-contre-jean-luc-melenchon-56342']]]
    ],
    sources: [
      ['LCP', 'https://lcp.fr/actualites/presidentielle-jean-luc-melenchon-officialise-sa-candidature-pour-2027-435851'],
      ['La Libre (AFP)', 'https://www.lalibre.be/international/europe/2026/05/03/jean-luc-melenchon-officialise-sa-candidature-a-la-presidentielle-2027-62WVGQMVUREGHCOMM2PKZ2DE7M/'],
      ['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/melenchon-condamne-a-trois-mois-avec-sursis-pour-la-perquisition-houleuse-a-lfi'],
      ['H24info (AFP)', 'https://h24info.ma/?p=594744']
    ]
  },
  {
    nom: 'Fabien Roussel', bloc: 'Gauche', image: 'img/roussel-couleur.webp',
    etiquette: 'Candidat · sept. 2026', tampon: '2<sup>e</sup> candidature',
    role: 'Secrétaire national du PCF · maire de Saint‑Amand‑les‑Eaux', valeurs: [8, 6, 6, 2],
    phrase: 'Candidat à 85&nbsp;%.', quand: 'Juillet 2026 · congrès du PCF, avant le vote des militants',
    annees: ['2022', '2027'],
    justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuancier 2026 (PCF)', verifie: '25/11/2026',
    sources: [
      ['LCP', 'https://lcp.fr/actualites/fabien-roussel-officiellement-candidat-du-pcf-a-l-election-presidentielle-de-2027-441389'],
      ['Europe&nbsp;1 (85&nbsp;%)', 'https://www.europe1.fr/node/966744'],
      ['Euronews', 'https://fr.euronews.com/my-europe/2026/07/05/fabien-roussel-en-route-vers-une-nouvelle-candidature-a-la-presidentielle']
    ]
  },
  {
    nom: 'François Ruffin', bloc: 'Gauche', image: 'img/ruffin-couleur.webp',
    etiquette: 'Candidat · janv. 2026', tampon: '1<sup>re</sup> candidature',
    role: 'Député de la Somme · président de Debout&nbsp;!', valeurs: [5, 6, 1, 7],
    phrase: 'République cherche candidat&nbsp;? CDD de 5 ans, nourri, logé, blanchi.', quand: 'Avril 2026 · annonce de son meeting de Lyon',
    annees: ['2027'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuance UG aux législatives 2024 (règle à valider)', verifie: '25/11/2026',
    sources: [
      ['Slate', 'https://www.slate.fr/politique/election-presidentielle-2027-comment-francois-ruffin-retrouve-marginalise-gauche-lfi-france-insoumise-melenchon-candidat'],
      ['Lyon Capitale', 'https://www.lyoncapitale.fr/actualite/a-lyon-francois-ruffin-passera-un-entretien-dembauche-pour-lelysee-le-25-avril'],
      ['Résultats 2024', 'https://www.la-mairie.com/departement/somme/elections/legislatives/01']
    ]
  },
  {
    nom: 'Marine Tondelier', bloc: 'Gauche', image: 'img/tondelier-couleur.webp',
    etiquette: 'Candidate · oct. 2025', tampon: '1<sup>re</sup> candidature',
    role: 'Secrétaire nationale des Écologistes', valeurs: [3, 1, 6, 7],
    phrase: 'Convaincue que le chemin existe pour une victoire de notre camp.', quand: '22 octobre 2025 · annonce de candidature, L’Obs',
    annees: ['2027'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuancier 2026 (Les Écologistes)', verifie: '25/11/2026',
    horsCarte: [
      ['Action en diffamation de deux présentateurs de CNews (propos de 2023 sur la chaîne)', 'Demandeurs déboutés par le tribunal judiciaire de Nanterre (17&nbsp;février 2026)&nbsp;; aucun appel connu', [['Puremédias (jugement)', 'https://www.ozap.com/actu/j-espere-que-ca-leur-passera-l-envie-de-baillonner-les-critiques-marine-tondelier-annonce-avoir-gagne-son-proces-contre-christine-kelly/654117'], ['Puremédias (plainte, 2023)', 'https://www.ozap.com/actu/-cnews-laisse-prosperer-une-ideologie-neonazie-christine-kelly-et-marc-menant-portent-plainte-contre-marine-tondelier-eelv/634309']]]
    ],
    sources: [
      ['Brut', 'https://www.brut.media/fr/articles/marine-tondelier-la-patronne-des-ecologistes-officiellement-candidate-a-la-presidentielle-de-2027'],
      ['Reporterre', 'https://reporterre.net/Presidentielle-2027-Marine-Tondelier-candidate-a-une-primaire-de-la-gauche'],
      ['LCP', 'https://lcp.fr/actualites/candidature-a-la-presidentielle-pas-de-choix-definitif-des-ecologistes-avant-la-mi']
    ]
  },
  {
    nom: 'Sandrine Rousseau', bloc: 'Gauche', image: 'img/rousseau-couleur.webp',
    etiquette: 'Pas déclarée', tampon: 'Pro-alliance LFI',
    role: 'Députée de Paris', valeurs: [6, 4, 4, 6],
    phrase: 'Je prône l’alliance vers LFI.', quand: '22 août 2026 · franceinfo',
    annees: ['aucune candidature'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuancier 2026 (Les Écologistes)', verifie: '25/11/2026',
    horsCarte: [
      ['Poursuivie en diffamation par un ancien député qu’elle avait publiquement accusé, avec d’autres femmes et deux médias', 'Relaxée par le tribunal correctionnel de Paris le 19&nbsp;avril 2019', [['Puremédias', 'https://www.ozap.com/actu/affaire-denis-baupin-mediapart-et-france-inter-relaxes/577655'], ['Actu-Juridique', 'https://www.actu-juridique.fr/civil/personnes-famille/procedures-baillons-un-danger-pour-celles-et-ceux-qui-prennent-la-parole-contre-les-violences-sexistes-et-sexuelles/']]]
    ],
    sources: [
      ['franceinfo', 'https://www.franceinfo.fr/politique/eelv/primaire-eelv/'],
      ['Public Sénat (statut)', 'https://www.publicsenat.fr/actualites/politique/presidentielle-2027-les-ecologistes-reportent-lheure-du-choix-a-decembre-marine-tondelier-toujours-en-lice'],
      ['Toluna (pressentie)', 'https://tolunacorporate.com/wp-content/uploads/2026/04/Rapport-Toluna-Suivi-du-potentiel-de-vote-a-la-presidentielle-Commstrat-V6-Avril-2026.pdf'],
      ['Politis (jugement)', 'https://www.politis.fr/articles/2024/11/en-bref-les-chasseurs-perdent-un-proces-contre-sandrine-rousseau-le-snu-au-repos-des-ordonnances-en-faveur-de-leau/'],
      ['FNC (appel)', 'https://chasseurdefrance.com/wp-content/uploads/2024/10/20241030CPSandrineRousseau45.pdf']
    ]
  },
  {
    nom: 'Raphaël Glucksmann', bloc: 'Gauche', image: 'img/glucksmann-couleur.webp',
    etiquette: 'Candidat · août 2026', tampon: '1<sup>re</sup> candidature',
    role: 'Député européen · fondateur de Place publique', valeurs: [9, 6, 1, 9],
    phrase: 'Nous ne sommes pas là pour gagner une querelle à gauche.', quand: 'Octobre 2026 · soir de sa victoire à la primaire',
    annees: ['2027'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuancier 2026 (Place publique)', verifie: '25/11/2026',
    sources: [
      ['LCP (candidature)', 'https://lcp.fr/actualites/presidentielle-2027-raphael-glucksmann-officialise-sa-candidature-et-participera-a-la'],
      ['Euronews', 'https://fr.euronews.com/2026/10/12/primaire-sociale-democrate-large-victoire-de-raphael-glucksmann-des-le-premier-tour'],
      ['LCP (primaire)', 'https://lcp.fr/actualites/victoire-de-raphael-glucksmann-a-la-primaire-socialiste-premieres-reactions-des']
    ]
  },
  {
    nom: 'Karim Bouamrane', bloc: 'Gauche', image: 'img/bouamrane-couleur.webp',
    etiquette: 'Candidat · juin 2026', tampon: '1<sup>re</sup> candidature',
    role: 'Maire de Saint-Ouen-sur-Seine', valeurs: [3, 1, 8, 5],
    phrase: 'J’y vais pour gagner.', quand: '9 juin 2026 · France Inter',
    annees: ['2027'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuancier 2026 (PS)', verifie: '25/11/2026',
    sources: [
      ['LCP', 'https://lcp.fr/actualites/presidentielle-2027-qui-est-karim-bouamrane-le-maire-socialiste-de-saint-ouen-et-nouveau'],
      ['Sud Radio (« le recours »)', 'https://www.sudradio.fr/sud-radio/karim-bouamrane-ps-cest-moi-le-recours-a-gauche'],
      ['Sud Radio (9 nov.)', 'https://www.sudradio.fr/linvite-politique/karim-bouamrane-il-faut-arreter-de-regarder-melenchon-comme-le-superman-de-la-gauche']
    ]
  },
  {
    nom: 'François Hollande', bloc: 'Gauche', image: 'img/hollande-couleur.webp',
    etiquette: 'Pas encore déclaré', tampon: 'En embuscade',
    role: 'Ancien président de la République · député de Corrèze', valeurs: [10, 10, 6, 7],
    phrase: 'Comment être utile aujourd’hui&nbsp;? En me préparant.', quand: '15 avril 2026 · Marianne',
    annees: ['2012', '2027&nbsp;?'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuancier 2026 (PS)', verifie: '25/11/2026',
    sources: [
      ['LCP (statut)', 'https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-declares-et-potentiels-444932'],
      ['LCP (Marianne)', 'https://lcp.fr/actualites/francois-hollande-lui-candidat-comment-il-accelere-en-coulisses-pour-la-presidentielle'],
      ['Élysée', 'https://www.elysee.fr/en/francois-hollande'],
      ['Assemblée nationale (2016)', 'https://questions.assemblee-nationale.fr/dyn/14/questions/QANR5L14QG4390.pdf']
    ]
  },
  {
    nom: 'Clémentine Autain', bloc: 'Gauche', image: 'img/autain-couleur.webp',
    etiquette: 'A renoncé · juil. 2026', tampon: 'Hors course',
    role: 'Députée de Seine-Saint-Denis', valeurs: [4, 6, 5, 6],
    phrase: 'Est-ce que je vais ajouter une candidature de plus&nbsp;? La réponse est non.', quand: '11 juillet 2026 · dépêche AFP',
    annees: ['aucune candidature'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuance UG aux législatives 2024 (règle 2)', verifie: '25/11/2026',
    sources: [
      ['AFP (via jeanmarcmorandini.com)', 'https://www.jeanmarcmorandini.com/node/646423'],
      ['Slate', 'https://www.slate.fr/politique/election-presidentielle-2027-liste-candidats-declares-interesses-primaire-gauche-droite-extreme-lfi-rn-lr-ps-macron'],
      ['Datan', 'https://datan.fr/deputes/seine-saint-denis-93/depute_clementine-autain']
    ]
  },
  {
    nom: 'Ségolène Royal', bloc: 'Gauche', image: 'img/royal-couleur.webp',
    etiquette: 'Primaire perdue · oct. 2026', tampon: 'Hors course',
    role: 'Ancienne ministre · ex-présidente de Poitou-Charentes', valeurs: [10, 9, 8, 6],
    phrase: 'La France tranquille et l’ordre juste.', quand: 'Juillet 2026 · campagne de la primaire, Brut',
    annees: ['2007'], justice: 'Condamnée en avril 2023 pour diffamation envers un journaliste de Radio France (500&nbsp;€ d’amende avec sursis)&nbsp;; elle a fait appel, issue non connue à ce jour&nbsp;; présumée innocente.',
    blocSource: 'nuancier 2026 (PS)', verifie: '25/11/2026',
    horsCarte: [
      ['Enquête préliminaire du parquet national financier (nov. 2019) sur l’usage des moyens d’ambassadrice des pôles', 'Classée sans suite le 28&nbsp;juin 2021, aucune infraction démontrée', [['Communiqué du PNF', 'https://www.tribunal-de-paris.justice.fr/sites/default/files/2021-07/2021_06_28%20-%20CP%20S%C3%A9gol%C3%A8ne%20ROYAL%20ambassadrice%20des%20p%C3%B4les.pdf']]]
    ],
    sources: [
      ['LCP (candidature)', 'https://lcp.fr/actualites/presidentielle-2027-segolene-royal-annonce-sa-candidature-a-la-primaire-socialiste'],
      ['Public Sénat (résultats)', 'https://www.publicsenat.fr/actualites/politique/primaire-de-la-gauche-raphael-glucksmann-plie-le-match-et-remporte-le-scrutin-des-le-premier-tour-avec-66'],
      ['Brut', 'https://www.brut.media/fr/articles/france/politique/presidentielle-2027-segolene-royal-annonce-sa-participation-a-la-primaire-de-l-espace-socialiste'],
      ['Puremédias (ozap)', 'https://www.ozap.com/actu/-journalisme-de-caniveau-segolene-royal-condamnee-pour-avoir-diffame-un-journaliste-de-radio-france/631199']
    ]
  },
  {
    nom: 'Olivier Faure', bloc: 'Gauche', image: 'img/faure-couleur.webp',
    etiquette: 'Primaire perdue · oct. 2026', tampon: 'Hors course',
    role: 'Premier secrétaire du PS · député de Seine-et-Marne', valeurs: [4, 8, 1, 5],
    phrase: 'Nous avons désormais un candidat…', quand: '11 octobre 2026 · soir de la primaire',
    annees: ['aucune candidature'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuancier 2026 (PS)', verifie: '25/11/2026',
    sources: [
      ['Sud Radio (AFP)', 'https://www.sudradio.fr/societe/olivier-faure-candidat-a-la-primaire-de-la-gauche'],
      ['LCP (réactions)', 'https://lcp.fr/actualites/victoire-de-raphael-glucksmann-a-la-primaire-socialiste-premieres-reactions-des'],
      ['Public Sénat (résultats)', 'https://www.publicsenat.fr/actualites/politique/primaire-de-la-gauche-raphael-glucksmann-plie-le-match-et-remporte-le-scrutin-des-le-premier-tour-avec-66']
    ]
  },
  {
    nom: 'Jérôme Guedj', bloc: 'Gauche', image: 'img/guedj-couleur.webp',
    etiquette: 'Primaire perdue · oct. 2026', tampon: 'Hors course',
    role: 'Député de l’Essonne', valeurs: [6, 5, 8, 2],
    phrase: 'Il y a un espace pour une tonitruance socialiste.', quand: '5 février 2026 · France Inter',
    annees: ['aucune candidature'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuancier 2026 (PS)', verifie: '25/11/2026',
    sources: [
      ['Brut (candidature)', 'https://www.brut.media/fr/articles/le-depute-jerome-guedj-ps-annonce-sa-candidature-a-lelection-presidentielle-de-2027-sans-passer-par-la-primaire'],
      ['LCP', 'https://lcp.fr/actualites/presidentielle-2027-qui-sera-sur-la-ligne-de-depart-de-la-primaire-sociale-democrate-en'],
      ['Public Sénat (résultats)', 'https://www.publicsenat.fr/actualites/politique/primaire-de-la-gauche-raphael-glucksmann-plie-le-match-et-remporte-le-scrutin-des-le-premier-tour-avec-66']
    ]
  },
  {
    nom: 'Gabriel Attal', bloc: 'Centre', image: 'img/attal-couleur.webp',
    etiquette: 'Candidat · mai 2026', tampon: '1<sup>re</sup> candidature',
    role: 'Secrétaire général de Renaissance · ancien Premier ministre', valeurs: [5, 6, 6, 9],
    phrase: 'L’exercice du pouvoir m’a changé.', quand: 'Printemps 2026 · entretien au Point, avant sa déclaration',
    annees: ['2027'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuancier 2026 (Renaissance)', verifie: '25/11/2026',
    sources: [
      ['LCP (candidature)', 'https://lcp.fr/actualites/presidentielle-2027-gabriel-attal-officialise-sa-candidature-436721'],
      ['Reuters', 'https://www.tradingsat.com/actualites/informations-societes/marche-gabriel-attal-officialise-sa-candidature-a-la-presidence-de-la-republique-1163532.html'],
      ['LCP (Le Point)', 'https://lcp.fr/actualites/je-vais-me-deplacer-partout-en-france-et-je-prendrai-une-decision-gabriel-attal']
    ]
  },
  {
    nom: 'Édouard Philippe', bloc: 'Centre', image: 'img/philippe-couleur.webp',
    etiquette: 'Candidat · sept. 2024', tampon: '1<sup>re</sup> candidature',
    role: 'Maire du Havre · président d’Horizons', valeurs: [4, 6, 9, 8],
    phrase: 'Ce que je proposerai sera massif.', quand: '3 septembre 2024 · annonce de candidature, Le Point',
    annees: ['2027'],
    justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuancier 2026 (Horizons)', verifie: '25/11/2026',
    horsCarte: [
      ['Information judiciaire de la Cour de justice de la République sur la gestion du Covid-19 (témoin assisté depuis octobre 2022)', 'Non-lieu le 7&nbsp;juillet 2025, comme l’avait requis le procureur général', [['Club des juristes', 'https://www.leclubdesjuristes.com/en-bref/gestion-du-covid-19-la-cjr-prononce-un-non-lieu-a-lencontre-de-edouard-philippe-agnes-buzyn-et-olivier-veran-11443/'], ['Acteurs publics', 'https://acteurspublics.fr/articles/olivier-marleix-cjr-cese/']]]
    ],
    sources: [
      ['France&nbsp;3', 'https://france3-regions.franceinfo.fr/normandie/seine-maritime/havre/je-serai-candidat-a-la-prochaine-election-presidentielle-edouard-philippe-l-ancien-premier-ministre-et-maire-du-havre-officialise-sa-candidature-3026366.html'],
      ['Europe&nbsp;1', 'https://www.europe1.fr/node/937625']
    ]
  },
  {
    nom: 'Aurore Bergé', bloc: 'Centre', image: 'img/berge-couleur.webp',
    etiquette: 'Pas déclarée', tampon: 'Pour une primaire',
    role: 'Ministre déléguée à l’Égalité femmes-hommes', valeurs: [6, 6, 6, 7],
    phrase: 'Il faut une primaire à l’automne.', quand: '30 mars 2026 · Public Sénat',
    annees: ['aucune candidature'],
    justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuancier 2026 (Renaissance)', verifie: '25/11/2026',
    horsCarte: [
      ['Information judiciaire de la Cour de justice de la République (janv. 2025) pour faux témoignage devant la commission d’enquête sur les crèches&nbsp;; témoin assistée', 'Non-lieu le 2&nbsp;juillet 2026', [['Europe&nbsp;1', 'https://www.europe1.fr/node/964860'], ['La Gazette (AFP)', 'https://www.lagazettefrance.fr/article/soupcons-de-faux-temoignage-sur-les-creches-non-lieu-en-faveur-d-aurore-berge']]]
    ],
    sources: [
      ['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/union-de-la-droite-et-du-centre-il-faut-une-primaire-a-lautomne-plaide-aurore-berge']
    ]
  },
  {
    nom: 'Dominique de Villepin', bloc: 'Divers', image: 'img/villepin-couleur.webp',
    etiquette: 'Pas encore déclaré', tampon: 'En quête des 500',
    role: 'Ancien Premier ministre · fondateur de La France humaniste', valeurs: [1, 5, 1, 9],
    phrase: 'Nous voulons être présents en 2027.', quand: '19 janvier 2026 · Lundi C’est Politique, LCP',
    annees: ['2027&nbsp;?'],
    justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'ni parti dans la grille, ni candidature depuis 2020 (règle à valider)', verifie: '25/11/2026',
    sources: [
      ['LCP', 'https://lcp.fr/actualites/dominique-de-villepin-nous-voulons-etre-presents-en-2027-429413'],
      ['LCP (parrainages)', 'https://www.lcp.fr/actualites/presidentielle-dominique-de-villepin-annonce-avoir-depasse-la-barre-des-300-signatures']
    ]
  },
  {
    nom: 'Teddy Riner', bloc: 'Divers', image: 'img/riner-couleur.webp',
    etiquette: 'Candidat · nov. 2026', tampon: '1<sup>re</sup> candidature',
    role: 'Judoka · quintuple champion olympique', valeurs: [1, 1, 1, 4],
    phrase: 'Je suis candidat pour dire qu’on peut relever la France.', quand: '9 novembre 2026 · annonce de candidature',
    annees: ['2027'],
    justice: 'Contentieux fiscal, sans poursuite pénale&nbsp;: redressement pour l’usage personnel de voitures de sa société, confirmé en appel (oct. 2026), pourvoi encore possible.',
    blocSource: 'ni parti dans la grille, ni candidature depuis 2020 (règle à valider)', verifie: '25/11/2026',
    horsCarte: [
      ['Enquête sur sa rémunération au Levallois Sporting Club (entendu en 2015)', 'Classée sans suite (2019)', [['RCI', 'https://rci.fm/guadeloupe/infos/Justice/Levallois-Sporting-Club-Teddy-Riner-entendu-par-la-police'], ['L’Essentiel de l’éco (d’après L’Équipe)', 'https://lessentieldeleco.fr/9356-teddy-riner-candidat-epingle-par-le-fisc/']]]
    ],
    sources: [
      ['LCP', 'https://lcp.fr/actualites/le-judoka-teddy-riner-annonce-sa-candidature-a-l-election-presidentielle-de-2027-444920'],
      ['Flashscore (AFP)', 'https://www.flashscore.fr/actualites/la-justice-conforte-le-fisc-dans-un-redressement-visant-teddy-riner/UXa8IVOc/'],
      ['Euronews', 'https://fr.euronews.com/2026/11/12/presidentielle-2027-teddy-riner-rattrape-par-le-fisc-un-premier-combat-sur-le-terrain-poli']
    ]
  },
  {
    nom: 'Natacha Polony', bloc: 'Divers', image: 'img/polony-couleur.webp',
    etiquette: 'Candidate · oct. 2026', tampon: '1<sup>re</sup> candidature',
    role: 'Essayiste · ex-directrice de&nbsp;la&nbsp;rédaction&nbsp;de&nbsp;Marianne', valeurs: [3, 1, 1, 7],
    phrase: 'Je ne peux pas continuer à regarder mon pays s’effondrer.', quand: '14 octobre 2026 · France Inter',
    annees: ['2027'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'ni parti dans la grille, ni candidature depuis 2020 (règle à valider)', verifie: '25/11/2026',
    horsCarte: [
      ['Renvoyée devant le tribunal pour «&nbsp;contestation de l’existence de crime contre l’humanité&nbsp;» (propos sur le Rwanda, France Inter, 2018)', 'Relaxée par le tribunal judiciaire de Paris le 20&nbsp;mai 2022', [['AFP (archive)', 'https://francegenocidetutsi.org/LaJournalisteNatachaPolonyRelaxeeAFP20052022.pdf'], ['DH (renvoi)', 'https://www.dhnet.be/medias/television/2022/02/28/la-journaliste-natacha-polony-jugee-mardi-pour-contestation-du-genocide-au-rwanda-6ZSNXHIEIVAZRHUVSK26ID3BEY/']]]
    ],
    sources: [
      ['LCP', 'https://lcp.fr/actualites/natacha-polony-annonce-sa-candidature-a-l-election-presidentielle-443808'],
      ['Paris Match', 'https://www.parismatch.be/actualites/monde/2026/10/14/france-natacha-polony-annonce-sa-candidature-a-lelection-presidentielle-OUVKQKV6MBFQZCJKLBGST2N4CY/']
    ]
  },
  {
    nom: 'Juan Branco', bloc: 'Divers', image: 'img/branco-couleur.webp',
    etiquette: 'Candidat · déc. 2025', tampon: '1<sup>re</sup> candidature',
    role: 'Avocat et essayiste · mouvement Les Ruches', valeurs: [3, 1, 1, 5],
    phrase: 'Je pense qu’il faut se préparer à la sortie de l’Union européenne.', quand: '19 décembre 2025 · Sud Radio',
    annees: ['2027'],
    justice: 'Suspendu neuf mois comme avocat&nbsp;: sanction disciplinaire, confirmée en appel en octobre 2025&nbsp;; pourvoi en cassation formé.',
    blocSource: 'ni parti dans la grille, ni candidature depuis 2020 (règle 3)', verifie: '25/11/2026',
    sources: [
      ['Sud Radio', 'https://www.sudradio.fr/sud-radio/lavocat-juan-branco-candidat-a-la-presidentielle'], ['Barreau de Paris (arrêt du 16/10/2025)', 'https://www.avocatparis.org/sites/bdp/files/2025-11/CA_Paris_251016_24-18012_branco_0.pdf']
    ]
  },
  {
    nom: 'Jean Lassalle', bloc: 'Divers', image: 'img/lassalle-couleur.webp',
    etiquette: 'Cagnotte · juil. 2026', tampon: '3<sup>e</sup> candidature&nbsp;?',
    role: 'Ancien député · président de Résistons&nbsp;!', valeurs: [8, 9, 10, 2],
    phrase: 'Je verrai à l’automne ce que donne la cagnotte, si elle me permet d’y aller.', quand: 'Juillet 2026 · appel aux dons, Europe&nbsp;1',
    annees: ['2017', '2022', '2027&nbsp;?'],
    justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'Résistons&nbsp;! hors grille, liste Alliance rurale en 2024 (règle 3)', verifie: '25/11/2026',
    sources: [
      ['Europe&nbsp;1 (cagnotte)', 'https://www.europe1.fr/node/970134'],
      ['Pleinchamp', 'https://www.pleinchamp.com/actualite/jean-lassalle-agriculteurs-reprenez-vos-reves.-parce-que-les-reves-ca-permet-de-sortir-du-cauchemar'],
      ['Europe&nbsp;1 (enquête)', 'https://www.europe1.fr/node/60264']
    ]
  },
  {
    nom: 'Delphine Batho', bloc: 'Divers', image: 'img/batho-couleur.webp',
    etiquette: 'Candidate · nov. 2025', tampon: '1<sup>re</sup> candidature',
    role: 'Députée des Deux-Sèvres · Génération écologie', valeurs: [6, 8, 1, 1],
    phrase: 'L’écologie est en voie de rikikisation, si j’ose dire.', quand: '25 novembre 2025 · L’Obs',
    annees: ['2027'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'Génération écologie hors grille, nuance ECO en 2024 (règle 2, validée)', verifie: '25/11/2026',
    sources: [
      ['L’info durable (AFP)', 'https://www.linfodurable.fr/lex-ministre-delphine-batho-candidate-la-presidentielle-pour-conjurer-la-rikikisation-de-lecologie'],
      ['Datan', 'https://datan.fr/deputes/deux-sevres-79/depute_delphine-batho'],
      ['Nuance 2024 (annuaire-mairie)', 'https://www.annuaire-mairie.fr/elections-legislatives-nanteuil.html']
    ]
  },
  {
    nom: 'Francis Lalanne', bloc: 'Divers', image: 'img/lalanne-couleur.webp',
    etiquette: 'Candidat · août 2026', tampon: '1<sup>re</sup> candidature',
    role: 'Chanteur · mouvement France Libre', valeurs: [7, 1, 1, 2],
    phrase: 'Reprise en main de la souveraineté nationale.', quand: '19 août 2026 · communiqué de candidature',
    annees: ['2027'],
    justice: 'Inéligible d’avril 2025 à octobre 2026&nbsp;: sanction électorale, faute de compte de campagne (européennes 2024).',
    blocSource: 'France Libre hors grille, nuance DIV en 2024 (règle 2, à valider)', verifie: '25/11/2026',
    horsCarte: [
      ['Altercation avec une équipe de l’émission «&nbsp;Quotidien&nbsp;» à Avignon (juin 2021)', 'Plainte classée sans suite (avant janvier 2025)', [['Conseil de l’Europe, réponse de la France à l’alerte n° 107/2021', 'https://rm.coe.int/france-reply-fr-plusieurs-journalistes-attaques-par-le-chanteur-franci/1680a34d49'], ['Ozap', 'https://www.ozap.com/actu/plus-de-3-ans-apres-son-altercation-avec-une-equipe-de-quotidien-francis-lalanne-poursuit-son-bras-de-fer-judiciaire-contre-la-production-de-lemission-de-yann-barthes/648430']]]
    ],
    sources: [
      ['Demotivateur', 'https://www.demotivateur.fr/societe/francis-lalanne-officiellement-candidat-a-l-election-presidentielle-de-2027-49762'],
      ['Sud Radio', 'https://www.sudradio.fr/politique/francis-lalanne-du-chanteur-engage-des-annees-1980-aux-spheres-complotistes']
    ]
  },
  {
    nom: 'Sylvain Durif', bloc: 'Divers', image: 'img/durif-couleur.webp',
    etiquette: 'Candidat · août 2026', tampon: '1<sup>re</sup> candidature',
    role: 'Vidéaste sur Instagram', valeurs: [1, 1, 1, 1],
    phrase: 'Grand Monarque, Christ cosmique, Messie et pape Pierre.', quand: 'Automne 2026 · vidéo Instagram',
    annees: ['2027'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'ni parti dans la grille, ni candidature retrouvée depuis 2020 (règle 3, à valider)', verifie: '25/11/2026',
    sources: [
      ['Sud Radio', 'https://www.sudradio.fr/politique/qui-est-ce-sylvain-durif-le-christ-cosmique-candidat-a-la-presidentielle-2027'],
      ['LCP (liste des candidats)', 'https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-declares-et-potentiels-444932']
    ]
  },
  {
    nom: 'Bernard Cazeneuve', bloc: 'Divers', image: 'img/cazeneuve-couleur.webp',
    etiquette: 'Prétendant · juil. 2026', tampon: '1<sup>re</sup> candidature&nbsp;?',
    role: 'Ancien Premier ministre · président de La Convention', valeurs: [5, 8, 7, 4],
    phrase: 'Mon objectif, c’est de devenir président de la République pour porter les idées auxquelles je crois.', quand: '30 juillet 2026 · Marianne',
    annees: ['2027&nbsp;?'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'La Convention hors grille, aucune candidature depuis 2020 (règle 3, à valider)', verifie: '25/11/2026',
    horsCarte: [
      ['Signalement de députés LFI (nov. 2024) visant cinq anciens ministres de l’Intérieur, sur l’usage par la police du logiciel BriefCam', 'Classé sans suite par le procureur général près la Cour de cassation (27&nbsp;janv. 2025), les faits ne pouvant être imputés à aucun des ministres visés', [['Solutions numériques (AFP)', 'https://www.solutions-numeriques.com/logiciel-de-reconnaissance-faciale-dans-la-police-classement-sans-suite-du-signalement-de-deputes-lfi/']]]
    ],
    sources: [
      ['LCP (lettre aux Français)', 'https://lcp.fr/actualites/presidentielle-2027-pret-a-se-lancer-dans-la-course-a-l-elysee-bernard-cazeneuve-decline'],
      ['LCP (Marianne)', 'https://lcp.fr/actualites/presidentielle-2027-l-objectif-de-bernard-cazeneuve-est-de-devenir-president-de-la'],
      ['La Libre (« prêt »)', 'https://www.lalibre.be/international/europe/2026/04/28/une-ex-grande-figure-prete-a-etre-candidate-a-la-presidentielle-il-faut-degager-une-solution-qui-evite-le-rn-et-sorte-la-france-de-ses-difficultes-FUXJG7JH25FG7KPHNJNXBS6ICY/']
    ]
  },
  {
    nom: 'Matthieu Pigasse', bloc: 'Divers', image: 'img/pigasse-couleur.webp',
    etiquette: 'Pas déclaré', tampon: 'Prêt si besoin',
    role: 'Banquier d’affaires · patron de Radio Nova', valeurs: [1, 1, 1, 9],
    phrase: 'Je ne ferme aucune porte, je veux être utile.', quand: 'Septembre 2026 · France Inter',
    annees: ['aucune candidature'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'ni parti, ni candidature (règle 3, à valider)', verifie: '25/11/2026',
    sources: [
      ['La Gazette (AFP)', 'https://www.lagazettefrance.fr/article/vacances-luxueuses-primaire-les-ambitions-presidentielles-de-pigasse-contrariees'],
      ['La Gazette (« prêt »)', 'https://www.lagazettefrance.fr/article/en-debat-avec-bompard-pigasse-affiche-ses-convergences-avec-lfi']
    ]
  },
  {
    nom: 'Thierry Breton', bloc: 'Divers', image: 'img/breton-couleur.webp',
    etiquette: 'Pas déclaré', tampon: 'Porte entrouverte',
    role: 'Ancien commissaire européen · ancien ministre de l’Économie', valeurs: [1, 4, 4, 6],
    phrase: 'Si ce n’est pas le cas, on verra. Je ne ferme pas la porte.', quand: '9 novembre 2026 · France Inter',
    annees: ['aucune candidature'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'ni parti dans la grille, ni candidature depuis 2020 (règle 3, à valider)', verifie: '25/11/2026',
    sources: [
      ['JDD', 'https://www.lejdd.fr/politique/on-va-voir-ce-qui-emerge-thierry-breton-nexclut-pas-une-candidature-a-la-presidentielle-188253'],
      ['LCP (liste des candidats)', 'https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-declares-et-potentiels-444932']
    ]
  },
  {
    nom: 'Christine Lagarde', bloc: 'Divers', image: 'img/lagarde-couleur.webp',
    etiquette: 'Pas déclarée', tampon: 'Quitte la BCE',
    role: 'Présidente de la BCE · ancienne ministre de l’Économie', valeurs: [1, 5, 4, 4],
    phrase: 'Je ne suis candidate à rien, mais je tiens beaucoup à ce que l’Europe soit protégée.', quand: '9 juillet 2026 · Euronews',
    annees: ['aucune candidature'],
    justice: 'Reconnue coupable de négligence par la Cour de justice de la République (décembre 2016, arbitrage Tapie), dispensée de peine, sans inscription au casier judiciaire.',
    blocSource: 'ni parti, ni candidature depuis 2020 (règle 3, à valider)', verifie: '25/11/2026',
    sources: [
      ['Euronews', 'https://fr.euronews.com/2026/07/09/je-ne-suis-pas-candidate-lagarde-a-euronews-dans-le-contexte-de-la-presidentielle'],
      ['LCP', 'https://lcp.fr/actualites/christine-lagarde-annonce-son-depart-anticipe-de-la-banque-centrale-europeenne-444496'],
      ['Public Sénat', 'https://www.publicsenat.fr/actualites/non-classe/proces-lagarde-les-grandes-dates-de-l-arbitrage-tapie-52092']
    ]
  },
  {
    nom: 'Michel‑Édouard Leclerc', bloc: 'Divers', image: 'img/leclerc-couleur.webp',
    etiquette: 'Pas déclaré', tampon: 'N’exclut rien',
    role: 'Président du comité stratégique des centres E.Leclerc', valeurs: [1, 1, 1, 3],
    phrase: 'Je n’exclus pas l’idée d’être candidat à la présidentielle.', quand: '14 juin 2026 · CNews',
    annees: ['aucune candidature'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'ni parti, ni candidature (règle 3, à valider)', verifie: '25/11/2026',
    sources: [
      ['L’Essentiel de l’éco', 'https://lessentieldeleco.fr/7789-combien-gagne-michel-edouard-leclerc-2/'],
      ['Sud Radio (Ifop)', 'https://www.sudradio.fr/ifop/personnalites-politiques-preferees-michel-edouard-leclerc-indetronable-depuis-3-mois']
    ]
  },
  {
    nom: 'Bruno Retailleau', bloc: 'Droite', image: 'img/retailleau-couleur.webp',
    etiquette: 'Candidat · févr. 2026', tampon: '1<sup>re</sup> candidature',
    role: 'Président des Républicains · sénateur de Vendée', valeurs: [7, 9, 10, 8],
    phrase: 'Renverser la table.', quand: '12 février 2026 · annonce de candidature, Paris',
    annees: ['2027'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuancier 2026 (LR)', verifie: '25/11/2026',
    sources: [
      ['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/referendum-sur-limmigration-primaute-du-droit-national-le-projet-de-bruno-retailleau-est-il-faisable'],
      ['Sud Radio', 'https://www.sudradio.fr/politique/bruno-retailleau-annonce-sa-candidature-a-la-presidentielle-2027'],
      ['Le Temps', 'https://www.letemps.ch/monde/france-les-adherents-lr-propulsent-bruno-retailleau-comme-candidat-pour-la-presidentielle']
    ]
  },
  {
    nom: 'David Lisnard', bloc: 'Droite', image: 'img/lisnard-couleur.webp',
    etiquette: 'Candidat · mars 2026', tampon: '1<sup>re</sup> candidature',
    role: 'Maire de Cannes · fondateur de Nouvelle Énergie', valeurs: [3, 1, 9, 8],
    phrase: 'Un projet puissant pour que la France soit respectée, indépendante et gagnante.', quand: 'Mars 2026 · candidature et départ de LR',
    annees: ['2027'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuance divers droite aux municipales 2026 (règle à valider)', verifie: '25/11/2026',
    sources: [
      ['LCP', 'https://lcp.fr/actualites/je-suis-candidat-david-lisnard-quitte-lr-et-relance-le-debat-sur-une-primaire-a-droite'],
      ['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/presidentielle-2027-david-lisnard-maire-de-cannes-annonce-sa-candidature-et-quitte-officiellement-les-lr'],
      ['Résultats 2026', 'https://datan.fr/elections/resultats/alpes-maritimes-06/ville_cannes']
    ]
  },
  {
    nom: 'Nicolas Dupont‑Aignan', bloc: 'Droite', image: 'img/dupont-aignan-couleur.webp',
    etiquette: 'Candidat · mars 2025', tampon: '4<sup>e</sup> candidature',
    role: 'Maire de Yerres · président de Debout&nbsp;la&nbsp;France', valeurs: [9, 10, 9, 3],
    phrase: 'C’est la raison de ma candidature&nbsp;: offrir un choix, un vrai choix aux Français.', quand: '20 septembre 2026 · Sud Radio',
    annees: ['2012', '2017', '2022', '2027'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuance droite souverainiste aux municipales 2026 (règle à valider)', verifie: '25/11/2026',
    horsCarte: [
      ['Poursuivi pour provocation à la haine (tweet de janvier 2017 évoquant une «&nbsp;invasion migratoire&nbsp;»)', 'Relaxé par le tribunal correctionnel de Paris (6&nbsp;juin 2018)&nbsp;; aucun appel connu', [['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/dupont-aignan-relaxe-pour-ses-propos-sur-l-invasion-migratoire-en-france-86680']]]
    ],
    sources: [
      ['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/presidentielle-2027-le-dernier-decompte-des-candidats-deja-sur-la-ligne-de-depart'],
      ['Sud Radio', 'https://www.sudradio.fr/linvite-politique/nicolas-dupont-aignan-la-position-du-rn-est-incomprehensible'],
      ['Résultats 2026', 'https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/11/91/91691/']
    ]
  },
  {
    nom: 'François Asselineau', bloc: 'Droite', image: 'img/asselineau-couleur.webp',
    etiquette: 'Candidat · mars 2026', tampon: '2<sup>e</sup> candidature',
    role: 'Président de l’Union populaire républicaine', valeurs: [7, 1, 5, 4],
    phrase: 'Nous ne sommes pas des souverainistes, nous sommes un mouvement de libération nationale.', quand: '18 septembre 2025 · Sud Radio',
    annees: ['2017', '2027'],
    justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'UPR hors grille, nuance DSV en 2024 (règle 2, à valider)', verifie: '25/11/2026',
    sources: [
      
      ['Sud Radio (citation)', 'https://www.sudradio.fr/sud-radio/asselineau-nous-ne-sommes-pas-des-souverainistes'],
      ['LCP', 'https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-declares-et-potentiels-444932']
    ]
  },
  {
    nom: 'Xavier Bertrand', bloc: 'Droite', image: 'img/bertrand-couleur.webp',
    etiquette: 'Prétendant · août 2026', tampon: '1<sup>re</sup> candidature&nbsp;?',
    role: 'Président de la région Hauts-de-France', valeurs: [8, 7, 9, 3],
    phrase: 'Je serai un candidat à la place, pas un candidat de plus.', quand: '27 août 2026 · rencontre des entrepreneurs du Medef',
    annees: ['2027&nbsp;?'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuancier 2026 (LR)', verifie: '25/11/2026',
    sources: [
      ['LCP (Medef)', 'https://lcp.fr/actualites/2027-figure-de-la-droite-xavier-bertrand-confirme-qu-il-sera-candidat-a-l-election'],
      ['LCP (statut)', 'https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-declares-et-potentiels-444932'],
      ['Slate', 'https://www.slate.fr/politique/election-presidentielle-2027-liste-candidats-declares-interesses-primaire-gauche-droite-extreme-lfi-rn-lr-ps-macron']
    ]
  },
  {
    nom: 'Laurent Wauquiez', bloc: 'Droite', image: 'img/wauquiez-couleur.webp',
    etiquette: 'Pas déclaré', tampon: 'Hors course',
    role: 'Président des députés Droite républicaine', valeurs: [8, 8, 7, 4],
    phrase: '… pour être ce guerrier du rassemblement.', quand: 'Juillet 2026 · Le Figaro',
    annees: ['aucune candidature'],
    justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuancier 2026 (LR)', verifie: '25/11/2026',
    horsCarte: [
      ['Enquête sur la réécriture d’une délibération régionale (2018)', 'Classée sans suite le 2&nbsp;octobre 2020, absence d’infraction', [['LyonMag', 'https://www.lyonmag.com/article/110586/auvergne-rhone-alpes-l-enquete-pour-faux-en-ecriture-publique-classee-sans-suite'], ['Lyon Capitale', 'https://www.lyoncapitale.fr/?p=159997']]]
    ],
    sources: [
      ['Lyon Capitale (statut)', 'https://www.lyoncapitale.fr/?p=501731'],
      ['AFP (Le Figaro)', 'https://www.boursedirect.fr/fr/actualites/categorie/politique/presidentielle-wauquiez-porte-un-coup-a-la-candidature-de-retailleau-en-tendant-la-main-a-philippe-afp-88833e6f3077761451ca93dfccafb0c40b3eb503']
    ]
  },
  {
    nom: 'François Baroin', bloc: 'Droite', image: 'img/baroin-couleur.webp',
    etiquette: 'Pas déclaré', tampon: 'Pro-Retailleau',
    role: 'Maire de Troyes · ancien ministre de l’Économie', valeurs: [4, 9, 10, 5],
    phrase: 'Bruno Retailleau a toutes les qualités pour créer les conditions de la surprise du premier tour et du rassemblement nécessaire du second.', quand: '8 octobre 2026 · Public Sénat',
    annees: ['aucune candidature'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuancier 2026 (LR)', verifie: '25/11/2026',
    sources: [
      ['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/presidentielle-2027-francois-baroin-assure-que-bruno-retailleau-a-toutes-les-qualites-pour-creer-les-conditions-de-la-surprise-du-premier-tour'],
      ['Intérieur (Troyes 2026)', 'https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/44/10/10387/index.html']
    ]
  },
  {
    nom: 'Gérald Darmanin', bloc: 'Droite', image: 'img/darmanin-couleur.webp',
    etiquette: 'Pas candidat · août 2026', tampon: 'Soutient Philippe',
    role: 'Garde des Sceaux, ministre de la Justice', valeurs: [5, 7, 7, 6],
    phrase: 'J’ai décidé de ne pas rajouter de la division.', quand: '17 août 2026 · annonce de son soutien',
    annees: ['aucune candidature'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'en retrait de Renaissance, liste divers droite aux municipales 2026 (règle 2, validée)', verifie: '25/11/2026',
    horsCarte: [
      ['Plainte pour viol (2017, faits allégués de 2009)&nbsp;; jamais mis en examen', 'Non-lieu en 2022, confirmé en appel&nbsp;; pourvoi rejeté par la Cour de cassation le 14&nbsp;février 2024&nbsp;: non-lieu définitif', [['Europe&nbsp;1', 'https://www.europe1.fr/politique/accusations-de-viol-la-cour-de-cassation-valide-le-non-lieu-en-faveur-de-gerald-darmanin-4230654'], ['La Gazette (AFP)', 'https://www.lagazettefrance.fr/article/accusations-de-viol-gerald-darmanin-definitivement-mis-hors-de-cause-par-la-justice']]],
      ['Plainte d’un collectif d’avocats devant la Cour de justice de la République (visite à Nicolas Sarkozy en prison, oct. 2025)', 'Classée sans suite par la commission des requêtes (déc. 2025), décision sans recours', [['Brut (AFP)', 'https://www.brut.media/fr/articles/classement-sans-suite-dune-plainte-contre-darmanin-pour-son-soutien-implicite-a-sarkozy'], ['Club des juristes', 'https://www.leclubdesjuristes.com/en-bref/gerald-darmanin-la-plainte-visant-le-ministre-de-la-justice-pour-son-soutien-implicite-a-nicolas-sarkozy-classee-sans-suite-13255/']]],
      ['Enquête préliminaire pour abus de faiblesse, ouverte en février 2018 sur plainte', 'Classée sans suite par le parquet de Paris (2018)', [['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/l-enquete-pour-abus-de-faiblesse-visant-le-ministre-gerald-darmanin-classee-sans']]],
      ['Signalement de députés LFI (nov. 2024) visant cinq anciens ministres de l’Intérieur, sur l’usage par la police du logiciel BriefCam', 'Classé sans suite par le procureur général près la Cour de cassation (27&nbsp;janv. 2025), les faits ne pouvant être imputés à aucun des ministres visés', [['Solutions numériques (AFP)', 'https://www.solutions-numeriques.com/logiciel-de-reconnaissance-faciale-dans-la-police-classement-sans-suite-du-signalement-de-deputes-lfi/']]],
      ['Lettre de dénonciation (abus de faiblesse, abus de pouvoir) reçue en 2017', 'Classée sans suite (juillet 2017), absence d’infraction', [['Public Sénat (AFP)', 'https://www.publicsenat.fr/actualites/politique/darmanin-indique-avoir-fait-l-objet-d-une-enquete-pour-abus-de-faiblesse-classee']]],
      ['Plainte en diffamation devant la Cour de justice de la République (janvier 2024)', 'Classée sans suite (13&nbsp;février 2024), décision sans recours', [['Europe 1 (AFP)', 'https://www.europe1.fr/node/7208'], ['Foot01', 'https://www.foot01.com/info/la-plainte-de-benzema-classee-darmanin-gagne-par-k-o-433827']]],
      ['Plainte devant la Cour de justice de la République (juin 2026) d’une mère de victime présumée', 'Classée sans suite (14&nbsp;septembre 2026)', [['France 3 Régions', 'https://france3-regions.franceinfo.fr/occitanie/haute-garonne/toulouse/affaire-lyhanna-une-decision-lapidaire-denonce-l-avocat-de-la-mere-de-rosa-apres-le-classement-de-sa-plainte-contre-darmanin-3417062.html'], ['Actu-Juridique', 'https://www.actu-juridique.fr/penal/plainte-devant-la-cour-de-justice-gerald-darmanin-peut-il-continuer-de-gerer-laffaire-lyhanna/']]]
    ],
    sources: [
      ['LCP', 'https://lcp.fr/actualites/presidentielle-2027-gerald-darmanin-ne-sera-pas-candidat-et-soutient-edouard-philippe'],
      ['Brut (Renaissance)', 'https://www.brut.media/fr/articles/darmanin-denonce-aupres-dattal-les-aventures-individuelles-et-prematurees-pour-lelysee'],
      ['Intérieur (Tourcoing 2026)', 'https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/32/59/59599/rappel_candidature/2/5.html']
    ]
  },
  {
    nom: 'Jean Castex', bloc: 'Droite', image: 'img/castex-couleur.webp',
    etiquette: 'Pas candidat · juil. 2026', tampon: 'Pas à l’horizon',
    role: 'PDG de la SNCF · ancien Premier ministre', valeurs: [4, 4, 6, 3],
    phrase: 'Personne ne peut jamais fermer la porte à rien.', quand: '1<sup>er</sup> juillet 2026 · France Inter',
    annees: ['aucune candidature'],
    justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'maire LR de Prades à sa dernière candidature, 2020 (règle 2, à valider)', verifie: '25/11/2026',
    horsCarte: [
      ['Plainte devant la Cour de justice de la République sur sa gestion du Covid-19 (septembre 2020)', 'Déclarée irrecevable (novembre 2020)', [['Ma Commune (AFP)', 'https://www.macommune.info/covid-19-jean-castex-vise-par-une-plainte-devant-la-cjr'], ['Le Quotidien du pharmacien', 'https://www.lequotidiendupharmacien.fr/exercice-pro/justice/crise-sanitaire-des-milliers-de-plaintes-affluent-contre-des-ministres']]]
    ],
    sources: [
      ['La Gazette (AFP)', 'https://www.lagazettefrance.fr/article/castex-n-a-pas-la-presidentielle-dans-son-horizon']
    ]
  },
  {
    nom: 'Marine Le Pen', bloc: 'Extrême droite', image: 'img/le-pen-couleur.webp',
    etiquette: 'Candidate · juil. 2026', tampon: '4<sup>e</sup> candidature',
    role: 'Présidente du groupe RN à l’Assemblée', valeurs: [10, 9, 9, 8],
    phrase: 'Ce soir, je suis candidate à l’élection présidentielle.', quand: '7 juillet 2026 · 20&nbsp;h de TF1',
    annees: ['2012', '2017', '2022', '2027'],
    justice: 'Condamnée en appel (2026) pour détournement de fonds publics&nbsp;: 3 ans dont 1 ferme, 45 mois d’inéligibilité dont 30 avec sursis&nbsp;; pourvoi en cassation, présumée innocente. Condamnée définitivement pour diffamation (2025).',
    blocSource: 'nuancier 2026 (RN)', verifie: '25/11/2026',
    horsCarte: [
      ['Diffusion de photos d’exactions de l’État islamique sur Twitter (2015)', 'Relaxée par le tribunal correctionnel de Nanterre (4&nbsp;mai 2021)', [['franceinfo', 'https://www.franceinfo.fr/politique/front-national/photos-de-l-ei-publiees-par-marine-le-pen/'], ['La Libre Belgique', 'https://www.lalibre.be/international/2018/03/01/marine-le-pen-mise-en-examen-pour-avoir-relaye-des-photos-dexactions-de-letat-islamique-7U7WV2ZPKBGDFDORNQDKOHCBZU/']]]
    ],
    sources: [
      ['Cour d’appel de Paris', 'https://www.cours-appel.justice.fr/sites/default/files/2026-07/20260707%20-%20CA%20Paris%20-%20CP.pdf'],
      ['LCP', 'https://lcp.fr/actualites/ce-soir-je-suis-candidate-a-l-election-presidentielle-annonce-marine-le-pen-438886'],
      ['Club des juristes', 'https://www.leclubdesjuristes.com/en-bref/condamnation-de-marine-le-pen-la-cour-de-cassation-fera-tout-pour-statuer-avant-le-scrutin-presidentiel-affirme-remy-heitz-16893/']
    ]
  },
  {
    nom: 'Éric Zemmour', bloc: 'Extrême droite', image: 'img/zemmour-couleur.webp',
    etiquette: 'Candidat · sept. 2026', tampon: '2<sup>e</sup> candidature',
    role: 'Président de Reconquête', valeurs: [9, 1, 1, 9],
    phrase: 'Je me présente pour conserver une France française et que notre avenir soit français.', quand: '10 novembre 2026 · 20&nbsp;h de TF1',
    annees: ['2022', '2027'],
    justice: 'Condamnations définitives, dont contestation de crime contre l’humanité (Pétain, 2026), provocation à la haine (2025), diffamation (2026)… Condamné en 1re instance pour injure (Crépol, 2025), suite non connue&nbsp;; présumé innocent.',
    blocSource: 'nuancier 2026 (Reconquête)', verifie: '25/11/2026',
    horsCarte: [
      ['Injures à caractère homophobe (CNews, 2019)', 'Relaxé par la cour d’appel de Paris (11&nbsp;septembre 2024)', [['Club des juristes', 'https://www.leclubdesjuristes.com/en-bref/propos-sur-les-mineurs-isoles-eric-zemmour-condamne-en-appel-6861']]],
      ['Propos sur la déportation des homosexuels', 'Relaxe confirmée par la cour d’appel de Paris (25&nbsp;juin 2026)', [['Actu-Juridique', 'https://www.actu-juridique.fr/auteur/isabelle-horlans/']]],
      ['Apologie du terrorisme (propos de 2016)', 'Enquête classée sans suite (janvier 2017)', [['Europe 1', 'https://www.europe1.fr/societe/zemmour-disant-respecter-les-djihadistes-lenquete-pour-apologie-du-terrorisme-classee-2952761']]]
    ],
    sources: [
      ['LCP', 'https://lcp.fr/actualites/presidentielle-2027-eric-zemmour-officialise-sa-candidature-441871'],
      ['Hespress', 'https://fr.hespress.com/258309-258309.html'],
      ['Club des juristes', 'https://www.leclubdesjuristes.com/en-bref/la-cour-de-cassation-confirme-deux-condamnations-deric-zemmour-pour-complicite-dinjure-publique-provocation-a-la-haine-et-pour-diffamation-13229/'],
      ['Club des juristes', 'https://leclubdesjuristes.com/en-bref/condamnation-deric-zemmour-pour-contestation-de-crime-contre-lhumanite-18651']
    ]
  },
  {
    nom: 'Florian Philippot', bloc: 'Extrême droite', image: 'img/philippot-couleur.webp',
    etiquette: 'Candidat · mai 2026', tampon: 'Sauf si Villiers',
    role: 'Président des Patriotes · ancien député européen', valeurs: [7, 5, 5, 3],
    phrase: 'C’est Philippe de Villiers qui incarne possiblement ce rassemblement anti-UE et anti-Otan.', quand: '9 mai 2026 · France&nbsp;2',
    annees: ['2027'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuancier 2026 (Les Patriotes)', verifie: '25/11/2026',
    sources: [
      ['Sud Radio (AFP)', 'https://www.sudradio.fr/politique/je-suis-candidat-florian-philippot-se-lance-pour-la-presidentielle-de-2027'],
      ['LCP (liste des candidats)', 'https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-declares-et-potentiels-444932']
    ]
  },
  {
    nom: 'Jordan Bardella', bloc: 'Extrême droite', image: 'img/bardella-couleur.webp',
    etiquette: 'Plan B · avr. 2025', tampon: 'Si Le Pen empêchée',
    role: 'Président du RN · député européen', valeurs: [9, 6, 6, 10],
    phrase: 'Si elle devait être empêchée demain, je pense pouvoir vous dire que je serai son candidat.', quand: 'Avril 2025 · Le Parisien',
    annees: ['2027&nbsp;?'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuancier 2026 (RN)', verifie: '25/11/2026',
    sources: [
      ['Europe&nbsp;1', 'https://www.europe1.fr/node/708835'],
      ['Landot (JO)', 'https://blog.landot-avocats.net/2024/06/13/proclamation-des-resultats-de-lelection-des-representants-au-parlement-europeen/'],
      ['HATVP', 'https://www.hatvp.fr/livraison/dossiers/bardella-jordan-dim33673-europe.pdf']
    ]
  },
  {
    nom: 'Sarah Knafo', bloc: 'Extrême droite', image: 'img/knafo-couleur.webp',
    etiquette: 'Pas candidate · janv. 2026', tampon: 'Hors course',
    role: 'Députée européenne · élue du 16<sup>e</sup> arrondissement de Paris', valeurs: [6, 4, 4, 10],
    phrase: 'C’est un travail à plein temps.', quand: '7 janvier 2026 · TF1, à propos de la mairie de Paris',
    annees: ['aucune candidature'], justice: 'Aucune condamnation identifiée dans les sources consultées.',
    blocSource: 'nuancier 2026 (Reconquête)', verifie: '25/11/2026',
    horsCarte: [
      ['Plainte de l’État algérien pour «&nbsp;diffusion de fausses nouvelles&nbsp;» (propos sur RMC, septembre 2024)', 'Classée sans suite par le parquet de Paris le 27&nbsp;septembre 2024, infraction non caractérisée', [['TelQuel (AFP)', 'https://telquel.ma/instant-t/2024/10/03/800-millions-deuros-daide-a-lalgerie-une-plainte-dalger-contre-une-eurodeputee-francaise-classee_1896718/'], ['H24info (AFP)', 'https://h24info.ma/monde/800-millions-deuros-daide-a-lalgerie-la-plainte-dalger-contre-sarah-knafo-classee/']]]
    ],
    sources: [
      ['Europe&nbsp;1', 'https://www.europe1.fr/politique/municipales-2026-a-paris-leurodeputee-reconquete-sarah-knafo-officialise-sa-candidature-877873'],
      ['Intérieur (Paris)', 'https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/11/75/75056/index.html'],
      ['Intérieur (16<sup>e</sup>)', 'https://www.resultats-elections.interieur.gouv.fr/ConseilsdarrondissementPLM2026/ensemble_geographique/11/75/75056SR16/rappel_candidature/1/6.html']
    ]
  }
];

var ACTIONS = [
  {
    nom: 'Élisabeth Borne', type: 'Carte action', code: '49.3',
    image: 'img/borne-couleur.webp', etiquette: 'Édition 2/2', tampon: '23 recours',
    role: 'Première ministre · 2022-2024',
    pouvoir: '<b>Engage ta responsabilité.</b> Une carte adverse passe dans ton camp, sans vote, et perd 1 partout.',
    pouvoirFl: '<b>Engage ta responsabilité.</b> Une carte adverse passe dans ton camp, sans vote, et perd 2 en Attaque et en Défense.',   // règles Flèches
    petit: 'Pas à ton dernier tour · Parade&nbsp;: censure',
    vraieVie: 'Dans la vraie vie · art.&nbsp;49.3',
    texte: 'Texte adopté sans vote, sauf motion de censure.',
    barres: { max: 28, lignes: [['Michel Rocard', 28, false], ['Élisabeth Borne', 23, true]] },
    sources: [
      ['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/la-premiere-ministre-elisabeth-borne-a-demissionne'],
      ['Statista', 'https://statista.com/statistics/1471967/use-of-article-493-in-france-by-prime-minister'],
      ['Europe&nbsp;1', 'https://www.europe1.fr/node/233504']
    ]
  },
  {
    nom: 'Manuel Valls', type: 'Carte action', code: 'Mercato',
    image: 'img/valls-couleur.webp', etiquette: 'Mercato 2017', tampon: '37 ans au PS',
    role: 'Premier ministre · 2014-2016',
    pouvoir: '<b>Mercato.</b> Une de tes cartes et une carte adverse changent de camp. La recrue rejuge ses voisines.',
    pouvoirFl: '<b>Mercato.</b> Une de tes cartes et une carte adverse changent de camp. La recrue attaque avec ses flèches.',   // règles Flèches
    petitFl: 'Pas à ton dernier tour',
    petit: 'Pas à ton dernier tour · chiffre contre chiffre',
    vraieVie: 'Dans la vraie vie · mercato politique',
    frise: [
      ['1980', 'Adhère au PS, à 17 ans'],
      ['2017', 'Vote Macron dès le 1<sup>er</sup> tour, quitte le PS'],
      ['2024', 'Ministre des Outre-mer (Bayrou)']
    ],
    sources: [
      ['Europe&nbsp;1', 'https://www.europe1.fr/node/298762'],
      ['Paris Match', 'https://www.parismatch.be/actualites/politique/2017/06/27/manuel-valls-quitte-le-ps-et-rejoint-la-republique-en-marche-a-lassemblee-ORFPCH6YTJAKTJX55AWMGWKGQ4/'],
      ['info.gouv.fr', 'https://www.info.gouv.fr/actualite/la-composition-du-gouvernement-de-francois-bayrou']
    ]
  },
  {
    nom: 'Yaël Braun-Pivet', type: 'Carte action', code: 'Suspension',
    image: 'img/braun-pivet-couleur.webp', etiquette: 'Perchoir 2022', tampon: '1<sup>re</sup> femme',
    role: 'Présidente de l’Assemblée nationale',
    pouvoir: '<b>Suspension de séance.</b> Jusqu’à ton prochain tour, plus aucune carte ne change de camp.',
    petit: 'Une fois par partie',
    vraieVie: 'Dans la vraie vie · règlement du Congrès',
    texte: 'Présidente du Congrès, elle «&nbsp;peut, à tout moment, suspendre ou lever la séance&nbsp;».',
    frise: [
      ['2022', 'Première femme élue au perchoir'],
      ['2024', 'Réélue au 3<sup>e</sup> tour, avec 220 voix']
    ],
    sources: [
      ['Atlantico', 'https://v3.atlantico.fr/article/pepite/yael-braun-pivet-premiere-femme-elue-presidente-de-l-assemblee-nationale'],
      ['Club des juristes', 'https://www.leclubdesjuristes.com/en-bref/presidence-de-lassemblee-nationale-yael-braun-pivet-reelue-6641/'],
      ['LCP', 'https://lcp.fr/actualites/presidentielle-yael-braun-pivet-plaide-pour-un-candidat-unique-du-centre-et-de-la-droite'],
      ['Public Sénat', 'https://www.publicsenat.fr/actualites/parlementaire/quels-sont-les-pouvoirs-de-la-presidente-de-lassemblee-nationale'],
      ['Règlement du Congrès', 'https://www.assemblee-nationale.fr/connaissance/reglement_congres_0115.pdf']
    ]
  },
  {
    nom: 'Charles de Gaulle', type: 'Carte action', code: 'L’Appel',
    image: 'img/degaulle-couleur.webp', etiquette: '18 juin 1940', tampon: '1<sup>er</sup> de la V<sup>e</sup>',
    role: 'Président de la République · 1959-1969',
    pouvoir: '<b>Appel du 18&nbsp;Juin.</b> Reprends une de tes cartes passée chez l’adversaire.',
    petit: 'Jouable par tous les blocs · une fois par partie',
    vraieVie: 'Dans la vraie vie · président préféré',
    texte: 'Le président de la V<sup>e</sup> que les Français apprécient le plus (Fondation Jean-Jaurès, 2021).',
    barres: { max: 46, lignes: [['Charles de Gaulle', 46, true, '46&nbsp;%'], ['Jacques Chirac', 42, false, '42&nbsp;%']] },
    sources: [
      ['Fondation Jean-Jaurès', 'https://www.jean-jaures.org/publication/le-regard-des-francais-sur-francois-mitterrand/'],
      ['Europe&nbsp;1', 'https://www.europe1.fr/node/170877']
    ]
  },
  {
    nom: 'Nicolas Sarkozy', type: 'Carte action', code: 'Bracelet',
    image: 'img/sarkozy-couleur.webp', etiquette: 'Casier 2025', tampon: '2 définitives',
    role: 'Président de la République · 2007-2012',
    pouvoir: '<b>Sous bracelet.</b> Pendant deux tours, une carte adverse ne peut plus retourner de carte.',
    pouvoirFl: '<b>Sous bracelet.</b> Jusqu’à la fin, une carte de la main adverse ne peut plus attaquer, ni se défendre.',   // règles Flèches
    petit: 'Une fois par partie',
    vraieVie: 'Dans la vraie vie · casier judiciaire',
    texte: 'Libye&nbsp;: 1<sup>er</sup> ex-président incarcéré (20 jours). Arrêt d’appel attendu le 30/11/2026&nbsp;: présumé innocent.',
    frise: [
      ['2024', 'Écoutes&nbsp;: 1 an sous bracelet, définitif'],
      ['2025', 'Bygmalion&nbsp;: 2<sup>e</sup> condamnation définitive']
    ],
    sources: [
      ['Brut', 'https://www.brut.media/fr/articles/sarkozy-definitivement-condamne-dans-laffaire-bygmalion'],
      ['RTBF', 'https://www.rtbf.be/article/proces-libyen-sarkozy-juge-coupable-d-association-de-malfaiteurs-relaxe-des-faits-de-corruption-11606499'],
      ['Paris Match', 'https://www.parismatch.be/actualites/monde/2026/05/29/est-ce-que-je-vais-y-retourner-nicolas-sarkozy-sadresse-aux-francais-apres-son-proces-en-appel-FCRBEFCUDZD6DGJ2UUWPIYWFVI/']
    ]
  },
  {
    nom: 'Emmanuel Macron', type: 'Carte action', code: 'Passation',
    image: 'img/macron-couleur.webp', etiquette: 'Mai 2027', tampon: '2 mandats max',
    role: 'Président de la République · 2017-2027',
    pouvoir: '<b>Passation.</b> Remplace une de tes cartes posées par une carte de ta main&nbsp;: même case, même camp.',
    petit: 'Une fois par partie',
    vraieVie: 'Dans la vraie vie · article&nbsp;6 de la Constitution',
    texte: '«&nbsp;Nul ne peut exercer plus de deux mandats consécutifs.&nbsp;» Il est le premier président concerné.',
    frise: [
      ['2017', 'Élu à 39 ans, réélu en 2022'],
      ['2027', 'Ne peut pas se représenter']
    ],
    sources: [
      ['Slate', 'https://www.slate.fr/story/226332/macron-troisieme-mandat-quinquennat-2032-conseil-constitutionnel'],
      ['LCP', 'https://lcp.fr/index%2Ephp/actualites/j-ai-pas-fait-de-politique-avant-et-j-en-ferai-pas-apres-emmanuel-macron-dit-ne-pas']
    ]
  },
  {
    nom: 'Bruno Le Maire', type: 'Carte action', code: 'Pas candidat',
    image: 'img/le-maire-couleur.webp', etiquette: 'Novembre 2026', tampon: '7 ans à Bercy',
    role: 'Ministre de l’Économie · 2017-2024',
    pouvoir: '<b>On verra demain.</b> Passe ton tour, puis joue deux cartes au tour suivant.',
    petit: 'Tant qu’il te reste trois cartes à poser',
    vraieVie: 'Dans la vraie vie · records ministériels',
    texte: '«&nbsp;L’homme qui vous parle ce matin n’est pas candidat (…), on verra demain.&nbsp;» France&nbsp;2, novembre 2026.',
    frise: [
      ['2017', 'Bercy pendant 7 ans, record d’affilée sous la V<sup>e</sup>'],
      ['2025', 'Ministre des Armées pendant 14 heures']
    ],
    sources: [
      ['Europe&nbsp;1', 'https://www.europe1.fr/politique/sur-le-depart-bruno-le-maire-dit-vouloir-respirer-un-air-different-de-la-politique-4267080'],
      ['Sud Radio', 'https://www.sudradio.fr/la-biographie-et-cv-de-bruno-lemaire'],
      ['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/fin-de-lemploi-a-vie-des-fonctionnaires-hausse-de-la-tva-et-du-salaire-net-ric-suppression-du-departement-et-du-49-3-le-projet-de-bruno-le-maire-non-candidat-a-la-presidentielle']
    ]
  },
  {
    nom: 'Gérard Larcher', type: 'Carte action', code: 'Le Fauteuil',
    image: 'img/larcher-couleur.webp', etiquette: 'Plateau 2026', tampon: '6<sup>e</sup> mandat',
    role: 'Président du Sénat',
    pouvoir: '<b>Indéboulonnable.</b> Une de tes cartes posées, puis la prochaine que tu poses, ne peuvent plus être retournées.',
    pouvoirFl: '<b>Indéboulonnable.</b> Une de tes cartes posées, puis la prochaine que tu poses, ne peuvent plus être prises ni défiées.',   // règles Flèches
    petit: 'Une fois par partie',
    vraieVie: 'Dans la vraie vie · le fauteuil du Sénat',
    texte: 'Annoncés à 40&nbsp;000&nbsp;€ HT par le Canard enchaîné en janvier 2025, les nouveaux fauteuils ont coûté 34&nbsp;000&nbsp;€. «&nbsp;Une erreur&nbsp;», admet-il.',
    frise: [
      ['2026', 'Réélu président du Sénat, pour un 6<sup>e</sup> mandat']
    ],
    sources: [
      ['Économie Matin', 'https://www.economiematin.fr/senat-34000-euros-siege-larcher-plaide-erreur'],
      ['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/gerard-larcher-reelu-a-la-presidence-du-senat-pour-la-sixieme-fois']
    ]
  },
  {
    nom: 'Bernard Arnault', type: 'Carte action', code: 'Le Patron',
    image: 'img/arnault-couleur.webp', etiquette: 'Challenges 2026', tampon: '1<sup>re</sup> fortune',
    role: 'PDG de LVMH',
    pouvoir: '<b>Rachat.</b> Tu t’offres un siège libre&nbsp;: plus personne ne peut s’y asseoir.',
    pouvoirFl: '<b>Rachat.</b> Tu rachètes une carte adverse posée&nbsp;: elle quitte la partie, son siège avec.',   // règles Flèches
    petit: 'Une fois par partie',
    vraieVie: 'Dans la vraie vie · classement Challenges',
    texte: 'Avec sa famille, 1<sup>re</sup> fortune professionnelle de France selon Challenges, dont il est l’unique propriétaire depuis fin 2025.',
    frise: [
      ['2025', 'Détrôné par les héritiers Hermès'],
      ['2026', 'Reprend la 1<sup>re</sup> place']
    ],
    sources: [
      ['FashionUnited 2026', 'https://fashionunited.fr/actualite/people/bernard-arnault-redevient-la-1ere-fortune-professionnelle-de-france-selon-challenges/2026070842308'],
      ['FashionUnited 2025', 'https://fashionunited.fr/actualite/people/les-heritiers-hermes-1ere-fortune-professionnelle-de-france-devant-bernard-arnault/2025070938691']
    ]
  },
  {
    nom: 'Pascal Praud', type: 'Carte action', code: 'Édito',
    image: 'img/praud-couleur.webp', etiquette: 'L’Heure des pros', tampon: 'Record 648&nbsp;000',
    role: 'Animateur de L’Heure des pros, sur CNews',
    pouvoir: '<b>Édito quotidien.</b> Jusqu’à la fin, chaque carte que tu poses gagne +1 partout.',
    pouvoirFl: '<b>Édito quotidien.</b> Jusqu’à la fin, chaque carte que tu poses gagne +2 en Attaque et en Défense.',   // règles Flèches
    petit: 'Une fois par partie',
    vraieVie: 'Dans la vraie vie · audience et Arcom',
    frise: [
      ['2024', 'Record d’audience&nbsp;: 648&nbsp;000 téléspectateurs'],
      ['2024', 'L’Arcom inflige 50&nbsp;000&nbsp;€ d’amende à CNews'],
      ['2026', '100&nbsp;000&nbsp;€ pour des «&nbsp;propos de nature à inciter à la haine&nbsp;»']
    ],
    sources: [
      ['Puremédias (record)', 'https://www.ozap.com/actu/audiences-le-clash-entre-pascal-praud-et-christophe-deloire-offre-un-record-d-audience-historique-a-l-heure-des-pros-sur-cnews/642504'],
      ['Puremédias (2024)', 'https://www.ozap.com/actu/cnews-condamnee-a-50-000-euros-d-amendes-apres-des-propos-de-geoffroy-lejeune-sur-l-immigration-arabo-musulmane-dans-l-heure-des-pros-2/644060'],
      ['Puremédias (2026)', 'https://www.ozap.com/actu/des-propos-de-nature-a-inciter-a-la-haine-larcom-condamne-cnews-a-une-amende-de-100000-euros-apres-deux-emissions-de-lheure-des-pros-2/653646']
    ]
  },
  {
    nom: 'François Bayrou', type: 'Carte action', code: 'Le Plan',
    image: 'img/bayrou-couleur.webp', etiquette: 'Plan 2020', tampon: '364 contre 194',
    role: 'Premier ministre · 2024-2025',
    pouvoir: '<b>Planification.</b> Regarde les trois cartes du dessus de la pioche et échanges-en une avec ta main.',
    petit: 'Une fois par partie',
    vraieVie: 'Dans la vraie vie · le Plan',
    texte: '«&nbsp;Je ne serais pas commissaire au plan (…) mais Pape ou Dalaï-Lama.&nbsp;» Assemblée nationale, 2021.',
    frise: [
      ['2020', 'Haut-commissaire au Plan, à titre bénévole'],
      ['2025', '1<sup>er</sup> chef de gouvernement renversé sur la confiance']
    ],
    sources: [
      ['Europe&nbsp;1', 'https://www.europe1.fr/politique/emmanuel-macron-confirme-la-nomination-de-francois-bayrou-haut-commissaire-au-plan-3988248'],
      ['Assemblée nationale', 'https://www.assemblee-nationale.fr/dyn/15/comptes-rendus/colter/l15colter2021016_compte-rendu.pdf'],
      ['Paperjam', 'https://paperjam.lu/article/francois-bayrou-remet-sa-demission-apres-sa-chute-a-lassemblee']
    ]
  },
  {
    nom: 'Edwy Plenel', type: 'Carte action', code: 'Révélation',
    image: 'img/plenel-couleur.webp', etiquette: 'Mediapart 2008', tampon: 'Affaire Cahuzac',
    role: 'Journaliste · cofondateur de Mediapart',
    pouvoir: '<b>Scoop.</b> Ton adversaire joue main ouverte jusqu’à la fin de la partie.',
    pouvoirFl: '<b>Scoop.</b> Ton adversaire joue main ouverte pendant ses trois prochains tours.',   // règles Flèches
    petit: 'Une fois par partie',
    vraieVie: 'Dans la vraie vie · journalisme d’enquête',
    frise: [
      ['1985', 'Au Monde, enquête sur le Rainbow Warrior'],
      ['2008', 'Cofonde Mediapart'],
      ['2012', 'Révèle l’affaire Cahuzac, 1<sup>re</sup> démission du gouvernement Hollande']
    ],
    sources: [
      ['Universalis', 'https://www.universalis.fr/encyclopedie/edwy-plenel/'],
      ['Puremédias', 'https://www.ozap.com/actu/quand-francois-hollande-disait-avoir-tout-a-craindre-de-mediapart/446236']
    ]
  },
  {
    nom: 'François de Rugy', type: 'Carte action', code: 'Le Homard',
    image: 'img/rugy-couleur.webp', etiquette: 'Juillet 2019', tampon: '3 dîners pointés',
    role: 'Président de l’Assemblée nationale · 2017-2018',
    pouvoir: '<b>Dîner à Lassay.</b> Une carte adverse quitte le plateau et rentre dans la main adverse.',
    pouvoirFl: '<b>Dîner à Lassay.</b> Une carte adverse quitte le plateau et la partie&nbsp;: elle ne compte plus.',   // règles Flèches
    petit: 'Elle y reste · pas sur un Fauteuil',
    vraieVie: 'Dans la vraie vie · l’hôtel de Lassay',
    texte: 'Homards et grands crus à l’hôtel de Lassay, selon Mediapart. L’Assemblée n’y voit «&nbsp;aucune irrégularité&nbsp;».',
    frise: [
      ['2019', 'Quitte le gouvernement six jours après les révélations']
    ],
    sources: [
      ['TelQuel (AFP)', 'https://telquel.ma/2019/07/16/accuse-de-depenses-fastueuses-francois-de-rugy-demissionne_1645460'],
      ['LCP', 'https://lcp.fr/index%2ephp/actualites/diners-de-francois-de-rugy-a-lassay-aucune-irregularite-mais-trois-repas-pointes-par-l'],
      ['Universalis', 'https://www.universalis.fr/evenement/10-23-juillet-2019-demission-du-ministre-de-la-transition-ecologique-et-solidaire-francois-de-rugy/']
    ]
  },
  {
    nom: 'Roselyne Bachelot', type: 'Carte action', code: 'Vaccination',
    image: 'img/bachelot-couleur.webp', etiquette: 'Grippe A · 2009', tampon: '94 millions de doses',
    role: 'Ministre de la Santé · 2007-2010',
    pouvoir: '<b>Vaccination de masse.</b> Jusqu’à ton prochain tour, tes cartes ne peuvent pas être retournées.',
    petit: 'Une fois par partie',
    vraieVie: 'Dans la vraie vie · la grippe A (H1N1)',
    barres: { max: 94, lignes: [['Doses', 94, false, '94&nbsp;M'], ['Vaccinés', 5.5, true, '5,5&nbsp;M']] },
    frise: [
      ['2010', 'Résilie 50 des 94 millions de doses'],
      ['2010', 'Son fils, conseiller au cabinet, rejoint l’Inpes']
    ],
    sources: [
      ['Assemblée nationale', 'https://www.assemblee-nationale.fr/dyn/13/questions/QANR5L13QG2055.pdf'],
      ['Le Quotidien du médecin', 'https://diabetologie-endocrinologie.lequotidiendumedecin.fr/liberal/exercice/les-generalistes-vont-pouvoir-vacciner'],
      ['Le Quotidien du médecin (2010)', 'https://www.lequotidiendumedecin.fr/archives/le-fils-de-roselyne-bachelot-nomme-linpes']
    ]
  },
  {
    nom: 'Jean-François Copé', type: 'Carte action', code: 'Proclamé',
    image: 'img/cope-couleur.webp', etiquette: 'UMP · novembre 2012', tampon: '98 voix d’avance',
    role: 'Ancien président de l’UMP',
    pouvoir: '<b>Je l’ai emporté.</b> En cas d’égalité à la fin, c’est toi qui gagnes, sans second tour.',
    petit: 'Une fois par partie',
    vraieVie: 'Dans la vraie vie · le duel Copé-Fillon',
    texte: 'Le soir du vote, lui et François Fillon se proclament tous deux vainqueurs. La commission du parti le déclare élu avec 98 voix d’avance.',
    frise: [
      ['2016', 'Primaire de la droite : 0,3&nbsp;%'],
      ['2016', 'Un pain au chocolat&nbsp;? «&nbsp;10 ou 15 centimes&nbsp;»']
    ],
    sources: [
      ['Universalis', 'https://www.universalis.fr/evenement/18-28-novembre-2012-election-contestee-du-president-de-l-u-m-p/'],
      ['La Libre (2012)', 'https://www.lalibre.be/international/2012/11/19/cope-president-de-lump-pour-98-voix-decart-WJJTINB22ZEORIK64HXZF7BL24/'],
      ['L’Avenir (AFP)', 'https://www.lavenir.net/actu/monde/2016/11/20/primaire-de-la-droite-en-france-fillon-et-juppe-au-second-tour-sarkozy-elimine-6SMGZ7NWU5HA5N2EL6XH4KF7R4/'],
      ['La Libre (2016)', 'https://www.lalibre.be/international/2016/10/25/pain-au-chocolat-baguette-timbre-ticket-de-metro-ces-politiques-deconnectes-de-la-realite-V5TMNSHA6BHXZPAKSG232V3SYQ/']
    ]
  },
  {
    nom: 'Arnaud Montebourg', type: 'Carte action', code: 'Relocalisation',
    image: 'img/montebourg-couleur.webp', etiquette: 'Made in France · 2012', tampon: 'Bleu Blanc Ruche',
    role: 'Ministre du Redressement productif · 2012-2014',
    pouvoir: '<b>Relocalisation.</b> Une de tes cartes déménage sur un siège libre et s’y bat de nouveau.',
    pouvoirFl: '<b>Relocalisation.</b> Une de tes cartes déménage sur un siège libre et attaque de nouveau avec ses flèches.',   // règles Flèches
    petitFl: 'Une fois par partie',
    petit: 'Une fois par partie · chiffre contre chiffre',
    vraieVie: 'Dans la vraie vie · le made in France',
    texte: 'En 2012, il pose en marinière, un blender Moulinex dans les bras, à la une du Parisien Magazine.',
    frise: [
      ['2018', 'Lance le miel Bleu Blanc Ruche'],
      ['2022', 'Retire sa candidature au bout de quatre mois']
    ],
    sources: [
      ['Puremédias', 'https://www.ozap.com/actu/arnaud-montebourg-pose-en-mariniere-pour-vanter-le-made-in-france/443608'],
      ['Pleinchamp', 'https://www.pleinchamp.com/actualite/actualites-generales~bleu-blanc-ruche-le-miel-sigle-arnaud-montebourg'],
      ['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/presidentielle-arnaud-montebourg-jette-l-eponge-191941']
    ]
  },
  {
    nom: 'Nadine Morano', type: 'Carte action', code: 'Ça suffit !',
    image: 'img/morano-couleur.webp', etiquette: 'Février 2012', tampon: '140 signes',
    role: 'Eurodéputée · ancienne ministre',
    pouvoir: '<b>Maintenant ça suffit&nbsp;!</b> La carte action adverse est annulée, si elle n’a pas encore été jouée.',
    petit: 'Une fois par partie',
    vraieVie: 'Dans la vraie vie · le communiqué express',
    texte: 'En février 2012, elle répond à une polémique par un communiqué titré «&nbsp;Maintenant ça suffit&nbsp;!&nbsp;».',
    frise: [
      ['2014', 'Élue au Parlement européen, réélue en 2024'],
      ['2016', 'Pas assez de parrainages pour la primaire']
    ],
    sources: [
      ['Puremédias', 'https://www.ozap.com/actu/-maintenant-ca-suffit-lance-nadine-morano-aux-journalistes/439252'],
      ['Wikipédia (en)', 'https://en.wikipedia.org/wiki/Nadine_Morano'],
      ['VL Média', 'https://vl-media.fr/?p=126230']
    ]
  },
  {
    nom: 'Amélie de Montchalin', type: 'Carte action', code: 'Contrôle',
    image: 'img/montchalin-couleur.webp', etiquette: 'Rue Cambon · 2026', tampon: 'Après 38 hommes', verifie: '19/11/2026',
    role: 'Première présidente de la Cour des comptes',
    pouvoir: '<b>Cour des comptes.</b> Une de tes cartes posées rejuge ses voisines adverses.',
    pouvoirFl: '<b>Cour des comptes.</b> Une de tes cartes posées attaque de nouveau, sans dés.',   // règles Flèches
    petit: 'Pas à ton dernier tour',
    vraieVie: 'Dans la vraie vie · la Cour des comptes',
    texte: 'Ministre des Comptes publics le dimanche 22 février 2026, à la tête de la Cour des comptes le lundi.',
    frise: [
      ['2022', 'Battue par Jérôme Guedj, le jour de ses 37 ans'],
      ['2026', 'Se déporte des travaux sur ses budgets']
    ],
    sources: [
      ['Acteurs publics', 'https://acteurspublics.fr/articles/david-amiel-promu-ministre-de-laction-et-des-comptes-publics/'],
      ['MoneyVox', 'https://www.moneyvox.fr/actu/107573/la-cour-des-comptes-une-vieille-dame-qui-s-assure-du-bon-emploi-de-argent-public'],
      ['Public Sénat', 'https://www.publicsenat.fr/actualites/economie/la-dette-consomme-toutes-nos-marges-de-manoeuvre-budgetaires-salarme-la-cour-des-comptes-avant-les-arbitrages-du-prochain-budget'],
      ['Motor1', 'https://fr.motor1.com/news/593153/ministre-transition-ecologique-amelie-montchalin-legisltatives/']
    ]
  },
  {
    nom: 'Amélie Oudéa-Castéra', type: 'Carte action', code: 'Djadja show',
    image: 'img/oudea-castera-couleur.webp', etiquette: 'Mars 2024', tampon: '4 tubes cités', verifie: '19/11/2026',
    role: 'Ministre des Sports et des JO · 2022-2024',
    pouvoir: '<b>J’aime bien.</b> Ce tour-ci, ta carte posée gagne +3 partout&nbsp;: ↑&nbsp;Djadja →&nbsp;Doudou ↓&nbsp;SMS ←&nbsp;Hypé.',
    pouvoirFl: '<b>J’aime bien.</b> Ce tour-ci, ta carte posée gagne +3 partout et devient indéboulonnable. Djadja&nbsp;!',   // règles Flèches
    petit: 'Une fois par partie',
    vraieVie: 'Dans la vraie vie · les JO de Paris',
    texte: 'Pour défendre Aya Nakamura, pressentie pour la cérémonie des JO, la ministre fredonne Djadja, puis cite les tubes qu’elle «&nbsp;aime bien&nbsp;».',
    frise: [
      ['2024', 'Ministre de l’Éducation nationale 28 jours'],
      ['2024', 'Djadja aux JO, avec la Garde républicaine']
    ],
    sources: [
      ['Purepeople', 'https://www.purepeople.com/article/aya-nakamura-a-la-ceremonie-des-jo-de-paris-amelie-oudea-castera-la-defend-en-chanson-et-se-fait-ridiculiser_a520759/1'],
      ['Europe&nbsp;1', 'https://www.europe1.fr/node/7528'],
      ['Paris Match', 'https://www.parismatch.be/actualites/people/2024/08/17/apres-son-show-iconique-aux-jo-aya-nakamura-se-moque-de-ses-detracteurs-ZC2NIPO2NNCMTCSEG74UNB6XVE/'],
      ['RTBF', 'https://www.rtbf.be/article/aya-nakamura-repond-a-la-polemique-sur-sa-prestation-aux-jeux-olympiques-11425118']
    ]
  },
  {
    nom: 'Philippe Poutou', type: 'Carte action', code: 'Le Tacle',
    image: 'img/poutou-couleur.webp', etiquette: '4 avril 2017', tampon: 'Immunité ouvrière', verifie: '21/11/2026',
    role: 'Ouvrier chez Ford · candidat du NPA en 2017',
    pouvoir: '<b>Pas d’immunité ouvrière.</b> Les cartes adverses perdent leurs protections&nbsp;: fauteuil, vaccin, droit de réponse.',
    petit: 'Une fois par partie',
    vraieVie: 'Dans la vraie vie · le débat à onze',
    texte: 'Au débat télévisé, face à Fillon et Le Pen&nbsp;: «&nbsp;nous n’avons pas d’immunité ouvrière, on y va&nbsp;!&nbsp;»',
    frise: [
      ['2017', 'Au débat des onze candidats, tacle Fillon et Le Pen sur les affaires']
    ],
    sources: [
      ['Public Sénat (AFP)', 'https://www.publicsenat.fr/actualites/politique/poutou-creve-l-ecran-et-acquiert-une-legitimite-singuliere-58338'],
      ['Europe&nbsp;1', 'https://www.europe1.fr/node/294478']
    ]
  },
  {
    nom: 'Jérôme Cahuzac', type: 'Carte action', code: 'Compte caché',
    image: 'img/cahuzac-couleur.webp', etiquette: 'Décembre 2012', tampon: '4 ans dont 2 ferme', verifie: '21/11/2026',
    role: 'Ministre délégué au Budget · 2012-2013',
    pouvoir: '<b>Les yeux dans les yeux.</b> Une carte de ta main part en Suisse et compte pour toi. Tu repioches.',
    petit: 'Sauf si Révélation la découvre',
    vraieVie: 'Dans la vraie vie · fraude fiscale et blanchiment',
    texte: 'Un compte caché à l’étranger, révélé par Mediapart.',
    frise: [
      ['2018', 'Condamné en appel&nbsp;: 4 ans de prison dont 2 avec sursis']
    ],
    sources: [
      ['Cour d’appel de Paris', 'https://www.cours-appel.justice.fr/sites/default/files/2018-06/ComPresse_Cahuzac.pdf'],
      ['Public Sénat (AFP)', 'https://www.publicsenat.fr/article/politique/l-ancien-ministre-socialiste-jerome-cahuzac-echappe-a-la-prison-140077']
    ]
  },
  {
    nom: 'Thomas Thévenoud', type: 'Carte action', code: 'La Phobie',
    image: 'img/thevenoud-couleur.webp', etiquette: 'Septembre 2014', tampon: '9 jours ministre', verifie: '21/11/2026',
    role: 'Secrétaire d’État au Commerce extérieur · 2014',
    pouvoir: '<b>Phobie administrative.</b> Une carte de la main adverse ne comptera pas pour son camp.',
    petit: 'Sauf si elle change de camp',
    vraieVie: 'Dans la vraie vie · des impôts en retard',
    texte: 'Démissionne neuf jours après sa nomination. Condamné définitivement pour fraude fiscale.',
    frise: [
      ['2014', 'Démissionne neuf jours après sa nomination'],
      ['2018', 'Condamné en appel&nbsp;: 1 an avec sursis, 3 ans d’inéligibilité']
    ],
    sources: [
      ['Public Sénat (AFP)', 'https://www.publicsenat.fr/actualites/politique/fraude-fiscale-condamnation-definitive-de-l-ex-ministre-thomas-thevenoud-145302'],
      ['Europe&nbsp;1', 'https://www.europe1.fr/politique/fraude-fiscale-condamnation-definitive-de-lex-ministre-thomas-thevenoud-3919250']
    ]
  },
  {
    nom: 'Georges Marchais', type: 'Carte action', code: 'Taisez-vous !',
    image: 'img/marchais-couleur.webp', etiquette: 'Antenne 2, 1980', tampon: 'Jamais prononcé', verifie: '21/11/2026',
    role: 'Secrétaire général du Parti communiste',
    pouvoir: '<b>Taisez-vous&nbsp;!</b> Une carte adverse posée perd 3 partout.',
    pouvoirFl: '<b>Taisez-vous&nbsp;!</b> Une carte adverse posée perd toutes ses flèches, jusqu’à la fin.',   // règles Flèches
    petit: 'Une phrase qu’il n’a jamais dite',
    vraieVie: 'Dans la vraie vie · un imitateur',
    texte: '«&nbsp;Taisez-vous Elkabbach&nbsp;!&nbsp;» vient de Thierry Le Luron. Marchais ne l’a jamais prononcée.',
    frise: [
      ['1980', 'Interview houleuse face à Jean-Pierre Elkabbach, sur Antenne 2']
    ],
    sources: [
      ['CB News', 'https://www.cbnews.fr/carnet/image-deces-du-journaliste-jean-pierre-elkabbach-79292'],
      ['Ministère de la Culture', 'https://www.culture.gouv.fr/switchToLanguage/342467/fre-FR']
    ]
  },
  {
    nom: 'Jacques Attali', type: 'Carte action', code: 'Le Mentor de tout bord',
    image: 'img/attali-couleur.webp', etiquette: 'Commission Attali, 2008', tampon: '316 décisions', verifie: '22/11/2026',
    role: 'Économiste, ancien conseiller spécial de François Mitterrand',
    pouvoir: '<b>Faiseur de rois.</b> Une de tes cartes posées gagne 2 partout et repart à l’attaque.',
    pouvoirFl: '<b>Faiseur de rois.</b> Une de tes cartes posées gagne 2 en Attaque et en Défense, puis rejoue.',   // règles Flèches
    petit: 'À gauche, à droite, au centre',
    vraieVie: 'Dans la vraie vie · un jeune rapporteur',
    texte: 'Il a conseillé Mitterrand, présidé une commission voulue par Sarkozy, recruté le jeune Macron… et écrit deux chansons pour Barbara.',
    sources: [
      ['Assemblée nationale', 'https://www.assemblee-nationale.fr/13/pdf/cr-cfiab/07-08/c0708049.pdf'],
      ['Légifrance', 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000428428'],
      ['Le Temps', 'https://www.letemps.ch/culture/attali-mouvement-perpetueleconomiste-ingenieur-mines-eminence-grise-createur-dentreprises']
    ]
  }
];


var COURTS = ["Arthaud", "Mélenchon", "Roussel", "Ruffin", "Tondelier", "Rousseau", "Glucksmann", "Bouamrane", "Hollande", "Autain", "Royal", "Faure", "Guedj", "Attal", "Philippe", "Bergé", "Villepin", "Riner", "Polony", "Branco", "Lassalle", "Batho", "Lalanne", "Durif", "Cazeneuve", "Pigasse", "Breton", "Lagarde", "Leclerc", "Retailleau", "Lisnard", "Dupont‑Aignan", "Asselineau", "Bertrand", "Wauquiez", "Baroin", "Darmanin", "Castex", "Le Pen", "Zemmour", "Philippot", "Bardella", "Knafo"], COURTS_A = ["Borne", "Valls", "Braun-Pivet", "de Gaulle", "Sarkozy", "Macron", "Le Maire", "Larcher", "Arnault", "Praud", "Bayrou", "Plenel", "de Rugy", "Bachelot", "Copé", "Montebourg", "Morano", "Montchalin", "Oudéa-Castéra", "Poutou", "Cahuzac", "Thévenoud", "Marchais", "Attali"];
var METHODE = [{"voix": 232384, "election": "présidentielle 2017, 1er tour", "voixSource": ["Conseil constitutionnel via info.gouv.fr", "https://www.info.gouv.fr/actualite/resultats-definitifs-du-premier-tour-de-l-election-presidentielle-2017-etablis-par-le-conseil"], "national": 0.0, "local": 6.0, "vues": 9188, "devance": [27, 0, 17, 2], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-nathalie-arthaud"]]}, {"voix": 7712520, "election": "présidentielle 2022, 1er tour", "voixSource": ["Fondation Robert Schuman (chiffres officiels)", "https://server.www.robert-schuman.eu/storage/fr/doc/oee/oee-1973-fr.pdf"], "national": 33.2, "local": 21.0, "vues": 112926, "devance": [38, 42, 31, 40], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-jean-luc-melenchon"], ["Public Sénat", "https://www.publicsenat.fr/actualites/politique/jean-luc-melenchon-quitte-l-assemblee-retour-sur-trente-ans-de-mandats"]]}, {"voix": 802422, "election": "présidentielle 2022, 1er tour", "voixSource": ["Fondation Robert Schuman (chiffres officiels)", "https://server.www.robert-schuman.eu/storage/fr/doc/oee/oee-1973-fr.pdf"], "national": 7.0, "local": 12.7, "vues": 10692, "devance": [31, 21, 25, 3], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-fabien-roussel"]]}, {"voix": 27108, "election": "législatives 2024, 2d tour", "voixSource": ["La Mairie (ministère de l’Intérieur)", "https://www.la-mairie.com/departement/somme/elections/legislatives/01"], "national": 9.4, "local": 0.0, "vues": 40280, "devance": [17, 25, 0, 29], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-francois-ruffin"]]}, {"voix": 14239, "election": "législatives 2022, 2d tour", "voixSource": ["Datan", "https://datan.fr/deputes/pas-de-calais-62/depute_marine-lepen/legislature-16"], "national": 0.0, "local": 12.7, "vues": 40140, "devance": [10, 0, 25, 28], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-marine-tondelier"]]}, {"voix": 107993, "election": "régionales 2015, 1er tour, tête de liste", "voixSource": ["ministère de l’Intérieur", "https://www.archives-resultats-elections.interieur.gouv.fr/resultats/regionales-2015/32/32.php"], "national": 4.4, "local": 5.8, "vues": 28721, "devance": [25, 16, 16, 23], "mandatsSources": [["Datan", "https://datan.fr/deputes/paris-75/depute_sandrine-rousseau"], ["Wikipédia (en)", "https://en.wikipedia.org/wiki/Sandrine_Rousseau"]]}, {"voix": 3424216, "election": "européennes 2024, tête de liste", "voixSource": ["AFP / Le Courrier de Guadeloupe", "https://lecourrierdeguadeloupe.com/un-europeen-sur-deux-a-vote-dimanche-la-france-championne-de-lextreme-droite/?print=pdf"], "national": 7.3, "local": 0.0, "vues": 104474, "devance": [37, 22, 0, 39], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-raphael-glucksmann"]]}, {"voix": 9102, "election": "municipales 2026 (Saint-Ouen-sur-Seine), 2d tour, tête de liste", "voixSource": ["ministère de l’Intérieur", "https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/11/93/93070/index.html"], "national": 0.0, "local": 25.1, "vues": 25114, "devance": [9, 0, 34, 20], "mandatsSources": [["Wikipédia (en)", "https://en.wikipedia.org/wiki/Karim_Bouamrane"], ["Citoyens.com (résultats)", "https://94.citoyens.com/ville/saint-ouen-sur-seine/resultats"]]}, {"voix": 18000668, "election": "présidentielle 2012, 2d tour", "voixSource": ["Conseil constitutionnel via MJP (univ. Perpignan)", "https://mjp.univ-perp.fr/election/fr/fr2012.htm"], "national": 27.1, "local": 11.2, "vues": 41808, "devance": [42, 40, 23, 30], "mandatsSources": [["Élysée", "https://www.elysee.fr/en/francois-hollande"], ["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-francois-hollande"]]}, {"voix": 22209, "election": "législatives 2024, 1er tour", "voixSource": ["Datan", "https://datan.fr/deputes/seine-saint-denis-93/depute_clementine-autain"], "national": 9.4, "local": 7.0, "vues": 27174, "devance": [13, 25, 18, 22], "mandatsSources": [["Datan", "https://datan.fr/deputes/seine-saint-denis-93/depute_clementine-autain"], ["Politis", "https://www.politis.fr/articles/2026/01/clementine-autain-nous-devons-avoir-le-discours-dune-gauche-decomplexee/"]]}, {"voix": 16790440, "election": "présidentielle 2007, 2d tour", "voixSource": ["ministère de l’Intérieur", "https://www.archives-resultats-elections.interieur.gouv.fr/resultats/presidentielle_2007/FE.php"], "national": 22.0, "local": 25.0, "vues": 27064, "devance": [41, 36, 33, 21], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-segolene-royal"], ["Wikipédia (région)", "https://fr.wikipedia.org/wiki/S%C3%A9gol%C3%A8ne_Royal"]], "remarque": "Conseil municipal de Trouville-sur-Mer&nbsp;: 1983-1986, mois de départ non précisé, compté jusqu’en mars 1986."}, {"voix": 21643, "election": "législatives 2024, 1er tour", "voixSource": ["Datan", "https://datan.fr/deputes/seine-et-marne-77/depute_olivier-faure"], "national": 14.4, "local": 0.0, "vues": 21636, "devance": [12, 31, 0, 17], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-dolivier-faure"]], "remarque": "Buzz&nbsp;: l’article Wikipédia a été renommé en août 2026, les vues des deux titres sont additionnées mois par mois."}, {"voix": 38991, "election": "législatives 2024, 2d tour", "voixSource": ["Datan", "https://datan.fr/deputes/essonne-91/depute_jerome-guedj"], "national": 6.2, "local": 24.3, "vues": 12998, "devance": [23, 20, 32, 6], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-jerome-guedj"], ["Wikipédia (en)", "https://en.wikipedia.org/wiki/J%C3%A9r%C3%B4me_Guedj"]]}, {"voix": 29924, "election": "législatives 2024, 2d tour", "voixSource": ["Datan", "https://datan.fr/deputes/hauts-de-seine-92/depute_gabriel-attal"], "national": 9.4, "local": 12.7, "vues": 73344, "devance": [20, 25, 25, 36], "mandatsSources": [["info.gouv.fr", "https://www.info.gouv.fr/les-anciens-premiers-et-premieres-ministres-de-la-ve-republique/gabriel-attal"], ["Intérieur 2026", "https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/11/92/92075/rappel_candidature/1/1.html"]]}, {"voix": 26660, "election": "municipales 2014, 1er tour, tête de liste", "voixSource": ["ministère de l’Intérieur", "https://www.interieur.gouv.fr/Elections/Les-resultats/Municipales/elecresult__MN2014/(path)/MN2014/076/076351.html"], "national": 8.1, "local": 25.7, "vues": 53922, "devance": [16, 24, 35, 33], "mandatsSources": [["info.gouv.fr", "https://www.info.gouv.fr/les-anciens-premiers-et-premieres-ministres-de-la-ve-republique/edouard-philippe"], ["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-dedouard-philippe"]]}, {"voix": 32048, "election": "législatives 2024, 2d tour", "voixSource": ["Wikipédia (en), d’après le ministère de l’Intérieur", "https://en.wikipedia.org/wiki/Yvelines%27s_10th_constituency"], "national": 9.4, "local": 8.7, "vues": 33368, "devance": [21, 25, 21, 26], "mandatsSources": [["HATVP", "https://www.hatvp.fr/livraison/dossiers/berge-aurore-di34865-gouvernement.pdf"], ["Wikipédia (en)", "https://en.wikipedia.org/wiki/Aurore_Berg%C3%A9"]], "remarque": "Conseil municipal de Magny-les-Hameaux&nbsp;: élue en 2014, date de départ non trouvée, comptée jusqu’en 2017 (dernière mention)."}, {"voix": 0, "election": "jamais candidat au suffrage universel", "voixSource": ["Universalis", "https://www.universalis.fr/encyclopedie/dominique-de-villepin/"], "national": 5.0, "local": 0.0, "vues": 64992, "devance": [0, 17, 0, 35], "mandatsSources": [["Universalis", "https://www.universalis.fr/encyclopedie/dominique-de-villepin/"], ["Larousse", "https://www.larousse.fr/encyclopedie/personnage/wd/149004"]]}, {"voix": 0, "election": "jamais candidat avant 2027", "voixSource": ["LCP", "https://lcp.fr/actualites/le-judoka-teddy-riner-annonce-sa-candidature-a-l-election-presidentielle-de-2027-444920"], "national": 0.0, "local": 0.0, "vues": 18654, "devance": [0, 0, 0, 14], "mandatsSources": [["LCP", "https://lcp.fr/actualites/le-judoka-teddy-riner-annonce-sa-candidature-a-l-election-presidentielle-de-2027-444920"]]}, {"voix": 803, "election": "législatives 2002, 1er tour", "voixSource": ["Assemblée nationale", "https://www.assemblee-nationale.fr/elections/resultats/html/531.html"], "national": 0.0, "local": 0.0, "vues": 34761, "devance": [7, 0, 0, 27], "mandatsSources": [["LCP", "https://lcp.fr/actualites/natacha-polony-annonce-sa-candidature-a-l-election-presidentielle-443808"]]}, {"voix": 3596, "election": "législatives 2017, 1er tour", "voixSource": ["Wikipédia (en), d’après le ministère de l’Intérieur", "https://en.wikipedia.org/wiki/Seine-Saint-Denis%27s_12th_constituency"], "national": 0.0, "local": 0.0, "vues": 23321, "devance": [8, 0, 0, 19], "mandatsSources": [["Public Sénat", "https://www.publicsenat.fr/article/politique/legislatives-un-avocat-de-wikileaks-insoumis-laboure-le-9-3-61008"]]}, {"voix": 1101387, "election": "présidentielle 2022, 1er tour", "voixSource": ["Fondation Robert Schuman (chiffres officiels)", "https://server.www.robert-schuman.eu/storage/fr/doc/oee/oee-1973-fr.pdf"], "national": 20.0, "local": 40.3, "vues": 11567, "devance": [32, 35, 42, 4], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-jean-lassalle"], ["Wikipédia (en)", "https://en.wikipedia.org/wiki/Jean_Lassalle"]]}, {"voix": 37808, "election": "législatives 2024, 2d tour", "voixSource": ["Datan", "https://datan.fr/deputes/deux-sevres-79/depute_delphine-batho"], "national": 19.3, "local": 0.0, "vues": 6784, "devance": [22, 34, 0, 0], "mandatsSources": [["Wikipédia (en)", "https://en.wikipedia.org/wiki/Delphine_Batho"], ["Datan", "https://datan.fr/deputes/deux-sevres-79/depute_delphine-batho"]]}, {"voix": 121209, "election": "européennes 2019, tête de liste (Alliance jaune)", "voixSource": ["Toute l’Europe", "https://www.touteleurope.eu/?p=38970"], "national": 0.0, "local": 0.0, "vues": 11788, "devance": [26, 0, 0, 5], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/politique/francis-lalanne-du-chanteur-engage-des-annees-1980-aux-spheres-complotistes"]]}, {"voix": 0, "election": "aucun résultat officiel retrouvé", "voixSource": ["Sud Radio", "https://www.sudradio.fr/politique/qui-est-ce-sylvain-durif-le-christ-cosmique-candidat-a-la-presidentielle-2027"], "national": 0.0, "local": 0.0, "vues": 6784, "devance": [0, 0, 0, 0], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/politique/qui-est-ce-sylvain-durif-le-christ-cosmique-candidat-a-la-presidentielle-2027"]], "remarque": "Sud Radio lui prête 7 voix aux municipales de 2013 à Arques (Aude)&nbsp;: introuvable dans les résultats officiels, non retenu."}, {"voix": 27738, "election": "législatives 2012 (Manche, 4e), 1er tour", "voixSource": ["Wikipédia (en), d’après le ministère de l’Intérieur", "https://en.wikipedia.org/wiki/Manche%27s_4th_constituency"], "national": 14.9, "local": 18.2, "vues": 15995, "devance": [18, 32, 29, 13], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-bernard-cazeneuve"], ["Assemblée nationale", "https://www.assemblee-nationale.fr/13/tribun/fiches_id/old/785.asp"]], "remarque": "Mairie d’Octeville puis de Cherbourg-Octeville (communes fusionnées en 2000)&nbsp;: comptée sans interruption de 1995 à 2012."}, {"voix": 0, "election": "jamais candidat", "voixSource": ["La Gazette (AFP)", "https://www.lagazettefrance.fr/article/vacances-luxueuses-primaire-les-ambitions-presidentielles-de-pigasse-contrariees"], "national": 0.0, "local": 0.0, "vues": 77196, "devance": [0, 0, 0, 37], "mandatsSources": [["La Gazette (AFP)", "https://www.lagazettefrance.fr/article/vacances-luxueuses-primaire-les-ambitions-presidentielles-de-pigasse-contrariees"]]}, {"voix": 0, "election": "aucun scrutin en tête de liste retrouvé", "voixSource": ["Areq (Wikipédia)", "https://areq.net/lang/fr/Thierry_Breton.html"], "national": 2.2, "local": 4.0, "vues": 30864, "devance": [0, 14, 15, 24], "mandatsSources": [["Areq (Wikipédia)", "https://areq.net/lang/fr/Thierry_Breton.html"], ["Public Sénat", "https://www.publicsenat.fr/actualites/non-classe/thierry-breton-le-candidat-multicartes-de-macron-a-la-commission-146571"]], "remarque": "Conseil régional de Poitou-Charentes&nbsp;: 1986-1992 selon son CV et Wikipédia, 1988-1992 selon Public Sénat&nbsp;; la durée la plus courte est retenue (comptée de mars 1988 à mars 1992)."}, {"voix": 0, "election": "jamais tête de liste (n°2 dans le 12e arrondissement de Paris en 2008)", "voixSource": ["Acteurs publics", "https://acteurspublics.fr/articles/etat-delanoe-presente-ses-factures/"], "national": 6.0, "local": 3.3, "vues": 21280, "devance": [0, 19, 14, 16], "mandatsSources": [["Wikipédia (en)", "https://en.wikipedia.org/wiki/Christine_Lagarde"], ["WordDisk (conseillers de Paris)", "https://www.worddisk.com/wiki/List_of_Paris_councillors"]], "remarque": "Conseil de Paris (12<sup>e</sup> arrondissement)&nbsp;: élue en 2008 en n°2 de liste, remplacée en juillet 2011."}, {"voix": 0, "election": "jamais candidat", "voixSource": ["Sud Radio (Ifop)", "https://www.sudradio.fr/ifop/personnalites-politiques-preferees-michel-edouard-leclerc-indetronable-depuis-3-mois"], "national": 0.0, "local": 0.0, "vues": 13056, "devance": [0, 0, 0, 7], "mandatsSources": [["Sud Radio (Ifop)", "https://www.sudradio.fr/ifop/personnalites-politiques-preferees-michel-edouard-leclerc-indetronable-depuis-3-mois"]]}, {"voix": 620245, "election": "régionales 2015, 2d tour, tête de liste", "voixSource": ["Wikipédia (résultats du ministère)", "https://extension.wikiwand.com/en/French_regional_elections,_2015"], "national": 24.4, "local": 37.4, "vues": 48577, "devance": [29, 39, 40, 32], "mandatsSources": [["info.gouv.fr", "https://www.info.gouv.fr/personnalite/bruno-retailleau"], ["Sénat", "https://senat.fr/senateur/retailleau_bruno04033b.html"]]}, {"voix": 19721, "election": "municipales 2026, 1er tour, tête de liste", "voixSource": ["ministère de l’Intérieur", "https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/93/06/06029/"], "national": 0.0, "local": 25.7, "vues": 59568, "devance": [11, 0, 35, 34], "mandatsSources": [["Votons 2027", "https://votons-2027.fr/candidats/lisnard"], ["Intérieur 2026", "https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/93/06/06029/"]]}, {"voix": 1695000, "election": "présidentielle 2017, 1er tour", "voixSource": ["Conseil constitutionnel via info.gouv.fr", "https://www.info.gouv.fr/actualite/resultats-definitifs-du-premier-tour-de-l-election-presidentielle-2017-etablis-par-le-conseil"], "national": 27.1, "local": 31.4, "vues": 13756, "devance": [35, 40, 38, 9], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-nicolas-dupont-aignan"]]}, {"voix": 332547, "election": "présidentielle 2017, 1er tour", "voixSource": ["Conseil constitutionnel, via info.gouv.fr", "https://www.info.gouv.fr/actualite/resultats-definitifs-du-premier-tour-de-l-election-presidentielle-2017-etablis-par-le-conseil"], "national": 0.0, "local": 7.0, "vues": 15030, "devance": [28, 0, 18, 12], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-francois-asselineau"]]}, {"voix": 1389340, "election": "régionales 2015, 2d tour, tête de liste", "voixSource": ["Wikipédia (en), d’après le ministère de l’Intérieur", "https://en.wikipedia.org/wiki/2015_Nord-Pas-de-Calais-Picardie_regional_election"], "national": 13.6, "local": 31.4, "vues": 14306, "devance": [34, 30, 38, 10], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-xavier-bertrand"]]}, {"voix": 1201528, "election": "régionales 2015, 2d tour, tête de liste", "voixSource": ["Lyon Capitale, d’après les résultats officiels", "https://www.lyoncapitale.fr/?p=104772"], "national": 15.2, "local": 18.7, "vues": 21046, "devance": [33, 33, 30, 15], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-laurent-wauquiez"], ["Lyon Capitale", "https://www.lyoncapitale.fr/?p=405636"]]}, {"voix": 25133, "election": "législatives 1997 (Aube, 3e), 2d tour", "voixSource": ["Wikipédia (en), d’après le ministère de l’Intérieur", "https://en.wikipedia.org/wiki/Aube%27s_3rd_constituency"], "national": 22.7, "local": 37.7, "vues": 23292, "devance": [15, 38, 41, 18], "mandatsSources": [["Areq (Wikipédia)", "https://areq.net/lang/fr/Fran%C3%A7ois_Baroin.html"], ["Acteurs publics", "https://acteurspublics.fr/nomination/francois-baroin-rejoint-le-prive/"]], "remarque": "Conseil municipal de Nogent-sur-Seine&nbsp;: élu en 1989, compté jusqu’en juin 1995. Ses voix de 1993 n’ont pas été retrouvées&nbsp;: le score de 1997 est retenu."}, {"voix": 28603, "election": "législatives 2024, 2d tour", "voixSource": ["Datan", "https://datan.fr/deputes/nord-59/depute_gerald-darmanin"], "national": 13.1, "local": 14.8, "vues": 31398, "devance": [19, 29, 28, 25], "mandatsSources": [["Wikipédia (en)", "https://en.wikipedia.org/wiki/G%C3%A9rald_Darmanin"], ["info.gouv.fr", "https://www.info.gouv.fr/personnalite/gerald-darmanin"], ["HATVP", "https://www.hatvp.fr/livraison/dossiers/darmanin-gerald-di34806-gouvernement.pdf"], ["Intérieur 2026", "https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/32/59/59599/rappel_candidature/2/5.html"]], "remarque": "Conseil régional du Nord-Pas-de-Calais&nbsp;: 2010-2012 selon le gouvernement, 2010-2014 selon Wikipédia&nbsp;; la durée la plus courte est retenue."}, {"voix": 22550, "election": "législatives 2012 (Pyrénées-Orientales, 3e), 2d tour", "voixSource": ["Wikipédia (en), d’après le ministère de l’Intérieur", "https://en.wikipedia.org/wiki/Pyr%C3%A9n%C3%A9es-Orientales%27s_3rd_constituency"], "national": 1.8, "local": 12.3, "vues": 14466, "devance": [14, 13, 24, 11], "mandatsSources": [["info.gouv.fr", "https://www.info.gouv.fr/les-anciens-premiers-et-premieres-ministres-de-la-ve-republique/jean-castex"], ["Areq (Wikipédia)", "https://areq.net/lang/fr/Jean_Castex.html"]]}, {"voix": 13288686, "election": "présidentielle 2022, 2d tour", "voixSource": ["Conseil constitutionnel via vie-publique.fr", "https://www.vie-publique.fr/en-bref/284959-presidentielle-2022-le-conseil-constitutionnel-proclame-les-resultats"], "national": 22.3, "local": 27.1, "vues": 46072, "devance": [40, 37, 37, 31], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-de-marine-le-pen"], ["Conseil d’État", "https://www.conseil-etat.fr/Media/actualites/documents/2025/novembre-2025/cp_execution_provisoire_web.pdf"]]}, {"voix": 2485226, "election": "présidentielle 2022, 1er tour", "voixSource": ["Fondation Robert Schuman (chiffres officiels)", "https://server.www.robert-schuman.eu/storage/fr/doc/oee/oee-1973-fr.pdf"], "national": 0.0, "local": 0.0, "vues": 77511, "devance": [36, 0, 0, 38], "mandatsSources": [["Public Sénat", "https://www.publicsenat.fr/actualites/politique/legislatives-eric-zemmour-elimine-des-le-1er-tour-213118"]]}, {"voix": 790166, "election": "régionales 2015 (Alsace-Champagne-Ardenne-Lorraine), 2d tour, tête de liste", "voixSource": ["ministère de l’Intérieur", "https://www.archives-resultats-elections.interieur.gouv.fr/resultats/regionales-2015/44/44.php"], "national": 5.0, "local": 7.3, "vues": 13604, "devance": [30, 17, 20, 8], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-florian-philippot"]], "remarque": "Conseil municipal de Forbach&nbsp;: 2014-2016, compté jusqu’en janvier 2016 (entrée au conseil régional)."}, {"voix": 7765936, "election": "européennes 2024, tête de liste", "voixSource": ["Journal officiel via Landot avocats", "https://blog.landot-avocats.net/2024/06/13/proclamation-des-resultats-de-lelection-des-representants-au-parlement-europeen/"], "national": 7.3, "local": 9.2, "vues": 136678, "devance": [39, 22, 22, 41], "mandatsSources": [["HATVP", "https://www.hatvp.fr/livraison/dossiers/bardella-jordan-dim33673-europe.pdf"]]}, {"voix": 84809, "election": "municipales 2026 à Paris, 1er tour, tête de liste", "voixSource": ["ministère de l’Intérieur", "https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/11/75/75056/index.html"], "national": 2.3, "local": 0.7, "vues": 166237, "devance": [24, 15, 13, 42], "mandatsSources": [["Intérieur (16e)", "https://www.resultats-elections.interieur.gouv.fr/ConseilsdarrondissementPLM2026/ensemble_geographique/11/75/75056SR16/rappel_candidature/1/6.html"], ["Wikipédia (en)", "https://en.wikipedia.org/wiki/Sarah_Knafo"]]}];
/* « Le savais-tu ? » : petites anecdotes sourcées, une dans le bilan de chaque fin de partie. Autant de gags à gauche, au centre et à droite.
   cartes / actions : noms courts. Une seule carte = son anecdote quand on la pose ; une seule action = quand on la joue ;
   plusieurs = rencontre, quand toutes sont en jeu ; lieu = au début d'une partie dans ce décor ; rien = histoire, à tout moment. */
var ANECDOTES = [
  { id: 'arthaud-prof', cartes: ['Arthaud'], texte: 'Entre deux présidentielles, Nathalie Arthaud, porte-parole de Lutte ouvrière, corrige des copies&nbsp;: elle enseigne l’économie-gestion dans un lycée d’Aubervilliers, en Seine-Saint-Denis.',
    sources: [['Slate', 'https://www.slate.fr/story/49311/lycee-nathalie-arthaud'], ['L’Étudiant', 'https://www.letudiant.fr/lifestyle/engagement-et-vie-associative/article/presidentielle-2022-nathalie-arthaud-il-faut-consacrer-de-l-argent-du-temps-des-enseignants-en-faveur-de-l-education.html']] },
  { id: 'melenchon-hologramme', cartes: ['Mélenchon'], texte: 'Le 5 février 2017, Jean-Luc Mélenchon tient meeting à Lyon… et au même moment à Aubervilliers, en hologramme&nbsp;: une première en direct pour un homme politique.',
    sources: [['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/reel-ou-en-hologramme-melenchon-defie-le-pen-fait-feu-sur-macron-54253']] },
  { id: 'roussel-gastronomie', cartes: ['Roussel'], texte: 'Pendant la campagne de 2022, Fabien Roussel résume la gastronomie française&nbsp;: «&nbsp;Le bon vin, une bonne viande et le bon fromage.&nbsp;» La formule fait débat jusque dans son camp.',
    sources: [['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/alimentation-fabien-roussel-defend-son-systeme-ecolo-coco-194209'], ['Réussir', 'https://www.reussir.fr/garantir-tout-le-monde-de-bien-manger-le-projet-revolutionnaire-de-fabien-roussel']] },
  { id: 'ruffin-maillot', cartes: ['Ruffin'], texte: 'Le 7 décembre 2017, François Ruffin monte à la tribune de l’Assemblée, retire son pull… et dévoile le maillot vert de l’Olympique Eaucourt, un club amateur de la Somme. Prix du vestiaire&nbsp;: 1&nbsp;378&nbsp;€ retenus sur son indemnité.',
    sources: [['Public Sénat', 'https://www.publicsenat.fr/actualites/non-classe/ruffin-a-la-tribune-de-l-assemblee-avec-le-maillot-d-un-club-de-foot-amateur-80569'], ['Paris Match Belgique', 'https://www.parismatch.be/actualites/politique/2017/12/21/le-depute-insoumis-francois-ruffin-puni-pour-avoir-porte-un-maillot-de-foot-dans-lhemicycle-IG6EHLJM25HXZPA5MX635FUCNI/']] },
  { id: 'ruffin-arnault', cartes: ['Ruffin'], actions: ['Arnault'], texte: 'Ils se connaissent&nbsp;: dans Merci Patron&nbsp;!, François Ruffin porte un tee-shirt «&nbsp;I love Bernard&nbsp;». Aux César 2017, il vient en «&nbsp;I love Vincent&nbsp;», pour Vincent Bolloré.',
    sources: [['Politis', 'https://www.politis.fr/articles/2017/02/le-plaidoyer-antidelocalisations-de-ruffin-a-la-ceremonie-des-cesar-36386']] },
  { id: 'rousseau-barbecue', cartes: ['Rousseau'], texte: 'Août 2022&nbsp;: Sandrine Rousseau souhaite que manger une entrecôte au barbecue ne soit plus «&nbsp;un symbole de virilité&nbsp;». Le barbecue s’enflamme aussitôt sur les réseaux.',
    sources: [['La DH', 'https://www.dhnet.be/actu/monde/2022/08/30/le-barbecue-un-symbole-de-virilite-la-sortie-de-sandrine-rousseau-eelv-provoque-la-polemique-QPCZK5YJ4ZCTZEQGDI722VWEVM/']] },
  { id: 'tondelier-veste', cartes: ['Tondelier'], texte: 'Pendant les législatives de 2024, Marine Tondelier ne quitte plus sa veste verte, au point qu’un compte X lui est consacré. Elle en possède deux, a-t-elle précisé. L’association PETA lui en a envoyé une troisième, végane.',
    sources: [['Europe&nbsp;1', 'https://www.europe1.fr/node/15254'], ['FashionUnited', 'https://fashionunited.fr/actualite/people/peta-envoie-une-veste-verte-plus-ecolo-a-marine-tondelier/2024072635601']] },
  { id: 'hollande-anaphore', cartes: ['Hollande'], texte: 'Au débat du 2 mai 2012, François Hollande enchaîne une quinzaine de «&nbsp;Moi, président de la République…&nbsp;». Nicolas Sarkozy ne l’interrompt pas.',
    sources: [['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/les-debats-tv-du-monopole-du-coeur-de-giscard-a-l-anaphore-de-hollande-60025'], ['Puremédias', 'https://www.ozap.com/actu/-moi-president-de-la-republique-francois-hollande-remercie-laurence-ferrari/441091']] },
  { id: 'royal-bravitude', cartes: ['Royal'], texte: 'Janvier 2007, sur la Grande Muraille de Chine, Ségolène Royal invente un mot&nbsp;: «&nbsp;Qui va sur la grande muraille conquiert la bravitude.&nbsp;»',
    sources: [['Acteurs publics', 'https://acteurspublics.fr/articles/ils-lont-dit-244/']] },
  { id: 'guedj-montchalin', cartes: ['Guedj'], texte: 'Duel en deux manches&nbsp;: en 2017, Jérôme Guedj perd face à Amélie de Montchalin dans l’Essonne. En 2022, il la bat… le jour de ses 37 ans.',
    sources: [['Acteurs publics', 'https://acteurspublics.fr/articles/parmi-les-ministres-candidats-amelie-de-montchalin-est-en-difficulte'], ['Motor1', 'https://fr.motor1.com/news/593153/ministre-transition-ecologique-amelie-montchalin-legisltatives/']] },
  { id: 'attal-matignon', cartes: ['Attal'], texte: 'Le 9 janvier 2024, à 34 ans, Gabriel Attal devient le plus jeune Premier ministre de la Ve République. Le record tenait depuis 1984 (Laurent Fabius, 37 ans).',
    sources: [['info.gouv.fr', 'https://www.info.gouv.fr/les-anciens-premiers-et-premieres-ministres-de-la-ve-republique/gabriel-attal'], ['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/nomme-a-matignon-gabriel-attal-devient-le-plus-jeune-premier-ministre-de-la-ve-republique']] },
  { id: 'baroin-benjamin', cartes: ['Baroin'], texte: 'En 1995, François Baroin devient porte-parole du gouvernement un mois avant ses 30 ans&nbsp;: un record de précocité, battu en 2018 par Gabriel Attal.',
    sources: [['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/gabriel-attal-jeune-loup-de-la-macronie-et-benjamin-du-gouvernement-134463'], ['Europe&nbsp;1', 'https://www.europe1.fr/node/273321']] },
  { id: 'philippe-polars', cartes: ['Philippe'], texte: 'Avant Matignon, Édouard Philippe a écrit deux polars politiques avec Gilles Boyer. Le second, Dans l’ombre, est devenu une série de France&nbsp;2.',
    sources: [['Livres Hebdo', 'https://www.livreshebdo.fr/article/le-polar-dedouard-philippe-sera-adapte-sur-grand-ecran'], ['Brut', 'https://www.brut.media/fr/articles/edouard-philippe-coscenariste-dune-serie-sur-une-campagne-presidentielle']] },
  { id: 'castex-deconfinement', cartes: ['Castex'], texte: 'Avril 2020&nbsp;: Édouard Philippe charge Jean Castex de préparer la sortie du confinement. Le voilà surnommé «&nbsp;Monsieur Déconfinement&nbsp;».',
    sources: [['Acteurs publics', 'https://acteurspublics.fr/nomination/un-monsieur-deconfinement-nomme-par-edouard-philippe-dans-le-cadre-de-la-lutte-contre-le-coronavirus/']] },
  { id: 'castex-philippe', cartes: ['Castex', 'Philippe'], texte: 'Les voilà réunis&nbsp;: le 3 juillet 2020, Jean Castex succède à Édouard Philippe à Matignon, qui lui lance «&nbsp;Soyez bon, et comme on dit chez moi&nbsp;: bon vent&nbsp;!&nbsp;»',
    sources: [['Europe&nbsp;1', 'https://www.europe1.fr/node/165450']] },
  { id: 'villepin-gargouille', cartes: ['Villepin'], texte: 'En mai 2002, après sept ans au cœur de l’Élysée, Dominique de Villepin publie un essai sur le pouvoir au titre inattendu&nbsp;: Le Cri de la gargouille.',
    sources: [['Mollat', 'https://www.mollat.com/livres/626762/dominique-de-villepin-le-cri-de-la-gargouille'], ['Petites affiches', 'https://www.labase-lextenso.fr/petites-affiches/2002-n135/le-cri-de-la-gargouille-PA200213503']] },
  { id: 'riner-serie', cartes: ['Riner'], texte: 'De septembre 2010 à février 2020, Teddy Riner a enchaîné 154 combats sans la moindre défaite. Dix ans sans perdre&nbsp;: le rêve de tout candidat.',
    sources: [['CNN', 'https://amp.cnn.com/cnn/2020/02/09/sport/teddy-riner-defeat-spt-intl']] },
  { id: 'lassalle-chant', cartes: ['Lassalle'], texte: 'En 2003, en pleine séance de l’Assemblée, Jean Lassalle coupe la parole au ministre Nicolas Sarkozy… en entonnant un chant béarnais, pour défendre une gendarmerie.',
    sources: [['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/jean-lassalle-fait-un-passage-remarque-sur-un-marche-de-saint-denis-58427'], ['Sud Radio', 'https://www.sudradio.fr/la-biographie-et-le-cv-de-jean-lassalle']] },
  { id: 'lagarde-synchro', cartes: ['Lagarde'], texte: 'Avant le FMI et la BCE, Christine Lagarde faisait de la natation synchronisée au Havre&nbsp;: médaille de bronze aux championnats de France, à 15 ans.',
    sources: [['Slate', 'https://www.slate.fr/story/183693/christine-lagarde-presidente-bce-championne-natation-synchronisee-le-havre']] },
  { id: 'cazeneuve-triple', cartes: ['Cazeneuve'], texte: 'Premier ministre pour cinq mois, en 2016-2017, Bernard Cazeneuve s’amusait&nbsp;: il fallait que «&nbsp;chaque jour compte triple&nbsp;» pour atteindre la durée moyenne d’un Premier ministre.',
    sources: [['Public Sénat', 'https://www.publicsenat.fr/article/politique/cazeneuve-va-prononcer-son-discours-de-politique-generale-51632'], ['info.gouv.fr', 'https://www.info.gouv.fr/les-anciens-premiers-et-premieres-ministres-de-la-ve-republique/bernard-cazeneuve']] },
  { id: 'breton-softwar', cartes: ['Breton'], texte: 'En 1984, bien avant la Commission européenne, Thierry Breton cosigne Softwar, un roman d’espionnage… informatique.',
    sources: [['Le Monde informatique', 'https://www.lemondeinformatique.fr/actualites/lireamp-pour-thierry-breton-le-cloud-doit-rester-sous-controle-51625.html'], ['BnF', 'https://catalogue.bnf.fr/ark:/12148/cb34764271d']] },
  { id: 'lalanne-passage', cartes: ['Lalanne'], texte: 'Le plus grand succès de Francis Lalanne, On se retrouvera (1986), a été composé par son frère Jean-Félix pour la musique du film Le Passage.',
    sources: [['BnF', 'https://data.bnf.fr/16086156/jean-felix_lalanne_on_se_retrouvera/'], ['Purebreak', 'https://www.purebreak.com/personnalite/francis-lalanne_e944/discographie']] },
  { id: 'wauquiez-mezenc', cartes: ['Wauquiez'], texte: 'Chaque rentrée, Laurent Wauquiez gravit le mont Mézenc (1&nbsp;753&nbsp;m), en Haute-Loire. Longtemps en parka rouge, devenue sa marque de fabrique.',
    sources: [['Lyon Capitale', 'https://www.lyoncapitale.fr/?p=119878'], ['Lyon Capitale (2015)', 'https://www.lyoncapitale.fr/politique/laurent-wauquiez-lance-sa-marche-vers-la-region']] },
  { id: 'bertrand-assurances', cartes: ['Bertrand'], texte: 'Avant d’être ministre, Xavier Bertrand vendait des assurances&nbsp;: agent général dans l’Aisne, de 1992 à 2004. Le risque, il connaît.',
    sources: [['Sud Radio', 'https://www.sudradio.fr/la-biographie-et-le-cv-de-xavier-bertrand'], ['Rencontres économiques', 'https://www.lesrencontreseconomiques.fr/en/?p=29959']] },
  { id: 'dupont-aignan-tf1', cartes: ['Dupont-Aignan'], texte: 'Le 18 mars 2017, privé du premier grand débat de TF1, Nicolas Dupont-Aignan quitte en direct le plateau du 20&nbsp;heures, au beau milieu de son interview. Les jours suivants, il enchaîne les plateaux pour expliquer pourquoi.',
    sources: [['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/nicolas-dupont-aignan-se-voit-comme-une-alternative-a-francois-fillon-57945'], ['Paris Match Belgique', 'https://www.parismatch.be/actualites/politique/2017/03/18/nicolas-dupont-aignan-quitte-le-jt-de-tf1-en-plein-direct-4OB7HOUJARHZRJCVPQMKBDQXLU/']] },
  { id: 'retailleau-puy-du-fou', cartes: ['Retailleau'], texte: 'À 17 ans, Bruno Retailleau est cavalier bénévole dans la Cinéscénie du Puy du Fou. C’est là que Philippe de Villiers le repère.',
    sources: [['Sud Radio', 'https://www.sudradio.fr/la-biographie-et-le-cv-de-bruno-retailleau']] },
  { id: 'le-pen-chats', cartes: ['Le Pen'], texte: 'La déclaration de Marine Le Pen à la Haute Autorité pour la transparence mentionne un élevage de chats, depuis 2021&nbsp;: 501&nbsp;€ de bénéfice net en 2022.',
    sources: [['HATVP', 'https://www.hatvp.fr/livraison/dossiers/le-pen-marine-diam35065-depute-62.pdf']] },
  { id: 'zemmour-micro', cartes: ['Zemmour'], texte: 'Le 30 novembre 2021, Éric Zemmour annonce sa candidature dans une vidéo où il lit son texte devant un gros micro à l’ancienne, façon appel du 18&nbsp;Juin.',
    sources: [['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/eric-zemmour-officialise-sa-candidature-a-l-election-presidentielle-191429'], ['franceinfo', 'https://www.franceinfo.fr/politique/eric-zemmour/']] },
  { id: 'bardella-rn', cartes: ['Bardella'], texte: 'Le 5 novembre 2022, à 27 ans, Jordan Bardella devient le premier président du RN à ne pas s’appeler Le Pen.',
    sources: [['Europe&nbsp;1', 'https://www.europe1.fr/node/76361']] },
  { id: 'knafo-cour', cartes: ['Knafo'], texte: 'Avant la politique, Sarah Knafo était magistrate à la Cour des comptes, de 2020 à 2021&nbsp;: la maison que préside aujourd’hui Amélie de Montchalin.',
    sources: [['HATVP', 'https://www.hatvp.fr/livraison/dossiers/knafo-sarah-dim33248-europe.pdf'], ['Sud Radio', 'https://www.sudradio.fr/la-biographie-et-le-cv-de-sarah-knafo']] },
  { id: 'gaulle-enregistrement', actions: ['de Gaulle'], texte: 'L’appel du 18 juin 1940 n’a pas été enregistré&nbsp;: les techniciens de la BBC ne l’ont pas gardé. L’enregistrement célèbre est celui du 22 juin.',
    sources: [['VL Média', 'https://vl-media.fr/?p=303783'], ['Musée de l’Armée', 'https://musee-armee.fr/fileadmin/user_upload/Ressources_pedagogiques/2025/FichesObjets_SecondeGuerre_BATVF-L_AFFICHE_DITE_DE_L_APPEL.pdf']] },
  { id: 'macron-perlimpinpin', actions: ['Macron'], texte: 'Débat du 3 mai 2017&nbsp;: Emmanuel Macron qualifie les propositions de Marine Le Pen de «&nbsp;poudre de perlimpinpin&nbsp;». Les interprètes étrangers ont séché sur la traduction.',
    sources: [['RTBF', 'https://www.rtbf.be/article/les-moments-marquants-du-debat-entre-emmanuel-macron-et-marine-le-pen-9597121'], ['Newstalk', 'https://www.newstalk.com/Translators-lost-for-words-during-French-presidential-debate']] },
  { id: 'lemaire-fugue', actions: ['Le Maire'], texte: 'Fin avril 2023, le ministre de l’Économie Bruno Le Maire publie un roman, Fugue américaine. Un passage très coquin fait le tour des réseaux… à quelques heures de la dégradation de la note de la France par l’agence Fitch.',
    sources: [['Paris Match Belgique', 'https://www.parismatch.be/actualites/societe/2023/05/01/les-ecrits-erotiques-de-bruno-le-maire-suscitent-des-moqueries-sur-les-reseaux-sociaux-UWVEVORHCFEMFOE3GRENA4YTSE/'], ['Slate', 'https://www.slate.fr/story/246278/roman-politiques-risques-bruno-le-maire-ecriture']] },
  { id: 'valls-barcelone', actions: ['Valls'], texte: 'Après Matignon, Manuel Valls tente la mairie de sa ville natale, Barcelone. Le 26 mai 2019, il finit quatrième, avec 13,2&nbsp;% des voix.',
    sources: [['Slate', 'https://www.slate.fr/story/177696/elections-municipales-barcelone-defaite-manuel-valls'], ['Europe&nbsp;1', 'https://www.europe1.fr/international/barcelone-echec-de-valls-aux-municipales-un-independantiste-en-tete-3901018']] },
  { id: 'sarkozy-cleves', actions: ['Sarkozy'], texte: 'En 2006, Nicolas Sarkozy se moque d’un concours administratif qui interroge les candidats sur La Princesse de Clèves, roman de 1678. En 2009, au Salon du livre, on arbore des badges «&nbsp;Je lis La Princesse de Clèves&nbsp;».',
    sources: [['Slate', 'https://www.slate.fr/story/2187/la-princesse-de-cleves-un-livre-pour-sarkozy'], ['Public Sénat', 'https://www.publicsenat.fr/article/politique/sarkozy-un-personnage-de-roman-82527']] },
  { id: 'larcher-veterinaire', actions: ['Larcher'], texte: 'Avant le Sénat, Gérard Larcher soignait des chevaux&nbsp;: diplômé de l’École vétérinaire de Lyon en 1973, il s’est spécialisé dans les équidés. Les chevaux de bataille, il connaît.',
    sources: [['Sud Radio', 'https://www.sudradio.fr/la-biographie-et-le-cv-de-gerard-larcher']] },
  { id: 'oudea-seine', actions: ['Oudéa-Castéra'], texte: '13 juillet 2024, 7&nbsp;h&nbsp;30&nbsp;: la ministre des Sports glisse sur les pavés, puis nage dans la Seine, quatre jours avant Anne Hidalgo.',
    sources: [['CBS News (AP)', 'https://www.cbsnews.com/news/french-sports-minister-takes-a-dip-in-the-seine-before-2024-paris-olympics'], ['Europe&nbsp;1', 'https://www.europe1.fr/node/15069']] },
  { id: 'montchalin-cambon', actions: ['Montchalin'], texte: 'Créée par Napoléon en 1807, la Cour des comptes siège rue Cambon, à Paris, où travaillent plus de 800 personnes.',
    sources: [['Fondation Napoléon', 'https://www.napoleon.org/histoire-des-2-empires/dossiers-thematiques/la-creation-de-la-cour-des-comptes-16-septembre-1807'], ['Cour des comptes', 'https://www.ccomptes.fr/fr']] },
  { id: 'lieu-hemicycle', lieu: 'hemicycle', texte: 'Pourquoi «&nbsp;gauche&nbsp;» et «&nbsp;droite&nbsp;»&nbsp;? Le 11 septembre 1789, les députés favorables au veto du roi s’assoient à droite du président de l’Assemblée, les opposants à sa gauche.',
    sources: [['Hérodote', 'https://www.herodote.net/almanach-ID-1703.php'], ['Larousse', 'https://www.larousse.fr/encyclopedie/divers/wd/54713']] },
  { id: 'lieu-republique', lieu: 'republique', texte: 'La Marianne de la place de la République a été inaugurée un 14 juillet, en 1883. Le monument mesure 25 mètres.',
    sources: [['Paris ZigZag', 'https://www.pariszigzag.fr/insolite/histoire-insolite-paris/monument-a-la-republique-paris/'], ['Sortir à Paris', 'https://www.sortiraparis.com/arts-culture/walks/articles/172712-the-place-de-la-republique-in-paris/lang/en']] },
  { id: 'lieu-trocadero', lieu: 'trocadero', texte: 'Le 10 décembre 1948, l’ONU adopte la Déclaration universelle des droits de l’homme au palais de Chaillot, au Trocadéro.',
    sources: [['ONU (UNRIC)', 'https://unric.org/fr/droits-humains-2/'], ['Paris.fr', 'https://www.paris.fr/pages/le-palais-de-chaillot-s-etend-sur-55-000-metres-carres-25622']] },
  { id: 'lieu-senat', lieu: 'senat', texte: 'Le palais du Luxembourg, siège du Sénat, a été bâti pour Marie de Médicis, sur le modèle du palais Pitti de Florence. Sous la Révolution, il a servi de prison.',
    sources: [['Universalis', 'https://www.universalis.fr/encyclopedie/palais-du-luxembourg/']] },
  { id: 'lieu-chateau', lieu: 'chateau', texte: 'L’Élysée a été construit à partir de 1718 sur un terrain marécageux, pour le comte d’Évreux. La marquise de Pompadour l’achète en 1753.',
    sources: [['Élysée', 'https://www.elysee.fr/la-presidence/visite-palais-de-l-elysee-et-son-histoire']] },
  { id: 'lieu-tele', lieu: 'tele', texte: 'Premier débat télévisé d’entre-deux-tours, le 10 mai 1974&nbsp;: Valéry Giscard d’Estaing y lance à François Mitterrand «&nbsp;Vous n’avez pas le monopole du cœur&nbsp;».',
    sources: [['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/les-debats-tv-du-monopole-du-coeur-de-giscard-a-l-anaphore-de-hollande-60025'], ['Hérodote', 'https://www.herodote.net/Revolutionnaire_malgre_lui-synthese-2833-410.php']] },
  { id: 'histoire-1974', texte: 'Présidentielle 1974&nbsp;: Valéry Giscard d’Estaing l’emporte avec 50,81&nbsp;% des voix, soit 424&nbsp;599 voix d’avance sur François Mitterrand.',
    sources: [['Larousse', 'https://www.larousse.fr/archives/journaux_annee/1974/8/synthese']] },
  { id: 'histoire-poher', texte: 'Président du Sénat, Alain Poher a assuré deux fois l’intérim de l’Élysée, en 1969 et en 1974. «&nbsp;Mes cent jours&nbsp;», ironisait-il.',
    sources: [['Universalis', 'https://www.universalis.fr/encyclopedie/alain-poher/'], ['Vie publique', 'https://www.vie-publique.fr/fiches/19434-linterim-apres-le-deces-ou-la-demission-du-president-de-la-republique']] }
];
CANDIDATS.forEach(function(c, i){ c.court = COURTS[i]; c.mini = c.image.replace('img/', 'img/mini/').replace('-couleur', ''); c.methode = METHODE[i]; });
ACTIONS.forEach(function(c, i){ c.court = COURTS_A[i]; c.mini = c.image.replace('img/', 'img/mini/').replace('-couleur', ''); });
window.APDA = {
  VERIFIE: VERIFIE, CANDIDATS: CANDIDATS, ACTIONS: ACTIONS, ANECDOTES: ANECDOTES,
  COTES: ['Urnes', 'Expérience', 'Terrain', 'Buzz'],
  COTES_LONGS: ['Son meilleur score en voix à une élection', 'Ses années de mandat national', 'Ses années d’élu local', 'Combien de fois on consulte sa page Wikipédia (mois type)']
};
})();
