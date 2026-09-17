<?php
/**
 * Sonde d'audit LECTURE SEULE — phase 0 du chantier « thème the-replicant.com ».
 *
 * Passée sur STDIN : aucun fichier écrit sur le serveur, rien à nettoyer.
 *
 *   ssh -i ~/.ssh/id_ed25519 djdj2187@nilgaut.o2switch.net \
 *     'PS_SHOP_DIR=/home/djdj2187/preprod.the-replicant.com php' < outillage/sonde-phase0.php
 *
 * Garanties : SELECT / SHOW uniquement ; credentials lus dans parameters.php et consommés
 * par mysqli, jamais imprimés ; aucune valeur de configuration affichée (nom + longueur seulement).
 * Le marqueur « == FIN SONDE == » doit être présent, sinon la sortie est tronquée.
 */

error_reporting(E_ALL);
ini_set('display_errors', '1');

$shop = getenv('PS_SHOP_DIR');
if (!$shop) { fwrite(STDERR, "PS_SHOP_DIR manquant.\n"); exit(2); }
$file = rtrim($shop, '/') . '/app/config/parameters.php';
if (!is_readable($file)) { fwrite(STDERR, "parameters.php illisible : $file\n"); exit(2); }
$p = include $file;
$c = $p['parameters'];
$pfx = !empty($c['database_prefix']) ? $c['database_prefix'] : (!empty($c['tables_prefix']) ? $c['tables_prefix'] : 'ps_');

$m = new mysqli($c['database_host'], $c['database_user'], $c['database_password'], $c['database_name']);
if ($m->connect_error) { fwrite(STDERR, 'connexion impossible : ' . $m->connect_error . "\n"); exit(3); }
mysqli_report(MYSQLI_REPORT_OFF); // une requête fautive ne doit pas tuer la sonde (piège connu)

function rows($m, $sql, $label, $max = 40) {
    echo "== $label\n";
    $r = $m->query($sql);
    if (!$r) { echo '  SQLERR: ' . $m->error . "\n"; return; }
    $n = 0;
    while ($row = $r->fetch_assoc()) {
        $n++;
        if ($n > $max) { continue; }
        $parts = array();
        foreach ($row as $v) { $parts[] = ($v === null) ? 'NULL' : $v; }
        echo '  ' . implode(' | ', $parts) . "\n";
    }
    if ($n === 0) { echo "  (0 ligne)\n"; }
    if ($n > $max) { echo '  … ' . ($n - $max) . " lignes supplémentaires\n"; }
}
function val($m, $sql, $label) {
    $r = $m->query($sql);
    $row = $r ? $r->fetch_row() : null;
    echo '  ' . $label . ' = ' . (isset($row[0]) ? $row[0] : 'N/A') . "\n";
}
function quote_list($m, $names) {
    $out = array();
    foreach ($names as $n) { $out[] = "'" . $m->real_escape_string($n) . "'"; }
    return implode(',', $out);
}

echo "### SOCLE\n";
echo '  chemin=' . $shop . ' base=' . $c['database_name'] . ' prefixe=' . $pfx . ' hote=' . $c['database_host'] . "\n";
val($m, 'SELECT VERSION()', 'MariaDB/MySQL');
val($m, 'SELECT value FROM ' . $pfx . "configuration WHERE name = 'PS_VERSION_DB'", 'PrestaShop (version en base)');
rows($m, 'SELECT name, value FROM ' . $pfx . "configuration WHERE name IN ('PS_SHOP_ENABLE','PS_SSL_ENABLED','PS_MULTISHOP_FEATURE_ACTIVE','PS_MAINTENANCE_IP','PS_REWRITING_SETTINGS','PS_CSS_THEME_CACHE','PS_JS_THEME_CACHE','PS_HTML_THEME_COMPRESSION','PS_MEDIA_SERVER_1','PS_COOKIE_SAMESITE')", 'clés de configuration du socle');

