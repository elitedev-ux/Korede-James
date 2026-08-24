import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Upload, Calendar, Send, CheckCircle2 } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import { recordAdminInquiry } from "../../utils/adminWorkspace";
import { getCustomerSession } from "../../utils/customerAccount";
import { uploadSiteFile } from "../../utils/uploads";
import { useRegion } from "../../context/RegionContext";
import { formatMoney } from "../../utils/pricing";

const BUDGET_OPTIONS = [
  {
    id: "signature",
    minimum: { NGN: 5_000_000, USD: 5_000 },
    maximum: { NGN: 10_000_000, USD: 10_000 },
  },
  {
    id: "couture",
    minimum: { NGN: 10_000_000, USD: 10_000 },
    maximum: { NGN: 25_000_000, USD: 25_000 },
  },
  {
    id: "collector",
    minimum: { NGN: 25_000_000, USD: 25_000 },
  },
];

function formatBudgetOption(option, currency) {
  const minimum = formatMoney(option.minimum[currency], currency);
  return option.maximum
    ? `${minimum} - ${formatMoney(option.maximum[currency], currency)}`
    : `${minimum}+`;
}

export default function CommissionPage() {
  const { currency } = useRegion();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [referenceFiles, setReferenceFiles] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "Evening Wear",
    budget: BUDGET_OPTIONS[0].id,
    date: "",
    measurements: "",
    notes: "",
  });

  useEffect(() => {
    let isMounted = true;

    getCustomerSession()
      .then((customer) => {
        if (!isMounted || !customer) {
          return;
        }

        setFormData((current) => ({
          ...current,
          name:
            current.name ||
            [customer.firstName, customer.lastName].filter(Boolean).join(" "),
          email: current.email || customer.email,
        }));
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const selectedBudget =
        BUDGET_OPTIONS.find((option) => option.id === formData.budget) ||
        BUDGET_OPTIONS[0];
      const attachments = await Promise.all(
        referenceFiles.map((file) =>
          uploadSiteFile(file, {
            scope: "commission-reference",
            optimizeImage: file.type?.startsWith("image/"),
          }),
        ),
      );
      const request = await recordAdminInquiry({
        client: formData.name,
        email: formData.email,
        artifact: formData.type,
        budget: formatBudgetOption(selectedBudget, currency),
        due: formData.date,
        source: "Bespoke enquiry",
        notes: [
          formData.measurements ? `Measurements: ${formData.measurements}` : "",
          attachments.length
            ? `Reference files:\n${attachments
                .map((file) => `${file.name}: ${file.url}`)
                .join("\n")}`
            : "",
          formData.notes,
        ]
          .filter(Boolean)
          .join("\n\n"),
        attachments,
      });
      setSubmittedId(request.id);
      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to send inquiry. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReferenceFiles = (files) => {
    setReferenceFiles(Array.from(files || []));
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          <div>
            <SectionTitle
              title="The Bespoke Service"
              subtitle="Custom Design"
              align="left"
            />
            <p className="text-gray-500 font-light leading-relaxed tracking-wide mb-12">
              Bespoke service is an intimate creative alliance with Korede
              James. A path to a completely custom artifact.
            </p>

            <div className="space-y-12">
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-[#fafafa] flex items-center justify-center shrink-0 border border-gray-100">
                  <span className="font-serif text-sm">01</span>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3">
                    Consultation
                  </h4>
                  <p className="text-xs text-gray-400 font-light leading-relaxed">
                    Discuss your vision, silhouette preferences, and fabric
                    options with our design team.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-[#fafafa] flex items-center justify-center shrink-0 border border-gray-100">
                  <span className="font-serif text-sm">02</span>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3">
                    Toile & Fittings
                  </h4>
                  <p className="text-xs text-gray-400 font-light leading-relaxed">
                    Multiple fittings ensure a silhouette that fits like a
                    second skin.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-[#fafafa] flex items-center justify-center shrink-0 border border-gray-100">
                  <span className="font-serif text-sm">03</span>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3">
                    The Revelation
                  </h4>
                  <p className="text-xs text-gray-400 font-light leading-relaxed">
                    The final masterpiece is revealed, finished with artisanal
                    care.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-20 p-8 bg-black text-white">
              <h4 className="text-xs uppercase tracking-[0.2em] mb-4">
                Estimated Timeline
              </h4>
              <p className="text-2xl font-serif mb-6 italic">1 - 4 Weeks</p>
              <p className="text-[10px] text-gray-400 tracking-widest uppercase">
                From initial concept to final delivery.
              </p>
            </div>
          </div>

          <div className="bg-[#fafafa] p-10 md:p-16 border border-gray-100 shadow-sm relative">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center"
              >
                <CheckCircle2
                  size={64}
                  className="text-amber-600 mb-8"
                  strokeWidth={1}
                />
                <h3 className="text-2xl font-serif tracking-widest uppercase mb-4">
                  Inquiry Received
                </h3>
                <p className="text-[10px] uppercase tracking-[0.3em] text-amber-700 mb-5">
                  {submittedId}
                </p>
                <p className="text-gray-500 font-light text-sm tracking-wide mb-8">
                  A design consultant will contact you within 48 hours to
                  schedule your initial consultation.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-[10px] uppercase tracking-widest font-bold border-b border-black pb-1 hover:text-amber-600 hover:border-amber-600 transition-all"
                >
                  Start Another Inquiry
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      Full Name
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      Email Address
                    </label>
                    <input
                      required
                      type="email"
                      className="w-full bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      Artifact
                    </label>
                    <select
                      className="w-full bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    >
                      <option>Evening Wear</option>
                      <option>Bridal</option>
                      <option>Outerwear</option>
                      <option>Bespoke Suit</option>
                      <option>Others</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      Target Budget
                    </label>
                    <select
                      className="w-full bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                      value={formData.budget}
                      onChange={(e) =>
                        setFormData({ ...formData, budget: e.target.value })
                      }
                    >
                      {BUDGET_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {formatBudgetOption(option, currency)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                    Preferred Delivery Date
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"
                      size={18}
                    />
                    <input
                      type="date"
                      className="w-full bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                    Reference / Inspiration
                  </label>
                  <label
                    className="block border-2 border-dashed border-gray-200 rounded-lg p-8 text-center bg-white hover:border-black transition-colors cursor-pointer group"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleReferenceFiles(event.dataTransfer.files);
                    }}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      className="sr-only"
                      onChange={(event) => handleReferenceFiles(event.target.files)}
                    />
                    <Upload
                      size={24}
                      className="mx-auto text-gray-300 group-hover:text-black mb-4 transition-colors"
                    />
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">
                      Drag files here or click to upload
                    </p>
                    {referenceFiles.length ? (
                      <div className="mt-5 space-y-2 text-left">
                        {referenceFiles.map((file) => (
                          <p
                            className="truncate text-[10px] uppercase tracking-widest text-black"
                            key={`${file.name}-${file.size}`}
                          >
                            {file.name}
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                    Personal Requirements / Notes
                  </label>
                  <textarea
                    rows="4"
                    className="w-full bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                    placeholder="Describe your vision, preferred colors, or specific silhouette requirements..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.4em] font-semibold hover:bg-amber-800 transition-all flex items-center justify-center space-x-4 group"
                >
                  <Send
                    size={16}
                    className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform"
                  />
                  <span>{isSubmitting ? "Sending..." : "Send Inquiry"}</span>
                </button>
                {submitError ? (
                  <p className="border border-red-100 bg-red-50 px-5 py-4 text-xs text-red-800">
                    {submitError}
                  </p>
                ) : null}
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
