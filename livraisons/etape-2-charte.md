Charte du système de design de **the-replicant.com** — jetons `docs/design/tokens.json` v0.3.0, couleurs mesurées au pixel sur le logo final. Ce document est **prescriptif** : il énonce des règles, pas des intentions, et sert de référence à toute session qui n'a pas participé à sa rédaction. Une règle sans exception écrite ici n'en a aucune.

## 1 · Les couleurs — rôle, contraste, interdit

Aucun composant n'écrit une couleur en dur : il consomme toujours une des variables ci-dessous.

| Token | Valeur | Rôle | Contraste mesuré | Interdit |
|---|---|---|---|---|
| `action-500` | `#fee300` | Fond du bouton principal (CTA), éléments actifs | encre dessus 11,83:1 | Jamais de texte blanc dessus (1,30:1). Jamais en texte sur un fond clair (1,30:1). |
| `action-600` | `#e0c800` | Survol / appui du bouton principal | encre dessus 9,08:1 | Jamais de texte blanc dessus. |
| `action-100` | `#fff9d6` | Fonds d'accent doux | encre dessus ≈14:1 | Réservée aux fonds — jamais une couleur de texte ni de bouton. |
| `action-700` | `#d0b800` | Variante soutenue, en réserve | — | Non affectée à un composant tant qu'un usage n'est pas décidé ici même. |
| `chaud-500` | `#fe8200` | Bandeau promo, badge de remise, compteur de panier | encre dessus 6,14:1 | Jamais de texte blanc dessus (2,50:1). Jamais en texte sur blanc (2,50:1) — utiliser `chaud-700`. |
| `chaud-clair` | `#ffa500` | Variante claire du bandeau promo | encre dessus 7,77:1 | Mêmes interdits que `chaud-500`. |
| `chaud-600` | `#d96c00` | Icônes, bordures actives chaudes | — | Jamais comme fond de bouton principal (rôle de `action-500`). |
| `chaud-700` | `#a35200` | Seule variante orange utilisable en texte sur blanc | 5,58:1 | En dessous de ce ton, aucun orange n'est un texte. |
| `froid-500` | `#00f1fc` | Décor uniquement (soulignements, aplats) | — | **Jamais en texte** (1,40:1). Jamais comme fond de bouton d'action. |
| `froid-600` | `#00858b` | Icônes, bordures, états froids | 4,44:1 | Jamais comme fond de CTA — la marque n'a qu'une couleur d'action, le jaune. |
| `froid-700` | `#00787e` | Liens textuels | 5,27:1 | En dessous de ce ton, aucun cyan/bleu n'est un lien. |
| `froid-100` | `#e6fbfd` | Fonds froids doux | encre dessus 14,3:1 | Réservée aux fonds. |
| `info-500` | `#007ef6` | Éléments informatifs non textuels | 3,95:1 | Sous le seuil texte (4,5:1) : jamais un texte informatif — utiliser `info-600`. |
| `info-600` | `#0071dd` | Texte informatif | 4,77:1 | — |
| `danger-600` | `#c1121f` | Erreurs et actions destructrices (supprimer, annuler une commande, retirer un article) UNIQUEMENT | 6,22:1 | **Jamais** un accent commercial, un badge d'offre ou un compteur. Le rouge du logo (`#fe0305`, contour du lettrage) n'entre jamais dans l'interface. |
| `danger-100` | `#fdeaec` | Fond des messages d'erreur | — | Toujours accompagnée de `danger-600` en texte, jamais seule comme signal. |
| `ink-900` | `#2b2419` | Texte, prix, titres | sur `surface-0` 15,34:1 | N'est **pas** le noir du logo (`#0a0a0a`, froid) : ne jamais les confondre ni les substituer l'un à l'autre. |
| `ink-700` | `#4a4133` | Texte secondaire | sur `surface-0` 10,02:1 | — |
| `ink-600` | `#6b6152` | Mentions, TVA, disponibilité | sur `surface-0` 6,07:1 | Plancher de lisibilité de l'interface : rien de plus clair n'est un texte. |
| `surface-0` / `surface-50` / `surface-100` / `surface-150` | `#ffffff` `#faf8f5` `#f4f1ea` `#efe9df` | Fond de page, cartes, zones creuses (du plus clair au plus soutenu) | — | Jamais une couleur de texte ni un accent. |
| `border` | `#e6e0d6` | Séparateurs, contours de carte | — | Jamais un accent de marque : une bordure ne porte pas d'identité. |

