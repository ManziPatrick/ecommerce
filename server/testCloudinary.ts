import { v2 as cloudinary } from "cloudinary";
import * as dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinary() {
    try {
        console.log("Testing Cloudinary connection...");
        const result = await cloudinary.api.ping();
        console.log("Cloudinary Connection Result:", result);
        if (result.status === "ok") {
            console.log("✅ Cloudinary is connected successfully!");
        }
    } catch (error) {
        console.error("❌ Cloudinary connection failed:", error);
    }
}

testCloudinary();
