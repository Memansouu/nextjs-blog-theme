# REVIEW — R Expert « La maison qui se libère » (v1)

Rendu : `renders/rexpert-pub-9x16.mp4` — 1080x1920, 30 fps, 33 s (v2).

## v2
- Voix : ElevenLabs « George » (eleven_multilingual_v2, clé de la cliente) à la place de Kokoro ; clips recalés, écran de fin allongé d'1 s.
- « plus de 500 avis » (demande de la cliente ; le site affiche encore 370+).
- CTA : « Contactez-nous pour un devis sur mesure » (bouton + dernière phrase).
- Audio final normalisé : -14,5 LUFS, true peak -1,4 dBTP.

## Choix créatifs
- Storyline A retenue par la cliente. Non construites : B « Une journée de soleil », C « Débranchez-vous » (voir STORYLINES.md).
- Monde 3D Three.js en caméra orthographique isométrique, un seul plan continu : quartier → plongée → équipements → recul.
- Titres sur aplats vert R Expert (#012b26) pour rester lisibles sur le ciel comme sur le décor ; menthe #79ffbb réservé à l'énergie.
- Chiffres uniquement issus du site : 1 500 €/an en moyenne, 2 semaines, 4,8 / 370+ avis.
- Voix v1 : Kokoro ff_siwis, jugée trop robotique → remplacée en v2. Pas de musique : la bibliothèque demande un plan payant.
  Bruitages : SFX fournis avec HyperFrames (crédits dans assets/sfx/CREDITS.md).

## Mesuré / regardé
- `check` : aucune erreur. Avertissements gardés : `timeline_track_too_dense` / `composition_file_too_large` (monde 3D en un seul fichier, volontaire).
- Revue : planches --review, coutures et planche téléphone 360 px regardées ; image 0 corrigée (le titre d'accroche est visible dès la miniature).
- Son mesuré, pas écouté : -15,4 LUFS intégré, true peak -1 dBTP, aucun écrêtage.
- Capture automatique du site impossible (Chrome bloqué par le proxy) : logo et couleurs récupérés à la main depuis le HTML.

## Plan le plus faible
- 21–26 s (preuves) : le décor reste presque immobile ; avec plus de temps, faire « respirer » l'énergie (compteur sur la batterie) ou un léger travelling.
- Les câbles voisins passent devant la maison héroïne dans certains angles.
