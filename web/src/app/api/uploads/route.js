import { randomUUID } from "node:crypto";
import {
  assertRateLimit,
  assertSameOrigin,
  fail,
  ok,
  supabaseStorageFetch,
} from "../utils/supabaseRest.js";
import { requireAdmin } from "../admin-workspace/utils/workspaceStore.js";

const PUBLIC_BUCKET =
  process.env.SUPABASE_PUBLIC_UPLOAD_BUCKET || "korede-james-public-assets";
const PRIVATE_BUCKET =
  process.env.SUPABASE_PRIVATE_UPLOAD_BUCKET || "korede-james-private-uploads";
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const UPLOAD_SCOPES = {
  "commission-reference": {
    bucket: PRIVATE_BUCKET,
    isPublic: false,
    maxBytes: 5 * 1024 * 1024,
  },
  "admin-products": {
    bucket: PUBLIC_BUCKET,
    isPublic: true,
    maxBytes: MAX_FILE_BYTES,
    requiresAdmin: true,
  },
};

export async function GET(request) {
  try {
    await assertRateLimit(request, "private-upload-read", { limit: 120 });
    requireAdmin(request);
    const path = String(new URL(request.url).searchParams.get("path") || "");
    if (!isPrivateObjectPath(path)) {
      return fail("File was not found.", 404);
    }

    const signedUrl = await createSignedPrivateUrl(path);
    return new Response(null, {
      status: 302,
      headers: {
        Location: signedUrl,
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const status = error instanceof Error && "status" in error ? error.status : 404;
    return fail(status === 401 ? "Admin access is required." : "File was not found.", status);
  }
}

export async function POST(request) {
  try {
    assertSameOrigin(request);
    await assertRateLimit(request, "uploads", { limit: 20 });
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_FILE_BYTES + 256 * 1024) {
      return fail("Upload is too large.", 413);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const scope = String(formData.get("scope") || "").trim().toLowerCase();
    const policy = UPLOAD_SCOPES[scope];

    if (!policy) {
      return fail("Unsupported upload scope.", 400);
    }
    if (policy.requiresAdmin) {
      requireAdmin(request);
    }
    if (!file || typeof file.arrayBuffer !== "function") {
      return fail("Upload file is required.", 400);
    }

    const fileSize = Number(file.size || 0);
    if (!fileSize || fileSize > policy.maxBytes) {
      return fail(
        `File must be smaller than ${Math.floor(policy.maxBytes / 1024 / 1024)}MB.`,
        413,
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = detectImageMimeType(buffer);
    if (!mimeType) {
      return fail("Only valid JPEG, PNG, WebP, or GIF images are accepted.", 400);
    }

    await ensureUploadBucket(policy);
    const objectPath = [
      scope,
      new Date().toISOString().slice(0, 10),
      `${randomUUID()}${extensionForMimeType(mimeType)}`,
    ].join("/");

    await supabaseStorageFetch(
      `object/${encodeURIComponent(policy.bucket)}/${encodeStoragePath(objectPath)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": policy.isPublic ? "31536000, immutable" : "no-store",
          "x-upsert": "false",
        },
        body: buffer,
      },
    );

    return ok({
      file: {
        name: cleanFileName(file.name),
        url: policy.isPublic
          ? publicStorageUrl(policy.bucket, objectPath)
          : `/api/uploads?path=${encodeURIComponent(objectPath)}`,
        path: objectPath,
        visibility: policy.isPublic ? "public" : "private",
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

async function ensureUploadBucket(policy) {
  assertSeparateUploadBuckets();
  const bucketPath = `bucket/${encodeURIComponent(policy.bucket)}`;
  const existing = await supabaseStorageFetch(bucketPath, {
    method: "GET",
    allowNotFound: true,
  });
  const settings = {
    public: policy.isPublic,
    file_size_limit: policy.maxBytes,
    allowed_mime_types: IMAGE_MIME_TYPES,
  };

  await supabaseStorageFetch(existing.status === 404 ? "bucket" : bucketPath, {
    method: existing.status === 404 ? "POST" : "PUT",
    body: JSON.stringify(
      existing.status === 404
        ? { id: policy.bucket, name: policy.bucket, ...settings }
        : settings,
    ),
  });
}

async function createSignedPrivateUrl(path) {
  assertSeparateUploadBuckets();
  const result = await supabaseStorageFetch(
    `object/sign/${encodeURIComponent(PRIVATE_BUCKET)}/${encodeStoragePath(path)}`,
    {
      method: "POST",
      body: JSON.stringify({ expiresIn: 60 }),
    },
  );
  const signedPath = result.data?.signedURL || result.data?.signedUrl;
  if (!signedPath) {
    throw new Error("Unable to authorize private file.");
  }
  if (/^https:\/\//i.test(signedPath)) {
    return signedPath;
  }
  const supabaseUrl = String(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
  ).replace(/\/$/, "");
  return `${supabaseUrl}/storage/v1${signedPath.startsWith("/") ? "" : "/"}${signedPath}`;
}

function assertSeparateUploadBuckets() {
  if (PRIVATE_BUCKET === PUBLIC_BUCKET) {
    const error = new Error("Public and private upload buckets must be separate.");
    error.status = 503;
    throw error;
  }
}

function detectImageMimeType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return "image/png";
  }
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }
  const header = buffer.toString("ascii", 0, 6);
  if (header === "GIF87a" || header === "GIF89a") {
    return "image/gif";
  }
  return null;
}

function isPrivateObjectPath(path) {
  return (
    path.startsWith("commission-reference/") &&
    !path.includes("..") &&
    /^[a-z0-9/_\-.]+$/i.test(path)
  );
}

function cleanFileName(value) {
  return String(value || "upload")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .slice(0, 120);
}

function extensionForMimeType(mimeType) {
  return {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  }[mimeType];
}

function encodeStoragePath(path) {
  return String(path)
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function publicStorageUrl(bucket, path) {
  const supabaseUrl = String(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
  ).replace(/\/$/, "");
  return `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodeStoragePath(path)}`;
}
