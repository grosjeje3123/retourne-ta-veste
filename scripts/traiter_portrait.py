#!/usr/bin/env python3
"""Traitement commun des portraits du jeu « À peu près d'accord ».

Chaque portrait reçoit exactement le même réglage : trame de journal à 45°,
point blanc calé sur le fond uni du portrait, encre et papier du site.
Sorties : <nom>-trame.webp, <nom>-surligneur.webp, <nom>-original.webp

Usage : python3 traiter_portrait.py portrait.png dossier_sortie nom [--cellule 7]
"""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ENCRE = (21, 23, 26)        # --encre du site
PAPIER = (248, 249, 246)    # --carte du site
SURLIGNEUR = (241, 251, 78) # --surligneur du site

LARGEUR = 640               # largeur de sortie (format 2:3 conservé)
SURECH = 2                  # suréchantillonnage pour lisser les points
ANGLE = 45                  # angle classique de la trame noire


def couverture(chemin, cellule):
    """Renvoie la couverture d'encre (0 à 1) à la résolution suréchantillonnée."""
    im = Image.open(chemin).convert("RGB")
    w0, h0 = im.size
    hauteur = round(LARGEUR * h0 / w0)
    W, H = LARGEUR * SURECH, hauteur * SURECH
    grand = im.resize((W, H), Image.LANCZOS)
    L = np.asarray(grand.convert("L"), dtype=np.float32) / 255.0

    # Point blanc : la luminance du fond uni (coin haut gauche) devient du papier.
    fond = float(np.median(L[: H // 20, : W // 20]))
    seuil = (1.0 - fond) + 0.04
    D = np.clip((1.0 - L - seuil) / (1.0 - seuil), 0.0, 1.0) ** 1.0

    c = cellule * SURECH
    flou = Image.fromarray((D * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(c * 0.3))
    Db = np.asarray(flou, dtype=np.float32) / 255.0

    t = np.deg2rad(ANGLE)
    co, si = np.float32(np.cos(t)), np.float32(np.sin(t))
    alpha = np.empty((H, W), np.float32)
    xs = np.arange(W, dtype=np.float32)
    for y0 in range(0, H, 256):
        y1 = min(H, y0 + 256)
        yy, xx = np.meshgrid(np.arange(y0, y1, dtype=np.float32), xs, indexing="ij")
        u = xx * co + yy * si
        v = -xx * si + yy * co
        uc = (np.floor(u / c) + 0.5) * c
        vc = (np.floor(v / c) + 0.5) * c
        xc = uc * co - vc * si
        yc = uc * si + vc * co
        xi = np.clip(np.rint(xc).astype(np.int32), 0, W - 1)
        yi = np.clip(np.rint(yc).astype(np.int32), 0, H - 1)
        r = 1.08 * c * np.sqrt(Db[yi, xi] / np.pi)   # surface du point proportionnelle au ton
        d = np.sqrt((u - uc) ** 2 + (v - vc) ** 2)
        alpha[y0:y1] = np.clip(r - d + 0.5, 0.0, 1.0)
    return alpha, (LARGEUR, hauteur), im


def composer(alpha, fond, taille):
    a = alpha[..., None]
    rgb = (1 - a) * np.array(fond, np.float32) + a * np.array(ENCRE, np.float32)
    return Image.fromarray(rgb.clip(0, 255).astype(np.uint8)).resize(taille, Image.LANCZOS)


def detourer(chemin, tolerance=16, liseré=7):
    """Portrait couleur détouré, avec un liseré papier façon autocollant.

    Le fond uni est retiré par remplissage depuis les bords haut, gauche et droit ;
    le fond coloré de la carte est ensuite dessiné par la page, identique pour tous.
    """
    from scipy import ndimage

    im = Image.open(chemin).convert("RGB")
    a = np.asarray(im).astype(np.int16)
    H, W, _ = a.shape
    bord = np.concatenate([a[0], a[: H * 2 // 3, 0], a[: H * 2 // 3, -1]])
    fond = np.median(bord, axis=0)
    candidat = np.sqrt(((a - fond) ** 2).sum(-1)) < tolerance
    lab, _ = ndimage.label(candidat)
    graines = set(np.unique(lab[0])) | set(np.unique(lab[: H * 2 // 3, 0])) | set(np.unique(lab[: H * 2 // 3, -1]))
    graines.discard(0)
    sujet = ndimage.binary_fill_holes(~np.isin(lab, list(graines)))
    sujet = ndimage.binary_opening(sujet, iterations=2)

    alpha_sujet = ndimage.gaussian_filter(sujet.astype(np.float32), 0.8)
    autour = ndimage.binary_dilation(sujet, iterations=liseré)
    alpha_liseré = ndimage.gaussian_filter(autour.astype(np.float32), 0.8)

    rgb = np.asarray(im).astype(np.float32)
    papier = np.array(PAPIER, np.float32)
    couleur = alpha_sujet[..., None] * rgb + (1 - alpha_sujet[..., None]) * papier
    rgba = np.dstack([couleur, alpha_liseré * 255]).clip(0, 255).astype(np.uint8)
    out = Image.fromarray(rgba, "RGBA")
    return out.resize((LARGEUR, round(LARGEUR * H / W)), Image.LANCZOS)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("portrait")
    p.add_argument("sortie")
    p.add_argument("nom")
    p.add_argument("--cellule", type=float, default=6.0, help="pas de la trame en pixels de sortie")
    a = p.parse_args()

    sortie = Path(a.sortie)
    sortie.mkdir(parents=True, exist_ok=True)
    detourer(a.portrait).save(sortie / f"{a.nom}-couleur.webp", quality=88, method=6)
    alpha, taille, original = couverture(a.portrait, a.cellule)
    composer(alpha, PAPIER, taille).save(sortie / f"{a.nom}-trame.webp", quality=88, method=6)
    composer(alpha, SURLIGNEUR, taille).save(sortie / f"{a.nom}-surligneur.webp", quality=88, method=6)
    original.resize(taille, Image.LANCZOS).save(sortie / f"{a.nom}-original.webp", quality=86, method=6)
    for f in sorted(sortie.glob(f"{a.nom}-*.webp")):
        print(f.name, f.stat().st_size // 1024, "Ko")


if __name__ == "__main__":
    main()
