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

function decodeEntities(s: string) {
  return s
    .replace(/<!\\[CDATA\\[/g, "")
    .replace(/\\]\\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function getTag(itemXml: string, tag: string) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = itemXml.match(re);
  return m?.[1] ? decodeEntities(m[1].trim()) : "";
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
        accept: "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7",
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
    const itemMatches = xmlText.match(/<item\\b[\\s\\S]*?<\\/item>/gi) ?? [];
    const posts = itemMatches
      .slice(0, limit)
      .map((itemXml) => {
        const urlStr = getTag(itemXml, "link");
        const guid = getTag(itemXml, "guid") || urlStr;
        const title = getTag(itemXml, "title") || "Untitled";
        const pubDateRaw = getTag(itemXml, "pubDate");
        const publishedIso = pubDateRaw ? new Date(pubDateRaw).toISOString() : "";
        const description = getTag(itemXml, "description");
        const excerpt = description ? stripHtml(description).slice(0, 200) : "";
        if (!urlStr) return null;
        return { id: guid || urlStr, title, url: urlStr, publishedIso, excerpt };
      })
      .filter(Boolean);

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

