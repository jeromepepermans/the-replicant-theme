# Vérification de l'étape 2 — `livraisons/etape-2-charte.md`

**Date de l'audit** : 19/09/2026 · **Auditeur** : Hermes · **Version auditée** : commit `7fecd3d`
(« Add files via upload ») · **Fichier** : 11 253 o, 99 lignes, 6 sections, 1 867 mots

## Verdict : CONFORME ✅

| Critère de la porte | Mesure | |
|---|---|---|
| Chaque couleur a un rôle **et un interdit mesuré** | **21 lignes de couleur**, dont **19 portent un interdit explicite**. 2 exceptions : `info-600` et `ink-700` (colonne « Interdit » = « — ») → voir les réserves | ✅ |
| La section « ce que nous ne faisons jamais » est explicite et non vide | **15 règles** en section 6, toutes prescriptives (logo, blanc sur jaune, rouge, noir du logo ≠ encre, rien d'inventé, texte de remplissage, rareté, modales, AI-slop, 12 px, espacements, couleur seule, focus, requêtes externes, polices dupliquées, tunnel) | ✅ |
| Aucun paragraphe de remplissage | Aucun paragraphe d'intention : **44 occurrences de « jamais »**, chaque section est un tableau de règles ou une liste de bornes | ✅ |

## Exactitude des faits — tout est vérifié, rien n'est cru sur parole

- **26 hexadécimaux**, **aucun hors de `tokens.json`**.
- **13 contrastes annoncés, 13 recalculés à l'identique** (tolérance 0,06) : `action-500` encre dessus
  11,83:1 · blanc sur `action-500` **1,30:1** · `action-600` encre dessus 9,08:1 · blanc sur `chaud-500`
  **2,50:1** · `chaud-700` 5,58:1 · `froid-700` 5,27:1 · `froid-600` 4,44:1 · `info-500` **3,95:1** ·
  `info-600` 4,77:1 · `danger-600` 6,22:1 · `ink-900` 15,34:1 · `ink-700` 10,02:1 · `ink-600` 6,07:1.
- **Les sources de données des badges sont les bonnes tables PrestaShop 8** : `specific_price.reduction`,
  `specific_price.to`, **`stock_available.quantity`** (et non `product_shop`), `product.date_add`.
- **Les polices variables sont actées** : une seule déclaration `@font-face` par famille avec la plage de
  graisses, et l'interdit correspondant figure explicitement dans la section 6 (« nous ne servons jamais
  deux fois le même fichier de police variable »).

## Mes trois réserves de l'étape 1 y sont devenues des règles

| Réserve de l'audit de l'étape 1 | Traitement |
|---|---|
| Valeurs d'espacement hors échelle | **Nommées une par une** en section 3 : « aucune autre valeur n'existe — ni `5`, `7`, `9`, `11`, `14`, `18`, `26` ni `34` px, même pour ajuster visuellement : c'est le composant qu'on recadre, jamais l'échelle qu'on contourne » |
| Micro-typographie trop petite | **Plancher étendu** : « aucun texte, y compris une légende, une annotation ou un code hexadécimal dans une planche de référence, ne descend sous 12 px » |
| (polices variables, ma correction en cours de route) | **Promue en règle** d'usage et en interdit |

## Réserves (aucune ne bloque la suite)

1. **Deux lignes sans interdit** : `info-600` (texte informatif, 4,77:1) et `ink-700` (texte secondaire,
   10,02:1). La règle générale de la section 1 (« toute couleur qui n'a pas de ligne ci-dessus n'existe pas
   dans ce système ») ferme le risque en pratique, mais la porte demande un interdit par couleur. Complément
   à demander à la prochaine étape :
   - `info-600` : « jamais en fond d'aplat de marque ni pour un état de succès » ;
   - `ink-700` : « jamais pour les mentions de plancher (`ink-600`) ni pour les prix (`ink-900`) ».
2. Le tableau de la section 4 cite `feedback-info-fond` / `feedback-info-texte` pour le badge « Bientôt de
   retour » : ces noms viennent bien des couleurs système ajoutées aux jetons, mais il faudra vérifier leur
   correspondance exacte au moment du développement.

## Méthode (rejouable)

Hexadécimaux extraits et comparés à `tokens.json` ; chaque contraste annoncé **recalculé** avec la formule
WCAG (luminance relative, seuil de tolérance 0,06) ; présence d'un interdit vérifiée ligne par ligne dans le
tableau ; sources de données comparées aux tables réelles de la boutique.
