import { v2 as cloudinary } from "cloudinary";

/**
 * Ensures an image URL is served via Cloudinary.
 * If the URL is already a Cloudinary URL, it returns it as is.
 * If it's an external URL, it wraps it with Cloudinary Fetch.
 */
export const getCloudinaryUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;

    // If it's already a Cloudinary URL, return it
    if (url.includes("res.cloudinary.com")) {
        return url;
    }

    // If it's a data URL, return it
    if (url.startsWith("data:")) {
        return url;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
        console.warn("CLOUDINARY_CLOUD_NAME is not defined. Returning original URL.");
        return url;
    }

    // Use Cloudinary Fetch API with auto format and quality
    return `https://res.cloudinary.com/${cloudName}/image/fetch/f_auto,q_auto/${url}`;
};

/**
 * Processes an array of image URLs through getCloudinaryUrl.
 */
export const getCloudinaryUrls = (urls: (string | null | undefined)[]): string[] => {
    return urls.map(url => getCloudinaryUrl(url)).filter((url): url is string => !!url);
};
