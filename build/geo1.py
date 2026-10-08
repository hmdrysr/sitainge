import json,sys,numpy as np
R=sys.argv[1]
def polys(f):
    g=f['geometry'];return g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
def pip(pts,ring):
    x,y=pts[:,0],pts[:,1];ring=np.array(ring);ins=np.zeros(len(pts),bool)
    x1,y1=ring[:-1,0],ring[:-1,1];x2,y2=ring[1:,0],ring[1:,1]
    for i in range(len(x1)):
        c=((y1[i]>y)!=(y2[i]>y))&(x<(x2[i]-x1[i])*(y-y1[i])/(y2[i]-y1[i]+1e-300)+x1[i])
        ins^=c
    return ins
def inside(pts,f):
    r=np.zeros(len(pts),bool)
    for p in polys(f):
        r|= pip(pts,p[0])
        for h in p[1:]: r&=~pip(pts,h)
    return r
def rep(f):
    ps=polys(f);big=max(ps,key=lambda p:len(p[0]));return np.array(big[0])[::max(1,len(big[0])//60)]
d2=json.load(open(R+'/sADM2.geojson'))['features']
print(sorted(f['properties']['shapeName'] for f in d2 if f['properties']['shapeName'][0] in 'CK')) 
D={n:[f for f in d2 if f['properties']['shapeName']==n][0] for n in('Chittagong',"Cox's Bazar")}
def bb(f):
    a=np.array([p for pl in polys(f) for r in pl for p in r]);return a.min(0),a.max(0)
BB={n:bb(f) for n,f in D.items()}
def assign(fs):
    out={}
    for f in fs:
        lo,hi=bb(f);c=(lo+hi)/2
        pts=rep(f)
        best=None
        for n,F in D.items():
            if hi[0]<BB[n][0][0] or lo[0]>BB[n][1][0] or hi[1]<BB[n][0][1] or lo[1]>BB[n][1][1]: continue
            fr=inside(pts,F).mean()
            if fr>0.5: best=n
        if best: out[f['properties']['shapeID']]=best
    return out
a3=json.load(open(R+'/sADM3.geojson'))['features'];m3=assign(a3)
a4=json.load(open(R+'/sADM4.geojson'))['features'];m4=assign(a4)
json.dump({'adm3':m3,'adm4':m4},open('assign.json','w'))
import collections
for n in D:
    print(n,[f['properties']['shapeName'] for f in a3 if m3.get(f['properties']['shapeID'])==n])
    print(' adm4',sum(1 for v in m4.values() if v==n))
