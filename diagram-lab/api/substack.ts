export const config = {
  runtime: "edge",
};

const FEED_URL = "https://fpctest.substack.com/feed";

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const limitRaw = url.searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitRaw ?? "6") || 6, 1), 12);

  try {
    const res = await fetch(FEED_URL, {
      headers: {
        // Some origins are more reliable when a UA is present.
        "user-agent": "FPC Website (Vercel Edge)",
      },
    });
    if (!res.ok) {
      return new Response(JSON.stringify({ ok: false, error: `feed_http_${res.status}` }), {
        status: 502,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "s-maxage=900, stale-while-revalidate=86400",
        },
      });
    }

    const xmlText = await res.text();
    const doc = new DOMParser().parseFromString(xmlText, "text/xml");
    const items = Array.from(doc.querySelectorAll("item"));

    const posts = items
      .map((item) => {
        const link = item.querySelector("link")?.textContent?.trim() ?? "";
        const guid = item.querySelector("guid")?.textContent?.trim() ?? link;
        const title = item.querySelector("title")?.textContent?.trim() ?? "Untitled";
        const pubDateRaw = item.querySelector("pubDate")?.textContent?.trim() ?? "";
        const publishedIso = pubDateRaw ? new Date(pubDateRaw).toISOString() : "";
        const description = item.querySelector("description")?.textContent?.trim() ?? "";
        const excerpt = description ? stripHtml(description).slice(0, 200) : "";
        if (!link) return null;
        return { id: guid || link, title, url: link, publishedIso, excerpt };
      })
      .filter(Boolean)
      .slice(0, limit);

    return new Response(JSON.stringify({ ok: true, posts }), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "s-maxage=900, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "fetch_failed" }), {
      status: 502,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
}

