# Prompts Claude Design — refonte the-replicant.com

Ordre d'utilisation : **P0** à l'ouverture du projet (brief maître), puis **P1** (tokens, à valider),
puis les écrans **P2 → P9**. **P10** est réservé à la phase « app mobile ».

Les prompts sont en français, prêts à coller. Les valeurs de couleur proviennent désormais du **logo final
mesuré au pixel** (18/09/2026) et de `docs/design/tokens.json` **v0.3.0** — **ne pas laisser Claude Design en
inventer d'autres**.

---

## ⚠ AMENDEMENT DU 18/09/2026 — le logo final, la palette v0.3 et l'ambiance festive

**Ce bloc fait foi.** S'il contredit une valeur citée plus bas dans un prompt, **c'est ce bloc qui a raison** :
les prompts P0 → P10 ont été écrits avant l'arrivée du logo final, et seules les couleurs de
`docs/design/tokens.json` (v0.3.0) doivent être utilisées.

**1. Le logo est FINAL** : `logo_Fond_transparent.png` (1024 × 1024, **PNG à fond transparent**), une
**composition unique** — wordmark italique gras biseauté, explosion de rayons orange/jaune et bleu/cyan, deux
arcs, deux étoiles à quatre branches, des étincelles.

- En **en-tête** : **le carré complet**, rien d'autre. `logo-carre-56.webp` (**4 224 o**) en mobile,
  `logo-carre-112.webp` (**12 488 o**) en desktop. **Jamais** de recadrage en bandeau large (il coupe les arcs
  et une étoile), **jamais** les SVG livrés (1,8 à 5 Mo) sur le site — impression uniquement.
- **À 44-56 px, le wordmark du logo n'est pas lisible** : l'en-tête **affiche le nom en texte** à côté de
  l'emblème (« The Replicant » + « Cadeaux originaux »). Ne pas demander une version « plate sans rayons » :
  elle n'existe pas et n'est plus la règle.
- **Une icône seule reste à dessiner** (favicon, app) — piste : l'étoile jaune à quatre branches.

