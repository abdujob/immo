// Using built-in fetch

const BASE_URL = 'https://immo-backend-fbfx.onrender.com';

async function main() {
    // 1. login to get token
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'abdoujob4@gmail.com', password: 'Abdou20031!' })
    });

    if (!loginRes.ok) {
        console.error("Login failed", await loginRes.text());
        return;
    }
    const { access_token } = await loginRes.json();

    // 2. send contact message (simulate missing/invalid fields to see the exact error)
    // First let's get a valid property id
    const propRes = await fetch(`${BASE_URL}/properties?limit=1`);
    const propData = await propRes.json();
    const propertyId = propData.data[0].id;

    console.log("Using property id", propertyId);

    const contactRes = await fetch(`${BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({
            propertyId: propertyId,
            message: "Test message"
        })
    });

    console.log("Contact status:", contactRes.status);
    console.log("Contact response:", await contactRes.text());
}

main().catch(console.error);
