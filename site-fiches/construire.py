"""Construit les deux pages à partir du modèle :
- public/index.html : le site partageable (export public : aucune donnée judiciaire, aucune donnée non validée) ;
- travail/index.html : la version de travail privée (tout, avec l'état de vérification de chaque élément)."""
import json, subprocess, html, re, os, shutil

ICI = os.path.dirname(os.path.abspath(__file__))           # site-fiches/, dans le dépôt du jeu
CARTE2 = os.path.normpath(ICI + '/../carte2')                 # le jeu : ses cartes nourrissent le site, et le site lui renvoie ses fiches
JEU = CARTE2 + '/donnees.js'
# données de travail (relevés, sources, volet judiciaire non validé) : hors du dépôt, jamais publiées telles quelles
DONNEES = os.environ.get('FICHES_DONNEES', '/home/claude/fiches')
code = r"""
const fs=require('fs');let s=fs.readFileSync(process.argv[1],'utf8');
s=s.replace(/\}\)\(\);\s*$/,';globalThis.__M=METHODE;})();');global.window={};eval(s);
const D=window.APDA;process.stdout.write(JSON.stringify({C:D.CANDIDATS,A:D.ANECDOTES,M:__M}));"""
J = json.loads(subprocess.run(['node', '-e', code, JEU], capture_output=True, text=True, check=True).stdout)

def txt(s):   # texte brut : entités décodées, balises retirées
    return html.unescape(re.sub(r'<[^>]+>', '', s)) if isinstance(s, str) else s
def nettoie(o):
    if isinstance(o, str): return txt(o)
    if isinstance(o, list): return [nettoie(x) for x in o]
    if isinstance(o, dict): return {k: nettoie(v) for k, v in o.items()}
    return o
def sans(t): return re.sub(r'\s+', '-', ''.join(c for c in __import__('unicodedata').normalize('NFD', t.lower()) if not __import__('unicodedata').combining(c)))
cle = lambda n: n.replace('‑', '-')

PUB = json.loads(subprocess.run(['node', '-e', "global.window={};require(process.argv[1]);process.stdout.write(JSON.stringify(window.APDA.FICHES))", DONNEES + '/fiches-public.js'], capture_output=True, text=True, check=True).stdout)
PUB = {cle(k): v for k, v in PUB.items()}
INT = {cle(q['nom']): q for q in json.load(open(DONNEES + '/fiches-interne-v2.json'))}
# identités mises à jour après la contre-vérification du 26/11/2026 (s'appliquent au site public et à l'export du jeu)
CORR_ID = {'Marine Le Pen': ('Rassemblement national ; présidence du groupe RN à l’Assemblée passée à Sébastien Chenu fin octobre 2026',
    ['Qui est Sébastien Chenu, qui va succéder à Marine Le Pen à la présidence du groupe RN à l’Assemblée ? (LCP)', 'https://lcp.fr/actualites/qui-est-sebastien-chenu-qui-va-succeder-a-marine-le-pen-a-la-presidence-du-groupe-rn-a-l', '24/10/2026'])}
CORR_MANDATS = {('Marine Le Pen', 'Présidente du groupe RN à l\'Assemblée nationale'): '2022 – oct. 2026'}   # Chenu lui succède (LCP, 24/10/2026)
for (_n, _int), _per in CORR_MANDATS.items():
    for _src in (PUB.get(_n), INT.get(cle(_n))):
        _L = (_src or {}).get('mandats') or []
        for _i, _m in enumerate(_L):
            if isinstance(_m, dict) and _m.get('intitule') == _int: _m['periode'] = _per
            elif isinstance(_m, str) and _int in _m: _L[_i] = re.sub(r'depuis \d{4}', _per, _m)
for _n, (_parti, _src) in CORR_ID.items():
    if _n in PUB and PUB[_n].get('identite'):
        PUB[_n]['identite'] = dict(PUB[_n]['identite'], parti=_parti, sources=(PUB[_n]['identite'].get('sources') or []) + [_src])

# ---------------------------------------------------------------- thèmes du programme repassés avec sources lues (26/11/2026)
import glob as _g
THEMES5 = ('retraites', 'depenses', 'energie', 'immigration', 'ecole')
RELU = {}
for f in sorted(_g.glob(os.environ.get('THEMES', DONNEES + '/themes') + '/lot*.json')):
    for e in json.load(open(f)): RELU[cle(e['nom'])] = e.get('mesures') or {}
