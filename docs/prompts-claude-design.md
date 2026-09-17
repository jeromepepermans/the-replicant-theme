# Prompts Claude Design — refonte the-replicant.com

Ordre d'utilisation : **P0** à l'ouverture du projet (brief maître), puis **P1** (tokens, à valider),
puis les écrans **P2 → P9**. **P10** est réservé à la phase « app mobile ».

Les prompts sont en français, prêts à coller. Les valeurs de couleur proviennent de l'audit du
17/09/2026 (`docs/audit-2026-09-17-site-public.md`) — **ne pas laisser Claude Design en inventer d'autres**.

---

## P0 — Brief maître (à coller en ouverture du projet)

```
Tu conçois la refonte du site e-commerce the-replicant.com (PrestaShop 8.2, FR).
Boutique de cadeaux originaux et insolites, univers festif et décalé, marque familiale et humaine.
Client : particuliers. Cible secondaire : professionnels (revendeurs).

CONTRAINTES NON NÉGOCIABLES
- Mobile first : je veux d'abord la maquette 390×844, puis 1280 et 1440.
- Le poids est un critère de design : pas de vidéo en hero, pas d'image plein écran lourde,
  pas d'illustration décorative gratuite, pas d'ombre portée superflue, pas de blur/glassmorphism,
  pas de dégradés « SaaS ». Les visuels produits sont des photos sur fond clair.
- Accessibilité WCAG 2.2 AA : contraste, focus visibles, cibles tactiles ≥ 44 px, pas d'info par la couleur seule.
- Palette imposée (issue de l'audit du site actuel — ne pas inventer d'autres couleurs) :
  brand-600 #ab5a57 (CTA, texte blanc dessus), brand-500 #d06e6a (accents, bordures),
  brand-100 #f7eceb (fonds doux), or #c6b26d (bandeau promo, texte encre #2b2419 dessus),
  ink-900 #2b2419, ink-600 #6b6152, surface #ffffff / #faf8f5, border #e6e0d6.
- Typographie : Montserrat (déjà la police de la marque) pour les titres ; propose-moi 2 binômes
  corps de texte pertinents, auto-hébergeables, maximum 2 graisses au total.
- Style : chaleureux, artisanal, lisible. Interdits explicites (AI-slop) : dégradé bleu/violet,
  grille de 3 cartes icône+titre+phrase, icône dans un carré arrondi au-dessus de chaque titre,
  tout centré, chiffres géants décoratifs, emoji, Inter par défaut, « Insights/Growth/Scale ».

MÉTHODE
- Annonce d'abord l'archétype de surface de chaque écran (Découvrir / Explorer / Comparer / Configurer / Piloter).
- Pour la page d'accueil : 3 variantes = 1 prudente, 1 fidèle au brief, 1 divergente. Pas des variantes de couleur.
- Chaque écran doit annoter ses ZONES PARAMÉTRABLES, avec le nom exact du champ back-office
  (ex. « zone paramétrable : slides.ordre / slides.date_debut / slides.cta_url »).
- Livre du HTML autonome (CSS et JS inclus), responsive, avec un petit panneau « Tweaks »
  (densité, arrondi, intensité des animations) — le design doit être final quand le panneau est fermé.

AVANT DE COMMENCER : pose-moi les 3 questions dont tu as réellement besoin, puis démarre.
```

---

## P1 — Design tokens & DESIGN.md (à valider avant tout écran)

```
À partir du brief maître, produis le fichier de tokens du site : couleurs (rôles sémantiques),
typographie (échelle fluide avec clamp(), 2 graisses), espacement (base 4 px), rayons, bordures,
élévations, durées et courbes d'animation, points de rupture (390 / 768 / 1024 / 1440), et états
(hover, focus, actif, désactivé, erreur, succès, rupture de stock).
Contraintes : chaque couple texte/fond utilisé doit afficher son ratio de contraste (cible 4,5:1 pour
le texte, 3:1 pour l'UI). Une seule police décorative au maximum.
Sors le tout en variables CSS + un tableau de tokens lisible, exporté aussi en DESIGN.md.
```

---

## P2 — Page d'accueil

```
Conçois la page d'accueil (mobile 390 puis desktop 1440) à partir des tokens validés.
Structure imposée, dans cet ordre :
1. Grand slider en haut (3 à 5 slides, plein largeur) — zone paramétrable : titre, sous-titre, visuel,
   bouton, lien, ordre, dates de diffusion, activation par slide. Mobile : 1 visuel, texte court,
   CTA visible sans scroll.
2. Bandeau promo sous le header et/ou au-dessus du slider (#c6b26d, texte encre, lien, fermable)
   — zone paramétrable : texte, couleur, lien, dates, fermable.
3. Catégories mises en avant (grille de vignettes) — zone paramétrable : catégories choisies, ordre,
   image, nombre de colonnes mobile/desktop, activation.
4. Sections produits : « Nouveautés », « Sélection du moment », 2ᵉ sélection — zone paramétrable :
   source (nouveautés / meilleures ventes / promo / catégorie), nombre de produits, ordre, titre, activation.
5. Réassurance (livraison, paiement, SAV) et un bloc éditorial court qui renvoie au blog.
Contraintes : le hero ne dépasse pas 45 % de la hauteur du viewport mobile ; le carrousel produits se
fait au doigt (scroll-snap) et reste utilisable sans JavaScript.
Livrables : 3 variantes de composition + la version retenue en 390 / 768 / 1440, avec le panneau Tweaks.
```

---

## P3 — Header, navigation, recherche, panier

