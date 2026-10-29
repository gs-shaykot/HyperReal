import axios from "axios";

export type SslCommerzTransactionState = "SUCCESS" | "FAILED" | "UNKNOWN";

/**
 * Query SSLCommerz directly by our merchant transaction ID. Browser callback
 * fields alone are never trusted to release stock.
 */
export async function getSslCommerzTransactionState(
    transactionId: string,
    sessionKey?: string | null
): Promise<SslCommerzTransactionState> {
    try {
        if (!sessionKey) return "UNKNOWN";

        const baseUrl =
            process.env.SSLCOMMERZ_VALIDATOR_BASE_URL ||
            "https://sandbox.sslcommerz.com";
        const params = new URLSearchParams({
            sessionkey: sessionKey,
            store_id: process.env.SSLC_STORE_ID || "",
            store_passwd: process.env.SSLC_STORE_PASSWORD || "",
            v: "1",
            format: "json",
        });

        const response = await axios.get(
            `${baseUrl}/validator/api/merchantTransIDvalidationAPI.php?${params.toString()}`,
            { timeout: 8000 }
        );
        const data = response.data as {
            APIConnect?: string;
            tran_id?: string;
            sessionkey?: string;
            status?: string;
        };

        if (
            data.sessionkey !== sessionKey ||
            data.tran_id !== transactionId
        ) {
            return "UNKNOWN";
        }

        const sessionStatus = data.status?.toUpperCase();
        if (sessionStatus === "VALID" || sessionStatus === "VALIDATED") {
            return "SUCCESS";
        }
        if (sessionStatus === "FAILED" || sessionStatus === "CANCELLED") {
            return "FAILED";
        }
        return "UNKNOWN";
    } catch (error) {
        console.error("[SSLCOMMERZ] Transaction status query failed:", error);
        return "UNKNOWN";
    }
}
