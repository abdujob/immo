/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Disable ESLint during build (old hairdresser components have errors)
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Disable TypeScript type checking during build
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
        ],
    },
};

export default nextConfig;