# contre-vérification indépendante (26/11) : textes précisés
CORR_PROG = {
    ('Thierry Breton', 'depenses'): 'Inscrire dans la Constitution un plafond de déficit public de 1 % du PIB (visé pour 2032), avec réduction progressive dès 2027',
    ('Bruno Retailleau', 'depenses'): '197 Md€ d’économies sur 5 ans (dont 56 Md€ rendus en baisses d’impôts), dont 400 000 départs d’agents publics non remplacés',
    ('Laurent Wauquiez', 'immigration'): 'Avril 2025 : placer les étrangers dangereux sous OQTF dans un centre de rétention à Saint-Pierre-et-Miquelon',
    ('Gérald Darmanin', 'immigration'): 'Mai 2026 : moratoire de trois ans sur l’immigration légale ; quotas limitatifs via une révision de la Constitution',
    ('Jean-Luc Mélenchon', 'retraites'): 'Abroger la réforme de 2023 (retour à 62 ans), puis, à terme, retraite à 60 ans à taux plein avec 40 annuités',
    ('Sandrine Rousseau', 'retraites'): 'Contribution exceptionnelle de 10 % sur les bénéfices des vendeurs de PER, affectée à la CNAV (amendement PLFSS 2026, rejeté)',
    ('Raphaël Glucksmann', 'retraites'): ('Abroger la réforme de 2023 ; revenir « comme base » à 62 ans avec un système de décote ; réforme fondée sur la pénibilité',
        ['Retraites : Attal critique Philippe qui propose la réforme de 2022 (dépêche AFP reprise)', 'https://www.lagazettefrance.fr/article/retraites-attal-critique-philippe-qui-propose-la-reforme-de-2022', '30/09/2026']),
    ('Raphaël Glucksmann', 'depenses'): ('200 Md€ d’investissements publics sur le quinquennat pour la « révolution écologique »',
        ['Glucksmann prévoit 200 milliards d’investissements (L’Info Durable / AFP)', 'https://www.linfodurable.fr/presidentielle-glucksmann-prevoit-200-milliards-dinvestissements-pour-sa-revolution-ecologique', '09/11/2026']),
    ('Clémentine Autain', 'retraites'): 'Abroger le report de l’âge légal à 64 ans (amendement cosigné au PLFSS 2026, rejeté ; conférence de financement visant 62 ans)',
    ('Olivier Faure', 'immigration'): 'Régularisation des travailleurs sans papiers, sans objectif chiffré officiel',
    ('Gabriel Attal', 'depenses'): '100 000 postes de fonctionnaires d’État en moins (départs volontaires, non-remplacements), hors Éducation, Armées, Justice, Intérieur ; 120 à 150 Md€ sur dix ans',
    ('Gabriel Attal', 'energie'): 'Juillet 2025 : produire en France les trois quarts de l’énergie, avec nucléaire et renouvelables',
}
A_VERIFIER_PROG = {('François Hollande', 'energie')}   # contre-vérification : périmètre de la TVA contesté
for nom, mes in RELU.items():
    for t in THEMES5:
        x = mes.get(t)
        cp = next((v for (n2, t2), v in CORR_PROG.items() if cle(n2) == nom and t2 == t), None)
        if x and cp: x = dict(x, texte=cp[0], source=cp[1]) if isinstance(cp, tuple) else dict(x, texte=cp)
        if x and any(cle(n2) == nom and t2 == t for n2, t2 in A_VERIFIER_PROG): x = dict(x, verification='a_verifier')
        mi = INT[nom].setdefault('programme', {}).setdefault('mesures', {})
        mp = PUB[nom].setdefault('programme', {}).setdefault('mesures', {})
        if x and x.get('source') and x.get('texte'):
            if (nom, t) in {(cle('François Hollande'), 'immigration'), (cle('François Ruffin'), 'retraites')}: x = dict(x, verification='a_verifier')   # opinion ; cahier « travailleurs essentiels » : portée à vérifier
            if re.search(r'selectra|parlons-?politique|tribunaldunet|tribunal-du-net', x['source'][1] or '', re.I):
                x = dict(x, verification='a_verifier')   # site secondaire : pas de publication sans source primaire
            v = {'texte': x['texte'], 'source': x['source'][:3]}
            mi[t] = dict(v, verification=x.get('verification'), publiable=x.get('verification') == 'verifie')
            if x.get('verification') == 'verifie': mp[t] = v
            else: mp.pop(t, None)
        else:
            mi.pop(t, None); mp.pop(t, None)

def base(c, i):
    slug = re.search(r'([^/]+)\.webp$', c['mini']).group(1)
    eco = 'Écologistes' in (c.get('blocSource') or '')
    m = dict(J['M'][i]); m.pop('devance', None); m.pop('mandatsSources', None)
    return {'nom': cle(txt(c['nom'])), 'slug': slug, 'bloc': 'ecolo' if eco else sans(c['bloc']), 'blocNom': 'Écologistes' if eco else c['bloc'],
            'etiquette': txt(c['etiquette']), 'phrase': txt(c.get('phrase')), 'quand': txt(c.get('quand')), 'annees': nettoie(c.get('annees')),
            'methode': nettoie(m), 'anecdotes': [nettoie({'texte': a['texte'], 'sources': a.get('sources', [])}) for a in J['A'] if c['court'] in (a.get('cartes') or [])]}

def espace(statut):
    s = statut or ''
    if s.startswith('Candidat'): return 'declaree'
    if re.search(r'renonc|Battu|Pas candidat', s): return 'retrait'
    return 'envisagee'

def interne(q):
    idt = dict(q['identite']); idt['sources'] = idt.pop('source', None) or []
    return {'candidature': q['candidature']['statut'], 'identite': idt, 'mandats': q['mandats']['liste'],
            'mandats_sources': [s[:2] for s in q['mandats']['sources']], 'parlement': q['parlement'],
            'programme': q['programme'], 'justice': q['justice'], 'justice_mention': q['justice_mention'],
            'a_verifier': q['a_verifier'], 'ecarts_carte': q['ecarts_carte'], 'corrections': q['corrections']}


