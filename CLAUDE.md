# The Replicant — refonte du thème : contexte de travail

Ce dépôt est l'**espace de travail partagé** de la refonte du thème PrestaShop 8.2 de
**the-replicant.com**. Il est privé et appartient à la boutique.

## Qui travaille où

| Dossier | À quoi il sert | Ce qu'on en fait |
|---|---|---|
| `docs/design/` | **Le modèle de design** : le système, la palette, les polices, le logo, les maquettes de référence | On le **lit** et on s'y conforme. On n'y touche pas sans raison |
| **`livraisons/`** | **Là où se déposent les écrans produits** | C'est le dossier de sortie : un fichier par étape, voir `livraisons/README.md` |
| `outillage/`, `memoire.md`, `docs/preuves/` | L'exploitation du serveur et l'historique technique | **Ne pas y toucher** depuis un outil de design |

Le travail de design se fait **étape par étape**, dans l'ordre. Le mode opératoire complet est dans
`docs/prompts-claude-design.md` : dix étapes, chacune avec son prompt, son livrable et sa porte de
validation.

## Le système de design — à respecter dans CHAQUE écran

Ce qui suit est le contexte du projet. Il n'est pas à discuter ni à compléter : il est **mesuré** sur le
logo final et sur la boutique réelle.

```
Tu conçois la refonte du thème de la boutique **the-replicant.com** (PrestaShop 8.2, **français**, **mobile
d'abord**). Boutique de cadeaux **originaux et insolites**, tenue par une petite équipe. Le ton est
**chaleureux, direct, artisanal** — on parle à quelqu'un, pas à un « utilisateur ».

**Le logo est FINAL** : wordmark « The Replicant » en italique gras biseauté, explosion de rayons
orange/jaune et bleu/cyan, deux arcs, deux étoiles à quatre branches, des étincelles. PNG à fond
transparent. Je te le fournis ; **ne le redessine pas, ne le recadre pas, ne le recolore pas**.
Rappel mesuré : à moins de 96 px de haut, le mot « Replicant » **dans** l'image devient illisible — donc
quand l'emblème est petit, **le nom s'écrit en texte à côté**.

**Les couleurs — celles du logo, mesurées au pixel. N'en invente aucune d'autre :**
- action (bouton principal, éléments actifs) : **#fee300**, texte **encre** dessus (11,83:1)
- action survol : #e0c800 · action douce : #fff9d6
- promotion (bandeau, badge de remise, compteur de panier) : **#fe8200**, texte encre (6,14:1) ·
  variante claire #ffa500 (7,77:1) · texte orange sur blanc : #a35200
- décoration (soulignements, aplats — **jamais du texte**) : **#00f1fc** · version interface #00858b ·
  version texte #00787e
- information : #007ef6 / texte #0071dd · erreur : #c1121f (jamais pour autre chose qu'une erreur)
- encre : **#2b2419** (texte, prix, titres) · secondaire #4a4133 · mentions #6b6152
- surfaces : #ffffff, #faf8f5 (page), #f4f1ea (zones creuses) · bordures #e6e0d6
- **Sur le jaune et sur l'orange, le texte est TOUJOURS l'encre — jamais du blanc.**
- Le noir du logo (#0a0a0a) n'est pas l'encre de l'interface (#2b2419) : ne les confonds pas.

**Les polices** (auto-hébergées, deux graisses maximum) : **Montserrat 700/600** pour les titres — elle
fait écho au lettrage du logo — et **Source Sans 3 400/600** pour le corps. Échelle : 34 / 24 / 19 / 16 /
14 / 12 px, corps 16 px, interligne 1,6, **jamais moins de 12 px**. L'**italique** est réservé aux titres
promotionnels (≤ 5 % des titres), jamais au corps de texte.

**Le système** : espacements **multiples de 4** (4/8/12/16/24/32/48/64/96) · rayons 6 / 10 / 16 px ou
pastille (un seul rayon par famille de composant) · élévations très discrètes (3 niveaux, ombres à peine
visibles) · points de rupture 390 / 768 / 1024 / 1440, **aucune largeur fixe en px**.

**L'ambiance demandée : moderne, animée, avec un air de festivité.** Mais la festivité vient du **logo**
et du **bandeau promo**, jamais de la page entière. Autorisé : rotation très lente des rayons derrière le
logo (90-120 s), 3 à 5 étincelles scintillantes dans le bandeau, apparition douce des cartes produit (4 px),
rebond du compteur de panier (150 ms) — **tout en CSS/SVG, aucune bibliothèque**. Interdit : toute animation
**dans le tunnel de commande**, animation sur l'élément principal, décalage de mise en page, parallaxe, son,
vidéo automatique, plus d'un élément animé par bande visuelle. Et si le visiteur a demandé moins
d'animations (`prefers-reduced-motion`), **tout s'arrête**.

**Le poids est un critère de design**, pas une conséquence : CSS ≤ 45 Ko gzip, JS ≤ 110 Ko (GSAP < 45 Ko,
facultatif), accueil ≤ 90 Ko gzip, moins de 60 requêtes, images WebP/AVIF avec `srcset` et dimensions
explicites (CLS < 0,05). Pas de vidéo en fond, pas d'image plein écran lourde, pas de carrousel qui
télécharge 12 visuels.

**Accessibilité WCAG 2.2 AA** : contraste 4,5:1 pour le texte et 3:1 pour l'interface, cibles tactiles
44×44 px, anneau de focus visible jamais supprimé, **aucune information portée par la seule couleur**.

**Deux exigences de fond, à respecter sur CHAQUE écran :**
1. **Annonce l'archétype de surface** de l'écran que tu dessines : *Découvrir* (accueil, éditorial),
   *Explorer* (catégorie, recherche), *Comparer* (listing dense), *Configurer* (fiche produit, options),
   *Piloter* (panier, tunnel, compte).
2. **Annote chaque ZONE PARAMÉTRABLE** d'une étiquette portant **le nom exact du champ back-office** attendu
   (ex. « zone paramétrable : `titre_slide`, `visuel_slide`, `lien_slide`, `ordre` »). Ces annotations
   deviennent la spécification du module compagnon : c'est le livrable le plus important avec la maquette.

**Interdits explicites (AI-slop)** : dégradés bleu/violet, illustrations génériques de personnes
souriantes, ombres portées lourdes, coins arrondis partout, emojis en guise d'icônes, faux badges « ★ 4,9/5 »
inventés, textes de remplissage du type « Lorem ipsum » ou « Votre titre ici », compteurs ou rareté
fabriqués, fenêtres modales qui interrompent une action.

**Livrable attendu** : du **HTML autonome** (CSS et JS inclus dans le fichier, aucune requête externe, aucune
bibliothèque), responsive, avec un petit panneau « Tweaks » pour faire varier densité et rayons. Nomme le
fichier et dis-moi à quel écran il correspond.
```

