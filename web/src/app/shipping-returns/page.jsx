import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import PolicyPage from "../../components/PolicyPage";

export default function ShippingReturnsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <PolicyPage
        eyebrow="Assistance"
        title="Shipping & Returns"
        sections={[
          {
            title: "Shipping Time",
            body: "Completed pieces are dispatched after final atelier approval and client confirmation. DHL Express is the preferred international service and typically takes 2-5 business days after dispatch, depending on destination, customs clearance, and local delivery conditions.",
          },
          {
            title: "Delivery Options",
            body: "Clients may request DHL Express, local courier delivery within Lagos, or private pickup by appointment. Available options are confirmed before dispatch.",
          },
          {
            title: "Returns",
            body: "Made-to-order and bespoke pieces are produced to client specifications and are not eligible for standard returns. If a piece arrives damaged or materially different from the confirmed commission brief, contact the atelier within 48 hours with photos so the issue can be reviewed.",
          },
          {
            title: "Duties & Customs",
            body: "International clients are responsible for any import duties, taxes, and customs fees charged by the destination country.",
          },
        ]}
      />
      <Footer />
    </main>
  );
}
