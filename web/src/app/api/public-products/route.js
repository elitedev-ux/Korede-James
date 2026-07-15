import { readWorkspace } from "../admin-workspace/utils/workspaceStore.js";
import { ok } from "../utils/supabaseRest.js";
import { getPublicProductsFromWorkspace } from "../../../utils/productCatalog.js";

export async function GET() {
  let workspace = {};

  try {
    workspace = await readWorkspace();
  } catch {
    workspace = {};
  }

  const products = getPublicProductsFromWorkspace(workspace);

  return ok({ products });
}
