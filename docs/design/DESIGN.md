# DESIGN.md — the-replicant.com, système de design du thème `replicant` **v0.2**

**Version 0.2.0 · 17/09/2026 · Statut : à valider par Jérôme**
**Changement majeur vs v0.1** : la palette n'est plus dérivée du thème sortant — elle est **dérivée du nouveau
logo**. Le terracotta `#d06e6a` et l'or `#c6b26d` sont **retirés du système**.

**Source unique** : `docs/design/tokens.json` (thème, module compagnon et app mobile).
Aucun composant n'écrit un hex en dur.

---

## 1. Le nouveau logo — ce qui a été mesuré (analyse pixel, pas impression)

Fichier analysé : `ChatGPT Image 17 sept. 2026, 17_52_53.png` — **1254 × 1254**, RVBA.

- **4 variantes réellement différentes** (les empreintes des 4 quadrants sont distinctes : ce ne sont pas
  4 copies — une première lecture visuelle rapide s'y était trompée).
- **Structure commune** : wordmark « The Replicant » (sans-serif **grasse, italique, biseautée**), deux
  **anneaux orbitaux** (cyan clair au-dessus, jaune-orange en dessous), un **starburst** de rayons
  chauds/froids, deux **éclats** à 4 branches.
- **Fond transparent** : 32,6 à 36,3 % de pixels transparents, **aucune variante à fond noir**, aucun badge
  fermé (ni rond, ni carré) → utilisable sur fond clair.
- **Ce qui distingue les 4 variantes** : la **densité de rayons** — couleurs vives **29,2 % / 30,5 % /
  37,6 % / 43,8 %** de la surface. Les variantes 1 et 3 sont les plus « énergiques », 2 et 4 les plus sobres.
- Le contenu occupe **92-93 %** du carré : les variantes sont **serrées dans leur cadre**, donc à recadrer
  pour un en-tête.

### Couleurs exactes du logo (fréquence sur les pixels opaques)

| Couleur | Valeur | Part des pixels vifs | Rôle dans le logo |
|---|---|---|---|
| **Jaune** | `#fdd800` | **13,3 %** | rayons chauds, éclats, anneau inférieur |
| **Orange** | `#fda503` | **11,3 %** | rayons chauds, contour |
| **Rouge** | `#ff0000` | **8,6 %** | contour du lettrage |
| **Cyan** | `#00f1fc` | **4,7 %** | rayons froids, anneau supérieur |
| **Bleu** | `#007ef6` | **1,1 %** | rayons froids |
| Ombres / contours | quasi-noir (`#010000` → `#2b2419`) | ~22 % des pixels sombres | ombre portée du lettrage |

**Bonne surprise** : les contours sombres du logo sont **de la même famille que l'encre déjà retenue**
(`#2b2419`, mesurée sur le brun `#3a3220` du site). **L'encre ne change pas.**

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
| **Action** | `action-500` | `#fdd800` (jaune du logo) | fond du CTA, éléments actifs | **encre dessus 10,96:1** ✅ |
| Action survolé | `action-600` | `#dfbe00` | survol / appui | encre 8,4:1 ✅ |
| Action doux | `action-100` | `#fef9d6` | fonds d'accent | encre 14,4:1 ✅ |
| **Accent chaud** | `chaud-500` | `#fda503` (orange du logo) | bandeau promo, badges | **encre 7,71:1** ✅ |
| idem, interface | `chaud-600` | `#ca8402` | icônes, bordures actives | 3,08:1 (UI) ✅ |
| idem, texte | `chaud-700` | `#986302` | texte orange sur blanc | **5,10:1** ✅ |
| **Décor froid** | `froid-500` | `#00f1fc` (cyan du logo) | soulignements, aplats — **jamais du texte** | 1,40:1 ⛔ |
| Froid interface | `froid-600` | `#00858b` | icônes, bordures, états | 4,44:1 ✅ |
| Froid texte | `froid-700` | `#00787e` | liens | **5,27:1** ✅ |
| Froid doux | `froid-100` | `#e6fbfd` | fonds | encre 14,3:1 ✅ |
| Information | `info-500` / `info-600` | `#007ef6` / `#0071dd` | éléments / texte | 3,95:1 / 4,77:1 ✅ |
| **Erreur** | `danger-600` | `#c1121f` | erreurs, rupture de stock | **6,22:1** ✅ |
| Encre | `ink-900` / `ink-700` / `ink-600` | `#2b2419` / `#4a4133` / `#6b6152` | titres & prix / secondaire / mentions | 15,34 / 10,02 / 6,07:1 ✅ |
| Surfaces | `surface-0/50/100` | `#ffffff` `#faf8f5` `#f4f1ea` | page, cartes, zones | — |
| Bordures | `border` | `#e6e0d6` | séparateurs | — |

**14 paires texte/fond contrôlées par programme : 14 conformes.**

### Interdits (chacun mesuré)
1. **Texte blanc sur le jaune ou l'orange du logo** : 1,40:1 et 1,99:1 → **sur ces fonds, le texte est
   toujours l'encre**.
2. **Cyan `#00f1fc` en texte** (1,40:1) → décor uniquement ; pour du texte, `#00787e`.
3. **Jaune `#fdd800` en texte sur blanc** (1,40:1) — il est un **fond**, jamais un texte.
4. **Orange `#fda503` en texte** (1,99:1) → utiliser `chaud-700`.
5. **Rouge `#ff0000` en texte** (4,0:1) — il reste le contour du logo ; les erreurs utilisent `danger-600`.
6. **Terracotta `#d06e6a` et or `#c6b26d`** : retirés du système.
7. **Biseau, dégradé métallique ou ombre décorative** dans les composants d'interface.

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
⚠ **Licences des polices toujours non vérifiées à la source** — à confirmer avant tout téléchargement et
auto-hébergement.

## 5. Navigation — exigence explicite de Jérôme

**Principe : 3 chemins maximum jusqu'à n'importe quel produit (univers → sous-catégorie → produit), et la
recherche toujours à un geste.**

### Mobile
- **En-tête collant de 56 px** : logo (version **plate, sans rayons**), recherche plein écran, panier avec compteur.
- **Barre basse à 4-5 entrées, 48 px** : Accueil · Catégories · Recherche · Panier · Compte —
  **libellées ET iconographiées** (jamais d'icône seule), onglet actif marqué (`aria-current`).
- **Menu plein écran** : les univers dépliés au premier niveau (pas de sous-menus cachés), fermeture au
  balayage, **retour système respecté**.
- **Filtres de catégorie** : panneau dédié, compteur de résultats et bouton « Voir les N produits » toujours visibles.

### Desktop
- **En-tête 72 px** : logo, univers, recherche + compte + panier ; compact au défilement.
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

## 7. Mouvement (GSAP)

Inchangé : micro-interaction **160 ms**, apparition au défilement **400 ms** (`y: 12`), cascade **350 ms**
(`stagger: 0.05`), parallaxe `scrub: 0.6` / `yPercent: 8`. Niveaux **Subtle et Standard uniquement**.
GSAP chargé **après le premier rendu**, désactivé si `prefers-reduced-motion`.

## 8. Accessibilité et budget

Contraste texte **4,5:1** · UI **3:1** · cible **44×44 px** (barre mobile 48 px) · focus visible
(`2px` encre, offset 2 px) · **aucune information par la seule couleur**.
Budget : **CSS ≤ 45 Ko**, **JS ≤ 110 Ko** (GSAP < 45 Ko), **accueil ≤ 90 Ko gzip**, **≤ 60 requêtes**,
images **WebP/AVIF + `srcset`**, CLS < 0,05.

**Le logo ne part jamais tel quel** : version **plate sans rayons** pour l'en-tête, SVG + PNG/WebP optimisés,
**une seule variante chargée par page** (le fichier de travail pèse 2,6 Mo : c'est un fichier de production
graphique, pas un livrable web).
