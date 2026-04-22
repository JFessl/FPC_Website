import { useEffect, useRef, useState } from "react";

function DraggableMarquee({
  children,
  className = "",
  speed = 0.55,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  ariaLabel?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false);
  const lastClientX = useRef(0);
  const carry = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const fn = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const pauseAuto = reducedMotion || isDragging;

  useEffect(() => {
    if (pauseAuto) return;
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    const tick = () => {
      const node = scrollRef.current;
      if (!node) return;
      carry.current += speed;
      const step = Math.trunc(carry.current);
      if (step !== 0) {
        node.scrollLeft += step;
        carry.current -= step;
      }
      const half = node.scrollWidth / 2;
      if (half > 0 && node.scrollLeft >= half - 1) {
        node.scrollLeft -= half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pauseAuto, speed]);

  const wrapScroll = (el: HTMLDivElement) => {
    const half = el.scrollWidth / 2;
    if (half <= 0) return;
    let sl = el.scrollLeft;
    while (sl < 0) sl += half;
    while (sl >= half - 0.5) sl -= half;
    el.scrollLeft = sl;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    setIsDragging(true);
    lastClientX.current = e.clientX;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !scrollRef.current) return;
    const el = scrollRef.current;
    const dx = e.clientX - lastClientX.current;
    lastClientX.current = e.clientX;
    el.scrollLeft -= dx;
    wrapScroll(el);
  };

  const onPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) {
      draggingRef.current = false;
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        //
      }
    }
  };

  return (
    <div
      ref={scrollRef}
      role="region"
      aria-label={ariaLabel}
      className={[
        "min-w-0 overflow-x-hidden overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        reducedMotion ? "" : "cursor-grab active:cursor-grabbing",
        isDragging ? "select-none" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      style={reducedMotion ? undefined : { touchAction: "none" }}
    >
      {children}
    </div>
  );
}

export default function FunTestPage() {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (!open) return;
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <div className="bg-surface text-slate antialiased">
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto w-full max-w-[1200px] px-6 pt-5">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-navy/35 px-4 py-3 backdrop-blur-md md:px-6">
            <a href="/" className="flex items-center gap-3">
              <img src="/visual/Logo.png" alt="FPC" className="h-7 w-auto object-contain" draggable={false} />
              <span className="hidden text-xs font-semibold uppercase tracking-[0.22em] text-white/60 md:inline">
                FunTest software
              </span>
            </a>

            <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
              <a className="text-sm font-semibold text-white/90 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal" href="/#coverage">
                Type of test stations
              </a>
              <a className="text-sm font-semibold text-white/90 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal" href="/#examples">
                Project examples
              </a>
              <a className="text-sm font-semibold text-white/90 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal" href="/funtest">
                Software
              </a>
              <a className="text-sm font-semibold text-white/90 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal" href="/#contact">
                Contact
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white/90 backdrop-blur transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal md:hidden"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu-funtest"
                onClick={() => setMobileOpen((v) => !v)}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  {mobileOpen ? (
                    <path
                      d="M6 6l12 12M18 6 6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <path
                      d="M4 7h16M4 12h16M4 17h16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Let's chat
              </button>
            </div>
          </div>

          {mobileOpen ? (
            <div
              id="mobile-menu-funtest"
              className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-navy/70 backdrop-blur-md md:hidden"
              aria-label="Mobile navigation"
            >
              <nav className="flex flex-col px-4 py-3" aria-label="Primary mobile">
                {[
                  { href: "/#coverage", label: "Type of test stations" },
                  { href: "/#examples", label: "Project examples" },
                  { href: "/funtest", label: "Software" },
                  { href: "/#contact", label: "Contact" },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          ) : null}
        </div>
      </header>

      {/* Simple inline modal (same Calendly link) */}
      {open ? (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Book a meeting">
          <button
            type="button"
            className="absolute inset-0 bg-navy/70 backdrop-blur-sm"
            aria-label="Close booking dialog"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
            <div className="relative w-full max-w-[980px] overflow-hidden rounded-3xl border border-white/10 bg-navy shadow-[0_50px_120px_-80px_rgba(0,0,0,0.85)]">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-white/5 px-5 py-4 text-white backdrop-blur">
                <div>
                  <p className="text-sm font-semibold">Book a 30-minute call</p>
                  <p className="mt-0.5 text-xs text-white/65">Calendly</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
              <div className="h-[72vh] min-h-[520px] bg-white">
                <iframe
                  title="Calendly booking"
                  src="https://calendly.com/funtest/30min?hide_gdpr_banner=1"
                  className="h-full w-full"
                  frameBorder={0}
                  allow="clipboard-write; fullscreen"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <main>
        {/* Hero */}
        <section className="relative min-h-[88svh] overflow-hidden bg-navy text-white md:min-h-[94svh]" aria-label="FunTest hero">
          <div className="absolute inset-0">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              disablePictureInPicture
              controls={false}
              aria-hidden="true"
            >
              <source src="/video/fT%20Video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/55 to-navy/90" aria-hidden="true"></div>
            <div className="absolute inset-0 bg-teal/15 mix-blend-multiply" aria-hidden="true"></div>
          </div>

          <div className="relative mx-auto flex w-full max-w-[1200px] flex-col justify-end px-6 pb-16 pt-28 md:pb-20 md:pt-32">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal/95">FunTest software</p>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
                Build automated test sequences without writing a software stack.
              </h1>
              <p className="mt-6 max-w-2xl text-base text-white/80 md:text-lg">
                Create spreadsheet-style sequences, control hardware through plugins, guide operators, and generate reports —
                without needing a LabVIEW or Python developer.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <a
                  href="#operator"
                  className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-navy transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Explore features
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Let's chat
                </button>
              </div>

              <div className="mt-10">
                <DraggableMarquee ariaLabel="FunTest software pillars" speed={0.9}>
                  <div className="flex items-center gap-3 pr-3">
                    {(["a", "b"] as const).map((g) => (
                      <div key={g} className="flex items-center gap-3">
                        {[
                          { href: "#operator", label: "Operator interface" },
                          { href: "#no-code", label: "Test sequence" },
                          { href: "#plugins", label: "Hardware control" },
                          { href: "#reporting", label: "Test reporting" },
                        ].map((item) => (
                          <a
                            key={`${g}-${item.href}`}
                            href={item.href}
                            className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-4 text-sm font-semibold leading-none text-white/90 backdrop-blur transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden="true" />
                            {item.label}
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                </DraggableMarquee>
              </div>
            </div>
          </div>
        </section>

        {/* Why we developed FunTest */}
        <section className="relative overflow-hidden border-t border-white/10 bg-navy px-6 py-14 text-white md:py-20" aria-label="Why we developed FunTest">
          <div className="pointer-events-none absolute inset-0 opacity-[0.9]" aria-hidden="true">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,184,169,0.14),transparent_55%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.05),transparent_55%)]"></div>
            <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:52px_52px] opacity-[0.16]"></div>
          </div>

          <div className="relative mx-auto w-full max-w-[1200px]">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-14">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal">Why FunTest</p>
                <h2 className="mt-5 text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl">
                  Why we developed funTest.
                </h2>
                <p className="mt-5 text-base text-white/80 md:text-lg">
                  A quick walkthrough on the problem we saw in test engineering and what funTest fixes.
                </p>
              </div>

              <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-card backdrop-blur">
                <div className="border-b border-white/10 px-6 py-5">
                  <p className="text-sm font-semibold text-white">Why we developed funTest</p>
                </div>
                <div className="relative aspect-video bg-black">
                  <iframe
                    title="Why we developed FunTest"
                    className="absolute inset-0 h-full w-full"
                    src="https://www.youtube-nocookie.com/embed/95AB-oaO0bQ?rel=0&modestbranding=1"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Detailed sections */}
        <section className="relative overflow-hidden bg-navy px-6 py-16 text-white md:py-24" aria-label="FunTest details">
          <div className="pointer-events-none absolute inset-0 opacity-[0.9]" aria-hidden="true">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,184,169,0.16),transparent_55%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.05),transparent_55%)]"></div>
            <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:52px_52px] opacity-[0.18]"></div>
          </div>

          <div className="relative mx-auto w-full max-w-[1200px] space-y-14">
            <section id="operator" className="scroll-mt-28">
              <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal">Operator interface</p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Everything on one screen.</h2>
                  <p className="mt-5 text-base text-white/80 md:text-lg">
                    Guide the operator through automated and manual steps while collecting results in real time — reducing
                    mistakes and speeding up execution.
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-white/75">
                    {[
                      "Live results for the current test + history",
                      "On-screen instructions (text, images, video)",
                      "Dialog prompts for serial numbers, IDs, and checklists",
                      "Manual verification with digital I/O when needed",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-card backdrop-blur">
                  <div className="relative aspect-video bg-black/40">
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video
                      className="absolute inset-0 h-full w-full object-contain"
                      autoPlay
                      muted
                      loop
                      controls
                      playsInline
                      preload="metadata"
                      src="/video/fT%20UI.mp4"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section id="no-code" className="scroll-mt-28">
              <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
                <div className="order-1 lg:order-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal">No coding experience needed</p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Create test sequences with ease.</h2>
                  <p className="mt-5 text-base text-white/80 md:text-lg">
                    Build automated sequences in a spreadsheet format. Use formulas to post-process results and define pass/fail
                    criteria without creating complex software.
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-white/75">
                    {[
                      "Simple test step creation in a spreadsheet-style editor",
                      "Powerful debugging: breakpoints, step, stop-on-fail",
                      "Readable sequences for fast troubleshooting and maintenance",
                      "Parallel execution to increase throughput",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="order-2 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card backdrop-blur lg:order-1">
                  <img
                    src="/visual/sequencer_white_text.png"
                    alt="FunTest test sequence editor"
                    className="aspect-[16/10] h-full w-full rounded-2xl object-contain"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </div>
              </div>
            </section>

            <section id="plugins" className="scroll-mt-28">
              <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
                <div className="order-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal">Hardware interface</p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Seamlessly control hardware.</h2>
                  <p className="mt-5 text-base text-white/80 md:text-lg">
                    Communicate with test equipment, switching, DAQ, PLCs, and your DUT through a plugin architecture.
                    If you have a unique device, we can develop a custom plugin.
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-white/75">
                    {[
                      "COTS instruments (VISA / SCPI)",
                      "Switching systems / matrix boxes",
                      "DAQ and high-speed acquisition",
                      "DUT comms: serial, CAN/LIN, TCP/IP",
                      "PLC + factory protocols",
                      "Python plugins for endless customization",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="order-2 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card backdrop-blur">
                  <img
                    src="/visual/plugin_white_text.png"
                    alt="FunTest hardware plugin library"
                    className="aspect-[16/10] h-full w-full rounded-2xl object-contain"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </div>
              </div>
            </section>

            <section id="reporting" className="scroll-mt-28">
              <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
                <div className="order-2 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card backdrop-blur lg:order-1">
                  <img
                    src="/visual/Test%20Reports.png"
                    alt="FunTest test reports and statistics"
                    className="aspect-[16/10] h-full w-full rounded-2xl object-contain"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </div>
                <div className="order-1 lg:order-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal">Test reporting</p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">No more manual reporting.</h2>
                  <p className="mt-5 text-base text-white/80 md:text-lg">
                    Generate detailed reports for each run and long-term station statistics. Enable traceability with barcode
                    readers and label printers, and connect outputs to quality systems.
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-white/75">
                    {[
                      "PDF / CSV report generation",
                      "Daily station statistics export",
                      "Traceability: barcode + label printing",
                      "Quality system uploads (database / SQL)",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </section>

        <section id="learn-more" className="relative overflow-hidden border-t border-slate/10 bg-surface px-6 py-16 text-navy md:py-24">
          <div className="pointer-events-none absolute inset-0 opacity-[0.85]" aria-hidden="true">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,184,169,0.10),transparent_55%)]"></div>
          </div>

          <div className="relative mx-auto w-full max-w-[1200px]">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal">Learn more</p>
              <h2 className="mt-5 text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl md:text-5xl">
                funTest walkthroughs.
              </h2>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              {[
                { id: "ospy2avkxDo", title: "FunTest Product Walkthrough" },
                { id: "JlnkL-By6e8", title: "How to Create Measurement Sequence for Hardware Testing" },
                { id: "MynsO7VOQ9U", title: "How to Create and Control Operator Interface for Hardware Testing" },
                { id: "MBMFrD14s-8", title: "How to use Digital I/O in automated test sequence for hardware testing" },
                { id: "4IwnJ0gqF4E", title: "Creating Test Reports for Hardware Testing" },
              ].map((v) => (
                <article key={v.id} className="overflow-hidden rounded-3xl border border-slate/10 bg-white shadow-card">
                  <div className="border-b border-slate/10 px-6 py-5">
                    <p className="text-sm font-semibold text-navy">{v.title}</p>
                  </div>
                  <div className="relative aspect-video bg-black">
                    <iframe
                      title={v.title}
                      className="absolute inset-0 h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${v.id}?rel=0&modestbranding=1`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer matches home page */}
      <footer id="contact" className="border-t border-slate/10 bg-white px-6 py-12">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                <img src="/visual/Logo_Footer.png" alt="FPC" className="h-8 w-auto object-contain" draggable={false} />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                Hardware test engineering and station delivery for aerospace, defense, and complex electromechanical programs.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <a
                  href="https://www.linkedin.com/company/fpc-usa"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-slate/15 bg-surface px-3 py-2 text-navy transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                  aria-label="FPC on LinkedIn"
                  title="LinkedIn"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                    <path d="M20.447 20.452H17.21v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.01V9h3.086v1.561h.043c.43-.815 1.48-1.673 3.045-1.673 3.256 0 3.858 2.144 3.858 4.932v6.632ZM5.337 7.433a1.79 1.79 0 1 1 0-3.58 1.79 1.79 0 0 1 0 3.58ZM6.956 20.452H3.717V9h3.239v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.727v20.545C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.273V1.727C24 .774 23.2 0 22.222 0h.003Z" />
                  </svg>
                </a>
                <a
                  href="#top"
                  className="rounded-xl border border-slate/15 bg-surface px-4 py-2 text-sm font-semibold text-navy transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                >
                  Back to top
                </a>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate/70">Contact</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="sr-only">Email</dt>
                  <dd>
                    <a className="font-semibold text-navy hover:underline" href="mailto:info@funtestfpc.com">
                      info@funtestfpc.com
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Telephone</dt>
                  <dd>
                    <a className="font-semibold text-navy hover:underline" href="tel:+12134319776">
                      213-431-9776
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Address</dt>
                  <dd className="leading-relaxed text-slate">
                    2335 W 208th St
                    <br />
                    Torrance, CA 90501
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate/70">Links</p>
              <nav className="mt-4 flex flex-col gap-2 text-sm" aria-label="Footer">
                {[
                  { href: "/#coverage", label: "Type of test stations" },
                  { href: "/#examples", label: "Project examples" },
                  { href: "/funtest", label: "Software" },
                  { href: "/#contact", label: "Contact" },
                ].map((l) => (
                  <a key={l.href} href={l.href} className="font-semibold text-navy/90 hover:text-navy hover:underline">
                    {l.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-slate/10 pt-6 text-xs text-slate md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} FPC. All rights reserved.</p>
            <p className="text-slate/70"></p>
          </div>
        </div>
      </footer>
    </div>
  );
}

