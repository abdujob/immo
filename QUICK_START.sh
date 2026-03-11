#!/bin/bash

# ================================================
# Quick Start Guide Script for Hetzner Deployment
# ================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      ImmoSénégal - Hetzner Deployment Quick Start      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo

# Step 1: SSH into server
echo -e "${YELLOW}📍 STEP 1: SSH into your Hetzner server${NC}"
echo "Command:"
echo "  ssh root@188.245.177.186"
echo

# Step 2: Download and run deployment script
echo -e "${YELLOW}📍 STEP 2: Download and run the deployment script${NC}"
echo "Commands:"
echo "  cd /root"
echo "  curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/deploy-hetzner.sh -o deploy.sh"
echo "  chmod +x deploy.sh"
echo "  ./deploy.sh full"
echo

# Step 3: Configure domain
echo -e "${YELLOW}📍 STEP 3: Configure DNS${NC}"
echo "Point your domain to your Hetzner IP: 188.245.177.186"
echo "  A Record: your-domain.com → 188.245.177.186"
echo "  A Record: www.your-domain.com → 188.245.177.186"
echo "  A Record: api.your-domain.com → 188.245.177.186"
echo

# Step 4: Environment variables
echo -e "${YELLOW}📍 STEP 4: Set Environment Variables${NC}"
echo "SSH into the server and edit:"
echo "  nano /app/immo/backend/.env"
echo "  nano /app/immo/.env.local"
echo

# Step 5: Restart services
echo -e "${YELLOW}📍 STEP 5: Restart Services${NC}"
echo "Commands:"
echo "  pm2 restart all"
echo "  systemctl restart nginx"
echo

# Step 6: Verify deployment
echo -e "${YELLOW}📍 STEP 6: Verify Deployment${NC}"
echo "Visit:"
echo "  https://your-domain.com (Frontend)"
echo "  https://api.your-domain.com/health (Backend)"
echo

echo -e "${GREEN}✅ Ready to deploy!${NC}"
echo

# Interactive setup
read -p "Would you like to run automated setup now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your Hetzner server IP: " SERVER_IP
    read -p "Enter your domain (e.g., example.com): " DOMAIN
    
    echo -e "${BLUE}Running deployment on $SERVER_IP for domain $DOMAIN${NC}"
    
    # Copy deployment script to server
    scp deploy-hetzner.sh root@$SERVER_IP:/root/
    
    # Run deployment
    ssh root@$SERVER_IP "chmod +x /root/deploy-hetzner.sh && /root/deploy-hetzner.sh full"
    
    echo -e "${GREEN}✅ Deployment complete!${NC}"
fi
