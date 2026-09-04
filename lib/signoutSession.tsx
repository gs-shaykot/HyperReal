import { requireSession } from "@/lib/auth/requireSession";
import axios from "axios";

export const signoutSession = async (sessionId: string) => {
    try {
        await requireSession();
        const res = await axios.delete(`/api/sessions/${sessionId}`);
        return res.data;
    }
    catch (error) {
        console.error("Error occurred while signing out session: ", error);
        throw error;
    }
}

export const getSessions = async () => {
    try {
        await requireSession();
        const res = await axios.get("/api/sessions");
        return res.data.data;
    }
    catch (error) {
        console.error("Error occurred while fetching sessions: ", error);
        throw error;
    }
}