**2. Les couleurs de référence** (mesurées au pixel sur le logo final) : jaune **`#fee300`** (action),
oranges **`#fe8200` / `#ffa500`** (promo — le bandeau promo n'est **plus** doré `#c6b26d`, il est **orange**),
cyan **`#00f1fc`** (décor), rouge **`#fe0305`** (contour du logo seulement), encre **`#2b2419`**. Sur le jaune
et sur l'orange, **le texte est toujours l'encre** (jamais du blanc). Le terracotta `#d06e6a` et l'or `#c6b26d`
sont **hors système**.

**3. L'ambiance demandée par Jérôme (18/09/2026)** : **moderne, animée, un air de festivité**. La festivité
vient du **logo** et du **bandeau promo**, pas de la page entière :
- autorisé : rotation très lente des rayons derrière le logo (90-120 s), 3 à 5 étincelles scintillantes dans
  le bandeau promo, apparition douce des cartes produit (4 px), rebond du compteur de panier (150 ms) ;
- interdit : **toute animation dans le tunnel de commande**, animation sur l'élément principal, décalage de
  mise en page, parallaxe, son, vidéo automatique, plus d'un élément animé par bande ;
- `prefers-reduced-motion` ⇒ **tout s'arrête**. Animations en **CSS/SVG**, aucune bibliothèque requise.

**4. Planche de référence** : `docs/design/maquettes/entete-festif-v1.html` — les trois en-têtes, le bandeau
festif, les cartes produit et les règles d'animation. À montrer à Claude Design comme cible de tenue.



## P0 — Brief maître (à coller en ouverture du projet)

```
Tu conçois la refonte du site e-commerce the-replicant.com (PrestaShop 8.2, FR).
Boutique de cadeaux originaux et insolites, univers festif et décalé, marque familiale et humaine.
Client : particuliers. Cible secondaire : professionnels (revendeurs).

CONTRAINTES NON NÉGOCIABLES
- Mobile first : je veux d'abord la maquette 390×844, puis 1280 et 1440.
- Le poids est un critère de design : pas de vidéo en hero, pas d'image plein écran lourde,
  pas d'illustration décorative gratuite, pas d'ombre portée superflue, pas de blur/glassmorphism,
  pas de dégradés « SaaS ». Les visuels produits sont des photos sur fond clair.
- Accessibilité WCAG 2.2 AA : contraste, focus visibles, cibles tactiles ≥ 44 px, pas d'info par la couleur seule.
- **Palette issue du NOUVEAU LOGO** (analyse pixel, ne pas inventer d'autres couleurs) :
  jaune #fee300 = fond du CTA et des éléments actifs — TOUJOURS avec du texte encre #2b2419 (10,96:1) ;
  orange #fe8200 = bandeau promo et badges, texte encre (7,71:1) ; cyan #00f1fc = DÉCOR uniquement
  (1,40:1 sur blanc : jamais du texte) ; bleu #007ef6 = information (texte #0071dd) ; rouge #ff0000 =
  contour du logo seulement (4,0:1) — les erreurs utilisent #c1121f ; encre #2b2419 / #4a4133 / #6b6152,
  surfaces #ffffff / #faf8f5 / #f4f1ea, bordure #e6e0d6. Le terracotta #d06e6a et l'or #c6b26d de
  l'ancienne charte sont abandonnés.
- **Harmonie avec le logo** : l'énergie du logo (rayons, biseau, contours épais) reste dans le logo et le
  bandeau promo. L'interface reste PLATE, calme, rapide : aucun biseau, aucun dégradé métallique, aucune
  ombre décorative, pas de starburst en fond de section.
- Typographie : Montserrat 700/600 pour les titres (police déjà installée, en écho au lettrage sans-serif
  gras italique du logo) et Source Sans 3 400/600 pour le corps ; deux graisses maximum ; auto-hébergées.
- Style : chaleureux, artisanal, lisible. Interdits explicites (AI-slop) : dégradé bleu/violet,
  grille de 3 cartes icône+titre+phrase, icône dans un carré arrondi au-dessus de chaque titre,
  tout centré, chiffres géants décoratifs, emoji, Inter par défaut, « Insights/Growth/Scale ».

MÉTHODE
- Annonce d'abord l'archétype de surface de chaque écran (Découvrir / Explorer / Comparer / Configurer / Piloter).
- Pour la page d'accueil : 3 variantes = 1 prudente, 1 fidèle au brief, 1 divergente. Pas des variantes de couleur.
- Chaque écran doit annoter ses ZONES PARAMÉTRABLES, avec le nom exact du champ back-office
  (ex. « zone paramétrable : slides.ordre / slides.date_debut / slides.cta_url »).
- Livre du HTML autonome (CSS et JS inclus), responsive, avec un petit panneau « Tweaks »
  (densité, arrondi, intensité des animations) — le design doit être final quand le panneau est fermé.

AVANT DE COMMENCER : pose-moi les 3 questions dont tu as réellement besoin, puis démarre.
```

---

## P1 — Design tokens & DESIGN.md (à valider avant tout écran)

```
À partir du brief maître, produis le fichier de tokens du site : couleurs (rôles sémantiques),
typographie (échelle fluide avec clamp(), 2 graisses), espacement (base 4 px), rayons, bordures,
élévations, durées et courbes d'animation, points de rupture (390 / 768 / 1024 / 1440), et états
(hover, focus, actif, désactivé, erreur, succès, rupture de stock).
Contraintes : chaque couple texte/fond utilisé doit afficher son ratio de contraste (cible 4,5:1 pour
le texte, 3:1 pour l'UI). Une seule police décorative au maximum.
Sors le tout en variables CSS + un tableau de tokens lisible, exporté aussi en DESIGN.md.
```

---

## P2 — Page d'accueil

```
Conçois la page d'accueil (mobile 390 puis desktop 1440) à partir des tokens validés.
Structure imposée, dans cet ordre :
1. Grand slider en haut (3 à 5 slides, plein largeur) — zone paramétrable : titre, sous-titre, visuel,
   bouton, lien, ordre, dates de diffusion, activation par slide. Mobile : 1 visuel, texte court,
   CTA visible sans scroll.
2. Bandeau promo sous le header et/ou au-dessus du slider (orange `#fe8200` du logo, texte encre, lien, fermable)
   — zone paramétrable : texte, couleur, lien, dates, fermable.
3. Catégories mises en avant (grille de vignettes) — zone paramétrable : catégories choisies, ordre,
   image, nombre de colonnes mobile/desktop, activation.
4. Sections produits : « Nouveautés », « Sélection du moment », 2ᵉ sélection — zone paramétrable :
   source (nouveautés / meilleures ventes / promo / catégorie), nombre de produits, ordre, titre, activation.
5. Réassurance (livraison, paiement, SAV) et un bloc éditorial court qui renvoie au blog.
Contraintes : le hero ne dépasse pas 45 % de la hauteur du viewport mobile ; le carrousel produits se
fait au doigt (scroll-snap) et reste utilisable sans JavaScript.
Livrables : 3 variantes de composition + la version retenue en 390 / 768 / 1440, avec le panneau Tweaks.
```

---

## P3 — Header, navigation, recherche, panier

```
Conçois la navigation — c'est une exigence forte du client : elle doit être facile sur mobile COMME sur
desktop, et permettre d'atteindre n'importe quel produit en 3 chemins maximum, avec la recherche toujours
à un geste.

DESKTOP
- en-tête 72 px : logo à gauche, univers au centre, recherche + compte + panier à droite ; version compacte
  au défilement.
- méga-menu : une colonne par univers, 2 niveaux visibles SANS clic, image de mise en avant optionnelle,
  ouvrable au survol ET au clavier.
- recherche permanente avec suggestions (catégories + produits), raccourci clavier « / ».
- fil d'Ariane sur toutes les pages catalogue et produit.

MOBILE
- en-tête 56 px collant : logo **carré complet** (`logo-carre-56.webp`) **suivi du nom en texte**,
  recherche en icône ouvrant un champ plein
  écran, panier avec compteur.
- barre de navigation basse à 5 entrées (Accueil · Catégories · Recherche · Panier · Compte), 48 px de
  haut, entrées LIBELLÉES et iconographiées (jamais d'icône seule), onglet actif marqué.
- menu plein écran : univers dépliés au premier niveau, aucun sous-menu caché, fermeture au balayage,
  retour système respecté.
- filtres de catégorie : panneau dédié avec compteur de résultats et bouton « Voir les N produits »
  toujours visible.

Le header doit rester ultra-léger : distingue ce qui est chargé au premier rendu de ce qui ne l'est qu'à
l'ouverture du menu. États à livrer : vide, focus clavier, mobile avec clavier ouvert, scrollé,
0 produit / 1 produit / rupture de stock.
Zones paramétrables (back-office) : logo, bandeau annonce, univers et ordre des entrées, entrées de la
barre mobile, univers mis en avant — les mêmes données que les catégories mises en avant de l'accueil.
```

---

## P4 — Catégorie / listing (filtres inclus)

```
Conçois une page catégorie (ex. Halloween, 70 produits) mobile puis desktop : titre, description courte
repliable, filtres (prix, disponibilité, marque, univers), tri, grille de produits, pagination ou
« charger plus », état vide, état de chargement (squelettes).
Les cartes produit montrent : photo, titre sur 2 lignes maximum, prix TTC, badge promo, badge
« Généré par l'IA » s'il est présent, et la disponibilité.
Mobile : filtres en panneau plein écran, sans perdre la position de scroll.
Zones paramétrables : colonnes mobile/desktop, produits par page, affichage de la description, filtres proposés.
```

---

## P5 — Fiche produit

```
Conçois la fiche produit (mobile puis desktop) : galerie (image principale + miniatures, zoom, plein
écran au clic, changement d'image fluide, badge IA incrusté dans la galerie ET sur les vignettes),
titre, prix TTC, disponibilité claire, sélecteurs de variantes, quantité, bouton « Ajouter au panier »
collant en bas sur mobile, réassurance, description, caractéristiques, avis, produits complémentaires.
Réserve un emplacement explicitement paramétrable pour la mention AI Act « Généré par l'IA ».
```

---

## P6 — Tunnel de commande (le cœur du brief : court et simple)

```
Conçois le tunnel de commande en 4 étapes visibles, faisables sans créer de compte (option invité) :
1) Panier (édition des quantités, code promo, frais de port estimés, upsell discret)
2) Identification (connexion rapide / e-mail + livraison, choix « particulier / professionnel »)
3) Livraison (transporteurs, point relais, adresses, facturation)
4) Paiement sur UNE seule page (récapitulatif repliable, moyens de paiement, bouton unique)
puis Confirmation claire (numéro, suivi, e-mails annoncés).
Contraintes : aucune étape ne dépasse un écran mobile ; chaque étape est atteignable en 1 clic depuis la
précédente ; erreurs de champ au bon endroit ; jamais de perte de panier au retour arrière.

