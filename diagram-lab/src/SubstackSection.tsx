import { useEffect, useMemo, useState } from "react";

type SubstackPost = {
  id: string;
  title: string;
  url: string;
  publishedIso: string;
  excerpt?: string;
  imageUrl?: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export default function SubstackSection({
  profileUrl = "https://substack.com/@fpctest?utm_campaign=profile&utm_medium=profile-page",
  maxPosts = 4,
}: {
  profileUrl?: string;
  maxPosts?: number;
}) {
  const [posts, setPosts] = useState<SubstackPost[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setFailed(false);
        const res = await fetch("/substack-posts.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`json http ${res.status}`);
        const data = (await res.json()) as { ok: boolean; posts?: SubstackPost[] };
        const limited = (data.posts ?? []).slice(0, maxPosts);
        if (!data.ok || !limited.length) throw new Error("json empty");
        if (!cancelled) setPosts(limited);
      } catch {
        if (!cancelled) {
          setFailed(true);
          setPosts(null);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [maxPosts]);

  const headingId = useMemo(() => "fpc-substack", []);

  return (
    <section
      aria-labelledby={headingId}
      className="relative overflow-hidden border-t border-slate/10 bg-surface px-6 py-16 text-navy md:py-24"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.85]" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,184,169,0.10),transparent_55%)]"></div>
      </div>

      <div className="relative mx-auto w-full max-w-[1200px]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal">Articles</p>
            <h2 id={headingId} className="mt-5 text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl md:text-5xl">
              Latest from FPC.
            </h2>
            <p className="mt-5 text-base text-slate md:text-lg">
              Deep dives on PCBA testing, fixtures, avionics &amp; LRU testing, and hardware test automation.
            </p>
          </div>

          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center justify-center rounded-xl bg-teal px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Read on Substack
          </a>
        </div>

        {failed ? (
          <div className="mt-10 rounded-2xl border border-slate/10 bg-white p-6 shadow-card">
            <p className="text-sm font-semibold text-navy">Latest posts couldn’t be loaded.</p>
            <p className="mt-2 text-sm text-slate">
              You can still read all articles on{" "}
              <a className="font-semibold text-navy hover:underline" href={profileUrl} target="_blank" rel="noreferrer">
                Substack
              </a>
              .
            </p>
          </div>
        ) : posts && posts.length ? (
          <div className="mt-12 -mx-2 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-6">
            {posts.map((p) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="group relative w-[320px] shrink-0 overflow-hidden rounded-3xl border border-slate/10 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-55px_rgba(10,37,64,0.50)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal sm:w-[340px] lg:w-[300px]"
              >
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,184,169,0.10),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden="true"
                ></div>
                {p.imageUrl ? (
                  <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-2xl border border-slate/10 bg-surface">
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      draggable={false}
                    />
                  </div>
                ) : null}
                <p className="relative text-sm font-semibold text-navy">{p.title}</p>
                {p.publishedIso ? (
                  <p className="relative mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate/70">
                    {formatDate(p.publishedIso)}
                  </p>
                ) : null}
                {p.excerpt ? <p className="relative mt-4 text-sm leading-relaxed text-slate">{p.excerpt}</p> : null}
                <p className="relative mt-5 text-sm font-semibold text-teal">Read article</p>
              </a>
            ))}
            </div>
          </div>
        ) : (
          <div className="mt-12 -mx-2 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Loading articles">
            <div className="flex gap-6">
              {Array.from({ length: maxPosts }).map((_, idx) => (
                <div key={idx} className="h-40 w-[320px] shrink-0 animate-pulse rounded-3xl border border-slate/10 bg-white/70 sm:w-[340px] lg:w-[300px]" />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

