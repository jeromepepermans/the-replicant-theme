/*! ===========================================================================
 * the-replicant.com — EN-TÊTE ET MENU · SOURCE UNIQUE
 * ---------------------------------------------------------------------------
 * Les deux lignes d'en-tête et tous les menus du site vivent ici et nulle part
 * ailleurs : styles, balisage, données et comportement. Aucune copie dans les
 * pages — une correction faite ici s'applique à toutes les pages.
 *
 * INCLUSION — dans chaque gabarit, en fin de <body>, juste AVANT le script de la
 * page (le bloc se pose tout seul) :
 *
 *     <script src="partages/entete-menu.js"></script>
 *
 * Le bloc injecte sa feuille de style dans <head> (id « entete-partage-css ») et
 * son balisage au DÉBUT de <body> : l'en-tête précède le contenu dans le DOM
 * comme s'il y avait été écrit, et rien n'est encore peint à cet instant.
 *
 * DANS LE THÈME PRESTASHOP — ce fichier correspond à deux gabarits :
 *   templates/_partials/entete-menu.tpl   ← {include file='_partials/entete-menu.tpl'}
 *   assets/js/entete-menu.js              ← {javascript src='js/entete-menu.js'}
 * le .tpl portant le balisage rendu par le module compagnon (qui lit en base
 * l'arbre des catégories, les remises en cours, les produits sous 5 € et les thèmes),
 * le .js le comportement ci-dessous, inchangé. Une seule source : les deux moitiés
 * du même bloc, jamais recopiées dans un gabarit.
 *
 * CHAMPS DU BACK-OFFICE (surchargeables page par page via
 * window.ENTETE_MENU_OPTIONS = { … } avant l'inclusion) :
 *   entete_logo · entete_recherche_placeholder · entete_compte_actif ·
 *   entete_panier_actif · entete_devise_active
 *   menu_source · menu_profondeur (3) · menu_accueil_libelle · menu_accueil_actif ·
 *   menu_ordre (back-office | alpha) · menu_ordre_source (position back-office) ·
 *   menu_ordre_personnalise (vide) · menu_colonnes (4 ≥1440 px, 3 en dessous) ·
 *   menu_encart_actif · menu_encart_image · menu_encart_titre · menu_encart_lien ·
 *   menu_encart_source (catégorie survolée) · categorie_image_menu
 *   menu_raccourcis_actifs · raccourci_nouveautes_actif · raccourci_bonplan_actif ·
 *   raccourci_bonplan_seuil · raccourci_moins5_actif · raccourci_moins5_seuil
 *   theme_actif · theme_titre · theme_image · theme_lien · theme_ordre
 *   pro_lien_libelle · pro_lien_url · pro_lien_position (droite de la ligne du bas)
 *   notes_affichees (case « Afficher les notes », éteinte par défaut)
 *
 * Rien n'est écrit en dur : la ligne du bas, le grand menu, l'encart, la bande de
 * thèmes et l'accordéon mobile sont rendus depuis ces données.
 *
 * LIMITE DES MAQUETTES (et non du thème) — dans ces pages autonomes, le balisage est
 * posé par ce script : sans JavaScript, la maquette n'a pas d'en-tête, et le repli
 * <noscript> de la ligne du bas n'a donc rien à compléter. Dans le thème PrestaShop,
 * le .tpl rend le même balisage côté serveur : le HTML arrive complet, le repli
 * <noscript> joue son rôle, et rien ne dépend de JavaScript.
 * =========================================================================== */
