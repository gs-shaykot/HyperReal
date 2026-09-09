import axios from "axios";
import ipaddr from "ipaddr.js";


type GeoLocation = {
    country: string | null;
    region: string | null;
    city: string | null;
};

type IpApiResponse = {
    ip?: string;
    city?: string | null;
    region?: string | null;
    country?: string | null;
};


function isPublicIp(ipAddress: string): boolean {
    try {
        const addr = ipaddr.parse(ipAddress);
        return addr.range() === "unicast";
    } catch {
        return false;
    }
}

export async function getIpLocation(ipAddress: string | null): Promise<GeoLocation> {

    if (!isPublicIp(ipAddress as string)) {
        return {
            country: null,
            region: null,
            city: null,
        };
    }

    try {
        
        const res = await axios.get(`https://ipapi.co/${ipAddress}/json/`)
        if (!res.status || res.status !== 200) {
            console.error(`IP geolocation failed with status ${res.status}`);

            return {
                country: null,
                region: null,
                city: null,
            };
        }

        const data: IpApiResponse = res.data;

        return {
            country: data.country ?? null,
            region: data.region ?? null,
            city: data.city ?? null,
        };
    } catch (error) {
        console.error(
            "Failed to resolve IP geolocation:",
            error
        );

        return {
            country: null,
            region: null,
            city: null,
        };
    }
}