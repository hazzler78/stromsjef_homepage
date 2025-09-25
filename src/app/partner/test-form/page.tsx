"use client";

import SalesysForm from "@/components/SalesysForm";

export default function PartnerTestFormPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Testa Salesys‑formulär</h1>
      <p style={{ color: "#475569", marginBottom: 20 }}>
        Denna sida är för att testa inbäddningen av Salesys‑formulär i Vercel Preview.
      </p>

      <SalesysForm
        containerId="salesys-form-test"
        formId="68b05450a1479b5cec96958c"
        options={{ width: "100%", test: true }}
      />
    </main>
  );
}


