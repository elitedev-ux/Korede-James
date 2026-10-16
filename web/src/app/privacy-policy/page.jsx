import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import PolicyPage from "../../components/PolicyPage";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <PolicyPage
        eyebrow="Client Information"
        title="Privacy Policy"
        sections={[
          {
            title: "Information Collected",
            body: "Korede James collects contact details, account information, commission briefs, measurement notes, order records, and communication history needed to manage client projects.",
          },
          {
            title: "How It Is Used",
            body: "Information is used to respond to enquiries, prepare quotes, manage fittings, process orders, provide support, and update clients on commission progress.",
          },
          {
            title: "Access",
            body: "Client data is handled by authorised studio, support, and owner/admin roles only where needed for a project. Payment details are handled by payment processors and raw card data is not stored by the website.",
          },
          {
            title: "Requests",
            body: "Clients may contact the atelier to request corrections or deletion of account information where legally and operationally possible.",
          },
        ]}
      />
      <Footer />
    </main>
  );
}
