# Vérification de l'étape 1 — `livraisons/etape-1-systeme-de-design.html`

**Date de l'audit** : 19/09/2026 · **Auditeur** : Hermes · **Version auditée** : commit `1077a26`
(« Add files via upload ») · **Fichier** : 123 765 o (gzip 81 550 o), 277 lignes, autonome

## Verdict : CONFORME ✅

Les six critères de la porte de l'étape 1, mesurés — pas estimés.

| Critère de la porte | Mesure | |
|---|---|---|
| Les couleurs sont **exactement** celles du contexte | 38 hexadécimaux dans le fichier ; **1 seul hors jetons**, `#fff` (= `#ffffff`, présent dans les jetons). Les 15 pastilles affichent **nom, hexadécimal et contraste identiques à `tokens.json`** : `action-500 #fee300` 11,83:1 · `action-600 #e0c800` 9,08:1 · `action-100 #fff9d6` 14:1 · `chaud-500 #fe8200` 6,14:1 · `chaud-clair #ffa500` 7,77:1 · `chaud-700 #a35200` 5,58:1 · `froid-500 #00f1fc` 1,40:1 ⛔ · `froid-700 #00787e` 5,27:1 · `froid-100 #e6fbfd` 14,3:1 · `info-600 #0071dd` 4,77:1 · `danger-600 #c1121f` 6,22:1 · `ink-900 #2b2419` 15,34:1 · `ink-600 #6b6152` 6,07:1 | ✅ |
| Le texte sur le jaune et l'orange est **encre**, jamais blanc | 16 fonds chauds mesurés sur les styles calculés, **0 texte blanc** | ✅ |
| Chaque composant montre **au moins 3 états** | boutons : 7 règles d'état (`:hover`, `:active`, `[disabled]`, chargement) · champs : 3 (`:focus`, `.err`, `[disabled]`) · carte produit : survol + **4 variantes** (nominale, promo + compte à rebours, derniers exemplaires, épuisée) · 8 badges · 4 niveaux d'alerte | ✅ |
| **Anneau de focus** visible partout | tabulation réelle dans le navigateur : 6 éléments atteints, chacun avec un contour `2px solid` | ✅ |
| **Aucune requête externe** | 0 ressource externe, **0 requête réseau**, polices embarquées dans le fichier | ✅ |
| Pas d'ombre lourde, pas de dégradé décoratif, pas d'arrondi excessif | **1 seule ombre**, `var(--el2)` ; rayons et ombres **uniquement par jetons** ; 2 dégradés, tous deux fonctionnels (fond de vignette, scintillement de chargement) | ✅ |

## Contenu demandé par le prompt — les 12 composants

Tous présents : bouton principal (12) / secondaire (9) / fantôme (3), survol, appui, désactivé (4),
chargement, champ de texte (5), champ en erreur, case à cocher, choix multiple, carte produit (4 états),
**8 badges** (dont `−20 %` et **`−3 €`**, la valeur réelle de la remise), 4 alertes, fil d'Ariane,
pagination, état vide. Échelle typographique, échelle d'espacement et **3 niveaux d'élévation** montrés.
Archétype annoncé : **« Piloter »**, avec la mention juste qu'« aucune zone n'y est paramétrable depuis le
back-office » — une planche de système n'est pas un écran de boutique, c'est correct.

## Points vérifiés en plus de la porte

- **Polices variables** : 2 `@font-face` seulement, `Montserrat 600 700` et `Source Sans 3 400 600`, embarquées
  en base64 (49 Ko + 37 Ko) — la consigne passée à Claude Design a été suivie.
- **Accessibilité** : la coche des cases utilise `rgb(163, 82, 0)` = `chaud-700` (**5,58:1**) — la faute
  relevée sur ma propre planche de contrôle (orange du logo à 2,50:1, sous le seuil de 3:1) **n'est pas
  reproduite**.
- **Poids** : CSS hors polices ≈ 11 Ko (gzip ≈ 2 Ko) — très en dessous du budget de 45 Ko.
- **Interdits AI-slop** : 0 note inventée, 0 texte de remplissage, 0 dégradé bleu/violet, 0 couleur nommée.
  Les 19 caractères signalés automatiquement sont des **repères typographiques** (✓ ×13 pour les contrastes,
  ♡ ×4 sur le bouton favori, ✕ et ⛔ dans les alertes et les mises en garde) — **aucun emoji**.
- **Aucun débordement** horizontal à 390, 768 et 1060 px.

## Réserves à porter à l'étape 2 (aucune ne bloque)

1. **La grille de la planche** laisse une pastille seule sur la dernière rangée (groupes de 3 et de 5) —
   cosmétique, mais c'est le genre de détail qui trahit une grille non maîtrisée.
2. **Micro-typographie** des annotations (codes hexadécimaux, ratios) très petite : lisible à l'écran, un
   peu juste à l'impression.
3. **Valeurs d'espacement hors échelle** (`5`, `7`, `9`, `11`, `14`, `18`, `26`, `34` px) alors que la règle
   demande des multiples de 4. Elles proviennent en grande partie de **ma planche de contrôle**, reprise
   comme référence : à resserrer au moment de la charte écrite.
4. Les pastilles très claires (`#faf8f5`, `#e6e0d6`) se distinguent surtout par la bordure de leur carte.

## Méthode

Audit reproductible : fidélité des couleurs contre `tokens.json` (extraction des hexadécimaux), contrastes
relus **dans le DOM rendu** (pas dans le source) pour éviter de se fier à une lecture approximative,
polices chargées via `document.fonts`, anneau de focus éprouvé **par tabulation réelle**, requêtes réseau
comptées par `performance.getEntriesByType('resource')`, débordement mesuré à trois largeurs.
