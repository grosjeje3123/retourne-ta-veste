"""Premier démarrage (accueil puis invitation au tutoriel), puis Solo en deux temps : le mode, ensuite l'adversaire."""
import json, sys
from playwright.sync_api import sync_playwright
ok = ko = 0
def t(nom, cond, detail=''):
    global ok, ko
    if cond: ok += 1; print('   ok ', nom)
    else: ko += 1; print('   KO ', nom, detail)
def page(nav, pre=None, adresse='#jouer'):
    ctx = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    if pre: pg.add_init_script("try { var pre = %s; Object.keys(pre).forEach(function(k){ if (localStorage.getItem(k) == null) localStorage.setItem(k, JSON.stringify(pre[k])); }); } catch (e) {}" % json.dumps(pre))
    pg.goto('file:///home/claude/carte2/index.html' + adresse); pg.wait_for_timeout(900)
    return ctx, pg, err
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    print('1. Tout premier démarrage')
    for adr in ('#jouer', ''):
        ctx, pg, err = page(nav, adresse=adr)
        t(f"adresse « {adr or 'nue'} » : l’accueil d’abord, pas le tutoriel", pg.is_visible('#accueil') and not pg.is_visible('#tuto'))
        pg.wait_for_timeout(1500)
        t('puis l’invitation « Bienvenue ! »', pg.is_visible('#b-bienvenue-tuto') and 'Bienvenue' in pg.inner_text('#titre-dialogue'))
        if adr == '#jouer':
            pg.screenshot(path='/tmp/pl/demarrage.png')
            pg.click('#b-bienvenue-tuto'); pg.wait_for_timeout(700)
            t('« Apprendre » lance la leçon 1', pg.is_visible('#tuto') and 'Bienvenue' in pg.inner_text('#tuto-texte'))
            pg.click('#tuto-passer'); pg.wait_for_timeout(500)
            t('« Passer » mène à l’accueil', pg.is_visible('#accueil') and pg.is_visible('#t-solo'))
            pg.reload(); pg.wait_for_timeout(2200)
            t('au lancement suivant : l’accueil, sans invitation', pg.is_visible('#accueil') and not pg.is_visible('#tuto') and not pg.query_selector('#b-bienvenue-tuto'))
        else:
            pg.click('#b-bienvenue-plus-tard'); pg.wait_for_timeout(400)
            t('« Plus tard » : l’accueil, avec « Première séance »', pg.is_visible('#accueil') and pg.is_visible('#t-tuto') and not pg.is_visible('#tuto'))
            pg.reload(); pg.wait_for_timeout(2200)
            t('au lancement suivant : pas de nouvelle invitation', not pg.query_selector('#b-bienvenue-tuto') and pg.is_visible('#t-tuto'))
        t('aucune erreur', not err, err[:2]); ctx.close()
    ctx, pg, err = page(nav, {'hemicycle-bilan': {'v': 2, 'd': 1, 'n': 0}})
    t('joueur qui a déjà des parties : accueil direct', pg.is_visible('#accueil') and not pg.is_visible('#tuto')); ctx.close()
    ctx, pg, err = page(nav, adresse='#cartes')
    t('collection ouverte en premier : pas de tutoriel par-dessus', pg.is_visible('#vue-cartes') and not pg.is_visible('#tuto'))
    pg.click('#cta-haut'); pg.wait_for_timeout(900)
    pg.wait_for_timeout(1500)
    t('puis « Jouer » pour la première fois : l’invitation au tutoriel', pg.is_visible('#b-bienvenue-tuto') and not pg.is_visible('#tuto')); ctx.close()
    print('2. Solo : le mode, puis l’adversaire')
    ctx, pg, err = page(nav, {'hemicycle-venu': 1, 'hemicycle-tuto-fleches': {'fait': 1}, 'hemicycle-options': {'v': 2, 'niveau': 'elysee', 'regles': 'fleches'}})
    pg.click('#t-solo'); pg.wait_for_timeout(300)
    t('Solo : trois modes, aucun réglage de niveau', pg.is_visible('#b-libre') and pg.is_visible('#b-tuto') and pg.is_visible('#b-carriere') and not pg.query_selector('#dialogue input[name="niveau"]'))
    pg.screenshot(path='/tmp/pl/solo1.png')
    pg.click('#b-libre'); pg.wait_for_timeout(300)
    n = pg.eval_on_selector_all('#niveaux .b-niveau', 'e => e.map(x => x.dataset.niveau + (x.classList.contains("actuel") ? "*" : ""))')
    t('Partie libre : trois adversaires, le dernier choisi mis en avant', n == ['mairie', 'assemblee', 'elysee*'] and 'Choisis ton adversaire' in pg.inner_text('#dialogue'), n)
    pg.screenshot(path='/tmp/pl/solo2.png')
    pg.click('#b-retour-niveau'); pg.wait_for_timeout(300)
    t('Retour : on revient aux modes', pg.is_visible('#b-libre') and not pg.query_selector('#niveaux'))
    pg.click('#b-libre'); pg.wait_for_timeout(300); pg.click('#niveaux [data-niveau="mairie"]'); pg.wait_for_timeout(5000)
    opt = pg.evaluate("JSON.parse(localStorage.getItem('hemicycle-options'))")
    t('choisir Mairie lance la partie contre la Mairie, et le choix est retenu', opt['niveau'] == 'mairie' and 'Mairie' in pg.inner_text('.camp-ia') and pg.eval_on_selector_all('#plateau .case', 'e => e.length') == 16, (opt['niveau'], pg.inner_text('.camp-ia')[:40]))
    t('aucune erreur', not err, err[:2]); ctx.close()
    print('3. Carrière')
    ctx, pg, err = page(nav, {'hemicycle-venu': 1, 'hemicycle-tuto-fleches': {'fait': 1}, 'hemicycle-carriere-ouverte': 1})
    pg.click('#t-solo'); pg.wait_for_timeout(300); pg.click('#b-carriere'); pg.wait_for_timeout(600)
    t('première manche : pas de niveau à choisir (Mairie d’office)', not pg.query_selector('#niveaux'), pg.inner_text('#dialogue')[:60] if pg.is_visible('#dialogue') else '')
    ctx.close()
    ctx, pg, err = page(nav, {'hemicycle-venu': 1, 'hemicycle-tuto-fleches': {'fait': 1}, 'hemicycle-carriere-ouverte': 1,
        'hemicycle-classeur': {'v': 1, 'cartes': ['macron', 'le-pen', 'melenchon', 'bardella', 'attal', 'philippe', 'retailleau', 'faure'], 'main': [], 'gains': 1, 'pertes': 0, 'manches': 1}})
    pg.click('#t-solo'); pg.wait_for_timeout(300); pg.click('#b-carriere'); pg.wait_for_timeout(500)
    t('manches suivantes : on choisit son adversaire', len(pg.query_selector_all('#niveaux .b-niveau')) == 3 and 'Carrière' in pg.inner_text('#titre-dialogue'))
    t('aucune erreur', not err, err[:2]); ctx.close()
print(f'Démarrage et Solo : {ok} OK, {ko} KO'); sys.exit(1 if ko else 0)
