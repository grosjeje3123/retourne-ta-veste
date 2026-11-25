# Insère les 8 cartes de la vague 1 dans bloc_donnees.js, chacune après la carte de son bloc qui la précède.
import re
F = '/home/claude/valeurs/bloc_donnees.js'
t = open(F, encoding='utf-8').read()
V = "verifie: '19/11/2026',"
CARTES = {
 'Raphaël Glucksmann': ["""    {
      nom: 'François Hollande', bloc: 'Gauche', image: 'img/hollande-couleur.webp',
      etiquette: 'Pas encore déclaré', tampon: 'En embuscade',
      role: 'Ancien président de la République · député de Corrèze', valeurs: [5, 5, 5, 5],
      phrase: 'Comment être utile aujourd’hui&nbsp;? En me préparant.', quand: '15 avril 2026 · Marianne',
      annees: ['2012', '2027&nbsp;?'], justice: 'Aucune procédure recensée.',
      blocSource: 'nuancier 2026 (PS)', %s
      sources: [
        ['LCP (statut)', 'https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-declares-et-potentiels-444932'],
        ['LCP (Marianne)', 'https://lcp.fr/actualites/francois-hollande-lui-candidat-comment-il-accelere-en-coulisses-pour-la-presidentielle'],
        ['Élysée', 'https://www.elysee.fr/en/francois-hollande']
      ]
    },""" % V, """    {
      nom: 'Clémentine Autain', bloc: 'Gauche', image: 'img/autain-couleur.webp',
      etiquette: 'A renoncé · juil. 2026', tampon: 'Hors course',
      role: 'Députée de Seine-Saint-Denis', valeurs: [5, 5, 5, 5],
      phrase: 'Est-ce que je vais ajouter une candidature de plus&nbsp;? La réponse est non.', quand: '11 juillet 2026 · dépêche AFP',
      annees: ['aucune candidature'], justice: 'Aucune procédure recensée.',
      blocSource: 'nuance UG aux législatives 2024 (règle à valider)', %s
      sources: [
        ['AFP (via jeanmarcmorandini.com)', 'https://www.jeanmarcmorandini.com/node/646423'],
        ['Slate', 'https://www.slate.fr/politique/election-presidentielle-2027-liste-candidats-declares-interesses-primaire-gauche-droite-extreme-lfi-rn-lr-ps-macron'],
        ['Datan', 'https://datan.fr/deputes/seine-saint-denis-93/depute_clementine-autain']
      ]
    },""" % V],
 'Édouard Philippe': ["""    {
      nom: 'Aurore Bergé', bloc: 'Centre', image: 'img/berge-couleur.webp',
      etiquette: 'Pas déclarée', tampon: 'Pour une primaire',
      role: 'Ministre déléguée à l’Égalité femmes-hommes', valeurs: [5, 5, 5, 5],
      phrase: 'Il faut une primaire à l’automne.', quand: '30 mars 2026 · Public Sénat',
      annees: ['aucune candidature'],
      justice: 'Information judiciaire de la Cour de justice de la République (janv. 2025) pour faux témoignage devant la commission d’enquête sur les crèches&nbsp;: témoin assistée, puis non-lieu le 2 juillet 2026.',
      blocSource: 'nuancier 2026 (Renaissance)', %s
      sources: [
        ['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/union-de-la-droite-et-du-centre-il-faut-une-primaire-a-lautomne-plaide-aurore-berge'],
        ['Europe&nbsp;1 (non-lieu)', 'https://www.europe1.fr/node/964860'],
        ['La Gazette (AFP)', 'https://www.lagazettefrance.fr/article/soupcons-de-faux-temoignage-sur-les-creches-non-lieu-en-faveur-d-aurore-berge']
      ]
    },""" % V],
 'Natacha Polony': ["""    {
      nom: 'Juan Branco', bloc: 'Divers', image: 'img/branco-couleur.webp',
      etiquette: 'Candidat · déc. 2025', tampon: '1<sup>re</sup> candidature',
      role: 'Avocat et essayiste · mouvement Les Ruches', valeurs: [5, 5, 5, 5],
      phrase: 'Je pense qu’il faut se préparer à la sortie de l’Union européenne.', quand: '19 décembre 2025 · Sud Radio',
      annees: ['2027'],
      justice: 'Mis en examen pour viol (faits de 2021) et pour des faits dénoncés par deux autres femmes. Août 2026&nbsp;: le parquet requiert un procès pour le viol de 2021, un non-lieu pour le reste&nbsp;; le juge doit trancher. Il conteste&nbsp;; présumé innocent.',
      blocSource: 'Les Ruches hors grille, dernière candidature en 2017 (règle à valider)', %s
      sources: [
        ['Sud Radio', 'https://www.sudradio.fr/sud-radio/lavocat-juan-branco-candidat-a-la-presidentielle'],
        ['Sud Radio (AFP, justice)', 'https://www.sudradio.fr/societe/le-parquet-de-paris-requiert-le-renvoi-en-proces-pour-viol-de-lavocat-juan-branco'],
        ['JusticeInfo', 'https://www.justiceinfo.net/fr/164381-france-le-parquet-veut-que-lavocat-franco-espagnol-juan-branco-soit-juge-pour-viol.html']
      ]
    },""" % V, """    {
      nom: 'Jean Lassalle', bloc: 'Divers', image: 'img/lassalle-couleur.webp',
      etiquette: 'Cagnotte · juil. 2026', tampon: '3<sup>e</sup> candidature&nbsp;?',
      role: 'Ancien député · président de Résistons&nbsp;!', valeurs: [5, 5, 5, 5],
      phrase: 'Je verrai à l’automne ce que donne la cagnotte, si elle me permet d’y aller.', quand: 'Juillet 2026 · appel aux dons, rapporté par Europe&nbsp;1',
      annees: ['2017', '2022', '2027&nbsp;?'],
      justice: 'Enquête préliminaire ouverte en mai 2023 par le parquet de Bordeaux pour viol et agression sexuelle, sur plainte (faits allégués de 2010, «&nbsp;pour l’heure non confirmés&nbsp;» selon le parquet). Issue non connue à ce jour. Présumé innocent.',
      blocSource: 'Résistons&nbsp;! hors grille&nbsp;; dernière candidature&nbsp;: liste Alliance rurale, européennes 2024 (règle à valider)', %s
      sources: [
        ['Europe&nbsp;1 (cagnotte)', 'https://www.europe1.fr/node/970134'],
        ['Pleinchamp', 'https://www.pleinchamp.com/actualite/jean-lassalle-agriculteurs-reprenez-vos-reves.-parce-que-les-reves-ca-permet-de-sortir-du-cauchemar'],
        ['Europe&nbsp;1 (enquête)', 'https://www.europe1.fr/node/60264']
      ]
    },""" % V],
 'Nicolas Dupont‑Aignan': ["""    {
      nom: 'Xavier Bertrand', bloc: 'Droite', image: 'img/bertrand-couleur.webp',
      etiquette: 'Prétendant · août 2026', tampon: '1<sup>re</sup> candidature&nbsp;?',
      role: 'Président de la région Hauts-de-France', valeurs: [5, 5, 5, 5],
      phrase: 'Je serai un candidat à la place, pas un candidat de plus.', quand: '27 août 2026 · rencontre des entrepreneurs du Medef',
      annees: ['2027&nbsp;?'], justice: 'Aucune procédure recensée.',
      blocSource: 'nuancier 2026 (LR)', %s
      sources: [
        ['LCP (Medef)', 'https://lcp.fr/actualites/2027-figure-de-la-droite-xavier-bertrand-confirme-qu-il-sera-candidat-a-l-election'],
        ['LCP (statut)', 'https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-declares-et-potentiels-444932'],
        ['Slate', 'https://www.slate.fr/politique/election-presidentielle-2027-liste-candidats-declares-interesses-primaire-gauche-droite-extreme-lfi-rn-lr-ps-macron']
      ]
    },""" % V],
 'Éric Zemmour': ["""    {
      nom: 'Jordan Bardella', bloc: 'Extrême droite', image: 'img/bardella-couleur.webp',
      etiquette: 'Plan B · avr. 2025', tampon: 'Si Le Pen empêchée',
      role: 'Président du RN · député européen', valeurs: [5, 5, 5, 5],
      phrase: 'Si elle devait être empêchée demain, je pense pouvoir vous dire que je serai son candidat.', quand: 'Avril 2025 · Le Parisien',
      annees: ['2027&nbsp;?'], justice: 'Aucune procédure le visant recensée.',
      blocSource: 'nuancier 2026 (RN)', %s
      sources: [
        ['Europe&nbsp;1 (Le Parisien)', 'https://www.europe1.fr/node/708835'],
        ['Landot (JO, européennes)', 'https://blog.landot-avocats.net/2024/06/13/proclamation-des-resultats-de-lelection-des-representants-au-parlement-europeen/'],
        ['HATVP', 'https://www.hatvp.fr/livraison/dossiers/bardella-jordan-dim33673-europe.pdf']
      ]
    },""" % V, """    {
      nom: 'Sarah Knafo', bloc: 'Extrême droite', image: 'img/knafo-couleur.webp',
      etiquette: 'Pas candidate · janv. 2026', tampon: 'Hors course',
      role: 'Députée européenne · élue du 16<sup>e</sup> arrondissement de Paris', valeurs: [5, 5, 5, 5],
      phrase: 'C’est un travail à plein temps.', quand: '7 janvier 2026 · TF1, à propos de la mairie de Paris',
      annees: ['aucune candidature'], justice: 'Aucune procédure recensée.',
      blocSource: 'nuancier 2026 (Reconquête)', %s
      sources: [
        ['Europe&nbsp;1', 'https://www.europe1.fr/politique/municipales-2026-a-paris-leurodeputee-reconquete-sarah-knafo-officialise-sa-candidature-877873'],
        ['Intérieur (Paris)', 'https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/11/75/75056/index.html'],
        ['Intérieur (16<sup>e</sup>)', 'https://www.resultats-elections.interieur.gouv.fr/ConseilsdarrondissementPLM2026/ensemble_geographique/11/75/75056SR16/rappel_candidature/1/6.html']
      ]
    },""" % V],
}
for apres, blocs in CARTES.items():
    i = t.index("nom: '%s'" % apres)
    # fin de l'objet : la première ligne "    }" (suivie de "," ou de "\n  ];") après i
    m = re.compile(r"\n    \}(,?)\n").search(t, i)
    fin = m.end()
    ajout = '\n'.join(blocs) + '\n'
    if m.group(1) == '':   # dernier élément du tableau : ajouter la virgule manquante
        t = t[:m.start()] + '\n    },\n' + ajout.rstrip(',\n') + '\n' + t[fin:]
    else:
        t = t[:fin] + ajout + t[fin:]
open(F, 'w', encoding='utf-8').write(t)
noms = re.findall(r"nom: '([^']+)', bloc:", t)
print(len(noms), noms)
