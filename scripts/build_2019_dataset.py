"""One-off ingestion of the 2019 starter list as RAW records. No forms are added or altered."""
import json, unicodedata

SRC = "SRC-2019-HY-VOCAB"
rows = [
 ("Äy","I"),("Äre","me"),("Äar","my/mine"),("Ai","come"),("Ayunn","come"),
 ("Toüi","you"),("Toüar","your"),("Namm","name"),("Duan","shop/store"),
 ("Gor","house/home"),("Döwrr","door"),("Médi","soil/earth"),("Tébil","table"),
 ("Sierr","chair"),("Gômm","good"),("K’raf","bad"),("Füa","boy"),("Myefüa","girl"),
 ("Beda","man"),("Bedi","woman"),("Manüsçh","person/human"),("Maf","forgive"),
 ("Soüri","job/work"),("Sori","sorry"),("Tenk iu","thank you"),("Tenks","thanks"),
 ("Öt","to/at"),("Badda / By","brother"),("Ken / Kene","how"),("Ki","what"),
]
out = []
for i,(form,gloss) in enumerate(rows,1):
    parts = [p.strip() for p in form.split("/")] if " / " in form else [form]
    out.append({
      "id": f"CTG-LEX-RAW-{i:05d}",
      "state": "RAW",
      "form_as_submitted": unicodedata.normalize("NFC", form),
      "reference_form": None,
      "variants": parts if len(parts) > 1 else [],
      "pronunciation": None, "ipa": None,
      "english_gloss": gloss,
      "part_of_speech": None, "example_sentence": None,
      "region": None, "generation": None, "register": None,
      "speaker_id": None, "recording": None,
      "source": SRC,
      "evidence_level": "unassessed",
      "confidence": "unverified",
      "ai_assisted": False,
      "notes": "Needs native-speaker verification.",
      "comparative_data": None,
      "provenance": {"submitted_by": "Hamid Yasir", "date_submitted": "2019-09-25",
                     "origin": "private 2019 list; locally sourced per author, speakers not recorded",
                     "reviewer": None, "review_date": None, "decision_history": []},
      "consent": "permission pending",
    })
with open("datasets/2019-hamid-yasir-starter-list.jsonl","w",encoding="utf-8") as f:
    for r in out: f.write(json.dumps(r, ensure_ascii=False)+"\n")
print(len(out),"records")
