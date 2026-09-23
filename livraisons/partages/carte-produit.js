/*! ===========================================================================
 * the-replicant.com — CARTE PRODUIT · SOURCE UNIQUE
 * ---------------------------------------------------------------------------
 * La carte produit du site (« visuel carré, nom, prix avec sa mention HT ou
 * TTC, deux badges au plus, compte à rebours quand la promotion a une date de
 * fin réelle ») vit ici et nulle part ailleurs : styles, constructeur, badges,
 * prix et compte à rebours. Aucune copie dans les pages — une correction faite
 * ici s'applique à toutes les pages.
 *
 * INCLUSION — dans chaque gabarit, à la suite du bloc d'en-tête, juste AVANT le
 * script de la page :
 *
 *     <script src="partages/carte-produit.js"></script>
 *
 * Le bloc injecte sa feuille de style dans <head> (id « carte-partage-css ») et
 * ne pose aucun balisage : il équipe les cartes déjà écrites dans la page
 * (premier lot, lisible sans JavaScript) comme celles qu'un script ajoute
 * ensuite. Les deux reçoivent exactement le même traitement.
 *
 * DANS LE THÈME PRESTASHOP — ce fichier correspond au gabarit
 * templates/_partials/carte-produit.tpl (le balisage rendu par le module
 * compagnon depuis ps_product / ps_specific_price) et à assets/js/carte-produit.js
 * (le comportement ci-dessous, inchangé). Une seule source pour toutes les pages.
 *
 * CHAMPS DU BACK-OFFICE (surchargeables via window.CARTE_PRODUIT_OPTIONS avant
 * l'inclusion, ou à tout moment par CARTE_PRODUIT.regler({ … })) :
 *   carte_badges_max (2) · carte_nouveaute_active · carte_promo_active ·
 *   promo_date_fin (date et heure ; le module y met ps_specific_price.date_to —
 *   ou la date de fin de la règle panier — et RIEN s'il n'y a pas de date
 *   réelle) · carte_remise_valeur (« 20 % » ou « 3 € » : la valeur appliquée
 *   par la boutique) · carte_prix_regime (ttc | ami | pro20) · tva (1,20) ·
 *   remise_groupe (0,80)
 *
 * RÈGLE : aucun compte à rebours sans date de fin réelle. À l'échéance, le
 * compte à rebours s'arrête, le badge de remise disparaît et le prix remisé
 * s'efface en même temps : la carte redevient une carte ordinaire.
 * =========================================================================== */