# ---------------------------------------------------------------- règles graduées sourcées (recherches du 25/11/2026)
def axes(publique):
    fp = {e['i']: e for e in json.load(open(DONNEES + '/axes/fonction_publique.json'))}
    slug = {i: re.search(r'([^/]+)\.webp$', c['mini']).group(1) for i, c in enumerate(J['C'])}
    def ent(i, a, b, txt):
        e = fp[i]; ok = e['verification'] == 'verifie' and bool(e.get('source'))
        return None if (publique and not ok) else {'a': a, 'b': b, 'txt': txt, 'source': e['source'], 'publiable': ok}
    pos = {slug[i]: v for i, v in {
        2: ent(2, 500000, 500000, '+500 000 en 5 ans'),
        4: ent(4, 250000, 350000, '+250 000 à +350 000'),
        13: ent(13, -100000, -100000, '−100 000 (État, hors régalien et éducation)'),
        14: ent(14, -250000, -250000, '−250 000 en 5 ans (fonctions de bureau)'),
        29: ent(29, -400000, -400000, '−400 000 en 5 ans (départs non remplacés)'),
        39: ent(39, -800000, -800000, '−800 000 en 5 ans (hors enseignants, police, armée, soignants)'),
        42: ent(42, -800000, -800000, '−800 000 (fonction publique administrative)'),
    }.items() if v}
    for k in pos: pos[k]['g'] = 'Périmètre restreint (certains métiers exclus)' if k in (slug[13], slug[14], slug[39], slug[42]) else 'Ensemble des fonctionnaires'
    cibles = {slug[i]: v for i, v in {
        1: ent(1, None, None, '+10 000 enseignants et +10 000 soignants la 1re année'),
    }.items() if v}
    sans = {slug[i]: v for i, v in {
        38: ent(38, None, None, 'baisse du nombre d’agents annoncée'),
        30: ent(30, None, None, 'non-remplacement des départs, d’abord dans l’administratif'),
    }.items() if v}
    k = lambda v: ('+' if v > 0 else '−' if v < 0 else '') + format(abs(v), ',').replace(',', ' ')
    en = {e['i']: e for e in json.load(open(DONNEES + '/axes/energie.json'))}
    def ent2(i, a, b, txt):
        e = en[i]; ok = e['verification'] == 'verifie' and bool(e.get('source'))
        return None if (publique and not ok) else {'a': a, 'b': b, 'txt': txt, 'source': e['source'], 'publiable': ok}
    pos_e = {slug[i]: v for i, v in {
        1: ent2(1, 0, 0, '0 : sortie progressive du nucléaire'),
        4: ent2(4, 0, 0, '0 : sortie, sans échéance fixée'),
        8: ent2(8, 2, 4, '2 à 4 EPR'),
        24: ent2(24, 6, 6, '6'),
        14: ent2(14, 14, 14, '14 (les 6 annoncés + 8)'),
        39: ent2(39, 14, 14, '14 d’ici 2045, dont 6 d’ici 2035'),
        19: ent2(19, 14, 14, '14 EPR2, plus des réacteurs à neutrons rapides'),
        3: ent2(3, 6, 6, '6 confirmés (+ 8 décidés sous condition)'),
        29: ent2(29, 6, 6, '6 confirmés (+ 8 sous condition d’avancement)'),
    }.items() if v}
    relance = {slug[i]: v for i, v in {6: ent2(6, None, None, 'nombre fixé après une expertise de la Cour des comptes')}.items() if v}
    energie = {'energie': {
        'titre': 'Nouveaux réacteurs nucléaires proposés',
        'sous': 'Nombre de nouveaux réacteurs à construire. 0 = aucun nouveau réacteur ; ce qui est prévu pour le parc existant (sortie progressive ou non) est précisé à côté. Une fourchette est un segment.',
        'min': -0.6, 'max': 15, 'graduations': [[v, str(v)] for v in (0, 2, 4, 6, 8, 10, 12, 14)],
        'positions': pos_e,
        'autres': [['Relance sans nombre', relance]],
        'sansTexte': 'Pas de chiffre identifié',
        'note': 'Seulement le chiffre que chacun donne, avec sa source. Les pistes trouvées uniquement chez des comparateurs automatiques ne sont pas retenues.'}}
    return dict(energie, **{'depenses': {
        'titre': 'Postes de fonctionnaires : suppressions ou créations proposées',
        'sous': 'Variation nette annoncée par chaque candidat. Les chiffres ne portent pas sur le même périmètre : ils sont rangés en deux groupes, à ne pas comparer entre eux.',
        'groupes': ['Ensemble des fonctionnaires', 'Périmètre restreint (certains métiers exclus)'],
        'min': -850000, 'max': 550000,
        'graduations': [[v, k(v)] for v in (-800000, -600000, -400000, -200000, 0, 200000, 400000)],
        'positions': pos,
        'autres': [['Recrutements ciblés, sans total', cibles], ['Baisse annoncée sans chiffre', sans]],
        'sansTexte': 'Pas de chiffre identifié',
        'note': 'Seulement le chiffre que chacun donne, avec sa source. Un recrutement ciblé (enseignants, policiers…) n’est pas un total et reste à part.'}})

# ---------------------------------------------------------------- équipes de campagne (relevé du 25/11/2026)
RESEAU = os.environ.get('RESEAU', DONNEES + '/reseau')
# relecture des relevés (25/11/2026) : ce qui n'est pas sourcé ou pas assez net est rétrogradé
CORR = {
    ('Jean-Luc Mélenchon', 'Benoît Biteau'): {'verification': 'a_verifier', 'qualite': 'député (Écologiste et social)'},   # pas de déclaration de soutien explicite
    ('Jean-Luc Mélenchon', 'Hadrien Clouet'): {'qualite': 'député'},   # circonscription ajoutée sans source
    ('Jean-Luc Mélenchon', 'Paul Vannier'): {'qualite': 'député'},
    ('Raphaël Glucksmann', 'Nora Mebarek'): {'qualite': None},   # mandat ajouté sans source
    ('Raphaël Glucksmann', 'François Kalfon'): {'qualite': 'député européen'},
    ('Jean-Luc Mélenchon', 'Séverine Véziès'): {'verification': 'a_verifier'},   # seule source : média local
    ('David Lisnard', 'Sébastien Leroy'): {'verification': 'a_verifier'},        # seule source : média régional
    ('Marine Le Pen', 'Pascale Piera'): {'qualite': 'députée européenne'},
    ('Marine Le Pen', 'Laurent Castillo'): {'qualite': None},                    # mandat actuel non établi
    ('Marine Le Pen', 'Éric Ciotti'): {'qualite': 'maire de Nice, président de l’UDR', 'role': 'Allié (propose un « pacte d’alliance » UDR-RN)'},
    ('Bruno Retailleau', 'Pierre-Henri Dumont'): {'qualite': None},              # maire de Marck jusqu'en 2017 seulement
    ('Bruno Retailleau', 'Franck Robine'): {'depuis': None},                      # date vue seulement dans un extrait
    ('Raphaël Glucksmann', 'Sébastien Vincini'): {'qualite': 'président du conseil départemental de la Haute-Garonne'},
    ('Bruno Retailleau', 'Pierre Danon'): {'verification': 'a_verifier'},
    ('Juan Branco', 'Modi Sissoko'): {'verification': 'a_verifier'},   # particulier sans fonction publique, nommé seulement par la campagne : à trancher   # rôle de parti, avril 2026, non reconfirmé
    ('Marine Le Pen', 'Jordan Bardella'): {'verification': 'verifie', 'depuis': '05/07/2026',   # « plein soutien », Liévin
        'source': ['Jordan Bardella à Matignon : Marine Le Pen réaffirme son choix (LCP)', 'https://lcp.fr/actualites/jordan-bardella-a-matignon-marine-le-pen-reaffirme-son-choix-les-militants-du-rn', '25/10/2026']},
    # contre-vérification du 26/11/2026 (second agent, sources lues)
    ('Jean-Luc Mélenchon', 'Clémence Guetté'): {'depuis': None},       # le dossier de presse ne date pas la nomination
    ('Jean-Luc Mélenchon', 'Hadrien Clouet'): {'depuis': None, 'qualite': 'député'},
    ('Fabien Roussel', 'Yannick Monnet'): {'depuis': None,              # soutien antérieur à l'article du 05/11/2026
        'source': ['Présidentielle : la moitié des députés communistes choisit Jean-Luc Mélenchon plutôt que Fabien Roussel (LCP)', 'https://lcp.fr/actualites/presidentielle-la-moitie-des-deputes-communistes-choisit-jean-luc-melenchon-plutot-que', '05/11/2026']},
    ('Édouard Philippe', 'Marie Guévenoux'): {'qualite': 'ancienne ministre déléguée chargée des Outre-mer, ex-députée'},
    ('Édouard Philippe', 'Gérald Darmanin'): {'qualite': 'garde des Sceaux, ministre de la Justice'},
    ('Édouard Philippe', 'Maud Bregeon'): {'qualite': 'ministre déléguée chargée de l’Énergie, porte-parole du Gouvernement'},
    ('Édouard Philippe', 'Mathieu Lefèvre'): {'depuis': None},
    ('Édouard Philippe', 'Nathalie Kosciusko-Morizet'): {'depuis': '07/2026', 'qualite': 'ancienne ministre',
        'source': ['Présidentielle : le pari d’Édouard Philippe pour séduire les jeunes (LCP)', 'https://lcp.fr/actualites/presidentielle-le-pari-d-edouard-philippe-pour-seduire-les-jeunes-face-a-jean-luc', '05/07/2026']},
    ('Bruno Retailleau', 'Max Brisson'): {'qualite': 'sénateur LR'},     # porte-parole exact mais source régionale seulement
    ('Marine Le Pen', 'Julien Sanchez'): {'depuis': None, 'qualite': 'député européen'},   # date et vice-présidence vues seulement dans un média régional
    ('Marine Le Pen', 'Nolwenn Olivier'): {'depuis': None},
    ('Marine Le Pen', 'Sébastien Chenu'): {'qualite': 'vice-président du RN, président du groupe RN à l’Assemblée nationale (LCP, 24/10/2026)'},
    ('Marine Le Pen', 'Marion Maréchal'): {'depuis': '11/2026'},
    ('Éric Zemmour', 'Sarah Knafo'): {'qualite': 'députée européenne'},
}
# premier cercle : la ou les personnes qui dirigent chaque fonction (direction, comité politique, porte-parole,
# programme, communication, finances, relations avec les élus). Les membres, adjoints, conseillers et soutiens restent dans la liste.
PREMIER = {
    'Raphaël Glucksmann': ['Alexandre Ouizille', 'Carole Delga', 'Yannick Jadot', 'Pierre Jouvet', 'Nicolas Mayer-Rossignol', 'Laurence Rossignol', 'Patrick Mennucci'],
    'Jean-Luc Mélenchon': ['Manuel Bompard', 'Clémence Guetté', 'Hadrien Clouet', 'Séverine Véziès'],
    'Marine Le Pen': ['Julien Sanchez', 'Laurent Jacobelli', 'Nolwenn Olivier', 'Sébastien Chenu'],
    'Édouard Philippe': ['Christophe Béchu', 'Gilles Boyer', 'Marie Guévenoux', 'Maël de Calan', 'Clément Tonon'],
    'Bruno Retailleau': ['Franck Robine', 'Othman Nasrou', 'Pierre Danon'],
}
def corrige(cand, n):
    n = dict(n, **CORR.get((cand, n['nom']), {}))
    if n['groupe'] == 'direction' and 'comité politique' in n['role'].lower(): n['groupe'] = 'comite'
    if n.get('source') and 'lagazettefrance.fr' in n['source'][1] and 'AFP' not in n['source'][0]:
        n['source'] = [n['source'][0] + ' (dépêche AFP reprise)'] + n['source'][1:]
    return n
