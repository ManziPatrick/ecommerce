import { v2 as cloudinary } from "cloudinary";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testUpload() {
    const remoteUrl = "https://images.unsplash.com/photo-1587563871167-1ee9c271aefb?auto=format&fit=crop&w=800&q=80";
    console.log(`Testing upload of: ${remoteUrl}`);

    try {
        const result = await cloudinary.uploader.upload(remoteUrl, {
            folder: "test_seed",
            resource_type: "image",
        });
        console.log("Upload Success!");
        console.log(`Secure URL: ${result.secure_url}`);
    } catch (error) {
        console.error("Upload Failed:");
        console.error(error);
    }
}

testUpload();
