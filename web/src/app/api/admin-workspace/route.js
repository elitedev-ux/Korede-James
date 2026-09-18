import {
  AdminAuthError,
  readWorkspace,
  normalizeWorkspace,
  requireAdmin,
  writeWorkspace,
} from "./utils/workspaceStore.js";
import { notifyCommissionProgressUpdates } from "../utils/email.js";
import {
  assertRateLimit,
  assertSameOrigin,
  fail,
  MAX_ADMIN_BODY_BYTES,
  ok,
  readBody,
} from "../utils/supabaseRest.js";

export async function GET(request) {
  try {
    await assertRateLimit(request, "admin-workspace-read", { limit: 120 });
    const role = requireAdmin(request);
    const fullWorkspace = await readWorkspace();
    const workspace = workspaceForRole(fullWorkspace, role);
    return ok({ workspace, role });
  } catch (error) {
    return handleWorkspaceError(error, "Unable to load admin workspace.");
  }
}

export async function PATCH(request) {
  try {
    assertSameOrigin(request);
    await assertRateLimit(request, "admin-workspace-write", { limit: 60 });
    const role = requireAdmin(request);
    const body = await readBody(request, { maxBytes: MAX_ADMIN_BODY_BYTES });
    const previousWorkspace = await readWorkspace();
    const scopedWorkspace = scopeWorkspaceUpdate({
      previousWorkspace,
      nextWorkspace: body.workspace,
      role,
    });
    const workspace = await writeWorkspace(scopedWorkspace);
    await notifyCommissionProgressUpdates({
      previousWorkspace,
      nextWorkspace: workspace,
    });
    return ok({ workspace: workspaceForRole(workspace, role), role });
  } catch (error) {
    return handleWorkspaceError(error, "Unable to save admin workspace.");
  }
}

function scopeWorkspaceUpdate({ previousWorkspace, nextWorkspace, role }) {
  const previous = normalizeWorkspace(previousWorkspace);
  const next = normalizeWorkspace(nextWorkspace);

  if (role === "owner") {
    return {
      ...next,
      orders: protectGatewayPaymentFields(previous.orders, next.orders),
    };
  }

  if (role === "editor") {
    return {
      ...previous,
      pieces: next.pieces,
      content: next.content,
      promotions: scopeEditorPromotions(previous.promotions, next.promotions),
      newsletterSegments: next.newsletterSegments,
    };
  }

  if (role === "studio") {
    return {
      ...previous,
      requests: mergeOperationalRequestUpdates(
        previous.requests,
        next.requests,
        role,
      ),
      measurements: next.measurements,
      materials: mergeStudioMaterials(previous.materials, next.materials),
    };
  }

  if (role === "support") {
    return {
      ...previous,
      requests: mergeOperationalRequestUpdates(
        previous.requests,
        next.requests,
        role,
      ),
      customers: mergeCustomerNotes(previous.customers, next.customers),
    };
  }

  throw new AdminAuthError();
}

function workspaceForRole(workspace, role) {
  const full = normalizeWorkspace(workspace);
  if (role === "owner") {
    return full;
  }

  const scoped = normalizeWorkspace({});
  if (role === "editor") {
    return {
      ...scoped,
      pieces: full.pieces,
      content: full.content,
      promotions: full.promotions,
      newsletterSegments: full.newsletterSegments,
      newsletterUpdates: full.newsletterUpdates,
    };
  }

  if (role === "studio") {
    return {
      ...scoped,
      requests: full.requests.map(redactFinancialRequestFields),
      measurements: full.measurements,
      materials: full.materials.map(redactMaterialCosts),
    };
  }

  if (role === "support") {
    return {
      ...scoped,
      requests: full.requests.map(redactFinancialRequestFields),
      customers: full.customers,
      orders: full.orders.map(publicSupportOrder),
    };
  }

  return scoped;
}

