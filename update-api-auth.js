const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/lib/api.ts');
if (!fs.existsSync(filePath)) {
    console.log('File not found: ' + filePath);
    process.exit(1);
}
let content = fs.readFileSync(filePath, 'utf8');

// Helper approach: Insert a helper function at the top of api.ts
const authHelper = `
/**
 * Helper to get authentication headers
 */
function getAuthHeaders(headers: Record<string, string> = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
        ...headers,
        ...(token ? { 'Authorization': \`Bearer \${token}\` } : {})
    };
}
`;

if (!content.includes('function getAuthHeaders')) {
    // Insert after API_BASE_URL
    content = content.replace("const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';",
        "const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';" + authHelper);
}

// Now replace headers in fetch calls
// Find: headers: { 'Content-Type': 'application/json' },
// Escape the slash in the replacement string or use a literal if not using regex
content = content.split("headers: { 'Content-Type': 'application/json' }").join("headers: getAuthHeaders({ 'Content-Type': 'application/json' })");

// Find: const res = await fetch(\`${API_BASE_URL}/properties/my-properties\`, {
//            credentials: 'include',
content = content.replace(/fetch\(`\${API_BASE_URL}\/properties\/my-properties`, \{\s+credentials: 'include',/g,
    "fetch(`${API_BASE_URL}/properties/my-properties`, {\n            headers: getAuthHeaders(),\n            credentials: 'include',");

// Find specific fetch calls in api.ts and add headers: getAuthHeaders()
const problematicFetch = [
    { search: "fetch(`${API_BASE_URL}/favorites`, {\n            method: 'POST',\n            headers: { 'Content-Type': 'application/json' }, credentials: 'include',", replace: "fetch(`${API_BASE_URL}/favorites`, {\n            method: 'POST',\n            headers: getAuthHeaders({ 'Content-Type': 'application/json' }), credentials: 'include'," },
    { search: "fetch(`${API_BASE_URL}/contacts/received`, {\n            credentials: 'include'", replace: "fetch(`${API_BASE_URL}/contacts/received`, {\n            headers: getAuthHeaders(),\n            credentials: 'include'" },
    { search: "fetch(`${API_BASE_URL}/contacts/sent`, {\n            credentials: 'include'", replace: "fetch(`${API_BASE_URL}/contacts/sent`, {\n            headers: getAuthHeaders(),\n            credentials: 'include'" },
    { search: "fetch(`${API_BASE_URL}/favorites/${propertyId}`, {\n            method: 'DELETE',\n            credentials: 'include'", replace: "fetch(`${API_BASE_URL}/favorites/${propertyId}`, {\n            method: 'DELETE',\n            headers: getAuthHeaders(),\n            credentials: 'include'" }
];

problematicFetch.forEach(p => {
    content = content.split(p.search).join(p.replace);
});

fs.writeFileSync(filePath, content);
console.log('Updated src/lib/api.ts with Bearer Token support');
