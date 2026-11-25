import json
bloc = open('/home/claude/valeurs/bloc_donnees.js', encoding='utf-8').read()
vals = json.load(open('/home/claude/valeurs/valeurs.json'))
voix = json.load(open('/home/claude/valeurs/voix.json'))
noms = list(vals.keys())
parts = bloc.split("valeurs: [5, 5, 5, 5]")
assert len(parts) == len(noms) + 1, (len(parts), len(noms))
out = parts[0]
for i, n in enumerate(noms):
    out += "valeurs: [%d, %d, %d, %d]" % tuple(vals[n]['valeurs']) + parts[i+1]
out = out.replace("pouvoir: '<b>Planification.</b> Regarde les trois cartes du dessus de la pioche et range-les à ta guise.',",
                  "pouvoir: '<b>Planification.</b> Regarde les trois cartes du dessus de la pioche et échanges-en une avec ta main.',")
assert 'échanges-en une avec ta main' in out
out = out.replace("\n  ", "\n").lstrip()
SRC_MANDATS = {
 'Nathalie Arthaud': [['Sud Radio', 'https://www.sudradio.fr/la-biographie-et-le-cv-de-nathalie-arthaud']],
 'Jean-Luc Mélenchon': [['Sud Radio', 'https://www.sudradio.fr/la-biographie-et-le-cv-de-jean-luc-melenchon'], ['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/jean-luc-melenchon-quitte-l-assemblee-retour-sur-trente-ans-de-mandats']],
 'Fabien Roussel': [['Sud Radio', 'https://www.sudradio.fr/la-biographie-et-le-cv-de-fabien-roussel']],
 'François Ruffin': [['Sud Radio', 'https://www.sudradio.fr/la-biographie-et-le-cv-de-francois-ruffin']],
 'Marine Tondelier': [['Sud Radio', 'https://www.sudradio.fr/la-biographie-et-le-cv-de-marine-tondelier']],
 'Raphaël Glucksmann': [['Sud Radio', 'https://www.sudradio.fr/la-biographie-et-le-cv-de-raphael-glucksmann']],
 'Gabriel Attal': [['info.gouv.fr', 'https://www.info.gouv.fr/les-anciens-premiers-et-premieres-ministres-de-la-ve-republique/gabriel-attal'], ['Intérieur 2026', 'https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/11/92/92075/rappel_candidature/1/1.html']],
 'Édouard Philippe': [['info.gouv.fr', 'https://www.info.gouv.fr/les-anciens-premiers-et-premieres-ministres-de-la-ve-republique/edouard-philippe'], ['Sud Radio', 'https://www.sudradio.fr/la-biographie-et-le-cv-dedouard-philippe']],
 'Dominique de Villepin': [['Universalis', 'https://www.universalis.fr/encyclopedie/dominique-de-villepin/'], ['Larousse', 'https://www.larousse.fr/encyclopedie/personnage/wd/149004']],
 'Teddy Riner': [['LCP', 'https://lcp.fr/actualites/le-judoka-teddy-riner-annonce-sa-candidature-a-l-election-presidentielle-de-2027-444920']],
 'Natacha Polony': [['LCP', 'https://lcp.fr/actualites/natacha-polony-annonce-sa-candidature-a-l-election-presidentielle-443808']],
 'Bruno Retailleau': [['info.gouv.fr', 'https://www.info.gouv.fr/personnalite/bruno-retailleau'], ['Sénat', 'https://senat.fr/senateur/retailleau_bruno04033b.html']],
 'David Lisnard': [['Votons 2027', 'https://votons-2027.fr/candidats/lisnard'], ['Intérieur 2026', 'https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/93/06/06029/']],
 'Nicolas Dupont-Aignan': [['Sud Radio', 'https://www.sudradio.fr/la-biographie-et-le-cv-de-nicolas-dupont-aignan']],
 'Marine Le Pen': [['Sud Radio', 'https://www.sudradio.fr/la-biographie-de-marine-le-pen'], ['Conseil d’État', 'https://www.conseil-etat.fr/Media/actualites/documents/2025/novembre-2025/cp_execution_provisoire_web.pdf']],
 'Éric Zemmour': [['Public Sénat', 'https://www.publicsenat.fr/actualites/politique/legislatives-eric-zemmour-elimine-des-le-1er-tour-213118']],
 'François Hollande': [['Élysée', 'https://www.elysee.fr/en/francois-hollande'], ['Sud Radio', 'https://www.sudradio.fr/la-biographie-et-le-cv-de-francois-hollande']],
 'Clémentine Autain': [['Datan', 'https://datan.fr/deputes/seine-saint-denis-93/depute_clementine-autain'], ['Politis', 'https://www.politis.fr/articles/2026/01/clementine-autain-nous-devons-avoir-le-discours-dune-gauche-decomplexee/']],
 'Aurore Bergé': [['HATVP', 'https://www.hatvp.fr/livraison/dossiers/berge-aurore-di34865-gouvernement.pdf'], ['Wikipédia (en)', 'https://en.wikipedia.org/wiki/Aurore_Berg%C3%A9']],
 'Juan Branco': [['Public Sénat', 'https://www.publicsenat.fr/article/politique/legislatives-un-avocat-de-wikileaks-insoumis-laboure-le-9-3-61008']],
 'Jean Lassalle': [['Sud Radio', 'https://www.sudradio.fr/la-biographie-et-le-cv-de-jean-lassalle'], ['Wikipédia (en)', 'https://en.wikipedia.org/wiki/Jean_Lassalle']],
 'Xavier Bertrand': [['Sud Radio', 'https://www.sudradio.fr/la-biographie-et-le-cv-de-xavier-bertrand']],
 'Jordan Bardella': [['HATVP', 'https://www.hatvp.fr/livraison/dossiers/bardella-jordan-dim33673-europe.pdf']],
 'Sarah Knafo': [['Intérieur (16e)', 'https://www.resultats-elections.interieur.gouv.fr/ConseilsdarrondissementPLM2026/ensemble_geographique/11/75/75056SR16/rappel_candidature/1/6.html'], ['Wikipédia (en)', 'https://en.wikipedia.org/wiki/Sarah_Knafo']],
 'Ségolène Royal': [['Sud Radio', 'https://www.sudradio.fr/la-biographie-et-le-cv-de-segolene-royal'], ['Wikipédia (région)', 'https://fr.wikipedia.org/wiki/S%C3%A9gol%C3%A8ne_Royal']],
 'Olivier Faure': [['Sud Radio', 'https://www.sudradio.fr/la-biographie-et-le-cv-dolivier-faure']],
 'Jérôme Guedj': [['Sud Radio', 'https://www.sudradio.fr/la-biographie-et-le-cv-de-jerome-guedj'], ['Wikipédia (en)', 'https://en.wikipedia.org/wiki/J%C3%A9r%C3%B4me_Guedj']],
 'Sandrine Rousseau': [['Datan', 'https://datan.fr/deputes/paris-75/depute_sandrine-rousseau'], ['Wikipédia (en)', 'https://en.wikipedia.org/wiki/Sandrine_Rousseau']],
 'Delphine Batho': [['Wikipédia (en)', 'https://en.wikipedia.org/wiki/Delphine_Batho'], ['Datan', 'https://datan.fr/deputes/deux-sevres-79/depute_delphine-batho']],
 'Laurent Wauquiez': [['Sud Radio', 'https://www.sudradio.fr/la-biographie-et-le-cv-de-laurent-wauquiez'], ['Lyon Capitale', 'https://www.lyoncapitale.fr/?p=405636']],
 'Gérald Darmanin': [['Wikipédia (en)', 'https://en.wikipedia.org/wiki/G%C3%A9rald_Darmanin'], ['info.gouv.fr', 'https://www.info.gouv.fr/personnalite/gerald-darmanin'], ['HATVP', 'https://www.hatvp.fr/livraison/dossiers/darmanin-gerald-di34806-gouvernement.pdf'], ['Intérieur 2026', 'https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/32/59/59599/rappel_candidature/2/5.html']],
}
REMARQUES = {
 'Aurore Bergé': 'Conseil municipal de Magny-les-Hameaux&nbsp;: élue en 2014, date de départ non trouvée, comptée jusqu’en 2017 (dernière mention).',
 'Ségolène Royal': 'Conseil municipal de Trouville-sur-Mer&nbsp;: 1983-1986, mois de départ non précisé, compté jusqu’en mars 1986.',
 'Olivier Faure': 'Buzz&nbsp;: l’article Wikipédia a été renommé en août 2026, les vues des deux titres sont additionnées mois par mois.',
 'Gérald Darmanin': 'Conseil régional du Nord-Pas-de-Calais&nbsp;: 2010-2012 selon le gouvernement, 2010-2014 selon Wikipédia&nbsp;; la durée la plus courte est retenue.',
}
methode = []
for n in noms:
    b = vals[n]['brut']; vx = voix[n]
    methode.append({'voix': vx[0], 'election': vx[1], 'voixSource': [vx[2], vx[3]],
                    'national': round(b['national'] / 12, 1), 'local': round(b['local'] / 12, 1),
                    'vues': b['vues'], 'devance': vals[n]['devance'], 'mandatsSources': SRC_MANDATS[n],
                    **({'remarque': REMARQUES[n]} if n in REMARQUES else {})})
