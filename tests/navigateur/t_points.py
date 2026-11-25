"""Le tableau des points à portée de main : sommaire, lien de l'accueil du jeu, lien depuis le détail d'une carte."""
import sys
from playwright.sync_api import sync_playwright
ok = ko = 0
def t(nom, cond, detail=''):
    global ok, ko
    if cond: ok += 1; print('   ok ', nom)
    else: ko += 1; print('   KO ', nom, detail)
def haut(pg, sel): return pg.evaluate("s => { var e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().top) : null; }", sel)
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    for W, H, nom in ((390, 844, 'téléphone'), (1280, 860, 'ordinateur')):
        print(nom)
        ctx = nav.new_context(viewport={'width': W, 'height': H}, is_mobile=W < 500, has_touch=W < 500)
        pg = ctx.new_page(); err = []
        pg.on('pageerror', lambda e: err.append(str(e)))
        pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
        pg.add_init_script("try { localStorage.setItem('hemicycle-venu', '1'); localStorage.setItem('hemicycle-tuto-fleches', '{\"fait\":1}'); } catch (e) {}")
        pg.goto('file:///home/claude/carte2/index.html'); pg.wait_for_timeout(900)
        t('accueil : logo « Retourne ta veste », chargé, avec son texte alternatif', pg.evaluate("(() => { var i = document.querySelector('#accueil .logo-titre'); return !!i && i.complete && i.naturalWidth === 1500 && /Retourne ta veste/.test(i.alt) && i.getBoundingClientRect().width > 200; })()"))
        t('nom du jeu : titre de page et bandeau', 'Retourne ta veste' in pg.title() and pg.inner_text('.titre-jeu') == 'Retourne ta veste')
        pg.click('.accueil-liens a[href="#methode"]'); pg.wait_for_timeout(900)
        h = haut(pg, '#titre-methode')
        t('lien « Le calcul des points » : la collection s’ouvre sur le tableau', pg.is_visible('#vue-cartes') and h is not None and 0 <= h < 120, h)
        if W < 500: pg.screenshot(path='/tmp/pl/points_tel.png')
        pg.click('.haut-page a'); pg.wait_for_timeout(500)
        t('« Haut de la page » remonte', pg.evaluate('scrollY') < 50, pg.evaluate('scrollY'))
        chips = pg.eval_on_selector_all('.sommaire a', 'e => e.map(x => x.getAttribute("href"))')
        t('sommaire en haut de la collection, 5 entrées', chips == ['#regle', '#methode', '#cartes-candidat', '#cartes-action', '#justice'] and haut(pg, '.sommaire') < H, (chips, haut(pg, '.sommaire')))
        cibles = {}
        for c in chips:
            pg.click(f'.sommaire a[href="{c}"]'); pg.wait_for_timeout(450)
            cibles[c] = haut(pg, c); pg.evaluate('scrollTo(0, 0)'); pg.wait_for_timeout(150)
        t('chaque entrée du sommaire mène à sa section', all(v is not None and -5 <= v < 150 for v in cibles.values()), cibles)
        t('rien ne déborde de la page', pg.evaluate('document.documentElement.scrollWidth') <= W, pg.evaluate('document.documentElement.scrollWidth'))
        if W < 500: pg.screenshot(path='/tmp/pl/sommaire_tel.png')
        # Depuis le détail d'une carte, dans le jeu
        pg.goto('file:///home/claude/carte2/index.html#jouer'); pg.wait_for_timeout(700)
        def choisir_niveau(pg):
            pg.wait_for_timeout(250); b = pg.query_selector('#niveaux .b-niveau.actuel'); b and b.click()
        pg.click('#t-solo'); pg.wait_for_timeout(250); pg.click('#b-libre'); choisir_niveau(pg); pg.wait_for_timeout(4500)
        pg.click('#main-joueur .carte-main:not([disabled])'); pg.wait_for_timeout(200)
        pg.click('#b-details'); pg.wait_for_timeout(500)
        lien = pg.query_selector('#dialogue a[href^="#pts-"]')
        t('en partie, « détails » d’une carte en main : lien vers sa ligne du tableau', bool(lien))
        if lien:
            cible = lien.get_attribute('href'); lien.click(); pg.wait_for_timeout(900)
            hr = haut(pg, cible)
            t(f'le lien mène à la ligne {cible}, surlignée, panneau refermé', pg.is_visible('#vue-cartes') and hr is not None and 0 <= hr < H - 100 and pg.evaluate(f"document.querySelector('{cible}').matches(':target')") and not pg.is_visible('#voile'), (hr, pg.is_visible('#voile')))
            if W < 500: pg.screenshot(path='/tmp/pl/ligne_tel.png')
            pg.go_back(); pg.wait_for_timeout(900)
            t('retour arrière : on retrouve la partie en cours', pg.is_visible('#vue-jeu') and pg.query_selector('#main-joueur .carte-main') is not None and not pg.is_visible('#accueil'), pg.evaluate('location.hash'))
        ids = pg.evaluate("[...document.querySelectorAll('#tab-valeurs tbody tr')].map(r => r.id)")
        t('43 lignes, chacune avec son ancre unique', len(ids) == 43 and len(set(ids)) == 43 and all(i.startswith('pts-') and len(i) > 4 for i in ids), ids[:3])
        t('aucune erreur', not err, err[:2]); ctx.close()
print(f'Tableau des points : {ok} OK, {ko} KO'); sys.exit(1 if ko else 0)
