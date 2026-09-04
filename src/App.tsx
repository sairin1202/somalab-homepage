import { Fragment, useEffect, useRef, useState, type CSSProperties, type MutableRefObject, type ReactNode } from "react";
import { X } from "lucide-react";
import { useVideoScrub } from "@/useVideoScrub";

/* ================================================================ */
/* Content                                                          */
/* ================================================================ */

const BEATS = [
  {
    tag: "The fund",
    head: ["Where frontier technology", "meets scientific breakthroughs."],
    sub: ["An early-stage venture fund for", "frontier AI and science."],
    stand:
      "Soma Labs backs exceptional researchers, engineers, and technical founders transforming frontier AI and scientific breakthroughs into platforms that shape the future.",
  },
  {
    tag: "The thesis",
    head: ["The first institutional partner,", "before the category is obvious."],
    stand:
      "We enter at pre-seed and seed, when a technical insight has emerged from research, a prototype exists, and a founding team is beginning to form.",
  },
  {
    tag: "The model — 01",
    head: ["Frontier research", "ecosystems."],
    stand:
      "Institutional partnerships with labs at Stanford and UC Berkeley put us beside the scientists building the next generation of breakthroughs.",
  },
  {
    tag: "The model — 02",
    head: ["Global founder", "networks."],
    stand:
      "Deep, trust-based relationships across the global technical diaspora: backing exceptional founders and connecting world-class talent from day one.",
  },
  {
    tag: "The model — 03",
    head: ["Singapore as a", "global corridor."],
    stand:
      "A neutral, globally connected hub linking talent, capital, and technology across the United States, Asia, and beyond.",
  },
];

const WORK = [
  {
    chip: "Portfolio",
    head: ["Backing category-defining", "founders."],
    body: "A small number of companies, backed at the earliest stage and supported globally from day one.",
    tags: [] as string[],
  },
  {
    chip: "Self improvement · AGI",
    head: ["Recursive"],
    body: "A superintelligent, general-purpose digital worker designed to perform nearly all high-value intellectual labor across software, science, and engineering. Systems that improve themselves and compound productivity across the digital economy.",
    tags: ["Frontier AI", "AI for Science"],
  },
  {
    chip: "World models",
    head: ["Odyssey"],
    body: "General-purpose world models that generate interactive video in real time: a world-simulator platform for gaming, robotics, defense simulation, and training, with causal action-aware generation and long-horizon coherence.",
    tags: ["Frontier AI", "World Models"],
  },
  {
    chip: "Foundation models",
    head: ["Moonshot AI (Kimi)"],
    body: "A leading frontier AI lab. Its Kimi models are built for long-context reasoning and agentic workflows, and have become among the most widely used LLMs in the world.",
    tags: ["Frontier AI", "Foundation Models"],
  },
];
const WORK_AT = [0, 900, 1800, 2700];
const TRACK = 3515;
const AXIS_X = 520;

const RESEARCH = [
  { title: "Frontier AI", body: "The models and architectures expanding what machines can reason, create, and do.", items: ["Foundational Models", "Novel Architectures", "World Models", "Agentic Systems"] },
  { title: "AI for Science", body: "Using AI as a research instrument to compress the discovery cycle across the physical and life sciences.", items: ["Scientific Models", "Hypothesis Generation", "Simulation", "Lab Automation"] },
  { title: "AI Infrastructure", body: "The control, efficiency, and supply layers that make the shift to Agents-as-a-Service safe, reliable, and economical.", items: ["Agentic Infrastructure", "Inference Engines", "Agent-Native Hardware", "Neoclouds"] },
  { title: "Embodied Intelligence", body: "Closing the gap between digital reasoning and physical action.", items: ["Robotics Models", "Simulation", "Perception", "Manipulation"] },
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

/* ================================================================ */
/* Timeline (fractions of the stage scroll)                         */
/* ================================================================ */

const TL = {
  beats: [
    [0, 0.045],
    [0.085, 0.135],
    [0.14, 0.19],
    [0.195, 0.245],
    [0.25, 0.3],
  ],
  video: 0.315,
  videoFade: [0.3, 0.345],
  work: [0.335, 0.515],
  terms: [0.505, 0.675],
  sign: [0.665, 0.73],
  faq: [0.68, 0.835],
  team: [0.835, 0.89],
  contact: [0.885, 0.955],
  footer: [0.95, 1],
};

const RAIL = [
  { label: "The Fund", at: 0.085 },
  { label: "The Work", at: 0.34 },
  { label: "The Terms", at: 0.52 },
  { label: "Research", at: 0.69 },
  { label: "Team", at: 0.84 },
  { label: "Contact", at: 0.895 },
];

const HEADER_NAV = [
  { label: "The Fund", at: 0.085 },
  { label: "Portfolio", at: 0.34 },
  { label: "Research", at: 0.69 },
  { label: "Team", at: 0.84 },
];

const COL_B = 23.7;
const V2 = 94.7;

/* ================================================================ */
/* Math                                                             */
/* ================================================================ */

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const f = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
const m = (t: number) => 1 - Math.pow(1 - clamp(t), 5);
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const fx = (n: number, d = 2) => n.toFixed(d);

/* ================================================================ */
/* Small pieces                                                     */
/* ================================================================ */

function Star() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0Q13.1 10.9 24 12Q13.1 13.1 12 24Q10.9 13.1 0 12Q10.9 10.9 12 0Z" />
    </svg>
  );
}

function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line) => (
        <span className="ln" key={line}>
          <i>{line}</i>
        </span>
      ))}
    </>
  );
}