echo "\n### THEMES (en base et sur disque)\n";
rows($m, 'SELECT id_shop, name, active, deleted, theme_name FROM ' . $pfx . 'shop', 'ps_shop.theme_name (le thème réellement actif)');

echo "\n### MULTISTORE (mesure)\n";
rows($m, 'SELECT id_shop, id_shop_group, name, active, deleted FROM ' . $pfx . 'shop', 'ps_shop');
rows($m, 'SELECT id_shop, domain, physical_uri, virtual_uri, main, active FROM ' . $pfx . 'shop_url', 'ps_shop_url');
rows($m, 'SELECT id_shop_group, name, share_customer, share_order, share_stock FROM ' . $pfx . 'shop_group', 'ps_shop_group');
rows($m, 'SELECT name, value FROM ' . $pfx . "configuration WHERE name LIKE '%MULTISHOP%'", 'PS_MULTISHOP_FEATURE_ACTIVE (absence = jamais activé)');

echo "\n### MODULES\n";
val($m, 'SELECT COUNT(*) FROM ' . $pfx . 'module', 'modules enregistrés');
val($m, 'SELECT COUNT(*) FROM ' . $pfx . 'module WHERE active = 1', 'modules actifs');
echo "== modules actifs (nom | version), ordre alphabétique\n";
$r = $m->query('SELECT name, version FROM ' . $pfx . 'module WHERE active = 1 ORDER BY name');
$line = array(); $i = 0;
while ($r && $row = $r->fetch_row()) { $line[] = $row[0] . '(' . $row[1] . ')'; if (++$i % 3 === 0) { echo '  ' . implode('  ', $line) . "\n"; $line = array(); } }
if ($line) { echo '  ' . implode('  ', $line) . "\n"; }

echo "\n== modules clés du chantier\n";
$cles = array('iqitelementor', 'revslider', 'ph_simpleblog', 'sendinblue', 'aimetadata', 'blockreassurance', 'ps_mainmenu', 'ps_shoppingcart', 'ps_customeraccountlinks', 'ps_emailsubscription', 'ps_crossselling', 'ps_productinfo', 'ps_customersignin', 'ps_searchbar', 'ps_languageselector', 'ps_currencyselector', 'ps_linklist', 'ps_socialfollow', 'ps_imageslider', 'ps_banner', 'ps_featuredproducts', 'ps_newproducts', 'ps_bestsellers', 'ps_specials', 'ps_categoryproducts', 'ps_facetedsearch', 'ps_checkpayment', 'ps_wirepayment', 'colissimo', 'amazon', 'cdiscount', 'temuconnector', 'ph_simpleblog', 'pm_advancedpack');
rows($m, 'SELECT name, version, active FROM ' . $pfx . 'module WHERE name IN (' . quote_list($m, $cles) . ') ORDER BY active DESC, name', 'présents ? version ? actifs ?', 60);

echo "\n== hooks réellement posés par les modules clés du chantier\n";
rows($m, 'SELECT mo.name AS module, h.name AS hook, hm.position FROM ' . $pfx . 'hook_module hm'
    . ' JOIN ' . $pfx . 'hook h ON h.id_hook = hm.id_hook'
    . ' JOIN ' . $pfx . 'module mo ON mo.id_module = hm.id_module'
    . ' WHERE mo.name IN (' . quote_list($m, array('iqitelementor', 'revslider', 'ph_simpleblog', 'aimetadata', 'ps_imageslider', 'ps_banner', 'ps_featuredproducts')) . ')'
    . ' ORDER BY mo.name, h.name', 'contour fonctionnel réel', 80);

echo "\n== module aimetadata : antériorité (badge IA / AI Act)\n";
rows($m, 'SELECT id_module, name, active, version FROM ' . $pfx . "module WHERE name LIKE '%aimetadata%'", 'enregistré ? actif ?');
rows($m, 'SELECT name FROM ' . $pfx . "configuration WHERE name LIKE 'AIMETADATA%'", 'clés de configuration (noms seulement)');
rows($m, "SHOW TABLES LIKE '" . $pfx . "ai_image%'", 'tables propres au module');

