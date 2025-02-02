import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SIGNED_URLS:process.env.NEXT_PUBLIC_SIGNED_URLS
  },
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/viewInterviews",
      },
    ];
  },
};


export default nextConfig;