OBJECTIF MESURABLE : un client qui sait ce qu'il veut achète en MOINS DE 60 SECONDES, sans créer de compte.
- ajout au panier possible depuis la carte produit, sans ouvrir la fiche produit ;
- panier latéral : modification de quantité et lancement de la commande sans changer de page ;
- commande invité par défaut, création de compte proposée APRÈS la commande ;
- frais de port affichés dès le panier (jamais de surprise au dernier écran) ;
- transporteurs et moyens de paiement au même niveau, adresse en autocomplétion ;
- aucun compte à rebours, aucun popup, aucune inscription forcée à la newsletter ;
- progression visible en permanence (étape 2/4), retour arrière toujours possible.
Livrable : maquettes des 4 étapes + confirmation + états d'erreur, mobile d'abord, plus un prototype
cliquable du parcours complet.
```

---

## P7 — Compte particulier

```
Conçois : connexion / création de compte (ultra court : e-mail + mot de passe, ou lien de connexion
magique si tu le recommandes), mot de passe oublié, tableau de bord client, liste des commandes,
détail de commande avec suivi de livraison, adresses, retours/SAV, préférences et consentements.
Mobile first, focus clavier visible, aucune donnée affichée inutilement.
```

---

## P8 — Espace professionnel (demande soumise à validation)

```
Il n'existe AUCUN espace pro aujourd'hui : tout est à créer.
Livre :
1) une page de présentation « Professionnels / revendeurs » (argumentaire + CTA)
2) un formulaire de demande en 3 étapes courtes — société (raison sociale, SIRET, TVA intra, site),
   responsable (nom, fonction, e-mail pro, téléphone), activité (type, volume annuel, canaux) — avec
   dépôt d'un extrait Kbis / avis de situation, mentions RGPD et récapitulatif avant envoi
