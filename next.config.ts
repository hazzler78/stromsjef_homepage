import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Prefer apex host (matches canonical URLs in metadata/sitemap)
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.stromsjef.no",
          },
        ],
        destination: "https://stromsjef.no/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "elchef.se",
          },
        ],
        destination: "https://stromsjef.no/:path*",
        permanent: true,
      },
      // Swedish → Norwegian slugs (301)
      {
        source: "/jamfor-elpriser",
        destination: "/sammenlign-strompriser",
        permanent: true,
      },
      {
        source: "/sammenlign-strømpriser",
        destination: "/sammenlign-strompriser",
        permanent: true,
      },
      {
        source: "/byt-elavtal",
        destination: "/bytt-stromavtale",
        permanent: true,
      },
      {
        source: "/foretag",
        destination: "/bedrift",
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
