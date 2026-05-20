#!/bin/bash

# FasoCare Database Backup Script
# Runs daily via cron

set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="fasocare_db_${DATE}.sql"

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Perform backup using docker exec (since DB is in a container)
echo "Starting backup at $(date)"
docker exec -e PGPASSWORD=${POSTGRES_PASSWORD} postgres pg_dump \
    -U ${POSTGRES_USER} \
    -d ${POSTGRES_DB} \
    -F p > ${BACKUP_DIR}/${BACKUP_FILE}

# Compress backup
gzip ${BACKUP_DIR}/${BACKUP_FILE}

# Remove backups older than 30 days
find ${BACKUP_DIR} -name "fasocare_db_*.sql.gz" -mtime +30 -delete

# Keep only last 7 daily backups
ls -tp ${BACKUP_DIR}/fasocare_db_*.sql.gz | grep -v '/$' | tail -n +8 | xargs -I {} rm -- {}

echo "Backup completed: ${BACKUP_FILE}.gz"

# Optional: Upload to S3 (uncomment if configured)
# aws s3 cp ${BACKUP_DIR}/${BACKUP_FILE}.gz s3://fasocare-backups/