(function () {
var OPTIONS_PARTAGE = window.ENTETE_MENU_OPTIONS || {};

/* ============================================================================
   1. LES STYLES — le bloc validé, repris au caractère près. Tout passe par les
      jetons du système de design : aucune couleur ni police n'est définie ici.
   ============================================================================ */
var CSS_PARTAGE = /*<<<CSS*/`

/* ====== en-tete a deux lignes pleine largeur — etape 5 ======
   Ligne 1 : embleme + nom (le wordmark seul n'est jamais utilise : sous 96 px de haut il devient
             illisible, donc le nom s'ecrit en texte a cote de l'embleme), recherche au centre,
             « Mon compte », panier et « FR / € » a droite.
   Ligne 2 : toutes les categories reelles de l'arbre, panneau pleine largeur au survol ou au focus.
   Hauteurs de la ligne 1 : 140 px au repos, 56 px au defilement (l'embleme passe de 108 a 44 px).
   AU DEFILEMENT, LA COMPACTION CHANGE LA TAILLE ET JAMAIS LE CONTENU : aucun element ne disparait
   (ni display:none, ni opacity, ni visibility, ni width:0) et la place occupee dans le flux reste
   constante — la reserve est MESUREE puis rendue en margin-bottom en 180 ms, donc le contenu de la
   page ne bouge pas d'un pixel (cf. correction n° 39, section 4 du script).
   L'embleme occupe 108 px dans une ligne de 140 px : les rayons etant traces a 128 % de la boite
   (debord de 14 % de chaque cote), le champ de rayons mesure 138,2 px et tient entierement dans les
   140 px — aucun rognage, meme rapport que la reference validee (120 px dans 156 px).
   Sous 768 px, la recherche occupe sa propre ligne (358 px utiles ne peuvent pas loger le bouton
   menu, l'embleme, le nom, le champ et les trois cibles de 44 px), donc la ligne 1 y est en hauteur
   automatique (72 px + 52 px). */
/* z-index 90 : l'en-tete reste AU-DESSUS du voile (70) et au-dessus du panneau (80). Ses deux
   lignes restent donc visibles et cliquables en permanence, panneau ouvert (contrat etape 10).
   Il porte aussi backdrop-filter — c'est justement pour cela que le panneau n'est PAS son
   descendant : un filtre fait de l'element le bloc conteneur de tout descendant position:fixed. */
.site-header{position:sticky;top:0;z-index:90;background:var(--surface-voile);backdrop-filter:blur(6px);border-bottom:1px solid var(--border);transition:margin-bottom 180ms ease}
/* ---- hauteur de l'en-tete, tenue a jour par un ResizeObserver (voir script) ----------------
   C'est le BAS de l'en-tete, pas sa hauteur : au chargement la note de livraison le decale vers le
   bas, et au defilement l'en-tete se colle en haut. Le panneau commence exactement la.
   Les valeurs ci-dessous sont le repli, avant que le script ne mesure : 140 + 1 + 56 + 1 (le filet
   de bas d'en-tete) = 198 px. */
:root{--hauteur-entete:198px}
@media (min-width:768px) and (max-width:1023px){:root{--hauteur-entete:162px}}
@media (max-width:767px){:root{--hauteur-entete:125px}}

/* ---- ligne 1 ---- */
.hl-top-inner{max-width:var(--wrap-max);margin:0 auto;padding:0 var(--gutter);height:140px;display:flex;align-items:center;gap:var(--sp-4);transition:height 180ms ease}
.site-header.compact .hl-top-inner{height:56px}
.brand{display:flex;align-items:center;gap:var(--sp-3);text-decoration:none;flex:0 0 auto;min-height:44px}
.brand-mark{position:relative;width:108px;height:108px;display:grid;place-items:center;transition:width 180ms ease,height 180ms ease}
.site-header.compact .brand-mark{width:44px;height:44px}
.brand-mark svg.rays{position:absolute;inset:-14%;width:128%;height:128%;animation:tourne-lente 110s linear infinite;transform-origin:50% 50%}
.brand-mark svg.rays path{stroke:var(--action-500)}
.brand-mark svg.rays path:nth-child(2n){stroke:var(--chaud-500)}
.brand-mark img{position:relative;width:100%;height:100%;object-fit:contain}
/* ---- echelle de l'embleme selon la largeur : il remplit toujours la hauteur de la ligne ----
   Desktop (>= 1024 px) : ligne 140 px, embleme 108 px, champ de rayons 138,2 px (tenu).
   Tablette (768-1023 px) : la barre tient encore sur une ligne mais le burger y est visible et le
   champ de recherche y partage la largeur avec l'embleme et le nom ; ligne 104 px, embleme 80 px,
   champ de rayons 102,4 px.
   Sous 768 px : la ligne passe en hauteur automatique (min 72 px) et l'embleme reste a 48 px. */
@media (min-width:768px) and (max-width:1023px){
  .hl-top-inner{height:104px}
  .brand-mark{width:80px;height:80px}
}
@keyframes tourne-lente{to{transform:rotate(360deg)}}
.brand-name{font:var(--fw-bold) var(--fs-h3)/1.1 var(--font-display);white-space:nowrap}
.brand-name span{display:block;font:var(--fw-semi) var(--fs-xs)/1.2 var(--font-body);text-transform:uppercase;letter-spacing:.1em;color:var(--chaud-700);margin-top:2px}

.hl-search{position:relative;flex:1 1 auto;max-width:560px;margin:0 auto;min-width:0}
.hl-search form{display:flex;align-items:center;position:relative}
.hl-search input{width:100%;min-height:44px;padding:10px 52px 10px var(--sp-4);border:1px solid var(--c-mention);border-radius:var(--r-pill);background:var(--c-surface);font:var(--fw-regular) var(--fs-body) var(--font-body);color:var(--c-ink)}
.hl-search input::placeholder{color:var(--c-mention)}
.hl-search input:hover{border-color:var(--c-ink)}
.hl-search input:focus-visible{outline:var(--focus);outline-offset:2px;border-color:var(--c-ink)}
.hl-search-btn{position:absolute;right:0;top:0;width:44px;height:44px;display:grid;place-items:center;border-radius:var(--r-pill);color:var(--c-ink)}
.hl-search-btn:hover{background:var(--c-sunken)}
.hl-search-btn svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2}
.hl-suggest{position:absolute;left:0;right:0;top:100%;background:var(--c-surface);border:1px solid var(--c-mention);border-radius:0 0 var(--r-md) var(--r-md);box-shadow:var(--el-3);padding:var(--sp-2);display:none;z-index:35;max-height:340px;overflow:auto}
.hl-suggest[data-open="true"]{display:block}
.hl-suggest a{display:block;padding:var(--sp-2) var(--sp-3);border-radius:var(--r-sm);min-height:44px;font-size:var(--fs-sm);text-decoration:none}
.hl-suggest a:hover{background:var(--surface-100)}
.hl-suggest .lbl{font:var(--fw-semi) var(--fs-xs)/1.4 var(--font-body);text-transform:uppercase;letter-spacing:.06em;color:var(--c-mention);padding:var(--sp-2) var(--sp-3) 0}
.hl-suggest .chemin{display:block;font:var(--fw-regular) var(--fs-xs)/1.4 var(--font-body);color:var(--c-mention)}

.hl-actions{display:flex;align-items:center;gap:var(--sp-1);margin-left:auto;flex:0 0 auto}
.icon-btn{width:44px;height:44px;border-radius:var(--r-md);display:grid;place-items:center;position:relative;color:var(--ink-900)}
.icon-btn:hover{background:var(--c-sunken)}
.icon-btn svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8}
.hl-item{position:relative}
.hl-btn{display:inline-flex;align-items:center;gap:var(--sp-2);min-height:44px;padding:0 var(--sp-3);border-radius:var(--r-md);font:var(--fw-semi) var(--fs-sm) var(--font-body);color:var(--c-ink);white-space:nowrap}
.hl-btn:hover,.hl-btn[aria-expanded="true"]{background:var(--c-sunken)}
.hl-btn .ic-user{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8}
.hl-btn .chev{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2}
.hl-menu{position:absolute;top:100%;right:0;min-width:240px;background:var(--c-surface);border:1px solid var(--c-mention);border-top:0;border-radius:0 0 var(--r-md) var(--r-md);box-shadow:var(--el-3);padding:var(--sp-2);display:none;z-index:35}
.hl-menu[data-open="true"]{display:block}
.hl-menu a{display:flex;align-items:center;min-height:44px;padding:0 var(--sp-3);border-radius:var(--r-sm);font:var(--fw-semi) var(--fs-sm) var(--font-body);text-decoration:none}
.hl-menu a:hover{background:var(--surface-100)}
.hl-devise{display:inline-flex;align-items:center;min-height:44px;padding:0 var(--sp-3);border:1px solid var(--c-mention);border-radius:var(--r-pill);font:var(--fw-semi) var(--fs-sm) var(--font-body);color:var(--c-ink);white-space:nowrap}
.hl-devise:hover{background:var(--c-sunken);border-color:var(--c-ink)}
.cart-count{position:absolute;top:0;right:0;min-width:18px;height:18px;padding:0 3px;border-radius:var(--r-pill);background:var(--c-promo);color:var(--c-ink);font:var(--fw-bold) var(--fs-xs)/18px var(--font-body);font-variant-numeric:tabular-nums;text-align:center;transition:transform 150ms ease}
.panier-wrap{position:relative}
.mini-panier{position:absolute;top:100%;right:0;width:320px;background:var(--c-surface);border:1px solid var(--c-mention);border-top:0;border-radius:0 0 var(--r-md) var(--r-md);box-shadow:var(--el-3);padding:var(--e4);display:none;z-index:35}
.mini-panier[data-open="true"]{display:block}
.mini-panier-items{list-style:none;margin:0 0 var(--e3);padding:0;display:flex;flex-direction:column;gap:var(--e3)}
.mini-panier-items li{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:var(--sp-1);font-size:var(--fs-sm);border-bottom:1px solid var(--border);padding-bottom:var(--e2)}
.mini-panier-items .nom{flex:1 1 100%;font-weight:600;color:var(--ink-900)}
.mini-panier-items .qte{color:var(--ink-600)}
.mini-panier-items .prix-ligne{font-weight:700}
.mini-panier-sous-total{display:flex;justify-content:space-between;align-items:baseline;font:var(--fw-bold) var(--fs-body) var(--font-body);font-variant-numeric:tabular-nums;margin-bottom:var(--e3)}
.mini-panier-cta{display:block;text-align:center;min-height:44px;line-height:44px;border-radius:var(--r-md);background:var(--c-action);color:var(--c-ink);font:var(--fw-semi) var(--fs-sm) var(--font-body);text-decoration:none}
.mini-panier-cta:hover{background:var(--action-600)}
.icon-btn:hover .cart-count,.icon-btn:focus-visible .cart-count,.bottom-bar a:hover .cart-count,.bottom-bar a:focus-visible .cart-count{transform:scale(1.08)}
@keyframes rebond-panier{0%,100%{transform:scale(1)}50%{transform:scale(1.22)}}
.cart-count.rebond{animation:rebond-panier 150ms ease}
.burger{width:44px;height:44px;border-radius:var(--r-md);display:grid;place-items:center}
.burger svg{width:22px;height:22px}

/* ---- ligne 2 : cinq raccourcis, « Acces professionnels » a droite, et les panneaux SOUS L'EN-TETE
   « Nos produits » ouvre le grand menu AU CLIC (un second clic le ferme), « Themes » ouvre la
   bande de themes de la meme facon : le survol seul n'ouvre rien, il anime (etape 10). Les deux
   panneaux sont rattaches directement a <body> par le script (attacherPanneau) : ni l'item ni la
   ligne ne les contiennent, donc aucun vide ne peut les separer de leur item et aucun conteneur
   ne peut les rogner (cf. corrections n° 9). Ils commencent a top:var(--hauteur-entete) : sous la
   ligne du bas, qui reste visible et cliquable (cf. corrections n° 34). */
.hl-cats{position:relative;border-top:1px solid var(--border);background:var(--surface-voile)}
.hl-cats-inner{max-width:var(--wrap-max);margin:0 auto;padding:0 var(--gutter);display:flex;align-items:stretch;gap:var(--sp-3)}
.hl-line{position:relative;list-style:none;display:flex;align-items:stretch;flex-wrap:nowrap;gap:var(--sp-6);margin:0;padding:0;flex:0 1 auto;min-width:0}
.hl-entry{display:flex;align-items:stretch}
.hl-link{display:inline-flex;align-items:center;gap:var(--sp-2);min-height:56px;padding:0 var(--sp-4);border-radius:var(--r-sm);font:var(--fw-semi) var(--fs-body)/1 var(--font-body);color:var(--c-ink);text-decoration:none;white-space:nowrap}
.hl-link:hover,.hl-link:focus-visible{background:var(--c-sunken)}
.site-header.compact .hl-link,.site-header.compact .hl-pro{min-height:44px}
/* ===== correction n° 39 : AU DEFILEMENT, LA COMPACTION CHANGE LA TAILLE, JAMAIS LE CONTENU =====
   Aucun element ne disparait : ni display:none, ni opacity:0, ni visibility:hidden, ni width:0.
   La ligne du haut garde ses cinq elements — embleme, recherche, « Mon compte », panier,
   « FR / € » — et la ligne du bas ses cinq entrees plus « Acces professionnels ». Seuls les
   encombrements suivent la barre : le nom ecrit passe de 19 a 16 px, son etiquette et celle de
   « FR / € » de 14 a 12 px, les ecarts de 16 a 8 px. Jamais de texte sous 12 px, et chaque cible
   tactile reste a 44 x 44 px (les min-height ne sont pas touches). */
.site-header.compact .hl-top-inner{gap:var(--sp-2)}
.site-header.compact .brand-name{font-size:var(--fs-body)}
.site-header.compact .hl-actions{gap:0}
.site-header.compact .hl-btn{padding:0 var(--sp-2);font-size:var(--fs-xs)}
.site-header.compact .hl-devise{padding:0 var(--sp-2);font-size:var(--fs-xs)}
/* « Nos produits » : encre, comme le catalogue ; l'ouverture se lit au fond creux et au repere
   glissant, jamais a un aplat colore (etape 7) */
.hl-link--catalogue:hover,.hl-link--catalogue[aria-expanded="true"]{background:var(--c-sunken);color:var(--c-ink)}
/* ---- etape 7 : la couleur devient un accent, plus un aplat ----
   Les quatre raccourcis portent la meme encre que le catalogue : l'ancien couple #a35200 sur
   #fff9d6 disparait completement. Ce qui distingue un item, c'est le repere glissant (2 px,
   180 ms, en transform seulement) sous l'item survole ou focalise. */
.hl-link--raccourci{color:var(--c-ink)}
.hl-link--promo{color:var(--c-ink)}
/* « Bon plan » : un point de 6 px pulse lentement tant qu'une remise est reellement en cours.
   La pulsation s'arrete avec le reste sous prefers-reduced-motion (regle globale). */
.bp-puce{width:6px;height:6px;border-radius:var(--r-pill);background:var(--c-promo);flex:0 0 auto;animation:pulse-promo 2.5s ease-in-out infinite}
@keyframes pulse-promo{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.75)}}
/* la ligne s'ajuste au lieu de passer a la ligne : 14 px / ecart 24 px, puis 12 px / ecart 12 px */
/* repere glissant : 1 px de boite, 2 px de haut, et c'est la transformation composee
   (translateX puis scaleX) qui fait glisser et grandir le trait — aucune animation de largeur,
   aucun ancrage en px sur la mise en page. */
.hl-glisse{position:absolute;left:0;bottom:0;width:1px;height:2px;background:var(--c-promo);transform-origin:0 50%;transform:translateX(0) scaleX(0);transition:transform 180ms ease;pointer-events:none}
.hl-line--dense{gap:var(--sp-6)}
.hl-line--dense .hl-link{padding:0 var(--sp-3);font-size:var(--fs-sm)}
.hl-line--dense-2{gap:var(--sp-3)}
.hl-line--dense-2 .hl-link{padding:0 var(--sp-2);font-size:var(--fs-xs)}
.hl-pro{display:inline-flex;align-items:center;min-height:56px;padding:0 var(--sp-3);margin-left:auto;border-left:1px solid var(--border);font:var(--fw-semi) var(--fs-sm)/1 var(--font-body);color:var(--c-ui-text);text-decoration:none;white-space:nowrap}
.hl-pro:hover{background:var(--c-sunken);color:var(--c-ink)}
/* pro_lien_position = gauche : le lien passe avant les raccourcis, bordure a droite */
.hl-pro--gauche{order:-1;margin-left:0;margin-right:auto;border-left:0;border-right:1px solid var(--border)}

/* ===== corrige a l'etape 9 (22/09/2026) : LES PANNEAUX SORTENT DU CONTENEUR DE PAGE ==========
   DEFINITION DU DEFAUT. Le panneau etait un descendant de son item, donc enferme dans la chaine
   de conteneurs de la page. Deux pieges, cumules :
   1. \`.hl-cats-inner\` porte max-width:var(--wrap-max) — 1320 px : le panneau ne pouvait pas
      depasser cette largeur ;
   2. surtout, \`.site-header\` porte backdrop-filter:blur(6px). Un filtre (filter ou backdrop-filter,
      comme transform, contain, will-change ou perspective) fait de son element le BLOC CONTENEUR
      de tout descendant position:fixed : \`inset:0\` se resolvait donc sur la boite de l'en-tete,
      pas sur la fenetre. Le panneau ne pouvait ni mesurer 100vw ni 100vh.
   CORRECTION (etape 9). Les deux panneaux ET le voile sont rattaches DIRECTEMENT a <body> par le
   script (attacherPanneau()) : plus aucun ancetre entre eux et la fenetre.
   CORRECTION (etape 10, 22/09/2026). Le panneau PLEIN ECRAN recouvrait l'en-tete : on ne pouvait
   plus rien cliquer de la barre pendant qu'un menu etait ouvert. Le panneau et le voile commencent
   donc SOUS la ligne du bas de l'en-tete : plus de inset:0 mais top:var(--hauteur-entete) avec
   left, right et bottom a 0. Le panneau occupe toute la largeur et toute la hauteur RESTANTES —
   100vw de large, du bas de l'en-tete au bas de la fenetre — jamais retreci, jamais defilant.
   --hauteur-entete est tenue a jour par un ResizeObserver pose sur l'en-tete (script) : elle suit
   la barre quand elle se compacte au defilement (140 -> 56 px) et quand la note de livraison la
   decale vers le bas au chargement. Le repli CSS est en haut du fichier (:root).
   Le panneau est un grid sur trois rangees — barre de titre auto, contenu 1fr, pied auto : la
   rangee 1fr absorbe la hauteur restante et la rangee 3 touche le bas de la fenetre.
   overflow:hidden : jamais de defilement interne, le contenu se repartit en ajoutant des colonnes
   (repartirColonnes()), puis en resserrant la densite.
   Le panneau reste NEUTRE : fond blanc, colonne des univers #faf8f5, filets #e6e0d6 d'un pixel.
   L'orange #fe8200 ne sert qu'en accent : filet vertical de 3 px de l'univers actif, point de
   6 px. Jamais en fond de bloc. ================================================================ */
.hl-panel,.panneau-menu{position:fixed;top:var(--hauteur-entete);right:0;bottom:0;left:0;width:100vw;max-width:none;height:auto;z-index:80;display:grid;grid-template-rows:auto 1fr auto;overflow:hidden;background:var(--c-surface);opacity:0;visibility:hidden;transform:translateY(-8px);transition:opacity 120ms ease,transform 120ms ease,visibility 0s linear 120ms}
.hl-panel[data-open="true"],.panneau-menu[data-open="true"]{opacity:1;visibility:visible;transform:none;transition-delay:0s}

/* ---- rangee 1 : la barre de titre DU PANNEAU ------------------------------------------------
   Depuis l'etape 10 le panneau s'ouvre SOUS l'en-tete : l'embleme du logo et le nom ecrit sont
   deja sur l'ecran, juste au-dessus, donc le panneau ne les repete pas. Il ne garde que le titre
   et la sortie : un bouton « Fermer » de 44 px de haut (cible tactile), trace SVG, anneau de
   focus intact. La barre est volontairement basse (48 px) : c'est de la hauteur rendue au contenu
   des colonnes, qui doit tenir sans defiler. ---- */
.pn-top{display:flex;align-items:center;gap:var(--sp-4);min-height:48px;padding:0 var(--gutter);border-bottom:1px solid var(--border);background:var(--c-surface)}
.pn-titre{font:var(--fw-semi) var(--fs-h3)/1.2 var(--font-display);color:var(--c-ink);white-space:nowrap}
.pn-fermer{margin-left:auto;display:inline-flex;align-items:center;gap:var(--sp-2);min-height:44px;padding:0 var(--sp-4);border:1px solid var(--c-mention);border-radius:var(--r-pill);background:var(--c-surface);font:var(--fw-semi) var(--fs-sm)/1 var(--font-body);color:var(--c-ink)}
.pn-fermer:hover{background:var(--c-sunken);border-color:var(--c-ink)}
.pn-fermer svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2}
.mg-col1{position:relative;flex:0 0 17.5rem;padding:var(--sp-12) var(--sp-4) var(--sp-12) var(--sp-6);background:var(--c-page);border-right:1px solid var(--border)}
/* ---- etape 9 : le contenu du panneau occupe TOUTE la largeur de la fenetre ----
   Le panneau n'est plus aligne sur la grille de page (--wrap-max) : bord a bord, colonne des
   univers de 280 px a gauche, colonnes de sous-categories au centre (48 px d'ecart), encart de
   240 px a droite, gouttiere en bord droit. Aucun retrait lateral supplementaire. */
.mg-mothers{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}
.mg-mother{position:relative;z-index:1;display:flex;align-items:center;gap:var(--sp-3);min-height:44px;padding:0 var(--sp-4);border-radius:var(--r-sm);font:var(--fw-semi) var(--fs-body)/1.3 var(--font-body);color:var(--c-ink);text-decoration:none;transition:background-color 120ms ease}
.mg-mother:hover,.mg-mother:focus-visible,.mg-mother[data-actif="true"]{color:var(--c-ink)}
/* le point de 6 px d'un univers : il vient de la palette du logo, jamais d'une couleur inventee.
   Il est decoratif : l'univers est nomme en toutes lettres a cote, jamais porte par la couleur. */
.mg-puce{width:6px;height:6px;border-radius:var(--r-pill);flex:0 0 auto}
/* les deux reperes de la colonne 1 : le fond creux de l'univers survole (fondu de 120 ms et
   montee de 4 px a l'ouverture) et le filet orange de 3 px qui glisse en 180 ms. Tous deux en
   transform : la mise en page ne bouge jamais. */
.mg-survol{position:absolute;left:var(--sp-2);right:var(--sp-2);top:0;height:22px;background:var(--c-sunken);border-radius:var(--r-sm);opacity:0;transition:opacity 120ms ease,transform 180ms ease;pointer-events:none;z-index:0}
.mg-rail{position:absolute;left:0;top:0;width:3px;height:22px;background:var(--c-promo);opacity:0;transition:opacity 120ms ease,transform 180ms ease;pointer-events:none;z-index:0}
/* zone des colonnes : elle remplit toute la largeur et toute la hauteur restantes.
   --mg-vpad est la respiration haute/basse de la zone : elle se resserre avec la densite, parce
   que c'est de la hauteur rendue aux liens (etape 10 : ni defilement interne ni lien perdu). */
.mg-zone{--mg-vpad:var(--sp-12);flex:1 1 auto;min-width:0;min-height:0;padding:var(--mg-vpad) var(--sp-12) var(--mg-vpad) var(--sp-6);overflow:hidden}
.mg-cols{display:flex;align-items:flex-start;gap:var(--sp-12);height:100%}
.mg-col{flex:1 1 0;min-width:0}
/* ---- echelle de densite, pilotee par repartirColonnes() (data-densite sur le panneau) ---------
   Elle ne change QUE la typographie des liens, leur rembourrage, l'ecart entre colonnes et la
   respiration de la zone : ni la structure, ni les couleurs, ni l'ordre des niveaux. Densite 0
   (aucun attribut) : tout au repos, 48 px d'ecart entre colonnes, comme le contrat valide.
   Densite 1 : texte de mention (12 px, jamais moins), ecart 32 px.
   Densite 2 : dernier cran avant le repli declare, interligne 1,25 et respiration minimale. */
.panneau-menu[data-densite="1"] .mg-zone{--mg-vpad:var(--sp-6);padding-right:var(--sp-6)}
.panneau-menu[data-densite="1"] .mg-cols{gap:var(--sp-8)}
.panneau-menu[data-densite="1"] .mg-groupe ul a,.panneau-menu[data-densite="1"] .mg-groupe-titre{font-size:var(--fs-xs);padding-top:2px;padding-bottom:2px}
.panneau-menu[data-densite="2"] .mg-zone{--mg-vpad:var(--sp-3);padding-right:var(--sp-4)}
.panneau-menu[data-densite="2"] .mg-cols{gap:var(--sp-4)}
.panneau-menu[data-densite="2"] .mg-groupe + .mg-groupe{margin-top:var(--sp-2)}
.panneau-menu[data-densite="2"] .mg-groupe ul a,.panneau-menu[data-densite="2"] .mg-groupe-titre{font-size:var(--fs-xs);line-height:1.25;padding-top:1px;padding-bottom:1px}
/* DERNIER RECOURS, DECLARE. Une seule combinaison ne peut pas tenir : les 100 entrees de « Fêtes
   et Événements » sur un ecran de 768 px de haut, dont 197 px d'en-tete. Meme a 12 px, interligne
   1,25 et quatre colonnes, les lignes demandent plus de hauteur qu'il n'en existe — la seule
   alternative serait de perdre des liens. Dans ce cas precis, et seulement celui-la, la ZONE des
   colonnes defile ; le panneau, lui, ne defile jamais et n'est jamais retreci. Le pied et la barre
   de titre restent en place. Chaque palier de densite est essaye avant d'arriver ici. */
.mg-zone--scroll{overflow-y:auto;overscroll-behavior:contain}
/* UN GROUPE = une sous-categorie ET ses enfants, JAMAIS SEpare (etape 12). La repartition se fait
   sur les groupes, jamais sur les lignes : un enfant ne peut plus se retrouver en tete de colonne
   detache de son titre, et aucun filet vertical ne passe au milieu d'un groupe. \`break-inside\` et
   \`page-break-inside\` couvrent aussi une mise en page en colonnes CSS. */
.mg-groupe{break-inside:avoid;page-break-inside:avoid}
.mg-groupe + .mg-groupe{margin-top:var(--sp-4)}
/* ---- LA LISTE DES CATEGORIES S'ARRETE A TROIS NIVEAUX EN TOUT (etape 11) : l'univers (1), sa
   sous-categorie (2), ses enfants (3). Ce que la base contient AU-DELA — criteres de public, de
   taille ou de style — n'est pas rendu ici : ce sont des filtres de la page de categorie.
   Aucune couleur de fond ne marque un niveau : la couleur ne sert qu'a l'action. */
/* niveau 2 : la sous-categorie — Montserrat 600, encre #2b2419, 16 px */
.mg-groupe-titre{display:block;padding:0 var(--sp-2) var(--sp-1);font:var(--fw-semi) var(--fs-body)/1.35 var(--font-display);color:var(--c-ink);text-decoration:none;transition:background-color 120ms ease}
.mg-groupe-titre:hover,.mg-groupe-titre:focus-visible{color:var(--c-ink);text-decoration:underline}
/* niveau 3 : les enfants, JUSTE SOUS leur sous-categorie, decales de 16 px et precedes d'un filet
   vertical d'un pixel (#e6e0d6) — Source Sans 3 400, #4a4133, 14 px. Une sous-categorie sans enfant
   ne recoit pas de <ul> : poser() retire la liste vide, donc pas de filet orphelin. */
.mg-groupe ul{list-style:none;margin:0;padding:0 0 0 var(--sp-4);border-left:1px solid var(--border)}
.mg-groupe ul a{display:block;padding:5px var(--sp-2);border-radius:var(--r-sm);font:var(--fw-regular) var(--fs-sm)/1.35 var(--font-body);color:var(--c-ink-2);text-decoration:none;transition:background-color 120ms ease}
.mg-groupe ul a:hover,.mg-groupe ul a:focus-visible{background:var(--c-sunken);color:var(--c-ink);text-decoration:underline}
/* ---- encart du grand menu (menu_encart_*) : une seule image legere, a droite des colonnes.
   15 rem = 240 px. L'image est celle d'un theme reellement mis en avant par la boutique ; elle
   occupe la hauteur disponible sans jamais etre etiree (rapport 1:1 preserve). ---- */
.mg-encart{flex:0 0 15rem;display:none;flex-direction:column;gap:var(--sp-3);padding:var(--sp-12) var(--sp-6) var(--sp-12) 0;text-decoration:none}
@media (min-width:1280px){ .mg-encart{display:flex} }
.mg-encart-img{width:100%;aspect-ratio:1;height:auto;object-fit:cover;display:block;border:1px solid var(--border);border-radius:var(--r-md);background:var(--c-sunken)}
.mg-encart-titre{font:var(--fw-semi) var(--fs-sm)/1.4 var(--font-body);color:var(--c-ink)}
.mg-encart:hover .mg-encart-titre{text-decoration:underline}
/* ---- ligne de pied du panneau, sur toute la largeur : « Tout voir dans ... » a gauche, les
   cinq univers rappeles en petits caracteres a droite ---- */
.mg-pied{flex:0 0 auto;display:flex;align-items:center;gap:var(--sp-6);flex-wrap:wrap;min-height:56px;padding:0 var(--gutter);border-top:1px solid var(--border)}
/* etape 9 : le pied n'est plus aligne sur la grille de page non plus — il touche les deux bords
   de la fenetre, a la gouttiere pres (il occupe la rangee 3 du panneau, donc le bas de la fenetre) */
.mg-pied-tout{display:inline-flex;align-items:center;gap:var(--sp-2);min-height:44px;padding:0 var(--sp-2);border-radius:var(--r-sm);font:var(--fw-semi) var(--fs-sm) var(--font-body);color:var(--c-ui-text);text-decoration:none;white-space:nowrap}
.mg-pied-tout:hover{background:var(--c-sunken);color:var(--c-ink);text-decoration:underline}
.mg-pied-univers{margin:0 0 0 auto;padding:0;display:flex;flex-wrap:wrap;gap:var(--sp-4);list-style:none}
.mg-pied-univers a{font:var(--fw-regular) var(--fs-xs)/1.6 var(--font-body);color:var(--c-mention);text-decoration:none}
.mg-pied-univers a:hover{color:var(--c-ink);text-decoration:underline}

/* ---- le menu Themes : meme panneau PLEIN ECRAN que le grand menu, vignettes carrees de 180 px
   reparties sur toute la largeur (six au maximum), titre sous chaque vignette. WebP, dimensions
   declarees, chargement differe. C'est une bande de navigation, pas une galerie. ---- */
.th-zone{min-height:0;padding:var(--sp-12) var(--gutter);overflow:hidden}
.th-band{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--sp-12);list-style:none;margin:0;padding:0}
.th-item{flex:0 1 11.25rem;min-width:0;display:flex;flex-direction:column;gap:var(--sp-2);min-height:44px;text-decoration:none;color:var(--c-ink)}
.th-image{width:100%;aspect-ratio:1;border:1px solid var(--border);border-radius:var(--r-md);overflow:hidden;background:var(--c-sunken)}
.th-image img{width:100%;height:100%;object-fit:cover;display:block}
.th-titre{font:var(--fw-semi) var(--fs-sm)/1.35 var(--font-body)}
.th-item:hover .th-image,.th-item:focus-visible .th-image{border-color:var(--c-ink)}
.th-item:hover .th-titre{text-decoration:underline}

/* ---- voile : rgba(75,75,75,.3) exactement (contrat etape 9) — un gris NEUTRE, jamais l'encre,
   pour ne pas teinter la page ; z-index 70, donc DERRIERE le panneau (80) et DERRIERE l'en-tete
   (90, qui reste cliquable panneau ouvert). Comme le panneau, il commence SOUS la ligne du bas de
   l'en-tete (top:var(--hauteur-entete), left/right/bottom a 0) : il ne recouvre jamais la barre.
   Il apparait en 120 ms pendant que le panneau monte de 8 px. Flou de 2 px seulement la ou le
   navigateur sait le faire, aucun ailleurs. ---- */
.voile{position:fixed;top:var(--hauteur-entete);right:0;bottom:0;left:0;z-index:70;background:rgba(75,75,75,.3);opacity:0;visibility:hidden;transition:opacity 120ms ease,visibility 0s linear 120ms}
.voile[data-open="true"]{opacity:1;visibility:visible;transition-delay:0s}
@supports (backdrop-filter:blur(2px)){ .voile[data-open="true"]{backdrop-filter:blur(2px)} }
@supports (-webkit-backdrop-filter:blur(2px)){ .voile[data-open="true"]{-webkit-backdrop-filter:blur(2px)} }
.bottom-bar .cart-count{top:-2px;right:calc(50% - 20px)}
.search-overlay{position:fixed;inset:0;z-index:50;background:var(--surface-0);padding:var(--e4);display:flex;flex-direction:column;gap:var(--e4)}
.search-overlay[hidden]{display:none}
.search-overlay .row{display:flex;gap:var(--e2);align-items:center}
.search-overlay .row button{flex:0 0 auto;width:44px;height:44px;display:grid;place-items:center;border-radius:var(--r-md);color:var(--c-ink)}
.search-overlay .row button:hover{background:var(--c-sunken)}
.search-overlay .row button svg,.mobile-menu .mm-fermer svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2}
/* les croix de fermeture sont tracees, jamais ecrites avec un caractere (etape 7) */
.search-overlay input{flex:1;min-height:44px;border:1px solid var(--c-mention);border-radius:var(--r-md);padding:10px 14px;font-size:var(--fs-body)}
/* ---- accordeon plein ecran (< 1024 px) : le meme contenu que le grand menu, empile ----
   Recherche en tete de panneau, bouton retour, chaque niveau se depliant. */
.mobile-menu{position:fixed;inset:0;z-index:50;background:var(--surface-0);overflow-y:auto;transform:translateX(100%);transition:transform var(--d-entree) cubic-bezier(.22,.61,.36,1)}
.mobile-menu[data-open="true"]{transform:translateX(0)}
.mobile-menu .top{position:sticky;top:0;z-index:2;background:var(--surface-0);display:flex;align-items:center;gap:var(--sp-3);padding:var(--sp-2) var(--e4);border-bottom:1px solid var(--border)}
.mobile-menu .top strong{font:var(--fw-bold) var(--fs-body) var(--font-display);margin-right:auto}
.mobile-menu .mm-retour{display:inline-flex;align-items:center;gap:var(--sp-2);min-height:44px;padding:0 var(--sp-3);border-radius:var(--r-md);font:var(--fw-semi) var(--fs-sm) var(--font-body);color:var(--c-ink)}
.mobile-menu .mm-retour:hover{background:var(--c-sunken)}
.mobile-menu .mm-retour svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2}
.mobile-menu .mm-fermer{min-width:44px;min-height:44px;border-radius:var(--r-md);font-size:var(--fs-h3);color:var(--c-ink)}
.mobile-menu .mm-fermer:hover{background:var(--c-sunken)}
.mm-recherche{display:flex;gap:var(--sp-2);padding:var(--sp-3) var(--e4);border-bottom:1px solid var(--border)}
.mm-recherche input{flex:1 1 auto;min-width:0;min-height:44px;padding:10px var(--sp-4);border:1px solid var(--c-mention);border-radius:var(--r-pill);background:var(--c-surface);font:var(--fw-regular) var(--fs-body) var(--font-body);color:var(--c-ink)}
.mm-recherche button{min-width:44px;min-height:44px;border:1px solid var(--c-mention);border-radius:var(--r-pill);color:var(--c-ink)}
.mm-recherche button:hover{background:var(--c-sunken)}
.mm-recherche button svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2}
.mm-bloc{padding:var(--sp-2) var(--e4) var(--e16)}
.mm-bloc ul{list-style:none;margin:0;padding:0}
.mm-bloc details{border-bottom:1px solid var(--border)}
.mm-bloc summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:var(--sp-3);min-height:44px;padding:12px 0;font:var(--fw-semi) var(--fs-body) var(--font-display);cursor:pointer}
.mm-bloc summary::-webkit-details-marker{display:none}
.mm-bloc summary::after{content:"+";font-size:var(--fs-h3);color:var(--c-mention)}
.mm-bloc details[open]>summary::after{content:"-"}
.mm-bloc a{text-decoration:none;color:var(--c-ink)}
.mm-bloc a.mm-lien{display:flex;align-items:center;gap:var(--sp-2);min-height:44px;padding:12px 0;border-bottom:1px solid var(--border);font:var(--fw-semi) var(--fs-sm) var(--font-body)}
.mm-liste{list-style:none;margin:0;padding:0 0 var(--sp-2);display:flex;flex-direction:column;gap:2px}
.mm-liste>li>a{display:flex;align-items:center;min-height:44px;font:var(--fw-semi) var(--fs-sm) var(--font-body)}
a.mm-tout{display:flex;align-items:center;min-height:44px;font:var(--fw-semi) var(--fs-sm) var(--font-body)}
a.mm-vue{color:var(--c-ui-text)}
/* niveau 2 : fond neutre — la hierarchie se lit a la graisse et a l'espacement, plus par un fond
   chaud (etape 7). Les enfants passent en texte de mention. */
.mm-sous{border-bottom:1px solid var(--border);padding-left:var(--sp-3)}
.mm-sous summary{font:var(--fw-semi) var(--fs-sm) var(--font-display);padding:10px 0}
.mm-kids{list-style:none;margin:0;padding:0 0 var(--sp-2);display:flex;flex-direction:column;gap:2px}
.mm-kids a{display:flex;align-items:center;min-height:44px;padding-left:var(--sp-2);font:var(--fw-regular) var(--fs-sm) var(--font-body);color:var(--c-mention)}
.mm-kids a:hover{color:var(--c-ink);text-decoration:underline}
.mm-bloc summary .mm-lib{margin-right:auto}
.mobile-menu .th-band{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--sp-3);padding:var(--sp-3) 0 var(--sp-4)}
.mobile-menu .th-item{flex:none;flex-basis:auto;min-height:44px}

@media (max-width:1023px){
  .burger{display:grid}
  .hl-cats-inner{gap:var(--sp-2)}
  /* sous 1024 px le grand menu et la bande de themes passent dans l'accordeon plein ecran */
  /* sous 1024 px le grand menu et le menu Themes passent dans l'accordeon plein ecran ;
     les panneaux plein ecran n'existent qu'au-dela (ils occupent deja tout l'ecran sur mobile) */
  .hl-line{overflow-x:auto;overflow-y:hidden;gap:var(--sp-4);scrollbar-width:none;-webkit-overflow-scrolling:touch}
  .hl-line::-webkit-scrollbar{display:none}
  .hl-entry{scroll-snap-align:start}
  .hl-link{min-height:48px;padding:0 var(--sp-3);font-size:var(--fs-sm)}
  .hl-pro{min-height:48px;padding:0 var(--sp-2);font-size:var(--fs-xs)}
  .hl-panel{display:none!important}
  .mini-panier{display:none!important}
  .hl-btn span{display:none}
  .hl-btn{padding:0 var(--sp-2)}}
@media (min-width:1024px){
  .burger{display:none}}
@media (max-width:767px){
  .hl-top-inner{flex-wrap:wrap;height:auto;min-height:72px;padding:var(--sp-2) var(--gutter);gap:var(--sp-2)}
  .brand-mark{width:48px;height:48px}
  .hl-search{order:9;flex:1 1 60%;max-width:none;margin:0}
  .hl-search input{font-size:var(--fs-sm);padding-left:var(--sp-3)}
  .hl-devise{order:10;font-size:var(--fs-xs);padding:0 var(--sp-2)}
  .hl-suggest{position:fixed;left:var(--gutter);right:var(--gutter);top:auto}
}
@media (max-width:519px){
  .brand-name span{display:none}
}
/* ===== BLOC PARTAGÉ — champs ajoutés : image de catégorie (categorie_image_menu) ===== */
/* Vignette de sous-catégorie dans sa colonne : boîte carrée, l'image garde son rapport
   (object-fit:contain) — jamais recadrée, jamais étirée. */
.mg-vignette{display:block;width:44px;height:44px;object-fit:contain;background:var(--c-surface);
  border:1px solid var(--border);border-radius:var(--r-sm);margin:0 0 var(--sp-1)}
/* Encart : bandeau de catégorie (rapport large). Le carré de l'encart ne convient qu'aux
   vignettes 1:1 ; au-delà, l'image garde son rapport naturel. */
.mg-encart-img--naturel{aspect-ratio:auto;object-fit:contain}
/* Catégorie sans image : l'encart garde sa place sans trou — aplat de la palette et nom. */
.mg-encart-aplat{display:flex;flex-direction:column;justify-content:flex-end;gap:var(--sp-2);
  width:100%;aspect-ratio:4/3;padding:var(--sp-4);border:1px solid var(--border);
  border-radius:var(--r-md);background:var(--c-sunken)}
.mg-encart-aplat .mg-puce{width:6px;height:6px;border-radius:var(--r-pill);display:block}
.mg-encart-aplat-nom{font:var(--fw-semi) var(--fs-h3)/1.3 var(--font-display);color:var(--c-ink)}
`/*CSS>>>*/;

/* ============================================================================
   2. LE BALISAGE — ligne 1 (emblème, recherche, compte, panier, devise),
      ligne 2 (raccourcis + accès professionnels), voile, recherche plein écran
      et tiroir mobile.
   ============================================================================ */
var MARKUP_PARTAGE = /*<<<MARKUP*/`<!-- ====== en-tete a deux lignes pleine largeur — etape 6 ======
     Ligne 1 : embleme + nom, recherche, « Mon compte », panier, devise (champs entete_*).
     Ligne 2 : « Nos produits » (grand menu a trois niveaux), « Nouveautes », « Bon plan »,
     « Themes », « Moins de 5 € », et « Acces professionnels » a l'extremite droite.
     Rien n'est ecrit en dur : les deux lignes sont rendues depuis les donnees reelles de la
     boutique (menu_source, raccourci_*, theme_*, pro_*), en bas de page. -->
<header class="site-header" id="site-header" data-od-id="entete">
  <div class="hl-top" data-od-id="entete-ligne-1">
    <div class="hl-top-inner" id="header-bar">
      <button class="burger" id="btn-menu" aria-label="Ouvrir le menu" aria-haspopup="true" aria-expanded="false" aria-controls="mobile-menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
      <a href="/" class="brand" aria-label="the-replicant.com — accueil" data-od-id="entete-logo">
        <span class="brand-mark">
          <svg class="rays" viewBox="0 0 100 100" aria-hidden="true">
            <path d="M50 4v14M50 82v14M4 50h14M82 50h14M17 17l10 10M73 73l10 10M83 17l-10 10M27 73l-10 10" fill="none" stroke-width="3" stroke-linecap="round"/>
          </svg>
<img src="data:image/webp;base64,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" alt="The Replicant" width="200" height="200">
      </span>
      <span class="brand-name">The Replicant<span>Cadeaux originaux</span></span>
    </a>
    <div class="hl-search" id="entete-recherche" data-od-id="entete-recherche">
      <form role="search" action="/recherche" method="get">
        <input type="hidden" name="controller" value="search">
        <label class="visually-hidden" for="search-desktop">Rechercher un produit</label>
        <input type="search" id="search-desktop" name="s" placeholder="Je cherche un produit" autocomplete="off" aria-describedby="hl-suggest-hint">
        <button type="submit" class="hl-search-btn" aria-label="Rechercher">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        </button>
      </form>
      <div class="hl-suggest" id="hl-suggest" role="listbox" aria-label="Catégories" data-open="false"></div>
      <p class="visually-hidden" id="hl-suggest-hint">Les propositions sont les catégories réelles de la boutique, lues dans l'arbre des catégories.</p>
    </div>
    <div class="hl-actions">
      <div class="hl-item" id="entete-compte" data-od-id="entete-compte">
        <button class="hl-btn" id="btn-compte" aria-label="Mon compte" aria-haspopup="true" aria-expanded="false" aria-controls="compte-menu">
          <svg class="ic-user" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.6-4 4.8-6 8-6s6.4 2 8 6"/></svg>
          <span>Mon compte</span>
          <svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="hl-menu" id="compte-menu" role="menu" aria-label="Mon compte" data-open="false">
          <a role="menuitem" href="/connexion">Connexion</a>
          <a role="menuitem" href="/connexion?create_account=1">Créer un compte</a>
          <a role="menuitem" href="/mon-compte">Mes commandes</a>
        </div>
      </div>
      <div class="panier-wrap" id="entete-panier" data-od-id="entete-panier">
        <a class="icon-btn" href="/panier" id="panier-icon-header" aria-label="Panier, 2 articles" aria-haspopup="true" aria-expanded="false" aria-controls="mini-panier">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6 5 3H2"/><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>
          <span class="cart-count">2</span>
        </a>
        <div class="mini-panier" id="mini-panier" data-open="false" role="dialog" aria-label="Aperçu du panier">
          <ul class="mini-panier-items">
            <li>
              <span class="nom">Kit brosse et peigne à barbe personnalisé pour Papy</span>
              <span class="qte">× 1</span>
              <span class="prix-ligne" data-prix-ht="5.825"></span>
            </li>
            <li>
              <span class="nom">Lot de 3 cochonnets modèle pétanque Club</span>
              <span class="qte">× 1</span>
              <span class="prix-ligne" data-prix-ht="4.158333"></span>
            </li>
          </ul>
          <div class="mini-panier-sous-total">
            <span>Sous-total</span>
            <span class="sous-total-valeur" data-prix-ht="9.983333"></span>
          </div>
          <a class="mini-panier-cta" href="/panier">Voir le panier</a>
          <p class="zp" style="display:block;margin-top:var(--e2)">Produits et quantités réels de démonstration. Même régime HT/TTC que les cartes produits ci-dessous et que la page panier complète.</p>
        </div>
      </div>
    </div>
    <button class="hl-devise" id="entete-devise" data-od-id="entete-devise" aria-label="Langue et devise : France, euro">FR / €</button>
    </div>
  </div>

  <!-- LIGNE 2 — pleine largeur : cinq entrees, « Acces professionnels » a l'extremite droite.
       Rien n'est ecrit en dur : « Nos produits » ouvre le grand menu a trois niveaux (univers,
       sous-categories, enfants) et « Themes » la bande de themes ; les deux sont rendus par le
       script depuis l'arbre des categories (menu_source), les nouveautes, les remises reellement
       en cours, les produits sous 5 € et les themes mis en avant (menu_* , raccourci_* , theme_*). -->
  <div class="hl-cats" id="hl-cats" data-od-id="entete-ligne-2">
    <nav class="hl-cats-inner" aria-label="Raccourcis de la boutique">
      <ul class="hl-line" id="hl-line"></ul>
      <a class="hl-pro" id="pro-lien" href="#" data-od-id="entete-pro">Accès professionnels</a>
      <noscript>
        <!-- Repli sans JavaScript : les quatre raccourcis puis les cinq univers, tous des pages
             reelles de la boutique, produits depuis le meme arbre (menu_source). Dans le theme
             PrestaShop, le module compagnon rend cet arbre cote serveur. -->
        <ul class="hl-line hl-line--dense">
          <li class="hl-entry"><a class="hl-link hl-link--raccourci" href="/nouveaux-produits">Nouveautés</a></li>
          <li class="hl-entry"><a class="hl-link hl-link--promo" href="/promotions">Bon plan</a></li>
          <li class="hl-entry"><a class="hl-link hl-link--raccourci" href="/677-nos-themes">Thèmes</a></li>
          <li class="hl-entry"><a class="hl-link hl-link--raccourci" href="/716-moins-de-5">Moins de 5 €</a></li>
        </ul>
        <ul class="hl-line hl-line--dense">
          <li class="hl-entry"><a class="hl-link" href="/463-maison">Maison</a></li>
          <li class="hl-entry"><a class="hl-link" href="/467-mode-et-bien-etre">Mode et Bien-Être</a></li>
          <li class="hl-entry"><a class="hl-link" href="/464-fetes-et-evenements">Fêtes et Événements</a></li>
          <li class="hl-entry"><a class="hl-link" href="/468-loisirs">Loisirs</a></li>
          <li class="hl-entry"><a class="hl-link" href="/444-pistolet-a-billes">Pistolets à billes</a></li>
        </ul>
      </noscript>
    </nav>
  </div>
</header>

<!-- voile : gris neutre a 30 % SOUS l'en-tete (il ne recouvre jamais la barre), flou de 2 px seulement la ou le navigateur sait le faire -->
<div class="voile" id="voile" data-open="false" aria-hidden="true"></div>



<div class="search-overlay" id="search-overlay" hidden>
  <div class="row">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
    <input type="search" placeholder="Rechercher un cadeau…" autocomplete="off">
    <button id="btn-search-close" aria-label="Fermer la recherche"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  </div>
  <div class="lbl" style="font:var(--fw-semi) var(--fs-xs) var(--font-body);text-transform:uppercase;letter-spacing:.06em;color:var(--c-mention)">Catégories</div>
  <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px">
    <li><a href="#" style="text-decoration:none;font-size:var(--fs-sm)">Décoration</a></li>
    <li><a href="#" style="text-decoration:none;font-size:var(--fs-sm)">Pistolets à billes — répliques et packs</a></li>
    <li><a href="#" style="text-decoration:none;font-size:var(--fs-sm)">Moins de 5&nbsp;€</a></li>
  </ul>
</div>

<nav class="mobile-menu" id="mobile-menu" aria-label="Menu" hidden>
  <div class="top">
    <button class="mm-retour" id="btn-menu-retour" aria-label="Retour a la page">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>
      <span>Retour</span>
    </button>
    <strong>Menu</strong>
    <button class="mm-fermer" id="btn-menu-close" aria-label="Fermer le menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  </div>
  <!-- recherche accessible en tete de l'accordeon (entete_recherche_placeholder) -->
  <form class="mm-recherche" role="search" action="/recherche" method="get">
    <input type="hidden" name="controller" value="search">
    <label class="visually-hidden" for="search-mobile">Rechercher un produit</label>
    <input type="search" id="search-mobile" name="s" placeholder="Je cherche un produit" autocomplete="off">
    <button type="submit" aria-label="Rechercher">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
    </button>
  </form>
  <div class="mm-bloc">
    <ul id="menu-tree" class="mm-liste"></ul>
    <ul>
      <li><a class="mm-lien" href="/blog">Blog</a></li>
      <li><a class="mm-lien" href="/content/4-a-propos-the-replicant">Qui sommes-nous ?</a></li>
    </ul>
  </div>
</nav>`/*MARKUP>>>*/;

/* ============================================================================
   3. L'INCLUSION — la feuille de style dans <head>, le balisage en tête de
      <body>. C'est tout ce que la page doit fournir.
   ============================================================================ */
(function poserLeBloc(){
  if (!document.getElementById('entete-partage-css')){
    var st = document.createElement('style');
    st.id = 'entete-partage-css';
    st.textContent = CSS_PARTAGE;
    (document.head || document.documentElement).appendChild(st);
  }
  document.body.insertAdjacentHTML('afterbegin', MARKUP_PARTAGE);
})();

/* ============================================================================
   4. LES DONNÉES ET LE COMPORTEMENT — bloc validé de l'accueil, inchangé, à deux
      exceptions près, toutes deux documentées dans changements-accueil.md :
        · les boutons de la barre basse mobile (#btn-menu-2, #btn-search-2) sont
          testés avant d'être câblés, pour qu'une page sans barre basse ne casse
          pas le bloc ; et #btn-menu l'est aussi, par symétrie ;
        · montrerBranche() met l'encart et les vignettes à jour (section 6).
   ============================================================================ */
  /* ====== en-tete a deux lignes : tout est rendu depuis l'arbre des categories (menu_source) ======
     menu_source est l'arbre reel lu dans la base de la boutique (283 categories, 7 branches,
     profondeur 3). Aucune categorie n'est ecrite a la main dans cette page : changer l'arbre change
     la ligne, les panneaux, le menu mobile et les propositions de recherche. */
var MENU_SOURCE = {"u":"/","n":"Accueil","e":[{"u":"/465-sports-et-loisirs","n":"Sports et Loisirs","e":[{"u":"/444-pistolet-a-billes","n":"Pistolet à billes","e":[{"u":"/9-consommables","n":"Consommables","e":[{"u":"/13-batteries-airsoft","n":"Batteries Airsoft","e":[{"u":"/31-batterie-lipo","n":"Batterie Lipo"},{"u":"/33-batterie-nimh","n":"Batterie Nimh"},{"u":"/32-batterie-aep","n":"Batterie AEP"},{"u":"/36-chargeurs-de-batteries","n":"Chargeurs de batteries"},{"u":"/72-piles","n":"Piles"},{"u":"/184-boitier-peq","n":"Boitier & PEQ"}]},{"u":"/753-autres-consommables","n":"Autres consommables","e":[{"u":"/138-cibles-de-tir-airsoft","n":"Cibles de tir Airsoft"},{"u":"/134-cartouche-co2","n":"Cartouche Co2"},{"u":"/183-bb-loader","n":"BB loader"},{"u":"/328-gaz","n":"Gaz"},{"u":"/528-autres-billes","n":"Autres billes"}]},{"u":"/145-billes-airsoft-6mm","n":"Billes Airsoft 6mm","e":[{"u":"/147-billes-025gr","n":"Billes 0.25gr"},{"u":"/148-billes-020gr","n":"Billes 0.20gr"}]},{"u":"/146-billes-airsoft-bio-6mm","n":"Billes airsoft Bio 6mm","e":[{"u":"/188-billes-bio-025gr","n":"Billes bio 0.25gr"},{"u":"/187-billes-bio-020gr","n":"Billes bio 0.20gr"}]}]},{"u":"/754-fusils-a-billes","n":"Fusils à billes","e":[{"u":"/5-fusils-electriques","n":"Fusils électriques"},{"u":"/50-fusils-a-ressort","n":"Fusils à ressort"}]},{"u":"/6-equipements-d-airsoft","n":"Équipements d'Airsoft","e":[{"u":"/20-autres-equipements","n":"Autres équipements"},{"u":"/219-protection-complete-airsoft","n":"Protection complète Airsoft"},{"u":"/241-vestes-tactiques","n":"Vestes Tactiques"},{"u":"/308-casquettes","n":"Casquettes"},{"u":"/262-transports","n":"Transports"}]},{"u":"/139-repliques-d-airsoft","n":"Répliques d'Airsoft","e":[{"u":"/4-pistolets-a-billes","n":"Pistolets à billes","e":[{"u":"/83-replique-de-poing-co2","n":"Réplique de poing Co2"},{"u":"/354-pistolets-a-ressort","n":"Pistolets à Ressort"},{"u":"/353-pistolets-electriques","n":"Pistolets électriques"}]}]},{"u":"/7-packs-complets","n":"Packs Complets","e":[{"u":"/141-packs-repliques-de-poing","n":"Packs répliques de poing"},{"u":"/142-packs-repliques-longues","n":"Packs répliques longues"}]},{"u":"/166-accessoires-airsoft","n":"Accessoires - Airsoft","e":[{"u":"/18-chargeurs-supplementaires","n":"Chargeurs Supplémentaires"},{"u":"/73-bi-pieds-airsoft","n":"Bi-pieds Airsoft"},{"u":"/75-rails-de-montage","n":"Rails de Montage"},{"u":"/77-silencieux","n":"Silencieux"},{"u":"/173-crosses","n":"Crosses"},{"u":"/169-poignees-tactiques","n":"Poignées tactiques"},{"u":"/179-lampes-et-lasers","n":"Lampes et Lasers"},{"u":"/177-optiques-et-organes-de-visee","n":"Optiques et Organes de visée"},{"u":"/261-sangles","n":"Sangles"}]},{"u":"/766-tous-nos-produits-pistolet-a-billes","n":"Tous nos produits pistolet à billes"},{"u":"/954-bon-plan-aep","n":"Bon plan AEP"}]}],"p":5},{"u":"/463-maison","n":"Maison","e":[{"u":"/472-decorations","n":"Décorations","e":[{"u":"/477-decoration-murale","n":"Décoration murale","e":[{"u":"/461-cadre-photo","n":"Cadre photo"},{"u":"/533-objets-deco","n":"Objets déco"},{"u":"/571-boite-a-cles","n":"Boîte à clés"},{"u":"/616-stickers-lettres-adhesives","n":"Stickers - Lettres Adhésives"},{"u":"/617-toiles-cadres-metal-ou-bois","n":"Toiles - Cadres métal ou Bois"},{"u":"/844-plaques-de-porte","n":"Plaques de porte"}]},{"u":"/644-horloges-et-bureau","n":"horloges et bureau","e":[{"u":"/474-espace-bureau","n":"Espace bureau"},{"u":"/508-pendules-et-horloges","n":"Pendules et Horloges"},{"u":"/574-luminaires","n":"Luminaires","e":[{"u":"/877-guirlandes-lumineuses","n":"Guirlandes lumineuses"}]}]},{"u":"/579-decorations-a-poser","n":"Décorations à poser","e":[{"u":"/513-statues-animaux","n":"Statues animaux"},{"u":"/565-tirelires","n":"Tirelires"},{"u":"/580-plantes-artificielles","n":"Plantes artificielles"},{"u":"/618-vides-poches","n":"Vides poches"},{"u":"/619-objets-divers","n":"Objets Divers"},{"u":"/750-cadres-photo","n":"Cadres photo"},{"u":"/774-vases","n":"Vases"}]},{"u":"/568-petit-mobilier","n":"Petit Mobilier","e":[{"u":"/564-chambre-d-enfants","n":"Chambre d''enfants"},{"u":"/576-rangements","n":"Rangements"},{"u":"/718-assises","n":"Assises"}]}]},{"u":"/473-coin-cuisine","n":"Coin cuisine","e":[{"u":"/541-mugs","n":"Mugs","e":[{"u":"/653-coffrets","n":"Coffrets"},{"u":"/658-festifs-humour","n":"Festifs - Humour"},{"u":"/657-affectifs","n":"Affectifs"},{"u":"/660-autres-tailles","n":"Autres tailles"}]},{"u":"/620-aperitifs-et-boissons","n":"Apéritifs et Boissons","e":[{"u":"/573-cocktails","n":"Cocktails"},{"u":"/572-fontaines-a-boisson","n":"Fontaines à boisson"},{"u":"/621-bieres","n":"Bières"},{"u":"/622-vins-et-champagnes","n":"Vins et Champagnes"},{"u":"/642-casiers-et-portes-bouteilles","n":"Casiers et portes bouteilles"},{"u":"/643-aperitifs","n":"Apéritifs"}]},{"u":"/575-dessous-de-verre-set-de-table","n":"Dessous de verre / Set de table","e":[{"u":"/624-sets-de-table","n":"Sets de table"},{"u":"/737-dessous-de-verres","n":"Dessous de verres"}]},{"u":"/738-cuisine-et-patisserie","n":"Cuisine et Patisserie","e":[{"u":"/627-moules","n":"Moules"},{"u":"/641-decorations-gateaux","n":"Décorations gâteaux"},{"u":"/739-ustensiles","n":"Ustensiles"},{"u":"/765-decoration-de-table","n":"Décoration de table"}]}]},{"u":"/635-linge-de-maison","n":"Linge de maison","e":[{"u":"/611-plaids-et-couvertures","n":"Plaids et couvertures","e":[{"u":"/645-bebe","n":"Bébé"},{"u":"/647-adulte","n":"Adulte"},{"u":"/646-enfant","n":"Enfant"}]},{"u":"/637-coussins","n":"Coussins","e":[{"u":"/648-enfants","n":"Enfants"},{"u":"/649-adultes","n":"Adultes"}]},{"u":"/636-au-sol","n":"Au sol","e":[{"u":"/650-tapis","n":"Tapis"},{"u":"/651-paillassons","n":"Paillassons"},{"u":"/652-cale-porte","n":"Cale porte"}]}]},{"u":"/640-bazar","n":"Bazar","e":[{"u":"/769-magnets","n":"Magnets"},{"u":"/796-articles-malins","n":"Articles Malins"},{"u":"/858-chiens-et-chats","n":"Chiens et Chats"},{"u":"/953-transport-isotherme","n":"Transport isotherme"}]}],"p":1},{"u":"/468-loisirs","n":"Loisirs","e":[{"u":"/443-adultes","n":"Adultes","e":[{"u":"/499-jeux-a-boire","n":"Jeux à boire"},{"u":"/506-objets-fantaisistes","n":"Objets fantaisistes"},{"u":"/567-fumeur","n":"Fumeur","e":[{"u":"/507-briquets","n":"Briquets"},{"u":"/752-cendriers","n":"Cendriers"}]}]},{"u":"/504-gadgets","n":"Gadgets","e":[{"u":"/500-petits-jouets","n":"Petits Jouets"},{"u":"/505-porte-cles","n":"Porte-clés"},{"u":"/577-farces-et-attrapes-humour","n":"Farces et attrapes - Humour"},{"u":"/964-trophes-humoristiques","n":"Trophés humoristiques"}]},{"u":"/721-exterieur","n":"Extérieur","e":[{"u":"/566-bouees-et-matelas","n":"Bouées et matelas"},{"u":"/655-jeux","n":"Jeux"},{"u":"/719-piscine-et-plage","n":"Piscine et plage"},{"u":"/776-petanque","n":"Pétanque"}]},{"u":"/722-interieur","n":"Intérieur","e":[{"u":"/582-jeux-en-famille","n":"Jeux en famille"},{"u":"/723-ecriture-et-dessin","n":"Écriture et dessin"},{"u":"/724-poster-a-gratter","n":"Poster à gratter"}]}],"p":4},{"u":"/467-mode-et-bien-etre","n":"Mode et Bien-Être","e":[{"u":"/453-bougie-et-senteur","n":"Bougie et Senteur","e":[{"u":"/703-non-odorantes","n":"Non odorantes"},{"u":"/704-photophores","n":"Photophores"},{"u":"/705-coffrets-plateaux","n":"Coffrets plateaux"},{"u":"/702-odorantes","n":"Odorantes"},{"u":"/706-a-piles","n":"À piles"}]},{"u":"/496-corps","n":"Corps","e":[{"u":"/498-detente","n":"Détente"},{"u":"/667-rafraichissement","n":"Rafraichissement"}]},{"u":"/666-petite-bagagerie","n":"Petite bagagerie","e":[{"u":"/604-parapluies","n":"Parapluies"},{"u":"/610-trousse-de-toilette","n":"Trousse de toilette"},{"u":"/701-sacs-porte-monnaie","n":"Sacs - porte-monnaie"},{"u":"/941-miroirs","n":"Miroirs"}]},{"u":"/834-mode","n":"Mode","e":[{"u":"/835-bobs","n":"Bobs"},{"u":"/839-echarpes-foulards","n":"Écharpes/Foulards"},{"u":"/836-casquettes","n":"Casquettes"}]}],"p":2},{"u":"/464-fetes-et-evenements","n":"Fêtes et Événements","e":[{"u":"/512-supporters","n":"Supporters","e":[{"u":"/569-drapeaux","n":"Drapeaux","e":[{"u":"/709-france","n":"France"},{"u":"/710-autres-pays","n":"Autres pays"}]},{"u":"/726-decorations","n":"Décorations","e":[{"u":"/727-ballons-arches","n":"Ballons - Arches"},{"u":"/728-fanion-banderoles","n":"Fanion – Banderoles"}]},{"u":"/729-panoplie","n":"Panoplie","e":[{"u":"/730-tete","n":"Tête"},{"u":"/731-visage","n":"Visage"},{"u":"/744-corps","n":"Corps"}]},{"u":"/732-faire-du-bruit","n":"Faire du bruit","e":[{"u":"/733-sifflet","n":"Sifflet"},{"u":"/735-autre","n":"Autre"},{"u":"/734-trompette","n":"Trompette"}]}]},{"u":"/592-fetes","n":"Fêtes","e":[{"u":"/516-saint-valentin","n":"Saint Valentin","e":[{"u":"/689-deco-ambiance","n":"Déco - Ambiance"},{"u":"/759-idees-cadeaux","n":"Idées cadeaux"}]},{"u":"/529-paques","n":"Pâques"},{"u":"/708-fetes-de-fin-d-annee","n":"Fêtes de fin d''année","e":[{"u":"/586-nouvel-an","n":"Nouvel an"},{"u":"/606-noel","n":"Noël"}]},{"u":"/613-halloween","n":"Halloween","e":[{"u":"/865-masques","n":"Masques"},{"u":"/866-decorations-halloween","n":"Décorations Halloween"},{"u":"/867-accessoires","n":"Accessoires"}]},{"u":"/693-14-juillet","n":"14 Juillet","e":[{"u":"/694-a-porter","n":"À porter"},{"u":"/695-decorations","n":"Décorations"}]},{"u":"/770-saint-patrick","n":"Saint Patrick"},{"u":"/929-fete-des-voisins","n":"Fête des voisins"}]},{"u":"/829-famille","n":"Famille","e":[{"u":"/523-autres-proches","n":"Autres proches","e":[{"u":"/743-fin-d-annee-scolaire","n":"Fin d'année scolaire"},{"u":"/919-marraine","n":"Marraine"},{"u":"/920-parrain","n":"Parrain"}]},{"u":"/538-famille-et-proches","n":"Famille et proches","e":[{"u":"/712-idees-cadeaux","n":"Idées cadeaux"}]},{"u":"/583-meres-et-peres","n":"Mères et Pères","e":[{"u":"/707-meres","n":"Mères"},{"u":"/711-pere","n":"Père"}]},{"u":"/584-grands-meres-et-grands-peres","n":"Grands mères et Grands pères","e":[{"u":"/740-grand-mere","n":"Grand-mère"},{"u":"/741-grand-pere","n":"Grand-père"}]}]},{"u":"/524-deguisements","n":"Déguisements","e":[{"u":"/670-clown","n":"Clown"},{"u":"/669-disco-annee-80-fluo","n":"Disco - Année 80 (Fluo)"},{"u":"/682-hawaii","n":"Hawaii"},{"u":"/683-divers-accessoires","n":"Divers Accessoires","e":[{"u":"/887-bretelles-et-noeuds-papillons","n":"Bretelles et Noeuds papillons"},{"u":"/897-chapeaux-festifs","n":"Chapeaux festifs"},{"u":"/899-masques","n":"Masques"},{"u":"/898-lunettes-festives","n":"Lunettes Festives"},{"u":"/902-chaussettes","n":"Chaussettes"}]},{"u":"/864-halloween","n":"Halloween","e":[{"u":"/690-masques","n":"Masques"},{"u":"/692-accessoires","n":"Accessoires","e":[{"u":"/900-faux-sang","n":"Faux sang"},{"u":"/932-accessoires-fictifs","n":"Accessoires Fictifs"},{"u":"/933-accessoires-de-tete","n":"Accessoires de tête"}]},{"u":"/691-decorations-halloween","n":"Décorations Halloween"}]}]},{"u":"/594-accessoires-divers","n":"Accessoires / Divers","e":[{"u":"/535-ballons-et-accessoires","n":"Ballons et accessoires","e":[{"u":"/661-sachets-de-ballons","n":"Sachets de ballons"},{"u":"/676-arches-et-support-ballons","n":"Arches et Support Ballons"},{"u":"/675-ballons-a-message","n":"Ballons à message"},{"u":"/684-accessoires","n":"Accessoires"},{"u":"/745-ballons-metalliques","n":"Ballons métalliques"}]},{"u":"/540-urnes","n":"Urnes","e":[{"u":"/662-urnes-cartons","n":"Urnes Cartons"},{"u":"/663-urnes-en-bois-et-verre","n":"Urnes en Bois et verre"}]},{"u":"/570-decoration-de-gateaux","n":"Décoration de gâteaux","e":[{"u":"/664-tops-et-pics","n":"Tops et Pics"},{"u":"/665-figurines","n":"Figurines"}]},{"u":"/825-ambiance","n":"Ambiance","e":[{"u":"/686-son-et-lumieres","n":"Son et Lumières"},{"u":"/767-guirlandes-et-fanions","n":"Guirlandes et Fanions"},{"u":"/826-canons-a-confettis","n":"Canons à Confettis"},{"u":"/853-pack-complet","n":"Pack complet"}]}]},{"u":"/593-evenements","n":"Événements","e":[{"u":"/539-mariage","n":"Mariage","e":[{"u":"/697-decorations","n":"Décorations"},{"u":"/698-urnes-tirelires","n":"Urnes - Tirelires"},{"u":"/696-enterrement-de-celibataire","n":"Enterrement de célibataire"},{"u":"/699-accessoires","n":"Accessoires"}]},{"u":"/560-anniversaire","n":"Anniversaire","e":[{"u":"/672-tops-et-pics","n":"Tops et Pics"},{"u":"/673-urnes","n":"Urnes"},{"u":"/674-ballons","n":"Ballons"},{"u":"/678-humour","n":"Humour"},{"u":"/679-accessoires","n":"Accessoires"},{"u":"/879-ballons-chiffres","n":"Ballons chiffres"}]},{"u":"/561-depart-a-la-retraite","n":"Départ à la retraite","e":[{"u":"/700-decorations","n":"Décorations"},{"u":"/725-petits-cadeaux","n":"Petits cadeaux"}]},{"u":"/562-autour-de-bebe","n":"Autour de bébé","e":[{"u":"/680-revelation-de-genre","n":"Révélation de genre"},{"u":"/681-baby-shower","n":"Baby Shower"},{"u":"/760-premiere-annee","n":"Première année"}]}]}],"p":3},{"u":"/677-nos-themes","n":"Nos thèmes","e":[{"u":"/476-vintage","n":"Vintage"},{"u":"/519-zen","n":"Zen"},{"u":"/527-a-l-exterieur-","n":"A l''extérieur'"},{"u":"/526-au-chaud","n":"Au chaud"},{"u":"/532-decorations-marines","n":"Décorations Marines"},{"u":"/761-licornes","n":"Licornes"},{"u":"/763-cranes","n":"Crânes"},{"u":"/762-mugs","n":"Mugs"},{"u":"/784-merci","n":"Merci"},{"u":"/823-apero","n":"Apéro"},{"u":"/828-decoration-d-ete","n":"Décoration d'été"},{"u":"/875-tous-nos-cadres","n":"Tous nos cadres"},{"u":"/878-deco-doree","n":"Déco dorée"},{"u":"/881-secret-santa","n":"Secret Santa"},{"u":"/883-idees-cadeaux-enfants","n":"Idées cadeaux enfants"},{"u":"/884-serie-tele","n":"Série Télé"},{"u":"/901-nos-coffrets","n":"Nos coffrets"},{"u":"/916-parrain-marraine","n":"Parrain Marraine"},{"u":"/915-interieur-cosy","n":"Intérieur Cosy"},{"u":"/921-la-boutique-du-beauf","n":"La boutique du beauf"},{"u":"/937-pool-party","n":"Pool Party"},{"u":"/956-rentree-pour-tous","n":"Rentrée pour tous"},{"u":"/959-octobre-rose","n":"Octobre Rose"},{"u":"/963-plaids-coussins-couvertures","n":"Plaids - Coussins - Couvertures"},{"u":"/970-paillettes","n":"Paillettes"}],"p":6},{"u":"/716-moins-de-5","n":"Moins de 5€","p":7}]};

  /* ====== donnees reelles de la ligne 2 — lues en base par le module compagnon ======
     menu_source : l'arbre des categories de la boutique (profondeur 5), releve le 22/09/2026 dans le
     plan du site et le fil d'Ariane de chaque categorie.
     Les raccourcis pointent les pages reelles : /nouveaux-produits, /promotions, /677-nos-themes,
     /716-moins-de-5. total et seuil ne sont jamais ecrits a l'ecran : ils decident seuls de
     l'affichage du raccourci (raccourci_*_seuil). */
  var RACCOURCIS = {                  /* raccourci_* : libelle, page reelle, total reel, seuil d'affichage */
    nouveautes: { actif: true, libelle: 'Nouveautés', url: '/nouveaux-produits', total: 39,  seuil: 0 },
    bonplan:    { actif: true, libelle: 'Bon plan',   url: '/promotions',       total: 17,  seuil: 5,  promo: true },
    theme:      { actif: true, libelle: 'Thèmes',     url: '/677-nos-themes',   total: 25,  seuil: 0 },
    moins5:     { actif: true, libelle: 'Moins de 5 €', url: '/716-moins-de-5', total: 510, seuil: 20 }
  };

  /* theme_* : les six themes reellement mis en avant par la boutique, avec leur image (120 px, WebP,
     219 x 155 a l'origine dans le menu de la boutique, recadree au carre comme le demande theme_image) */
  var THEMES = [
    { titre: "La boutique du beauf", lien: '/921-la-boutique-du-beauf', image: 'data:image/webp;base64,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' },
    { titre: "Décoration d'été", lien: '/828-decoration-d-ete', image: 'data:image/webp;base64,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' },
    { titre: "Déco dorée", lien: '/878-deco-doree', image: 'data:image/webp;base64,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' },
    { titre: "Apéro / Cocktails", lien: '/620-aperitifs-et-boissons', image: 'data:image/webp;base64,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' },
    { titre: "Mugs", lien: '/762-mugs', image: 'data:image/webp;base64,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' },
    { titre: "Ballons", lien: '/535-ballons-et-accessoires', image: 'data:image/webp;base64,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' }
  ];

  var MENU = {                        /* zones parametrables : entete_* , menu_* , raccourci_* , theme_* , pro_* */
    profondeur: 3,                    /* menu_profondeur : 2 ou 3 niveaux */
    colonnes: 'auto',                 /* menu_colonnes : 'auto' = 3 colonnes, 4 au-dela de 1440 px */
    encartActif: true,                /* menu_encart_actif */
    encartIndex: 0,                   /* menu_encart_image : un theme reellement mis en avant (index) */
    encartTitre: '',                  /* menu_encart_titre : vide = le titre reel du theme choisi */
    encartLien: '',                   /* menu_encart_lien : vide = le lien reel du theme choisi */
    ordre: 'back-office',             /* menu_ordre : position en back-office ou alphabetique */
    accueilActif: false,              /* menu_accueil_actif */
    accueilLibelle: 'Accueil',        /* menu_accueil_libelle */
    raccourcisActifs: true,           /* menu_raccourcis_actifs */
    proLibelle: 'Accès professionnels',/* pro_lien_libelle */
    proUrl: '#',                      /* pro_lien_url — a saisir : la boutique n'a pas de page pro */
    proPosition: 'droite',            /* pro_lien_position : droite ou gauche de la ligne */
    themeActif: true,                 /* theme_actif */
    themeOrdre: 'back-office',        /* theme_ordre */
    placeholder: 'Je cherche un produit',/* entete_recherche_placeholder */
    compteActif: true,                /* entete_compte_actif */
    panierActif: true,                /* entete_panier_actif */
    deviseActive: true                /* entete_devise_active */
  };

  function el(tag, cls, txt){ var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }
  function lien(cls, url, txt){ var a = el('a', cls, txt); a.href = url; return a; }
  function sansAccent(s){ return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
  function slug(s){ return sansAccent(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
  /* chaque univers porte un point de 6 px pris dans la palette du logo — aucune couleur inventee.
     La correspondance se fait sur le nom reel de la branche, pas sur son rang. */
  var PUCE_UNIVERS = [
    { cle: 'maison',   couleur: 'var(--c-promo)' },      /* #fe8200 */
    { cle: 'mode',     couleur: 'var(--c-deco)' },       /* #00f1fc */
    { cle: 'fetes',    couleur: 'var(--c-action)' },     /* #fee300 */
    { cle: 'loisirs',  couleur: 'var(--c-promo-text)' }, /* #a35200 */
    { cle: 'pistolet', couleur: 'var(--c-ink)' }         /* #2b2419 */
  ];
  function couleurUnivers(nom, i){
    var s = sansAccent(nom || '');
    for (var k = 0; k < PUCE_UNIVERS.length; k++){
      if (s.indexOf(PUCE_UNIVERS[k].cle) !== -1) return PUCE_UNIVERS[k].couleur;
    }
    return PUCE_UNIVERS[i % PUCE_UNIVERS.length].couleur;
  }
  /* les descendants d'une categorie, ARRETES a la profondeur demandee (etape 11) : le menu ne rend
     que deux niveaux APRES la categorie mere, trois en tout. Sans plafond, ce qui suit — criteres de
     public, de taille ou de style — polluait la liste ; ce sont des filtres de la page de categorie. */
  function descendants(n, max){
    var out = [], limite = (max == null) ? 1 : max;
    (function plat(x, d){
      if (d > limite) return;
      (x.e || []).forEach(function(c){ out.push(c); plat(c, d + 1); });
    })(n, 1);
    return out;
  }

  /* ---- ligne 2 : les entrees et leurs panneaux, rendus depuis les donnees reelles ---- */
  var ligne = document.getElementById('hl-line');
  var proLien = document.getElementById('pro-lien');
  var voile = document.getElementById('voile');
  var cats = document.getElementById('hl-cats');
  var desktopMq = window.matchMedia('(min-width:1024px)');
  var survolSouris = window.matchMedia('(hover:hover) and (pointer:fine)');
  var focusProtege = false;               /* evite qu'un focus programmatique rouvre le panneau */

  /* Un conteneur qui n'a qu'un seul enfant n'est pas un univers : la ligne montre l'enfant a sa place
     (« Sports et Loisirs » n'est pas un univers de la boutique, « Pistolet a billes » en est un).
     Une branche sans enfant (« Nos themes », « Moins de 5 € ») est un raccourci, pas un univers. */
  function univers(){
    var l = [];
    var raccourcis = Object.keys(RACCOURCIS).map(function(k){ return RACCOURCIS[k].url; });
    MENU_SOURCE.e.forEach(function(b, i){
      var node = (b.e && b.e.length === 1) ? b.e[0] : b;
      if (!node.e || !node.e.length) return;
      /* les branches qu'un raccourci de la ligne ouvre deja ne sont pas des univers : « Nos themes »
         et « Moins de 5 € » sont des raccourcis, pas des univers de catalogue. */
      if (raccourcis.indexOf(node.u) !== -1) return;
      l.push({n:node.n, u:node.u, node:node, p:(b.p || (i + 1))});
    });
    l.sort(function(a,b){ return a.p - b.p; });                 /* menu_ordre = position back-office */
    if (MENU.ordre === 'alpha') l.sort(function(a,b){ return a.n.localeCompare(b.n,'fr'); });
    return l;
  }
  var UNIVERS = univers();

  /* OUVERTURE : LE CLIC D'ABORD, LE SURVOL ENSUITE (etape 10).
     « Nos produits » est un BOUTON et « Themes » un lien dont le clic est intercepte : le clic
     ouvre et referme le panneau, il ne navigue pas (une seule action par element — la page reelle
     de « Themes » reste atteignable par le pied du panneau et par un clic modifie). Le survol seul
     n'ouvre JAMAIS un panneau : il ne fait que l'animation de surlignage, sauf quand un panneau est
     deja ouvert, ou il bascule d'un panneau a l'autre. Dans le panneau, c'est le survol (ou le
     focus) d'un univers qui affiche ses sous-categories. */
  /* ---- la hauteur du panneau n'est plus calculee en JS (etapes 9 et 10) ----
     Le panneau est fixed, top:var(--hauteur-entete), right/bottom/left:0, height:auto : sa hauteur
     EST la hauteur restante sous l'en-tete a tout moment, sans mesure ni variable --hl-panel-h.
     Ce que --hauteur-entete transporte, c'est le BAS de l'en-tete, mesure par majHauteurEntete()
     (ResizeObserver pose sur l'en-tete + au defilement). Ce qui se rafraichit ici, c'est la
     REPARTITION des colonnes et la position des reperes, dont la geometrie depend de la fenetre. */
  var largeMq = window.matchMedia('(min-width:1440px)');
  function majPanneaux(){
    entreesPanneau().forEach(function(e){
      var p = panneauDe(e);
      if (!p) return;
      if (p.majRepartition) p.majRepartition();
      if (p.majRepere) p.majRepere();
    });
  }

  /* ---- ligne de pied d'un panneau, sur toute la largeur : le lien « Tout voir dans ... » a
     gauche, les cinq univers rappeles en petits caracteres a droite (memes pages reelles). ---- */
  function piedPanneau(libelle, url){
    var pied = el('div','mg-pied');
    pied.appendChild(lien('mg-pied-tout', url, libelle));
    var ul = el('ul','mg-pied-univers');
    UNIVERS.forEach(function(br){ var li = el('li'); li.appendChild(lien(null, br.u, br.n)); ul.appendChild(li); });
    pied.appendChild(ul);
    return pied;
  }

  /* ---- encart du grand menu (menu_encart_*) : une seule image legere, a droite des colonnes.
     L'image est celle d'un theme REELLEMENT mis en avant par la boutique (theme_image) : aucune
     illustration inventee, aucun visuel de substitution. Elle occupe la hauteur disponible sans
     jamais etre etiree (rapport 1:1 preserve). ---- */
  function encartMenu(){
    if (!MENU.encartActif) return null;
    var t = THEMES[MENU.encartIndex] || THEMES[0];
    if (!t) return null;
    var a = lien('mg-encart', MENU.encartLien || t.lien, null);
    var img = document.createElement('img');
    img.className = 'mg-encart-img';
    img.src = t.image;
    img.alt = MENU.encartTitre || t.titre;
    img.setAttribute('width','240'); img.setAttribute('height','240');
    img.setAttribute('loading','lazy'); img.setAttribute('decoding','async');
    a.appendChild(img);
    a.appendChild(el('span','mg-encart-titre', MENU.encartTitre || t.titre));
    return a;
  }

  /* ---- rattachement des panneaux PLEIN ECRAN (etape 9) ----
     Un panneau descendant de `.site-header` ne peut pas mesurer la fenetre : cet en-tete porte
     backdrop-filter:blur(6px), et un filtre (comme transform, contain ou will-change) fait de son
     element le BLOC CONTENEUR de tout descendant position:fixed. En plus, la chaine de conteneurs
     porte max-width:var(--wrap-max) — 1320 px. Les panneaux sont donc rattaches DIRECTEMENT a
     <body> par attacherPanneau(), et chaque entree de la ligne en garde une reference (e._panneau). */
  function panneauDe(e){ return (e && e._panneau) ? e._panneau : null; }
  function declencheur(e){
    if (!e) return null;
    return e.querySelector('[aria-expanded]') || e.querySelector('.hl-link');
  }
  function croix(){
    var s = document.createElementNS('http://www.w3.org/2000/svg','svg');
    s.setAttribute('viewBox','0 0 24 24'); s.setAttribute('aria-hidden','true');
    var p = document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d','M6 6l12 12M18 6L6 18'); p.setAttribute('fill','none');
    p.setAttribute('stroke','currentColor'); p.setAttribute('stroke-width','2');
    s.appendChild(p);
    return s;
  }
  /* ---- rangee 1 du panneau : sa barre de titre ----
     Depuis l'etape 10 le panneau s'ouvre SOUS l'en-tete, qui reste visible et cliquable : le logo
     et le nom ecrit sont deja a l'ecran, 48 px plus haut. Le panneau ne les repete donc pas — il
     garde le titre du menu et la sortie. Le bouton « Fermer » (44 px de haut) est la sortie au
     doigt : le voile est derriere le panneau, donc hors de portee. Une seule action par element :
     ce bouton ferme, il ne fait rien d'autre. */
  function entetePanneau(titre){
    var top = el('div','pn-top');
    top.appendChild(el('span','pn-titre', titre));
    var b = el('button','pn-fermer');
    b.type = 'button';
    b.setAttribute('aria-label','Fermer le menu ' + titre);
    b.appendChild(el('span', null, 'Fermer'));
    b.appendChild(croix());
    top.appendChild(b);
    return top;
  }
  function attacherPanneau(e, p){
    if (!e || !p) return p;
    e._panneau = p;
    p._entree = e;
    p.dataset.open = 'false';
    document.body.appendChild(p);                 /* enfant direct de <body> : rien au-dessus */
    var f = p.querySelector('.pn-fermer');
    if (f) f.addEventListener('click', function(){
      fermerTousPanneaux();
      rendreFocus(declencheur(e));
    });
    return p;
  }

  /* ---- grand menu : toute la largeur SOUS l'en-tete, deux zones neutres ----
     Colonne 1 (17,5 rem = 280 px) : les cinq univers, precedes de leur point de 6 px. Zone 2 :
     les sous-categories (niveau 2) et leurs enfants (niveau 3) — deux niveaux apres la categorie
     mere, trois en tout, jamais au-dela (etape 11) — repartis en 3 colonnes (4 au-dela
     de 1440 px) de 48 px d'ecart. Si une branche ne tient pas, on AJOUTE une colonne, puis on
     resserre la typographie (trois paliers de densite, data-densite) : la zone ne defile que dans
     la seule combinaison ou rien d'autre ne tient (cf. corrections n° 37 et 38).
     Aucun compteur d'elements n'est affiche nulle part. */
  function panneauCatalogue(){
    var p = el('div','hl-panel panneau-menu');
    p.id = 'hl-panel-catalogue';
    p.setAttribute('role','region');
    p.setAttribute('tabindex','-1');
    p.setAttribute('aria-label','Nos produits — les univers, leurs sous-catégories et leurs enfants');
    var mg = el('div','mg');
    var col1 = el('div','mg-col1');
    var meres = el('ul','mg-mothers');
    var survol = el('span','mg-survol'); survol.setAttribute('aria-hidden','true');
    var rail = el('span','mg-rail'); rail.setAttribute('aria-hidden','true');
    col1.appendChild(survol); col1.appendChild(rail); col1.appendChild(meres);
    var zone = el('div','mg-zone');
    var cols = el('div','mg-cols');
    cols.id = 'mg-cols';
    zone.appendChild(cols);
    var pied = piedPanneau('Tout voir dans ' + (UNIVERS[0] ? UNIVERS[0].n : 'le catalogue'), UNIVERS[0] ? UNIVERS[0].u : MENU_SOURCE.u);
    var tout = pied.querySelector('.mg-pied-tout');
    var liensMeres = [];
    var actif = 0;
    var premierRepere = true;
    var blocs = [];
    /* signature de la derniere repartition : branche affichee, hauteur et largeur disponibles,
       menu_colonnes et profondeur. Tant qu'elle ne change pas, le DOM des colonnes n'est PAS
       reconstruit — sinon le focus de l'utilisateur, qui se trouve dans une colonne, serait detruit
       a chaque focusin (le panneau se rouvre sur lui-meme). */
    var signature = '';
    /* palier de densite courant (0, 1 ou 2) : il vit sur le panneau (data-densite) pour que le CSS
       s'en serve, et dans cette variable pour que colonnesMax() et la signature le connaissent. */
    var densite = 0;
    function appliquerDensite(d){
      densite = d;
      if (d) p.dataset.densite = String(d);
      else delete p.dataset.densite;
    }

    /* les deux reperes de la colonne 1 : le fond creux de l'univers survole et le filet orange de
       3 px. Tous deux places en transform, donc la mise en page ne bouge jamais. Au premier
       affichage le fond arrive avec une montee de 4 px ; le filet suit simplement son univers. */
    function placerRepere(lienActif){
      if (!lienActif) return;
      var y = lienActif.offsetTop, h = lienActif.offsetHeight;
      survol.style.height = h + 'px';
      if (premierRepere){
        survol.style.transition = 'none';
        survol.style.transform = 'translateY(' + (y + 4) + 'px)';
        void survol.offsetHeight;                        /* reflow force : la transition reprend apres */
        survol.style.transition = '';
        premierRepere = false;
      }
      survol.style.transform = 'translateY(' + y + 'px)';
      survol.style.opacity = '1';
      rail.style.transform = 'translateY(' + Math.round(y + (h - 22) / 2) + 'px)';
      rail.style.opacity = '1';
    }

    /* ---- repartition des blocs en colonnes ----
       Chaque bloc est une sous-categorie (niveau 2) suivie de tous ses descendants. Le bloc le
       plus court est rempli en premier, si bien que les colonnes s'equilibrent et que la lecture
       suit les colonnes de gauche a droite. Si la hauteur disponible ne suffit pas, on ajoute une
       colonne (jusqu'a 7 ou jusqu'a la largeur minimale de 160 px par colonne), puis on resserre
       la densite : le defilement n'arrive qu'en dernier recours, et il est declare. */
    function capacite(){ return cols.clientHeight; }
    /* nombre de colonnes que la largeur peut porter : il depend de la densite courante (colonne
       minimale et ecart plus serres quand on resserre la typographie). L'encart de 240 px et la
       colonne des univers de 280 px ne sont jamais touches. */
    function colonnesMax(){
      var dispo = cols.clientWidth,
          mini = densite === 2 ? 120 : (densite === 1 ? 140 : 160),
          gap  = densite === 2 ? 16 : (densite === 1 ? 32 : 48);
      return Math.max(1, Math.min(7, Math.floor((dispo + gap) / (mini + gap))));
    }
    function hauteurMax(){
      var m = 0;
      for (var k = 0; k < cols.children.length; k++) m = Math.max(m, cols.children[k].scrollHeight);
      return m;
    }
    /* ---- LA REPARTITION SE FAIT SUR LES GROUPES, JAMAIS SUR LES LIGNES (etape 12) --------------
       Un GROUPE = une sous-categorie (niveau 2) ET tous ses enfants (niveau 3). Il se deplace d'une
       colonne a l'autre EN ENTIER et ne peut jamais etre coupe : plus d'enfant sans titre en tete
       de colonne, plus de filet vertical au milieu d'un groupe. Aucun equilibrage fin : les
       colonnes se remplissent dans l'ordre, un remplissage inegal est normal et accepte. */
    var H_TITRE = 23, H_LIEN = 29;
    function hauteurBloc(b){ return H_TITRE + b.liens.length * H_LIEN; }
    function poserBloc(conteneur, b){
      var g = el('div','mg-groupe');
      g.appendChild(lien('mg-groupe-titre', b.url, b.titre));   /* niveau 2 : cliquable */
      var ul = el('ul', null);
      b.liens.forEach(function(f){
        var li = el('li');
        li.appendChild(lien(null, f.u, f.n));                   /* niveau 3 : les enfants */
        ul.appendChild(li);
      });
      /* une sous-categorie sans enfant s'arrete a son titre : pas de <ul> vide, donc pas de filet
         vertical orphelin sous le titre */
      if (ul.children.length) g.appendChild(ul);
      conteneur.appendChild(g);
    }
    function poser(n){
      cols.textContent = '';
      var listes = [];
      for (var k = 0; k < n; k++){ var c = el('div','mg-col'); cols.appendChild(c); listes.push({el:c, h:0}); }
      var i = 0;
      /* chaque colonne recoit des GROUPES ENTIERS, dans l'ordre ; le premier groupe entre toujours,
         meme s'il est plus haut que sa part, pour qu'aucune colonne ne reste vide. */
      for (var k = 0; k < n && i < blocs.length; k++){
        var col = listes[k];
        var reste = 0;
        for (var x = i; x < blocs.length; x++) reste += hauteurBloc(blocs[x]);
        var cible = reste / (n - k);
        while (i < blocs.length){
          var hb = hauteurBloc(blocs[i]);
          if (col.h > 0 && col.h + hb > cible) break;
          poserBloc(col.el, blocs[i]);
          col.h += hb;
          i++;
        }
      }
      while (i < blocs.length){ poserBloc(listes[listes.length - 1].el, blocs[i]); i++; }
    }
    function geometrie(){
      return [actif, Math.round(cols.clientHeight), Math.round(cols.clientWidth),
              MENU.colonnes === 3 ? '3' : 'auto', MENU.profondeur, densite].join('|');
    }
    /* ---- repartition : trois paliers de densite, puis un repli declare -------------------------
       Palier 0 : contrat valide — 48 px d'ecart, typographie de la page. On ajoute des colonnes
                  tant que la plus haute depasse la place disponible.
       Palier 1 : texte de mention, ecart 32 px, respiration reduite. On repart de la base et on
                  ajoute a nouveau des colonnes.
       Palier 2 : interligne 1,25, respiration minimale, ecart 16 px, colonnes de 120 px mini.
       Repli declare (mg-zone--scroll) : la ZONE des colonnes defile — jamais le panneau. Il ne
       sert qu'a une combinaison mesuree : « Fêtes et Événements » (100 entrees) sous 768 px de
       hauteur de fenetre, ou 197 px sont pris par l'en-tete. Voir le CSS. */
    function repartirColonnes(){
      if (!cols.clientHeight) return;                       /* pas encore pose dans le document */
      var geo = geometrie();
      if (geo === signature && cols.children.length) return; /* rien n'a change : on ne reconstruit pas */
      var base = (MENU.colonnes === 3 || !largeMq.matches) ? 3 : 4;   /* menu_colonnes */
      var ok = false, n = base, d;
      for (d = 0; d <= 2 && !ok; d++){
        appliquerDensite(d);
        var max = Math.max(base, colonnesMax());
        n = base;
        poser(n);
        for (var i = 0; i < 8; i++){
          if (hauteurMax() <= capacite() + 1 || n >= max) break;
          n++; poser(n);
        }
        ok = hauteurMax() <= capacite() + 1;
      }
      zone.classList.toggle('mg-zone--scroll', !ok);
      signature = geometrie();                             /* la geometrie rendue, rien d'autre */
    }

    function montrerBranche(i){
      var br = UNIVERS[i];
      if (!br) return;
      actif = i;
      liensMeres.forEach(function(a, k){
        var on = (k === i);
        a.setAttribute('data-actif', on ? 'true' : 'false');
        /* l'univers actif est aussi annonce aux lecteurs d'ecran : le filet orange est decoratif */
        if (on) a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current');
      });
      placerRepere(liensMeres[i]);
      tout.textContent = 'Tout voir dans ' + br.n;      /* ligne discrete en bas du panneau */
      tout.href = br.u;
      /* LE MENU S'ARRETE A DEUX NIVEAUX APRES LA CATEGORIE MERE, trois en tout (etape 11) : la
         sous-categorie et ses enfants, rien de plus profond. menu_profondeur = 3 par defaut ; a 2,
         le menu s'arrete aux sous-categories. */
      blocs = (br.node.e || []).map(function(g){
        return { titre: g.n, url: g.u, liens: MENU.profondeur >= 3 ? descendants(g, 1) : [] };
      });
      repartirColonnes();
      majEncart(i); poserVignettes();   /* categorie_image_menu : encart et vignette de colonne */
    }

    UNIVERS.forEach(function(br, i){
      var li = el('li');
      var a = lien('mg-mother', br.u, null);
      a.setAttribute('data-od-id','univers-' + slug(br.n));
      var puce = el('span','mg-puce');
      puce.style.background = couleurUnivers(br.n, i);
      a.appendChild(puce);
      a.appendChild(el('span', null, br.n));
      a.addEventListener('mouseenter', function(){ montrerBranche(i); });
      a.addEventListener('focus', function(){ montrerBranche(i); });
      li.appendChild(a); meres.appendChild(li); liensMeres.push(a);
    });

    mg.appendChild(col1); mg.appendChild(zone);
    var encart = encartMenu();
    if (encart) mg.appendChild(encart);
    /* les TROIS rangees du grid du panneau, donc trois enfants DIRECTS : en-tete, contenu, pied
       (le panneau n'est plus dans l'item : plus de .hl-panel-inner) */
    p.appendChild(entetePanneau('Nos produits'));
    p.appendChild(mg);
    p.appendChild(pied);
    montrerBranche(0);                                            /* un univers est toujours ouvert */
    /* la geometrie des reperes et la repartition des colonnes ne peuvent etre lues qu'une fois le
       panneau pose dans le document (clientHeight) */
    p.majRepere = function(){ placerRepere(liensMeres[actif]); };
    p.majRepartition = function(){ repartirColonnes(); if (p.majRepere) p.majRepere(); };
    requestAnimationFrame(p.majRepartition);
    return p;
  }

  /* ---- bande de themes : six vignettes carrees de 180 px, WebP, chargement differe, reparties
     sur toute la largeur du panneau plein ecran. C'est une bande de navigation, pas une galerie. */
  function bandeThemes(){
    var ul = el('ul','th-band');
    var liste = THEMES.slice();
    if (MENU.themeOrdre === 'alpha') liste.sort(function(a,b){ return a.titre.localeCompare(b.titre,'fr'); });
    liste.slice(0, 6).forEach(function(t){                        /* six au maximum */
      var li = el('li');
      var a = lien('th-item', t.lien, null);
      var fig = el('span','th-image');
      var img = document.createElement('img');
      img.src = t.image; img.alt = 'Thème ' + t.titre;
      img.setAttribute('width','180'); img.setAttribute('height','180');
      img.setAttribute('loading','lazy'); img.setAttribute('decoding','async');
      fig.appendChild(img);
      a.appendChild(fig);
      a.appendChild(el('span','th-titre', t.titre));
      li.appendChild(a); ul.appendChild(li);
    });
    return ul;
  }

  /* ---- menu Themes : meme panneau PLEIN ECRAN que le grand menu — bord a bord, toute la hauteur
     de la fenetre, fond blanc, voile neutre derriere, meme ligne de pied discrete en bas. ---- */
  function panneauThemes(){
    var p = el('div','hl-panel panneau-menu');
    p.id = 'hl-panel-themes';
    p.setAttribute('role','region');
    p.setAttribute('tabindex','-1');
    p.setAttribute('aria-label','Thèmes mis en avant');
    var zone = el('div','th-zone');
    zone.appendChild(bandeThemes());
    p.appendChild(entetePanneau('Thèmes'));
    p.appendChild(zone);
    p.appendChild(piedPanneau('Tous nos thèmes', '/677-nos-themes'));
    p.majRepartition = function(){};            /* la bande se repartit d'elle-meme sur la largeur */
    return p;
  }

  /* ---- ouverture et fermeture ----
     Le clic ouvre et verrouille (indispensable au doigt, ou le survol n'existe pas) ; le survol
     n'ouvre que la ou il y a une souris, et ne referme pas un panneau verrouille. */
  function entreesPanneau(){
    /* une entree « a panneau » est une entree qui en possede un : le panneau n'est plus son
       descendant, la reference e._panneau fait foi (attacherPanneau) */
    return Array.prototype.slice.call(ligne.querySelectorAll('.hl-entry')).filter(function(e){ return !!e._panneau; });
  }
  function majVoile(){
    /* l'etat reel du panneau, rien d'autre : le survol comme le clic passent par data-open, donc
       le voile ne peut pas rester allume apres une fermeture (Echap, bouton Fermer). */
    var ouvert = entreesPanneau().some(function(e){ return e.dataset.open === 'true'; });
    voile.dataset.open = ouvert ? 'true' : 'false';
    /* et la page ne defile plus derriere un panneau plein ecran (voir body[data-panneau]) */
    if (ouvert) document.body.dataset.panneau = 'ouvert';
    else delete document.body.dataset.panneau;
  }
  function ouvrirEntree(e){
    if (!desktopMq.matches) return;            /* sous 1024 px le contenu passe par l'accordeon */
    e.dataset.open = 'true';
    var p = panneauDe(e);
    if (p) p.dataset.open = 'true';            /* l'etat vit sur le PANNEAU : il n'est plus dans l'item */
    var b = e.querySelector('[aria-expanded]'); if (b) b.setAttribute('aria-expanded','true');
    /* les reperes du grand menu et la repartition des colonnes se reposent sur la geometrie reelle
       a chaque ouverture (la hauteur, elle, est celle de la fenetre : 100vh) */
    if (p){
      if (p.majRepartition) p.majRepartition();
      if (p.majRepere) p.majRepere();
    }
    majVoile();
  }
  function fermerEntree(e){
    e.dataset.locked = 'false';
    e.dataset.open = 'false';
    var p = panneauDe(e);
    if (p) p.dataset.open = 'false';
    var b = e.querySelector('[aria-expanded]'); if (b) b.setAttribute('aria-expanded','false');
    majVoile();
  }
  function fermerTousPanneaux(sauf){
    entreesPanneau().forEach(function(e){ if (e !== sauf) fermerEntree(e); });
  }

  function renderLigne(){
    /* les panneaux vivent sous <body>, hors de la ligne : le vidage de la ligne ne les emporte
       pas, on les retire donc explicitement avant d'en reconstruire (sinon chaque changement de
       champ du back-office empilerait un panneau de plus, avec un id en double et un aria-controls
       qui pointerait sur un panneau mort). */
    Array.prototype.slice.call(document.querySelectorAll('body > .hl-panel')).forEach(function(x){
      if (x.parentNode) x.parentNode.removeChild(x);
    });
    ligne.textContent = '';
    /* « Nos produits » : encre, ouvre le grand menu — bouton, jamais un lien (une seule action) */
    var eCat = el('li','hl-entry');
    eCat.dataset.odId = 'entree-nos-produits';
    var bCat = el('button','hl-link hl-link--catalogue','Nos produits');
    bCat.type = 'button';
    bCat.id = 'btn-nos-produits';
    bCat.setAttribute('aria-expanded','false');
    bCat.setAttribute('aria-controls','hl-panel-catalogue');
    bCat.appendChild(chevron());
    eCat.appendChild(bCat);
    ligne.appendChild(eCat);
    attacherPanneau(eCat, panneauCatalogue());   /* le panneau vit sous <body>, l'entree le reference */

    /* les quatre raccourcis portent la meme encre que le catalogue : plus d'aplat (etape 7).
       « Bon plan » ne se signale plus que par son point orange pulsant, et seulement quand des
       remises sont REELLEMENT en cours (raccourci_bonplan_seuil, raccourci_bonplan_actif). */
    ['nouveautes','bonplan','theme','moins5'].forEach(function(cle){
      var r = RACCOURCIS[cle];
      if (!MENU.raccourcisActifs || !r.actif || r.total < r.seuil) return;
      if (cle === 'theme' && !MENU.themeActif) return;
      var e = el('li','hl-entry');
      e.dataset.odId = 'entree-' + cle;
      var a = lien('hl-link hl-link--' + (r.promo ? 'promo' : 'raccourci'), r.url, null);
      a.dataset.odId = 'raccourci-' + cle;
      /* « Bon plan » : un point de 6 px pulse lentement tant qu'une remise est en cours. Aucun
         nombre d'elements n'est affiche, a aucun endroit de la ligne. */
      if (cle === 'bonplan') a.appendChild(el('span','bp-puce'));
      a.appendChild(el('span', null, r.libelle));
      e.appendChild(a);
      var panTheme = null;
      if (cle === 'theme'){
        a.id = 'btn-themes';
        a.setAttribute('aria-haspopup','true');
        a.setAttribute('aria-expanded','false');
        a.setAttribute('aria-controls','hl-panel-themes');
        a.appendChild(chevron());
        panTheme = panneauThemes();
      }
      ligne.appendChild(e);
      if (panTheme) attacherPanneau(e, panTheme);
    });
    initGlisse();
    cablerPanneaux();
    ajusterDensite();
    majPanneaux();                  /* la repartition des colonnes suit la taille de la fenetre */
  }

  /* ---- repere glissant de la ligne du bas (etape 7) ----
     Un trait de 2 px vit sous la ligne et suit l'item survole ou focalise — au clavier l'indicateur
     suit le focus, donc on voit ou l'on est sans souris. Le glissement est une transformation
     composee (translateX puis scaleX) : ni la largeur ni la mise en page ne sont animees. */
  var glisse = null;
  var dernierLien = null;
  function initGlisse(){
    if (glisse && glisse.parentNode === ligne) return;
    glisse = el('span','hl-glisse');
    glisse.setAttribute('aria-hidden','true');
    ligne.insertBefore(glisse, ligne.firstChild);
  }
  function majGlisse(cible){
    if (!glisse || !cible) return;
    dernierLien = cible;
    glisse.style.transform = 'translateX(' + cible.offsetLeft + 'px) scaleX(' + cible.offsetWidth + ')';
  }
  function cibleGlisse(ev){
    return ev.target && ev.target.closest ? ev.target.closest('.hl-line .hl-link') : null;
  }
  ligne.addEventListener('mouseover', function(ev){ var a = cibleGlisse(ev); if (a) majGlisse(a); });
  ligne.addEventListener('focusin', function(ev){ var a = cibleGlisse(ev); if (a) majGlisse(a); });

  /* ---- survol / focus / clic : etat reel, voile synchronise (refonte etape 10) ----------------
     LE CLIC D'ABORD : le clic sur « Nos produits » ouvre le grand menu, un second clic le ferme ;
     idem pour « Thèmes ». Le clic ne navigue pas — la page reelle reste atteignable par le pied du
     panneau (et par un clic modifie, qui n'est pas intercepte).
     LE SURVOL ENSUITE : si aucun panneau n'est ouvert, le survol ne fait RIEN d'autre que
     l'animation de surlignage de la ligne (c'est le point corrige : un menu qu'on ne peut pas
     utiliser au doigt parce qu'il s'ouvre au survol seul). Si un panneau est deja ouvert, le
     survol d'une autre entree a panneau bascule de l'un a l'autre, et le focus fait exactement
     la meme chose au clavier.
     FERMETURE : un clic sur le declencheur, un clic ailleurs, le bouton « Fermer » ou Echap. Le
     focus revient toujours sur l'entree qui a ouvert. */
  function unPanneauOuvert(){ return !!panneauActif(); }
  function cablerPanneaux(){
    entreesPanneau().forEach(function(e){
      if (e.dataset.cable === 'true') return;
      e.dataset.cable = 'true';
      var p = panneauDe(e);
      var btn = declencheur(e);
      if (btn && p){
        btn.addEventListener('click', function(ev){
          /* sous 1024 px les panneaux cedent la place a l'accordeon plein ecran deja valide :
             « Nos produits » (un bouton) l'ouvre ; « Thèmes » reste un LIEN et garde sa page */
          if (!desktopMq.matches){
            if (btn.tagName === 'BUTTON'){ ev.preventDefault(); openMenu(); }
            return;
          }
          ev.preventDefault();
          if (e.dataset.open === 'true'){       /* second clic : ferme et rend le focus */
            fermerEntree(e);
            rendreFocus(btn);
            return;
          }
          fermerTousPanneaux(e);
          e.dataset.locked = 'true';
          ouvrirEntree(e);
          /* le focus entre dans le panneau : la tabulation y reste (clavierPanneaux) et Echap le
             rend au declencheur */
          rendreFocus(p);
        });
        e.addEventListener('mouseenter', function(){
          if (!survolSouris.matches || !desktopMq.matches) return;
          if (!unPanneauOuvert() || e.dataset.open === 'true') return;
          fermerTousPanneaux(e);
          ouvrirEntree(e);
        });
        /* meme regle au clavier : le focus remplace le survol — mais il n'ouvre jamais un panneau
           a lui seul, il ne fait que basculer entre deux panneaux quand l'un est deja ouvert */
        e.addEventListener('focusin', function(){
          if (focusProtege || !desktopMq.matches) return;
          if (!unPanneauOuvert() || e.dataset.open === 'true') return;
          fermerTousPanneaux(e);
          ouvrirEntree(e);
        });
      }
    });
    majVoile();
  }

  function rendreFocus(btn){
    if (!btn) return;
    focusProtege = true;
    btn.focus();
    setTimeout(function(){ focusProtege = false; }, 0);
  }

  function chevron(){
    var s = document.createElementNS('http://www.w3.org/2000/svg','svg');
    s.setAttribute('viewBox','0 0 24 24'); s.setAttribute('aria-hidden','true'); s.setAttribute('class','chev');
    var p = document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d','M6 9l6 6 6-6'); p.setAttribute('fill','none');
    p.setAttribute('stroke','currentColor'); p.setAttribute('stroke-width','2');
    s.appendChild(p);
    return s;
  }

  /* ---- clavier : Echap ferme et rend le focus a « Nos produits », les fleches parcourent,
     le focus reste dans le panneau tant qu'il est ouvert ---- */
  function focusables(racine){
    return Array.prototype.slice.call(racine.querySelectorAll('a[href],button:not([disabled])'));
  }
  function panneauActif(){
    for (var i = 0; i < entreesPanneau().length; i++){
      var e = entreesPanneau()[i];
      if (e.dataset.open === 'true') return e;
    }
    return null;
  }
  function clavierPanneaux(ev){
    var entree = panneauActif();
    if (!entree) return;
    var p = panneauDe(entree);
    if (!p) return;
    var dedans = p.contains(document.activeElement);
    if (ev.key === 'Tab' && dedans){
      var l = focusables(p);
      if (!l.length) return;
      var premier = l[0], dernier = l[l.length - 1];
      if (ev.shiftKey && document.activeElement === premier){ ev.preventDefault(); dernier.focus(); }
      else if (!ev.shiftKey && document.activeElement === dernier){ ev.preventDefault(); premier.focus(); }
      return;
    }
    if (!dedans) return;
    var meres = document.activeElement.closest('.mg-mothers');
    var zoneCol = document.activeElement.closest('.mg-cols');
    var groupes = meres || zoneCol;
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp'){
      if (!groupes) return;
      var items = focusables(groupes);
      var i = items.indexOf(document.activeElement);
      if (i === -1) return;
      ev.preventDefault();
      items[ev.key === 'ArrowDown' ? Math.min(items.length - 1, i + 1) : Math.max(0, i - 1)].focus();
    } else if (ev.key === 'ArrowRight' && meres){
      ev.preventDefault();
      var cible = p.querySelector('.mg-cols a');
      if (cible) cible.focus();
    } else if (ev.key === 'ArrowLeft' && zoneCol){
      ev.preventDefault();
      var retour = p.querySelector('.mg-mothers a[data-actif="true"]');
      if (retour) retour.focus();
    }
  }

  /* ---- densite de la ligne : les items s'ajustent (14 px / ecart 24 px, puis 12 px / ecart 12 px)
     plutot que de passer a la ligne. Sous 1024 px, la ligne defile. ---- */
  function ajusterDensite(){
    ligne.classList.remove('hl-line--dense','hl-line--dense-2');
    if (!desktopMq.matches) return;
    if (ligne.scrollWidth <= ligne.clientWidth + 1) return;
    ligne.classList.add('hl-line--dense');
    if (ligne.scrollWidth > ligne.clientWidth + 1) ligne.classList.add('hl-line--dense-2');
    /* la densite change la largeur des items : le repere glissant se recale sur l'item courant */
    if (dernierLien) majGlisse(dernierLien);
  }

  /* ---- propositions de recherche : lues dans le meme arbre ---- */
  var suggest = document.getElementById('hl-suggest');
  var champRecherche = document.getElementById('search-desktop');
  var INDEX = (function(){
    var out = [];
    (function parcours(n, chemin){
      (n.e || []).forEach(function(c){
        out.push({n:c.n, u:c.u, chemin:chemin});
        parcours(c, chemin.concat([c.n]));
      });
    })(MENU_SOURCE, []);
    return out;
  })();
  function majSuggestions(q){
    q = (q || '').trim();
    var res = q
      ? INDEX.filter(function(x){ return sansAccent(x.n).indexOf(sansAccent(q)) !== -1; }).slice(0,6)
      : MENU_SOURCE.e.slice(0,6).map(function(b){ return {n:b.n, u:b.u, chemin:[]}; });
    suggest.textContent = '';
    if (!res.length){ suggest.dataset.open = 'false'; return; }
    suggest.appendChild(el('div','lbl', q ? 'Catégories correspondantes' : 'Catégories'));
    res.forEach(function(x){
      var a = lien(null, x.u, null);
      a.setAttribute('role','option');
      a.appendChild(document.createTextNode(x.n));
      if (x.chemin.length) a.appendChild(el('span','chemin', x.chemin.join(' › ')));
      suggest.appendChild(a);
    });
    suggest.dataset.open = 'true';
  }
  function fermerSuggestions(){ suggest.dataset.open = 'false'; }
  champRecherche.addEventListener('focus', function(){ majSuggestions(champRecherche.value); });
  champRecherche.addEventListener('input', function(){ majSuggestions(champRecherche.value); });
  document.addEventListener('click', function(e){
    if (!e.target.closest || !e.target.closest('.hl-search')) fermerSuggestions();
  });

  /* ---- menu « Mon compte » : ouverture au clic, fermeture au clic exterieur et par Echap ---- */
  var btnCompte = document.getElementById('btn-compte');
  var menuCompte = document.getElementById('compte-menu');
  function basculerCompte(ouvrir){
    menuCompte.dataset.open = ouvrir ? 'true' : 'false';
    btnCompte.setAttribute('aria-expanded', ouvrir ? 'true' : 'false');
  }
  btnCompte.addEventListener('click', function(){ basculerCompte(menuCompte.dataset.open !== 'true'); });
  document.addEventListener('click', function(e){ if (!e.target.closest || !e.target.closest('#entete-compte')) basculerCompte(false); });

  /* ---- Echap : referme le menu « Mon compte » et les propositions de recherche. Les panneaux de
     la ligne 2 (grand menu, bande de themes) sont geres plus bas, avec le retour du focus sur
     l'entree qui les a ouverts. ---- */
  document.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    basculerCompte(false);
    fermerSuggestions();
  });




  /* ---- ligne 1 : compacter au defilement (140 -> 56 px, embleme 108 -> 44 px ; la ligne 2 suit) ---- */
  var header = document.getElementById('site-header');
  var bar = document.getElementById('header-bar');
  var ticking = false;
  function onScroll(){
    if (!ticking){
      requestAnimationFrame(function(){
        var compact = window.scrollY > 24;
        if (compact !== bar.classList.contains('compact')){
          bar.classList.toggle('compact', compact);
          header.classList.toggle('compact', compact);
          appliquerReserve(compact);   /* la place occupee dans le flux ne bouge pas d'un pixel */
        }
        /* le panneau commence au BAS de l'en-tete : sa valeur suit la barre a chaque image utile */
        majHauteurEntete();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, {passive:true});

  /* ---- --hauteur-entete : le BAS de l'en-tete, en coordonnees de fenetre -----------------------
     Le panneau et le voile commencent la (top:var(--hauteur-entete), left/right/bottom a 0). On
     mesure getBoundingClientRect().bottom, pas la hauteur : en haut de page la note de livraison
     decale l'en-tete vers le bas, et au defilement l'en-tete se colle a 0. Le ResizeObserver suit
     la barre pendant son compactage (140 -> 56 px) sans dependre d'un delai en millisecondes.
     On ne recalcule la repartition des colonnes que lorsque la valeur change reellement. */
  var hauteurEntetePrec = -1;
  function majHauteurEntete(){
    var bas = header ? Math.max(0, Math.round(header.getBoundingClientRect().bottom)) : 0;
    if (bas === hauteurEntetePrec) return;
    hauteurEntetePrec = bas;
    document.documentElement.style.setProperty('--hauteur-entete', bas + 'px');
    majPanneaux();
  }
  var obsEntete = (typeof ResizeObserver === 'function') ? new ResizeObserver(function(){ majHauteurEntete(); }) : null;
  if (obsEntete) obsEntete.observe(header);

  /* ---- RESERVE DE HAUTEUR — la compaction ne provoque AUCUN saut de mise en page (correction n° 39)
     L'en-tete est en position:sticky : il occupe une place dans le flux du document. Compacter la
     barre la reduit de 198 a 102 px, ce qui ferait remonter tout le contenu de la page de 96 px des
     qu'on defile. On MESURE donc l'ecart entre les deux etats (transitions neutralisees le temps de
     la mesure) et on le rend en margin-bottom : la place occupee dans le flux reste constante, et
     comme la marge transitionne en 180 ms avec la meme courbe que les hauteurs, la somme reste
     constante a CHAQUE image — le contenu ne bouge jamais, meme pendant l'animation.
     La valeur n'est pas ecrite en dur : elle suit les paliers de l'en-tete (140 / 104 / auto px,
     embleme 108 / 80 / 48 px) sans recopier ici un seul point de rupture. */
  var reserveEntete = 0;
  function mesurerReserve(){
    if (!header) return;
    var etait = header.classList.contains('compact');
    /* transitions coupees le temps de la mesure : offsetHeight doit rendre la hauteur CIBLE et non
       la valeur intermediaire d'une animation en cours */
    var coupe = document.createElement('style');
    coupe.textContent = '#site-header,#site-header *{transition:none!important}';
    document.head.appendChild(coupe);
    header.classList.remove('compact');
    void header.offsetHeight;
    var hRepos = header.offsetHeight;
    header.classList.add('compact');
    void header.offsetHeight;
    var hCompacte = header.offsetHeight;
    if (!etait) header.classList.remove('compact');
    document.head.removeChild(coupe);
    void header.offsetHeight;
    reserveEntete = Math.max(0, hRepos - hCompacte);
    appliquerReserve(etait);
  }
  function appliquerReserve(compact){
    if (!header) return;
    header.style.marginBottom = (compact ? reserveEntete : 0) + 'px';
  }

  /* ---- champs du back-office : entete_* , menu_* , raccourci_* , theme_* et pro_* pilotent
     reellement la ligne 2, le grand menu, la bande de themes et l'accordeon ---- */
  function groupeSeg(sel, apres){
    var boutons = Array.prototype.slice.call(document.querySelectorAll(sel));
    boutons.forEach(function(b){
      b.addEventListener('click', function(){
        boutons.forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        apres(b);
      });
    });
  }
  var itemCompte = document.getElementById('entete-compte');
  var itemPanier = document.getElementById('entete-panier');
  var itemDevise = document.getElementById('entete-devise');
  groupeSeg('[data-entete-compte]', function(b){
    MENU.compteActif = b.dataset.enteteCompte === 'oui';      /* entete_compte_actif */
    itemCompte.hidden = !MENU.compteActif;
    ajusterDensite();
  });
  groupeSeg('[data-entete-panier]', function(b){
    MENU.panierActif = b.dataset.entetePanier === 'oui';      /* entete_panier_actif */
    itemPanier.hidden = !MENU.panierActif;
    ajusterDensite();
  });
  groupeSeg('[data-entete-devise]', function(b){
    MENU.deviseActive = b.dataset.enteteDevise === 'oui';     /* entete_devise_active */
    itemDevise.hidden = !MENU.deviseActive;
    ajusterDensite();
  });
  groupeSeg('[data-menu-profondeur]', function(b){
    MENU.profondeur = parseInt(b.dataset.menuProfondeur, 10); /* menu_profondeur */
    renderLigne();
    renderMobile();
  });
  groupeSeg('[data-menu-colonnes]', function(b){
    MENU.colonnes = b.dataset.menuColonnes === '3' ? 3 : 'auto';   /* menu_colonnes */
    renderLigne();
  });
  groupeSeg('[data-menu-ordre]', function(b){
    MENU.ordre = b.dataset.menuOrdre;                         /* menu_ordre */
    UNIVERS = univers();
    renderLigne();
    renderMobile();
  });
  groupeSeg('[data-menu-accueil]', function(b){
    MENU.accueilActif = b.dataset.menuAccueil === 'oui';      /* menu_accueil_actif */
    renderMobile();
  });
  groupeSeg('[data-menu-raccourcis]', function(b){
    MENU.raccourcisActifs = b.dataset.menuRaccourcis === 'oui';/* menu_raccourcis_actifs */
    renderLigne();
    renderMobile();
  });
  groupeSeg('[data-raccourci-nouveautes]', function(b){
    RACCOURCIS.nouveautes.actif = b.dataset.raccourciNouveautes === 'oui'; /* raccourci_nouveautes_actif */
    renderLigne();
    renderMobile();
  });
  groupeSeg('[data-raccourci-bonplan]', function(b){
    RACCOURCIS.bonplan.actif = b.dataset.raccourciBonplan === 'oui';       /* raccourci_bonplan_actif */
    renderLigne();
    renderMobile();
  });
  groupeSeg('[data-raccourci-moins5]', function(b){
    RACCOURCIS.moins5.actif = b.dataset.raccourciMoins5 === 'oui';         /* raccourci_moins5_actif */
    renderLigne();
    renderMobile();
  });
  /* Les neuf contrôles ci-dessous sont ceux du panneau de l'ACCUEIL : ils n'existent que là.
     Ils sont donc testés avant câblage. Sans ce test, le bloc levait une exception sur tout
     autre écran et s'arrêtait là : tout ce qui suit ne s'exécutait plus — la mesure de
     --hauteur-entete (et donc la réserve de l'en-tête qui se compacte), la fermeture des
     panneaux par le voile et par Échap, le menu mobile et le mini-panier. */
  var champBonplanSeuil = document.getElementById('champ-bonplan-seuil');
  if (champBonplanSeuil) champBonplanSeuil.addEventListener('input', function(){
    RACCOURCIS.bonplan.seuil = parseInt(champBonplanSeuil.value, 10) || 0; /* raccourci_bonplan_seuil */
    renderLigne();
  });
  var champMoins5Seuil = document.getElementById('champ-moins5-seuil');
  if (champMoins5Seuil) champMoins5Seuil.addEventListener('input', function(){
    RACCOURCIS.moins5.seuil = parseInt(champMoins5Seuil.value, 10) || 0;   /* raccourci_moins5_seuil */
    renderLigne();
  });
  groupeSeg('[data-theme-actif]', function(b){
    MENU.themeActif = b.dataset.themeActif === 'oui';         /* theme_actif */
    renderLigne();
    renderMobile();
  });
  groupeSeg('[data-theme-ordre]', function(b){
    MENU.themeOrdre = b.dataset.themeOrdre;                   /* theme_ordre */
    renderLigne();
    renderMobile();
  });
  groupeSeg('[data-menu-encart]', function(b){
    MENU.encartActif = b.dataset.menuEncart === 'oui';        /* menu_encart_actif */
    renderLigne();
  });
  var champEncartImage = document.getElementById('champ-encart-image');
  if (champEncartImage) champEncartImage.addEventListener('change', function(){
    MENU.encartIndex = parseInt(champEncartImage.value, 10) || 0;  /* menu_encart_image */
    renderLigne();
  });
  var champEncartTitre = document.getElementById('champ-encart-titre');
  if (champEncartTitre) champEncartTitre.addEventListener('input', function(){
    MENU.encartTitre = champEncartTitre.value;                /* menu_encart_titre */
    renderLigne();
  });
  var champEncartLien = document.getElementById('champ-encart-lien');
  if (champEncartLien) champEncartLien.addEventListener('input', function(){
    MENU.encartLien = champEncartLien.value;                  /* menu_encart_lien */
    renderLigne();
  });
  /* l'encart propose les six themes REELLEMENT mis en avant par la boutique : aucune illustration
     inventee, aucun visuel de substitution (menu_encart_image) */
  THEMES.slice(0, 6).forEach(function(t, i){
    var o = document.createElement('option');
    o.value = String(i); o.textContent = t.titre;
    if (champEncartImage) champEncartImage.appendChild(o);
  });
  groupeSeg('[data-pro-position]', function(b){
    MENU.proPosition = b.dataset.proPosition;                 /* pro_lien_position */
    majPositionPro();
    ajusterDensite();
  });
  var champPlaceholder = document.getElementById('champ-placeholder');
  if (champPlaceholder) champPlaceholder.addEventListener('input', function(){
    MENU.placeholder = champPlaceholder.value;                /* entete_recherche_placeholder */
    champRecherche.setAttribute('placeholder', champPlaceholder.value);
    var champMobile = document.getElementById('search-mobile');
    if (champMobile) champMobile.setAttribute('placeholder', champPlaceholder.value);
  });
  var champAccueilLibelle = document.getElementById('champ-accueil-libelle');
  if (champAccueilLibelle) champAccueilLibelle.addEventListener('input', function(){
    MENU.accueilLibelle = champAccueilLibelle.value;          /* menu_accueil_libelle */
    renderMobile();
  });
  var champProLibelle = document.getElementById('champ-pro-libelle');
  if (champProLibelle) champProLibelle.addEventListener('input', function(){
    MENU.proLibelle = champProLibelle.value;                  /* pro_lien_libelle */
    proLien.textContent = champProLibelle.value;
    ajusterDensite();
  });
  var champProUrl = document.getElementById('champ-pro-url');
  if (champProUrl) champProUrl.addEventListener('input', function(){
    MENU.proUrl = champProUrl.value || '#';                   /* pro_lien_url */
    proLien.href = MENU.proUrl;
  });
  function majPositionPro(){
    proLien.classList.toggle('hl-pro--gauche', MENU.proPosition === 'gauche'); /* pro_lien_position */
  }

  /* ---- accordeon plein ecran (< 1024 px) : le meme contenu que le grand menu, empile ----
     Recherche en tete, bouton retour, chaque niveau se depliant. Tout vient du meme arbre. */
  var menuMobile = document.getElementById('menu-tree');
  function creeLienMobile(cls, url, txt){
    var li = el('li');
    var a = lien(cls, url, txt);
    li.appendChild(a);
    return li;
  }
  function renderMobile(){
    menuMobile.textContent = '';
    if (MENU.accueilActif){                                     /* menu_accueil_actif / _libelle */
      menuMobile.appendChild(creeLienMobile('mm-lien', '/', MENU.accueilLibelle));
    }
    /* « Nos produits » : les univers empiles, chacun precede de son point de 6 px, chaque niveau
       se depliant. Aucun compteur n'est affiche ici non plus. */
    var liCat = el('li');
    var dCat = el('details');
    dCat.open = true;
    dCat.appendChild(el('summary', null, 'Nos produits'));
    var ulCat = el('ul','mm-liste');
    UNIVERS.forEach(function(br, i){
      var li = el('li');
      var d = el('details');
      var sm = el('summary');
      var puce = el('span','mg-puce');
      puce.style.background = couleurUnivers(br.n, i);
      sm.appendChild(puce);
      sm.appendChild(el('span','mm-lib', br.n));
      d.appendChild(sm);
      var ul = el('ul','mm-kids');
      ul.appendChild(creeLienMobile('mm-tout mm-vue', br.u, 'Tout voir dans ' + br.n));
      if (MENU.profondeur >= 3){
        (br.node.e || []).forEach(function(g){
          var li2 = el('li');
          var d2 = el('details');
          d2.className = 'mm-sous';
          d2.appendChild(el('summary', null, g.n));
          var ul2 = el('ul','mm-kids');
          ul2.appendChild(creeLienMobile('mm-tout mm-vue', g.u, 'Tout voir dans ' + g.n));
          (g.e || []).forEach(function(s){
            if (MENU.profondeur >= 3 && s.e && s.e.length){
              var li3 = el('li');
              var d3 = el('details');
              d3.className = 'mm-sous';
              d3.appendChild(el('summary', null, s.n));
              var ul3 = el('ul','mm-kids');
              ul3.appendChild(creeLienMobile('mm-tout mm-vue', s.u, 'Tout voir dans ' + s.n));
              s.e.forEach(function(f){ ul3.appendChild(creeLienMobile(null, f.u, f.n)); });
              d3.appendChild(ul3);
              li3.appendChild(d3);
              ul2.appendChild(li3);
            } else {
              ul2.appendChild(creeLienMobile(null, s.u, s.n));
            }
          });
          d2.appendChild(ul2);
          li2.appendChild(d2);
          ul.appendChild(li2);
        });
      } else {
        (br.node.e || []).forEach(function(g){
          ul.appendChild(creeLienMobile(null, g.u, g.n));
        });
      }
      d.appendChild(ul);
      li.appendChild(d);
      ulCat.appendChild(li);
    });
    dCat.appendChild(ulCat);
    liCat.appendChild(dCat);
    menuMobile.appendChild(liCat);
    /* les quatre raccourcis, puis la bande de themes */
    ['nouveautes','bonplan','theme','moins5'].forEach(function(cle){
      var r = RACCOURCIS[cle];
      if (!MENU.raccourcisActifs || !r.actif || r.total < r.seuil) return;
      if (cle === 'theme'){
        if (!MENU.themeActif) return;
        var lit = el('li');
        var dt = el('details');
        var st = el('summary');
        st.appendChild(el('span','mm-lib', r.libelle));
        dt.appendChild(st);
        var div = el('div', null, null);
        div.appendChild(bandeThemes());
        dt.appendChild(div);
        lit.appendChild(dt);
        menuMobile.appendChild(lit);
        return;
      }
      var liR = creeLienMobile('mm-lien', r.url, r.libelle);
      /* « Bon plan » : le meme point de 6 px qui pulse, ici dans l'accordeon */
      if (cle === 'bonplan'){
        var aR = liR.querySelector('a');
        aR.insertBefore(el('span','bp-puce'), aR.firstChild);
      }
      menuMobile.appendChild(liR);
    });
    menuMobile.appendChild(creeLienMobile('mm-lien', MENU.proUrl, MENU.proLibelle));
  }

  /* ---- etat initial ---- */
  itemCompte.hidden = !MENU.compteActif;
  itemPanier.hidden = !MENU.panierActif;
  itemDevise.hidden = !MENU.deviseActive;
  if (survolSouris.matches) cats.classList.add('js-survol');   /* le survol n'ouvre que la ou il y a une souris */
  proLien.textContent = MENU.proLibelle;
  proLien.href = MENU.proUrl;
  majPositionPro();
  champRecherche.setAttribute('placeholder', MENU.placeholder);
  renderLigne();
  renderMobile();
  mesurerReserve();
  var densiteTimer;
  window.addEventListener('resize', function(){
    clearTimeout(densiteTimer);
    densiteTimer = setTimeout(function(){
      ajusterDensite();
      mesurerReserve();   /* les paliers changent la reserve : on la remesure, jamais de valeur figee */
      /* la hauteur de l'en-tete peut changer au passage d'un palier : on force la mesure */
      hauteurEntetePrec = -1;
      majHauteurEntete();
      /* sous 1024 px les panneaux cedent la place a l'accordeon : on les ferme pour ne
         pas laisser un voile allume derriere un panneau masque */
      if (!desktopMq.matches) fermerTousPanneaux();
      majPanneaux();
    }, 120);
  });
  window.addEventListener('load', function(){ ajusterDensite(); mesurerReserve(); majHauteurEntete(); majPanneaux(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ ajusterDensite(); mesurerReserve(); majHauteurEntete(); majPanneaux(); });

  /* ---- fermeture : clic exterieur, clic sur le voile, Echap. Echap rend le focus a l'entree
     qui a ouvert le panneau (jamais de focus perdu). ---- */
  document.addEventListener('click', function(ev){
    /* un clic dans une entree ou DANS un panneau ne ferme rien : le panneau n'est plus un
       descendant de l'entree, il faut donc le tester explicitement */
    var t = ev.target;
    if (t.closest && (t.closest('.hl-entry') || t.closest('.hl-panel'))) return;
    fermerTousPanneaux();
  });
  /* fermeture au survol : sortir de la fenetre referme un panneau ouvert au survol — un panneau
     ouvert au CLIC reste verrouille, il ne se ferme que par Echap ou par le bouton « Fermer » */
  document.addEventListener('mouseout', function(ev){
    if (ev.relatedTarget) return;
    var e = panneauActif();
    if (e && e.dataset.locked !== 'true') fermerEntree(e);
  });
  voile.addEventListener('click', function(){
    var e = panneauActif();
    var btn = declencheur(e);
    fermerTousPanneaux();
    rendreFocus(btn);
  });
  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape'){
      var e = panneauActif();
      if (!e) return;
      /* le focus revient sur le declencheur : « Nos produits » ou « Thèmes » */
      var btn = declencheur(e);
      fermerTousPanneaux();
      rendreFocus(btn);
      return;
    }
    if (ev.key === 'Tab' || ev.key.indexOf('Arrow') === 0) clavierPanneaux(ev);
  });



  /* ---- recherche mobile plein ecran ---- */
  var overlay = document.getElementById('search-overlay');
  var btnSearchTop = document.getElementById('btn-search');   /* absent depuis l'etape 5 : la ligne 1 porte le champ de recherche */
  function openSearch(){ overlay.hidden = false; if (btnSearchTop) btnSearchTop.setAttribute('aria-expanded','true'); overlay.querySelector('input').focus(); }
  function closeSearch(){ overlay.hidden = true; if (btnSearchTop) btnSearchTop.setAttribute('aria-expanded','false'); }
  if (btnSearchTop) btnSearchTop.addEventListener('click', openSearch);
  var btnSearch2 = document.getElementById('btn-search-2'); if (btnSearch2) btnSearch2.addEventListener('click', function(e){ e.preventDefault(); openSearch(); });
  document.getElementById('btn-search-close').addEventListener('click', closeSearch);

  /* ---- menu plein ecran mobile : ouverture, fermeture, balayage, bouton systeme ---- */
  var menu = document.getElementById('mobile-menu');
  function openMenu(){
    menu.hidden = false; requestAnimationFrame(function(){ menu.dataset.open = 'true'; });
    document.getElementById('btn-menu').setAttribute('aria-expanded','true');
    history.pushState({repMenu:true}, '');
  }
  function closeMenu(fromPop){
    menu.dataset.open = 'false';
    document.getElementById('btn-menu').setAttribute('aria-expanded','false');
    setTimeout(function(){ menu.hidden = true; }, 320);
    if (!fromPop && history.state && history.state.repMenu) history.back();
  }
  var btnMenuS = document.getElementById('btn-menu'); if (btnMenuS) btnMenuS.addEventListener('click', openMenu);
  var btnMenu2 = document.getElementById('btn-menu-2'); if (btnMenu2) btnMenu2.addEventListener('click', function(e){ e.preventDefault(); openMenu(); });
  document.getElementById('btn-menu-close').addEventListener('click', function(){ closeMenu(false); });
  window.addEventListener('popstate', function(){ if (menu.dataset.open === 'true') closeMenu(true); });
  var touchX = null;
  menu.addEventListener('touchstart', function(e){ touchX = e.touches[0].clientX; }, {passive:true});
  menu.addEventListener('touchend', function(e){
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (dx > 70) closeMenu(false);
    touchX = null;
  }, {passive:true});
/* ============================================================================
   5. MINI-PANIER ET REBOND DU COMPTEUR — ouverture au survol et au focus (le clic
      mène au panier), rebond du compteur au chargement puis à l'ajout réel.
      Blocs validés de l'accueil, inchangés.
   ============================================================================ */

/* la détection de mouvement réduit du bloc — les pages gardent la leur, indépendante */
var reduceMotionMq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
function mouvReduit(){ return !!(reduceMotionMq && reduceMotionMq.matches); }
  /* ---- mini-panier : ouverture au survol/focus (clic/appui va au panier) ---- */
  var panierWrap = document.querySelector('.panier-wrap');
  var panierLink = document.getElementById('panier-icon-header');
  var miniPanier = document.getElementById('mini-panier');
  var miniTimer;
  function openMiniPanier(){
    clearTimeout(miniTimer);
    miniPanier.dataset.open = 'true';
    panierLink.setAttribute('aria-expanded', 'true');
  }
  function closeMiniPanier(){
    miniPanier.dataset.open = 'false';
    panierLink.setAttribute('aria-expanded', 'false');
  }
  if (panierWrap){
    panierWrap.addEventListener('mouseenter', function(){ clearTimeout(miniTimer); miniTimer = setTimeout(openMiniPanier, 90); });
    panierWrap.addEventListener('mouseleave', function(){ clearTimeout(miniTimer); miniTimer = setTimeout(closeMiniPanier, 180); });
    panierLink.addEventListener('focus', openMiniPanier);
    panierWrap.addEventListener('focusout', function(e){
      if (!panierWrap.contains(e.relatedTarget)) closeMiniPanier();
    });
  }
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && miniPanier) closeMiniPanier(); });
  /* ---- rebond panier : demonstration au chargement puis toutes les 6 s (vrai declencheur = ajout reel au panier) ---- */
  var rebondBadges = ['panier-icon-header', 'panier-icon-bottombar'].map(function(id){
    var link = document.getElementById(id);
    return link ? link.querySelector('.cart-count') : null;
  }).filter(Boolean);
  function jouerRebondDemo(){
    if (mouvReduit()) return;
    rebondBadges.forEach(function(badge){
      badge.classList.remove('rebond');
      void badge.offsetWidth;
      badge.classList.add('rebond');
    });
  }
  jouerRebondDemo();
  setInterval(jouerRebondDemo, 6000);
  ['panier-icon-header', 'panier-icon-bottombar'].forEach(function(id){
    var link = document.getElementById(id);
    if (!link) return;
    link.addEventListener('mouseenter', jouerRebondDemo);
    link.addEventListener('focus', jouerRebondDemo);
  });

