# Paloma: 30-second recipe film

1080×1080, 60 fps, 100 BPM (1 bar = 2.4 s, one ingredient per bar).

| # | Step | Measure |
|---|---|---|
| 1 | Ice | 4 large cubes |
| 2 | Tequila blanco | 50 ml (1¾ oz) |
| 3 | Fresh lime juice | 15 ml (½ oz) |
| 4 | Agave syrup | 10 ml (⅓ oz) |
| 5 | Grapefruit juice | 60 ml (2 oz) |
| 6 | Soda water | 60 ml (2 oz) |
| 7 | Stir | 4 turns |
| 8 | Garnish | 1 grapefruit wedge |

- `index.html`: the composition. Every pixel is a pure function of `window.seek(t)`.
- `audio.js`: soundtrack synthesised with `OfflineAudioContext`.
- `render.mjs`: `audio` | `beats` | `stills <t…>` | `video [workers]`. Renders 3 subframes
  per frame at 180 fps, blends them with ffmpeg `tmix`, then muxes the WAV.

Rebuild: `node render.mjs audio && node render.mjs video 4` (audio is loudness-normalised to −16 LUFS).
