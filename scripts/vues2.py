import json, subprocess, urllib.parse, time
res = json.load(open('/home/claude/valeurs/vues.json'))
for nom, v in res.items():
    if 'total' in v: continue
    url = ('https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/'
           + urllib.parse.quote(v['article'], safe='') + '/monthly/2025110100/2026103100')
    for essai in range(4):
        time.sleep(12 + essai * 20)
        out = subprocess.run(['curl', '-sS', '-m', '20', '-A', 'apeupresdaccord/0.1 (jeu de cartes; contact via claude.ai)', url], capture_output=True, text=True).stdout
        try:
            items = json.loads(out)['items']
            res[nom] = {'article': v['article'], 'mois': len(items), 'total': sum(i['views'] for i in items)}
            break
        except Exception:
            continue
    json.dump(res, open('/home/claude/valeurs/vues.json', 'w'), ensure_ascii=False, indent=1)
    print(nom, res[nom].get('total', 'ÉCHEC'), flush=True)