## Les cinq règles de travail

1. **Une conversation par étape.** Un contexte trop long fait dériver les réponses.
2. **Ce contexte d'abord.** Toujours — sinon l'étape 7 ne ressemblera pas à l'étape 3.
3. **Une porte par étape.** Chaque étape a sa liste « à vérifier » : on ne passe à la suivante qu'une fois
   qu'elle est satisfaite, et on corrige **dans la même conversation**.
4. **Rien ne s'invente.** Ni couleur, ni police, ni chiffre flatteur : pas de note sans source, pas de
   compte à rebours sans date de fin réelle, pas de stock inventé, pas de faux prix barré.
5. **Annote, ne suppose pas.** Toute zone que la boutique doit pouvoir changer est annotée avec **le nom
   exact du champ attendu** en back-office. Ces annotations deviennent la spécification du thème :
   **le design est la spécification**.

## Où déposer ce que tu produis

- `livraisons/etape-N-nom.html` — un fichier **autonome** (CSS et JS inclus, **aucune requête externe**),
  un par étape, aux noms donnés dans `livraisons/README.md`.
- `livraisons/SUIVI.md` — à remplir : étape, date, qui a validé.

## Les pièces de référence

- `docs/design/tokens.json` — le système en données (couleurs, contrastes mesurés, polices, échelles).
- `docs/design/DESIGN.md` — pourquoi ces choix.
- `docs/design/maquettes/` — l'en-tête festif, la charte, et la planche du système de design.
- `docs/design/references/logo-final/` — le logo final dans toutes ses tailles (PNG et WebP).
- `docs/design/references/polices/` — les polices, auto-hébergées, avec leurs licences.