**Règle de fond** : sur le jaune et sur l'orange de la marque, le texte est **toujours** l'encre — jamais blanc, dans aucun état (survol compris). Toute couleur qui n'a pas de ligne ci-dessus n'existe pas dans ce système : ne pas en introduire sans passer par ce document.

## 2 · Hiérarchie typographique

Deux familles, deux graisses maximum chacune. Ce sont des **polices variables** : un seul fichier par famille couvre les deux graisses — une seule déclaration `@font-face` par famille, avec une plage (`font-weight: 600 700` pour Montserrat, `font-weight: 400 600` pour Source Sans 3). Servir deux fois le même fichier est une faute de poids, jamais une simplification.

| Niveau | Police · graisse | Taille | Usage |
|---|---|---|---|
| Titre principal | Montserrat 700 | 34 px | Titre de page, hero |
| Titre de section | Montserrat 600 | 24 px | En-tête de bande, de section |
| Titre de carte | Montserrat 600 | 19 px | Nom de produit sur une carte |
| Corps | Source Sans 3 400 | 16 px | Texte courant. Interligne 1,6. |
| Secondaire | Source Sans 3 400 | 14 px | Réassurance courte, sous-titres |
| Mention | Source Sans 3 400 ou 600 | 12 px | TVA, disponibilité, badges — **plancher absolu** |

Aucun texte, y compris une légende, une annotation ou un code hexadécimal dans une planche de référence, ne descend sous 12 px. L'italique est réservé aux titres promotionnels, au maximum 5 % des titres d'un écran ; il n'apparaît jamais dans le corps de texte.

## 3 · Espacement et élévation

**Échelle d'espacement, sans exception** : `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96` px. Aucune autre valeur n'existe — ni `5`, `7`, `9`, `11`, `14`, `18`, `26` ni `34` px, même pour « ajuster visuellement » un padding, une marge ou un `gap` de quelques pixels : c'est le composant qu'on recadre, jamais l'échelle qu'on contourne.

**Rayons, un seul par famille de composant** : `radius-sm` 6 px (petits éléments), `radius-md` 10 px (cartes, champs), `radius-lg` 16 px (grands blocs), `radius-pill` 999 px (badges, boutons entièrement arrondis). Un même composant ne mélange jamais deux rayons.

**Élévation, trois niveaux, à peine visibles** : `elevation-1` `0 1px 2px rgba(43,36,25,.06)` (cartes au repos), `elevation-2` `0 4px 12px rgba(43,36,25,.08)` (survol, menus), `elevation-3` `0 12px 28px rgba(43,36,25,.12)` (modales, panneaux). L'interface se sépare par les bordures et les fonds, pas par le relief : aucune ombre plus marquée que `elevation-3` n'existe dans ce système.

**Points de rupture** : `390` (mobile) · `768` (tablette) · `1024` (desktop) · `1440` (large). Conception mobile d'abord ; aucune largeur fixe en dehors de ces paliers.

## 4 · Les badges

Deux badges au maximum par carte produit : un commercial (promo ou compte à rebours) et un de stock. En cas de conflit, priorité stricte : **Épuisé > Promo > Compte à rebours > Derniers exemplaires > Nouveau > Coup de cœur**.

