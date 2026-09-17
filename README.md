# the-replicant-theme — refonte du thème de the-replicant.com

Nouveau thème PrestaShop 8.2 pour **the-replicant.com** (boutique de cadeaux originaux et insolites,
hébergement o2switch, compte cPanel `nilgaut`), conçu **de zéro** sur une base vierge, avec une
obsession : **la légèreté**, mobile d'abord.

## Objectifs

1. **Thème autonome `replicant`** — hooks natifs PrestaShop, zéro Bootstrap, zéro jQuery dans le thème,
   CSS à custom properties, JS vanilla en modules ES, icônes SVG, polices auto-hébergées.
2. **Page d'accueil 100 % paramétrable depuis le back-office** via le module compagnon `replicanttheme` :
   grand slider, bandeau promo, catégories mises en avant, sections produits.
3. **Tunnel de vente court** : panier → identification (invité possible) → livraison → paiement sur une
   page → confirmation.
4. **Particuliers** : compte natif, connexion simple, suivi de commande.
   **Professionnels** : formulaire de demande, compte créé en attente, validation par un employé en
   back-office, bascule dans le groupe client « Professionnel ».
5. **Ouvert aux modules externes** (blog `ph_simpleblog`, badge IA du module `aimetadata`, avis,
   réassurance) par feuilles de compatibilité, sans surcharge de templates.
6. **Animations GSAP** discrètes, chargées après le premier rendu, désactivées si
   `prefers-reduced-motion`.
7. **Phase 2** : app mobile (Expo) réutilisant les mêmes design tokens.

## Structure du dépôt

```
the-replicant-theme/
├── themes/replicant/        # le thème PrestaShop 8.2 (squelette à venir)
├── modules/replicanttheme/  # module BO compagnon (slides, bandeau, catégories, sections)
├── docs/
│   ├── plan-developpement.md
│   ├── prompts-claude-design.md
│   ├── audit-2026-09-17-site-public.md
│   └── design/tokens.json   # à venir (source unique : thème + app mobile)
├── outillage/               # scripts de déploiement, mesures, recette
├── memoire.md               # mémoire technique persistante (DECISION-xxx / BUG-xxx)
└── .env.example             # .env = secrets, gitignoré
```

## Contraintes non négociables

- **Jamais de modification du core PrestaShop**, jamais de modification directe d'un module tiers.
- Toute manipulation de la boutique se fait d'abord sur la **préprod** `~/preprod.the-replicant.com`
  (base séparée), la production est en exploitation continue (commandes marketplaces, e-mails).
- **Sécurité** : validation des entrées, permissions employé, tokens CSRF, SQL préparé, échappement
  Smarty, secrets uniquement dans `.env`.
- **Journalisation structurée**, jamais de secret en clair.
- **BDC** : chaque commit est documenté par un CR déposé dans `/home/ubuntu/BDC/BDC/raw/` (ingestion Scrib).

## Environnement mesuré (17/09/2026)

| | |
|---|---|
| PrestaShop | **8.2.3**, PHP 8.1.34 (CLI), MariaDB 11.4.13, thème actif `warehouse`, 103 modules actifs |
| Hébergement | o2switch, compte `djdj2187`, `~/the-replicant.com` (prod, base `djdj2187_pab`) + `~/preprod.the-replicant.com` (base dédiée, **mais thème et modules non alignés**) |
| Home | 1 408 463 o brut / 332 076 o gzip, 317 requêtes, CSS 142 Ko gzip, JS 398 Ko gzip |
| Images | 313 images uniques, 0 WebP / 0 AVIF / 0 `srcset` (0 fichier WebP pour 216 997 JPEG en boutique) |
| Blog | module `ph_simpleblog` 1.8.0 (`/blog`) |
| Espace pro | inexistant (404 sur `/professionnels`, aucun groupe « Professionnel ») |
| Tunnel | **`ets_onepagecheckout` 2.8.6 déjà actif** (Monetico, Alma, PayPal, virement) |
| Badge IA | **`aimetadata` 1.2.2 installé et actif** (`displayAsFirstProductImage` / `displayAsLastProductImage`) |

Détail et méthode : `docs/audit-2026-09-17-site-public.md` (mesures publiques) et
`docs/audit-phase0-2026-09-17.md` (audit SSH lecture seule), preuves brutes dans `docs/preuves/`.

## Commandes

À compléter au fil du développement dans `memoire.md` (§ Commandes). Rien n'est inventé ici tant que
le squelette du thème n'existe pas.
