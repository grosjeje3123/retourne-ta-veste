P = '/home/claude/valeurs/bloc_donnees.js'
s = open(P, encoding='utf-8').read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:70], s.count(a)); s = s.replace(a, b)
rep("en cassation, présumée innocente. Enquête judiciaire (2024) sur sa campagne 2022.'", "en cassation, présumée innocente. Instruction (2024) sur sa campagne 2022.'")
rep("justice: 'Plusieurs condamnations définitives, dont complicité de provocation à la haine (mineurs isolés, 2025) et diffamation (Ined, 2026). Enquête (2022)",
    "justice: 'Condamnations définitives, dont complicité de provocation à la haine (mineurs isolés, 2025) et diffamation (Ined, 2026). Enquête (2022)")
rep(",\n        ['Ined', 'https://www.ined.fr/fr/presse/condamnation-definitive-monsieur-eric-zemmour-et-monsieur-jean-christophe-thiery-bercegol-du']", "")
rep("['AFP (2025)', 'https://lepetitjournal.com/fil-afp/le-rn-perquisitionne", "['AFP', 'https://lepetitjournal.com/fil-afp/le-rn-perquisitionne")
rep("['Landot (JO, européennes)',", "['Landot (JO)',")
open(P, 'w', encoding='utf-8').write(s); print('ok')
