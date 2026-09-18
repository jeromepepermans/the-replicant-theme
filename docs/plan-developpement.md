# Plan de développement — refonte du thème the-replicant.com

Décisions validées par Jérôme le 17/09/2026 (voir `memoire.md` — DECISION-001 à DECISION-005).

---

## Phase 0 — Audit & sauvegarde (BLOQUANT, lecture seule)

Objectif : ne rien concevoir sur des hypothèses. La source de vérité est l'installation réelle.

- [ ] Thème `warehouse` : version sur disque **vs** version enregistrée, réglages en base, overrides éventuels.
- [ ] Modules réellement **installés et activés** (`ps_module`), hooks réellement posés (`ps_hook_module`).
- [ ] Dépendances du thème sortant : IQIT Elementor (pages composées), Revolution Slider (alias utilisés,
      où ils sont placés), `ph_simpleblog`, `sendinblue`, modules marketplace (amazon, cdiscount, temuconnector).
- [ ] Groupes clients existants, transporteurs, moyens de paiement, langues et devises actives.
- [ ] Multistore : mesure (`ps_shop`, `ps_shop_url`, `ps_configuration`), pas d'inférence.
- [ ] État de la préprod `~/preprod.the-replicant.com` : base, fraîcheur de la copie, `maintenance` éventuel.
- [ ] Crons du compte, sauvegardes en place, espace disque.
- [ ] **Sauvegarde complète du thème actuel + export des réglages** (rollback) — sur accord explicite, car c'est une écriture sur le serveur.
- [ ] Baseline chiffrée : Lighthouse mobile/desktop sur 5 gabarits (accueil, catégorie, produit, panier, connexion).
- [ ] Vérifier si le module `aimetadata` (badge IA / AI Act) est présent, et sous quel hook il rend le badge.

**Livrable** : audit daté, chaque affirmation adossée à `fichier:ligne` ou à une requête citée, CR BDC.
**Porte de sortie** : aucune ligne de code avant cet audit.

---

## Phase 0 bis — Remise à niveau de la préprod (première action technique)

Décision DECISION-012. Objectif : une préprod **à l'identique de la production** (fichiers + base), donc
une base de travail qui prouve quelque chose.

- [ ] **Sauvegarde complète de la préprod actuelle** (fichiers + dump de sa base) — autorisée, à faire avant tout.
- [ ] Dump de la base de production et restauration dans la base de préprod.
- [ ] Mise à l'identique des fichiers applicatifs (socle, modules, thème) — **sans** toucher à la production.
- [ ] **Laisser inactifs les modules de production** : rien ne doit tirer sur les marketplaces, le paiement,
      la messagerie ou l'e-mail depuis la préprod. Dresser la liste des modules à désactiver (amazon, cdiscount,
      temuconnector, colissimo/colissimo_essentiel, hc_retractation, sendinblue, Monetico, Alma, ps_checkout,
      ets_onepagecheckout selon le cas), **et vérifier les crontabs du compte** : les entrées pointant sur
      `preprod.` doivent rester inoffensives.
- [ ] Vérifier après restauration : `PS_SHOP_ENABLE`, URL de boutique (`preprod.the-replicant.com`), accès
      back-office, cache vidé, `parameters.php` de la préprod pointant bien sur **sa** base.
- [ ] Mesurer la préprod d'après restauration : poids, requêtes, temps de réponse — c'est la **nouvelle baseline**.

**Porte de sortie** : la préprod sert le même code que la production, avec les modules sensibles inactifs,
et le développement du thème peut commencer dessus.

---

## Phase 1 — Design (Claude Design)

