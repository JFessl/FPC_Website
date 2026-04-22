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
      // iOS Safari can effectively quantize scrollLeft to integer pixels.
      // Accumulate sub-pixel movement so speeds < 1 still advance.
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
        "min-w-0 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
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

const PROJECT_EXAMPLE_ITEMS = [
  {
    src: "/visual/project-example-integrated-ate-rack.png",
    title: "Integrated ATE rack",
    caption:
      "Floor-standing automated test station with rack instrumentation, protected fixture bay, stack-light status, and operator workstation.",
    alt: "FPC floor-standing automated test equipment rack with integrated fixture area and monitor",
  },
  {
    src: "/visual/project-example-mobile-component-station.png",
    title: "Mobile component station",
    caption:
      "Half-rack cart with rack-mount scopes and supplies, top-mounted mechanical fixture, and guided test software on an articulating display.",
    alt: "FPC mobile component test station with top fixture and rack-mounted instruments",
  },
  {
    src: "/visual/project-example-lru-interface-rack.png",
    title: "LRU interface rack",
    caption:
      "Custom interface panels, high-density interconnects, and a rack-side workstation for subsystem and LRU validation.",
    alt: "FPC LRU test rack with custom interface panels and side-mounted monitor and keyboard",
  },
  {
    src: "/visual/project-example-bench-integration-station.png",
    title: "Bench integration station",
    caption:
      "Aluminum-frame bench with aerospace-style interface panels, traceability hardware, and under-bench instrumentation and control.",
    alt: "FPC bench-level test station with interface panels and integrated monitor",
  },
] as const;

const COMPONENT_DUT_ITEMS = [
  { src: "/visual/component-pcba-1.png", label: "PCBA", alt: "Printed circuit board assembly" },
  { src: "/visual/component-sensor.png", label: "Sensors", alt: "Sensor module" },
  { src: "/visual/component-actuator.png", label: "Actuators", alt: "Switch component" },
] as const;

const LRU_DUT_ITEMS = [
  { src: "/visual/subsystem-box-1.png", label: "Power Electronics", alt: "Line replaceable unit" },
  { src: "/visual/subsystem-box-2.png", label: "LRUs", alt: "Assembly unit" },
  { src: "/visual/subsystem-box-3.png", label: "Flight Computer", alt: "Subsystem module" },
] as const;

const TEST_TYPES = [
  "Functional test",
  "Environmental (temperature, humidity, vibration)",
  "HALT / HASS",
  "Burn-in",
  "ATE (automated test equipment)",
  "Hardware-in-the-loop (HIL)",
  "RF / EMC characterization",
  "End-of-line acceptance",
] as const;

const COMPLEX_HARDWARE_IMAGES = [
  {
    src: "/visual/hardware-exploded-airliner.png",
    label: "Commercial aviation",
    alt: "Exploded view of a commercial aircraft and subsystems",
  },
  {
    src: "/visual/hardware-exploded-ev.png",
    label: "Automotive & EV",
    alt: "Exploded view of an electric vehicle and subsystems",
  },
  {
    src: "/visual/hardware-exploded-fighter.png",
    label: "Defense & aerospace",
    alt: "Exploded view of a fighter aircraft and subsystems",
  },

  {
    src: "/visual/exploded-satellite.png",
    label: "Satellite platform",
    alt: "Exploded view of a satellite showing internal components",
  },
  {
    src: "/visual/exploded-drone.png",
    label: "Drone platform",
    alt: "Exploded view of a drone showing internal components",
  },
] as const;

