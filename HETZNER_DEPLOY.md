# 🚀 Guide Complet - Déploiement sur Hetzner Cloud

## 📋 Prérequis

1. **Compte Hetzner Cloud** ([https://www.hetzner.com/cloud](https://www.hetzner.com/cloud))
2. **Clé SSH** (pour accès sécurisé)
3. **Domain name** (optionnel pour Now)
4. **Git** configuré sur votre machine

---

## 📦 Étape 1: Créer le VPS Hetzner

### 1.1 Créer une nouvelle instance

1. Accédez à **Hetzner Cloud Console** → **Projects**
2. Cliquez sur **Create Server**
3. Configurez:
   - **Location**: Falkenstein (recommandé pour l'Europe)
   - **OS Image**: Ubuntu 24.04 LTS
   - **Server Type**: CPX11 (2 vCPU, 2GB RAM) - ~€4/mois
   - **SSH Key**: Ajoutez votre clé SSH publique
   - **Name**: `immo-app-prod`

### 1.2 Récupérez l'IP publique

**Votre IP publique**: `188.245.177.186`

---

## 🔐 Étape 2: Configuration Initiale du Serveur

### 2.1 Connectez-vous au serveur

```bash
ssh root@188.245.177.186
```

### 2.2 Mises à jour système

```bash
apt update && apt upgrade -y
apt install -y curl wget git build-essential
```

### 2.3 Installer Node.js 20 LTS

```bash
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs
node --version  # Vérifier
npm --version
```

### 2.4 Installer Docker & Docker Compose

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
docker --version

# Docker Compose
apt install -y docker-compose
docker-compose --version
```

### 2.5 Installer PM2 (gestionnaire de processus)

```bash
npm install -g pm2
pm2 startup
pm2 save
```

### 2.6 Configurer le Firewall

```bash
apt install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw allow 5432/tcp    # PostgreSQL (local seulement)
ufw enable
ufw status
```

---

## 🗄️ Étape 3: Setup PostgreSQL

### 3.1 Installer PostgreSQL

```bash
apt install -y postgresql postgresql-contrib
systemctl restart postgresql
```

### 3.2 Créer la base de données

```bash
sudo -u postgres psql << EOF
CREATE USER immo_user WITH PASSWORD 'VOTRE_MOT_DE_PASSE_SECURISE';
CREATE DATABASE immo_db OWNER immo_user;
ALTER DATABASE immo_db SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE immo_db TO immo_user;
EOF
```

### 3.3 Vérifier la connexion

```bash
psql -h localhost -U immo_user -d immo_db -c "SELECT version();"
```

**DATABASE_URL à copier**:
```
postgresql://immo_user:VOTRE_MOT_DE_PASSE_SECURISE@localhost:5432/immo_db
```

---

## 📂 Étape 4: Préparer le Projet

### 4.1 Créer structure de répertoires

```bash
mkdir -p /app/immo
cd /app/immo
```

### 4.2 Cloner le repository

```bash
git clone https://github.com/VOTRE_USERNAME/votre-repo.git .
git checkout main
```

### 4.3 Créer fichiers .env

**Backend** (`backend/.env`):
```env
# Database
DATABASE_URL="postgresql://immo_user:VOTRE_MOT_DE_PASSE_SECURISE@localhost:5432/immo_db"
NODE_ENV=production
PORT=4000

# JWT
JWT_SECRET="Q9xR7mK2pL8vN3sH6tF1wB4cD5eJ0gY9zU2mN5pR8s="

# Frontend
FRONTEND_URL="https://votre-domain.com"

# Email (optionnel)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="votre-email@gmail.com"
SMTP_PASS="votre-app-password"
SMTP_FROM="noreply@immo-app.com"
```

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL="https://api.votre-domain.com"
```

---

## 🔨 Étape 5: Build & Deploy Backend

### 5.1 Installer dépendances backendet build

```bash
cd /app/immo/backend
npm install --production=false
npm run build
```

### 5.2 Prisma database sync

```bash
npx prisma generate
npx prisma db push
npx prisma db seed  # Si vous avez un seed
```

### 5.3 Démarrer le backend avec PM2

```bash
pm2 start dist/src/main.js --name "immo-backend" --env production
pm2 save
```

### 5.4 Vérifier le backend

```bash
pm2 logs immo-backend
# Devrait afficher: "Application is running on: http://0.0.0.0:4000"
```

---

## 🎨 Étape 6: Build & Deploy Frontend

### 6.1 Builder le frontend

```bash
cd /app/immo
npm install --production=false
npm run build
```

### 6.2 Démarrer le frontend avec PM2

```bash
pm2 start npm --name "immo-frontend" -- start
pm2 save
```

### 6.3 Vérifier le frontend

```bash
pm2 logs immo-frontend
# Devrait afficher: "Ready on http://0.0.0.0:3000"
```

---

## 🌐 Étape 7: Configuration Nginx (Reverse Proxy)

### 7.1 Installer Nginx

```bash
apt install -y nginx
```

### 7.2 Créer config Nginx

```bash
cat > /etc/nginx/sites-available/immo-app << 'EOF'
# Redirection HTTP → HTTPS
server {
    listen 80;
    server_name votre-domain.com www.votre-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS - Frontend
server {
    listen 443 ssl http2;
    server_name votre-domain.com www.votre-domain.com;

    # SSL Certificates (sera généré avec Certbot)
    ssl_certificate /etc/letsencrypt/live/votre-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTPS - Backend API
server {
    listen 443 ssl http2;
    server_name api.votre-domain.com;

    ssl_certificate /etc/letsencrypt/live/votre-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Backend
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_request_buffering off;
    }
}
EOF
```

### 7.3 Activer la config

```bash
ln -s /etc/nginx/sites-available/immo-app /etc/nginx/sites-enabled/
nginx -t  # Vérifier syntaxe
systemctl restart nginx
```

---

## 🔒 Étape 8: SSL/TLS avec Certbot

### 8.1 Installer Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### 8.2 Générer certificats SSL

```bash
# Remplacez par votre domaine
certbot certonly --standalone -d votre-domain.com -d www.votre-domain.com -d api.votre-domain.com
```

### 8.3 Auto-renouvellement

```bash
systemctl enable certbot.timer
systemctl start certbot.timer
certbot renew --dry-run
```

---

## 📊 Étape 9: Monitoring & Logs

### 9.1 Vérifier status des services

```bash
# Backend
pm2 status

# Nginx
systemctl status nginx

# PostgreSQL
systemctl status postgresql

# Logs en temps réel
pm2 logs immo-backend
pm2 logs immo-frontend
```

### 9.2 Installer PM2 Monitor (optionnel)

```bash
pm2 web  # Accédez à http://localhost:9615
```

---

## 🔄 Étape 10: CI/CD - Mises à Jour Automatiques

### 10.1 Script de déploiement

Créez `/app/immo/deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Déploiement ImmoSénégal..."

cd /app/immo

# Pull les derniers changements
echo "📦 Pulling latest changes..."
git fetch origin
git reset --hard origin/main

# Backend
echo "🔧 Building Backend..."
cd backend
npm install --production=false
npm run build
npx prisma generate
npx prisma migrate deploy
pm2 restart immo-backend

# Frontend
echo "🎨 Building Frontend..."
cd ..
npm install --production=false
npm run build
pm2 restart immo-frontend

# Nginx
echo "🌐 Reloading Nginx..."
nginx -t && systemctl reload nginx

echo "✅ Déploiement terminé!"
pm2 logs
```

### 10.2 Rendre exécutable

```bash
chmod +x /app/immo/deploy.sh
```

### 10.3 Webhook GitHub (optionnel)

Créez un service de déploiement GitHub Actions ou utilisez un webhook Hetzner.

---

## 🧪 Étape 11: Tests

### 11.1 Tester le backend

```bash
curl -X GET https://api.votre-domain.com/health
```

### 11.2 Tester le frontend

```bash
curl -X GET https://votre-domain.com/
```

### 11.3 Test API complet

1. Ouvrez https://votre-domain.com
2. Créez un compte
3. Vérifiez les logs: `pm2 logs`

---

## 📈 Tips de Performance

1. **Enable Gzip** dans Nginx
2. **CDN** pour les assets (Cloudflare gratuit)
3. **Backup PostgreSQL** quotidiennement:
   ```bash
   pg_dump immo_db | gzip > /backups/immo_db_$(date +%Y%m%d).sql.gz
   ```
4. **Monitoring**: Installer Prometheus + Grafana
5. **Load Balancing**: Ajouter des replicas du backend

---

## ⚠️ Sécurité

- ✅ Firewall (ufw)
- ✅ SSL/TLS
- ✅ JWT Secret sécurisé
- ✅ API Rate Limiting (déjà configuré)
- ✅ CORS (à adapter à votre domaine)
- ☐ **TODO**: 2FA pour admin panel
- ☐ **TODO**: Backup automatiques
- ☐ **TODO**: Audit logs

---

## 🆘 Troubleshooting

### Backend n'est pas accessible

```bash
# Vérifier Port 4000
sudo netstat -tulpn | grep 4000

# Vérifier les logs
pm2 logs immo-backend

# Vérifier Nginx config
nginx -t
```

### Frontend blanc (Erreur chargement)

```bash
# Vérifier PORT 3000
sudo netstat -tulpn | grep 3000

# Vérifier env vars
cat .env.local

# Rebuild
npm run build
pm2 restart immo-frontend
```

### Erreur PostgreSQL

```bash
# Vérifier connexion
psql -h localhost -U immo_user -d immo_db

# Vérifier droits
sudo -u postgres psql -c "\du"

# Vérifier DATABASE_URL
echo $DATABASE_URL
```

---

## 📞 Support Hetzner

- **Console**: https://console.hetzner.cloud
- **Docs**: https://docs.hetzner.cloud
- **Community**: https://community.hetzner.cloud
- **Status**: https://status.hetzner.com

---

**Dernière mise à jour**: Mars 2026
