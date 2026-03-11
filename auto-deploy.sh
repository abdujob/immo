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
pm2 logs --lines 10
