# 🚀 Déploiement Hetzner - Guide Complet ImmoSénégal

## 📌 Résumé Rapide

Vous allez déployer sur **Hetzner Cloud** (VPS ~€4/mois):
- **Backend** NestJS Port 4000
- **Frontend** Next.js Port 3000  
- **Base de données** PostgreSQL Port 5432
- **Reverse Proxy** Nginx avec SSL

## ⚡ Quick Start (5 minutes)

### 1️⃣ Créer un VPS Hetzner ✅
1. Allez sur https://console.hetzner.cloud
2. Cliquez **Create Server**
3. Choisir:
   - Ubuntu 24.04 LTS
   - CPX11 (2 vCPU, 2GB RAM)
   - Falkenstein
   - Votre clé SSH
4. **IP de votre serveur**: `188.245.177.186`

### 2️⃣ Connecter et Déployer
```bash
# Sur votre machine locale
ssh root@188.245.177.186

# Sur le serveur Hetzner
cd /root
curl -o deploy.sh https://raw.githubusercontent.com/VOTRE_USERNAME/VOTRE_REPO/main/deploy-hetzner.sh
chmod +x deploy.sh
./deploy.sh full

# ⏳ Attendez 10-15 minutes...
```

### 3️⃣ Configurer DNS
Pointez votre domaine vers l'IP Hetzner: **188.245.177.186**
- `your-domain.com` → 188.245.177.186
- `www.your-domain.com` → 188.245.177.186
- `api.your-domain.com` → 188.245.177.186

### 4️⃣ C'est fini! 🎉
Visitez `https://your-domain.com`

---

## 📂 Fichiers de Déploiement Fournis

| Fichier | Description |
|---------|------------|
| `HETZNER_DEPLOY.md` | **Guide complet étape par étape** |
| `deploy-hetzner.sh` | **Script d'installation automatisée** |
| `docker-compose.yml` | Configuration Docker (optionnel) |
| `nginx.conf` | Configuration Nginx reverse proxy |
| `QUICK_START.sh` | Menu interactif de déploiement |
| `DEPLOYMENT_CHECKLIST.md` | Checklist pré/post déploiement |
| `backend/Dockerfile` | Image Docker backend |
| `Dockerfile` | Image Docker frontend |
| `init-db.sql` | Initialisation PostgreSQL |

---

## 🔧 Étapes Détaillées

### Phase 1: Configuration Hetzner (10 min)
```
1. VPS Hetzner créé ✅ → IP 188.245.177.186
2. SSH se connecter
3. Mettre à jour packages
4. Installer Node.js, Docker, PostgreSQL
```

### Phase 2: Déployer Application (15 min)
```
1. Cloner repository
2. Configurer .env (DATABASE_URL, JWT_SECRET, FRONTEND_URL)
3. Builder et démarrer backend
4. Builder et démarrer frontend
5. Configurer Nginx
```

### Phase 3: SSL & Domaine (5 min)
```
1. Créer certificats SSL (Certbot)
2. Pointer domaine vers IP
3. Vérifier https://your-domain.com
```

---

## 🎯 Variables d'Environnement Essentielles

### Backend (`backend/.env`)
```env
DATABASE_URL="postgresql://immo_user:PASSWORD@localhost:5432/immo_db"
JWT_SECRET="VOTRE_CLEF_JWT_FORTE"
FRONTEND_URL="https://your-domain.com"
NODE_ENV=production
PORT=4000
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL="https://api.your-domain.com"
```

**⚠️ IMPORTANT**: Changez les valeurs!

---

## 💻 Commandes Utiles

```bash
# SSH sur le serveur
ssh root@VOTRE_IP

# Vérifier les services
pm2 status

# Voir les logs
pm2 logs immo-backend
pm2 logs immo-frontend

# Redémarrer services
pm2 restart all

# Vérifier Nginx
sudo systemctl status nginx
nginx -t

# Vérifier PostgreSQL
sudo systemctl status postgresql
psql -U immo_user -d immo_db

# Redéployer après git push
cd /app/immo && ./deploy.sh
```

---

## 🧪 Tests

### Tester Frontend
```bash
curl https://your-domain.com
# Devrait retourner HTML de la page
```

### Tester Backend
```bash
curl https://api.your-domain.com/health
# Devrait retourner "OK"
```

