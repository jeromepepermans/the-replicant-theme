#!/usr/bin/env bash
# ============================================================================================
# Remise à niveau de la PRÉPRODUCTION the-replicant.com depuis la PRODUCTION
#   - la production n'est JAMAIS écrite (lecture seule : mysqldump + rsync)
#   - sauvegarde complète de la préprod AVANT toute modification
#   - toutes les étapes sont vérifiées ; la moindre erreur arrête tout (set -euo pipefail)
#
# Usage :  ./remise-a-niveau-preprod.sh            (exécution réelle)
#          ./remise-a-niveau-preprod.sh --dry-run  (contrôles préalables uniquement)
#
# Priorités : les étapes distantes tournent en `nice -n 19` (CPU au minimum) pour ne pas ralentir la
#   production, qui partage le serveur, le disque et l'instance MariaDB.
#   ⚠ `ionice -c3` (E/S en classe « idle ») a été RETIRÉ le 18/09/2026 : mesuré à ~4,9 Mo/s de lecture
#   effective sur le stockage partagé (~10x plus lent — l'étape 1 n'était qu'à 87 % après 51 minutes).
#   La production n'était pas ralentie, mais l'opération sortait de sa fenêtre. Voir BUG-004.
# Déclenchement : par le cron SYSTÈME du VPS. Le planificateur Hermes du profil `devops` ne
#   s'exécute pas (aucun gateway n'y tourne) : le job armé du 17/09 à 20h07 n'est jamais parti (BUG-001).
#
# Référence : docs/runbook-remise-a-niveau-preprod.md
# ============================================================================================
set -euo pipefail

SSH_KEY="${SSH_KEY:-/home/ubuntu/.ssh/id_ed25519}"
SSH_TARGET="${SSH_TARGET:-djdj2187@nilgaut.o2switch.net}"
LOGDIR="$(cd "$(dirname "$0")/.." && pwd)/logs"
TS="$(date +%Y%m%d-%H%M%S)"
LOG="$LOGDIR/remise-a-niveau-$TS.log"
mkdir -p "$LOGDIR"

MODE="run"; [ "${1:-}" = "--dry-run" ] && MODE="dry-run"

