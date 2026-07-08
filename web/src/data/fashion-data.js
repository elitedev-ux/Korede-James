const lineSheetBase = "/assets/linesheet";
const kj25Base = "/assets/kj-25";

function lineSheetProduct({
  sku,
  style,
  category,
  color,
  material = "",
  wholesalePrice = "",
  productInformation,
}) {
  const slug = sku.toLowerCase();
  const price = parseLineSheetPrice(wholesalePrice);

  return {
    id: slug,
    sku,
    name: sku,
    styleName: "",
    archetype: style,
    silhouette: category,
    category,
    price,
    priceLabel: wholesalePrice,
    image: `${lineSheetBase}/${slug}.jpeg`,
    colorImages: {
      [color]: `${lineSheetBase}/${slug}.jpeg`,
    },
    description: productInformation,
    sizes: ["S", "M", "L", "XL"],
    colors: [color],
    fabric: material,
    care: "",
    collection: "Line Sheet - 2026",
  };
}

function parseLineSheetPrice(value) {
  const rawValue = String(value || "").replace(/[^0-9.,]/g, "");

  if (!rawValue) {
    return 0;
  }

  if (rawValue.includes(",") && rawValue.includes(".")) {
    return Math.round(Number.parseFloat(rawValue.replace(/,/g, ""))) || 0;
  }

  if (rawValue.includes(".")) {
    const [, decimalPart = ""] = rawValue.split(".");
    return decimalPart.length === 3
      ? Number(rawValue.replace(/\./g, "")) || 0
      : Math.round(Number.parseFloat(rawValue)) || 0;
  }

  return Number(rawValue.replace(/,/g, "")) || 0;
}

export const products = [
  lineSheetProduct({
    sku: "KJ-SS26-001",
    style: "UNISEX",
    category: "JACKET",
    color: "OFFWHITE",
    wholesalePrice: "N155,000",
    productInformation:
      "Short-sleeve structured jacket with exaggerated shoulders, pointed collar, front pockets.",
  }),
  lineSheetProduct({
    sku: "KJ-SS26-002",
    style: "UNISEX",
    category: "SHIRT & TIE",
    color: "OFFWHITE",
    wholesalePrice: "N105,000",
    productInformation: "Loose-fit short-sleeve shirt with wide collar and tie. ",
  }),
  lineSheetProduct({
    sku: "KJ-SS26-003",
    style: "UNISEX",
    category: "JACKET",
    color: "OFFWHITE",
    wholesalePrice: "N145,000",
    productInformation:
      "Oversized 3/4 -sleeve V-neck jacket with relaxed silhouett.",
  }),
  lineSheetProduct({
    sku: "KJ-SS26-004",
    style: "UNISEX",
    category: "SET",
    color: "OFFWHITE",
    wholesalePrice: "N170,000",
    productInformation: "V-neck loose-fit top and voluminous pants set.",
  }),
  lineSheetProduct({
    sku: "KJ-SS26-005",
    style: "WOMENSWEAR",
    category: "TOP",
    color: "OFFWHITE",
    wholesalePrice: "N75,000",
    productInformation: "V-neck body-fitted short-sleeve top.",
  }),
  lineSheetProduct({
    sku: "KJ-SS26-006",
    style: "WOMENSWEAR",
    category: "SKIRT",
    color: "OFFWHITE",
    wholesalePrice: "N155,000",
    productInformation:
      "High-waist wrap skirt with front slit, side tie straps, and layered panel construction.",
  }),
  lineSheetProduct({
    sku: "KJ-SS26-007",
    style: "WOMENSWEAR",
    category: "COAT",
    color: "OFFWHITE",
    wholesalePrice: "N150,000",
    productInformation: "Long sleevel coat with flap collar.",
  }),
  lineSheetProduct({
    sku: "KJ-SS26-009",
    style: "UNISEX",
    category: "JACKET",
    color: "OFFWHITE",
    wholesalePrice: "N150,000",
    productInformation:
      "Long open-front coat with clean collar and relaxed straight silhouette.",
  }),
  lineSheetProduct({
    sku: "KJ-SS26-011",
    style: "UNISEX",
    category: "COAT",
    color: "OFFWHITE",
    wholesalePrice: "N180,000",
    productInformation:
      "Long relaxed coat with open front, wide lapel effect, and straight hem.",
  }),
  lineSheetProduct({
    sku: "KJ-SS26-012",
    style: "UNISEX",
    category: "SKIRT",
    color: "OFFWHITE",
    wholesalePrice: "N105,000",
    productInformation: "Full-length gathered skirt with high-volume drape.",
  }),
  lineSheetProduct({
    sku: "KJ-SS26-013",
    style: "UNISEX",
    category: "JACKET",
    color: "OFFWHITE",
    wholesalePrice: "N145.000",
    productInformation: "Short structured jacket.",
  }),
  lineSheetProduct({
    sku: "KJ-SS26-014",
    style: "UNISEX",
    category: "PANTS",
    color: "OFFWHITE",
    wholesalePrice: "N120,000",
    productInformation: "Wide cropped pants.",
  }),
  lineSheetProduct({
    sku: "KJ-SS26-015",
    style: "UNISEX",
    category: "TOP",
    color: "OFFWHITE",
    wholesalePrice: "N65,000",
    productInformation: "Deep V-neck relaxed top.",
  }),
  lineSheetProduct({
    sku: "KJ-SS26-016",
    style: "UNISEX",
    category: "PANTS",
    color: "OFFWHITE",
    wholesalePrice: "N105,000",
    productInformation:
      "Layered draped pants silhouette with sculptural volume at hem.",
  }),
  lineSheetProduct({
    sku: "KJ-SS26-017",
    style: "WOMENSWEAR",
    category: "PANTS",
    color: "OFFWHITE",
    wholesalePrice: "N2,000.00",
    productInformation:
      "High-waist wrap-panel pants with wide legs and side tie detail.",
  }),
  lineSheetProduct({
    sku: "KJ-SS26-020",
    style: "UNISEX",
    category: "TOP",
    color: "BEIGE",
    material: "Linen",
    wholesalePrice: "N95,000",
    productInformation:
      "Boxy short-sleeve top with clean neckline and structured relaxed fit.",
  }),
  lineSheetProduct({
    sku: "KJ-SS26-021",
    style: "UNISEX",
    category: "PANTS",
    color: "BEIGE",
    material: "Linen",
    wholesalePrice: "N105,000",
    productInformation:
      "Wide-leg beige pants with tailored front and relaxed straight silhouette.",
  }),
  lineSheetProduct({
    sku: "KJ-SS26-022",
    style: "UNISEX",
    category: "DRESS",
    color: "RED",
    material: "Mesh & Denim",
    wholesalePrice: "N220,000",
    productInformation:
      "Red draped dress with one-shoulder styling and voluminous sleeve/drape detail.",
  }),
  lineSheetProduct({
    sku: "KJ-SS26-023",
    style: "MENSWEAR",
    category: "TOP",
    color: "RED",
    material: "Mesh",
    wholesalePrice: "N75,000",
    productInformation: "Red fitted top with exaggerated  long-sleeve.",
  }),
  lineSheetProduct({
    sku: "KJ-SS26-024",
    style: "MENSWEAR",
    category: "SKIRT",
    color: "BLUE",
    material: "Denim",
    wholesalePrice: "N130,000",
    productInformation: "Dark blue structured skirt with front slit.",
  }),
  lineSheetProduct({
    sku: "KJ-SS26-025",
    style: "MENSWEAR",
    category: "SHIRT",
    color: "BLUE",
    material: "Denim",
    wholesalePrice: "N120,000",
    productInformation: "Dark blue boxy short-sleeve shirt with V/open neckline.",
  }),
];

