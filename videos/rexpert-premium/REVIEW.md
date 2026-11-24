# REVIEW — R Expert, version premium

Rendu : `renders/rexpert-pub-premium-9x16.mp4` — 1080x1920, 30 fps, 33,1 s.

## Ce qui change par rapport à `rexpert-promo`
- Direction « maquette d'architecte » : voisins en clay blanc mat, seule la maison R Expert a de vrais matériaux
  (enduit, bardage bois, menuiseries anthracite, verre sombre qui s'allume de l'intérieur).
- Rendu PBR : tonemapping ACES, éclairage d'environnement studio (RoomEnvironment), soleil avec ombres douces PCF 2048.
- Architecture contemporaine : toits plats, porte-à-faux, panneaux sur racks alu inclinés, voiture laquée, borne et batterie anthracite.
- Caméra perspective 18° (objectif long), mêmes mouvements et même timing que la v5.
- Histoire, textes, voix George (ElevenLabs), bruitages et écran de fin inchangés.

## Mesuré / regardé
- `check` : 0 erreur. Instantanés regardés aux temps clés ; voisin avant-droit retiré (il masquait voiture/borne/clim).
- Son mesuré, pas écouté : -15,4 LUFS, true peak -1,2 dBTP.
- Rendu nettement plus long que la v1 (ombres en GPU logiciel).