function Chars({ text }: { text: string }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(" ").map((word, wi) => (
          <Fragment key={wi}>
            {wi > 0 ? " " : null}
            <span className="wd">
              {Array.from(word).map((char, k) => (
                <span className="ch" key={k}>
                  {char}
                </span>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </>
  );
}

function PlatesDiagram() {
  return (
    <svg viewBox="0 0 240 176" aria-hidden="true">
      <ellipse cx="120" cy="132" rx="80" ry="26" fill="rgba(29,28,25,0.18)" />
      <ellipse cx="120" cy="107" rx="80" ry="26" fill="rgba(29,28,25,0.3)" />
      <ellipse cx="120" cy="82" rx="80" ry="26" fill="rgba(29,28,25,0.45)" />
      <ellipse cx="120" cy="57" rx="80" ry="26" fill="rgba(29,28,25,0.72)" />
    </svg>
  );
}

function ConvergeDiagram() {
  return (
    <svg viewBox="0 0 240 176" aria-hidden="true">
      <line x1="66" y1="70" x2="106" y2="122" stroke="rgba(29,28,25,0.35)" strokeWidth="1" />
      <line x1="120" y1="48" x2="120" y2="116" stroke="rgba(29,28,25,0.35)" strokeWidth="1" />
      <line x1="174" y1="70" x2="134" y2="122" stroke="rgba(29,28,25,0.35)" strokeWidth="1" />
      <ellipse cx="120" cy="132" rx="86" ry="24" fill="rgba(29,28,25,0.85)" />
      <ellipse cx="60" cy="62" rx="30" ry="12" fill="rgba(29,28,25,0.35)" />
      <ellipse cx="120" cy="36" rx="30" ry="12" fill="rgba(29,28,25,0.55)" />
      <ellipse cx="180" cy="62" rx="30" ry="12" fill="rgba(29,28,25,0.45)" />
    </svg>
  );
}

function NetworkDiagram() {
  return (
    <svg viewBox="0 0 240 176" aria-hidden="true">
      <line x1="120" y1="14" x2="120" y2="162" stroke="rgba(29,28,25,0.3)" strokeWidth="1" />
      <line x1="24" y1="88" x2="216" y2="88" stroke="rgba(29,28,25,0.3)" strokeWidth="1" />
      <circle cx="120" cy="88" r="54" fill="none" stroke="rgba(29,28,25,0.35)" strokeWidth="1" />
      <circle cx="120" cy="34" r="7" fill="rgba(29,28,25,0.6)" />
      <circle cx="120" cy="142" r="7" fill="rgba(29,28,25,0.4)" />
      <circle cx="66" cy="88" r="7" fill="rgba(29,28,25,0.5)" />
      <circle cx="174" cy="88" r="7" fill="rgba(29,28,25,0.7)" />
      <circle cx="120" cy="88" r="12" fill="#1d1c19" />
    </svg>
  );
}

const DIAGRAMS: Record<number, ReactNode> = { 2: <PlatesDiagram />, 3: <ConvergeDiagram />, 4: <NetworkDiagram /> };

/* ================================================================ */
/* Engine: one rAF loop drives every scene from eased progress      */
/* ================================================================ */

type Engine = {
  goTo: (at: number) => void;
};

function useStageEngine(
  stageRef: MutableRefObject<HTMLDivElement | null>,
  pinRef: MutableRefObject<HTMLDivElement | null>,
  bootedRef: MutableRefObject<boolean>,
): Engine {
  const engineRef = useRef<Engine>({ goTo: () => undefined });

  useEffect(() => {
    const stage = stageRef.current;
    const pin = pinRef.current;
    if (!stage || !pin) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const q = <T extends Element>(sel: string, root: ParentNode = pin) => root.querySelector(sel) as T | null;
    const qa = <T extends Element>(sel: string, root: ParentNode = pin) => Array.from(root.querySelectorAll(sel)) as T[];

    /* ---- overlay chrome */
    const ov = q<HTMLElement>(".ov")!;
    const media = q<HTMLElement>(".media")!;
    const fill = q<HTMLElement>(".ov .fill")!;
    const gh2 = q<HTMLElement>(".ov .gh--d")!;
    const gx2 = qa<HTMLElement>(".ov .gx--d");
    const tag = q<HTMLElement>(".ov .tag")!;
    const railLinks = qa<HTMLAnchorElement>(".ov .rail a").map((el) => ({ el, at: parseFloat(el.dataset.at || "0"), on: false }));

    /* ---- beats */
    const beats = TL.beats.map((_, i) => {
      const els = qa<HTMLElement>(`.bk[data-beat="${i}"]`);
      const head = els.find((el) => el.closest(".col-head")) ?? null;
      return {
        els,
        lines: els.flatMap((el) => qa<HTMLElement>(".ln > i", el)),
        chars: els.flatMap((el) => qa<HTMLElement>(".stand .ch", el)),
        cta: head ? q<HTMLElement>(".cta", head) : null,
        flood: head ? q<HTMLElement>(".cta .flood", head) : null,
        diagram: q<HTMLElement>(`.diagram[data-beat="${i}"]`),
        shown: false,
      };
    });
    let tagIdx = -1;
    let t0 = -1;
    const start = performance.now();

    /* ---- work */
    const pf = q<HTMLElement>(".pf")!;
    const pfIn = q<HTMLElement>(".pf-in")!;
    const pfHead = q<HTMLElement>(".pf-head")!;
    const pfHeadLabel = q<HTMLElement>(".pf-head b")!;
    const pfNum = q<HTMLElement>(".pf-num")!;
    const ticks = qa<SVGLineElement>(".pf-lines .tick").map((el) => ({ el, y: parseFloat(el.getAttribute("y1") || "0") }));
    const groups = qa<HTMLElement>(".pf-g").map((el) => ({
      el,
      chip: q<HTMLElement>(".chip", el),
      lines: qa<HTMLElement>(".ln > i", el),
      body: q<HTMLElement>(".pf-b", el),
      tags: q<HTMLElement>(".pf-tags", el),
      w: 0,
    }));
    let pfPct = -1;
    let pfNumTxt = "";

    /* ---- terms */
    const fin = q<HTMLElement>(".fin")!;
        const finGroups = qa<HTMLElement>(".fin-g").map((el) => ({
      el,
      top: q<HTMLElement>(".fin-top", el)!,
      bot: q<HTMLElement>(".fin-bot", el)!,
      soaks: qa<HTMLElement>(".fin-soak", el),
      lines: qa<HTMLElement>(".fin-h .ln > i", el),
    }));
    const inkDisp = document.getElementById("inkf-disp");
    const inkAlpha = document.getElementById("inkf-alpha");

    /* ---- sign / faq */
    const sign = q<HTMLElement>(".sign")!;
    const sgA = q<HTMLElement>(".sign .sg-a")!;
    const sgB = q<HTMLElement>(".sign .sg-b")!;
    const faq = q<HTMLElement>(".faq")!;
    const cards = qa<HTMLElement>(".fq");
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    /* ---- team */
    const team = q<HTMLElement>(".team")!;
    const teamHeadLines = qa<HTMLElement>(".team-head .ln > i");
    const teamItems = qa<HTMLElement>(".team-item").map((el) => ({ name: q<HTMLElement>(".ln > i", el)!, role: q<HTMLElement>(".role", el)! }));

    /* ---- contact */
    const cf = q<HTMLElement>(".cf")!;
    const cfIn = q<HTMLElement>(".cf-in")!;
    const cfLead = q<HTMLElement>(".cf-lead")!;
    const cfGl = q<HTMLElement>(".cf-gl")!;
    const cfOrb = q<SVGElement>(".cf-orb")!;
    const cfFields = qa<HTMLElement>(".cf-in [data-fly]").map((el) => ({ el, from: (el.dataset.fly || "0,0,0,0").split(",").map(Number) }));

    /* ---- footer */
    const ft = q<HTMLElement>(".ft")!;
    const ftIn = q<HTMLElement>(".ft-in")!;
    const ftRules = qa<HTMLElement>(".ft-r");
    const ftRect = q<SVGRectElement>(".ft-box rect")!;
    const ftFades = qa<HTMLElement>(".ft-fade");
    const ftTagLines = qa<HTMLElement>(".ft-tag .ln > i");
    const foot = q<HTMLVideoElement>(".foot")!;
    const footVeil = q<HTMLElement>(".foot-veil")!;
    let footPlaying = false;

    /* ---- scroll smoothing */
    const scroll = { target: 0, current: 0, slow: false };
    let raf = 0;
    let last = performance.now();
    let lastVis = "";

    const span = () => Math.max(1, stage.offsetHeight - window.innerHeight);

    const setVisible = (el: HTMLElement, on: boolean) => {
      const key = `${on}`;
      if (el.dataset.vis === key) return;
      el.dataset.vis = key;
      el.setAttribute("aria-hidden", on ? "false" : "true");
    };

    const goTo = (at: number) => {
      scroll.slow = true;
      window.scrollTo({ top: at * span(), behavior: "auto" });
    };
    engineRef.current = { goTo };

    const onPointer = (event: PointerEvent) => {
      pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    /* ============================================================ */
    const drive = (p: number, now: number, dt: number) => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const mobile = W <= 720;

      /* -- video layer & chrome colour */
      const vf = f(seg(p, TL.videoFade[0], TL.videoFade[1]));
      media.style.opacity = fx(1 - vf, 3);
      let light = p < TL.videoFade[0] + 0.02;

      /* -- beats */
      if (t0 < 0 && (bootedRef.current || now - start > 620 || window.scrollY > 6)) t0 = now;
      let anyBeat = false;
      beats.forEach((b, i) => {
        const [A, B] = TL.beats[i];
        const a = seg(p, A, B);
        const shown = p > A - 0.02 && p < B + 0.02;
        if (shown !== b.shown) {
          b.shown = shown;
          b.els.forEach((el) => {
            el.style.visibility = shown ? "visible" : "hidden";
          });
          if (b.diagram) b.diagram.style.visibility = shown ? "visible" : "hidden";
        }
        if (!shown) return;
        anyBeat = true;
        const hero = i === 0;
        const c = hero ? f((1 - a) / 0.28) : Math.min(f(a / 0.16), f((1 - a) / 0.2));
        if (hero) {
          const e = 1 - c;
          const t = e * e;
          b.lines.forEach((ln, n) => {
            const r = t * (1 + n * 0.16);
            ln.style.setProperty("--exitX", `${fx(-r * 54)}px`);
            ln.style.setProperty("--exitY", `${fx(-r * 7)}px`);
          });
          b.els.forEach((el) => {
            el.style.opacity = fx(c, 3);
            el.style.transform = `translate3d(${fx(-t * 86, 1)}px,${fx(-t * 14, 1)}px,0) scale(${fx(1 - t * 0.04, 4)})`;
            el.style.filter = e > 0.02 && !reduce ? `blur(${fx(t * 5)}px)` : "";
          });
        } else {
          b.els.forEach((el) => {
            el.style.opacity = fx(c, 3);
            el.style.transform = "";
            el.style.filter = "";
          });
        }
        const l = hero ? (t0 < 0 ? 0 : clamp((now - t0) / 1450)) : clamp((a - 0.03) / 0.3);
        b.lines.forEach((ln, n) => {
          const r = m((l - n * 0.115) / 0.6);
          ln.style.transform = `translate(var(--exitX, 0px), calc(${fx((1 - r) * 175)}% + var(--exitY, 0px)))`;
        });
        if (hero && b.cta && b.flood) {
          const e1 = m((l - 0.34) / 0.3);
          const t1 = m((l - 0.52) / 0.22);
          b.cta.style.opacity = fx(e1, 3);
          b.cta.style.transform = `translateY(${fx((1 - e1) * 14, 1)}px)`;
          b.flood.style.clipPath = `inset(${fx((1 - t1) * 100)}% 0 0 0)`;
        }
        if (i !== tagIdx) {
          tagIdx = i;
          tag.textContent = BEATS[i].tag;
        }
        const tt = m((l - (hero ? 0.8 : 0.35)) / 0.2) * c;
        tag.style.opacity = fx(tt, 3);
        tag.style.transform = `translateY(${fx((1 - tt) * 10, 1)}px)`;
        const u = clamp(hero ? (l - 0.56) / 0.36 : (a - 0.14) / 0.26) * (b.chars.length + 4);
        b.chars.forEach((ch, k) => {
          ch.style.opacity = fx(clamp((u - k) * 2.4));
        });
        if (b.diagram) {
          b.diagram.style.opacity = fx(c, 3);
          b.diagram.style.transform = `translateY(${fx((1 - c) * 18, 1)}px) scale(${fx(0.94 + 0.06 * c, 3)})`;
        }
      });
      if (!anyBeat && tagIdx !== -1) {
        tagIdx = -1;
        tag.style.opacity = "0";
      }

      /* -- fill line and the h2 rule flying out with the film */
      const fl = COL_B * (1 - f(seg(p, 0.052, 0.142)));
      fill.style.left = `${fx(fl)}%`;
      fill.style.width = `${fx((V2 - fl) * f(seg(p, 0, 0.3)))}%`;
      fill.style.opacity = fx(0.85 * (1 - vf), 3);
      const fly = `translateY(${fx(vf * (H + 24), 1)}px)`;
      gh2.style.transform = fly;
      gh2.style.opacity = fx(1 - vf, 3);
      gx2.forEach((el) => {
        el.style.transform = `${fly} scale(${fx(1 + 0.85 * Math.sin(Math.PI * vf), 3)})`;
        el.style.opacity = fx(1 - f(vf / 0.5), 3);
      });

      /* -- work (pf) */
      {
        const w = seg(p, TL.work[0], TL.work[1]);
        const op = p > TL.work[0] - 0.005 && p < TL.work[1] + 0.005 ? Math.min(f(w / 0.06), f((1 - w) / 0.06)) : 0;
        pf.style.opacity = fx(op, 3);
        setVisible(pf, op > 0.001);
        if (op > 0.001) {
          const a = W / 1328;
          const hp = w * TRACK;
          const s = H * 0.92 - hp * a;
          const ox = mobile ? W * 0.0475 - AXIS_X * a : 0;
          pfIn.style.transform = `translate(${fx(ox)}px,${fx(s)}px) scale(${fx(a, 5)})`;
          const u = f(seg(w, 0, 0.08));
          pfHead.style.transform = `translateY(${fx(hp, 1)}px)`;
          pfHead.style.opacity = fx(u * f((1 - w) / 0.08), 3);
          const pct = Math.round((hp / TRACK) * 100);
          if (pct !== pfPct) {
            pfPct = pct;
            pfHeadLabel.textContent = `${pct}%`;
          }
          let active = 0;
          WORK_AT.forEach((y, i) => {
            if (hp >= y) active = i;
          });
          const numTxt = active === 0 ? "" : `0${active}`;
          if (numTxt !== pfNumTxt) {
            pfNumTxt = numTxt;
            pfNum.textContent = numTxt;
          }
          groups.forEach((g, i) => {
            const on = u > 0.1 && i === active;
            g.w = clamp(g.w + (on ? dt : -dt) / 820);
            const c = f(g.w);
            g.el.style.opacity = fx(c, 3);
            g.el.style.transform = `translateY(${fx((WORK_AT[i] - hp) * 0.375 * a + (1 - c) * 10, 1)}px)`;
            g.lines.forEach((ln, k) => {
              const t = clamp((c - k * 0.055) / 0.8);
              ln.style.transform = `translateX(${fx((1 - t) * 115)}%)`;
            });
            const g1 = clamp(c / 0.42);
            const g2 = clamp((c - 0.3) / 0.7);
            if (g.chip) {
              g.chip.style.opacity = fx(g1, 3);
              g.chip.style.transform = `translateY(${fx((1 - g1) * 8, 1)}px)`;
            }
            if (g.body) {
              g.body.style.opacity = fx(g2, 3);
              g.body.style.transform = `translateY(${fx((1 - g2) * 10, 1)}px)`;
            }
            if (g.tags) {
              g.tags.style.opacity = fx(g2, 3);
              g.tags.style.transform = `translateY(${fx((1 - g2) * 10, 1)}px)`;
            }
          });
          ticks.forEach((tk, k) => {
            const n = clamp((hp - tk.y) / 60);
            const r = Math.exp(-Math.abs(hp - tk.y) / 190);
            const br = 0.5 + 0.5 * Math.sin(hp * 0.011 + k * 1.7);
            const len = (k % 4 === 0 ? 15 : 7) * (0.55 + 0.75 * br + 0.9 * r);
            tk.el.setAttribute("x2", fx(AXIS_X + len, 1));
            tk.el.style.opacity = fx(u * n * (0.38 + 0.38 * r), 3);
          });
        }
      }

      /* -- terms (fin) */
      {
        const qq = seg(p, TL.terms[0], TL.terms[1]);
        const op = p > TL.terms[0] - 0.005 && p < TL.terms[1] + 0.005 ? Math.min(f(qq / 0.07), f((1 - qq) / 0.04)) : 0;
        fin.style.opacity = fx(op, 3);
        setVisible(fin, op > 0.001);
        if (op > 0.001) {
          const sc = mobile ? 1 : W / 1516;
          const ink = seg(qq, 0.08, 0.34);
          const e1 = seg(qq, 0.52, 0.86);
          light = light || op > 0.45;

          /* group 0 on paper */
          const g0 = finGroups[0];
          const c0 = f(ink / 0.22);
          const out0 = f(seg(qq, 0.5, 0.62));
          g0.el.style.opacity = fx(c0 * (1 - out0), 3);
          g0.top.style.transform = `scale(${fx(sc, 5)})`;
          g0.bot.style.transform = `scale(${fx(sc, 5)})`;
          g0.lines.forEach((ln, k) => {
            const r = m((c0 - k * 0.12) / 0.62);
            ln.style.transform = `translateY(${fx((1 - r) * 120, 1)}%)`;
          });
          const es = f(ink);
          const soakOff = ink >= 0.999 || reduce;
          g0.soaks.forEach((el) => {
            el.style.setProperty("--soak", `${fx((1 - es) * 3.4)}px`);
            el.style.setProperty("--bite", fx(1 + (1 - es) * 6));
            el.style.filter = soakOff ? "none" : "";
          });
          if (inkDisp) inkDisp.setAttribute("scale", fx((1 - es) * 34));
          if (inkAlpha) {
            /* noise mask threshold slides from 1 (nothing passes) to 0 (everything passes) */
            const slope = 12 - 6 * es;
            const threshold = Math.max(0, 1 - ink * 1.08);
            inkAlpha.setAttribute("slope", fx(slope));
            inkAlpha.setAttribute("intercept", fx(-slope * threshold + 1.2 * ink, 3));
          }

          /* group 1, also on paper: rises in after group 0 fades */
          const g1 = finGroups[1];
          if (g1) {
            const op1 = f(e1 / 0.03) * f(seg(qq, 0.52, 0.6));
            g1.el.style.opacity = fx(op1, 3);
            const e = f(e1 / 0.78);
            const t = m((e - 0.62) / 0.38);
            const n = 1 + 0.62 * (1 - t);
            g1.top.style.transform = mobile
              ? `translate(0px,${fx((1 - e) * 520, 1)}px) scale(${fx(n, 4)})`
              : `scale(${fx(sc, 5)}) translate(0px,${fx((1 - e) * 1190, 1)}px) scale(${fx(n, 4)})`;
            const t2 = f((e - 0.74) / 0.26);
            g1.bot.style.transform = mobile ? `translateY(${fx((1 - t2) * 110, 1)}px)` : `scale(${fx(sc, 5)}) translateY(${fx((1 - t2) * 230, 1)}px)`;
            g1.bot.style.opacity = fx(t2, 3);
            g1.lines.forEach((ln, k) => {
              const r = m((e - k * 0.12) / 0.62);
              ln.style.transform = `translateY(${fx((1 - r) * 120, 1)}%)`;
            });
          }
        }
      }

      /* -- sign */
      {
        const sg = seg(p, TL.sign[0], TL.sign[1]);
        const op = p > TL.sign[0] && p < TL.sign[1] ? Math.min(f(sg / 0.3), f((1 - sg) / 0.3)) : 0;
        sign.style.opacity = fx(op, 3);
        setVisible(sign, op > 0.001);
        if (op > 0.001) {
          const inA = f(sg / 0.3);
          sgA.style.opacity = fx(inA, 3);
          sgB.style.opacity = fx(f((sg - 0.12) / 0.3), 3);
          sign.style.transform = `translateY(${fx((1 - f(sg / 0.5)) * 18, 1)}px) scale(${fx(1 + 0.03 * (1 - f(sg / 0.5)), 4)})`;
        }
      }

      /* -- faq carousel */
      {
        const e = seg(p, TL.faq[0], TL.faq[1]);
        const op = p > TL.faq[0] && p < TL.faq[1] ? 1 - f((e - 0.9) / 0.1) : 0;
        faq.style.opacity = fx(op, 3);
        setVisible(faq, op > 0.001);
        if (op > 0.001) {
          pointer.x += (pointer.tx - pointer.x) * 0.06;
          pointer.y += (pointer.ty - pointer.y) * 0.06;
          const N = cards.length;
          const l = clamp(e / 0.85);
          const uu = 0.22;
          const pp = clamp((l - uu) / (1 - uu));
          const step = 360 / N;
          const h = -pp * (360 - step);
          let front = 0;
          let best = -2;
          for (let i = 0; i < N; i++) {
            const cs = Math.cos(((((i * step + h) % 360) + 360) % 360) * (Math.PI / 180));
            if (cs > best) {
              best = cs;
              front = i;
            }
          }
          const radius = mobile ? W * 0.36 : Math.min(360, W * 0.26);
          const xs = mobile ? Math.min(1, W / 560) : 1;
          cards.forEach((card, i) => {
            const r = f((l - 0.04 - i * 0.05) / 0.22);
            const ang = (((i * step + h) % 360) + 360) % 360;
            const ar = ang * (Math.PI / 180);
            const o = (Math.cos(ar) + 1) / 2;
            const on = i === front && o > 0.9 && r > 0.92;
            if (on !== card.classList.contains("on")) card.classList.toggle("on", on);
            card.style.left = "50%";
            card.style.top = `${fx(H * (H < 800 ? 0.66 : 0.602), 0)}px`;
            card.style.transform = `translate(${fx(-50 + pointer.x * 2.4)}%,${fx(-50 + pointer.y * 2)}%) rotateY(${fx(ang)}deg) translateZ(${fx(radius, 0)}px) rotateY(${fx(-ang)}deg) translateY(${fx(Math.sin(ar) * 26 - (1 - r) * 34, 1)}px) scale(${fx(r * xs * (0.58 + 0.42 * Math.pow(o, 1.4)))})`;
            const blur = Math.round((1 - o) * 8.4) / 2;
            card.style.filter = blur > 0.05 && !reduce ? `blur(${fx(blur, 1)}px)` : "";
            card.style.zIndex = `${Math.round(o * 100)}`;
          });
        }
      }

      /* -- team */
      {
        const t = seg(p, TL.team[0], TL.team[1]);
        const op = p > TL.team[0] && p < TL.team[1] ? Math.min(f(t / 0.1), 1 - f((t - 0.88) / 0.12)) : 0;
        team.style.opacity = fx(op, 3);
        setVisible(team, op > 0.001);
        if (op > 0.001) {
          const hin = f(t / 0.45);
          teamHeadLines.forEach((ln, k) => {
            const r = m((hin - k * 0.12) / 0.62);
            ln.style.transform = `translateY(${fx((1 - r) * 120, 1)}%)`;
          });
          const iin = f((t - 0.05) / 0.55);
          teamItems.forEach((it, k) => {
            const r = m((iin - k * 0.06) / 0.6);
            it.name.style.transform = `translateY(${fx((1 - r) * 120, 1)}%)`;
            it.role.style.opacity = fx(r, 3);
          });
        }
      }

      /* -- contact (cf) */
      {
        const c = seg(p, TL.contact[0], TL.contact[1]);
        const op = p > TL.contact[0] && p < TL.contact[1] ? 1 - f((c - 0.9) / 0.1) : 0;
        cf.style.opacity = fx(op, 3);
        setVisible(cf, op > 0.001);
        const live = c > 0.35 && c < 0.92;
        if (live !== cf.classList.contains("live")) cf.classList.toggle("live", live);
        if (op > 0.001) {
          const e = f(c / 0.45);
          const fit = Math.min(1, (W - 28) / 980);
          cfIn.style.transform = reduce
            ? `scale(${fx(fit, 4)})`
            : `translate(${fx(-214.5 * (1 - e) * fit, 1)}px,${fx(-133.4 * (1 - e) * fit, 1)}px) scale(${fx((0.95 + 0.05 * e) * fit, 4)}) rotateX(${fx(15 * (1 - e))}deg) rotateY(${fx(31 * (1 - e))}deg) rotateZ(${fx(5.6 * (1 - e))}deg)`;
          cfFields.forEach((fld, k) => {
            const ek = f((c - 0.06 - k * 0.05) / 0.42);
            const [dx, dy, dz, rz] = fld.from;
            fld.el.style.opacity = fx(ek, 3);
            fld.el.style.transform = `translate3d(${fx(dx * (1 - ek), 1)}px,${fx(dy * (1 - ek), 1)}px,${fx(dz * (1 - ek), 1)}px) rotateZ(${fx(rz * (1 - ek))}deg)`;
          });
          const el = f((c - 0.04) / 0.26);
          cfLead.style.opacity = fx(el, 3);
          cfLead.style.transform = `translateY(${fx((1 - el) * 11, 1)}px)`;
          cfGl.style.opacity = fx(e, 3);
          cfOrb.style.opacity = fx(e, 3);
        }
      }

      /* -- footer (ft) */
      {
        const e = seg(p, TL.footer[0], TL.footer[1]);
        const on = e > 0.001;
        ft.style.opacity = on ? "1" : "0";
        setVisible(ft, on);
        document.body.classList.toggle("ft-on", e > 0.02);
        const fv = f(e / 0.35);
        foot.style.opacity = fx(0.5 * fv, 3);
        footVeil.style.opacity = fx(fv, 3);
        if (on && !footPlaying && !reduce) {
          footPlaying = true;
          void foot.play().catch(() => undefined);
        } else if (!on && footPlaying) {
          footPlaying = false;
          foot.pause();
        }
        if (on) {
          const sc = Math.min(W / 1920, H / 1080) * (mobile ? 3 : 1);
          ftIn.style.transform = `scale(${fx(sc, 5)})`;
          ftRules.forEach((rule, k) => {
            const n = f((e - k * 0.04) / 0.26);
            rule.style.transform = rule.classList.contains("h") ? `scaleX(${fx(n, 3)})` : `scaleY(${fx(n, 3)})`;
          });
          ftRect.style.strokeDashoffset = fx(2884 * (1 - f((e - 0.1) / 0.42)), 1);
          ftFades.forEach((el, k) => {
            el.style.opacity = fx(f((e - 0.14 - k * 0.045) / 0.26), 3);
          });
          ftTagLines.forEach((ln, k) => {
            const n = m((e - 0.2 - k * 0.075) / 0.34);
            ln.style.transform = `translateY(${fx((1 - n) * 120, 1)}%)`;
          });
        }
      }

      /* -- chrome colour + rail */
      const lightKey = light ? "light" : "dark";
      if (lightKey !== lastVis) {
        lastVis = lightKey;
        ov.classList.toggle("on-light", light);
      }
      let activeRail = -1;
      railLinks.forEach((link, i) => {
        if (p >= link.at - 0.002) activeRail = i;
      });
      railLinks.forEach((link, i) => {
        const on = i === activeRail;
        if (on !== link.on) {
          link.on = on;
          link.el.classList.toggle("on", on);
        }
      });
    };

    /* ============================================================ */
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(64, now - last || 16.7);
      last = now;
      scroll.target = window.scrollY;
      if (reduce) {
        scroll.current = scroll.target;
      } else {
        const k = scroll.slow ? 0.085 : 0.3;
        const factor = 1 - Math.pow(1 - k, dt / 16.7);
        scroll.current += (scroll.target - scroll.current) * factor;
        if (Math.abs(scroll.target - scroll.current) < 0.5) {
          scroll.current = scroll.target;
          scroll.slow = false;
        }
      }
      const p = clamp(scroll.current / span());
      drive(p, now, dt);
    };

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    window.addEventListener("pointermove", onPointer, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      document.body.classList.remove("ft-on");
    };
  }, [stageRef, pinRef, bootedRef]);

  return engineRef.current;
}

/* ================================================================ */
/* App                                                              */
/* ================================================================ */

export default function App() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const bootedRef = useRef(false);
  const [booted, setBooted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [stageVh] = useState(() => (window.innerWidth <= 720 ? 2400 : 1800));
  const { containerRef, videoRef, canvasRef, canvasLive } = useVideoScrub(`${import.meta.env.BASE_URL}videos/hero-flow.mp4`);
  const engine = useStageEngine(stageRef, pinRef, bootedRef);

  /* boot: blurred still until the film can play */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const ready = () => {
      bootedRef.current = true;
      setBooted(true);
    };
    if (video.readyState >= 3) ready();
    else video.addEventListener("canplay", ready, { once: true });
    const cap = window.setTimeout(ready, 1400);
    return () => {
      video.removeEventListener("canplay", ready);
      window.clearTimeout(cap);
    };
  }, [videoRef]);

  /* menu: body class, escape key, scroll lock */
  useEffect(() => {
    document.body.classList.toggle("nav-open", menuOpen);
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const jump = (at: number) => (event: React.MouseEvent) => {
    event.preventDefault();
    setMenuOpen(false);
    engine.goTo(at);
  };

  const sendApplication = () => {
    const pin = pinRef.current;
    const name = (pin?.querySelector<HTMLInputElement>('[data-k="name"]')?.value || "").trim();
    const email = (pin?.querySelector<HTMLInputElement>('[data-k="email"]')?.value || "").trim();
    const note = (pin?.querySelector<HTMLTextAreaElement>('[data-k="note"]')?.value || "").trim();
    const subject = encodeURIComponent(`Application${name ? ` — ${name}` : ""}`);
    const body = encodeURIComponent(`${note}\n\n${name}${email ? ` · ${email}` : ""}`);
    window.location.href = `mailto:hello@somalabs.xyz?subject=${subject}&body=${body}`;
  };

  const videoSpanHeight = `calc(${TL.video * (stageVh - 100) + 100}vh)`;

  return (
    <div>
      <a href="#top" className="skip-link" onClick={jump(0)}>
        Back to start
      </a>

      <div ref={stageRef} className="stage" style={{ height: `${stageVh}vh` }} id="top">
        <div ref={containerRef} className="video-span" style={{ height: videoSpanHeight }} aria-hidden="true" />

        <div ref={pinRef} className="pin">
          {/* ------------------------------------------------ film */}
          <div className={`media ${booted ? "" : "boot"}`} aria-hidden="true">
            <video
              ref={videoRef}
              src={`${import.meta.env.BASE_URL}videos/hero-flow.mp4`}
              muted
              playsInline
              preload="auto"
              onLoadedMetadata={(event) => {
                const video = event.currentTarget;
                const canvas = canvasRef.current;
                if (canvas && video.videoWidth) {
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;
                }
              }}
            />
            <canvas ref={canvasRef} className={canvasLive ? "live" : ""} />
            <div className="media-shade" />
          </div>
          <p className={`boot-note ${booted ? "off" : ""}`} aria-hidden="true">
            Soma Labs · Reel 01 — Ink flow<b>Decoding</b>
          </p>

          <svg className="absolute h-0 w-0" aria-hidden="true">
            <defs>
              <filter id="inkf" x="-18%" y="-30%" width="136%" height="160%" colorInterpolationFilters="sRGB">
                <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="7" result="n" />
                <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.4 0 0 0 -0.7" result="na" />
                <feComponentTransfer in="na" result="mask">
                  <feFuncA id="inkf-alpha" type="linear" slope="4" intercept="1" />
                </feComponentTransfer>
                <feDisplacementMap id="inkf-disp" in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" result="d" />
                <feComposite in="d" in2="mask" operator="in" />
              </filter>
            </defs>
          </svg>

          {/* ---------------------------------------------- work */}
          <section className="scene pf" aria-hidden="true">
            <div className="pf-in">
              <svg className="pf-lines" viewBox="0 0 1328 3515" aria-hidden="true">
                <line className="axis" x1={AXIS_X} y1="0" x2={AXIS_X} y2="3515" />
                {Array.from({ length: 35 }, (_, k) => {
                  const y = (k * TRACK) / 34;
                  return <line className="tick" key={k} x1={AXIS_X} y1={y} x2={AXIS_X + 7} y2={y} />;
                })}
              </svg>
              <i className="pf-head">
                <b>0%</b>
              </i>
            </div>
            <p className="pf-num" aria-hidden="true" />
            <div className="pf-fix">
              {WORK.map((group, i) => (
                <div className="pf-g" key={group.chip} data-g={i}>
                  <span className="chip">{group.chip}</span>
                  <h2 className="pf-h">
                    <Lines lines={group.head} />
                  </h2>
                  <p className="pf-b">{group.body}</p>
                  {group.tags.length ? (
                    <div className="pf-tags">
                      {group.tags.map((tag) => (
                        <span className="chip" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          {/* --------------------------------------------- terms */}
          <section className="scene fin" aria-hidden="true">
            <div className="fin-paper">
              <img src={`${import.meta.env.BASE_URL}images/grid-1-invest.jpg`} alt="" />
            </div>
            <div className="fin-g" data-f="0">
              <div className="fin-top">
                <div className="fin-soak">
                  <h2 className="fin-h">
                    <Lines lines={["Patient capital,", "earliest conviction."]} />
                  </h2>
                </div>
              </div>
              <div className="fin-bot">
                <div className="fin-soak">
                  <p className="fin-l">We back generational founders turning deep technical differentiation into platforms with lasting, real-world impact.</p>
                  <div className="fin-row">
                    <span className="fin-chip">Full disclosure</span>
                    <p className="fin-s">
                      We don’t invest on market traction, but on a founder’s ability to build something the world has never seen. Pre-seed and seed, across Frontier AI, AI for Science, AI Infrastructure and Embodied Intelligence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="fin-g" data-f="1">
              <div className="fin-top">
                <div className="fin-soak">
                  <h2 className="fin-h">
                    <Lines lines={["More than", "capital."]} />
                  </h2>
                </div>
              </div>
              <div className="fin-bot">
                <div className="fin-soak">
                  <p className="fin-l">At the earliest stages the right support matters more than the size of the check: research and talent networks, fundraising, compute, and the foundations to build globally.</p>
                  <div className="fin-row">
                    <span className="fin-chip">What we provide</span>
                    <p className="fin-s">
                      University labs and talent networks across the US, Singapore and China. Investor narrative and introductions. Cloud credits and GPU infrastructure. Structuring, workspace, banking, legal and visa navigation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------------------------------- sign + faq */}
          <div className="scene sign" aria-hidden="true">
            <p>
              <span className="sg-a">Research-driven</span>
              <span className="sg-b">conviction.</span>
            </p>
          </div>
          <section className="scene faq" aria-hidden="true">
            {RESEARCH.map((area) => (
              <div className="fq" key={area.title}>
                <span className="fr" />
                <span className="st a">
                  <Star />
                </span>
                <span className="st b">
                  <Star />
                </span>
                <h3>{area.title}</h3>
                <p>{area.body}</p>
                <ul className="fq-list">
                  {area.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          {/* ---------------------------------------------- team */}
          <section className="scene team" aria-hidden="true">
            <div className="team-in">
              <div className="team-head">
                <span className="chip">Team</span>
                <h2>
                  <Lines lines={["Investment, business", "and legal."]} />
                </h2>
              </div>
              <div className="team-grid">
                {TEAM.map(([name, role], i) => (
                  <div className="team-item" key={name}>
                    <span className="num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="ln">
                      <i>{name}</i>
                    </span>
                    <p className="role">{role}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ------------------------------------------- contact */}
          <section className="scene cf" aria-hidden="true">
            <svg className="cf-orb" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <ellipse cx="500" cy="400" rx="520" ry="150" transform="rotate(-11 500 400)" style={{ "--adur": "9s", "--adl": "0s" } as CSSProperties} />
              <ellipse cx="500" cy="400" rx="600" ry="190" transform="rotate(-11 500 400)" style={{ "--adur": "11s", "--adl": "-3s" } as CSSProperties} />
              <ellipse cx="500" cy="400" rx="690" ry="235" transform="rotate(-11 500 400)" style={{ "--adur": "13s", "--adl": "-6s" } as CSSProperties} />
            </svg>
            <div className="cf-gl" aria-hidden="true">
              {Array.from({ length: 14 }, (_, i) => {
                const ang = i * 0.87;
                const rad = 0.28 + (i % 4) * 0.09;
                return (
                  <i
                    key={i}
                    style={{
                      left: `${50 + Math.cos(ang) * rad * 100 * 0.9}%`,
                      top: `${50 + Math.sin(ang) * rad * 100 * 0.42}%`,
                      "--dur": `${1.9 + (i % 7) * 0.42}s`,
                      "--dl": `${-(i * 0.53) % 3}s`,
                    } as CSSProperties}
                  />
                );
              })}
            </div>
            <div className="cf-lead">
              <b>The application</b>
              <p>Tell us what you’re building and where you want to take it. Every note is read, and when the thesis fits we answer within a week.</p>
            </div>
            <div className="cf-in">
              <div className="cf-f pill" style={{ left: 452, top: 148, width: 236, height: 62 }} data-fly="-45.5,-2.4,-159,3">
                <span className="ic">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                </span>
                <input data-k="name" type="text" placeholder="Your name" autoComplete="name" />
              </div>
              <div className="cf-f pill" style={{ left: 712, top: 148, width: 236, height: 62 }} data-fly="103.4,3.4,-166,2.06">
                <span className="ic">
                  <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m3 7 9 6 9-6" /></svg>
                </span>
                <input data-k="email" type="email" placeholder="Work email" autoComplete="email" />
              </div>
              <div className="cf-f" style={{ left: 452, top: 226, width: 496, height: 226 }} data-fly="-63.5,24.6,-173,-0.48">
                <span className="ic">
                  <svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z" /></svg>
                </span>
                <textarea data-k="note" rows={4} placeholder="What are you building?" />
              </div>
              <button type="button" className="cf-cta" style={{ left: 452, top: 478, width: 496, height: 52 }} data-fly="0,40,-150,0" onClick={sendApplication}>
                Send the application
              </button>
              <p className="cf-meta" data-fly="0,30,-120,0">
                Or write to <a href="mailto:hello@somalabs.xyz">hello@somalabs.xyz</a>
              </p>
            </div>
          </section>

          {/* -------------------------------------------- footer */}
          <video className="foot" src={`${import.meta.env.BASE_URL}videos/pillars-settle.mp4`} muted loop playsInline preload="metadata" aria-hidden="true" />
          <div className="foot-veil" aria-hidden="true" />
          <footer className="scene ft" aria-hidden="true">
            <div className="ft-in">
              <i className="ft-r h" style={{ top: 125 }} />
              <i className="ft-r h" style={{ top: 982 }} />
              <i className="ft-r v" style={{ left: 675 }} />
              <i className="ft-r v" style={{ left: 1262 }} />
              <svg className="ft-box" viewBox="0 0 587 857" aria-hidden="true">
                <rect x="0.5" y="0.5" width="586" height="856" />
              </svg>
              <i className="ft-st ft-fade" style={{ left: 675, top: 125 }}>
                <Star />
              </i>
              <i className="ft-st ft-fade" style={{ left: 1262, top: 982 }}>
                <Star />
              </i>
              <div className="ft-mark ft-fade">soma</div>
              <p className="ft-tag">
                <Lines lines={["Backing founders at the", "frontier of AI and science."]} />
              </p>
              <p className="ft-meta l ft-fade">Soma Labs Ventures Ltd · Singapore</p>
              <p className="ft-meta r ft-fade">
                <a href="mailto:hello@somalabs.xyz">hello@somalabs.xyz</a>
              </p>
              <div className="ft-links ft-fade">
                <a href="https://www.linkedin.com/company/soma-labs-ventures" target="_blank" rel="noreferrer">LinkedIn</a>
                <a href="https://x.com/somalabs_" target="_blank" rel="noreferrer">X</a>
                <a href="https://somalabs.xyz/privacy" target="_blank" rel="noreferrer">Privacy</a>
                <a href="https://somalabs.xyz/terms" target="_blank" rel="noreferrer">Terms</a>
              </div>
            </div>
          </footer>

          {/* ---------------------------------- menu veil (in pin) */}
          <div className="nvs" aria-hidden="true" />

          {/* ------------------------------------- overlay / beats */}
          <div className="ov on-light">
            <span className="gv" style={{ left: "var(--v1)" }}><i /></span>
            <span className="gv" style={{ left: "var(--v2)" }}><i /></span>
            <span className="gh" style={{ top: "var(--h1)" }}><i /></span>
            <span className="gh gh--d" style={{ top: "var(--h2)" }}><i /></span>
            <span className="fill" aria-hidden="true" />
            <i className="gx gx--d" style={{ left: "var(--v1)", top: "var(--h2)", "--gd": "1.05s" } as CSSProperties}><span><Star /></span></i>
            <i className="gx gx--d" style={{ left: "var(--v2)", top: "var(--h2)", "--gd": "1.18s" } as CSSProperties}><span><Star /></span></i>
            <i className="gx" style={{ left: "var(--v1)", top: "var(--h1)", "--gd": "0.9s" } as CSSProperties}><span><Star /></span></i>
            <i className="gx" style={{ left: "var(--v2)", top: "var(--h1)", "--gd": "1s" } as CSSProperties}><span><Star /></span></i>

            <a className="mark" href="#top" onClick={jump(0)} aria-label="Soma Labs">
              <span className="wordmark">soma</span>
              <em>Labs</em>
            </a>
            <button type="button" className="menu" onClick={() => setMenuOpen(true)} aria-label="Menu" aria-expanded={menuOpen}>
              <span /><span /><span /><span />
            </button>
            <nav className="hdr" aria-label="Primary navigation">
              {HEADER_NAV.map((item) => (
                <a key={item.label} href="#top" onClick={jump(item.at)}>{item.label}</a>
              ))}
              <a className="apply" href="#top" onClick={jump(RAIL[5].at)}>
                Get in touch <span className="arw">→</span>
              </a>
            </nav>
            <nav className="rail" aria-label="Chapters">
              {RAIL.map((item) => (
                <a key={item.label} href="#top" data-at={item.at} onClick={jump(item.at)}>
                  <i />
                  <em>{item.label}</em>
                </a>
              ))}
            </nav>

            <div className="col-head">
              {BEATS.map((beat, i) => (
                <div className="bk" data-beat={i} key={beat.tag}>
                  {i === 0 ? (
                    <>
                      <h1>
                        <Lines lines={beat.head} />
                      </h1>
                      <p className="subhead">
                        <Lines lines={beat.sub ?? []} />
                      </p>
                      <a className="cta" href="#top" onClick={jump(RAIL[5].at)}>
                        <span className="face">
                          Request partnership <span className="arw">→</span>
                        </span>
                        <span className="flood" aria-hidden="true">
                          <span className="face">
                            Request partnership <span className="arw">→</span>
                          </span>
                        </span>
                      </a>
                    </>
                  ) : (
                    <h2 className="beat">
                      <Lines lines={beat.head} />
                    </h2>
                  )}
                </div>
              ))}
            </div>
            <div className="col-stand">
              {BEATS.map((beat, i) => (
                <div className="bk" data-beat={i} key={beat.tag}>
                  <p className="stand">
                    <Chars text={beat.stand} />
                  </p>
                </div>
              ))}
            </div>
            <span className="tag" aria-hidden="true" />
            {Object.entries(DIAGRAMS).map(([i, node]) => (
              <div className="diagram" data-beat={i} key={i} aria-hidden="true">
                {node}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ menu */}
      <div className="nvm" aria-hidden={!menuOpen} id="nvm">
        <button type="button" className="nvm-close" onClick={() => setMenuOpen(false)} aria-label="Close menu" tabIndex={menuOpen ? 0 : -1}>
          <X size={18} strokeWidth={1.5} />
        </button>
        {RAIL.map((item, index) => (
          <a key={item.label} href="#top" onClick={jump(item.at)} style={{ transitionDelay: menuOpen ? `${120 + index * 70}ms` : "0ms" }} tabIndex={menuOpen ? 0 : -1}>
            <b>0{index + 1}</b>
            <em>{item.label}</em>
          </a>
        ))}
      </div>
    </div>
  );
}
