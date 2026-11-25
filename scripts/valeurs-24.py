# Calcule les 4 valeurs (1 à 10) de toutes les cartes candidat.
# Règle : valeur = arrondi(1 + 9 × (nombre de rivaux strictement battus) / (N − 1)), N = nombre de cartes candidat.
import json, statistics, math

def mois(s):
    a, m = s.split('-'); return int(a) * 12 + int(m) - 1

def union(intervalles):
    pts = sorted((mois(a), mois(b)) for a, b in intervalles)
    tot, cur = 0, None
    for a, b in pts:
        if cur is None or a > cur[1]:
            if cur: tot += cur[1] - cur[0]
            cur = [a, b]
        else:
            cur[1] = max(cur[1], b)
    if cur: tot += cur[1] - cur[0]
    return tot  # en mois

N = '2026-11'  # mois de calcul (borne de fin des mandats en cours)

# Ordre d'affichage = ordre des cartes dans bloc_donnees.js (par bloc, de gauche à droite, divers au milieu).
ORDRE = [
 'Nathalie Arthaud', 'Jean-Luc Mélenchon',
 'Fabien Roussel', 'François Ruffin', 'Marine Tondelier', 'Raphaël Glucksmann', 'François Hollande', 'Clémentine Autain',
 'Gabriel Attal', 'Édouard Philippe', 'Aurore Bergé',
 'Dominique de Villepin', 'Teddy Riner', 'Natacha Polony', 'Juan Branco', 'Jean Lassalle',
 'Bruno Retailleau', 'David Lisnard', 'Nicolas Dupont-Aignan', 'Xavier Bertrand',
 'Marine Le Pen', 'Éric Zemmour', 'Jordan Bardella', 'Sarah Knafo',
]

# Mandats nationaux : député, sénateur, député européen, membre du gouvernement, président de la République.
NATIONAL = {
 'Nathalie Arthaud': [],
 'Jean-Luc Mélenchon': [('1986-10','2000-03'),('2000-03','2002-05'),('2004-10','2010-01'),('2009-07','2017-06'),('2017-06','2022-06')],
 'Fabien Roussel': [('2017-06','2024-06')],
 'François Ruffin': [('2017-06',N)],
 'Marine Tondelier': [],
 'Raphaël Glucksmann': [('2019-07',N)],
 'François Hollande': [('1988-06','1993-04'),('1997-06','2012-05'),('2012-05','2017-05'),('2024-07',N)],
 'Clémentine Autain': [('2017-06',N)],
 'Gabriel Attal': [('2017-06','2018-11'),('2018-10','2024-09'),('2024-07',N)],
 'Édouard Philippe': [('2012-06','2017-05'),('2017-05','2020-07')],
 'Aurore Bergé': [('2017-06','2023-08'),('2023-07','2024-09'),('2024-07','2025-01'),('2024-12',N)],
 'Dominique de Villepin': [('2002-05','2007-05')],
 'Teddy Riner': [],
 'Natacha Polony': [],
 'Juan Branco': [],
 'Jean Lassalle': [('2002-06','2022-06')],
 'Bruno Retailleau': [('1994-11','1997-04'),('2004-10','2024-10'),('2024-09','2025-10'),('2025-11',N)],
 'David Lisnard': [],
 'Nicolas Dupont-Aignan': [('1997-06','2024-07')],
 'Xavier Bertrand': [('2002-06','2016-01')],
 'Marine Le Pen': [('2004-07','2017-06'),('2017-06',N)],
 'Éric Zemmour': [],
 'Jordan Bardella': [('2019-07',N)],
 'Sarah Knafo': [('2024-07',N)],
}
# Mandats locaux : conseiller municipal ou d'arrondissement, départemental, régional, adjoint, maire.
LOCAL = {
 'Nathalie Arthaud': [('2008-03','2014-03')],
 'Jean-Luc Mélenchon': [('1983-03','2001-03'),('1985-03','1992-03'),('1998-03','2004-03')],
 'Fabien Roussel': [('2014-03',N)],
 'François Ruffin': [],
 'Marine Tondelier': [('2014-03','2026-03'),('2021-07',N)],
 'Raphaël Glucksmann': [],
 'François Hollande': [('2001-03','2008-03'),('2008-03','2012-05')],
 'Clémentine Autain': [('2001-03','2008-03')],
 'Gabriel Attal': [('2014-03',N)],
 'Édouard Philippe': [('2001-03',N)],
 # Magny-les-Hameaux : élue en 2014, date de départ non trouvée, comptée jusqu'à la dernière mention (2017).
 'Aurore Bergé': [('2014-03','2017-06'),('2021-06',N)],
 'Dominique de Villepin': [],
 'Teddy Riner': [],
 'Natacha Polony': [],
 'Juan Branco': [],
 'Jean Lassalle': [('1977-03','2017-07'),('1982-03','2015-03')],
 'Bruno Retailleau': [('1988-10','2015-04'),('1998-03','2004-04'),('2015-12',N)],
 'David Lisnard': [('2001-03',N)],
 'Nicolas Dupont-Aignan': [('1995-06',N)],
 'Xavier Bertrand': [('1995-06','2010-11'),('1998-03','2002-06'),('2010-11','2016-01'),('2014-04','2020-07'),('2016-01',N)],
 'Marine Le Pen': [('1998-03','2021-07'),('2008-03','2011-02'),('2021-07','2025-04')],
 'Éric Zemmour': [],
 'Jordan Bardella': [('2015-12','2025-02')],
 'Sarah Knafo': [('2026-03',N)],
}
assert set(ORDRE) == set(NATIONAL) == set(LOCAL), set(ORDRE) ^ set(NATIONAL)
VOIX = json.load(open('/home/claude/valeurs/voix.json'))
vues = json.load(open('/home/claude/valeurs/vues.json'))

