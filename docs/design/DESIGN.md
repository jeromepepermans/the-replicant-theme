# DESIGN.md — the-replicant.com, système de design du thème `replicant` **v0.3**

**Version 0.3.0 · 18/09/2026 · Statut : à valider par Jérôme**
**Changement majeur vs v0.2** : le **logo final** est arrivé (`logo_Fond_transparent.png`, PNG à fond
transparent, 1024 × 1024) — une **composition unique** et non plus quatre variantes. Les couleurs sont
**re-mesurées au pixel sur ce fichier** et la palette est re-dérivée : les oranges du logo
(`#fd5600`→`#feb200`, **28 %** des pixels saturés) re-ancrent le rôle *promo* sur `#fe8200`, et le jaune
mesuré `#fee300` remplace `#fdd800` — **meilleur contraste avec l'encre (11,83:1 au lieu de 10,96:1)**.
La direction de mouvement devient **festive** (§7).

**Source unique** : `docs/design/tokens.json` (thème, module compagnon et app mobile).
Aucun composant n'écrit un hex en dur.

---

## 1. Le logo FINAL — ce qui a été mesuré (analyse pixel, pas impression)

Fichier analysé : **`logo_Fond_transparent.png`** — **1024 × 1024**, RVBA, **1 474 666 o** (livré le
18/09/2026 ; c'est désormais **le** fichier de référence).

- **Une seule composition** : wordmark « The Replicant » (« The » petit au-dessus, « Replicant » en grand —
  sans-serif **très gras, italique, biseauté 3D**, remplissage blanc dégradé, contour rouge/orange, liseré
  noir), **explosion de rayons** orange/jaune alternés et bleu/cyan, **deux grands arcs** dynamiques (bleu à
  liseré jaune), **deux étoiles jaunes à quatre branches**, et de nombreuses **étincelles** aux extrémités
  des rayons. Aucun anneau fermé, aucun confetti — et un rendu **franchement festif**.
- **Couleurs mesurées** (pixels saturés) : **oranges 28 %** en famille (`#fd5600` · `#fe6c01` · `#fe8200` ·
  `#fe9a00` · `#feb200`, dominante `#fe8200`), **jaune `#fee300` 5,5 %**, **rouge `#fe0305` 4,7 %** (contour
  du lettrage), **cyan `#00f6fc` 3,9 %** (confirme les jetons de la v0.2), **noirs** `#080001`→`#220000`.
- ⚠ **Les noirs du logo sont FROIDS** : le noir du logo (`#0a0a0a`) n'est pas l'encre chaude des jetons
  (`#2b2419`). Les deux ne se confondent pas, et l'encre de l'interface **ne change pas**.
- ⚠ **Le fichier n'a pas de cœur opaque** : 31,0 % de pixels totalement transparents, 23,6 % à alpha 1-127,
  12,1 % à alpha 128-249, **33,3 % à alpha 250-254** et **aucun pixel à 255**. Sur un fond coloré, le logo
  est donc très légèrement translucide. Le master de travail **normalise l'alpha** (≥ 250 → 255).

### Ce que le logo donne comme actifs de site (mesuré, pas estimé)

| Usage | Fichier | Poids |
|---|---|---|
| En-tête mobile (56 px) | `logo-carre-56.webp` (WebP q88) | **4 224 o** |
| En-tête desktop (72 px, affiché 56 px ×2) | `logo-carre-112.webp` | **12 488 o** |
| Favicon | `favicon-32.webp` + `favicon-48.webp` | 1 738 + 3 244 o |
| App mobile / PWA | `apple-touch-180.webp` · `pwa-512.webp` | 25 710 · 340 712 o |
| Bandeau de page d'accueil (**décor, jamais en en-tête**) | `logo-bandeau-600x280.webp` | 83 202 o |

- ✅ **Deux en-têtes (mobile + desktop) coûtent 16 712 o en WebP q88** — contre 42 439 o en PNG et
  **1,8 à 5 Mo pour les SVG livrés**.
- ⛔ **Le recadrage en bandeau large a été fabriqué puis ÉCARTÉ**, après contrôle visuel : les arcs, une
  étoile et les rayons y sont coupés asymétriquement — « recadré, pas fini ». **En en-tête : le carré
  complet, rien d'autre.**
- ⛔ **Les SVG livrés (1 129 à 9 045 tracés) sont inutilisés sur le site** : réserver à l'impression. Le
  **PNG transparent** reste le format décidé par Jérôme pour la marque ; le thème sert du **WebP** (sans
  perte : 74 % du PNG ; q88 : 38 %).
- ⚠ **À 44-56 px, le wordmark du carré complet n'est plus lisible** (≈ 5 px par lettre — vérifié sur la
  planche d'en-tête). L'en-tête affiche donc **le nom en texte à côté de l'emblème** : c'est lui qui porte
  la marque, l'emblème apporte la couleur. L'option « emblème seul » est montrée pour comparaison.
- ✅ **Le jeu d'icônes a été livré** (18/09/2026) : `favicon.ico`, `favicon-16`, `favicon-32`,
  `apple-touch-icon-180`, `android-chrome-192` et `-512` — versionnés dans `docs/design/references/icones/`.
  ⚠ **Deux réserves** : ① le fichier 512 est la composition **complète** sur fond **blanc opaque** et **sans
  marge de sécurité** — il n'est donc **pas « maskable »** (Android rognerait les rayons) : il faut une
  variante **avec ~20 % de marge**, ou assumer le rognage ; ② à 16-32 px le wordmark est illisible (normal),
  seul l'éclatement reste reconnaissable — l'icône fait son travail de favicon, pas de signature.
- ⚠ **Poids des icônes non optimisés** : 512 = **332 Ko**, 192 = 62 Ko, apple-touch-180 = **55 Ko**, 32 = 3 Ko.
  Acceptable en téléchargement unique, mais l'apple-touch (55 Ko) et le 512 mériteraient un passage d'optimiseur.

### Jusqu'à quelle taille le wordmark du logo devient-il lisible ? (mesuré, pas estimé)

Échelle rendue dans un navigateur, puis relue : **56 px illisible · 72 px à peine déchiffrable · 96 px
lisible · 120 px confortablement lisible · 144 px très confortable.** Poids du fichier : 4 / 6 / 9 / 13 / 18 Ko
(WebP q88). **Conséquence pour l'en-tête desktop** — c'est la demande de Jérôme du 18/09/2026 (« en desktop,
il faut que le logo soit visible ET lisible ») : l'en-tête desktop est **haut au repos** (logo **120 px**,
mot lisible) et **se compacte au défilement** (72 px, logo 56 px + le nom en texte). On ne perd la place
qu'une fois, en haut de page.

