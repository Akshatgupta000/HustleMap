import { Link } from "react-router-dom";
import { Sparkles, BarChart2, FileText, Star, CheckCircle, ArrowRight, Github } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Fade-in on scroll hook ───────────────────────────────────────────────────
function useFadeIn() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ─── Animated section wrapper ─────────────────────────────────────────────────
function Reveal({ children, delay = 0 }) {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      style={{
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(22px)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, delay }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Reveal delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`bg-white border border-[#e8e6e1] rounded-2xl p-7 cursor-default transition-all duration-300 ${
          hovered
            ? "shadow-[0_12px_32px_rgba(99,102,241,0.10),0_2px_8px_rgba(0,0,0,0.06)] -translate-y-1 scale-[1.015]"
            : "shadow-sm"
        }`}
      >
        <div
          className={`w-10 h-10 rounded-[10px] flex items-center justify-center mb-4 transition-colors duration-300 ${
            hovered ? "bg-violet-100" : "bg-gray-100"
          }`}
        >
          <Icon size={18} className={`transition-colors duration-300 ${hovered ? "text-indigo-500" : "text-[#6b6b6b]"}`} strokeWidth={1.8} />
        </div>
        <h3 className="text-[15px] font-semibold text-[#37352f] mb-2 tracking-tight">{title}</h3>
        <p className="text-[13.5px] text-[#6b6b6b] leading-relaxed m-0">{desc}</p>
      </div>
    </Reveal>
  );
}

