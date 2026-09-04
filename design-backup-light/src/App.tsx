import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { ArrowDown, ArrowRight, ChevronUp, Info, X } from "lucide-react";

const SCENE_VIDEOS = [
  "/videos/hero-flow.mp4",
  "/videos/pillars-settle.mp4",
  "/videos/invest-growth.mp4",
] as const;
const NAV_ITEMS = [
  { label: "HOME", href: "#home" },
  { label: "ABOUT", href: "#about" },
  { label: "PORTFOLIO", href: "#portfolio" },
  { label: "TEAM", href: "#team" },
  { label: "RESEARCH", href: "#research" },
  { label: "CONTACT", href: "#contact" },
];

const PILLARS = [
  {
    title: "Frontier research ecosystems",
    body: "Institutional partnerships with labs and programs at Stanford and UC Berkeley provide direct access to scientists and engineers developing the next generation of breakthrough technologies.",
  },
  {
    title: "Global technical founder networks",
    body: "Frontier AI is built globally or not at all. We cultivate deep, trust-based relationships within the global technical diaspora and broader international AI research community, backing exceptional founders and connecting world-class talent from day one, wherever they are.",
  },
  {
    title: "Singapore as a global AI corridor",
    body: "Singapore serves as a neutral and globally connected hub for company building. It enables founders to operate across borders, connecting talent, capital, and technology ecosystems across the United States, Asia, and beyond.",
  },
];

const SUPPORT = [
  {
    title: "Research & Talent Networks",
    body: "Through our ecosystem partnerships across the United States, Singapore, and China, founders gain access to:",
    items: ["Leading university labs", "Product and engineering talent networks", "Technical advisors and collaborators"],
  },
  {
    title: "Fundraising Support",
    body: "We help founders prepare for future financing rounds through:",
    items: ["Investor narrative development", "Fundraising strategy", "Introductions to leading investors and strategic partners"],
  },
  {
    title: "Compute & Infrastructure",
    body: "We facilitate partnerships that provide access to:",
    items: ["Cloud credits", "GPU infrastructure", "Technical infrastructure partners"],
  },
  {
    title: "Build Globally from the Right Foundations",
    body: "Operational support for founders leveraging leading international bases to scale:",
    items: ["Structuring advice", "Workspace and operational infrastructure", "Introductions to banking, legal, compliance, and other service providers", "Visa and relocation navigation"],
  },
];

const PORTFOLIO = [
  {
    name: "Recursive",
    category: "Self Improvement, Open-endedness, AGI",
    body: "Recursive is building a superintelligent, general-purpose digital worker, designed to perform nearly all high-value intellectual labor across software, science, and engineering. Its core ambition is not to build another static model, but to create systems that can continuously improve themselves, expand their own capabilities, and unlock compounding productivity across the entire digital economy.",
    tags: ["Frontier AI", "AI for Science"],
  },
  {
    name: "Odyssey",
    category: "World Models, Real-Time Simulation",
    body: "Odyssey is an AI lab building general-purpose world models, AI systems that generate interactive video in real-time, positioning itself as a world-simulator platform across gaming, robotics, defense simulation, and training. Its products are differentiated by causal action-aware generation, low-latency real-time serving, and long-horizon coherent simulation.",
    tags: ["Frontier AI", "World Models"],
  },
  {
    name: "Moonshot AI (Kimi)",
    category: "Long-Context Reasoning, Agentic Workflows",
    body: "Moonshot AI is a leading frontier AI lab. Its Kimi models are built for long-context reasoning and agentic workflows, and have become among the most widely used LLMs in the world, positioning the company to scale intelligent assistance across the digital economy.",
    tags: ["Frontier AI", "Foundation Models"],
  },
];

const RESEARCH = [
  { title: "Frontier AI", body: "The models and architectures expanding what machines can reason, create, and do.", items: ["Foundational Models", "Novel Architectures", "World Models", "Reasoning & Agentic Systems"] },
  { title: "AI for Science", body: "Using AI as a research instrument to compress the discovery cycle across the physical and life sciences.", items: ["Scientific Foundation Models", "Hypothesis Generation", "Simulation", "Experimental Automation"] },
  { title: "AI Infrastructure", body: "The control, efficiency, and supply layers that make the shift to Agents-as-a-Service safe, reliable, and economical.", items: ["Model-Agnostic Agentic Infrastructure", "Inference Engines", "Agent-Native Hardware", "Neoclouds"] },
  { title: "Embodied Intelligence", body: "Closing the gap between digital reasoning and physical action.", items: ["Robotics Foundation Models", "Simulation", "Perception", "Manipulation"] },
];

