# Build stage - Install PHP dependencies
FROM composer:2 AS composer

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --ignore-platform-reqs

COPY . .

RUN composer dump-autoload --optimize --no-dev

# Production stage
FROM php:8.2-fpm-alpine

# Install system dependencies and PHP extensions
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    oniguruma-dev \
    sqlite-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_mysql \
        pdo_sqlite \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
        opcache \
    && rm -rf /var/cache/apk/*

# Configure PHP
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Configure OPcache for production
RUN echo 'opcache.memory_consumption=128' >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo 'opcache.interned_strings_buffer=8' >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo 'opcache.max_accelerated_files=4000' >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo 'opcache.validate_timestamps=0' >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo 'opcache.enable_cli=1' >> /usr/local/etc/php/conf.d/opcache.ini

WORKDIR /var/www/html

# Copy application files
COPY --from=composer /app/vendor ./vendor
COPY . .

# Create required directories and set permissions
RUN mkdir -p storage/framework/{cache,sessions,views} \
    storage/logs \
    bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Copy supervisor config
COPY docker/supervisord.conf /etc/supervisord.conf

# Copy and set permissions for startup script
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

# Create SQLite database if using SQLite
RUN touch database/database.sqlite \
    && chown www-data:www-data database/database.sqlite \
    && chmod 775 database/database.sqlite

EXPOSE 8080

CMD ["/start.sh"]