def equipes(publique):
    out = {}
    import glob
    for f in sorted(glob.glob(RESEAU + '/*.json')):
        r = json.load(open(f))
        mots = sorted(cle(r['candidat']).split())
        nom = next(cle(txt(c['nom'])) for c in J['C'] if sorted(cle(txt(c['nom'])).split()) == mots)
        r['candidat'] = nom
        fr = RESEAU + '/renfort/' + os.path.basename(f)   # renfort du 26/11 : rôles revérifiés, nouveaux rôles, parcours
        RF = json.load(open(fr)) if os.path.exists(fr) else {}
        if RF:
            maj = {n['nom']: n for n in RF.get('noeuds_maj', [])}
            r['noeuds'] = [dict(n, **maj[n['nom']]) if n['nom'] in maj else n for n in r['noeuds']]
            noms = {n['nom'] for n in r['noeuds']}
            r['noeuds'] += [n for n in RF.get('nouveaux_noeuds', []) if n.get('nom') and n['nom'] not in noms]
        nd = []
        for n in r.get('noeuds', []):
            n = corrige(r['candidat'], n)
            ok = n.get('verification') == 'verifie' and bool(n.get('source'))
            if publique and not ok: continue
            m = {k: n.get(k) for k in ('nom', 'role', 'groupe', 'qualite', 'depuis', 'jusqu_a', 'etat')}
            m['cercle'] = 1 if (n.get('premier_cercle') or n['nom'] in PREMIER.get(r['candidat'], [])) and n['groupe'] != 'soutiens' and n.get('etat') != 'parti' else 2
            m['source'] = (n.get('source') or [])[:3] or None
            if not publique: m['verification'] = n.get('verification'); m['notes'] = n.get('notes')
            nd.append(m)
        # origines politiques (tous) et idées (premier cercle), relevé du 26/11/2026
        fb = RESEAU + '/bios/' + os.path.basename(f)
        bios = {b['nom']: b for b in json.load(open(fb))['personnes']} if os.path.exists(fb) else {}
        equipe = os.path.basename(f)[:-5]
        for fv in glob.glob(RESEAU + '/bios-verif/*.json'):   # vérification avec sources lues : remplace la piste
            for b in json.load(open(fv)).get('personnes', []) if fv.endswith('.json') and 'liste' not in fv else []:
                if b.get('equipe') == equipe: bios[b['nom']] = b
        for b in RF.get('parcours', []):
            if b.get('nom') and (b.get('verification') == 'verifie' or b['nom'] not in bios): bios[b['nom']] = b
        for m in nd:
            b = bios.get(m['nom'])
            if not b: continue
            okb = b.get('verification') == 'verifie' and b.get('sources_parcours')
            if publique and not okb: continue
            # RGPD : parcours partisan publié seulement pour qui exerce ou a exercé un mandat ou une fonction gouvernementale
            if publique and not (m.get('qualite') or b.get('gouvernement')): continue
            m['partis'] = [dict(x, parti=re.sub(r'\s*\((hors liste normalisée|non normalisé)[^)]*\)', '', x.get('parti') or '').strip()) for x in (b.get('partis') or []) if x.get('parti')]
            m['gouvernement'] = b.get('gouvernement') or []
            m['sources_parcours'] = (b.get('sources_parcours') or [])[:2]
            if m['cercle'] == 1:
                m['idees'] = [i for i in (b.get('idees') or [])[:2] if i.get('source') or not publique]
            if not publique: m['bio_verification'] = b.get('verification'); m['bio_note'] = b.get('note')
        cand = r.get('candidature') or {}
        cand_ok = cand.get('verification') == 'verifie' and cand.get('source')
        e = {'date': '25/11/2026', 'noeuds': nd,
             'candidature': {'statut': cand.get('statut')} if (cand_ok or not publique) and cand.get('statut') else None}
        if not publique: e['ecartes'] = r.get('ecartes', []); e['notes'] = r.get('notes', [])
        assert set(PREMIER.get(nom, [])) <= {n['nom'] for n in r['noeuds']}, nom
        out[nom] = e
    return out