3) un écran « demande envoyée / en cours de validation » avec délai annoncé et contact
4) les gabarits d'e-mail : confirmation client + notification équipe + décision (validé / refusé)
5) un écran back-office « Demandes pro » : liste, filtres (en attente / validée / refusée), fiche
   détaillée, boutons Valider / Refuser avec motif obligatoire, journal des actions.
Le vocabulaire et l'ordre des champs doivent correspondre exactement aux champs du module back-office.
Annote chaque champ avec son nom technique (ex. pro.siret, pro.tva_intra, pro.statut).
```

---

## P9 — Contenus : blog, pages, 404

```
Conçois : liste des articles du blog (magazine, catégories, article mis en avant, pagination),
page article (confort de lecture, sommaire, produits liés, partage, articles similaires),
pages CMS (livraison, retours, CGV, contact avec carte), recherche avec résultats vides, page 404 utile.
Le blog est fourni par un module externe : prévois une feuille de style de compatibilité qui habille ses
gabarits sans les surcharger, et indique explicitement les zones que le thème ne contrôle pas.
```

---

## P10 — App mobile (phase 2 uniquement)

```
Réutilise exactement les tokens validés et conçois les écrans de l'app mobile the-replicant :
onboarding (1 écran, pas 3), accueil (mêmes blocs que la home web : promo, catégories, sélections),
recherche, catégorie, fiche produit (galerie plein écran, badge IA, ajout panier), panier,
tunnel de paiement (réutilise les 4 étapes de l'app web), compte, suivi de commande.
Contraintes : natif (pas un site encapsulé), cibles tactiles, safe areas, mode hors-ligne dégradé,
chargement par squelettes. Livre les écrans en 390×844 avec les états vide / chargement / erreur.
```

---

## Rappels d'usage

- Les maquettes produites sont du **HTML autonome** : les conserver dans `docs/design/` du dépôt,
  versionnées, pour servir de référence aux tests de recette.
- Toute annotation « zone paramétrable » devient un champ du module `replicanttheme` : le design
  **est** la spécification du back-office, pas une illustration.
