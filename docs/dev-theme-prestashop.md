# Développer un thème PrestaShop 8.2 **évolutif vers la 9** — documentation de référence

> Vérifié le **17/09/2026**. Toutes les compatibilités ci-dessous sont **lues dans les fichiers officiels**
> (`config/theme.yml` des thèmes Hummingbird, releases GitHub PrestaShop, devdocs), pas de mémoire.

---

## 1. Réponse courte

**Oui**, la documentation existe, elle est officielle et à jour — mais elle impose un choix :
il n'existe **aucun thème Hummingbird compatible à la fois avec notre 8.2.3 et avec la 9.1+**.
Hummingbird est **verrouillé par version de PrestaShop** (matrice publiée dans le dépôt) :

| Branche Hummingbird | `theme.yml` → `meta.compatibility` | Framework | Dernier commit | État |
|---|---|---|---|---|
| `1.x` (v1.0.1) | **`from: 8.1.0 to: ~`** | Bootstrap **5.2.0** | 09/09/2025 | **retiré de la matrice officielle** (plus maintenu) |
| `2.0.0` | `from: 9.1.0 to: ~9.1.0` | Bootstrap 5.3.3 | — | publié |
| `2.x` = `2.1.0` | `from: 9.2.0 to: ~9.2.0` | Bootstrap 5.3.3 | **14/09/2026** | **maintenu** |
| `develop` | `~10.0.0` | — | — | prochain majeur |

Matrice officielle publiée dans le README du dépôt (branche `develop`) : `develop → ~10.0.0`, `2.x → ~9.2.0`,
`2.1.0 → ~9.2.0` (publié), `2.0.0 → ~9.1.0` (publié) — **la ligne `1.x` n'y figure plus**.

**État du canal de versions PrestaShop (releases GitHub, relevé le 17/09/2026)** :
`9.1.5` (18/08/2026, stable) · `9.2.0-beta.1` (22/07/2026, préversion) · **`8.2.8` (18/08/2026, stable)**.

