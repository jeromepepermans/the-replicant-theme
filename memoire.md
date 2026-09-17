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

### DECISION-006 — La collecte de la newsletter est partie prenante du chantier
- **Date** : 17/09/2026 · **Sujet** : dépendance externe
- **Décision** : la mise à jour des sélecteurs de la collecte (`newsletter-replicant`,
  `config/selectors.yml`) et une nouvelle fixture de la page d'accueil font partie du périmètre de la
  refonte, et sont livrées **dans le même chantier**.
- **Pourquoi** : la collecte lit la page d'accueil par scraping ; un changement de thème l'aveugle
  silencieusement. Le premier envoi réel a eu lieu le 17/09/2026.

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

*(aucun à ce jour)*

---

## 6. État d'avancement

| Phase | État |
|---|---|
| 0 — Audit & sauvegarde | ☑ audit lecture seule **fait** (prod + préprod, 17/09/2026) · ☐ sauvegarde du thème et de la base **à faire sur accord** |
| 1 — Design (Claude Design) | ☐ prompts livrés, maquettes à produire — tokens à valider d'abord |
| 2 — Socle du thème | ☐ bloqué par le sort des 23 modules IQIT (DECISION-009) |
| 3 — Module BO compagnon | ☐ |
| 4 — Tunnel de vente | ☐ **révisé** : arbitrage « habiller l'existant / remplacer » (DECISION-007) |
| 5 — Particuliers & pro | ☐ |
| 6 — Intégrations | ☐ |
| 7 — Recette | ☐ bloqué par la fiabilité de la préprod (DECISION-008) |
| 8 — Production | ☐ |
| 9 — App mobile | ☐ cadrage séparé |

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

1. **Tunnel** : habiller/paramétrer `ets_onepagecheckout` (déjà actif, payant, testé) **ou** le remplacer ?
   (recommandation : habiller, et n'écrire que ce qui manque)
2. **Écosystème IQIT** : pour chacun des 23 modules IQIT actifs + Revolution Slider — conservé, remplacé,
   désactivé ? (conditionne le gain de poids réel et une partie du design)
3. **Environnement de recette** : rafraîchir la préprod depuis la production, ou construire un sandbox
   hors compte ? (la préprod actuelle ne permet pas de tester le tunnel ni le paiement)
4. **Sauvegarde** : autoriser la sauvegarde du thème + dump de la base avant toute manipulation ?
   (aujourd'hui, aucun rollback prouvé)
5. **Images** : corriger le cron « backfill WebP » (216 997 JPEG concernés) ou générer les formats modernes
   depuis le thème ? (les deux sont compatibles, mais l'un des deux doit être choisi en premier)
6. **Pro** : la grille tarifaire professionnelle existe-t-elle, ou les pros achètent-ils au prix public ?
7. **Webservice** : quel usage prévu pour l'app mobile (webservice PrestaShop en lecture ou API dédiée) ?
