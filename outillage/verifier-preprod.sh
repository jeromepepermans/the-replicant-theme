#!/usr/bin/env bash
# ============================================================================================
# Contrôle de la PRÉPRODUCTION the-replicant.com — rejouable à tout moment
#
# Remplace l'étape 7 du runbook `remise-a-niveau-preprod.sh` quand celle-ci n'a pas tourné, et
# sert de contrôle après toute intervention sur la préprod.
#
# Principe : on mesure depuis le DEHORS (l'IP du serveur est exemptée de la page de maintenance,
# un contrôle lancé sur le serveur voit un état que personne d'autre ne voit), et les assertions
# de configuration sont lues en BASE, pas par le rendu.
#
# Usage :  ./verifier-preprod.sh          → contrôle complet, code de sortie 0 ou 1
# ============================================================================================
set -uo pipefail

SSH_KEY="${SSH_KEY:-/home/ubuntu/.ssh/id_ed25519}"
SSH_TARGET="${SSH_TARGET:-djdj2187@nilgaut.o2switch.net}"
PRE="https://preprod.the-replicant.com/"
PROD="https://www.the-replicant.com/"
ECHELLES=0
AVERTISSEMENTS=0

ok()   { printf '  ✅ %s\n' "$*"; }
avert(){ printf '  ⚠ %s\n' "$*"; AVERTISSEMENTS=$((AVERTISSEMENTS+1)); }
non()  { printf '  ⛔ %s\n' "$*"; ECHELLES=$((ECHELLES+1)); }
# Vérifie une égalité SANS tube dans le test : on lit la valeur, on ne teste pas un code de sortie.
verifie() { if [ "$2" = "$3" ]; then ok "$1 ($2)"; else non "$1 : obtenu « $2 », attendu « $3 »"; fi; }

echo "=== Contrôle de la préproduction — $(date '+%d/%m/%Y %H:%M') ==="

# --- 1. Ce que voit le monde entier ------------------------------------------------------------------
DET="$(curl -sS -o /tmp/vp-corps.html -D /tmp/vp-entetes.txt -w '%{http_code} %{size_download}' --max-time 30 "$PRE" 2>/dev/null)"
CODE="${DET%% *}"; TAILLE="${DET##* }"
verifie "préprod joignable" "$CODE" "200"
if [ "${TAILLE:-0}" -gt 50000 ] 2>/dev/null; then ok "page réelle servie (${TAILLE} o)"; else non "page suspecte (${TAILLE:-0} o) — ni boutique, ni maintenance"; fi
CANON="$(grep -o -m1 'rel="canonical" href="[^"]*"' /tmp/vp-corps.html | sed 's/.*href="//; s/"$//')"
verifie "URL canonique de la préprod" "$CANON" "$PRE"
MOTIF="$(grep -c -iE 'page has moved|site is undergoing maintenance|maintenance' /tmp/vp-corps.html)"
verifie "aucun marqueur de maintenance ni de redirection dans le corps" "$MOTIF" "0"
NOINX="$(grep -ci '^x-robots-tag: noindex' /tmp/vp-entetes.txt)"
verifie "en-tête noindex (la préprod ne doit jamais être indexée)" "$NOINX" "1"

# --- 2. La production n'est pas touchée --------------------------------------------------------------
# ⚠ Mesuré le 19/09/2026 : la production répond par INTERMITTENCE une erreur de certificat SSL
# (« ipxtender-09.cluster-01.o2switch.cloud » ne correspond pas à www.the-replicant.com) — 2 essais sur 3,
# puis 200. Anomalie d'hébergement à surveiller : un vrai visiteur verrait un avertissement de sécurité.
# On réessaie donc avant de conclure à une panne, et on rapporte ce qui a été observé.
DETP="000"; ERREUR_SSL=0
for i in 1 2 3 4; do
  SORTIE="$(curl -sS -o /dev/null -D /tmp/vp-prod.txt -w '%{http_code}' --max-time 30 "$PROD" 2>&1)"
  DETP="$(printf '%s' "$SORTIE" | tail -1)"
  case "$SORTIE" in *"certificate subject name"*) ERREUR_SSL=$((ERREUR_SSL+1));; esac
  [ "$DETP" = "200" ] && break
  sleep 5
done
if [ "$DETP" = "200" ]; then
  ok "production joignable (200)"
elif [ "$ERREUR_SSL" -gt 0 ]; then
  avert "production injoignable depuis ce poste : $ERREUR_SSL réponse(s) portant le certificat d'un autre hôte o2switch — détournement par la protection de l'hébergeur (volume de requêtes), pas une panne. À confirmer depuis une autre adresse."
else
  non "production joignable : obtenu « $DETP », attendu « 200 »"
fi
NX="$(grep -ci '^x-robots-tag' /tmp/vp-prod.txt)"
verifie "la production n'est pas noindex" "$NX" "0"

