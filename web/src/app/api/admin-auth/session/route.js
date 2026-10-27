import {
  AdminAuthError,
  authenticateAdminCode,
  clearAdminSessionCookie,
  createAdminSessionCookie,
  requireAdmin,
} from "../../admin-workspace/utils/workspaceStore.js";
import {
  assertRateLimit,
  assertSameOrigin,
  fail,
  ok,
  readBody,
} from "../../utils/supabaseRest.js";

export async function GET(request) {
  try {
    await assertRateLimit(request, "admin-session-read", { limit: 60 });
    return ok({ authenticated: true, role: requireAdmin(request) });
  } catch (error) {
    return handleAdminAuthError(error);
  }
}

export async function POST(request) {
  let stage = "origin_check";
  try {
    assertSameOrigin(request);
    stage = "rate_limit";
    await assertRateLimit(request, "admin-login", { limit: 8 });
    stage = "request_body";
    const body = await readBody(request, { maxBytes: 2 * 1024 });
    stage = "admin_code";
    const role = authenticateAdminCode(body.code);
    stage = "session_cookie";
    return ok(
      { authenticated: true, role },
      { headers: { "Set-Cookie": createAdminSessionCookie(role, request) } },
    );
  } catch (error) {
    const status = error instanceof Error && "status" in error ? error.status : 500;
    if (status >= 500) {
      // Log only controlled metadata: never the request, credentials, or raw error.
      console.error("Admin login failed", {
        stage,
        status,
        reason: error instanceof Error && error.message === "Admin authentication is not configured."
          ? "admin_configuration_invalid"
          : "server_error",
      });
    }
    return handleAdminAuthError(error);
  }
}

export async function DELETE(request) {
  try {
    assertSameOrigin(request);
    return ok(
      { success: true },
      { headers: { "Set-Cookie": clearAdminSessionCookie(request) } },
    );
  } catch (error) {
    return handleAdminAuthError(error);
  }
}

function handleAdminAuthError(error) {
  const message =
    error instanceof AdminAuthError
      ? "Invalid admin credentials."
      : error instanceof Error
        ? error.message
        : "Unable to authenticate administrator.";
  const status =
    error instanceof Error && "status" in error ? error.status : 500;
  return fail(message, status);
}
