#!/usr/bin/env python3
"""Assemble website/data/admin.json. Inputs: ../../s3raw/pc.json (aiFdn postcodes), n_*.json (nuhil).
Hand-entered values below were read from the cited Wikipedia articles on 2026-10-08 (see docs)."""
import json,sys,collections,os
RAW=os.path.join(os.path.dirname(__file__),'..','..','s3raw')
OUT=os.path.join(os.path.dirname(__file__),'..','website','data','admin.json')
W="wp_"
# name, key, area, area_candidates, pop2022, unions, pstations[(name,basis)], municipalities[(name,wards)], src
U=[
("Mirsharai","Chittagong",482.88,None,472794,"Karerhat,Hinguli,Jorarganj,Dhum,Osmanpur,Ichhakhali,Katachhara,Durgapur,Mirsharai,Mithanala,Maghadia,Khaiyachhara,Mayani,Haitkandi,Wahedpur,Saherkhali",
 [("Mirsharai Thana","stated_current"),("Jorarganj Thana","stated_current")],[("Baraiyarhat",9),("Mirsharai",9)]),
("Fatikchhari","Chittagong",773.13,None,642089,"Paindong,Kanchan Nagar,Sunderpur,Lelang,Nanupur,Roshangiri,Bokhtapur,Jafotnagar,Dharmapur,Samitirhat,Abdullapur,Khiram",
 [("Fatikchhari Thana","stated_current"),("Bhujpur Thana","stated_current")],[("Fatikchhari",None),("Nazirhat",None)]),
("Sandwip","Chittagong",762.42,None,327564,"Amanullah,Azimpur,Bauria,Digghapar,Gachhua,Haramia,Harispur,Kalapania,Magdhara,Maitbhanga,Musapur,Rahmatpur,Santoshpur,Sarikait,Urirchar",
 [("Sandwip Thana","stated_historical")],[("Sandwip",9)]),
("Sitakunda","Chittagong",483.97,None,457396,"Banshbaria,Barabkunda,Bariadyala,Bhatiari,Kumira,Muradpur,Salimpur,Sonaichhari,Saidpur",
 [("Sitakunda Thana","stated_historical")],[("Sitakunda",None)]),
("Hathazari","Chittagong",246.32,None,498182,"Burirchar,Chhibatali,Chikandandi,South Madarsha,Dhalai,Fatehpur,Farhadabad,Garduara,Gumanmardan,Hathazari,Mekhal,Mirzapur,Nangalmora,Shikarpur,North Madarsha",
 [("Hathazari Thana","stated_historical")],[]),
("Raozan","Chittagong",246.58,None,396358,"Bagoan,Binajuri,Chikdair,Dabua,Gahira,Haladia,Kadalpur,Noajispur,Noapara,Pahartali,Paschim Guzara,Purba Guzara,Raozan,Urkirchar",
 [],[("Raozan",9)]),
("Rangunia","Chittagong",361.54,None,392904,"Betagi,Chandraghona,Dakshin Rajanagar,Hosnabad,Islampur,Kodala,Lalanagar,Mariumnagar,Padua,Parua,Pomara,Rajanagar,Rangunia,Sharafbhata,Silak",
 [("Rangunia Thana","stated_historical")],[("Rangunia",9)]),
("Karnaphuli","Chittagong",55.36,None,203705,"Karnaphuli,Char Patharghata,Shikalbaha,Char Lakhya,Juldha,Bara Uthan",
 [("Karnaphuli Thana","stated_current")],[]),
("Boalkhali","Chittagong",126.46,None,258688,"Ahalla Karaldenga,Amuchia,Charandwip,Kadhurkhil,Pashchim Gomdandi,Popadia,Saroatali,Shakpura,Sreepur Kharandwip",
 [],[("Boalkhali",None)]),
("Patiya","Chittagong",None,[156.34,316.47],397679,"Asia,Bara Uthan,Baralia,Bhatikhain,Chanhara,Char Lakhya,Char Patharghata,Dakshin Bhurshi,Dhalghat,Habilasdwip,Haidgaon,Janglukhain,Jiri,Juldha,Kachuai,Kasiais,Kelishahar,Kharana,Kolagaon,Kusumpura,Shikalbaha,Sobhandandi",
 [("Patiya Thana","stated_historical")],[("Patiya",9)]),
("Anwara","Chittagong",164.13,None,319482,"Anwara,Bairag,Barakhain,Barasat,Burumchhara,Battali,Chatari,Haildhar,Juidandi,Paraikora,Roypur",
 [],[]),
("Chandanaish","Chittagong",201.99,None,252242,"Bailtali,Barama,Barkal,Dhopachhari,Dohazari,Hashimpur,Joara,Kanchanabad,Satbaria",
 [("Chandanaish Thana","stated_historical")],[("Chandanaish",9),("Dohazari",None)]),
("Satkania","Chittagong",280.99,None,454062,"Amilaish,Bazalia,Charati,Dharmapur,Dhemsa,Eochia,Kaliaish,Kanchana,Keochia,Khagaria,Madarsha,Nalua,Paschim Dhemsa,Purangor,Sadaha,Satkania,Sonakania",
 [("Satkania Thana","stated_historical")],[("Satkania",9)]),
("Banshkhali","Chittagong",376.90,None,537593,"Pukuria,Sadhanpur,Khankhanabad,Baharchhara,Kalipur,Bailchhari,Katharia,Saral,Gandamara,Silkup,Chambal,Puichhari,Chhanua,Sekherkhil",
 [("Banshkhali Thana","stated_historical")],[("Banshkhali",9)]),
("Lohagara","Chittagong",258.87,None,328220,"Adhunagar,Amirabad,Putibila,Barahatia,Charamba,Chunati,Kalauzan,Lohagara,Padua",
 [("Lohagara Thana","stated_historical")],[]),
("Cox's Bazar Sadar","Cox's Bazar",108.57,None,417365,"Chowfaldandi,Jhilongjha,Khurushkhul,Pokkhali,Varuakhali",
 [("Cox's Bazar Thana","stated_historical")],[("Cox's Bazar",12)]),
("Chakaria","Cox's Bazar",503.83,None,571280,"Badarkhali,Baraitali,Bheola Manikchar,Bamo Bilchari,Chiringa,Demusia,Dulahazara,Fashiakhali,Harbang,Kaiarbil,Kakhara,Khuntakhali,Konakhali,Lakhyarchar,Paschim Bara Bheola,Purba Bara Bheola,Saharbil,Surajpur-Manikpur",
 [("Chakaria Thana","stated_historical")],[("Chakaria Bazar",9)]),
("Kutubdia","Cox's Bazar",None,[215.79,93.0],143622,"Ali Akbardeil,Baraghop,Dakshin Dhurung,Kaiyarbil,Lemsikhali,Uttar Dhurung",
 [("Baraghop police station","stated_historical")],[]),
("Ukhia","Cox's Bazar",261.8,None,263158,"Holdia Palong,Jalia Palong,Raja Palong,Ratna Palong,Palong Khali",[],[]),
("Maheshkhali","Cox's Bazar",362.18,None,385510,"Bara Maheshkhali,Chota Maheshkhali,Dhalghata,Hoanak,Kalarmarchhara,Kutubjom,Matarbari,Saflapur",
 [],[("Moheshkhali",9)]),
("Pekua","Cox's Bazar",139.61,None,214357,"Barabakia,Magnama,Pekua,Rajakhali,Shilkhali,Taitong,Ujantia",[],[]),
("Ramu","Cox's Bazar",391.71,None,344545,"Chakmarkul,Dakshin Mithachhari,Eidghar,Fotekharkul,Garjoniya,Jouarianala,Kacchapia,Kawarkhop,Khuniapalong,Rajarkul,Rashidnagar",[],[]),
("Teknaf","Cox's Bazar",388.66,None,333865,"Baharchhara,Nhila,Sabrang,Saint Martin,Teknaf,Whykong",[],[("Teknaf",9)]),
("Eidgaon","Cox's Bazar",119.66,None,149566,"Eidgaon,Islamabad,Islampur,Jalalabad,Pokkhali",
 [("Eidgaon Thana","stated_current")],[]),
]
WP={"Mirsharai":"Mirsharai_Upazila","Fatikchhari":"Fatikchhari_Upazila","Sandwip":"Sandwip_Upazila","Sitakunda":"Sitakunda_Upazila","Hathazari":"Hathazari_Upazila","Raozan":"Raozan_Upazila","Rangunia":"Rangunia_Upazila","Karnaphuli":"Karnaphuli_Upazila","Boalkhali":"Boalkhali_Upazila","Patiya":"Patiya_Upazila","Anwara":"Anwara_Upazila","Chandanaish":"Chandanaish_Upazila","Satkania":"Satkania_Upazila","Banshkhali":"Banshkhali_Upazila","Lohagara":"Lohagara_Upazila,_Chittagong","Cox's Bazar Sadar":"Cox%27s_Bazar_Sadar_Upazila","Chakaria":"Chakaria_Upazila","Kutubdia":"Kutubdia_Upazila","Ukhia":"Ukhia_Upazila","Maheshkhali":"Maheshkhali_Upazila","Pekua":"Pekua_Upazila","Ramu":"Ramu_Upazila","Teknaf":"Teknaf_Upazila","Eidgaon":"Eidgaon_Upazila"}
sid=lambda n:"wp_"+n.lower().replace("'","").replace(" ","_")
NOTES={
"Fatikchhari":["Wikipedia names 12 unions (Fatikchhari Thana); the 6 unions under Bhujpur Thana are not named there. They are taken from the nuhil dataset: Baganbazar, Dantmara, Narayanhat, Bhujpur, Harualchari, Suabil (inferred as the nuhil names absent from the Wikipedia 12; nuhil 'Daulatpur' is read as Wikipedia 'Khiram'; unconfirmed)."],
"Sitakunda":["Wikipedia also lists 'Bhatiari Cantonment Area' among 10 'unions'; it is not a union and is omitted. Nine unions listed (matches nuhil)."],
"Karnaphuli":["Wikipedia lists six names without calling them unions; five of them are also listed under Patiya."],
"Patiya":["Wikipedia gives area 156.34 km2 (infobox) and 316.47 km2 (body); area left null. Five of the 22 listed unions are also listed under Karnaphuli."],
"Kutubdia":["Wikipedia gives area 215.79 km2 (infobox) and 93 km2 (body); area left null."],
"Cox's Bazar Sadar":["Wikipedia shows 417,365 for both 2011 and 2022; the 2022 figure is consistent with the district total (the nine upazila populations sum exactly to 2,823,268)."],
"Eidgaon":["Union names are not stated in the Eidgaon article. Inferred: the five unions the nuhil dataset still lists under Cox's Bazar Sadar (Eidgaon, Islamabad, Islampur, Jalalabad, Pokkhali) match Wikipedia's count of five and the 2021 split; unconfirmed. Upazila established 26 July 2021; thana established 21 October 2019 (per the article)."],
"Rangunia":["Wikipedia lists 15 unions including 'Padua', which is also a Lohagara union; check against LGD."],
"Anwara":[],"Raozan":[],
}
# post offices
pc=json.load(open(RAW+'/pc.json'))['postcodes']
TH={"Anowara":"Anawara","Boalkhali":"Boalkhali","Fatikchhari":"Fatikchhari","Hathazari":"Hathazari","Banshkhali":"Jaldi","Chandanaish":"East Joara","Lohagara":"Lohagara","Mirsharai":"Mirsharai","Patiya":"Patiya","Rangunia":"Rangunia","Raozan":"Rouzan","Sandwip":"Sandwip","Satkania":"Satkania","Sitakunda":"Sitakunda","Anwara":"Anawara"}
TH.update({"Chakaria":"Chiringga","Cox's Bazar Sadar":"Coxs Bazar Sadar","Maheshkhali":"Gorakghat","Kutubdia":"Kutubdia","Ramu":"Ramu","Teknaf":"Teknaf","Ukhia":"Ukhia"})
def clean(s):
    s=" ".join(s.split()).replace("Chitt.University","Chittagong University").replace("Coxs Bazar","Cox's Bazar").replace("St.Martin","St. Martin")
    return s