/* ============================================================================
   6. CHAMPS AJOUTÉS — l'ordre des catégories et les images du menu.
      menu_ordre_source       : l'ordre suit la position enregistrée en back-office
                                (Catalogue > Catégories) — propriété « p » de chaque
                                entrée de l'arbre (menu_source). Rien à inventer :
                                changer la position dans le back-office change le menu.
      menu_ordre_personnalise : VIDE par défaut. Non vide = liste de noms séparés par
                                des virgules, qui déroge à l'ordre du back-office.
      categorie_image_menu    : une image par catégorie, pour le menu. Elle s'affiche
                                dans l'encart quand la catégorie est survolée ou ouverte,
                                et accompagne la sous-catégorie dans sa colonne.
                                Absente → aplat de la palette et nom : pas de trou.
      menu_encart_source      : « categorie » (défaut) = l'encart suit la catégorie
                                survolée ; « theme » = le thème mis en avant.
   ============================================================================ */
var IMAGES_CATEGORIE = {"/463-maison":{"n":"Maison","d":"image/jpeg","w":1003,"h":200,"src":"data:image/jpeg;base64,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"},"/464-fetes-et-evenements":{"n":"Fêtes et Événements","d":"image/jpeg","w":1003,"h":200,"src":"data:image/jpeg;base64,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"},"/468-loisirs":{"n":"Loisirs","d":"image/jpeg","w":1003,"h":200,"src":"data:image/jpeg;base64,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"},"/921-la-boutique-du-beauf":{"n":"La boutique du beauf","d":"image/webp","w":120,"h":120,"src":"data:image/webp;base64,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"},"/828-decoration-d-ete":{"n":"Décoration d'été","d":"image/webp","w":120,"h":120,"src":"data:image/webp;base64,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"},"/878-deco-doree":{"n":"Déco dorée","d":"image/webp","w":120,"h":120,"src":"data:image/webp;base64,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"},"/620-aperitifs-et-boissons":{"n":"Apéro / Cocktails","d":"image/webp","w":120,"h":120,"src":"data:image/webp;base64,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"},"/762-mugs":{"n":"Mugs","d":"image/webp","w":120,"h":120,"src":"data:image/webp;base64,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"},"/535-ballons-et-accessoires":{"n":"Ballons","d":"image/webp","w":120,"h":120,"src":"data:image/webp;base64,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"}};