## 2. Ce qu'on garde du logo, et ce qu'on n'en garde pas

| On garde | On ne transplante **pas** dans l'interface |
|---|---|
| les **couleurs** (jaune = action, orange = promotion, cyan = décor, bleu = information) | le **biseau 3D**, les reflets, les dégradés métalliques du lettrage |
| l'**encre sombre** des contours | le **starburst** en fond de section (trop lourd, il écrase la lisibilité) |
| le **contraste chaud / froid** (jaune-orange vs cyan-bleu) comme signature graphique | les **éclats** partout : ils restent un motif ponctuel (bandeau promo, état vide) |
| une titraille **sans-serif grasse**, l'**italique** en écho au lettrage pour les moments promotionnels | les **anneaux orbitaux** comme élément d'interface |

**Règle d'harmonie** : l'énergie du logo vit dans **le logo et le bandeau promo**. L'interface reste
**plate, calme et rapide** — c'est la condition de « moderne simple, facile et rapide d'acheter ».

## 3. Palette de l'interface (contrastes calculés)

| Rôle | Token | Valeur | Usage | Contraste mesuré |
|---|---|---|---|---|
| **Action** | `action-500` | `#fee300` (jaune du logo final) | fond du CTA, éléments actifs | **encre dessus 11,83:1** ✅ |
| Action survolé | `action-600` | `#e0c800` | survol / appui | encre 9,08:1 ✅ |
| Action doux | `action-100` | `#fff9d6` | fonds d'accent | encre ~14:1 ✅ |
| **Accent chaud** | `chaud-500` | `#fe8200` (orange dominant du logo) | bandeau promo, **badge du panier** | **encre 6,14:1** ✅ |
| Accent chaud clair | `chaud-clair` | `#ffa500` | variante de bandeau, aplats | encre 7,77:1 ✅ |
| idem, interface | `chaud-600` | `#d96c00` | icônes, bordures actives | — |
| idem, texte | `chaud-700` | `#a35200` | texte orange sur blanc | **5,58:1** ✅ |
| **Décor froid** | `froid-500` | `#00f1fc` (cyan du logo) | soulignements, aplats — **jamais du texte** | 1,40:1 ⛔ |
| Froid interface | `froid-600` | `#00858b` | icônes, bordures, états | 4,44:1 ✅ |
| Froid texte | `froid-700` | `#00787e` | liens | **5,27:1** ✅ |
| Froid doux | `froid-100` | `#e6fbfd` | fonds | encre 14,3:1 ✅ |
| Information | `info-500` / `info-600` | `#007ef6` / `#0071dd` | éléments / texte | 3,95:1 / 4,77:1 ✅ |
| **Erreur** | `danger-600` | `#c1121f` | erreurs, rupture de stock | **6,22:1** ✅ |
| Encre | `ink-900` / `ink-700` / `ink-600` | `#2b2419` / `#4a4133` / `#6b6152` | titres & prix / secondaire / mentions | 15,34 / 10,02 / 6,07:1 ✅ |
| Surfaces | `surface-0/50/100` | `#ffffff` `#faf8f5` `#f4f1ea` | page, cartes, zones | — |
| Bordures | `border` | `#e6e0d6` | séparateurs | — |