function mergeOperationalRequestUpdates(previousRequests, nextRequests, role) {
  assertSameRecords(previousRequests, nextRequests, "requests");
  const allowedStatuses = new Set(
    role === "studio"
      ? [
          "Inquiry received",
          "In progress - Consultation",
          "In progress - Toile & Fittings",
          "Revisions requested",
          "Completed / delivered",
        ]
      : [
          "Inquiry received",
          "Quoted",
          "In progress - Consultation",
          "In progress - Toile & Fittings",
          "Revisions requested",
          "Completed / delivered",
          "Archived",
        ],
  );
  const nextById = new Map(nextRequests.map((entry) => [entry.id, entry]));

  return previousRequests.map((previous) => {
    const proposed = nextById.get(previous.id);
    const status = String(proposed.status || previous.status);
    const stage = String(proposed.stage || previous.stage);
    if (
      (status !== previous.status && !allowedStatuses.has(status)) ||
      (stage !== previous.stage && !allowedStatuses.has(stage))
    ) {
      const error = new Error("That role cannot set the requested commission status.");
      error.status = 403;
      throw error;
    }
    return {
      ...previous,
      status,
      stage,
      notes: limitedText(proposed.notes, 10_000),
      updated: "Just now",
    };
  });
}

function mergeCustomerNotes(previousCustomers, nextCustomers) {
  assertSameRecords(previousCustomers, nextCustomers, "customers", "email");
  const nextByEmail = new Map(
    nextCustomers.map((entry) => [String(entry.email).toLowerCase(), entry]),
  );
  return previousCustomers.map((previous) => {
    const proposed = nextByEmail.get(String(previous.email).toLowerCase());
    return {
      ...previous,
      note: limitedText(proposed.note, 2_000),
      notes: limitedText(proposed.notes, 10_000),
    };
  });
}

function assertSameRecords(previous, next, label, key = "id") {
  const previousIds = previous.map((entry) => String(entry[key] || "")).sort();
  const nextIds = next.map((entry) => String(entry[key] || "")).sort();
  if (JSON.stringify(previousIds) !== JSON.stringify(nextIds)) {
    const error = new Error(`That role cannot add or remove ${label}.`);
    error.status = 403;
    throw error;
  }
}

function protectGatewayPaymentFields(previousOrders, nextOrders) {
  const previousById = new Map(previousOrders.map((order) => [order.id, order]));
  const protectedKeys = [
    "paystackReference",
    "paystackExpectedAmountMinor",
    "paystackExpectedCurrency",
    "paystackExpectedEmail",
    "paystackExpectedSource",
    "paymentStatus",
    "paymentConfirmedAt",
  ];
  const protectedOrders = nextOrders.map((order) => {
    const previous = previousById.get(order.id);
    if (!previous?.paystackReference) {
      return order;
    }
    return {
      ...order,
      ...Object.fromEntries(protectedKeys.map((key) => [key, previous[key]])),
    };
  });
  const nextIds = new Set(protectedOrders.map((order) => order.id));
  return [
    ...protectedOrders,
    ...previousOrders.filter(
      (order) => order.paystackReference && !nextIds.has(order.id),
    ),
  ];
}

function scopeEditorPromotions(previousPromotions, nextPromotions) {
  const previousById = new Map(
    previousPromotions.map((promotion) => [
      promotion.id || promotion.title,
      promotion,
    ]),
  );
  return nextPromotions.map((promotion) => {
    const previous = previousById.get(promotion.id || promotion.title);
    return {
      ...promotion,
      status: previous?.status || "Draft",
      ownerApproval: previous?.ownerApproval || "Required",
    };
  });
}

function mergeStudioMaterials(previousMaterials, nextMaterials) {
  const previousById = new Map(
    previousMaterials.map((material) => [material.id || material.title, material]),
  );
  return nextMaterials.map((material) => {
    const previous = previousById.get(material.id || material.title) || {};
    return {
      ...material,
      ...Object.fromEntries(
        ["cost", "price", "supplierPrice"].map((key) => [key, previous[key]]),
      ),
    };
  });
}

function redactFinancialRequestFields(request) {
  return { ...request, budget: "Restricted" };
}

function redactMaterialCosts(material) {
  const { cost, price, supplierPrice, ...safeMaterial } = material || {};
  return safeMaterial;
}

function publicSupportOrder(order) {
  return {
    id: order.id,
    customer: order.customer,
    total: order.total,
    status: order.status,
    refundLimit: order.refundLimit,
  };
}

function limitedText(value, maxLength) {
  return String(value || "").replace(/\r/g, "").trim().slice(0, maxLength);
}

function handleWorkspaceError(error, fallbackMessage) {
  if (error instanceof AdminAuthError) {
    return fail(error.message, error.status);
  }

  const message =
    error instanceof Error ? error.message : fallbackMessage;
  const status =
    error instanceof Error && "status" in error
      ? error.status
      : message.includes("Supabase is not configured")
        ? 503
        : 400;
  return fail(message || fallbackMessage, status);
}
