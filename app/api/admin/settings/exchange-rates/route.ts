
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const API_URL = "https://api.frankfurter.dev/v2/rates";
const LOOKBACK_DAYS = 45;
const MAX_CONCURRENT_REQUESTS = 5;

type FrankfurterRate = {
    date: string;
    base: string;
    quote: string;
    rate: number;
};

type RateResult = {
    currencyCode: string;
    currentRate: number;
    previousRate: number | null;
    rateDate: string;
};

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user?.role === "ADMIN";
}

function dateString(date: Date) {
    return date.toISOString().slice(0, 10);
}

async function fetchCurrencyHistory(
    currencyCode: string,
    from: string,
    to: string
): Promise<RateResult | null> {
    if (currencyCode === "USD") {
        return {
            currencyCode,
            currentRate: 1,
            previousRate: 1,
            rateDate: to,
        };
    }

    const url = new URL(API_URL);
    url.searchParams.set("base", "USD");
    url.searchParams.set("quotes", currencyCode);
    url.searchParams.set("from", from);
    url.searchParams.set("to", to);

    const response = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(12_000),
    });
 
    if (response.status === 404 || response.status === 422) {
        return null;
    }

    if (!response.ok) {
        throw new Error(
            `Frankfurter request failed for ${currencyCode}: ${response.status}`
        );
    }

    const payload: unknown = await response.json();

    if (!Array.isArray(payload)) {
        throw new Error(
            `Unexpected Frankfurter response for ${currencyCode}.`
        );
    }

    const observations = (payload as FrankfurterRate[])
        .filter(
            (item) =>
                item?.base?.toUpperCase() === "USD" &&
                item?.quote?.toUpperCase() === currencyCode &&
                typeof item.rate === "number" &&
                Number.isFinite(item.rate) &&
                item.rate > 0 &&
                typeof item.date === "string"
        )
        .sort((a, b) => b.date.localeCompare(a.date));

    if (observations.length === 0) {
        return null;
    }

    const latest = observations[0];
    const previous = observations.find(
        (item) => item.date < latest.date
    );

    return {
        currencyCode,
        currentRate: latest.rate,
        previousRate: previous?.rate ?? null,
        rateDate: latest.date,
    };
}

export async function POST() {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json(
                { message: "Unauthorized. Admin access is required." },
                { status: 401 }
            );
        }

        const countries = await prisma.operationalCountry.findMany({
            select: {
                id: true,
                name: true,
                currencyCode: true,
            },
            orderBy: { name: "asc" },
        });

        if (countries.length === 0) {
            return NextResponse.json({
                success: true,
                message: "There are no configured countries to update.",
                updated: 0,
                skipped: [],
            });
        }

        const currencies = [
            ...new Set(
                countries
                    .map((country) =>
                        country.currencyCode.trim().toUpperCase()
                    )
                    .filter((code) => /^[A-Z]{3}$/.test(code))
            ),
        ];

        const endDate = new Date();
        const startDate = new Date(endDate);
        startDate.setUTCDate(
            startDate.getUTCDate() - LOOKBACK_DAYS
        );

        const from = dateString(startDate);
        const to = dateString(endDate);
        const results: RateResult[] = [];

        // Limit concurrent requests to avoid flooding the free API.
        for (
            let index = 0;
            index < currencies.length;
            index += MAX_CONCURRENT_REQUESTS
        ) {
            const batch = currencies.slice(
                index,
                index + MAX_CONCURRENT_REQUESTS
            );

            const batchResults = await Promise.all(
                batch.map((currencyCode) =>
                    fetchCurrencyHistory(currencyCode, from, to)
                )
            );

            results.push(
                ...batchResults.filter(
                    (result): result is RateResult => result !== null
                )
            );
        }

        const ratesByCurrency = new Map(
            results.map((result) => [
                result.currencyCode,
                result,
            ])
        );

        const updatedCountries: string[] = [];
        const skippedCountries: Array<{
            country: string;
            currencyCode: string;
            reason: string;
        }> = [];

        for (const country of countries) {
            const currencyCode = country.currencyCode
                .trim()
                .toUpperCase();

            const rate = ratesByCurrency.get(currencyCode);

            if (!rate) {
                skippedCountries.push({
                    country: country.name,
                    currencyCode,
                    reason:
                        "Currency is unsupported or has no recent rate data.",
                });
                continue;
            }

            await prisma.operationalCountry.update({
                where: { id: country.id },
                data: {
                    currentExchangeRate: rate.currentRate,
                    previousExchangeRate: rate.previousRate,
                    exchangeRateDate: new Date(
                        `${rate.rateDate}T00:00:00.000Z`
                    ),
                },
            });

            updatedCountries.push(country.name);
        }

        return NextResponse.json({
            success: true,
            message: `Updated exchange rates for ${updatedCountries.length} country record(s).`,
            updated: updatedCountries.length,
            updatedCountries,
            skipped: skippedCountries,
            rateDateRange: { from, to },
        });
    } catch (error) {
        console.error("Update exchange rates error:", error);

        return NextResponse.json(
            {
                message:
                    "Could not update exchange rates. Please try again later.",
            },
            { status: 502 }
        );
    }
}
