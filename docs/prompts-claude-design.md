# Prompts — Claude Design de **The Replicant**

**Ce document est fait pour être remis tel quel** à qui travaille dans le compte Claude Design de la
boutique. Chaque prompt se colle sans nettoyage : pas de guillemets à retirer, pas de note à trier.

| | |
|---|---|
| **Compte destinataire** | Claude Design de **The Replicant** — le compte de la boutique, pas un compte personnel |
| **Source des valeurs** | `docs/design/tokens.json` **v0.3.0** + le logo final mesuré au pixel : rien ici n'est inventé |
| **Ce que ça produit** | dix étapes, de la fondation à la maquette cliquable, puis l'application mobile |
| **Durée d'une étape** | une conversation, un fichier, une validation |

---

## 0 · Avant la première conversation — une seule fois

1. **Vérifier le compte** en haut à droite : c'est bien celui de la boutique. Un projet par boutique, jamais
   deux boutiques dans la même conversation.
2. **Joindre le logo final** (`logo_Fond_transparent.png`, PNG fond transparent) : il ne se redessine pas,
   il s'insère.
3. **Si le compte dispose d'instructions de projet persistantes** : y coller le bloc de la section 2 **une
   fois pour toutes**. Les prompts de la section 3 s'y référeront sans le répéter.
4. **Sinon** : coller ce bloc **au début de chaque nouvelle conversation**, sans exception. C'est la seule
   discipline qui compte : sans lui, chaque étape repart de zéro et les écrans se contredisent.
5. **Où ranger les fichiers produits** : un dossier par étape, aux noms prévus par les prompts
   (`systeme-de-design.html`, `accueil.html`, …). Ils seront repris tels quels par le développement du thème.
6. **Cocher le suivi** (section 4) à chaque étape franchie, avec la date et qui a validé.

> **Rien de confidentiel là-dedans.** Ces prompts ne contiennent ni clé, ni identifiant, ni donnée client,
> ni information commerciale sensible : ils peuvent circuler librement dans un compte partagé.

---

## 1 · Les cinq règles qui font tenir l'ensemble

1. **Une conversation par étape.** Un contexte trop long fait dériver les réponses ; dix écrans dessinés
   dans la même conversation se ressemblent de loin et se contredisent de près.
2. **Le bloc de contexte d'abord.** Toujours. C'est lui qui garantit que l'étape 7 ressemble à l'étape 3.
3. **Une porte par étape.** Chaque étape a une liste « à vérifier » : on ne passe à la suivante que
   lorsqu'elle est satisfaite. Si un point ne passe pas, on corrige **dans la même conversation**.
4. **Rien ne s'invente.** Ni couleur, ni police, ni chiffre flatteur : pas de « ★ 4,9/5 » sans source, pas
   de compte à rebours sans date de fin réelle, pas de « plus que 2 en stock » fabriqué, pas de faux prix
   barré.
5. **Annote, ne suppose pas.** Toute zone que la boutique doit pouvoir changer est annotée **avec le nom du
   champ attendu** en back-office. Ce sont ces annotations qui deviendront la spécification du thème :
   **le design *est* la spécification**.

---

## 2 · Le bloc de contexte — à coller en premier, à chaque conversation

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

---

## 3 · Les dix étapes

### ÉTAPE 1 — Le système de design (la fondation : rien d'autre avant)

*Colle d'abord le bloc de contexte, puis :*

**Le prompt — à coller après le bloc de contexte :**

