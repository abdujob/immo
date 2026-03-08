const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'src/app/properties/new/page.tsx',
    'src/app/properties/[id]/edit/page.tsx'
];

filesToUpdate.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // Add Authorization header definition if adding Bearer token
    let newFetchPattern =
        `            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const response = await fetch(\`\${API_BASE_URL}/properties\${file.includes('[id]') ? '/\${params.id}' : ''}\`, {
                method: file.includes('[id]') ? 'PATCH' : 'POST',
                credentials: 'include',
                headers: {
                    ...(token ? { 'Authorization': \\\`Bearer \${token}\\\` } : {})
                },
                body: submitData
            });

            if (response.ok) {
                router.push('/dashboard/properties');
            } else {
                const errorData = await response.json();
                console.error('Validation errors:', errorData);
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    const messages = errorData.errors.map((e) => e.message || e.path?.join('.')).join('\\n');
                    alert(\`Erreur de validation :\\n\${messages}\`);
                } else {
                    alert(errorData.message || "Erreur lors de l'opération");
                }
            }`;

    // For simplicity, let's just use string replace on the common blocks.
    if (file.includes('new/page.tsx')) {
        const targetStr =
            `            const response = await fetch(\`\${API_BASE_URL}/properties\`, {
                method: 'POST',
                credentials: 'include',
                body: submitData
            });

            if (response.ok) {
                router.push('/dashboard/properties');
            } else {
                alert('Erreur lors de la publication de l\\'annonce');
            }`;

        const replaceStr =
            `            const token = localStorage.getItem('token');
            const response = await fetch(\`\${API_BASE_URL}/properties\`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    ...(token ? { 'Authorization': \`Bearer \${token}\` } : {})
                },
                body: submitData
            });

            if (response.ok) {
                router.push('/dashboard/properties');
            } else {
                const errorData = await response.json();
                console.error('Validation errors:', errorData);
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    const messages = errorData.errors.map(e => e.message || e.path?.join('.')).join('\\n');
                    alert(\`Erreur de validation :\\n\${messages}\`);
                } else {
                    alert(errorData.message || 'Erreur lors de la publication de l\\'annonce');
                }
            }`;

        // Strip CR to match in Windows
        const normalizedContent = content.replace(/\r\n/g, '\n');
        const normalizedTarget = targetStr.replace(/\r\n/g, '\n');
        const finalContent = normalizedContent.replace(normalizedTarget, replaceStr);
        fs.writeFileSync(filePath, finalContent, 'utf8');
        console.log(\`Updated \${file}\`);
    }

    if (file.includes('[id]/edit/page.tsx')) {
        const targetStr = 
`            const response = await fetch(\`\${API_BASE_URL}/properties/\${params.id}\`, {
                method: 'PATCH',
                credentials: 'include',
                body: submitData
            });

            if (response.ok) {
                router.push('/dashboard/properties');
            } else {
                alert('Erreur lors de la modification de l\\'annonce');
            }`;

        const replaceStr =
            `            const token = localStorage.getItem('token');
            const response = await fetch(\`\${API_BASE_URL}/properties/\${params.id}\`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    ...(token ? { 'Authorization': \`Bearer \${token}\` } : {})
                },
                body: submitData
            });

            if (response.ok) {
                router.push('/dashboard/properties');
            } else {
                const errorData = await response.json();
                console.error('Validation errors:', errorData);
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    const messages = errorData.errors.map(e => e.message || e.path?.join('.')).join('\\n');
                    alert(\`Erreur de validation :\\n\${messages}\`);
                } else {
                    alert(errorData.message || 'Erreur lors de la modification de l\\'annonce');
                }
            }`;

        // Strip CR to match in Windows
        const normalizedContent = content.replace(/\r\n/g, '\n');
        const normalizedTarget = targetStr.replace(/\r\n/g, '\n');
        const finalContent = normalizedContent.replace(normalizedTarget, replaceStr);
        fs.writeFileSync(filePath, finalContent, 'utf8');
        console.log(\`Updated \${file}\`);
    }
});
