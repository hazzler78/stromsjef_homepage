import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fastpris og Norgespris – Strømsjef",
  description: "Slik fungerer fastpris og Norgespris sammen, med regneeksempel. Aktuelle priser står i avtalevelgeren.",
  alternates: { canonical: "https://stromsjef.no/fastpris-og-norgespris" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
