import { products as lineSheetProducts } from "../data/fashion-data";
import { createPrices } from "./pricing";

const DEFAULT_PRODUCT_PRICE = 2000;

export function seedWorkspaceProducts(workspace) {
  const currentWorkspace = workspace && typeof workspace === "object" ? workspace : {};
  const pieces = Array.isArray(currentWorkspace.pieces) ? currentWorkspace.pieces : [];
  const existingIds = new Set(pieces.map((piece) => String(piece.id || "")));
  const missingPieces = lineSheetProducts
    .filter((product) => !existingIds.has(product.id))
    .map(productToAdminPiece);

  if (!missingPieces.length) {
    if (currentWorkspace.catalogSeededAt) {
      return { workspace: currentWorkspace, seeded: false };
    }

    return {
      workspace: {
        ...currentWorkspace,
        catalogSeededAt: new Date().toISOString(),
      },
      seeded: true,
    };
  }

  return {
    workspace: {
      ...currentWorkspace,
      pieces: [...pieces, ...missingPieces],
      catalogSeededAt: new Date().toISOString(),
    },
    seeded: true,
  };
}

export function getPublicProductsFromWorkspace(workspace) {
  const { workspace: seededWorkspace } = seedWorkspaceProducts(workspace);
  const pieces = Array.isArray(seededWorkspace.pieces) ? seededWorkspace.pieces : [];

  return pieces
    .filter((piece) => piece.visibility !== "Hidden")
    .filter((piece) => piece.availability !== "Archived")
    .map(pieceToPublicProduct);
}

export function productToAdminPiece(product) {
  const prices = createPrices({
    NGN: product?.prices?.NGN ?? product?.price ?? DEFAULT_PRODUCT_PRICE,
    USD: product?.prices?.USD,
  });

  return {
    id: product.id,
    sku: product.sku || product.name || product.id,
    title: product.name || product.sku || product.id,
    category: product.category || "Atelier",
    image: product.image || "",
    colors: Array.isArray(product.colors) && product.colors.length ? product.colors : ["OFFWHITE"],
    colorImages: normalizeColorImages(product.colorImages),
    visibility: "Visible",
    availability: "Available",
    budget: product.priceLabel || formatBudget(prices.NGN),
    prices,
    description: product.description || "",
    fabric: product.fabric || "",
    care: product.care || "",
    collection: product.collection || "",
    archetype: product.archetype || "",
    sizes: Array.isArray(product.sizes) && product.sizes.length ? product.sizes : ["S", "M", "L", "XL"],
    shipping: normalizeShipping(product.shipping),
    source: "linesheet",
  };
}

export function pieceToPublicProduct(piece) {
  const price = getPieceNgnPrice(piece);
  const prices = createPrices({
    NGN: piece?.prices?.NGN ?? price,
    USD: piece?.prices?.USD,
  });
  const colorImages = normalizeColorImages(piece?.colorImages);
  const image = piece?.image || Object.values(colorImages)[0] || "";
  const colors = normalizeColors(piece?.colors, colorImages);

  return {
    id: piece.id,
    sku: piece.sku || piece.id,
    name: piece.title || piece.sku || piece.id,
    styleName: piece.styleName || "",
    archetype: piece.archetype || piece.category || "Atelier Piece",
    silhouette: piece.category || piece.title || "Atelier Piece",
    category: piece.category || "Atelier",
    price: prices.NGN,
    prices,
    priceLabel: piece.budget || formatBudget(prices.NGN),
    image,
    colorImages,
    description: piece.description || "A commissionable piece from the Korede James atelier.",
    sizes: Array.isArray(piece.sizes) && piece.sizes.length ? piece.sizes : ["S", "M", "L", "XL"],
    colors,
    fabric: piece.fabric || "Confirmed by atelier",
    care: piece.care || "Care instructions confirmed after commission review.",
    collection: piece.collection || "Atelier Desk",
    shipping: normalizeShipping(piece.shipping),
    source: piece.source || "admin",
  };
}

function getPieceNgnPrice(piece) {
  return (
    normalizeAmount(piece?.prices?.NGN) ||
    normalizeAmount(piece?.price) ||
    parseMoney(piece?.budget) ||
    DEFAULT_PRODUCT_PRICE
  );
}

function normalizeColors(colors, colorImages) {
  const listedColors = Array.isArray(colors)
    ? colors
    : String(colors || "")
        .split(",")
        .map((color) => color.trim());
  const imageColors = Object.keys(colorImages || {});
  const merged = [...new Set([...listedColors, ...imageColors])]
    .map((color) => String(color).trim())
    .filter(Boolean);

  return merged.length ? merged : ["OFFWHITE"];
}

function normalizeColorImages(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeShipping(value) {
  if (!value || typeof value !== "object") {
    return {};
  }

  const shipping = {
    weightKg: normalizeDecimal(value.weightKg),
    lengthCm: normalizeDecimal(value.lengthCm),
    widthCm: normalizeDecimal(value.widthCm),
    heightCm: normalizeDecimal(value.heightCm),
  };

  return Object.fromEntries(
    Object.entries(shipping).filter(([, amount]) => amount > 0),
  );
}

function parseMoney(value) {
  const rawValue = String(value || "").replace(/[^0-9.,]/g, "");

  if (!rawValue) {
    return 0;
  }

  if (rawValue.includes(",") && rawValue.includes(".")) {
    return normalizeAmount(Number.parseFloat(rawValue.replace(/,/g, "")));
  }

  if (rawValue.includes(".")) {
    const [, decimalPart = ""] = rawValue.split(".");
    return decimalPart.length === 3
      ? normalizeAmount(Number(rawValue.replace(/\./g, "")))
      : normalizeAmount(Number.parseFloat(rawValue));
  }

  return normalizeAmount(Number(rawValue.replace(/,/g, "")));
}

function normalizeAmount(value) {
  const amount = Number(value) || 0;
  return Math.max(0, Math.round(amount));
}

function normalizeDecimal(value) {
  const amount = Number(value) || 0;
  return Math.max(0, Math.round(amount * 10) / 10);
}

function formatBudget(value) {
  const amount = normalizeAmount(value) || DEFAULT_PRODUCT_PRICE;
  return `N${amount.toLocaleString("en-US")}`;
}
