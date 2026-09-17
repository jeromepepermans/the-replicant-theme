# Runbook — remise à niveau de la préproduction the-replicant.com

**Objet** : rendre `~/preprod.the-replicant.com` identique à la production (fichiers + base), pour disposer
d'une base de travail qui prouve quelque chose (décision **DECISION-012**).
**Statut** : **à valider par Jérôme avant exécution.** Aucune commande ci-dessous n'a été lancée.
**Règle absolue** : la **production n'est jamais écrite** — uniquement lue (`mysqldump`, `rsync` en lecture).

---

## 1. Ce qui est touché / ce qui ne l'est pas

| | |
|---|---|
| **Écrit** | `~/preprod.the-replicant.com` (fichiers) et la base `djdj2187_preprod_thereplicant` |
| **Lu seulement** | `~/the-replicant.com` (fichiers) et la base `djdj2187_pab` |
| **Jamais touché** | la production, ses crons, ses sauvegardes, `~/newsletter-replicant`, les autres applications du compte |
| **Non couvert par ce runbook** | la mise à jour PrestaShop 8.2.3 → 8.2.8 (sujet distinct) et toute modification de thème |

---

## 2. Chiffres mesurés le 17/09/2026 (pour dimensionner, pas pour supposer)

| Élément | Mesure |
|---|---|
| Base de production `djdj2187_pab` | **1 719 Mo**, **571 tables** (563 InnoDB + 8 MyISAM) |
| Plus grosses tables | `ps_log` **327 Mo** (~1,97 M lignes), `ps_orders` 121 Mo, `ps_guest` 118 Mo, `ps_product_lang` 108 Mo, `ps_order_detail` 103 Mo, `ps_customer` 89 Mo, `ps_cart` 67 Mo, `ps_migrationpro_migrated_data` 65 Mo (~1,08 M lignes) |
| Fichiers de production (hors `var/cache`) | **29 Go** — dont **15 Go d'images** (`img/`) |
| Fichiers de préprod (hors cache) | 17 Go |
| `var/cache` de production | 371 Mo (exclu de la copie) |
| Disque | **1,6 To libres** (56 % utilisés) — largement suffisant |
| Outils présents | `mysqldump`, `mysql`, `tar`, `rsync` ✅ |
| ⚠ Fichiers **différents** entre les deux installations | `app/config/parameters.php` (md5 `205dd0a7` prod / `ec76cb39` préprod) et `.htaccess` (5 396 o / 3 092 o) ⇒ **exclusions obligatoires** |

*Observation, hors périmètre : `ps_log` (327 Mo / 1,97 M lignes) et `ps_migrationpro_migrated_data`
(65 Mo / 1,08 M lignes) sont des tables de journal/résidus de migration — candidates à un nettoyage ultérieur.*

**Durée estimée** : dump ~5-10 min · rsync ~15-30 min · restauration ~10-15 min · contrôles ~15 min.
**Fenêtre conseillée** : en journée entre 15h et 17h, ou le soir — **à éviter** : 00h00-00h10 (vidage de cache),
01h00-02h00 (purges), mercredi 09h (cycle newsletter), jeudi/vendredi 10h-11h (envois et relevés),
et les minutes :00 à :03 de chaque heure (crons Amazon/Cdiscount).

---

## 3. Étape 0 — Pré-checks

```bash
date -Is
df -h /home/djdj2187 | tail -1                       # espace
crontab -l | grep -c preprod                          # repérer ce qui vise la préprod
mysql --version; mysqldump --version                  # versions côté client
```

- [ ] Feu vert de Jérôme sur la fenêtre (aucun travail en cours sur la préprod).
- [ ] Confirmer qu'aucune commande de test n'est en cours sur la préprod.

---

## 4. Étape 1 — Sauvegarde de la préprod actuelle (autorisée — DECISION-012)

Les identifiants ne sont **jamais affichés** : on génère un fichier `--defaults-extra-file` en `0600`
à partir de `parameters.php`, et on le supprime à la fin.

```bash
TS=$(date +%Y%m%d-%H%M%S)
BK=/home/djdj2187/backups/the-replicant-theme/$TS; mkdir -p "$BK"

# 1.a — Fichiers de la préprod (hors caches)
tar --exclude='var/cache' --exclude='*/assets/cache' --exclude='*.log' \
    -czf "$BK/preprod-fichiers-$TS.tar.gz" -C /home/djdj2187 preprod.the-replicant.com

# 1.b — Base de la préprod (credentials lus depuis parameters.php, jamais affichés)
php -r '$c=(include "/home/djdj2187/preprod.the-replicant.com/app/config/parameters.php")["parameters"];
file_put_contents("/home/djdj2187/.my-preprod.cnf",
  "[client]\nhost=".$c["database_host"]."\nuser=".$c["database_user"]."\npassword=".$c["database_password"]."\n");'
chmod 600 /home/djdj2187/.my-preprod.cnf
mysqldump --defaults-extra-file=/home/djdj2187/.my-preprod.cnf --single-transaction --quick \
          --routines --triggers --events --no-tablespaces \
          djdj2187_preprod_thereplicant | gzip > "$BK/preprod-base-$TS.sql.gz"

# 1.c — Contrôles d'intégrité (taille non nulle, archive lisible, fin de dump présente)
ls -lh "$BK"; tar -tzf "$BK/preprod-fichiers-$TS.tar.gz" | wc -l
zcat "$BK/preprod-base-$TS.sql.gz" | tail -3     # doit finir par "Dump completed on ..."
```