export const collections = [
  {
    id: "freedom",
    year: "2026",
    title: "SS",
    description: "Line Sheet -  2026",
    coverImage: "/assets/freedom/freedom-cover.jpg",
    gallery: [
      "/assets/freedom/freedom-gallery-01.jpg",
      "/assets/freedom/freedom-gallery-02.jpg",
      "/assets/freedom/freedom-gallery-03.jpg",
      "/assets/freedom/freedom-gallery-04.jpg",
      "/assets/freedom/freedom-gallery-05.jpg",
      "/assets/freedom/freedom-gallery-06.jpg",
      "/assets/freedom/freedom-gallery-07.jpg",
      "/assets/freedom/freedom-detail-01.jpg",
      "/assets/freedom/freedom-detail-02.jpg",
    ],
  },
  {
    id: "fluid-beauty",
    year: "2025",
    title: "Morden Heritage",
    description:
      "The collection explores beauty not as appearance, but as a way of being. Through The blend of sculptural tailoring and draping, fluid silhouettes, and natural textiles, the collection examines the relationship between softness and strength, movement and structure, tradition and modernity.",
    coverImage: `${kj25Base}/SMLD2041.jpeg`,
    previewImage: `${kj25Base}/SMLD1650.jpeg`,
    heroPosition: "center 30%",
    gallery: [
      `${kj25Base}/SMLD1650.jpeg`,
      `${kj25Base}/SMLD1667.jpeg`,
      `${kj25Base}/SMLD1748.jpeg`,
      `${kj25Base}/SMLD1869.jpeg`,
      `${kj25Base}/SMLD1872.jpeg`,
      `${kj25Base}/SMLD1873.jpeg`,
      `${kj25Base}/SMLD1887.jpeg`,
      `${kj25Base}/SMLD1903.jpeg`,
      `${kj25Base}/SMLD1923.jpeg`,
      `${kj25Base}/SMLD1961.jpeg`,
      `${kj25Base}/SMLD1975.jpeg`,
      `${kj25Base}/SMLD1996.jpeg`,
      `${kj25Base}/SMLD2013.jpeg`,
      `${kj25Base}/SMLD2041.jpeg`,
      `${kj25Base}/SMLD2055.jpeg`,
      `${kj25Base}/SMLD2069.jpeg`,
      `${kj25Base}/SMLD2094.jpeg`,
      `${kj25Base}/SMLD2102.jpeg`,
      `${kj25Base}/SMLD2103.jpeg`,
      `${kj25Base}/SMLD2171.jpeg`,
      `${kj25Base}/SMLD2211.jpeg`,
      `${kj25Base}/SMLD2230.jpeg`,
      `${kj25Base}/SMLD2249.jpeg`,
      `${kj25Base}/SMLD2310.jpeg`,
      `${kj25Base}/SMLD2314.jpeg`,
    ],
  },
];

export const testimonials = [];
