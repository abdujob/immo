// using built-in fetch

const BASE_URL = 'https://immo-backend-fbfx.onrender.com';

async function main() {
    console.log('🌱 Login to remote API at', BASE_URL);

    // 1. Login to get token using provided credentials
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'abdoujob4@gmail.com', password: 'Abdou20031!' })
    });

    if (!loginRes.ok) {
        console.error('❌ Login failed:', loginRes.status, await loginRes.text());
        process.exit(1);
    }

    const { access_token } = await loginRes.json();
    console.log('✅ Login successful with abdoujob4@gmail.com. Token received.');

    // 2. Define the exact same properties to add, but to the API!
    // Note: the API expects specific schema format according to src/property/property.dto.ts
    const newProperties = [
        {
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
            images: [
                'https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800&h=600&fit=crop'
            ],
            featured: true
        },
        {
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
            images: [
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
            ],
            featured: true
        },
        {
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
            images: [
                'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop'
            ],
            featured: true
        },
        {
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
            images: [
                'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1499916078039-922301b0eb9b?w=800&h=600&fit=crop'
            ],
            featured: false
        },
        {
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
            images: [
                'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop'
            ],
            featured: false
        }
    ];

    for (const property of newProperties) {
        const propertyRes = await fetch(`${BASE_URL}/properties`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify(property)
        });

        if (!propertyRes.ok) {
            console.error(`❌ Failed to add property "${property.title}":`, propertyRes.status, await propertyRes.text());
        } else {
            console.log(`✅ successfully added property: "${property.title}"`);
        }
    }

    console.log('🎉 Done adding properties remotely.');
}

main().catch(console.error);
