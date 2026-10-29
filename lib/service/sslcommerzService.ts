import axios from "axios";

export type SslCommerzTransactionState = "SUCCESS" | "FAILED" | "UNKNOWN";

/**
 * Query SSLCommerz directly by our merchant transaction ID. Browser callback
 * fields alone are never trusted to release stock.
 */
export async function getSslCommerzTransactionState(
    transactionId: string
): Promise<SslCommerzTransactionState> {
    try {
        const baseUrl =
            process.env.SSLCOMMERZ_VALIDATOR_BASE_URL ||
            "https://sandbox.sslcommerz.com";
        const params = new URLSearchParams({
            tran_id: transactionId,
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
            element?: Array<{ tran_id?: string; status?: string }>;
        };

        if (data.APIConnect !== "DONE" || !Array.isArray(data.element)) {
            return "UNKNOWN";
        }

        const attempts = data.element.filter(
            (item) => item.tran_id === transactionId
        );
        if (attempts.length === 0) return "UNKNOWN";

        const statuses = attempts.map((item) => item.status?.toUpperCase());
        if (statuses.some((status) => status === "VALID" || status === "VALIDATED")) {
            return "SUCCESS";
        }

        if (
            statuses.every(
                (status) => status === "FAILED" || status === "CANCELLED"
            )
        ) {
            return "FAILED";
        }

        return "UNKNOWN";
    } catch (error) {
        console.error("[SSLCOMMERZ] Transaction status query failed:", error);
        return "UNKNOWN";
    }
}
