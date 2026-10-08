#!/bin/sh
# usage: fetch.sh RAW_DIR  -- downloads the machine-readable inputs (no auth needed)
set -e; R=${1:?raw dir}; mkdir -p "$R"; cd "$R"
M=https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/main/releaseData/gbOpen/BGD
for l in ADM2 ADM3 ADM4; do curl -fsS -o s$l.geojson $M/$l/geoBoundaries-BGD-${l}_simplified.geojson; curl -fsS -o m$l.json $M/$l/geoBoundaries-BGD-$l-metaData.json; done
curl -fsS -o pc.json https://raw.githubusercontent.com/aiFdn/Postcodes-of-Bangladesh/master/json/postcodes.json
for p in divisions districts upazilas unions; do curl -fsS -o n_$p.json https://raw.githubusercontent.com/nuhil/bangladesh-geocode/master/$p/$p.json; done