COURT = {'Nathalie Arthaud': 'Arthaud', 'Jean-Luc Mélenchon': 'Mélenchon', 'Fabien Roussel': 'Roussel', 'François Ruffin': 'Ruffin',
         'Marine Tondelier': 'Tondelier', 'Raphaël Glucksmann': 'Glucksmann', 'François Hollande': 'Hollande', 'Clémentine Autain': 'Autain',
         'Gabriel Attal': 'Attal', 'Édouard Philippe': 'Philippe', 'Aurore Bergé': 'Bergé', 'Dominique de Villepin': 'Villepin',
         'Teddy Riner': 'Riner', 'Natacha Polony': 'Polony', 'Juan Branco': 'Branco', 'Jean Lassalle': 'Lassalle',
         'Bruno Retailleau': 'Retailleau', 'David Lisnard': 'Lisnard', 'Nicolas Dupont-Aignan': 'Dupont‑Aignan', 'Xavier Bertrand': 'Bertrand',
         'Marine Le Pen': 'Le Pen', 'Éric Zemmour': 'Zemmour', 'Jordan Bardella': 'Bardella', 'Sarah Knafo': 'Knafo',
         'Ségolène Royal': 'Royal', 'Olivier Faure': 'Faure', 'Jérôme Guedj': 'Guedj', 'Sandrine Rousseau': 'Rousseau',
         'Delphine Batho': 'Batho', 'Laurent Wauquiez': 'Wauquiez', 'Gérald Darmanin': 'Darmanin'}