EQ_PUB, EQ_TRAV = equipes(True), equipes(False)
for d in (EQ_PUB, EQ_TRAV):
    inconnus = set(d) - {cle(txt(c['nom'])) for c in J['C']}
    assert not inconnus, inconnus

pub, trav = [], []
# ---------------------------------------------------------------- Europe, OTAN, référendums (relevé du 26/11/2026)
AX2 = os.environ.get('AX2', DONNEES + '/axes2')
AX3 = os.environ.get('AX3', DONNEES + '/axes3')
def lots():
    # relevé avec sources lues (axes3) prioritaire, ancien relevé (axes2) seulement pour qui n'y figure pas
    import glob
    par = {}
    for f in sorted(glob.glob(AX2 + '/lot*.json')):
        for e in json.load(open(f)): par[e['i']] = dict(e, _v=2)
    for f in sorted(glob.glob(AX3 + '/lot*.json')):
        for e in json.load(open(f)): par[e['i']] = dict(e, _v=3)
    return list(par.values())
UKR = os.environ.get('UKR', DONNEES + '/ukraine')
QUESTIONS_UE = ('ue_maintien', 'ue_traites', 'ue_primaute', 'ue_budget', 'ue_defense')
SLUG = {i: re.search(r'([^/]+)\.webp$', c['mini']).group(1) for i, c in enumerate(J['C'])}
def sujet_ref(x):
    x = re.sub(r'^autre\s*:\s*', '', (x or 'autre').strip(), flags=re.I)
    x = {'idéologie islamiste': 'idéologies islamistes'}.get(x.lower(), x)
    return x if x == 'RIC' else x[:1].upper() + x[1:]
# relecture : dépêche AFP datée et explicite (reprise par La Gazette France) = vérifiée, comme pour les équipes
CORR2 = {('François Hollande', 'europe'): {'verification': 'verifie'},
         ('Natacha Polony', 'ue_defense'): {'verification': 'a_verifier'},
         ('Raphaël Glucksmann', 'ue_traites'): {'verification': 'a_verifier'},
         ('Nicolas Dupont‑Aignan', 'ue_traites'): {'verification': 'a_verifier'},
         # Ukraine : déclaration d'un député et non du candidat ; « avoirs russes gelés » rangés par interprétation dans les sanctions
         ('Gabriel Attal', 'aide_militaire'): {'verification': 'a_verifier'}, ('Gabriel Attal', 'troupes'): {'verification': 'a_verifier'},
         ('Gabriel Attal', 'sanctions'): {'verification': 'a_verifier'}, ('Raphaël Glucksmann', 'sanctions'): {'verification': 'a_verifier'},
         ('Marine Tondelier', 'sanctions'): {'verification': 'a_verifier'},
         ('Édouard Philippe', 'aide_militaire'): {'verification': 'a_verifier'},   # déduit de « soutien plein »
         ('Édouard Philippe', 'sanctions'): {'verification': 'a_verifier'},        # avoirs gelés
         ('Édouard Philippe', 'troupes'): {'verification': 'a_verifier'},          # troupes « européennes », participation française non précisée
         ('Marine Le Pen', 'troupes'): {'verification': 'a_verifier'},             # 2025, nuancée en janvier 2026 (mandat ONU)
         ('Florian Philippot', 'aide_militaire'): {'verification': 'a_verifier'},  # messages relayés via une traduction TASS, pas de média national
         ('Florian Philippot', 'troupes'): {'verification': 'a_verifier'},
         ('Éric Zemmour', 'aide_militaire'): {'verification': 'a_verifier'},          # reformulation du journaliste, sans citation ni date
         ('Nicolas Dupont‑Aignan', 'aide_militaire'): {'verification': 'a_verifier'},
         ('Bruno Retailleau', 'aide_militaire'): {'verification': 'a_verifier'},      # « au même niveau », sans préciser militaire ou financière
         ('Marine Le Pen', 'aide_militaire'): {'reponse': 'maintenir', 'texte': 'Maintenir la formation et les dons de matériel ; arrêter l’aide financière après six mois'},
         ('Raphaël Glucksmann', 'aide_militaire'): {'texte': 'Augmenter l’aide militaire et financière, financée par les avoirs russes gelés plutôt que par le contribuable'},
         ('Édouard Philippe', 'troupes'): {'verification': 'verifie'},             # question élargie aux soldats européens
         ('Teddy Riner', 'troupes'): {'texte': 'Contre l’envoi actuel de militaires français en Ukraine (« pas notre guerre », 25/11/2026)'}}   # juillet 2025, remplacé depuis par la sortie de l'UE   # déduit de la suppression du veto, la source ne parle pas des traités   # « non » interprété : elle refuse un marché unique piloté par la Commission
AX4 = os.environ.get('AX4', DONNEES + '/axes4')
Q4 = {'europe': ('ue_maintien', 'ue_traites', 'ue_primaute', 'ue_budget', 'ue_emprunt', 'ue_defense_commune', 'ue_cooperation_defense'),
      'otan': ('otan_alliance', 'otan_commandement', 'otan_pilier'),
      'ukraine': ('aide_militaire', 'aide_financiere', 'avoirs', 'troupes', 'adhesion_ue', 'sanctions')}
CORR4 = {}   # relecture de la grille fine : (nom, question) -> champs corrigés
# Décision du 26/11/2026 : une position rapportée par un média national daté, sans citation directe du candidat,
# est publiée et signalée « rapportée par un média ». Restent exclues : les déductions, les relais de tiers
# (réseaux sociaux), les sources non lues et les chaînes passant par des médias d'État étrangers.
RAP = {'verification': 'verifie', 'rapporte': True}
# 3e audit (26/11/2026) : Business AM et Forbes Ukraine ne sont pas des médias nationaux français -> Retailleau ue_budget et adhesion_ue non publiés
for _k in [('Fabien Roussel', 'adhesion_ue'), ('Raphaël Glucksmann', 'ue_maintien'), ('Édouard Philippe', 'otan_pilier'),
           ('Édouard Philippe', 'aide_militaire'), ('Natacha Polony', 'ue_budget'), ('Nicolas Dupont-Aignan', 'sanctions')]:
    CORR4[_k] = dict(RAP)