function imageCategorie(url){ return url ? (IMAGES_CATEGORIE[url] || null) : null; }

MENU.ordreSource = OPTIONS_PARTAGE.menu_ordre_source || 'back-office';
MENU.encartSource = OPTIONS_PARTAGE.menu_encart_source || 'categorie';

/* -- menu_ordre_personnalise : la dérogation, inactive tant qu'elle est vide -- */
var ordrePerso = String(OPTIONS_PARTAGE.menu_ordre_personnalise || '').trim();
function appliquerOrdrePersonnalise(liste){
  var rang = {};
  liste.split(',').map(function(s){ return s.trim(); }).filter(Boolean)
       .forEach(function(n, i){ rang[sansAccent(n)] = i; });
  var suite = 1000;
  (function marcher(noeud){
    (noeud.e || []).forEach(function(c){
      var r = rang[sansAccent(c.n)];
      c.p = (r === undefined) ? (suite++) : r;
      marcher(c);
    });
    if (noeud.e) noeud.e.sort(function(a, b){ return (a.p || 0) - (b.p || 0); });
  })(MENU_SOURCE);
  MENU.ordre = 'back-office';
  if (typeof UNIVERS !== 'undefined' && UNIVERS.sort) UNIVERS.sort(function(a, b){ return (a.p || 0) - (b.p || 0); });
  renderLigne(); renderMobile();
}
if (ordrePerso) appliquerOrdrePersonnalise(ordrePerso);

