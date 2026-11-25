# Applique la grille « Justice » précisée (19/11/2026) aux cartes concernées.
import re, sys
P = '/home/claude/valeurs/bloc_donnees.js'
src = open(P, encoding='utf-8').read()

def bloc(nom):
    i = src.index("nom: '" + nom)
    j = src.find("nom: '", i + 10)
    return i, (j if j != -1 else len(src))

def remplace_dans(nom, avant, apres):
    global src
    i, j = bloc(nom)
    b = src[i:j]
    assert b.count(avant) == 1, (nom, avant[:60], b.count(avant))
    src = src[:i] + b.replace(avant, apres) + src[j:]

def ajoute_sources(nom, items):
    global src
    i, j = bloc(nom)
    b = src[i:j]
    k = b.index('sources: [')
    f = b.index('\n      ]', k)
    add = ''.join(",\n        ['%s', '%s']" % it for it in items)
    b = b[:f] + add + b[f:]
    src = src[:i] + b + src[j:]

def ajoute_hors_carte(nom, rows):
    global src
    i, j = bloc(nom)
    b = src[i:j]
    def r(a):
        liens = ', '.join("['%s', '%s']" % l for l in a[2])
        return "        ['%s', '%s', [%s]]" % (a[0], a[1], liens)
    if 'horsCarte: [' in b:
        k = b.index('horsCarte: [')
        f = b.index('\n      ],', k)
        b = b[:f] + ',\n' + ',\n'.join(r(a) for a in rows) + b[f:]
    else:
        k = b.index('      sources: [')
        b = b[:k] + '      horsCarte: [\n' + ',\n'.join(r(a) for a in rows) + '\n      ],\n' + b[k:]
    src = src[:i] + b + src[j:]

NB = '&nbsp;'
# --- Mélenchon : comptes de campagne 2017 sur la carte, assistants au tableau
remplace_dans('Jean-Luc Mélenchon',
  "justice: 'Condamné le 9 décembre 2019 à 3 mois avec sursis et 8&nbsp;000&nbsp;€ d’amende pour rébellion et provocation (perquisition de LFI, 2018).'",
  "justice: 'Condamné en 2019 à 3 mois avec sursis et 8&nbsp;000&nbsp;€ d’amende pour rébellion et provocation (perquisition de LFI, 2018). Comptes de sa campagne 2017&nbsp;: instruction close en mai 2026 avec quatre mises en examen, dont sa directrice de communication de l’époque&nbsp;; issue non connue.'")
ajoute_hors_carte('Jean-Luc Mélenchon', [
  ('Emplois d’assistants d’eurodéputés LFI (enquête élargie à lui en 2017, confiée à des juges en 2018)',
   'Instruction close sans aucune mise en examen (juin 2026)',
   [('Club des juristes', 'https://www.leclubdesjuristes.com/en-bref/quatre-mises-en-examen-dans-laffaire-des-comptes-de-campagnes-de-lfi-de-2017-16141/'),
    ('Public Sénat (2017)', 'https://www.publicsenat.fr/actualites/non-classe/assistants-d-eurodeputes-l-enquete-elargie-a-jean-luc-melenchon-76177')])])
ajoute_sources('Jean-Luc Mélenchon', [
  ('Club des juristes (comptes 2017)', 'https://www.leclubdesjuristes.com/en-bref/quatre-mises-en-examen-dans-laffaire-des-comptes-de-campagnes-de-lfi-de-2017-16141/'),
  ('Europe&nbsp;1 (comptes 2017)', 'https://www.europe1.fr/node/941060')])

# --- Tondelier : action en diffamation perdue par les plaignants
remplace_dans('Marine Tondelier', "justice: 'Aucune procédure recensée.'", "justice: 'Aucune procédure en cours.'")
ajoute_hors_carte('Marine Tondelier', [
  ('Action en diffamation de deux présentateurs de CNews (propos de 2023 sur la chaîne)',
   'Plaignants déboutés par le tribunal judiciaire de Nanterre (17&nbsp;février 2026)&nbsp;; aucun appel connu',
   [('Puremédias (jugement)', 'https://www.ozap.com/actu/j-espere-que-ca-leur-passera-l-envie-de-baillonner-les-critiques-marine-tondelier-annonce-avoir-gagne-son-proces-contre-christine-kelly/654117'),
    ('Puremédias (plainte, 2023)', 'https://www.ozap.com/actu/-cnews-laisse-prosperer-une-ideologie-neonazie-christine-kelly-et-marc-menant-portent-plainte-contre-marine-tondelier-eelv/634309')])])

# --- Hollande : enquête de 2016 sur le secret de la défense nationale
remplace_dans('François Hollande', "justice: 'Aucune procédure recensée.'",
  "justice: 'Enquête préliminaire du parquet de Paris (nov. 2016) sur une possible compromission du secret de la défense nationale, après la parution d’un livre d’entretiens avec deux journalistes. Issue non connue à ce jour.'")
ajoute_sources('François Hollande', [
  ('Assemblée nationale (nov. 2016)', 'https://questions.assemblee-nationale.fr/dyn/14/questions/QANR5L14QG4390.pdf'),
  ('The Local (AFP)', 'https://www.thelocal.com/20161122/probe-opened-after-hollande-leaked-air-strikes-info')])

# --- Philippe : non-lieu de la CJR (Covid) au tableau
ajoute_hors_carte('Édouard Philippe', [
  ('Information judiciaire de la Cour de justice de la République sur la gestion du Covid-19 (témoin assisté depuis octobre 2022)',
   'Non-lieu le 7&nbsp;juillet 2025, comme l’avait requis le procureur général',
   [('Club des juristes', 'https://www.leclubdesjuristes.com/en-bref/gestion-du-covid-19-la-cjr-prononce-un-non-lieu-a-lencontre-de-edouard-philippe-agnes-buzyn-et-olivier-veran-11443/'),
    ('Acteurs publics', 'https://acteurspublics.fr/articles/olivier-marleix-cjr-cese/')])])

