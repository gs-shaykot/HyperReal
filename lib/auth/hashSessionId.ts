export async function hashSessionId(sessionId: string): Promise<string> {
    const data = new TextEncoder().encode(sessionId);

    const hashBuffer = await globalThis.crypto.subtle.digest(
        "SHA-256",
        data
    );

    return Array.from(new Uint8Array(hashBuffer))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}