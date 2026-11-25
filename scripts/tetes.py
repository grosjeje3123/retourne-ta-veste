"""Repères pour la fête de fin de partie : haut du crâne (chapeau) et bouche (langue de belle-mère).
Lit les miniatures détourées (img/mini/*.webp, 240×300, fond transparent) et écrit carte2/tetes.json.
Valeurs en pourcentage de la largeur / hauteur de l'image."""
import json, sys, os
import numpy as np, cv2
from PIL import Image

RACINE = '/home/claude/carte2'
CASC = cv2.CascadeClassifier('/tmp/cvxml/haarcascade_frontalface_alt2.xml')
CASC2 = cv2.CascadeClassifier('/tmp/cvxml/haarcascade_frontalface_default.xml')

def reperes(chemin):
    im = Image.open(chemin).convert('RGBA'); a = np.array(im)
    H, W = a.shape[:2]
    alpha = a[..., 3] > 128
    # Visage : détection Haar sur l'image posée sur un fond gris
    fond = np.full((H, W, 3), 200, np.uint8)
    rgb = (a[..., :3] * (a[..., 3:] / 255.0) + fond * (1 - a[..., 3:] / 255.0)).astype(np.uint8)
    gris = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    faces = list(CASC.detectMultiScale(gris, 1.05, 4, minSize=(70, 70)))
    if not faces: faces = list(CASC2.detectMultiScale(gris, 1.05, 3, minSize=(60, 60)))
    if faces:
        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
    else:
        x, y, w, h = W * .2, H * .25, W * .6, H * .5
    cx = x + w / 2
    # Bouche : ligne la plus sombre sous le nez (fente des lèvres) ; si le résultat est douteux
    # (barbe, moustache, narines), position moyenne des visages de la série
    g = gris.astype(float)
    r0, r1 = int(y + .68 * h), int(min(H - 1, y + 1.0 * h))
    c0, c1 = int(cx - .13 * w), int(cx + .13 * w)
    prof = np.convolve(g[r0:r1, c0:c1].mean(axis=1), np.ones(3) / 3, mode='same')
    rb = (r0 + int(np.argmin(prof[1:-1])) + 1 - y) / h if faces else .82
    if not (.77 <= rb <= .92): rb = .82
    # Haut du crâne : première ligne opaque assez large autour de l'axe du visage
    haut = 0
    for r in range(H):
        ligne = alpha[r, int(max(0, cx - w * .45)):int(min(W, cx + w * .45))]
        if ligne.sum() > w * .18: haut = r; break
    # Centre du crâne : milieu des pixels opaques sur les lignes juste sous le haut
    zone = alpha[haut:haut + int(H * .08)]
    cols = np.where(zone.any(axis=0))[0]
    hx = (cols.min() + cols.max()) / 2 if len(cols) else cx
    hx = (hx + cx) / 2
    return {
        'chapeau': [round(100 * hx / W, 1), round(100 * haut / H, 1)],
        'bouche': [round(100 * cx / W, 1), round(100 * (y + h * rb) / H, 1)],
        'visage': round(100 * w / W, 1),
        'detecte': bool(faces),
    }

if __name__ == '__main__':
    d = {}
    for f in sorted(os.listdir(RACINE + '/img/mini')):
        if f.endswith('.webp'):
            d[f[:-5]] = reperes(RACINE + '/img/mini/' + f)
    # Corrections à l'œil : tête levée (Durif), visage non détecté (Larcher), moustache (Plenel)
    CORR = {'durif': [62, 49.5], 'larcher': [69, 68.5], 'plenel': [62.5, 70]}
    for k, v in CORR.items():
        if k in d: d[k]['bouche'] = v
    manque = [k for k, v in d.items() if not v['detecte']]
    print(len(d), 'portraits ; visage non détecté :', manque)
    json.dump(d, open('/tmp/fete/tetes.json', 'w'), ensure_ascii=False, indent=0)
    # Pour le jeu : slug -> [chapeau x, chapeau y, bouche x, bouche y, largeur du visage] (en %)
    js = {k: v['chapeau'] + v['bouche'] + [v['visage']] for k, v in d.items()}
    open(RACINE + '/tetes.js', 'w').write('/* Repères des portraits pour la fête de fin de partie (scripts/tetes.py) : chapeau x, y ; bouche x, y ; largeur du visage, en %. */\nwindow.HemicycleTetes = ' + json.dumps(js, separators=(',', ':')) + ';\n')