const TEAM = [
  ["Yaxi Zhu", "Co-Founder"],
  ["Mavis Xu", "Co-Founder, Managing Partner"],
  ["Zixi Wang", "Investor"],
  ["Ernest Ng", "Researcher"],
  ["Weisheng Chen", "Group Finance Controller"],
  ["Hong Hwee Chua", "Senior Fund Operations Manager"],
  ["Jessie Tan", "Fund Operations Manager"],
  ["Li Han", "General Counsel"],
  ["Erika Tang", "Senior Legal Counsel"],
] as const;

function sectionOpacity(progress: number) {
  const first = progress < 0.2 ? 1 : Math.max(0, 1 - (progress - 0.2) / 0.08);
  const second =
    progress < 0.32
      ? 0
      : progress < 0.4
        ? (progress - 0.32) / 0.08
        : progress < 0.55
          ? 1
          : Math.max(0, 1 - (progress - 0.55) / 0.08);
  const third = progress < 0.67 ? 0 : progress < 0.75 ? (progress - 0.67) / 0.08 : 1;
  return [first, second, third] as const;
}

function sceneOpacity(progress: number) {
  const first = progress < 0.24 ? 1 : progress < 0.36 ? 1 - (progress - 0.24) / 0.12 : 0;
  const second =
    progress < 0.24
      ? 0
      : progress < 0.36
        ? (progress - 0.24) / 0.12
        : progress < 0.59
          ? 1
          : progress < 0.71
            ? 1 - (progress - 0.59) / 0.12
            : 0;
  const third = progress < 0.59 ? 0 : progress < 0.71 ? (progress - 0.59) / 0.12 : 1;
  return [first, second, third] as const;
}

function useScrollProgress() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [pageProgress, setPageProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const parallaxEls = reduceMotion ? [] : Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const update = () => {
      const container = containerRef.current;
      if (container) {
        const span = Math.max(1, container.offsetHeight - window.innerHeight);
        const next = Math.min(1, Math.max(0, window.scrollY / span));
        setProgress((current) => (Math.abs(current - next) > 0.0005 ? next : current));
      }
      const pageSpan = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const pageNext = Math.min(1, Math.max(0, window.scrollY / pageSpan));
      setPageProgress((current) => (Math.abs(current - pageNext) > 0.001 ? pageNext : current));
      parallaxEls.forEach((el) => {
        const host = el.parentElement ?? el;
        const rect = host.getBoundingClientRect();
        if (rect.bottom < -120 || rect.top > window.innerHeight + 120) return;
        const shift = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * 0.1;
        el.style.transform = `translateY(${shift.toFixed(1)}px) scale(1.14)`;
      });
      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);

  return { containerRef, progress, pageProgress };
}

