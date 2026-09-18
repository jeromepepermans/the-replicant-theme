# memoire.md — mémoire technique du chantier « refonte du thème the-replicant.com »

> Mémoire tenue **pendant** le développement, mise à jour après chaque modification significative.
> Décisions : `DECISION-xxx`. Bugs : `BUG-xxx`. Chaque commit est accompagné d'un CR BDC.

**Dernière mise à jour** : 17/09/2026

---

## 1. Contexte

| | |
|---|---|
| Projet | Refonte du thème de **the-replicant.com** (PrestaShop 8.2, boutique de cadeaux originaux) |
| Client | Jérôme (SARL Hécate) — boutique en production, exploitation continue |
| Hébergement | o2switch, compte cPanel `djdj2187` (serveur `nilgaut`), `~/the-replicant.com` + `~/preprod.the-replicant.com` |
| Base | MariaDB locale `djdj2187_pab` (préprod : base séparée) |
| Dépôt | `the-replicant-theme` (privé, compte GitHub `jeromepepermans`) |
| Méthode | AUDITER AVANT DE CONCEVOIR · préprod avant prod · 1 commit = 1 CR BDC |

---

## 2. Décisions

### DECISION-001 — Nouveau thème autonome, pas un thème enfant
- **Date** : 17/09/2026 · **Sujet** : base technique du thème
- **Décision** : créer un thème PrestaShop 8.2 **autonome** nommé `replicant`, sur hooks natifs, sans
  Bootstrap, sans jQuery dans le thème.
- **Pourquoi** : le thème sortant (`warehouse`) pèse 1,41 Mo de HTML, 142 Ko de CSS compressé, 398 Ko de
  JS, et traîne FontAwesome complet + IQIT Elementor + Revolution Slider. Un thème enfant hériterait de
  ce poids et de ces dépendances.
- **Alternatives écartées** : thème enfant du Warehouse ; transformation du thème Classic PS 8.
- **Impact** : tout est à écrire (templates, hooks, compatibilité modules tiers) ; la compatibilité des
  modules est assurée par des feuilles `compat/<module>.css`, pas par des surcharges de templates.

### DECISION-002 — Module compagnon `replicanttheme` pour toute la page d'accueil
- **Date** : 17/09/2026 · **Sujet** : contenu éditorial de l'accueil
- **Décision** : slides, bandeau promo, catégories mises en avant et sections produits sont gérés par un
  module back-office **maison**, entièrement paramétrable (visuels, textes, ordre, dates de diffusion,
  activation, colonnes, source produits).
- **Pourquoi** : exigence explicite du client (« tout doit être paramétrable depuis le back-office ») ;
  supprimer Revolution Slider + IQIT Elementor allège le front et supprime deux dépendances commerciales.
- **Alternatives écartées** : réutiliser Revolution Slider / IQIT Elementor ; montage mixte.
- **Impact** : le design doit annoter ses zones paramétrables avec les noms de champs du module ;
  contrainte technique : 1 requête SQL par section, jamais de N+1.

### DECISION-003 — Validation des comptes professionnels par un employé
- **Date** : 17/09/2026 · **Sujet** : parcours pro
- **Décision** : le formulaire pro crée un compte **en attente** ; le groupe client « Professionnel »
  n'est appliqué qu'après **validation manuelle** par un employé, depuis un écran back-office dédié
  (valider / refuser avec motif obligatoire, journal des actions).
- **Pourquoi** : décision du client ; permet un contrôle humain du SIRET/TVA sans dépendre d'une API
  tierce payante.
- **Alternatives écartées** : demande sans création de compte ; vérification automatique par API.
- **Impact** : créer le groupe client, un statut de compte, des e-mails transactionnels, un écran BO.

### DECISION-004 — Le thème prévoit le badge IA (AI Act)
- **Date** : 17/09/2026 · **Sujet** : intégration du module `aimetadata`
- **Décision** : emplacements réservés pour la mention « Généré par l'IA » dans la galerie, les vignettes
  et la fiche produit, alimentés par le hook du module — jamais par du contenu en dur dans le thème.
- **Pourquoi** : décision du client ; le module est un **service de métadonnées**, le badge n'en est
  qu'une représentation. Le thème ne doit donc pas connaître la table SQL.
- **Impact** : à vérifier en phase 0 si le module est installé en boutique et sous quel hook il rend son
  badge ; sinon prévoir l'emplacement et l'adaptateur côté thème.

### DECISION-005 — Préprod obligatoire, production intouchée
- **Date** : 17/09/2026 · **Sujet** : environnement de travail
- **Décision** : tout développement et toute recette se font sur la préprod ; la production ne reçoit que
  des bascules validées, avec sauvegarde préalable et kill-switch de retour au thème précédent.