/* -- categorie_image_menu dans l'encart : il suit la catégorie survolée ou ouverte -- */
var brancheCourante = 0;
function majEncart(i){
  if (typeof i === 'number') brancheCourante = i;
  var encart = document.querySelector('.mg-encart');
  if (!encart) return;
  var titre = encart.querySelector('.mg-encart-titre');
  var img = encart.querySelector('.mg-encart-img');
  var aplat = encart.querySelector('.mg-encart-aplat');
  var univers = (typeof UNIVERS !== 'undefined' ? UNIVERS[brancheCourante] : null);
  var cible = (MENU.encartSource === 'categorie' && univers) ? univers : null;
  if (MENU.encartSource === 'theme'){
    var t = THEMES[MENU.encartIndex] || THEMES[0];
    cible = t ? { u: MENU.encartLien || t.lien, n: MENU.encartTitre || t.titre, image: t.image, w: 120, h: 120 } : null;
  }
  var im = cible ? (cible.image ? { src: cible.image, n: cible.n, w: cible.w, h: cible.h } : imageCategorie(cible.u)) : null;
  if (!im){
    /* pas d'image pour cette catégorie : aplat de la palette et nom, sans trou.
       (le CSS pose display:block sur .mg-encart-img : l'attribut hidden ne suffirait pas) */
    if (img) img.style.display = 'none';
    if (!aplat && cible){
      aplat = el('span','mg-encart-aplat');
      var puce = el('span','mg-puce');
      puce.style.background = couleurUnivers(cible.n, brancheCourante);
      aplat.appendChild(puce);
      aplat.appendChild(el('span','mg-encart-aplat-nom', cible.n));
      encart.insertBefore(aplat, titre || null);
    }
    if (cible) encart.setAttribute('aria-label', 'Encart : ' + cible.n);
    return;
  }
  if (aplat && aplat.parentNode) aplat.parentNode.removeChild(aplat);
  if (!img){
    img = document.createElement('img');
    encart.insertBefore(img, titre || null);
  }
  img.style.display = '';
  img.className = 'mg-encart-img' + (Math.abs(im.w / im.h - 1) > 0.25 ? ' mg-encart-img--naturel' : '');
  img.src = im.src;
  img.alt = im.n;
  img.setAttribute('width', im.w); img.setAttribute('height', im.h);
  img.setAttribute('loading','lazy'); img.setAttribute('decoding','async');
  if (titre) titre.textContent = im.n;
  if (cible && cible.u) encart.href = cible.u;
}

