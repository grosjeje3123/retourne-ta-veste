import json, subprocess, urllib.parse, sys
ARTICLES = {
 'Nathalie Arthaud':'Nathalie_Arthaud','Jean-Luc Mélenchon':'Jean-Luc_Mélenchon','Fabien Roussel':'Fabien_Roussel',
 'François Ruffin':'François_Ruffin','Marine Tondelier':'Marine_Tondelier','Raphaël Glucksmann':'Raphaël_Glucksmann',
 'Gabriel Attal':'Gabriel_Attal','Édouard Philippe':'Édouard_Philippe','Dominique de Villepin':'Dominique_de_Villepin',
 'Teddy Riner':'Teddy_Riner','Natacha Polony':'Natacha_Polony','Bruno Retailleau':'Bruno_Retailleau',
 'David Lisnard':'David_Lisnard','Nicolas Dupont-Aignan':'Nicolas_Dupont-Aignan','Marine Le Pen':'Marine_Le_Pen','Éric Zemmour':'Éric_Zemmour'}
res = {}
for nom, art in ARTICLES.items():
    url = ('https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/'
           + urllib.parse.quote(art, safe='') + '/monthly/2025110100/2026103100')
    out = subprocess.run(['curl', '-sS', '-m', '20', '-A', 'apeupresdaccord/0.1 (jeu de cartes)', url], capture_output=True, text=True).stdout
    try:
        items = json.loads(out)['items']
        res[nom] = {'article': art, 'mois': len(items), 'total': sum(i['views'] for i in items)}
    except Exception as e:
        res[nom] = {'article': art, 'erreur': out[:200]}
json.dump(res, open('/home/claude/valeurs/vues.json', 'w'), ensure_ascii=False, indent=1)
for n, v in sorted(res.items(), key=lambda x: -x[1].get('total', 0)):
    print(f"{n:24s} {v.get('mois','?'):>3} mois  {v.get('total', v.get('erreur'))}")
