"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import {
  ArrowRight,
  ArrowDown,
  Sparkles,
  ShieldCheck,
  PhoneCall,
  CheckCircle2,
  X,
  Send,
  Loader2,
  Lock,
  Compass,
  ArrowUpRight,
  UserCheck,
  Menu,
  ChevronDown,
  HelpCircle,
  MessageSquare,
  AlertTriangle,
  Flame,
  Check,
} from "lucide-react";
import { sendTelegramNotification, VouchFormData } from "./src/lib/telegram";

// ============================================================================
// 1. SMOOTH SCROLL ENGINE (Lenis Smooth Inertial Scroll)
// ============================================================================
function useSmoothScroll() {
  useEffect(() => {
    const win = window as unknown as { Lenis?: any; lenisInstance?: any };
    if (typeof window !== "undefined" && win.Lenis) {
      const lenis = new win.Lenis({
        duration: 1.35,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.9,
      });
      win.lenisInstance = lenis;

      let rafId: number;
      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
      return () => {
        cancelAnimationFrame(rafId);
        lenis.destroy();
        delete win.lenisInstance;
      };
    }
  }, []);
}

// ============================================================================
// 2. PARALLAX IMAGE COMPONENT (Smooth Scroll Parallax + 3D Tilt + 21st.dev Spotlight)
// ============================================================================
interface ParallaxPictureProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
  scaleRange?: [number, number];
  badge?: string;
}