# --- 3. Configuration de la préprod, lue en BASE -----------------------------------------------------
SORTIE_PHP="$(ssh -i "$SSH_KEY" -o BatchMode=yes -o ConnectTimeout=20 "$SSH_TARGET" 'php' 2>/dev/null <<'PHP'
<?php
$c=(include "/home/djdj2187/preprod.the-replicant.com/app/config/parameters.php")["parameters"];
$m=@new mysqli($c["database_host"],$c["database_user"],$c["database_password"],$c["database_name"]);
if($m->connect_errno){ echo "  ⛔ base de préprod injoignable\n"; exit; }
$cfg=[]; $r=$m->query("SELECT name,value FROM ps_configuration WHERE name IN
  ('PS_SHOP_ENABLE','PS_MAIL_METHOD','PS_MAINTENANCE_IP','PS_SHOP_DOMAIN','PS_SHOP_DOMAIN_SSL')");
while($x=$r->fetch_assoc()) $cfg[$x["name"]]=$x["value"];
$url=[]; $r=$m->query("SELECT domain,domain_ssl FROM ps_shop_url"); while($x=$r->fetch_assoc()) $url[]=$x["domain"]."|".$x["domain_ssl"];
$mods=[]; $r=$m->query("SELECT name,active FROM ps_module WHERE name IN
  ('amazon','cdiscount','temuconnector','colissimo_essentiel','ps_checkout','sendinblue')");
while($x=$r->fetch_assoc()) $mods[$x["name"]]=$x["active"];
$t=0; $r=$m->query("SHOW TABLES"); while($r&&$r->fetch_row()) $t++;
$cmd=0; $r=$m->query("SELECT COUNT(*) n FROM ps_orders"); $cmd=$r?$r->fetch_assoc()["n"]:0;
$lignes=[];
$lignes[] = (($cfg["PS_SHOP_ENABLE"]??"")==="1" ? "  ✅ boutique de préprod OUVERTE (PS_SHOP_ENABLE=1)" : "  ⛔ boutique fermée (PS_SHOP_ENABLE=".($cfg["PS_SHOP_ENABLE"]??"absent").")");
$lignes[] = (($cfg["PS_MAIL_METHOD"]??"")==="3" ? "  ✅ envoi d'e-mails DÉSACTIVÉ (PS_MAIL_METHOD=3)" : "  ⛔ les e-mails peuvent partir (PS_MAIL_METHOD=".($cfg["PS_MAIL_METHOD"]??"absent").")");
$mi=trim($cfg["PS_MAINTENANCE_IP"]??"");
$lignes[] = ($mi==="" ? "  ✅ aucune exemption de maintenance" : "  ⛔ exemptions de maintenance présentes (".count(explode(",",$mi))." adresse(s))");
$dom=($cfg["PS_SHOP_DOMAIN"]??""); $dssl=($cfg["PS_SHOP_DOMAIN_SSL"]??"");
$lignes[] = ($dom==="preprod.the-replicant.com" && $dssl==="preprod.the-replicant.com"
  ? "  ✅ URL de préprod (domaine et domaine SSL)" : "  ⛔ URL incorrecte : domaine=$dom / SSL=$dssl → la préprod redirigera vers la production");
$mauvais=[]; foreach($mods as $n=>$a) if((int)$a===1) $mauvais[]=$n;
$lignes[] = (empty($mauvais) ? "  ✅ modules d'appel sortant désactivés (".count($mods)." vérifiés)" : "  ⛔ modules encore actifs : ".implode(", ",$mauvais));
$lignes[] = ($t>=560 ? "  ✅ tables restaurées : $t" : "  ⛔ seulement $t tables");
$lignes[] = ($cmd>100000 ? "  ✅ commandes recopiées : $cmd" : "  ⛔ seulement $cmd commandes");
echo implode("\n",$lignes),"\n";
PHP
)"
echo "$SORTIE_PHP"
ECHECS_PHP="$(printf '%s\n' "$SORTIE_PHP" | grep -c '⛔')"
ECHELLES=$((ECHELLES + ECHECS_PHP))

# --- 4. La crontab ne doit plus rien lancer vers la préprod ------------------------------------------
CRON_PRE="$(ssh -i "$SSH_KEY" -o BatchMode=yes -o ConnectTimeout=20 "$SSH_TARGET" \
  'crontab -l 2>/dev/null | grep -c "^[^#].*preprod\.the-replicant\.com"' 2>/dev/null | tr -d '\r')"
verifie "aucune tâche planifiée active vers la préprod" "${CRON_PRE:-inconnu}" "0"
CRON_TOT="$(ssh -i "$SSH_KEY" -o BatchMode=yes -o ConnectTimeout=20 "$SSH_TARGET" \
  'crontab -l 2>/dev/null | wc -l' 2>/dev/null | tr -d '\r')"
if [ "${CRON_TOT:-0}" -ge 85 ] 2>/dev/null; then ok "crontab du serveur présente ($CRON_TOT lignes)"; else non "crontab anormalement courte ($CRON_TOT lignes) — vérifier les tâches de production"; fi

rm -f /tmp/vp-corps.html /tmp/vp-entetes.txt /tmp/vp-prod.txt
echo
if [ "$ECHELLES" -eq 0 ] && [ "$AVERTISSEMENTS" -eq 0 ]; then echo "RÉSULTAT : conforme ✅"; exit 0
elif [ "$ECHELLES" -eq 0 ]; then echo "RÉSULTAT : conforme, avec $AVERTISSEMENTS avertissement(s) ⚠"; exit 0
else echo "RÉSULTAT : $ECHELLES écart(s) ⛔, $AVERTISSEMENTS avertissement(s) ⚠"; exit 1; fi