- **Pourquoi** : la production tourne en continu (crons marketplaces toutes les minutes, ~80 commandes/jour,
  newsletter le jeudi) — une purge de cache ou un thème cassé coûte des ventes.

### DECISION-007 — Le tunnel existant est d'abord audité, pas réécrit
- **Date** : 17/09/2026 · **Sujet** : tunnel de commande
- **Décision** : la phase 4 ne s'engage pas sur l'écriture d'un tunnel. L'audit a établi que
  **`ets_onepagecheckout` 2.8.6 est déjà actif** (commande sur une page, invité, captcha, autofill,
  connexion sociale) avec **Monetico (CMCIC), Alma, PayPal (`ps_checkout`) et virement** comme moyens de
  paiement. La question devient : **habiller/paramétrer l'existant** ou **le remplacer** — arbitrage à
  obtenir de Jérôme, chiffré, avant d'écrire une ligne.
- **Pourquoi** : règle « AUDITER AVANT DE CONCEVOIR » ; réécrire un tunnel tiers payant déjà en production
  serait du travail en double avec un risque élevé sur les paiements.
- **Impact** : phase 4 révisée ; le design du tunnel devra habiller les gabarits du module, pas les inventer.

### DECISION-008 — La préproduction n'est pas fiable en l'état
- **Date** : 17/09/2026 · **Sujet** : environnement de recette
- **Décision** : constat, pas choix — la préprod sert le thème **`warehousechild`** quand la production sert
  **`warehouse`**, et elle a **14 modules actifs en moins** (dont `MoneticoPaiement`, `alma`, `ps_checkout`,
  `ets_onepagecheckout`, `ets_awesomeurl`). **Aucune recette faite dessus n'est probante** pour le tunnel,
  le paiement, le SEO ou la compatibilité modules.
- **À faire** : soit rafraîchir la préprod depuis la production (opération à cadrer : dump, sauvegardes,
  fenêtre), soit construire un **sandbox** hors du compte (le VPS a 1,6 To libres, PHP 8.1, MariaDB,
  Redis, Imagick, pas de Node). Arbitrage à obtenir.
- **Impact** : tant que ce point n'est pas tranché, les tests de tunnel et de paiement ne peuvent pas être
  considérés comme concluants.

### DECISION-009 — L'écosystème IQIT doit être tranché module par module
- **Date** : 17/09/2026 · **Sujet** : périmètre réel du thème
- **Décision** : avant de coder le thème, établir pour chacun des **23 modules IQIT actifs** (+ `revsliderprestashop`)
  s'il est **conservé** (et alors ses hooks doivent être câblés dans le nouveau thème), **remplacé** par le
  module compagnon, ou **désactivé**.
- **Pourquoi** : ces modules écrivent dans les pages du thème (`displayProductAdditionalInfo`,
  `displayProductExtraContent`, `displayAfterProductThumbs`, `displayProductListFunctionalButtons`,
  `displayProductPriceBlock`…). « Thème léger » sans trancher leur sort est un objectif inatteignable.
- **Impact** : c'est l'arbitrage qui conditionne l'essentiel du gain de poids et une partie du design.

### DECISION-010 — Le tunnel est réécrit, après décorticage de l'existant
- **Date** : 17/09/2026 · **Sujet** : tunnel de commande (remplace DECISION-007)
- **Décision** : construire un tunnel maison à la place de `ets_onepagecheckout`, **mais lire d'abord le module
  pour récupérer ce qui fonctionne** (règles de calcul des frais, champs réellement collectés, cas limites
  de commande invité, interaction avec Monetico / Alma / PayPal, gestion des erreurs de paiement).
- **Pourquoi** : décision de Jérôme (tunnel court, maison, peu de modules) ; le module est une **référence de
  comportement** — on reprend les règles, jamais le code.
- **Impact** : le module tiers n'est désactivé qu'après recette du tunnel maison sur la préprod ; les 4 moyens
  de paiement doivent rester fonctionnels (chacun a ses hooks et son retour de paiement).

### DECISION-011 — Le minimum de modules, et tout ce qui peut l'être est paramétré depuis le thème
- **Date** : 17/09/2026 · **Sujet** : périmètre fonctionnel (remplace DECISION-009)
- **Décision** : objectif « **le moins de modules externes possible** ». Tout ce qui est paramétrable depuis le
  thème l'est (accueil, bandeau, catégories, sections produits, réglages du thème). Chaque module tiers
  conservé doit être **justifié explicitement** ; le socle IQIT (23 modules) est traité comme un ensemble à
  démonter un par un, en réintégrant ce qui est utile **dans le thème ou le module compagnon**.
