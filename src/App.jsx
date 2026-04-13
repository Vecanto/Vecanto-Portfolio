import { useState, useEffect, useRef, useCallback } from "react";
import ideaImage from '/idea.png';

/* ─── GLOBAL STYLES ─────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700;800&family=Epilogue:ital,wght@0,300;0,400;1,300&display=swap');

  :root {
    --bg: #060606; --fg: #f0ece4; --accent: #c8f04f;
    --muted: #555; --border: #1e1e1e; --card: #0d0d0d;
    --max: 1280px; --pad: clamp(1.5rem, 5vw, 4rem);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg); color: var(--fg);
    font-family: 'Epilogue', sans-serif; font-weight: 300;
    overflow-x: hidden; cursor: none; font-size: 16px; line-height: 1.6;
  }

  body::before {
    content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 180px; opacity: .028;
  }

  /* TEXT FLIP ANIMATION */
  @keyframes flipOut {
    0%   { transform: translateY(0%); opacity: 1; }
    100% { transform: translateY(-115%); opacity: 0; }
  }
  @keyframes flipIn {
    0%   { transform: translateY(115%); opacity: 0; }
    100% { transform: translateY(0%); opacity: 1; }
  }
  @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.2} }
  @keyframes spulse  { 0%,100%{opacity:.25} 50%{opacity:1} }
  @keyframes tickmove { to { transform: translateX(-50%); } }
  @keyframes slideup { to { transform: translateY(0); } }
  @keyframes fadeup  { to { opacity: 1; } }

  /* CURSOR */
  .c-dot, .c-ring {
    position: fixed; border-radius: 50%; pointer-events: none;
    transform: translate(-50%, -50%); z-index: 9999;
    transition: width .25s, height .25s;
  }
  .c-dot  { width: 10px; height: 10px; background: var(--accent); z-index: 9999; }
  .c-ring { width: 36px; height: 36px; border: 1px solid rgba(200,240,79,.3); z-index: 9998; }
  .c-dot.big  { width: 5px;  height: 5px; }
  .c-ring.big { width: 52px; height: 52px; border-color: rgba(200,240,79,.65); }

  /* WRAP */
  .wrap { width: 100%; max-width: var(--max); margin: 0 auto; padding-left: var(--pad); padding-right: var(--pad); }

  /* NAV */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
    background: rgba(6,6,6,.8); border-bottom: 1px solid var(--border);
  }
  .nav-inner {
    max-width: var(--max); margin: 0 auto; padding: 1.1rem var(--pad);
    display: flex; align-items: center; justify-content: space-between;
  }
  .nav-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.05rem; letter-spacing: -.02em; color: var(--fg); text-decoration: none; }
  .nav-logo em { color: var(--accent); font-style: normal; }
  .nav-links { display: flex; gap: 2rem; list-style: none; }
  .nav-links a { color: var(--muted); font-size: .75rem; text-decoration: none; letter-spacing: .1em; text-transform: uppercase; transition: color .3s; }
  .nav-links a:hover { color: var(--fg); }
  .nav-avail { display: flex; align-items: center; gap: .45rem; font-size: .7rem; color: var(--muted); letter-spacing: .08em; text-transform: uppercase; }
  .pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: blink 2s ease infinite; }

  /* HERO */
  .hero {
    position: relative; min-height: 100svh; overflow: hidden;
    display: flex; flex-direction: column; justify-content: flex-end; padding-top: 64px;
  }
  .hero-inner { max-width: var(--max); margin: 0 auto; width: 100%; padding: 0 var(--pad) clamp(2.5rem,6vh,5rem); }
  .hero-tag {
    display: inline-flex; 
    align-items: center; 
    gap: 1rem;
    font-size: .7rem; 
    letter-spacing: .18em; 
    text-transform: uppercase; 
    color: var(--accent);
    margin-bottom: clamp(.75rem,2.5vh,1.75rem);
    opacity: 0; 
    animation: fadeup .7s ease .15s forwards;
  }
  .hero-tag::before { content: ''; width: 18px; height: 1px; background: var(--accent); flex-shrink: 0; }
  .hero-h1 {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: clamp(3rem,8.5vw,6.5rem); line-height: .93; letter-spacing: -.04em;
    margin-bottom: clamp(1.5rem,3.5vh,3rem);
  }
  .hero-ln  { display: block; overflow: hidden; }
  .hero-ln span { display: block; transform: translateY(110%); animation: slideup .85s cubic-bezier(.16,1,.3,1) forwards; }
  .hero-ln:nth-child(1) span { animation-delay: .28s; }
  .hero-ln:nth-child(2) span { animation-delay: .42s; }
  .hero-ln:nth-child(3) span { animation-delay: .56s; }
  .hero-foot {
    display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem;
    border-top: 1px solid var(--border); padding-top: 1.5rem;
    opacity: 0; animation: fadeup .8s ease .85s forwards;
  }
  .hero-desc { max-width: 340px; font-size: .93rem; line-height: 1.75; color: rgba(240,236,228,.5); }
  .hero-scroll { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: .55rem; font-size: .63rem; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
  .s-line { width: 1px; height: 48px; background: linear-gradient(to bottom, transparent, var(--accent)); animation: spulse 2.2s ease infinite; }
  .hero-bg-num {
    position: absolute; right: var(--pad); bottom: clamp(2.5rem,6vh,5rem);
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: clamp(7rem,16vw,16rem); line-height: 1; letter-spacing: -.06em;
    color: transparent; -webkit-text-stroke: 1px var(--border);
    pointer-events: none; user-select: none;
    opacity: 0; animation: fadeup 1.2s ease 1s forwards;
  }

  /* TEXT FLIP WIDGET */
  .flip-wrap { display: inline-block; overflow: hidden; vertical-align: bottom; position: relative; }
  .flip-word {
    display: block; color: var(--accent);
    font-style: italic; font-family: 'Epilogue', sans-serif; font-weight: 300;
    white-space: nowrap;
  }
  .flip-word.exit  { animation: flipOut .48s cubic-bezier(.4,0,.6,1) forwards; }
  .flip-word.enter { animation: flipIn  .48s cubic-bezier(.4,0,.6,1) forwards; }

  /* TICKER */
  .ticker { overflow: hidden; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: var(--card); padding: .75rem 0; }
  .ticker-track { display: flex; width: max-content; animation: tickmove 28s linear infinite; }
  .ticker-track:hover { animation-play-state: paused; }
  .ticker-item { white-space: nowrap; padding: 0 1.75rem; font-family: 'Syne', sans-serif; font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); display: inline-flex; align-items: center; gap: 1.75rem; }
  .ticker-item::after { content: '✦'; color: var(--accent); font-size: .52rem; }

  /* SECTION */
  .sec { padding: clamp(4rem,9vh,8rem) 0; position: relative; z-index: 1; }
  .sec-label { display: flex; align-items: center; gap: .6rem; font-size: .68rem; letter-spacing: .2em; text-transform: uppercase; color: var(--accent); margin-bottom: .85rem; }
  .sec-label::before { content: ''; width: 18px; height: 1px; background: var(--accent); flex-shrink: 0; }
  .sec-h { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(2.1rem,4.5vw,4rem); line-height: 1.02; letter-spacing: -.04em; }

  /* ABOUT */
  .about-grid { display: grid; grid-template-columns: 1fr min(42%,460px); gap: clamp(2.5rem,6vw,6rem); align-items: center; }
  .about-text { color: rgba(240,236,228,.55); line-height: 1.8; font-size: .93rem; margin-bottom: 1.1rem; }
  .skills { display: grid; grid-template-columns: 1fr 1fr; gap: .55rem; margin-top: 1.75rem; }
  .sk { border: 1px solid var(--border); padding: .42rem .8rem; font-size: .72rem; letter-spacing: .07em; text-transform: uppercase; color: var(--muted); transition: border-color .3s, color .3s; cursor: default; }
  .sk:hover { border-color: var(--accent); color: var(--accent); }
  .about-img-wrap { aspect-ratio: 4/5; background: var(--card); border: 1px solid var(--border); position: relative; overflow: hidden; }
  .about-img-wrap::after { content: ''; position: absolute; inset: 0; background: linear-gradient(140deg,rgba(200,240,79,.07),transparent 55%); }
  .about-ph { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .65rem; color: var(--muted); font-size: .72rem; letter-spacing: .1em; text-transform: uppercase; }
  .about-ph-icon { font-size: 2.2rem; opacity: .1; }
  .yr-badge { position: absolute; bottom: 0; left: 0; background: var(--accent); color: var(--bg); padding: .9rem 1.1rem; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.8rem; line-height: 1; }
  .yr-badge small { display: block; font-size: .58rem; font-weight: 400; letter-spacing: .1em; text-transform: uppercase; margin-top: .2rem; }

  /* STATS */
  .stats-bar { border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: var(--card); }
  .stats-inner { display: grid; grid-template-columns: repeat(4,1fr); }
  .stat { padding: clamp(1.75rem,4vh,3.25rem) clamp(1rem,2.5vw,2.5rem); text-align: center; border-right: 1px solid var(--border); }
  .stat:last-child { border-right: none; }
  .stat-n { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(2.2rem,4.5vw,4.2rem); line-height: 1; color: var(--accent); display: block; letter-spacing: -.05em; }
  .stat-l { font-size: .68rem; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); margin-top: .55rem; display: block; }

  /* WORK */
  .work-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; margin-bottom: clamp(1.75rem,4vh,3.5rem); }
  .work-count { font-size: .78rem; color: var(--muted); letter-spacing: .06em; padding-bottom: .35rem; }
  .proj { display: grid; grid-template-columns: 52px 1fr auto; align-items: center; gap: clamp(.85rem,2.5vw,2.5rem); padding: clamp(1.1rem,2.5vh,1.85rem) 0; border-bottom: 1px solid var(--border); cursor: pointer; position: relative; overflow: hidden; }
  .proj::after { content: ''; position: absolute; left: 0; bottom: -1px; width: 0; height: 1px; background: var(--accent); transition: width .55s cubic-bezier(.16,1,.3,1); }
  .proj:hover::after { width: 100%; }
  .proj:hover .proj-title { color: var(--accent); }
  .proj-n { font-family: 'Syne', sans-serif; font-weight: 800; font-size: .72rem; color: var(--muted); letter-spacing: .07em; }
  .proj-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: clamp(1rem,2.2vw,1.7rem); letter-spacing: -.02em; margin-bottom: .28rem; transition: color .3s; text-align: left; }
  .proj-tags { display: flex; gap: .35rem; flex-wrap: wrap; }
  .proj-tag { font-size: .64rem; letter-spacing: .07em; text-transform: uppercase; color: var(--muted); border: 1px solid var(--border); padding: .15rem .5rem; }
  .proj-arrow { font-size: 1.2rem; color: var(--muted); flex-shrink: 0; transition: transform .35s cubic-bezier(.16,1,.3,1), color .3s; }
  .proj:hover .proj-arrow { transform: translate(3px,-3px); color: var(--accent); }

  /* SERVICES */
  .svc-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); margin-top: clamp(1.75rem,4vh,3.5rem); }
  .svc-card { background: var(--card); padding: clamp(1.5rem,3vw,2.25rem); position: relative; overflow: hidden; transition: background .35s; }
  .svc-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--accent); transform: scaleX(0); transform-origin: left; transition: transform .45s cubic-bezier(.16,1,.3,1); }
  .svc-card:hover { background: var(--bg); }
  .svc-card:hover::before { transform: scaleX(1); }
  .svc-n { font-family: 'Syne', sans-serif; font-weight: 800; font-size: .68rem; letter-spacing: .12em; color: var(--accent); margin-bottom: 1.25rem; display: block; }
  .svc-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: clamp(1rem,1.6vw,1.2rem); letter-spacing: -.02em; margin-bottom: .75rem; }
  .svc-desc { color: rgba(240,236,228,.42); font-size: .86rem; line-height: 1.75; }

  /* PROCESS */
  .proc-sec { background: var(--card); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .proc-steps { display: grid; grid-template-columns: repeat(4,1fr); margin-top: clamp(1.75rem,4vh,3.5rem); }
  .p-step { padding: clamp(1.25rem,2.5vw,2.25rem) clamp(.85rem,1.75vw,1.75rem); border-left: 1px solid var(--border); }
  .p-step:first-child { border-left: none; padding-left: 0; }
  .p-icon { font-size: 1.35rem; opacity: .45; margin-bottom: 1.1rem; display: block; }
  .p-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: clamp(.9rem,1.2vw,1rem); letter-spacing: -.01em; margin-bottom: .55rem; }
  .p-desc { color: rgba(240,236,228,.38); font-size: .82rem; line-height: 1.72; }

  /* CTA */
  .cta-sec { text-align: center; position: relative; overflow: hidden; }
  .cta-bg { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(5rem,14vw,14rem); letter-spacing: -.08em; color: transparent; -webkit-text-stroke: 1px var(--border); pointer-events: none; user-select: none; white-space: nowrap; line-height: 1; }
  .cta-tag { font-size: .68rem; letter-spacing: .2em; text-transform: uppercase; color: var(--accent); margin-bottom: .85rem; display: block; position: relative; z-index: 1; }
  .cta-h { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(2.5rem,6.5vw,6rem); line-height: .97; letter-spacing: -.05em; margin-bottom: clamp(1.75rem,4vh,3rem); position: relative; z-index: 1; }
  .cta-btns { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: .85rem; flex-wrap: wrap; }
  .btn { display: inline-flex; align-items: center; gap: .7rem; font-family: 'Syne', sans-serif; font-weight: 700; font-size: .8rem; letter-spacing: .08em; text-transform: uppercase; text-decoration: none; padding: .9rem 1.85rem; cursor: none; transition: transform .3s cubic-bezier(.16,1,.3,1), background .3s; border: none; }
  .btn-fill { background: var(--accent); color: var(--bg); }
  .btn-fill:hover { background: var(--fg); transform: scale(1.04); }
  .btn-line { background: transparent; color: var(--fg); border: 1px solid var(--border); }
  .btn-line:hover { border-color: var(--muted); background: rgba(255,255,255,.04); transform: scale(1.02); }
  .btn-arr { display: inline-block; transition: transform .3s; }
  .btn-fill:hover .btn-arr, .btn-line:hover .btn-arr { transform: translate(3px,-3px); }

  /* FOOTER */
  footer { border-top: 1px solid var(--border); }
  .foot-inner { max-width: var(--max); margin: 0 auto; padding: 1.75rem var(--pad); display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; }
  .foot-copy { font-size: .75rem; color: var(--muted); letter-spacing: .04em; }
  .foot-links { display: flex; gap: 1.5rem; }
  .foot-links a { font-size: .72rem; color: var(--muted); text-decoration: none; letter-spacing: .08em; text-transform: uppercase; transition: color .3s; }
  .foot-links a:hover { color: var(--accent); }

  /* REVEAL */
  .r { opacity: 0; transform: translateY(28px); transition: opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1); }
  .r.on { opacity: 1; transform: none; }
  .r.d1 { transition-delay: .1s; } .r.d2 { transition-delay: .2s; } .r.d3 { transition-delay: .3s; } .r.d4 { transition-delay: .4s; }

  /* RESPONSIVE */
  @media(max-width:1024px) {
    .about-grid { grid-template-columns: 1fr; }
    .about-img-col { display: none; }
    .proc-steps { grid-template-columns: 1fr 1fr; }
    .p-step:nth-child(2) { border-left: 1px solid var(--border); }
    .p-step:nth-child(1), .p-step:nth-child(2) { border-bottom: 1px solid var(--border); }
    .p-step:nth-child(2) { padding-left: clamp(.85rem,1.75vw,1.75rem); }
  }
  @media(max-width:768px) {
    .nav-links, .nav-avail { display: none; }
    .stats-inner { grid-template-columns: 1fr 1fr; }
    .stat { border-bottom: 1px solid var(--border); }
    .stat:nth-child(odd) { border-right: 1px solid var(--border); }
    .stat:nth-child(even) { border-right: none; }
    .stat:nth-child(3), .stat:nth-child(4) { border-bottom: none; }
    .svc-grid { grid-template-columns: 1fr; }
    .work-head { flex-direction: column; align-items: flex-start; gap: .5rem; }
    .proj { grid-template-columns: 40px 1fr auto; gap: .85rem; }
  }
  @media(max-width:520px) {
    .proc-steps { grid-template-columns: 1fr; }
    .p-step { border-left: none !important; border-bottom: 1px solid var(--border) !important; padding-left: 0 !important; }
    .p-step:last-child { border-bottom: none !important; }
    .hero-foot { flex-direction: column; gap: 1.25rem; align-items: flex-start; }
    .hero-scroll { flex-direction: row; }
    .s-line { width: 36px; height: 1px; background: linear-gradient(to right, transparent, var(--accent)); }
    .cta-btns { flex-direction: column; align-items: stretch; }
    .btn { justify-content: center; }
    .foot-inner { flex-direction: column; align-items: flex-start; gap: 1rem; }
  }
