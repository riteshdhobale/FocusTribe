// ─── Geo-Pricing Engine ────────────────────────────────────────────
// Detects user's region via browser timezone (no external API needed)
// and returns the correct pricing for their market.
//
// How it works:
//   1. Intl.DateTimeFormat().resolvedOptions().timeZone → "Asia/Kolkata"
//   2. Map timezone → region (india, usa, uk, eu, sea, mena, row)
//   3. Return pricing with correct currency symbol, amounts, and currency code

export type PricingRegion = "india" | "usa" | "uk" | "eu" | "sea" | "mena" | "anz" | "row";

export type RegionPricing = {
  region: PricingRegion;
  currency: string; // ISO 4217 code for Razorpay: "INR", "USD", "GBP", "EUR"
  currencySymbol: string; // Display symbol: "₹", "$", "£", "€"
  plans: {
    weekly: { amount: number; mrp: number; perDay: string };
    pro: { amount: number; mrp: number; perDay: string };
    campus: { amount: number; mrp: number; perDay: string; perMonth: string };
  };
};

// ─── Timezone → Region mapping ─────────────────────────────────────
const TIMEZONE_REGION_MAP: Record<string, PricingRegion> = {
  // India
  "Asia/Kolkata": "india",
  "Asia/Calcutta": "india",
  "Asia/Chennai": "india",

  // USA & Canada
  "America/New_York": "usa",
  "America/Chicago": "usa",
  "America/Denver": "usa",
  "America/Los_Angeles": "usa",
  "America/Phoenix": "usa",
  "America/Anchorage": "usa",
  "Pacific/Honolulu": "usa",
  "America/Toronto": "usa",
  "America/Vancouver": "usa",
  "America/Edmonton": "usa",
  "America/Winnipeg": "usa",
  "America/Halifax": "usa",
  "America/St_Johns": "usa",
  "America/Regina": "usa",

  // UK & Ireland
  "Europe/London": "uk",
  "Europe/Dublin": "uk",

  // EU
  "Europe/Berlin": "eu",
  "Europe/Paris": "eu",
  "Europe/Rome": "eu",
  "Europe/Madrid": "eu",
  "Europe/Amsterdam": "eu",
  "Europe/Brussels": "eu",
  "Europe/Vienna": "eu",
  "Europe/Zurich": "eu",
  "Europe/Stockholm": "eu",
  "Europe/Oslo": "eu",
  "Europe/Copenhagen": "eu",
  "Europe/Helsinki": "eu",
  "Europe/Warsaw": "eu",
  "Europe/Prague": "eu",
  "Europe/Budapest": "eu",
  "Europe/Bucharest": "eu",
  "Europe/Athens": "eu",
  "Europe/Lisbon": "eu",

  // Southeast Asia
  "Asia/Singapore": "sea",
  "Asia/Kuala_Lumpur": "sea",
  "Asia/Jakarta": "sea",
  "Asia/Bangkok": "sea",
  "Asia/Manila": "sea",
  "Asia/Ho_Chi_Minh": "sea",

  // Middle East & North Africa
  "Asia/Dubai": "mena",
  "Asia/Riyadh": "mena",
  "Asia/Qatar": "mena",
  "Asia/Bahrain": "mena",
  "Asia/Kuwait": "mena",
  "Africa/Cairo": "mena",

  // Australia & New Zealand → own region (AUD-equivalent USD pricing)
  "Australia/Sydney": "anz",
  "Australia/Melbourne": "anz",
  "Australia/Brisbane": "anz",
  "Australia/Perth": "anz",
  "Australia/Adelaide": "anz",
  "Pacific/Auckland": "anz",

  // Latin America → treat as ROW (USD)
  "America/Sao_Paulo": "row",
  "America/Argentina/Buenos_Aires": "row",
  "America/Mexico_City": "row",
  "America/Bogota": "row",
  "America/Lima": "row",
  "America/Santiago": "row",
};

