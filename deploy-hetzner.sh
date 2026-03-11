#!/bin/bash

# ================================================
# Hetzner Cloud Deployment Automation Script
# For ImmoSénégal - Backend + Frontend + PostgreSQL
# ================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ================================================
# STEP 1: System Setup
# ================================================

setup_system() {
    log_info "🔧 Setting up system..."
    
    log_info "Updating packages..."
    sudo apt update
    sudo apt upgrade -y
    
    log_info "Installing dependencies..."
    sudo apt install -y curl wget git build-essential unzip nginx certbot python3-certbot-nginx
    
    log_success "System setup completed!"
}

# ================================================
# STEP 2: Install Node.js
# ================================================

install_nodejs() {
    log_info "📦 Installing Node.js 20 LTS..."
    
    if ! command -v node &> /dev/null; then
        curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt install -y nodejs
        log_success "Node.js installed: $(node --version)"
    else
        log_warning "Node.js already installed: $(node --version)"
    fi
}

# ================================================
# STEP 3: Install Docker
# ================================================

install_docker() {
    log_info "🐳 Installing Docker..."
    
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
        
        sudo usermod -aG docker $USER
        log_success "Docker installed: $(docker --version)"
    else
        log_warning "Docker already installed: $(docker --version)"
    fi
}

# ================================================
# STEP 4: Install PM2
# ================================================

install_pm2() {
    log_info "⚙️  Installing PM2..."
    
    if ! command -v pm2 &> /dev/null; then
        sudo npm install -g pm2
        pm2 startup
        pm2 save
        log_success "PM2 installed"
    else
        log_warning "PM2 already installed"
    fi
}

# ================================================
# STEP 5: Setup PostgreSQL
# ================================================

setup_postgres() {
    log_info "🗄️  Setting up PostgreSQL..."
    
    if ! command -v psql &> /dev/null; then
        sudo apt install -y postgresql postgresql-contrib
        sudo systemctl restart postgresql
    fi
    
    read -sp "Enter PostgreSQL password for immo_user: " DB_PASSWORD
    echo
    
    sudo -u postgres psql << EOF
CREATE USER immo_user WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE immo_db OWNER immo_user;
ALTER DATABASE immo_db SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE immo_db TO immo_user;
GRANT USAGE ON SCHEMA public TO immo_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO immo_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO immo_user;
EOF

    log_success "PostgreSQL configured"
    echo "Database URL: postgresql://immo_user:$DB_PASSWORD@localhost:5432/immo_db"
}

# ================================================
# STEP 6: Configure Firewall
# ================================================

setup_firewall() {
    log_info "🔒 Configuring firewall..."
    
    sudo apt install -y ufw
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 5432/tcp
    sudo ufw enable
    
    log_success "Firewall configured"
    sudo ufw status
}

# ================================================
# STEP 7: Deploy Application
# ================================================

deploy_app() {
    log_info "📂 Deploying application..."
    
    # Create app directory
    sudo mkdir -p /app/immo
    sudo chown $USER:$USER /app/immo
    cd /app/immo
    
    # Clone or update repository
    if [ ! -d ".git" ]; then
        log_info "Cloning repository..."
        read -p "Enter GitHub repository URL: " REPO_URL
        git clone $REPO_URL .
    else
        log_info "Updating repository..."
        git pull origin main
    fi
    
    # Create environment files
    log_info "Setting up environment variables..."
    
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
        log_warning "Please edit backend/.env with your values"
    fi
    
    if [ ! -f ".env.local" ]; then
        cp .env.example .env.local
        log_warning "Please edit .env.local with your values"
    fi
    
    # Build and deploy
    log_info "Installing dependencies..."
    cd /app/immo/backend
    npm install --production=false
    
    log_info "Building backend..."
    npm run build
    
    log_info "Syncing database..."
    npx prisma generate
    npx prisma db push
    
    log_info "Starting backend..."
    pm2 start dist/src/main.js --name "immo-backend" --env production
    
    cd /app/immo
    npm install --production=false
    
    log_info "Building frontend..."
    npm run build
    
    log_info "Starting frontend..."
    pm2 start npm --name "immo-frontend" -- start
    
    pm2 save
    
    log_success "Application deployed!"
}

# ================================================
# STEP 8: Setup Nginx
# ================================================

