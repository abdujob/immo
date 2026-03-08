import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Adding more properties...');

    // Find an existing admin to be the owner of the properties
    const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
    });

    if (!admin) {
        console.error('❌ Could not find an ADMIN user. Please ensure the database has been seeded at least once.');
        process.exit(1);
    }

    // Find an existing agency, or default to admin
    const agency = await prisma.agency.findFirst();

    // ============================================
    // CREATE MORE PROPERTIES
    // ============================================

    // Property 1: Terrain in Diamniadio
    await prisma.property.create({
        data: {
            title: 'Terrain viabilisé - Diamniadio (Pôle urbain)',
            description: 'Superbe terrain de 400m² situé dans le nouveau pôle urbain de Diamniadio. Viabilisation complète : eau, électricité, assainissement. Idéal pour investissement ou construction de résidence.',
            type: 'TERRAIN',
            transactionType: 'VENTE',
            price: 15000000,
            surface: 400,
            hasGarden: false,
            hasParking: false,
            hasPool: false,
            isFurnished: false,
            hasAirCon: false,
            hasGuardian: false,
            address: 'Pôle Urbain Diamniadio',
            city: 'Diamniadio',
            district: 'Pôle Urbain',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800&h=600&fit=crop', // Land image
            ]),
            status: 'ACTIVE',
            featured: true,
            verified: true,
            views: 120,
            ownerId: admin.id,
        },
    });

    // Property 2: Appartment in Ouakam
    await prisma.property.create({
        data: {
            title: 'Appartement F4 neuf - Ouakam Mamelles',
            description: 'Appartement flambant neuf de 4 pièces situé au pied des Mamelles. Grand salon lumineux avec balcon, 3 chambres dont une suite parentale avec salle de bain intégrée, cuisine moderne équipée. Immeuble sécurisé avec gardien H24 et place de parking couverte.',
            type: 'APPARTEMENT',
            transactionType: 'LOCATION',
            price: 600000,
            surface: 140,
            bedrooms: 3,
            bathrooms: 2,
            floor: 2,
            hasGarden: false,
            hasParking: true,
            hasPool: false,
            isFurnished: false,
            hasAirCon: true,
            hasGuardian: true,
            address: 'Route des Mamelles',
            city: 'Dakar',
            district: 'Ouakam',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop', // Apartment interior
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop', // Room
            ]),
            status: 'ACTIVE',
            featured: true,
            verified: true,
            views: 245,
            ownerId: admin.id,
            agencyId: agency?.id,
        },
    });

    // Property 3: Villa in Saly
    await prisma.property.create({
        data: {
            title: 'Villa de charme avec piscine - Saly Portudal',
            description: 'Magnifique villa de type résidence de vacances à Saly. Composée de 4 chambres, grand séjour aéré, cuisine américaine, terrasse couverte donnant sur une belle piscine privée et un jardin arboré. Proche plage (5min à pied) et commodités. Vendue entièrement meublée.',
            type: 'VILLA',
            transactionType: 'VENTE',
            price: 130000000,
            surface: 600,
            bedrooms: 4,
            bathrooms: 3,
            hasGarden: true,
            hasParking: true,
            hasPool: true,
            isFurnished: true,
            hasAirCon: true,
            hasGuardian: true,
            address: 'Quartier Résidentiel, Saly',
            city: 'Saly',
            district: 'Saly Niakhniakhal',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&h=600&fit=crop', // Villa exterior with pool
                'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop', // Villa interior
            ]),
            status: 'ACTIVE',
            featured: true,
            verified: true,
            views: 450,
            ownerId: admin.id,
            agencyId: agency?.id,
        },
    });

    // Property 4: Studio in Yoff
    await prisma.property.create({
        data: {
            title: 'Grand studio meublé vue mer - Yoff Virage',
            description: 'Superbe grand studio situé au Virage avec vue imprenable sur l\'océan. Grande pièce de vie lumineuse, cuisine ouverte bien équipée, salle de bain moderne, et terrasse aménagée. Idéal pour célibataire ou jeune coupe. Accès rapide aéroport.',
            type: 'STUDIO',
            transactionType: 'LOCATION',
            price: 350000,
            surface: 55,
            bedrooms: 1,
            bathrooms: 1,
            floor: 5,
            hasGarden: false,
            hasParking: true,
            hasPool: false,
            isFurnished: true,
            hasAirCon: true,
            hasGuardian: true,
            address: 'Le Virage',
            city: 'Dakar',
            district: 'Yoff',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=600&fit=crop', // Studio
                'https://images.unsplash.com/photo-1499916078039-922301b0eb9b?w=800&h=600&fit=crop', // View
            ]),
            status: 'ACTIVE',
            featured: false,
            verified: true,
            views: 310,
            ownerId: admin.id,
        },
    });

    // Property 5: House in Thiès
    await prisma.property.create({
        data: {
            title: 'Maison familiale spacieuse - Thiès (Grand Standing)',
            description: 'Grande maison familiale située dans un quartier calme et recherché de Thiès (Mbour 1). La maison dispose de 5 chambres, de 2 grands salons (RDC et étage), d\'une grande cour, et d\'un garage pouvant accueillir 2 véhicules.',
            type: 'MAISON',
            transactionType: 'VENTE',
            price: 65000000,
            surface: 300,
            bedrooms: 5,
            bathrooms: 3,
            hasGarden: true,
            hasParking: true,
            hasPool: false,
            isFurnished: false,
            hasAirCon: true,
            hasGuardian: false,
            address: 'Quartier Mbour 1',
            city: 'Thiès',
            district: 'Mbour 1',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop', // House
            ]),
            status: 'ACTIVE',
            featured: false,
            verified: true,
            views: 180,
            ownerId: admin.id,
        },
    });

    console.log('✅ 5 new properties added successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error adding properties:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
