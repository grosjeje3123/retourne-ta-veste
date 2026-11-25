# Resserre les textes pour tenir sur les cartes (débordements constatés)
P = '/home/claude/valeurs/bloc_donnees.js'
s = open(P, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:70], s.count(a)); s = s.replace(a, b)

# Mélenchon
rep("justice: 'Condamné en 2019 à 3 mois avec sursis et 8&nbsp;000&nbsp;€ d’amende pour rébellion et provocation (perquisition de LFI, 2018). Comptes de sa campagne 2017&nbsp;: instruction close en mai 2026 avec quatre mises en examen, dont sa directrice de communication de l’époque&nbsp;; issue non connue.'",
    "justice: 'Condamné en 2019 (3 mois avec sursis) pour rébellion et provocation lors de la perquisition de LFI. Comptes de campagne 2017&nbsp;: quatre mises en examen, dont son ex-directrice de communication&nbsp;; issue non connue.'")
rep(",\n        ['Club des juristes (comptes 2017)', 'https://www.leclubdesjuristes.com/en-bref/quatre-mises-en-examen-dans-laffaire-des-comptes-de-campagnes-de-lfi-de-2017-16141/'],\n        ['Europe&nbsp;1 (comptes 2017)', 'https://www.europe1.fr/node/941060']", "")
rep("        ['Reuters', 'https://www.boursorama.com/actualite-economique/actualites/melenchon-annonce-sa-candidature-a-la-presidentielle-de-2027-b663ea55461748d016069a6f9028614e'],\n",
    "        ['Club des juristes (2026)', 'https://www.leclubdesjuristes.com/en-bref/quatre-mises-en-examen-dans-laffaire-des-comptes-de-campagnes-de-lfi-de-2017-16141/'],\n")

# Le Pen
rep("justice: 'Condamnée en appel en juillet 2026 pour détournement de fonds publics (assistants FN)&nbsp;: 3 ans dont 1 ferme sous bracelet, 45 mois d’inéligibilité dont 30 avec sursis&nbsp;; pourvoi en cassation, présumée innocente. Information judiciaire depuis juillet 2024 sur le financement de sa campagne 2022&nbsp;: issue non connue.'",
    "justice: 'Condamnée en appel (2026) pour détournement de fonds publics (assistants FN)&nbsp;: 3 ans dont 1 ferme, 45 mois d’inéligibilité dont 30 avec sursis&nbsp;; pourvoi en cassation. Enquête judiciaire depuis 2024 sur sa campagne 2022. Présumée innocente.'")
rep(",\n        ['Club des juristes (campagne 2022)', 'https://www.leclubdesjuristes.com/en-bref/ouverture-dune-information-judiciaire-sur-le-financement-de-la-campagne-de-marine-le-pen-en-2022-6528/'],\n        ['AFP (perquisition, 2025)', 'https://lepetitjournal.com/fil-afp/le-rn-perquisitionne-dans-une-enquete-sur-le-financement-de-ses-campagnes-electorales-418194']",
    ",\n        ['Club des juristes (2024)', 'https://www.leclubdesjuristes.com/en-bref/ouverture-dune-information-judiciaire-sur-le-financement-de-la-campagne-de-marine-le-pen-en-2022-6528/']")

# Zemmour
rep("justice: 'Plusieurs condamnations définitives, dont complicité de provocation à la haine (mineurs isolés, 2025) et diffamation (Ined, 2026). Enquête préliminaire (avril 2022) sur l’usage de données personnelles pour des SMS de sa campagne&nbsp;: issue non connue.'",
    "justice: 'Plusieurs condamnations définitives, dont complicité de provocation à la haine (mineurs isolés, 2025) et diffamation (Ined, 2026). Enquête préliminaire (2022) sur des SMS ciblés de sa campagne&nbsp;: issue non connue.'")
rep(",\n        ['Le Courrier de l’Atlas (SMS, 2022)', 'https://www.lecourrierdelatlas.com/?p=182261'],\n        ['Connexion (plainte, 2022)', 'https://www.connexionfrance.com/article/French-news/Formal-complaint-against-far-right-Zemmour-over-text-to-Jews-in-France']", "")
rep("        ['i24NEWS', 'https://www.i24news.tv/fr/actu/france/artc-eric-zemmour-officialise-sa-candidature-a-l-election-presidentielle-2027'],\n",
    "        ['Le Courrier de l’Atlas (2022)', 'https://www.lecourrierdelatlas.com/?p=182261'],\n")

# Bardella
rep("justice: 'Information judiciaire depuis juillet 2024 sur le financement des campagnes du RN, dont les européennes de 2024 qu’il menait (perquisition au siège en juillet 2025). Issue non connue à ce jour&nbsp;; présumé innocent.'",
    "justice: 'Enquête judiciaire depuis 2024 sur le financement des campagnes du RN, dont les européennes 2024 qu’il menait&nbsp;; perquisition au siège en 2025. Issue non connue&nbsp;; présumé innocent.'")
rep(",\n        ['AFP (perquisition, 2025)', 'https://lepetitjournal.com/fil-afp/le-rn-perquisitionne-dans-une-enquete-sur-le-financement-de-ses-campagnes-electorales-418194'],\n        ['Public Sénat (prêts)', 'https://www.publicsenat.fr/actualites/politique/perquisitions-au-rn-que-dit-la-loi-sur-les-prets-de-personnes-privees-aux-partis-politiques']",
    ",\n        ['AFP (2025)', 'https://lepetitjournal.com/fil-afp/le-rn-perquisitionne-dans-une-enquete-sur-le-financement-de-ses-campagnes-electorales-418194']")

# Hollande
rep("justice: 'Enquête préliminaire du parquet de Paris (nov. 2016) sur une possible compromission du secret de la défense nationale, après la parution d’un livre d’entretiens avec deux journalistes. Issue non connue à ce jour.'",
    "justice: 'Enquête préliminaire du parquet de Paris (2016) sur une possible compromission du secret-défense, après un livre d’entretiens. Issue non connue à ce jour.'")
rep(",\n        ['Assemblée nationale (nov. 2016)', 'https://questions.assemblee-nationale.fr/dyn/14/questions/QANR5L14QG4390.pdf'],\n        ['The Local (AFP)', 'https://www.thelocal.com/20161122/probe-opened-after-hollande-leaked-air-strikes-info']",
    ",\n        ['Assemblée nationale (2016)', 'https://questions.assemblee-nationale.fr/dyn/14/questions/QANR5L14QG4390.pdf']")
open(P, 'w', encoding='utf-8').write(s); print('ok')
