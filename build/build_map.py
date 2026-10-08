#!/usr/bin/env python3
"""Build website/data/map-admin.json from geoBoundaries gbOpen BGD simplified ADM2/3/4 + admin.json names.
usage: build_map.py RAW_DIR   (RAW_DIR has sADM2/3/4.geojson)"""
import json,sys,os,re,difflib,numpy as np
R=sys.argv[1];HERE=os.path.dirname(os.path.abspath(__file__))
admin=json.load(open(HERE+'/../website/data/admin.json'))
# same coordinate system as stage2 map.json (fitted): x=(lon-LON0)*K*COS, y=(LAT0-lat)*K
K=272.45;COS=251.9/272.45;LON0=91.82938128-355.4/251.9;LAT0=20.59060935+1034.8/K
def P(p): return ((p[0]-LON0)*K*COS,(LAT0-p[1])*K)
def polys(f):
    g=f['geometry'];return g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
def pip(pts,ring):
    x,y=pts[:,0],pts[:,1];ring=np.array(ring);ins=np.zeros(len(pts),bool)
    for i in range(len(ring)-1):
        x1,y1,x2,y2=ring[i,0],ring[i,1],ring[i+1,0],ring[i+1,1]
        if y1==y2: continue
        ins^=((y1>y)!=(y2>y))&(x<(x2-x1)*(y-y1)/(y2-y1)+x1)
    return ins
def inside(pts,f):
    r=np.zeros(len(pts),bool)
    for p in polys(f):
        r|=pip(pts,p[0])
        for h in p[1:]: r&=~pip(pts,h)
    return r
