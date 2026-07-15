import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import PolicyPage from "../../components/PolicyPage";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <PolicyPage
        eyebrow="Client Agreement"
        title="Terms Of Service"
        sections={[
          {
            title: "Commissions",
            body: "Submitting a commission request begins an atelier review. Final pricing, timeline, materials, and scope are confirmed by Korede James before production begins.",
          },
          {
            title: "Payments",
            body: "Deposits, installments, and balances may be required depending on the commission. Payment terms are confirmed before work proceeds.",
          },
          {
            title: "Production",
            body: "Timelines depend on material sourcing, fittings, revisions, and delivery destination. Bespoke work may require additional consultation before completion.",
          },
          {
            title: "Use Of Work",
            body: "Portfolio publication, campaign use, and archival display of completed commissions may require client permission where applicable.",
          },
        ]}
      />
      <Footer />
    </main>
  );
}
