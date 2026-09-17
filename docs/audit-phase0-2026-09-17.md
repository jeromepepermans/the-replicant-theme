# Audit phase 0 — boutique the-replicant.com (lecture seule)

**Date** : 17/09/2026 · **Méthode** : SSH `djdj2187@nilgaut.o2switch.net`, sonde PHP passée **sur stdin**
(`outillage/sonde-phase0.php`, `SELECT`/`SHOW` uniquement) + `outillage/audit-shell.sh` (lecture disque,
secrets masqués). **Aucune écriture, aucun fichier créé sur le serveur**, aucun secret relevé.
Chaque bloc de sortie portait un marqueur de fin (vérifié présent) : aucune conclusion tirée d'une sortie tronquée.

---

## 1. Socle

| | Production | Préproduction |
|---|---|---|
| Racine | `/home/djdj2187/the-replicant.com` | `/home/djdj2187/preprod.the-replicant.com` |
| Base | `djdj2187_pab` (localhost) | `djdj2187_preprod_thereplicant` (localhost) |
| PrestaShop | **8.2.3** | **8.2.3** |
| MariaDB | 11.4.13-MariaDB | 11.4.13-MariaDB |
| PHP CLI | 8.1.34 | 8.1.34 |
| Thème actif | **`warehouse`** | **`warehousechild`** |
| Réécriture d'URL | `PS_REWRITING_SETTINGS = 1` | `0` (+ module `ets_awesomeurl` absent) |
| Cache CCC | `PS_CSS_THEME_CACHE = 1`, `PS_JS_THEME_CACHE = 1` | NULL |
| Boutique ouverte | `PS_SHOP_ENABLE = 1` | NULL |
| Modules | **132 enregistrés / 103 actifs** | **129 / 89** |
| Multistore | **non** — 1 `ps_shop`, 1 ligne `ps_shop_url` (`main=1`), `PS_MULTISHOP_FEATURE_ACTIVE` **absente** | idem |
| Commandes | 202 195 au total, **2 350 sur 30 jours** | 172 278 (aucune sur 30 j) |

⚠ **La préproduction n'est pas le reflet de la production.** Elle utilise un **autre thème** et **14 modules
actifs en moins** : absents en préprod — `alma`, `MoneticoPaiement`, `ps_checkout`, `ets_onepagecheckout`,
`ets_awesomeurl`, `hc_retractation`, `colissimo` (2.2.4), `blockreassurance`, `medgtranslate`, `packlink`,
`naturabuy`, `cz_slider`, `ps_reminder`, `certishoppingsocialreviews`, `la_customproduct`, `popupguest`,
`blockproductsbycountry`, `ps_eventbus`, `ps_buybuttonlite`, `gamification`. Toute recette faite aujourd'hui
sur la préprod **ne prouve rien** sur le tunnel, le paiement, le SEO ou la compatibilité modules.

---

## 2. Thèmes sur disque

| Thème | Taille | Fichiers | État | Contenu |
|---|---|---|---|---|
| `warehouse` | **95 Mo** | **4 409** | **actif en production** | thème commercial IQIT |
| `warehousechild` | 1,4 Mo | 11 | **actif en préprod**, présent mais inactif en prod | **thème enfant de démonstration vierge** (13/01/2026) : `theme.yml` (`parent: warehouse`, `use_parent_assets: true`) + FontAwesome + `preview.png` — **aucune personnalisation** |
| `classic` | 6,2 Mo | — | inactif | thème natif |
| `child_classic` | 1,8 Mo | — | inactif | reliquat 2023-2025 (`custom.css` 222 o, `head.tpl` 3,5 Ko modifiés le 11/03/2025) |
| `_libraries` | 1,2 Mo | — | — | dépendances partagées |

Cache d'assets en production : `themes/warehouse/assets/cache/` contient **6 variantes de `bottom-*.js`
de 1,1 à 1,4 Mo chacune** — le JS réellement servi est monstrueux.

**Conclusion importante** : il n'existe **aucune personnalisation maison dans un thème enfant**. Les réglages
visuels du thème vivent dans **IQIT Theme Editor (`iqitthemeeditor` 4.8.1)**, donc **en base de données** →
la sauvegarde à faire porte sur **le dossier `themes/warehouse` + les réglages en base**, pas sur un thème enfant.

---

## 3. Écosystème de modules (la contrainte la plus lourde du chantier)

**23 modules IQIT actifs** en production : `iqitthemeeditor(4.8.1)` — le moteur de réglages du thème,
`iqitelementor(1.2.4)`, `iqitmegamenu(4.0.0)`, `iqitsearch`, `iqitreviews`, `iqitwishlist`, `iqitcompare`,
`iqitproductvariants`, `iqitproductflags`, `iqitproducttags`, `iqitsociallogin`, `iqitcookielaw`, `iqitpopup`,
`iqithtmlandbanners`, `iqitcountdown`, `iqitcrossselling`, `iqitlinksmanager`, `iqitfreedeliverycount`,
`iqitadditionaltabs`, `iqitcontactpage`, `iqitextendedproduct`, `iqitproductsnav`, `iqitsizecharts`,
`iqitemailsubscriptionconf`, `iqitdashboardnews` — plus **`revsliderprestashop` 6.2.22.5**.