def pos(dist,thana):
    return [{"name":clean(r['postOffice']),"postcode":r['postCode']} for r in pc if r['district']==dist and r['thana']==thana]
def ui(n): return n
SRC={}
def src(i,t,u,l,r="2026-10-08"):
    SRC[i]={"id":i,"title":t,"url":u,"licence":l,"retrieved":r}
WPL="CC BY-SA 4.0 (Wikipedia text)"
src("wp_chittagong_district","Chittagong District (Wikipedia)","https://en.wikipedia.org/wiki/Chittagong_District",WPL)
src("wp_coxs_bazar_district","Cox's Bazar District (Wikipedia)","https://en.wikipedia.org/wiki/Cox%27s_Bazar_District",WPL)
src("wp_ccc","Chittagong City Corporation (Wikipedia)","https://en.wikipedia.org/wiki/Chittagong_City_Corporation",WPL)
src("wp_cmp","Chittagong Metropolitan Police (Wikipedia)","https://en.wikipedia.org/wiki/Chittagong_Metropolitan_Police",WPL)
src("dailystar_ccc","Chittagong City Corporation: A lifeline of the country's economy (The Daily Star, 26 January 2021; direct link left out, search the title on thedailystar.net)","https://www.thedailystar.net/","Copyright The Daily Star; cited for facts only")
src("nuhil_geocode","nuhil/bangladesh-geocode (divisions, districts, upazilas, unions JSON)","https://github.com/nuhil/bangladesh-geocode","MIT (Copyright 2014 Nuhil Mehdy)")
src("aifdn_postcodes","aiFdn/Postcodes-of-Bangladesh, json/postcodes.json","https://github.com/aiFdn/Postcodes-of-Bangladesh/blob/master/json/postcodes.json","MIT (Copyright 2017 Akhaura Info Foundation)")
src("geoboundaries_bgd","geoBoundaries gbOpen BGD ADM2/ADM3/ADM4 (source: Bangladesh Bureau of Statistics via OCHA ROAP, boundary year 2020)","https://github.com/wmgeolab/geoBoundaries/tree/main/releaseData/gbOpen/BGD","CC BY 3.0 IGO")
ups=[]
for (n,dist,area,cand,pop,un,ps,mun,*_) in U:
    unl=[x.strip() for x in un.split(",")]
    if n=="Fatikchhari": unl+=["Baganbazar","Dantmara","Narayanhat","Bhujpur","Harualchari","Suabil"]
    s=[sid(n)]; src(sid(n),n+" Upazila (Wikipedia)","https://en.wikipedia.org/wiki/"+WP[n],WPL)
    if n in("Fatikchhari","Eidgaon"): s.append("nuhil_geocode")
    if any(b=="stated_current" for _,b in ps) and n!="Karnaphuli" and n!="Eidgaon": s.append("wp_chittagong_district")
    if n=="Karnaphuli": s.append("wp_ccc")
    po=[]
    if n in TH: po=pos("Chittagong" if dist=="Chittagong" else "Coxs Bazar",TH[n])
    if n=="Cox's Bazar Sadar": po=[p for p in po if p['postcode']!='4702']
    if n=="Eidgaon": po=[p for p in pos("Coxs Bazar","Coxs Bazar Sadar") if p['postcode']=='4702']
    if po: s.append("aifdn_postcodes")
    ups.append({"name":n,"district":dist,"area_km2":area,"area_km2_candidates":cand,"population_2022":pop,
      "police_stations":[{"name":a,"basis":b} for a,b in ps] if ps else None,
      "unions":unl,"union_count":len(unl),
      "post_offices":po if po else None,
      "municipalities":[{"name":a,"wards":b} for a,b in mun],
      "notes":NOTES.get(n,[]),"sources":s})