// ─── Pricing tables per region ─────────────────────────────────────
const REGION_PRICING: Record<PricingRegion, RegionPricing> = {
  india: {
    region: "india",
    currency: "INR",
    currencySymbol: "₹",
    plans: {
      weekly: { amount: 5900, mrp: 19900, perDay: "₹8/day" },
      pro: { amount: 19900, mrp: 79900, perDay: "₹6.6/day" },
      campus: { amount: 149900, mrp: 499900, perDay: "₹4.1/day", perMonth: "₹125" },
    },
  },
  usa: {
    region: "usa",
    currency: "USD",
    currencySymbol: "$",
    plans: {
      weekly: { amount: 299, mrp: 799, perDay: "$0.43/day" },
      pro: { amount: 999, mrp: 2999, perDay: "$0.33/day" },
      campus: { amount: 7999, mrp: 19999, perDay: "$0.22/day", perMonth: "$6.67" },
    },
  },
  uk: {
    region: "uk",
    currency: "GBP",
    currencySymbol: "£",
    plans: {
      weekly: { amount: 249, mrp: 699, perDay: "£0.36/day" },
      pro: { amount: 799, mrp: 2999, perDay: "£0.27/day" },
      campus: { amount: 5999, mrp: 17999, perDay: "£0.16/day", perMonth: "£5.00" },
    },
  },
  eu: {
    region: "eu",
    currency: "EUR",
    currencySymbol: "€",
    plans: {
      weekly: { amount: 299, mrp: 899, perDay: "€0.43/day" },
      pro: { amount: 999, mrp: 3499, perDay: "€0.33/day" },
      campus: { amount: 7999, mrp: 21999, perDay: "€0.22/day", perMonth: "€6.67" },
    },
  },
  sea: {
    region: "sea",
    currency: "USD",
    currencySymbol: "$",
    plans: {
      weekly: { amount: 199, mrp: 499, perDay: "$0.28/day" },
      pro: { amount: 599, mrp: 1999, perDay: "$0.20/day" },
      campus: { amount: 4999, mrp: 11999, perDay: "$0.14/day", perMonth: "$4.17" },
    },
  },
  mena: {
    region: "mena",
    currency: "USD",
    currencySymbol: "$",
    plans: {
      weekly: { amount: 249, mrp: 599, perDay: "$0.36/day" },
      pro: { amount: 799, mrp: 2499, perDay: "$0.27/day" },
      campus: { amount: 5999, mrp: 14999, perDay: "$0.16/day", perMonth: "$5.00" },
    },
  },
  anz: {
    region: "anz",
    currency: "USD",
    currencySymbol: "$",
    plans: {
      weekly: { amount: 349, mrp: 899, perDay: "$0.50/day" },
      pro: { amount: 1299, mrp: 3499, perDay: "$0.43/day" },
      campus: { amount: 9999, mrp: 24999, perDay: "$0.27/day", perMonth: "$8.33" },
    },
  },
  row: {
    region: "row",
    currency: "USD",
    currencySymbol: "$",
    plans: {
      weekly: { amount: 299, mrp: 799, perDay: "$0.43/day" },
      pro: { amount: 999, mrp: 2999, perDay: "$0.33/day" },
      campus: { amount: 7999, mrp: 19999, perDay: "$0.22/day", perMonth: "$6.67" },
    },
  },
};

// ─── Public API ────────────────────────────────────────────────────

/**
 * Detect the user's pricing region based on their browser timezone.
 * Falls back to "row" (Rest of World, USD) if timezone is unknown.
 */
export function detectRegion(): PricingRegion {
  if (typeof window === "undefined") return "india"; // SSR default

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_REGION_MAP[tz]) {
      return TIMEZONE_REGION_MAP[tz];
    }

    // Fallback: check timezone prefix for broader matching
    if (tz?.startsWith("Asia/Kolkata") || tz?.startsWith("Asia/Calcutta")) return "india";
    if (tz?.startsWith("America/")) return "usa";
    if (tz?.startsWith("Europe/London") || tz?.startsWith("Europe/Dublin")) return "uk";
    if (tz?.startsWith("Europe/")) return "eu";
    if (
      tz?.startsWith("Asia/Singapore") ||
      tz?.startsWith("Asia/Jakarta") ||
      tz?.startsWith("Asia/Bangkok")
    )
      return "sea";
    if (tz?.startsWith("Asia/Dubai") || tz?.startsWith("Asia/Riyadh")) return "mena";

    return "row";
  } catch {
    return "row";
  }
}

/**
 * Get the full pricing config for a detected or specified region.
 */
export function getRegionPricing(region?: PricingRegion): RegionPricing {
  const r = region || detectRegion();
  return REGION_PRICING[r] || REGION_PRICING.row;
}

/**
 * Format an amount in the smallest currency unit (paise/cents) to a display string.
 * e.g. formatPrice(19900, "₹") → "₹199"
 */
export function formatPrice(amountInSmallestUnit: number, currencySymbol: string): string {
  const major = amountInSmallestUnit / 100;
  // For whole numbers, don't show decimals. For decimals, show 2.
  const formatted = major % 1 === 0 ? major.toString() : major.toFixed(2);
  return `${currencySymbol}${formatted}`;
}

/**
 * Format the MRP with strikethrough for display.
 * Returns the raw formatted string (the component handles the strikethrough styling).
 */
export function formatMrp(mrpInSmallestUnit: number, currencySymbol: string): string {
  return formatPrice(mrpInSmallestUnit, currencySymbol);
}

/**
 * Calculate the discount percentage between MRP and actual price.
 */
export function discountPercent(mrp: number, actual: number): number {
  if (mrp <= 0) return 0;
  return Math.round(((mrp - actual) / mrp) * 100);
}
