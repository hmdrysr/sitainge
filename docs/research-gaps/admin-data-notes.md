# Administrative data for Chittagong and Cox's Bazar: notes

Files: `website/data/admin.json` (structure and counts) and `website/data/map-admin.json` (simplified geometry). Retrieved October 8, 2026. Only Latin-script English names are used.

## What was found

- Two districts. Chittagong has 15 upazilas, 199 unions listed, 14 municipalities named under upazilas, one city corporation (Chittagong City Corporation, 1990, 41 wards) and the Chittagong Metropolitan Police (16 thanas). Cox's Bazar has 9 upazilas (Eidgaon was created on July 26, 2021) and 71 unions listed. No source names a city corporation there, and its municipalities include Cox's Bazar (12 wards).
- Population and area come from each upazila's Wikipedia article, which cites the Bangladesh Bureau of Statistics (BBS) 2022 census. The Cox's Bazar upazila populations sum exactly to the district total (2,823,268), which confirms them. For Chittagong, the district total (9,169,464; the body text gives 9,169,465) is not checked, because none of the fetched sources gives the city population.
- Post offices: 86 in the 22 upazilas, plus 27 under the City Corporation (aiFdn dataset). All 22 upazila head post codes agree with the post codes in the Wikipedia articles. The dataset predates several upazilas, so its "thana" groups were mapped to current upazilas by hand: Anawara = Anwara, Jaldi = Banshkhali, East Joara = Chandanaish, Rouzan = Raozan, Chiringga = Chakaria, Gorakghat = Maheshkhali. The Eidga office (4702) was moved to Eidgaon. Karnaphuli (4371 appears only as Budhpara, under Patiya) and Pekua have no post offices in the dataset.
- Map: 2 districts, 22 upazilas, 11 metropolitan-thana shapes, 41 City Corporation wards (all numbers 1 to 41, from ADM4 "Ward No-n"), 14 pourashava shapes and 263 union shapes (258 matched by name to admin.json). Coordinates use the same projection and origin as the stage 2 `map.json` (the Chittagong and Cox's Bazar district bounding boxes agree to 0.1 unit). The viewBox is cropped to the two districts. The total size is 237 KB.

## Licences

| Data | Licence |
|---|---|
| nuhil/bangladesh-geocode (names, fallback union lists) | MIT, copyright 2014 Nuhil Mehdy (LICENSE file checked). Its README says the content was taken from bangladesh.gov.bd, wikipedia.org and maps.google.com, so its provenance is second-hand. |
| aiFdn/Postcodes-of-Bangladesh (post offices) | MIT, copyright 2017 Akhaura Info Foundation (LICENSE.md and README checked). The origin of the underlying postcodes is not stated; it is a 2017 dataset. |
| geoBoundaries gbOpen BGD ADM2/3/4 | CC BY 3.0 IGO. Source: Bangladesh Bureau of Statistics via OCHA ROAP, boundary year 2020. Credit is in the map file. |
| Wikipedia text (figures, names) | CC BY-SA 4.0. Facts only were taken. |
| The Daily Star article | Cited for two facts (41 wards, 1990); no text reused. |

## Gaps and cautions (read before relying on the data)

1. The Wikipedia pages were read through a fetch tool that returns a model-written summary, not the raw page. The numbers were not re-checked against the BBS census tables or the District Reports, and the BBS PDFs were not fetched. Every Wikipedia-derived figure should be treated as "per Wikipedia" and verified against the BBS Population and Housing Census 2022 (District Reports for Chittagong and Cox's Bazar, and the national Vol. I) before publication.
2. Union lists are as Wikipedia gives them, so spelling follows English Wikipedia. Differences with other sources:
   - Fatikchhari: Wikipedia names 12 of 18 unions. The other 6 (Bhujpur thana) were filled from the nuhil dataset and are flagged in the file.
   - Eidgaon: Wikipedia gives no union names. The five listed were inferred from nuhil (where they are still under Cox's Bazar Sadar) and from geoBoundaries (Idgaon, Islamabad, Islampur, Jalalabad sit in the Sadar polygon). They are unconfirmed.
   - Sitakunda: "Bhatiari Cantonment Area" in Wikipedia's list was dropped because it is not a union.
   - Karnaphuli and Patiya share five names (Char Patharghata, Char Lakhya, Juldha, Shikalbaha, Bara Uthan). Either Patiya's union_count (22) or Karnaphuli's is therefore probably overstated; the BBS/LGD list should settle it. On the map, those unions sit under Patiya because the 2015 boundaries have no Karnaphuli polygon.
   - Rangunia lists Padua, which is also a Lohagara union.
   - Boalkhali: the map has a union "Purba Gomdandi" that Wikipedia's 9 omit (nuhil has 10).
   - Map-versus-list mismatches (also in `build/map-mismatches.json`): geoBoundaries has Abdullapur (Raozan), Dhurung and Rangamatia (Fatikchhari), and Patali Machhuakhali (Cox's Bazar Sadar), with no counterpart in admin.json. admin.json has Azimpur and Urirchar (Sandwip), Saint Martin (Teknaf, an island), Ali Akbardeil (Kutubdia) and Nangalmora (Hathazari), with no matched shape. Names were matched by fuzzy spelling within each upazila. The `matched` flag in map-admin.json marks them, and unmatched shapes keep the geoBoundaries spelling.
3. Conflicting areas are left null, with the candidates listed: Patiya (156.34 or 316.47 km2) and Kutubdia (215.79 or 93 km2). The district area has two near-identical figures, and the infobox values were used.
4. Police stations: Wikipedia names a current thana only for Fatikchhari, Bhujpur, Mirsharai, Jorarganj and Karnaphuli (and Eidgaon since 2019). Other entries are thanas that an article says were formed in an earlier year ("stated_historical"). They may still exist, but that was not confirmed. Anwara, Boalkhali, Raozan, Ukhia, Maheshkhali, Pekua, Ramu and Teknaf have null. The district article gives 33 thanas in total (16 metropolitan), and the 17 outside the city were not listed by name. No official police-portal list could be fetched.
5. Metropolitan thanas: the 16 names come from the City Corporation article only (Akbarshah, Bakalia, Bandar, Bayazid, Chandgaon, Double Mooring, Halishahar, Khulshi, Kotwali, Pahartali, Panchlaish, Patenga, Chawkbazar, Sadarghat, EPZ, Karnaphuli). The Metropolitan Police article confirms only the count. The map has 11 thana shapes (2015); Akbarshah, Chawkbazar, Sadarghat, EPZ and Karnaphuli have no shape.
6. Wards: two prose sources and the geometry confirm 41 wards. Ward names, per-ward population and area are not available; the geometry gives only the number and the thana or thanas in which it falls. Wikipedia flags its ward section as outdated (January 2026), so any re-delimitation after 2020 is not checked. Municipality ward counts exist only where Wikipedia states them (9 for most, 12 for Cox's Bazar). Fatikchhari, Nazirhat, Sitakunda, Boalkhali and Dohazari are null. The municipality lists may be incomplete (for example, no source stated whether Hathazari, Lohagara or Anwara has one).
7. The name of the Cox's Bazar headquarters is inferred from the DC office coordinates in nuhil, because no prose source was fetched. The nuhil dataset uses the 2018 respelling and "Coxsbazar"; those spellings were not used.
8. The 2015-vintage boundaries predate Eidgaon (2021) and the proposed Fatikchhari North, and Karnaphuli has no polygon.
9. Not found: any open dataset of post offices with ward-level detail inside the City Corporation (the 27 offices form one block), and any Local Government Division (LGD) or BBS machine-readable union list. Only the sources above were tried. chittagong.gov.bd could not be fetched (certificate error), and datahub.io, pub.dev, geoboundaries.org and the GADM host are blocked in this environment.

## Regenerating the data

```sh
S=/tmp/claude-0/-home-claude/6c25eaef-233e-5926-a16f-b9019efe483d/scratchpad
sh $S/stage3/build/fetch.sh $S/s3raw            # downloads geoBoundaries (via media.githubusercontent.com, Git LFS), postcodes, nuhil JSON
python3 -I $S/stage3/build/build_admin.py       # writes website/data/admin.json (hand-entered Wikipedia values are in this script)
python3 -I $S/stage3/build/build_map.py $S/s3raw  # writes map-admin.json, updates ward data in admin.json
```

`build_admin.py` reads `pc.json` from `../../s3raw`, relative to the build folder. The Wikipedia values were typed into `build_admin.py` and the script does not fetch them. To refresh them, re-read the cited article for each upazila.
