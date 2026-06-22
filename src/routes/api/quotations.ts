import { createFileRoute } from "@tanstack/react-router";

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
        buyUrl: r.product_link || r.link || "",
        thumbnail: r.thumbnail || "",
      }))
      .filter((o: any) => o.price > 0);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export const Route = createFileRoute("/api/quotations")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const apiKey = getKey(request, url);
        if (!apiKey) return Response.json([]);
        const customQ = url.searchParams.get("q") || url.searchParams.get("query") || "";
        if (!customQ.trim()) return Response.json([]);
        const offers = await fetchShopping(customQ.trim(), apiKey);
        return Response.json([{ type: url.searchParams.get("type") || "Produtos", offers, searchQuery: customQ.trim() }]);
      },
    },
  },
});