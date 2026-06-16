const freedomBase = "/assets/freedom";

export const products = [
  {
    id: "freedom-01",
    name: "Independence Jacket",
    archetype: "Archetype 01",
    silhouette: "The Independence Jacket",
    category: "Outerwear",
    price: 1850,
    image: `${freedomBase}/freedom-product-01.jpg`,
    description:
      "A structured white jacket from Freedom, shaped through Yoruba sartorial language and finished with exposed linear stitching.",
    sizes: ["XS", "S", "M", "L"],
    colors: ["White"],
    fabric: "Structured cotton blend",
    care: "Professional dry clean only.",
    collection: "2025 Freedom",
  },
  {
    id: "freedom-02",
    name: "Inheritance Wrap",
    archetype: "Archetype 02",
    silhouette: "The Inheritance Wrap",
    category: "Tailoring",
    price: 2200,
    image: `${freedomBase}/freedom-product-02.jpg`,
    description:
      "A layered wrap silhouette that carries the weight of tradition while opening into a modern Nigerian form.",
    sizes: ["S", "M", "L"],
    colors: ["White", "Red"],
    fabric: "Cotton canvas with linen finishing",
    care: "Professional dry clean only.",
    collection: "2025 Freedom",
  },
  {
    id: "freedom-03",
    name: "Liberation Robe",
    archetype: "Archetype 03",
    silhouette: "The Liberation Robe",
    category: "Robes",
    price: 2600,
    image: `${freedomBase}/freedom-product-03.jpg`,
    description:
      "A fluid white robe made as a meditation on liberation as an event and freedom as a lived experience.",
    sizes: ["S", "M", "L"],
    colors: ["White"],
    fabric: "Lightweight cotton voile",
    care: "Hand wash cold or dry clean.",
    collection: "2025 Freedom",
  },
  {
    id: "freedom-04",
    name: "Memory Suit",
    archetype: "Archetype 04",
    silhouette: "The Memory Suit",
    category: "Suits",
    price: 3200,
    image: `${freedomBase}/freedom-product-04.jpg`,
    description:
      "A ceremonial suit with sculptural volume, built around the tension between inherited history and imagined futures.",
    sizes: ["38", "40", "42", "44"],
    colors: ["White"],
    fabric: "Cotton twill with hand-finished seams",
    care: "Specialist dry clean only.",
    collection: "2025 Freedom",
  },
];

export const collections = [
  {
    id: "freedom",
    year: "2025",
    title: "Freedom",
    description:
      "Freedom is a meditation on Nigeria's independence in 1960. A return to a moment that promised the birth of a nation. Through the lens of a modern Nigerian, the work reflects on the distance between liberation as an event and freedom as a lived experience. Employing traditional Yoruba silhouettes and sartorial language, it engages history not as something distant, but as a living inheritance, asking what it means to carry the weight of the past while imagining the future.",
    coverImage: `${freedomBase}/freedom-cover.jpg`,
    gallery: [
      `${freedomBase}/freedom-gallery-01.jpg`,
      `${freedomBase}/freedom-gallery-02.jpg`,
      `${freedomBase}/freedom-gallery-03.jpg`,
      `${freedomBase}/freedom-gallery-04.jpg`,
      `${freedomBase}/freedom-gallery-05.jpg`,
      `${freedomBase}/freedom-gallery-06.jpg`,
      `${freedomBase}/freedom-gallery-07.jpg`,
      `${freedomBase}/freedom-detail-01.jpg`,
      `${freedomBase}/freedom-detail-02.jpg`,
    ],
  },
];

export const testimonials = [
  {
    id: "1",
    name: "Isabella Rossi",
    role: "Fashion Critic",
    text: "A masterclass in modern minimalism. Every stitch tells a story of craftsmanship and dedication.",
  },
  {
    id: "2",
    name: "Julian Chen",
    role: "Creative Director",
    text: "The silhouette and choice of fabric are unparalleled. This is what true luxury feels like.",
  },
  {
    id: "3",
    name: "Sophia Laurent",
    role: "Private Client",
    text: "The bespoke service was seamless, and the final piece surpassed all my expectations.",
  },
];