⚠ **Notre boutique est en 8.2.3 alors que 8.2.8 est publié** : la trajectoire « vers la 9 » commence donc
logiquement par une **montée de patch 8.2.x** (correctifs de sécurité, sans rupture d'API), avant toute
considération sur le canal 9.1/9.2.

Conséquence : on ne peut pas « cloner Hummingbird » et avoir un thème qui marche aujourd'hui sur 8.2.3
**et** demain sur 9.2. Il faut choisir la stratégie (§4), pas le raccourci.

---

## 2. Ce que dit la documentation officielle (sources)

### Devdocs — documentation développeur
| Page | URL |
|---|---|
| Thèmes (v9.1+) | https://devdocs.prestashop-project.org/9/themes/ |
| Hummingbird (référence) | https://devdocs.prestashop-project.org/9/themes/hummingbird/ |
| Structure d'un thème + `theme.yml` complet | https://devdocs.prestashop-project.org/9/themes/concepts/theme-structure/ |
| Créer un thème **à partir d'Hummingbird** | https://devdocs.prestashop-project.org/9/themes/create-a-theme/from-hummingbird/ |
| Démarrage rapide | https://devdocs.prestashop-project.org/9/themes/getting-started/quick-start/ |
| Prérequis outils | https://devdocs.prestashop-project.org/9/themes/getting-started/requirements/ |
| Conventions CSS (Bootstrap 5.3, BEM, `@layer`) | https://devdocs.prestashop-project.org/9/themes/hummingbird/css-conventions/ |
| Conventions JavaScript (`data-ps-*`, sans jQuery) | https://devdocs.prestashop-project.org/9/themes/hummingbird/javascript-conventions/ |
| Changements du cœur 9.0 (PHP, Symfony 6.4, dépendances retirées) | https://devdocs.prestashop-project.org/9/modules/core-updates/9.0/ |
| **Docs thème v8** (celles qui s'appliquent à notre 8.2.3) | https://devdocs.prestashop-project.org/8/themes/getting-started/ |
| `theme.yml` (v8) | https://devdocs.prestashop-project.org/8/themes/getting-started/theme-yml/ |
| Organisation d'un thème (v8) | https://devdocs.prestashop-project.org/8/themes/getting-started/theme-organization/ |

### Dépôt Hummingbird (code + matrice de compatibilité)
- https://github.com/PrestaShop/hummingbird — licence **AFL-3.0**, branches `1.x`, `2.x`, `master`, `develop`.
- Contient un `docker/` (docker compose prêt à l'emploi), un **Storybook**, une CI (stylelint, eslint, TypeScript), un `CLAUDE.md` et un `CONTEXT.md`.
- Le README publie la **matrice de compatibilité thème ↔ version PrestaShop** (à consulter à chaque montée de version).

### PrestaShop 9 — ce qui compte pour nous
- PS **9.0** : PHP **8.1 → 8.4**, **Symfony 6.4 LTS**, **Admin API** (API Platform : JSON-LD, GraphQL, JSON:API),
  dépendances retirées (`guzzlehttp/guzzle`, `swiftmailer`, `sensio/framework-extra-bundle`…), **minimum Node 20** pour
  compiler les assets du cœur, migration **SwiftMailer → Symfony Mailer** (SSL d'e-mail supprimé).
- **À partir de 9.1** : **Hummingbird devient le thème par défaut**, le thème **Classic est déprécié pour tout
  nouveau développement** (il reste pour compatibilité), architecture **sans jQuery**, **accessible par défaut**
  (exigences EAA).
- ⚠ **Le front reste en Smarty `.tpl`** : les gabarits de Hummingbird 1.x **et** 2.x sont des `.tpl`
  (`templates/page.tpl`, `index.tpl`, `catalog/`, `checkout/`, `customer/`, `layouts/`). « Twig » concerne le cœur
  et le back-office, **pas** les gabarits de thème front. C'est une **bonne nouvelle** pour nous : notre
  architecture Smarty reste valable en 9.x.

---

## 3. Contraintes de notre cible réelle

| | |
|---|---|
| Boutique aujourd'hui | PrestaShop **8.2.3**, PHP CLI **8.1.34**, MariaDB 11.4.13, 103 modules actifs, 63 overrides du cœur |
| o2switch | **pas de Node.js** ⇒ la compilation des assets se fait **hors du serveur** |
| VPS Hermes | Node **v22.23.2**, npm **10.9.8** ⇒ **satisfait** l'exigence « Node 20.x + npm 8+ » de Hummingbird v2 |
| Livraison | thème compilé (`assets/`) poussé par `rsync` sur la préprod, jamais de build sur l'hébergement |

---

## 4. Stratégie — **arrêtée le 17/09/2026 : conventions Hummingbird, code à nous, zéro framework**

Les trois voies possibles, expliquées en clair :

| Voie | Ce que c'est, en clair | Coût | Risque |
|---|---|---|---|
| **A — Forker Hummingbird `1.x`** | On part du code du thème de démarrage officiel compatible 8.x, on retire son look de démo et on construit le design dessus. | rapide au départ | branche **abandonnée depuis 09/2025**, embarque **tout Bootstrap** (contraire à la cible de poids), et la bascule 2027 vers Hummingbird 2.x (9.2) serait **un portage réel** |
| **B — Thème vierge aux conventions Hummingbird** ✅ | On écrit notre propre thème de zéro, mais **avec les règles de construction de la référence future** : mêmes noms de classes (BEM), même façon d'accrocher le JavaScript (`data-ps-*`), pas de jQuery, héritage de gabarits, accessibilité d'abord. | on écrit tout (c'était déjà la demande) | faible : le code nous appartient, on ne charge que ce qu'on utilise, et la bascule 2027 est un **port**, pas une réécriture |
| **C — Migrer la boutique en 9.x d'abord** | Passer la boutique en PrestaShop 9 avant de commencer le thème. | énorme | **très élevé** : 103 modules, 63 `override/` du cœur et tout l'écosystème IQIT à porter d'abord |

**Pourquoi B est retenue** : les réponses de Jérôme du 17/09 (« le plus léger, mais évolutif et modulable »
+ « l'objectif sera de passer sur la 9 l'année prochaine ») **éliminent A** — un fork embarque un framework
entier et saute en 2027 — et **reportent C à 2027**, où elle devient justement la phase 10.
B est la seule voie compatible, en même temps, avec le budget de poids et avec l'échéance 2027.

**Décisions liées** : DECISION-016 (conventions Hummingbird dès maintenant), **DECISION-017 (aucun framework
CSS : tokens + utilitaires maison + composants modulaires)**, DECISION-018 (bascule PrestaShop 9 en 2027,
avec montée 8.2.3 → 8.2.8 dès cette année).

### Règles d'écriture qui rendent le thème « prêt pour 9.1+ »

1. **Gabarits Smarty avec héritage** (`{extends}` / `{block}`) — jamais de copier-coller de fichier entier.
2. **`data-ps-ref` / `data-ps-action` / `data-ps-target` / `data-ps-component` / `data-ps-state`** dès la
   première ligne de JS : c'est la convention de la référence 9.1+, et elle découple le CSS du comportement.
3. **Aucun jQuery dans le code du thème** (jQuery reste chargé par le cœur pour les modules tiers — on ne le
   supprime pas, on ne l'utilise pas).
4. **BEM partout**, `@layer` pour la cascade, tokens en **custom properties** — le CSS survivra au portage.
5. **Événements par l'objet global `prestashop`** (émetteur) et écoute des événements PrestaShop plutôt que
   de recâbler les modules.
6. **Aucune API supprimée en 9.0** : pas de `guzzle`, pas de `SwiftMailer`, pas de dépendance au cœur retirée
   (le thème n'utilise pas de PHP serveur autre que Smarty, on est tranquilles — mais le **module compagnon**
   devra respecter ça).
7. **`theme.yml` complet et honnête** (`meta.compatibility`, `framework`, `available_layouts`,
   `global_settings.image_types`) : ⚠ **l'activation d'un thème REMPLACE tous les types d'images** — les
   types doivent être déclarés **complets** (c'est destructif) et inclure ceux nécessaires au badge IA.
8. **Point de bascule à écrire dès maintenant** : `docs/theme-9-migration.md` — liste des écarts à traiter
   le jour où la boutique passe en 9.2 (types d'images, `theme.yml`, conventions, suppression de jQuery côté
   cœur, Admin API pour l'app mobile).

---

## 5. Ce qui reste à trancher

1. **Voie A, B ou C ?** (recommandation : B)
2. Le thème part-il **sans framework CSS** (recommandé pour la légèreté) ou avec un **sous-ensemble Bootstrap 5.3**
   aligné sur Hummingbird (plus proche de la référence, plus lourd) ?
3. La **bascule vers PrestaShop 9** est-elle un objectif daté par Jérôme, ou une trajectoire souhaitée ?
   (elle conditionne le budget de portage et la priorité donnée au module compagnon)
