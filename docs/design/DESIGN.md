# DESIGN.md — the-replicant.com, système de design du thème `replicant`

**Version** : 0.1.0 · **17/09/2026** · **Statut : à valider par Jérôme avant toute maquette**
**Source unique** : `tokens.json` (même fichier pour le thème PrestaShop, le module compagnon et, plus tard,
l'app mobile). Aucun composant n'écrit un hex en dur.

---

## 1. D'où vient cette charte

Elle n'est **pas inventée** : elle est dérivée de l'audit du site en production du 17/09/2026
(`docs/audit-2026-09-17-site-public.md`), qui a relevé sur le CSS réellement servi :

| Relevé sur le site actuel | Valeur | Problème mesuré |
|---|---|---|
| Boutons | `#d06e6a` | blanc dessus = **3,43:1** (insuffisant) |
| Rose du thème | `#d79996` | blanc dessus = **2,36:1** |
| Bandeau promo doré | `#c6b26d` | blanc dessus = **2,10:1** |
| Brun de la newsletter | `#3a3220` | blanc dessus = 12,67:1 ✅ |
| Teal `#2fb5d2` | hérité de Bootstrap | jamais remplacé par le thème actuel |

Le système **garde la marque** (terracotta + or) et **corrige l'accessibilité** : c'est un déplacement de
valeurs, pas un changement d'identité.

## 2. Couleurs

| Rôle | Token | Valeur | Usage | Contraste vérifié |
|---|---|---|---|---|
| CTA | `brand-600` | `#ab5a57` | fond du bouton principal | blanc dessus **4,85:1** ✅ |
| CTA survolé | `brand-700` | `#934a47` | état survol/appui | blanc dessus **6,34:1** ✅ |
| Marque | `brand-500` | `#d06e6a` | bordures, soulignements, aplats **non textuels** | — |
| Fond doux | `brand-100` | `#f7eceb` | encarts, sélections, survols de ligne | encre dessus **13,26:1** ✅ |
| Bandeau promo | `gold-500` | `#c6b26d` | fond du bandeau, **texte encre obligatoire** | encre dessus **7,30:1** ✅ |
| Texte | `ink-900` | `#2b2419` | titres, prix, texte courant | sur blanc **15,34:1** ✅ |
| Texte secondaire | `ink-700` | `#4a4133` | descriptions | **10,02:1** ✅ |
| Texte tertiaire | `ink-600` | `#6b6152` | mentions, TVA, disponibilité | **6,07:1** ✅ |
| Fonds | `surface-0/50/100` | `#ffffff` `#faf8f5` `#f4f1ea` | page, cartes, zones | — |
| Bordures | `border` | `#e6e0d6` | séparateurs (non textuel) | — |
| États | `success/warning/danger/info` | `#2f6b46` `#8a5a12` `#a5342f` `#2f5d75` | messages | ≥ **5,91:1** sur blanc ✅ |

### Interdits (mesurés, pas théoriques)
1. **Blanc sur or** (`gold-500`) : 2,10:1.
2. **Blanc sur `brand-500`** : 3,43:1 — le CTA utilise `brand-600`.
3. **Encre sur `brand-500`** pour du texte courant : 4,47:1, juste sous le seuil → réservé aux grands
   textes (≥ 24 px) et aux aplats non textuels.
4. **Encre tertiaire sur or** : 2,89:1.
5. **Le teal `#2fb5d2`** du thème actuel : supprimé.
6. **Un hex en dur dans un composant** : tout passe par une variable.

*Les 18 paires texte/fond du système ont été calculées par programme : 16 conformes, les 2 restantes sont
documentées ci-dessus comme interdits avec leur alternative.*

## 3. Typographie — deux options, à trancher

L'outillage UI recommandait des binômes (Fredoka/Nunito pour le ludique, Rubik/Nunito Sans pour le
e-commerce) : ils sont écartés **parce que la boutique a déjà une police de marque**, Montserrat. On ne
change pas une police installée sans raison ; on corrige ce qui coûte.

