import { createFileRoute } from "@tanstack/react-router";
import { sanitizeQuery, sanitizeType } from "./_sanitize";

function isValidKey(k: string | null | undefined): boolean {
  if (!k) return false;
  const t = k.trim().toLowerCase();
  if (!t || t === "null" || t === "undefined" || t === "none" || t === "placeholder") return false;
  return k.trim().length >= 15;
}

function getKey(request: Request, url: URL): string {
  const q = url.searchParams.get("api_key");
  const h = request.headers.get("x-custom-serpapi-key");
  if (isValidKey(q)) return q!.trim();
  if (isValidKey(h)) return h!.trim();
  const env = process.env.SERPAPI_KEY;
  if (isValidKey(env)) return env!.trim();
  return "";
}

function isBlockedGoogleUrl(value: string | null | undefined): boolean {
  if (!value) return true;
  try {
    const host = new URL(value).hostname.replace(/^www\./, "").toLowerCase();
    return host === "google.com" || host.endsWith(".google.com") || host === "googleadservices.com" || host.endsWith(".googleadservices.com");
  } catch {
    return true;
  }
}

function merchantSearchUrl(storeName: string, productName: string): string {
  const query = encodeURIComponent(productName || "filamento impressora 3d");
  return `https://www.google.com/search?tbm=shop&q=${query}`;
}

async function fetchShopping(query: string, apiKey: string) {
  const url = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&gl=br&hl=pt&tbs=p_ord:p&api_key=${apiKey}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return [];
    const data: any = await res.json();
    return (data.shopping_results || [])
      .map((r: any) => ({
        storeName: r.source || r.store || "Loja",
        productName: r.title || "",
        price: typeof r.extracted_price === "number" ? r.extracted_price : Number(String(r.price || "").replace(/[^0-9,.-]/g, "").replace(",", ".")) || 0,
        rating: typeof r.rating === "number" ? r.rating : 4.5,
        reviews: typeof r.reviews === "number" ? r.reviews : 0,
        feature: Array.isArray(r.extensions) && r.extensions.length ? String(r.extensions[0]) : (r.delivery || ""),
        buyUrl: !isBlockedGoogleUrl(r.link) ? r.link : merchantSearchUrl(r.source || r.store || "", r.title || query),
        thumbnail: r.thumbnail || "",
      }))
      .filter((o: any) => o.price > 0);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

const DEFAULT_MATERIALS: Array<{ type: string; query: string }> = [
  { type: "PLA", query: "filamento pla 1.75mm 1kg impressora 3d" },
  { type: "PETG", query: "filamento petg 1.75mm 1kg impressora 3d" },
  { type: "TPU", query: "filamento flexivel tpu 1.75mm 1kg impressora 3d" },
  { type: "SILK", query: "filamento silk pla 1.75mm 1kg impressora 3d" },
];

const TOP_N = 5;
const topByPrice = <T extends { price: number }>(offers: T[]): T[] =>
  [...offers].sort((a, b) => a.price - b.price).slice(0, TOP_N);

export const Route = createFileRoute("/api/quotations")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const apiKey = getKey(request, url);
        if (!apiKey) {
          return Response.json([{ type: "PLA", offers: [], error: "Chave SerpApi ausente ou inválida." }]);
        }
        const customQ = sanitizeQuery(url.searchParams.get("q") || url.searchParams.get("query"));

        if (customQ) {
          const offers = await fetchShopping(customQ, apiKey);
          const safeType = sanitizeType(url.searchParams.get("type")) || "Produtos";
          return Response.json([
            { type: safeType, offers: topByPrice(offers), searchQuery: customQ },
          ]);
        }

        // Default: fetch the three workshop materials in parallel
        const groups = await Promise.all(
          DEFAULT_MATERIALS.map(async (m) => ({
            type: m.type,
            searchQuery: m.query,
            offers: topByPrice(await fetchShopping(m.query, apiKey)),
          })),
        );
        return Response.json(groups);
      },
    },
  },
});