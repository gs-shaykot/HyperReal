import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * Extract Cloudinary public_id from a Cloudinary image URL.
 *
 * Example:
 *
 * https://res.cloudinary.com/demo/image/upload/v123456/products/shoe.jpg
 *
 * becomes:
 *
 * products/shoe
 */
export const getCloudinaryPublicId = (
    imageUrl: string
): string | null => {
    try {
        const url = new URL(imageUrl);

        // Only process images hosted by our Cloudinary account.
        if (url.hostname !== "res.cloudinary.com") {
            return null;
        }

        const uploadMarker = "/upload/";

        const uploadIndex =
            url.pathname.indexOf(uploadMarker);

        if (uploadIndex === -1) {
            return null;
        }

        let publicIdPath =
            url.pathname.slice(
                uploadIndex + uploadMarker.length
            );

        const segments =
            publicIdPath.split("/");

        /*
         * Remove Cloudinary version.
         *
         * Example:
         * v1767725926/products/shoe.jpg
         *
         * becomes:
         * products/shoe.jpg
         */
        const versionIndex =
            segments.findIndex((segment) =>
                /^v\d+$/.test(segment)
            );

        if (versionIndex !== -1) {
            publicIdPath = segments
                .slice(versionIndex + 1)
                .join("/");
        }

        /*
         * Cloudinary public_id does not contain
         * the file extension.
         */
        publicIdPath =
            publicIdPath.replace(
                /\.[^/.]+$/,
                ""
            );

        return publicIdPath || null;
    } catch (error) {
        console.error(
            "Failed to extract Cloudinary public ID:",
            error
        );

        return null;
    }
};

/**
 * Delete ONE image from Cloudinary.
 */
export const deleteCloudinaryImage = async (
    imageUrl: string
) => {
    const publicId =
        getCloudinaryPublicId(imageUrl);

    if (!publicId) {
        console.warn(
            "Skipping Cloudinary deletion. Invalid Cloudinary URL:",
            imageUrl
        );

        return {
            deleted: false,
            publicId: null,
        };
    }

    try {
        const result =
            await cloudinary.uploader.destroy(
                publicId,
                {
                    resource_type: "image",
                    invalidate: true,
                }
            );

        return {
            deleted:
                result.result === "ok" ||
                result.result === "not found",

            publicId,

            result: result.result,
        };
    } catch (error) {
        console.error(
            "Cloudinary image deletion failed:",
            {
                publicId,
                error,
            }
        );

        return {
            deleted: false,
            publicId,
        };
    }
};

/**
 * Delete MULTIPLE images from Cloudinary.
 *
 * This function uses deleteCloudinaryImage()
 * above, so there is NO duplicate implementation.
 */
export const deleteCloudinaryImages = async (
    imageUrls: string[]
) => {
    const uniqueUrls = [
        ...new Set(
            imageUrls.filter(Boolean)
        ),
    ];

    if (uniqueUrls.length === 0) {
        return;
    }

    const results =
        await Promise.all(
            uniqueUrls.map((imageUrl) =>
                deleteCloudinaryImage(
                    imageUrl
                )
            )
        );

    console.log(
        `Cloudinary cleanup completed: ${results.filter(
            (result) => result.deleted
        ).length}/${uniqueUrls.length} deleted.`
    );

    return results;
};

export default cloudinary;