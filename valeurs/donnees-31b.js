/* Données des cartes d'À peu près d'accord : partagées par la collection et le jeu. */
(function(){
var VERIFIE = '18/11/2026';

var CANDIDATS = [
  {
    nom: 'Nathalie Arthaud', bloc: 'Extrême gauche', image: 'img/arthaud-couleur.webp',
    etiquette: 'Candidate · déc. 2025', tampon: '4<sup>e</sup> candidature',
    role: 'Porte-parole de Lutte ouvrière', valeurs: [6, 1, 4, 1],
    phrase: 'Le véritable pouvoir n’est pas à l’Élysée.', quand: '26 septembre 2026 · premier meeting, Paris',
    annees: ['2012', '2017', '2022', '2027'], justice: 'Aucune procédure recensée.',
    blocSource: 'nuancier 2026 (LO)',
    sources: [
      ['Slate', 'https://www.slate.fr/politique/election-presidentielle-2027-liste-candidats-declares-interesses-primaire-gauche-droite-extreme-lfi-rn-lr-ps-macron'],
      ['AFP / La Gazette', 'https://www.lagazettefrance.fr/article/plus-leon-trotski-que-leon-xiv-premier-meeting-de-campagne-pour-arthaud-et-lo'],
      ['Lutte ouvrière', 'https://www.lutte-ouvriere.org/medias/breve/fichiers/2026/05/20260516-reponseLO-NPA-R.pdf']
    ]
  },
  {
    nom: 'Jean-Luc Mélenchon', bloc: 'Extrême gauche', image: 'img/melenchon-couleur.webp',
    etiquette: 'Candidat · mai 2026', tampon: '4<sup>e</sup> candidature',
    role: 'Leader de La France insoumise', valeurs: [9, 10, 7, 9],
    phrase: 'Nous c’est carré. Il y a une équipe, un programme, un seul candidat.', quand: '3 mai 2026 · annonce de candidature, TF1',
    annees: ['2012', '2017', '2022', '2027'],
    justice: 'Condamné le 9 décembre 2019 à 3 mois avec sursis et 8&nbsp;000&nbsp;€ d’amende pour rébellion et provocation (perquisition de LFI, 2018).',
    blocSource: 'nuancier 2026 (LFI), validé par le Conseil d’État',
    sources: [
      ['LCP', 'https://lcp.fr/actualites/presidentielle-jean-luc-melenchon-officialise-sa-candidature-pour-2027-435851'],
      ['La Libre (AFP)', 'https://www.lalibre.be/international/europe/2026/05/03/jean-luc-melenchon-officialise-sa-candidature-a-la-presidentielle-2027-62WVGQMVUREGHCOMM2PKZ2DE7M/'],
      ['Reuters', 'https://www.boursorama.com/actualite-economique/actualites/melenchon-annonce-sa-candidature-a-la-presidentielle-de-2027-b663ea55461748d016069a6f9028614e'],
      ['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/melenchon-condamne-a-trois-mois-avec-sursis-pour-la-perquisition-houleuse-a-lfi']
    ]
  },
  {
    nom: 'Fabien Roussel', bloc: 'Gauche', image: 'img/roussel-couleur.webp',
    etiquette: 'Candidat · sept. 2026', tampon: '2<sup>e</sup> candidature',
    role: 'Secrétaire national du PCF · maire de Saint‑Amand‑les‑Eaux', valeurs: [7, 4, 6, 2],
    phrase: 'Candidat à 85&nbsp;%.', quand: 'Juillet 2026 · congrès du PCF, avant le vote des militants',
    annees: ['2022', '2027'],
    justice: 'Enquête du PNF pour détournement de fonds publics, confirmée en 2022, sur son emploi d’assistant parlementaire (2009-2014). Il conteste&nbsp;; présumé innocent.',
    blocSource: 'nuancier 2026 (PCF)',
    sources: [
      ['LCP', 'https://lcp.fr/actualites/fabien-roussel-officiellement-candidat-du-pcf-a-l-election-presidentielle-de-2027-441389'],
      ['Europe&nbsp;1 (85&nbsp;%)', 'https://www.europe1.fr/node/966744'],
      ['Europe&nbsp;1 (PNF)', 'https://www.europe1.fr/node/86931'],
      ['Euronews', 'https://fr.euronews.com/my-europe/2026/07/05/fabien-roussel-en-route-vers-une-nouvelle-candidature-a-la-presidentielle']
    ]
  },
  {
    nom: 'François Ruffin', bloc: 'Gauche', image: 'img/ruffin-couleur.webp',
    etiquette: 'Candidat · janv. 2026', tampon: '1<sup>re</sup> candidature',
    role: 'Député de la Somme · président de Debout&nbsp;!', valeurs: [4, 6, 1, 6],
    phrase: 'République cherche candidat&nbsp;? CDD de 5 ans, nourri, logé, blanchi.', quand: 'Avril 2026 · annonce de son meeting de Lyon',
    annees: ['2027'], justice: 'Aucune procédure recensée.',
    blocSource: 'nuance UG aux législatives 2024 (règle à valider)',
    sources: [
      ['Slate', 'https://www.slate.fr/politique/election-presidentielle-2027-comment-francois-ruffin-retrouve-marginalise-gauche-lfi-france-insoumise-melenchon-candidat'],
      ['Lyon Capitale', 'https://www.lyoncapitale.fr/actualite/a-lyon-francois-ruffin-passera-un-entretien-dembauche-pour-lelysee-le-25-avril'],
      ['Résultats 2024', 'https://www.la-mairie.com/departement/somme/elections/legislatives/01']
    ]
  },
  {
    nom: 'Marine Tondelier', bloc: 'Gauche', image: 'img/tondelier-couleur.webp',
    etiquette: 'Candidate · oct. 2025', tampon: '1<sup>re</sup> candidature',
    role: 'Secrétaire nationale des Écologistes', valeurs: [2, 1, 6, 6],
    phrase: 'Convaincue que le chemin existe pour une victoire de notre camp.', quand: '22 octobre 2025 · annonce de candidature, L’Obs',
    annees: ['2027'], justice: 'Aucune procédure recensée.',
    blocSource: 'nuancier 2026 (Les Écologistes)',
    sources: [
      ['Brut', 'https://www.brut.media/fr/articles/marine-tondelier-la-patronne-des-ecologistes-officiellement-candidate-a-la-presidentielle-de-2027'],
      ['Reporterre', 'https://reporterre.net/Presidentielle-2027-Marine-Tondelier-candidate-a-une-primaire-de-la-gauche'],
      ['LCP', 'https://lcp.fr/actualites/candidature-a-la-presidentielle-pas-de-choix-definitif-des-ecologistes-avant-la-mi']
    ]
  },
  {
    nom: 'Sandrine Rousseau', bloc: 'Gauche', image: 'img/rousseau-couleur.webp',
    etiquette: 'Pas déclarée', tampon: 'Pro-alliance LFI',
    role: 'Députée de Paris', valeurs: [6, 3, 4, 5],
    phrase: 'Je prône l’alliance vers LFI.', quand: '22 août 2026 · franceinfo',
    annees: ['aucune candidature'], justice: 'Poursuivie par la Fédération nationale des chasseurs pour «&nbsp;dénigrement&nbsp;» (propos de 2022)&nbsp;: jugement en sa faveur en octobre 2024&nbsp;; la FNC a fait appel, issue non connue à ce jour.',
    blocSource: 'nuancier 2026 (Les Écologistes)', verifie: '19/11/2026',
    horsCarte: [
      ['Poursuivie en diffamation par Denis Baupin, avec d’autres femmes qui l’accusaient et deux médias', 'Relaxée par le tribunal correctionnel de Paris le 19&nbsp;avril 2019', [['Puremédias', 'https://www.ozap.com/actu/affaire-denis-baupin-mediapart-et-france-inter-relaxes/577655'], ['Actu-Juridique', 'https://www.actu-juridique.fr/civil/personnes-famille/procedures-baillons-un-danger-pour-celles-et-ceux-qui-prennent-la-parole-contre-les-violences-sexistes-et-sexuelles/']]]
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
    role: 'Député européen · fondateur de Place publique', valeurs: [9, 5, 1, 9],
    phrase: 'Nous ne sommes pas là pour gagner une querelle à gauche.', quand: 'Octobre 2026 · soir de sa victoire à la primaire',
    annees: ['2027'], justice: 'Aucune procédure recensée.',
    blocSource: 'nuancier 2026 (Place publique)',
    sources: [
      ['LCP (candidature)', 'https://lcp.fr/actualites/presidentielle-2027-raphael-glucksmann-officialise-sa-candidature-et-participera-a-la'],
      ['Euronews', 'https://fr.euronews.com/2026/10/12/primaire-sociale-democrate-large-victoire-de-raphael-glucksmann-des-le-premier-tour'],
      ['LCP (primaire)', 'https://lcp.fr/actualites/victoire-de-raphael-glucksmann-a-la-primaire-socialiste-premieres-reactions-des']
    ]
  },
  {
    nom: 'François Hollande', bloc: 'Gauche', image: 'img/hollande-couleur.webp',
    etiquette: 'Pas encore déclaré', tampon: 'En embuscade',
    role: 'Ancien président de la République · député de Corrèze', valeurs: [10, 9, 6, 7],
    phrase: 'Comment être utile aujourd’hui&nbsp;? En me préparant.', quand: '15 avril 2026 · Marianne',
    annees: ['2012', '2027&nbsp;?'], justice: 'Aucune procédure recensée.',
    blocSource: 'nuancier 2026 (PS)', verifie: '19/11/2026',
    sources: [
      ['LCP (statut)', 'https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-declares-et-potentiels-444932'],
      ['LCP (Marianne)', 'https://lcp.fr/actualites/francois-hollande-lui-candidat-comment-il-accelere-en-coulisses-pour-la-presidentielle'],
      ['Élysée', 'https://www.elysee.fr/en/francois-hollande']
    ]
  },
  {
    nom: 'Clémentine Autain', bloc: 'Gauche', image: 'img/autain-couleur.webp',
    etiquette: 'A renoncé · juil. 2026', tampon: 'Hors course',
    role: 'Députée de Seine-Saint-Denis', valeurs: [3, 6, 5, 5],
    phrase: 'Est-ce que je vais ajouter une candidature de plus&nbsp;? La réponse est non.', quand: '11 juillet 2026 · dépêche AFP',
    annees: ['aucune candidature'], justice: 'Aucune procédure recensée.',
    blocSource: 'nuance UG aux législatives 2024 (règle 2)', verifie: '19/11/2026',
    sources: [
      ['AFP (via jeanmarcmorandini.com)', 'https://www.jeanmarcmorandini.com/node/646423'],
      ['Slate', 'https://www.slate.fr/politique/election-presidentielle-2027-liste-candidats-declares-interesses-primaire-gauche-droite-extreme-lfi-rn-lr-ps-macron'],
      ['Datan', 'https://datan.fr/deputes/seine-saint-denis-93/depute_clementine-autain']
    ]
  },
  {
    nom: 'Ségolène Royal', bloc: 'Gauche', image: 'img/royal-couleur.webp',
    etiquette: 'Primaire perdue · oct. 2026', tampon: 'Hors course',
    role: 'Ancienne ministre · ex-présidente de Poitou-Charentes', valeurs: [10, 9, 8, 4],
    phrase: 'La France tranquille et l’ordre juste.', quand: 'Juillet 2026 · campagne de la primaire, Brut',
    annees: ['2007'], justice: 'Aucune procédure en cours.',
    blocSource: 'nuancier 2026 (PS)', verifie: '19/11/2026',
    horsCarte: [
      ['Enquête préliminaire du parquet national financier (nov. 2019) sur l’usage des moyens d’ambassadrice des pôles', 'Classée sans suite le 28&nbsp;juin 2021, aucune infraction démontrée', [['Communiqué du PNF', 'https://www.tribunal-de-paris.justice.fr/sites/default/files/2021-07/2021_06_28%20-%20CP%20S%C3%A9gol%C3%A8ne%20ROYAL%20ambassadrice%20des%20p%C3%B4les.pdf']]]
    ],
    sources: [
      ['LCP (candidature)', 'https://lcp.fr/actualites/presidentielle-2027-segolene-royal-annonce-sa-candidature-a-la-primaire-socialiste'],
      ['Public Sénat (résultats)', 'https://www.publicsenat.fr/actualites/politique/primaire-de-la-gauche-raphael-glucksmann-plie-le-match-et-remporte-le-scrutin-des-le-premier-tour-avec-66'],
      ['Brut', 'https://www.brut.media/fr/articles/france/politique/presidentielle-2027-segolene-royal-annonce-sa-participation-a-la-primaire-de-l-espace-socialiste']
    ]
  },
  {
    nom: 'Olivier Faure', bloc: 'Gauche', image: 'img/faure-couleur.webp',
    etiquette: 'Primaire perdue · oct. 2026', tampon: 'Hors course',
    role: 'Premier secrétaire du PS · député de Seine-et-Marne', valeurs: [3, 7, 1, 4],
    phrase: 'Nous avons désormais un candidat…', quand: '11 octobre 2026 · soir de la primaire',
    annees: ['aucune candidature'], justice: 'Aucune procédure recensée.',
    blocSource: 'nuancier 2026 (PS)', verifie: '19/11/2026',
    sources: [
      ['Sud Radio (AFP)', 'https://www.sudradio.fr/societe/olivier-faure-candidat-a-la-primaire-de-la-gauche'],
      ['LCP (réactions)', 'https://lcp.fr/actualites/victoire-de-raphael-glucksmann-a-la-primaire-socialiste-premieres-reactions-des'],
      ['Public Sénat (résultats)', 'https://www.publicsenat.fr/actualites/politique/primaire-de-la-gauche-raphael-glucksmann-plie-le-match-et-remporte-le-scrutin-des-le-premier-tour-avec-66']
    ]
  },
  {
    nom: 'Jérôme Guedj', bloc: 'Gauche', image: 'img/guedj-couleur.webp',
    etiquette: 'Primaire perdue · oct. 2026', tampon: 'Hors course',
    role: 'Député de l’Essonne', valeurs: [5, 4, 8, 2],
    phrase: 'Il y a un espace pour une tonitruance socialiste.', quand: '5 février 2026 · France Inter',
    annees: ['aucune candidature'], justice: 'Aucune procédure recensée.',
    blocSource: 'nuancier 2026 (PS)', verifie: '19/11/2026',
    sources: [
      ['Brut (candidature)', 'https://www.brut.media/fr/articles/le-depute-jerome-guedj-ps-annonce-sa-candidature-a-lelection-presidentielle-de-2027-sans-passer-par-la-primaire'],
      ['LCP', 'https://lcp.fr/actualites/presidentielle-2027-qui-sera-sur-la-ligne-de-depart-de-la-primaire-sociale-democrate-en'],
      ['Public Sénat (résultats)', 'https://www.publicsenat.fr/actualites/politique/primaire-de-la-gauche-raphael-glucksmann-plie-le-match-et-remporte-le-scrutin-des-le-premier-tour-avec-66']
    ]
  },
  {
    nom: 'Gabriel Attal', bloc: 'Centre', image: 'img/attal-couleur.webp',
    etiquette: 'Candidat · mai 2026', tampon: '1<sup>re</sup> candidature',
    role: 'Secrétaire général de Renaissance · ancien Premier ministre', valeurs: [4, 6, 6, 9],
    phrase: 'L’exercice du pouvoir m’a changé.', quand: 'Printemps 2026 · entretien au Point, avant sa déclaration',
    annees: ['2027'], justice: 'Aucune procédure recensée.',
    blocSource: 'nuancier 2026 (Renaissance)',
    sources: [
      ['LCP (candidature)', 'https://lcp.fr/actualites/presidentielle-2027-gabriel-attal-officialise-sa-candidature-436721'],
      ['Reuters', 'https://www.tradingsat.com/actualites/informations-societes/marche-gabriel-attal-officialise-sa-candidature-a-la-presidence-de-la-republique-1163532.html'],
      ['LCP (Le Point)', 'https://lcp.fr/actualites/je-vais-me-deplacer-partout-en-france-et-je-prendrai-une-decision-gabriel-attal']
    ]
  },
  {
    nom: 'Édouard Philippe', bloc: 'Centre', image: 'img/philippe-couleur.webp',
    etiquette: 'Candidat · sept. 2024', tampon: '1<sup>re</sup> candidature',
    role: 'Maire du Havre · président d’Horizons', valeurs: [3, 5, 8, 8],
    phrase: 'Ce que je proposerai sera massif.', quand: '3 septembre 2024 · annonce de candidature, Le Point',
    annees: ['2027'],
    justice: 'Témoin assisté depuis le 29 octobre 2026 dans une enquête sur des marchés publics du Havre (détournement de fonds publics, favoritisme…). Pas mis en examen&nbsp;; présumé innocent.',
    blocSource: 'nuancier 2026 (Horizons)',
    sources: [
      ['France&nbsp;3', 'https://france3-regions.franceinfo.fr/normandie/seine-maritime/havre/je-serai-candidat-a-la-prochaine-election-presidentielle-edouard-philippe-l-ancien-premier-ministre-et-maire-du-havre-officialise-sa-candidature-3026366.html'],
      ['Club des juristes', 'https://www.leclubdesjuristes.com/en-bref/placement-dedouard-philippe-sous-le-statut-de-temoin-assiste-dans-une-enquete-pour-detournement-de-fonds-publics-18148/'],
      ['Europe&nbsp;1', 'https://www.europe1.fr/node/937625']
    ]
  },
  {
    nom: 'Aurore Bergé', bloc: 'Centre', image: 'img/berge-couleur.webp',
    etiquette: 'Pas déclarée', tampon: 'Pour une primaire',
    role: 'Ministre déléguée à l’Égalité femmes-hommes', valeurs: [5, 6, 5, 6],
    phrase: 'Il faut une primaire à l’automne.', quand: '30 mars 2026 · Public Sénat',
    annees: ['aucune candidature'],
    justice: 'Aucune procédure en cours.',
    blocSource: 'nuancier 2026 (Renaissance)', verifie: '19/11/2026',
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
    role: 'Ancien Premier ministre · fondateur de La France humaniste', valeurs: [1, 4, 1, 8],
    phrase: 'Nous voulons être présents en 2027.', quand: '19 janvier 2026 · Lundi C’est Politique, LCP',
    annees: ['2027&nbsp;?'],
    justice: 'Enquête préliminaire du PNF (mai 2026) pour recel de détournement de fonds publics&nbsp;: une statuette et un buste de Napoléon reçus quand il était ministre. Présumé innocent.',
    blocSource: 'ni parti dans la grille, ni candidature depuis 2020 (règle à valider)',
    sources: [
      ['LCP', 'https://lcp.fr/actualites/dominique-de-villepin-nous-voulons-etre-presents-en-2027-429413'],
      ['LCP (parrainages)', 'https://www.lcp.fr/actualites/presidentielle-dominique-de-villepin-annonce-avoir-depasse-la-barre-des-300-signatures'],
      ['Reuters', 'https://www.tradingsat.com/actualites/informations-societes/marche-le-pnf-ouvre-une-enquete-sur-les-presents-de-dominique-de-villepin-qui-se-dit-serein-1163304.html'],
      ['franceinfo', 'https://www.franceinfo.fr/politique/affaire-des-statuettes-dominique-de-villepin-a-ete-entendu-en-audition-libre-mi-juillet_8124329.html']
    ]
  },
  {
    nom: 'Teddy Riner', bloc: 'Divers', image: 'img/riner-couleur.webp',
    etiquette: 'Candidat · nov. 2026', tampon: '1<sup>re</sup> candidature',
    role: 'Judoka · quintuple champion olympique', valeurs: [1, 1, 1, 3],
    phrase: 'Je suis candidat pour dire qu’on peut relever la France.', quand: '9 novembre 2026 · annonce de candidature',
    annees: ['2027'],
    justice: 'Deux dossiers fiscaux&nbsp;: redressement validé en appel (oct. 2026) pour l’usage privé d’une Ferrari et d’une Rolls par sa société&nbsp;; sa société immobilière, à qui le fisc réclame 244&nbsp;789&nbsp;€, en liquidation depuis sept. 2026.',
    blocSource: 'ni parti dans la grille, ni candidature depuis 2020 (règle à valider)',
    sources: [
      ['LCP', 'https://lcp.fr/actualites/le-judoka-teddy-riner-annonce-sa-candidature-a-l-election-presidentielle-de-2027-444920'],
      ['Flashscore (AFP)', 'https://www.flashscore.fr/actualites/la-justice-conforte-le-fisc-dans-un-redressement-visant-teddy-riner/UXa8IVOc/'],
      ['Euronews', 'https://fr.euronews.com/2026/11/12/presidentielle-2027-teddy-riner-rattrape-par-le-fisc-un-premier-combat-sur-le-terrain-poli']
    ]
  },
  {
    nom: 'Natacha Polony', bloc: 'Divers', image: 'img/polony-couleur.webp',
    etiquette: 'Candidate · oct. 2026', tampon: '1<sup>re</sup> candidature',
    role: 'Essayiste · ex-directrice de&nbsp;la&nbsp;rédaction&nbsp;de&nbsp;Marianne', valeurs: [2, 1, 1, 6],
    phrase: 'Je ne peux pas continuer à regarder mon pays s’effondrer.', quand: '14 octobre 2026 · France Inter',
    annees: ['2027'], justice: 'Aucune procédure en cours.',
    blocSource: 'ni parti dans la grille, ni candidature depuis 2020 (règle à valider)',
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
    role: 'Avocat et essayiste · mouvement Les Ruches', valeurs: [2, 1, 1, 4],
    phrase: 'Je pense qu’il faut se préparer à la sortie de l’Union européenne.', quand: '19 décembre 2025 · Sud Radio',
    annees: ['2027'],
    justice: 'Mis en examen pour viol (2021) et pour des faits dénoncés par deux autres femmes. Août 2026&nbsp;: le parquet requiert un procès pour le viol, un non-lieu pour le reste&nbsp;; le juge tranchera. Il conteste&nbsp;; présumé innocent.',
    blocSource: 'ni parti dans la grille, ni candidature depuis 2020 (règle 3)', verifie: '19/11/2026',
    sources: [
      ['Sud Radio', 'https://www.sudradio.fr/sud-radio/lavocat-juan-branco-candidat-a-la-presidentielle'],
      ['AFP', 'https://www.sudradio.fr/societe/le-parquet-de-paris-requiert-le-renvoi-en-proces-pour-viol-de-lavocat-juan-branco'],
      ['JusticeInfo', 'https://www.justiceinfo.net/fr/164381-france-le-parquet-veut-que-lavocat-franco-espagnol-juan-branco-soit-juge-pour-viol.html']
    ]
  },
  {
    nom: 'Jean Lassalle', bloc: 'Divers', image: 'img/lassalle-couleur.webp',
    etiquette: 'Cagnotte · juil. 2026', tampon: '3<sup>e</sup> candidature&nbsp;?',
    role: 'Ancien député · président de Résistons&nbsp;!', valeurs: [7, 8, 10, 2],
    phrase: 'Je verrai à l’automne ce que donne la cagnotte, si elle me permet d’y aller.', quand: 'Juillet 2026 · appel aux dons, Europe&nbsp;1',
    annees: ['2017', '2022', '2027&nbsp;?'],
    justice: 'Enquête préliminaire du parquet de Bordeaux (mai 2023) pour viol et agression sexuelle, sur plainte (faits allégués de 2010). Issue non connue à ce jour&nbsp;; présumé innocent.',
    blocSource: 'Résistons&nbsp;! hors grille, liste Alliance rurale en 2024 (règle 3)', verifie: '19/11/2026',
    sources: [
      ['Europe&nbsp;1 (cagnotte)', 'https://www.europe1.fr/node/970134'],
      ['Pleinchamp', 'https://www.pleinchamp.com/actualite/jean-lassalle-agriculteurs-reprenez-vos-reves.-parce-que-les-reves-ca-permet-de-sortir-du-cauchemar'],
      ['Europe&nbsp;1 (enquête)', 'https://www.europe1.fr/node/60264']
    ]
  },
  {
    nom: 'Delphine Batho', bloc: 'Divers', image: 'img/batho-couleur.webp',
    etiquette: 'Candidate · nov. 2025', tampon: '1<sup>re</sup> candidature',
    role: 'Députée des Deux-Sèvres · Génération écologie', valeurs: [5, 8, 1, 1],
    phrase: 'L’écologie est en voie de rikikisation, si j’ose dire.', quand: '25 novembre 2025 · L’Obs',
    annees: ['2027'], justice: 'Aucune procédure recensée.',
    blocSource: 'Génération écologie hors grille, nuance ECO en 2024 (règle 2, à valider)', verifie: '19/11/2026',
    sources: [
      ['L’info durable (AFP)', 'https://www.linfodurable.fr/lex-ministre-delphine-batho-candidate-la-presidentielle-pour-conjurer-la-rikikisation-de-lecologie'],
      ['Datan', 'https://datan.fr/deputes/deux-sevres-79/depute_delphine-batho'],
      ['Nuance 2024 (annuaire-mairie)', 'https://www.annuaire-mairie.fr/elections-legislatives-nanteuil.html']
    ]
  },
  {
    nom: 'Bruno Retailleau', bloc: 'Droite', image: 'img/retailleau-couleur.webp',
    etiquette: 'Candidat · févr. 2026', tampon: '1<sup>re</sup> candidature',
    role: 'Président des Républicains · sénateur de Vendée', valeurs: [6, 9, 10, 7],
    phrase: 'Renverser la table.', quand: '12 février 2026 · annonce de candidature, Paris',
    annees: ['2027'], justice: 'Aucune procédure recensée.',
    blocSource: 'nuancier 2026 (LR)',
    sources: [
      ['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/referendum-sur-limmigration-primaute-du-droit-national-le-projet-de-bruno-retailleau-est-il-faisable'],
      ['Sud Radio', 'https://www.sudradio.fr/politique/bruno-retailleau-annonce-sa-candidature-a-la-presidentielle-2027'],
      ['Le Temps', 'https://www.letemps.ch/monde/france-les-adherents-lr-propulsent-bruno-retailleau-comme-candidat-pour-la-presidentielle']
    ]
  },
  {
    nom: 'David Lisnard', bloc: 'Droite', image: 'img/lisnard-couleur.webp',
    etiquette: 'Candidat · mars 2026', tampon: '1<sup>re</sup> candidature',
    role: 'Maire de Cannes · fondateur de Nouvelle Énergie', valeurs: [3, 1, 8, 8],
    phrase: 'Un projet puissant pour que la France soit respectée, indépendante et gagnante.', quand: 'Mars 2026 · candidature et départ de LR',
    annees: ['2027'], justice: 'Aucune procédure recensée.',
    blocSource: 'nuance divers droite aux municipales 2026 (règle à valider)',
    sources: [
      ['LCP', 'https://lcp.fr/actualites/je-suis-candidat-david-lisnard-quitte-lr-et-relance-le-debat-sur-une-primaire-a-droite'],
      ['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/presidentielle-2027-david-lisnard-maire-de-cannes-annonce-sa-candidature-et-quitte-officiellement-les-lr'],
      ['Résultats 2026', 'https://datan.fr/elections/resultats/alpes-maritimes-06/ville_cannes']
    ]
  },
  {
    nom: 'Nicolas Dupont‑Aignan', bloc: 'Droite', image: 'img/dupont-aignan-couleur.webp',
    etiquette: 'Candidat · mars 2025', tampon: '4<sup>e</sup> candidature',
    role: 'Maire de Yerres · président de Debout&nbsp;la&nbsp;France', valeurs: [8, 9, 9, 3],
    phrase: 'C’est la raison de ma candidature&nbsp;: offrir un choix, un vrai choix aux Français.', quand: '20 septembre 2026 · Sud Radio',
    annees: ['2012', '2017', '2022', '2027'], justice: 'Aucune procédure recensée.',
    blocSource: 'nuance droite souverainiste aux municipales 2026 (règle à valider)',
    sources: [
      ['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/presidentielle-2027-le-dernier-decompte-des-candidats-deja-sur-la-ligne-de-depart'],
      ['Sud Radio', 'https://www.sudradio.fr/linvite-politique/nicolas-dupont-aignan-la-position-du-rn-est-incomprehensible'],
      ['Résultats 2026', 'https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/11/91/91691/']
    ]
  },
  {
    nom: 'Xavier Bertrand', bloc: 'Droite', image: 'img/bertrand-couleur.webp',
    etiquette: 'Prétendant · août 2026', tampon: '1<sup>re</sup> candidature&nbsp;?',
    role: 'Président de la région Hauts-de-France', valeurs: [8, 7, 9, 3],
    phrase: 'Je serai un candidat à la place, pas un candidat de plus.', quand: '27 août 2026 · rencontre des entrepreneurs du Medef',
    annees: ['2027&nbsp;?'], justice: 'Aucune procédure recensée.',
    blocSource: 'nuancier 2026 (LR)', verifie: '19/11/2026',
    sources: [
      ['LCP (Medef)', 'https://lcp.fr/actualites/2027-figure-de-la-droite-xavier-bertrand-confirme-qu-il-sera-candidat-a-l-election'],
      ['LCP (statut)', 'https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-declares-et-potentiels-444932'],
      ['Slate', 'https://www.slate.fr/politique/election-presidentielle-2027-liste-candidats-declares-interesses-primaire-gauche-droite-extreme-lfi-rn-lr-ps-macron']
    ]
  },
  {
    nom: 'Laurent Wauquiez', bloc: 'Droite', image: 'img/wauquiez-couleur.webp',
    etiquette: 'Pas déclaré', tampon: 'Hors course',
    role: 'Président des députés Droite républicaine', valeurs: [7, 8, 7, 3],
    phrase: '… pour être ce guerrier du rassemblement.', quand: 'Juillet 2026 · Le Figaro',
    annees: ['aucune candidature'],
    justice: 'Enquête préliminaire du PNF ouverte en 2020 sur ses collaborateurs à la Région, élargie fin 2024 à une étude d’opinion le concernant. Issue non connue à ce jour&nbsp;; présumé innocent.',
    blocSource: 'nuancier 2026 (LR)', verifie: '19/11/2026',
    sources: [
      ['Lyon Capitale (statut)', 'https://www.lyoncapitale.fr/?p=501731'],
      ['AFP (Le Figaro)', 'https://www.boursedirect.fr/fr/actualites/categorie/politique/presidentielle-wauquiez-porte-un-coup-a-la-candidature-de-retailleau-en-tendant-la-main-a-philippe-afp-88833e6f3077761451ca93dfccafb0c40b3eb503'],
      ['Lyon Capitale (PNF)', 'https://www.lyoncapitale.fr/actualite/etude-d-opinion-financee-par-la-region-aura-laurent-wauquiez-de-nouveau-dans-le-viseur-du-pnf']
    ]
  },
  {
    nom: 'Gérald Darmanin', bloc: 'Droite', image: 'img/darmanin-couleur.webp',
    etiquette: 'Pas candidat · août 2026', tampon: 'Soutient Philippe',
    role: 'Garde des Sceaux, ministre de la Justice', valeurs: [4, 7, 7, 5],
    phrase: 'J’ai décidé de ne pas rajouter de la division.', quand: '17 août 2026 · annonce de son soutien',
    annees: ['aucune candidature'], justice: 'Aucune procédure en cours.',
    blocSource: 'en retrait de Renaissance, liste divers droite aux municipales 2026 (règle 2, à valider)', verifie: '19/11/2026',
    horsCarte: [
      ['Plainte pour viol (2017, faits allégués de 2009)&nbsp;; jamais mis en examen', 'Non-lieu en 2022, confirmé en appel&nbsp;; pourvoi rejeté par la Cour de cassation le 14&nbsp;février 2024&nbsp;: non-lieu définitif', [['Europe&nbsp;1', 'https://www.europe1.fr/politique/accusations-de-viol-la-cour-de-cassation-valide-le-non-lieu-en-faveur-de-gerald-darmanin-4230654'], ['La Gazette (AFP)', 'https://www.lagazettefrance.fr/article/accusations-de-viol-gerald-darmanin-definitivement-mis-hors-de-cause-par-la-justice']]],
      ['Plainte d’un collectif d’avocats devant la Cour de justice de la République (visite à Nicolas Sarkozy en prison, oct. 2025)', 'Classée sans suite par la commission des requêtes (déc. 2025), décision sans recours', [['Brut (AFP)', 'https://www.brut.media/fr/articles/classement-sans-suite-dune-plainte-contre-darmanin-pour-son-soutien-implicite-a-sarkozy'], ['Club des juristes', 'https://www.leclubdesjuristes.com/en-bref/gerald-darmanin-la-plainte-visant-le-ministre-de-la-justice-pour-son-soutien-implicite-a-nicolas-sarkozy-classee-sans-suite-13255/']]]
    ],
    sources: [
      ['LCP', 'https://lcp.fr/actualites/presidentielle-2027-gerald-darmanin-ne-sera-pas-candidat-et-soutient-edouard-philippe'],
      ['Brut (Renaissance)', 'https://www.brut.media/fr/articles/darmanin-denonce-aupres-dattal-les-aventures-individuelles-et-prematurees-pour-lelysee'],
      ['Intérieur (Tourcoing 2026)', 'https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/32/59/59599/rappel_candidature/2/5.html']
    ]
  },
  {
    nom: 'Marine Le Pen', bloc: 'Extrême droite', image: 'img/le-pen-couleur.webp',
    etiquette: 'Candidate · juil. 2026', tampon: '4<sup>e</sup> candidature',
    role: 'Présidente du groupe RN à l’Assemblée', valeurs: [9, 9, 9, 7],
    phrase: 'Ce soir, je suis candidate à l’élection présidentielle.', quand: '7 juillet 2026 · 20&nbsp;h de TF1',
    annees: ['2012', '2017', '2022', '2027'],
    justice: 'Condamnée en appel en juillet 2026 pour détournement de fonds publics (assistants FN)&nbsp;: 3 ans dont 1 ferme sous bracelet, 45 mois d’inéligibilité dont 30 avec sursis. Pourvoi en cassation&nbsp;: présumée innocente.',
    blocSource: 'nuancier 2026 (RN)',
    sources: [
      ['Cour d’appel de Paris', 'https://www.cours-appel.justice.fr/sites/default/files/2026-07/20260707%20-%20CA%20Paris%20-%20CP.pdf'],
      ['LCP', 'https://lcp.fr/actualites/ce-soir-je-suis-candidate-a-l-election-presidentielle-annonce-marine-le-pen-438886'],
      ['Club des juristes', 'https://www.leclubdesjuristes.com/en-bref/condamnation-de-marine-le-pen-la-cour-de-cassation-fera-tout-pour-statuer-avant-le-scrutin-presidentiel-affirme-remy-heitz-16893/']
    ]
  },
  {
    nom: 'Éric Zemmour', bloc: 'Extrême droite', image: 'img/zemmour-couleur.webp',
    etiquette: 'Candidat · sept. 2026', tampon: '2<sup>e</sup> candidature',
    role: 'Président de Reconquête', valeurs: [8, 1, 1, 9],
    phrase: 'Je me présente pour conserver une France française et que notre avenir soit français.', quand: '10 novembre 2026 · 20&nbsp;h de TF1',
    annees: ['2022', '2027'],
    justice: 'Plusieurs condamnations définitives, dont complicité de provocation à la haine (mineurs isolés, 2025) et diffamation (Ined, 2026).',
    blocSource: 'nuancier 2026 (Reconquête)',
    sources: [
      ['LCP', 'https://lcp.fr/actualites/presidentielle-2027-eric-zemmour-officialise-sa-candidature-441871'],
      ['i24NEWS', 'https://www.i24news.tv/fr/actu/france/artc-eric-zemmour-officialise-sa-candidature-a-l-election-presidentielle-2027'],
      ['Club des juristes', 'https://www.leclubdesjuristes.com/en-bref/la-cour-de-cassation-confirme-deux-condamnations-deric-zemmour-pour-complicite-dinjure-publique-provocation-a-la-haine-et-pour-diffamation-13229/'],
      ['Ined', 'https://www.ined.fr/fr/presse/condamnation-definitive-monsieur-eric-zemmour-et-monsieur-jean-christophe-thiery-bercegol-du']
    ]
  },
  {
    nom: 'Jordan Bardella', bloc: 'Extrême droite', image: 'img/bardella-couleur.webp',
    etiquette: 'Plan B · avr. 2025', tampon: 'Si Le Pen empêchée',
    role: 'Président du RN · député européen', valeurs: [9, 5, 5, 10],
    phrase: 'Si elle devait être empêchée demain, je pense pouvoir vous dire que je serai son candidat.', quand: 'Avril 2025 · Le Parisien',
    annees: ['2027&nbsp;?'], justice: 'Aucune procédure le visant recensée.',
    blocSource: 'nuancier 2026 (RN)', verifie: '19/11/2026',
    sources: [
      ['Europe&nbsp;1 (Le Parisien)', 'https://www.europe1.fr/node/708835'],
      ['Landot (JO, européennes)', 'https://blog.landot-avocats.net/2024/06/13/proclamation-des-resultats-de-lelection-des-representants-au-parlement-europeen/'],
      ['HATVP', 'https://www.hatvp.fr/livraison/dossiers/bardella-jordan-dim33673-europe.pdf']
    ]
  },
  {
    nom: 'Sarah Knafo', bloc: 'Extrême droite', image: 'img/knafo-couleur.webp',
    etiquette: 'Pas candidate · janv. 2026', tampon: 'Hors course',
    role: 'Députée européenne · élue du 16<sup>e</sup> arrondissement de Paris', valeurs: [6, 3, 4, 10],
    phrase: 'C’est un travail à plein temps.', quand: '7 janvier 2026 · TF1, à propos de la mairie de Paris',
    annees: ['aucune candidature'], justice: 'Aucune procédure recensée.',
    blocSource: 'nuancier 2026 (Reconquête)', verifie: '19/11/2026',
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


var COURTS = ["Arthaud", "Mélenchon", "Roussel", "Ruffin", "Tondelier", "Rousseau", "Glucksmann", "Hollande", "Autain", "Royal", "Faure", "Guedj", "Attal", "Philippe", "Bergé", "Villepin", "Riner", "Polony", "Branco", "Lassalle", "Batho", "Retailleau", "Lisnard", "Dupont‑Aignan", "Bertrand", "Wauquiez", "Darmanin", "Le Pen", "Zemmour", "Bardella", "Knafo"], COURTS_A = ["Borne", "Valls", "Braun-Pivet", "de Gaulle", "Sarkozy", "Macron", "Le Maire", "Larcher", "Arnault", "Praud", "Bayrou", "Plenel"];
var METHODE = [{"voix": 232384, "election": "présidentielle 2017, 1er tour", "voixSource": ["Conseil constitutionnel via info.gouv.fr", "https://www.info.gouv.fr/actualite/resultats-definitifs-du-premier-tour-de-l-election-presidentielle-2017-etablis-par-le-conseil"], "national": 0.0, "local": 6.0, "vues": 9188, "devance": [17, 0, 11, 1], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-nathalie-arthaud"]]}, {"voix": 7712520, "election": "présidentielle 2022, 1er tour", "voixSource": ["Fondation Robert Schuman (chiffres officiels)", "https://server.www.robert-schuman.eu/storage/fr/doc/oee/oee-1973-fr.pdf"], "national": 33.2, "local": 21.0, "vues": 112926, "devance": [26, 30, 21, 28], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-jean-luc-melenchon"], ["Public Sénat", "https://www.publicsenat.fr/actualites/politique/jean-luc-melenchon-quitte-l-assemblee-retour-sur-trente-ans-de-mandats"]]}, {"voix": 802422, "election": "présidentielle 2022, 1er tour", "voixSource": ["Fondation Robert Schuman (chiffres officiels)", "https://server.www.robert-schuman.eu/storage/fr/doc/oee/oee-1973-fr.pdf"], "national": 7.0, "local": 12.7, "vues": 10692, "devance": [19, 11, 16, 2], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-fabien-roussel"]]}, {"voix": 27108, "election": "législatives 2024, 2d tour", "voixSource": ["La Mairie (ministère de l’Intérieur)", "https://www.la-mairie.com/departement/somme/elections/legislatives/01"], "national": 9.4, "local": 0.0, "vues": 40280, "devance": [9, 15, 0, 18], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-francois-ruffin"]]}, {"voix": 14239, "election": "législatives 2022, 2d tour", "voixSource": ["Datan", "https://datan.fr/deputes/pas-de-calais-62/depute_marine-lepen/legislature-16"], "national": 0.0, "local": 12.7, "vues": 40140, "devance": [4, 0, 16, 17], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-marine-tondelier"]]}, {"voix": 107993, "election": "régionales 2015, 1er tour, tête de liste", "voixSource": ["ministère de l’Intérieur", "https://www.archives-resultats-elections.interieur.gouv.fr/resultats/regionales-2015/32/32.php"], "national": 4.4, "local": 5.8, "vues": 28721, "devance": [16, 8, 10, 13], "mandatsSources": [["Datan", "https://datan.fr/deputes/paris-75/depute_sandrine-rousseau"], ["Wikipédia (en)", "https://en.wikipedia.org/wiki/Sandrine_Rousseau"]]}, {"voix": 3424216, "election": "européennes 2024, tête de liste", "voixSource": ["AFP / Le Courrier de Guadeloupe", "https://lecourrierdeguadeloupe.com/un-europeen-sur-deux-a-vote-dimanche-la-france-championne-de-lextreme-droite/?print=pdf"], "national": 7.3, "local": 0.0, "vues": 104474, "devance": [25, 12, 0, 27], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-raphael-glucksmann"]]}, {"voix": 18000668, "election": "présidentielle 2012, 2d tour", "voixSource": ["Conseil constitutionnel via MJP (univ. Perpignan)", "https://mjp.univ-perp.fr/election/fr/fr2012.htm"], "national": 27.1, "local": 11.2, "vues": 41808, "devance": [30, 28, 15, 19], "mandatsSources": [["Élysée", "https://www.elysee.fr/en/francois-hollande"], ["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-francois-hollande"]]}, {"voix": 22209, "election": "législatives 2024, 1er tour", "voixSource": ["Datan", "https://datan.fr/deputes/seine-saint-denis-93/depute_clementine-autain"], "national": 9.4, "local": 7.0, "vues": 27174, "devance": [7, 15, 12, 12], "mandatsSources": [["Datan", "https://datan.fr/deputes/seine-saint-denis-93/depute_clementine-autain"], ["Politis", "https://www.politis.fr/articles/2026/01/clementine-autain-nous-devons-avoir-le-discours-dune-gauche-decomplexee/"]]}, {"voix": 16790440, "election": "présidentielle 2007, 2d tour", "voixSource": ["ministère de l’Intérieur", "https://www.archives-resultats-elections.interieur.gouv.fr/resultats/presidentielle_2007/FE.php"], "national": 22.0, "local": 25.0, "vues": 27064, "devance": [29, 25, 23, 11], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-segolene-royal"], ["Wikipédia (région)", "https://fr.wikipedia.org/wiki/S%C3%A9gol%C3%A8ne_Royal"]], "remarque": "Conseil municipal de Trouville-sur-Mer&nbsp;: 1983-1986, mois de départ non précisé, compté jusqu’en mars 1986."}, {"voix": 21643, "election": "législatives 2024, 1er tour", "voixSource": ["Datan", "https://datan.fr/deputes/seine-et-marne-77/depute_olivier-faure"], "national": 14.4, "local": 0.0, "vues": 21636, "devance": [6, 21, 0, 9], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-dolivier-faure"]], "remarque": "Buzz&nbsp;: l’article Wikipédia a été renommé en août 2026, les vues des deux titres sont additionnées mois par mois."}, {"voix": 38991, "election": "législatives 2024, 2d tour", "voixSource": ["Datan", "https://datan.fr/deputes/essonne-91/depute_jerome-guedj"], "national": 6.2, "local": 24.3, "vues": 12998, "devance": [14, 10, 22, 4], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-jerome-guedj"], ["Wikipédia (en)", "https://en.wikipedia.org/wiki/J%C3%A9r%C3%B4me_Guedj"]]}, {"voix": 29924, "election": "législatives 2024, 2d tour", "voixSource": ["Datan", "https://datan.fr/deputes/hauts-de-seine-92/depute_gabriel-attal"], "national": 9.4, "local": 12.7, "vues": 73344, "devance": [11, 15, 16, 25], "mandatsSources": [["info.gouv.fr", "https://www.info.gouv.fr/les-anciens-premiers-et-premieres-ministres-de-la-ve-republique/gabriel-attal"], ["Intérieur 2026", "https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/11/92/92075/rappel_candidature/1/1.html"]]}, {"voix": 26660, "election": "municipales 2014, 1er tour, tête de liste", "voixSource": ["ministère de l’Intérieur", "https://www.interieur.gouv.fr/Elections/Les-resultats/Municipales/elecresult__MN2014/(path)/MN2014/076/076351.html"], "national": 8.1, "local": 25.7, "vues": 53922, "devance": [8, 14, 24, 22], "mandatsSources": [["info.gouv.fr", "https://www.info.gouv.fr/les-anciens-premiers-et-premieres-ministres-de-la-ve-republique/edouard-philippe"], ["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-dedouard-philippe"]]}, {"voix": 32048, "election": "législatives 2024, 2d tour", "voixSource": ["Wikipédia (en), d’après le ministère de l’Intérieur", "https://en.wikipedia.org/wiki/Yvelines%27s_10th_constituency"], "national": 9.4, "local": 8.7, "vues": 33368, "devance": [12, 15, 13, 15], "mandatsSources": [["HATVP", "https://www.hatvp.fr/livraison/dossiers/berge-aurore-di34865-gouvernement.pdf"], ["Wikipédia (en)", "https://en.wikipedia.org/wiki/Aurore_Berg%C3%A9"]], "remarque": "Conseil municipal de Magny-les-Hameaux&nbsp;: élue en 2014, date de départ non trouvée, comptée jusqu’en 2017 (dernière mention)."}, {"voix": 0, "election": "jamais candidat au suffrage universel", "voixSource": ["Universalis", "https://www.universalis.fr/encyclopedie/dominique-de-villepin/"], "national": 5.0, "local": 0.0, "vues": 64992, "devance": [0, 9, 0, 24], "mandatsSources": [["Universalis", "https://www.universalis.fr/encyclopedie/dominique-de-villepin/"], ["Larousse", "https://www.larousse.fr/encyclopedie/personnage/wd/149004"]]}, {"voix": 0, "election": "jamais candidat avant 2027", "voixSource": ["LCP", "https://lcp.fr/actualites/le-judoka-teddy-riner-annonce-sa-candidature-a-l-election-presidentielle-de-2027-444920"], "national": 0.0, "local": 0.0, "vues": 18654, "devance": [0, 0, 0, 7], "mandatsSources": [["LCP", "https://lcp.fr/actualites/le-judoka-teddy-riner-annonce-sa-candidature-a-l-election-presidentielle-de-2027-444920"]]}, {"voix": 803, "election": "législatives 2002, 1er tour", "voixSource": ["Assemblée nationale", "https://www.assemblee-nationale.fr/elections/resultats/html/531.html"], "national": 0.0, "local": 0.0, "vues": 34761, "devance": [2, 0, 0, 16], "mandatsSources": [["LCP", "https://lcp.fr/actualites/natacha-polony-annonce-sa-candidature-a-l-election-presidentielle-443808"]]}, {"voix": 3596, "election": "législatives 2017, 1er tour", "voixSource": ["Wikipédia (en), d’après le ministère de l’Intérieur", "https://en.wikipedia.org/wiki/Seine-Saint-Denis%27s_12th_constituency"], "national": 0.0, "local": 0.0, "vues": 23321, "devance": [3, 0, 0, 10], "mandatsSources": [["Public Sénat", "https://www.publicsenat.fr/article/politique/legislatives-un-avocat-de-wikileaks-insoumis-laboure-le-9-3-61008"]]}, {"voix": 1101387, "election": "présidentielle 2022, 1er tour", "voixSource": ["Fondation Robert Schuman (chiffres officiels)", "https://server.www.robert-schuman.eu/storage/fr/doc/oee/oee-1973-fr.pdf"], "national": 20.0, "local": 40.3, "vues": 11567, "devance": [20, 24, 30, 3], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-jean-lassalle"], ["Wikipédia (en)", "https://en.wikipedia.org/wiki/Jean_Lassalle"]]}, {"voix": 37808, "election": "législatives 2024, 2d tour", "voixSource": ["Datan", "https://datan.fr/deputes/deux-sevres-79/depute_delphine-batho"], "national": 19.3, "local": 0.0, "vues": 6784, "devance": [13, 23, 0, 0], "mandatsSources": [["Wikipédia (en)", "https://en.wikipedia.org/wiki/Delphine_Batho"], ["Datan", "https://datan.fr/deputes/deux-sevres-79/depute_delphine-batho"]]}, {"voix": 620245, "election": "régionales 2015, 2d tour, tête de liste", "voixSource": ["Wikipédia (résultats du ministère)", "https://extension.wikiwand.com/en/French_regional_elections,_2015"], "national": 24.4, "local": 37.4, "vues": 48577, "devance": [18, 27, 29, 21], "mandatsSources": [["info.gouv.fr", "https://www.info.gouv.fr/personnalite/bruno-retailleau"], ["Sénat", "https://senat.fr/senateur/retailleau_bruno04033b.html"]]}, {"voix": 19721, "election": "municipales 2026, 1er tour, tête de liste", "voixSource": ["ministère de l’Intérieur", "https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/93/06/06029/"], "national": 0.0, "local": 25.7, "vues": 59568, "devance": [5, 0, 24, 23], "mandatsSources": [["Votons 2027", "https://votons-2027.fr/candidats/lisnard"], ["Intérieur 2026", "https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/93/06/06029/"]]}, {"voix": 1695000, "election": "présidentielle 2017, 1er tour", "voixSource": ["Conseil constitutionnel via info.gouv.fr", "https://www.info.gouv.fr/actualite/resultats-definitifs-du-premier-tour-de-l-election-presidentielle-2017-etablis-par-le-conseil"], "national": 27.1, "local": 31.4, "vues": 13756, "devance": [23, 28, 27, 5], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-nicolas-dupont-aignan"]]}, {"voix": 1389340, "election": "régionales 2015, 2d tour, tête de liste", "voixSource": ["Wikipédia (en), d’après le ministère de l’Intérieur", "https://en.wikipedia.org/wiki/2015_Nord-Pas-de-Calais-Picardie_regional_election"], "national": 13.6, "local": 31.4, "vues": 14306, "devance": [22, 20, 27, 6], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-xavier-bertrand"]]}, {"voix": 1201528, "election": "régionales 2015, 2d tour, tête de liste", "voixSource": ["Lyon Capitale, d’après les résultats officiels", "https://www.lyoncapitale.fr/?p=104772"], "national": 15.2, "local": 18.7, "vues": 21046, "devance": [21, 22, 20, 8], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-et-le-cv-de-laurent-wauquiez"], ["Lyon Capitale", "https://www.lyoncapitale.fr/?p=405636"]]}, {"voix": 28603, "election": "législatives 2024, 2d tour", "voixSource": ["Datan", "https://datan.fr/deputes/nord-59/depute_gerald-darmanin"], "national": 13.1, "local": 14.8, "vues": 31398, "devance": [10, 19, 19, 14], "mandatsSources": [["Wikipédia (en)", "https://en.wikipedia.org/wiki/G%C3%A9rald_Darmanin"], ["info.gouv.fr", "https://www.info.gouv.fr/personnalite/gerald-darmanin"], ["HATVP", "https://www.hatvp.fr/livraison/dossiers/darmanin-gerald-di34806-gouvernement.pdf"], ["Intérieur 2026", "https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/32/59/59599/rappel_candidature/2/5.html"]], "remarque": "Conseil régional du Nord-Pas-de-Calais&nbsp;: 2010-2012 selon le gouvernement, 2010-2014 selon Wikipédia&nbsp;; la durée la plus courte est retenue."}, {"voix": 13288686, "election": "présidentielle 2022, 2d tour", "voixSource": ["Conseil constitutionnel via vie-publique.fr", "https://www.vie-publique.fr/en-bref/284959-presidentielle-2022-le-conseil-constitutionnel-proclame-les-resultats"], "national": 22.3, "local": 27.1, "vues": 46072, "devance": [28, 26, 26, 20], "mandatsSources": [["Sud Radio", "https://www.sudradio.fr/la-biographie-de-marine-le-pen"], ["Conseil d’État", "https://www.conseil-etat.fr/Media/actualites/documents/2025/novembre-2025/cp_execution_provisoire_web.pdf"]]}, {"voix": 2485226, "election": "présidentielle 2022, 1er tour", "voixSource": ["Fondation Robert Schuman (chiffres officiels)", "https://server.www.robert-schuman.eu/storage/fr/doc/oee/oee-1973-fr.pdf"], "national": 0.0, "local": 0.0, "vues": 77511, "devance": [24, 0, 0, 26], "mandatsSources": [["Public Sénat", "https://www.publicsenat.fr/actualites/politique/legislatives-eric-zemmour-elimine-des-le-1er-tour-213118"]]}, {"voix": 7765936, "election": "européennes 2024, tête de liste", "voixSource": ["Journal officiel via Landot avocats", "https://blog.landot-avocats.net/2024/06/13/proclamation-des-resultats-de-lelection-des-representants-au-parlement-europeen/"], "national": 7.3, "local": 9.2, "vues": 136678, "devance": [27, 12, 14, 29], "mandatsSources": [["HATVP", "https://www.hatvp.fr/livraison/dossiers/bardella-jordan-dim33673-europe.pdf"]]}, {"voix": 84809, "election": "municipales 2026 à Paris, 1er tour, tête de liste", "voixSource": ["ministère de l’Intérieur", "https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/11/75/75056/index.html"], "national": 2.3, "local": 0.7, "vues": 166237, "devance": [15, 7, 9, 30], "mandatsSources": [["Intérieur (16e)", "https://www.resultats-elections.interieur.gouv.fr/ConseilsdarrondissementPLM2026/ensemble_geographique/11/75/75056SR16/rappel_candidature/1/6.html"], ["Wikipédia (en)", "https://en.wikipedia.org/wiki/Sarah_Knafo"]]}];
CANDIDATS.forEach(function(c, i){ c.court = COURTS[i]; c.mini = c.image.replace('img/', 'img/mini/').replace('-couleur', ''); c.methode = METHODE[i]; });
ACTIONS.forEach(function(c, i){ c.court = COURTS_A[i]; c.mini = c.image.replace('img/', 'img/mini/').replace('-couleur', ''); });
window.APDA = {
  VERIFIE: VERIFIE, CANDIDATS: CANDIDATS, ACTIONS: ACTIONS,
  COTES: ['Urnes', 'Expérience', 'Terrain', 'Buzz'],
  COTES_LONGS: ['Son meilleur score en voix à une élection', 'Ses années de mandat national', 'Ses années d’élu local', 'Combien de fois on consulte sa page Wikipédia (mois type)']
};
})();
