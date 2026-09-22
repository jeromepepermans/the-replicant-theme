# Prompts OpenDesign — les écrans restants (the-replicant.com)

**Mode d'emploi, en trois lignes.**
① Tout se passe **dans le même projet** OpenDesign (`Refonte Du Thème Prestashop 8 2`) et **la même
conversation** : ne jamais repartir d'un projet neuf, sinon on reperd l'accueil validé.
② On colle le prompt de la page **tel quel**, rien devant, rien derrière.
③ À la fin de chaque écran : la porte de validation se contrôle **avant** de passer au suivant, et une
correction se demande **dans la même conversation**.

**La règle qui a fait réussir l'accueil** : la référence d'abord. L'agent reprend l'accueil validé et le
système de design du projet ; il **n'invente ni composition, ni couleur, ni police**. C'est ce qui manquait
à la première tentative, produite de zéro. On ne recommence plus jamais sans référence.

---

## Rappels à glisser dans CHAQUE prompt (le bloc ci-dessous)

```
Reprends la composition de l'accueil validé de ce projet (accueil.html) et le système de design du projet
(the-replicant-systeme-de-design.html, the-replicant-tokens.css). N'invente ni composition, ni couleur, ni
police : tout vient de là. Mobile d'abord, points de rupture 390 / 768 / 1024 / 1440, aucune largeur fixe en
pixels. Annonce l'archétype de surface de l'écran. Annote chaque zone paramétrable avec le nom exact du champ
back-office attendu. Aucun texte sous 12 px, cibles tactiles 44×44 px, anneau de focus visible, aucune
information portée par la seule couleur, tout s'arrête en prefers-reduced-motion. Prix HT pour le groupe
« Compte pro » (−20 %) et TTC pour les autres (−20 %), toujours avec la mention explicite à côté du prix.
2 badges maximum par carte et « Nouveau » seulement sur les produits réellement récents. Aucun défilement
horizontal de page ; les rangées qui défilent n'affichent aucune barre visible mais portent tabindex="0",
role="region" et un aria-label. Fichier autonome : CSS et JS inclus, aucune bibliothèque, aucune requête
externe. Termine en listant précisément tes écarts avec la référence et tes hypothèses.

Deux règles de la boutique, valables sur TOUS les écrans :
① Pas d'images de décoration ni de texte descriptif à l'écran, SAUF quand cela sert le référencement.
Concrètement : aucun bandeau image de catégorie ; aucune description courte affichée (elle sert de meta
description au référencement si la boutique la remplit, donc elle se saisit en back-office mais ne s'affiche
pas) ; la description longue d'une catégorie ou d'un produit est conservée EN TEXTE, EN BAS de page — Google
la lit et le visiteur la trouve s'il la cherche — mais jamais en haut, jamais en grand, jamais en
illustration. Si un texte ne sert ni au visiteur de passage, ni au référencement, il ne s'affiche pas.
② Les produits s'affichent AU FUR ET À MESURE DU SCROLL, par lots, jusqu'au DERNIER produit : pas de
pagination, pas de « page suivante », pas de bouton « voir plus » à cliquer. La suite se charge toute seule
quand le visiteur approche du bas. Derrière, chaque lot conserve un vrai lien cliquable (pour que Google
parcoure tout le catalogue) et la fin de liste annonce « vous avez tout vu ».
```

---

## 4 bis. L'EN-TÊTE ET LE MENU — à faire AVANT les pages suivantes

**Pourquoi avant** : l'en-tête est commun à tous les écrans. Le corriger maintenant, c'est le corriger une
seule fois. Le faire après, c'est le refaire sur chaque page livrée.