- **Pourquoi** : exigence de Jérôme ; c'est aussi la seule façon d'atteindre le budget de performance.
- **Impact** : sortie programmée de `iqitthemeeditor`, `iqitelementor`, `revsliderprestashop` et des modules
  IQIT de vitrine ; les fonctions conservées (recherche, wishlist, avis, variantes) deviennent soit du
  paramétrage du thème, soit des modules réécrits côté `replicanttheme`.

### DECISION-012 — Remise à niveau de la préprod depuis la production, modules de prod laissés inactifs
- **Date** : 17/09/2026 · **Sujet** : environnement de recette (résout DECISION-008)
- **Décision** : la préproduction est **remise à l'identique de la production** (fichiers **et** base) pour
  disposer d'une base de travail propre et à jour ; **les modules de production sont laissés inactifs sur la
  préprod** afin d'écarter tout conflit (aucun cron ne doit tirer sur les marketplaces, le paiement ou l'e-mail
  depuis la préprod). Le développement du thème se fait **uniquement** sur la préprod ; la production ne reçoit
  le thème qu'après validation.
- **Décision complémentaire** : **sauvegarde complète (fichiers + base) de la préprod existante effectuée
  avant** la remise à niveau.
- **Pourquoi** : décision de Jérôme ; la préprod actuelle ne prouve rien (DECISION-008).
- **Impact** : opération à cadrer (dump de la base de prod, distance, durée, espace disque, vérification
  après restauration) ; cette opération est la **première action technique du chantier**.

### DECISION-013 — WebP servi par le thème, et diagnostic du cron de backfill
- **Date** : 17/09/2026 · **Sujet** : images
- **Décision** : le thème sert du **WebP** (avec repli et `srcset`). En parallèle, le cron « backfill WebP » est
  **diagnostiqué et réparé** (il sort aujourd'hui sans rien produire : **0 fichier `.webp` pour 216 997 JPEG**).
- **Pourquoi** : décision de Jérôme ; les deux mécanismes sont complémentaires (bibliothèque existante côté
  serveur, chargement ciblé côté thème).

### DECISION-014 — Professionnels : le tarif est porté par le groupe client, le chantier livre le parcours
- **Date** : 17/09/2026 (révisée) · **Sujet** : parcours B2B (complète DECISION-003)
- **Décision** : **aucune logique de prix à développer**. Les conditions pro (prix **HT**, remise) sont
  **portées par le groupe client**, comme le font déjà les groupes existants (`5 As Import` en HT,
  `10 Ami(e)` à -20 %). Le chantier livre **le parcours** : un **formulaire d'inscription professionnel**,
  la création du compte **en attente**, la **validation manuelle par un employé** en back-office, l'e-mail
  de confirmation ou de refus, et la bascule dans le groupe.
- **Pourquoi** : décision de Jérôme — « tout est géré par le groupe client, donc on n'y touche pas ».
- **Impact** : le thème et le module compagnon **n'affichent** qu'un état (client pro validé ou non) et ne
  calculent **aucun** prix pro. Le module d'inscription reste simple, testable, sans dépendance au commerce.

### DECISION-015 — L'app mobile est un canal de commande
- **Date** : 17/09/2026 · **Sujet** : app mobile (phase 9)
- **Décision** : l'app mobile ne sera pas un catalogue : elle doit **permettre de passer commande**. L'accès
  à l'API devient donc structurant : **webservice PrestaShop** en 8.2, **Admin API** (API Platform) en 9.x.
- **Pourquoi** : décision de Jérôme.
- **Impact** : le tunnel maison et le module compagnon doivent exposer des **points d'entrée API** (panier,
  client, commande, paiement) dès leur conception — sinon l'app devra réinventer le tunnel.

### DECISION-016 — Trajectoire PrestaShop 9 : conventions Hummingbird dès maintenant
- **Date** : 17/09/2026 · **Sujet** : évolutivité du thème
- **Décision** : écrire le thème selon les **conventions de la référence Hummingbird** (BEM, SCSS modulaire
  avec `@layer`, attributs `data-ps-*`, **zéro jQuery** dans le thème, accessibilité d'abord, héritage de
  gabarits Smarty) pour que la bascule vers 9.1/9.2 soit un **port**, pas une réécriture.
- **Pourquoi** : aucun thème Hummingbird n'est compatible à la fois avec 8.2.3 et 9.1+ (compatibilités
  verrouillées par version) ; `1.x` (compatible 8.x) **n'est plus maintenu**, `2.x` cible 9.2.
