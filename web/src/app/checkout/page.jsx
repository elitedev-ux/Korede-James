import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, ShoppingBag } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import useStore from "../../store/useStore";
import { recordAdminOrder } from "../../utils/adminWorkspace";

export default function CheckoutPage() {
  const { cart, clearCart } = useStore();
  const [orderId, setOrderId] = useState("");
  const [submittedBlueprint, setSubmittedBlueprint] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const firstName = String(form.get("firstName") || "").trim();
    const lastName = String(form.get("lastName") || "").trim();
    setIsSubmitting(true);

    try {
      const order = await recordAdminOrder({
        customer: {
          name: [firstName, lastName].filter(Boolean).join(" ") || "Website Client",
          email: String(form.get("email") || "").trim(),
          phone: String(form.get("phone") || "").trim(),
        },
        contact: String(form.get("phone") || "").trim(),
        shipping: [
          form.get("address"),
          form.get("city"),
          form.get("region"),
          form.get("postalCode"),
          form.get("country"),
        ]
          .filter(Boolean)
          .join(", "),
        items: cart,
      });
      setSubmittedBlueprint(cart);
      setOrderId(order.id);
      clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderId) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <section className="pt-40 pb-32 px-6 max-w-5xl mx-auto">
          <CheckCircle2
            size={54}
            strokeWidth={1}
            className="mx-auto mb-8 text-amber-700"
          />
          <div className="text-center">
            <SectionTitle title="Commission Received" subtitle={orderId} />
          </div>
          <p className="text-gray-500 font-light leading-relaxed mb-12 text-center max-w-2xl mx-auto">
            Thank you. Your commission request has been received. A member of the
            Korede James team will contact you to confirm measurements, delivery
            details, and the next atelier steps. No payment has been collected.
          </p>
          <div className="space-y-8 mb-12">
            {submittedBlueprint.map((item, index) => (
              <ArtifactBlueprint key={`${item.id}-${index}`} item={item} />
            ))}
          </div>
          <div className="text-center">
            <a
              href={`/track?commission=${encodeURIComponent(orderId)}`}
              className="inline-flex items-center justify-center bg-black text-white px-12 py-5 text-[10px] uppercase tracking-[0.35em] font-semibold hover:bg-amber-800 transition-colors"
            >
              Track Commission
            </a>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-40 pb-32 px-6 max-w-7xl mx-auto">
        <a
          href="/cart"
          className="inline-flex items-center space-x-2 text-[10px] uppercase tracking-widest mb-12 hover:text-amber-600 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Brief</span>
        </a>

        <SectionTitle title="Artifact Blueprint" subtitle="Commission Register" />

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <ShoppingBag
              size={48}
              className="text-gray-100 mb-8"
              strokeWidth={1}
            />
            <h3 className="text-xl font-serif tracking-widest uppercase mb-4">
              No commission started
            </h3>
            <p className="text-gray-400 text-xs tracking-widest mb-12 uppercase">
              Select a design before continuing with your commission.
            </p>
            <a
              href="/products"
              className="bg-black text-white px-12 py-5 text-[10px] uppercase tracking-[0.4em] font-semibold hover:bg-amber-800 transition-all"
            >
              Explore Designs
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <form
              onSubmit={handleSubmit}
              className="lg:col-span-2 space-y-12"
            >
              <CheckoutSection title="Custodian Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="First Name" name="firstName" required />
                  <Field label="Last Name" name="lastName" required />
                  <Field
                    label="Email Address"
                    name="email"
                    type="email"
                    required
                  />
                  <Field label="Phone Number" name="phone" required />
                </div>
              </CheckoutSection>

              <CheckoutSection title="Transit Information">
                <div className="grid grid-cols-1 gap-4">
                  <Field label="Address" name="address" required />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="City" name="city" required />
                    <Field label="State / Region" name="region" required />
                    <Field label="Postal Code" name="postalCode" required />
                  </div>
                  <Field label="Country" name="country" required />
                </div>
              </CheckoutSection>

              <CheckoutSection title="Submission">
                <p className="text-xs font-light leading-loose text-gray-500">
                  This order is submitted for atelier review only. No card,
                  deposit, or payment is required to test or begin the request.
                </p>
              </CheckoutSection>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.4em] font-semibold hover:bg-amber-800 transition-all"
              >
                {isSubmitting ? "Submitting..." : "Submit Commission"}
              </button>
            </form>

            <aside className="lg:col-span-1">
              <div className="bg-[#fbfaf7] p-8 md:p-10 border border-gray-200 sticky top-40">
                <h3 className="text-xs uppercase tracking-[0.28em] font-bold mb-3">
                  Artifact Blueprint
                </h3>
                <p className="text-[9px] uppercase tracking-[0.24em] text-gray-400 leading-loose mb-8 pb-6 border-b border-gray-200">
                  Technical commission sheet prepared from your selected form,
                  palette, proportions, and archival notes.
                </p>

                <div className="space-y-8 mb-10">
                  {cart.map((item) => (
                    <ArtifactBlueprint
                      key={`${item.id}-${item.size}-${item.color}`}
                      item={item}
                    />
                  ))}
                </div>

                <div className="space-y-5 text-xs tracking-widest border-t border-gray-200 pt-6">
                  <SummaryLine label="Registered Value" value="Atelier quote pending" />
                  <SummaryLine label="Transit" value="Confirmed after review" />
                  <SummaryLine label="Payment" value="Not required now" />
                  <SummaryLine label="Total Due" value="No payment due" />
                </div>

                <p className="mt-8 text-[9px] uppercase tracking-widest text-gray-400 leading-loose">
                  Workshop timeline: 1 - 4 weeks from commission submission.
                </p>
              </div>
            </aside>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