```
Conçois la navigation : header desktop (logo, recherche, compte, panier avec compteur, mega-menu par
univers de cadeaux), header mobile compact + menu plein écran + recherche plein écran + mini-panier
(panier latéral avec 2 produits). Le header doit rester ultra-léger : distingue ce qui est chargé au
premier rendu de ce qui ne l'est qu'à l'ouverture du menu.
États à livrer : vide, focus clavier, mobile avec clavier ouvert, scrollé (version compacte),
0 produit / 1 produit / rupture de stock.
Zones paramétrables : logo, bandeau annonce, ordre des entrées de menu, univers mis en avant.
```

---

## P4 — Catégorie / listing (filtres inclus)

```
Conçois une page catégorie (ex. Halloween, 70 produits) mobile puis desktop : titre, description courte
repliable, filtres (prix, disponibilité, marque, univers), tri, grille de produits, pagination ou
« charger plus », état vide, état de chargement (squelettes).
Les cartes produit montrent : photo, titre sur 2 lignes maximum, prix TTC, badge promo, badge
« Généré par l'IA » s'il est présent, et la disponibilité.
Mobile : filtres en panneau plein écran, sans perdre la position de scroll.
Zones paramétrables : colonnes mobile/desktop, produits par page, affichage de la description, filtres proposés.
```

---

## P5 — Fiche produit

```
Conçois la fiche produit (mobile puis desktop) : galerie (image principale + miniatures, zoom, plein
écran au clic, changement d'image fluide, badge IA incrusté dans la galerie ET sur les vignettes),
titre, prix TTC, disponibilité claire, sélecteurs de variantes, quantité, bouton « Ajouter au panier »
collant en bas sur mobile, réassurance, description, caractéristiques, avis, produits complémentaires.
Réserve un emplacement explicitement paramétrable pour la mention AI Act « Généré par l'IA ».
```

---

## P6 — Tunnel de commande (le cœur du brief : court et simple)

```
Conçois le tunnel de commande en 4 étapes visibles, faisables sans créer de compte (option invité) :
1) Panier (édition des quantités, code promo, frais de port estimés, upsell discret)
2) Identification (connexion rapide / e-mail + livraison, choix « particulier / professionnel »)
3) Livraison (transporteurs, point relais, adresses, facturation)
4) Paiement sur UNE seule page (récapitulatif repliable, moyens de paiement, bouton unique)
puis Confirmation claire (numéro, suivi, e-mails annoncés).
Contraintes : aucune étape ne dépasse un écran mobile ; chaque étape est atteignable en 1 clic depuis la
précédente ; erreurs de champ au bon endroit ; jamais de perte de panier au retour arrière.
Livrable : maquettes des 4 étapes + confirmation + états d'erreur, mobile d'abord, plus un prototype
cliquable du parcours complet.
```

---

## P7 — Compte particulier

```
Conçois : connexion / création de compte (ultra court : e-mail + mot de passe, ou lien de connexion
magique si tu le recommandes), mot de passe oublié, tableau de bord client, liste des commandes,
détail de commande avec suivi de livraison, adresses, retours/SAV, préférences et consentements.
Mobile first, focus clavier visible, aucune donnée affichée inutilement.
```

---

## P8 — Espace professionnel (demande soumise à validation)

```
Il n'existe AUCUN espace pro aujourd'hui : tout est à créer.
Livre :
1) une page de présentation « Professionnels / revendeurs » (argumentaire + CTA)
2) un formulaire de demande en 3 étapes courtes — société (raison sociale, SIRET, TVA intra, site),
   responsable (nom, fonction, e-mail pro, téléphone), activité (type, volume annuel, canaux) — avec
   dépôt d'un extrait Kbis / avis de situation, mentions RGPD et récapitulatif avant envoi
3) un écran « demande envoyée / en cours de validation » avec délai annoncé et contact
4) les gabarits d'e-mail : confirmation client + notification équipe + décision (validé / refusé)
5) un écran back-office « Demandes pro » : liste, filtres (en attente / validée / refusée), fiche
   détaillée, boutons Valider / Refuser avec motif obligatoire, journal des actions.
Le vocabulaire et l'ordre des champs doivent correspondre exactement aux champs du module back-office.
Annote chaque champ avec son nom technique (ex. pro.siret, pro.tva_intra, pro.statut).
```

---

## P9 — Contenus : blog, pages, 404

```
Conçois : liste des articles du blog (magazine, catégories, article mis en avant, pagination),
page article (confort de lecture, sommaire, produits liés, partage, articles similaires),
pages CMS (livraison, retours, CGV, contact avec carte), recherche avec résultats vides, page 404 utile.
Le blog est fourni par un module externe : prévois une feuille de style de compatibilité qui habille ses
gabarits sans les surcharger, et indique explicitement les zones que le thème ne contrôle pas.
```

---

## P10 — App mobile (phase 2 uniquement)

```
Réutilise exactement les tokens validés et conçois les écrans de l'app mobile the-replicant :
onboarding (1 écran, pas 3), accueil (mêmes blocs que la home web : promo, catégories, sélections),
recherche, catégorie, fiche produit (galerie plein écran, badge IA, ajout panier), panier,
tunnel de paiement (réutilise les 4 étapes de l'app web), compte, suivi de commande.
Contraintes : natif (pas un site encapsulé), cibles tactiles, safe areas, mode hors-ligne dégradé,
chargement par squelettes. Livre les écrans en 390×844 avec les états vide / chargement / erreur.
```

---

## Rappels d'usage

- Les maquettes produites sont du **HTML autonome** : les conserver dans `docs/design/` du dépôt,
  versionnées, pour servir de référence aux tests de recette.
- Toute annotation « zone paramétrable » devient un champ du module `replicanttheme` : le design
  **est** la spécification du back-office, pas une illustration.
