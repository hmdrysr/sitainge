# Administrative data for Chittagong and Cox's Bazar: notes

Files: `website/data/admin.json` (structure and counts) and `website/data/map-admin.json` (simplified geometry). Retrieved 2026-10-08. Only Latin-script English names are used.

## What was found

- Two districts. Chittagong: 15 upazilas, 199 unions listed, 14 municipalities named under upazilas, one city corporation (Chittagong City Corporation, 1990, 41 wards), Chittagong Metropolitan Police (16 thanas). Cox's Bazar: 9 upazilas (Eidgaon was created on 26 July 2021), 71 unions listed, no city corporation found in any source, municipalities include Cox's Bazar (12 wards).
- Population and area: from each upazila's Wikipedia article, which cites the Bangladesh Bureau of Statistics (BBS) 2022 census. The Cox's Bazar upazila populations sum exactly to the district total (2,823,268), which confirms them. For Chittagong the district total (9,169,464; body text gives 9,169,465) is not checked, because the city population is not in any source fetched.
- Post offices: 86 in the 22 upazilas, plus 27 under the City Corporation (aiFdn dataset). All 22 upazila head post codes agree with the post codes in the Wikipedia articles. This dataset predates several upazilas, so its "thana" groups were mapped to current upazilas by hand: Anawara = Anwara, Jaldi = Banshkhali, East Joara = Chandanaish, Rouzan = Raozan, Chiringga = Chakaria, Gorakghat = Maheshkhali; the Eidga office (4702) was moved to Eidgaon. Karnaphuli (4371 appears only as Budhpara, under Patiya) and Pekua have none in the dataset.
- Map: 2 districts, 22 upazilas, 11 metropolitan-thana shapes, 41 City Corporation wards (all numbers 1 to 41, from ADM4 "Ward No-n"), 14 pourashava shapes, 263 union shapes (258 matched by name to admin.json). Coordinates use the same projection and origin as the stage 2 `map.json` (the Chittagong and Cox's Bazar district bounding boxes agree to 0.1 unit); viewBox is cropped to the two districts. Total 237 KB.

## Licences

| Data | Licence |
|---|---|
| nuhil/bangladesh-geocode (names, fallback union lists) | MIT, copyright 2014 Nuhil Mehdy (LICENSE file checked). Its README says content was taken from bangladesh.gov.bd, wikipedia.org and maps.google.com, so its provenance is second-hand. |
| aiFdn/Postcodes-of-Bangladesh (post offices) | MIT, copyright 2017 Akhaura Info Foundation (LICENSE.md and README checked). Origin of the underlying postcodes is not stated; it is a 2017 dataset. |
| geoBoundaries gbOpen BGD ADM2/3/4 | CC BY 3.0 IGO. Source: Bangladesh Bureau of Statistics via OCHA ROAP, boundary year 2020. Credit is in the map file. |
| Wikipedia text (figures, names) | CC BY-SA 4.0. Facts only were taken. |
| The Daily Star article | Cited for two facts (41 wards, 1990); no text reused. |

## Gaps and cautions (read before relying on the data)

1. Wikipedia pages were read through a fetch tool that returns a model-written summary, not the raw page. The numbers were not re-checked against the BBS census tables or the District Reports; the BBS PDFs were not fetched. Treat every Wikipedia-derived figure as "per Wikipedia" and verify against BBS Population and Housing Census 2022 (District Reports for Chittagong and Cox's Bazar, and the national Vol. I) before publishing.
2. Union lists are as Wikipedia gives them, so spelling follows English Wikipedia. Differences with other sources:
   - Fatikchhari: Wikipedia names 12 of 18 unions; the other 6 (Bhujpur thana) were filled from the nuhil dataset and are flagged in the file.
   - Eidgaon: Wikipedia gives no union names; the five listed were inferred from nuhil (still under Cox's Bazar Sadar there) and from geoBoundaries (Idgaon, Islamabad, Islampur, Jalalabad sit in the Sadar polygon). Unconfirmed.
   - Sitakunda: "Bhatiari Cantonment Area" in Wikipedia's list was dropped as not a union.
   - Karnaphuli and Patiya share five names (Char Patharghata, Char Lakhya, Juldha, Shikalbaha, Bara Uthan). Patiya's union_count (22) is therefore probably overstated or Karnaphuli's is; resolve with the BBS/LGD list. On the map those unions sit under Patiya because the 2015 boundaries have no Karnaphuli polygon.
   - Rangunia lists Padua, which is also a Lohagara union.
   - Boalkhali: the map has a union "Purba Gomdandi" that Wikipedia's 9 omit (nuhil has 10).
   - Map-versus-list mismatches (also in `build/map-mismatches.json`): geoBoundaries has Abdullapur (Raozan), Dhurung and Rangamatia (Fatikchhari), Patali Machhuakhali (Cox's Bazar Sadar) with no counterpart in admin.json; admin.json has Azimpur and Urirchar (Sandwip), Saint Martin (Teknaf, an island), Ali Akbardeil (Kutubdia), Nangalmora (Hathazari) with no matched shape. Names were matched by fuzzy spelling within each upazila; the `matched` flag in map-admin.json marks them, and unmatched shapes keep the geoBoundaries spelling.
3. Conflicting areas left null with candidates listed: Patiya (156.34 or 316.47 km2), Kutubdia (215.79 or 93 km2). District area has two near-identical figures; infobox values used.
4. Police stations: Wikipedia names a current thana only for Fatikchhari, Bhujpur, Mirsharai, Jorarganj, Karnaphuli (and Eidgaon since 2019). Other entries are thanas that an article says were formed in an earlier year ("stated_historical"); they may still exist but that was not confirmed. Anwara, Boalkhali, Raozan, Ukhia, Maheshkhali, Pekua, Ramu, Teknaf have null. The district article says 33 thanas in total (16 metropolitan); the 17 outside the city were not listed by name. No official police-portal list could be fetched.
5. Metropolitan thanas: the 16 names come from the City Corporation article only (Akbarshah, Bakalia, Bandar, Bayazid, Chandgaon, Double Mooring, Halishahar, Khulshi, Kotwali, Pahartali, Panchlaish, Patenga, Chawkbazar, Sadarghat, EPZ, Karnaphuli). The Metropolitan Police article confirms only the count. The map has 11 thana shapes (2015); Akbarshah, Chawkbazar, Sadarghat, EPZ and Karnaphuli have no shape.
6. Wards: 41 wards confirmed by two prose sources and by geometry. Ward names, per-ward population and area are not available; the geometry only gives the number and the thana(s) it falls in. Wikipedia flags its ward section as outdated (January 2026), so any re-delimitation after 2020 is not checked. Municipality ward counts exist only where Wikipedia states them (9 for most, 12 for Cox's Bazar); Fatikchhari, Nazirhat, Sitakunda, Boalkhali, Dohazari are null. Municipality lists may be incomplete (for example, no source stated whether Hathazari, Lohagara or Anwara have one).
7. Cox's Bazar headquarters name is inferred from the DC office coordinates in nuhil (no prose source was fetched). The nuhil dataset uses the 2018 respelling and "Coxsbazar"; those spellings were not used.
8. The 2015-vintage boundaries predate Eidgaon (2021) and the proposed Fatikchhari North; Karnaphuli has no polygon.
9. Not found: any open dataset of post offices with ward-level detail inside the City Corporation (the 27 offices are one block), and any Local Government Division (LGD) or BBS machine-readable union list. Only the sources above were tried; chittagong.gov.bd could not be fetched (certificate error), and datahub.io, pub.dev, geoboundaries.org and the GADM host are blocked in this environment.

## Regenerate

```sh
S=/tmp/claude-0/-home-claude/6c25eaef-233e-5926-a16f-b9019efe483d/scratchpad
sh $S/stage3/build/fetch.sh $S/s3raw            # downloads geoBoundaries (via media.githubusercontent.com, Git LFS), postcodes, nuhil JSON
python3 -I $S/stage3/build/build_admin.py       # writes website/data/admin.json (hand-entered Wikipedia values are in this script)
python3 -I $S/stage3/build/build_map.py $S/s3raw  # writes map-admin.json, updates ward data in admin.json
```

`build_admin.py` reads `pc.json` from `../../s3raw` relative to the build folder. Wikipedia values were typed into `build_admin.py` and are not fetched by script; to refresh them, re-read the cited article for each upazila.
