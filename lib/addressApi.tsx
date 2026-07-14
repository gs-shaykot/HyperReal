import { AddressType } from "@/app/types/AddressType";
import axios from "axios";

export const addAddress = async (address: AddressType) => {
    try {
        if (!address.fullName || !address.street || !address.city || !address.zipCode || !address.country || !address.phone) {
            throw new Error('All fields are required.');
        }

        const res = await axios.post("/api/address", address);
        return res.data;
    }
    catch (error) {
        console.error("Error occurred while adding address: ", error);
        throw error;
    }
}
export const getAddresses = async () => {
    try {
        const res = await axios.get("/api/address");
        return res.data.data;
    }
    catch (error) {
        console.error("Error occurred while fetching addresses: ", error);
        throw error;
    }
}

export const makePrimaryAddress = async (id: string) => {
    try {
        console.log("Making address primary with id: ", id);
        const res = await axios.patch("/api/address/default", { id });
        return res.data;
    }
    catch (error) {
        console.error("Error occurred while making address primary: ", error);
        throw error;
    }
}