# --------------------------------------------------------------------------------------------
# Script exécuté à DISTANCE (passé sur stdin : rien n'est déposé sur le serveur)
# --------------------------------------------------------------------------------------------
REMOTE_SCRIPT=$(cat <<'REMOTE'
set -euo pipefail
TS="$1"; MODE="$2"
SHOP=/home/djdj2187/the-replicant.com
PRE=/home/djdj2187/preprod.the-replicant.com
BK=/home/djdj2187/backups/the-replicant-theme/$TS
CNF_PRE=/home/djdj2187/.my-preprod.cnf
CNF_PROD=/home/djdj2187/.my-prod.cnf
DB_PROD=djdj2187_pab
DB_PRE=djdj2187_preprod_thereplicant

log()  { printf '%s | %s\n' "$(date '+%H:%M:%S')" "$*"; }
fail() { log "ECHEC: $*"; echo "RESULTAT: ECHEC — $*"; exit 1; }
# Nettoyage garanti : les identifiants temporaires sont supprimés SUR TOUTE SORTIE (nominale,
# erreur, interruption), et pas seulement en fin de course (P130 — mesuré le 18/09/2026 : un arrêt
# en pleine exécution les avait laissés sur le serveur, mode 600, mot de passe de base inclus).
cleanup() {
  status=$?
  rm -f "$CNF_PRE" "$CNF_PROD" 2>/dev/null || true
  if [ "$status" -ne 0 ]; then
    echo "RESULTAT: ECHEC (code $status, ligne $LINENO)"
    echo "identifiants temporaires supprimés par le trap"
  fi
}
trap cleanup EXIT

# Clients MariaDB si disponibles (évite l'avertissement de dépréciation du client mysql)
MYSQL=$(command -v mariadb || command -v mysql)
MYSQLDUMP=$(command -v mariadb-dump || command -v mysqldump)
log "clients utilisés : $MYSQL / $MYSQLDUMP"

# --- 0. Contrôles préalables -----------------------------------------------------------------
log "ETAPE 0 — contrôles préalables"
# Le dossier de sauvegarde n'est créé qu'à partir de l'étape 1 : un --dry-run ne doit rien
# laisser sur le disque (deux dossiers vides laissés le 17/09 ressemblaient à des sauvegardes).
for b in tar rsync gzip; do command -v "$b" >/dev/null || fail "outil manquant: $b"; done
[ -n "$MYSQL" ] && [ -n "$MYSQLDUMP" ] || fail "client MySQL/MariaDB introuvable"
[ -d "$SHOP" ] || fail "production introuvable"
[ -d "$PRE" ]  || fail "préproduction introuvable"
AVAIL_KB=$(df -Pk /home/djdj2187 | tail -1 | awk '{print $4}')
log "espace libre: $((AVAIL_KB/1024/1024)) Go"
[ "$AVAIL_KB" -gt 52428800 ] || fail "moins de 50 Go libres : opération annulée"
php -r '$c=(include "/home/djdj2187/the-replicant.com/app/config/parameters.php")["parameters"];
 file_put_contents("/home/djdj2187/.my-prod.cnf","[client]\nhost=".$c["database_host"]."\nuser=".$c["database_user"]."\npassword=".$c["database_password"]."\n");'
php -r '$c=(include "/home/djdj2187/preprod.the-replicant.com/app/config/parameters.php")["parameters"];
 file_put_contents("/home/djdj2187/.my-preprod.cnf","[client]\nhost=".$c["database_host"]."\nuser=".$c["database_user"]."\npassword=".$c["database_password"]."\n");'
chmod 600 "$CNF_PRE" "$CNF_PROD"
log "credentials temporaires écrits (mode 600, supprimés en fin d'exécution)"

"$MYSQL" --defaults-extra-file="$CNF_PRE" -N -e 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE()' "$DB_PRE" >/dev/null || fail "base préprod inaccessible"
"$MYSQL" --defaults-extra-file="$CNF_PROD" -N -e 'SELECT COUNT(*) FROM ps_shop' "$DB_PROD" >/dev/null || fail "base prod inaccessible"

log "garde-fous de sécurité :"
grep -q 'domain.*preprod\.the-replicant\.com' <<<"$("$MYSQL" --defaults-extra-file="$CNF_PRE" -N -e 'SELECT CONCAT("domain=",domain) FROM ps_shop_url LIMIT 1' "$DB_PRE")" \
  && log "  - la base préprod porte bien l'URL de préprod (aucun risque de servir la prod)" \
  || log "  - ATTENTION: URL de préprod non reconnue, elle sera réécrite à l'étape 5"

if [ "$MODE" = "dry-run" ]; then
  log "--- DRY-RUN : aucun téléchargement, aucune écriture de données ---"
  log "privilèges MySQL sur la base préprod :"
  "$MYSQL" --defaults-extra-file="$CNF_PRE" -N -e 'SHOW GRANTS FOR CURRENT_USER()' \
    | sed -E "s/PASSWORD '[^']*'/PASSWORD '***'/g" | sed 's/^/    /'
  log "tables de la base préprod : $("$MYSQL" --defaults-extra-file="$CNF_PRE" -N -e 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE()' "$DB_PRE")"
  log "tables de la base prod    : $("$MYSQL" --defaults-extra-file="$CNF_PROD" -N -e 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema="djdj2187_pab"' "$DB_PROD")"
  log "paramètres e-mail de la prod :"
  "$MYSQL" --defaults-extra-file="$CNF_PROD" -N -e "SELECT CONCAT('    ',name,' = ',value) FROM ps_configuration WHERE name IN ('PS_MAIL_METHOD','PS_MAIL_SMTP_ENCRYPTION')" "$DB_PROD" || true
  log "paramètres e-mail de la préprod :"
  "$MYSQL" --defaults-extra-file="$CNF_PRE" -N -e "SELECT CONCAT('    ',name,' = ',value) FROM ps_configuration WHERE name IN ('PS_MAIL_METHOD','PS_MAIL_SMTP_ENCRYPTION')" "$DB_PRE" || true
  log "priorité CPU : nice=$(command -v nice || echo ABSENT) — E/S en priorité normale (BUG-004)"
  log "tâches cron visant la préprod :"
  crontab -l 2>/dev/null | grep -c preprod | sed 's/^/    /' || true
  crontab -l 2>/dev/null | grep preprod | sed -E 's/(token|key|secure_key)=[^&"'"'"' ]*/\1=***/g' | sed 's/^/    /' || true
  log "fichiers de configuration à NE PAS écraser :"
  md5sum "$SHOP/app/config/parameters.php" "$PRE/app/config/parameters.php" 2>/dev/null | sed 's/^/    /'
  log "tailles : prod=$(du -sh --exclude=var/cache "$SHOP" 2>/dev/null | cut -f1) préprod=$(du -sh --exclude=var/cache "$PRE" 2>/dev/null | cut -f1)"
  rm -f "$CNF_PRE" "$CNF_PROD"
  echo "RESULTAT: DRY-RUN OK"
  exit 0
fi

mkdir -p "$BK"
log "dossier de sauvegarde : $BK"

# --- 1. Sauvegarde de la préprod (autorisation DECISION-012) ---------------------------------
log "ETAPE 1 — sauvegarde de la préprod actuelle (fichiers + base)"
tar --exclude='var/cache' --exclude='*/assets/cache' --exclude='*.log' \
    -czf "$BK/preprod-fichiers-$TS.tar.gz" -C /home/djdj2187 preprod.the-replicant.com
"$MYSQLDUMP" --defaults-extra-file="$CNF_PRE" --single-transaction --quick --routines --triggers --events \
          --no-tablespaces "$DB_PRE" | gzip > "$BK/preprod-base-$TS.sql.gz"
[ -s "$BK/preprod-fichiers-$TS.tar.gz" ] || fail "archive de sauvegarde vide"
[ -s "$BK/preprod-base-$TS.sql.gz" ]     || fail "dump de sauvegarde vide"
tar -tzf "$BK/preprod-fichiers-$TS.tar.gz" >/dev/null || fail "archive de sauvegarde illisible"
zcat "$BK/preprod-base-$TS.sql.gz" | tail -2 | grep -q 'Dump completed' || fail "dump de sauvegarde incomplet"
log "sauvegarde OK : $(du -sh "$BK" | cut -f1) dans $BK"

# --- 2. Dump de la production (lecture seule, sans verrou) -----------------------------------
log "ETAPE 2 — dump de la production (les ventes ne sont pas bloquées)"
nice -n 19 "$MYSQLDUMP" --defaults-extra-file="$CNF_PROD" --single-transaction --quick --skip-lock-tables \
          --routines --triggers --events --no-tablespaces "$DB_PROD" | gzip > "$BK/prod-base-$TS.sql.gz"
[ -s "$BK/prod-base-$TS.sql.gz" ] || fail "dump de production vide"
zcat "$BK/prod-base-$TS.sql.gz" | tail -2 | grep -q 'Dump completed' || fail "dump de production incomplet"
DUMP_MO=$(( $(stat -c %s "$BK/prod-base-$TS.sql.gz") / 1024 / 1024 ))
[ "$DUMP_MO" -gt 50 ] || fail "dump de production suspect (${DUMP_MO} Mo)"
log "dump de production OK : ${DUMP_MO} Mo compressés"

# --- 3. Restauration de la base en préprod ---------------------------------------------------
log "ETAPE 3 — restauration dans la base de préprod"
if "$MYSQL" --defaults-extra-file="$CNF_PRE" -e "DROP DATABASE IF EXISTS \`$DB_PRE\`; CREATE DATABASE \`$DB_PRE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;" 2>/dev/null; then
  log "  base recréée (DROP/CREATE)"
else
  log "  DROP DATABASE non autorisé → suppression de toutes les tables en une seule passe"
  {
    echo "SET FOREIGN_KEY_CHECKS=0;"
    "$MYSQL" --defaults-extra-file="$CNF_PRE" -N -e 'SELECT CONCAT("DROP TABLE IF EXISTS `", table_name, "`;") FROM information_schema.tables WHERE table_schema=DATABASE()' "$DB_PRE"
    echo "SET FOREIGN_KEY_CHECKS=1;"
  } | "$MYSQL" --defaults-extra-file="$CNF_PRE" "$DB_PRE"
fi
zcat "$BK/prod-base-$TS.sql.gz" | "$MYSQL" --defaults-extra-file="$CNF_PRE" "$DB_PRE"
NB_T=$("$MYSQL" --defaults-extra-file="$CNF_PRE" -N -e 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE()' "$DB_PRE")
log "  tables restaurées : $NB_T"
[ "$NB_T" -gt 400 ] || fail "restauration incomplète ($NB_T tables)"

# --- 4. Fichiers : production → préprod (sans écraser l'identité de la préprod) --------------
log "ETAPE 4 — synchronisation des fichiers (rsync, sans --delete)"
rsync -a --stats \
  --exclude='app/config/parameters.php' \
  --exclude='.htaccess' \
  --exclude='var/cache/' \
  --exclude='themes/*/assets/cache/' \
  --exclude='var/logs/' \
  --exclude='*.log' \
  "$SHOP/" "$PRE/" | tail -6 | sed 's/^/  /'
md5sum "$SHOP/app/config/parameters.php" "$PRE/app/config/parameters.php" | sed 's/^/  /'
log "  parameters.php de la préprod préservé (md5 inchangé attendu)"

# --- 5. Remettre la préprod sur ses rails ----------------------------------------------------
log "ETAPE 5 — URL de boutique, ouverture, cache"
"$MYSQL" --defaults-extra-file="$CNF_PRE" "$DB_PRE" <<'SQL'
-- ⚠ BUG-008 (19/09/2026) : la version précédente ne posait que `domain`. Or avec PS_SSL_ENABLED=1,
-- PrestaShop construit ses URL sur `domain_ssl` et sur PS_SHOP_DOMAIN_SSL : la préprod REDIRIGEAIT
-- vers la production (301 vers www.the-replicant.com), elle était donc inutilisable — et l'étape 7,
-- qui suivait les redirections, mesurait en réalité la production en croyant mesurer la préprod.
UPDATE ps_shop_url SET domain='preprod.the-replicant.com', domain_ssl='preprod.the-replicant.com',
  physical_uri='/', virtual_uri='', main=1, active=1;
UPDATE ps_configuration SET value='preprod.the-replicant.com' WHERE name IN ('PS_SHOP_DOMAIN','PS_SHOP_DOMAIN_SSL');
UPDATE ps_configuration SET value=1 WHERE name='PS_SHOP_ENABLE';
DELETE FROM ps_configuration WHERE name='PS_MAINTENANCE_IP';
SQL
"$MYSQL" --defaults-extra-file="$CNF_PRE" -N -e "SELECT CONCAT('  url=',domain,' | ssl=',domain_ssl,' main=',main,' active=',active) FROM ps_shop_url" "$DB_PRE"
# Assertion (P132) : la préprod doit se déclarer ELLE-MÊME, domaine ET domaine SSL. Sans cette
# assertion, un domaine SSL oublié passe inaperçu et toute la boutique redirige vers la production.
URL_PRE=$("$MYSQL" --defaults-extra-file="$CNF_PRE" -N -e "SELECT CONCAT(domain,'|',domain_ssl) FROM ps_shop_url LIMIT 1" "$DB_PRE")
[ "$URL_PRE" = "preprod.the-replicant.com|preprod.the-replicant.com" ] \
  || fail "URL de préprod incorrecte ($URL_PRE) : domaine et domaine SSL doivent valoir preprod.the-replicant.com, sinon la préprod redirige vers la production (BUG-008)"
TH=$("$MYSQL" --defaults-extra-file="$CNF_PRE" -N -e 'SELECT theme_name FROM ps_shop WHERE id_shop=1' "$DB_PRE")
log "  thème actif : $TH"
# Preuves AUTHORITATIVES : lues en base, donc indépendantes de tout cache HTTP. Le 18/09/2026, la
# préprod a répondu un vrai page d'accueil en 200 alors que la base disait NULL (anomalie non
# expliquée) : sur cet hébergement, le contrôle HTTP seul n'est pas une preuve (voir BUG-006).
SHOP_ON=$("$MYSQL" --defaults-extra-file="$CNF_PRE" -N -e "SELECT value FROM ps_configuration WHERE name='PS_SHOP_ENABLE' LIMIT 1" "$DB_PRE")
log "  PS_SHOP_ENABLE = $SHOP_ON (1 attendu — la préprod doit être OUVERTE)"
[ "$SHOP_ON" = "1" ] || fail "PS_SHOP_ENABLE n'est pas à 1 ($SHOP_ON) : la préprod resterait en maintenance"
MAINT_LIGNES=$("$MYSQL" --defaults-extra-file="$CNF_PRE" -N -e "SELECT COUNT(*) FROM ps_configuration WHERE name='PS_MAINTENANCE_IP'" "$DB_PRE")
log "  PS_MAINTENANCE_IP : $MAINT_LIGNES ligne(s) (0 attendu)"
[ "$MAINT_LIGNES" = "0" ] || fail "PS_MAINTENANCE_IP subsiste en base ($MAINT_LIGNES ligne(s))"
# E-mails neutralisés : 3 = Mail::METHOD_DISABLE (« ne jamais envoyer d'e-mails »),
# valeur vérifiée dans classes/Mail.php du cœur (la préprod était déjà à 3 avant restauration).
"$MYSQL" --defaults-extra-file="$CNF_PRE" "$DB_PRE" -e "UPDATE ps_configuration SET value=3 WHERE name='PS_MAIL_METHOD'"
MAILM=$("$MYSQL" --defaults-extra-file="$CNF_PRE" -N -e "SELECT value FROM ps_configuration WHERE name='PS_MAIL_METHOD' LIMIT 1" "$DB_PRE")
log "  PS_MAIL_METHOD = $MAILM (3 attendu = envoi d'e-mails désactivé)"
[ "$MAILM" = "3" ] || fail "PS_MAIL_METHOD non neutralisé ($MAILM) : la préprod pourrait envoyer des e-mails"
rm -rf "$PRE"/var/cache/prod/* 2>/dev/null || true

# --- 6. Rien ne doit sortir de la préprod ----------------------------------------------------
log "ETAPE 6 — neutralisation des appels sortants"
"$MYSQL" --defaults-extra-file="$CNF_PRE" "$DB_PRE" <<'SQL'
UPDATE ps_module SET active=0 WHERE name IN (
 'amazon','cdiscount','temuconnector','temuconnect','colissimo','colissimo_essentiel','hc_fedex',
 'hc_retractation','packlink','naturabuy','MoneticoPaiement','alma','ps_checkout','ps_wirepayment',
 'sendinblue','ps_emailalerts','ps_facebook','m2emultichannelconnect','storecommander','blockoss',
 'medgtranslate','certishoppingsocialreviews','gamification','ps_reminder','popupguest',
 'blockproductsbycountry','la_customproduct');
SQL
NB_ON=$("$MYSQL" --defaults-extra-file="$CNF_PRE" -N -e 'SELECT COUNT(*) FROM ps_module WHERE active=1' "$DB_PRE")
log "  modules encore actifs : $NB_ON (attendu : environ 77 — les modules de production sont inactifs)"

# Tâche cron qui vise la préprod : neutralisée, avec sauvegarde et vérification stricte
# ⚠ BUG-007 (18/09/2026) : la version précédente faisait `crontab -l | sed … | crontab -`. Les deux
# commandes `crontab` tournent CONCURREMMENT dans le même tube : celle qui installe a supprimé le fichier
# de crontab AVANT que celle qui lit ne le lise. Résultat mesuré : la crontab du serveur (91 lignes, dont
# 51 visant la PRODUCTION) a été effacée — les tâches planifiées de la boutique se sont arrêtées.
# RÈGLE : on ne met JAMAIS `crontab -` (lecture sur l'entrée standard) dans un tube avec `crontab -l`.
# On passe par un FICHIER, et on refuse d'installer une crontab vide.
CRON_AVANT=$(crontab -l 2>/dev/null | grep -vc '^#')
crontab -l > "$BK/crontab-avant-$TS.txt" 2>/dev/null || true
[ -s "$BK/crontab-avant-$TS.txt" ] || fail "crontab : sauvegarde vide — aucune modification tentée (protection BUG-007)"
CRON_TMP="$(mktemp)"
if crontab -l 2>/dev/null | grep -q 'preprod\.the-replicant\.com'; then
  crontab -l 2>/dev/null > "$CRON_TMP"
  NB_CIBLES=$(grep -c '^[^#].*preprod\.the-replicant\.com' "$CRON_TMP" || true)
  sed -i 's|^\([^#].*preprod\.the-replicant\.com.*\)$|#DESACTIVE-REFONTE-THEME \1|' "$CRON_TMP"
  [ -s "$CRON_TMP" ] || { rm -f "$CRON_TMP"; fail "crontab : fichier de travail vide — aucune modification"; }
  [ "$(wc -l < "$CRON_TMP")" -ge "$(wc -l < "$BK/crontab-avant-$TS.txt")" ] || { rm -f "$CRON_TMP"; fail "crontab : le fichier de travail a perdu des lignes — aucune modification"; }
  crontab "$CRON_TMP"
  CRON_APRES=$(crontab -l 2>/dev/null | grep -vc '^#')
  if [ "$CRON_APRES" -eq $((CRON_AVANT - NB_CIBLES)) ]; then
    log "  crontab : $NB_CIBLES tâche(s) visant la préprod neutralisée(s) (sauvegarde : $BK/crontab-avant-$TS.txt)"
  else
    crontab "$BK/crontab-avant-$TS.txt"
    rm -f "$CRON_TMP"
    fail "crontab : modification non conforme ($CRON_AVANT → $CRON_APRES, $NB_CIBLES cible(s) attendue(s)) — crontab d'origine restaurée"
  fi
  rm -f "$CRON_TMP"
else
  log "  crontab : aucune tâche ne vise la préprod"
fi

# --- 7. Contrôles finaux ---------------------------------------------------------------------
# Contrôles finaux ASSERTIFS (P132). Piège mesuré le 18/09/2026 : un cache-buster « ?v=… » sur la
# préprod renvoie 172 o de « This page has moved » en HTTP 200 — un vert parfait pour une page vide.
# On mesure donc l'URL RÉELLE, et on exige une VRAIE page : taille plancher + aucun marqueur suspect.
log "ETAPE 7 — contrôles finaux (assertions — P132)"
PAGE_PRE="$BK/page-preprod-$TS.html"
HTTP_PRE=000; PAGE_SIZE=0
for i in 1 2 3 4 5; do
  HTTP_PRE=$(curl -s -o "$PAGE_PRE" -w '%{http_code}' -L --max-time 60 https://preprod.the-replicant.com/ || echo 000)
  PAGE_SIZE=$(stat -c %s "$PAGE_PRE" 2>/dev/null || echo 0)
  [ "$HTTP_PRE" = "200" ] && [ "$PAGE_SIZE" -gt 50000 ] && break
  log "  préprod HTTP $HTTP_PRE / ${PAGE_SIZE} o (tentative $i/5) — cache en reconstruction ?"
  sleep 10
done
HTTP_PROD=$(curl -s -o /dev/null -w '%{http_code}' -L --max-time 60 https://www.the-replicant.com/ || echo 000)
log "  HTTP préprod = $HTTP_PRE (page de ${PAGE_SIZE} o, conservée : $PAGE_PRE)"
log "  HTTP prod    = $HTTP_PROD (la production n'est jamais écrite)"
# ⚠ BUG-008 : `curl -L` suit les redirections — un contrôle qui suit une redirection vers la
# production mesure la production. On exige donc que la page servie se DÉCLARE préproduction.
CANON_PRE=$(grep -o -m1 'rel="canonical" href="[^"]*"' "$PAGE_PRE" 2>/dev/null | sed 's/.*href="//; s/"$//')
[ "$CANON_PRE" = "https://preprod.the-replicant.com/" ] \
  || fail "la préproduction ne se déclare pas elle-même (canonical=$CANON_PRE) : elle redirige vers une autre boutique (BUG-008)"
# La préprod sert le contenu de la production : elle ne doit JAMAIS être indexable.
NOINX_PRE=$(curl -s -o /dev/null -D - --max-time 30 https://preprod.the-replicant.com/ | grep -ci '^x-robots-tag: noindex')
[ "$NOINX_PRE" -ge 1 ] || fail "la préproduction n'est pas en noindex : elle peut être indexée par les moteurs avec le contenu de la production"
NOINX_PROD=$(curl -s -o /dev/null -D - --max-time 30 https://www.the-replicant.com/ | grep -ci '^x-robots-tag')
[ "$NOINX_PROD" -eq 0 ] || fail "la PRODUCTION est en noindex — incident SEO majeur, à corriger immédiatement"
log "  assertion : la préprod se déclare elle-même, elle est en noindex, la production ne l'est pas"
if grep -q 'maintenance-page' "$PAGE_PRE" 2>/dev/null; then
  fail "la préproduction sert encore la page de maintenance (PS_SHOP_ENABLE non appliqué ?)"
fi
if grep -q 'This page has moved' "$PAGE_PRE" 2>/dev/null; then
  fail "la préproduction renvoie une redirection au lieu de la boutique (configuration d'URL à revoir)"
fi
[ "$HTTP_PRE" = "200" ] || fail "préproduction non joignable après restauration (HTTP $HTTP_PRE)"
[ "$PAGE_SIZE" -gt 50000 ] || fail "page de préprod suspecte (${PAGE_SIZE} o) : ni boutique, ni maintenance — voir $PAGE_PRE"
[ "$HTTP_PROD" = "200" ] || fail "production non joignable (HTTP $HTTP_PROD) — à vérifier immédiatement"
log "  assertion : les deux boutiques servent bien leur page réelle (ni maintenance, ni redirection)"
log "  rappel à faire dans le back-office de la préprod :"
log "    - Paramètres avancés > E-mail : « Ne jamais envoyer d'e-mails » (vérifié en base ci-dessus)"
log "    - commenter la ligne de crontab qui vise preprod.the-replicant.com (colissimo_essentiel)"
rm -f "$CNF_PRE" "$CNF_PROD"
log "identifiants temporaires supprimés"
echo "RESULTAT: OK — sauvegarde et dump dans $BK"
REMOTE
)

# --------------------------------------------------------------------------------------------
# Exécution locale
# --------------------------------------------------------------------------------------------
{
  echo "=== Remise à niveau préprod — mode=$MODE — $(date '+%Y-%m-%d %H:%M:%S') ==="
  echo "hôte: $SSH_TARGET"
  # Priorité CPU minimale (nice 19), héritée par toutes les étapes distantes. Les E/S restent en
  # priorité normale : la classe « idle » a été mesurée ~10x trop lente le 18/09/2026 (BUG-004).
  # ServerAliveCountMax 20 : 10 minutes de coupure réseau tolérées plutôt qu'une restauration
  # interrompue à mi-chemin.
  ssh -i "$SSH_KEY" -o BatchMode=yes -o ConnectTimeout=30 \
      -o ServerAliveInterval=30 -o ServerAliveCountMax=20 -o TCPKeepAlive=yes \
      "$SSH_TARGET" \
      'nice -n 19 bash -s -- '"$TS $MODE" <<<"$REMOTE_SCRIPT"
  echo "=== terminé le $(date '+%Y-%m-%d %H:%M:%S') ==="

  # --- 8. Contrôle EXTERNE : la préprod vue du dehors ---------------------------------------
  # ⚠ Le contrôle final du script distant s'exécute SUR le serveur, dont l'adresse figure dans
  # PS_MAINTENANCE_IP : il contourne donc la maintenance et ne peut PAS dire si la boutique est
  # ouverte aux clients (mesuré le 18/09/2026 — voir BUG-006). Seul un appel depuis une adresse
  # non exemptée, comme ce VPS, répond à la question. La réponse est aussi ASSERTIVE.
  if [ "$MODE" = "run" ]; then
    PAGE_EXT="/tmp/preprod-externe-$$.html"
    CODE_EXT=$(curl -s -o "$PAGE_EXT" -w '%{http_code}' -L --max-time 60 https://preprod.the-replicant.com/ || echo 000)
    TAILLE_EXT=$(stat -c %s "$PAGE_EXT" 2>/dev/null || echo 0)
    echo "--- contrôle externe (depuis $(hostname), adresse non exemptée de maintenance) ---"
    echo "  préprod vue de l'extérieur : HTTP $CODE_EXT, ${TAILLE_EXT} o"
    if [ "$CODE_EXT" = "200" ] && [ "$TAILLE_EXT" -gt 50000 ] && ! grep -q 'maintenance-page' "$PAGE_EXT"; then
      echo "  OK : la préproduction est ouverte et sert sa vraie page au monde extérieur"
    else
      echo "  ATTENTION : la préproduction n'est PAS servie normalement de l'extérieur"
      echo "              (HTTP $CODE_EXT, ${TAILLE_EXT} o) — page conservée : $PAGE_EXT"
    fi
  fi
} 2>&1 | tee -a "$LOG"

# Le verdict doit être prononcé HORS du bloc : un `exit` dans un pipeline ne quitte que le
# sous-shell, et le script se terminerait en 0 malgré l'échec (piège du 18/09/2026).
if [ "$MODE" = "run" ] && grep -q "n'est PAS servie normalement de l'extérieur" "$LOG" 2>/dev/null; then
  echo "VERDICT : la préproduction n'est pas joignable normalement depuis l'extérieur — à vérifier."
  exit 4
fi

echo "Journal complet : $LOG"
