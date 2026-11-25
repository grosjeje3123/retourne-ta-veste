# Insère les 12 cartes des vagues 3 et 4 dans bloc_donnees.js, chacune après la carte de son bloc qui la précède,
# et ajoute au tableau public de Darmanin le signalement BriefCam classé sans suite (même règle que pour Cazeneuve).
import re
F = '/home/claude/valeurs/bloc_donnees.js'
t = open(F, encoding='utf-8').read()
V = "verifie: '19/11/2026',"
LCP_LISTE = "['LCP (liste des candidats)', 'https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-declares-et-potentiels-444932']"
BRIEFCAM = ("['Signalement de députés LFI (nov. 2024) visant cinq anciens ministres de l’Intérieur, sur l’usage par la police du logiciel BriefCam', "
            "'Classé sans suite par le procureur général près la Cour de cassation (27&nbsp;janv. 2025), les faits ne pouvant être imputés à aucun des ministres visés', "
            "[['Solutions numériques (AFP)', 'https://www.solutions-numeriques.com/logiciel-de-reconnaissance-faciale-dans-la-police-classement-sans-suite-du-signalement-de-deputes-lfi/']]]")

CARTES = {
 'Raphaël Glucksmann': ["""    {
      nom: 'Karim Bouamrane', bloc: 'Gauche', image: 'img/bouamrane-couleur.webp',
      etiquette: 'Candidat · juin 2026', tampon: '1<sup>re</sup> candidature',
      role: 'Maire de Saint-Ouen-sur-Seine', valeurs: [5, 5, 5, 5],
      phrase: 'J’y vais pour gagner.', quand: '9 juin 2026 · France Inter',
      annees: ['2027'], justice: 'Aucune procédure recensée.',
      blocSource: 'nuancier 2026 (PS)', %s
      sources: [
        ['LCP', 'https://lcp.fr/actualites/presidentielle-2027-qui-est-karim-bouamrane-le-maire-socialiste-de-saint-ouen-et-nouveau'],
        ['Sud Radio (« le recours »)', 'https://www.sudradio.fr/sud-radio/karim-bouamrane-ps-cest-moi-le-recours-a-gauche'],
        ['Sud Radio (9 nov.)', 'https://www.sudradio.fr/linvite-politique/karim-bouamrane-il-faut-arreter-de-regarder-melenchon-comme-le-superman-de-la-gauche']
      ]
    },""" % V],
 'Delphine Batho': ["""    {
      nom: 'Francis Lalanne', bloc: 'Divers', image: 'img/lalanne-couleur.webp',
      etiquette: 'Candidat · août 2026', tampon: '1<sup>re</sup> candidature',
      role: 'Chanteur · mouvement France Libre', valeurs: [5, 5, 5, 5],
      phrase: 'Reprise en main de la souveraineté nationale.', quand: '19 août 2026 · communiqué de candidature',
      annees: ['2027'],
      justice: 'Inéligible 18 mois (Conseil d’État, avril 2025), faute de compte de campagne aux européennes 2024. Deux enquêtes ouvertes en 2021 (tribune appelant l’armée à se soulever, altercation avec des journalistes)&nbsp;: issue non connue&nbsp;; présumé innocent.',
      blocSource: 'France Libre hors grille, nuance DIV aux législatives 2024 (règle 2, à valider)', %s
      sources: [
        ['Demotivateur', 'https://www.demotivateur.fr/societe/francis-lalanne-officiellement-candidat-a-l-election-presidentielle-de-2027-49762'],
        ['Sud Radio', 'https://www.sudradio.fr/politique/francis-lalanne-du-chanteur-engage-des-annees-1980-aux-spheres-complotistes'],
        ['Tribunal administratif de Lyon', 'https://lyon.tribunal-administratif.fr/Media/mediatheque-ta-lyon/2602478'],
        ['Conseil de l’Europe', 'https://rm.coe.int/france-reply-fr-plusieurs-journalistes-attaques-par-le-chanteur-franci/1680a34d49']
      ]
    },""" % V, """    {
      nom: 'Sylvain Durif', bloc: 'Divers', image: 'img/durif-couleur.webp',
      etiquette: 'Candidat · août 2026', tampon: '1<sup>re</sup> candidature',
      role: 'Vidéaste sur Instagram', valeurs: [5, 5, 5, 5],
      phrase: 'Grand Monarque, Christ cosmique, Messie et pape Pierre.', quand: 'Automne 2026 · vidéo Instagram',
      annees: ['2027'], justice: 'Aucune procédure recensée.',
      blocSource: 'ni parti dans la grille, ni candidature retrouvée depuis 2020 (règle 3, à valider)', %s
      sources: [
        ['Sud Radio', 'https://www.sudradio.fr/politique/qui-est-ce-sylvain-durif-le-christ-cosmique-candidat-a-la-presidentielle-2027'],
        %s
      ]
    },""" % (V, LCP_LISTE), """    {
      nom: 'Bernard Cazeneuve', bloc: 'Divers', image: 'img/cazeneuve-couleur.webp',
      etiquette: 'Prétendant · juil. 2026', tampon: '1<sup>re</sup> candidature&nbsp;?',
      role: 'Ancien Premier ministre · président de La Convention', valeurs: [5, 5, 5, 5],
      phrase: 'Mon objectif, c’est de devenir président de la République pour porter les idées auxquelles je crois.', quand: '30 juillet 2026 · Marianne',
      annees: ['2027&nbsp;?'], justice: 'Aucune procédure en cours.',
      blocSource: 'La Convention hors grille, aucune candidature depuis 2020 (règle 3, à valider)', %s
      horsCarte: [
        %s
      ],
      sources: [
        ['LCP (lettre aux Français)', 'https://lcp.fr/actualites/presidentielle-2027-pret-a-se-lancer-dans-la-course-a-l-elysee-bernard-cazeneuve-decline'],
        ['LCP (Marianne)', 'https://lcp.fr/actualites/presidentielle-2027-l-objectif-de-bernard-cazeneuve-est-de-devenir-president-de-la'],
        ['La Libre (« prêt »)', 'https://www.lalibre.be/international/europe/2026/04/28/une-ex-grande-figure-prete-a-etre-candidate-a-la-presidentielle-il-faut-degager-une-solution-qui-evite-le-rn-et-sorte-la-france-de-ses-difficultes-FUXJG7JH25FG7KPHNJNXBS6ICY/']
      ]
    },""" % (V, BRIEFCAM), """    {
      nom: 'Matthieu Pigasse', bloc: 'Divers', image: 'img/pigasse-couleur.webp',
      etiquette: 'Pas déclaré', tampon: 'Prêt si besoin',
      role: 'Banquier d’affaires · patron de Radio Nova', valeurs: [5, 5, 5, 5],
      phrase: 'Je ne ferme aucune porte, je veux être utile.', quand: 'Septembre 2026 · France Inter',
      annees: ['aucune candidature'], justice: 'Aucune procédure recensée.',
      blocSource: 'ni parti, ni candidature (règle 3, à valider)', %s
      sources: [
        ['La Gazette (AFP)', 'https://www.lagazettefrance.fr/article/vacances-luxueuses-primaire-les-ambitions-presidentielles-de-pigasse-contrariees'],
        ['La Gazette (« prêt »)', 'https://www.lagazettefrance.fr/article/en-debat-avec-bompard-pigasse-affiche-ses-convergences-avec-lfi']
      ]
    },""" % V, """    {
      nom: 'Thierry Breton', bloc: 'Divers', image: 'img/breton-couleur.webp',
      etiquette: 'Pas déclaré', tampon: 'Porte entrouverte',
      role: 'Ancien commissaire européen · ancien ministre de l’Économie', valeurs: [5, 5, 5, 5],
      phrase: 'Si ce n’est pas le cas, on verra. Je ne ferme pas la porte.', quand: '9 novembre 2026 · France Inter',
      annees: ['aucune candidature'], justice: 'Aucune procédure recensée.',
      blocSource: 'ni parti dans la grille, ni candidature depuis 2020 (règle 3, à valider)', %s
      sources: [
        ['JDD', 'https://www.lejdd.fr/politique/on-va-voir-ce-qui-emerge-thierry-breton-nexclut-pas-une-candidature-a-la-presidentielle-188253'],
        %s
      ]
    },""" % (V, LCP_LISTE), """    {
      nom: 'Christine Lagarde', bloc: 'Divers', image: 'img/lagarde-couleur.webp',
      etiquette: 'Pas déclarée', tampon: 'Quitte la BCE le 7&nbsp;févr.',
      role: 'Présidente de la BCE · ancienne ministre de l’Économie', valeurs: [5, 5, 5, 5],
      phrase: 'Je ne suis candidate à rien, mais je tiens beaucoup à ce que l’Europe soit protégée.', quand: '9 juillet 2026 · Euronews',
      annees: ['aucune candidature'],
      justice: 'Reconnue coupable de négligence par la Cour de justice de la République (2016, arbitrage Tapie), mais dispensée de peine.',
      blocSource: 'ni parti, ni candidature depuis 2020 (règle 3, à valider)', %s
      sources: [
        ['Euronews', 'https://fr.euronews.com/2026/07/09/je-ne-suis-pas-candidate-lagarde-a-euronews-dans-le-contexte-de-la-presidentielle'],
        ['LCP (départ de la BCE)', 'https://lcp.fr/actualites/christine-lagarde-annonce-son-depart-anticipe-de-la-banque-centrale-europeenne-444496'],
        ['Public Sénat (procès)', 'https://www.publicsenat.fr/actualites/non-classe/proces-lagarde-les-grandes-dates-de-l-arbitrage-tapie-52092']
      ]
    },""" % V, """    {
      nom: 'Michel‑Édouard Leclerc', bloc: 'Divers', image: 'img/leclerc-couleur.webp',
      etiquette: 'Pas déclaré', tampon: 'N’exclut rien',
      role: 'Président du comité stratégique des centres E.Leclerc', valeurs: [5, 5, 5, 5],
      phrase: 'Je n’exclus pas l’idée d’être candidat à la présidentielle.', quand: '14 juin 2026 · CNews',
      annees: ['aucune candidature'], justice: 'Aucune procédure recensée.',
      blocSource: 'ni parti, ni candidature (règle 3, à valider)', %s
      sources: [
        ['L’Essentiel de l’éco', 'https://lessentieldeleco.fr/7789-combien-gagne-michel-edouard-leclerc-2/'],
        ['Sud Radio (Ifop)', 'https://www.sudradio.fr/ifop/personnalites-politiques-preferees-michel-edouard-leclerc-indetronable-depuis-3-mois']
      ]
    },""" % V],
 'Nicolas Dupont‑Aignan': ["""    {
      nom: 'François Asselineau', bloc: 'Droite', image: 'img/asselineau-couleur.webp',
      etiquette: 'Candidat · mars 2026', tampon: '2<sup>e</sup> candidature',
      role: 'Président de l’Union populaire républicaine', valeurs: [5, 5, 5, 5],
      phrase: 'Je suis confiant sur le fait que nous aurons une percée en 2027, si je suis candidat à la présidentielle.', quand: '18 septembre 2025 · Sud Radio',
      annees: ['2017', '2027'],
      justice: 'Renvoyé devant le tribunal correctionnel de Paris (mai 2026) pour harcèlement et agression sexuels sur un ex-collaborateur, et tentative sur un autre, après un non-lieu infirmé. Il conteste&nbsp;; présumé innocent.',
      blocSource: 'nuance DSV aux législatives 2024 (règle 2, à valider)', %s
      sources: [
        ['Brut (AFP)', 'https://www.brut.media/fr/articles/agression-et-harcelement-sexuels-francois-asselineau-renvoye-en-proces'],
        ['Sud Radio (citation)', 'https://www.sudradio.fr/sud-radio/asselineau-nous-ne-sommes-pas-des-souverainistes'],
        %s
      ]
    },""" % (V, LCP_LISTE)],
 'Laurent Wauquiez': ["""    {
      nom: 'François Baroin', bloc: 'Droite', image: 'img/baroin-couleur.webp',
      etiquette: 'Pas déclaré', tampon: 'Soutient Retailleau',
      role: 'Maire de Troyes · ancien ministre de l’Économie', valeurs: [5, 5, 5, 5],
      phrase: 'Bruno Retailleau a toutes les qualités pour créer les conditions de la surprise du premier tour et du rassemblement nécessaire du second.', quand: '8 octobre 2026 · Public Sénat',
      annees: ['aucune candidature'], justice: 'Aucune procédure recensée.',
      blocSource: 'nuancier 2026 (LR)', %s
      sources: [
        ['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/presidentielle-2027-francois-baroin-assure-que-bruno-retailleau-a-toutes-les-qualites-pour-creer-les-conditions-de-la-surprise-du-premier-tour'],
        ['Intérieur (Troyes 2026)', 'https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/44/10/10387/index.html']
      ]
    },""" % V],
 'Gérald Darmanin': ["""    {
      nom: 'Jean Castex', bloc: 'Droite', image: 'img/castex-couleur.webp',
      etiquette: 'Pas candidat · juil. 2026', tampon: 'Pas dans son horizon',
      role: 'PDG de la SNCF · ancien Premier ministre', valeurs: [5, 5, 5, 5],
      phrase: 'Personne ne peut jamais fermer la porte à rien.', quand: '1<sup>er</sup> juillet 2026 · France Inter',
      annees: ['aucune candidature'],
      justice: 'Enquête préliminaire pour faux et détournement de fonds publics sans enrichissement personnel (aide de 2017-2018 de la communauté de communes qu’il présidait)&nbsp;: garde à vue en novembre 2025, ressorti libre. Issue non connue&nbsp;; présumé innocent.',
      blocSource: 'maire LR de Prades à sa dernière candidature, 2020 (règle 2, à valider)', %s
      sources: [
        ['La Gazette (AFP)', 'https://www.lagazettefrance.fr/article/castex-n-a-pas-la-presidentielle-dans-son-horizon'],
        ['Brut (AFP)', 'https://www.brut.media/fr/articles/lancien-premier-ministre-jean-castex-en-garde-a-vue']
      ]
    },""" % V],
 'Éric Zemmour': ["""    {
      nom: 'Florian Philippot', bloc: 'Extrême droite', image: 'img/philippot-couleur.webp',
      etiquette: 'Candidat · mai 2026', tampon: 'Sauf si Villiers',
      role: 'Président des Patriotes · ancien député européen', valeurs: [5, 5, 5, 5],
      phrase: 'C’est Philippe de Villiers qui incarne possiblement ce rassemblement anti-UE et anti-Otan.', quand: '9 mai 2026 · France&nbsp;2',
      annees: ['2027'], justice: 'Aucune procédure recensée.',
      blocSource: 'nuancier 2026 (Les Patriotes)', %s
      sources: [
        ['Sud Radio (AFP)', 'https://www.sudradio.fr/politique/je-suis-candidat-florian-philippot-se-lance-pour-la-presidentielle-de-2027'],
        %s
      ]
    },""" % (V, LCP_LISTE)],
}

for apres, blocs in CARTES.items():
    i = t.index("nom: '%s'" % apres)
    m = re.compile(r"\n    \}(,?)\n").search(t, i)
    assert m.group(1) == ',', apres
    fin = m.end()
    t = t[:fin] + '\n'.join(blocs) + '\n' + t[fin:]

# Darmanin : même signalement BriefCam, classé sans suite → tableau public (pas sur la carte)
i = t.index("nom: 'Gérald Darmanin'")
j = t.index("      ],\n      sources:", i)
assert t[i:j].count('horsCarte') == 1
avant = t[:j].rstrip('\n')
assert avant.endswith(']]]'), avant[-40:]
t = avant + ',\n        ' + BRIEFCAM + '\n' + t[j:]

open(F, 'w', encoding='utf-8').write(t)
noms = re.findall(r"nom: '([^']+)', bloc:", t)
print(len(noms), 'cartes candidat')
print(noms)