- [x] Design tokens livrés : `docs/design/tokens.json` (**v0.2.0 — palette dérivée du nouveau logo mesuré au pixel**,
      source unique thème + module + app) + `docs/design/DESIGN.md` (analyse du logo, rôles d'interface, contrastes
      calculés, interdits) + `docs/design/apercu-tokens-v2.html` (planche vérifiée dans un navigateur : bascule
      « nouveau logo ↔ charte actuelle », 5 entrées de barre à 48 px, CTA 44 px, aucun débordement à 390 px).
      `docs/design/apercu-tokens.html` reste la planche **v0.1** (charte relevée sur l'audit), conservée pour comparaison.
- [ ] **Validation des tokens par Jérôme** avant tout écran : palette du logo, **variante du logo retenue** (la série
      de densités publiée n'est pas reliée à ses variantes) et **licence des polices** à confirmer à la source —
      binôme retenu : **Montserrat 700/600 + Source Sans 3** (Fraunces écartée par `DECISION-019`).
- [ ] Accueil : 3 directions (prudente / fidèle / divergente) → choix de la direction.
- [ ] Maquettes hi-fi **mobile d'abord** puis desktop : accueil, navigation, catégorie, fiche produit,
      tunnel (4 étapes + confirmation), compte particulier, espace pro (présentation, formulaire, écran
      d'attente, e-mails, écran BO de validation), blog/pages/404.
- [ ] **Prototype cliquable du tunnel** (le cœur du brief : court et simple).
- [ ] Chaque maquette **annote ses zones paramétrables** avec le nom exact du champ back-office → le design
      devient la spécification du module compagnon.

**Porte de sortie** : validation écran par écran par Jérôme avant développement.

---

## Phase 2 — Socle du thème `replicant`

- [ ] Squelette PrestaShop 8.2 complet : `config/theme.yml`, `assets/`, `templates/`, `modules/` (surcharges : **aucune** au départ).
- [ ] Tous les hooks natifs attendus par le cœur et les modules tiers.
- [ ] CSS : custom properties, une seule feuille critique inline + une feuille principale, **zéro framework**.
- [ ] JS : modules ES vanilla, `defer`, pas de jQuery dans le thème (jQuery reste chargé en fin de page pour la compatibilité des modules tiers).
- [ ] Icônes : **sprite SVG** (fin de FontAwesome complet).
- [ ] Polices : **auto-hébergées** en woff2 sous-ensemblées, 2 graisses maximum.
- [ ] Images : `srcset` + WebP/AVIF, dimensions explicites, `priority` sur le visuel LCP, `loading="lazy"` ailleurs.
- [ ] Déploiement : `rsync` vers la préprod + purge de cache, **aucune étape de build obligatoire** (o2switch n'a pas Node).

**Critère de sortie** : budgets de perf atteints sur la préprod, comparés à la baseline de la phase 0.

---

## Phase 3 — Module BO compagnon `replicanttheme`

Tout ce qui est visible sur l'accueil est **paramétrable**, rien en dur.

- [ ] **Slides** : image desktop/mobile, titre, sous-titre, bouton, lien, ordre (glisser-déposer), dates de diffusion, ON/OFF.
- [ ] **Bandeau promo** : texte, lien, couleur, dates, fermable, ciblage.
- [ ] **Catégories mises en avant** : sélection, ordre, image, colonnes desktop/mobile, ON/OFF.
- [ ] **Sections produits** : source (nouveautés / meilleures ventes / promo / catégorie), nombre, ordre, titre, ON/OFF.
- [ ] Multilingue + multiboutique, validation des entrées, tokens CSRF, permissions employé.
- [ ] **1 requête SQL par section** (jamais de N+1), cache invalidé à l'enregistrement.
- [ ] Journalisation structurée (niveaux, contexte, jamais de secret).

---

## Phase 4 — Tunnel de vente court (réécrit, après décorticage)

Décision DECISION-010 : tunnel **maison**, `ets_onepagecheckout` désactivé après recette.

- [ ] **Décortiquer `ets_onepagecheckout` 2.8.6** (lecture seule) : champs réellement collectés par étape,
      règles de frais de port, cas de la commande invité, interaction avec chaque moyen de paiement, gestion
      des retours de paiement et des échecs. → note de comportement, **règles reprises, code jamais copié**.
- [ ] Panier (édition, code promo, estimation de port, upsell discret).
- [ ] Identification : **commande invité possible**, bascule « particulier / professionnel » (prix HT -20 % pour
      le groupe pro — DECISION-014).
- [ ] Livraison : transporteurs existants, point relais, adresses.
- [ ] **Paiement sur une page**, au-dessus des hooks paiement, en gardant fonctionnels **Monetico (CMCIC)**,
      **Alma**, **PayPal (`ps_checkout`)** et le virement ; un test de bout en bout par moyen de paiement.
- [ ] Confirmation claire (numéro, suivi, e-mails annoncés).
- [ ] Aucune perte de panier au retour arrière, erreurs au bon endroit, une étape = un écran mobile maximum.
- [ ] **Points d'entrée API** du tunnel (panier, client, commande, paiement) exposés dès la conception pour
      l'app mobile (DECISION-015).

---

## Phase 5 — Particuliers & professionnels

**Décision DECISION-014 : le tarif pro est porté par le groupe client — aucune logique de prix n'est
développée ici.** Le chantier livre le **parcours d'inscription et de validation**, rien d'autre.

- [ ] Particulier : inscription/connexion courte, compte, commandes, suivi, adresses, retours.
- [ ] **Pro** : formulaire de demande (société, responsable, activité, volume, Kbis), mentions RGPD.
- [ ] Création du compte **en attente** — le groupe professionnel n'est **pas** appliqué à la création.
- [ ] Écran back-office « Demandes pro » : liste, filtres, fiche, **Valider / Refuser avec motif obligatoire**, journal.
- [ ] E-mails transactionnels (confirmation client, notification équipe, décision).
- [ ] Bascule automatique dans le groupe client à la validation (les conditions — HT, remise — sont
      **configurées sur le groupe** par Jérôme, hors code).

---

## Phase 6 — Intégrations & compatibilité

- [ ] Blog `ph_simpleblog` : feuille de compatibilité (habillage sans surcharge de templates).
- [ ] Module `aimetadata` : emplacement du badge IA prévu dans la galerie, les vignettes et la fiche.
- [ ] Avis clients, réassurance, newsletter (`sendinblue`), tout module retenu : compatibilité mesurée.
- [ ] ⚠ **Newsletter-replicant** : mise à jour de `config/selectors.yml` + nouvelle fixture de la home
      `tests/fixtures/home-<date>.html.gz` + non-régression de la collecte.

---

## Phase 7 — Recette

- [ ] Budgets de perf **assertés** (poids CSS/JS/HTML, nombre de requêtes) — pas seulement mesurés une fois.
- [ ] Accessibilité WCAG 2.2 AA : axe, navigation clavier, lecteur d'écran, contraste, cibles ≥ 44 px.
- [ ] Tests fonctionnels : 1/N images, galerie, lazy loading, changement d'image, mobile/desktop, thème sans JS.
- [ ] Tests tunnel : invité, connecté, pro en attente, pro validé, erreurs de paiement, abandon/reprise.
- [ ] Tests sécurité : CSRF, XSS, SQLi, permissions, manipulation d'identifiants, endpoints AJAX.
- [ ] SEO : JSON-LD, canonical, `hreflang` si multilingue, sitemap, redirections des anciennes URL.
- [ ] Tests marketplace : parcours boutique inchangé (les crons tournent toutes les minutes).
- [ ] Non-régression : fixture de la page d'accueil figée, diff de rendus préprod ↔ local.

---

## Phase 8 — Mise en production

- [ ] Sauvegarde du thème actuel et de la base avant bascule.
- [ ] Bascule sur la préprod d'abord, mesures finale, validation Jérôme.
- [ ] Installation en production (thème + module), purge de cache, contrôle des 5 gabarits.
- [ ] Surveillance 72 h (erreurs PHP, logs, commandes, crons marketplaces) + **kill-switch** de retour au thème précédent.
- [ ] Documentation utilisateur (README) + CR BDC de livraison.

---

## Phase 9 — App mobile (2ᵉ temps) — **canal de commande complet**

Décision DECISION-015 : l'app doit permettre de **passer commande**, pas seulement de consulter.

- [ ] Cadrage du périmètre avec Jérôme (attention : le chantier `multiply` a tranché `D-009` — prix =
      marketplaces, la boutique ne sert que la connexion des utilisateurs ; ne pas dupliquer).
- [ ] Expo + réutilisation **stricte** des design tokens du web (mêmes valeurs, mêmes contrastes).
- [ ] Source de données : **webservice PrestaShop** en 8.2, **Admin API** (API Platform) en 9.x — décision
      chiffrée, en tenant compte de `ps_stock_available` (`id_shop=1` obligatoire, piège mesuré).
- [ ] Réutilisation des **points d'entrée du tunnel** conçus en phase 4 (ne pas réinventer le panier ni le paiement).
- [ ] Moyen de paiement de l'app à trancher (Monetico / Alma / PayPal / Stripe).

---

## Phase 10 — Bascule vers PrestaShop 9 (objectif 2027 — DECISION-018)

**Un an à l'avance, ce qui se prépare ici ne se rattrape pas en 2027.**

- [ ] **Monter la boutique en 8.2.8** (dernier patch de la branche 8.2, publié le 18/08/2026) : d'abord sur
      la préprod, puis en production, avec sauvegarde préalable et contrôle du tunnel.
- [ ] **`docs/theme-9-migration.md`** tenu à jour : écarts à traiter, `theme.yml` (types d'images),
      conventions, matrice Hummingbird relue à chaque version.
- [ ] **Traitement des 63 `override/`** du cœur (dont `Customer.php` et `WelcomeDiscountService`) : ils
      bloquent une montée de version et doivent être soit intégrés proprement, soit retirés.
- [ ] **Sortie de l'écosystème IQIT** terminée avant la bascule (sinon le portage devient un projet à lui seul).
- [ ] **Module compagnon « compatible 9 »** : ni `guzzle`, ni `SwiftMailer`, services Symfony déclarés,
      aucune dépendance retirée en 9.0.
- [ ] **Recette comparée 8.2 ↔ 9.x** sur les 5 gabarits clés (accueil, catégorie, produit, panier, commande).
- [ ] **App mobile** : bascule du webservice classique vers l'**Admin API** (API Platform) si elle est retenue.

---

## Règles de chantier

1. `AUDITER AVANT DE CONCEVOIR` — et **auditer la préprod avant la prod**.
2. Un commit = un sujet = un **CR BDC**.
3. Après chaque étape significative : `memoire.md` mis à jour (DECISION-xxx / BUG-xxx).
4. Aucune modification du core PrestaShop, aucune modification directe d'un module tiers.
5. Aucun secret dans le code, les logs, les commits ou le chat.
