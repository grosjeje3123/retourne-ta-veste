"""Face-à-face sauvegardé : on ferme en pleine manche, la reprise redemande qui tient le téléphone ; entre deux manches, « Continuer le match »."""
import json, sys, re
from playwright.sync_api import sync_playwright
sys.path.insert(0, '/home/claude/tests/navigateur')
from t_trophees_aide import INIT, fini
ok = ko = 0
def t(nom, cond, detail=''):
    global ok, ko
    if cond: ok += 1; print('   ok ', nom)
    else: ko += 1; print('   KO ', nom, detail)
def coup(pg):
    """Joue un coup du joueur qui a la main ; renvoie False si la manche est finie."""
    for k in range(200):
        if pg.query_selector('#b-revanche') and pg.is_visible('#b-revanche'): return False
        if pg.query_selector('#passe-main'): pg.click('#b-passe'); pg.wait_for_timeout(150); continue
        if fini(pg): pg.mouse.click(195, 400); pg.wait_for_timeout(300); continue
        if pg.inner_text('#perchoir-texte').startswith('À toi'):
            c = pg.query_selector('#main-joueur .carte-main:not([disabled])')
            if c:
                c.click(); pg.wait_for_timeout(80); cs = pg.query_selector_all('.case.libre.jouable')
                if cs: cs[0].click(); pg.wait_for_timeout(350); return True
        pg.wait_for_timeout(100)
    return False
def plateau(pg): return pg.eval_on_selector_all('#plateau .case', 'e => e.map(x => x.querySelector(".mc") ? x.querySelector(".mc").className.replace(/ (pose|prise|flip|neuf)\\S*/g, "") + "|" + x.textContent.trim().slice(0, 14) : "-")')
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    ctx = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.add_init_script(INIT % (33, json.dumps({'hemicycle-options': {'v': 2, 'niveau': 'assemblee', 'regles': 'fleches'}, 'hemicycle-tuto-fleches': {'fait': 1}})))
    pg.emulate_media(reduced_motion='reduce')
    pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(600)
    pg.click('#t-ligne'); pg.wait_for_timeout(300); pg.click('#b-multi-local'); pg.wait_for_timeout(300)
    pg.fill('#nom-j1', 'Léa'); pg.fill('#nom-j2', 'Tom'); pg.check('#form-local input[value="5"]'); pg.click('#form-local button[type=submit]')
    print('1. Fermer en pleine manche')
    for _ in range(3): coup(pg)
    pg.wait_for_timeout(400)
    sv = pg.evaluate("JSON.parse(localStorage.getItem('hemicycle-partie-en-cours') || 'null')")
    t('la partie à deux est sauvegardée, avec les prénoms et le match', bool(sv) and sv.get('local') and sv['local']['noms'] == ['Léa', 'Tom'] and sv['local']['match']['manche'] == 1, sv and sv.get('local'))
    attendu = pg.inner_text('#passe-titre') if pg.query_selector('#passe-main') else None
    pg.reload(); pg.wait_for_timeout(1000)
    t('au relancement : l’écran « Au tour de … » avant toute main', pg.query_selector('#passe-main') is not None and pg.inner_text('#passe-titre').startswith('Au tour de'))
    if attendu: t('c’est le même joueur qu’avant la fermeture', pg.inner_text('#passe-titre') == attendu, (pg.inner_text('#passe-titre'), attendu))
    t('les prénoms sont revenus', 'Léa' in pg.inner_text('#passe-main') and 'Tom' in pg.inner_text('#passe-main'))
    nb = sum(1 for x in sv['s']['crd']['d'] if x >= 0)
    pg.click('#b-passe'); pg.wait_for_timeout(500)
    t('le plateau a ses cartes', sum(1 for x in plateau(pg) if x != '-') == nb, (plateau(pg), nb))
    t('la main est jouable', pg.inner_text('#perchoir-texte').startswith('À toi'))
    print('2. Menu en cours de tour, puis Reprendre')
    coup(pg); pg.wait_for_timeout(300)
    if pg.query_selector('#passe-main'): pg.click('#b-passe-menu')
    else: pg.evaluate("history.back()")
    pg.wait_for_timeout(500)
    vis = pg.is_visible('#t-reprendre')
    t('accueil : « Reprendre » dit Face-à-face', vis and 'Face-à-face' in pg.inner_text('#t-reprendre-sous'), pg.inner_text('#t-reprendre-sous') if vis else '')
    if vis: pg.click('#t-reprendre'); pg.wait_for_timeout(400)
    t('« Reprendre » repasse par l’écran de passage', pg.query_selector('#passe-main') is not None)
    print('3. Finir la manche, fermer, continuer le match')
    while coup(pg): pass
    sm = pg.inner_text('.score-match'); m = re.search(r'(\d+)\s*·\s*(\d+)', sm); a, b = int(m.group(1)), int(m.group(2))
    pg.reload(); pg.wait_for_timeout(1000)
    t('manche finie : pas de partie à reprendre', pg.evaluate("localStorage.getItem('hemicycle-partie-en-cours')") is None)
    pg.click('#t-ligne'); pg.wait_for_timeout(300); pg.click('#b-multi-local'); pg.wait_for_timeout(300)
    bc = pg.query_selector('#b-continuer-match')
    t('« Continuer le match » avec le score', bc is not None and ('Léa %d · %d Tom' % (a, b)) in bc.inner_text(), bc.inner_text() if bc else sm)
    if bc:
        bc.click(); pg.wait_for_timeout(2500)
        while coup(pg): pass
        sm2 = pg.inner_text('.score-match'); m2 = re.search(r'(\d+)\s*·\s*(\d+)', sm2); a2, b2 = int(m2.group(1)), int(m2.group(2))
        t('le score du match continue', a2 >= a and b2 >= b and (a2 + b2) - (a + b) in (0, 1), (sm, sm2))
    t('aucune erreur', not err, err[:3])
    nav.close()
print(f'\nt_local_sauvegarde : {ok} OK, {ko} KO'); sys.exit(1 if ko else 0)