(function () {
'use strict';

/* ============================================================================
   1. LES STYLES — les règles de la carte, reprises au caractère près des deux
      pages qui les portaient séparément (elles y étaient identiques : c'est ce
      qui avait laissé diverger le comportement). Tout passe par les jetons du
      système de design : aucune couleur ni police n'est définie ici.
   ============================================================================ */
var CSS_PARTAGE = /*<<<CSS*/`
.carte-produit{background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-md);overflow:hidden;transition:box-shadow var(--d-standard) ease,border-color var(--d-standard) ease}
.carte-produit:hover,.carte-produit:focus-within{border-color:var(--c-ink);box-shadow:var(--el-2)}
.carte-produit .visuel{position:relative;aspect-ratio:1/1;background:var(--surface-100);border-bottom:1px solid var(--border)}
.carte-produit .visuel.loaded{background:repeating-linear-gradient(135deg,var(--surface-100) 0 14px,var(--surface-150) 14px 28px)}
.carte-produit .visuel img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:var(--c-surface)}
.carte-produit .badges{position:absolute;top:var(--e2);left:var(--e2);display:flex;flex-direction:column;gap:var(--e2);z-index:1}
.badge{display:inline-flex;align-items:center;gap:var(--sp-1);padding:var(--sp-1) var(--sp-3);border-radius:var(--r-pill);border:1px solid transparent;font:var(--fw-semi) var(--fs-xs)/1.6 var(--font-body);width:fit-content;white-space:nowrap}
.badge--new{background:var(--c-info-dark);border-color:var(--c-info-dark);color:var(--c-surface)}
.badge--promo{background:var(--c-promo);border-color:var(--c-promo);color:var(--c-ink)}
.badge--theme{background:var(--c-sunken);border-color:var(--c-border);color:var(--c-ink-2)}
.badge--mode{background:var(--c-sunken);border-color:var(--c-mention);color:var(--c-ink)}
.carte-produit .zp{position:absolute;bottom:var(--e2);right:var(--e2);left:auto;top:auto;z-index:1}
.carte-produit .info{padding:var(--e3)}
.carte-produit .nom{font:var(--fw-semi) var(--fs-sm)/1.35 var(--font-display);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.6em}
.carte-produit .prix{font:var(--fw-bold) var(--fs-h3)/1.2 var(--font-display);font-variant-numeric:tabular-nums;margin-top:var(--sp-2);display:flex;align-items:baseline;gap:var(--sp-2);flex-wrap:wrap;min-height:2.4em}
.carte-produit .prix .barre{font:var(--fw-regular) var(--fs-sm) var(--font-body);color:var(--c-mention);text-decoration:line-through}
.carte-produit .prix .barre.promo-couleur{color:var(--c-promo-text)}
.carte-produit .prix .actuel.promo-couleur{color:var(--c-promo-text)}
.carte-produit .prix .mention{display:inline-flex;align-items:center;min-height:24px;padding:0 var(--sp-2);border:1px solid var(--c-mention);border-radius:var(--r-pill);background:var(--c-sunken);font:var(--fw-semi) var(--fs-xs)/1.6 var(--font-body);color:var(--c-ink);text-transform:uppercase;letter-spacing:.04em}
.carte-produit .compte-rebours-carte{font:var(--fw-semi) var(--fs-xs)/1.4 var(--font-body);font-variant-numeric:tabular-nums;color:var(--c-promo-text);margin-top:var(--sp-1)}
.carte-produit .compte-rebours-carte b{font-weight:var(--fw-bold)}
/* la date exacte de fin reste lisible des lecteurs d'écran sans être répétée à
   chaque seconde : le décompte qui défile est décoratif, la phrase est
   l'information. */
.carte-produit .cpt-lecteur{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
/* la ligne de disponibilité est toujours présente : sa hauteur est réservée
   pour que toutes les cartes d’une rangée aient exactement la même hauteur
   (aucun décalage quand les squelettes sont remplacés par les cartes). */
.carte-produit .dispo{margin:var(--sp-2) 0 0;min-height:1.4em;font:var(--fw-semi) var(--fs-xs)/1.4 var(--font-body)}
.carte-produit .dispo--derniers{color:var(--c-promo-text)}
.carte-produit .dispo--indispo{color:var(--c-error)}
.carte-produit.est-indispo .visuel img{opacity:.4}
.carte-produit.est-indispo .nom{color:var(--c-ink-2)}
.carte-lien{display:block;flex:1;color:inherit;text-decoration:none}
`/*CSS>>>*/;

var NBSP = '\u00A0';

/* ============================================================================
   2. LES RÉGLAGES — les champs du module. Aucune valeur métier n'est écrite
      dans le balisage : elle vient d'ici, et une page peut la régler.
   ============================================================================ */
var OPTIONS = {
  carte_badges_max: 2,          /* au plus DEUX badges par carte */
  carte_nouveaute_active: true, /* « Nouveau » : produits réellement les plus récents */
  carte_promo_active: true,
  carte_remise_valeur: '',      /* « 20 % » ou « 3 € » ; vide = déduite des prix réels */
  carte_prix_regime: 'ttc',     /* ttc | ami | pro20 */
  tva: 1.20,                    /* lue dans le code produit de la boutique : « rate »:20 */
  remise_groupe: 0.80,          /* ps_group.reduction : 0,20 */
  image: null,                  /* (p) → source du visuel, quand la page la tient */
  maintenant: null              /* horloge injectable, pour les contrôles */
};
(function reglerInitial(){
  var page = window.CARTE_PRODUIT_OPTIONS;
  if (page) for (var k in page) if (Object.prototype.hasOwnProperty.call(page, k)) OPTIONS[k] = page[k];
})();
function regler(patch){
  if (patch) for (var k in patch) if (Object.prototype.hasOwnProperty.call(patch, k)) OPTIONS[k] = patch[k];
  rendrePrix(document);
  return OPTIONS;
}
function horloge(){ return typeof OPTIONS.maintenant === 'function' ? OPTIONS.maintenant() : Date.now(); }

/* ============================================================================
   3. LES PRIX — HT ou TTC selon le groupe du client, et TOUJOURS avec la
      mention explicite à côté du montant. Le facteur s'applique au prix HT
      porté par la carte (data-prix-ht).
   ============================================================================ */
var REGIMES = {
  ttc:   function(){ return { f: OPTIONS.tva,                          m: 'TTC' }; },
  ami:   function(){ return { f: OPTIONS.tva * OPTIONS.remise_groupe,  m: 'TTC \u00B7 Ami(e) \u221220\u00A0%' }; },
  pro20: function(){ return { f: OPTIONS.remise_groupe,                m: 'HT \u00B7 Pro \u221220\u00A0%' }; }
};
function regimeEnCours(){ return REGIMES[OPTIONS.carte_prix_regime] ? OPTIONS.carte_prix_regime : 'ttc'; }
function euro(n){
  var v = Math.round(n * 100) / 100;
  return v.toFixed(2).replace('.', ',') + NBSP + '\u20AC';
}

/* ============================================================================
   4. LES BADGES — au plus deux : « Nouveau » sur les produits réellement les
      plus récents, et le badge de remise avec la VALEUR RÉELLE. La valeur est
      celle que la boutique applique (« 20 % » ou « 3 € ») ; à défaut elle est
      calculée sur les prix réels de la carte, jamais inventée.
   ============================================================================ */
function valeurRemise(vue){
  var v = vue.get('data-remise');
  if (v) return v;
  var ht = parseFloat(vue.get('data-prix-ht'));
  var hp = parseFloat(vue.get('data-prix-ht-promo'));
  if (!(hp > 0) || !(ht > 0) || hp >= ht) return '';
  return Math.round((1 - hp / ht) * 100) + NBSP + '%';
}
function badgesVue(vue){
  var b = [];
  if (OPTIONS.carte_nouveaute_active && vue.get('data-nouveau') === 'true'){
    b.push('<span class="badge badge--new">Nouveau</span>');
  }
  if (OPTIONS.carte_promo_active && vue.get('data-prix-ht-promo')){
    var v = valeurRemise(vue);
    if (v) b.push('<span class="badge badge--promo">\u2212' + v + '</span>');
  }
  var max = parseInt(OPTIONS.carte_badges_max, 10);
  if (!(max >= 0)) max = 2;
  return b.slice(0, max).join('');
}
function vueDe(carte){ return { get: function(n){ return carte.getAttribute(n); } }; }
function badgesDe(carte){ return badgesVue(vueDe(carte)); }

/* ============================================================================
   5. LE COMPTE À REBOURS — uniquement quand la promotion a une date de fin
      réelle (data-promo-fin). Trois précisions :
        plus de 24 h  →  « 2 j 4 h »
        moins de 24 h →  « 4 h 12 min »
        moins d'1 h   →  « 12 min 30 s »
      Aucune animation : c'est une information, pas une décoration.
   ============================================================================ */
function duree(ms){
  if (!(ms > 0)) return '';
  var s = Math.floor(ms / 1000);
  var j = Math.floor(s / 86400);
  var h = Math.floor((s % 86400) / 3600);
  var m = Math.floor((s % 3600) / 60);
  var sec = s % 60;
  if (j > 0) return j + NBSP + 'j ' + h + NBSP + 'h';
  if (h > 0) return h + NBSP + 'h ' + m + NBSP + 'min';
  if (m > 0) return m + NBSP + 'min ' + sec + NBSP + 's';
  return sec + NBSP + 's';
}
function dateLongue(iso){
  var d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  try {
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return ''; }
}
/* le nœud du compte à rebours vit dans .info, juste après le prix : la carte
   garde toujours le même ordre, visuel, nom, prix, compte à rebours, dispo. */
function elementCompte(carte){
  var info = carte.querySelector('.info');
  if (!info) return null;
  var el = carte.querySelector('[data-compte-rebours-carte]');
  if (!el){
    el = document.createElement('div');
    el.className = 'compte-rebours-carte';
    el.setAttribute('data-compte-rebours-carte', '');
    el.setAttribute('role', 'timer');
    el.setAttribute('aria-live', 'off');
    var prix = carte.querySelector('.prix');
    var dispo = carte.querySelector('.dispo');
    if (prix && prix.parentNode === info) info.insertBefore(el, prix.nextSibling);
    else if (dispo && dispo.parentNode === info) info.insertBefore(el, dispo);
    else info.appendChild(el);
  }
  /* un balisage écrit à la main est normalisé : l'information est la date de fin
     (phrase lue), le décompte qui défile ne s'annonce pas à chaque seconde. */
  el.setAttribute('role', 'timer');
  el.setAttribute('aria-live', 'off');
  return el;
}
function majCompte(carte){
  var fin = carte.getAttribute('data-promo-fin');
  if (!fin) return;
  var ms = new Date(fin).getTime() - horloge();
  if (!(ms > 0)){ finirPromo(carte); return; }
  var el = elementCompte(carte);
  if (!el) return;
  var jauge = el.querySelector('.cpt-jauge');
  if (!jauge){
    el.textContent = '';                       /* efface le tiret du balisage d'origine */
    jauge = document.createElement('b');
    jauge.className = 'cpt-jauge';
    el.appendChild(jauge);
    var lecteur = document.createElement('span');
    lecteur.className = 'cpt-lecteur';
    lecteur.setAttribute('data-date-fin', fin);
    lecteur.textContent = 'Promotion jusqu\u2019au ' + dateLongue(fin) + '.';
    el.appendChild(lecteur);
  }
  var texte = 'Fin dans ' + duree(ms);
  if (jauge.textContent !== texte) jauge.textContent = texte;   /* on n'écrit que si ça change */
}
/* l'échéance : le compte à rebours s'arrête, le badge de remise et le prix
   remisé disparaissent en même temps. La carte redevient une carte ordinaire. */
function finirPromo(carte){
  var el = carte.querySelector('[data-compte-rebours-carte]');
  if (el && el.parentNode) el.parentNode.removeChild(el);
  var badge = carte.querySelector('.badge--promo');
  if (badge && badge.parentNode) badge.parentNode.removeChild(badge);
  var badges = carte.querySelector('.badges');
  if (badges && badges.children.length === 0 && badges.parentNode) badges.parentNode.removeChild(badges);
  carte.removeAttribute('data-promo-fin');
  carte.removeAttribute('data-prix-ht-promo');
  rendrePrixCarte(carte);
}

/* ============================================================================
   6. LE RENDU — badges et prix d'une carte, depuis ses attributs de données.
      C'est le seul chemin : une carte écrite en dur et une carte produite par
      un script reçoivent exactement le même traitement.
   ============================================================================ */
function rendreBadges(carte){
  var visuel = carte.querySelector('.visuel');
  if (!visuel) return;
  var html = badgesDe(carte);
  var badges = carte.querySelector('.badges');
  if (!html){
    if (badges && badges.parentNode) badges.parentNode.removeChild(badges);
    return;
  }
  if (badges) badges.innerHTML = html;
  else visuel.insertAdjacentHTML('afterbegin', '<span class="badges">' + html + '</span>');
}
function rendrePrixCarte(carte){
  var el = carte.querySelector('.prix');
  if (!el) return;
  var r = REGIMES[regimeEnCours()]();
  var ht = parseFloat(carte.getAttribute('data-prix-ht'));
  var hp = parseFloat(carte.getAttribute('data-prix-ht-promo'));
  if (isNaN(ht)) return;
  var h;
  if (hp > 0 && hp < ht){
    h = '<span class="barre promo-couleur">' + euro(ht * r.f) + '</span>'
      + '<span class="actuel promo-couleur">' + euro(hp * r.f) + '</span>';
  } else {
    h = '<span class="actuel">' + euro(ht * r.f) + '</span>';
  }
  el.innerHTML = h + '<span class="mention">' + r.m + '</span>';
}
function rendrePrix(racine){
  var r = racine || document;
  var cartes = r.querySelectorAll('.carte-produit[data-prix-ht]');
  for (var i = 0; i < cartes.length; i++) rendrePrixCarte(cartes[i]);
  var reg = REGIMES[regimeEnCours()]();
  var panier = r.querySelectorAll('#mini-panier [data-prix-ht]');
  for (var j = 0; j < panier.length; j++){
    var ht = parseFloat(panier[j].getAttribute('data-prix-ht'));
    if (!isNaN(ht)) panier[j].textContent = euro(ht * reg.f) + ' ' + reg.m;
  }
}
/* équipe les cartes d'une page : celles du premier lot, écrites en dur, comme
   celles qu'un script vient d'ajouter. */
function appliquer(racine){
  var r = racine || document;
  var cartes = r.querySelectorAll('.carte-produit');
  var aVenir = false;
  for (var i = 0; i < cartes.length; i++){
    var c = cartes[i];
    var fin = c.getAttribute('data-promo-fin');
    if (fin && !(new Date(fin).getTime() - horloge() > 0)){
      finirPromo(c);
    } else {
      if (fin){ majCompte(c); aVenir = true; }   /* tout de suite, pas dans une seconde */
      rendreBadges(c);
    }
    rendrePrixCarte(c);          /* la carte est équipée en entier, d'un seul chemin */
  }
  if (aVenir) veiller();
  return cartes.length;
}

/* ============================================================================
   7. LA VEILLE — le compte à rebours descend tout seul, sans animation. Une
      seule horloge pour toutes les cartes ; elle s'arrête d'elle-même quand
      plus aucune carte n'a d'échéance.
   ============================================================================ */
var minuteur = null;
function veiller(){
  if (minuteur) return;
  minuteur = setInterval(function(){
    var cartes = document.querySelectorAll('[data-promo-fin]');
    if (!cartes.length){ clearInterval(minuteur); minuteur = null; return; }
    for (var i = 0; i < cartes.length; i++) majCompte(cartes[i]);
  }, 1000);
}

/* ============================================================================
   8. LE CONSTRUCTEUR — une carte à partir d'un produit. Le module compagnon
      lira ps_product, ps_product_lang, ps_specific_price et ps_stock_available
      et rendra ces mêmes attributs.
      p : i (id) · n (nom) · p (prix TTC payé) · r (prix TTC de référence, 0 si
      pas de remise) · rem (pourcentage, nombre) ou remv (« 3 € », texte) ·
      fin (date de fin réelle, ISO, facultative) · nf (nouveauté) · o (indispo) ·
      l (derniers articles) · u (url) · img (visuel).
   ============================================================================ */
function echa(s){
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function valeurRemiseProduit(p){
  if (p.rem) return (typeof p.rem === 'number') ? p.rem + NBSP + '%' : String(p.rem);
  if (p.remv) return String(p.remv);          /* remise en montant : « 3 € » */
  return '';
}
function attributDe(p, nom){
  if (nom === 'data-prix-ht') return (p.r > 0 ? p.r : p.p) / OPTIONS.tva;
  if (nom === 'data-prix-ht-promo') return (p.r > 0) ? (p.p / OPTIONS.tva).toFixed(6) : null;
  if (nom === 'data-remise') return valeurRemiseProduit(p) || null;
  if (nom === 'data-nouveau') return p.nf ? 'true' : null;
  if (nom === 'data-promo-fin') return p.fin || null;
  return null;
}
function attributs(p){
  var a = ' data-id-produit="' + echa(p.i) + '" data-prix-ht="' + ((p.r > 0 ? p.r : p.p) / OPTIONS.tva).toFixed(6) + '"';
  if (p.r > 0) a += ' data-prix-ht-promo="' + (p.p / OPTIONS.tva).toFixed(6) + '"';
  var rem = valeurRemiseProduit(p);
  if (rem) a += ' data-remise="' + echa(rem) + '"';
  if (p.fin) a += ' data-promo-fin="' + echa(p.fin) + '"';
  if (p.nf) a += ' data-nouveau="true"';
  return a;
}
function dispoDe(p){
  if (p.o) return '<div class="dispo dispo--indispo">Indisponible</div>';
  if (p.l) return '<div class="dispo dispo--derniers">Derniers articles en stock</div>';
  return '<div class="dispo" aria-hidden="true"></div>';
}
function html(p){
  var img = p.img || (typeof OPTIONS.image === 'function' ? OPTIONS.image(p) : '') || '';
  var badges = badgesVue({ get: function(n){ return attributDe(p, n); } });
  return '<article class="carte-produit' + (p.o ? ' est-indispo' : '') + '"' + attributs(p) + '>'
    + '<a class="carte-lien" href="' + echa(p.u) + '" target="_blank" rel="noopener noreferrer">'
    + '<div class="visuel">' + (badges ? '<span class="badges">' + badges + '</span>' : '')
    + (img ? '<img src="' + img + '" width="236" height="305" alt="' + echa(p.n) + '" decoding="async">' : '')
    + '<span class="zp">visuel_produit</span></div>'
    + '<div class="info"><div class="nom">' + echa(p.n) + '</div><div class="prix"></div>'
    + (p.fin ? '<div class="compte-rebours-carte" data-compte-rebours-carte role="timer" aria-live="off"></div>' : '')
    + dispoDe(p) + '</div>'
    + '</a></article>';
}

/* ============================================================================
   9. L'INCLUSION — la feuille de style dans <head>, puis la mise à niveau des
      cartes déjà présentes. L'identifiant « carte-partage-css » est le garde :
      si la feuille est déjà là (aperçu autonome), elle n'est pas reposée.
   ============================================================================ */
var CSS_ID = 'carte-partage-css';
function poserFeuille(){
  if (document.getElementById(CSS_ID)) return;
  var s = document.createElement('style');
  s.id = CSS_ID;
  s.textContent = CSS_PARTAGE;
  (document.head || document.documentElement).appendChild(s);
}
function demarrer(){ poserFeuille(); appliquer(document); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
else demarrer();

/* ============================================================================
   10. L'API PUBLIQUE — le seul contrat entre le bloc et les pages.
   ============================================================================ */
window.CARTE_PRODUIT = {
  html: html,
  attributs: attributs,
  appliquer: appliquer,
  rendrePrix: rendrePrix,
  rendrePrixCarte: rendrePrixCarte,
  rendreBadges: rendreBadges,
  majCompte: majCompte,
  finirPromo: finirPromo,
  regime: function(nom){ if (nom) regler({ carte_prix_regime: nom }); return regimeEnCours(); },
  regler: regler,
  euro: euro,
  duree: duree,
  dateLongue: dateLongue,
  badgesDe: badgesDe,
  valeurRemise: valeurRemise,
  echa: echa,
  feuille: CSS_PARTAGE,
  idFeuille: CSS_ID,
  options: function(){ return OPTIONS; }
};
})();