```
Étape 1 : construis le système de design de la boutique, et rien d'autre. Livre un seul fichier HTML autonome, « systeme-de-design.html », qui contient : 1. les variables CSS du système (couleurs, typographies, espacements, rayons, élévations, durées) — exactement les valeurs du bloc de contexte, sans en inventer ; 2. la palette complète affichée en pastilles, avec pour chacune son rôle et le contraste mesuré sur le fond où elle est censée vivre ; 3. l'échelle typographique complète, rendue avec les vraies polices ; 4. l'échelle d'espacement et les trois niveaux d'élévation, montrés en exemples ; 5. une planche de ~12 composants dans TOUS leurs états : bouton principal / secondaire / fantôme, survol, actif, désactivé, chargement ; champ de texte, champ en erreur (avec le message), case à cocher, choix multiple ; carte produit ; badge ; alerte ; fil d'Ariane ; pagination ; état vide. Montre chaque état, pas seulement l'état nominal.

Contraintes : HTML + CSS dans un seul fichier, aucune ressource externe (polices en base64), aucun framework. Annonce l'archétype de surface (« Piloter » pour une planche de système) et annote les zones paramétrables s'il y en a.
```

**Le livrable :** `systeme-de-design.html` : les variables, la palette affichée, l'échelle typographique, l'échelle d'espacement, les 3 élévations, ~12 composants dans tous leurs états.

**La porte de validation — on ne passe à l'étape suivante que si :**

- les valeurs de couleur sont **exactement** celles du bloc de contexte (vérifie chaque hexadécimal) ;
- le texte sur le jaune et sur l'orange est **encre**, jamais blanc ;
- chaque composant montre **au moins 3 états** (nominal, survol/focus, désactivé ou erreur) ;
- l'anneau de focus est visible partout ;
- le fichier ne fait **aucune** requête externe ;
- aucune ombre lourde, aucun dégradé décoratif, aucun arrondi excessif. **Tant que ce n'est pas validé, on ne dessine aucun écran.**

---

### ÉTAPE 2 — La charte écrite (pour que le système survive aux sessions suivantes)

**Le prompt — à coller après le bloc de contexte :**

```
Étape 2 : écris la charte du système, en français, dans un document « DESIGN.md » : les rôles de chaque couleur avec leur contraste et leurs interdits, la hiérarchie typographique, les règles d'espacement et d'élévation, les règles de badge, la direction d'animation (ce qui est autorisé, ce qui est interdit), et une section « ce que nous ne faisons jamais ». Sois prescriptif : ce document sert de référence à toutes les sessions suivantes, y compris à quelqu'un qui ne t'a pas parlé.
```

**Le livrable :** `DESIGN.md` : la charte, prescriptive, avec les interdits.

**La porte de validation — on ne passe à l'étape suivante que si :**

- chaque couleur a un rôle **et** un interdit mesuré ;
- la section « ce que nous ne faisons jamais » est explicite et non vide ;
- aucun paragraphe de remplissage : des règles, pas des intentions.

---

### ÉTAPE 3 — L'en-tête, la navigation et le pied de page

**Le prompt — à coller après le bloc de contexte :**

```
Étape 3 : dessine l'en-tête, la navigation et le pied de page, en trois largeurs (390, 768, 1280). Fichier « entete-navigation.html ».

Desktop : au **repos**, l'en-tête est **haut** et affiche le logo à **120 px de haut** — c'est le seul moyen que le mot « Replicant » soit confortablement lisible ; dès que l'on défile, il **se compacte à 72 px** (logo 56 px suivi du nom en texte). Univers au centre (3 chemins maximum jusqu'à un produit), recherche toujours visible avec suggestions, compte, panier avec compteur.

Méga-menu : une colonne par univers, **2 niveaux visibles sans clic**, ouvrable au survol **et au clavier**, image de mise en avant optionnelle par univers.

Mobile : en-tête collant de **56 px** (logo carré 56 px **suivi du nom en texte**), recherche en icône qui ouvre un champ plein écran, **barre basse de 5 entrées de 48 px** — Accueil · Catégories · Recherche · Panier · Compte — **libellées ET iconographiées**, jamais d'icône seule, onglet actif marqué.

Pied de page : plans de site, réassurance, newsletter, moyens de paiement, mentions.

Les rayons du logo tournent très lentement (90 s) derrière lui : c'est la seule animation de l'en-tête. Annote les zones paramétrables (univers et ordre, entrées de la barre basse, image par univers).
```

