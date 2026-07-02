import {
  fail,
  ok,
  readBody,
  updatePasswordWithToken,
} from "../../utils/customerAuth.js";

export async function POST(request) {
  try {
    const body = await readBody(request);
    await updatePasswordWithToken(body.token, body.password);
    return ok({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reset password.";
    const status = message.includes("Supabase is not configured") ? 503 : 400;
    return fail(message, status);
  }
}
