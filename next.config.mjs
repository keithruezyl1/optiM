/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @react-pdf/renderer pulls in node-targeted deps; keep it external to the
  // server bundle so the PDF route renders cleanly on the Node runtime.
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
    // Ensure the IBM Plex TTFs ship with the PDF route's serverless bundle so
    // Font.register can read them from disk on Vercel.
    outputFileTracingIncludes: {
      "/api/report/pdf": ["./public/fonts/**"],
    },
  },
};

export default nextConfig;