echo "\n### CATALOGUE\n";
val($m, 'SELECT COUNT(*) FROM ' . $pfx . 'product', 'produits (toutes lignes)');
val($m, 'SELECT COUNT(*) FROM ' . $pfx . 'product WHERE active = 1', 'produits actifs');
val($m, 'SELECT COUNT(*) FROM ' . $pfx . 'product_shop WHERE active = 1', 'product_shop actifs');
val($m, 'SELECT COUNT(*) FROM ' . $pfx . 'category WHERE active = 1', 'catégories actives');
val($m, 'SELECT COUNT(*) FROM ' . $pfx . 'image', 'lignes ps_image');
val($m, 'SELECT COUNT(DISTINCT id_product) FROM ' . $pfx . 'image', 'produits avec au moins une image');

echo "\n### CLIENTS, GROUPES, EMPLOYÉS\n";
rows($m, 'SELECT g.id_group, gl.name, g.reduction, g.show_prices, g.price_display_method FROM ' . $pfx . 'group g JOIN ' . $pfx . 'group_lang gl ON gl.id_group = g.id_group WHERE gl.id_lang = 1', 'groupes clients', 20);
rows($m, 'SELECT cg.id_group, COUNT(*) n FROM ' . $pfx . 'customer_group cg GROUP BY cg.id_group ORDER BY n DESC', 'clients par groupe', 20);
val($m, 'SELECT COUNT(*) FROM ' . $pfx . 'customer', 'clients');
val($m, 'SELECT COUNT(*) FROM ' . $pfx . 'employee WHERE active = 1', 'employés actifs (validation des comptes pro)');
rows($m, 'SELECT id_lang, iso_code, active FROM ' . $pfx . 'lang ORDER BY id_lang', 'langues', 20);
rows($m, 'SELECT id_currency, iso_code, active, conversion_rate FROM ' . $pfx . 'currency ORDER BY id_currency', 'devises', 20);

echo "\n### LIVRAISON & PAIEMENT (matière du tunnel)\n";
rows($m, 'SELECT c.id_carrier, cl.delivery, c.active, c.deleted, c.is_free, c.shipping_method, c.range_behavior FROM ' . $pfx . 'carrier c JOIN ' . $pfx . 'carrier_lang cl ON cl.id_carrier = c.id_carrier AND cl.id_lang = 1 ORDER BY c.id_carrier', 'transporteurs', 30);
echo "== hooks de paiement réellement occupés (qui prend le paiement aujourd'hui)\n";
rows($m, 'SELECT mo.name AS module, h.name AS hook FROM ' . $pfx . 'hook_module hm JOIN ' . $pfx . 'hook h ON h.id_hook = hm.id_hook JOIN ' . $pfx . 'module mo ON mo.id_module = hm.id_module WHERE h.name IN (\'payment\', \'paymentOptions\', \'paymentReturn\', \'displayPayment\', \'displayPaymentReturn\', \'actionPaymentConfirmation\') ORDER BY h.name, mo.name', 'qui prend le paiement aujourd\'hui', 40);

echo "\n### COMMANDES (volumétrie récente)\n";
val($m, 'SELECT COUNT(*) FROM ' . $pfx . 'orders', 'commandes (total)');
val($m, 'SELECT COUNT(*) FROM ' . $pfx . 'orders WHERE date_add >= DATE_SUB(NOW(), INTERVAL 30 DAY)', 'commandes 30 jours');
val($m, 'SELECT COUNT(*) FROM ' . $pfx . 'customer WHERE newsletter = 1', 'clients inscrits newsletter (colonne newsletter)');

echo "\n== FIN SONDE ==\n";