**Le livrable :** `entete-navigation.html` : l'en-tête desktop au repos (logo 120 px) et compact, l'en-tête mobile, la barre basse, le méga-menu ouvert, le panneau de recherche, le panier latéral, le pied de page.

**La porte de validation — on ne passe à l'étape suivante que si :**

- le mot du logo est **lisible** dans l'état au repos (logo ≥ 120 px) ;
- en mobile, le nom est **en texte** à côté de l'emblème ;
- la barre basse a **5 entrées libellées ET iconographiées**, cibles ≥ 44 px ;
- le méga-menu s'ouvre **au clavier** et montre 2 niveaux sans clic ;
- les rayons tournent **lentement** (90-120 s) et **s'arrêtent** en `prefers-reduced-motion` ;
- aucune animation dans le reste de l'en-tête.

---

### ÉTAPE 4 — La page d'accueil

**Le prompt — à coller après le bloc de contexte :**

```
Étape 4 : dessine la page d'accueil complète. Fichier « accueil.html ».

Ordre des bandes : ① **grand slider** en haut (3 à 5 visuels, plein largeur, léger : un seul visuel chargé à la fois, pas de vidéo) ; ② **bandeau promo festif** — c'est la seule bande vraiment animée : dégradé orange du logo, 3 à 5 étincelles scintillantes, message et bouton jaune à texte encre, fermable ; ③ **catégories mises en avant** (grille de vignettes) ; ④ **sections produits** « Nouveautés » / « Sélection du moment » / 2ᵉ sélection, avec cartes produit et badge selon les règles ; ⑤ **réassurance** (livraison, paiement, SAV) ; ⑥ bloc éditorial court qui renvoie au blog.

Le tout doit être paramétrable depuis le back-office — c'est la contrainte de Jérôme : visuels, textes, ordre, dates, activation, nombre de colonnes, source des produits. Propose d'abord **2 directions de composition** (une prudente, une plus affirmée) et attends mon choix avant de finaliser. Annonce l'archétype (« Découvrir ») puis annote toutes les zones paramétrables avec le nom du champ attendu.
```

**Le livrable :** `accueil.html` : la page complète, plus 2 directions de composition proposées avant finalisation.

**La porte de validation — on ne passe à l'étape suivante que si :**

- le slider ne charge **qu'un** visuel à l'écran (poids) ;
- **une seule** bande animée (le bandeau promo), le reste est calme ;
- chaque bande de la page porte **ses annotations de champs back-office** ;
- les badges des cartes suivent les règles (2 maximum, priorité, texte) ;
- la page tient en **≤ 90 Ko gzip** : dis-moi le poids estimé.

---

### ÉTAPE 5 — Le catalogue (catégorie, recherche, filtres)

**Le prompt — à coller après le bloc de contexte :**

```
Étape 5 : dessine le catalogue : page catégorie, résultats de recherche et panneau de filtres. Fichier « catalogue.html ». Archétype : « Explorer » sur la catégorie, « Comparer » quand la liste se densifie.

Grille de produits responsive, tri visible, filtres dans un panneau dédié en mobile (avec compteur de résultats et bouton « Voir les N produits » toujours visible), fil d'Ariane, pagination ou chargement progressif — dis-moi ce que tu recommandes et pourquoi. Chaque carte : visuel, nom, prix TTC, disponibilité, badges (2 maximum), **ajout au panier sans ouvrir la fiche** quand le produit est simple, et favori. Les états vides et les résultats nuls sont dessinés aussi (recherche sans résultat, filtre trop étroit).
```

**Le livrable :** `catalogue.html` : la catégorie, la recherche, le panneau de filtres, la carte produit dans 4 états (normal, promo avec compte à rebours, épuisé, derniers exemplaires).

**La porte de validation — on ne passe à l'étape suivante que si :**