```
L'en-tête ne contient pas toutes les catégories de la boutique : reprends-le entièrement sur la base
ci-dessous, en deux lignes PLEINE LARGEUR, en gardant la composition, les jetons, la palette et le bandeau
promotionnel déjà validés.

LIGNE DU HAUT (72 px au repos, 56 px au défilement) : l'emblème du logo à gauche (jamais le wordmark seul,
illisible sous 96 px — le nom s'écrit en texte à côté) ; la recherche au centre (champ + loupe, placeholder
« Je cherche un produit ») ; à droite « Mon compte » (connexion, création de compte, commandes), le panier
avec son compteur à rebond, « FR / € ».

LIGNE DU BAS (pleine largeur, bordure haute fine) : à gauche cinq entrées — « Nos produits » (qui ouvre le
grand menu), « Nouveautés », « Bon plan », « Thèmes », « Moins de 5 € » ; à l'EXTRÊMITÉ DROITE de cette même
ligne, « Accès professionnels ». Les quatre raccourcis sont visuellement distincts du catalogue : texte
#a35200 sur fond #fff9d6, et fond #fe8200 plein pour « Bon plan » quand une promotion est active, « Nos
produits » restant en encre. Chacun mène à une vraie page, jamais à une page vide.

LE GRAND MENU (« Nos produits ») :
- il s'ouvre AU CLIC, et au survol sur les appareils qui ont une souris — jamais au survol seul, sinon il est
  inutilisable au doigt. L'arrière-plan se voile d'encre à 60 %, avec un flou de 2 px seulement là où le
  navigateur le sait faire, et aucun flou ailleurs ;
- à gauche, les cinq catégories mères : Maison, Mode et Bien-Être, Fêtes et Événements, Loisirs, Pistolets
  à billes. Au survol, fond #fee300 et texte en encre — jamais de blanc sur le jaune ;
- au survol ou au focus d'une catégorie mère, ses sous-catégories apparaissent à gauche du panneau et leurs
  enfants à droite, répartis en TROIS COLONNES automatiques : c'est ce qui évite d'avoir à défiler, la
  branche Maison comptant une quarantaine de sous-catégories. La hauteur du panneau ne dépasse jamais la
  hauteur de la fenêtre ;
- la couleur guide la profondeur : mère = encre ; sous-catégorie = fond chaud très clair et bordure gauche
  #fe8200 ; enfant = fond blanc, texte secondaire, survol #fff9d6 ;
- LES TROIS NIVEAUX SONT CLIQUABLES, chacun vers sa page. Un titre cliquable n'ouvre pas le panneau : le
  titre mène à sa page, le survol ouvre le panneau. Pas de double action sur un même élément ;
- en bas du panneau, une ligne discrète « Tout voir dans Maison » ;
- au clavier : Échap ferme, les flèches parcourent, le focus reste dans le panneau tant qu'il est ouvert et
  revient sur « Nos produits » à la fermeture ;
- sous 1024 px, le même contenu devient un ACCORDÉON plein écran : catégories empilées, chaque niveau se
  dépliant, bouton retour en haut, recherche accessible en tête.

LE MENU « Thèmes » : il s'ouvre sous la ligne du bas et révèle les thèmes AVEC LEURS IMAGES — six au
maximum, vignettes carrées de 120 px, WebP, dimensions déclarées, chargement différé. C'est une bande de
navigation, pas une galerie.
Champs : theme_actif, theme_titre, theme_image, theme_lien, theme_ordre.

RÈGLE DE SOURCE, pour tous les menus : rien ne s'écrit en dur. « Nos produits » vient de l'arbre réel des
catégories, « Nouveautés » des produits triés par date de création, « Bon plan » des remises réellement en
cours, « Moins de 5 € » des produits sous ce prix. Le module compagnon lira tout cela en base.
Champs : menu_source, menu_profondeur (3 niveaux), menu_accueil_libelle, menu_accueil_actif, menu_ordre,
menu_colonnes, menu_raccourcis_actifs, raccourci_nouveautes_actif, raccourci_bonplan_actif,
raccourci_bonplan_seuil (nombre minimum d'offres pour l'afficher), raccourci_moins5_actif,
raccourci_moins5_seuil (nombre minimum de produits), pro_lien_libelle (« Accès professionnels »),
pro_lien_url, pro_lien_position (droite de la ligne du bas).

Le reste de la page ne change pas. Livrable : accueil.html (nouvelle version) + la liste de ce que tu as changé.
```

