  var VERIFIE = '18/11/2026';

  var CANDIDATS = [
    {
      nom: 'Nathalie Arthaud', bloc: 'Extrême gauche', image: 'img/arthaud-couleur.webp',
      etiquette: 'Candidate · déc. 2025', tampon: '4<sup>e</sup> candidature',
      role: 'Porte-parole de Lutte ouvrière', valeurs: [5, 5, 5, 5],
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
      role: 'Leader de La France insoumise', valeurs: [5, 5, 5, 5],
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
      role: 'Secrétaire national du PCF · maire de Saint‑Amand‑les‑Eaux', valeurs: [5, 5, 5, 5],
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
      role: 'Député de la Somme · président de Debout&nbsp;!', valeurs: [5, 5, 5, 5],
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
      role: 'Secrétaire nationale des Écologistes', valeurs: [5, 5, 5, 5],
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
      role: 'Députée de Paris', valeurs: [5, 5, 5, 5],
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
      role: 'Député européen · fondateur de Place publique', valeurs: [5, 5, 5, 5],
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
      role: 'Maire de Saint-Ouen-sur-Seine', valeurs: [5, 5, 5, 5],
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
      role: 'Ancien président de la République · député de Corrèze', valeurs: [5, 5, 5, 5],
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
      role: 'Députée de Seine-Saint-Denis', valeurs: [5, 5, 5, 5],
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
      role: 'Ancienne ministre · ex-présidente de Poitou-Charentes', valeurs: [5, 5, 5, 5],
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
      role: 'Premier secrétaire du PS · député de Seine-et-Marne', valeurs: [5, 5, 5, 5],
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
      role: 'Député de l’Essonne', valeurs: [5, 5, 5, 5],
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
      role: 'Secrétaire général de Renaissance · ancien Premier ministre', valeurs: [5, 5, 5, 5],
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
      role: 'Maire du Havre · président d’Horizons', valeurs: [5, 5, 5, 5],
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
      role: 'Ministre déléguée à l’Égalité femmes-hommes', valeurs: [5, 5, 5, 5],
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
      role: 'Ancien Premier ministre · fondateur de La France humaniste', valeurs: [5, 5, 5, 5],
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
      role: 'Judoka · quintuple champion olympique', valeurs: [5, 5, 5, 5],
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
      role: 'Essayiste · ex-directrice de&nbsp;la&nbsp;rédaction&nbsp;de&nbsp;Marianne', valeurs: [5, 5, 5, 5],
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
      role: 'Avocat et essayiste · mouvement Les Ruches', valeurs: [5, 5, 5, 5],
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
      role: 'Ancien député · président de Résistons&nbsp;!', valeurs: [5, 5, 5, 5],
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
      role: 'Députée des Deux-Sèvres · Génération écologie', valeurs: [5, 5, 5, 5],
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
      role: 'Chanteur · mouvement France Libre', valeurs: [5, 5, 5, 5],
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
      role: 'Vidéaste sur Instagram', valeurs: [5, 5, 5, 5],
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
      role: 'Ancien Premier ministre · président de La Convention', valeurs: [5, 5, 5, 5],
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
      role: 'Banquier d’affaires · patron de Radio Nova', valeurs: [5, 5, 5, 5],
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
      role: 'Ancien commissaire européen · ancien ministre de l’Économie', valeurs: [5, 5, 5, 5],
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
      role: 'Présidente de la BCE · ancienne ministre de l’Économie', valeurs: [5, 5, 5, 5],
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
      role: 'Président du comité stratégique des centres E.Leclerc', valeurs: [5, 5, 5, 5],
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
      role: 'Président des Républicains · sénateur de Vendée', valeurs: [5, 5, 5, 5],
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
      role: 'Maire de Cannes · fondateur de Nouvelle Énergie', valeurs: [5, 5, 5, 5],
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
      role: 'Maire de Yerres · président de Debout&nbsp;la&nbsp;France', valeurs: [5, 5, 5, 5],
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
      role: 'Président de l’Union populaire républicaine', valeurs: [5, 5, 5, 5],
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
      role: 'Président de la région Hauts-de-France', valeurs: [5, 5, 5, 5],
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
      role: 'Président des députés Droite républicaine', valeurs: [5, 5, 5, 5],
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
      role: 'Maire de Troyes · ancien ministre de l’Économie', valeurs: [5, 5, 5, 5],
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
      role: 'Garde des Sceaux, ministre de la Justice', valeurs: [5, 5, 5, 5],
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
      role: 'PDG de la SNCF · ancien Premier ministre', valeurs: [5, 5, 5, 5],
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
      role: 'Présidente du groupe RN à l’Assemblée', valeurs: [5, 5, 5, 5],
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
      role: 'Président de Reconquête', valeurs: [5, 5, 5, 5],
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
      role: 'Président des Patriotes · ancien député européen', valeurs: [5, 5, 5, 5],
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
      role: 'Président du RN · député européen', valeurs: [5, 5, 5, 5],
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
      role: 'Députée européenne · élue du 16<sup>e</sup> arrondissement de Paris', valeurs: [5, 5, 5, 5],
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
      pouvoir: '<b>Engage ta responsabilité.</b> Une carte adverse passe dans ton camp, sans vote.',
      petit: 'Une fois par partie · Parade&nbsp;: censure',
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
      pouvoir: '<b>Mercato.</b> Une de tes cartes et une carte adverse changent de camp.',
      petit: 'Une fois par partie',
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
      petit: 'Une fois par partie',
      vraieVie: 'Dans la vraie vie · casier judiciaire',
      texte: 'Libye&nbsp;: 1<sup>er</sup> ex-président incarcéré (20 jours). Appel jugé le 30/11/2026&nbsp;: présumé innocent.',
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
      petit: 'Une fois par partie',
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
      pouvoir: '<b>Indéboulonnable.</b> Une de tes cartes ne peut plus être retournée jusqu’à la fin de la partie.',
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
      pouvoir: '<b>Augmentation de capital.</b> Ce tour-ci, tu poses deux cartes au lieu d’une.',
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
      pouvoir: '<b>Édito.</b> Ce tour-ci, ta carte posée gagne +2 sur le côté de ton choix.',
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
      pouvoir: '<b>Planification.</b> Regarde les trois cartes du dessus de la pioche et range-les à ta guise.',
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
      pouvoir: '<b>Scoop.</b> Ton adversaire joue main ouverte pendant deux tours.',
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
    }
  ];

