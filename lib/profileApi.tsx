import axios from "axios";

export const ProfileEdit = async ({ email, name, phone }: { id: string; email: string; name: string; phone: string }) => {
    try {
        if (!email || !name || !phone) {
            throw new Error('Name, email and phone are required.');
        }
        const res = await axios.patch('/api/user/profile', { email, name, phone });
        return res.data;
    }
    catch (error: unknown) {
        throw error;
    }
}
export const getProfile = async () => {
    const res = await axios.get("/api/user/profile");
    return res.data.profile;
};
