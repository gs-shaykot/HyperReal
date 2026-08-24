import axios from 'axios';

export const uploadImage = async (file: File | null, onProgress?: (percent: number) => void) => {

    const defaultUrl = "https://res.cloudinary.com/dskgvk9km/image/upload/v1767725926/user_bvoihx.png";

    if (!file) return defaultUrl;
    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await axios.post("/api/uploadImage", formData, {
            onUploadProgress: (progressEvent) => {
                if (!progressEvent.total) return;
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress?.(percent);
            },
        });
 
        const uploadResult = res.data.data ?? res.data;
        const imageUrl = uploadResult.secure_url || uploadResult.url;

        if (!imageUrl) {
            throw new Error("Upload response did not contain an image URL");
        }

        return imageUrl;
    } catch (error) {
        console.error("Image upload failed:", error);
        throw error;
    }
};