/* -- categorie_image_menu dans la colonne : la vignette du groupe déjà rendu -- */
function poserVignettes(){
  var titres = document.querySelectorAll('.mg-groupe-titre');
  Array.prototype.forEach.call(titres, function(a){
    var g = a.parentNode;
    if (!g || g.querySelector('.mg-vignette')) return;
    var im = imageCategorie(a.getAttribute('href'));
    if (!im) return;                        /* pas d'image : le groupe s'arrête à son titre */
    var v = document.createElement('img');
    v.className = 'mg-vignette';
    v.src = im.src; v.alt = '';
    v.setAttribute('width', im.w); v.setAttribute('height', im.h);
    v.setAttribute('loading','lazy'); v.setAttribute('decoding','async');
    g.insertBefore(v, a);
  });
}
majEncart(0);

/* -- les deux contrôles ajoutés au panneau des champs (absents ailleurs : testés) -- */
groupeSeg('[data-encart-source]', function(b){
  MENU.encartSource = b.getAttribute('data-encart-source');       /* menu_encart_source */
  majEncart(brancheCourante);
});
var champOrdrePerso = document.getElementById('champ-ordre-perso');
var btnOrdrePerso = document.getElementById('btn-ordre-perso');
if (champOrdrePerso) champOrdrePerso.value = ordrePerso;
if (btnOrdrePerso) btnOrdrePerso.addEventListener('click', function(){
  var v = champOrdrePerso ? champOrdrePerso.value : '';
  btnOrdrePerso.setAttribute('aria-pressed', v.trim() ? 'true' : 'false');
  if (v.trim()) appliquerOrdrePersonnalise(v);
});

})();
