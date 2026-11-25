"""Partie rapide dans deux navigateurs : profils, file d'attente, partie classée, classement, abandon par forfait."""
import json, sys, time
from playwright.sync_api import sync_playwright
def choisir_niveau(pg):
    """Solo : après le mode, l'adversaire. On garde le niveau mémorisé (la première manche de Carrière saute cette étape)."""
    pg.wait_for_timeout(250)
    b = pg.query_selector('#niveaux .b-niveau.actuel') or pg.query_selector('#niveaux .b-niveau')
    if b: b.click()

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8099
BASE = f'http://127.0.0.1:{PORT}/'
OUT = '/tmp/fete'
erreurs = []
def suivre(nom, pg):
    pg.on('pageerror', lambda e: erreurs.append(f'{nom} pageerror: {e}'))
    pg.on('console', lambda m: erreurs.append(f'{nom} console: {m.text}') if m.type == 'error' else None)
def profil_et_recherche(pg, pseudo):
    pg.goto(BASE + '#jouer'); pg.wait_for_timeout(600)
    pg.click('#t-ligne'); pg.wait_for_timeout(300); pg.click('#b-multi-ligne'); pg.wait_for_timeout(300)
    pg.click('#b-inconnu')
    pg.wait_for_selector('#champ-pseudo', timeout=5000)
    pg.fill('#champ-pseudo', pseudo); pg.click('.picto-av[data-i="1"]'); pg.click('.couleur-av[data-c="3"]'); pg.click('#b-profil-ok')
def jouer(pg):
    t = pg.inner_text('#perchoir-texte')
    if t.startswith('À toi'):
        c = pg.query_selector('#main-joueur .carte-main:not([disabled])')
        if c:
            c.click(); pg.wait_for_timeout(100)
            k = pg.query_selector('.case.libre.jouable')
            if k: k.click(); return True
    return False
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    A = nav.new_context(viewport={'width': 1280, 'height': 860}).new_page(); suivre('A', A)
    A.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    B = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2).new_page(); suivre('B', B)
    B.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); } catch (e) {}")   # pas un premier démarrage : sinon le tutoriel se lance d'office
    profil_et_recherche(A, 'Sénatrice des tests')
    A.wait_for_selector('.recherche', timeout=5000); A.wait_for_timeout(300)
    A.screenshot(path=f'{OUT}/rapide-0-recherche.png')
    print('A cherche :', A.inner_text('#dialogue').split('\n')[0:3])
    profil_et_recherche(B, 'Questeur du mobile')
    for _ in range(80):
        if A.inner_text('#perchoir-texte').startswith(('À toi', 'Questeur')) and B.inner_text('#perchoir-texte').startswith(('À toi', 'Sénatrice')): break
        A.wait_for_timeout(150)
    print('A voit :', A.inner_text('#nom-adv'), '| B voit :', B.inner_text('#nom-adv'), '| perchoirs :', A.inner_text('#perchoir-texte'), '/', B.inner_text('#perchoir-texte'))
    A.screenshot(path=f'{OUT}/rapide-1-A.png'); B.screenshot(path=f'{OUT}/rapide-1-B.png')
    t0 = time.time()
    while time.time() - t0 < 120:
        if A.query_selector('#voile:not([hidden]) #b-revanche') and B.query_selector('#voile:not([hidden]) #b-revanche'): break
        if jouer(A) or jouer(B): A.wait_for_timeout(1500)
        else: A.wait_for_timeout(200)
    A.wait_for_timeout(1200)
    print('fin A :', A.inner_text('#dialogue').replace('\n', ' | ')[:220])
    print('fin B :', B.inner_text('#dialogue').replace('\n', ' | ')[:220])
    A.screenshot(path=f'{OUT}/rapide-2-fin-A.png')
    # Revanche, puis A abandonne : B gagne par forfait
    A.click('#b-revanche'); B.click('#b-revanche')
    for _ in range(60):
        if A.query_selector('#voile[hidden]') and A.inner_text('#perchoir-texte').startswith(('À toi', 'Questeur')): break
        A.wait_for_timeout(150)
    A.click('#b-accueil'); A.wait_for_timeout(400)
    A.click('#t-solo'); A.wait_for_timeout(300)
    print('avertissement chez A :', A.inner_text('#form-solo').count('la fait perdre'))
    A.click('#b-libre'); choisir_niveau(A); A.wait_for_timeout(1200)
    print('B après l’abandon de A :', B.inner_text('#dialogue').replace('\n', ' | ')[:200] if B.query_selector('#voile:not([hidden])') else '(rien)')
    if B.query_selector('#b-classement-fin'):
        B.click('#b-classement-fin'); B.wait_for_selector('.classement', timeout=5000); B.wait_for_timeout(300)
        print('classement vu par B :', B.inner_text('#dialogue').replace('\n', ' | ')[:300])
        B.screenshot(path=f'{OUT}/rapide-3-classement-B.png')
    nav.close()
print('erreurs :', erreurs or 'aucune')
