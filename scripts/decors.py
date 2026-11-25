# Fabrique les fonds « vus d'en haut » des lieux de L'Hémicycle (SVG carrés, recadrés au centre par la page).
# Le plateau de jeu couvre le centre : les éléments marquants sont placés en haut, en bas et sur les côtés.
# Tons sombres et peu contrastés, pour que le texte blanc du tapis reste lisible.
import math, random, json

V = 1000
def svg(contenu, defs=''):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">'
            '<defs>' + defs + '<radialGradient id="dvg" cx="50%" cy="50%" r="72%"><stop offset="55%" stop-color="#000" stop-opacity="0"/>'
            '<stop offset="100%" stop-color="#000" stop-opacity=".42"/></radialGradient></defs>' + contenu +
            '<rect width="1000" height="1000" fill="url(#dvg)"/></svg>')
def f(x): return ('%.1f' % x).rstrip('0').rstrip('.')
def cercle(x, y, r, c, extra=''): return '<circle cx="%s" cy="%s" r="%s" fill="%s"%s/>' % (f(x), f(y), f(r), c, extra)
def ellipse(x, y, rx, ry, c, extra=''): return '<ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="%s"%s/>' % (f(x), f(y), f(rx), f(ry), c, extra)
def rect(x, y, w, h, c, rx=0, extra=''): return '<rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="%s"%s/>' % (f(x), f(y), f(w), f(h), f(rx), c, extra)
def trait(x1, y1, x2, y2, c, w, extra=''): return '<path d="M%s %sL%s %s" stroke="%s" stroke-width="%s"%s/>' % (f(x1), f(y1), f(x2), f(y2), c, f(w), extra)
def arbre(x, y, r, fonce='#1f3a28', clair='#2e5338'):
    return cercle(x + r * .12, y + r * .14, r, '#000', ' opacity=".25"') + cercle(x, y, r, fonce) + cercle(x - r * .25, y - r * .25, r * .55, clair, ' opacity=".55"')
def arc(cx, cy, r, a0, a1):
    x0, y0 = cx + r * math.cos(math.radians(a0)), cy - r * math.sin(math.radians(a0))
    x1, y1 = cx + r * math.cos(math.radians(a1)), cy - r * math.sin(math.radians(a1))
    return 'M%s %sA%s %s 0 %d 0 %s %s' % (f(x0), f(y0), f(r), f(r), 1 if abs(a1 - a0) > 180 else 0, f(x1), f(y1))
def polaire(cx, cy, r, a): return cx + r * math.cos(math.radians(a)), cy - r * math.sin(math.radians(a))
def bezier(p0, p1, p2, t): return ((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1])
# Une personne vue d'en haut : épaules et tête
def personne(x, y, habit, tete, rot=0, e=1):
    a = math.radians(rot)
    return (ellipse(x, y, 7 * e, 4.4 * e, habit, ' transform="rotate(%s %s %s)"' % (f(rot), f(x), f(y))) +
            cercle(x - math.sin(a) * .6 * e, y + math.cos(a) * .6 * e, 3.6 * e, tete))
TETES = ['#2b2220', '#3a2c24', '#4a3a30', '#5b4636', '#2e2a2a', '#6a6058', '#3d3530']

