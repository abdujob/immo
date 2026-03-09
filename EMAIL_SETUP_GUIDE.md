# Guide de Configuration des Emails (SMTP)

Pour envoyer des emails de validation, votre serveur a besoin d'un compte SMTP. Si vous utilisez **Gmail**, suivez ces étapes :

## 1. Utiliser un Mot de Passe d'Application (Gmail)
**IMPORTANT** : N'utilisez pas votre mot de passe Gmail habituel dans le fichier `.env`.

1.  Activez l'**Authentification à deux étapes** sur votre compte Google.
2.  Allez dans [Sécurité > Mots de passe d'application](https://myaccount.google.com/apppasswords).
3.  Créez un nouveau mot de passe (nommez-le "Immo Sénégal").
4.  Google vous donnera un code de **16 caractères**.
5.  **Copiez ce code SANS les espaces** dans votre `SMTP_PASS`.
    - *Exemple* : Si Google affiche `abcd efgh ijkl mnop`, écrivez `abcdefghijklmnop`.

## 2. Configuration du fichier `.env`
Voici les valeurs recommandées pour Gmail :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votremotdepasseapplicationsansespaces
SMTP_SECURE=false
EMAIL_FROM="Immo Sénégal <votre-email@gmail.com>"
```

## 3. Utilisation "En Ligne" (Production)
Oui, une fois configuré, cela fonctionnera aussi bien en **local** qu'**en ligne** (sur Render ou Vercel).
- Pour Render (Backend) : Vous devrez copier ces variables dans les "Environment Variables" du tableau de bord Render.
- Pour Vercel (Frontend) : Assurez-vous que `NEXT_PUBLIC_API_URL` pointe bien vers votre backend Render.

## 4. Tester la connexion
Une fois les variables sauvegardées, vous pouvez tester si le serveur arrive à se connecter en appelant l'URL suivante (après avoir démarré le backend) :
`GET http://localhost:4000/auth/test-mail`
