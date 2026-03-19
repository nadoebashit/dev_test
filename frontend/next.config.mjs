/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: "standalone",
    experimental: {
      missingSuspenseWithCSRBailout: false,
    }
};

export default nextConfig;
