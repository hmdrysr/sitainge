# eSpeak NG (third-party, not CC0)

`espeak-ng.js` and `espeak-ng.wasm` are eSpeak NG compiled to WebAssembly by Ian Armour (npm package `espeak-ng` 1.0.2, https://github.com/ianmarmour/espeak-ng.js), from the eSpeak NG project (https://github.com/espeak-ng/espeak-ng).
Licence: GNU General Public License, version 3 or later. See `LICENSE` in this folder. The rest of this repository is CC0 1.0; this folder is the one exception, like `js/fsrs.umd.js` (MIT).

Dadi loads this engine only when the person turns on the clear offline voice. It is an optional extra: delete this folder and Dadi falls back to the device voice and its own sound, with nothing else changing.
To rebuild or replace: `npm pack espeak-ng`, copy `dist/espeak-ng.js` and `dist/espeak-ng.wasm` here.
