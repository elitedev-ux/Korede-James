import * as React from 'react';
import { uploadSiteFile } from "./uploads";

function useUpload() {
  const [loading, setLoading] = React.useState(false);
  const upload = React.useCallback(async (input) => {
    try {
      setLoading(true);
      if ("file" in input && input.file) {
        const uploadedFile = await uploadSiteFile(input.file, {
          scope: input.scope || "site-upload",
          admin: Boolean(input.admin),
          optimizeImage: input.optimizeImage ?? input.file.type?.startsWith("image/"),
        });
        return { url: uploadedFile.url, mimeType: uploadedFile.mimeType || null };
      }
      throw new Error("Upload failed: please select a file.");
    } catch (uploadError) {
      if (uploadError instanceof Error) {
        return { error: uploadError.message };
      }
      if (typeof uploadError === "string") {
        return { error: uploadError };
      }
      return { error: "Upload failed" };
    } finally {
      setLoading(false);
    }
  }, []);

  return [upload, { loading }];
}

export { useUpload };
export default useUpload;