- **Impact** : voir `docs/dev-theme-prestashop.md` (voie A/B/C, recommandation B) et la page de bascule à
  écrire, `docs/theme-9-migration.md`.

### DECISION-017 — Le plus léger possible : aucun framework CSS, architecture modulaire maison
- **Date** : 17/09/2026 · **Sujet** : base technique du thème (précise DECISION-001)
- **Décision** : **zéro framework CSS** (ni Bootstrap, ni équivalent). Le thème est bâti sur des **tokens**
  (custom properties), une petite couche d'utilitaires maison écrite à la demande, et des **composants
  modulaires** (BEM) chargés par page plutôt qu'une feuille monolithique unique.
- **Pourquoi** : réponse de Jérôme — « le plus léger, mais évolutif et modulable ». Un framework complet
  embarque des dizaines de Ko de règles non utilisées : première cause d'écart au budget de poids.
- **Impact** : chaque composant utilisé doit exister dans notre code (coût d'écriture assumé) ; la
  « modulabilité » vient de la structure des feuilles/composants et du module compagnon, pas d'un framework.
  Les conventions Hummingbird restent respectées (BEM, `@layer`, `data-ps-*`) pour l'évolutivité.

### DECISION-018 — Bascule vers PrestaShop 9 en 2027 : objectif daté
- **Date** : 17/09/2026 · **Sujet** : trajectoire de version
- **Décision** : Jérôme fixe la bascule vers **PrestaShop 9 l'année prochaine (2027)**. Le thème est écrit
  dès maintenant selon les conventions de la référence Hummingbird, et un **plan de bascule** est tenu à
  jour (`docs/theme-9-migration.md`).
- **Conséquences à traiter dès cette année** :
  - monter la boutique de **8.2.3 → 8.2.8** (dernier patch de la branche, publié le 18/08/2026) ;
  - écrire le **module compagnon « compatible 9 »** (aucune dépendance retirée en 9.0, services Symfony
    propres, ni `guzzle`, ni `SwiftMailer`) ;
  - **ne rien ajouter** qui dépende des modules appelés à disparaître (écosystème IQIT, Revolution Slider) ;
  - tenir à jour la doc de bascule : `override/` à traiter, matrice Hummingbird, passage à Hummingbird 2.x
    (9.2), Admin API pour l'app mobile.
- **Pourquoi** : une bascule se prépare un an à l'avance ; c'est ce qui évite le « on refait tout » en 2027.

### DECISION-019 — La charte du site passe sur le nouveau logo (terracotta abandonné)
- **Date** : 17/09/2026 · **Sujet** : identité visuelle du thème
- **Décision** : le logo étant refait, la palette du thème est **dérivée du nouveau logo**, mesurée au pixel :
  jaune `#fdd800` (13,3 % des pixels vifs) = **action** (fond du CTA, texte encre 10,96:1) ; orange
  `#fda503` (11,3 %) = **promo** (texte encre 7,71:1) ; cyan `#00f1fc` (4,7 %) = **décor uniquement**
  (1,40:1 sur blanc, jamais en texte) ; bleu `#007ef6` = **information** ; rouge `#ff0000` (8,6 %) =
  **contour du logo seulement** (4,0:1 → les erreurs utilisent `#c1121f`, 6,22:1). L'encre `#2b2419` ne
  change pas (même famille que les contours sombres du logo). **Le terracotta `#d06e6a` et l'or `#c6b26d`
  sont retirés du système.**
- **Pourquoi** : demande de Jérôme (« refaire le modèle design pour qu'il soit en harmonie avec le logo »).
- **Règle d'harmonie** : l'énergie du logo (rayons, biseau, contours épais) reste **dans le logo et le
  bandeau promo** ; l'interface reste plate, calme et rapide — condition de « moderne simple, facile et
  rapide d'acheter ».
- **Conséquence typographique** : l'option serif (Fraunces) de la v0.1 est **écartée** (rupture avec un
  lettrage sans-serif gras italique) ; on retient **Montserrat 700/600 + Source Sans 3 400/600**, avec
  l'italique en écho au logo, réservé aux titres promotionnels.
- **Précision mesurée** : le fichier reçu contient **4 variantes réellement différentes** (empreintes
  distinctes — une lecture visuelle rapide les avait crues identiques) ; elles diffèrent par la **densité
  de rayons** (couleurs vives : 29,2 / 30,5 / 37,6 / 43,8 %) ; fond **transparent** (32-36 %), aucun badge
  fermé. **Le logo ne partira jamais tel quel sur le site** : il faut une version **plate sans rayons**
  pour l'en-tête, en SVG, plus une déclinaison icône (favicon, app mobile).

### DECISION-020 — Navigation et achat rapide deviennent des exigences de design explicites
- **Date** : 17/09/2026 · **Sujet** : navigation et parcours d'achat
- **Décision** : la navigation est un livrable de design à part entière : **3 chemins maximum** jusqu'à un
  produit (univers → sous-catégorie → produit), recherche toujours à un geste ; **barre basse mobile à
  5 entrées de 48 px** (libellées ET iconographiées) ; **méga-menu desktop à 2 niveaux visibles sans clic**,
  ouvrable au survol et au clavier ; fil d'Ariane systématique. L'achat rapide vise **moins de 60 secondes** :
  ajout au panier depuis la carte produit, panier latéral, **commande invité par défaut**, **4 écrans
  maximum**, frais de port affichés dès le panier, aucun popup, aucune inscription forcée.
- **Pourquoi** : demande explicite de Jérôme (« moderne simple pour le client, facile et très rapide
  d'acheter »).
- **Impact** : les univers du menu et les catégories mises en avant de l'accueil sont **les mêmes données**
  paramétrables en back-office ; les prompts Claude Design P3 et P6 ont été réécrits en conséquence.

### DECISION-006 — La collecte de la newsletter est partie prenante du chantier
- **Date** : 17/09/2026 · **Sujet** : dépendance externe
- **Décision** : la mise à jour des sélecteurs de la collecte (`newsletter-replicant`,
  `config/selectors.yml`) et une nouvelle fixture de la page d'accueil font partie du périmètre de la
  refonte, et sont livrées **dans le même chantier**.
- **Pourquoi** : la collecte lit la page d'accueil par scraping ; un changement de thème l'aveugle
  silencieusement. Le premier envoi réel a eu lieu le 17/09/2026.

---

### DECISION-021 — L'opération est déclenchée par le cron système, et tourne en priorité minimale
- **Date** : 18/09/2026 · **Sujet** : déclenchement et impact sur la production
- **Décision** : ① la remise à niveau de la préprod est déclenchée par une **ligne de cron système**
  du VPS (`7 12 18 9 *`), **pas** par le planificateur Hermes — le profil `devops` n'a **aucun gateway
  actif**, donc aucun de ses jobs planifiés ne s'exécute (BUG-001) ; ② **toutes** les étapes distantes
  tournent en **`nice -n 19 ionice -c3`** (CPU au minimum, E/S en classe *idle*) pour que la production
  — même serveur, même instance MariaDB, même système de fichiers — garde la priorité.
- **Pourquoi** : un ralentissement de la production est un coût réel (~80 commandes/jour) ; la fenêtre
  retenue est la **pause des employés (12h)**, décalée à **12h07** pour éviter les minutes `:00`-`:03`
  occupées par les crons marketplaces (règle du runbook).
- **Alternatives écartées** : re-planifier sur le planificateur Hermes (il ne tourne pas dans ce
  profil) ; lancer en priorité normale (impact non maîtrisé sur la production).
- **Impact** : l'opération peut durer plus longtemps puisqu'elle cède le disque dès que la production
  le demande ; le contrôle du résultat reste manuel (BUG-001 en a montré le coût).
- **Révision du 18/09/2026 (13h00)** — l'exécution de 12h07 a montré que **la classe d'E/S *idle* coûte
  ~10x en temps** (`BUG-004`) : elle est **retirée**. Seul `nice -n 19` reste, la production n'ayant
  montré aucune tension CPU. La priorisation ne se paie plus par la durée de l'opération.
- **Replanification** : **18/09/2026 à 21h15** (au lieu de 12h07). Le relevé des crons de la boutique a
  corrigé l'heure : **la minute 7 est occupée toutes les heures** par le cron Amazon
  (`products_json.php`, 9 marchés) — le créneau de 12h07 collait donc à une tâche. Entre **19h et 22h**,
  la `crontab` est **libre**, et la minute 15 n'est utilisée par aucune tâche.

---

## 3. Environnement mesuré (audit phase 0 du 17/09/2026 — détail : `docs/audit-phase0-2026-09-17.md`)

- SSH `djdj2187@nilgaut.o2switch.net` **fonctionne** (clé `~/.ssh/id_ed25519`), PHP CLI **8.1.34**,
  `composer` et `wp` disponibles, **pas de Node.js**, Redis/Memcached/Imagick présents.
- **Production** : `~/the-replicant.com`, base `djdj2187_pab`, PrestaShop **8.2.3**, MariaDB **11.4.13**,
  thème actif **`warehouse`** (95 Mo, 4 409 fichiers), CCC actif, 132 modules enregistrés / **103 actifs**,
  2 350 commandes sur 30 jours. **Mono-boutique** (mesuré).
- **Préprod** : base dédiée `djdj2187_preprod_thereplicant`, thème actif **`warehousechild`**,
  **89 modules actifs** ⇒ **elle n'est pas à jour** (DECISION-008).
- **Aucune personnalisation dans un thème enfant** : `warehousechild` est le thème enfant de démonstration
  d'IQIT, vierge. Les réglages visuels vivent dans `iqitthemeeditor` (**en base**) ⇒ la sauvegarde doit
  couvrir le dossier `themes/warehouse` **et les réglages en base**.
- **`ets_onepagecheckout` 2.8.6 déjà actif** (DECISION-007) ; paiements : Monetico, Alma, PayPal, virement.
- **`ets_awesomeurl`** porte les URL réécrites, les redirections et le sitemap ⇒ hors périmètre du thème.
- **`aimetadata` 1.2.2 installé et actif** (DECISION-004) : le nouveau thème doit appeler
  `displayAsFirstProductImage` / `displayAsLastProductImage` dans la galerie et respecter
  `AIMETADATA_BADGE_ON_THUMBNAILS` pour les vignettes.
- **0 fichier WebP** pour 216 997 JPEG : le cron « backfill WebP » (01h35) sort sans rien produire.
- **63 overrides du cœur**, dont `Customer.php` (remise de bienvenue via `WelcomeDiscountService`) et
  trois reliquats morts (`Customer1.php`, `CustomerV1.php`, `CustomerOK.php`).
- **Aucun espace professionnel** : 0 page CMS, aucun groupe « Professionnel » ; 7 employés actifs.
- **Aucune sauvegarde du thème ni de la base visible** sur le compte (`~/backups` = 12 archives du module
  `colissimo_essentiel`) ⇒ **rollback non prouvé à ce jour**.
- Poids mesurés de la page d'accueil : voir `docs/audit-2026-09-17-site-public.md`.

---

## 4. Budget de performance (cible v1)

| Indicateur | Aujourd'hui | Cible |
|---|---|---|
| HTML accueil (gzip) | 330 Ko | < 90 Ko |
| CSS thème (gzip) | 142 Ko + 31 Ko FontAwesome | < 45 Ko |
| JS (gzip) | 398 Ko | < 110 Ko (dont GSAP < 45 Ko) |
| Requêtes (accueil) | 317 | < 60 |
| Images | JPEG/PNG, 0 srcset | AVIF + WebP + srcset |
| LCP mobile / CLS / INP | non mesuré | < 2,5 s / < 0,05 / < 200 ms |
| Accessibilité | contraste non conforme | WCAG 2.2 AA |

---

## 5. Bugs

### BUG-001 — Le job planifié du 17/09 à 20h07 ne s'est jamais exécuté
- **Statut** : FIXED · **Date** : constaté le 18/09/2026 (job créé le 17/09 à 15h38)
- **Environnement** : planificateur Hermes, profil `devops` (VPS)
- **Description** : la remise à niveau de la préprod était « armée » sur un job Hermes
  (`e81746b4827b`, `once`, exécution unique le 17/09/2026 à 20h07) — il n'a jamais démarré.
- **Reproduction** : `cron/jobs.json` → `state: scheduled`, `last_run_at: null`, `last_status: null`,
  24 h après l'heure prévue ; `cron/executions.db` → **0 ligne** (les profils `default` et
  `dev_artonia` en comptent 1 000 chacun).
- **Attendu / obtenu** : une exécution à 20h07 / **aucune exécution** ; la préprod est restée
  inchangée (dossier modifié pour la dernière fois le 17/09 à 10h17).
- **Cause** : le planificateur ne tourne que dans un profil où un **`hermes gateway run`** est actif.
  Les profils `default` et `dev_artonia` ont un gateway systemd ; le profil `devops` n'a **qu'un
  dashboard** → ses jobs cron ne sont jamais déclenchés. Un job dont l'heure est passée reste
  `scheduled` **et `enabled`** : il peut partir dès qu'un gateway de ce profil démarre.
- **Correction** : ① déclenchement par une **ligne de cron système** du VPS (DECISION-021) ;
  ② job Hermes **désarmé** pour écarter le double déclenchement.
- **Fichiers** : (hors dépôt) `cron/jobs.json`, `crontab -l` de l'utilisateur `ubuntu`.
- **Test de validation** : exécution réelle du 18/09/2026 à 12h07 + contrôle du résultat.

### BUG-002 — Les étapes lourdes n'avaient aucune priorité : la production pouvait ralentir
- **Statut** : FIXED · **Date** : 18/09/2026
- **Description** : seuls le dump de production (`nice -n 10`) et rien d'autre étaient priorisés ;
  `tar` de 17 Go, dump de la préprod, restauration (~1,7 Go de SQL) et `rsync` (6,84 Go mesurés)
  tournaient en priorité normale, sur le **même serveur, la même instance MariaDB et le même
  système de fichiers** que la production (~80 commandes/jour).
- **Cause** : absence de priorisation — et, une fois l'enveloppe voulue, un `nice -n 10` **incompatible**
  avec un script lancé en `nice -n 19` (on ne peut pas remonter sa priorité : `nice` échoue et
  `set -e` aurait fait tomber l'étape 2).
- **Correction** : enveloppe distante `nice -n 19 ionice -c3` (CPU au minimum, E/S en classe *idle*)
  qui couvre **toutes** les étapes, et `nice -n 10` → `nice -n 19` sur le dump de production.
- **Test de validation** : dry-run du 18/09/2026 à 09h35 — `nice` et `ionice` confirmés présents et
  utilisés, aucune étape en échec.

### BUG-003 — Le journal de dry-run écrivait le hash du mot de passe de la base
- **Statut** : FIXED · **Date** : 18/09/2026
- **Description** : `SHOW GRANTS FOR CURRENT_USER()` renvoie `IDENTIFIED BY PASSWORD '*…'` et cette
  ligne partait telle quelle dans `logs/remise-a-niveau-*.log` (règle 5 du chantier : aucun secret
  dans les journaux), alors que la clé `secure_key` de la `crontab` était, elle, masquée.
- **Correction** : masquage par `sed` dans le script + rédaction des **3 journaux** de dry-run
  existants (17/09 ×2, 18/09 ×1).
- **Test de validation** : plus aucun hash dans `logs/`.

### BUG-004 — La classe d'E/S « idle » a rendu l'opération ~10x plus lente (arrêtée à l'étape 1)
- **Statut** : FIXED · **Date** : 18/09/2026 (mesuré à 12h58, exécution arrêtée à 13h00)
- **Environnement** : exécution réelle du 18/09/2026 à 12h07 (VPS → `nilgaut.o2switch.net`)
- **Description** : l'enveloppe distante `nice -n 19 ionice -c3`, posée pour protéger la production
  (`DECISION-021`), a ramené le débit de lecture effectif à **~4,9 Mo/s** : après **51 min 27 s**,
  l'étape 1 (sauvegarde des fichiers de la préprod) n'était **qu'à 87 %** — 14,88 Go lus sur ~17 Go,
  archive à 12,1 Go progressant de +172 Mo/min.
- **Attendu / obtenu** : 45-60 min pour les 7 étapes / **l'étape 1 non terminée en 51 minutes**.
- **Cause** : la classe *idle* de `ionice` ne prend le disque que lorsque personne d'autre ne le
  demande ; sur un stockage mutualisé déjà occupé, cela revient à un débit résiduel. La production,
  elle, **n'a pas été ralentie** (charge inchangée : 11,6 / 13,2 sur 56 cœurs) : le remède était
  efficace, mais son coût en temps n'était pas mesurable avant l'exécution (`/proc` fermé par CageFS).
- **Correction** : `ionice -c3` **retiré** de l'enveloppe — seul `nice -n 19` reste (le CPU n'était pas
  le facteur limitant) ; exécution arrêtée proprement, préprod **intacte**, relance le même jour à 21h15.
- **Fichiers** : `outillage/remise-a-niveau-preprod.sh`.
- **Test de validation** : dry-run du 18/09 à 13h00 en environnement dépouillé (`RESULTAT: DRY-RUN OK`,
  commande d'exécution vérifiée : `nice -n 19 bash -s --`, plus aucun `ionice`).
- **Ce que l'arrêt en cours d'exécution a confirmé** : `P130` s'est vérifié **en vrai** — interrompu en
  pleine course, le script a bien laissé `~/.my-prod.cnf` et `~/.my-preprod.cnf` (mode 600, mot de
  passe de base) sur le serveur. Supprimés manuellement à 13h00, avec l'archive partielle de **13 Go**.
  ⇒ tant que `P130` n'est pas corrigé, **toute interruption laisse des identifiants sur le serveur**.

---

## 6. État d'avancement

| Phase | État |
|---|---|
| 0 — Audit & sauvegarde | ☑ audit lecture seule **fait** (prod + préprod, 17/09/2026) · ☐ sauvegarde du thème et de la base **à faire sur accord** |
| **0 bis — Remise à niveau de la préprod** | ☑ runbook écrit · ☑ script versionné, éprouvé à blanc · ☑ exécution du 18/09 à **12h07** lancée par le cron système (DECISION-021) — **arrêtée à 13h00**, bloquée à l'étape 1 par la classe d'E/S *idle* (**BUG-004**), **préprod intacte** · ☑ **relance planifiée le 18/09 à 21h15** (`nice 19`, sans `ionice`) · ☐ **contrôle du résultat** (tables ≈ 571, modules ≈ 77, `crontab` −1 tâche, `PS_SHOP_ENABLE = 1`, `PS_MAIL_METHOD = 3`, HTTP `200` derrière la redirection) |
| 1 — Design (Claude Design) | ☑ **tokens v0.2.0 dérivés du nouveau logo** (`docs/design/tokens.json` v0.2, `DESIGN.md` v0.2, `apercu-tokens-v2.html` ; `apercu-tokens.html` = planche v0.1 conservée pour comparaison) · ☐ validation de Jérôme (palette, **variante du logo**, typographie + licences) puis maquettes (prompts P0→P10 prêts) |
| 2 — Socle du thème | ☐ base arrêtée : thème vierge, conventions Hummingbird, **aucun framework CSS** (DECISION-017) |
| 3 — Module BO compagnon | ☐ |
| 4 — Tunnel de vente | ☐ tunnel maison après décorticage de `ets_onepagecheckout` (DECISION-010) |
| 5 — Particuliers & pro | ☐ parcours seulement : formulaire + validation manuelle, **aucune logique de prix** (DECISION-014) |
| 6 — Intégrations | ☐ |
| 7 — Recette | ☐ |
| 8 — Production | ☐ |
| 9 — App mobile | ☐ cadrage séparé — **canal de commande** (DECISION-015) |
| **10 — Bascule PrestaShop 9 (2027)** | ☐ préparée dès cette année : montée **8.2.3 → 8.2.8**, sortie de l'écosystème IQIT, traitement des 63 `override/` |

---

## 7. Commandes

Définies au fur et à mesure — **ne rien inventer**.

```bash
# Audit lecture seule (aucune écriture, SELECT uniquement)
ssh -i ~/.ssh/id_ed25519 djdj2187@nilgaut.o2switch.net 'php' < docs/outillage/sonde.php

# Déploiement préprod (à confirmer une fois le thème créé)
# rsync -av --delete themes/replicant/ djdj2187@nilgaut.o2switch.net:~/preprod.the-replicant.com/themes/replicant/
```

---

## 8. Points ouverts (décisions attendues)

**Tranchés le 17/09/2026** (voir DECISION-010 à DECISION-016) : tunnel réécrit après décorticage ;
minimum de modules ; remise à niveau de la préprod (modules de prod laissés inactifs) ; sauvegarde préprod
autorisée ; WebP + réparation du cron ; pro = groupe HT -20 % ; app mobile = canal de commande ;
conventions Hummingbird pour l'évolutivité.

**Également tranchés le 17/09/2026 au soir**, sans que cette liste ait été mise à jour (décisions
`DECISION-017` à `DECISION-020`) : **base du thème** = voie B, un thème vierge aux conventions
Hummingbird ; **aucun framework CSS** ; **bascule PrestaShop 9 datée à 2027** ; **charte du site
basculée sur le nouveau logo** (le CTA passe au jaune `#fdd800`, le terracotta `#d06e6a` sort du
système). Les points correspondants ont été retirés de la liste ci-dessous.

**Restent ouverts :**

1. **Quelle variante du logo est retenue** (1, 2, 3 ou 4 de la planche) — la série de densités publiée
   (29,2 / 30,5 / 37,6 / 43,8 %) n'est pas reliée à ses variantes : la **table de correspondance**
   manque, et le rendu dans un en-tête n'est pas le même selon la variante.
2. **Déclinaisons du logo à fournir** : version **plate sans rayons** pour l'en-tête, **SVG**, **icône
   seule** (favicon, app mobile), et une version **monochrome** — le fichier actuel (2,6 Mo,
   4 variantes 3D sur fond transparent) ne peut pas partir tel quel sur le site.
3. **Typographie** : Montserrat 700/600 + Source Sans 3 retenu (Fraunces écartée) — la **licence de
   chaque famille reste à confirmer avant** tout sous-ensemble et auto-hébergement.
4. **App mobile** : quel moyen de paiement (Monetico / Alma / PayPal, ou Stripe) ?
5. **Newsletter** : qui met à jour les sélecteurs de collecte (périmètre `newsletter-replicant`) ?
6. **Sauvegarde de production** : où sera la sauvegarde du thème et de la base avant la bascule finale ?