CORR4[('Bruno Retailleau', 'aide_militaire')] = {'reponse': None}     # l'article ne dit pas si l'aide est militaire : reclassée en aide financière (Public Sénat)
CORR4[('Teddy Riner', 'troupes')] = {'reponse': 'non_pendant'}       # « pas notre guerre » : vise l'envoi pendant le conflit, rien sur l'après
REF_RAP = [('Gabriel Attal', 'règle d'), ('Marine Le Pen', 'islamistes')]   # référendums rapportés par un média
# Public Sénat du 16/11/2026, relu le 26/11/2026 : formulations du journaliste (sauf mention d'une citation)
PS = ['Public Sénat, « Aide à l’Ukraine : que proposent les candidats à la présidentielle ? »', 'https://www.publicsenat.fr/actualites/international/aide-a-lukraine-que-proposent-les-candidats-a-la-presidentielle', '16/11/2026']
AJOUT4 = {
    ('Éric Zemmour', 'aide_militaire'): {'reponse': 'arreter', 'texte': 'Selon Public Sénat, veut mettre fin à toute forme de soutien à l’Ukraine et privilégier la voie diplomatique (formulation du journaliste)', 'source': PS},
    ('Nicolas Dupont-Aignan', 'aide_militaire'): {'reponse': 'arreter', 'texte': 'Selon Public Sénat, veut mettre fin à toute forme de soutien à l’Ukraine et privilégier la voie diplomatique (formulation du journaliste)', 'source': PS},
    ('Jean-Luc Mélenchon', 'troupes'): {'reponse': 'non', 'texte': 'Position de LFI : l’envoi de forces au sol fait partie de ses lignes rouges, selon Public Sénat (formulation du journaliste)', 'source': PS},
    ('Jean-Luc Mélenchon', 'adhesion_ue'): {'reponse': 'contre', 'texte': 'Position de LFI : l’adhésion risquerait « d’aggraver sans précédent le dumping social qui fracture déjà l’UE » (communiqué cité par Public Sénat)', 'source': PS},
    ('Raphaël Glucksmann', 'adhesion_ue'): {'reponse': 'pour', 'texte': 'Selon Public Sénat, favorable à l’entrée de l’Ukraine dans l’Union européenne (formulation du journaliste)', 'source': PS},
}
AJOUT4.update({
    ('Bruno Retailleau', 'aide_financiere'): {'reponse': 'maintenir', 'texte': 'Selon Public Sénat (propos sur BFMTV), veut maintenir l’aide à l’Ukraine au même niveau (formulation du journaliste)', 'source': PS},
    ('Édouard Philippe', 'aide_financiere'): {'reponse': 'maintenir', 'texte': 'Programme : « soutien plein à l’Ukraine » ; selon Public Sénat, juge essentiel le soutien militaire et financier à Kiev', 'source': PS},
    ('Édouard Philippe', 'avoirs'): {'reponse': 'oui', 'texte': 'Selon Public Sénat, favorable à la saisie des avoirs russes gelés (formulation du journaliste)', 'source': PS},
})
for _v in AJOUT4.values(): _v.update(RAP)
AJOUT4.update({   # déclarations directes
    ('Gabriel Attal', 'avoirs'): {'reponse': 'oui', 'texte': 'Saisir les avoirs russes : « faire payer les Russes avant les Français et les Européens »', 'source': ['Assemblée nationale (question au Gouvernement n° 433, G. Attal)', 'https://www.assemblee-nationale.fr/dyn/17/questions/QANR5L17QG433', '05/03/2025'], 'verification': 'verifie'},
    ('Raphaël Glucksmann', 'avoirs'): {'reponse': 'oui', 'texte': 'Saisir les quelque 210 Md€ d’avoirs russes gelés en Europe et les affecter à la défense de l’Ukraine', 'source': ['Public Sénat (citant le débat de la primaire sur LCI du 23/09/2026)', 'https://www.publicsenat.fr/actualites/international/aide-a-lukraine-que-proposent-les-candidats-a-la-presidentielle', '16/11/2026'], 'verification': 'verifie'},
})
AJOUT4[('Jean-Luc Mélenchon', 'adhesion_ue')].pop('rapporte')   # citation du communiqué de LFI : pas une reformulation
def lots4():
    import glob
    out = []
    for f in sorted(glob.glob(AX4 + '/lot*.json')): out += json.load(open(f))
    return out
def positions4(publique):
    res = {'format': 4, 'europe': {}, 'otan': {}, 'ukraine': {}, 'referendums': {}}
    ok = lambda x: x and x.get('source') and (x.get('verification') == 'verifie' or not publique)
    for e in lots4():
        sl = SLUG[e['i']]
        for th, qs in Q4.items():
            D = {}
            for q in qs:
                x = e.get(q)
                if not (x and x.get('reponse')) and (cle(e['nom']), q) in AJOUT4: x = AJOUT4[(cle(e['nom']), q)]
                if x: x = dict(x, **CORR4.get((cle(e['nom']), q), {}))
                if ok(x) and x.get('reponse'):
                    t = x.get('texte') or ''
                    D[q] = {'r': x['reponse'], 'txt': t, 'source': x['source'][:3], 'ok': x.get('verification') == 'verifie'}
                    if x.get('rapporte'): D[q]['rap'] = True
                    if re.search(r"^Position (de|du) |\(position d[eu] ", t): D[q]['parti'] = True   # position officielle du parti, pas du candidat
            if D: res[th][sl] = D
        refs = []
        for r in (e.get('referendums') or []):
            if any(n == cle(e['nom']) and m in (r.get('sujet') or '') for n, m in REF_RAP): r = dict(r, **RAP)
            if ok(r):
                refs.append({'sujet': sujet_ref(r.get('sujet')), 'txt': r.get('texte') or '', 'source': r['source'][:3], 'ok': r.get('verification') == 'verifie'})
                if r.get('rapporte'): refs[-1]['rap'] = True
                if re.search(r"^Position (de|du) |\(position d[eu] ", r.get('texte') or ''): refs[-1]['parti'] = True
        if refs: res['referendums'][sl] = refs
    return res

