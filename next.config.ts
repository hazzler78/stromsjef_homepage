import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "elchef.se",
          },
        ],
        destination: "https://www.stromsjef.se/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
