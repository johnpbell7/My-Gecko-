# My Gecko

A 3D virtual pet leopard gecko that runs entirely in one HTML file. Feed him,
play games with him, keep his tank clean, dress him up and watch him grow.

**Play:** https://johnpbell7.github.io/My-Gecko-/

## Files

| File | What it is |
|---|---|
| `index.html` | The whole game — Three.js, the gecko, the tank and all the UI |
| `icon.svg` | Master logo, used for the favicon and the splash screen badge |
| `icon-maskable.svg` | Same logo padded into the Android adaptive-icon safe zone |
| `icon-*.png`, `apple-touch-icon.png`, `favicon-*.png` | Rasterised icons |
| `manifest.webmanifest` | Lets the game install to a phone home screen |
| `docs/growth-stages.png` | How big he gets, day 1 to day 21 |

## Add it to a phone home screen

Open the link, then **Share → Add to Home Screen** (iOS) or **⋮ → Install app**
(Android). It launches full screen with its own icon.

## How he grows

He hatches at half size and reaches full size on day 21 — about 2.4× his
hatchling length. See `docs/growth-stages.png`.

## Saved data

Progress lives in the browser's `localStorage` under `gecko-pet-v3`, and photos
under `gecko-photos-v3`. Nothing leaves the device. Bumping those key names in
`index.html` starts everyone fresh with a new egg.
