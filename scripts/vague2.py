# Insère les 7 cartes de la vague 2 dans bloc_donnees.js, chacune après la carte de son bloc qui la précède,
# et applique la convention « hors carte » (affaire close en faveur de la personne) à la carte d'Aurore Bergé.
import re
F = '/home/claude/valeurs/bloc_donnees.js'
t = open(F, encoding='utf-8').read()
V = "verifie: '19/11/2026',"
PS_RESULTATS = "['Public Sénat (résultats)', 'https://www.publicsenat.fr/actualites/politique/primaire-de-la-gauche-raphael-glucksmann-plie-le-match-et-remporte-le-scrutin-des-le-premier-tour-avec-66']"
CARTES = {
 'Marine Tondelier': ["""    {
      nom: 'Sandrine Rousseau', bloc: 'Gauche', image: 'img/rousseau-couleur.webp',
      etiquette: 'Pas déclarée', tampon: 'Pro-alliance LFI',
      role: 'Députée de Paris', valeurs: [5, 5, 5, 5],
      phrase: 'Je prône l’alliance vers LFI.', quand: '22 août 2026 · franceinfo',
      annees: ['aucune candidature'], justice: 'Aucune procédure recensée.',
      blocSource: 'nuancier 2026 (Les Écologistes)', %s
      sources: [
        ['franceinfo', 'https://www.franceinfo.fr/politique/eelv/primaire-eelv/'],
        ['Public Sénat (statut)', 'https://www.publicsenat.fr/actualites/politique/presidentielle-2027-les-ecologistes-reportent-lheure-du-choix-a-decembre-marine-tondelier-toujours-en-lice'],
        ['Toluna Harris Interactive (pressentie)', 'https://tolunacorporate.com/wp-content/uploads/2026/04/Rapport-Toluna-Suivi-du-potentiel-de-vote-a-la-presidentielle-Commstrat-V6-Avril-2026.pdf']
      ]
    },""" % V],
 'Clémentine Autain': ["""    {
      nom: 'Ségolène Royal', bloc: 'Gauche', image: 'img/royal-couleur.webp',
      etiquette: 'Primaire perdue · oct. 2026', tampon: 'Hors course',
      role: 'Ancienne ministre · ex-présidente de Poitou-Charentes', valeurs: [5, 5, 5, 5],
      phrase: 'La France tranquille et l’ordre juste.', quand: 'Juillet 2026 · campagne de la primaire, Brut',
      annees: ['2007'], justice: 'Aucune procédure recensée.',
      blocSource: 'nuancier 2026 (PS)', %s
      sources: [
        ['LCP (candidature)', 'https://lcp.fr/actualites/presidentielle-2027-segolene-royal-annonce-sa-candidature-a-la-primaire-socialiste'],
        %s,
        ['Brut', 'https://www.brut.media/fr/articles/france/politique/presidentielle-2027-segolene-royal-annonce-sa-participation-a-la-primaire-de-l-espace-socialiste']
      ]
    },""" % (V, PS_RESULTATS), """    {
      nom: 'Olivier Faure', bloc: 'Gauche', image: 'img/faure-couleur.webp',
      etiquette: 'Primaire perdue · oct. 2026', tampon: 'Hors course',
      role: 'Premier secrétaire du PS · député de Seine-et-Marne', valeurs: [5, 5, 5, 5],
      phrase: 'Nous avons désormais un candidat…', quand: '11 octobre 2026 · soir de la primaire',
      annees: ['aucune candidature'], justice: 'Aucune procédure recensée.',
      blocSource: 'nuancier 2026 (PS)', %s
      sources: [
        ['Sud Radio (AFP)', 'https://www.sudradio.fr/societe/olivier-faure-candidat-a-la-primaire-de-la-gauche'],
        ['LCP (réactions)', 'https://lcp.fr/actualites/victoire-de-raphael-glucksmann-a-la-primaire-socialiste-premieres-reactions-des'],
        %s
      ]
    },""" % (V, PS_RESULTATS), """    {
      nom: 'Jérôme Guedj', bloc: 'Gauche', image: 'img/guedj-couleur.webp',
      etiquette: 'Primaire perdue · oct. 2026', tampon: 'Hors course',
      role: 'Député de l’Essonne', valeurs: [5, 5, 5, 5],
      phrase: 'Il y a un espace pour une tonitruance socialiste.', quand: '5 février 2026 · France Inter',
      annees: ['aucune candidature'], justice: 'Aucune procédure recensée.',
      blocSource: 'nuancier 2026 (PS)', %s
      sources: [
        ['Brut (candidature)', 'https://www.brut.media/fr/articles/le-depute-jerome-guedj-ps-annonce-sa-candidature-a-lelection-presidentielle-de-2027-sans-passer-par-la-primaire'],
        ['LCP', 'https://lcp.fr/actualites/presidentielle-2027-qui-sera-sur-la-ligne-de-depart-de-la-primaire-sociale-democrate-en'],
        %s
      ]
    },""" % (V, PS_RESULTATS)],
 'Jean Lassalle': ["""    {
      nom: 'Delphine Batho', bloc: 'Divers', image: 'img/batho-couleur.webp',
      etiquette: 'Candidate · nov. 2025', tampon: '1<sup>re</sup> candidature',
      role: 'Députée des Deux-Sèvres · Génération écologie', valeurs: [5, 5, 5, 5],
      phrase: 'L’écologie est en voie de rikikisation, si j’ose dire.', quand: '25 novembre 2025 · L’Obs',
      annees: ['2027'], justice: 'Aucune procédure recensée.',
      blocSource: 'Génération écologie hors grille, nuance ECO en 2024 (règle 2, à valider)', %s
      sources: [
        ['L’info durable (AFP)', 'https://www.linfodurable.fr/lex-ministre-delphine-batho-candidate-la-presidentielle-pour-conjurer-la-rikikisation-de-lecologie'],
        ['Datan', 'https://datan.fr/deputes/deux-sevres-79/depute_delphine-batho'],
        ['Nuance 2024 (annuaire-mairie)', 'https://www.annuaire-mairie.fr/elections-legislatives-nanteuil.html']
      ]
    },""" % V],
 'Xavier Bertrand': ["""    {
      nom: 'Laurent Wauquiez', bloc: 'Droite', image: 'img/wauquiez-couleur.webp',
      etiquette: 'Pas déclaré', tampon: 'Hors course',
      role: 'Président du groupe Droite républicaine à l’Assemblée', valeurs: [5, 5, 5, 5],
      phrase: '… pour être ce guerrier du rassemblement.', quand: 'Juillet 2026 · Le Figaro',
      annees: ['aucune candidature'],
      justice: 'Enquête préliminaire du PNF ouverte à l’automne 2020 sur ses collaborateurs à la Région, élargie fin 2024 à une étude d’opinion le concernant commandée par la Région. Issue non connue à ce jour&nbsp;; présumé innocent.',
      blocSource: 'nuancier 2026 (LR)', %s
      sources: [
        ['Lyon Capitale (statut)', 'https://www.lyoncapitale.fr/?p=501731'],
        ['AFP (Le Figaro)', 'https://www.boursedirect.fr/fr/actualites/categorie/politique/presidentielle-wauquiez-porte-un-coup-a-la-candidature-de-retailleau-en-tendant-la-main-a-philippe-afp-88833e6f3077761451ca93dfccafb0c40b3eb503'],
        ['Lyon Capitale (PNF)', 'https://www.lyoncapitale.fr/actualite/etude-d-opinion-financee-par-la-region-aura-laurent-wauquiez-de-nouveau-dans-le-viseur-du-pnf']
      ]
    },""" % V, """    {
      nom: 'Gérald Darmanin', bloc: 'Droite', image: 'img/darmanin-couleur.webp',
      etiquette: 'Pas candidat · août 2026', tampon: 'Soutient Philippe',
      role: 'Garde des Sceaux, ministre de la Justice', valeurs: [5, 5, 5, 5],
      phrase: 'J’ai décidé de ne pas rajouter de la division.', quand: '17 août 2026 · annonce de son soutien',
      annees: ['aucune candidature'], justice: 'Aucune procédure recensée.',
      blocSource: 'en retrait de Renaissance, liste divers droite aux municipales 2026 (règle 2, à valider)', %s
      sources: [
        ['LCP', 'https://lcp.fr/actualites/presidentielle-2027-gerald-darmanin-ne-sera-pas-candidat-et-soutient-edouard-philippe'],
        ['Brut (Renaissance)', 'https://www.brut.media/fr/articles/darmanin-denonce-aupres-dattal-les-aventures-individuelles-et-prematurees-pour-lelysee'],
        ['Intérieur (Tourcoing 2026)', 'https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/32/59/59599/rappel_candidature/2/5.html']
      ]
    },""" % V],
}
for apres, blocs in CARTES.items():
    i = t.index("nom: '%s'" % apres)
    m = re.compile(r"\n    \}(,?)\n").search(t, i)
    assert m.group(1) == ',', apres
    fin = m.end()
    t = t[:fin] + '\n'.join(blocs) + '\n' + t[fin:]

