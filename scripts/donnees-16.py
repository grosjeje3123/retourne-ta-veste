import json
bloc = open('/home/claude/valeurs/bloc_donnees.js', encoding='utf-8').read()
vals = json.load(open('/home/claude/valeurs/valeurs.json'))
voix = json.load(open('/home/claude/valeurs/voix.json'))
noms = list(vals.keys())
parts = bloc.split("valeurs: [5, 5, 5, 5]")
assert len(parts) == 17, len(parts)
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
}
methode = []
for n in noms:
    b = vals[n]['brut']; vx = voix[n]
    methode.append({'voix': vx[0], 'election': vx[1], 'voixSource': [vx[2], vx[3]],
                    'national': round(b['national'] / 12, 1), 'local': round(b['local'] / 12, 1),
                    'vues': b['vues'], 'devance': vals[n]['devance'], 'mandatsSources': SRC_MANDATS[n]})
COURTS = ['Arthaud','Mélenchon','Roussel','Ruffin','Tondelier','Glucksmann','Attal','Philippe','Villepin','Riner','Polony','Retailleau','Lisnard','Dupont‑Aignan','Le Pen','Zemmour']
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