`;

/* ─── TEXT FLIP COMPONENT ───────────────────────────────────── */
/*
  How it works:
  - Renders two stacked words in a clipped container (overflow: hidden)
  - The "current" word plays flipOut: slides up and disappears above
  - The "next" word plays flipIn: slides up from below into view
  - After animation completes, state settles so only one word is "active"
*/
function TextFlip({ words, interval = 2600 }) {
  const [index, setIndex]     = useState(0);
  const [phase, setPhase]     = useState("idle"); // "idle" | "animating"
  const [nextIdx, setNextIdx] = useState(1 % words.length);
  const settleRef             = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const ni = (index + 1) % words.length;
      setNextIdx(ni);
      setPhase("animating");
      settleRef.current = setTimeout(() => {
        setIndex(ni);
        setPhase("idle");
      }, 520);
    }, interval);
    return () => {
      clearInterval(timer);
      clearTimeout(settleRef.current);
    };
  }, [index, words, interval]);

  const isAnimating = phase === "animating";

  return (
    <span className="flip-wrap">
      {/* Current word — slides OUT upward when animating */}
      <span
        className={`flip-word${isAnimating ? " exit" : ""}`}
        style={{ position: isAnimating ? "absolute" : "relative", top: 0, left: 0, width: "100%" }}
      >
        {words[index]}
      </span>

      {/* Next word — slides IN from below when animating */}
      {isAnimating && (
        <span className="flip-word enter" style={{ display: "block" }}>
          {words[nextIdx]}
        </span>
      )}
    </span>
  );
}

/* ─── CUSTOM CURSOR ─────────────────────────────────────────── */
function Cursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const pos     = useRef({ x: 0, y: 0, rx: 0, ry: 0 });
  const hovRef  = useRef(false);

  useEffect(() => {
    const onMove = (e) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + "px";
        dotRef.current.style.top  = e.clientY + "px";
      }
    };

    const onOver = (e) => {
      const isLink = e.target.closest("a, button");
      hovRef.current = !!isLink;
      if (dotRef.current)  dotRef.current.classList.toggle("big",  !!isLink);
      if (ringRef.current) ringRef.current.classList.toggle("big", !!isLink);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);

    let raf;
    const loop = () => {
      pos.current.rx += (pos.current.x - pos.current.rx) * 0.11;
      pos.current.ry += (pos.current.y - pos.current.ry) * 0.11;
      if (ringRef.current) {
        ringRef.current.style.left = pos.current.rx + "px";
        ringRef.current.style.top  = pos.current.ry + "px";
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="c-dot" />
      <div ref={ringRef} className="c-ring" />
    </>
  );
}

/* ─── SCROLL REVEAL HOOK ────────────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ─── REVEAL WRAPPER ────────────────────────────────────────── */
function R({ children, delay = 0, style = {}, className = "", tag = "div" }) {
  const [ref, visible] = useReveal();
  const Component = tag;

  return (
    <Component
      ref={ref}
      className={`r${visible ? " on" : ""}${delay ? ` d${delay}` : ""} ${className}`}
      style={style}
    >
      {children}
    </Component>
  );
}

/* ─── STAT COUNTER ──────────────────────────────────────────── */
function StatCounter({ value, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, visible]    = useReveal();
  const started           = useRef(false);

  useEffect(() => {
    if (!visible || started.current) return;
    started.current = true;
    const dur = 1600, t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(ease * value));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, value]);

  return (
    <span ref={ref} className="stat-n">
      {typeof value === "number" ? count + suffix : value}
    </span>
  );
}

/* ─── SCRAMBLE HOOK ─────────────────────────────────────────── */
function useScramble(original) {
  const [text, setText] = useState(original);
  const timerRef = useRef(null);
  const CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%";

  const scramble = useCallback(() => {
    clearInterval(timerRef.current);
    let i = 0;
    timerRef.current = setInterval(() => {
      setText(
        original.split("").map((c, j) => {
          if (c === " ") return " ";
          if (j < i) return original[j];
          return CH[Math.floor(Math.random() * CH.length)];
        }).join("")
      );
      if (i >= original.length) {
        clearInterval(timerRef.current);
        setText(original);
      }
      i += 1.6;
    }, 30);
  }, [original]);

  useEffect(() => () => clearInterval(timerRef.current), []);
  return [text, scramble];
}

/* ─── PROJECT ROW ───────────────────────────────────────────── */
function ProjectRow({ num, title, tags, delay = 0, link = "#" }) {
  const [scrambled, scramble] = useScramble(title);
  return (
    <R delay={delay}>
      <a href={link} className="proj" onMouseEnter={scramble} style={{ textDecoration: "none", color: "inherit" }}>
        <span className="proj-n">{num}</span>
        <div>
          <div className="proj-title">{scrambled}</div>
          <div className="proj-tags">
            {tags.map((t) => <span key={t} className="proj-tag">{t}</span>)}
          </div>
        </div>
        <span className="proj-arrow">↗</span>
      </a>
    </R>
  );
}

/* ─── TICKER ITEMS ──────────────────────────────────────────── */
const TICKER = ["UI Design","Web Development","Motion Design","Brand Identity","User Experience","Creative Direction","Frontend Engineering","Digital Products"];

/* ─── MAIN APP ──────────────────────────────────────────────── */
export default function App() {
  return (
    <>
      {/* Inject global CSS */}
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <Cursor />

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-inner">
          <a className="nav-logo" href="#">NR<em>.</em></a>
          <ul className="nav-links">
            {["About","Work","Services","Contact"].map(l => (
              <li key={l}><a href={`#${l.toLowerCase()}`}>{l}</a></li>
            ))}
          </ul>
          <div className="nav-avail">
            <div className="pulse-dot" />
            Available for work
          </div>
        </div>
      </nav>
      
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-tag">
            Creative&nbsp;
            <TextFlip words={["Developer","Designer","Director","Thinker"]} interval={2800} />
          </div>

          <h1 className="hero-h1">
            <span className="hero-ln"><span>Crafting</span></span>
            <span className="hero-ln">
              <span>
                Digital&nbsp;
                <TextFlip words={["Magic","Wonder","Futures","Dreams"]} interval={3200} />
              </span>
            </span>
            <span className="hero-ln"><span>Experiences.</span></span>
          </h1>

          <div className="hero-foot">
            <p className="hero-desc">
              I design and build digital products that live at the intersection of art and
              technology — experiences that feel as good as they look.
            </p>
            <div className="hero-scroll">
              <div className="s-line" />
              <span>Scroll</span>
            </div>
          </div>
        </div>
        <div className="hero-bg-num" aria-hidden="true">01</div>
      </section>

      {/* ── TICKER ── */}
      <div className="ticker">
        <div className="ticker-track">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="ticker-item">{t}</span>
          ))}
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section id="about" className="sec">
        <div className="wrap">
          <div className="about-grid">
            <div>
              <R><div className="sec-label">About Me</div></R>
              <R delay={1}>
                <h2 className="sec-h" style={{ marginBottom: "clamp(1rem,2.5vh,1.75rem)" }}>
                  I build things<br />
                  that <span style={{ color: "var(--accent)" }}>matter.</span>
                </h2>
              </R>
              <R delay={2}>
                <p className="about-text">
                  With over 5 years of experience in digital design and development, I've been
                  helping brands and startups create meaningful digital presences. My approach
                  blends aesthetic sensibility with technical precision.
                </p>
              </R>
              <R delay={2}>
                <p className="about-text">
                  I believe great design is invisible — it just works. Every pixel, every
                  interaction, every line of code serves a purpose.
                </p>
              </R>
              <R delay={3}>
                <div className="skills">
                  {["React / Next.js","Figma / Motion","Three.js / GSAP","Node / APIs","TypeScript","CSS / Animation"].map(s => (
                    <div key={s} className="sk">{s}</div>
                  ))}
                </div>
              </R>
            </div>

            <R delay={2} className="about-img-col" style={{ position: "relative" }}>
              <div className="about-img-wrap">
                <img 
                  src={ideaImage} 
                  alt="Profile Photo" 
                  className="about-photo"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                />
              </div>
              <div className="yr-badge">5+<small>Years Exp.</small></div>
            </R>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="stats-bar">
        <div className="stats-inner">
          {[
            { val: 42,  label: "Projects Done" },
            { val: 28,  label: "Happy Clients" },
            { val: 5,   label: "Years Experience" },
            { val: "∞", label: "Coffee Consumed" },
          ].map(({ val, label }) => (
            <div key={label} className="stat">
              {typeof val === "number"
                ? <StatCounter value={val} />
                : <span className="stat-n">{val}</span>
              }
              <span className="stat-l">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── WORK ── */}
      <section id="work" className="sec">
        <div className="wrap">
          <div className="work-head">
            <div>
              <R><div className="sec-label">Selected Work</div></R>
              <R delay={1}><h2 className="sec-h">Projects<br />that ship.</h2></R>
            </div>
            <R><span className="work-count">10 Projects</span></R>
          </div>
          <div>
            <ProjectRow num="01" title="Lumino Design System" tags={["Figma","React","Storybook"]} link="https://yourwebsite.com/lumino" />
            <ProjectRow num="02" title="Orbit SaaS Dashboard"  tags={["Next.js","Tailwind","Recharts"]} delay={1} link="https://yourwebsite.com/orbit" /> 
            <ProjectRow num="03" title="Nōrd Brand Identity"   tags={["Branding","Motion","Web"]} delay={2} link="https://yourwebsite.com/nord" />
            <ProjectRow num="04" title="My E-Commerce Project" tags={["Next.js","Fashion","Real Life"]} delay={3} link="https://yourwebsite.com/flux" />
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="sec">
        <div className="wrap">
          <R><div className="sec-label">What I Do</div></R>
          <R delay={1}>
            <h2 className="sec-h">
              Services built<br />
              for <span style={{ color: "var(--accent)" }}>impact.</span>
            </h2>
          </R>
          <div className="svc-grid">
            {[
              { n: "01", title: "UI / UX Design",      desc: "From wireframes to pixel-perfect interfaces. I design experiences that delight users and drive real results." },
              { n: "02", title: "Web Development",      desc: "Modern, performant web applications built with the latest technologies. Clean code, fast loads, smooth animations." },
              { n: "03", title: "Creative Direction",   desc: "Strategic visual thinking for brands that want to stand out. Identity systems, design languages, campaigns." },
            ].map(({ n, title, desc }, i) => (
              <R key={n} delay={i}>
                <div className="svc-card">
                  <span className="svc-n">{n}</span>
                  <div className="svc-title">{title}</div>
                  <p className="svc-desc">{desc}</p>
                </div>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section id="process" className="sec proc-sec">
        <div className="wrap">
          <R><div className="sec-label">How I Work</div></R>
          <R delay={1}><h2 className="sec-h">A process<br />that delivers.</h2></R>
          <div className="proc-steps">
            {[
              { icon: "◎", title: "01 — Discover", desc: "Deep dive into your goals, audience, and competitive landscape to understand what really matters." },
              { icon: "△", title: "02 — Define",   desc: "Turn insights into strategy. Clear objectives, metrics, and a creative direction before anything is built." },
              { icon: "□", title: "03 — Design",   desc: "Rapid prototyping and iteration. You're involved throughout — no big reveals, just collaborative progress." },
              { icon: "✦", title: "04 — Deliver",  desc: "Polished, production-ready work. Clean handoff, full documentation, and support when you need it." },
            ].map(({ icon, title, desc }, i) => (
              <R key={title} delay={i}>
                <div className="p-step">
                  <span className="p-icon">{icon}</span>
                  <div className="p-title">{title}</div>
                  <p className="p-desc">{desc}</p>
                </div>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="contact" className="sec cta-sec">
        <div className="cta-bg" aria-hidden="true">LET'S TALK</div>
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <R><span className="cta-tag">Let's Collaborate</span></R>
          <R delay={1}>
            <h2 className="cta-h">
              Got a project<br />
              in <span style={{ color: "var(--accent)" }}>mind?</span>
            </h2>
          </R>
          <R delay={2}>
            <div className="cta-btns">
              <a href="navedrana982@gmail.com" className="btn btn-fill">
                Start a conversation <span className="btn-arr">↗</span>
              </a>
              <a href="#work" className="btn btn-line">
                See my work <span className="btn-arr">↗</span>
              </a>
            </div>
          </R>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="foot-inner">
          <span className="foot-copy">© 2025 Naved Rana — All rights reserved</span>
          <div className="foot-links">
            {[
              { name: "GitHub", url: "https://github.com/Vecanto" },
              { name: "Discord", url: "https://discord.gg/Ret9kadE" },
            ].map(({ name, url }) => (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer">
                {name}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