**16 paires texte/fond contrôlées par programme : 13 conformes** — les 3 non conformes sont les
**interdits assumés** (cyan, jaune et orange en texte).

### Interdits (chacun mesuré)
1. **Texte blanc sur le jaune ou l'orange du logo** (1,30:1 et 2,50:1) → **sur ces fonds, le texte est
   toujours l'encre**.
2. **Cyan `#00f1fc` en texte** (1,40:1) → décor uniquement ; pour du texte, `#00787e`.
3. **Jaune `#fee300` en texte sur blanc** (1,30:1) — il est un **fond**, jamais un texte.
4. **Orange `#fe8200` en texte** (2,50:1) → utiliser `chaud-700` (`#a35200`).
5. **Rouge `#fe0305` en texte** — il reste le contour du logo ; les erreurs utilisent `danger-600`.
6. **Confondre le noir du logo (`#0a0a0a`) et l'encre de l'interface (`#2b2419`)** : deux familles.
7. **Biseau, dégradé métallique ou ombre décorative** dans les composants d'interface — le relief du logo
   ne se rejoue pas dans l'interface.
8. **Badge, compteur ou pastille en rouge `danger-600`** quand il n'exprime pas une erreur : le rouge est
   réservé aux erreurs et à la rupture de stock — les accents utilisent `chaud-500`.

## 4. Typographie — l'option se tranche autrement depuis le nouveau logo

Le logo est une **sans-serif grasse italique, biseautée**. Une titraille serif (option B de la v0.1,
Fraunces) créerait une rupture d'univers. **On recommande donc A**, avec l'italique en écho au lettrage
**réservé aux titres promotionnels** (≤ 5 % des titres), jamais en corps de texte :

| | **A — recommandée** | B — écartée par le logo |
|---|---|---|
| Titres | **Montserrat 700** (grands titres), 600 (sections) | serif (Fraunces) : rupture avec le lettrage |
| Corps | **Source Sans 3** 400/600 | — |
| Pourquoi | police déjà installée sur la boutique + écho direct au lettrage du logo | — |

Échelle fluide inchangée (`display` → `micro`, base 16 px, interligne 1,6, **jamais moins de 12 px**).
✅ **Licences VÉRIFIÉES À LA SOURCE** (18/09/2026, fichiers lus dans les dépôts officiels) : **Montserrat**
et **Source Sans 3** sont toutes deux sous **SIL Open Font License 1.1** (© 2024 The Montserrat.Git Project
Authors ; © 2010-2024 Adobe). Les deux portent une mention **« Reserved Font Name »** : l'auto-hébergement et
la redistribution **des fichiers tels que publiés** sont autorisés — c'est ce que fait le thème, avec les
fichiers de Google Fonts **non modifiés** ; une version sous-ensemblée ou modifiée par nos soins devrait être
**renommée**. Les licences accompagnent les polices dans `docs/design/references/polices/`.

**Poids servi** : la boutique est **monolingue FR** ⇒ **sous-ensemble latin uniquement** = **37 956 o**
(Montserrat variable 600-700) + **28 740 o** (Source Sans 3 variable 400-600) = **65 Ko** au lieu des 3 fontes
chargées aujourd'hui **depuis Google**. Les fichiers `latin-ext` sont conservés au dépôt au cas où une
deuxième langue arriverait.

