"""Face-à-face en match : le premier à 3 victoires. Score du match au bilan et sur l'écran de passage, « Manche suivante » puis « Nouveau match »."""
import json, sys, re
from playwright.sync_api import sync_playwright
sys.path.insert(0, '/home/claude/tests/navigateur')
from t_trophees_aide import INIT, fini
ok = ko = 0
def t(nom, cond, detail=''):
    global ok, ko
    if cond: ok += 1; print('   ok ', nom)
    else: ko += 1; print('   KO ', nom, detail)
def manche(pg):
    vu_match = False
    for k in range(700):
        if pg.query_selector('#b-revanche') and pg.is_visible('#b-revanche'): return vu_match
        if pg.query_selector('#passe-main'):
            vu_match = vu_match or bool(pg.query_selector('#passe-main .pm-match'))
            pg.click('#b-passe'); pg.wait_for_timeout(150); continue
        if fini(pg): pg.mouse.click(195, 400); pg.wait_for_timeout(300); continue
        if pg.inner_text('#perchoir-texte').startswith('À toi'):
            c = pg.query_selector('#main-joueur .carte-main:not([disabled])')
            if c:
                c.click(); pg.wait_for_timeout(80); cs = pg.query_selector_all('.case.libre.jouable')
                if cs: cs[0].click(); pg.wait_for_timeout(250); continue
        pg.wait_for_timeout(100)
    return vu_match
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    ctx = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.add_init_script(INIT % (21, json.dumps({'hemicycle-options': {'v': 2, 'niveau': 'assemblee', 'regles': 'fleches'}, 'hemicycle-tuto-fleches': {'fait': 1}})))
    pg.emulate_media(reduced_motion='reduce')
    pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(600)
    pg.click('#t-ligne'); pg.wait_for_timeout(300); pg.click('#b-multi-local'); pg.wait_for_timeout(300)
    pg.fill('#nom-j1', 'Léa'); pg.fill('#nom-j2', 'Tom'); pg.check('#form-local input[value="5"]'); pg.click('#form-local button[type=submit]')
    scores, fin_match, n = [], False, 0
    while n < 9:
        n += 1
        vu = manche(pg)
        if n == 1: t('écran de passage : manche et score du match', vu)
        sm = pg.inner_text('.score-match') if pg.query_selector('.score-match') else ''
        bouton = pg.inner_text('#b-revanche')
        m = re.search(r'(\d+)\s*·\s*(\d+)', sm); a, b = (int(m.group(1)), int(m.group(2))) if m else (-1, -1)
        scores.append((a, b, bouton)); print('   manche', n, sm.replace('\n', ' '), '→', bouton)
        if max(a, b) >= 3:
            titre = pg.evaluate("(() => { const d = document.getElementById('b-revanche').closest('[role=dialog], dialog, .panneau'); return d ? d.querySelector('h2').innerText : '' })()")
            t('le vainqueur du match est annoncé', 'remporte le match' in titre, titre)
            t('bouton « Nouveau match »', bouton == 'Nouveau match', bouton)
            pg.screenshot(path='/tmp/pl/match_fin.png'); fin_match = True
            pg.click('#b-revanche'); pg.wait_for_timeout(2000)
            vu2 = manche(pg); sm2 = pg.inner_text('.score-match')
            t('nouveau match : le score repart de zéro', re.search(r'\b[01]\s*·\s*[01]\b', sm2) is not None, sm2)
            break
        t('match en cours : « Manche suivante »', bouton == 'Manche suivante', bouton)
        pg.click('#b-revanche'); pg.wait_for_timeout(2000)
    t('le match se termine en 5 manches au plus (hors ballottages)', fin_match and sum(1 for s in scores if True) <= 9, scores)
    t('le score avance d’une victoire au plus par manche', all(abs((scores[i][0] + scores[i][1]) - (scores[i - 1][0] + scores[i - 1][1])) <= 1 for i in range(1, len(scores))), scores)
    t('aucune erreur', not err, err[:3])
    nav.close()
print(f'\nt_local_match : {ok} OK, {ko} KO'); sys.exit(1 if ko else 0)