COURTS = [COURT[n] for n in noms]
# Contrôle : l'ordre des cartes dans bloc_donnees.js suit celui de valeurs.json
import re as _re
_noms_js = [x.replace('\u2011', '-') for x in _re.findall(r"nom: '([^']+)', bloc:", bloc)]
assert _noms_js == noms, [(a, b) for a, b in zip(_noms_js, noms) if a != b]
COURTS_A = ['Borne','Valls','Braun-Pivet','de Gaulle','Sarkozy','Macron','Le Maire','Larcher','Arnault','Praud','Bayrou','Plenel']
js = "/* Données des cartes d'À peu près d'accord : partagées par la collection et le jeu. */\n(function(){\n" + out + """
var COURTS = %s, COURTS_A = %s;
var METHODE = %s;
CANDIDATS.forEach(function(c, i){ c.court = COURTS[i]; c.mini = c.image.replace('img/', 'img/mini/').replace('-couleur', ''); c.methode = METHODE[i]; });
ACTIONS.forEach(function(c, i){ c.court = COURTS_A[i]; c.mini = c.image.replace('img/', 'img/mini/').replace('-couleur', ''); });
window.APDA = {
  VERIFIE: VERIFIE, CANDIDATS: CANDIDATS, ACTIONS: ACTIONS,
  COTES: ['Urnes', 'Expérience', 'Terrain', 'Buzz'],
  COTES_LONGS: ['Son meilleur score en voix à une élection', 'Ses années de mandat national', 'Ses années d’élu local', 'Combien de fois on consulte sa page Wikipédia (mois type)']
};
})();
""" % (json.dumps(COURTS, ensure_ascii=False), json.dumps(COURTS_A, ensure_ascii=False), json.dumps(methode, ensure_ascii=False))
open('/home/claude/carte2/donnees.js', 'w', encoding='utf-8').write(js)
print('donnees.js', len(js))
