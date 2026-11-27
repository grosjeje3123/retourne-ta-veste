"""Prépare une planche de 8 poses (fond magenta) pour le jeu : détourage, poses bien espacées, réduction.

    python3 baston/outils/planche.py baston/planches/tribun.png

Écrit à côté de l'image : NOM_spaced.png (aperçu détouré) et NOM_uri.txt (l'image encodée, à coller dans
BUILTIN, dans jeu/index.html). Il faut Pillow et numpy.
"""
import os, sys, base64, io
from PIL import Image
import numpy as np
def build(chemin):
    name = os.path.splitext(chemin)[0]
    a = np.asarray(Image.open(chemin).convert('RGB')).astype(int)
    m = np.minimum(a[...,0], a[...,2]) - a[...,1]
    alpha = np.where(m > 95, 0, 255).astype(np.uint8)
    rgb = a.copy(); rgb[(m > 55) & (m <= 95)] = [27, 23, 48]
    rgba = np.dstack([rgb.astype(np.uint8), alpha]); fg = alpha > 0
    colc = fg.sum(0); cols = colc > 2
    segs = []; on = False
    for x, c in enumerate(cols):
        if c and not on: s = x; on = True
        if not c and on: segs.append([s, x]); on = False
    if on: segs.append([s, len(cols)])
    segs = [sg for sg in segs if fg[:, sg[0]:sg[1]].sum() > 300]
    while len(segs) > 8:                       # petits blocs (traits d'effet) collés au voisin
        k = min(range(len(segs)), key=lambda i: segs[i][1] - segs[i][0])
        j = k - 1 if k > 0 and (k == len(segs) - 1 or segs[k][0] - segs[k-1][1] <= segs[k+1][0] - segs[k][1]) else k + 1
        lo, hi = sorted([k, j]); segs[lo:hi+1] = [[segs[lo][0], segs[hi][1]]]
    while len(segs) < 8:                       # deux poses qui se touchent : on coupe au creux
        k = max(range(len(segs)), key=lambda i: segs[i][1] - segs[i][0]); x0, x1 = segs[k]
        w = x1 - x0; mid = x0 + w // 3 + int(np.argmin(colc[x0 + w // 3: x1 - w // 3]))
        segs[k:k+1] = [[x0, mid], [mid + 1, x1]]
    ys = np.where(fg.any(1))[0]; y0, y1 = ys.min() - 4, ys.max() + 5
    gap = 40; W = sum(x1 - x0 for x0, x1 in segs) + gap * 9
    out = Image.new('RGBA', (W, y1 - y0), (0, 0, 0, 0)); x = gap
    for x0, x1 in segs:
        out.alpha_composite(Image.fromarray(rgba[y0:y1, x0:x1], 'RGBA'), (x, 0)); x += x1 - x0 + gap
    out = out.resize((round(out.width * 0.75), round(out.height * 0.75)), Image.LANCZOS)
    arr = np.asarray(out).copy(); arr[..., 3] = np.where(arr[..., 3] > 110, 255, 0); out = Image.fromarray(arr, 'RGBA')
    buf = io.BytesIO(); out.quantize(colors=96, method=Image.Quantize.FASTOCTREE).save(buf, 'PNG', optimize=True)
    open(f'{name}_uri.txt', 'w').write('data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode())
    out.save(f'{name}_spaced.png'); print(name, segs, out.size, len(buf.getvalue()))
for n in sys.argv[1:]: build(n)