- l'ajout au panier est possible **depuis la carte** ;
- **deux badges maximum** par carte, priorité respectée ;
- les filtres montrent le **compteur de résultats** en permanence ;
- l'état vide propose une **action**, pas seulement un message ;
- aucun défilement horizontal, aucune largeur fixe.

---

### ÉTAPE 6 — La fiche produit

**Le prompt — à coller après le bloc de contexte :**

```
Étape 6 : dessine la fiche produit. Fichier « fiche-produit.html ». Archétype : « Configurer ».

Galerie (image principale + miniatures, zoom, changement d'image sans rechargement — et un emplacement réservé pour **l'étiquette « Généré par l'IA »** que le module de métadonnées injecte : réserve-lui une zone dans la galerie **et** sur les vignettes, sans la styliser toi-même, c'est le module qui décide)

Titre, prix TTC, disponibilité réelle, sélecteur d'options (couleur, taille) avec indisponibilités claires, quantité, **Ajouter au panier** (fond jaune, texte encre), réassurance livraison, description, caractéristiques, avis, produits complémentaires.

Les badges de la fiche : remise et compte à rebours s'il y a une date de fin réelle, épuisé le cas échéant — jamais plus de deux, jamais de rareté inventée.
```

**Le livrable :** `fiche-produit.html` : la fiche complète, avec les emplacements réservés au badge IA, dans les états normal / en promotion / épuisé.

**La porte de validation — on ne passe à l'étape suivante que si :**

- l'emplacement du **badge IA** est réservé (galerie + vignettes) et **non stylisé** : le module le remplit ;
- les options indisponibles sont **lisibles sans couleur seule** ;
- les frais de port ou le seuil de livraison gratuite sont **visibles sur la fiche** ;
- la fiche reste utilisable **sans JavaScript** pour l'achat (progression serveur).

---

### ÉTAPE 7 — Le panier et le tunnel (le cœur du brief)

**Le prompt — à coller après le bloc de contexte :**

```
Étape 7 : dessine le panier et le tunnel de commande. Fichier « tunnel.html ». Archétype : « Piloter ». Objectif mesurable : **un client qui sait ce qu'il veut achète en moins de 60 secondes, sans compte**.

Panier latéral : modification de quantité et lancement de la commande sans quitter la page. **Commande invité par défaut**, la création de compte est proposée **après** la commande. **4 écrans maximum**, progression toujours visible, retour arrière possible partout. **Frais de port affichés dès le panier**, jamais de surprise au dernier écran. Transporteurs et moyens de paiement **au même niveau**, adresse en autocomplétion. Aucun compte à rebours, aucun popup, aucune inscription forcée à la newsletter, aucune animation — **le tunnel est la seule zone totalement statique du site**.

Dessine aussi l'état panier vide et l'état erreur de paiement (que faire, qui contacter, comment réessayer).
```

**Le livrable :** `tunnel.html` : le panier latéral, les 4 écrans, la confirmation, le panier vide, l'erreur de paiement.

**La porte de validation — on ne passe à l'étape suivante que si :**

- **4 écrans maximum**, progression visible, retour possible ;
- commande invité **par défaut**, création de compte **après** ;
- frais de port dès le panier ;
- **aucune animation, aucun popup, aucun compte à rebours** dans le tunnel ;
- l'erreur de paiement dit **quoi faire**, pas seulement « erreur ».

---

### ÉTAPE 8 — Le compte particulier et l'espace professionnel

**Le prompt — à coller après le bloc de contexte :**

```
Étape 8 : dessine le compte particulier et l'espace professionnel. Fichier « comptes.html ».

Particulier : connexion, création de compte, mot de passe oublié, tableau de bord simple (commandes, adresses, informations), page commande.

Professionnel : une **page de présentation** des conditions pro, un **formulaire de demande** (raison sociale, SIRET, TVA intracommunautaire, contact, volume estimé), l'**écran d'attente** après envoi, l'e-mail de validation, puis l'**écran back-office de validation** pour l'employé — avec **valider ou refuser avec motif obligatoire** et un journal des actions. Le tarif pro est porté par le **groupe client** : **aucune logique de prix dans le design**, on ne dessine que le parcours.
```

