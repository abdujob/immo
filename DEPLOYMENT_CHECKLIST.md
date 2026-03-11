# 🎯 Hetzner Deployment Checklist

## 📋 Pre-Deployment Checklist

### 1. Repository & Code
- [ ] Git repository is public or SSH keys configured
- [ ] All sensitive data is in `.env` files (not committed)
- [ ] `.env.example` files are updated with all required variables
- [ ] Application builds locally without errors
- [ ] No console errors or warnings in frontend
- [ ] Backend API tests pass

### 2. Hetzner Account Setup
- [ ] Hetzner Cloud account created
- [ ] Payment method added
- [ ] SSH key created and saved locally
- [ ] SSH key added to Hetzner Cloud console
- [ ] Domain registered or registered elsewhere

### 3. DNS Configuration
- [ ] Domain registered
- [ ] DNS pointing to Hetzner nameservers (or A records created)
- [ ] A record for main domain: `your-domain.com` → Hetzner IP
- [ ] A record for API: `api.your-domain.com` → Hetzner IP
- [ ] A record for www: `www.your-domain.com` → Hetzner IP
- [ ] DNS propagation checked (can take 24h)

### 4. Database Setup
- [ ] Database migration scripts are ready
- [ ] Prisma schema is correct
- [ ] Database seed data is prepared (if needed)
- [ ] Backup strategy planned

### 5. Email Service (Optional)
- [ ] SMTP credentials obtained
- [ ] Email templates tested locally
- [ ] Sender email address configured

## 🚀 Deployment Checklist

### Step 1: Server Creation
- [ ] VPS created on Hetzner Cloud
- [ ] OS: Ubuntu 24.04 LTS
- [ ] Server type: CPX11 or higher
- [ ] SSH key selected for authentication
- [ ] Server IP noted

### Step 2: Initial Server Setup
```bash
# Commands to run
ssh root@YOUR_IP
apt update && apt upgrade -y
```
- [ ] System updates completed
- [ ] Firewall enabled
- [ ] SSH configured

### Step 3: Environment Installation
- [ ] Node.js 20 LTS installed
- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] PM2 installed
- [ ] PostgreSQL installed

### Step 4: Database Configuration
- [ ] PostgreSQL running
- [ ] Database `immo_db` created
- [ ] User `immo_user` created with password
- [ ] Permissions granted
- [ ] Connection tested

### Step 5: Application Deployment
- [ ] Repository cloned to `/app/immo`
- [ ] Backend `.env` file created with correct values
- [ ] Frontend `.env.local` file created with correct values
- [ ] Backend built successfully
- [ ] Prisma migrations applied
- [ ] Backend started with PM2
- [ ] Frontend built successfully
- [ ] Frontend started with PM2

### Step 6: Nginx Configuration
- [ ] Nginx installed
- [ ] Nginx config files copied
- [ ] Domain name updated in nginx.conf
- [ ] Nginx syntax validated
- [ ] Nginx restarted

### Step 7: SSL Certificates
- [ ] Certbot installed
- [ ] SSL certificates generated for main domain
- [ ] Certificates for all subdomains included
- [ ] Auto-renewal configured
- [ ] Certificates auto-renewal tested

### Step 8: Verification
- [ ] Frontend accessible at `https://your-domain.com`
- [ ] API accessible at `https://api.your-domain.com`
- [ ] SSL certificate valid (no warnings)
- [ ] Backend logs show no errors
- [ ] Frontend logs show no errors
- [ ] Database connection working

## ✅ Post-Deployment Checklist

### 1. Testing
- [ ] Create a test account
- [ ] List properties working
- [ ] Create property working
- [ ] Upload images working
- [ ] User favorites working
- [ ] Search functionality working
- [ ] Notifications working (if applicable)

### 2. Monitoring Setup
- [ ] PM2 monitoring configured
- [ ] Log rotation enabled
- [ ] Alert system configured
- [ ] Backup system configured

### 3. Security
- [ ] JWT secret is strong
- [ ] Database password is strong
- [ ] Firewall rules optimized
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] HTTPS redirects working

### 4. Performance
- [ ] Gzip compression enabled
- [ ] CDN configured (if needed)
- [ ] Database indices optimized
- [ ] Frontend builds fast
- [ ] Page load times acceptable

### 5. Maintenance
- [ ] Backup schedule determined
- [ ] Deployment script tested
- [ ] Rollback procedure documented
- [ ] Team has SSH access
- [ ] Documentation updated

## 🆘 Troubleshooting Guide

### Frontend shows blank page
```bash
# Check frontend status
pm2 logs immo-frontend

# Rebuild if needed
cd /app/immo
npm run build
pm2 restart immo-frontend

# Check environment variables
cat .env.local
```

### Backend API not responding
```bash
# Check backend status
pm2 logs immo-backend

# Check port 4000
sudo netstat -tulpn | grep 4000

# Restart backend
pm2 restart immo-backend
```

### Database connection error
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U immo_user -d immo_db

# Check DATABASE_URL
echo $DATABASE_URL
```

### SSL certificate issues
```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew --force-renewal

# Check Nginx config
sudo nginx -t
```

### Out of memory
```bash
# Check memory usage
free -h
watch -n 1 free -h

# Kill least important processes
ps aux --sort=-%mem | head

# Enable swap if needed
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 📞 Support Resources

- **Hetzner Docs**: https://docs.hetzner.cloud
- **Hetzner Community**: https://community.hetzner.cloud
- **NestJS Docs**: https://docs.nestjs.com
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Nginx Docs**: https://nginx.org/en/docs/

## 🔐 Security Reminder

⚠️ **CRITICAL**: 
- Never commit `.env` files to git
- Use strong, unique passwords for all users
- Keep SSH keys secure
- Use SSH key-based authentication only
- Regularly backup your database
- Monitor server logs for suspicious activity
- Keep all software updated

## 📈 Next Steps After Deployment

1. **Domain Setup**
   - Test domain propagation
   - Verify SSL certificates
   - Check DNS records

2. **Monitoring**
   - Set up error tracking (Sentry)
   - Set up logging (ELK Stack, LogRocket)
   - Configure alerts

3. **Backups**
   - Database backups to S3 or external storage
   - Code repository regularly committed
   - Configuration backups

4. **Scale**
   - Monitor resource usage
   - Plan for scaling if needed
   - Consider CDN for static assets

---

**Last updated**: March 2026
**Deployment Version**: 1.0