# Aurore Bergé : non-lieu du 2 juillet 2026 → hors carte (comme Polony) ; la trace reste dans le registre.
ancien = """      justice: 'Information judiciaire de la Cour de justice de la République (janv. 2025) pour faux témoignage devant la commission d’enquête sur les crèches&nbsp;: témoin assistée, puis non-lieu le 2 juillet 2026.',"""
assert ancien in t
t = t.replace(ancien, "      justice: 'Aucune procédure recensée.',")
ancien_src = """        ['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/union-de-la-droite-et-du-centre-il-faut-une-primaire-a-lautomne-plaide-aurore-berge'],
        ['Europe&nbsp;1 (non-lieu)', 'https://www.europe1.fr/node/964860'],
        ['La Gazette (AFP)', 'https://www.lagazettefrance.fr/article/soupcons-de-faux-temoignage-sur-les-creches-non-lieu-en-faveur-d-aurore-berge']
      ]"""
assert ancien_src in t
t = t.replace(ancien_src, """        ['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/union-de-la-droite-et-du-centre-il-faut-une-primaire-a-lautomne-plaide-aurore-berge']
      ]""")
open(F, 'w', encoding='utf-8').write(t)
noms = re.findall(r"nom: '([^']+)', bloc:", t)
print(len(noms), noms)