def positions2(publique):
    res = {'europe': {}, 'otan': {}, 'referendums': {}, 'ukraine': {}}
    ok = lambda x: x and x.get('source') and (x.get('verification') == 'verifie' or not publique)
    for e in lots():
        if publique and e['_v'] == 2: continue   # ancien relevé (extraits non lus) : version de travail seulement
        sl = SLUG[e['i']]
        if e['_v'] == 3:
            qs = {}
            for q in QUESTIONS_UE:
                x = e.get(q)
                if x: x = dict(x, **CORR2.get((e['nom'], q), {}))
                if ok(x) and x.get('reponse'):
                    qs[q] = {'r': x['reponse'], 'txt': x.get('texte') or '', 'source': x['source'][:3], 'ok': x.get('verification') == 'verifie'}
            if qs: res['europe'][sl] = qs
        x = e.get('otan')
        if x: x = dict(x, **CORR2.get((e['nom'], 'otan'), {}))
        cat = x and (x.get('reponse') or x.get('categorie'))
        if ok(x) and cat:
            res['otan'][sl] = {'cat': cat, 'txt': x.get('texte') or '', 'source': x['source'][:3], 'ok': x.get('verification') == 'verifie'}
        refs = [{'sujet': sujet_ref(r.get('sujet')), 'txt': r.get('texte') or '', 'source': r['source'][:3], 'ok': r.get('verification') == 'verifie'} for r in (e.get('referendums') or []) if ok(r)]
        if refs: res['referendums'][sl] = refs
    import glob
    for f in sorted(glob.glob(UKR + '/lot*.json')):
        for e in json.load(open(f)):
            qs = {}
            for q in ('aide_militaire', 'troupes', 'adhesion_ue', 'sanctions'):
                x = e.get(q)
                if x: x = dict(x, **CORR2.get((e['nom'], q), {}))
                if ok(x) and x.get('reponse'):
                    t = x.get('texte') or ''
                    if e['nom'] == 'Jean-Luc Mélenchon' and 'LFI' not in t: t += ' (position de LFI)'
                    qs[q] = {'r': x['reponse'], 'txt': t, 'source': x['source'][:3], 'ok': x.get('verification') == 'verifie'}
            if qs: res['ukraine'][SLUG[e['i']]] = qs
    return res
def quinquennat(publique):
    Q = os.environ.get('QUINQ', DONNEES + '/quinquennat')
    out = {}
    for k in ('chronologie', 'lois', 'indicateurs'):
        f = Q + '/' + k + '.json'
        L = json.load(open(f)) if os.path.exists(f) else []
        if publique: L = [{k2: v for k2, v in x.items() if k2 not in ('verification', 'note', 'notes')} for x in L if x.get('verification') == 'verifie' and x.get('source')]
        if k == 'indicateurs':   # une valeur infra-annuelle d'une autre nature (trimestre, glissement) n'est pas tracée dans la série annuelle
            AUTRE = {'croissance_pib': 'variation sur un trimestre', 'inflation': 'glissement sur un an', 'solde_commercial': 'total d’un seul trimestre'}
            for x in L:
                d = x.get('derniere')
                if d and x.get('cle') in AUTRE:
                    v = str(d['valeur']).replace('.', ',')
                    x['note_pub'] = 'Dernière donnée : ' + str(d['periode']) + ', ' + v + ' (' + AUTRE[x['cle']] + ', non tracée car ce n’est pas la même mesure).'
                    x['derniere'] = None
        if k == 'lois':
            for x in L:
                a = (x.get('adoption') or '').lower()
                x['mode'] = ('vote' if re.search(r'sans 49\.3', a) else '493' if '49.3' in a else 'congres' if 'congrès' in a
                             else 'decret' if re.search(r'réglementaire|décret|ordonnance', a) else 'vote')
        if k == 'indicateurs':
            SD = {'chomage': ['Insee, Informations rapides n° 270 (chômage, T3 2026)', 'https://insee.fr/en/statistiques/9132864', '10/11/2026'],
                  'taux_emploi': ['Insee, Informations rapides n° 270 (emploi, T3 2026)', 'https://insee.fr/en/statistiques/9132864', '10/11/2026'],
                  'dette_publique': ['Insee, Informations rapides n° 239 (dette, T2 2026)', 'https://www.insee.fr/fr/statistiques/fichier/version-html/9053525/IR239_Dette-2T26.pdf', '29/09/2026']}
            NP = {'chomage': 'Champ : France hors Mayotte jusqu’en 2023, France entière à partir de 2024 ; la dernière valeur trimestrielle est hors Mayotte.',
                  # contre-vérification du 26/11/2026
                  'croissance_pib': 'Valeurs 2021 et 2022 : Insee, « Évolution du PIB et de ses composantes, données annuelles de 1950 à 2025 » (insee.fr/fr/statistiques/2830613).',
                  'solde_commercial': 'En milliards d’euros, série révisée de l’Aperçu de septembre 2026 ; le bilan annuel du 9/02/2026 donnait −69,2 Md€ pour 2025 en données brutes.',
                  'pauvrete': 'Champ : France métropolitaine ; rupture de série en 2020 (nouvelle chaîne de l’enquête Revenus fiscaux et sociaux).',
                  'premiers_titres_sejour': 'Valeur 2025 provisoire.',
                  'emissions_ges': 'Valeur 2025 : estimation provisoire, à confirmer dans l’inventaire de mi-2027 ; 2024 est consolidé.'}
            for x in L:
                if x.get('cle') in SD and x.get('derniere'): x['source_derniere'] = SD[x['cle']]
                if x.get('cle') in NP: x['note_pub'] = (NP[x['cle']] + ' ' + (x.get('note_pub') or '')).strip()
        if k == 'chronologie': L.sort(key=lambda x: (x.get('date') or '')[6:] + (x.get('date') or '')[3:5] + (x.get('date') or '')[:2])
        if k == 'lois': L.sort(key=lambda x: (x.get('date_promulgation') or '')[6:] + (x.get('date_promulgation') or '')[3:5] + (x.get('date_promulgation') or '')[:2])
        out[k] = L
    return out

