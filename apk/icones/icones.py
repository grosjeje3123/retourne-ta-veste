"""Icônes de l'appli : le dos des cartes (le « ≈ » d'À peu près d'accord sur fond violet).
Icône classique (carré arrondi) et icône adaptative (fond + médaillon), aux cinq densités Android."""
from playwright.sync_api import sync_playwright
import os
RES = '/home/claude/apk/projet/resources/package_1/res'
DENS = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
GRAD = '<radialGradient id="g" cx="50%" cy="42%" r="72%"><stop offset="0" stop-color="#7b46b9"/><stop offset=".5" stop-color="#5a2d8c"/><stop offset="1" stop-color="#341a57"/></radialGradient>'
def medaillon(cx, cy, r):
    k = r / 15.0
    vague = lambda y0: f'M{cx - 9*k:.2f} {y0:.2f}c{3*k:.2f} {-2.6*k:.2f} {6*k:.2f} {-2.6*k:.2f} {9*k:.2f} {.5*k:.2f}s{6*k:.2f} {3.1*k:.2f} {9*k:.2f} 0'
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#f1fb4e" stroke="#15171a" stroke-width="{1.1*k:.2f}"/>'
            f'<path d="{vague(cy - 3.5*k)}{vague(cy + 3.5*k)}" fill="none" stroke="#15171a" stroke-width="{2.4*k:.2f}" stroke-linecap="round"/>')
# Icône classique, 48 dp
CLASSIQUE = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs>{GRAD}</defs>'
             '<rect x="2" y="2" width="44" height="44" rx="10" fill="url(#g)"/>'
             '<rect x="5" y="5" width="38" height="38" rx="7.5" fill="none" stroke="#f1fb4e" stroke-opacity=".55" stroke-width=".7"/>'
             + medaillon(24, 24, 12.5) + '</svg>')
# Icône adaptative, 108 dp : fond dégradé, médaillon dans la zone sûre (66 dp)
FOND = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108"><defs>{GRAD}</defs><rect width="108" height="108" fill="url(#g)"/>'
        '<circle cx="54" cy="54" r="40" fill="none" stroke="#f1fb4e" stroke-opacity=".35" stroke-width=".8"/>'
        '<circle cx="54" cy="54" r="44" fill="none" stroke="#f1fb4e" stroke-opacity=".18" stroke-width=".6"/></svg>')
AVANT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">' + medaillon(54, 54, 27) + '</svg>'
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg = nav.new_page()
    for nom, svg, dp in [('ic_launcher', CLASSIQUE, 48), ('ic_launcher_fond', FOND, 108), ('ic_launcher_avant', AVANT, 108)]:
        for d, f in DENS.items():
            px = round(dp * f)
            pg.set_viewport_size({'width': px, 'height': px})
            pg.set_content(f'<html><body style="margin:0;background:transparent">{svg.replace("<svg ", f"<svg width=\"{px}\" height=\"{px}\" ", 1)}</body></html>')
            os.makedirs(f'{RES}/mipmap-{d}', exist_ok=True)
            pg.screenshot(path=f'{RES}/mipmap-{d}/{nom}.png', omit_background=True, clip={'x': 0, 'y': 0, 'width': px, 'height': px})
    # Aperçu pour l'œil : les deux icônes en grand
    pg.set_viewport_size({'width': 520, 'height': 240})
    pg.set_content('<html><body style="margin:0;background:#dfe3dc;display:flex;gap:30px;padding:20px">' + CLASSIQUE.replace('<svg ', '<svg width="200" height="200" ', 1) +
                   '<div style="width:200px;height:200px;border-radius:50%;overflow:hidden;position:relative">' + FOND.replace('<svg ', '<svg width="200" height="200" style="position:absolute;inset:0" ', 1) + AVANT.replace('<svg ', '<svg width="200" height="200" style="position:absolute;inset:0" ', 1) + '</div></body></html>')
    pg.screenshot(path='/home/claude/apk/icones/apercu.png')
    nav.close()
print('ok')