# city corporation post offices (Chittagong Sadar group)
ccc_po=pos("Chittagong","Chittagong Sadar")
CMP=["Akbarshah","Bakalia","Bandar","Bayazid","Chandgaon","Double Mooring","Halishahar","Khulshi","Kotwali","Pahartali","Panchlaish","Patenga","Chawkbazar","Sadarghat","EPZ","Karnaphuli"]
reg=[
{"name":"Chittagong","headquarters":"Chittagong (city)","area_km2":5282.92,"population_2022":9169464,
 "population_note":"Infobox gives 9,169,464; body text and table give 9,169,465.",
 "city_corporations":[{"name":"Chittagong City Corporation","established_as_city_corporation":1990,"wards":41,"area_km2":None,"population_2022":None,
   "post_offices":ccc_po,"post_offices_basis":"aiFdn dataset group 'Chittagong Sadar' (27 offices); older dataset, not ward-level.",
   "sources":["wp_ccc","dailystar_ccc","aifdn_postcodes"],
   "note":"Daily Star (2021-01-26) says the corporation took that name on 31 July 1990 after a Municipal Corporation upgrade in 1982 and a municipality founded 22 June 1863. Wikipedia flags its ward section as needing an update (January 2026); 41 is the figure in both sources."}],
 "metropolitan_police":{"name":"Chittagong Metropolitan Police","established":"30 November 1978","thanas_count":16,"thanas":CMP,"sources":["wp_cmp","wp_ccc"],
   "note":"Count of 16 is in both articles; the names are from the City Corporation article only (the Metropolitan Police article lists none). Wikipedia states 33 thanas in the district in total."},
 "thanas_total_in_district":33,
 "municipalities":[m|{"upazila":u['name']} for u in ups if u['district']=="Chittagong" for m in u['municipalities']],
 "sources":["wp_chittagong_district","nuhil_geocode"],
 "upazilas":[u for u in ups if u['district']=="Chittagong"]},
{"name":"Cox's Bazar","headquarters":"Cox's Bazar (town)","headquarters_basis":"Not stated in the Wikipedia article; the nuhil dataset gives the District Commissioner's office coordinates 21.44316, 91.97382, which fall in Cox's Bazar town.","area_km2":2491.85,"population_2022":2823268,
 "population_note":"Infobox area 2,491.85 km2; body text 2,491.86 km2. The nine upazila populations sum exactly to the district total.",
 "city_corporations":[],"city_corporation_note":"No city corporation found in any fetched source; Cox's Bazar has a municipality (pourashava).",
 "metropolitan_police":None,
 "municipalities":[m|{"upazila":u['name']} for u in ups if u['district']=="Cox's Bazar" for m in u['municipalities']],
 "sources":["wp_coxs_bazar_district","nuhil_geocode"],
 "upazilas":[u for u in ups if u['district']=="Cox's Bazar"]}]
out={"updated":"2026-10-08","regions":reg,"sources":list(SRC.values())}
for r in reg:
    r["upazila_count"]=len(r["upazilas"])
s=json.dumps(out,ensure_ascii=False,indent=1)
assert not any(ord(c)>127 for c in s.replace("’","")),[c for c in s if ord(c)>127][:5]
open(OUT,'w').write(s)
print(len(s),[ (r['name'],r['upazila_count'],sum(u['union_count'] for u in r['upazilas'])) for r in reg])
print('po',sum(len(u['post_offices'] or []) for r in reg for u in r['upazilas']),len(ccc_po))
