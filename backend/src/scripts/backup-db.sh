#!/bin/bash
# Script de Backup PostgreSQL pour FasoCare
# A exécuter via cronjob quotidien (ex: 0 2 * * * /path/to/backup-db.sh)

set -e

# Configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_DATABASE:-fasocare_db}
DB_USER=${DB_USERNAME:-postgres}
BACKUP_DIR=${BACKUP_DIR:-"/var/backups/fasocare"}
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/$DB_NAME-$DATE.sql.gz"

# Création du dossier si inexistant
mkdir -p "$BACKUP_DIR"

echo "[$(date)] Début de la sauvegarde de $DB_NAME..."

# Exécution pg_dump compressé
PGPASSWORD=${DB_PASSWORD} pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

echo "[$(date)] Sauvegarde terminée : $BACKUP_FILE"

# Rotation (Garder les 7 derniers jours uniquement)
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -exec rm {} \;
echo "[$(date)] Rotation terminée. Fichiers plus vieux que 7 jours supprimés."