Ces modules ne sont pas décoratifs : ils **écrivent dans les pages du thème** via des hooks. Un thème
autonome doit soit fournir les hooks qu'ils consomment, soit les remplacer un par un — c'est un chantier
dans le chantier, à trancher explicitement.

Hooks de la fiche produit réellement occupés (prod) :

| Hook | Modules |
|---|---|
| `displayProductAdditionalInfo` | `aimetadata`, `colissimo`, `iqitproducttags`, `productcomments`, `ps_sharebuttons` |
| `displayProductExtraContent` | `certishoppingsocialreviews`, `iqitadditionaltabs`, `iqitreviews`, `ph_relatedposts` |
| `displayAfterProductThumbs` | `iqitextendedproduct` |
| `displayProductListFunctionalButtons` | `iqitcompare`, `iqitwishlist` |
| `displayProductListReviews` | `certishoppingsocialreviews`, `productcomments` |
| `displayProductPriceBlock` | `alma`, `certishoppingsocialreviews` |
| `displayFooterProduct` | `certishoppingsocialreviews`, `productcomments` |
| `displayRightColumnProduct` | `certishoppingsocialreviews`, `iqithtmlandbanners` |

Autres modules structurants : `ph_simpleblog(1.8.0)` (+ `ph_blog_column_custom`, `ph_relatedposts`),
`sendinblue(5.0.34)`, `psgdpr(1.4.3)`, `pixel_cloudflare_turnstile(1.1.4)`, `ps_facetedsearch(4.0.1)`,
`amazon(5.4.14)`, `cdiscount(4.5.47)`, `temuconnector(1.0.0)`, `colissimo(2.2.4)`, `hc_fedex`, `hc_retractation`,
`m2emultichannelconnect`, `storecommander`, `blockoss`, `ets_awesomeurl`, `medgtranslate`, `ps_accounts(8.0.9)`.

---

## 4. Tunnel de commande — **il existe déjà** ⚠

- **`ets_onepagecheckout` 2.8.6, actif**, commande sur une page (`ETS_OPC_1PAGE_ENABLED`), avec :
  commande **invité** possible, captcha (V3 renseigné), remplissage automatique d'adresse Google,
  **connexion sociale** (`iqitsociallogin` sur `displayCheckoutLoginFormAfter`), couleurs et gabarit
  paramétrables (`ETS_OPC_DESIGN_*`), réassurance, logo transporteurs, case newsletter/offres.
- **Paiements actifs** : `MoneticoPaiement` 1.3.0 (CMCIC), `alma` 2.7.2 (paiement fractionné),
  `ps_checkout` 8.5.3.2 (PayPal), `ps_wirepayment`.
- `ets_awesomeurl` 1.2.4 gère les **URL réécrites, les redirections et le sitemap XML** : le SEO d'URL
  n'est **pas** du ressort du thème.

⇒ **Réviser la phase 4 du plan** : la question n'est plus « écrire un tunnel » mais
« habiller/paramétrer celui qui tourne, ou le remplacer » — décision de Jérôme.

---

## 5. Clients, groupes, professionnels

- **Aucun espace ni formulaire professionnel** : 0 page CMS mentionnant « professionnel », aucun module
  de formulaire pro, **aucun groupe « Professionnel »**. Tout est à créer.
- Groupes existants : `1 Visiteur`, `2 Invité`, `3 Client`, `4 Amazon`, `5 As Import` (**prix affichés HT**),
  `6 No-Reply`, `7 Rakuten`, `8 Cdiscount`, `9 Hecate`, `10 Ami(e)` (remise **20 %**).
- **173 351 clients** (dont **131 166** dans le groupe Amazon — imports marketplace), **7 employés actifs**
  (les valideurs de demain), **15 148** clients marqués newsletter.
