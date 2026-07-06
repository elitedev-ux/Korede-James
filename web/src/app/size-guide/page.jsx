import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import PolicyPage from "../../components/PolicyPage";

export default function SizeGuidePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <PolicyPage
        eyebrow="Assistance"
        title="Size Guide"
        sections={[
          {
            title: "How To Measure",
            body: "Use a soft measuring tape over light clothing. Keep the tape level, close to the body, and relaxed. Do not pull tightly.",
          },
          {
            title: "Key Measurements",
            body: "Include bust or chest, waist, hip, shoulder width, sleeve length, trouser length or inseam, height, and any fit notes such as cropped, oversized, fitted, or relaxed.",
          },
          {
            title: "Fit Notes",
            body: "If you are between sizes or commissioning a sculptural silhouette, share the size you usually wear and any comfort preferences. The atelier may request further measurements during consultation.",
          },
        ]}
      />
      <Footer />
    </main>
  );
}
