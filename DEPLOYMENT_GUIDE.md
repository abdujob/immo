# 🚀 Guide de Déploiement - ImmoSénégal

## Configuration Actuelle

- **Frontend**: https://immo-six-iota.vercel.app
- **Backend**: https://immo-backend-fbfx.onrender.com

---

## ✅ Configuration Backend (Render)

### Étape 1: Variables d'environnement sur Render

1. Accède au **Render Dashboard** → Sélectionne ton service backend
2. Clique sur **Environment** (onglet)
3. Ajoute/Mets à jour les variables suivantes:

| Clé | Valeur | Notes |
|-----|--------|-------|
| `DATABASE_URL` | `postgresql://...` | Obtenir depuis Neon.tech |
| `JWT_SECRET` | `[clé sécurisée]` | Génère avec `openssl rand -base64 32` |
| `FRONTEND_URL` | `https://immo-six-iota.vercel.app` | ⚠️ SANS trailing slash |
| `PORT` | `4000` | Port de écoute |
| `NODE_ENV` | `production` | Environnement |

### Clé JWT recommandée (copie cette valeur):
```
Q9xR7mK2pL8vN3sH6tF1wB4cD5eJ0gY9zU2mN5pR8s=
```

### Étape 2: Redéployer après changements

```bash
# Push les changements localement d'abord
git add .
git commit -m "fix: update CORS and backend configuration"
git push origin main
```

Render va redéployer automatiquement après le push GitHub.

---

## ✅ Configuration Frontend (Vercel)

### Étape 1: Variables d'environnement sur Vercel

1. Accède à **Vercel Dashboard** → Projet `immo-six-iota`
2. Clique sur **Settings** → **Environment Variables**
3. Ajoute/Mets à jour:

| Clé | Valeur | Scope |
|-----|--------|-------|
| `NEXT_PUBLIC_API_URL` | `https://immo-backend-fbfx.onrender.com` | Production |

### Étape 2: Redéployer

```bash
# Après le push GitHub
git push origin main

# Vercel va redéployer automatiquement
```

---

## 🧪 Test Local (Avant de déployer)

### Terminal 1: Backend

```bash
cd backend
npm run dev
# Doit afficher: "Application is running on: http://localhost:4000"
```

### Terminal 2: Frontend

```bash
npm run dev
# Doit afficher: "Ready on http://localhost:3000"
```

### Test de l'API Authorization

Ouvre la **Console du navigateur** (DevTools F12):

```javascript
// Teste les headers d'authentification
const token = localStorage.getItem('token');
console.log('Token:', token);

// Teste un POST vers /properties
fetch('http://localhost:4000/properties', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  credentials: 'include'
})
.then(r => r.json())
.then(d => console.log('Response:', d))
.catch(e => console.error('Error:', e));
```

---

## ❌ Troubleshooting

### Erreur 400 Bad Request

**Causes possibles:**
1. ❌ Données FormData non parsées → ✅ CORRIGÉ (main.ts middlewares)
2. ❌ Validation Zod échouée → ✅ AMÉLIORÉ (logging détaillé)
3. ❌ CORS bloqué → Vérifie `FRONTEND_URL` exact sur Render

**Vérification:**
```bash
# Render Logs
curl https://immo-backend-fbfx.onrender.com/properties/featured
# Doit retourner un array de propriétés
```

### Erreur CORS

**Vérification en local:**
```bash
# Le backend doit logger:
# "CORS configured for: [...]"
```

### Token JWT invalide

**Vérifier:**
1. Le `JWT_SECRET` est identique partout
2. Token n'a pas expiré: `localStorage.getItem('token')`

---

## 📝 Récapitulatif des changements effectués

✅ **main.ts**
- Ajout `express.json({ limit: '10mb' })`
- Ajout `express.urlencoded({ limit: '10mb', extended: true })`
- CORS maintenant inclut `https://immo-six-iota.vercel.app`
- Logging de CORS activé

✅ **property.controller.ts**
- Logging détaillé des erreurs de validation
- Messages d'erreur plus lisibles pour le frontend

✅ **Fichiers config**
- `.env` backend mis à jour avec FRONTEND_URL
- `.env.example` backend complet
- `.env.example` root avec URL correcte
- `.env.local` frontend pour développement local

---

## 🔄 Ordre de déploiement recommandé

1. **Backend d'abord** (Render)
   ```bash
   git push origin main
   # Attendre que Render redéploie (2-5 min)
   ```

2. **Vérifier les logs** sur Render
   ```
   Render Dashboard → Logs → Vérifier "CORS configured for"
   ```

3. **Frontend ensuite** (Vercel)
   ```bash
   git push origin main
   # Vercel redéploie automatiquement
   ```

4. **Test complet**
   - Aller sur https://immo-six-iota.vercel.app
   - Login/Signup
   - Créer une propriété
   - Vérifier l'upload des images

---

## ⚠️ Notes Importantes

- **Trailing slash**: L'URL du frontend ne doit PAS avoir de `/` à la fin
- **HTTPS obligatoire**: En production, tout doit être HTTPS
- **JWT_SECRET**: Ne jamais commiter en production, toujours le passer via variables d'environnement
- **DATABASE_URL**: Si tu changes la DB (Neon), mets à jour partout

---

**Prêt à déployer? N'oublie pas de faire un commit et de push!** 🚀
