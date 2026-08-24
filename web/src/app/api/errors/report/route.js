import {
  AdminAuthError,
  appendErrorReport,
  readWorkspace,
  requireAdmin,
  writeWorkspace,
} from "../../admin-workspace/utils/workspaceStore.js";
import {
  assertRateLimit,
  fail,
  ok,
  readBody,
} from "../../utils/supabaseRest.js";

export async function POST(request) {
  try {
    assertRateLimit(request, "error-report", { limit: 30 });
    const body = await readBody(request, { maxBytes: 16 * 1024 });
    const report = await appendErrorReport({
      source: body.source,
      severity: body.severity,
      message: body.message,
      context: body.context,
      details: body.details,
      route: body.route,
      occurredAt: body.occurredAt,
      fingerprint: body.fingerprint,
    });
    return ok({ reportId: report.id }, 201);
  } catch (error) {
    const status = error instanceof Error && "status" in error ? error.status : 500;
    return fail(
      status >= 500
        ? "Unable to record error report."
        : error instanceof Error
          ? error.message
          : "Unable to record error report.",
      status,
    );
  }
}

export async function PATCH(request) {
  try {
    assertRateLimit(request, "error-report-update", { limit: 60 });
    const role = requireAdmin(request);
    if (role !== "owner") {
      return fail("Owner access is required to manage error reports.", 403);
    }

    const body = await readBody(request, { maxBytes: 8 * 1024 });
    const status = String(body.status || "").toLowerCase();
    if (!body.id || !["open", "resolved", "dismissed"].includes(status)) {
      return fail("A valid report and status are required.", 400);
    }

    const workspace = await readWorkspace();
    const exists = workspace.errors.some((entry) => entry.id === body.id);
    if (!exists) {
      return fail("Error report was not found.", 404);
    }

    const nextWorkspace = {
      ...workspace,
      errors: workspace.errors.map((entry) =>
        entry.id === body.id
          ? {
              ...entry,
              status,
              reviewedAt: new Date().toISOString(),
              reviewedBy: "Owner / Admin",
            }
          : entry,
      ),
      audit: [
        {
          id: `audit-error-${Date.now()}`,
          actor: "Owner / Admin",
          action: `Marked error ${body.id} as ${status}`,
          time: "Just now",
        },
        ...workspace.audit,
      ],
    };
    const savedWorkspace = await writeWorkspace(nextWorkspace);
    return ok({ workspace: savedWorkspace });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return fail(error.message, error.status);
    }
    const message =
      error instanceof Error ? error.message : "Unable to update error report.";
    const status = error instanceof Error && "status" in error ? error.status : 500;
    return fail(message, status);
  }
}