**Le livrable :** `comptes.html` : l'espace particulier, le formulaire pro, l'écran d'attente, l'écran de validation employé.

**La porte de validation — on ne passe à l'étape suivante que si :**

- **aucun prix ni pourcentage** dans les écrans pro : le groupe client s'en charge ;
- le refus exige un **motif** et l'écran le dit clairement ;
- les deux parcours (particulier / pro) sont **visuellement distincts** sans être deux sites ;
- les erreurs de formulaire sont annoncées **et** décrites (jamais la couleur seule).

---

### ÉTAPE 9 — Les contenus, les états et les pages annexes

**Le prompt — à coller après le bloc de contexte :**

```
Étape 9 : dessine les pages de contenu et tous les états de bord. Fichier « contenus.html ». Le blog est un module externe : il doit s'intégrer **sans casser le design** (liste d'articles, article, catégories, commentaires).

Pages : blog (liste + article), pages éditoriales (livraison, paiement, retours, mentions, CGV, confidentialité), contact, plan du site, page 404, maintenance, newsletter.

États : page 404 utile (elle propose des chemins, pas seulement un message), recherche sans résultat, produit désactivé, panier vide, erreur serveur, chargement (squelettes), hors-ligne, images manquantes.
```

**Le livrable :** `contenus.html` : le blog, l'article, les pages éditoriales, la 404, le contact, et la planche des états.

**La porte de validation — on ne passe à l'étape suivante que si :**

- le blog **épouse** le système de design (mêmes composants, mêmes espacements) ;
- la 404 et la recherche vide **proposent des chemins** (catégories, best-sellers, contact) ;
- chaque état de chargement/erreur a son dessin ;
- aucun texte de remplissage du type « Lorem ipsum » : écris du **vrai** français.

---

### ÉTAPE 10 — Le prototype cliquable et l'app mobile

**Le prompt — à coller après le bloc de contexte :**

```
Étape 10a : assemble un **prototype cliquable** du parcours d'achat — accueil → catégorie → fiche → panier → tunnel → confirmation — en HTML, avec de vraies transitions entre écrans et les données d'un produit réel. C'est le livrable que je ferai tester.

Étape 10b (plus tard) : l'app mobile. Pour l'instant, dessine seulement l'écran d'accueil de l'app et la fiche produit, en réutilisant **les mêmes jetons** — l'app partagera le système, pas un nouveau.
```

**Le livrable :** Un prototype cliquable, puis deux écrans d'app mobile sur les mêmes jetons.

**La porte de validation — on ne passe à l'étape suivante que si :**

- le parcours complet se fait **sans repasser par une page inutile** ;
- le prototype fonctionne **hors ligne** (fichier unique, aucune requête externe) ;
- les jetons sont **les mêmes** dans l'app : le design n'est pas dupliqué.

---

## 4 · Suivi

| # | Étape | Fichier attendu | Fait le | Validé par | Verdict |
|---|---|---|---|---|---|
| 1 | Le système de design | `systeme-de-design.html` | | | |
| 2 | La charte écrite | `charte.html` | | | |
| 3 | En-tête, navigation, pied de page | `entete-navigation.html` | | | |
| 4 | La page d'accueil | `accueil.html` | | | |
| 5 | Le catalogue | `categorie.html` | | | |
| 6 | La fiche produit | `fiche-produit.html` | | | |
| 7 | Panier et tunnel | `panier-tunnel.html` | | | |
| 8 | Les comptes (particulier et professionnel) | `comptes.html` | | | |
| 9 | Contenus et états de bord | `contenus-pages.html` | | | |
| 10 | Prototype cliquable, puis l'application mobile | `prototype-cliquable.html` | | | |

*Le tableau se remplit à la main : c'est la seule trace de ce qui a été fait, et par qui.*
