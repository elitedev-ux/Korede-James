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
  try {
    assertSameOrigin(request);
    await assertRateLimit(request, "admin-login", { limit: 8 });
    const body = await readBody(request, { maxBytes: 2 * 1024 });
    const role = authenticateAdminCode(body.code);
    return ok(
      { authenticated: true, role },
      { headers: { "Set-Cookie": createAdminSessionCookie(role, request) } },
    );
  } catch (error) {
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
