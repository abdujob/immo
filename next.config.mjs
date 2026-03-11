/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '4000',
            },
            {
                // Render backend (production)
                protocol: 'https',
                hostname: '*.onrender.com',
            },
            {
                // Production API
                protocol: 'https',
                hostname: 'api.immosenegal.sn',
            },
        ],
    },
};

export default nextConfig;
