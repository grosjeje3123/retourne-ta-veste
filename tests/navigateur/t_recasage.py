"""Carrière au plancher (5 cartes) : une défaite fait perdre une carte, et une carte moyenne se recase chez le joueur."""
import json, sys
from playwright.sync_api import sync_playwright
sys.path.insert(0, '/home/claude/tests/navigateur')
from t_trophees_aide import choisir_niveau, jouer, fini, INIT
ok = ko = 0
def t(nom, cond, detail=''):
    global ok, ko
    if cond: ok += 1; print('   ok ', nom)
    else: ko += 1; print('   KO ', nom, detail)
DECK = ['leclerc', 'riner', 'branco', 'polony', 'pigasse']   # cinq cartes faibles : la défaite contre l'Élysée est probable
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    vu = False
    for graine in range(3, 40):
        ctx = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        pg = ctx.new_page(); err = []
        pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")
        pg.on('pageerror', lambda e: err.append(str(e)))
        pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
        pre = {'hemicycle-options': {'v': 2, 'niveau': 'elysee', 'regles': 'fleches'}, 'hemicycle-tuto-fleches': {'fait': 1}, 'hemicycle-carriere-ouverte': 1,
               'hemicycle-classeur': {'v': 1, 'cartes': DECK, 'main': DECK, 'gains': 1, 'pertes': 1, 'manches': 2}}
        pg.add_init_script(INIT % (graine, json.dumps(pre)))
        pg.emulate_media(reduced_motion='reduce')
        pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(600)
        pg.click('#t-solo'); pg.wait_for_timeout(300); pg.click('#b-carriere'); choisir_niveau(pg)
        pg.wait_for_selector('#b-go-carriere', timeout=8000); pg.wait_for_timeout(300); pg.click('#b-go-carriere'); pg.wait_for_timeout(600)
        titre = jouer(pg)
        cl = pg.evaluate("JSON.parse(localStorage.getItem('hemicycle-classeur'))")
        txt = pg.inner_text('#dialogue') if fini(pg) else ''
        print(f'graine {graine} : {titre} · deck {cl["cartes"]}')
        if titre and 'IA' in titre and 'l’emporte' in titre:
            t('défaite au plancher : le deck garde 5 cartes', len(cl['cartes']) == 5, cl['cartes'])
            t('une carte est partie, une autre est arrivée', len(set(cl['cartes']) - set(DECK)) == 1 and len(set(DECK) - set(cl['cartes'])) == 1, cl['cartes'])
            t('le bilan annonce le recasage', 'Recasage' in txt and 'se recase chez toi' in txt, txt[:300])
            t('la défaite est comptée', cl['pertes'] == 2)
            pg.screenshot(path='/tmp/pl/recasage.png', full_page=False)
            t('aucune erreur', not err, err[:2]); vu = True
        ctx.close()
        if vu: break
    t('une défaite a bien été observée', vu)
    nav.close()
print(f'\nt_recasage : {ok} OK, {ko} KO'); sys.exit(1 if ko else 0)