# --- Darmanin : enquête classée de 2018, troisième ligne du tableau
ajoute_hors_carte('Gérald Darmanin', [
  ('Enquête préliminaire pour abus de faiblesse, ouverte en février 2018 sur plainte',
   'Classée sans suite par le parquet de Paris (2018)',
   [('Public Sénat', 'https://www.publicsenat.fr/actualites/politique/l-enquete-pour-abus-de-faiblesse-visant-le-ministre-gerald-darmanin-classee-sans')])])

# --- Dupont-Aignan : relaxe de 2018 au tableau
remplace_dans('Nicolas Dupont', "justice: 'Aucune procédure recensée.'", "justice: 'Aucune procédure en cours.'")
ajoute_hors_carte('Nicolas Dupont', [
  ('Poursuivi pour provocation à la haine (tweet de janvier 2017 évoquant une «&nbsp;invasion migratoire&nbsp;»)',
   'Relaxé par le tribunal correctionnel de Paris (6&nbsp;juin 2018)&nbsp;; aucun appel connu',
   [('Public Sénat', 'https://www.publicsenat.fr/actualites/politique/dupont-aignan-relaxe-pour-ses-propos-sur-l-invasion-migratoire-en-france-86680')])])

# --- Le Pen : information judiciaire sur sa campagne 2022
remplace_dans('Marine Le Pen',
  "justice: 'Condamnée en appel en juillet 2026 pour détournement de fonds publics (assistants FN)&nbsp;: 3 ans dont 1 ferme sous bracelet, 45 mois d’inéligibilité dont 30 avec sursis. Pourvoi en cassation&nbsp;: présumée innocente.'",
  "justice: 'Condamnée en appel en juillet 2026 pour détournement de fonds publics (assistants FN)&nbsp;: 3 ans dont 1 ferme sous bracelet, 45 mois d’inéligibilité dont 30 avec sursis&nbsp;; pourvoi en cassation, présumée innocente. Information judiciaire depuis juillet 2024 sur le financement de sa campagne 2022&nbsp;: issue non connue.'")
ajoute_sources('Marine Le Pen', [
  ('Club des juristes (campagne 2022)', 'https://www.leclubdesjuristes.com/en-bref/ouverture-dune-information-judiciaire-sur-le-financement-de-la-campagne-de-marine-le-pen-en-2022-6528/'),
  ('AFP (perquisition, 2025)', 'https://lepetitjournal.com/fil-afp/le-rn-perquisitionne-dans-une-enquete-sur-le-financement-de-ses-campagnes-electorales-418194')])

# --- Zemmour : enquête préliminaire sur les SMS de 2022
remplace_dans('Éric Zemmour',
  "justice: 'Plusieurs condamnations définitives, dont complicité de provocation à la haine (mineurs isolés, 2025) et diffamation (Ined, 2026).'",
  "justice: 'Plusieurs condamnations définitives, dont complicité de provocation à la haine (mineurs isolés, 2025) et diffamation (Ined, 2026). Enquête préliminaire (avril 2022) sur l’usage de données personnelles pour des SMS de sa campagne&nbsp;: issue non connue.'")
ajoute_sources('Éric Zemmour', [
  ('Le Courrier de l’Atlas (SMS, 2022)', 'https://www.lecourrierdelatlas.com/?p=182261'),
  ('Connexion (plainte, 2022)', 'https://www.connexionfrance.com/article/French-news/Formal-complaint-against-far-right-Zemmour-over-text-to-Jews-in-France')])

# --- Bardella : même information judiciaire (européennes 2024, parti qu'il préside)
remplace_dans('Jordan Bardella', "justice: 'Aucune procédure le visant recensée.'",
  "justice: 'Information judiciaire depuis juillet 2024 sur le financement des campagnes du RN, dont les européennes de 2024 qu’il menait (perquisition au siège en juillet 2025). Issue non connue à ce jour&nbsp;; présumé innocent.'")
ajoute_sources('Jordan Bardella', [
  ('AFP (perquisition, 2025)', 'https://lepetitjournal.com/fil-afp/le-rn-perquisitionne-dans-une-enquete-sur-le-financement-de-ses-campagnes-electorales-418194'),
  ('Public Sénat (prêts)', 'https://www.publicsenat.fr/actualites/politique/perquisitions-au-rn-que-dit-la-loi-sur-les-prets-de-personnes-privees-aux-partis-politiques')])

# --- Knafo : plainte classée de 2024 au tableau
remplace_dans('Sarah Knafo', "justice: 'Aucune procédure recensée.'", "justice: 'Aucune procédure en cours.'")
ajoute_hors_carte('Sarah Knafo', [
  ('Plainte de l’État algérien pour «&nbsp;diffusion de fausses nouvelles&nbsp;» (propos sur RMC, septembre 2024)',
   'Classée sans suite par le parquet de Paris le 27&nbsp;septembre 2024, infraction non caractérisée',
   [('TelQuel (AFP)', 'https://telquel.ma/instant-t/2024/10/03/800-millions-deuros-daide-a-lalgerie-une-plainte-dalger-contre-une-eurodeputee-francaise-classee_1896718/'),
    ('H24info (AFP)', 'https://h24info.ma/monde/800-millions-deuros-daide-a-lalgerie-la-plainte-dalger-contre-sarah-knafo-classee/')])])

open(P, 'w', encoding='utf-8').write(src)
print('ok')
