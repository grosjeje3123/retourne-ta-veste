import re
P = '/home/claude/valeurs/bloc_donnees.js'
s = open(P, encoding='utf-8').read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:70], s.count(a)); s = s.replace(a, b)
rep("justice: 'Condamnations définitives, dont complicité de provocation à la haine (mineurs isolés, 2025) et diffamation (Ined, 2026). Enquête (2022) sur des SMS ciblés de sa campagne&nbsp;: issue non connue.'",
    "justice: 'Condamnations définitives, dont complicité de provocation à la haine (mineurs isolés, 2025) et diffamation (Ined, 2026). Enquête sur ses SMS ciblés de 2022, issue non connue.'")
rep("['Courrier de l’Atlas', 'https://www.lecourrierdelatlas.com/?p=182261']", "['Hespress', 'https://fr.hespress.com/258309-258309.html']")
rep("['Europe&nbsp;1 (Le Parisien)', 'https://www.europe1.fr/node/708835']", "['Europe&nbsp;1', 'https://www.europe1.fr/node/708835']")
# Date de vérification des cartes revues aujourd'hui
for nom in ['Jean-Luc Mélenchon', 'Marine Tondelier', 'François Hollande', 'Édouard Philippe', 'Gérald Darmanin',
            'Nicolas Dupont', 'Marine Le Pen', 'Éric Zemmour', 'Jordan Bardella', 'Sarah Knafo', 'Teddy Riner']:
    i = s.index("nom: '" + nom); j = s.find("nom: '", i + 10); j = len(s) if j == -1 else j
    b = s[i:j]
    b2, n = re.subn(r"(blocSource: '(?:[^'\\]|\\.)*')(, verifie: '[^']*')?", r"\1, verifie: '19/11/2026'", b, count=1)
    assert n == 1, nom
    s = s[:i] + b2 + s[j:]
open(P, 'w', encoding='utf-8').write(s); print('ok')
