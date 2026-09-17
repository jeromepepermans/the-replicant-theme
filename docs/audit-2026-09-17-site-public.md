# Audit lecture seule — the-replicant.com (mesures publiques)

**Date des mesures** : 17/09/2026 (CEST)
**Méthode** : requêtes HTTP/2 en lecture seule depuis le VPS Hermes, `User-Agent` générique, aucun
formulaire, aucun POST, aucune écriture. Source de vérité = ce qui est **réellement servi**.
**Périmètre** : vitrine publique. La base (thème en configuration, modules, hooks, groupes clients,
moyens de paiement, langues) relève de l'audit SSH — voir `plan-developpement.md` phase 0.

## 1. Socle technique

| Élément | Mesure |
|---|---|
| Thème actif | `themes/warehouse` |
| Constructeur de pages | IQIT Elementor (`elementor-widget …`) |
| Sliders | Revolution Slider (2 widgets sur la home, alias `slider-5` / `slider-6`) |
| Carrousels | Swiper (405 occurrences dans le HTML) |
| Blog | module `ph_simpleblog` (`/blog`, `/blog/<catégorie>/<article>`) |
| Serveur | `o2switch-PowerBoost-v3`, HTTP/2, HTML en `cache-control: no-store` |
| TTFB page d'accueil | 0,545 s (total 0,639 s) |

## 2. Poids et requêtes (page d'accueil)

| Ressource | Brut | Compressé (gzip) |
|---|---|---|
| HTML | 1 408 463 o | 332 076 o |
| `themes/warehouse/assets/cache/theme-eb58dc1794.css` | 584 219 o | 142 164 o |
| `themes/warehouse/assets/cache/bottom-6b5ec91793.js` | — | 398 006 o |
| FontAwesome (CSS + 3 woff2) | — | 31 566 o (+ polices) |

- **317 requêtes uniques** (images + CSS + JS) sur la seule page d'accueil.
- **400 balises `<img>`**, **313 URL d'images uniques**.

## 3. Images

- Formats référencés : **354 jpg, 45 png, 1 gif** — **aucun** WebP, **aucun** AVIF.
- **0 attribut `srcset`**, **0 balise `<source>`**, **aucune `<picture>` fonctionnelle** : les
  **226 balises `<picture>`** présentes n'enveloppent qu'un `<img loading="lazy">` — gain nul, poids mort.
- `loading="lazy"` présent 226 fois (bon point à conserver).
- Visuels lourds connus (relevés antérieurs, BDC) : GIF animé de 536 Ko, PNG de 1 009 Ko.

## 4. Polices

- `fonts.googleapis.com` : **Montserrat 400/700** (police de marque) + **Roboto 400**.
- FontAwesome 6.7.2 en police d'icônes (3 fichiers woff2 préchargés).
- Conséquence : appels tiers (RGPD + latence) et deux familles dont une seule est réellement brandée.

## 5. Charte couleur relevée (CSS servi + HTML)

| Rôle | Valeur | Occurrences | Contraste mesuré |
|---|---|---|---|
| Boutons / CTA | `#d06e6a` | 17 (CSS) | blanc dessus **3,43:1** ⚠ |
| Rose clair du thème | `#d79996` | 162 (CSS) | blanc **2,36:1** ⚠ |
| Bandeau promo doré | `#c6b26d` | 6 (HTML, `background-color`) | blanc **2,10:1** ⚠ · noir **9,99:1** ✅ |
| Brun foncé (repris par la newsletter) | `#3a3220` | — | blanc **12,67:1** ✅ |
| Fonds | `#f4f2f2`, `#f8f9fa`, `#e3e3e3` | — | — |
| Texte | `#212529`, `#3b3b3b` | — | 14,63:1 sur `#f8f9fa` ✅ |
| Teal `#2fb5d2` | `--bs-primary` Bootstrap | 31 | **défaut du thème jamais remplacé** → à nettoyer |

**Aucune de ces valeurs ne vient de la configuration du thème en base** (à confirmer en phase 0) :
elles sont lues dans le CSS compilé réellement servi.

### Tokens proposés (dérivés, accessibles)

| Token | Valeur | Usage | Contraste |
|---|---|---|---|
| `brand-600` | `#ab5a57` | CTA plein, texte blanc | **4,85:1** ✅ |
| `brand-500` | `#d06e6a` | accents, bordures, grands aplats | 3,43:1 (UI) |
| `brand-100` | `#f7eceb` | fonds doux | — |
| `gold` | `#c6b26d` | bandeau promo, **texte encre obligatoire** | encre 9,5:1 ✅ |
| `ink-900` | `#2b2419` | texte principal | 15,34:1 ✅ |
| `ink-600` | `#6b6152` | texte secondaire | 6,07:1 ✅ |
| `surface` | `#ffffff` / `#faf8f5` | fonds | — |
| `border` | `#e6e0d6` | séparateurs | — |

## 6. Parcours et contenus

| Élément | État mesuré |
|---|---|
| Espace professionnel | **inexistant** — `/professionnels` 404, `/content/9-professionnels` 404 |
| Compte client | `/connexion`, `/mon-compte` (natif PrestaShop) |
| Catégories mises en avant | portées par des visuels dans `<img/cms/Revolution/Images catégories/>` + menu |
| Titres de section | tantôt texte (`<h2 class="…elementor-heading-title…">`), tantôt images |
| `robots.txt` | ouvre explicitement GPTBot, ClaudeAI, ClaudeBot, OAI-SearchBot, PerplexityBot |

## 7. Dette et risques identifiés

1. **Poids** : home à 332 Ko compressés, 317 requêtes, CSS 142 Ko, JS 398 Ko — cible du nouveau thème :
   **< 90 Ko / < 60 requêtes / < 45 Ko / < 110 Ko**.
2. **Images** : aucun format moderne, aucun `srcset`, 226 `<picture>` décoratives inutiles.
3. **Dépendances** : Revolution Slider + IQIT Elementor + FontAwesome complet = poids et dette de mise à jour.
4. **Constraste** : la charte actuelle est illisible pour l'accessibilité (blanc sur or 2,10:1) — arbitrage
   à faire (le bandeau conserve `#c6b26d` mais passe en texte encre).
5. ⚠ **Rupture à anticiper** : la newsletter (`newsletter-replicant`) collecte la page d'accueil par
   scraping (sélecteurs `config/selectors.yml`, fixture datée, mapping `cars.links`). **Un changement de
   thème casse la collecte** → mise à jour des sélecteurs + nouvelle fixture dans le même chantier.
