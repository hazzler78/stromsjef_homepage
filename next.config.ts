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
        destination: "https://www.stromsjef.no/:path*",
        permanent: true,
      },
      // Svenska till norska redirects
      {
        source: "/vanliga-fragor",
        destination: "/vanlige-sporsmal",
        permanent: true,
      },
      {
        source: "/delad-kalkyl",
        destination: "/delt-kalkulator",
        permanent: true,
      },
      {
        source: "/starta-har",
        destination: "/start-her",
        permanent: true,
      },
      {
        source: "/villkor",
        destination: "/vilkar",
        permanent: true,
      },
      {
        source: "/integritetspolicy",
        destination: "/personvernpolicy",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
