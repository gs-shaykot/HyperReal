import { NextResponse } from "next/server";

export const revalidate = 259200; // 3 days

const API_BASE = "https://api.restcountries.com/countries/v5";

type RestCountry = {
  names?: {
    common?: string;
  };
  codes?: {
    alpha_2?: string;
  };
  flag?: {
    emoji?: string;
  };
  calling_codes?: string[];
  currencies?: Array<{
    code?: string;
    name?: string;
    symbol?: string;
  }>;
};

type RestCountriesResponse = {
  data?: {
    objects?: RestCountry[];
    meta?: {
      more?: boolean;
    };
  };
};

export type CountryOption = {
  name: string;
  code: string;
  flag: string;
  phoneCode: string;
  currencyCode: string;
  currencySymbol: string;
};

const RESPONSE_FIELDS =
  "names.common,codes.alpha_2,flag.emoji,calling_codes,currencies";

async function fetchCountries(
  offset: number,
  token: string
): Promise<RestCountriesResponse> {
  const url = new URL(API_BASE);

  url.searchParams.set("limit", "100");
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("response_fields", RESPONSE_FIELDS);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    next: {
      revalidate: 259200,
    },
  });

  if (!response.ok) {
    throw new Error(
      `REST Countries request failed with status ${response.status}`
    );
  }

  return response.json() as Promise<RestCountriesResponse>;
}

function normalizeCountry(country: RestCountry): CountryOption | null {
  const name = country.names?.common?.trim();
  const code = country.codes?.alpha_2?.trim().toUpperCase();

  if (!name || !code) {
    return null;
  }

  const callingCode = country.calling_codes?.find(Boolean) ?? "";
  const currency = country.currencies?.find(
    (item) => item.code && item.symbol !== undefined
  );

  return {
    name,
    code,
    flag: country.flag?.emoji ?? "",
    phoneCode: callingCode ? `+${callingCode.replace(/^\+/, "")}` : "",
    currencyCode: currency?.code ?? "",
    currencySymbol: currency?.symbol ?? "",
  };
}

export async function GET() {
  const token = process.env.REST_COUNTRIES_API_KEY;

  if (!token) {
    return NextResponse.json(
      { message: "REST_COUNTRIES_API_KEY is not configured." },
      { status: 500 }
    );
  }

  try {
    const countries: RestCountry[] = [];
    let offset = 0;

    while (true) {
      const result = await fetchCountries(offset, token);
      const page = result.data?.objects ?? [];

      countries.push(...page);

      if (page.length === 0 || !result.data?.meta?.more) {
        break;
      }

      offset += page.length;
    }

    const options = countries
      .map(normalizeCountry)
      .filter((country): country is CountryOption => country !== null)
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(options, {
      headers: {
        "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {

    return NextResponse.json(
      { message: "Unable to load countries. Please try again later." },
      { status: 502 }
    );
  }
}