**La porte de validation de l'en-tête** : deux lignes pleine largeur à 1440 px ; la recherche est utilisable
au clavier ; « Accès professionnels » est bien à l'extrémité droite de la ligne du bas ; **aucune catégorie
manquante** (l'arbre complet est parcourable sur les trois niveaux) ; **aucun défilement** dans le panneau à
1024 px comme à 1440 px ; aucun vide entre un item et son panneau ; le menu s'ouvre au clic et se ferme par
Échap ; à 390 px la même navigation est utilisable au doigt ; aucune couleur de texte inventée (jamais de
blanc sur le jaune ou l'orange) ; le poids de l'en-tête reste sous 12 Ko compressés, images des thèmes
comprises.

---

## 5. Page de catégorie (le listing) — archétype **Explorer**

```
Écran : la page de catégorie, celle où l'on parcourt un univers (Maison, Mode et Bien-Être, Fêtes et
Événements, Loisirs, Pistolets à billes). Archétype : Explorer.
Contenu, dans l'ordre : fil d'Ariane, titre de la catégorie, la barre de filtres, la grille de produits, les
sous-catégories s'il y en a, et une description longue EN TEXTE EN BAS (référencement uniquement,
paramétrable). NI image de bandeau, NI description courte, NI pagination.
Filtres : au maximum trois à l'écran, la catégorie restant visible en premier. Prévois les filtres par
prix (fourchette), par nouveauté et par disponibilité. Chaque filtre appliqué s'affiche comme une puce
retirable, et un bouton « tout effacer » apparaît dès qu'un filtre est actif.
Champs à annoter : cat_titre, cat_description_bas (référencement uniquement, ne s'affiche pas si elle est
vide), cat_sous_categories, filtre_prix_min, filtre_prix_max, filtre_nouveaute, filtre_disponible,
tri_defaut, produits_par_lot (24 par défaut), cat_meta_description (référencement, jamais affichée).
Cartes produit : reprends exactement celles de l'accueil (visuel carré, nom, prix avec mention HT ou TTC,
2 badges maximum).
Barre de tri et de comptage : « N produits », tri par défaut / prix croissant / prix décroissant / nouveautés.
État vide à prévoir et à dessiner : « aucun produit ne correspond à ces filtres », avec le bouton pour
effacer les filtres — jamais de page blanche.
Chargement AU FUR ET À MESURE DU SCROLL, par lots de 24, jusqu'au DERNIER produit : aucune page suivante.
Réserve la hauteur des cartes pendant le chargement (aucun saut de mise en page) et affiche « vous avez tout vu »
quand la liste est épuisée. Dans le code, chaque lot garde un vrai lien cliquable vers la suite, pour que
Google parcoure l'intégralité du catalogue sans JavaScript.
```

**La porte de validation de cette page** : à 390 px la grille tient sur une colonne et les filtres
s'ouvrent dans un panneau ; à 1024 px on voit trois ou quatre colonnes ; le fil d'Ariane est cliquable ;
l'état vide est dessiné ; le bas de liste annonce « vous avez tout vu » ; aucune pagination nulle part ;
aucun débordement horizontal ; aucun saut de mise en page pendant le chargement.

---


## 6. Fiche produit — archétype **Configurer**

```
Écran : la fiche produit. Archétype : Configurer. C'est l'écran qui doit convertir en 60 secondes.
Contenu, dans l'ordre : fil d'Ariane, galerie (image principale + miniatures + zoom), titre, prix avec sa
mention HT ou TTC, disponibilité, le choix des options, la quantité, le bouton d'ajout au panier, les
points de réassurance, la description, les caractéristiques, l'avis produit s'il existe, et enfin les
produits associés.
Options : nos produits sont souvent personnalisables — prévois un champ de gravure ou de texte
personnalisé (texte libre, longueur limitée, compteur de caractères, avertissement si vide), et décline-le
sur le prix quand l'option est payante. Chaque option a ses trois états : normal, sélectionné, désactivé
indisponible.
Champs à annoter : galerie_images, image_principale, badge_produit, prix_affiche_ht_ttc, stock_disponible,
option_gravure_active, option_gravure_longueur_max, option_gravure_supplement, quantite_min,
quantite_max, delai_livraison, avis_affiches, produits_associes.
Stock : « Épuisé » s'affiche quand la quantité disponible est nulle — en encre, jamais en rouge. Un
compte à rebours ne s'affiche que s'il existe une date de fin réelle.
Le bouton d'ajout au panier reste visible en permanence sur mobile (barre collante en bas), et le compteur
du panier montre son rebond au clic.
Rien d'animé dans le tunnel : sur cette page, les seuls mouvements autorisés sont l'apparition douce des
blocs et le rebond du compteur.
```

**La porte de validation** : à 390 px la galerie et le bouton d'ajout restent accessibles sans zoom ; les
trois états de chaque option sont dessinés ; le champ de gravure affiche son compteur ; « Épuisé » n'est pas
rouge ; le focus clavier traverse galerie, options, quantité, bouton, dans cet ordre.

---

## 7. Panier — archétype **Piloter**

```
Écran : le panier. Archétype : Piloter. Ici, aucune animation, aucun élément décoratif : on doit pouvoir
modifier une quantité et payer sans la moindre distraction.
Contenu : la liste des articles (visuel, nom, options choisies, prix unitaire avec mention HT ou TTC,
sélecteur de quantité, bouton retirer), le récapitulatif (sous-total, livraison, taxes si le client est un
professionnel, total), le champ code de réduction, les moyens de paiement réellement disponibles
(Monetico, Alma, PayPal, virement), le bouton de validation, et un lien de retour aux achats.
Prévois l'état vide du panier (illustration sobre et bouton « découvrir la boutique »), l'état « code de
réduction invalide » et l'état de chargement de la mise à jour de quantité.
Champs à annoter : panier_lignes, panier_quantite_max, panier_code_reduction, panier_frais_port,
panier_message_livraison_offerte_seuil, panier_moyens_paiement, panier_bouton_validation,
panier_texte_securite.
Le récapitulatif reste visible en permanence sur desktop (colonne collante) et se place en bas sur mobile.
```

**La porte de validation** : aucun mouvement hormis les transitions de mise à jour ; les totaux sont
alignés et lisibles ; l'état vide est dessiné ; les trois moyens de paiement sont montrés avec leurs vrais
noms ; le parcours clavier va de la liste au bouton de validation sans piège.

---

## 8. Tunnel de commande — archétype **Piloter**

```
Écran : le tunnel de commande, en une page à étapes (identité, adresse de livraison, adresse de
facturation, transporteur, paiement, confirmation). Archétype : Piloter.
Règle absolue : AUCUNE animation, aucun effet, aucune distraction — le tunnel ne bouge pas. Pas de bandeau
promotionnel, pas d'étincelles, pas de carrousel : la festivité s'arrête à l'entrée du tunnel.
Contenu : l'indicateur d'étapes (avec l'étape courante, les précédentes cliquables, les suivantes non),
les formulaires avec leurs libellés et leurs erreurs, le récapitulatif de commande compact, et le bouton
de validation à chaque étape.
Champs à annoter : tunnel_etapes, tunnel_libelle_etape_1, tunnel_libelle_etape_2, tunnel_libelle_etape_3,
tunnel_pays_livraison, tunnel_transporteurs, tunnel_frais_port_offert_seuil, tunnel_paiement,
tunnel_message_securite, tunnel_adresses_enregistrees.
Chaque champ obligatoire manquant affiche son message d'erreur sous le champ, en erreur (#c1121f) et en
texte — jamais par la couleur seule. Le bouton de validation indique l'état de chargement pendant l'envoi.
```

**La porte de validation** : aucun `@keyframes` ni transition sur cet écran (hors état de chargement du
bouton) ; les erreurs s'affichent en texte ; l'indicateur d'étapes est compréhensible sans couleur ;
le récapitulatif reste lisible à 390 px.

---

## 9. Compte client et espace professionnels — archétype **Piloter**

```
Écrans : la connexion et la création de compte, le tableau de bord du client, ses commandes, ses
adresses, ses informations, et l'espace professionnel.
Règle de la boutique : un groupe « Compte pro » voit les prix HORS TAXE (−20 %), un groupe « Ami(e) » les
voit TTC (−20 %). L'écran doit donc montrer clairement au professionnel qu'il voit des prix HT, et lui
proposer son justificatif de TVA.
Contenu : une page de connexion sobre (adresse, mot de passe, mot de passe oublié, création de compte),
un bloc « accès professionnels » qui explique la demande d'ouverture de compte pro, le tableau de bord
(dernières commandes, adresses, informations), et la liste des commandes avec leur état.
Champs à annoter : compte_connexion_titre, compte_creation_champs, compte_motdepasse_oublie,
pro_encart_titre, pro_encart_texte, pro_demande_url, pro_tva_obligatoire, pro_mention_ht,
compte_tableau_de_bord_blocs, compte_commandes_colonnes.
Aucune information portée par la seule couleur dans les états de commande : chaque état écrit son libellé.
```

**La porte de validation** : le régime HT/TTC est visible et expliqué sur les écrans concernés ; les états
de commande sont lisibles en noir et blanc ; les formulaires ont leurs libellés et leurs messages d'erreur ;
les cibles tactiles font 44×44 px.

---

## 10. Éditorial et article — archétype **Découvrir**

```
Écrans : la liste des articles du blog et la page d'un article. Archétype : Découvrir.
Contenu de la liste : titre, accroche, les articles en cartes avec leur visuel, leur titre, leur date et
leur extrait, et une pagination sobre. Contenu de l'article : titre, date, auteur, visuel, chapô, corps
avec ses intertitres et ses listes, citations mises en forme, encadré d'appel à l'action vers la boutique,
et les articles liés en bas.
Champs à annoter : blog_titre, blog_accroche, blog_nb_par_page, article_visuel, article_auteur,
article_date, article_chapo, article_cta_titre, article_cta_url, article_lies.
Typographie de lecture confortable : corps à 16 px minimum, interligne 1,6, largeur de texte limitée à
environ 64 caractères, jamais de texte sous 12 px.
```

**La porte de validation** : la largeur de lecture est confortable à 1440 px ; les liens sont distinguables
autrement que par la couleur ; les images ont des dimensions déclarées (pas de saut de mise en page).

---

## 11. Pages de service — archétypes **Découvrir** / **Piloter**

```
Écrans : contact (avec formulaire), qui sommes-nous, suivi de commande, questions fréquentes, mentions
légales, conditions de vente et de rétractation.
Reprends la composition et les jetons de l'accueil validé. Pour le formulaire de contact et le suivi de
commande, prévois les états : vide, en cours d'envoi, envoyé, erreur de saisie. Pour la FAQ, chaque
question est dépliable au clavier (bouton avec aria-expanded) et la page reste lisible sans JavaScript.
Champs à annoter : contact_champs, contact_obligatoires, contact_message_succes, suivi_champs,
suivi_etat_introuvable, faq_questions, cms_contenu.
```

**La porte de validation** : les accordéons de la FAQ fonctionnent au clavier ; les messages de succès et
d'erreur sont en texte ; aucune page ne laisse un blanc sans explication.

---

## 12. Ce qui n'est pas un écran mais qu'il faut demander dans la foulée

- **Le récapitulatif des champs** : à la fin de chaque écran, demande la **liste des champs back-office**
  annotés. Elle devient la spécification du module compagnon — et c'est ce qui rendra tout réglable depuis
  le back-office, sans toucher au code.
- **Le module compagnon** doit rester **évolutif** : chaque bloc répétable porte un interrupteur
  d'activation, ses champs, et un nombre d'éléments réglable. Jamais de valeur en dur.
- **Le poids** : chaque écran livré restera sous 45 Ko compressés pour le CSS et 110 Ko pour le JavaScript
  du thème ; le poids d'une maquette autonome (images et polices en base64) n'est pas celui du thème, qui
  les servira depuis la médiathèque avec le cache HTTP.

---

## L'ordre de travail conseillé

| Étape | Écran | Pourquoi cet ordre |
|---|---|---|
| 5 | Catégorie | C'est le passage obligé de tout le catalogue, et la carte produit y est réutilisée partout |
| 6 | Fiche produit | Le cœur de la conversion, avec les options de personnalisation |
| 7 | Panier | Premier écran du tunnel, on y applique la règle « rien n'anime le tunnel » |
| 8 | Tunnel | La suite directe du panier, à faire dans la même foulée |
| 9 | Compte et professionnels | Là où le HT/TTC doit être compris sans ambiguïté |
| 10 | Éditorial | Le contenu, plus libre, à faire quand le reste est stable |
| 11 | Pages de service | Le complément, rapide une fois la composition rodée |

**Une correction ne se fait jamais à l'aveugle** : on mesure d'abord (390 / 768 / 1024 / 1440, débordement,
textes sous 12 px, cibles tactiles, focus clavier, mouvement réduit), et on demande ensuite la correction en
citant la mesure. C'est ce qui a manqué pendant deux jours.
