import { Link } from "react-router-dom";
import { Sparkles, BarChart2, FileText, Star, CheckCircle, ArrowRight, Github, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Fade-in on scroll hook ───────────────────────────────────────────────────
function useFadeIn(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ─── Animated section wrapper ─────────────────────────────────────────────────
// variant: "up" | "left" | "right" | "zoom" | "blur"
function Reveal({ children, delay = 0, className = "", variant = "up" }) {
  const [ref, visible] = useFadeIn();

  const hidden = {
    up:    { opacity: 0, transform: "translateY(36px)" },
    left:  { opacity: 0, transform: "translateX(-48px)" },
    right: { opacity: 0, transform: "translateX(48px)" },
    zoom:  { opacity: 0, transform: "scale(0.92)" },
    blur:  { opacity: 0, filter: "blur(8px)", transform: "translateY(16px)" },
  }[variant] || { opacity: 0, transform: "translateY(36px)" };

  const shown = {
    up:    { opacity: 1, transform: "translateY(0)" },
    left:  { opacity: 1, transform: "translateX(0)" },
    right: { opacity: 1, transform: "translateX(0)" },
    zoom:  { opacity: 1, transform: "scale(1)" },
    blur:  { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
  }[variant] || { opacity: 1, transform: "translateY(0)" };

  const easing = variant === "zoom" ? "cubic-bezier(0.34, 1.56, 0.64, 1)" : "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
  const duration = variant === "blur" ? "0.8s" : "0.7s";

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: `opacity ${duration} ${easing} ${delay}ms, transform ${duration} ${easing} ${delay}ms${
          variant === "blur" ? `, filter ${duration} ${easing} ${delay}ms` : ""
        }`,
        ...(visible ? shown : hidden),
      }}
    >
      {children}
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, delay, num = "01" }) {
  return (
    <Reveal delay={delay} className="h-full">
      <div
        className="relative bg-white/75 backdrop-blur-md border-[2.5px] border-charcoal rounded-2xl p-8 pb-9 cursor-default transition-all duration-500 h-full flex flex-col shadow-[4px_4px_0px_0px_rgba(28,28,28,1)] hover:shadow-[6px_6px_0px_0px_rgba(28,28,28,1)] hover:-translate-y-2.5 hover:scale-[1.02] hover:z-20 group"
      >
        {/* Card Header (Number & Icon) */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <span className="text-[32px] font-black font-sans leading-none tracking-tight select-none text-charcoal/30">
            {num}
          </span>
          <div
            className="w-12 h-12 rounded-[12px] flex items-center justify-center border-2 border-charcoal/10 bg-sage-light/40 group-hover:bg-sage-light/80 transition-colors duration-300"
          >
            <Icon size={22} className="text-charcoal/70" strokeWidth={1.8} />
          </div>
        </div>

        <h3 className="text-[18px] font-black text-charcoal mb-3 tracking-tight shrink-0">{title}</h3>
        <p className="text-[15px] text-charcoal/65 leading-relaxed m-0 flex-1">{desc}</p>
      </div>
    </Reveal>
  );
}

// ─── Step item ────────────────────────────────────────────────────────────────
function Step({ num, title, desc, delay }) {
  return (
    <Reveal delay={delay} variant="left">
      <div className="flex gap-6 items-start">
        <div className="shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-charcoal to-charcoal text-white flex items-center justify-center text-[15px] font-bold mt-0.5 shadow-md">
          {num}
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-charcoal mb-2 tracking-tight">{title}</h3>
          <p className="text-[15px] text-charcoal/60 leading-relaxed m-0">{desc}</p>
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-sage font-[inherit]">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-charcoal/15 bg-sage/80 backdrop-blur-xl supports-[backdrop-filter]:bg-sage/60">
        <div className="max-w-[1200px] mx-auto px-6 h-[76px] flex items-center justify-between">
          <Link to="/" className="flex items-center no-underline group">
            <span className="text-[22px] font-bold text-charcoal tracking-tight">HustleMap</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {[["#features", "Features"], ["#how-it-works", "How it Works"]].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="text-[15px] text-charcoal/60 font-semibold no-underline px-3.5 py-[7px] rounded-lg transition-all hover:text-charcoal hover:bg-white/10"
              >
                {label}
              </a>
            ))}
            <Link
              to="/login"
              className="text-[15px] text-charcoal/60 font-semibold no-underline px-3.5 py-[7px] rounded-lg transition-colors hover:text-charcoal hover:bg-white/10"
            >
              Login
            </Link>
            <Link to="/register" className="no-underline ml-1">
              <button className="bg-white text-charcoal border border-charcoal rounded-xl px-[18px] py-[9px] text-[14.5px] font-bold cursor-pointer tracking-tight transition-all hover:bg-sage-light hover:shadow-sm">
                Get started
              </button>
            </Link>
          </nav>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} className="text-charcoal" /> : <Menu size={24} className="text-charcoal" />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-[76px] left-0 right-0 bg-sage/95 backdrop-blur-xl border-b border-charcoal/15 shadow-sm px-6 py-6 flex flex-col gap-4 animate-in slide-in-from-top duration-200">
            {[["#features", "Features"], ["#how-it-works", "How it Works"]].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[16px] font-bold text-charcoal no-underline py-2 border-b border-charcoal/15/50 hover:text-charcoal/60 transition-colors"
              >
                {label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[16px] font-bold text-charcoal no-underline py-2 border-b border-charcoal/15/50 hover:text-charcoal/60 transition-colors"
            >
              Login
            </Link>
            <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="no-underline pt-2">
              <button className="w-full bg-white text-charcoal border border-charcoal rounded-xl py-3.5 text-[16px] font-bold cursor-pointer tracking-tight transition-all hover:bg-sage-light">
                Get started
              </button>
            </Link>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-14 sm:pt-18 pb-20 sm:pb-28 text-center bg-sage">
        
        {/* Left Avatar Group - Hand-drawn illustrations peeking from bottom-left (Sized up for impact) */}
        <div className="hidden sm:block absolute bottom-0 left-0 w-[180px] sm:w-[260px] md:w-[320px] lg:w-[380px] xl:w-[420px] select-none pointer-events-none z-10 transition-all duration-500 transform origin-bottom-left hover:scale-[1.03] hover:rotate-1">
          <img 
            src="/avatar_left.png" 
            alt="Hand-drawn creative professional avatars" 
            className="w-full h-auto object-contain block filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.04)]" 
          />
        </div>

        {/* Right Avatar Group - Hand-drawn illustrations peeking from bottom-right (Sized up for impact) */}
        <div className="hidden sm:block absolute bottom-0 right-0 w-[150px] sm:w-[220px] md:w-[270px] lg:w-[320px] xl:w-[360px] select-none pointer-events-none z-10 transition-all duration-500 transform origin-bottom-right hover:scale-[1.03] hover:-rotate-1">
          <img 
            src="/avatar_right.png" 
            alt="Hand-drawn team member avatars" 
            className="w-full h-auto object-contain block filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.04)]" 
          />
        </div>

        {/* Curvy blue hand-drawn arrow pointing precisely from the left avatar's face to the CTA button */}
        <div className="hidden sm:block absolute left-[16%] sm:left-[18%] md:left-[21%] lg:left-[23%] bottom-[12%] sm:bottom-[13%] md:bottom-[15%] lg:bottom-[17%] w-[130px] h-[100px] sm:w-[160px] sm:h-[120px] md:w-[200px] md:h-[150px] lg:w-[240px] lg:h-[180px] pointer-events-none select-none z-0">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#0f78eb] opacity-90 transition-transform duration-300 hover:scale-105">
            {/* Smooth curve from bottom-left (avatar face) to top-right (button) */}
            <path
              d="M 12,88 C 30,52 55,32 88,25"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Arrowhead pointing precisely to the button */}
            <path
              d="M 74,18 L 90,24 L 81,38"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="max-w-[840px] mx-auto px-6 relative z-10">

          <Reveal delay={80}>
            <h1 className="text-[clamp(44px,7vw,72px)] font-extrabold text-charcoal leading-[1.1] tracking-[-2px] mb-6">
              Track jobs.{" "}
              <span className="relative inline-block text-charcoal">
                <span className="relative z-10">Learn faster.</span>
              </span>
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="text-[19px] text-charcoal/60 leading-[1.7] mx-auto mb-10 max-w-[620px]">
              The organized way to job hunt, prep, and land offers. Track every application, log interview questions, and use analytics to sharpen your strategy.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="flex justify-center items-center gap-3 flex-wrap">
              <Link to="/register" className="no-underline">
                <button className="inline-flex items-center gap-[9px] bg-white text-charcoal border border-charcoal rounded-xl px-[28px] py-[14px] text-[16.5px] font-bold cursor-pointer tracking-tight transition-all hover:bg-sage-light hover:shadow-sm hover:scale-[1.02]">
                  Get started <ArrowRight size={17} />
                </button>
              </Link>
            </div>
          </Reveal>

          <Reveal delay={280}>
            <div className="mt-12 flex justify-center gap-9 flex-wrap">
              {["✓ Free forever", "✓ No setup", "✓ Built for job seekers"].map((text) => (
                <span key={text} className="text-[14.5px] text-charcoal/60 font-semibold">{text}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="h-px bg-border" />
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="pt-20 sm:pt-[120px] pb-12 sm:pb-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <Reveal delay={0} variant="blur">
            <div className="text-center mb-16">
              <p className="text-[14px] font-bold text-charcoal/60 tracking-[1.5px] uppercase mb-3">Features</p>
              <h2 className="text-[clamp(32px,5vw,46px)] font-extrabold text-charcoal tracking-tight mx-auto mb-4.5 max-w-[600px]">
                Everything you need to land the job
              </h2>
              <p className="text-[17.5px] text-charcoal/60 max-w-[520px] mx-auto leading-relaxed">
                A data-driven pipeline and feedback loop designed to help you prepare, track, and land offers.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <FeatureCard
              icon={FileText}
              title="Smart Kanban Board"
              desc="Organize every application in one clean board. Update statuses, add contacts, attach notes, and manage your full pipeline in one responsive workspace."
              delay={0}
              num="01"
              color="blue"
            />
            <FeatureCard
              icon={Star}
              title="Personal Question Bank"
              desc="Build a structured personal prep database. Rate round difficulty, save real interview questions, and record detailed answers for study."
              delay={80}
              num="02"
              color="orange"
            />
            <FeatureCard
              icon={BarChart2}
              title="Conversion Analytics"
              desc="Visualize your success rates. Track conversion rates from Applied to Offer, find resume bottlenecks, and monitor weekly trend statistics."
              delay={160}
              num="03"
              color="green"
            />
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="h-px bg-border" />
      </div>

      {/* ── CHROME EXTENSION ── */}
      <section className="py-12 sm:py-16 px-6">
        <div className="max-w-[1200px] mx-auto">

          {/* Header */}
          <Reveal delay={0} variant="left">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-[8px] bg-white border border-charcoal/15 rounded-full px-[16px] py-[6px] mb-6 shadow-md">
                <div className="w-[8px] h-[8px] rounded-full bg-yellow-400" />
                <span className="text-[13.5px] font-bold text-charcoal/70 tracking-[1px] uppercase">Chrome Extension</span>
              </div>
              <h2 className="text-[clamp(32px,5vw,46px)] font-extrabold text-charcoal tracking-tight mx-auto mb-4.5 max-w-[700px]">
                Save Jobs Instantly with our Chrome Extension
              </h2>
              <p className="text-[17.5px] text-charcoal/60 max-w-[540px] mx-auto leading-relaxed">
                Capture job descriptions, titles, and screenshots from major job boards directly into HustleMap in a single click.
              </p>
            </div>
          </Reveal>

          {/* Connected Path Timeline Flowchart */}
          <div className="relative my-20 px-4">
            
            {/* Desktop Horizontal Wavy Dashed Path */}
            <div className="hidden md:block absolute top-[52px] left-[12%] right-[12%] h-[10px] z-0 pointer-events-none">
              <svg width="100%" height="30" viewBox="0 0 100 20" preserveAspectRatio="none" fill="none" className="text-charcoal/20">
                <path d="M 0,10 C 25,2 75,18 100,10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 5" fill="none" />
              </svg>
            </div>

            {/* Mobile Vertical Dashed Path */}
            <div className="md:hidden absolute left-[38px] top-6 bottom-6 w-[2.5px] z-0 pointer-events-none">
              <div className="h-full border-l-[2.5px] border-dashed border-charcoal/20" />
            </div>

            {/* Grid Flow */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
              {[
                {
                  icon: MonitorIcon,
                  num: "01",
                  title: "1. Universal Support",
                  desc: "Visit LinkedIn, Indeed, Glassdoor, or any company hiring page.",
                  delay: 0
                },
                {
                  icon: ChromeIcon,
                  num: "02",
                  title: "2. Instant Clip",
                  desc: "Open the extension and clip job details without tedious copy-pasting.",
                  delay: 80
                },
                {
                  icon: CameraIcon,
                  num: "03",
                  title: "3. Capture Screenshot",
                  desc: "Instantly capture the visual requirements before they expire.",
                  delay: 160
                },
                {
                  icon: UploadIcon,
                  num: "04",
                  title: "4. Sync to Kanban",
                  desc: "The listing automatically lands in your Kanban board as 'Saved'.",
                  delay: 240
                }
              ].map(({ icon: Icon, num, title, desc, delay }) => (
                <Reveal key={num} delay={delay} className="h-full">
                  <div className="flex md:flex-col items-start md:items-center gap-6 md:gap-4 text-left md:text-center group">
                    
                    {/* Badge Container */}
                    <div className="w-14 h-14 rounded-full bg-white border-[2.5px] border-charcoal flex items-center justify-center relative z-10 shrink-0 shadow-[3px_3px_0px_0px_rgba(28,28,28,1)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[5px_5px_0px_0px_rgba(28,28,28,1)] group-hover:scale-105 bg-gradient-to-br from-white to-sage-light/20">
                      <Icon size={20} className="text-charcoal" strokeWidth={2} />
                      
                      {/* Floating mini number bubble */}
                      <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-charcoal text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm font-sans">
                        {num}
                      </span>
                    </div>

                    {/* Text Container */}
                    <div className="flex-1 md:mt-2">
                      <h3 className="text-[17px] font-extrabold text-charcoal mb-2 tracking-tight transition-colors group-hover:text-charcoal/80">
                        {title}
                      </h3>
                      <p className="text-[14px] text-charcoal/60 leading-relaxed max-w-[220px] md:mx-auto">
                        {desc}
                      </p>
                    </div>

                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <Reveal delay={80}>
            <div className="flex justify-center items-center gap-3 flex-wrap">
              <a
                href="https://github.com/Akshatgupta000/HustleMap-extension"
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
              >
                <button className="inline-flex items-center gap-[7px] bg-white text-charcoal border border-charcoal rounded-xl px-[22px] py-[11px] text-[14.5px] font-bold cursor-pointer tracking-tight transition-all hover:bg-sage-light hover:shadow-sm hover:scale-[1.02]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Get Extension
                </button>
              </a>
            </div>
          </Reveal>

        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="h-px bg-black/[0.08]" />
      </div>

      {/* ── INTERVIEW DETAIL SECTION ── */}
      <section className="px-6 pb-12 sm:pb-16">
        <div className="max-w-[1200px] mx-auto">
          <Reveal delay={0} variant="zoom">
            <div className="text-center mb-16">
              <h2 className="text-[clamp(30px,4.5vw,44px)] font-extrabold text-charcoal tracking-tight mb-4">
                Turn every interview into an edge
              </h2>
              <p className="text-[17.5px] text-charcoal/60 max-w-[540px] mx-auto leading-relaxed">
                Build a personal interview playbook — log real questions, rate rounds, and grow smarter with each opportunity.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
            {[
              {
                icon: FileText,
                title: "Pre-Interview Prep",
                desc: "Walk in fully prepared. Store company research, topics to revise, talking points, salary expectations, and your list of questions to ask — all in one place.",
                bullets: ["Company culture & background notes", "Technical topics to revise", "Behavioral answers to rehearse", "Smart questions to ask the interviewer"],
                delay: 0,
                num: "01",
                color: "green"
              },
              {
                icon: Star,
                title: "Round Difficulty Rating",
                desc: "Rate the overall difficulty of each process on a 1–5 scale. Spot patterns across companies and calibrate your expectations for future applications.",
                bullets: ["Per-company difficulty benchmarking", "Track progress across rounds", "Identify your weak interview areas", "Build realistic preparation timelines"],
                delay: 80,
                num: "02",
                color: "orange"
              },
              {
                icon: BarChart2,
                title: "Question Bank & Notes",
                desc: "Log real questions asked in each round with your answers and personal notes. Build a searchable knowledge base you can revisit before your next interview.",
                bullets: ["Organize questions by round type", "Attach personal notes and answers", "Review past interview transcripts", "Spot recurring themes across companies"],
                delay: 160,
                num: "03",
                color: "blue"
              },
            ].map(({ icon: Icon, title, desc, bullets, delay, num }) => {
              return (
                <Reveal key={title} delay={delay} className="h-full">
                  <div
                    className="relative bg-white/75 backdrop-blur-md border-[2.5px] border-charcoal rounded-2xl p-8 pb-9 cursor-default transition-all duration-500 h-full flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(28,28,28,1)] hover:shadow-[6px_6px_0px_0px_rgba(28,28,28,1)] hover:-translate-y-2.5 hover:scale-[1.02] hover:z-20 group"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex justify-between items-center mb-6 shrink-0">
                        <span className="text-[32px] font-black font-sans leading-none tracking-tight select-none text-charcoal/30">
                          {num}
                        </span>
                        <div
                          className="w-12 h-12 rounded-[12px] flex items-center justify-center border-2 border-charcoal/10 bg-sage-light/40 group-hover:bg-sage-light/80 transition-colors duration-300"
                        >
                          <Icon size={22} className="text-charcoal/70" strokeWidth={1.8} />
                        </div>
                      </div>
                      
                      <h3 className="text-[18px] font-black text-charcoal mb-3 tracking-tight">{title}</h3>
                      <p className="text-[14.5px] text-charcoal/65 leading-relaxed mb-6">{desc}</p>
                    </div>
                    
                    <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                      {bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3 text-[14.5px] text-charcoal/60">
                          <CheckCircle size={15} className="text-charcoal/60 mt-0.5 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="h-px bg-black/[0.08]" />
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-12 sm:py-16 px-6">
        <div className="max-w-[640px] mx-auto">
          <Reveal delay={0} variant="right">
            <div className="text-center mb-10">
              <p className="text-[14px] font-bold text-charcoal/60 tracking-[1.5px] uppercase mb-3">How it Works</p>
              <h2 className="text-[clamp(30px,4.5vw,44px)] font-extrabold text-charcoal tracking-tight">
                Up and running in minutes
              </h2>
            </div>
          </Reveal>

          <div className="flex flex-col gap-4">
            <Step
              num={1}
              title="Sign up for free"
              desc="Create your account instantly. No credit card, no onboarding forms — just your email and you're in."
              delay={0}
            />
            <div className="ml-[21px] w-px h-4 border-l-2 border-dashed border-charcoal/20" />
            <Step
              num={2}
              title="Build your pipeline"
              desc="Add applications manually or clip them instantly from LinkedIn, Indeed, and Glassdoor using the Chrome extension."
              delay={80}
            />
            <div className="ml-[21px] w-px h-4 border-l-2 border-dashed border-charcoal/20" />
            <Step
              num={3}
              title="Prepare, track, and win"
              desc="Log interview questions by round, rate difficulty, and review your conversion funnel analytics to sharpen your strategy with every application."
              delay={160}
            />
          </div>
        </div>
      </section>



      {/* ── FOOTER ── */}
      <footer className="border-t border-charcoal/15 py-8 px-6 bg-sage">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex items-center">
            <span className="text-[19px] font-bold text-charcoal">HustleMap</span>
          </div>
          <div className="flex gap-6 items-center">
            <span className="text-[14.5px] text-charcoal/60">Built with React · Node.js · MongoDB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
