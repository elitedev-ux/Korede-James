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
  fail,
  MAX_ADMIN_BODY_BYTES,
  ok,
  readBody,
} from "../utils/supabaseRest.js";

export async function GET(request) {
  try {
    assertRateLimit(request, "admin-workspace-read", { limit: 120 });
    const role = requireAdmin(request);
    const workspace = await readWorkspace();
    return ok({ workspace, role });
  } catch (error) {
    return handleWorkspaceError(error, "Unable to load admin workspace.");
  }
}

export async function PATCH(request) {
  try {
    assertRateLimit(request, "admin-workspace-write", { limit: 60 });
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
    return ok({ workspace, role });
  } catch (error) {
    return handleWorkspaceError(error, "Unable to save admin workspace.");
  }
}

function scopeWorkspaceUpdate({ previousWorkspace, nextWorkspace, role }) {
  const previous = normalizeWorkspace(previousWorkspace);
  const next = normalizeWorkspace(nextWorkspace);

  if (role === "owner") {
    return next;
  }

  const allowedKeysByRole = {
    editor: ["pieces", "content", "promotions"],
    studio: ["requests", "measurements", "materials"],
    support: ["requests", "customers", "orders"],
  };
  const allowedKeys = allowedKeysByRole[role] || [];

  return {
    ...previous,
    ...Object.fromEntries(allowedKeys.map((key) => [key, next[key]])),
  };
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
