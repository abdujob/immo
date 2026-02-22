const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testUpdate() {
    // 1. Login to get token
    try {
        console.log("Authentification...");
        const loginRes = await axios.post('http://localhost:4000/auth/login', {
            email: 'test@gmail.com', // Utilisateur "abdou doe"
            password: 'password123'  // Mot de passe par défaut du seed ? A vérifier. Sinon on utilisera un token en dur si possible ou on créera un user test.
        });
        const token = loginRes.data.access_token;
        console.log("Token récupéré.");

        // 2. Find "belle villa" ID
        // On suppose que l'utilisateur a donné le nom "belle villa".
        // On va lister les propriétés de cet utilisateur.
        const myProps = await axios.get('http://localhost:4000/properties/my-properties', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const targetProp = myProps.data.find(p => p.title.toLowerCase().includes('belle villa'));
        if (!targetProp) {
            console.error("Propriété 'belle villa' introuvable.");
            console.log("Propriétés trouvées :", myProps.data.map(p => p.title));
            return;
        }
        console.log(`Propriété cible trouvée: ${targetProp.title} (${targetProp.id})`);
        console.log(`Images actuelles: ${targetProp.images}`);

        // 3. Prepare Update with Image
        const form = new FormData();
        // Simuler un fichier image
        const fakeImagePath = path.join(__dirname, 'test-upload.txt');
        fs.writeFileSync(fakeImagePath, 'fake image content');
        form.append('images', fs.createReadStream(fakeImagePath), 'test-image.jpg');

        // Ajouter d'autres champs requis par le DTO si nécessaire, ou juste ceux qu'on modifie
        form.append('price', '550000'); // Changement de prix pour vérifier

        // 4. Send Update
        console.log("Envoi de la requête de mise à jour...");
        const updateRes = await axios.patch(`http://localhost:4000/properties/${targetProp.id}`, form, {
            headers: {
                Authorization: `Bearer ${token}`,
                ...form.getHeaders()
            }
        });

        console.log("Réponse de update:", updateRes.data);
        console.log("Nouvelles images:", updateRes.data.images);

    } catch (e) {
        console.error("Erreur:", e.response ? e.response.data : e.message);
    }
}

testUpdate();
