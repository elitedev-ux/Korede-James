import { randomUUID } from "node:crypto";
import {
  assertRateLimit,
  fail,
  ok,
  supabaseStorageFetch,
} from "../utils/supabaseRest.js";
import { requireAdmin } from "../admin-workspace/utils/workspaceStore.js";

const BUCKET_NAME = process.env.SUPABASE_UPLOAD_BUCKET || "korede-james-uploads";
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

export async function POST(request) {
  try {
    assertRateLimit(request, "uploads", { limit: 30 });
    const formData = await request.formData();
    const file = formData.get("file");
    const scope = normalizeScope(formData.get("scope"));

    if (!file || typeof file.arrayBuffer !== "function") {
      return fail("Upload file is required.", 400);
    }

    if (scope.startsWith("admin-")) {
      requireAdmin(request);
    }

    const mimeType = String(file.type || "application/octet-stream").toLowerCase();
    const fileSize = Number(file.size || 0);

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return fail("Unsupported file type.", 400);
    }

    if (!fileSize || fileSize > MAX_FILE_BYTES) {
      return fail("File must be smaller than 8MB.", 413);
    }

    await ensureUploadBucket();

    const extension = extensionForFile(file.name, mimeType);
    const objectPath = [
      scope,
      new Date().toISOString().slice(0, 10),
      `${randomUUID()}${extension}`,
    ].join("/");
    const buffer = Buffer.from(await file.arrayBuffer());

    await supabaseStorageFetch(
      `object/${encodeURIComponent(BUCKET_NAME)}/${encodeStoragePath(objectPath)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "31536000",
          "x-upsert": "false",
        },
        body: buffer,
      },
    );

    return ok({
      file: {
        name: cleanFileName(file.name),
        url: publicStorageUrl(objectPath),
        path: objectPath,
        mimeType,
        size: fileSize,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return fail(
      message,
      error instanceof Error && "status" in error ? error.status : 500,
    );
  }
}

async function ensureUploadBucket() {
  const bucketPath = `bucket/${encodeURIComponent(BUCKET_NAME)}`;
  const existing = await supabaseStorageFetch(bucketPath, {
    method: "GET",
    allowNotFound: true,
  });

  if (existing.status !== 404) {
    return;
  }

  await supabaseStorageFetch("bucket", {
    method: "POST",
    body: JSON.stringify({
      id: BUCKET_NAME,
      name: BUCKET_NAME,
      public: true,
      file_size_limit: MAX_FILE_BYTES,
      allowed_mime_types: Array.from(ALLOWED_MIME_TYPES),
    }),
  });
}

function normalizeScope(value) {
  const scope = String(value || "commission-reference")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "");

  return scope || "commission-reference";
}

function cleanFileName(value) {
  return String(value || "upload")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .slice(0, 120);
}

function extensionForFile(fileName, mimeType) {
  const fromName = cleanFileName(fileName).match(/\.[a-z0-9]{2,8}$/i)?.[0];

  if (fromName) {
    return fromName.toLowerCase();
  }

  const extensionByType = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "application/pdf": ".pdf",
  };

  return extensionByType[mimeType] || "";
}

function encodeStoragePath(path) {
  return String(path)
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function publicStorageUrl(path) {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";

  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${encodeURIComponent(
    BUCKET_NAME,
  )}/${encodeStoragePath(path)}`;
}
