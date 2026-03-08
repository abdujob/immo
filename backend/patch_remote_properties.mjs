// using built-in fetch

const BASE_URL = 'https://immo-backend-fbfx.onrender.com';

async function main() {
    console.log('🌱 Login to remote API at', BASE_URL);

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

    // 1. Fetch properties
    const res = await fetch(`${BASE_URL}/properties?limit=10`, {
        headers: { 'Authorization': `Bearer ${access_token}` }
    });
    const data = await res.json();
    const properties = data.data; // paginated properties array
    console.log(`Found ${properties.length} properties.`);

    // Mapping title to image URLs
    const propertyImages = {
        'Terrain viabilisé - Diamniadio (Pôle urbain)': [
            'https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800&h=600&fit=crop'
        ],
        'Appartement F4 neuf - Ouakam Mamelles': [
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
        ],
        'Villa de charme avec piscine - Saly Portudal': [
            'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop'
        ],
        'Grand studio meublé vue mer - Yoff Virage': [
            'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1499916078039-922301b0eb9b?w=800&h=600&fit=crop'
        ],
        'Maison familiale spacieuse - Thiès (Grand Standing)': [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop'
        ]
    };

    for (const property of properties) {
        if (propertyImages[property.title] && (!property.images || property.images.length === 0)) {
            console.log(`Patching property: ${property.title}`);
            const updateRes = await fetch(`${BASE_URL}/properties/${property.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                },
                body: JSON.stringify({
                    existingImages: propertyImages[property.title]
                })
            });

            if (!updateRes.ok) {
                console.error(`❌ Failed to update property "${property.title}":`, updateRes.status, await updateRes.text());
            } else {
                console.log(`✅ successfully updated images for: "${property.title}"`);
            }
        }
    }

    console.log('🎉 Done updating properties.');
}

main().catch(console.error);