- **63 fichiers d'override du cœur** dans `override/`, dont :
  - `classes/Customer.php` → remise de bienvenue à l'inscription via `classes/service/WelcomeDiscountService.php`
    (28/12/2025), avec **liste d'exclusion** des e-mails de marketplace (`@cdiscount`, `amazon`, `temu`, `test`, `spam`) ;
  - `classes/Cart.php`, `Carrier.php`, `Link.php`, `order/Order.php`, `Dispatcher.php`,
    `controller/FrontController.php` ;
  - **3 reliquats morts non chargés** : `Customer1.php`, `CustomerV1.php`, `CustomerOK.php` (triple copie de
    l'ancienne logique de remise) — à ne pas confondre avec l'override actif.
  ⇒ Ces overrides sont **hors périmètre du thème**, mais ils conditionnent toute mise à jour PrestaShop
  et doivent être connus avant de concevoir le parcours client.

---

## 6. Images : le backfill WebP ne produit rien

- **0 fichier `.webp`** dans `img/` pour **216 997 `.jpg`**.
- Un cron « Backfill WebP images produit (~950/nuit) » tourne pourtant chaque nuit à 01h35
  (`cron/webpcron/cron_webp_backfill.php`), et la dernière ligne de son log est
  *« Ce script doit être exécuté en ligne de commande uniquement »* ⇒ **le script sort sans rien faire**.
- Catalogue : 26 106 lignes `ps_image`, **4 228 produits** avec au moins une image, **2 191** produits actifs,
  284 catégories actives.

⇒ Deux pistes chiffrées : corriger le backfill (≈217 000 fichiers concernés) **et/ou** générer les formats
modernes à la volée depuis le thème (`srcset` + WebP/AVIF).

---

## 7. Module `aimetadata` (badge IA / AI Act) — installé et actif

- **`aimetadata` 1.2.2, actif**, déployé le **07/09/2026** (`modules/aimetadata/`, `README.md` présent,
  dossier `upgrade/` actif — dernier fichier du module modifié le 17/09/2026 à 12h12).
- Tables : **`ps_ai_image_metadata`** et **`ps_ai_image_metadata_log`**.
- Clés de configuration (noms seuls) : `AIMETADATA_BADGE_ON_THUMBNAILS`, `AIMETADATA_LOG_ENABLED`,
  `AIMETADATA_LOG_LEVEL`, `AIMETADATA_LOG_RETENTION_DAYS`, `AIMETADATA_LOG_LAST_PURGE`.
- **Hooks réellement posés** : `displayAsFirstProductImage` (2), `displayAsLastProductImage` (2),
  `displayProductAdditionalInfo` (4), `actionOnImageResizeAfter` (1), `actionObjectImageDeleteAfter` (2),
  `actionObjectProductDeleteAfter` (12), `actionFrontControllerSetMedia` (11), `displayAdminProductsExtra` (10).

⇒ **Exigence concrète pour le nouveau thème** : appeler `displayAsFirstProductImage` /
`displayAsLastProductImage` **dans la galerie** (fiche produit) et respecter `AIMETADATA_BADGE_ON_THUMBNAILS`
pour les vignettes — sans jamais lire la table SQL directement (le module est le service de métadonnées).

---

## 8. Exploitation, sauvegardes, risques

- **58 tâches cron** : Amazon sur 9 marchés (mise à jour des offres, import des commandes, annulations,
  inventaire FBA, contrôle de stock `fix=1` toutes les 2 h, rapports toutes les 4 h), Cdiscount (offres,
  acceptation, import), Temu (`*/15`), Colissimo (suivi), `hc_retractation` (09h), **vidage du cache à 00h04**,
  **purge des stats à 01h10**, **backfill WebP à 01h35**, newsletter-replicant (mercredi 09h, contrôles visuels
  mercredi 09h30, relevés d'envoi jeudi et vendredi 11h).
- **Sauvegardes** : `/home/djdj2187/backups` ne contient que **12 archives du module `colissimo_essentiel`**
  (2,4 Mo au total) → **aucune sauvegarde du thème ni de la base n'est visible sur le compte**.
  ⚠ **Point de vigilance n°1** : avant toute bascule, exiger une sauvegarde (thème + base) et vérifier
  le dispositif de sauvegarde de l'hébergeur — sinon **aucun rollback**.
- **Logs** : `var/logs` de production **434 Mo** ; `php_errors.log` de la préprod **16 Mo**.
- **Disque** : 1,9 To utilisés / **1,6 To libres** (56 %), inodes 10 % — confortable pour un sandbox.
- **Outils disponibles** : `composer`, `wp` (WP-CLI), Redis, Memcached, Imagick, intl. **Pas de Node.js**
  (⇒ pas de build front obligatoire), pas de `gh`.

---

## 9. Ce que l'audit change dans le plan

| Point | Avant | Après audit |
|---|---|---|
| Phase 4 — tunnel | « écrire un OPC » | **un OPC (`ets_onepagecheckout` 2.8.6) tourne déjà** : habiller/paramétrer ou remplacer, décision à prendre |
| Phase 2 — thème | remplacer `warehouse` | attention : `warehouse` est le **moteur** de 23 modules IQIT qui écrivent dans les pages ; périmètre à trancher |
| Préprod | « on y fait les essais » | **elle n'est pas à jour** (thème + 14 modules) : à rafraîchir ou à remplacer par un sandbox issu de la prod |
| Images | « pas de WebP » | **le backfill WebP existe mais ne produit rien** (0 fichier) : à corriger ou à remplacer par une génération depuis le thème |
| Badge IA | « emplacement à prévoir » | le module est **installé et actif** : hooks précis à câbler dans la galerie |
| Sauvegardes | « à vérifier » | **aucune sauvegarde visible du thème ni de la base** : à exiger avant toute bascule |
| SEO d'URL | « à prévoir » | porté par `ets_awesomeurl` : **hors périmètre du thème** |
