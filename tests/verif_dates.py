"""Contrôle éditorial : toute date postérieure au jour de vérification doit être annoncée comme à venir
(« attendu », « prévu », « sera »…), jamais au passé. Usage : verif_dates.py [jj/mm/aaaa] (par défaut : aujourd'hui)."""
import datetime, re, sys
jour = datetime.date.today()
if len(sys.argv) > 1: j, m, a = map(int, sys.argv[1].split('/')); jour = datetime.date(a, m, j)
s = open('/home/claude/carte2/donnees.js', encoding='utf-8').read()
MOIS = 'janvier février mars avril mai juin juillet août septembre octobre novembre décembre'.split()
FUTUR = re.compile(r"attendu|attendue|prévu|prévue|sera |seront |doit |devra|à venir|programmé", re.I)
pb = 0
for ligne in s.split('\n'):
    if 'phrase:' in ligne: continue   # les citations gardent leurs propres temps
    dates = [datetime.date(int(a), int(m), int(j)) for j, m, a in re.findall(r"\b(\d{1,2})/(\d{1,2})/(20\d\d)\b", ligne)]
    dates += [datetime.date(int(a), MOIS.index(mo) + 1, int(j)) for j, mo, a in re.findall(r"\b(\d{1,2})(?:er)?(?:&nbsp;| )(%s)(?:&nbsp;| )(20\d\d)\b" % '|'.join(MOIS), ligne)]
    for d in dates:
        if d > jour and not FUTUR.search(ligne):
            pb += 1; print('À REVOIR (futur écrit au passé) :', d.isoformat(), '·', ligne.strip()[:160])
        elif d <= jour and FUTUR.search(ligne):
            pb += 1; print('À METTRE À JOUR (échéance passée) :', d.isoformat(), '·', ligne.strip()[:160])
print('dates à revoir :', pb or 'aucune', '(au', jour.strftime('%d/%m/%Y') + ')')
