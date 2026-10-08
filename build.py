import json
H1="https://classicistranieri.com/en/c/h/i/Chittagonian_language.html"
H2="https://en-academic.com/dic.nsf/enwiki/2078824"
def rec(i,form,gloss,src,url,note,pos=None,ex=None,bn=None,fn=None):
    return {"id":f"CTG-LEX-RAW-{i:05d}","state":"RAW","form_as_submitted":form,"reference_form":None,"variants":[],"spellings":[form],"pronunciation":None,"ipa":None,"ipa_status":"none","ipa_source":None,"english_gloss":gloss,"part_of_speech":pos,"example_sentence":ex,"region":None,"generation":None,"register":None,"form_note":fn,"speaker_id":None,"recording":None,"source":src,"evidence_level":"unassessed","confidence":"published source; extracted by AI from the page; not verified by a speaker","ai_assisted":True,"notes":note,"comparative_data":({"bangla_script_as_in_source":bn} if bn else None),"provenance":{"submitted_by":"web harvest 2026-10-08 (round 2)","date_submitted":"2026-10-08","origin":f"{url} (retrieved 2026-10-08; mirror of an old English Wikipedia 'Chittagonian language' revision; licence of source: not stated on mirror page; Wikipedia text is normally CC BY-SA; original authors unknown)","reviewer":None,"review_date":None,"decision_history":[]},"consent":"research-only"}
out=[]
for l in open('harvest/academic.jsonl'): out.append(json.loads(l))
n=3000
def add(*a,**k):
    global n; out.append(rec(n,*a,**k)); n+=1
W="Old-revision Wikipedia mirror; typography unverified against any live page; gloss as printed"
# H2-1
ph1=[("Tũi ken aso?","How are you","Nasal vowels section, example phrase"),
("Ãi gom asi.","I am fine","Nasal vowels section, example phrase"),
("Tũi honde?","Where are you","Nasal vowels section, example phrase"),
("Tõar nam ki?","What's your name","Nasal vowels section, example phrase"),
("Ãr nam Abul.","My name is Abul","Nasal vowels section, example phrase"),
("Tõar lai ãr fed furer?","I miss you","Nasal vowels section, example phrase; printed with a question mark although glossed as a statement"),
("Ãi tõare valobasi.","I love you","Nasal vowels section, example phrase")]
for f,g,nt in ph1: add(f,g,"SRC-WEB-H2-1",H1,nt+"; "+W,pos="phrase",ex=f,fn="phrase")
add("ar","and","SRC-WEB-H2-1",H1,"Nasal vowels section, minimal pair with ãr; "+W)
add("ãr","my","SRC-WEB-H2-1",H1,"Nasal vowels section, minimal pair with ar; "+W)
# H2-2 phrases
ph2=[("Ãi gawm asi.","I am fine","variant spelling of 'Ãi gom asi.' in another revision; Standard Bengali equivalent আঁই গঅঁম আছি। given by source"),
("Ãi gawm nai.","I am not fine",""),
("Ãtte gom naw lager.","I am not feeling well.",""),
("Ãi kirket kheillum","I will play Cricket","gloss as printed; the printed form has no final full stop"),
("Tũi konde?","Where are you","variant of 'Tũi honde?' in another revision; Standard Bengali equivalent তুঁই কঁন্ডে? given by source"),
("Tõar lai O ãr fed furer.","I miss you too.",""),
("Ãtte tuãre beshi gom lage.","I love you","gloss as printed"),
("Tũi honde jor?","Where are you going",""),
("Tũi kothtun aishshu?","Where are you from?",""),
("Tũi konde thako?","Where do you live?",""),
("Ãar Dilũt shanti nai.","I'm sad.","gloss as printed"),
("Bangladesh Ãar Khoìlĵar bhitor.","Bangladesh is in my heart.","gloss as printed; unusual letters (ì, ĵ) copied as returned by the fetch tool"),
("Tuarey Doinnobaad","Thank You","likely a Bengali-derived formal form; unverified")]
for f,g,nt in ph2: add(f,g,"SRC-WEB-H2-2",H2,("Phrase list, old revision. "+nt+"; " if nt else "Phrase list, old revision; ")+W,pos="phrase",ex=f,fn="phrase")
# word order
wo=[("Ítara","They","pronoun","Word Order table, subject column"),("hamót","to work",None,"Word Order example, as printed '(to work)'"),
("Aááí","I","pronoun","Word Order table, subject column; unusual accents, copied as returned by the fetch tool"),("bát","rice","noun","Word Order table, object column"),("haí","eat","verb","Word Order table, verb column"),
("Ité","He","pronoun","Word Order table, subject column"),("saí","watches","verb","Word Order table, verb column; gloss as printed '(watches)'"),
("Ití","She","pronoun","Word Order table, subject column"),("sairkélot","bicycle","noun","Word Order table, object column"),("sorér","is riding","verb","Word Order table, verb column; gloss as printed '(is riding )'")]
for f,g,p,nt in wo: add(f,g,"SRC-WEB-H2-2",H2,nt+"; Latin-letter forms only taken; "+W,pos=p,bn=("ইঁতারা হাঁমত যার গুঁই ।" if f=="Ítara" else None))
# 'few words' forms
fw=[("Kéti án","the farm"),("Kéti Ğín","the farms"),("Fothú án","the picture"),("Fothú Ğín","the pictures"),("Fata wá","the leaf"),("Fata Ğín","the leaves"),("Tar gán","the wire"),("Tar Ğin","the wires"),("Duar gán","the door"),("Duar gin","the doors"),("Faár gwá","the mountain"),("Faár gún","the mountains"),("Debal lán","the wall"),("Debal lún","the walls"),("Kitap pwá","the book"),("Kitap pún","the books"),("Manúish cwá","the man"),("Manúish shún","the men"),("Uggwá fata","a leaf"),("Hodún fata","some leaves"),("Ekkán fothú","a picture"),("Hodigin Fothú","some pictures")]
for f,g in fw: add(f,g,"SRC-WEB-H2-2",H2,"'Few Chittagonian words and meanings' tables (singular/plural headings); the page gives no grammatical explanation of the endings; "+W,pos="noun phrase",fn="noun with ending as printed")
with open('stage3/lexicon/raw/2026-10-08-web-harvest-2.jsonl','w') as f:
    for r in out: f.write(json.dumps(r,ensure_ascii=False)+"\n")
print(len(out),n)
