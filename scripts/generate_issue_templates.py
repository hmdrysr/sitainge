import os
os.makedirs(".github/ISSUE_TEMPLATE", exist_ok=True)
COMMON_TAIL = [
 ("source","How do you know this? (speaker, family, village, recording, book)","textarea",True),
 ("locality","Where is this used? (village, area, or 'not sure')","input",False),
 ("speaker","Who says it? (age group, gender if you wish, relation to you; no full names needed)","input",False),
 ("recording","Do you have a recording? (link or 'no')","input",False),
 ("confidence","How sure are you?","dropdown:Very sure,Fairly sure,Not sure",True),
 ("consent","What should we do with this?","dropdown:Publish it (CC0),Discuss with me first - do not publish yet",True),
 ("credit","How should we credit you?","dropdown:My name,Contributor ID only,Anonymous",True),
]
FORMS = {
 "new-word": ("New Word","vocabulary",[("word","The word, spelled however feels natural","input",True),("pronunciation","How it sounds (describe, or record it)","input",False),("meaning","What it means (in English)","textarea",True),("example","A sentence you would actually say","textarea",False)]),
 "variant-word": ("Variant Word","variant",[("word","Existing word","input",True),("variant","Your version","input",True),("difference","How is yours different? (not 'wrong', just different)","textarea",False)]),
 "grammar-observation": ("Grammar Observation","grammar",[("construction","What do people say, and in what situation?","textarea",True),("meaning","What does it mean?","textarea",True)]),
 "pronunciation": ("Pronunciation","pronunciation",[("word","Word or phrase","input",True),("pronunciation","How you say it","textarea",True)]),
 "regional-difference": ("Regional Difference","regional",[("item","Word, sound or phrase","input",True),("difference","How it differs between places","textarea",True)]),
 "historical-word": ("Historical Word","historical",[("word","Word","input",True),("meaning","Meaning","textarea",True),("who_used","Who used it, and when?","textarea",False)]),
 "proverb": ("Proverb","proverb",[("original","The proverb","textarea",True),("literal","Literal meaning","textarea",False),("actual","What it really means","textarea",True),("context","When people say it","textarea",False)]),
 "idiom": ("Idiom","idiom",[("original","The expression","input",True),("literal","Literal meaning","textarea",False),("actual","What it really means","textarea",True)]),
 "song": ("Song","song",[("title","Title or first line","input",True),("performer","Performer or who you learned it from","input",False),("context","When is it sung?","textarea",False)]),
 "story": ("Story","story",[("title","Title","input",True),("summary","What is the story?","textarea",True)]),
 "place-name": ("Place Name","place-name",[("name","Local name","input",True),("alternates","Other names","input",False),("explanation","What people say the name means or where it comes from","textarea",False)]),
 "oral-history": ("Oral History","oral-history",[("topic","Topic","input",True),("summary","Summary","textarea",True)]),
 "correction": ("Correction","correction",[("record","Which entry or page?","input",True),("problem","What is wrong? (transcription, meaning, pronunciation, attribution, citation)","textarea",True),("fix","What should it say?","textarea",False)]),
 "source-submission": ("Source Submission","source",[("citation","Author, year, title, publisher or journal, link","textarea",True),("supports","What does it support?","textarea",True),("read","Have you read it yourself?","dropdown:Yes,Partly,No",True)]),
 "research-question": ("Research Question","research",[("question","Your question","textarea",True),("why","Why does it matter?","textarea",False)]),
 "possible-rohingya-relationship": ("Possible Rohingya Relationship","comparative",[("rohingya","Rohingya form (R0)","input",True),("chittagonian","Possible Chittagonian counterpart (R1), only if you know one","input",False),("relationship","What do you think the relationship is? (cognate, shared inheritance, borrowing, regional sharing, parallel development, resemblance, unsure)","input",False)]),
 "orthographic-proposal": ("Orthographic Proposal","orthography",[("proposal","What should change?","textarea",True),("justification","Linguistic justification","textarea",True),("evidence","Speaker evidence and examples","textarea",True),("usability","Typing and reading impact","textarea",True),("alternatives","Alternatives considered","textarea",False),("consequences","Expected consequences","textarea",False)]),
 "technical-bug": ("Technical Bug","bug",[("what","What went wrong?","textarea",True),("steps","How to reproduce","textarea",False)]),
}
NO_TAIL = {"technical-bug","orthographic-proposal","source-submission","research-question","correction"}
def esc(s): return s.replace('"','\\"')
for slug,(title,label,fields) in FORMS.items():
    allf = fields + ([] if slug in NO_TAIL else COMMON_TAIL)
    lines = [f'name: "{title}"', f'description: "{title} submission. A contribution is not automatic acceptance; it goes to review."',
             f'labels: ["{label}", "raw"]', "body:",
             "  - type: markdown", "    attributes:", '      value: "You do not need linguistic training. Say what you know and how you know it. \'Not sure\' is useful."']
    for key,lab,kind,req in allf:
        if kind.startswith("dropdown:"):
            opts = kind.split(":",1)[1].split(",")
            lines += ["  - type: dropdown", f"    id: {key}", "    attributes:", f'      label: "{esc(lab)}"', "      options:"] + [f'        - "{o}"' for o in opts]
        else:
            lines += [f"  - type: {kind}", f"    id: {key}", "    attributes:", f'      label: "{esc(lab)}"']
        lines += ["    validations:", f"      required: {str(req).lower()}"]
    lines += ["  - type: checkboxes", "    id: cc0", "    attributes:", '      label: "Public domain dedication"', '      description: "Published contributions are dedicated to the public domain under CC0 1.0. This cannot be undone once published."', "      options:", '        - label: "I wrote or recorded this, or have the right to share it, and I dedicate it under CC0 1.0 if it is published."', "          required: true"]
    open(f".github/ISSUE_TEMPLATE/{slug}.yml","w",encoding="utf-8").write("\n".join(lines)+"\n")
print(len(FORMS),"templates")