⚠ **Ne pas supprimer `.my-preprod.cnf` tout de suite** : il resservira à l'étape 3.

---

## 5. Étape 2 — Dump de la production (lecture seule, sans verrou)

```bash
php -r '$c=(include "/home/djdj2187/the-replicant.com/app/config/parameters.php")["parameters"];
file_put_contents("/home/djdj2187/.my-prod.cnf",
  "[client]\nhost=".$c["database_host"]."\nuser=".$c["database_user"]."\npassword=".$c["database_password"]."\n");'
chmod 600 /home/djdj2187/.my-prod.cnf

mysqldump --defaults-extra-file=/home/djdj2187/.my-prod.cnf \
          --single-transaction --quick --routines --triggers --events --no-tablespaces \
          --skip-lock-tables \
          djdj2187_pab | gzip > "$BK/prod-base-$TS.sql.gz"

ls -lh "$BK/prod-base-$TS.sql.gz"
zcat "$BK/prod-base-$TS.sql.gz" | tail -3        # "Dump completed on ..."
```

- `--single-transaction` : instantané cohérent **sans bloquer les ventes** (tables InnoDB).
  Les **8 tables MyISAM** ne bénéficient pas de la transaction : cohérence parfaite non garantie sur ces
  seules tables (aucune donnée critique du parcours d'achat) — à savoir, pas à craindre.
- La charge ajoutée sur la production est celle d'une lecture séquentielle ; le dump évite volontairement
  les fenêtres de crons (étape 0).

---

## 6. Étape 3 — Restauration dans la préprod

```bash
# 3.a — Base : repartir d'un schéma vide pour ne pas laisser de tables orphelines
mysql --defaults-extra-file=/home/djdj2187/.my-preprod.cnf -e \
  "DROP DATABASE IF EXISTS djdj2187_preprod_thereplicant; CREATE DATABASE djdj2187_preprod_thereplicant CHARACTER SET utf8mb4;"
zcat "$BK/prod-base-$TS.sql.gz" | mysql --defaults-extra-file=/home/djdj2187/.my-preprod.cnf djdj2187_preprod_thereplicant

# (si les privilèges DROP/CREATE DATABASE sont refusés : générer la liste des tables et les supprimer une à une)

# 3.b — Fichiers : prod → préprod, SANS écraser ce qui appartient à la préprod
rsync -a --info=progress2 --stats \
  --exclude='app/config/parameters.php' \
  --exclude='.htaccess' \
  --exclude='var/cache/*' \
  --exclude='themes/*/assets/cache/*' \
  --exclude='*.log' --exclude='var/logs/*' \
  /home/djdj2187/the-replicant.com/ /home/djdj2187/preprod.the-replicant.com/
```

- **Pas de `--delete`** : la préprod garde ses fichiers propres (dont `parameters.php` et `.htaccess`).
  Un nettoyage ciblé pourra suivre si nécessaire, après comparaison.
- Les exclusions sont **obligatoires** : `parameters.php` de la préprod pointe sur **sa** base, et son
  `.htaccess` n'est pas celui de la production.

---

## 7. Étape 4 — Remettre la préprod sur ses rails

```bash
php -r '
$c=(include "/home/djdj2187/preprod.the-replicant.com/app/config/parameters.php")["parameters"];
$m=new mysqli($c["database_host"],$c["database_user"],$c["database_password"],$c["database_name"]);
mysqli_report(MYSQLI_REPORT_OFF);
// URL de boutique = celle de la préprod
$m->query("UPDATE ps_shop_url SET domain=\"preprod.the-replicant.com\", physical_uri=\"/\", virtual_uri=\"\", main=1, active=1");
// Boutique ouverte
$m->query("UPDATE ps_configuration SET value=1 WHERE name=\"PS_SHOP_ENABLE\"");
$m->query("DELETE FROM ps_configuration WHERE name=\"PS_MAINTENANCE_IP\"");
$r=$m->query("SELECT domain, main, active FROM ps_shop_url"); while($x=$r->fetch_assoc()) echo implode(" | ",$x)."\n";
'
# Cache vidé
rm -rf /home/djdj2187/preprod.the-replicant.com/var/cache/prod/* 2>/dev/null
```

- [ ] Vérifier que la préprod répond bien sur `https://preprod.the-replicant.com/` (200) et que le
      back-office s'ouvre avec un compte employé.
- [ ] Vérifier que **le thème actif est bien `warehouse`** (comme en production) — `SELECT theme_name FROM ps_shop`.

---

## 8. Étape 5 — La préprod ne doit rien déclencher vers l'extérieur

**Aucun appel marketplace, aucun paiement, aucun e-mail ne doit partir de la préprod.**

```bash
php -r '
$c=(include "/home/djdj2187/preprod.the-replicant.com/app/config/parameters.php")["parameters"];
$m=new mysqli($c["database_host"],$c["database_user"],$c["database_password"],$c["database_name"]);
mysqli_report(MYSQLI_REPORT_OFF);
$off = ["amazon","cdiscount","temuconnector","colissimo","colissimo_essentiel","hc_fedex","hc_retractation",
        "packlink","naturabuy","MoneticoPaiement","alma","ps_checkout","ps_wirepayment","sendinblue",
        "ps_emailalerts","ps_facebook","m2emultichannelconnect","storecommander","blockoss","medgtranslate",
        "certishoppingsocialreviews","gamification","ps_reminder","popupguest","blockproductsbycountry","la_customproduct"];
$in = "\"".implode("\",\"",$off)."\"";
$m->query("UPDATE ps_module SET active=0 WHERE name IN ($in)");
echo "modules désactivés : ".$m->getAffectedRows()."\n";
$r=$m->query("SELECT COUNT(*) n FROM ps_module WHERE active=1"); $x=$r->fetch_assoc();
echo "modules encore actifs : ".$x["n"]."\n";
'
```

À faire ensuite **dans le back-office** (et à vérifier en base) :

- [ ] **Paramètres avancés → E-mail → « Ne jamais envoyer d'e-mails »** (utile pour les tests), puis
      contrôler la constante réellement écrite :
      `SELECT name, value FROM ps_configuration WHERE name IN ('PS_MAIL_METHOD','PS_MAIL_SMTP_USER');`
      (nom et longueur seulement — jamais la valeur d'un secret).
- [ ] **Crontab** : commenter la ligne qui vise la préprod (`colissimo_essentiel … preprod.the-replicant.com`)
      le temps du chantier. Les autres lignes visent la production et restent **intactes**.
- [ ] **Volontairement conservés actifs** : `ets_onepagecheckout` (le tunnel actuel — c'est lui qu'on va
      décortiquer), `aimetadata` (badge IA — doit rester visible), `ph_simpleblog` (blog), `iqit*`,
      `revsliderprestashop`, `ets_awesomeurl` (URL réécrites), `ps_facetedsearch`, `ps_accounts`/`ps_mbo`
      (catalogue de modules du back-office).

---

## 9. Étape 6 — Vérifications finales

| Contrôle | Commande / méthode | Attendu |
|---|---|---|
| Boutique en ligne | `curl -sI https://preprod.the-replicant.com/` | `HTTP/2 200` |
| Thème | `SELECT theme_name FROM ps_shop` | `warehouse` (identique à la prod) |
| Modules | `SELECT COUNT(*) FROM ps_module WHERE active=1` | ≈ **77** (103 prod − 26 désactivés), à comparer |
| URL de boutique | `SELECT domain, main FROM ps_shop_url` | `preprod.the-replicant.com \| 1` |
| Back-office | connexion avec un compte employé + ouverture d'une fiche produit | OK |
| Front | une page produit, une page catégorie, le panier | OK, images servies |
| Images | `du -sh img/` | ≈ **15 Go** (comme la production) |
| E-mails | envoi test → aucune réception | conforme |
| Crons | `crontab -l \| grep preprod` | commentés |
| **Baseline** | poids HTML, requêtes, TTFB sur accueil / catégorie / produit | **nouvelle référence du chantier** |

---

## 10. Étape 7 — Rollback (si la préprod est cassée)

```bash
BK=/home/djdj2187/backups/the-replicant-theme/<TS>
# Base
mysql --defaults-extra-file=/home/djdj2187/.my-preprod.cnf -e "DROP DATABASE IF EXISTS djdj2187_preprod_thereplicant; CREATE DATABASE djdj2187_preprod_thereplicant CHARACTER SET utf8mb4;"
zcat "$BK/preprod-base-$TS.sql.gz" | mysql --defaults-extra-file=/home/djdj2187/.my-preprod.cnf djdj2187_preprod_thereplicant
# Fichiers (restauration de la sauvegarde de l'étape 1 par-dessus)
tar -xzf "$BK/preprod-fichiers-$TS.tar.gz" -C /home/djdj2187
# puis vider var/cache/prod
```

Puis, dans tous les cas :

```bash
rm -f /home/djdj2187/.my-prod.cnf /home/djdj2187/.my-preprod.cnf     # aucun identifiant ne doit rester
```

---

## 11. Ce que le runbook ne fait pas (et qui doit rester un choix explicite)

1. **Il ne touche pas à la production** — la production continue de servir les commandes pendant l'opération.
2. **Il ne met pas à jour PrestaShop** : la boutique est en **8.2.3** alors que **8.2.8** est publié.
   Cette montée de patch est un sujet distinct (et à faire d'abord sur la préprod, une fois celle-ci à jour).
3. **Il ne restaure pas les sauvegardes de production** : la sauvegarde de la production (thème + base)
   reste à organiser avant la bascule finale du thème.
4. **Il ne répare pas le cron WebP** (0 fichier `.webp` pour 216 997 JPEG) — sujet de la phase images.
5. **Il ne remplace pas le thème** : il ne fait que rendre la préprod fidèle.
