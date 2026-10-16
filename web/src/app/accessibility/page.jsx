import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import PolicyPage from "../../components/PolicyPage";

export default function AccessibilityPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <PolicyPage
        eyebrow="Website Access"
        title="Accessibility"
        sections={[
          {
            title: "Commitment",
            body: "Korede James aims to keep the website clear, navigable, and usable across desktop and mobile devices.",
          },
          {
            title: "Support",
            body: "If you experience difficulty using the website, contact the atelier with the page, device, and issue so support can assist and improvements can be reviewed.",
          },
          {
            title: "Ongoing Review",
            body: "As the site evolves, navigation, forms, text contrast, and media presentation will continue to be reviewed for practical accessibility.",
          },
        ]}
      />
      <Footer />
    </main>
  );
}
