import { readWorkspace } from "../admin-workspace/utils/workspaceStore.js";
import { ok } from "../utils/supabaseRest.js";

export async function GET() {
  const workspace = await readWorkspace();
  const products = workspace.pieces
    .filter((piece) => piece.visibility === "Visible")
    .filter((piece) => piece.availability !== "Archived")
    .map((piece) => ({
      id: piece.id,
      name: piece.title,
      archetype: piece.category || "Atelier Piece",
      silhouette: piece.title,
      category: piece.category || "Atelier",
      price: parseBudgetValue(piece.budget),
      image: piece.image || Object.values(piece.colorImages || {})[0] || "",
      colorImages: normalizeColorImages(piece.colorImages),
      description: piece.description || "A commissionable piece from the Korede James atelier.",
      sizes: ["S", "M", "L"],
      colors: normalizeColors(piece.colors, piece.colorImages),
      fabric: piece.fabric || "Confirmed by atelier",
      care: piece.care || "Care instructions confirmed after commission review.",
      collection: piece.collection || "Atelier Desk",
      source: "admin",
    }));

  return ok({ products });
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

  return merged.length ? merged : ["White"];
}

function normalizeColorImages(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function parseBudgetValue(value) {
  const [firstAmount] = String(value || "").match(/\d[\d,]*/g) || [];
  return Number(String(firstAmount || "0").replace(/,/g, "")) || 0;
}
