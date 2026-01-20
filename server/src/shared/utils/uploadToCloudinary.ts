import { v2 as cloudinary } from "cloudinary";

export const uploadToCloudinary = async (files: any) => {
  try {
    const uploadPromises = files.map(
      (file: any, index: number) =>
        new Promise((resolve, reject) => {
          console.log(`🚀 Attempting upload for file ${index + 1}/${files.length}`);
          console.log(`   - Mimetype: ${file.mimetype}`);
          console.log(`   - Size: ${file.size} bytes`);
          console.log(`   - Buffer present: ${!!file.buffer}`);

          if (!file.buffer) {
            return reject(new Error(`File buffer is missing for file ${index + 1}`));
          }

          cloudinary.uploader
            .upload_stream(
              {
                folder: "macyemacye/avatars",
                resource_type: "image",
                fetch_format: "webp",
                quality: "auto",
                flags: "progressive",
                timeout: 60000, // 60 seconds timeout
              },
              (error, result) => {
                if (error) {
                  console.error(`❌ Cloudinary upload error for file ${index + 1}:`, error);
                  return reject(error);
                }
                if (!result) return reject(new Error("Upload failed: No result from Cloudinary"));

                console.log(`✅ File ${index + 1} uploaded successfully: ${result.secure_url}`);
                resolve({
                  url: result.secure_url,
                  public_id: result.public_id,
                });
              }
            )
            .end(file.buffer);
        })
    );

    const results = await Promise.allSettled(uploadPromises);

    // Log failed attempts and map results to preserve indexes
    const imageResults = results.map((result, idx) => {
      if (result.status === "rejected") {
        console.error(`🔴 Promise ${idx + 1} rejected:`, result.reason);
        return null;
      }
      return (result as PromiseFulfilledResult<{ url: string; public_id: string }>).value;
    });

    return imageResults;
  } catch (error) {
    console.error("🔥 Extreme error in uploadToCloudinary wrapper:", error);
    return files.map(() => null); // Return array of nulls to maintain indexing expectation
  }
};
