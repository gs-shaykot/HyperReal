import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const GEMINI_MODEL = "gemini-2.5-flash-lite";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { message: "Keyword AI is not configured. Add GEMINI_API_KEY to your server environment." },
                { status: 503 }
            );
        }

        const body = await request.json();
        const name = typeof body.name === "string" ? body.name.trim().slice(0, 160) : "";
        const description = typeof body.description === "string" ? body.description.trim().slice(0, 1200) : "";
        const category = typeof body.category === "string" ? body.category.trim().slice(0, 80) : "";

        if (!name) {
            return NextResponse.json({ message: "Product name is required" }, { status: 400 });
        }

        const prompt = `You generate ecommerce search keywords for a fictional techwear/streetwear store called HyperReal.
Return ONLY a valid JSON object: {"keywords":["..."]}.
Generate 12-25 useful search keywords/synonyms customers might type to find this exact product.
Include common garment/product synonyms, category terms, style/material/function descriptors only when supported by the supplied information, and singular/plural forms when useful.
Do not include the product's exact name, irrelevant terms, brands not provided, prices, sentences, or duplicate variations. Keywords must be short (usually 1-3 words), lowercase, unique.
Product name: ${name}
Category: ${category || "not specified"}
Description: ${description || "not specified"}`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.25,
                        responseMimeType: "application/json",
                        maxOutputTokens: 500,
                    },
                }),
                signal: AbortSignal.timeout(20_000),
            }
        );

        if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            console.error("Gemini keyword generation failed:", response.status, errorBody);
            return NextResponse.json(
                { message: response.status === 429 ? "Gemini free-tier rate limit reached. Try again later." : "AI keyword generation failed." },
                { status: response.status === 429 ? 429 : 502 }
            );
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts
            ?.map((part: { text?: string }) => part.text ?? "")
            .join("")
            .trim();

        if (!text) {
            return NextResponse.json({ message: "AI returned an empty response" }, { status: 502 });
        }

        const parsed = JSON.parse(text);
        const keywords = Array.isArray(parsed.keywords)
            ? Array.from(new Set(
                parsed.keywords
                    .filter((keyword: unknown): keyword is string => typeof keyword === "string")
                    .map((keyword: string) => keyword.trim().toLowerCase())
                    .filter((keyword: string) => keyword.length > 0 && keyword.length <= 48)
            )).slice(0, 30)
            : [];

        return NextResponse.json({ keywords });
    } catch (error) {
        console.error("Product keyword generation error:", error);
        return NextResponse.json({ message: "Unable to generate keywords right now." }, { status: 500 });
    }
}