function useRevealOnScroll() {
  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function Stagger({
  visible,
  delay,
  children,
  className = "",
}: {
  visible: boolean;
  delay: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function SectionHead({ index, label }: { index: string; label: string }) {
  return (
    <div className="section-head" data-reveal>
      <span className="section-head-num">{index}</span>
      <p className="eyebrow">{label}</p>
      <span className="section-head-line" aria-hidden="true" />
    </div>
  );
}

const MARQUEE_ITEMS = ["Frontier AI", "AI for Science", "AI Infrastructure", "Embodied Intelligence"];

function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <div className="marquee-row" key={copy}>
            {MARQUEE_ITEMS.map((item) => (
              <span key={item}>
                {item}
                <i>·</i>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-vectrus transition-all duration-500 ${
        open ? "visible opacity-100" : "invisible opacity-0"
      }`}
      style={{ transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
      aria-hidden={!open}
    >
      <div
        className={`flex min-h-[100dvh] flex-col transition-transform duration-500 ${
          open ? "translate-y-0" : "-translate-y-8"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
      >
        <div className="flex justify-end px-6 pt-8 sm:px-8 sm:pt-12">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:border-white"
            aria-label="Close menu"
            tabIndex={open ? 0 : -1}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-center px-8 sm:px-12" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={`py-3 text-2xl font-light uppercase tracking-wide transition-all duration-500 sm:text-3xl ${
                index === 0 ? "text-white" : "text-white/60 hover:text-white"
              } ${open ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
              style={{ transitionDelay: `${index * 60}ms` }}
              tabIndex={open ? 0 : -1}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex justify-between px-8 pb-10 text-xs font-medium uppercase tracking-[0.2em] text-white/60 sm:px-12">
          <a href="https://www.linkedin.com/company/soma-labs-ventures" onClick={onClose} tabIndex={open ? 0 : -1}>LINKEDIN</a>
          <a href="https://x.com/somalabs_" onClick={onClose} tabIndex={open ? 0 : -1}>X</a>
        </div>
      </div>
    </div>
  );
}

function Navbar({ onMenu, activeSection }: { onMenu: () => void; activeSection: string }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setEntered(true), 200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <header
      className="pointer-events-auto fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 pb-6 pt-7 text-white mix-blend-difference sm:px-8 sm:pt-9 md:px-12"
    >
      <a
        href="#home"
        className={`text-xs font-medium uppercase tracking-[0.22em] transition-all duration-[600ms] ${
          entered ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        SOMA LABS
      </a>

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex xl:gap-9" aria-label="Primary navigation">
        {NAV_ITEMS.slice(1, 5).map((item, index) => (
          <a
            key={item.label}
            href={item.href}
            className={`nav-link relative whitespace-nowrap text-xs font-medium uppercase tracking-[0.15em] transition-all ${
              item.href === `#${activeSection}` ? "is-active" : ""
            } ${entered ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"}`}
            style={{
              transitionDuration: "0.6s",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: `${index * 80 + 100}ms`,
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div
        className={`flex items-center gap-5 transition-all duration-[600ms] sm:gap-8 ${
          entered ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
        }`}
        style={{
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          transitionDelay: "500ms",
        }}
      >
        <a href="#contact" className="hidden items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] hover:opacity-70 sm:flex">
          CONTACT
          <Info size={14} strokeWidth={1.5} />
        </a>
        <button
          type="button"
          onClick={onMenu}
          className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em]"
          aria-label="Open menu"
        >
          MENU
          <span className="flex flex-col gap-[4px]">
            <span className="h-px w-4 bg-current" />
            <span className="h-px w-3 bg-current" />
          </span>
        </button>
      </div>
    </header>
  );
}

export default function App() {
  const { containerRef, progress, pageProgress } = useScrollProgress();
  useRevealOnScroll();
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const flowFrameRef = useRef<number>(0);
  const flowVelocityRef = useRef(0);
  const lastFlowTickRef = useRef(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [introRevealed, setIntroRevealed] = useState(false);
  const [introCopyVisible, setIntroCopyVisible] = useState(false);
  const [isFlowing, setIsFlowing] = useState(false);
  const [s1Opacity, s2Opacity, s3Opacity] = useMemo(() => sectionOpacity(progress), [progress]);
  const [scene1Opacity, scene2Opacity, scene3Opacity] = useMemo(() => sceneOpacity(progress), [progress]);
  const activeSceneIndex = useMemo(() => {
    const values = [scene1Opacity, scene2Opacity, scene3Opacity];
    return values.indexOf(Math.max(...values));
  }, [scene1Opacity, scene2Opacity, scene3Opacity]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealTimer = window.setTimeout(() => setIntroRevealed(true), reduceMotion ? 0 : 180);
    const copyTimer = window.setTimeout(() => setIntroCopyVisible(true), reduceMotion ? 0 : 1150);
    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(copyTimer);
    };
  }, []);

  useEffect(() => {
    window.cancelAnimationFrame(flowFrameRef.current);
    flowFrameRef.current = 0;
    flowVelocityRef.current = 0;
    videoRefs.current.forEach((video, index) => {
      video?.pause();
    });
    setIsFlowing(false);
  }, [activeSceneIndex]);

  useEffect(() => () => window.cancelAnimationFrame(flowFrameRef.current), []);

  useEffect(() => {
    const ids = ["about", "portfolio", "team", "research"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  const stopFlow = () => {
    window.cancelAnimationFrame(flowFrameRef.current);
    flowFrameRef.current = 0;
    flowVelocityRef.current = 0;
    videoRefs.current.forEach((video) => video?.pause());
    lastPointerRef.current = null;
    setIsFlowing(false);
  };

  const startFlow = (video: HTMLVideoElement) => {
    if (flowFrameRef.current) return;

    lastFlowTickRef.current = performance.now();
    setIsFlowing(true);
    void video.play();

    const coast = (now: number) => {
      const elapsed = Math.min(48, now - lastFlowTickRef.current);
      lastFlowTickRef.current = now;
      flowVelocityRef.current *= Math.pow(0.975, elapsed / 16.67);

      if (flowVelocityRef.current < 0.1) {
        video.pause();
        flowVelocityRef.current = 0;
        flowFrameRef.current = 0;
        setIsFlowing(false);
        return;
      }

      video.playbackRate = Math.min(1.7, Math.max(0.25, flowVelocityRef.current));
      flowFrameRef.current = window.requestAnimationFrame(coast);
    };

    flowFrameRef.current = window.requestAnimationFrame(coast);
  };

  const handleFlowPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const previous = lastPointerRef.current;
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.style.setProperty("--pointer-x", `${event.clientX}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${event.clientY}px`);
    if (!previous) return;

    const deltaX = Math.abs(event.clientX - previous.x);
    const deltaY = Math.abs(event.clientY - previous.y);
    if (deltaY < 2 || deltaY <= deltaX) return;

    const video = videoRefs.current[activeSceneIndex];
    if (!video || video.readyState < 2) return;
    const boost = Math.min(1.25, deltaY / 18);
    flowVelocityRef.current = Math.min(1.7, Math.max(0.35, flowVelocityRef.current * 0.72 + boost));
    startFlow(video);
  };

  const goTo = (target: number) => {
    const container = containerRef.current;
    if (!container) return;
    const span = container.offsetHeight - window.innerHeight;
    window.scrollTo({ top: span * target, behavior: "smooth" });
  };

  const sectionStyle = (opacity: number): CSSProperties => ({
    opacity,
    transition: "opacity 0.1s ease-out",
  });

  return (
    <>
      <a href="#about" className="skip-link">Skip to content</a>
      <div className="scroll-progress" aria-hidden="true" style={{ transform: `scaleX(${pageProgress})` }} />
      <Navbar onMenu={() => setMenuOpen(true)} activeSection={activeSection} />
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`back-top ${pageProgress > 0.12 ? "is-visible" : ""}`}
        aria-label="Back to top"
        tabIndex={pageProgress > 0.12 ? 0 : -1}
      >
        <ChevronUp size={17} strokeWidth={1.5} />
      </button>
      <main id="home">
        <div ref={containerRef} className="relative h-[500vh]">
          <div
            className="interactive-stage sticky top-0 h-screen min-h-[100dvh] w-full overflow-hidden bg-[#d9e0e5]"
            onPointerMove={handleFlowPointerMove}
            onPointerLeave={() => { lastPointerRef.current = null; }}
            onPointerCancel={stopFlow}
          >
          {SCENE_VIDEOS.map((src, index) => (
            <video
              key={src}
              ref={(element) => { videoRefs.current[index] = element; }}
              className={`video-cover pointer-events-none ${index === 0 ? "opening-video" : ""} ${introRevealed ? "is-revealed" : ""}`}
              src={src}
              style={{ opacity: [scene1Opacity, scene2Opacity, scene3Opacity][index] }}
              muted
              loop
              playsInline
              preload="auto"
              onLoadedMetadata={(event) => {
                const video = event.currentTarget;
                const frame = [0.18, 0.34, 0.24][index];
                video.currentTime = video.duration * frame;
                video.pause();
              }}
              aria-hidden="true"
            />
          ))}

          <div className={`scroll-reveal ${introRevealed ? "is-open" : ""}`} aria-hidden="true">
            <div className="scroll-leaf scroll-leaf-left">
              <span className="scroll-rod scroll-rod-left" />
            </div>
            <div className="scroll-leaf scroll-leaf-right">
              <span className="scroll-rod scroll-rod-right" />
            </div>
            <div className="scroll-title">
              <span>SOMA LABS</span>
              <small>Frontier technology · Scientific breakthroughs</small>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0">
            <section
              className="absolute inset-0 flex items-center px-6 sm:px-8 md:px-20 lg:px-32"
              style={sectionStyle(s1Opacity)}
              aria-hidden={s1Opacity < 0.05}
            >
              <div className="max-w-[1040px] text-white mix-blend-difference">
                <Stagger visible={s1Opacity > 0.3 && introCopyVisible} delay={0}>
                  <h1 className="max-w-[1000px] text-[clamp(2rem,5vw,5rem)] font-light uppercase leading-[1.2]">
                    Where frontier technology meets scientific breakthroughs
                  </h1>
                </Stagger>
                <Stagger visible={s1Opacity > 0.3 && introCopyVisible} delay={150}>
                  <p className="mt-6 text-sm uppercase tracking-[0.3em] text-white/90">
                    Supporting visionary researchers from discovery to real-world impact
                  </p>
                </Stagger>
              </div>
              <Stagger
                visible={s1Opacity > 0.3 && introCopyVisible}
                delay={300}
                className="pointer-events-auto absolute bottom-12 right-6 sm:right-8 md:right-12"
              >
                <button
                  type="button"
                  onClick={() => goTo(0.4)}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/50 text-white mix-blend-difference transition-all duration-300 hover:scale-110 hover:border-white"
                  aria-label="Continue"
                >
                  <ArrowRight size={18} strokeWidth={1.5} />
                </button>
              </Stagger>
            </section>

            <section
              className="absolute inset-0 flex items-center justify-center px-6 sm:px-8"
              style={sectionStyle(s2Opacity)}
              aria-hidden={s2Opacity < 0.05}
              id="invest"
            >
              <div className="max-w-[980px] bg-white/55 px-6 py-8 text-center text-vectrus backdrop-blur-[2px] sm:px-10 sm:py-10">
                <Stagger visible={s2Opacity > 0.3} delay={0}>
                  <p className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-[#1D3045]/70">
                    How we invest
                  </p>
                  <h2 className="text-[clamp(1.75rem,4.5vw,4.5rem)] font-extralight uppercase leading-[1.25] tracking-wide">
                    Patient capital, earliest conviction
                  </h2>
                </Stagger>
                <Stagger visible={s2Opacity > 0.3} delay={150}>
                  <p className="mx-auto mt-8 max-w-[760px] text-[clamp(0.9rem,1.25vw,1.15rem)] font-light leading-relaxed tracking-wide text-[#1D3045]/75">
                    We back generational founders turning deep technical differentiation into platforms with lasting, real-world impact.
                  </p>
                </Stagger>
              </div>

              <div className="absolute bottom-16 right-6 flex flex-col items-center gap-4 text-vectrus sm:right-8 md:right-12">
                <Stagger visible={s2Opacity > 0.3} delay={200} className="pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => goTo(0.75)}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-[#1D3045]/40 transition-all duration-300 hover:scale-110 hover:border-[#1D3045]"
                    aria-label="Next section"
                  >
                    <ArrowDown size={18} strokeWidth={1.5} />
                  </button>
                </Stagger>
                <Stagger visible={s2Opacity > 0.3} delay={350}>
                  <div className="mt-4 flex flex-col items-center gap-2" aria-hidden="true">
                    <span className="h-2 w-2 rounded-full bg-vectrus" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1D3045]/40" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1D3045]/40" />
                  </div>
                </Stagger>
                <Stagger visible={s2Opacity > 0.3} delay={500} className="pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => goTo(0)}
                    className="mt-2 flex h-10 w-10 items-center justify-center rounded-full border border-[#1D3045]/30 text-[#1D3045]/80 transition-all duration-300 hover:scale-110 hover:border-[#1D3045]"
                    aria-label="Back to top"
                  >
                    <ChevronUp size={16} strokeWidth={1.5} />
                  </button>
                </Stagger>
              </div>
            </section>

            <section
              className="absolute inset-0 flex items-center justify-end px-6 sm:px-8 md:px-20 lg:px-32"
              style={sectionStyle(s3Opacity)}
              aria-hidden={s3Opacity < 0.05}
              id="intro-contact"
            >
              <div className="max-w-2xl bg-white/60 px-6 py-8 text-left text-vectrus backdrop-blur-[2px] sm:px-10 sm:py-10">
                <Stagger visible={s3Opacity > 0.3} delay={0}>
                  <p className="mb-4 text-lg tracking-wide text-[#1D3045]/65">GET IN TOUCH</p>
                </Stagger>
                <Stagger visible={s3Opacity > 0.3} delay={150}>
                  <h2 className="mb-8 text-[clamp(2rem,4vw,4rem)] font-light uppercase leading-[1.2] tracking-wide">
                    Building something at the frontier?
                  </h2>
                </Stagger>
                <Stagger visible={s3Opacity > 0.3} delay={300}>
                  <p className="mb-8 text-lg font-light tracking-wide text-[#1D3045]/75">We'd love to hear from you.</p>
                  <a
                    href="mailto:hello@somalabs.xyz"
                    className="pointer-events-auto inline-flex items-center gap-4 text-sm uppercase tracking-[0.3em] text-[#1D3045]/80"
                  >
                    Start a conversation
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-vectrus text-white transition-transform duration-300 hover:scale-110">
                      <ArrowRight size={16} strokeWidth={1.5} />
                    </span>
                  </a>
                </Stagger>
              </div>
            </section>
          </div>

          <div className="scene-dots">
            {[
              ["Vision", 0],
              ["Invest", 0.45],
              ["Contact", 0.9],
            ].map(([label, target], index) => (
              <button
                key={label}
                type="button"
                onClick={() => goTo(target as number)}
                className={index === activeSceneIndex ? "is-active" : ""}
                aria-label={`Go to ${label}`}
              >
                <i />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className={`flow-hint ${isFlowing ? "is-flowing" : ""}`} aria-hidden="true">
            <span className="flow-glyph"><i /></span>
            <span>
              <small>Interactive frame</small>
              <strong>{isFlowing ? "Flowing" : "Move up / down"}</strong>
            </span>
          </div>
        </div>
        </div>

        <Marquee />

        <section id="about" className="bg-[#eef1f2] px-6 pb-28 pt-24 text-vectrus sm:px-8 md:px-16 lg:pb-40 lg:pt-32">
          <div className="mx-auto max-w-7xl">
            <SectionHead index="01" label="About Soma Labs" />
            <div className="mt-14 grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
              <div data-reveal>
                <h2 className="display-heading">An early-stage venture fund for frontier AI and science.</h2>
              </div>
              <div className="space-y-12" data-reveal style={{ "--reveal-delay": "140ms" } as CSSProperties}>
                <p className="max-w-3xl text-xl font-light leading-relaxed text-[#1D3045]/85 sm:text-2xl">
                  Soma Labs backs exceptional researchers, engineers, and technical founders transforming frontier AI and scientific breakthroughs into platforms that shape the future. We invest at the earliest stages, partnering with researchers and engineers who are building the future.
                </p>
                <dl className="grid gap-x-10 gap-y-6 border-t border-[#1D3045]/20 pt-8 sm:grid-cols-[10rem_1fr]">
                  {[
                    ["Legal name", "Soma Labs Ventures Limited"],
                    ["Founded", "August 2026"],
                    ["Offices", "Singapore · San Francisco · Shenzhen"],
                    ["Stage", "Pre-Seed & Seed, the first institutional partner, before the category is obvious."],
                    ["Focus", "Frontier AI, AI for Science, AI Infrastructure, Embodied Intelligence"],
                    ["Founders", "Mavis Xu, Co-Founder and Managing Partner; Yaxi Zhu, Co-Founder"],
                  ].map(([term, description]) => (
                    <div key={term} className="contents">
                      <dt className="eyebrow pt-1">{term}</dt>
                      <dd className="text-base leading-relaxed text-[#1D3045]/75">{description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#e4e9eb] px-6 py-28 text-vectrus sm:px-8 md:px-16 lg:py-40">
          <div className="mx-auto max-w-7xl">
            <SectionHead index="02" label="Built on three pillars" />
            <div className="mt-16 divide-y divide-[#1D3045]/20 border-y border-[#1D3045]/20">
              {PILLARS.map((pillar, index) => (
                <article
                  key={pillar.title}
                  className="group grid gap-6 py-10 transition-colors duration-500 hover:bg-white/40 md:grid-cols-[8rem_0.8fr_1.2fr] md:items-start md:gap-12 lg:-mx-6 lg:px-6 lg:py-14"
                  data-reveal
                  style={{ "--reveal-delay": `${index * 120}ms` } as CSSProperties}
                >
                  <span className="text-5xl font-extralight tabular-nums text-[#1D3045]/30 transition-colors duration-500 group-hover:text-[#1D3045]/60">0{index + 1}</span>
                  <h3 className="text-2xl font-light leading-tight transition-transform duration-500 group-hover:translate-x-1">{pillar.title}</h3>
                  <p className="max-w-2xl text-base font-light leading-relaxed text-[#1D3045]/70">{pillar.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#d8dfe2] px-6 py-28 text-vectrus sm:px-8 md:px-16 lg:py-40">
          <img src="/images/grid-1-invest.jpg" alt="Abstract material grid" className="absolute inset-0 h-full w-full object-cover opacity-25 will-change-transform" data-parallax />
          <div className="absolute inset-0 bg-gradient-to-r from-[#d8dfe2] via-[#d8dfe2]/90 to-[#d8dfe2]/60" />
          <div className="relative mx-auto max-w-7xl">
            <SectionHead index="03" label="How we invest" />
            <div className="mt-14" data-reveal>
              <h2 className="display-heading max-w-3xl">Patient capital, earliest conviction.</h2>
              <p className="mt-8 max-w-2xl text-lg font-light leading-relaxed text-[#1D3045]/75">
                We back generational founders turning deep technical differentiation into platforms with lasting, real-world impact.
              </p>
            </div>
            <div className="mt-16 grid max-w-4xl gap-12 border-y border-[#1D3045]/25 py-10 sm:grid-cols-2">
              <div data-reveal style={{ "--reveal-delay": "120ms" } as CSSProperties}>
                <p className="eyebrow">Stage</p>
                <h3 className="mt-4 text-2xl font-light">Pre-Seed & Seed</h3>
                <p className="mt-4 leading-relaxed text-[#1D3045]/70">We enter when a technical insight has emerged from research, a prototype exists, and a founding team is beginning to form.</p>
              </div>
              <div data-reveal style={{ "--reveal-delay": "240ms" } as CSSProperties}>
                <p className="eyebrow">Focus</p>
                <h3 className="mt-4 text-2xl font-light">Frontier AI</h3>
                <p className="mt-4 leading-relaxed text-[#1D3045]/70">Frontier AI, AI for Science, AI Infrastructure, Embodied Intelligence.</p>
              </div>
            </div>
            <blockquote className="mt-12 max-w-3xl border-l border-[#1D3045]/40 pl-6 text-xl font-medium leading-relaxed" data-reveal>
              We don't invest based on the market traction, but the founder's ability to build something the world has never seen.
            </blockquote>
          </div>
        </section>

        <section className="bg-vectrus px-6 py-28 text-white sm:px-8 md:px-16 lg:py-40">
          <div className="mx-auto max-w-7xl">
            <SectionHead index="04" label="What Soma Labs provides for founders" />
            <div className="mt-14" data-reveal>
              <h2 className="display-heading max-w-4xl text-white">More than capital. The infrastructure to build globally from day one.</h2>
              <p className="mt-8 max-w-2xl font-light leading-relaxed text-white/60">At the earliest stages, the right support matters more than the size of the check. We work closely with a small number of companies, providing practical resources that accelerate the path from research breakthroughs to product.</p>
            </div>
            <div className="mt-20 grid gap-px bg-white/15 md:grid-cols-2">
              {SUPPORT.map((item, index) => (
                <article
                  key={item.title}
                  className="group bg-vectrus p-8 transition-colors duration-300 hover:bg-[#243a54] sm:p-10"
                  data-reveal="fade"
                  style={{ "--reveal-delay": `${index * 110}ms` } as CSSProperties}
                >
                  <div className="flex items-start gap-5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/25 text-xs text-white/60 transition-all duration-500 group-hover:border-white/60 group-hover:text-white">0{index + 1}</span>
                    <div>
                      <h3 className="text-xl font-light transition-transform duration-500 group-hover:translate-x-1">{item.title}</h3>
                      <p className="mt-5 text-sm leading-relaxed text-white/55">{item.body}</p>
                      <ul className="mt-5 space-y-2 text-sm text-white/45">
                        {item.items.map((detail) => <li key={detail} className="before:mr-3 before:content-['·']">{detail}</li>)}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="portfolio" className="bg-[#eef1f2] px-6 py-28 text-vectrus sm:px-8 md:px-16 lg:py-40">
          <div className="mx-auto max-w-7xl">
            <SectionHead index="05" label="Portfolio" />
            <div className="mt-14" data-reveal>
              <h2 className="display-heading max-w-4xl">Backing category-defining founders.</h2>
              <p className="mt-8 max-w-3xl text-lg font-light uppercase leading-relaxed tracking-[0.08em] text-[#1D3045]/65">We invest at the earliest stages, partnering with researchers and engineers who are building the future.</p>
            </div>
            <div className="mt-20 divide-y divide-[#1D3045]/20 border-y border-[#1D3045]/20">
              {PORTFOLIO.map((company, index) => (
                <article
                  key={company.name}
                  className="group grid gap-8 py-12 transition-colors duration-500 hover:bg-white/50 lg:-mx-8 lg:grid-cols-[5rem_0.8fr_1.3fr] lg:gap-12 lg:px-8 lg:py-16"
                  data-reveal
                  style={{ "--reveal-delay": `${index * 120}ms` } as CSSProperties}
                >
                  <span className="text-sm tabular-nums text-[#1D3045]/40 transition-colors duration-500 group-hover:text-vectrus">0{index + 1}</span>
                  <div>
                    <h3 className="flex items-center gap-4 text-3xl font-light uppercase transition-transform duration-500 group-hover:translate-x-2">
                      {company.name}
                      <ArrowRight size={22} strokeWidth={1.25} className="-translate-x-2 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-60" />
                    </h3>
                    <p className="mt-3 text-sm text-[#1D3045]/55">{company.category}</p>
                  </div>
                  <div>
                    <p className="max-w-3xl font-light leading-relaxed text-[#1D3045]/70">{company.body}</p>
                    <div className="mt-7 flex flex-wrap gap-3 text-xs uppercase tracking-[0.16em] text-[#1D3045]/50">
                      {company.tags.map((tag) => (
                        <span key={tag} className="border border-[#1D3045]/20 px-3 py-1.5 transition-colors duration-500 group-hover:border-[#1D3045]/45 group-hover:text-[#1D3045]/70">{tag}</span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="research" className="bg-[#dfe5e7] px-6 py-28 text-vectrus sm:px-8 md:px-16 lg:py-40">
          <div className="mx-auto max-w-7xl">
            <SectionHead index="06" label="Research" />
            <div className="mt-14" data-reveal>
              <h2 className="display-heading max-w-4xl">Research-driven conviction.</h2>
              <p className="mt-8 max-w-3xl text-lg font-light uppercase leading-relaxed tracking-[0.08em] text-[#1D3045]/65">Our investment thesis is grounded in deep technical research. We study the frontiers of AI and science to identify where breakthroughs will emerge.</p>
            </div>
            <div className="mt-20 grid gap-x-14 gap-y-16 md:grid-cols-2">
              {RESEARCH.map((area, index) => (
                <article
                  key={area.title}
                  className="group border-t border-[#1D3045]/25 pt-8 transition-colors duration-500 hover:border-[#1D3045]/60"
                  data-reveal
                  style={{ "--reveal-delay": `${(index % 2) * 130}ms` } as CSSProperties}
                >
                  <span className="text-xs tabular-nums text-[#1D3045]/40 transition-colors duration-500 group-hover:text-vectrus">0{index + 1}</span>
                  <h3 className="mt-8 text-3xl font-light uppercase transition-transform duration-500 group-hover:translate-x-1">{area.title}</h3>
                  <p className="mt-5 max-w-xl leading-relaxed text-[#1D3045]/65">{area.body}</p>
                  <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-xs uppercase tracking-[0.12em] text-[#1D3045]/55">
                    {area.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </article>
              ))}
            </div>
            <div className="mt-24 border-t border-[#1D3045]/25 pt-10" data-reveal>
              <p className="eyebrow">Articles</p>
              <div className="mt-8 flex flex-col gap-5 text-xl font-light underline decoration-[#1D3045]/25 underline-offset-8 sm:text-2xl">
                <a href="https://somalabs.xyz/why-we-started" target="_blank" rel="noreferrer" className="group inline-flex w-fit items-center gap-3 transition-colors duration-300 hover:decoration-vectrus">
                  1. Why We Started Soma Labs
                  <ArrowRight size={20} strokeWidth={1.25} className="shrink-0 opacity-40 transition-all duration-300 group-hover:translate-x-1.5 group-hover:opacity-100" />
                </a>
                <a href="https://somalabs.xyz/why-recursive" target="_blank" rel="noreferrer" className="group inline-flex w-fit items-center gap-3 transition-colors duration-300 hover:decoration-vectrus">
                  2. Why We Invested in Recursive
                  <ArrowRight size={20} strokeWidth={1.25} className="shrink-0 opacity-40 transition-all duration-300 group-hover:translate-x-1.5 group-hover:opacity-100" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="team" className="bg-[#eef1f2] px-6 py-28 text-vectrus sm:px-8 md:px-16 lg:py-40">
          <div className="mx-auto max-w-7xl">
            <SectionHead index="07" label="Team" />
            <div className="mt-14" data-reveal>
              <h2 className="display-heading">Investment, business and legal.</h2>
            </div>
            <div className="mt-20 grid gap-x-12 gap-y-0 border-t border-[#1D3045]/20 md:grid-cols-2 lg:grid-cols-3">
              {TEAM.map(([name, role], index) => (
                <article
                  key={name}
                  className="group relative border-b border-[#1D3045]/20 py-8"
                  data-reveal
                  style={{ "--reveal-delay": `${(index % 3) * 100}ms` } as CSSProperties}
                >
                  <span className="absolute bottom-[-1px] left-0 h-px w-0 bg-vectrus transition-all duration-500 group-hover:w-full" aria-hidden="true" />
                  <span className="text-xs tabular-nums text-[#1D3045]/35 transition-colors duration-500 group-hover:text-vectrus">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-6 text-2xl font-light transition-transform duration-500 group-hover:translate-x-1">{name}</h3>
                  <p className="mt-2 text-sm text-[#1D3045]/55 transition-colors duration-500 group-hover:text-[#1D3045]/80">{role}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="relative overflow-hidden bg-[#d8dfe2] px-6 py-32 text-vectrus sm:px-8 md:px-16 lg:py-48">
          <img src="/images/contact-bg.webp" alt="Abstract branching structure" className="absolute inset-0 h-full w-full object-cover opacity-55 will-change-transform" data-parallax />
          <div className="absolute inset-0 bg-[#eef1f2]/55" />
          <div className="relative mx-auto flex min-h-[45vh] max-w-4xl flex-col items-center justify-center text-center" data-reveal>
            <p className="eyebrow">Get in touch</p>
            <h2 className="display-heading mt-7">Building something at the frontier?</h2>
            <p className="mt-7 text-xl font-light text-[#1D3045]/70">We'd love to hear from you.</p>
            <a href="mailto:hello@somalabs.xyz" className="group mt-12 inline-flex items-center gap-5 bg-vectrus px-7 py-4 text-xs uppercase tracking-[0.2em] text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-14px_rgba(29,48,69,0.55)]">Start a conversation <ArrowRight size={16} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-1" /></a>
          </div>
        </section>

        <footer className="overflow-hidden bg-vectrus px-6 pb-6 pt-14 text-white sm:px-8 md:px-16">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row md:items-end">
            <div>
              <p className="text-lg font-medium tracking-[0.18em]">SOMA LABS</p>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/50">Backing Category-Defining Founders Turning Scientific Breakthroughs Into Real-World Impact.</p>
              <p className="mt-3 text-xs text-white/50">Singapore · San Francisco · Shenzhen</p>
            </div>
            <div className="flex flex-col gap-4 text-xs text-white/55 md:items-end">
              <a href="mailto:hello@somalabs.xyz">hello@somalabs.xyz</a>
              <div className="flex flex-wrap gap-4">
                <a href="https://somalabs.xyz/privacy" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">Privacy</a>
                <a href="https://somalabs.xyz/terms" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">Terms</a>
                <a href="https://somalabs.xyz/cookies" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">Cookies</a>
                <a href="https://www.linkedin.com/company/soma-labs-ventures" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">LinkedIn</a>
                <a href="https://x.com/somalabs_" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">X</a>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-14 max-w-7xl border-t border-white/10 pt-10">
            <p className="footer-wordmark" aria-hidden="true">SOMA LABS</p>
          </div>
        </footer>
      </main>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