setup_nginx() {
    log_info "🌐 Configuring Nginx..."
    
    read -p "Enter your domain (e.g., example.com): " DOMAIN
    
    sudo tee /etc/nginx/sites-available/immo-app > /dev/null << EOF
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN api.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS - Frontend
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}

# HTTPS - Backend API
server {
    listen 443 ssl http2;
    server_name api.$DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_request_buffering off;
    }
}
EOF

    sudo ln -sf /etc/nginx/sites-available/immo-app /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    sudo nginx -t
    sudo systemctl restart nginx
    
    log_success "Nginx configured"
}

# ================================================
# STEP 9: Setup SSL Certificates
# ================================================

setup_ssl() {
    log_info "🔐 Setting up SSL certificates..."
    
    read -p "Enter your domain: " DOMAIN
    
    sudo certbot certonly --standalone \
        -d $DOMAIN \
        -d www.$DOMAIN \
        -d api.$DOMAIN \
        -n \
        --agree-tos \
        --email admin@$DOMAIN
    
    # Auto-renewal
    sudo systemctl enable certbot.timer
    sudo systemctl start certbot.timer
    
    log_success "SSL certificates installed"
}

# ================================================
# STEP 10: Status & Monitoring
# ================================================

show_status() {
    log_info "📊 Service Status"
    echo
    
    pm2 status
    echo
    
    echo -e "${BLUE}PostgreSQL:${NC}"
    sudo systemctl status postgresql --no-pager | head -n 5
    echo
    
    echo -e "${BLUE}Nginx:${NC}"
    sudo systemctl status nginx --no-pager | head -n 5
}

# ================================================
# STEP 11: Create Deploy Script
# ================================================

create_deploy_script() {
    log_info "📝 Creating deployment script..."
    
    cat > /app/immo/deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Deploying ImmoSénégal..."

cd /app/immo

# Update code
git fetch origin
git reset --hard origin/main

# Backend
cd backend
npm install --production=false
npm run build
npx prisma db push
pm2 restart immo-backend

# Frontend
cd ..
npm install --production=false
npm run build
pm2 restart immo-frontend

# Reload Nginx
sudo systemctl reload nginx

echo "✅ Deployment completed!"
pm2 logs
EOF

    chmod +x /app/immo/deploy.sh
    log_success "Deploy script created at /app/immo/deploy.sh"
}

# ================================================
# Main Menu
# ================================================

show_menu() {
    echo
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   ImmoSénégal - Hetzner Deployment Script             ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    echo
    echo "Select option:"
    echo "1) Full Setup (recommended for fresh server)"
    echo "2) System Setup Only"
    echo "3) Install Node.js + Docker + PM2"
    echo "4) Setup PostgreSQL"
    echo "5) Deploy Application"
    echo "6) Setup Nginx"
    echo "7) Setup SSL Certificates"
    echo "8) Show Service Status"
    echo "9) Create Deploy Script"
    echo "0) Exit"
    echo
}

# ================================================
# Full Setup
# ================================================

full_setup() {
    log_warning "Starting full system setup..."
    
    setup_system
    install_nodejs
    install_docker
    install_pm2
    setup_postgres
    setup_firewall
    deploy_app
    setup_nginx
    setup_ssl
    create_deploy_script
    show_status
    
    log_success "✨ Full setup completed! Your application is running on your domain."
}

# ================================================
# Main Loop
# ================================================

main() {
    if [ $# -eq 0 ]; then
        while true; do
            show_menu
            read -p "Enter choice [0-9]: " choice
            
            case $choice in
                1) full_setup ;;
                2) setup_system ;;
                3) install_nodejs; install_docker; install_pm2 ;;
                4) setup_postgres ;;
                5) deploy_app ;;
                6) setup_nginx ;;
                7) setup_ssl ;;
                8) show_status ;;
                9) create_deploy_script ;;
                0) echo "Goodbye!"; exit 0 ;;
                *) log_error "Invalid choice" ;;
            esac
        done
    else
        case $1 in
            full) full_setup ;;
            system) setup_system ;;
            nodejs) install_nodejs ;;
            docker) install_docker ;;
            pm2) install_pm2 ;;
            postgres) setup_postgres ;;
            firewall) setup_firewall ;;
            app) deploy_app ;;
            nginx) setup_nginx ;;
            ssl) setup_ssl ;;
            status) show_status ;;
            *) echo "Usage: $0 [full|system|nodejs|docker|pm2|postgres|firewall|app|nginx|ssl|status]"; exit 1 ;;
        esac
    fi
}

main "$@"