function ParallaxPicture({
  src,
  alt,
  className = "",
  speed = 14,
  scaleRange = [1.16, 1.0],
  badge,
}: ParallaxPictureProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 65,
    damping: 22,
    mass: 0.4,
  });

  const y = useTransform(smoothProgress, [0, 1], [`-${speed}%`, `${speed}%`]);
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [
    scaleRange[0],
    scaleRange[1],
    scaleRange[0],
  ]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(0, { stiffness: 150, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 150, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const yPos = e.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(yPos);

    const rX = ((yPos / rect.height - 0.5) * -7);
    const rY = ((x / rect.width - 0.5) * 7);
    rotateX.set(rX);
    rotateY.set(rY);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  const spotlight = useMotionTemplate`radial-gradient(380px circle at ${mouseX}px ${mouseY}px, rgba(181, 71, 43, 0.28), transparent 80%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 40, clipPath: "inset(12% 0% 12% 0%)" }}
      whileInView={{ opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative overflow-hidden select-none shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] ${className}`}
    >
      <motion.img
        src={src}
        alt={alt}
        style={{ y, scale }}
        className="h-[126%] w-full object-cover object-center will-change-transform transition-all duration-700 group-hover:brightness-105"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15 opacity-70 transition-opacity duration-500 group-hover:opacity-40" />
      <div className="pointer-events-none absolute inset-0 border border-white/15" />
      <motion.div
        style={{ background: spotlight }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      {badge && (
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-full border border-white/25 bg-black/50 px-3.5 py-1.5 text-[10px] tracking-[0.16em] text-white uppercase backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[#B5472B] animate-pulse" />
          <span className="font-mono-tag">{badge}</span>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// 3. EDITORIAL ACTION BUTTON (Minimalist & Crisp)
// ============================================================================
function EditorialButton({
  label = "Learn more",
  light = false,
  onClick,
}: {
  label?: string;
  light?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group inline-flex items-center gap-3.5 text-left focus:outline-none"
    >
      <span
        className={`relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-[6px] transition-all duration-500 group-hover:scale-105 ${
          light
            ? "bg-[#EDEAE1] text-[#141414] shadow-[0_0_25px_rgba(237,234,225,0.25)]"
            : "bg-[#141414] text-[#EDEAE1] shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
        }`}
      >
        <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-8 text-[#B5472B]" />
        <ArrowRight className="absolute -translate-x-8 h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 text-[#B5472B]" />
      </span>
      <span
        className={`text-xs font-medium tracking-[0.06em] transition-colors duration-300 ${
          light
            ? "text-zinc-300 group-hover:text-white"
            : "text-zinc-800 group-hover:text-black"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

// ============================================================================
// 4. SPOTLIGHT INTERACTIVE CARD (21st.dev)
// ============================================================================
function InteractiveInsightCard({
  tag,
  title,
  quote,
  solution,
  icon: Icon,
  onClick,
}: {
  tag: string;
  title: string;
  quote: string;
  solution: string;
  icon: React.ElementType;
  onClick?: () => void;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  const bgSpotlight = useMotionTemplate`radial-gradient(420px circle at ${mouseX}px ${mouseY}px, rgba(181, 71, 43, 0.12), transparent 80%)`;

  return (
    <motion.div
      onMouseMove={onMouseMove}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      onClick={onClick}
      className="group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[8px] border border-black/10 bg-[#FBF9F5] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] cursor-pointer"
    >
      <motion.div
        style={{ background: bgSpotlight }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative z-10 flex items-center justify-between">
        <span className="font-mono-tag text-[10px] tracking-[0.2em] text-[#B5472B] font-semibold uppercase">
          {tag}
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white transition-transform duration-500 group-hover:rotate-12 group-hover:bg-[#141414] group-hover:text-white">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="relative z-10 my-4 space-y-3">
        <h4 className="font-editorial text-2xl sm:text-3xl font-normal text-[#141414] leading-tight">
          {title}
        </h4>
        <div className="border-l-2 border-[#B5472B]/60 pl-3 py-0.5">
          <p className="text-xs italic text-zinc-600 leading-relaxed font-serif">
            "{quote}"
          </p>
        </div>
        <p className="text-xs text-zinc-800 font-medium leading-relaxed pt-1">
          {solution}
        </p>
      </div>

      <div className="relative z-10 pt-2 border-t border-black/5">
        <EditorialButton label="Request Voucher" />
      </div>
    </motion.div>
  );
}

// ============================================================================
// NAVIGATION & EMPIRICAL RESEARCH DATA
// ============================================================================
const NAV_LINKS = [
  { label: "Overview", id: "#about" },
  { label: "12 Interviews", id: "#interviews" },
  { label: "How It Works", id: "#how-it-works" },
  { label: "Friction & Proof", id: "#cases" },
  { label: "FAQ", id: "#faq" },
  { label: "Team", id: "#team" },
];

const INTERVIEW_FINDINGS = [
  {
    tag: "AUTOMATIC REFUSALS",
    quote: "We don't rent to students, only to married couples without kids.",
    context: "Arriving freshmen rejected 8–9 times consecutively the very moment the landlord heard the word 'student'.",
    metric: "33% rejected immediately",
  },
  {
    tag: "GENDER BIAS IN HOUSING",
    quote: "Landlords prefer renting to girls and are fiercely reluctant to take in guys.",
    context: "Male students face blanket stereotyping about noise and damage, regardless of budget, manners, or grades.",
    metric: "75% higher friction for guys",
  },
  {
    tag: "BROKER PREDATION",
    quote: "In my opinion, most of the agents are scams.",
    context: "Middlemen demanded 15,000–50,000 ₸ upfront for fake landlord phone numbers that were disconnected.",
    metric: "0 ₸ commission with peer vouching",
  },
  {
    tag: "SEASONAL EXPLOITATION",
    quote: "300,000 tenge for a one-room apartment, which I consider too expensive a luxury.",
    context: "August & September rental price spikes exploit freshman panic when dormitories are filled.",
    metric: "40–60% rental inflation in fall",
  },
  {
    tag: "ADVANCE WIRE FRAUD",
    quote: "No transfers before seeing the apartment in person.",
    context: "Scammers ask for Kaspi deposits to 'hold viewing slots' and vanish. Our golden rule stops this cold.",
    metric: "Strict physical verification rule",
  },
  {
    tag: "THE TURNING POINT",
    quote: "He's a reasonable guy — he replied within an hour once trust was established.",
    context: "Almaty landlords aren't malicious; they fear risk. A 42-sec vouch call completely changes the dynamic.",
    metric: "0:42 avg call duration",
  },
];

const VALUE_COMPARISONS = [
  {
    pillar: "ZERO MIDDLEMEN",
    headline: "A real person calls before you pay anything",
    studentQuote: "In my opinion, most of the agents are scams.",
    ourAnswer: "No commission, ever. Vouchers are fellow Narxoz students helping for free — not commission-hungry brokers.",
    badge: "100% Free Solidarity",
  },
  {
    pillar: "ZERO SURPRISE FEES",
    headline: "No app download, no sign-up fee, no waiting",
    studentQuote: "…300,000 tenge for a one-room apartment, which I consider too expensive a luxury.",
    ourAnswer: "Zero tenge. It is 100% free for the entire pilot — no hidden charges or surprise deductions, ever.",
    badge: "No Hidden Costs",
  },
  {
    pillar: "NARXOZ NETWORK",
    headline: "Guidance from someone who has lived through this",
    studentQuote: "No transfers before seeing the apartment in person.",
    ourAnswer: "We never ask you for money. Vouchers are settled Narxoz peers, and we introduce you before anyone calls the landlord.",
    badge: "Verified Student Peers",
  },
];

const FAQS = [
  {
    question: "Is this an official Narxoz University service?",
    answer:
      "No — this is an independent pilot run by Team SUA (students of the Tech Entrepreneurship course at Narxoz University), not an official university department. We built it directly out of our own rental frustrations as students living in Almaty.",
  },
  {
    question: "Do I have to pay for a voucher or the landlord phone call?",
    answer:
      "No. It is completely free during our entire pilot. There are zero broker commissions, zero upfront registration charges, and we will never ask you for Kaspi transfers.",
  },
  {
    question: "What if the landlord still says no after the voucher call?",
    answer:
      "You lose nothing — you are exactly where you started, minus one awkward, demoralizing phone call you didn't have to make yourself. We'll simply help you vet your next Krisha.kz option immediately.",
  },
  {
    question: "Who are the local student vouchers?",
    answer:
      "Settled Narxoz senior students and recent alumni who already live in Almaty, know the local rental landscape (Auezov, Bostandyk, Almaly), and have navigated this exact housing search themselves.",
  },
  {
    question: "How fast can I get matched with a voucher?",
    answer:
      "We are an agile pilot team: expect a reply and landlord call within 24 hours — and usually within an hour if you reach out to our coordinator directly on Telegram (@RakDinn).",
  },
];

// ============================================================================
// LIVE CALL & TELEGRAM SIMULATION COMPONENT (21st.dev Dark Glass)
// ============================================================================
function LiveCallSimulation({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#121413]/95 p-6 md:p-8 backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] text-white">
      {/* Top Window Chrome */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#B5472B]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#D9A64E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono-tag text-zinc-300">
          <MessageSquare className="h-3.5 w-3.5 text-[#B5472B]" />
          <span>Telegram // @RakDinn</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
        </div>
        <span className="text-[10px] font-mono-tag text-zinc-500 uppercase tracking-widest hidden sm:inline">
          LIVE PROTOCOL
        </span>
      </div>

      {/* Chat Thread */}
      <div className="space-y-4 text-xs sm:text-sm">
        {/* Incoming Student Message */}
        <div className="max-w-[88%]">
          <div className="flex items-center gap-2 text-[10px] font-mono-tag text-zinc-400 mb-1">
            <span className="text-zinc-400">NON-LOCAL FRESHMAN</span>
            <span>• 16:40</span>
          </div>
          <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-[#1A1F1B] p-4 text-zinc-200 leading-relaxed shadow-sm">
            “Found a 1-room studio on Zhandosov, 7 mins from Narxoz. Called the landlord, but the second I said I'm a freshman he said <em>‘no students’</em> and hung up. Can someone help?”
          </div>
        </div>

        {/* Voucher Reply */}
        <div className="max-w-[88%] ml-auto text-right">
          <div className="flex items-center justify-end gap-2 text-[10px] font-mono-tag text-[#D9A64E] mb-1">
            <span>LOCAL NARXOZ VOUCHER</span>
            <span>• 16:42</span>
          </div>
          <div className="inline-block text-left rounded-2xl rounded-tr-sm bg-[#B5472B] p-4 text-white font-medium leading-relaxed shadow-md">
            “On it right now. Sending him our Narxoz voucher credentials and calling directly.”
          </div>
        </div>
      </div>

      {/* Live Phone Call Simulation Card */}
      <div className="mt-6 rounded-xl border border-white/15 bg-black/60 p-4 sm:p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-28 w-28 bg-[#B5472B]/20 blur-2xl pointer-events-none rounded-full" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <PhoneCall className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <span>Voucher Peer → Landlord</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-mono-tag text-emerald-300">
                  CONNECTED
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 font-mono-tag">
                Listing: Zhandosov St, Bostandyk District
              </div>
            </div>
          </div>

          <div className="text-right font-mono-tag">
            <span className="text-base sm:text-lg font-bold text-[#D9A64E]">0:42</span>
            <span className="block text-[9px] text-zinc-500 uppercase tracking-widest">DURATION</span>
          </div>
        </div>

        {/* Audio Waveform Visualization */}
        <div className="my-4 flex items-center justify-center gap-1.5 h-6">
          {[40, 65, 30, 90, 75, 50, 100, 60, 45, 80, 95, 35, 70, 85, 40, 60, 80, 50, 30, 75].map((h, i) => (
            <motion.span
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-[#B5472B] to-[#D9A64E]"
              animate={{ height: [`${Math.max(15, h * 0.3)}%`, `${h}%`, `${Math.max(20, h * 0.4)}%`] }}
              transition={{ duration: 1.1 + (i % 5) * 0.2, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>

        <div className="border-t border-white/10 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Landlord agrees: Private viewing unlocked for tomorrow at 18:00</span>
          </div>
          <button
            onClick={onOpenModal}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-mono-tag text-white hover:bg-[#B5472B] transition-colors"
          >
            <span>Claim Voucher</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FAQ ACCORDION ITEM
// ============================================================================
function FaqItem({
  item,
  isOpen,
  onToggle,
}: {
  item: { question: string; answer: string };
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#161917]/70 backdrop-blur-md transition-colors hover:border-white/20">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-6 text-left focus:outline-none"
      >
        <span className="font-editorial text-lg sm:text-xl font-normal text-white pr-4">
          {item.question}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 transition-transform duration-300 ${
            isOpen ? "rotate-180 bg-[#B5472B] text-white border-transparent" : "text-zinc-400"
          }`}
        >
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="border-t border-white/10 px-6 pt-4 pb-6 text-xs sm:text-sm leading-relaxed text-zinc-300">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// 5. CORE STORYTELLING CHAPTERS (3 Fullscreen Overlapping Chapters)
// ============================================================================
const PROJECT_CHAPTERS = [
  {
    id: "01",
    tag: "( VERIFICATION & CALL — CHAPTER 01 )",
    titleLine1: "Direct phone call",
    titleLine2: "to the landlord",
    bgClass: "bg-[#FBF9F5]",
    textClass: "text-[#141414]",
    mutedClass: "text-zinc-600",
    lightBtn: false,
    image: "/chapter1-building.jpg",
    badge: "ZHANDOSOV ST • NEAR NARXOZ CAMPUS",
    description:
      "Almaty landlords routinely fear noise, missed rent, and property damage, rejecting 75% of incoming calls with an instant “no students” rule. Our voucher places a focused 42-second phone call on your behalf as an established Narxoz peer, confirms your credibility, and secures a private viewing slot.",
  },
  {
    id: "02",
    tag: "( 12 FIELD INTERVIEWS — CHAPTER 02 )",
    titleLine1: "Unfiltered truth",
    titleLine2: "about student rentals",
    bgClass: "bg-[#121214]",
    textClass: "text-[#D8D4CC]",
    mutedClass: "text-zinc-400",
    lightBtn: true,
    image: "/chapter2-interviews.jpg",
    badge: "12 IN-DEPTH STUDENT INTERVIEWS",
    description:
      "“Turned away 8–9 times the moment I said I was a student”, “Brokers charged 30–50% upfront and vanished”, “300,000 ₸ for a rundown studio”. We conducted 12 empirical interviews with arriving and senior Narxoz students: our service was built directly from these exact pain points.",
  },
  {
    id: "03",
    tag: "( TRUST PROTOCOL — CHAPTER 03 )",
    titleLine1: "Protection from scams",
    titleLine2: "& predatory fees",
    titleLine3: "0 ₸ commission",
    bgClass: "bg-[#9A968E]",
    textClass: "text-[#141414]",
    mutedClass: "text-zinc-900/80",
    lightBtn: false,
    image: "/chapter3-keys.jpg",
    badge: "SIGNED LEASE • 0 ₸ COMMISSION",
    description:
      "Our golden rule: zero Kaspi transfers before physically viewing the apartment and verifying official title documents. Your voucher serves as a reliable local co-signer guide, screens Krisha.kz listings, and warns you against deceptive broker syndicates.",
  },
];

function ShowcaseChapter({
  chapter,
  index,
  onOpenModal,
}: {
  chapter: (typeof PROJECT_CHAPTERS)[0];
  index: number;
  onOpenModal: () => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    mass: 0.4,
  });

  const titleY = useTransform(smooth, [0, 1], [-60, 70]);
  const imageY = useTransform(smooth, [0, 1], [90, -80]);
  const imageRotate = useTransform(
    smooth,
    [0, 0.5, 1],
    [index % 2 === 0 ? -2.2 : 2.2, 0, index % 2 === 0 ? 1.5 : -1.5]
  );

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-[115vh] w-full overflow-hidden ${chapter.bgClass} ${chapter.textClass} py-28 md:py-36 transition-colors duration-700 flex flex-col justify-between`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808014_1px,transparent_1px),linear-gradient(to_bottom,#80808014_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_40%,transparent_100%)]" />

      {/* Meta header bar */}
      <div className="relative z-20 mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 md:px-12">
        <span className="font-mono-tag text-[11px] tracking-[0.2em] uppercase opacity-75 font-semibold text-[#B5472B]">
          {chapter.tag}
        </span>
        <span className="font-mono-tag text-[11px] tracking-[0.2em] opacity-60">
          CHAPTER / {chapter.id}
        </span>
      </div>

      {/* Central composition: Giant Title + Overlapping Picture */}
      <div className="relative mx-auto my-auto flex w-full max-w-[1440px] flex-col items-center justify-center px-4 pt-6">
        <motion.div
          style={{ y: titleY }}
          className="relative z-10 text-center pointer-events-none select-none"
        >
          <h2 className="font-editorial text-[13vw] sm:text-[10vw] md:text-[8.5rem] lg:text-[10rem] font-normal leading-[0.88] tracking-[-0.03em]">
            <span className="block">{chapter.titleLine1}</span>
            <span className="block italic font-light">{chapter.titleLine2}</span>
            {chapter.titleLine3 && (
              <span className="block">{chapter.titleLine3}</span>
            )}
          </h2>
        </motion.div>

        <motion.div
          style={{ y: imageY, rotate: imageRotate }}
          className="relative z-20 -mt-6 sm:-mt-12 md:-mt-16 w-[78vw] max-w-[360px] md:max-w-[400px] aspect-[3/4.2]"
        >
          <ParallaxPicture
            src={chapter.image}
            alt={chapter.titleLine1}
            badge={chapter.badge}
            speed={16}
            className="h-full w-full rounded-[6px]"
          />
        </motion.div>
      </div>

      {/* Description + CTA */}
      <div className="relative z-30 mx-auto mt-12 grid w-full max-w-[1400px] grid-cols-1 gap-8 px-6 md:grid-cols-12 md:px-12">
        <div className="hidden md:col-span-7 md:flex items-end">
          <div className="h-[1px] w-32 bg-current opacity-20" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="md:col-span-5 space-y-6"
        >
          <p className={`text-sm md:text-[15px] leading-[1.8] ${chapter.mutedClass}`}>
            {chapter.description}
          </p>
          <EditorialButton
            label="Get a Voucher Free"
            light={chapter.lightBtn}
            onClick={onOpenModal}
          />
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// 6. MAIN COMPONENT (LOCAL GUARANTOR)
// ============================================================================
export default function LandingSection() {
  useSmoothScroll();

  // Hero Parallax
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const smoothHero = useSpring(heroScroll, { stiffness: 70, damping: 20 });
  const heroBgY = useTransform(smoothHero, [0, 1], ["0%", "28%"]);
  const heroBgScale = useTransform(smoothHero, [0, 1], [1.05, 1.22]);
  const heroTextY = useTransform(smoothHero, [0, 1], ["0%", "45%"]);
  const heroOpacity = useTransform(smoothHero, [0, 0.85], [1, 0]);

  // Story horizontal slices parallax
  const storyRef = useRef<HTMLElement>(null);
  const { scrollYProgress: storyScroll } = useScroll({
    target: storyRef,
    offset: ["start end", "end start"],
  });
  const smoothStory = useSpring(storyScroll, { stiffness: 60, damping: 20 });
  const slice1X = useTransform(smoothStory, [0, 1], ["-3%", "3%"]);
  const slice2X = useTransform(smoothStory, [0, 1], ["4%", "-4%"]);
  const slice3X = useTransform(smoothStory, [0, 1], ["-2%", "2%"]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<VouchFormData>({
    name: "",
    phone: "",
    telegram: "",
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.telegram.trim()) {
      setErrorMessage("Please fill in your name, phone, and Telegram handle.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await sendTelegramNotification(formData);

    setIsSubmitting(false);
    if (result.success) {
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsModalOpen(false);
        setFormData({ name: "", phone: "", telegram: "", comment: "" });
      }, 3500);
    } else {
      setErrorMessage(
        result.error || "Failed to deliver notification to Telegram. Please try again."
      );
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const win = window as unknown as { lenisInstance?: any };
    if (win.lenisInstance) {
      win.lenisInstance.scrollTo(id, { offset: -70, duration: 1.2 });
    } else {
      const el = document.querySelector(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#EAE6DF] text-[#141414] selection:bg-[#B5472B] selection:text-white">
      {/* =====================================================================
          FLOATING GLASS HEADER (Fully Synchronized)
      ===================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 md:px-12 text-white">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-lg font-bold tracking-[-0.03em] uppercase flex items-center gap-2.5 font-serif focus:outline-none"
          >
            <span className="text-white font-extrabold tracking-wider">LOCAL GUARANTOR.</span>
            <span className="inline-block h-2 w-2 rounded-full bg-[#B5472B] animate-pulse" />
          </button>

          {/* Desktop Nav - Synchronized with Lenis */}
          <nav className="hidden lg:flex items-center gap-7 text-xs tracking-[0.04em] text-white/80">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="hover:text-white transition-colors focus:outline-none font-medium cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-md transition-all hover:border-[#B5472B]/60 hover:bg-[#B5472B] hover:text-white cursor-pointer"
            >
              <span>Get a Voucher</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex lg:hidden h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-b border-white/15 bg-black/95 px-6 py-5 backdrop-blur-2xl"
            >
              <div className="flex flex-col gap-3 text-xs text-zinc-300">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="flex items-center justify-between py-2 text-left hover:text-white border-b border-white/5 cursor-pointer"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="h-3 w-3 text-zinc-500" />
                  </button>
                ))}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsModalOpen(true);
                  }}
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#B5472B] py-3 text-xs font-semibold text-white cursor-pointer"
                >
                  <span>Request a Voucher Now</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* =====================================================================
          1. HERO SECTION (Aesthetic Suburban Architecture · Perfectly Fitted Viewport)
      ===================================================================== */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#0A0C0B] pt-20 pb-2 md:pt-24 text-white"
      >
        <motion.div
          style={{ y: heroBgY, scale: heroBgScale }}
          className="pointer-events-none absolute inset-0 z-0"
        >
          <img
            src="/hero-suburban.jpg"
            alt="Aesthetic modern suburban neighborhood street with green lawns and warm glowing windows at twilight"
            className="h-full w-full object-cover object-center brightness-[0.76] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />
        </motion.div>

        {/* Central Hero Heading - Fitted & Proportional */}
        <motion.div
          style={{ y: heroTextY, opacity: heroOpacity }}
          className="relative z-10 mx-auto my-auto w-full max-w-[1440px] px-6 md:px-12 py-4"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#B5472B]/35 bg-[#B5472B]/15 px-3.5 py-1 backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-[#D9A64E]" />
            <span className="font-mono-tag text-[10px] tracking-[0.2em] uppercase text-zinc-200">
              STUDENT PILOT • NARXOZ UNIVERSITY • ALMATY
            </span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-[5.4rem] xl:text-[6.2rem] font-normal leading-[0.92] tracking-[-0.03em] text-white">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                A local student,
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="italic font-light text-white/95"
              >
                who vouches
              </motion.span>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="md:pl-[18vw] text-white/95"
            >
              for you in Almaty
            </motion.div>
          </h1>

          {/* Clean, Non-Animated Luxury Button & Balanced Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-6 md:mt-8 flex flex-wrap items-center gap-5 md:pl-[18vw]"
          >
            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative inline-flex items-center gap-3 rounded-full border border-white/20 bg-[#161a18] px-6 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.15)] transition-all duration-300 hover:border-[#B5472B]/60 hover:bg-[#B5472B] hover:shadow-[0_15px_35px_-10px_rgba(181,71,43,0.6)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get a Voucher — 100% Free</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <p className="max-w-md text-xs leading-relaxed text-zinc-300">
              Matches non-local Narxoz students with a settled local peer who calls the landlord before you pay anything. 100% free pilot.
            </p>
          </motion.div>
        </motion.div>

        {/* Bottom Metrics Bar (Compact & Sleek) */}
        <div className="relative z-10 border-t border-white/15 bg-black/40 backdrop-blur-md">
          <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-4 px-6 py-4 sm:grid-cols-4 md:grid-cols-12 md:px-12 items-center">
            <div className="md:col-span-3">
              <div className="text-2xl md:text-3xl font-light tracking-tight text-white font-editorial">
                75%
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-zinc-300">
                of non-local students interviewed lost money or housing to scams & refusals
              </p>
            </div>

            <div className="md:col-span-3">
              <div className="text-2xl md:text-3xl font-light tracking-tight text-white font-editorial">
                0 ₸
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-zinc-300">
                Commission or hidden fees: volunteer student solidarity, no broker cuts
              </p>
            </div>

            <div className="md:col-span-3">
              <div className="text-2xl md:text-3xl font-light tracking-tight text-white font-editorial">
                42 sec
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-zinc-300">
                Average voucher phone call duration that unlocks an apartment viewing
              </p>
            </div>

            <div className="col-span-2 sm:col-span-4 md:col-span-3 flex justify-end">
              <button
                onClick={() => scrollToSection("#about")}
                className="group inline-flex items-center gap-2 text-xs font-mono-tag tracking-widest uppercase text-zinc-300 hover:text-white cursor-pointer focus:outline-none"
              >
                <span>Scroll down</span>
                <ArrowDown className="h-3.5 w-3.5 animate-bounce text-[#B5472B]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. EDITORIAL MANIFESTO & ASYMMETRIC GRID (#EAE6DF)
      ===================================================================== */}
      <section
        id="about"
        className="relative w-full bg-[#EAE6DF] px-6 py-28 md:px-12 md:py-40 text-[#141414]"
      >
        <div className="mx-auto max-w-[1380px]">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9 }}
            className="mx-auto max-w-4xl text-center font-editorial text-3xl sm:text-5xl md:text-[3.5rem] font-normal leading-[1.12] tracking-[-0.02em]"
          >
            Local Guarantor is a student backing service that{" "}
            <span className="italic font-light">closes the trust gap</span>{" "}
            between Almaty landlords and arriving Narxoz freshmen.
          </motion.h2>

          <div className="mt-24 grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8 items-start">
            {/* Left Column: Real Cozy Student Flat Interior */}
            <div className="md:col-span-6 lg:col-span-5">
              <ParallaxPicture
                src="/manifesto-interior.jpg"
                alt="Student Apartment Living in Almaty"
                badge="ALMATY • BOSTANDYK DISTRICT"
                speed={15}
                className="aspect-[3.8/4.6] w-full rounded-[6px]"
              />
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-6 max-w-sm text-xs leading-[1.7] text-zinc-700 md:ml-12"
              >
                Students who have an older brother, uncle, or relative in the city rarely get turned away. We want to give every student that exact same credible backing.
              </motion.p>
            </div>

            {/* Right Column: Students Collaborating on Campus */}
            <div className="md:col-span-6 lg:col-span-5 lg:col-start-8 flex flex-col justify-between space-y-16 md:pt-8">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="max-w-sm text-xs md:text-sm leading-[1.8] text-zinc-800"
              >
                No predatory middlemen, no apps, no hidden fees. We verify your chosen Krisha.kz listing, speak directly with the landlord, and prove that you have real peer backing from Narxoz University.
              </motion.p>

              <div className="w-full max-w-[320px] self-end">
                <ParallaxPicture
                  src="/manifesto-study.jpg"
                  alt="Narxoz Library Study Session"
                  badge="NARXOZ STUDY • ALMATY"
                  speed={20}
                  className="aspect-[4/5] w-full rounded-[6px]"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================================
          2. EMPIRICAL 12 FIELD INTERVIEWS & LIVE CALL PROOF (#interviews)
      ===================================================================== */}
      <section
        id="interviews"
        className="relative w-full bg-[#0D0F0E] px-6 py-28 md:px-12 md:py-36 text-white border-t border-white/10"
      >
        <div className="mx-auto max-w-[1400px]">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-mono-tag text-[10px] tracking-[0.24em] text-[#B5472B] uppercase font-bold">
              ( 12 IN-DEPTH FIELD INTERVIEWS • EMPIRICAL NARXOZ RESEARCH )
            </span>
            <h2 className="mt-4 font-editorial text-4xl sm:text-5xl md:text-[3.8rem] font-normal leading-[1.05]">
              This isn't hypothetical.
              <br />
              <span className="italic font-light">It's what 12 non-local students told us directly.</span>
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
              We conducted qualitative field research with freshmen arriving at Narxoz University in Almaty. 75% described losing money, time, or housing before even attending their first university lecture.
            </p>
          </div>

          {/* 3 Metric Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="rounded-2xl border border-white/10 bg-[#161917]/70 p-6 backdrop-blur-md">
              <div className="font-editorial text-4xl text-[#B5472B] font-light">75%</div>
              <p className="mt-2 text-xs text-zinc-300 leading-snug">
                of non-local students interviewed suffered direct financial loss or rental refusal due to lack of local backing.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#161917]/70 p-6 backdrop-blur-md">
              <div className="font-editorial text-4xl text-[#D9A64E] font-light">33%</div>
              <p className="mt-2 text-xs text-zinc-300 leading-snug">
                were rejected 8–9 times consecutively the very moment the landlord heard the word “student”.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#161917]/70 p-6 backdrop-blur-md">
              <div className="font-editorial text-4xl text-emerald-400 font-light">42 sec</div>
              <p className="mt-2 text-xs text-zinc-300 leading-snug">
                Average call duration from a local student voucher required to dissolve suspicion and book a viewing.
              </p>
            </div>
          </div>

          {/* Quotes Grid + Interactive Live Call Simulation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* 6 Real Quotation Cards (Span 7 cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {INTERVIEW_FINDINGS.map((finding, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-[#161917]/80 p-5 backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-colors"
                >
                  <div>
                    <span className="font-mono-tag text-[9px] tracking-widest text-[#B5472B] uppercase font-bold">
                      {finding.tag}
                    </span>
                    <div className="border-l-2 border-[#B5472B] pl-3 py-1 my-3">
                      <p className="font-serif italic text-sm text-zinc-200 leading-snug">
                        “{finding.quote}”
                      </p>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {finding.context}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono-tag text-[#D9A64E]">
                    <span>{finding.metric}</span>
                    <Check className="h-3 w-3 text-emerald-400" />
                  </div>
                </div>
              ))}
            </div>

            {/* Live Call Simulator (Span 5 cols) */}
            <div className="lg:col-span-5 sticky top-24">
              <LiveCallSimulation onOpenModal={() => setIsModalOpen(true)} />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. THREE MONUMENTAL PARALLAX CHAPTERS (How It Works)
      ===================================================================== */}
      <div id="how-it-works">
        {PROJECT_CHAPTERS.map((chapter, index) => (
          <ShowcaseChapter
            key={chapter.id}
            chapter={chapter}
            index={index}
            onOpenModal={() => setIsModalOpen(true)}
          />
        ))}
      </div>

      {/* =====================================================================
          4. 21st.dev SPOTLIGHT INSIGHTS BENCHMARK
      ===================================================================== */}
      <section id="cases" className="relative w-full bg-[#EAE6DF] px-6 py-32 md:px-12 md:py-44 text-[#141414]">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 md:grid-cols-12 mb-16">
            <div className="md:col-span-8 md:col-start-4 text-center md:text-left">
              <span className="font-mono-tag text-[10px] tracking-[0.22em] text-[#B5472B] uppercase font-bold">
                ( EMPIRICAL KNOWLEDGE BASE )
              </span>
              <h2 className="mt-4 font-editorial text-4xl sm:text-6xl md:text-[4.2rem] font-normal leading-[1.02] tracking-[-0.02em]">
                What students told us, and how we resolve every friction
              </h2>
            </div>
          </div>

          {/* Grid of Interactive Spotlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <InteractiveInsightCard
              tag="AUTOMATIC REFUSALS"
              title="“No students allowed”"
              quote="We only rent to married couples without kids. No students under any circumstances."
              solution="Our 42-second voucher call breaks the stereotype: landlords hear a calm peer vouching for you and agree to a viewing."
              icon={PhoneCall}
              onClick={() => setIsModalOpen(true)}
            />

            <InteractiveInsightCard
              tag="BROKER SCAMS"
              title="“Most agents are predatory”"
              quote="They took 15,000 ₸ upfront for an exclusive list of landlord numbers that were all fake."
              solution="0 ₸ commission, always. We are fellow students, not real estate agents. We never charge for vouching."
              icon={ShieldCheck}
              onClick={() => setIsModalOpen(true)}
            />

            <InteractiveInsightCard
              tag="RENTAL SPIKES"
              title="“300,000 ₸ for a studio”"
              quote="Prices double in August and September exploiting the panic of arriving freshmen."
              solution="Objective guidance on fair rental rates across Almaty districts (Auezov, Bostandyk, Almaly)."
              icon={Compass}
              onClick={() => setIsModalOpen(true)}
            />

            <InteractiveInsightCard
              tag="KASPI TRANSFERS"
              title="“No transfers before viewing”"
              quote="They asked for a deposit via Kaspi to hold the viewing slot, then immediately blocked me."
              solution="Strict safety rule: verify official ownership documents and never wire money before inspecting in person."
              icon={Lock}
              onClick={() => setIsModalOpen(true)}
            />
          </div>

          {/* Value Comparison Table (What you get vs what students told us) */}
          <div className="mt-24 border-t border-black/10 pt-16">
            <div className="mb-10 text-center md:text-left">
              <span className="font-mono-tag text-[10px] tracking-[0.22em] text-[#B5472B] uppercase font-bold">
                ( WHAT YOU GET VS. WHAT STUDENTS WORRIED ABOUT )
              </span>
              <h3 className="mt-3 font-editorial text-3xl sm:text-5xl font-normal text-[#141414] leading-tight">
                Direct answers to the real fears non-local students expressed
              </h3>
            </div>

            <div className="space-y-4">
              {VALUE_COMPARISONS.map((comp, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-black/10 bg-[#FBF9F5] p-6 md:p-8 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-4 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-tag text-[10px] tracking-wider text-[#B5472B] font-bold uppercase">
                          {comp.pillar}
                        </span>
                        <span className="rounded-full bg-[#141414] text-white px-2.5 py-0.5 text-[9px] font-mono-tag uppercase tracking-widest">
                          {comp.badge}
                        </span>
                      </div>
                      <h4 className="font-editorial text-xl font-medium text-[#141414]">
                        {comp.headline}
                      </h4>
                    </div>

                    <div className="md:col-span-4 rounded-xl border border-rose-500/20 bg-rose-50/70 p-4">
                      <div className="text-[10px] font-mono-tag uppercase text-rose-700 font-bold mb-1">
                        WHAT STUDENTS TOLD US
                      </div>
                      <p className="text-xs sm:text-sm italic text-zinc-800 font-serif">
                        “{comp.studentQuote}”
                      </p>
                    </div>

                    <div className="md:col-span-4 rounded-xl border border-emerald-500/30 bg-emerald-50/80 p-4">
                      <div className="text-[10px] font-mono-tag uppercase text-emerald-800 font-bold mb-1">
                        OUR SYSTEM RESOLUTION
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-900 leading-relaxed font-medium">
                        {comp.ourAnswer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. FAQ SECTION ("Questions, Answered")
      ===================================================================== */}
      <section
        id="faq"
        className="relative w-full bg-[#0D0F0E] px-6 py-28 md:px-12 md:py-36 text-white border-t border-white/10"
      >
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="font-mono-tag text-[10px] tracking-[0.24em] text-[#B5472B] uppercase font-bold">
              ( FREQUENTLY ASKED QUESTIONS )
            </span>
            <h2 className="mt-4 font-editorial text-4xl sm:text-5xl font-normal leading-tight">
              Questions, answered with complete transparency
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-zinc-400">
              Everything you need to know about how our student voucher pilot works in Almaty.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <FaqItem
                key={idx}
                item={faq}
                isOpen={openFaq === idx}
                onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
              />
            ))}
          </div>

          {/* Quick Contact CTA in FAQ */}
          <div className="mt-14 rounded-2xl border border-white/10 bg-[#161917]/70 p-6 md:p-8 backdrop-blur-md text-center flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="text-left">
              <h4 className="font-editorial text-xl font-normal text-white">Have a specific Krisha.kz listing to check?</h4>
              <p className="text-xs text-zinc-400 mt-1">Send the link directly to our coordinator on Telegram for immediate peer advice.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#B5472B] px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-[#8F3620] transition-colors cursor-pointer"
            >
              <span>Get a Voucher Free</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. STORY SECTION (Team SUA · Tech Entrepreneurship)
      ===================================================================== */}
      <section
        id="team"
        ref={storyRef}
        className="relative flex min-h-[105vh] w-full flex-col items-center justify-between overflow-hidden bg-[#0A0C0B] px-6 py-28 text-white md:px-12"
      >
        <div className="pointer-events-none absolute inset-0 z-0 flex flex-col overflow-hidden opacity-45">
          <motion.div style={{ x: slice1X }} className="h-1/3 w-[110%] -ml-[5%] overflow-hidden">
            <img
              src="/team-sua.jpg"
              alt="Team SUA Slice 1"
              className="h-[300%] w-full object-cover object-top scale-105"
            />
          </motion.div>
          <motion.div style={{ x: slice2X }} className="h-1/3 w-[110%] -ml-[5%] overflow-hidden border-y border-white/10">
            <img
              src="/team-sua.jpg"
              alt="Team SUA Slice 2"
              className="h-[300%] w-full -translate-y-1/3 object-cover object-center scale-105"
            />
          </motion.div>
          <motion.div style={{ x: slice3X }} className="h-1/3 w-[110%] -ml-[5%] overflow-hidden">
            <img
              src="/team-sua.jpg"
              alt="Team SUA Slice 3"
              className="h-[300%] w-full -translate-y-2/3 object-cover object-bottom scale-105"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/45 to-black/90" />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <span className="font-mono-tag text-[10px] tracking-[0.24em] text-[#D9A64E] uppercase font-bold">
            ( TEAM SUA • TECH ENTREPRENEURSHIP )
          </span>
          <h2 className="mt-5 font-editorial text-4xl sm:text-6xl md:text-[4.25rem] font-normal leading-[1.02]">
            We are Narxoz students solving a problem we lived through ourselves
          </h2>
        </div>

        <div className="relative z-10 my-10 w-full max-w-xl text-center space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
          <p>
            “Picture arriving in Almaty with no family nearby and a semester starting in two weeks. You call listing after listing, and the answer keeps being 'we don't rent to students.' Students with local relatives avoid this — we want to give every student that same backing.”
          </p>
          <p className="font-editorial text-lg text-white font-medium">
            — Claudio, Yersultan Aldanazar &amp; Yerkezhan, Team SUA
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-mono-tag text-zinc-400">
            <a href="tel:+77085010270" className="hover:text-white transition-colors">
              📞 +7 708 501 02 70 (Yersultan)
            </a>
            <span>•</span>
            <a href="mailto:yersultan.aldanazar@narxoz.kz" className="hover:text-white transition-colors">
              ✉️ yersultan.aldanazar@narxoz.kz
            </a>
            <span>•</span>
            <a href="https://t.me/RakDinn" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              ✈️ @RakDinn
            </a>
          </div>
        </div>

        <div className="relative z-10">
          <EditorialButton
            label="Request Voucher on Telegram"
            light
            onClick={() => setIsModalOpen(true)}
          />
        </div>
      </section>

      {/* =====================================================================
          6. MONUMENTAL FOOTER (LG. Monogram + Full-width Wordmark)
      ===================================================================== */}
      <footer className="relative w-full overflow-hidden bg-[#0A0C0B] pt-24 pb-6 text-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-10 px-6 sm:grid-cols-4 md:px-12 text-xs">
          <div className="space-y-4">
            <div className="font-mono-tag text-[10px] tracking-[0.2em] text-[#B5472B] uppercase font-bold">
              ( STUDENTS )
            </div>
            <ul className="space-y-2.5 text-zinc-300">
              <li>
                <button onClick={() => setIsModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">
                  Request a Voucher
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("#interviews")} className="hover:text-white transition-colors cursor-pointer">
                  12 Field Interviews
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("#how-it-works")} className="hover:text-white transition-colors cursor-pointer">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("#cases")} className="hover:text-white transition-colors cursor-pointer">
                  Friction &amp; Proof
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("#faq")} className="hover:text-white transition-colors cursor-pointer">
                  FAQ ("Questions, Answered")
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="font-mono-tag text-[10px] tracking-[0.2em] text-[#B5472B] uppercase font-bold">
              ( LANDLORDS )
            </div>
            <ul className="space-y-2.5 text-zinc-300">
              <li>
                <span className="text-zinc-400">Student Identity Verification</span>
              </li>
              <li>
                <span className="text-zinc-400">Narxoz University Enrollment</span>
              </li>
              <li>
                <span className="text-zinc-400">Direct Dialogue (No Middlemen)</span>
              </li>
              <li>
                <span className="text-zinc-400">0 ₸ Commission Protection</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="font-mono-tag text-[10px] tracking-[0.2em] text-[#B5472B] uppercase font-bold">
              ( ABOUT PILOT )
            </div>
            <ul className="space-y-2.5 text-zinc-300">
              <li>
                <span>Tech Entrepreneurship</span>
              </li>
              <li>
                <span>Narxoz University, Almaty</span>
              </li>
              <li>
                <button onClick={() => scrollToSection("#team")} className="hover:text-white transition-colors text-left cursor-pointer">
                  Team SUA (Claudio, Yersultan, Yerkezhan)
                </button>
              </li>
              <li>
                <span className="text-[11px] text-zinc-500">Student pilot — not an official university department</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="font-mono-tag text-[10px] tracking-[0.2em] text-[#B5472B] uppercase font-bold">
              ( CONTACT )
            </div>
            <ul className="space-y-2.5 text-zinc-300">
              <li>
                <a href="tel:+77085010270" className="hover:text-white transition-colors">
                  📞 +7 708 501 02 70 (Yersultan)
                </a>
              </li>
              <li>
                <a href="mailto:yersultan.aldanazar@narxoz.kz" className="hover:text-white transition-colors">
                  ✉️ yersultan.aldanazar@narxoz.kz
                </a>
              </li>
              <li>
                <a href="mailto:uwagbaclaudio@gmail.com" className="hover:text-white transition-colors">
                  ✉️ uwagbaclaudio@gmail.com
                </a>
              </li>
              <li>
                <a href="https://t.me/RakDinn" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  ✈️ Telegram: @RakDinn ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 3D Monogram Cube */}
        <div className="my-20 flex flex-col items-center justify-center">
          <motion.div
            whileHover={{ rotateY: 18, rotateX: -12, scale: 1.06 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            style={{ transformStyle: "preserve-3d" }}
            onClick={() => setIsModalOpen(true)}
            className="relative flex h-28 w-28 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-zinc-200 via-zinc-400 to-[#B5472B]/60 text-[#141414] shadow-[0_25px_70px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.8)] cursor-pointer select-none"
          >
            <span className="font-extrabold text-5xl tracking-tighter drop-shadow-[0_2px_3px_rgba(255,255,255,0.5)] font-serif">
              LG.
            </span>
          </motion.div>
          <span className="mt-3 text-[11px] font-mono-tag text-zinc-400">
            LOCAL GUARANTOR • ALMATY
          </span>
        </div>

        {/* Copyright strip */}
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between border-b border-white/10 px-6 pb-4 text-[11px] text-zinc-500 md:px-12">
          <span>© 2026 Local Guarantor. Student Pilot at Narxoz University. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="https://t.me/RakDinn" target="_blank" rel="noreferrer" className="hover:text-zinc-300">
              Coordinator: @RakDinn
            </a>
            <span className="text-zinc-400">Almaty, Kazakhstan</span>
          </div>
        </div>

        {/* MONUMENTAL FULL-WIDTH BRAND WORDMARK */}
        <div className="mt-2 w-full overflow-hidden text-center leading-none select-none">
          <motion.div
            initial={{ y: "30%", opacity: 0 }}
            whileInView={{ y: "0%", opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[14.5vw] font-black tracking-[-0.05em] text-[#423C36]/80 font-serif"
          >
            LOCAL GUARANTOR.
          </motion.div>
        </div>
      </footer>

      {/* =====================================================================
          7. INTERACTIVE TELEGRAM LEAD MODAL (Connected to src/lib/telegram.ts)
      ===================================================================== */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 280, damping: 25 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-[#121614] p-7 text-white shadow-2xl"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-6">
                <span className="font-mono-tag text-[10px] tracking-[0.2em] uppercase text-[#D9A64E]">
                  STUDENT PILOT • 100% FREE
                </span>
                <h3 className="font-editorial text-3xl font-normal text-white mt-1">
                  Request a Local Voucher
                </h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Fill in your details below. A fellow Narxoz student will contact you and call the Almaty landlord on your behalf. Instantly delivered to the team Telegram group.
                </p>
              </div>

              {submitSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-6 text-center space-y-3"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h4 className="text-base font-semibold text-white">
                    Request successfully dispatched!
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    The notification has been delivered directly to the Narxoz team Telegram. Yersultan or our coordinator will contact you shortly.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="rounded-lg border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300">
                      {errorMessage}
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-mono-tag uppercase text-zinc-400 mb-1.5">
                      Your Full Name & Year of Study *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alina, Freshman at Narxoz"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#B5472B] focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono-tag uppercase text-zinc-400 mb-1.5">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+7 708 000 00 00"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#B5472B] focus:bg-white/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono-tag uppercase text-zinc-400 mb-1.5">
                        Telegram Handle (@username) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="@username"
                        value={formData.telegram}
                        onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#B5472B] focus:bg-white/10 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono-tag uppercase text-zinc-400 mb-1.5">
                      Listing Link (Krisha.kz) or Preferred District
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Paste link to Krisha.kz listing or specify which area you're looking to rent..."
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#B5472B] focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#B5472B] px-6 py-3.5 text-xs font-semibold text-white shadow-[0_10px_30px_-8px_rgba(181,71,43,0.6)] hover:bg-[#8F3620] disabled:opacity-50 transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Dispatching to Telegram Bot...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Send Request to Voucher</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center pt-2 text-[10px] text-zinc-500">
                    By submitting, your request is safely delivered to the Team SUA pilot coordinators at Narxoz.
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