### Tester Frontend dans navigateur
1. Ouvrir https://your-domain.com
2. F12 pour DevTools → Console
3. Vérifier absence d'erreurs rouges

---

## ✅ Vérification Post-Déploiement

- [ ] Frontend charge en HTTPS
- [ ] Backend API répond aux requests
- [ ] Certificat SSL valide (pas d'erreur)
- [ ] Création de compte fonctionne
- [ ] Upload d'images fonctionne
- [ ] Base de données synchronisée

---

## ⚠️ Erreurs Courantes

### ❌ "Connection refused" sur backend
```bash
# Solution
pm2 restart immo-backend
# Vérifier les logs
pm2 logs immo-backend
```

### ❌ Frontend affiche page blanche
```bash
# Solution
pm2 restart immo-frontend
npm run build --prefix /app/immo
# Vérifier env var
echo $NEXT_PUBLIC_API_URL
```

### ❌ "Database connection error"
```bash
# Solution
psql -U immo_user -d immo_db
# Vérifier DATABASE_URL correct dans .env
echo $DATABASE_URL
```

### ❌ "SSL certificate not found"
```bash
# Solution
sudo certbot certonly --standalone -d your-domain.com
# Vérifier chemin dans nginx.conf
sudo nginx -t
```

---

## 🔒 Sécurité

### ✅ À faire ABSOLUMENT:
- [x] Firewall activé (ufw)
- [x] SSH key-based auth seulement
- [x] JWT_SECRET fort et unique
- [x] PostgreSQL mot de passe fort
- [x] HTTPS/SSL sur tout
- [x] Backup base de données

### ❌ À ne PAS faire:
- [ ] Pas de .env sur GitHub
- [ ] Pas de credentials en dur dans le code
- [ ] Pas d'accès SSH par password
- [ ] Pas de HTTP sans redirect HTTPS

---

## 📊 Monitoring

### Logs en temps réel
```bash
pm2 logs
```

### Dashboard PM2
```bash
pm2 web  # Accédez à http://localhost:9615
```

### Métriques serveur
```bash
htop          # CPU, RAM, processus
df -h         # Espace disque
netstat -tulpn  # Ports ouverts
```

---

## 🔄 Mises à Jour Futures

### Redéployer après git push
```bash
cd /app/immo
git pull origin main
npm run build
npx prisma db push
pm2 restart all
```

### Ou automatisé
```bash
cd /app/immo && ./deploy.sh
```

---

## 💰 Coûts Estimés

| Service | Coût/mois |
|---------|-----------|
| VPS CPX11 | ~€4 |
| Domaine | ~€10 |
| **TOTAL** | **~€14** |

*Note: Pas de frais pour base de données (sur le VPS)*

---

## 📞 Support

- **Problème Hetzner?** → https://docs.hetzner.cloud
- **Problème Node.js?** → https://nodejs.org/docs
- **Problème PostgreSQL?** → https://www.postgresql.org/docs
- **Problème NestJS?** → https://docs.nestjs.com
- **Problème Next.js?** → https://nextjs.org/docs

---

## 📚 Documentation Fournie

1. **HETZNER_DEPLOY.md** - Guide détaillé complet
2. **deploy-hetzner.sh** - Script d'installation automatisée
3. **DEPLOYMENT_CHECKLIST.md** - Checklist pré/post déploiement
4. **nginx.conf** - Configuration complète Nginx
5. **docker-compose.yml** - Configuration Docker (optionnel)

---

## 🎉 Prochaines Étapes

✅ **Immédiat**
- Déployer sur Hetzner
- Vérifier fonctionnement
- Tester avec utilisateurs

📈 **Court terme**
- Configurer monitoring
- Mettre en place backups
- Optimiser performance

🚀 **Moyen terme**
- Ajouter analytics
- Configurer CI/CD
- Améliorer sécurité

---

**Succès du déploiement? 🎊**

Une fois en production:
1. Partager le lien avec les utilisateurs
2. Monitorer les logs
3. Faire des backups réguliers
4. Déployer les mises à jour smoothly

**Besoin d'aide?** Vérifiez le [guide complet](./HETZNER_DEPLOY.md) ou la [checklist](./DEPLOYMENT_CHECKLIST.md).

---

*Dernière mise à jour: Mars 2026*
*Version: 1.0*