function CheckoutSection({ title, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#fafafa] p-8 md:p-10 border border-gray-100"
    >
      <h3 className="text-xs uppercase tracking-[0.2em] font-bold mb-8 pb-4 border-b border-gray-200">
        {title}
      </h3>
      {children}
    </motion.section>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="block text-[9px] uppercase tracking-[0.3em] text-gray-400 mb-3">
        {label}
      </span>
      <input
        {...props}
        className="w-full bg-white border border-gray-200 px-5 py-4 text-sm focus:outline-none focus:border-black transition-colors"
      />
    </label>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400 uppercase">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function ArtifactBlueprint({ item }) {
  return (
    <section className="bg-white border border-gray-200 p-6">
      <div className="flex gap-5 pb-6 border-b border-gray-100">
        <div className="w-24 aspect-[4/5] bg-[#f8f8f6] overflow-hidden shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.3em] text-amber-700 mb-3">
            {item.archetype || "Artifact Form"}
          </p>
          <h4 className="text-sm font-serif uppercase tracking-[0.18em] leading-relaxed">
            {item.silhouette || item.name}
          </h4>
          <p className="mt-3 text-[9px] uppercase tracking-[0.22em] text-gray-400">
            Archive pending serial assignment
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-5 py-6 border-b border-gray-100">
        <SpecLine label="Palette" value={item.color || "Not selected"} />
        <SpecLine label="Proportion" value={item.size || "Not selected"} />
        <SpecLine label="Quantity" value={item.quantity || 1} />
        <SpecLine label="Form" value={item.name} />
      </div>

      <div className="space-y-5 pt-6">
        <SpecBlock
          label="Tailoring Proportions"
          value={item.tailoringNotes || "No additional tailoring proportions entered."}
        />
        <SpecBlock
          label="Archival Notes"
          value={item.archivalNotes || "No archival notes entered."}
        />
      </div>
    </section>
  );
}

function SpecLine({ label, value }) {
  return (
    <div>
      <p className="text-[8px] uppercase tracking-[0.28em] text-gray-400 mb-2">
        {label}
      </p>
      <p className="text-[10px] uppercase tracking-[0.18em] font-semibold leading-relaxed">
        {value}
      </p>
    </div>
  );
}

function SpecBlock({ label, value }) {
  return (
    <div>
      <p className="text-[8px] uppercase tracking-[0.28em] text-gray-400 mb-2">
        {label}
      </p>
      <p className="text-xs text-gray-500 font-light leading-relaxed">
        {value}
      </p>
    </div>
  );
}