| | Option A — **Continuité** | Option B — **Caractère** |
|---|---|---|
| Titres | Montserrat 600/700 | **Fraunces** 600/700 (serif chaleureuse) |
| Corps | **Source Sans 3** 400/600 | Montserrat 400/600 |
| Ce que ça change | on garde le visage actuel, on remplace Roboto (générique) par une fonte plus lisible en petit corps | un univers artisanal/festif assumé, là où le site actuel est génériquement sans-serif |
| Risque | faible | moyen : identité plus affirmée, à valider par Jérôme |
| Poids | ~2 graisses par famille, sous-ensembles latin | idem + serif plus large → sous-ensemble strict obligatoire |

**⚠ Licences non vérifiées à ce stade.** Les données de police de l'outillage UI ne contiennent ni
Montserrat, ni Source Sans 3, ni Fraunces : la licence de chaque famille doit être **confirmée à la source
avant** tout sous-ensemble et auto-hébergement. Aucune police n'est téléchargée avant cette vérification.

**Échelle** (fluide, `clamp`), base 16 px, interligne corps 1,6 :

| Token | Taille | Usage |
|---|---|---|
| `display` | `clamp(2rem, 1.4rem + 2.6vw, 3.25rem)` | hero, titre de page |
| `h1` | `clamp(1.75rem, 1.3rem + 1.8vw, 2.5rem)` | titre de section |
| `h2` | `clamp(1.375rem, 1.15rem + .9vw, 1.75rem)` | sous-section |
| `h3` | `clamp(1.125rem, 1.05rem + .4vw, 1.3125rem)` | titre de carte produit |
| `corps` | 1rem | description |
| `petit` | .875rem | disponibilité, TVA, livraison |
| `micro` | .75rem | badges — **jamais en dessous** |

## 4. Rythme, formes, profondeur

- **Espacement** : multiples de **4** uniquement (4 → 96).
- **Rayons** : `6` / `10` / `16` px et `pill`. Un seul rayon par famille de composant.
- **Élévations** : 3 niveaux seulement (`0/1/2`), ombres discrètes teintées brun.
- **Bordures** : `1px solid border` par défaut — la hiérarchie passe par l'espace et l'échelle, pas par les boîtes.

## 5. Mouvement (GSAP)

| Intention | Durée · courbe | Réglage GSAP |
|---|---|---|
| Micro-interaction (survol, ajout au panier) | 160 ms · `power1.out` | déplacement ≤ 2 px |
| Apparition au défilement | 400 ms · `power1.out` | `y: 12`, déclenché par section |
| Liste en cascade | 350 ms · `power1.out` | `stagger: 0.05` |
| Parallaxe | liée au défilement | `scrub: 0.6`, `yPercent: 8` |

**Règles** : GSAP n'est **pas** sur le chemin critique (chargé après le premier rendu), tout est désactivé
si `prefers-reduced-motion`, jamais d'animation de `width`/`height`, jamais une durée unique pour tout.
L'outillage UI fournit 17 réglages de mouvement (Subtle / Standard / Complex) — **on n'utilise que Subtle
et Standard** : le « Complex » (élastique, rebond) n'a pas sa place dans un tunnel d'achat.

## 6. Accessibilité (WCAG 2.2 AA, non négociable)

Contraste texte **4,5:1** · éléments d'interface **3:1** · cible tactile **44×44 px** · anneau de focus
visible (`2px brand-600` + décalage 2 px, **jamais supprimé**) · **aucune information portée par la seule
couleur** (le badge produit, la disponibilité et les erreurs ont tous un texte) · libellés de formulaire
au-dessus du champ, erreurs sous le champ.

## 7. Budget de performance (décision de design, pas de la technique seule)

| Ressource | Plafond |
|---|---|
| CSS (gzip) | **45 Ko** |
| JS (gzip) | **110 Ko**, dont GSAP **< 45 Ko** |
| HTML accueil (gzip) | **90 Ko** |
| Requêtes (accueil) | **60** |
| Images | **WebP/AVIF + `srcset` + dimensions explicites**, réserve d'espace (CLS < 0,05) |

**Zéro framework CSS** : tokens + utilitaires maison écrits à la demande + composants BEM.
Aucun composant « au cas où » : ce qui n'est pas utilisé n'est pas livré.
