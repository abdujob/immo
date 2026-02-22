const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Image PNG 1x1 pixel rouge convertie en base64
const redDotBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const buffer = Buffer.from(redDotBase64, 'base64');

const filename = 'test-rouge.png';
const uploadPath = path.join(__dirname, 'uploads', filename);

// 1. Créer le fichier image
fs.writeFileSync(uploadPath, buffer);
console.log(`Fichier ${filename} créé dans ${uploadPath}`);

// 2. Mettre à jour la base de données
const prisma = new PrismaClient();

async function updateProperty() {
    // Récupérer la dernière propriété créée (celle de l'utilisateur)
    const lastProperty = await prisma.property.findFirst({
        orderBy: { createdAt: 'desc' }
    });

    if (lastProperty) {
        console.log(`Mise à jour de la propriété: ${lastProperty.title} (${lastProperty.id})`);

        // Mettre à jour l'image
        const imagesJson = JSON.stringify([`/uploads/${filename}`]);
        await prisma.property.update({
            where: { id: lastProperty.id },
            data: { images: imagesJson }
        });

        console.log('Base de données mise à jour avec l\'image rouge.');
    } else {
        console.log('Aucune propriété trouvée.');
    }
}

updateProperty()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
