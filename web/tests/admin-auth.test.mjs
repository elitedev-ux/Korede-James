import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  authenticateAdminCode,
  createAdminSessionCookie,
  requireAdmin,
} from "../src/app/api/admin-workspace/utils/workspaceStore.js";

const originalEnv = { ...process.env };
beforeEach(() => {
  for (const name of Object.keys(process.env)) {
    if (name.startsWith("ADMIN_")) delete process.env[name];
  }
  process.env.ADMIN_OWNER_CODE = "owner-1234";
  process.env.ADMIN_STUDIO_CODE = "studio-1234";
  process.env.ADMIN_EDITOR_CODE = "editor-1234";
  process.env.ADMIN_SUPPORT_CODE = "support-1234";
  process.env.ADMIN_SESSION_SECRET = "test-session-secret-".repeat(3);
});
afterEach(() => {
  for (const name of Object.keys(process.env)) {
    if (!(name in originalEnv)) delete process.env[name];
  }
  Object.assign(process.env, originalEnv);
});

test("configured ten-character owner code and other role codes authenticate separately", () => {
  assert.equal(authenticateAdminCode(process.env.ADMIN_OWNER_CODE), "owner");
  assert.equal(authenticateAdminCode(process.env.ADMIN_STUDIO_CODE), "studio");
  assert.equal(authenticateAdminCode(process.env.ADMIN_EDITOR_CODE), "editor");
  assert.equal(authenticateAdminCode(process.env.ADMIN_SUPPORT_CODE), "support");
  assert.throws(() => authenticateAdminCode("wrong-1234"), { status: 401 });
});

test("codes shorter than ten characters and longer than 160 cannot authenticate", () => {
  process.env.ADMIN_EDITOR_CODE = "short";
  process.env.ADMIN_SUPPORT_CODE = "x".repeat(161);
  assert.throws(() => authenticateAdminCode("short"), { status: 401 });
  assert.throws(() => authenticateAdminCode("x".repeat(161)), { status: 401 });
});

test("signed session retains its role and rejects tampering", () => {
  const cookie = createAdminSessionCookie("studio", new Request("https://www.koredejames.com"));
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  const sessionCookie = cookie.split(";")[0];
  assert.equal(requireAdmin(new Request("https://www.koredejames.com/api/admin-workspace", {
    headers: { cookie: sessionCookie },
  })), "studio");
  assert.throws(() => requireAdmin(new Request("https://www.koredejames.com/api/admin-workspace", {
    headers: { cookie: sessionCookie + "tampered" },
  })), { status: 401 });
});