noms = ORDRE
NB = len(noms)
brut = {}
for n in noms:
    brut[n] = {
        'sondages': VOIX[n][0],   # nom historique de la clé : record de voix (côté ↑ Urnes)
        'national': union(NATIONAL[n]),
        'local': union(LOCAL[n]),
        'vues': int(round(statistics.median(vues[n]['detail']))),
    }

DEVANCE = {}
def notes(cle):
    vals = {n: brut[n][cle] for n in noms}
    out = {}
    for n in noms:
        bat = sum(1 for m in noms if vals[m] < vals[n])
        DEVANCE.setdefault(n, []).append(bat)
        out[n] = math.floor(1 + 9 * bat / (NB - 1) + 0.5)  # arrondi au plus proche, 0,5 vers le haut (comme Math.round côté page)
    return out

res = {c: notes(c) for c in ('sondages', 'national', 'local', 'vues')}
final = {}
for n in noms:
    final[n] = {'brut': brut[n], 'valeurs': [res['sondages'][n], res['national'][n], res['local'][n], res['vues'][n]], 'devance': DEVANCE[n]}
    assert all(final[n]['valeurs'][k] == math.floor(1 + 9 * DEVANCE[n][k] / (NB - 1) + 0.5) for k in range(4))
json.dump(final, open('/home/claude/valeurs/valeurs.json', 'w'), ensure_ascii=False, indent=1)
print(f"{NB} cartes, note = 1 + 9 × devancés ÷ {NB - 1}")
print(f"{'Nom':24} {'Voix':>9} {'Nat(a)':>7} {'Loc(a)':>7} {'Vues':>8} | ↑ → ↓ ←  total")
for n in noms:
    b = brut[n]; v = final[n]['valeurs']
    print(f"{n:24} {b['sondages']:>9} {b['national']/12:7.1f} {b['local']/12:7.1f} {b['vues']:>8} | {v} {sum(v)}")
