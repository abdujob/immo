/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Disable ESLint during build (old hairdresser components have errors)
        ignoreDuringBuilds: true,
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
        ],
    },
};

export default nextConfig;