def sample(f):
    ps=polys(f);big=max(ps,key=lambda p:len(p[0]));a=np.array(big[0]);return a[::max(1,len(a)//80)]
def bb(f):
    a=np.array([p for pl in polys(f) for r in pl for p in r]);return a.min(0),a.max(0)
def rdp(a,eps):
    if len(a)<3: return a
    keep=np.zeros(len(a),bool);keep[0]=keep[-1]=True;st=[(0,len(a)-1)]
    while st:
        i,j=st.pop()
        if j<=i+1: continue
        p,q=a[i],a[j];d=q-p;L=np.hypot(*d)
        seg=a[i+1:j]
        dist=np.hypot(*(seg-p).T) if L==0 else np.abs(d[0]*(seg[:,1]-p[1])-d[1]*(seg[:,0]-p[0]))/L
        k=int(np.argmax(dist))
        if dist[k]>eps: keep[i+1+k]=True;st+=[(i,i+1+k),(i+1+k,j)]
    return a[keep]
def area(a): x,y=a[:,0],a[:,1];return 0.5*abs(np.dot(x,np.roll(y,1))-np.dot(y,np.roll(x,1)))
def path(f,eps,minarea):
    out=[]
    for pl in polys(f):
        for ri,ring in enumerate(pl):
            a=np.array([P(p) for p in ring])
            if ri==0 and area(a)<minarea and len(pl)==1 and len(polys(f))>1: continue
            a=rdp(a[:-1] if np.allclose(a[0],a[-1]) else a,eps)
            if len(a)<3 or area(a)<minarea*0.2: continue
            out.append("M"+" ".join("%.1f,%.1f"%tuple(p) for p in a)+"Z")
    return "".join(out)
FT=lambda n:json.load(open(R+'/s%s.geojson'%n))['features']
a2,a3,a4=FT('ADM2'),FT('ADM3'),FT('ADM4')
D={n:[f for f in a2 if f['properties']['shapeName']==n][0] for n in('Chittagong',"Cox's Bazar")}
# ADM3 -> district
ALIAS3={'Anowara':'Anwara','Maheshkhali':'Maheshkhali','Bayejid Bostami':'Bayazid Bostami','Chittagong Port':'Chittagong Port'}
CMP3={'Bakalia','Bayejid Bostami','Chandgaon','Chittagong Port','Double Mooring','Halishahar','Khulshi','Kotwali','Pahartali','Panchlaish','Patenga'}
upz={u['name']:r['name'] for r in admin['regions'] for u in r['upazilas']}
def dist_of(f,forced=None):
    lo,hi=bb(f);s=sample(f)
    for n,F in D.items():
        if inside(s,F).mean()>0.5: return n
f3={};dist3={}
for f in a3:
    n=ALIAS3.get(f['properties']['shapeName'],f['properties']['shapeName']);d=dist_of(f)
    if n=='Sandwip': d='Chittagong'   # island; district polygon sampling misses it (documented)
    if d: f3[n]=f;dist3[n]=d
upa=[n for n in f3 if n in upz];metro=[n for n in f3 if n in CMP3 or ALIAS3.get(n) in CMP3 or n=='Bayazid Bostami']
metro=[n for n in f3 if n not in upz]
print('upazila geometry:',len(upa),'missing:',[n for n in upz if n not in f3],'metro-thana shapes:',metro)
# ADM4 -> ADM3 (max fraction inside)
cands=[n for n in f3]
def norm(s): return re.sub(r'[^a-z]','',s.lower().replace('dakhin','south').replace('dbhurshi','bhurshi').replace('jhilwanja','jhilongjha').replace('dakshin','south').replace('dakkhin','south').replace('uttar','north').replace('madrasha','madarsha').replace('madrasa','madarsha').replace('ph','f').replace('chh','c').replace('kh','k').replace('aa','a').replace('ee','i').replace('oo','u').replace('w','v'))
un4={}
for f in a4:
    lo,hi=bb(f)
    if hi[0]<91.2 or lo[0]>92.4 or hi[1]<20.5 or lo[1]>22.99: continue
    s=sample(f);best=None;bf=0.5
    for n in cands:
        l3,h3=bb(f3[n])
        if hi[0]<l3[0] or lo[0]>h3[0] or hi[1]<l3[1] or lo[1]>h3[1]: continue
        fr=inside(s,f3[n]).mean()
        if fr>bf: best,bf=n,fr
    if best: un4.setdefault(best,[]).append(f)
print('adm4 in scope:',{k:len(v) for k,v in un4.items()})
admin_un={u['name']:u['unions'] for r in admin['regions'] for u in r['upazilas']}
EPS_U,EPS_N=0.3,0.3
unions=[];municip=[];mism={'adm4_unmatched':{},'admin_unmatched':{}}
for up,fs in un4.items():
    if up not in admin_un:
        continue
    names=list(admin_un[up])+(admin_un['Eidgaon'] if up=="Cox's Bazar Sadar" else []);used=set()
    pairs=[]
    for f in fs:
        nm=f['properties']['shapeName']
        sc=sorted(((difflib.SequenceMatcher(None,norm(nm),norm(a)).ratio(),a) for a in names if a not in used),reverse=True)
        if nm.endswith(' Paurashava'): pairs.append((f,'PAURA',nm));continue
        if sc and sc[0][0]>=0.72: used.add(sc[0][1]);pairs.append((f,sc[0][1],nm))
        else: pairs.append((f,None,nm))
    for f,a,nm in pairs:
        if a=='PAURA':
            d=path(f,EPS_N,0.3)
            if d: municip.append({"name":nm.replace(' Paurashava',''),"upazila":up,"d":d})
            continue
        if a is None: mism['adm4_unmatched'].setdefault(up,[]).append(nm)
        d=path(f,EPS_N,0.3)
        uu='Eidgaon' if (up=="Cox's Bazar Sadar" and a in admin_un['Eidgaon']) else up
        if d: unions.append({"name":a or nm,"upazila":uu,"matched":a is not None,"d":d})
    used.add('PAURA');left=[a for a in names if a not in used]
    if left: mism['admin_unmatched'][up]=left
wards={}
for f in a4:
    m=re.match(r'Ward No-(\d+)(?: \((?:P|p)art\))?$',f['properties']['shapeName'])
    if not m: continue
    lo,hi=bb(f)
    if not(91.6<lo[0] and hi[0]<92.0 and 22.15<lo[1] and hi[1]<22.55): continue
    wards.setdefault(int(m.group(1)),[]).append(f)
wardout=[]
for k in sorted(wards):
    th=[]
    for n in metro:
        for f in wards[k]:
            if inside(sample(f),f3[n]).mean()>0.5 and n not in th: th.append(n)
    wardout.append({"ward":k,"parts":len(wards[k]),"thanas":th,"d":"".join(path(f,0.2,0.05) for f in wards[k])})
print('wards',sorted(wards),'missing of 1..41',[i for i in range(1,42) if i not in wards])
ups=[{"name":n,"district":dist3[n],"d":path(f3[n],0.2,0.3)} for n in upa]
thanas=[{"name":ALIAS3.get(n,n),"d":path(f3[n],0.3,0.1)} for n in metro]
dist=[{"name":n,"d":path(D[n],0.3,0.5)} for n in D]
allpts=np.array([[float(a),float(b)] for it in dist for a,b in re.findall(r'(-?[\d.]+),(-?[\d.]+)',it['d'])])
mn,mx=allpts.min(0),allpts.max(0);pad=6
vb=[float(round(v,1)) for v in (mn[0]-pad,mn[1]-pad,mx[0]-mn[0]+2*pad,mx[1]-mn[1]+2*pad)]
out={"viewBox":vb,"projection":"Equirectangular, x=(lon-%.4f)*%.2f*%.4f, y=(%.4f-lat)*%.2f; same coordinate system as map.json (stage 2 district map), cropped here to Chittagong and Cox's Bazar districts."%(LON0,K,COS,LAT0,K),
 "districts":dist,"upazilas":ups,"metro_thanas":thanas,"municipalities":municip,"city_corporation_wards":wardout,"unions":unions,
 "credit":"Boundaries: geoBoundaries gbOpen Bangladesh ADM2/ADM3/ADM4 (CC BY 3.0 IGO), boundary year 2020, derived from Bangladesh Bureau of Statistics data via OCHA ROAP; simplified for the web. Runnel et al. geoBoundaries: Runfola et al. (2020), PLoS ONE 15(4): e0231866.".replace("Runnel et al. geoBoundaries: ",""),
 "notes":["Upazila boundaries are the 2015 BBS set: Karnaphuli and Eidgaon upazilas have no separate polygon (Karnaphuli lies inside Patiya, Eidgaon inside Cox's Bazar Sadar) and Fatikchhari/Bhujpur thana is not split.","metro_thanas are the ADM3 shapes inside the Chittagong City Corporation area; names follow geoBoundaries spelling except Bayazid Bostami."]}
s=json.dumps(out,separators=(',',':'));
open(HERE+'/../website/data/map-admin.json','w').write(s)
json.dump(mism,open(HERE+'/map-mismatches.json','w'),indent=1)
print('bytes',len(s),'unions',len(unions),'matched',sum(u['matched'] for u in unions),'viewBox',vb)
print(json.dumps({k:{a:len(b) for a,b in v.items()} for k,v in mism.items()}))
# write ward/thana relation back into admin.json (geometry-derived, ADM4 'Ward No-n')
admin['regions'][0]['city_corporations'][0]['ward_geometry']={"wards_present":[w['ward'] for w in wardout],"ward_thanas":{str(w['ward']):w['thanas'] for w in wardout},"source":"geoboundaries_bgd","note":"Thana names are the ADM3 shapes (2015 BBS) that each ward polygon falls inside; a ward split across thanas lists each. Ward names are not in this dataset."}
open(HERE+'/../website/data/admin.json','w').write(json.dumps(admin,ensure_ascii=False,indent=1))