## 4 bis · Les badges produit — promotions, compte à rebours et stock

Demande de Jérôme (18/09/2026) : **un compte à rebours pour les offres à date de fin**, les **badges de
rupture de stock**, et d'autres options. La famille complète, avec **la donnée PrestaShop qui alimente chacun** :

| Badge | Donnée PrestaShop | Règle |
|---|---|---|
| **−20 %** ou **−3 €** | `specific_price.reduction` + `reduction_type` | le badge affiche **la valeur réelle** : pourcentage (`−20 %`) ou montant (`−3 €`) — 59 règles en montant existent en base ; prix barré, **jamais de faux prix de référence** |
| **Compte à rebours** | `specific_price.to` (**date de fin réelle**) | affiché **uniquement** si la date existe ; disparaît après l'échéance |
| **Nouveau** | `product.date_add` | ancienneté paramétrable (30 jours par défaut) |
| **Derniers exemplaires** | `stock_available.quantity ≤ seuil` | seuil paramétrable, rien si la quantité est masquée |
| **Épuisé** | `stock_available.quantity ≤ 0` | **gris neutre, jamais rouge** — le rouge sert aux **erreurs et aux actions destructrices**, pas aux états commerciaux |
| **Bientôt de retour** | rupture + réappro autorisé | propose l'alerte e-mail |
| **Coup de cœur / Exclusivité** | étiquette back-office | choix de l'équipe, **motif obligatoire** |

**Source vérifiée en production** (lecture seule, 18/09/2026) : `ps_specific_price` porte **4 204 offres
datées**, dont **18 avec une fin encore future** — la prochaine échéance relevée est le **01/10/2026 à
23h55**, une remise de **−20 %**. Le compte à rebours a donc de la matière réelle, pas des exemples inventés.