# ---------- L'hémicycle : les travées, les députés, le banc du gouvernement, le perchoir ----------
def hemicycle():
    rnd = random.Random(5)
    cx, cy = 500, 860
    c = rect(0, 0, V, V, '#1b1416')
    c += '<path d="' + arc(cx, cy, 960, 0, 180) + 'Z" fill="#221a1c"/>'                                            # tribunes du public
    c += '<path d="' + arc(cx, cy, 892, 2, 178) + '" fill="none" stroke="#3a2d26" stroke-width="5"/>'
    for a in range(4, 180, 6):
        x, y = polaire(cx, cy, 925, a)
        c += cercle(x, y, 6, '#2c2224')
    for k, r in enumerate(range(330, 880, 50)):
        gouv = k == 0
        c += '<path d="' + arc(cx, cy, r, 4, 176) + '" fill="none" stroke="%s" stroke-width="14"/>' % ('#4a3626' if gouv else '#33251d')
        rs = r + 17
        perim = math.pi * rs * 172 / 180
        n = int(perim / 30)
        c += ('<path d="' + arc(cx, cy, rs, 4, 176) + '" fill="none" stroke="%s" stroke-width="17" stroke-dasharray="%s %s"/>'
              % ('#5e2a2a' if gouv else '#511c23', f(perim / n * .78), f(perim / n * .22)))
        for i in range(n):                                                                                         # micros et députés
            a = 176 - (i + .39) * 172 / n
            mx, my = polaire(cx, cy, r, a)
            if i % 2 == 0: c += cercle(mx, my, 1.8, '#9a8a62', ' opacity=".6"')
            if rnd.random() < (0.55 if gouv else 0.3):
                px, py = polaire(cx, cy, rs + 2, a)
                c += personne(px, py, rnd.choice(['#2a2a32', '#30303a', '#3a3434', '#2c3038']), rnd.choice(TETES), 90 - a, .95)
    for a in (22, 48, 74, 106, 132, 158):                                                                           # escaliers
        x1, y1 = polaire(cx, cy, 305, a); x2, y2 = polaire(cx, cy, 895, a)
        c += trait(x1, y1, x2, y2, '#1b1416', 22) + trait(x1, y1, x2, y2, '#2a2022', 18, ' stroke-dasharray="3 11"')
    c += '<path d="' + arc(cx, cy, 300, 0, 180) + 'Z" fill="#283038"/>'                                            # le parquet
    for r in (120, 200, 270):
        c += '<path d="' + arc(cx, cy, r, 8, 172) + '" fill="none" stroke="#323b44" stroke-width="3"/>'
    for a in range(15, 180, 15):
        x1, y1 = polaire(cx, cy, 120, a); x2, y2 = polaire(cx, cy, 270, a)
        c += trait(x1, y1, x2, y2, '#2e3640', 2)
    c += '<path d="' + arc(cx, cy, 80, 0, 180) + 'Z" fill="#2f3842"/>' + '<path d="' + arc(cx, cy, 80, 0, 180) + '" fill="none" stroke="#3a444f" stroke-width="3"/>'
    c += rect(318, 900, 364, 100, '#251a1d') + ''.join(rect(330 + i * 36, 912, 24, 70, '#2f2226', 3) for i in range(10))  # la tapisserie
    c += '<path d="M380 846Q500 826 620 846V902H380Z" fill="#47321f"/>' + '<path d="M380 846Q500 826 620 846" fill="none" stroke="#5a4129" stroke-width="5"/>'  # le perchoir
    for x, col in ((440, '#4a1c22'), (500, '#6a2229'), (560, '#4a1c22')):
        c += rect(x - 16, 862, 32, 26, col, 7)
    c += personne(500, 872, '#2a2a32', '#4a3a30', 0, 1.1) + personne(440, 873, '#30303a', '#5b4636') + personne(560, 873, '#30303a', '#3a2c24')
    c += '<path d="M452 790H548L540 834H460Z" fill="#3d444d"/>' + rect(476, 798, 48, 16, '#56606a', 3) + cercle(500, 792, 3, '#9aa2aa')  # la tribune
    c += rect(240, 852, 116, 38, '#2a2224', 6) + rect(644, 852, 116, 38, '#2a2224', 6)                               # les huissiers
    c += personne(270, 871, '#1e1e22', '#5b4636') + personne(730, 871, '#1e1e22', '#3a2c24')
    return svg(c)

