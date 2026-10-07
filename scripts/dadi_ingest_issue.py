#!/usr/bin/env python3
"""Turns one Dadi contribution issue into RAW records (structural only; never accepts anything).
Used by the 'Dadi tools' workflow. Run: python3 scripts/dadi_ingest_issue.py issue.json [--root .] [--dry-run]
issue.json is the output of: gh issue view N --json number,title,body,author
Speaker ids are assigned automatically and pseudonymously: the GitHub login is hashed (SHA-256) and the hash is
mapped to the next free CTG-SPK-nnnnn in lexicon/speakers.json. The login itself is never written to the repository."""
import argparse, hashlib, json, os, re, subprocess, sys

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("issue"); ap.add_argument("--root", default="."); ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    d = json.load(open(a.issue, encoding="utf-8"))
    title, body = d.get("title") or "", d.get("body") or ""
    login = ((d.get("author") or {}).get("login") or "").strip().lower()
    if not title.startswith("[Dadi]"): sys.exit("Not a Dadi contribution issue (title must start with [Dadi]).")
    if not login: sys.exit("The issue has no author.")
    m = re.search(r"=== SITAINGE SUBMISSION START ===.*?=== SITAINGE SUBMISSION END ===", body, re.S)
    if not m: sys.exit("No complete submission block in this issue (missing START or END line).")
    done_path = os.path.join(a.root, "lexicon", "ingested-issues.txt")
    done = set(open(done_path).read().split()) if os.path.exists(done_path) else set()
    num = str(d.get("number"))
    if num in done: sys.exit(f"Issue #{num} was already ingested.")
    map_path = os.path.join(a.root, "lexicon", "speakers.json")
    spk = json.load(open(map_path, encoding="utf-8")) if os.path.exists(map_path) else {}
    key = hashlib.sha256(("sitainge-speaker:" + login).encode()).hexdigest()[:20]
    if key not in spk:
        nxt = max([int(v[-5:]) for v in spk.values()] + [0]) + 1
        spk[key] = f"CTG-SPK-{nxt:05d}"
    sid = spk[key]
    tmp = os.path.join(a.root, "dadi-submission.tmp.txt")
    open(tmp, "w", encoding="utf-8").write(m.group(0) + "\n")
    try:
        cmd = [sys.executable, os.path.join(a.root, "scripts", "ingest_interview.py"), tmp, "--speaker-id", sid, "--root", a.root]
        if a.dry_run: cmd.append("--dry-run")
        r = subprocess.run(cmd)
    finally:
        if os.path.exists(tmp): os.remove(tmp)
    if r.returncode: sys.exit(r.returncode)
    if not a.dry_run:
        os.makedirs(os.path.dirname(map_path), exist_ok=True)
        json.dump(spk, open(map_path, "w", encoding="utf-8"), indent=1, sort_keys=True)
        open(done_path, "a").write(num + "\n")
    print(f"Issue #{num} ingested as {sid}" + (" (dry run)" if a.dry_run else ""))

if __name__ == "__main__": main()
