import {
  readWorkspace,
  writeWorkspace,
} from "../admin-workspace/utils/workspaceStore.js";
import { fail, ok } from "../utils/supabaseRest.js";
import {
  getPublicProductsFromWorkspace,
  seedWorkspaceProducts,
} from "../../../utils/productCatalog.js";

export async function GET() {
  try {
    const storedWorkspace = await readWorkspace();
    const seededCatalogue = seedWorkspaceProducts(storedWorkspace);
    const workspace = seededCatalogue.seeded
      ? await writeWorkspace(seededCatalogue.workspace)
      : seededCatalogue.workspace;
    const products = getPublicProductsFromWorkspace(workspace);

    return ok({ products });
  } catch (error) {
    console.error("Public product catalogue failed:", error);
    return fail("Product service is temporarily unavailable.", 503);
  }
}