// ─── Step item ────────────────────────────────────────────────────────────────
function Step({ num, title, desc, delay }) {
  return (
    <Reveal delay={delay}>
      <div className="flex gap-5 items-start">
        <div className="shrink-0 w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[13px] font-bold mt-0.5">
          {num}
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-[#37352f] mb-1.5 tracking-tight">{title}</h3>
          <p className="text-[13.5px] text-[#6b6b6b] leading-relaxed m-0">{desc}</p>
        </div>
      </div>
    </Reveal>
  );
}

// ─── Chrome icon (inline SVG component) ──────────────────────────────────────
function ChromeIcon({ size = 18, className = "", strokeWidth = 1.8 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
      <line x1="21.17" y1="8" x2="12" y2="8"/>
      <line x1="3.95" y1="6.06" x2="8.54" y2="14"/>
      <line x1="10.88" y1="21.94" x2="15.46" y2="14"/>
    </svg>
  );
}

function CameraIcon({ size = 18, className = "", strokeWidth = 1.8 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}

function MonitorIcon({ size = 18, className = "", strokeWidth = 1.8 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  );
}

function UploadIcon({ size = 18, className = "", strokeWidth = 1.8 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="16 16 12 12 8 16"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="min-h-screen bg-[#f7f6f3] font-[inherit]">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-black/[0.09] bg-[rgba(247,246,243,0.8)] backdrop-blur-md">
        <div className="max-w-[1080px] mx-auto px-6 h-[58px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-[30px] h-[30px] rounded-lg bg-white border border-[#e8e6e1] flex items-center justify-center shadow-sm">
              <Sparkles size={15} className="text-indigo-500" />
            </div>
            <span className="text-[14px] font-bold text-[#37352f] tracking-tight">HustleMap</span>
          </Link>

          <nav className="flex items-center gap-1.5">
            {[["#features", "Features"], ["#how-it-works", "How it Works"]].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="text-[13.5px] text-[#6b6b6b] no-underline px-2.5 py-[5px] rounded-lg transition-all hover:text-[#37352f] hover:bg-black/[0.06]"
              >
                {label}
              </a>
            ))}
            <Link
              to="/login"
              className="text-[13.5px] text-[#6b6b6b] no-underline px-2.5 py-[5px] rounded-lg transition-colors hover:text-[#37352f]"
            >
              Login
            </Link>
            <Link to="/register" className="no-underline">
              <button className="bg-[#37352f] text-white border-none rounded-[9px] px-[15px] py-[7px] text-[13.5px] font-semibold cursor-pointer tracking-tight transition-all hover:bg-[#1a1917] hover:scale-[1.03]">
                Get Started
              </button>
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-24 pb-20 text-center">
        <div className="absolute top-[-80px] left-1/2 -translate-x-[60%] w-[700px] h-[500px] rounded-[50%] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />
        <div className="absolute top-[60px] right-[10%] w-[320px] h-[320px] rounded-[50%] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(139,92,246,0.08) 0%, transparent 70%)" }} />

        <div className="max-w-[720px] mx-auto px-6 relative z-10">

          <Reveal delay={80}>
            <h1 className="text-[clamp(36px,6vw,62px)] font-extrabold text-[#37352f] leading-[1.1] tracking-[-2px] mb-5">
              Track jobs.{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Learn faster.</span>
                <span className="absolute bottom-1 left-0 right-0 h-2.5 bg-indigo-500/[0.15] rounded z-0" />
              </span>
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="text-[17px] text-[#6b6b6b] leading-[1.7] mx-auto mb-9 max-w-[520px]">
              Manage every application, rate interview difficulty, and log real questions by round. Build your Interview Summary and improve with each opportunity.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="flex justify-center items-center gap-3 flex-wrap">
              <Link to="/register" className="no-underline">
                <button className="inline-flex items-center gap-[7px] bg-indigo-500 text-white border-none rounded-[11px] px-[22px] py-[11px] text-[14.5px] font-semibold cursor-pointer tracking-tight shadow-[0_2px_12px_rgba(99,102,241,0.3)] transition-all hover:bg-indigo-600 hover:scale-[1.04] hover:shadow-[0_4px_18px_rgba(99,102,241,0.4)]">
                  Start for free <ArrowRight size={15} />
                </button>
              </Link>
              <a
                href="https://github.com/Akshatgupta000/HustleMap"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-[7px] bg-white text-[#37352f] border border-[#e8e6e1] rounded-[11px] px-5 py-[11px] text-[14.5px] font-medium no-underline transition-all hover:bg-[#f3f2ef] hover:scale-[1.03]"
              >
                <Github size={15} /> View on GitHub
              </a>
            </div>
          </Reveal>

          <Reveal delay={280}>
            <div className="mt-10 flex justify-center gap-7 flex-wrap">
              {["✓ Free forever", "✓ No setup", "✓ Built for job seekers"].map((text) => (
                <span key={text} className="text-[13px] text-[#6b6b6b] font-medium">{text}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1080px] mx-auto px-6">
        <div className="h-px bg-black/[0.08]" />
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="py-[88px] px-6">
        <div className="max-w-[1080px] mx-auto">
          <Reveal delay={0}>
            <div className="text-center mb-14">
              <p className="text-[12.5px] font-semibold text-indigo-500 tracking-[1px] uppercase mb-2.5">Features</p>
              <h2 className="text-[clamp(26px,4vw,38px)] font-extrabold text-[#37352f] tracking-tight mx-auto mb-3.5 max-w-[500px]">
                Everything you need to land the job
              </h2>
              <p className="text-[15.5px] text-[#6b6b6b] max-w-[440px] mx-auto leading-relaxed">
                One organized workspace for your entire job search journey.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <FeatureCard
              icon={FileText}
              title="Track Applications"
              desc="Keep every application in one place with clear status labels, quick notes, and company details."
              delay={0}
            />
            <FeatureCard
              icon={Star}
              title="Difficulty Ratings"
              desc="Rate each interview round from 1–5. Spot patterns, compare companies, and prepare smarter next time."
              delay={80}
            />
            <FeatureCard
              icon={BarChart2}
              title="Interview History"
              desc="Log real questions by round. Review past interviews to identify what you need to improve."
              delay={160}
            />
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1080px] mx-auto px-6">
        <div className="h-px bg-black/[0.08]" />
      </div>

      {/* ── CHROME EXTENSION ── */}
      <section className="py-[88px] px-6">
        <div className="max-w-[1080px] mx-auto">

          {/* Header */}
          <Reveal delay={0}>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-[7px] bg-indigo-50 border border-indigo-200 rounded-full px-[13px] py-[5px] mb-5">
                <div className="w-[7px] h-[7px] rounded-full bg-indigo-500" />
                <span className="text-[12px] font-semibold text-indigo-600 tracking-[0.5px] uppercase">Chrome Extension</span>
              </div>
              <h2 className="text-[clamp(26px,4vw,38px)] font-extrabold text-[#37352f] tracking-tight mx-auto mb-3.5 max-w-[600px]">
                Save Jobs Instantly with our Chrome Extension
              </h2>
              <p className="text-[15.5px] text-[#6b6b6b] max-w-[460px] mx-auto leading-relaxed">
                Capture jobs from LinkedIn, Indeed, and Glassdoor directly into HustleMap in seconds.
              </p>
            </div>
          </Reveal>

          {/* Feature Cards Grid */}
          <div className="grid gap-4 mb-12" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <FeatureCard
              icon={ChromeIcon}
              title="One-Click Capture"
              desc="Draw a rectangle over any job listing and save all details instantly — no copy-pasting required."
              delay={0}
            />
            <FeatureCard
              icon={CameraIcon}
              title="Screenshot + Context"
              desc="Save job screenshots so you never lose the original listing — even after it expires."
              delay={80}
            />
            <FeatureCard
              icon={MonitorIcon}
              title="Works Everywhere"
              desc="Supports LinkedIn, Indeed, and Glassdoor — wherever your job search takes you."
              delay={160}
            />
            <FeatureCard
              icon={UploadIcon}
              title="Seamless Sync"
              desc="Jobs are automatically saved to your dashboard with status 'Saved' — ready to track."
              delay={240}
            />
          </div>

          {/* Mini Flow Steps */}
          <Reveal delay={0}>
            <div className="bg-white border border-[#e8e6e1] rounded-2xl p-8 mb-10 shadow-sm">
              <p className="text-[12px] font-semibold text-indigo-500 tracking-[1px] uppercase mb-6 text-center">How it works</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0">
                {[
                  { num: "1", label: "Click the extension", sub: "Open HustleMap in your browser toolbar" },
                  { num: "2", label: "Select the job area", sub: "Draw a box over the listing you want" },
                  { num: "3", label: "Save to HustleMap", sub: "It lands in your dashboard instantly" },
                ].map(({ num, label, sub }, i) => (
                  <div key={num} className="flex sm:flex-row flex-col items-center gap-3 sm:gap-0 w-full sm:w-auto">
                    <div className="flex flex-col items-center text-center px-6 flex-1 min-w-[160px]">
                      <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[13px] font-bold mb-2.5 shadow-[0_2px_8px_rgba(99,102,241,0.3)]">
                        {num}
                      </div>
                      <p className="text-[13.5px] font-semibold text-[#37352f] mb-1 tracking-tight">{label}</p>
                      <p className="text-[12.5px] text-[#9b9994] leading-relaxed">{sub}</p>
                    </div>
                    {i < 2 && (
                      <div className="hidden sm:flex items-center text-indigo-300">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                        </svg>
                      </div>
                    )}
                    {i < 2 && (
                      <div className="flex sm:hidden items-center text-indigo-300">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={80}>
            <div className="flex justify-center items-center gap-3 flex-wrap">
              <a
                href="https://github.com/Akshatgupta000/HustleMap"
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
              >
                <button className="inline-flex items-center gap-[7px] bg-indigo-500 text-white border-none rounded-[11px] px-[22px] py-[11px] text-[14.5px] font-semibold cursor-pointer tracking-tight shadow-[0_2px_12px_rgba(99,102,241,0.3)] transition-all hover:bg-indigo-600 hover:scale-[1.04] hover:shadow-[0_4px_18px_rgba(99,102,241,0.4)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Get Extension
                </button>
              </a>
              <a
                href="https://github.com/Akshatgupta000/HustleMap"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-[7px] bg-white text-[#37352f] border border-[#e8e6e1] rounded-[11px] px-5 py-[11px] text-[14.5px] font-medium no-underline transition-all hover:bg-[#f3f2ef] hover:scale-[1.03]"
              >
                <Github size={15} /> View Source
              </a>
            </div>
          </Reveal>

        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1080px] mx-auto px-6">
        <div className="h-px bg-black/[0.08]" />
      </div>

      {/* ── INTERVIEW DETAIL SECTION ── */}
      <section className="px-6 pb-[88px]">
        <div className="max-w-[1080px] mx-auto">
          <Reveal delay={0}>
            <div className="text-center mb-[52px]">
              <h2 className="text-[clamp(24px,4vw,36px)] font-extrabold text-[#37352f] tracking-tight mb-3">
                Learn from every interview
              </h2>
              <p className="text-[15.5px] text-[#6b6b6b] max-w-[460px] mx-auto leading-relaxed">
                Build a structured record with difficulty ratings and real questions. Reflect and improve with each round.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {[
              {
                emoji: "📝",
                title: "Preparation Notes",
                desc: "Store everything before your interview — company background, technical topics, behavioral questions, salary expectations, and what to ask the interviewer.",
                bullets: ["Company background & culture", "Technical topics to revise", "Behavioral questions to practice", "Questions to ask the interviewer"],
                delay: 0,
              },
              {
                emoji: "⭐",
                title: "Difficulty Rating",
                desc: "Rate each interview round 1–5 to quickly compare experiences and prepare better for future rounds.",
                bullets: ["Compare difficulty across companies", "Identify patterns in your process", "Track improvement over time", "Build realistic expectations"],
                delay: 80,
              },
              {
                emoji: "📊",
                title: "Interview Summary",
                desc: "Log questions by round. Add notes or answers. Review your history to see how you've grown.",
                bullets: ["Log questions by round type", "Add your notes per question", "Review past summaries", "Identify improvement areas"],
                delay: 160,
              },
            ].map(({ emoji, title, desc, bullets, delay }) => (
              <Reveal key={title} delay={delay}>
                <div className="bg-white border border-[#e8e6e1] rounded-2xl p-7 h-full shadow-sm">
                  <div className="text-2xl mb-3.5">{emoji}</div>
                  <h3 className="text-[15px] font-bold text-[#37352f] mb-2.5 tracking-tight">{title}</h3>
                  <p className="text-[13.5px] text-[#6b6b6b] leading-relaxed mb-4">{desc}</p>
                  <ul className="list-none p-0 m-0 flex flex-col gap-2">
                    {bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-[13px] text-[#6b6b6b]">
                        <CheckCircle size={13} className="text-indigo-500 mt-0.5 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1080px] mx-auto px-6">
        <div className="h-px bg-black/[0.08]" />
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-[88px] px-6">
        <div className="max-w-[560px] mx-auto">
          <Reveal delay={0}>
            <div className="text-center mb-[52px]">
              <p className="text-[12.5px] font-semibold text-indigo-500 tracking-[1px] uppercase mb-2.5">How it Works</p>
              <h2 className="text-[clamp(24px,4vw,36px)] font-extrabold text-[#37352f] tracking-tight">
                Up and running in minutes
              </h2>
            </div>
          </Reveal>

          <div className="flex flex-col gap-8">
            <Step
              num={1}
              title="Sign up for free"
              desc="Create an account in seconds. No credit card or setup required."
              delay={0}
            />
            <div className="ml-[18px] w-px h-4 border-l-2 border-dashed border-indigo-300/50" />
            <Step
              num={2}
              title="Add your applications"
              desc="Start logging job applications with company, position, status, and notes."
              delay={80}
            />
            <div className="ml-[18px] w-px h-4 border-l-2 border-dashed border-indigo-300/50" />
            <Step
              num={3}
              title="Track and improve"
              desc="Update status as you progress. Rate difficulty, log questions by round, and build your Interview Summary to learn and land the next one."
              delay={160}
            />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="px-6 pb-24">
        <div className="max-w-[640px] mx-auto">
          <Reveal delay={0}>
            <div className="bg-[#37352f] rounded-[20px] py-[52px] px-10 text-center relative overflow-hidden">
              <div
                className="absolute top-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.25) 0%, transparent 70%)" }}
              />
              <h2 className="text-[clamp(22px,4vw,32px)] font-extrabold text-white tracking-tight mb-3 relative">
                Ready to start tracking?
              </h2>
              <p className="text-[15px] text-white/60 mb-8 leading-relaxed relative">
                Join job seekers who use HustleMap to stay organised and learn from every interview.
              </p>
              <Link to="/register" className="no-underline relative">
                <button className="inline-flex items-center gap-2 bg-indigo-500 text-white border-none rounded-[11px] px-[26px] py-3 text-[15px] font-semibold cursor-pointer tracking-tight shadow-[0_4px_16px_rgba(99,102,241,0.35)] transition-all hover:bg-indigo-600 hover:scale-[1.04]">
                  Create free account <ArrowRight size={15} />
                </button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-black/[0.09] py-6 px-6 bg-[#f7f6f3]">
        <div className="max-w-[1080px] mx-auto flex justify-between items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-[22px] h-[22px] rounded-[6px] bg-white border border-[#e8e6e1] flex items-center justify-center">
              <Sparkles size={11} className="text-indigo-500" />
            </div>
            <span className="text-[13px] font-semibold text-[#37352f]">HustleMap</span>
          </div>
          <div className="flex gap-5 items-center">
            <a
              href="https://github.com/Akshatgupta000/HustleMap"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-[#6b6b6b] no-underline flex items-center gap-1.5 hover:text-[#37352f] transition-colors"
            >
              <Github size={13} /> GitHub
            </a>
            <span className="text-[13px] text-[#9b9994]">Built with React · Node.js · MongoDB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
