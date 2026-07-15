const ADMIN_ACCESS_SECRET_KEY = "korede-james-admin-secret";

export async function uploadSiteFile(
  file,
  { scope = "commission-reference", admin = false, optimizeImage = false } = {},
) {
  const uploadFile = optimizeImage ? await optimizeImageForUpload(file) : file;
  const formData = new FormData();
  formData.append("file", uploadFile, file.name || "upload");
  formData.append("scope", scope);

  const headers = {};
  if (admin && typeof window !== "undefined") {
    const adminCode = window.sessionStorage.getItem(ADMIN_ACCESS_SECRET_KEY);
    if (adminCode) {
      headers["x-kj-admin-code"] = adminCode;
    }
  }

  const response = await fetch("/api/uploads", {
    method: "POST",
    headers,
    body: formData,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Upload failed.");
  }

  return data.file;
}

async function optimizeImageForUpload(file) {
  if (
    typeof document === "undefined" ||
    typeof Image === "undefined" ||
    !file?.type?.startsWith("image/")
  ) {
    return file;
  }

  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const maxDimension = 1200;
  const largestSide = Math.max(image.width, image.height);
  const scale = largestSide > maxDimension ? maxDimension / largestSide : 1;
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    return file;
  }

  context.drawImage(image, 0, 0, width, height);
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.78),
  );

  if (!blob) {
    return file;
  }

  return new File([blob], replaceExtension(file.name || "image.jpg", ".jpg"), {
    type: "image/jpeg",
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function replaceExtension(fileName, extension) {
  const baseName = String(fileName || "image").replace(/\.[a-z0-9]{2,8}$/i, "");
  return `${baseName}${extension}`;
}
