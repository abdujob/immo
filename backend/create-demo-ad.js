const fs = require('fs');
const path = require('path');
const https = require('https');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');

const imageUrl = "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1920&auto=format&fit=crop"; // Une belle villa moderne
const filename = `${uuidv4()}.jpg`;
const destPath = path.join(__dirname, 'uploads', filename);

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                const file = fs.createWriteStream(filepath);
                res.pipe(file);
                file.on('finish', () => {
                    file.close(resolve);
                });
            } else {
                reject(`Erreur téléchargement: ${res.statusCode}`);
            }
        }).on('error', (err) => {
            reject(err.message);
        });
    });
}

async function main() {
    console.log("Téléchargement de l'image...");
    try {
        await downloadImage(imageUrl, destPath);
        console.log("Image téléchargée : " + filename);
    } catch (e) {
        console.error("Erreur download:", e);
        return;
    }

    // Trouver l'utilisateur "abdou doe" (test@gmail.com)
    // ID récupéré précédemment : 3e6f8cda-5dcd-4a49-b16e-59fbc6c4f670
    const userId = "3e6f8cda-5dcd-4a49-b16e-59fbc6c4f670";

    // Vérifier si l'user existe
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        console.error("Utilisateur introuvable ! Utilisation du premier user trouvé...");
        const firstUser = await prisma.user.findFirst();
        if (!firstUser) return;
        userId = firstUser.id;
    }

    // Créer la propriété
    const property = await prisma.property.create({
        data: {
            title: "Villa de Luxe Moderne (Démo)",
            description: "Annonce créée automatiquement avec une image de démonstration pour prouver que le système fonctionne.",
            type: "VILLA",
            transactionType: "VENTE",
            price: 450000000,
            surface: 450,
            rooms: 8,
            bedrooms: 5,
            bathrooms: 4,
            city: "Dakar",
            district: "Almadies",
            address: "Corniche des Almadies",
            hasPool: true,
            hasGarden: true,
            hasParking: true,
            hasAirCon: true,
            hasGuardian: true,
            images: JSON.stringify([`/uploads/${filename}`]),
            ownerId: userId // Lien avec le compte utilisateur
        }
    });

    console.log(`Annonce créée avec succès ! ID: ${property.id}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
