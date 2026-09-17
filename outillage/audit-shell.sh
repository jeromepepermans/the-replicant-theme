#!/usr/bin/env bash
# Audit LECTURE SEULE côté disque — phase 0 du chantier thème the-replicant.com
# À exécuter sur o2switch (compte nilgaut). Aucune écriture, aucune suppression.
# Les secrets éventuels présents dans les URL de crontab sont masqués avant affichage.

SHOP="${1:-/home/djdj2187/the-replicant.com}"
PREPROD="/home/djdj2187/preprod.the-replicant.com"

echo "### SYSTÈME"
date -Is
hostname
php -v | head -1
echo -n "disque : "; df -h /home/djdj2187 | tail -1
echo -n "inodes : "; df -i /home/djdj2187 | tail -1
echo "HOME=$(pwd)"

echo
echo "### ARBORESCENCES"
ls -ld "$SHOP" "$PREPROD" 2>/dev/null
echo "--- paramètres (nom de base seulement, pas de credentials) ---"
for d in "$SHOP" "$PREPROD"; do
  f="$d/app/config/parameters.php"
  if [ -r "$f" ]; then
    printf '%s -> ' "$d"
    php -r '$p=include $argv[1];$c=$p["parameters"];echo "base=".$c["database_name"]." host=".$c["database_host"]." user_len=".strlen($c["database_user"])." pwd_len=".strlen($c["database_password"]).PHP_EOL;' "$f" 2>/dev/null || echo "illisible"
  else
    echo "$d -> parameters.php absent ou illisible"
  fi
done

echo
echo "### THEMES SUR DISQUE (taille = poids réellement servi)"
for d in "$SHOP" "$PREPROD"; do
  echo "--- $d/themes ---"
  ls -ld "$d"/themes/*/ 2>/dev/null | awk '{print "  "$5" o  "$6" "$7" "$8"  "$9}'
  for t in "$d"/themes/*/; do
    [ -f "$t/config/theme.yml" ] && printf '  %s -> theme.yml : %s\n' "$(basename $t)" "$(grep -m1 -E '^ *name:' "$t/config/theme.yml" | tr -s ' ')"
    [ -f "$t/config.xml" ] && printf '  %s -> config.xml : %s\n' "$(basename $t)" "$(grep -m1 -oE '<version><!\[CDATA\[[^]]*' "$t/config.xml" | sed 's/.*\[//')"
  done
done

echo
echo "### TAILLE DU THEME EN PRODUCTION ET DE SES CACHES"
du -sh "$SHOP"/themes/*/ 2>/dev/null
ls -la "$SHOP"/themes/*/assets/cache/ 2>/dev/null | head -20
echo -n "nb de fichiers du thème prod : "; find "$SHOP"/themes/warehouse -type f 2>/dev/null | wc -l

echo
echo "### OVERRIDES (ne jamais modifier le core ; mesurer ce qui est déjà surchargé)"
ls -la "$SHOP"/override/ 2>/dev/null
find "$SHOP"/override -type f -name '*.php' 2>/dev/null | head -30
echo -n "nb de fichiers override : "; find "$SHOP"/override -type f -name '*.php' 2>/dev/null | wc -l
echo "--- modules livrés avec le thème (themes/<theme>/modules) ---"
ls "$SHOP"/themes/*/modules/ 2>/dev/null | head -30

echo
echo "### MODULES SUR DISQUE (dossiers) vs EN BASE"
echo -n "dossiers modules prod : "; ls -d "$SHOP"/modules/*/ 2>/dev/null | wc -l
echo -n "dossiers modules préprod : "; ls -d "$PREPROD"/modules/*/ 2>/dev/null | wc -l

echo
echo "### CRONTAB (secrets masqués)"
crontab -l 2>/dev/null | sed -E 's/(token|key|password|pwd|secret)=[^&"'"'"' ]*/\1=***MASKED***/gi' | sed -E 's/(--token|--password) [^ ]*/\1 ***MASKED***/gi'
echo -n "nb de tâches cron : "; crontab -l 2>/dev/null | grep -vc '^#'

echo
echo "### SAUVEGARDES ET LOGS"
ls -ld "$SHOP"/backup* "$SHOP"/admin*/backups 2>/dev/null | head
find /home/djdj2187 -maxdepth 2 -type d -iname '*backup*' 2>/dev/null | head
echo "--- taille des logs du compte (top 10) ---"
du -sh "$SHOP"/var/logs 2>/dev/null
find /home/djdj2187 -maxdepth 3 -type f -name '*.log' -size +1M 2>/dev/null | head -10 | while read f; do du -sh "$f"; done

echo
echo "### CACHE SERVEUR"
ls -la "$SHOP"/var/cache/ 2>/dev/null | head -8
ls -la "$SHOP"/app/config/ 2>/dev/null | head -8
ls -la /home/djdj2187/.litespeed* /home/djdj2187/lscache* 2>/dev/null | head -5

echo
echo "### PHP ET OUTILS UTILES"
which composer node npm wp php 2>/dev/null
php -m 2>/dev/null | tr '\n' ' ' | head -c 600; echo

echo
echo "== FIN AUDIT SHELL =="