| Badge | Fond | Texte | Donnée source | Règle |
|---|---|---|---|---|
| Promo | `chaud-500` | `ink-900` | `specific_price.reduction` | Affiche la valeur réelle : `−20 %` (pourcentage) ou `−3 €` (montant) — jamais un chiffre arrondi ou choisi pour l'effet. |
| Compte à rebours | `ink-900` | blanc, accent `action-500` | `specific_price.to` | Ne s'affiche que si une date de fin **réelle** existe ; disparaît après l'échéance. Deux longueurs : complète sur la fiche (« 13 j 1 h 30 min »), abrégée sur la carte (« 13 j »). Mise à jour une fois par minute, sans animation. Ne s'affiche jamais dans le tunnel de commande. |
| Nouveau | `action-500` | `ink-900` | `product.date_add` | Seuil d'ancienneté paramétrable (30 jours par défaut). |
| Derniers exemplaires | `chaud-clair` | `ink-900` | `stock_available.quantity` | Seuil paramétrable. |
| Épuisé | `surface-100` | `ink-600`, bordure `border` | `stock_available.quantity ≤ 0` | **Jamais de rouge** : le rouge est réservé aux erreurs, pas aux états commerciaux. |
| Bientôt de retour | `feedback-info-fond` | `feedback-info-texte` | rupture + réappro autorisé | Propose l'alerte e-mail. |
| Coup de cœur | `surface-0`, bordure `chaud-500` | `ink-900` | étiquette back-office | Motif obligatoire au choix de l'équipe. |
| Exclusivité | `ink-900` | blanc | étiquette back-office | — |

Chaque badge porte un texte, jamais la seule couleur. Aucun compte à rebours inventé, aucun minuteur qui se réinitialise, aucune fausse rareté.

## 5 · Direction d'animation

L'énergie visuelle vit dans le logo et le bandeau promo, jamais dans la page entière : l'interface reste plate, calme et rapide.

**Autorisé**, en CSS/SVG uniquement (aucune bibliothèque requise) : rotation très lente des rayons derrière le logo (90–120 s), 3 à 5 étincelles scintillantes dans le bandeau promo (opacité + échelle, 2,5 s, décalées), apparition douce des cartes produit à l'entrée dans le viewport (4 px de translation), rebond du compteur de panier à l'ajout (150 ms). Durées de référence : micro 160 ms, standard 240 ms, entrée 320 ms, sortie 200 ms.

**Interdit** : toute animation dans le tunnel de commande, animation sur l'élément principal (LCP), décalage de mise en page, parallaxe, son, vidéo en lecture automatique, plus d'un élément animé par bande visuelle. `prefers-reduced-motion: reduce` arrête tout mouvement, sans reliquat.

## 6 · Ce que nous ne faisons jamais

- Nous ne redessinons pas, ne recadrons pas et ne recolorons pas le logo. Nous ne reproduisons jamais son biseau 3D, ses reflets ou son dégradé métallique dans un composant d'interface.
- Nous ne mettons jamais de texte blanc sur le jaune ou l'orange de la marque, sous aucun état.
- Nous n'utilisons jamais le cyan, le jaune ou l'orange comme couleur de texte en dehors des tons prévus pour ça (`froid-700`, `chaud-700`).
- Nous n'utilisons jamais le rouge (`danger-600` ou le rouge du logo) pour autre chose qu'une erreur ou une action destructrice.
- Nous ne confondons jamais le noir du logo (`#0a0a0a`) avec l'encre de l'interface (`#2b2419`).
- Nous n'inventons rien : pas de couleur, pas de police, pas de chiffre flatteur, pas de note sans source, pas de compte à rebours sans date de fin réelle, pas de stock inventé, pas de faux prix barré, pas de faux badge « ★ 4,9/5 ».
- Nous n'écrivons jamais de texte de remplissage (« Lorem ipsum », « Votre titre ici ») : toujours du vrai français, cohérent avec le ton chaleureux, direct et artisanal de la boutique.
- Nous ne fabriquons jamais de compteur ni de rareté artificielle.
- Nous n'ouvrons jamais de fenêtre modale qui interrompt une action en cours.
- Nous n'utilisons jamais de dégradé bleu/violet, d'illustration générique de personnes souriantes, d'ombre portée lourde, de coin arrondi systématique ni d'emoji en guise d'icône.
- Nous ne descendons jamais sous 12 px pour un texte, ni sous une échelle d'espacement en multiples de 4 pour une marge, un padding ou un `gap`.
- Nous ne portons jamais une information par la seule couleur, et nous ne supprimons jamais un anneau de focus visible.
- Nous n'ajoutons jamais de requête réseau externe dans un livrable : polices, images et scripts sont embarqués ou déjà servis par le thème.
- Nous ne servons jamais deux fois le même fichier de police variable sous deux déclarations `@font-face` distinctes.
- Nous n'animons jamais rien dans le tunnel de commande, et nous n'ignorons jamais `prefers-reduced-motion`.
