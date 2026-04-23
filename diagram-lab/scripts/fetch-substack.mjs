import Parser from "rss-parser";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const FEED_URL = "https://fpctest.substack.com/feed";
const OUT_DIR = path.resolve("public");
const OUT_FILE = path.join(OUT_DIR, "substack-posts.json");
const LIMIT = 4;

function stripHtml(html) {
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstImageUrl(html) {
  const s = String(html ?? "");
  const m = s.match(/<img\b[^>]*\bsrc=(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>/i);
  const url = (m?.[1] ?? m?.[2] ?? m?.[3] ?? "").trim();
  if (!url) return "";
  // Strip common tracking query params while keeping the image valid.
  try {
    const u = new URL(url);
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((k) => u.searchParams.delete(k));
    return u.toString();
  } catch {
    return url;
  }
}

async function main() {
  const parser = new Parser();
  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error(`feed_http_${res.status}`);
  const xml = await res.text();
  const feed = await parser.parseString(xml);
  const posts = (feed.items ?? [])
    .slice(0, LIMIT)
    .map((item) => {
      const url = (item.link ?? "").trim();
      if (!url) return null;
      const id = (item.guid ?? url).trim() || url;
      const title = (item.title ?? "Untitled").trim();
      const dateRaw = item.isoDate ?? item.pubDate ?? "";
      const publishedIso = dateRaw ? new Date(dateRaw).toISOString() : "";
      const content = item.content ?? item["content:encoded"] ?? item.summary ?? item.contentSnippet ?? "";
      const excerptSource = item.contentSnippet ?? item.summary ?? item.content ?? "";
      const excerpt = excerptSource ? stripHtml(excerptSource).slice(0, 200) : "";
      const enclosureUrl = (item.enclosure && item.enclosure.url ? String(item.enclosure.url) : "").trim();
      const imageUrl = enclosureUrl || firstImageUrl(content) || firstImageUrl(excerptSource);
      return { id, title, url, publishedIso, excerpt, imageUrl };
    })
    .filter(Boolean);

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify({ ok: true, posts }, null, 2) + "\n", "utf8");
  console.log(`Wrote ${posts.length} posts to ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(0);
});

