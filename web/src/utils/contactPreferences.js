export const CONTACT_METHODS = [
  { value: "whatsapp", label: "WhatsApp", placeholder: "+234 800 000 0000" },
  { value: "instagram", label: "Instagram", placeholder: "@yourhandle" },
  { value: "email", label: "Email", placeholder: "you@example.com" },
  { value: "phone", label: "Phone Call", placeholder: "+234 800 000 0000" },
  { value: "other", label: "Other", placeholder: "Platform and contact details" },
];

export function getContactMethod(method) {
  return (
    CONTACT_METHODS.find((option) => option.value === method) ||
    CONTACT_METHODS[0]
  );
}

export function formatPreferredContact(method, detail) {
  const option = getContactMethod(method);
  const value = String(detail || "").trim();
  return value ? `${option.label}: ${value}` : option.label;
}