**Les règles anti-bruit** (elles valent aussi comme règles d'honnêteté) :
1. **Deux badges au maximum** par carte produit : un **commercial** (promo ou compte à rebours) et un de
   **stock**. Priorité : *Épuisé > Promo > Compte à rebours > Derniers exemplaires > Nouveau > Coup de cœur*.
2. **Aucune information par la seule couleur** : chaque badge porte un texte.
3. **Aucun compte à rebours inventé** : pas de date de fin ⇒ pas de badge ; jamais de minuteur qui se
   réinitialise, jamais de « plus que 2 min » fabriqué. La **fausse rareté est refusée**.
4. **Le compte à rebours ne s'affiche pas dans le tunnel** (la règle des 60 secondes reste seule maîtresse)
   et **n'est pas une animation** : mise à jour une fois par minute, sans décalage de mise en page.
5. **Accessibilité** : `<time datetime="…">` avec un libellé complet, `aria-live="off"` pour ne pas interrompre.

✅ **Portée tranchée par Jérôme (18/09/2026)** : le badge s'affiche **uniquement sur les offres qui portent une date
de fin réelle** (`specific_price.to > NOW()`) — **18 offres** aujourd'hui, toutes à −20 %. Le badge reste donc **rare,
donc utile**, et le compte à rebours n'apparaît que là où il est vrai. Le badge affiche la **valeur réelle** de la
remise (pourcentage **ou** montant : « −20 % » ou « −3 € »).

## 5. Navigation — exigence explicite de Jérôme

**Principe : 3 chemins maximum jusqu'à n'importe quel produit (univers → sous-catégorie → produit), et la
recherche toujours à un geste.**

### Mobile
- **En-tête collant de 56 px** : logo **carré complet** (`logo-carre-56.webp`) **suivi du nom en texte**
  (à 44-56 px le wordmark du logo n'est pas lisible), recherche plein écran, panier avec compteur.
- **Barre basse à 4-5 entrées, 48 px** : Accueil · Catégories · Recherche · Panier · Compte —
  **libellées ET iconographiées** (jamais d'icône seule), onglet actif marqué (`aria-current`).
- **Menu plein écran** : les univers dépliés au premier niveau (pas de sous-menus cachés), fermeture au
  balayage, **retour système respecté**.
- **Filtres de catégorie** : panneau dédié, compteur de résultats et bouton « Voir les N produits » toujours visibles.

### Desktop
- **En-tête desktop** : **haut au repos (logo 120 px — le mot « Replicant » devient lisible)** puis
  **compact 72 px au défilement** (logo 56 px + le nom en texte), univers au centre, recherche + compte +
  panier. Mesuré : le mot n'est confortablement lisible qu'à partir de **120 px**.
- **Méga-menu** : une colonne par univers, **2 niveaux visibles sans clic**, image de mise en avant
  optionnelle, ouvrable au survol **et au clavier**.
- **Recherche permanente** avec suggestions (catégories + produits), raccourci clavier `/`.
- **Fil d'Ariane** sur toutes les pages catalogue et produit.

### Paramétrable en back-office
Univers et ordre des entrées (les **mêmes données** que les catégories mises en avant de l'accueil),
entrées de la barre mobile, univers mis en avant dans le méga-menu, image par univers.

## 6. Achat rapide — « simple, facile et très rapide »

Objectif mesurable : **un client qui sait ce qu'il veut achète en moins de 60 secondes, sans compte**.

1. **Ajout au panier depuis la carte produit** (produits homogènes), sans ouvrir la fiche.
2. **Panier latéral** : quantité et passage commande sans changer de page.
3. **Commande invité par défaut** ; la création de compte est proposée **après** la commande.
4. **4 écrans maximum**, progression toujours visible.
5. Adresse en autocomplétion, transporteurs et paiement **au même niveau**.
6. **Frais de port affichés dès le panier** — jamais de surprise au dernier écran.
7. Aucun compte à rebours, aucun popup, aucune inscription forcée à la newsletter.

**Anti-modèles refusés** : inscription obligatoire avant l'achat, étape intercalée artificielle, fenêtre
modale qui interrompt le tunnel, frais découverts à la fin.

## 7. Mouvement — direction **festive** (demande de Jérôme du 18/09/2026)

**« Moderne avec de l'animation et un air de festivité »**, sans quitter la règle d'harmonie : *la
festivité vient du **logo** et de la **bande promo**, jamais de la page entière.*

**Autorisé** (tout en CSS/SVG — aucune bibliothèque requise) :
- **rotation très lente des rayons** derrière le logo (**90 à 120 s**, `transform`, une seule couche) ;
- **3 à 5 étincelles** dans le bandeau promo (opacité + échelle, **2,5 s**, décalées) ;
- **apparition des cartes produit** à l'entrée dans le viewport (**4 px** de translation) ;
- **rebond du compteur de panier** à l'ajout (**150 ms**).

**Interdit** : toute animation **dans le tunnel** (DECISION-020 : moins de 60 s, aucun popup) · animation sur
l'élément **LCP**, décalage de mise en page, parallaxe · son, vidéo en lecture automatique, défilement
détourné · plus d'**un élément animé par bande visuelle**.

**Garde-fous** : `prefers-reduced-motion: reduce` ⇒ **tout s'arrête**, aucun mouvement résiduel ; les
animations n'ajoutent **aucune requête ni aucun octet d'image**. Les timings GSAP de la v0.1 (160 / 400 /
350 ms, `stagger 0.05`) restent valables pour les transitions d'interface, GSAP demeurant un **budget
facultatif de 45 Ko**.

## 8. Accessibilité et budget

Contraste texte **4,5:1** · UI **3:1** · cible **44×44 px** (barre mobile 48 px) · focus visible
(`2px` encre, offset 2 px) · **aucune information par la seule couleur**.
Budget : **CSS ≤ 45 Ko**, **JS ≤ 110 Ko** (GSAP < 45 Ko), **accueil ≤ 90 Ko gzip**, **≤ 60 requêtes**,
images **WebP/AVIF + `srcset`**, CLS < 0,05.

**Le logo ne part jamais tel quel** : en en-tête, **le carré complet en WebP q88** (56 px puis 112 px pour
les écrans denses) — **16 712 o pour les deux**, une seule variante chargée par page. Le PNG transparent est
le format de marque (§1), le **WebP** le format servi, le **SVG livré** reste à l'impression. Le fichier de
travail (1,44 Mo) est un **fichier de production graphique**, pas un livrable web.

**Planche de référence** : `docs/design/maquettes/entete-festif-v1.html` — les trois en-têtes (mobile
emblème seul / mobile avec le nom / desktop), le bandeau festif, les cartes produit et les règles
d'animation ; autonome, **aucune ressource externe**, vérifiée au rendu.
