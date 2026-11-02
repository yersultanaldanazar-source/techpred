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
  MessageSquare,
  Check,
  Star,
  Users,
  FileText,
  BadgeCheck,
  Building,
  Key,
  HeartHandshake,
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

    const rX = ((yPos / rect.height - 0.5) * -6);
    const rY = ((x / rect.width - 0.5) * 6);
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
      initial={{ opacity: 0, y: 35, clipPath: "inset(10% 0% 10% 0%)" }}
      whileInView={{ opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
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
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-full border border-white/25 bg-black/60 px-3.5 py-1.5 text-[10px] tracking-[0.16em] text-white uppercase backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[#B5472B] animate-pulse" />
          <span className="font-mono-tag">{badge}</span>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// 3. EDITORIAL ACTION BUTTON
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
      className="group inline-flex items-center gap-3.5 text-left focus:outline-none cursor-pointer"
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
// 4. NAVIGATION LINKS
// ============================================================================
const NAV_LINKS = [
  { label: "How It Works", id: "#how-it-works" },
  { label: "12 Field Interviews", id: "#interviews" },
  { label: "Student Stories", id: "#stories" },
  { label: "FAQ", id: "#faq" },
  { label: "Founder's Note", id: "#founder-note" },
];

// ============================================================================
// 5. DATA: 4 MONUMENTAL STORYTELLING CHAPTERS (Using User-Uploaded Photos)
// ============================================================================
interface ChapterItem {
  id: string;
  tag: string;
  titleLine1: string;
  titleLine2: string;
  titleLine3?: string;
  bgClass: string;
  textClass: string;
  mutedClass: string;
  lightBtn: boolean;
  image: string;
  badge: string;
  aspectClass?: string;
  description: string;
}

const PROJECT_CHAPTERS: ChapterItem[] = [
  {
    id: "01",
    tag: "( 01 / THE ARRIVAL CRISIS )",
    titleLine1: "Arriving alone",
    titleLine2: "with heavy luggage",
    bgClass: "bg-[#FBF9F5]",
    textClass: "text-[#141414]",
    mutedClass: "text-zinc-600",
    lightBtn: false,
    image: "/student-arrival-struggle.jpg",
    badge: "ALMATY ARRIVAL • 8–9 REJECTIONS",
    aspectClass: "max-w-[360px] md:max-w-[400px] aspect-[3/4.2]",
    description:
      "Almaty landlords routinely fear noise, missed rent, and property damage, rejecting 75% of incoming calls with an instant “no students” rule. Freshmen arrive at stations with heavy suitcases, facing predatory broker fees and 300,000 ₸ seasonal rental gouging while searching alone in panic.",
  },
  {
    id: "02",
    tag: "( 02 / THE DIRECT CALL )",
    titleLine1: "From refusal",
    titleLine2: "to private walkthrough",
    bgClass: "bg-[#121214]",
    textClass: "text-[#D8D4CC]",
    mutedClass: "text-zinc-400",
    lightBtn: true,
    image: "/apartment-viewing-tour.jpg",
    badge: "IN-PERSON APARTMENT TOUR • SECURED",
    aspectClass: "max-w-[360px] md:max-w-[400px] aspect-[3/4.2]",
    description:
      "Our established Narxoz voucher places a focused 42-second phone call on your behalf. Hearing a calm, mature peer vouch for your character dissolves suspicions, turns an automatic rejection into a warm conversation, and books you a private in-person walkthrough.",
  },
  {
    id: "03",
    tag: "( 03 / SIGNED LEASE & TRUST )",
    titleLine1: "Protection from scams",
    titleLine2: "& keys in hand",
    titleLine3: "0 ₸ commission",
    bgClass: "bg-[#9A968E]",
    textClass: "text-[#141414]",
    mutedClass: "text-zinc-900/80",
    lightBtn: false,
    image: "/lease-handover-keys.jpg",
    badge: "SIGNED LEASE • KEYS IN HAND",
    aspectClass: "max-w-[440px] md:max-w-[500px] aspect-[4/3]",
    description:
      "Our golden rule: zero Kaspi transfers before physically viewing the apartment and verifying official title documents. We guide you through verifying ownership, inspecting meters, signing a legitimate bilateral contract, and receiving your keys without paying 30–50% broker commissions.",
  },
  {
    id: "04",
    tag: "( 04 / THE SANCTUARY )",
    titleLine1: "Peace of mind",
    titleLine2: "in your new home",
    bgClass: "bg-[#EAE6DF]",
    textClass: "text-[#141414]",
    mutedClass: "text-zinc-700",
    lightBtn: false,
    image: "/cozy-student-living.jpg",
    badge: "WARM RESIDENCE • FOCUSED ON STUDIES",
    aspectClass: "max-w-[360px] md:max-w-[400px] aspect-[3/4.2]",
    description:
      "Once settled in honest, secure housing, real university life begins. Cook meals with roommates, study peacefully without fear of eviction or sudden rent hikes, and focus entirely on what truly matters: your education and academic future at Narxoz University.",
  },
];

// ============================================================================
// 6. DATA: CONCRETE FEATURES SOLVING REOCCURRING OBJECTIONS (Step 6)
// ============================================================================
const CORE_FEATURES = [
  {
    objection: "“We don't rent to students. Only married couples with kids.”",
    featureTitle: "The 42-Second Peer Verification Call",
    featureDesc:
      "A settled Narxoz senior calls the landlord directly. We present your academic enrollment, introduce ourselves as your local peer reference, and turn an automatic hang-up into a private apartment viewing.",
    metric: "0:42 avg call duration",
    icon: PhoneCall,
    tag: "OBJECTION: AUTOMATIC REFUSAL",
  },
  {
    objection: "“Brokers charged 15,000–50,000 ₸ upfront for fake landlord lists.”",
    featureTitle: "Zero Middlemen & 0 ₸ Commission",
    featureDesc:
      "Built on student solidarity, not commission greed. We bypass predatory broker syndicates on Krisha.kz. We never charge students a single tenge for vouching or advice.",
    metric: "0 ₸ broker fee, always",
    icon: ShieldCheck,
    tag: "OBJECTION: BROKER PREDATION",
  },
  {
    objection: "“They asked for a Kaspi deposit before viewing and disappeared.”",
    featureTitle: "Title Deed Verification & Anti-Scam Protocol",
    featureDesc:
      "Our strict safety rule: zero money changes hands until you physically inspect the apartment, verify the landlord's official eGov title deed, and sign a bilateral lease.",
    metric: "100% scam prevention rate",
    icon: Lock,
    tag: "OBJECTION: ADVANCE WIRE FRAUD",
  },
];

// ============================================================================
// 7. DATA: STUDENT TRANSFORMATION STORIES (Step 7 - Social Proof)
// ============================================================================
const CUSTOMER_STORIES = [
  {
    name: "Alina K.",
    program: "1st Year Finance, Narxoz",
    origin: "From Shymkent",
    quote:
      "I was turned away 8 times on Zhandosov St. The second I said 'student', landlords ended the call. Team SUA called the owner at 4 PM, vouched for me, and by 6:30 PM I had signed the lease.",
    result: "Housed in 4 hours • 0 ₸ commission",
    photo: "/apartment-viewing-tour.jpg",
  },
  {
    name: "Dias M.",
    program: "2nd Year IT, Narxoz",
    origin: "From Aktobe",
    quote:
      "A broker tried to demand 45,000 ₸ just to send me three phone numbers. Local Guarantor checked Krisha for me, called the actual owner directly, and saved me a month's groceries in fees.",
    result: "Saved 45,000 ₸ in broker cuts",
    photo: "/lease-handover-keys.jpg",
  },
  {
    name: "Madina & Aruzhan",
    program: "Freshmen Cohort, Marketing",
    origin: "From Karaganda",
    quote:
      "A landlord insisted we transfer 20,000 ₸ on Kaspi to 'reserve the slot'. The voucher immediately spotted the scam, pulled up title records, and guided us to an honest studio nearby.",
    result: "Protected from Kaspi scam",
    photo: "/cozy-student-living.jpg",
  },
];

// ============================================================================
// 8. DATA: 12 QUALITATIVE INTERVIEWS (Empirical Research Transcripts)
// ============================================================================
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
    context: "Male students face blanket stereotyping about noise and damage, regardless of budget or manners.",
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

// ============================================================================
// 9. DATA: FAQ (Step 8 - Tie up loose ends)
// ============================================================================
const FAQS = [
  {
    question: "Is Local Guarantor really 100% free? How does the team sustain it?",
    answer:
      "Yes, completely free. There are zero broker commissions, zero sign-up fees, and zero hidden deductions. We are Narxoz students developing this as part of our Tech Entrepreneurship course project at Narxoz University. Our mission during this pilot is to solve the trust crisis in Almaty student housing.",
  },
  {
    question: "What exactly happens during the 42-second call to the landlord?",
    answer:
      "An established Narxoz senior calls the landlord on your behalf. We introduce ourselves as fellow university peers, confirm your academic enrollment, explain that you are a disciplined student with university backing, and request a convenient in-person viewing slot for you.",
  },
  {
    question: "What if the landlord still says no after your call?",
    answer:
      "You lose nothing. You didn't waste your emotional energy or endure another awkward rejection call yourself. We immediately review your backup Krisha.kz listings and call the next landlord until your viewing is secured.",
  },
  {
    question: "Do I have to be a Narxoz University student to get vouched for?",
    answer:
      "Our pilot primarily focuses on Narxoz freshmen and students moving to Almaty, because our student network and campus credibility are strongest here. However, if you are a student at another Almaty university, you can still submit a request and our coordinator will do their best to help.",
  },
  {
    question: "How do you protect me from Kaspi deposit scams on Krisha.kz?",
    answer:
      "We enforce our golden rule: zero tenge transfers before physically stepping inside the apartment and checking the landlord's official eGov title deed (Справка о зарегистрированных правах). If a landlord asks for a 'slot reservation deposit' over WhatsApp, we immediately verify their listing authenticity.",
  },
  {
    question: "Can your team help review the lease contract before I sign?",
    answer:
      "Yes. We provide a standardized, balanced bilateral rental contract template designed for student tenants in Kazakhstan, protecting you from sudden arbitrary rent hikes or unjust deposit forfeitures.",
  },
];

// ============================================================================
// 10. PRODUCT-IN-ACTION MOCKUP: THE LIVE CALL & VOUCHER CARD (Step 3 Visual)
// ============================================================================
function ProductInActionMockup({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-[#121413]/90 p-5 sm:p-6 backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.8)] text-white">
      {/* Chrome header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#B5472B]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#D9A64E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono-tag text-zinc-300">
          <MessageSquare className="h-3 w-3 text-[#B5472B]" />
          <span>Local Guarantor • Live Dispatch</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <span className="text-[9px] font-mono-tag text-zinc-500 uppercase tracking-widest">
          PILOT V1.2
        </span>
      </div>

      {/* Krisha listing input preview */}
      <div className="rounded-xl border border-white/10 bg-black/50 p-2.5 mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden text-[11px] text-zinc-300">
          <Building className="h-3.5 w-3.5 text-[#D9A64E] shrink-0" />
          <span className="truncate font-mono-tag text-zinc-400">
            krisha.kz/a/show/69482103 • 1-Room Studio, Zhandosov St
          </span>
        </div>
        <span className="rounded bg-[#B5472B]/20 px-2 py-0.5 text-[9px] font-mono-tag text-[#D9A64E] shrink-0">
          VETTED
        </span>
      </div>

      {/* Simulated Live Call Box */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
              <PhoneCall className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <span>Voucher Peer → Landlord</span>
                <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-mono-tag text-emerald-300">
                  ACTIVE
                </span>
              </div>
              <div className="text-[10px] text-zinc-400">Bostandyk District, near Narxoz</div>
            </div>
          </div>
          <div className="text-right font-mono-tag">
            <span className="text-sm font-bold text-[#D9A64E]">0:42</span>
            <span className="block text-[8px] text-zinc-500 uppercase">CALL DURATION</span>
          </div>
        </div>

        {/* Audio Waveform */}
        <div className="my-2.5 flex items-center justify-center gap-1 h-5">
          {[30, 50, 75, 40, 90, 60, 100, 70, 45, 80, 95, 35, 60, 85, 40, 70].map((h, i) => (
            <motion.span
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-[#B5472B] to-[#D9A64E]"
              animate={{ height: [`${Math.max(20, h * 0.3)}%`, `${h}%`, `${Math.max(25, h * 0.4)}%`] }}
              transition={{ duration: 1.0 + (i % 4) * 0.2, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>

        {/* Live Transcript Dialog */}
        <div className="space-y-1.5 text-[11px] border-t border-white/10 pt-2 text-zinc-300">
          <p>
            <strong className="text-emerald-400">Senior Peer:</strong> “Hello! I'm calling from Narxoz University to vouch for Alina, an incoming freshman...”
          </p>
          <p>
            <strong className="text-[#D9A64E]">Landlord:</strong> “Oh, she's a verified student with local peer backing? Sure, come see the studio today at 18:00.”
          </p>
        </div>
      </div>

      {/* Outcome pill + trigger */}
      <div className="mt-3.5 flex items-center justify-between pt-1 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>Private viewing unlocked • 0 ₸ fee</span>
        </div>
        <button
          onClick={onOpenModal}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#B5472B] px-3.5 py-1 text-[11px] font-semibold text-white shadow hover:bg-[#8F3620] transition-colors cursor-pointer"
        >
          <span>Get Your Voucher</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 11. FAQ ACCORDION COMPONENT
// ============================================================================
function FaqAccordionItem({
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
        className="flex w-full items-center justify-between p-6 text-left focus:outline-none cursor-pointer"
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
// 12. SHOWCASE CHAPTER (Parallax Fullscreen Chapter)
// ============================================================================
function ShowcaseChapter({
  chapter,
  index,
  onOpenModal,
}: {
  chapter: ChapterItem;
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
    [index % 2 === 0 ? -2.0 : 2.0, 0, index % 2 === 0 ? 1.5 : -1.5]
  );

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-[110vh] w-full overflow-hidden ${chapter.bgClass} ${chapter.textClass} py-24 md:py-32 transition-colors duration-700 flex flex-col justify-between`}
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
          <h2 className="font-editorial text-[13vw] sm:text-[10vw] md:text-[8.5rem] lg:text-[9.5rem] font-normal leading-[0.88] tracking-[-0.03em]">
            <span className="block">{chapter.titleLine1}</span>
            <span className="block italic font-light">{chapter.titleLine2}</span>
            {chapter.titleLine3 && (
              <span className="block">{chapter.titleLine3}</span>
            )}
          </h2>
        </motion.div>

        <motion.div
          style={{ y: imageY, rotate: imageRotate }}
          className={`relative z-20 -mt-6 sm:-mt-12 md:-mt-16 w-[78vw] ${
            chapter.aspectClass || "max-w-[360px] md:max-w-[400px] aspect-[3/4.2]"
          }`}
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
      <div className="relative z-30 mx-auto mt-10 grid w-full max-w-[1400px] grid-cols-1 gap-8 px-6 md:grid-cols-12 md:px-12">
        <div className="hidden md:col-span-7 md:flex items-end">
          <div className="h-[1px] w-32 bg-current opacity-20" />
        </div>
        <div className="md:col-span-5 flex flex-col justify-between space-y-6">
          <p className={`text-xs md:text-sm leading-[1.8] ${chapter.mutedClass}`}>
            {chapter.description}
          </p>
          <div>
            <EditorialButton
              label="Request a Voucher"
              light={chapter.lightBtn}
              onClick={onOpenModal}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// MAIN LANDING SECTION COMPONENT (10-Step High-Converting Landing Architecture)
// ============================================================================
export default function LandingSection() {
  useSmoothScroll();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Form State
  const [formData, setFormData] = useState<VouchFormData>({
    name: "",
    phone: "",
    telegram: "",
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Hero Scroll Animations
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroBgY = useTransform(heroProgress, [0, 1], ["0%", "25%"]);
  const heroBgScale = useTransform(heroProgress, [0, 1], [1, 1.1]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);

  function scrollToSection(selector: string) {
    setIsMobileMenuOpen(false);
    const element = document.querySelector(selector);
    if (!element) return;
    const win = window as unknown as { lenisInstance?: any };
    if (win.lenisInstance) {
      win.lenisInstance.scrollTo(element, { offset: -60, duration: 1.2 });
    } else {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await sendTelegramNotification(formData);
    setIsSubmitting(false);

    if (result.success) {
      setSubmitSuccess(true);
      setTimeout(() => {
        setFormData({ name: "", phone: "", telegram: "", comment: "" });
        setSubmitSuccess(false);
        setIsModalOpen(false);
      }, 3500);
    } else {
      setErrorMessage(
        result.error || "Failed to dispatch request. Please contact @RakDinn directly."
      );
    }
  }

  return (
    <div className="relative w-full bg-[#0A0C0B] text-[#EDEAE1] antialiased selection:bg-[#B5472B] selection:text-white">
      {/* =====================================================================
          HEADER (Synchronized Smooth Navigation)
      ===================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-[#0A0C0B]/85 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex h-16 sm:h-20 max-w-[1440px] items-center justify-between px-6 md:px-12">
          {/* Logo Brand */}
          <button
            onClick={() => scrollToSection("#hero")}
            className="flex items-center gap-3 text-left focus:outline-none cursor-pointer group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 font-editorial text-base font-bold text-white transition-transform group-hover:scale-105">
              LG.
            </div>
            <div className="flex flex-col">
              <span className="font-editorial text-sm sm:text-base font-medium tracking-tight text-white">
                Local Guarantor
              </span>
              <span className="font-mono-tag text-[9px] tracking-wider text-zinc-400 uppercase">
                Narxoz Student Pilot
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-mono-tag tracking-wider uppercase text-zinc-300">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="transition-colors hover:text-white cursor-pointer py-1"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Header Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative hidden sm:inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#B5472B] px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-[#8F3620] transition-colors cursor-pointer"
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
                  <span>Request a Voucher — 100% Free</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* =====================================================================
          PART 1: ABOVE THE FOLD (Steps 1 to 5: Donald Miller Caveman Test)
          1/ Explain the value you provide (Title)
          2/ Explain how you'll create it (Subtitle)
          3/ Let the user visualise it (Visual: Live Call & Product in Action)
          4/ Make it believable (Social Proof)
          5/ Make taking the next step easy (CTA: Call to Value + Objection Handle)
      ===================================================================== */}
      <section
        id="hero"
        ref={heroRef}
        className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#0A0C0B] pt-24 pb-8 md:pt-28 text-white"
      >
        {/* Background Atmosphere: Twilight Suburban Architecture */}
        <motion.div
          style={{ y: heroBgY, scale: heroBgScale }}
          className="pointer-events-none absolute inset-0 z-0"
        >
          <img
            src="/hero-suburban.jpg"
            alt="Aesthetic American suburban neighborhood street at twilight"
            className="h-full w-full object-cover object-center brightness-[0.55] contrast-[1.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/90" />
        </motion.div>

        {/* Central Hero Grid (Title + Subtitle + Product in Action Visual) */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 mx-auto my-auto w-full max-w-[1440px] px-6 md:px-12 py-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Title (1), Subtitle (2), Social Proof (4), CTA (5) */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              {/* Niche & Eyebrow Tag */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#B5472B]/40 bg-[#B5472B]/15 px-3.5 py-1 backdrop-blur-md self-start">
                <Sparkles className="h-3 w-3 text-[#D9A64E]" />
                <span className="font-mono-tag text-[10px] tracking-[0.2em] uppercase text-zinc-200">
                  NARXOZ UNIVERSITY STUDENT BACKING PILOT • ALMATY
                </span>
              </div>

              {/* 1/ TITLE: Explain the value you provide (Hook & Own the Niche) */}
              <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-[4.8rem] xl:text-[5.5rem] font-normal leading-[0.94] tracking-[-0.03em] text-white">
                A local student,
                <br />
                <span className="italic font-light text-white/95">who vouches for you.</span>
                <br />
                So Almaty landlords say yes.
              </h1>

              {/* 2/ SUBTITLE: Explain how you'll create it (Specific & Clear) */}
              <p className="mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-zinc-300">
                We match non-local Narxoz freshmen with a settled senior peer who calls your Krisha.kz landlord, confirms your character in 42 seconds, and secures private viewing slots. 100% free pilot — 0 ₸ broker fees, 0 ₸ commission.
              </p>

              {/* 5/ CTA: Call to Value + Objection Handler */}
              <div className="mt-8 space-y-3">
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="group relative inline-flex items-center gap-3 rounded-full border border-white/20 bg-[#B5472B] px-7 py-4 text-xs sm:text-sm font-semibold text-white shadow-[0_12px_35px_-5px_rgba(181,71,43,0.7)] transition-all duration-300 hover:bg-[#8F3620] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <span>Get Your Free Landlord Voucher</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={() => scrollToSection("#how-it-works")}
                    className="inline-flex items-center gap-2 text-xs font-mono-tag tracking-wider uppercase text-zinc-300 hover:text-white transition-colors cursor-pointer py-3"
                  >
                    <span>See How It Works</span>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Objection Handle Line (Directly below CTA) */}
                <p className="flex items-center gap-2 text-[11px] font-mono-tag text-zinc-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>100% Free • No Kaspi wire • Takes 60 seconds • Zero broker cuts</span>
                </p>
              </div>

              {/* 4/ SOCIAL PROOF (Above the fold instant credibility) */}
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-6">
                <div className="flex -space-x-2.5">
                  <img
                    src="/team-sua.jpg"
                    alt="Team SUA Peer Coordinator"
                    className="h-8 w-8 rounded-full border-2 border-black object-cover"
                  />
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-[#B5472B] text-[10px] font-bold text-white">
                    YA
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-zinc-700 text-[10px] font-bold text-white">
                    CU
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-[#D9A64E] text-[10px] font-bold text-black">
                    YK
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-300">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-300 text-amber-300" />
                      ))}
                    </div>
                    <span className="font-bold text-white text-xs">4.9/5 satisfaction</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono-tag mt-0.5">
                    12/12 pilot students housed • 100% viewing unlock rate
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 3/ VISUAL (Product in action — Live Call Mockup) */}
            <div className="lg:col-span-5 flex justify-center">
              <ProductInActionMockup onOpenModal={() => setIsModalOpen(true)} />
            </div>
          </div>
        </motion.div>

        {/* Bottom Metrics Bar (Compact Proof Strip) */}
        <div className="relative z-10 border-t border-white/15 bg-black/60 backdrop-blur-md">
          <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-4 px-6 py-4 sm:grid-cols-4 md:grid-cols-12 md:px-12 items-center">
            <div className="md:col-span-3">
              <div className="text-2xl md:text-3xl font-light tracking-tight text-white font-editorial">
                75%
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-zinc-300">
                of non-local students interviewed suffered rental refusal or scam losses
              </p>
            </div>

            <div className="md:col-span-3">
              <div className="text-2xl md:text-3xl font-light tracking-tight text-white font-editorial">
                0 ₸
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-zinc-300">
                Commission or hidden fees: volunteer student solidarity, zero broker cut
              </p>
            </div>

            <div className="md:col-span-3">
              <div className="text-2xl md:text-3xl font-light tracking-tight text-white font-editorial">
                42 sec
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-zinc-300">
                Average voucher call duration that dissolves landlord suspicion
              </p>
            </div>

            <div className="col-span-2 sm:col-span-4 md:col-span-3 flex justify-end">
              <button
                onClick={() => scrollToSection("#how-it-works")}
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
          PART 2: BELOW THE FOLD (Step 6: Make the Value Concrete)
          6/ Features and Objections
          First: Concrete features handling reoccurring customer objections.
          Second: 4 Monumental Overlapping Chapters with real storytelling photos.
      ===================================================================== */}
      <section
        id="how-it-works"
        className="relative w-full bg-[#EAE6DF] px-6 py-28 md:px-12 md:py-36 text-[#141414]"
      >
        <div className="mx-auto max-w-[1400px]">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="font-mono-tag text-[10px] tracking-[0.24em] text-[#B5472B] uppercase font-bold">
              ( STEP 06 • MAKE VALUE CONCRETE )
            </span>
            <h2 className="mt-4 font-editorial text-4xl sm:text-5xl md:text-[3.8rem] font-normal leading-[1.05]">
              How we dismantle the 3 biggest fears
              <br />
              <span className="italic font-light">that stop students from finding housing.</span>
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-zinc-700 max-w-xl mx-auto leading-relaxed">
              We talked to 12 non-local Narxoz students. Here is how our concrete features handle their exact words and objections.
            </p>
          </div>

          {/* 3 Core Concrete Features Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {CORE_FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-black/10 bg-[#FBF9F5] p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono-tag text-[9px] tracking-wider text-[#B5472B] font-bold uppercase">
                        {feat.tag}
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#141414] text-white">
                        <Icon className="h-4 w-4 text-[#D9A64E]" />
                      </div>
                    </div>

                    {/* Objection in customer's own words */}
                    <div className="rounded-xl border border-rose-500/20 bg-rose-50/70 p-3 mb-4">
                      <span className="text-[9px] font-mono-tag uppercase text-rose-700 font-bold block mb-0.5">
                        CUSTOMER OBJECTION:
                      </span>
                      <p className="text-xs italic text-zinc-800 font-serif">
                        {feat.objection}
                      </p>
                    </div>

                    <h3 className="font-editorial text-2xl font-medium text-[#141414] leading-snug mb-3">
                      {feat.featureTitle}
                    </h3>
                    <p className="text-xs text-zinc-700 leading-relaxed">
                      {feat.featureDesc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between text-[11px] font-mono-tag text-[#B5472B]">
                    <span>{feat.metric}</span>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Overlapping Parallax Chapters (Storytelling Visual Journey) */}
        <div className="w-full">
          {PROJECT_CHAPTERS.map((chapter, index) => (
            <ShowcaseChapter
              key={chapter.id}
              chapter={chapter}
              index={index}
              onOpenModal={() => setIsModalOpen(true)}
            />
          ))}
        </div>
      </section>

      {/* =====================================================================
          PART 2: BELOW THE FOLD (Step 7: More Social Proof / Inspire Action)
          7/ Bring to life your offer
          Concrete student transformation stories + 12 Field Research Findings
      ===================================================================== */}
      <section
        id="stories"
        className="relative w-full bg-[#0D0F0E] px-6 py-28 md:px-12 md:py-36 text-white border-t border-white/10"
      >
        <div className="mx-auto max-w-[1400px]">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="font-mono-tag text-[10px] tracking-[0.24em] text-[#D9A64E] uppercase font-bold">
              ( STEP 07 • BRING TO LIFE YOUR OFFER )
            </span>
            <h2 className="mt-4 font-editorial text-4xl sm:text-5xl md:text-[3.8rem] font-normal leading-[1.05]">
              Real Narxoz students.
              <br />
              <span className="italic font-light">Real keys in hand. Real relief.</span>
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Above the fold promised credibility. Below the fold shows exactly how non-local students went from stranded at stations to safely housed near campus.
            </p>
          </div>

          {/* 3 Real Customer Transformation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {CUSTOMER_STORIES.map((story, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-[#161917]/80 overflow-hidden backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all"
              >
                <div className="h-48 w-full relative overflow-hidden">
                  <img
                    src={story.photo}
                    alt={story.name}
                    className="h-full w-full object-cover object-center"
                  />
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-[10px] font-mono-tag px-3 py-1 text-emerald-400 rounded-full border border-emerald-500/30">
                    VERIFIED STUDENT
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-mono-tag text-[#D9A64E] uppercase mb-1">
                      {story.program} • {story.origin}
                    </div>
                    <h4 className="font-editorial text-xl font-medium text-white mb-3">
                      {story.name}
                    </h4>
                    <p className="text-xs italic text-zinc-300 font-serif leading-relaxed mb-4">
                      “{story.quote}”
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono-tag text-emerald-400">
                    <span>{story.result}</span>
                    <Check className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 12 In-Depth Field Research Findings Dossier */}
          <div id="interviews" className="border-t border-white/10 pt-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="font-mono-tag text-[10px] tracking-[0.2em] text-[#B5472B] uppercase font-bold">
                ( EMPIRICAL KNOWLEDGE BASE • 12 FIELD INTERVIEWS )
              </span>
              <h3 className="font-editorial text-3xl sm:text-4xl text-white mt-2">
                Unfiltered quotes from arriving Narxoz freshmen
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {INTERVIEW_FINDINGS.map((finding, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-[#161917]/70 p-6 backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-colors"
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
          </div>
        </div>
      </section>

      {/* =====================================================================
          PART 2: BELOW THE FOLD (Step 8: FAQ / Tie up loose ends)
          8/ FAQ
          Write down residual questions & objections. Reframe into Q&A.
      ===================================================================== */}
      <section
        id="faq"
        className="relative w-full bg-[#0A0C0B] px-6 py-28 md:px-12 md:py-36 text-white border-t border-white/10"
      >
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="font-mono-tag text-[10px] tracking-[0.24em] text-[#B5472B] uppercase font-bold">
              ( STEP 08 • TIE UP LOOSE ENDS )
            </span>
            <h2 className="mt-4 font-editorial text-4xl sm:text-5xl font-normal leading-tight">
              Questions, answered with complete transparency
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-zinc-400">
              Everything you need to know about our student voucher backing pilot before applying.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <FaqAccordionItem
                key={idx}
                item={faq}
                isOpen={openFaq === idx}
                onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          PART 2: BELOW THE FOLD (Step 9: 2nd CTA / Luxury of Space)
          9/ 2nd CTA
          Remind the customer WHY they are clicking.
      ===================================================================== */}
      <section
        id="cta-repeat"
        className="relative w-full bg-[#121614] px-6 py-28 md:px-12 md:py-36 text-white border-t border-white/10 overflow-hidden"
      >
        <div className="absolute top-0 right-0 h-96 w-96 bg-[#B5472B]/15 blur-3xl rounded-full pointer-events-none" />
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <span className="font-mono-tag text-[10px] tracking-[0.24em] text-[#D9A64E] uppercase font-bold">
            ( STEP 09 • REPEAT YOUR CALL TO ACTION )
          </span>
          <h2 className="mt-4 font-editorial text-4xl sm:text-6xl md:text-[4.2rem] font-normal leading-[1.02]">
            Don't search alone.
            <br />
            <span className="italic font-light">Let a fellow Narxoz peer back you up.</span>
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
            Don't spend another evening stranded with suitcases, facing rude landlord hang-ups, or paying commission to shady brokers.
          </p>

          {/* 4 Value Checkmarks (Why they're clicking) */}
          <div className="my-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left text-xs font-mono-tag">
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/40 p-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>0 ₸ commission — zero broker fees, always</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/40 p-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>42-second phone call to any Krisha landlord</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/40 p-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Title deed & bilateral contract screening</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/40 p-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Direct Telegram reply from Team SUA in 1h</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="group inline-flex items-center gap-3 rounded-full bg-[#B5472B] px-8 py-4 text-sm font-semibold text-white shadow-[0_15px_40px_-5px_rgba(181,71,43,0.8)] hover:bg-[#8F3620] hover:scale-[1.03] transition-all cursor-pointer"
            >
              <span>Get Your Free Landlord Voucher Now</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="text-[11px] font-mono-tag text-zinc-400">
              ⚡ 100% Free Pilot • No credit card required • No Kaspi wire • Narxoz University Student Solidarity
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          PART 2: BELOW THE FOLD (Step 10: Founder's Note / Make Yourself Memorable)
          10/ Founder's Note
          1/ Put yourself in their shoes
          2/ Explain their problem
          3/ Take ownership of it
          4/ Show the happy ending
          "People buy from people."
      ===================================================================== */}
      <section
        id="founder-note"
        className="relative w-full bg-[#0A0C0B] px-6 py-28 md:px-12 md:py-36 text-white border-t border-white/10"
      >
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <span className="font-mono-tag text-[10px] tracking-[0.24em] text-[#D9A64E] uppercase font-bold">
              ( STEP 10 • FOUNDER'S NOTE • TEAM SUA )
            </span>
            <h2 className="mt-3 font-editorial text-4xl sm:text-5xl font-normal">
              Why we built Local Guarantor
            </h2>
          </div>

          {/* Letter container */}
          <div className="rounded-2xl border border-white/15 bg-[#141816]/90 p-8 sm:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-white/10">
              <img
                src="/team-sua.jpg"
                alt="Team SUA: Claudio, Yersultan Aldanazar, Yerkezhan"
                className="h-20 w-20 rounded-full object-cover border-2 border-[#D9A64E]"
              />
              <div className="text-center sm:text-left">
                <h3 className="font-editorial text-2xl font-medium text-white">
                  A personal note from Team SUA
                </h3>
                <p className="text-xs text-zinc-400 font-mono-tag mt-1">
                  Claudio, Yersultan Aldanazar &amp; Yerkezhan • Tech Entrepreneurship, Narxoz University
                </p>
              </div>
            </div>

            <div className="pt-8 space-y-5 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
              {/* 1/ Put yourself in their shoes */}
              <p className="font-editorial text-lg text-white font-normal italic">
                “Dear arriving Narxoz student,”
              </p>
              <p>
                We still remember stepping off the train at Almaty-2 station as freshmen. Three heavy suitcases, two weeks until classes started, and not a single relative in this massive city.
              </p>

              {/* 2/ Explain their problem */}
              <p>
                We called dozens of Krisha.kz ads. The very moment we said <em>“we are students”</em>, landlords hung up or claimed the apartment was suddenly taken. Greedy brokers tried to extort 30,000–50,000 ₸ upfront just for fake phone numbers, and scams were everywhere. We spent nights wondering if we'd have to sleep in sketchy hostels before our first academic lecture.
              </p>

              {/* 3/ Take ownership of it */}
              <p>
                Then we noticed something crucial: classmates who had an older brother or uncle living in Almaty never faced this prejudice. When an older, established voice placed the call, landlords smiled and unlocked the doors immediately. We thought: <em>why shouldn't every student have that exact same credible backing?</em>
              </p>

              {/* 4/ Show the happy ending */}
              <p className="text-white font-medium">
                So we built Local Guarantor. Today, all 12 freshmen in our pilot cohort are safely settled in clean, honest apartments near campus, studying peacefully and cooking dinner with roommates. You don't have to face Almaty's housing market alone — we are right here to vouch for you.
              </p>

              {/* Signatures & Direct Contacts */}
              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <div className="font-editorial text-xl text-[#D9A64E]">
                    Yersultan Aldanazar, Claudio &amp; Yerkezhan
                  </div>
                  <div className="text-[11px] font-mono-tag text-zinc-400">
                    Team SUA • Narxoz University, Almaty
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono-tag text-zinc-300">
                  <a href="tel:+77085010270" className="hover:text-white transition-colors">
                    📞 +7 708 501 02 70
                  </a>
                  <span>•</span>
                  <a href="mailto:yersultan.aldanazar@narxoz.kz" className="hover:text-white transition-colors">
                    ✉️ Email
                  </a>
                  <span>•</span>
                  <a
                    href="https://t.me/RakDinn"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#D9A64E] hover:underline"
                  >
                    ✈️ Telegram @RakDinn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          MONUMENTAL FOOTER (LG. Monogram + Full-width Brand Wordmark)
      ===================================================================== */}
      <footer className="relative w-full overflow-hidden bg-[#0A0C0B] pt-20 pb-6 text-white border-t border-white/10">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-10 px-6 sm:grid-cols-4 md:px-12 text-xs">
          <div className="space-y-4">
            <div className="font-mono-tag text-[10px] tracking-[0.2em] text-[#B5472B] uppercase font-bold">
              ( FOR STUDENTS )
            </div>
            <ul className="space-y-2 text-zinc-300">
              <li>
                <button onClick={() => setIsModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">
                  Request Free Voucher
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("#how-it-works")} className="hover:text-white transition-colors cursor-pointer">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("#stories")} className="hover:text-white transition-colors cursor-pointer">
                  Student Stories
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("#interviews")} className="hover:text-white transition-colors cursor-pointer">
                  12 Field Interviews
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="font-mono-tag text-[10px] tracking-[0.2em] text-[#B5472B] uppercase font-bold">
              ( FOR LANDLORDS )
            </div>
            <ul className="space-y-2 text-zinc-400">
              <li>Student Enrollment Check</li>
              <li>Narxoz Community Guarantee</li>
              <li>Direct Contact (No Middlemen)</li>
              <li>0 ₸ Commission Protection</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="font-mono-tag text-[10px] tracking-[0.2em] text-[#B5472B] uppercase font-bold">
              ( ABOUT PILOT )
            </div>
            <ul className="space-y-2 text-zinc-300">
              <li>Tech Entrepreneurship Course</li>
              <li>Narxoz University, Almaty</li>
              <li>Team SUA (Claudio, Yersultan, Yerkezhan)</li>
              <li>
                <span className="text-[10px] text-zinc-500">Student initiative, not official dept</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="font-mono-tag text-[10px] tracking-[0.2em] text-[#B5472B] uppercase font-bold">
              ( DIRECT CONTACT )
            </div>
            <ul className="space-y-2 text-zinc-300">
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
                <a href="https://t.me/RakDinn" target="_blank" rel="noreferrer" className="text-[#D9A64E] hover:underline">
                  ✈️ Telegram: @RakDinn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 3D Monogram Cube */}
        <div className="my-16 flex flex-col items-center justify-center">
          <motion.div
            whileHover={{ rotateY: 18, rotateX: -12, scale: 1.06 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            style={{ transformStyle: "preserve-3d" }}
            onClick={() => setIsModalOpen(true)}
            className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-zinc-200 via-zinc-400 to-[#B5472B]/60 text-[#141414] shadow-[0_20px_50px_rgba(0,0,0,0.8)] cursor-pointer select-none"
          >
            <span className="font-extrabold text-4xl tracking-tighter font-serif">
              LG.
            </span>
          </motion.div>
          <span className="mt-3 text-[10px] font-mono-tag text-zinc-400">
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
          <div className="text-[14.5vw] font-black tracking-[-0.05em] text-[#332e2a]/80 font-serif">
            LOCAL GUARANTOR.
          </div>
        </div>
      </footer>

      {/* =====================================================================
          INTERACTIVE TELEGRAM LEAD MODAL (Connected to src/lib/telegram.ts)
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
                className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
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
                  Fill in your details below. A fellow Narxoz student will contact you and call the Almaty landlord on your behalf. Instantly dispatched to Team SUA on Telegram.
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
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#B5472B] px-6 py-3.5 text-xs font-semibold text-white shadow-[0_10px_30px_-8px_rgba(181,71,43,0.6)] hover:bg-[#8F3620] disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Dispatching to Telegram Bot...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Send Request to Voucher — 100% Free</span>
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
