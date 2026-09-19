# Vérification de l'étape 3 — `livraisons/etape-3-entete-navigation.html`

**Date de l'audit** : 19/09/2026 · **Auditeur** : Hermes · **Version auditée** : commit `e331a38`
(« Add files via upload ») · **Fichier** : 214 483 o (gzip 148 686 o), 496 lignes, 1 script embarqué

## Verdict : CONFORME ✅ (les six critères de la porte mesurés dans le navigateur)

| Critère de la porte | Mesure | |
|---|---|---|
| Le mot du logo est **lisible au repos** (logo ≥ 120 px) | Logo affiché **120 × 120 px** (image native 200 × 200). Le mot « Replicant » **se lit**, le « The » demande un temps d'arrêt → voir les réserves | ✅ |
| En mobile, le nom est **en texte** à côté de l'emblème | `span.brand-name` : `opacity: 1`, largeur **144 px** à 390 px **et** à 768 px, au repos comme au défilement | ✅ |
| La barre basse : **5 entrées libellées ET iconographiées**, cibles ≥ 44 px | **5 entrées** — Accueil · Catégories · Recherche · Panier · Compte — chacune **48 px** de haut, **5/5 avec icône SVG**, onglet actif marqué (`aria-current="page"`, encre `ink-900` contre `ink-700` pour les autres) | ✅ |
| Le méga-menu s'ouvre **au clavier** et montre **2 niveaux** sans clic | Ouverture au clavier (Enter puis clic) : `aria-expanded` passe de `false` à **`true`**, panneau visible ; **une colonne par univers** avec ses sous-catégories (Décoration, Textile d'intérieur, Coin cuisine, Bazar pour Maison) ; Échap pris en charge | ✅ |
| Les rayons tournent **lentement** (90-120 s) et **s'arrêtent** en `prefers-reduced-motion` | `animation: tourne-lente 100s linear infinite` ; sous `prefers-reduced-motion: reduce` → **`animation-name: none`** | ✅ |
| **Aucune animation** dans le reste de l'en-tête | **1 seul `@keyframes`** dans tout le fichier, et `@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}` | ✅ |

## Ce qui a été vérifié en plus

- **28 hexadécimaux, aucun hors de `tokens.json`**.
- **3 fonds chauds mesurés, 0 texte blanc dessus**.
- **0 ressource externe, 0 requête réseau** ; script embarqué de 5 141 caractères, **aucune bibliothèque**.
- **Anneau de focus** : tabulation réelle sur 10 éléments → **10 contour `2px solid`**, et l'ordre de tabulation est juste (emblème → les 5 univers → recherche → les sous-menus).
- **Aucun débordement** à 390, 768 et 1280 px.
- **Alignement vertical mesuré** : logo, navigation et recherche ont **tous leur centre à 158 px** (`align-items: center` tenu).
- **Le nom en texte est piloté proprement en CSS** : masqué au repos sur desktop (le mot est dans le logo 120 px), révélé au défilement (`.header-bar.compact`) et sous 1023 px. C'est exactement le comportement demandé par le prompt.
- **Annotations de zones paramétrables** : **11 étiquettes** visibles, nommant les champs back-office — dont les trois demandés : `menu_univers` + `menu_univers_ordre`, `barre_basse_entrees`, `univers_image_mise_en_avant` (une par univers), plus `footer_reassurance_1..3` et `newsletter_texte_legal`.
- **Pied de page** : univers, « La boutique », réassurance, newsletter avec mention légale, moyens de paiement, mentions légales / CGV / confidentialité / livraisons & retours.

## Réserves (finitions, à demander avec le dépôt de l'étape 4)

1. **Le « The » à l'intérieur du logo 120 px** se devine plus qu'il ne se lit (le « Replicant » est net). Le seuil mesuré est de 96 px : à 120 px c'est limite. Options : afficher le nom en texte dès le repos sur desktop, ou utiliser le verrou horizontal (bandeau) plutôt que l'emblème carré.
2. **Le texte de recherche est tronqué** en plein mot : `« Rechercher un cadeau, une réplique, une décoration… »` sur un champ de 246 px à 14 px → le visiteur lit « …une ré… ». À raccourcir.
3. **Le compteur de panier affiche « 0 »** dans la couleur de promotion : un badge à zéro attire l'œil pour rien. À masquer tant que le panier est vide.

## Méthode (rejouable)

Hauteur d'en-tête et taille de logo mesurées **avant et après défilement** ; visibilité du nom lue dans les styles calculés à trois largeurs ; méga-menu **ouvert au clavier** puis inspecté (niveau d'imbrication, nombre de liens) ; `prefers-reduced-motion` **émulé** par le protocole du navigateur pour vérifier l'arrêt réel de l'animation ; anneau de focus éprouvé par tabulation ; débordement mesuré à trois largeurs.