# ---------- Place de la République : pavés, platanes, monument, rassemblement, kiosque, pigeons ----------
def republique():
    rnd = random.Random(7)
    defs = ('<pattern id="dpav" width="34" height="34" patternUnits="userSpaceOnUse"><rect width="34" height="34" fill="#3b434b"/>'
            '<path d="M0 .5H34M.5 0V34" stroke="#454f58" stroke-width="1.5"/></pattern>')
    c = rect(0, 0, V, V, '#23282d')
    for y in (40, 960):                                                                                             # chaussées, marquages, voitures
        c += trait(0, y, V, y, '#3a4046', 3, ' stroke-dasharray="26 22"')
    for x, y, w, col in ((60, 14, 54, '#3a3f52'), (180, 50, 54, '#4a3a3a'), (420, 14, 130, '#2f4a3f'), (640, 50, 54, '#45453a'), (820, 14, 54, '#36404c'),
                         (110, 950, 54, '#403a48'), (330, 950, 54, '#3a4a4a'), (560, 948, 130, '#4a4032'), (790, 950, 54, '#3f3a3a')):
        c += rect(x, y, w, 26, col, 7) + rect(x + w * .62, y + 4, w * .16, 18, '#59646e', 3, ' opacity=".55"')
    c += rect(30, 82, 940, 836, 'url(#dpav)', 18)
    for x in range(70, 950, 62):                                                                                    # platanes et grilles d'arbres
        c += rect(x - 16, 102, 32, 32, '#30363c', 3) + arbre(x, 118, 27) + rect(x + 4, 868, 32, 32, '#30363c', 3) + arbre(x + 20, 884, 27)
    for y in range(190, 820, 66):
        c += arbre(76, y, 25) + arbre(924, y + 22, 25)
    for x in range(130, 900, 124):                                                                                  # bancs et lampadaires
        c += rect(x, 168, 46, 12, '#2f353b', 3) + rect(x + 20, 822, 46, 12, '#2f353b', 3)
        c += cercle(x + 85, 174, 9, '#d9c27a', ' opacity=".12"') + cercle(x + 85, 174, 5, '#d9c27a', ' opacity=".6"')
        c += cercle(x + 105, 828, 9, '#d9c27a', ' opacity=".12"') + cercle(x + 105, 828, 5, '#d9c27a', ' opacity=".6"')
    for y in range(260, 760, 124):
        c += rect(146, y, 12, 46, '#2f353b', 3) + rect(842, y + 40, 12, 46, '#2f353b', 3)
    # Le kiosque et sa terrasse
    c += rect(690, 700, 124, 74, '#2c3238', 8) + rect(700, 710, 104, 54, '#4a3f33', 5) + trait(700, 737, 804, 737, '#56483a', 3)
    for i in range(6):
        tx, ty = 700 + (i % 3) * 44, 660 + (i // 3) * 22
        c += cercle(tx, ty, 7, '#4b525a') + cercle(tx - 11, ty, 4, '#2f353b') + cercle(tx + 11, ty, 4, '#2f353b')
    # Station Vélib'
    for i in range(9):
        x = 184 + i * 18
        c += rect(x, 726, 6, 40, '#3a4a3e', 2) + cercle(x + 3, 731, 3.2, '#4d6a54') + cercle(x + 3, 761, 3.2, '#4d6a54')
    c += rect(178, 770, 168, 6, '#2f353b', 2)
    # Le rassemblement : banderoles, ballons, et du monde autour
    for _ in range(260):
        x, y = rnd.choice([(rnd.uniform(160, 290), rnd.uniform(220, 640)), (rnd.uniform(710, 840), rnd.uniform(220, 600))])
        c += personne(x, y, rnd.choice(['#2a3036', '#33393f', '#2c2c34', '#3a3036', '#2e3830']), rnd.choice(TETES), rnd.uniform(-30, 30), .9)
    for x, y, w, col in ((168, 300, 110, '#6e3434'), (180, 470, 96, '#6e5530'), (712, 280, 104, '#4f4270'), (724, 470, 92, '#355e50')):
        c += rect(x, y, w, 16, col, 2) + cercle(x, y + 8, 4, '#1e2226') + cercle(x + w, y + 8, 4, '#1e2226')
    for x, y, col in ((200, 260, '#7a3a3a'), (262, 420, '#7a5a2e'), (232, 580, '#5a4a7a'), (760, 250, '#3e6a5a'), (812, 420, '#7a3a3a'), (742, 560, '#7a5a2e')):
        c += trait(x, y + 12, x + 6, y + 34, '#1e2226', 1.5) + cercle(x, y, 12, col) + cercle(x - 4, y - 4, 4, '#ffffff', ' opacity=".15"')
    # Le monument : marches, piédestal, les trois statues, le lion, Marianne et son rameau
    c += cercle(500, 178, 98, '#30373e') + cercle(500, 178, 86, '#4e565e') + cercle(500, 178, 74, '#464e56') + cercle(500, 178, 62, '#4e565e')
    for a in range(0, 360, 30):
        x, y = polaire(500, 178, 50, a)
        c += rect(x - 5, y - 4, 10, 8, '#4d554f', 1.5, ' transform="rotate(%s %s %s)"' % (f(-a), f(x), f(y)))
    c += cercle(500, 178, 44, '#59605f')
    for a in (90 + 0, 90 + 120, 90 + 240):
        x, y = polaire(500, 178, 58, a)
        c += cercle(x, y, 9, '#6b6550') + cercle(x - 2, y - 2, 4, '#7d7760')
    c += ellipse(500, 262, 24, 10, '#6b6550') + cercle(522, 260, 7, '#76705a') + rect(470, 252, 12, 14, '#5d5848', 2)   # le lion et l'urne
    c += cercle(500, 178, 22, '#6b6550') + cercle(500, 178, 11, '#7c7558')
    c += trait(500, 178, 560, 146, '#7c7558', 5, ' stroke-linecap="round"')
    for t in (0.55, 0.75, 0.95):
        x, y = 500 + 60 * t, 178 - 32 * t
        c += ellipse(x, y - 5, 6, 3, '#6f7a4a') + ellipse(x, y + 5, 6, 3, '#6f7a4a')
    # Des pigeons
    for cxp, cyp in ((240, 690), (790, 650), (250, 196), (760, 210)):
        for _ in range(7):
            x, y = cxp + rnd.uniform(-26, 26), cyp + rnd.uniform(-16, 16)
            c += ellipse(x, y, 4, 2.6, '#5e646a', ' transform="rotate(%s %s %s)"' % (f(rnd.uniform(0, 180)), f(x), f(y)))
    return svg(c, defs)

# ---------- Le Trocadéro : Chaillot et sa colonnade, un meeting, les jardins, la Seine, la tour ----------
def trocadero():
    rnd = random.Random(3)
    c = rect(0, 0, V, V, '#1b1a2c')
    c += rect(0, 300, V, 330, '#1d2f27')                                                                            # jardins
    for d in ('M0 360C120 380 230 340 380 372', 'M1000 360C880 380 770 340 620 372', 'M60 600C160 560 260 610 380 580', 'M940 600C840 560 740 610 620 580'):
        c += '<path d="%s" fill="none" stroke="#2a3a33" stroke-width="12" stroke-linecap="round"/>' % d
    for x in list(range(40, 380, 58)) + list(range(640, 990, 58)):
        c += arbre(x, 340 + (x % 3) * 8, 22, '#162a20', '#22402f') + arbre(x + 18, 600 - (x % 4) * 6, 22, '#162a20', '#22402f')
    # Le bassin de Varsovie et ses canons à eau
    c += rect(392, 300, 216, 330, '#22344a', 10)
    for y in (360, 430, 500, 570):
        c += trait(392, y, 608, y, '#2a4058', 3)
    for y in range(325, 615, 36):
        for x in (420, 460, 500, 540, 580):
            c += cercle(x, y, 4, '#7fa6c9', ' opacity=".55"')
    for i in range(8):
        y = 320 + i * 40
        c += trait(392, y, 420, y + 6, '#9ec0de', 2.5, ' opacity=".5"') + trait(608, y, 580, y + 6, '#9ec0de', 2.5, ' opacity=".5"')
    # Chaillot : les deux ailes, la colonnade, les pavillons, le parvis et ses statues dorées
    ailes = (((90, 120), (240, 300), (400, 250)), ((910, 120), (760, 300), (600, 250)))
    for p0, p1, p2 in ailes:
        d = 'M%s %sQ%s %s %s %s' % (p0[0], p0[1], p1[0], p1[1], p2[0], p2[1])
        c += '<path d="%s" fill="none" stroke="#474257" stroke-width="54" stroke-linecap="round"/>' % d
        c += '<path d="%s" fill="none" stroke="#58526a" stroke-width="8"/>' % d
        for k in range(1, 22):
            x, y = bezier(p0, p1, p2, k / 22)
            c += cercle(x, y + 18, 4, '#5f5873')
    c += rect(368, 196, 64, 70, '#4f4a60', 4) + rect(568, 196, 64, 70, '#4f4a60', 4)
    c += rect(432, 200, 136, 90, '#3a3648', 4)
    for x in (442, 474, 526, 558):
        c += cercle(x, 214, 5, '#b8954a', ' opacity=".85"') + cercle(x, 276, 5, '#b8954a', ' opacity=".85"')
    # Le meeting : une estrade, et du monde avec des drapeaux tricolores
    c += rect(452, 226, 96, 34, '#2a2638', 4) + cercle(500, 243, 6, '#6a6a7a')
    for _ in range(240):
        x, y = rnd.choice([(rnd.uniform(60, 288), rnd.uniform(390, 560)), (rnd.uniform(712, 940), rnd.uniform(390, 560))])
        c += personne(x, y, rnd.choice(['#2a2a3a', '#33333f', '#2c3038', '#3a3440']), rnd.choice(TETES), rnd.uniform(-20, 20), .85)
    for _ in range(26):
        x, y = rnd.choice([(rnd.uniform(70, 262), rnd.uniform(400, 540)), (rnd.uniform(712, 916), rnd.uniform(400, 540))])
        c += rect(x, y, 8, 12, '#2f4a7a') + rect(x + 8, y, 8, 12, '#b9bcc4') + rect(x + 16, y, 8, 12, '#8a3a3a')
    # L'avenue, la Seine, les bateaux, le pont d'Iéna
    c += rect(0, 630, V, 16, '#25233a')
    for i in range(14):
        x = rnd.uniform(0, 960)
        c += rect(x, 633, rnd.uniform(14, 30), 3, rnd.choice(['#e8d8b0', '#c45050']), 1.5, ' opacity=".55"')
    c += rect(0, 646, V, 78, '#1c3150')
    for k in range(18):
        c += rect(rnd.uniform(0, 960), rnd.uniform(656, 712), rnd.uniform(18, 46), 3, '#2c4a72', 1.5)
    for x in (140, 720):
        c += rect(x, 662, 150, 34, '#3a3f5a', 16) + rect(x + 12, 670, 126, 18, '#2f3348', 9)
        for i in range(8):
            c += cercle(x + 22 + i * 15, 679, 2.4, '#ffe9a8', ' opacity=".75"')
    c += rect(430, 636, 140, 98, '#46415a', 4) + rect(440, 646, 120, 78, '#3d3850', 3)
    for x, y in ((436, 640), (556, 640), (436, 718), (556, 718)):
        c += rect(x - 4, y - 4, 16, 16, '#5a5468', 2)
    for y in (656, 680, 704):
        c += cercle(440, y, 2.6, '#ffd98a', ' opacity=".8"') + cercle(560, y, 2.6, '#ffd98a', ' opacity=".8"')
    c += rect(0, 724, V, 32, '#25233a')
    # La tour Eiffel vue du ciel : piliers en dentelle, étages, pointe
    tx, ty, h = 500, 838, 82
    c += rect(tx - h - 40, ty - h + 10, 2 * h + 80, 2 * h + 70, '#1d2f27') + rect(tx - h, ty - h, 2 * h, 2 * h, '#1f1d30')
    for dx, dy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
        px, py = tx + dx * h, ty + dy * h
        c += rect(px - 19, py - 19, 38, 38, '#6d5627', 4)
        for k in range(-14, 16, 7):
            c += trait(px - 17, py + k, px + 17, py + k + 10, '#8a6d2e', 1.5) + trait(px + k, py - 17, px + k + 10, py + 17, '#8a6d2e', 1.5)
        c += trait(px, py, tx, ty, '#8a6d2e', 12) + trait(px, py, tx, ty, '#a7843a', 3, ' stroke-dasharray="4 5"')
    for s in (56, 32):
        c += rect(tx - s, ty - s, 2 * s, 2 * s, 'none', 2, ' stroke="#a7843a" stroke-width="5"')
    c += cercle(tx, ty, 11, '#c9a24a') + cercle(tx, ty, 4, '#ffe9a8')
    for _ in range(34):
        c += cercle(tx + rnd.uniform(-h, h), ty + rnd.uniform(-h, h), rnd.uniform(1.4, 2.8), '#ffe9a8', ' opacity=".8"')
    for x in range(30, 1000, 64):                                                                                   # lampadaires
        c += cercle(x, 286, 7, '#ffd98a', ' opacity=".12"') + cercle(x, 286, 3, '#ffd98a', ' opacity=".7"')
        c += cercle(x + 30, 742, 7, '#ffd98a', ' opacity=".12"') + cercle(x + 30, 742, 3, '#ffd98a', ' opacity=".7"')
    return svg(c)

# ---------- Les cuisines du Sénat : carrelage, piano, cuivres, îlot, plonge, chambre froide, passe, cuisiniers ----------
def senat():
    rnd = random.Random(9)
    defs = ('<pattern id="dcarreau" width="50" height="50" patternUnits="userSpaceOnUse"><rect width="50" height="50" fill="#2b363b"/>'
            '<rect width="25" height="25" fill="#2f3b40"/><rect x="25" y="25" width="25" height="25" fill="#2f3b40"/>'
            '<path d="M0 .5H50M.5 0V50" stroke="#35434a" stroke-width="1.5"/></pattern>')
    c = rect(0, 0, V, V, 'url(#dcarreau)')
    def plan(x, y, w, h):
        return rect(x + 4, y + 6, w, h, '#000', 8, ' opacity=".25"') + rect(x, y, w, h, '#4c565d', 8) + rect(x + 6, y + 6, w - 12, h - 12, '#58636a', 5) + rect(x + 6, y + 6, w - 12, 5, '#66727a', 2)
    def feu(x, y, r):
        return cercle(x, y, r, '#23282c') + cercle(x, y, r * .62, 'none', ' stroke="#3a3f44" stroke-width="3"') + cercle(x, y, r * .3, '#9c4a22', ' opacity=".7"')
    def casserole(x, y, r, angle, contenu):
        a = math.radians(angle)
        return (trait(x, y, x + (r + 34) * math.cos(a), y + (r + 34) * math.sin(a), '#5a3a24', 9, ' stroke-linecap="round"') +
                cercle(x, y, r, '#6e4428') + cercle(x, y, r * .8, '#3c2a20') + cercle(x, y, r * .62, contenu, ' opacity=".8"'))
    def vapeur(x, y):
        return ''.join(cercle(x + dx, y + dy, rr, '#dfe6ea', ' opacity=".07"') for dx, dy, rr in ((0, 0, 22), (14, -16, 16), (-12, -24, 14), (4, -40, 12)))
    def cuisinier(x, y, rot=0):
        return ellipse(x, y + 4, 22, 13, '#7d858a', ' transform="rotate(%s %s %s)"' % (f(rot), f(x), f(y))) + cercle(x, y, 13, '#a3aaae') + cercle(x - 3, y - 3, 6, '#b8bec1', ' opacity=".7"')
    # La hotte et le piano, en haut
    c += rect(96, 104, 808, 150, 'none', 10, ' stroke="#3e4a50" stroke-width="4" stroke-dasharray="14 10"')
    c += plan(110, 118, 780, 120)
    for x in range(170, 860, 100):
        c += feu(x, 178, 34)
    c += casserole(270, 176, 26, -40, '#8a5a3a') + casserole(470, 180, 30, 220, '#9c7a4a') + casserole(670, 176, 24, -60, '#6a7a3a')
    c += cercle(770, 178, 40, '#6e4428') + cercle(770, 178, 33, '#3c2a20') + cercle(770, 178, 26, '#8a4a2e', ' opacity=".8"') + trait(770, 178, 812, 140, '#8a949b', 5, ' stroke-linecap="round"')  # la marmite et sa louche
    c += vapeur(470, 160) + vapeur(770, 150) + vapeur(270, 156)
    c += cuisinier(150, 270, 20) + cuisinier(860, 268, -20)
    # La plonge, à gauche
    c += plan(28, 280, 150, 440)
    for y in (320, 470):
        c += rect(52, y, 102, 120, '#3a4247', 10) + rect(58, y + 6, 90, 108, '#323a3f', 8) + cercle(103, y + 60, 7, '#6b777e')
        c += trait(103, y - 6, 103, y + 14, '#8a949b', 5) + trait(91, y - 6, 115, y - 6, '#8a949b', 5)
    c += plan(28, 610, 150, 100)
    for i in range(6):
        c += cercle(60 + (i % 3) * 42, 640 + (i // 3) * 40, 16, '#7f878c') + cercle(60 + (i % 3) * 42, 640 + (i // 3) * 40, 10, '#8d959a')
    c += cuisinier(222, 400, 90)
    # La chambre froide et ses caisses, à droite
    c += plan(822, 280, 150, 440)
    c += rect(846, 330, 102, 340, '#3b4850', 6) + rect(928, 470, 10, 60, '#8a949b', 3)
    for y in range(350, 660, 34):
        c += rect(860, y, 74, 3, '#455560', 1.5)
    for y, col in ((292, '#5b7a3e'), (690, '#a0662e')):
        c += rect(838, y, 60, 26, '#5a4632', 3) + ''.join(cercle(846 + i * 11, y + 13, 5, col) for i in range(5))
    # L'îlot central, sous le plateau
    c += plan(300, 320, 400, 360)
    # La passe, ses lampes chauffantes, les bons et la sonnette
    c += plan(150, 772, 700, 110)
    for x in range(210, 800, 78):
        c += cercle(x, 760, 22, '#e08a3a', ' opacity=".08"')
    for k, x in enumerate(range(210, 800, 78)):
        c += cercle(x, 827, 25, '#7f878c') + cercle(x, 827, 16, '#8d959a') + cercle(x + 3, 824, 6, ['#7a5a3a', '#5b6e3e', '#8a5a4a'][k % 3]) + cercle(x - 5, 830, 3, '#a8562e', ' opacity=".8"')
    c += trait(170, 786, 830, 786, '#8a949b', 3)
    for x in range(190, 820, 58):
        c += rect(x, 778, 14, 18, '#b4b9bc', 1)
    c += cercle(812, 826, 13, '#a68a4a') + cercle(812, 826, 5, '#c4a560')
    c += cuisinier(560, 912, 180) + cuisinier(330, 908, 180)
    # Le chariot de fromages, sous sa cloche
    c += rect(40, 742, 124, 70, '#4c565d', 6) + rect(46, 748, 112, 58, '#5a4a36', 5)
    for x in (66, 100):
        c += '<path d="M%s 794l15-28 15 28z" fill="#a28a3e"/>' % f(x)
    c += cercle(140, 772, 14, '#c4b27a') + '<path d="M140 772L154 772A14 14 0 0 0 147 760Z" fill="#8a7a4a"/>'
    for i in range(6):
        c += cercle(70 + i * 6, 760 + (i % 2) * 5, 3.4, '#5a3a5e')
    c += cercle(100, 777, 44, 'none', ' stroke="#9aa2a8" stroke-width="2" opacity=".35"')
    return svg(c, defs)

# ---------- L'Élysée : la rue, le portail, la cour d'honneur et son tapis rouge, le palais, le parc ----------
def chateau():
    rnd = random.Random(11)
    defs = ('<pattern id="dtonte" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#1c3a2a"/>'
            '<rect width="40" height="80" fill="#1f3f2e"/></pattern>')
    def garde(x, y):
        return cercle(x, y, 6, '#22262e') + cercle(x, y, 3.4, '#8a8f99') + ellipse(x, y - 6, 2.4, 4.5, '#8a2e32')
    c = rect(0, 0, V, V, 'url(#dtonte)')
    c += rect(0, 0, V, 92, '#26292e') + trait(0, 30, V, 30, '#3a3f45', 3, ' stroke-dasharray="26 22"')            # le faubourg Saint-Honoré
    for x, col in ((80, '#1a1c22'), (250, '#3a3f52'), (700, '#1a1c22'), (860, '#45453a')):
        c += rect(x, 14, 64, 26, col, 7) + rect(x + 40, 18, 10, 18, '#59646e', 3, ' opacity=".5"')
    c += rect(408, 70, 184, 28, '#3a3f45', 3) + ''.join(rect(416 + i * 14, 74, 4, 20, '#7a6a3a') for i in range(12))  # le portail
    c += garde(398, 84) + garde(602, 84)
    c += rect(200, 92, 600, 66, '#4b463a')                                                                          # la cour d'honneur
    c += rect(486, 92, 28, 66, '#6a2a2e')                                                                           # le tapis rouge
    for y in (104, 124, 144):
        c += garde(470, y) + garde(530, y)
    for x in (250, 330, 670, 750):
        c += rect(x, 104, 48, 22, '#15171c', 6) + rect(x + 30, 107, 10, 16, '#3a404a', 2)                           # voitures officielles
    c += rect(120, 92, 80, 170, '#3a4350') + rect(800, 92, 80, 170, '#3a4350')                                      # les ailes
    c += rect(120, 158, 760, 104, '#3a4350') + rect(120, 206, 760, 5, '#4d5868')                                    # le palais, toit d'ardoise
    for x in range(150, 860, 46):
        c += rect(x, 172, 14, 10, '#4d5868', 2) + rect(x + 6, 232, 14, 10, '#4d5868', 2)                            # lucarnes
    for x in (180, 300, 700, 820):
        c += rect(x, 196, 16, 26, '#2f3640', 2)                                                                     # cheminées
    c += rect(430, 146, 140, 128, '#43505f', 4) + rect(430, 206, 140, 5, '#56637a')                                 # le corps central
    c += trait(500, 176, 500, 150, '#8a8f99', 3) + rect(500, 150, 9, 13, '#2f4a7a') + rect(509, 150, 9, 13, '#c9ccd4') + rect(518, 150, 9, 13, '#8a3a3a')  # le drapeau
    c += rect(140, 262, 720, 64, '#4b463a')                                                                         # la terrasse et son perron
    for i in range(4):
        c += rect(440 + i * 6, 262 + i * 6, 120 - i * 12, 6, '#5c5646')
    for x in range(170, 850, 70):
        if 400 < x < 600: continue
        c += rect(x - 10, 284, 20, 20, '#3e3a30', 2) + cercle(x, 294, 12, '#2c4a2f') + cercle(x - 3, 291, 4, '#c4902e', ' opacity=".6"')  # orangers en caisse
    c += '<path d="M500 326C380 450 620 560 500 660S380 820 500 960" fill="none" stroke="#4b463a" stroke-width="26" stroke-linecap="round"/>'  # allées
    c += '<path d="M200 326C140 500 260 640 170 940M800 326C860 500 740 640 830 940" fill="none" stroke="#45412f" stroke-width="18" stroke-linecap="round"/>'
    for x, y in ((280, 296), (720, 296)):
        c += ellipse(x, y + 60, 74, 24, '#3b2f3e') + ''.join(cercle(x - 56 + i * 14, y + 60 + (i % 2) * 6 - 3, 4, ['#8a5a6a', '#9a8a4a', '#6a5a8a'][i % 3], ' opacity=".7"') for i in range(9))
    for x, y in ((300, 800), (700, 760)):                                                                           # bancs
        c += rect(x, y, 44, 12, '#4b463a', 3)
    for _ in range(50):
        x = rnd.choice([rnd.uniform(20, 270), rnd.uniform(730, 980)])
        y = rnd.uniform(380, 940)
        c += arbre(x, y, rnd.uniform(24, 38), '#142b1f', '#1f3f2d')
    for x in range(160, 860, 70):
        c += arbre(x, 930, 24, '#142b1f', '#1f3f2d')
    c += rect(0, 968, V, 32, '#26292e') + rect(450, 958, 100, 18, '#3a3f45', 3) + cercle(500, 958, 6, '#c9a24a')     # la grille du Coq
    return svg(c, defs)

# ---------- Le plateau télé : projecteurs, pupitres, écrans de retour, animateurs, caméras, grue, marques au sol ----------
def tele():
    rnd = random.Random(13)
    defs = ('<radialGradient id="dspot1" cx="18%" cy="8%" r="60%"><stop offset="0" stop-color="#7a46be" stop-opacity=".5"/><stop offset="1" stop-color="#7a46be" stop-opacity="0"/></radialGradient>'
            '<radialGradient id="dspot2" cx="82%" cy="8%" r="60%"><stop offset="0" stop-color="#0f8c96" stop-opacity=".45"/><stop offset="1" stop-color="#0f8c96" stop-opacity="0"/></radialGradient>'
            '<radialGradient id="dcone" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f6f0d0" stop-opacity=".12"/><stop offset="1" stop-color="#f6f0d0" stop-opacity="0"/></radialGradient>')
    c = rect(0, 0, V, V, '#121318')
    c += cercle(500, 500, 450, '#191b22') + cercle(500, 500, 450, 'none', ' stroke="#2a2d38" stroke-width="10"')
    c += cercle(500, 500, 380, 'none', ' stroke="#22252f" stroke-width="3"') + cercle(500, 500, 300, 'none', ' stroke="#1e2129" stroke-width="2"')
    c += ('<text x="500" y="560" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="190" font-weight="900" fill="#1a1d25">2027</text>')
    for y, x0, x1 in ((112, 60, 940), (888, 60, 940)):                                                             # les ponts de projecteurs
        c += trait(x0, y - 7, x1, y - 7, '#2c2f3a', 3) + trait(x0, y + 7, x1, y + 7, '#2c2f3a', 3)
        c += ''.join(trait(x, y - 7, x + 20, y + 7, '#2c2f3a', 2) for x in range(x0, x1, 20))
        for x in range(x0 + 30, x1, 110):
            c += cercle(x, y, 13, '#2f3340') + cercle(x, y, 7, '#e8e2c0', ' opacity=".55"')
    c += ellipse(180, 500, 150, 120, 'url(#dcone)') + ellipse(820, 500, 150, 120, 'url(#dcone)')
    for x, w in ((372, 112), (516, 104)):                                                                           # les deux temps de parole
        c += rect(x, 146, 120, 18, '#1a2238', 4) + rect(x, 146, w, 18, '#3c4d7a', 4)
    c += '<path d="M372 210Q500 186 628 210V244H372Z" fill="#2c3040"/>' + cercle(450, 268, 18, '#1e2029') + cercle(550, 268, 18, '#1e2029')  # les animateurs
    c += personne(450, 266, '#2a2a3a', '#4a3a30', 180, 1.3) + personne(550, 266, '#3a3440', '#5b4636', 180, 1.3)
    c += rect(470, 214, 60, 22, '#1f2a44', 3) + rect(474, 218, 52, 14, '#2f4f8f', 2, ' opacity=".6"')
    for x, cote in ((120, 1), (760, -1)):                                                                           # les deux pupitres face à face
        c += rect(x, 400, 120, 200, '#2c3040', 10) + rect(x + 10, 410, 100, 180, '#353a4d', 7)
        c += rect(x + 30, 440, 44, 56, '#4a5066', 3) + ''.join(trait(x + 36, 452 + i * 10, x + 68, 452 + i * 10, '#6a7088', 2) for i in range(4))  # les notes
        c += cercle(x + 82, 560, 8, '#5f6b85') + cercle(x + 82, 560, 5, '#7f8fa8', ' opacity=".6"')               # le verre d'eau
        c += trait(x + 24, 520, x + 70, 534, '#8a8f99', 3, ' stroke-linecap="round"')                             # le stylo
        ex = x + (130 if cote == 1 else -40)
        c += rect(ex, 440, 30, 50, '#1f2a44', 3) + rect(ex + 4, 444, 22, 42, '#2f4f8f', 2, ' opacity=".55"')       # l'écran de retour
    c += cercle(84, 500, 24, '#1e2029') + cercle(916, 500, 24, '#1e2029')
    c += personne(84, 500, '#2a2a3a', '#4a3a30', 90, 1.5) + personne(916, 500, '#3a3440', '#5b4636', -90, 1.5)
    def camera(x, y, angle, operateur=True):
        g = '<g transform="translate(%s %s) rotate(%s)">' % (f(x), f(y), f(angle))
        g += rect(-30, -20, 60, 40, '#2f3340', 6) + '<path d="M30 -14L58 -26V26L30 14z" fill="#454b5c"/>' + cercle(-12, 0, 8, '#cc3b3b', ' opacity=".8"') + '</g>'
        a = math.radians(angle + 180)
        legs = ''.join(trait(x, y, x + 46 * math.cos(math.radians(angle + 180 + d)), y + 46 * math.sin(math.radians(angle + 180 + d)), '#262934', 5) for d in (-40, 0, 40))
        op = personne(x + 44 * math.cos(a), y + 44 * math.sin(a), '#2a2c36', '#3a2c24', angle + 90, 1.3) if operateur else ''
        return legs + op + g
    c += camera(130, 830, -40) + camera(870, 830, 220) + camera(130, 190, 40) + camera(870, 190, 140)
    c += '<path d="M320 950Q500 900 680 950" fill="none" stroke="#2c2f3a" stroke-width="4"/>' + '<path d="M320 966Q500 916 680 966" fill="none" stroke="#2c2f3a" stroke-width="4"/>'  # rails du travelling
    c += camera(500, 905, -90)
    c += trait(700, 960, 590, 760, '#3a3e4c', 10, ' stroke-linecap="round"') + rect(690, 950, 40, 30, '#2a2d38', 4) + cercle(590, 760, 14, '#454b5c') + cercle(590, 760, 6, '#cc3b3b', ' opacity=".7"')  # la grue
    for x, y in ((250, 700), (750, 300), (230, 300), (770, 690)):                          # marques au sol
        c += trait(x - 9, y, x + 9, y, '#b8b04a', 3, ' opacity=".55"') + trait(x, y - 9, x, y + 9, '#b8b04a', 3, ' opacity=".55"')
    c += '<path d="M60 980C200 900 300 960 420 930S700 980 940 960" fill="none" stroke="#252832" stroke-width="7"/>'
    c += '<path d="M30 300C80 380 40 460 96 520M970 300C920 380 960 460 904 520" fill="none" stroke="#22252e" stroke-width="5"/>'
    c += rect(0, 0, V, V, 'url(#dspot1)') + rect(0, 0, V, V, 'url(#dspot2)')
    return svg(c, defs)

DECORS = {'hemicycle': hemicycle(), 'republique': republique(), 'trocadero': trocadero(), 'senat': senat(), 'chateau': chateau(), 'tele': tele()}
js = ("/* Fonds « vus d'en haut » des lieux de L'Hémicycle, dessinés en SVG par scripts/decors.py. */\n"
      "window.HemicycleDecors = " + json.dumps(DECORS, ensure_ascii=False) + ";\n")
open('/home/claude/carte2/decors.js', 'w', encoding='utf-8').write(js)
for k, v in DECORS.items():
    print(k, len(v))
print('decors.js', len(js))
