#!/bin/sh
set -e

echo "Starting Laravel application..."

# Create storage directories if they don't exist
mkdir -p storage/framework/{cache,sessions,views}
mkdir -p storage/logs
mkdir -p bootstrap/cache

# Set permissions
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Create SQLite database if it doesn't exist and DB_CONNECTION is sqlite
if [ "$DB_CONNECTION" = "sqlite" ] || [ -z "$DB_CONNECTION" ]; then
    if [ ! -f database/database.sqlite ]; then
        touch database/database.sqlite
        chown www-data:www-data database/database.sqlite
        chmod 775 database/database.sqlite
    fi
fi

# Cache configuration for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force

# Create supervisor log directory
mkdir -p /var/log/supervisor

echo "Application started successfully!"

# Start supervisor (which manages nginx and php-fpm)
exec /usr/bin/supervisord -c /etc/supervisord.conf
