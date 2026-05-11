#!/bin/sh
set -e

cd /var/www/html

# Generate app key if not set
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

# Cache config and routes for production
php artisan config:cache
php artisan route:cache

# Run migrations
php artisan migrate --force

# Start php-fpm in background then nginx in foreground
php-fpm -D
nginx -g 'daemon off;'
