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

### DECISION-006 — La collecte de la newsletter est partie prenante du chantier
- **Date** : 17/09/2026 · **Sujet** : dépendance externe
- **Décision** : la mise à jour des sélecteurs de la collecte (`newsletter-replicant`,
  `config/selectors.yml`) et une nouvelle fixture de la page d'accueil font partie du périmètre de la
  refonte, et sont livrées **dans le même chantier**.
- **Pourquoi** : la collecte lit la page d'accueil par scraping ; un changement de thème l'aveugle
  silencieusement. Le premier envoi réel a eu lieu le 17/09/2026.

---

## 3. Environnement mesuré (17/09/2026)

- SSH `djdj2187@nilgaut.o2switch.net` **fonctionne** (clé `~/.ssh/id_ed25519`), PHP CLI **8.1.34`.
- Les deux arborescences existent : `~/the-replicant.com` (prod) et `~/preprod.the-replicant.com`.
- Thème en production : `warehouse` (IQIT Elementor + Revolution Slider + Swiper).
- Blog : module `ph_simpleblog`. Espace pro : inexistant.
- Poids mesurés de la page d'accueil : voir `docs/audit-2026-09-17-site-public.md`.
- Audit complet de la base et des modules : **phase 0 — à faire** (voir `docs/plan-developpement.md`).

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
| 0 — Audit & sauvegarde | ☐ en cours |
| 1 — Design (Claude Design) | ☐ prompts livrés, maquettes à produire |
| 2 — Socle du thème | ☐ |
| 3 — Module BO compagnon | ☐ |
| 4 — Tunnel de vente | ☐ |
| 5 — Particuliers & pro | ☐ |
| 6 — Intégrations | ☐ |
| 7 — Recette | ☐ |
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

## 8. Points ouverts

1. Version et réglages du thème `warehouse` en base ; overrides éventuels.
2. Modules et hooks réellement posés, dépendances IQIT Elementor / Revolution.
3. Groupes clients, transporteurs, moyens de paiement, langues et devises.
4. État de fraîcheur de la préprod (copie de la prod ? base à jour ?).
5. Sauvegardes en place sur le compte, espace disque disponible.
6. Le module `aimetadata` est-il installé en boutique, et sous quel hook rend-il son badge ?
