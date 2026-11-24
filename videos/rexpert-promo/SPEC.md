# SPEC — R Expert « La maison qui se libère »

GOAL:    le spectateur sent qu'il peut ne plus dépendre du réseau et retient « R Expert = liberté énergétique, 1 500 €/an, 2 semaines ».
OUTPUT:  HyperFrames, 1080 x 1920, 30 fps
TIME:    33 s x 30 = 990 frames. Voix = horloge (ElevenLabs « George », eleven_multilingual_v2).
LOOK:    ciel en dégradé vertical #e3e8e6 → #f4f4f4 (acte 1, gris neutre) qui vire à #d2fbdf → #f4f4f4 à la libération (19 s).
         Monde 3D isométrique (caméra orthographique, azimut 45° ± 12°, élévation 35.26°), îlot de terrain 24 x 24 u,
         dessus herbe #9fd8a9, flancs vert profond #0b4a3f. Maisons blanc cassé #f2efe8, toits terre cuite #c46a4a,
         toit de la maison héroïne ardoise #4a545c. Route #3b4744, pointillés #f4f4f4.
         Encre #012b26 (vert R Expert) pour tout texte ; accent menthe #79ffbb réservé à l'énergie (flux, batterie, borne, « Libre »).
         Typo : Inter 900, titres 112 px, tracking -2 % ; sous-lignes Inter 700 46 px. Lumière : soleil chaud #fff1dc
         en haut à gauche, contre-jour froid #cfe9ff, ombres de contact peintes (pas de shadow maps).
OBJECTS: maison (corps, toit à deux pans, porte, 4 fenêtres qui s'allument #ffd27a), pylône en treillis 7 u, câbles
         en chaînette pylône → faîtage de chaque maison, panneaux PV 2 x 3 bleu nuit #1b3a6b cadre blanc,
         batterie murale blanche 0.6 x 1.2 avec jauge menthe, voiture citadine blanche vitres #24323a, borne vert
         profond avec face menthe et câble, unité de clim avec ventilateur qui tourne.
MOTION:  entrée = back.out(1.6) 0.5 s ; caméra = power2.inOut 1.2–1.6 s ; objets posés tombent de 3 u avec
         décalage 3 images ; texte : apparition par masque bas→haut 0.35 s power3.out, sortie 0.25 s power2.in ; rien ne bouge pendant la lecture.
SHOTS:   01 0.0–3.3  plan large du quartier, câbles tendus, poussée lente ; lit « Dépendant du réseau ? » (0.3–3.2)
         02 3.3–6.9  câbles pulsés gris vers les maisons ; lit « Votre facture, imposée. » (3.4–6.7)
         03 6.9–9.1  plongée caméra sur la maison héroïne ; lit « Reprenez la main. » (7.0–8.9)
         04 9.1–11.5 panneaux tombent sur le toit un à un ; lit « Panneaux photovoltaïques »
         05 11.5–14.0 batterie monte le long du mur, jauge se remplit ; lit « Batterie domestique »
         06 14.0–16.9 la voiture se gare, la borne surgit, câble branché ; lit « Borne de recharge »
         07 16.9–19.0 clim posée, ventilateur tourne ; lit « Air conditionné »
         08 19.0–21.2 recul, le câble du réseau se détache, la maison s'allume, flux menthe ; lit « Libre. »
         09 21.2–26.4 plan d'ensemble, preuves : 1 500 € (compteur) / an en moyenne, Installé en 2 semaines, 4,8 ★ · 370+ avis
         10 26.4–32.0 balayage menthe vers l'écran de fin : logo, « Votre énergie, votre liberté. », bouton « Calculez votre avantage en 1 minute », site
BANNED:  vide sombre, glow/bloom/particules, dégradés violets, cartes en verre, trois cartes en rangée, logo dans un coin,
         texte qui bouge pendant la lecture, chiffres inventés (seulement ceux du site), moquerie des voisins.
QA:      1.5 s quartier lisible + titre ; 8 s maison héroïne au centre ; 10.8 s panneaux posés ; 15.5 s voiture + borne ;
         20.3 s maison allumée, câble détaché ; 23 s compteur 1 500 € ; 30 s écran de fin complet. Tout texte dans 120–888 x 288–1248.
