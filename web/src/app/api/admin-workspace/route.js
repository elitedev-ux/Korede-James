import {
  AdminAuthError,
  readWorkspace,
  requireAdmin,
  writeWorkspace,
} from "./utils/workspaceStore.js";
import { fail, ok, readBody } from "../utils/supabaseRest.js";

export async function GET(request) {
  try {
    const role = requireAdmin(request);
    const workspace = await readWorkspace();
    return ok({ workspace, role });
  } catch (error) {
    return handleWorkspaceError(error, "Unable to load admin workspace.");
  }
}

export async function PATCH(request) {
  try {
    const role = requireAdmin(request);
    const body = await readBody(request);
    const workspace = await writeWorkspace(body.workspace);
    return ok({ workspace, role });
  } catch (error) {
    return handleWorkspaceError(error, "Unable to save admin workspace.");
  }
}

function handleWorkspaceError(error, fallbackMessage) {
  if (error instanceof AdminAuthError) {
    return fail(error.message, error.status);
  }

  const message =
    error instanceof Error ? error.message : fallbackMessage;
  const status = message.includes("Supabase is not configured") ? 503 : 400;
  return fail(message || fallbackMessage, status);
}
