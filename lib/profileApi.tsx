import axios from "axios";

export const ProfileEdit = async ({ email, name, phone, otp }: { id?: string; email: string; name: string; phone: string; otp?: string }) => {
    try {
        if (!email || !name || !phone) {
            throw new Error('Name, email and phone are required.');
        }
        const res = await axios.patch('/api/account/profile', { email, name, phone, otp });
        return res.data;
    }
    catch (error: unknown) {
        throw error;
    }
}
export const getProfile = async () => {
    const res = await axios.get("/api/account/profile");
    return res.data.profile;
};
