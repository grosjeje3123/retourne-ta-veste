# Calcule les 4 valeurs (1 à 10) des 16 cartes candidat.
# Règle : valeur = arrondi(1 + 9 × (nombre de rivaux strictement battus) / 15).
import json
FIN = (2026, 11)  # mois de calcul (inclus comme borne de fin)

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

N = '2026-11'
NATIONAL = {
 'Nathalie Arthaud': [],
 'Jean-Luc Mélenchon': [('1986-10','2000-03'),('2000-03','2002-05'),('2004-10','2010-01'),('2009-07','2017-06'),('2017-06','2022-06')],
 'Fabien Roussel': [('2017-06','2024-06')],
 'François Ruffin': [('2017-06',N)],
 'Marine Tondelier': [],
 'Raphaël Glucksmann': [('2019-07',N)],
 'Gabriel Attal': [('2017-06','2018-11'),('2018-10','2024-09'),('2024-07',N)],
 'Édouard Philippe': [('2012-06','2017-05'),('2017-05','2020-07')],
 'Dominique de Villepin': [('2002-05','2007-05')],
 'Teddy Riner': [],
 'Natacha Polony': [],
 'Bruno Retailleau': [('1994-11','1997-04'),('2004-10','2024-10'),('2024-09','2025-10'),('2025-11',N)],
 'David Lisnard': [],
 'Nicolas Dupont-Aignan': [('1997-06','2024-07')],
 'Marine Le Pen': [('2004-07','2017-06'),('2017-06',N)],
 'Éric Zemmour': [],
}
LOCAL = {
 'Nathalie Arthaud': [('2008-03','2014-03')],
 'Jean-Luc Mélenchon': [('1983-03','2001-03'),('1985-03','1992-03'),('1998-03','2004-03')],
 'Fabien Roussel': [('2014-03',N)],
 'François Ruffin': [],
 'Marine Tondelier': [('2014-03','2026-03'),('2021-07',N)],
 'Raphaël Glucksmann': [],
 'Gabriel Attal': [('2014-03',N)],
 'Édouard Philippe': [('2001-03',N)],
 'Dominique de Villepin': [],
 'Teddy Riner': [],
 'Natacha Polony': [],
 'Bruno Retailleau': [('1988-10','2015-04'),('1998-03','2004-04'),('2015-12',N)],
 'David Lisnard': [('2001-03',N)],
 'Nicolas Dupont-Aignan': [('1995-06',N)],
 'Marine Le Pen': [('1998-03','2021-07'),('2008-03','2011-02'),('2021-07','2025-04')],
 'Éric Zemmour': [],
}
VOIX = json.load(open('/home/claude/valeurs/voix.json'))
vues = json.load(open('/home/claude/valeurs/vues.json'))

def cle_sond(nom):
    for k in sond:
        if k.split()[-1].lower() in nom.lower() or nom.lower().endswith(k.lower()): return k
    raise KeyError(nom)

noms = list(NATIONAL)
brut = {}
for n in noms:
    brut[n] = {
        'sondages': VOIX[n][0],
        'national': union(NATIONAL[n]),
        'local': union(LOCAL[n]),
        'vues': int(round(__import__('statistics').median(vues[n]['detail']))),
    }

DEVANCE = {}
def notes(cle):
    vals = {n: brut[n][cle] for n in noms}
    out = {}
    for n in noms:
        bat = sum(1 for m in noms if vals[m] < vals[n])
        DEVANCE.setdefault(n, []).append(bat)
        out[n] = round(1 + 9 * bat / 15)
    return out

res = {c: notes(c) for c in ('sondages', 'national', 'local', 'vues')}
final = {}
for n in noms:
    final[n] = {'brut': brut[n], 'valeurs': [res['sondages'][n], res['national'][n], res['local'][n], res['vues'][n]], 'devance': DEVANCE[n]}
    assert all(final[n]['valeurs'][k] == round(1 + 9 * DEVANCE[n][k] / 15) for k in range(4))
json.dump(final, open('/home/claude/valeurs/valeurs.json', 'w'), ensure_ascii=False, indent=1)
print(f"{'Nom':24} {'Sond':>6} {'Nat(a)':>7} {'Loc(a)':>7} {'Vues':>10} | H D B G")
for n in noms:
    b = brut[n]
    print(f"{n:24} {b['sondages']:>9} {b['national']/12:7.1f} {b['local']/12:7.1f} {str(b['vues']):>10} | {final[n]['valeurs']}")
