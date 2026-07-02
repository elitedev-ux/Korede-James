import { readWorkspace } from "../../admin-workspace/utils/workspaceStore.js";
import { fail, ok, readCustomerSession } from "../utils/customerAuth.js";

export async function GET(request) {
  try {
    const customer = readCustomerSession(request);

    if (!customer?.email) {
      return fail("Sign in to view your commissions.", 401);
    }

    const workspace = await readWorkspace();
    const email = normalizeEmail(customer.email);
    const ordersByRequestId = new Map(
      workspace.orders.map((order) => [normalizeLookup(`req-${order.id}`), order])
    );

    const commissions = workspace.requests
      .filter((request) => normalizeEmail(request.email) === email)
      .map((request) => {
        const matchingOrder = ordersByRequestId.get(normalizeLookup(request.id));
        const displayId = matchingOrder?.id || request.id;

        return {
          id: request.id,
          displayId,
          artifact: request.artifact,
          status: request.status,
          stage: request.stage,
          updated: request.updated,
          budget: request.budget,
        };
      });

    return ok({ commissions });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load commissions.";
    const status = message.includes("Supabase is not configured") ? 503 : 400;
    return fail(message, status);
  }
}

function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

function normalizeLookup(value = "") {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}
