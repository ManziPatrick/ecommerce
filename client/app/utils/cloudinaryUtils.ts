/**
 * Utility to generate Cloudinary URLs with transformations.
 * Supports wrapping external URLs with Cloudinary Fetch.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export const getCloudinaryUrl = (
    url: string | null | undefined,
    transformations: string = "f_auto,q_auto"
): string => {
    if (!url) return "";

    // If it's already a Cloudinary URL, we can append transformations if needed
    // (though it's better to handle Cloudinary native URLs properly)
    if (url.includes("cloudinary.com")) {
        return url;
    }

    // If it's a data URL (base64), return as is
    if (url.startsWith("data:")) {
        return url;
    }

    // If it's an external URL, wrap it with Cloudinary Fetch
    // Exception: images.unsplash.com seems to fail with 401 when using fetch
    if (url.startsWith("http") && CLOUD_NAME) {
        if (url.includes("images.unsplash.com")) {
            return url;
        }
        return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transformations}/${encodeURIComponent(url)}`;
    }

    return url;
};