function ComplexHardwareMarquee() {
  /** Fixed flex-basis so total strip width exceeds the column — required for overflow + auto-scroll (cqw-only widths were collapsing scroll range). */
  const slideClass =
    "group relative w-[min(260px,calc(50vw-2.5rem))] shrink-0 overflow-hidden rounded-2xl sm:w-[272px]";

  const group = (keyPrefix: string) => (
    <div className="flex gap-4" key={keyPrefix}>
      {COMPLEX_HARDWARE_IMAGES.map((img, i) => (
        <div key={`${keyPrefix}-${img.src}-${i}`} className={slideClass}>
          <img
            src={img.src}
            alt={img.alt}
            draggable={false}
            className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />
          <div className="pointer-events-none absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
            <span className="text-xs font-semibold text-navy drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] sm:text-sm">
              {img.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative w-full min-w-0 overflow-hidden">
      <DraggableMarquee ariaLabel="Exploded hardware examples, scrolling" speed={0.55} className="motion-reduce:pb-1">
        <div className="flex w-max gap-4">
          {group("a")}
          {group("b")}
        </div>
      </DraggableMarquee>
    </div>
  );
}

function formatInt(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

function CalendlyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Book a meeting">
      <button
        type="button"
        className="absolute inset-0 bg-navy/70 backdrop-blur-sm"
        aria-label="Close booking dialog"
        onClick={onClose}
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
              onClick={onClose}
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
  );
}

function CountUpNumber({
  to,
  durationMs = 1200,
  suffix = "",
  className = "",
}: {
  to: number;
  durationMs?: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setValue(to);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // Ease-out cubic for a “modern” count feel.
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(to * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationMs, started, to]);

  const done = started && Math.round(value) >= to;
  return (
    <span ref={ref} className={[className, done ? "fpc-count-up-fade" : ""].filter(Boolean).join(" ")}>
      {formatInt(done ? to : value)}
      {suffix}
    </span>
  );
}

function StationBulletRow({ items }: { items: readonly string[] }) {
  return (
    <ul
      className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3 md:gap-4"
      aria-label="Station capabilities"
    >
      {items.map((text) => (
        <li key={text} className="flex items-start gap-2.5">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden="true" />
          <span className="text-[13px] font-medium leading-snug text-white/90 sm:text-sm">{text}</span>
        </li>
      ))}
    </ul>
  );
}

function DutImageStrip({
  items,
  ariaLabel,
}: {
  items: readonly { src: string; label: string; alt: string }[];
  ariaLabel: string;
}) {
  const loop = [...items, ...items];
  return (
    <div className="relative mt-5 w-full min-w-0 max-w-full">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-navy to-transparent motion-reduce:hidden"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-navy to-transparent motion-reduce:hidden"
        aria-hidden="true"
      />
      <DraggableMarquee ariaLabel={ariaLabel} speed={0.6} className="motion-reduce:pb-1">
        <div className="flex w-max gap-6">
          {loop.map((it, i) => (
            <span
              key={`${it.label}-${i}`}
              className="inline-flex shrink-0 items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2"
            >
              <img
                src={it.src}
                alt={it.alt}
                draggable={false}
                className="h-[66px] w-auto object-contain sm:h-[72px]"
                loading="lazy"
                decoding="async"
              />
              <span className="text-sm font-semibold text-white/90 sm:text-base">{it.label}</span>
            </span>
          ))}
        </div>
      </DraggableMarquee>
    </div>
  );
}

function SiteHeader({ onOpenCalendly }: { onOpenCalendly: () => void }) {
  const linkClass =
    "text-sm font-semibold text-white/90 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto w-full max-w-[1200px] px-6 pt-5">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-navy/35 px-4 py-3 backdrop-blur-md md:px-6">
          <a href="#top" className="flex items-center gap-3">
            <img src="/visual/Logo.png" alt="FPC" className="h-7 w-auto object-contain" draggable={false} />
            <span className="hidden text-xs font-semibold uppercase tracking-[0.22em] text-white/60 md:inline">
              Hardware Test Development
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            <a className={linkClass} href="#coverage">
              Test Station Types
            </a>
            <a className={linkClass} href="#examples">
              Project Examples
            </a>
            <a className={linkClass} href="#contact">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white/90 backdrop-blur transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
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
              onClick={onOpenCalendly}
              className="rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Let’s chat
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div
            id="mobile-menu"
            className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-navy/70 backdrop-blur-md md:hidden"
            aria-label="Mobile navigation"
          >
            <nav className="flex flex-col px-4 py-3" aria-label="Primary mobile">
              {[
                { href: "#coverage", label: "Type of test stations" },
                { href: "#examples", label: "Project examples" },
                { href: "#contact", label: "Contact" },
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
  );
}

function HeroVideo({ onOpenCalendly }: { onOpenCalendly: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoOk, setVideoOk] = useState(true);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    // Some browsers/devices require an explicit play() even with autoplay+muted.
    const tryPlay = async () => {
      try {
        await el.play();
      } catch {
        // If autoplay is blocked or codec isn't supported, keep the hero readable via fallback overlays.
        setVideoOk(false);
      }
    };
    void tryPlay();
  }, []);

  return (
    <section
      id="top"
      className="relative min-h-[88svh] overflow-hidden bg-navy text-white md:min-h-[94svh]"
      aria-label="Hero"
    >
      <div className="absolute inset-0">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          controls={false}
          onError={() => setVideoOk(false)}
          onCanPlay={() => setVideoOk(true)}
          aria-hidden="true"
        >
          <source src="/video/website-hero.mp4" type="video/mp4" />
        </video>

        {/* Fallback if video can't play (codec/autoplay) */}
        {!videoOk ? (
          <div className="absolute inset-0 bg-navy" aria-hidden="true"></div>
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/55 to-navy/90" aria-hidden="true"></div>
        <div className="absolute inset-0 bg-teal/15 mix-blend-multiply" aria-hidden="true"></div>
      </div>

      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col justify-end px-6 pb-16 pt-28 md:pb-20 md:pt-32">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal/95">
            Hardware Test Engineering
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
            Test stations for every integration level.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-white/80 md:text-lg">
            From single components to subsystems and full platforms — we design test solutions that keep hardware programs
            moving with repeatability and traceable results.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenCalendly}
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-navy transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Let's chat
            </button>
            <a
              href="#coverage"
              className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              
              View test stations types
            </a>
          </div>
        </div>

        <div className="mt-12 w-full max-w-[1200px]">
          <DraggableMarquee ariaLabel="Test types we provide" speed={0.9} className="overflow-x-hidden">
            <div className="flex w-max items-center gap-2 py-1">
              {(["a", "b"] as const).map((g) => (
                <div key={g} className="flex items-center gap-2">
                  {TEST_TYPES.map((t) => (
                    <span
                      key={`${g}-${t}`}
                      className="shrink-0 whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </DraggableMarquee>
        </div>
      </div>
    </section>
  );
}
export default function TestCoverageSection() {
  const [calendlyOpen, setCalendlyOpen] = useState(false);

  return (
    <div className="bg-surface text-slate antialiased">
      <SiteHeader onOpenCalendly={() => setCalendlyOpen(true)} />
      <HeroVideo onOpenCalendly={() => setCalendlyOpen(true)} />
      <CalendlyModal open={calendlyOpen} onClose={() => setCalendlyOpen(false)} />

      <section id="overview" className="relative overflow-hidden px-6 py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 opacity-[0.8]" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,184,169,0.10),transparent_52%),radial-gradient(circle_at_bottom,rgba(10,37,64,0.08),transparent_55%)]"></div>
        </div>

        <div className="relative mx-auto w-full max-w-[1200px]">
          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">Built for complex hardware</p>
              <h2 className="mt-4 text-3xl font-semibold leading-[1.1] text-navy sm:text-4xl md:text-5xl">
                Every system is hundreds of components.
                <span className="text-navy/70"> Test them before integration.</span>
              </h2>
              <p className="mt-5 max-w-xl text-base text-slate md:text-lg">
                We create test solutions to verify components before they’re installed into the final platform —
                reducing rework, protecting yield, and improving reliability.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {["Component verification", "Subsystem validation", "Traceable results"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-slate/15 bg-white/70 px-4 py-2 text-xs font-semibold text-navy/80 backdrop-blur"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              <ComplexHardwareMarquee />
            </div>
          </div>
        </div>
      </section>

      <section id="coverage" className="bg-navy text-white">
        {/* Screen 1 — Components */}
        <section id="component-stations" className="relative overflow-hidden px-6 py-16 md:py-24">
          <div className="pointer-events-none absolute inset-0 opacity-[0.9]" aria-hidden="true">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,184,169,0.18),transparent_55%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.05),transparent_55%)]"></div>
            <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:52px_52px] opacity-[0.22]"></div>
          </div>

          <div className="relative mx-auto w-full max-w-[1200px]">
            <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal/95">Component test stations</p>
                <h2 className="mt-5 text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-5xl">
                  Verify every part
                  <br />
                  before it’s installed.
                </h2>
                <p className="mt-6 max-w-xl text-base text-white/75 md:text-lg">
                  We build automated stations to test components as the DUT — catching faults early, with repeatable
                  sequences and traceable results.
                </p>

                <div className="mt-10 w-full min-w-0 max-w-full">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal/95">Devices You Can Test</p>
                  <DutImageStrip items={COMPONENT_DUT_ITEMS} ariaLabel="Component hardware under test, scrolling" />
                </div>
              </div>

              <div className="relative min-w-0">
                <img
                  src="/visual/station-component.png"
                  alt="Component test station"
                  className="mx-auto h-[340px] w-auto max-w-full object-contain sm:h-[380px]"
                  loading="lazy"
                  decoding="async"
                />
                <StationBulletRow
                  items={[
                    "Catch faults early",
                    "Simulate real-world",
                    "Repeatable testing",
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Screen 2 — LRUs */}
        <section id="lru-stations" className="relative overflow-hidden border-t border-white/10 px-6 py-16 md:py-24">
          <div className="pointer-events-none absolute inset-0 opacity-[0.9]" aria-hidden="true">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_55%),radial-gradient(circle_at_bottom,rgba(0,184,169,0.14),transparent_55%)]"></div>
            <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:52px_52px] opacity-[0.18]"></div>
          </div>

          <div className="relative mx-auto w-full max-w-[1200px]">
            {/* DOM order = mobile stack: copy → DUT → station → bullets. lg:order swaps columns so station stays left on wide screens. */}
            <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
              <div className="min-w-0 order-1 lg:order-2">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal/95">Subsystems test stations</p>
                <h2 className="mt-5 text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-5xl">
                  Validate subsystems
                  <br />
                  as integrated units.
                </h2>
                <p className="mt-6 max-w-xl text-base text-white/75 md:text-lg">
                  We build racks and stations that stimulate interfaces, run realistic sequences, and capture
                  traceable results — so subsytems are ready for final integration.
                </p>

                <div className="mt-10 w-full min-w-0 max-w-full">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal/95">Devices You Can Test</p>
                  <DutImageStrip items={LRU_DUT_ITEMS} ariaLabel="LRU and assembly hardware under test, scrolling" />
                </div>
              </div>

              <div className="relative min-w-0 order-2 lg:order-1">
                <img
                  src="/visual/station-system-alt.png"
                  alt="LRU and assembly test station"
                  className="mx-auto h-[340px] w-auto max-w-full object-contain sm:h-[380px]"
                  loading="lazy"
                  decoding="async"
                />
                <StationBulletRow
                  items={[
                    "Simulate all inputs/outputs",
                    "Perform load testing",
                    "Final EOL verification",
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Screen 3 — Environmental */}
        <section id="environmental-stations" className="relative overflow-hidden border-t border-white/10 px-6 py-16 md:py-24">
          <div className="pointer-events-none absolute inset-0 opacity-[0.9]" aria-hidden="true">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,184,169,0.12),transparent_55%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.05),transparent_55%)]"></div>
            <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:52px_52px] opacity-[0.18]"></div>
          </div>

          <div className="relative mx-auto w-full max-w-[1200px]">
            <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal/95">Environmental testing</p>
                <h2 className="mt-5 text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-5xl">
                  Stress hardware
                  <br />
                  before it ships.
                </h2>
                <p className="mt-6 max-w-xl text-base text-white/75 md:text-lg">
                  We integrate environmental chambers with control racks and test software — so LRUs and assemblies see
                  realistic temperature, humidity, and vibration profiles with logged results.
                </p>

                <div className="mt-10 w-full min-w-0 max-w-full">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal/95">Devices You Can Test</p>
                  <DutImageStrip items={LRU_DUT_ITEMS} ariaLabel="Environmental test hardware under test, scrolling" />
                </div>
              </div>

              <div className="relative min-w-0">
                <img
                  src="/visual/station-environmental.png"
                  alt="Environmental test station with climatic chamber and control rack"
                  className="mx-auto h-[340px] w-auto max-w-full object-contain sm:h-[380px]"
                  loading="lazy"
                  decoding="async"
                />
                <StationBulletRow
                  items={[
                    "Simulate harsh environment",
                    "Automated long-duration testing",
                    "Parallel testing of multiple units",
                  ]}
                />
              </div>
            </div>
          </div>
        </section>
      </section>

      <section id="examples" className="relative overflow-hidden border-t border-slate/10 bg-surface px-6 py-16 text-navy md:py-24">
        <div className="pointer-events-none absolute inset-0 opacity-[0.85]" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,184,169,0.10),transparent_55%)]"></div>
        </div>

        <div className="relative mx-auto w-full max-w-[1200px]">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal">Project examples</p>
            <h2 className="mt-5 text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl md:text-5xl">
              Stations we&apos;ve delivered.
            </h2>
            <p className="mt-5 text-base text-slate md:text-lg">
              A few representative builds — from bench-level integration to floor-standing ATE — tailored to program
              interfaces, throughput, and reporting requirements.
            </p>
          </div>

          <div className="relative mt-12 w-full">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface to-transparent motion-reduce:hidden md:w-24"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface to-transparent motion-reduce:hidden md:w-24"
              aria-hidden="true"
            />
            <DraggableMarquee ariaLabel="Project example stations" speed={0.5} className="motion-reduce:pb-2">
              <div className="flex w-max gap-5 md:gap-6">
                {[...PROJECT_EXAMPLE_ITEMS, ...PROJECT_EXAMPLE_ITEMS].map((ex, i) => (
                  <article
                    key={`${ex.src}-${i}`}
                    className="flex w-[min(260px,72vw)] shrink-0 flex-col overflow-hidden rounded-3xl border border-slate/10 bg-white shadow-card sm:w-[280px] md:w-[300px]"
                  >
                    <div className="relative overflow-hidden rounded-t-3xl border-b border-slate/10 bg-white p-3 pt-4">
                      <img
                        src={ex.src}
                        alt={ex.alt}
                        draggable={false}
                        className="mx-auto h-[200px] w-auto max-w-full object-contain sm:h-[230px] md:h-[260px]"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
                      <h3 className="text-sm font-semibold tracking-tight text-navy md:text-base">{ex.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate md:text-[13px]">{ex.caption}</p>
                    </div>
                  </article>
                ))}
              </div>
            </DraggableMarquee>
          </div>
        </div>
      </section>

      <section
        id="stats"
        className="relative overflow-hidden border-t border-white/10 bg-navy px-6 py-14 text-white md:py-20"
        aria-label="Key statistics"
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.85]" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,184,169,0.08),transparent_60%)]"></div>
        </div>
        <div className="relative mx-auto grid max-w-[1000px] grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8 md:gap-12">
          {[
            { to: 1200, suffix: "+", label: "Projects delivered" },
            { to: 23, suffix: "", label: "Countries served" },
            { to: 25, suffix: "+", label: "Years of expertise" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-bold tabular-nums tracking-tight text-white sm:text-5xl md:text-6xl">
                <CountUpNumber to={stat.to} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-sm font-medium text-white/65 md:mt-3 md:text-base">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="process" className="relative overflow-hidden border-t border-white/10 bg-navy px-6 py-16 text-white md:py-24">
        <div className="pointer-events-none absolute inset-0 opacity-[0.9]" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,184,169,0.16),transparent_55%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.05),transparent_55%)]"></div>
          <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:52px_52px] opacity-[0.18]"></div>
        </div>

        <div className="relative mx-auto w-full max-w-[1200px]">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal/95">How we work</p>
            <h2 className="mt-5 text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-5xl">
              From your product to a deployed test station.
            </h2>
            <p className="mt-5 text-base text-white/75 md:text-lg">
              A simple, predictable process — whether you bring us a component, a subsystem, or a complete platform.
            </p>
          </div>

          <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-5" aria-label="Process steps">
            {[
              {
                step: "01",
                title: "You share your product",
                body: "Component, subsystem, or full system — we start from your hardware and your acceptance criteria.",
                icon: (
                  <path
                    d="M7 7h10v10H7V7Zm3 12v-2m4 2v-2M9 7V5m6 2V5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ),
              },
              {
                step: "02",
                title: "We understand it — fast",
                body: "We reverse-engineer interfaces, signals, and failure modes to scope the right test coverage.",
                icon: (
                  <path
                    d="M12 20a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm0-11v4l3 2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ),
              },
              {
                step: "03",
                title: "We design the solution",
                body: "Custom fixtures, instrumentation, and software — tailored to your throughput and quality targets.",
                icon: (
                  <path
                    d="M14.5 6.5 17.5 9.5M7 20h3l9-9a2.1 2.1 0 0 0 0-3l-1-1a2.1 2.1 0 0 0-3 0l-9 9v4Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ),
              },
              {
                step: "04",
                title: "We deploy on your site",
                body: "Integration, commissioning, and operator training on your production floor — turnkey and verified.",
                icon: (
                  <path
                    d="M12 3v10m0 0 4-4m-4 4-4-4M6 21h12"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ),
              },
              {
                step: "05",
                title: "We maintain & upgrade",
                body: "Ongoing support, calibration, and station evolution as your product and volumes change.",
                icon: (
                  <path
                    d="M12 6v6l4 2M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ),
              },
            ].map((s) => (
              <li
                key={s.step}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,184,169,0.10),transparent_55%)] opacity-0 transition-opacity duration-300 hover:opacity-100" aria-hidden="true"></div>
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10 text-teal ring-1 ring-white/10">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                        {s.icon}
                      </svg>
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">Step {s.step}</p>
                  </div>
                </div>

                <h3 className="relative mt-4 text-base font-semibold text-white">{s.title}</h3>
                <p className="relative mt-3 text-sm leading-relaxed text-white/75">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="capabilities" className="relative overflow-hidden bg-navy px-6 pb-16 text-white md:pb-24">
        <div className="pointer-events-none absolute inset-0 opacity-[0.9]" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,184,169,0.14),transparent_55%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.05),transparent_55%)]"></div>
        </div>

        <div className="relative mx-auto w-full max-w-[1200px]">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal/95">What we deliver</p>
            <h2 className="mt-5 text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-5xl">
              Test types &amp; stations we can build.
            </h2>
            <p className="mt-5 text-base text-white/75 md:text-lg">
              From bench to line — we design and deliver test solutions across these domains.
            </p>
          </div>

          <ul
            className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Test types we can deliver"
          >
            {[
              "Functional test",
              "Environmental (temperature, humidity, vibration)",
              "HALT / HASS",
              "Burn-in",
              "ATE (automated test equipment)",
              "Hardware-in-the-loop (HIL)",
              "RF / EMC characterization",
              "End-of-line acceptance",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-white/90 backdrop-blur"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer id="contact" className="border-t border-slate/10 bg-white px-6 py-12">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                <img src="/visual/Logo_Footer.png" alt="FPC" className="h-8 w-auto object-contain" draggable={false} />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate">
              We design test solutions that keep hardware programs moving with repeatability and traceable results.
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
                  { href: "#overview", label: "Overview" },
                  { href: "#coverage", label: "Coverage" },
                  { href: "#examples", label: "Examples" },
                  { href: "#process", label: "How we work" },
                  { href: "#capabilities", label: "What we deliver" },
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

