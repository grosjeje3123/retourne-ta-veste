"""Face-à-face : deux joueurs sur un téléphone. Écran de passage à chaque tour, couleurs fixes par joueur, bilan nommé, rien d'enregistré."""
import json, sys
from playwright.sync_api import sync_playwright
sys.path.insert(0, '/home/claude/tests/navigateur')
from t_trophees_aide import INIT, fini
ok = ko = 0
def t(nom, cond, detail=''):
    global ok, ko
    if cond: ok += 1; print('   ok ', nom)
    else: ko += 1; print('   KO ', nom, detail)
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    ctx = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2)
    pg = ctx.new_page(); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.add_init_script(INIT % (8, json.dumps({'hemicycle-options': {'v': 2, 'niveau': 'assemblee', 'regles': 'fleches'}, 'hemicycle-tuto-fleches': {'fait': 1}, 'hemicycle-bilan': {'v': 2, 'd': 1, 'n': 0}})))
    pg.emulate_media(reduced_motion='reduce')
    pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(600)
    tr0 = (pg.evaluate("JSON.parse(localStorage.getItem('hemicycle-trophees') || '{}')").get('parties') or 0)
    pg.click('#t-solo'); pg.wait_for_timeout(300)
    t('Solo ne propose plus le Face-à-face', not pg.query_selector('#b-local') and not pg.query_selector('#b-multi-local'))
    pg.click('#dialogue [data-fermer]'); pg.wait_for_timeout(200)
    t('tuile « Multijoueur »', 'Multijoueur' in pg.inner_text('#t-ligne'))
    pg.click('#t-ligne'); pg.wait_for_timeout(300)
    t('Multijoueur : Face-à-face et En ligne', pg.is_visible('#b-multi-local') and pg.is_visible('#b-multi-ligne'))
    pg.screenshot(path='/tmp/pl/multi.png')
    pg.click('#b-multi-local'); pg.wait_for_timeout(300)
    pg.fill('#nom-j1', 'Léa'); pg.fill('#nom-j2', 'Tom'); pg.click('#form-local button[type=submit]')
    passages, vus_j2_sombre, vus_j1_jaune, tours = 0, False, False, 0
    for k in range(600):
        if pg.query_selector('#b-revanche') and pg.is_visible('#b-revanche'): break
        if fini(pg) and not pg.query_selector('#b-revanche'): pg.wait_for_timeout(400); pg.mouse.click(195, 400); continue
        pm = pg.query_selector('#passe-main')
        if pm:
            titre = pg.inner_text('#passe-titre'); passages += 1
            if passages == 1:
                t('écran de passage : « Au tour de … »', titre.startswith('Au tour de'), titre)
                t('il cache tout l’écran', pg.evaluate("(() => { const r = document.getElementById('passe-main').getBoundingClientRect(), cs = getComputedStyle(document.getElementById('passe-main')); return r.width >= innerWidth && r.height >= innerHeight && cs.backgroundImage.indexOf('gradient') >= 0; })()"))
                pg.screenshot(path='/tmp/pl/local_passe.png')
            pg.click('#b-passe'); pg.wait_for_timeout(250); continue
        if pg.inner_text('#perchoir-texte').startswith('À toi'):
            inv = pg.evaluate("document.body.classList.contains('local-inverse')")
            nom = pg.inner_text('#nom-moi')
            couleur = pg.evaluate("(() => { const c = document.querySelector('#main-joueur .mc'); return c ? getComputedStyle(c).backgroundColor : '' })()")
            if 'Tom' in nom: vus_j2_sombre = vus_j2_sombre or (inv and couleur == 'rgb(43, 47, 54)')
            if 'Léa' in nom: vus_j1_jaune = vus_j1_jaune or (not inv and couleur != 'rgb(43, 47, 54)')
            if tours == 3: pg.screenshot(path='/tmp/pl/local_jeu.png')
            c = pg.query_selector('#main-joueur .carte-main:not([disabled])')
            if c:
                c.click(); pg.wait_for_timeout(100)
                cs = pg.query_selector_all('.case.libre.jouable')
                if cs: cs[0].click(); tours += 1; pg.wait_for_timeout(300); continue
        pg.wait_for_timeout(120)
    t('le téléphone a changé de main plusieurs fois', passages >= 7, passages)
    t('Tom joue avec ses cartes en fond nuit', vus_j2_sombre)
    t('Léa joue avec ses cartes en surligneur', vus_j1_jaune)
    fin = pg.evaluate("(() => { const b = document.getElementById('b-revanche'); const d = b && b.closest('dialog, .panneau, [role=dialog]'); return d ? d.innerText : ''; })()")
    t('le bilan nomme le gagnant ou le ballottage', ('Léa' in fin or 'Tom' in fin or 'Ballottage' in fin) and 'IA' not in fin.split('\n')[0], fin[:160])
    t('pas de bilan contre l’IA modifié', pg.evaluate("JSON.parse(localStorage.getItem('hemicycle-bilan'))") == {'v': 2, 'd': 1, 'n': 0})
    t('pas de partie sauvegardée', pg.evaluate("localStorage.getItem('hemicycle-partie-en-cours')") is None)
    tr = pg.evaluate("JSON.parse(localStorage.getItem('hemicycle-trophees') || '{}')")
    t('pas de partie comptée pour les trophées', (tr.get('parties') or 0) == tr0, (tr.get('parties'), tr0))
    pg.screenshot(path='/tmp/pl/local_fin.png')
    pg.click('#b-revanche'); pg.wait_for_timeout(2500)
    t('revanche : encore en face-à-face', pg.evaluate("document.body.classList.contains('en-local')") and ('Léa' in pg.inner_text('#nom-moi') or pg.query_selector('#passe-main') is not None))
    pg.evaluate("location.hash = '#cartes'"); pg.wait_for_timeout(300); pg.evaluate("location.hash = '#jouer'"); pg.wait_for_timeout(600)
    if pg.query_selector('#passe-main'): pg.click('#b-passe-menu'); pg.wait_for_timeout(300)
    pg.click('#t-solo'); pg.wait_for_timeout(300); pg.click('#b-libre'); pg.wait_for_timeout(300)
    pg.click('#niveaux [data-niveau]'); pg.wait_for_timeout(2500)
    t('partie solo ensuite : retour à « Toi » contre l’IA', not pg.evaluate("document.body.classList.contains('en-local')") and pg.inner_text('#nom-moi').startswith('Toi') and 'IA' in pg.inner_text('#nom-adv'), (pg.inner_text('#nom-moi'), pg.inner_text('#nom-adv')))
    t('aucune erreur', not err, err[:3])
    nav.close()
print(f'\nt_local : {ok} OK, {ko} KO'); sys.exit(1 if ko else 0)
