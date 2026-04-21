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
      node.scrollLeft += speed;
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
  { src: "/visual/subsystem-box-1.png", label: "Power", alt: "Line replaceable unit" },
  { src: "/visual/subsystem-box-2.png", label: "Communication", alt: "Assembly unit" },
  { src: "/visual/subsystem-box-3.png", label: "Flight Computer", alt: "Subsystem module" },
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
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-surface to-transparent motion-reduce:hidden sm:w-10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-surface to-transparent motion-reduce:hidden sm:w-10"
        aria-hidden="true"
      />
      <DraggableMarquee ariaLabel="Exploded hardware examples, scrolling" speed={0.55} className="motion-reduce:pb-1">
        <div className="flex w-max gap-4">
          {group("a")}
          {group("b")}
        </div>
      </DraggableMarquee>
    </div>
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
              className="inline-flex shrink-0 items-center gap-4 rounded-full border border-white/10 bg-white/5 px-5 py-3"
            >
              <img
                src={it.src}
                alt={it.alt}
                draggable={false}
                className="h-[88px] w-auto object-contain sm:h-[96px]"
                loading="lazy"
                decoding="async"
              />
              <span className="text-base font-semibold text-white/90">{it.label}</span>
            </span>
          ))}
        </div>
      </DraggableMarquee>
    </div>
  );
}

function SiteHeader() {
  const linkClass =
    "text-sm font-semibold text-white/90 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal";

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto w-full max-w-[1200px] px-6 pt-5">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-navy/35 px-4 py-3 backdrop-blur-md md:px-6">
          <a href="#top" className="flex items-baseline gap-3">
            <span className="text-lg font-semibold tracking-tight text-white">FPC</span>
            <span className="hidden text-xs font-semibold uppercase tracking-[0.22em] text-white/60 md:inline">
              Test Development
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            <a className={linkClass} href="#overview">
              Overview
            </a>
            <a className={linkClass} href="#coverage">
              Coverage
            </a>
            <a className={linkClass} href="#examples">
              Examples
            </a>
            <a className={linkClass} href="#contact">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Let’s talk
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeroVideo() {
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
            Aerospace &amp; defense test engineering
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
            Test stations for every integration level.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-white/80 md:text-lg">
            From single components to LRUs and full platforms — we design test solutions that keep hardware programs
            moving with repeatability and traceable results.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#overview"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-navy transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              See how it scales
            </a>
            <a
              href="#coverage"
              className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              View coverage
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap gap-2 text-xs font-semibold text-white/80">
          {["Component verification", "Subsystem validation", "Automation + reporting"].map((t) => (
            <span key={t} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur">
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
export default function TestCoverageSection() {
  return (
    <div className="bg-surface text-slate antialiased">
      <SiteHeader />
      <HeroVideo />

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
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal/95">LRU &amp; assembly stations</p>
                <h2 className="mt-5 text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-5xl">
                  Validate LRUs
                  <br />
                  as integrated units.
                </h2>
                <p className="mt-6 max-w-xl text-base text-white/75 md:text-lg">
                  We build racks and stations that stimulate interfaces, run realistic sequences, and capture
                  traceable results — so LRUs and assemblies are ready for final integration.
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

      <section id="process" className="relative overflow-hidden bg-navy px-6 py-16 text-white md:py-24">
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

      <footer id="contact" className="border-t border-slate/10 bg-white px-6 py-10">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-navy">FPC</p>
            <p className="mt-1 text-sm text-slate">Test development for aerospace-grade hardware.</p>
          </div>
          <a
            href="#top"
            className="rounded-xl border border-slate/15 bg-surface px-4 py-2 text-sm font-semibold text-navy transition hover:bg-white"
          >
            Back to top
          </a>
        </div>
      </footer>
    </div>
  );
}

