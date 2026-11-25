import json
roster = {r['n']: r for r in json.load(open('/home/claude/essais/roster.json'))}
L = [  # n, parti (liste), statut (liste)
(1,'Lutte ouvrière','Déclarée'),(2,'La France insoumise','Déclaré'),(3,'Parti communiste français','Déclaré'),
(4,"L'Après",'Candidate à la candidature'),(5,'Debout !','Déclaré (candidature unique à gauche)'),
(6,'Les Écologistes','Y songe'),(7,'Les Écologistes','Déclarée (primaire)'),(8,'Génération écologie','Déclarée'),
(9,'Parti socialiste','Se dit légitime pour rassembler la gauche'),(10,None,'Déclarée (primaire)'),
(11,None,'Y songe, quasi-candidat'),(12,None,'Déclaré'),(13,'La Convention','Y songe'),
(14,'Place publique','Investi après la primaire'),(15,None,'Y songe'),(16,'Renaissance','Déclaré'),
(17,None,'Y songe'),(18,None,'Y songe (primaire)'),(19,None,'Y songe'),(20,'Horizons','Déclaré'),
(21,None,'Y songe'),(22,None,'Ambigu'),(23,'La France humaniste','Quasi-candidat'),
(24,'Nous France / Les Républicains','Déclaré'),(25,None,'Y songeait (avant la désignation de Retailleau)'),
(26,None,'Y songe'),(27,'Les Républicains','Déclaré'),(28,'Nouvelle Énergie','Déclaré'),
(29,'Debout la France','Déclaré'),(30,'Rassemblement national','Déclarée'),
(31,'Rassemblement national','Candidat si Le Pen empêchée'),(32,'Reconquête','Déclaré'),
(33,'Reconquête','Candidate possible si Zemmour renonce'),(34,'Union populaire républicaine','Déclaré'),
(35,None,'Y songe'),(36,None,'Y songe'),
(37,'PS / La France humaine et forte',None),(38,'Apparenté EPR',None),(39,'France 2050',None),
(40,'MoDem',None),(41,'Renaissance',None),(42,'Gauche républicaine et socialiste',None),(43,None,None),
(44,'UDEM',None),(45,None,None),(46,None,None),(47,'Révolution permanente',None),
(48,'NPA-Révolutionnaires',None),(49,'Les Patriotes',None),(50,'Résistons',None),(51,'Équinoxe',None),
(52,'Parti animaliste',None),(53,"La France qu'on veut",'Déclaré'),(54,'Nous sommes la France','Déclarée'),
(55,'Les Ruches',None),(56,'France Libre',None),(57,'Solution démocratique',None),(58,None,None),(59,None,None),
(60,'La France Adulte',None),(61,None,None),(62,'Les Gaulois',None),(63,'ELVITA / Le Grand Monarque',None),
(64,None,None),(65,'Union Cincinnatiste',None),(66,'REVODEMO',None)]
# Bloc : uniquement quand le parti est rattaché à un bloc par une source sur la grille 2026
GRILLE = {'Lutte ouvrière':('Extrême gauche','LO'),'La France insoumise':('Extrême gauche','LFI (Conseil d\'État, 27/02/2026)'),
 'NPA-Révolutionnaires':('Extrême gauche','NPA'),'Parti communiste français':('Gauche','PCF'),'Les Écologistes':('Gauche','Les Écologistes'),
 'Parti socialiste':('Gauche','PS'),'PS / La France humaine et forte':('Gauche','PS'),'Place publique':('Gauche','Place publique'),
 'Renaissance':('Centre','Renaissance'),'Horizons':('Centre','Horizons'),'MoDem':('Centre','MoDem'),
 'Les Républicains':('Droite','LR'),'Nous France / Les Républicains':('Droite','LR'),
 'Rassemblement national':('Extrême droite','RN'),'Reconquête':('Extrême droite','Reconquête'),'Les Patriotes':('Extrême droite','Les Patriotes'),
 'Parti animaliste':('Divers','Parti animaliste')}
DECK = {n for n, r in roster.items() if r['inst30'] >= 3}
NOTES = {
 2:'Candidature annoncée en mai 2026 (Public Sénat).',
 15:'Carte action 49.3 publiée (édition 2/2, 23 recours).',
 19:'Carte action Mercato publiée.',
 27:'Candidature annoncée le 12/02/2026 (AFP).',
 29:"Classé « droite » en 2020 après une décision du Conseil d'État ; grille 2026 à vérifier.",
 31:'Pas testé dans les sondages des 90 derniers jours.',
 53:'Candidature annoncée le 09/11/2026 (Le Parisien, LCP).',
 54:'Candidature annoncée le 14/10/2026 sur France Inter (LCP).'}
for n in (9, 10, 12, 24, 41, 42):
    NOTES[n] = 'Testé dans les 90 derniers jours, plus depuis 30 jours.'
rows = []
for i, (n, parti, statut) in enumerate(L):
    r = roster[n]; ligne = 6 + i
    if parti in GRILLE:
        bloc, src = GRILLE[parti]; src = 'Grille 2026 · ' + src
    else:
        bloc = 'À classer'; src = 'Parti à chercher dans la grille' if parti else 'Aucun parti indiqué'
    portrait = 'Fait' if n in (15, 19) else ('À faire' if n in DECK else None)
    carte = 'Action · publiée' if n in (15, 19) else ('Candidat · à faire' if n in DECK else None)
    rows.append([n, r['nom'], bloc, f'=IF(G{ligne}>=$C$2,"Oui","")', portrait, carte,
                 r['inst30'], r['enq30'], parti or '—', statut or 'Non précisé', src, NOTES.get(n)])
json.dump(rows, open('rows.json', 'w'), ensure_ascii=False)
print(len(rows), 'lignes ;', sum(1 for x in rows if x[2] != 'À classer'), 'blocs sourcés ;', len(DECK), 'dans le deck')
from collections import Counter
print(Counter(x[2] for x in rows))
print(Counter(x[2] for x in rows if x[0] in DECK))