def axe_defense(publique):
    pos = {}
    for e in (lots4() or lots()):
        e.setdefault('_v', 4)
        if publique and e['_v'] == 2: continue
        x = e.get('defense_pib')
        if not (x and x.get('valeur') is not None and x.get('source')): continue
        if publique and x.get('verification') != 'verifie': continue
        v = float(x['valeur']); h = x.get('horizon')
        pos[SLUG[e['i']]] = {'a': v, 'b': v, 'txt': (str(v).replace('.0', '').replace('.', ',') + ' % du PIB' + (' en ' + str(h) if h else '')),
                             'source': x['source'][:3], 'publiable': x.get('verification') == 'verifie'}
    if not pos: return {}
    return {'otan': {'titre': 'Budget de défense visé, en % du PIB',
        'sous': 'Objectif que chacun donne lui-même, avec son horizon.',
        'min': 1.5, 'max': 5.5, 'graduations': [[v, str(v).replace('.', ',') + ' %'] for v in (2, 2.5, 3, 3.5, 4, 4.5, 5)],
        'positions': pos, 'autres': [], 'sansTexte': 'Pas d’objectif chiffré identifié',
        'note': 'Seulement le chiffre que chacun donne, avec sa source.'}}

for i, c in enumerate(J['C']):
    b = base(c, i)
    b['espace'] = {'Laurent Wauquiez': 'retrait'}.get(b['nom'], espace(INT[b['nom']]['candidature']['statut']))   # LR a investi Retailleau
    fp = PUB[b['nom']]
    if not (fp.get('identite') or {}).get('sources'): fp = dict(fp, identite={'sources': []})   # identité non sourcée : absente du site public
    pub.append(dict({k: v for k, v in b.items() if k not in ('phrase', 'quand', 'anecdotes')}, f=fp, equipe=EQ_PUB.get(b['nom'])))
    trav.append(dict({k: v for k, v in b.items() if k not in ('phrase', 'quand', 'anecdotes')}, f=interne(INT[b['nom']]), equipe=EQ_TRAV.get(b['nom'])))

modele = open(ICI + '/modele.html').read()
def ecrire(dossier, donnees, est_interne):
    os.makedirs(ICI + '/' + dossier + '/img', exist_ok=True)
    for p in donnees: shutil.copy(f"{ICI}/img/{p['slug']}.webp", f"{ICI}/{dossier}/img/")
    for q in ('q-borne', 'q-bayrou', 'jeu-logo', 'jeu-partie'): shutil.copy(f"{ICI}/img/{q}.webp", f"{ICI}/{dossier}/img/")
    for q in ('logo-trombi.webp', 'icone-trombi-32.png', 'icone-trombi-180.png'): shutil.copy(f"{ICI}/img/{q}", f"{ICI}/{dossier}/img/")
    h = modele.replace('/*DONNEES*/', json.dumps(donnees, ensure_ascii=False).replace('</', '<\\/'))
    h = h.replace('/*INTERNE*/false', 'true' if est_interne else 'false')
    h = h.replace('/*AXES*/{}', json.dumps(dict(axes(not est_interne), **axe_defense(not est_interne)), ensure_ascii=False).replace('</', '<\\/'))
    h = h.replace("'/*CONTACT*/'", json.dumps(os.environ.get('CONTACT', '')))
    h = h.replace("'/*DON*/'", json.dumps(os.environ.get('DON', 'https://ko-fi.com/jeromehosdez')))   # page de dons (Ko-fi) ; DON='' la masque
    h = h.replace("'/*JEU*/'", json.dumps(os.environ.get('JEU', 'https://claude.ai/artifact/Anm66e7aUxudHeaKVphekT')))   # site du jeu
    h = h.replace("'/*JEU_PARTIE*/'", json.dumps(os.environ.get('JEU_PARTIE', 'https://claude.ai/artifact/Lr13UVdrBU6mtgAwh4MJui')))   # le jeu lui-même
    h = h.replace('/*QUINQ*/{}', json.dumps(quinquennat(not est_interne), ensure_ascii=False).replace('</', '<\\/'))
    h = h.replace('/*POS2*/{}', json.dumps(positions4(not est_interne) if lots4() else positions2(not est_interne), ensure_ascii=False).replace('</', '<\\/'))
    if est_interne:
        h = h.replace('<!--BANDEAU-->', '<div class="bandeau" role="note">Version de travail privée : elle contient des données non validées, dont le volet judiciaire. Ne pas partager.</div>')
        h = h.replace('<!--NAVQUIZ-->', '<a href="#apprendre" data-g="apprendre">Le quiz</a>').replace('<!--NAVVALIDER-->', '<a href="#valider" class="outil">À valider</a>').replace('<!--NAVJUSTICE-->', '<a href="#categories" class="outil">Justice par catégorie</a>')
        h = h.replace('<title>Le Trombi 2027 · Les fiches de la présidentielle</title>', '<title>Le Trombi 2027 : version de travail</title>')
    else:
        assert '"a_verifier"' not in h and '"verification"' not in h.split('id="donnees">')[1], 'donnée interne dans le site public'
        AUTORISES = {'condamnation_premiere_instance', 'condamnation_appel', 'condamnation_definitive', 'relaxe', 'non_lieu', 'classement_sans_suite',
                     'plainte_irrecevable', 'acquittement', 'demande_rejetee', 'decision_juridictionnelle', 'ineligibilite', 'sanction', 'jugement_premiere_instance', 'arret_appel', 'decision_definitive'}
        for p in donnees:
            for j in p['f']['justice']:
                assert j['stade'] in AUTORISES, (p['nom'], j['stade'])
    open(f'{ICI}/{dossier}/index.html', 'w').write(h)
    print(dossier, len(h))

ecrire('public', pub, False)
# verso des cartes du jeu : les mêmes fiches publiques que le site, sans le volet judiciaire (le jeu ne le montre pas)
os.makedirs(ICI + '/export', exist_ok=True)
FJ = {p['nom']: dict({k: v for k, v in p['f'].items() if k not in ('justice', 'justice_mention')}, slug=p['slug']) for p in pub}
open(ICI + '/export/fiches.js', 'w').write('''/* Versos factuels de Retourne ta veste — EXPORT PUBLIC.
   Mêmes fiches que le site « Les fiches de la présidentielle 2027 » (version publique), sans le volet judiciaire.
   Généré par site-fiches/construire.py : ne pas modifier à la main, corriger les données du site puis régénérer. */
(function(){
window.APDA = window.APDA || {};
window.APDA.VERIFIE_FICHES = '26/11/2026';
window.APDA.FICHES = ''' + json.dumps(FJ, ensure_ascii=False, indent=1) + ''';
})();
''')
if os.path.isdir(CARTE2):   # le verso des cartes du jeu suit le site : même fichier, recopié à chaque construction
    shutil.copy(ICI + '/export/fiches.js', CARTE2 + '/fiches.js')
print('export jeu', len(FJ), 'fiches, recopié dans carte2/fiches.js' if os.path.isdir(CARTE2) else 'fiches')
ecrire('travail', trav, True)
