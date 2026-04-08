import axios from 'axios';

export const uploadImage = async (file: File | null) => {
    
    const defaultUrl = "https://res.cloudinary.com/dskgvk9km/image/upload/v1767725926/user_bvoihx.png";

    if (!file) return defaultUrl;

    const formData = new FormData();
    formData.append("file", file); 

    try {
        const res = await axios.post("/api/uploadImage", formData);
        console.log('Upload response:', res.data);
        
        return res.data.secure_url || res.data.url || defaultUrl;
    } catch (error) {
        console.error("Image upload failed:", error);
        return defaultUrl;
    }
};