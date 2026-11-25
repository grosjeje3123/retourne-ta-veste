import json, sys
from PIL import Image, ImageDraw
d=json.load(open('/tmp/fete/tetes.json'))
noms=sorted(d)
a,b=int(sys.argv[1]),int(sys.argv[2])
noms=noms[a:b]
cols=7; W,H=200,250
rows=(len(noms)+cols-1)//cols
out=Image.new('RGBA',(cols*W,rows*H),(90,45,140,255))
for k,n in enumerate(noms):
    im=Image.open(f'carte2/img/mini/{n}.webp').convert('RGBA').resize((W,H))
    x0,y0=(k%cols)*W,(k//cols)*H
    out.alpha_composite(im,(x0,y0))
    dr=ImageDraw.Draw(out)
    hx,hy=d[n]['chapeau']; bx,by=d[n]['bouche']
    for (px,py,c) in [(hx,hy,(255,40,40,255)),(bx,by,(40,200,255,255))]:
        X=x0+px*W/100; Y=y0+py*H/100
        dr.ellipse([X-5,Y-5,X+5,Y+5],fill=c,outline=(0,0,0,255))
    dr.text((x0+3,y0+H-12),n,fill=(255,255,0,255))
out.save(sys.argv[3])
