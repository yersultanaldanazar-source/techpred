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
  MapPin,
  Home,
  CheckCheck,
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
  { label: "Who It's For", id: "#audiences" },
  { label: "How It Works", id: "#how-it-works" },
  { label: "Real Stories", id: "#stories" },
  { label: "Field Research", id: "#interviews" },
  { label: "FAQ", id: "#faq" },
  { label: "Founder's Note", id: "#founder-note" },
];

// ============================================================================
// 5. DATA: 4 TARGET AUDIENCES (Students, Couples, Families, Remote Relocators)
// ============================================================================
const AUDIENCE_CARDS = [
  {
    tag: "REMOTE OUT-OF-TOWNERS",
    title: "Relocating from Another City",
    cities: "Shymkent, Semey, Atyrau, Astana, China & Abroad",
    friction:
      "“I was in Shymkent, but the flat was in Almaty. Landlords refused because I couldn't view within 30 minutes, and scammers demanded Kaspi prepayments before I even boarded the train.”",
    solution:
      "We act as your local eyes, ears, and voice in Almaty. We call the landlord, confirm the photos are authentic, verify title deeds, and hold your viewing slot until you arrive.",
    icon: MapPin,
  },
  {
    tag: "YOUNG COUPLES & FAMILIES",
    title: "Couples & Small Families",
    cities: "Almaly, Bostandyk, Medeu, Auezov",
    friction:
      "“Our previous landlady had no contract and put the flat up for sale, sending random realtors every day without warning, completely destroying our safety and privacy at home.”",
    solution:
      "We ensure official eGov ownership verification, negotiate transparent deposit terms, and provide a legally balanced bilateral lease that strictly forbids unannounced visits.",
    icon: HeartHandshake,
  },
  {
    tag: "STUDENTS & SINGLE TENANTS",
    title: "Students & Young Professionals",
    cities: "All Almaty Universities & Tech Hubs",
    friction:
      "“Rejected in 90% of cases. The second landlords hear 'student' or realize we are guys, they hang up saying 'married couples with kids only, no guys, no students under any circumstances.'”",
    solution:
      "Our 42-second peer verification call breaks the stereotype. We present your academic/work credentials, vouch for your discipline, and turn automatic refusals into private tours.",
    icon: Users,
  },
  {
    tag: "ANYONE BROWSING KRISHA.KZ",
    title: "Krisha.kz & OLX Renters",
    cities: "Entire Almaty Rental Market",
    friction:
      "“Realtors post gorgeous photos at low prices as bait, demand 30–50% upfront for fake numbers, or fake landlords try to sublease flats they don't even legally own.”",
    solution:
      "100% free scam audit before you pay a single tenge. We screen Krisha links, verify the owner's eGov title, and guide you away from predatory middlemen.",
    icon: ShieldCheck,
  },
];

// ============================================================================
// 6. DATA: 4 MONUMENTAL STORYTELLING CHAPTERS (Using User-Uploaded Photos)
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
      "Almaty landlords routinely fear noise, missed rent, and property damage, rejecting 90% of incoming calls with an instant “no students, no guys” rule. Newcomers arrive at stations with heavy suitcases, facing predatory broker fees and 300,000 ₸ seasonal rental gouging while searching alone in panic.",
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
      "Our established local voucher places a focused 42-second phone call on your behalf. Hearing a calm, mature peer vouch for your character dissolves suspicions, turns an automatic rejection into a warm conversation, and books you a private in-person walkthrough.",
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
      "Our golden rule: zero Kaspi transfers before physically viewing the apartment and verifying official eGov title documents. We guide you through verifying ownership, inspecting meters, signing a legitimate bilateral contract, and receiving your keys without paying 30–50% broker commissions.",
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
    badge: "WARM RESIDENCE • FOCUSED ON LIVING",
    aspectClass: "max-w-[360px] md:max-w-[400px] aspect-[3/4.2]",
    description:
      "Once settled in honest, secure housing, real life in Almaty begins. Cook meals together, live peacefully without fear of sudden eviction or unannounced landlord visits, and focus entirely on what truly matters: your career, family, and studies.",
  },
];

// ============================================================================
// 7. DATA: CONCRETE FEATURES SOLVING REOCCURRING OBJECTIONS (Step 6)
// ============================================================================
const CORE_FEATURES = [
  {
    objection: "“We don't rent to students or unvouched guys. Only married couples with kids.”",
    featureTitle: "The 42-Second Credibility Call",
    featureDesc:
      "A calm, established local peer calls the landlord directly. We present your background, confirm your reliability, and turn an automatic hang-up into a private apartment viewing.",
    metric: "0:42 avg call duration",
    icon: PhoneCall,
    tag: "OBJECTION: 90% AUTOMATIC REFUSAL",
  },
  {
    objection: "“I was in Shymkent, but the flat was in Almaty. Searching remotely was impossible.”",
    featureTitle: "Local Ground Representation & Screening",
    featureDesc:
      "We act as your local proxy in Almaty. We screen the Krisha.kz ad, verify that photos match reality, confirm landlord legitimacy, and hold your viewing slot before you buy train or plane tickets.",
    metric: "100% remote search coverage",
    icon: Compass,
    tag: "OBJECTION: 700 KM DISTANCE BARRIER",
  },
  {
    objection: "“The landlord wasn't the actual owner; it was a scam. And contracts had no official details.”",
    featureTitle: "eGov Title Deed & Legal Contract Shield",
    featureDesc:
      "We verify the landlord's official eGov title deed (Справка о зарегистрированных правах) to ensure they legally own the property. We provide a balanced bilateral lease that forbids surprise landlord visits.",
    metric: "100% scam prevention rate",
    icon: Lock,
    tag: "OBJECTION: FAKE LISTINGS & SUBLEASE FRAUD",
  },
  {
    objection: "“Brokers charged 15,000–50,000 ₸ upfront for fake landlord lists that were disconnected.”",
    featureTitle: "0 ₸ Commission & Direct Owner Access",
    featureDesc:
      "Built as a civic community initiative, not a commission-hungry agency. We connect you directly with legitimate property owners. Zero tenge charged to tenants or landlords, always.",
    metric: "0 ₸ broker fee, always",
    icon: ShieldCheck,
    tag: "OBJECTION: BROKER PREDATION",
  },
];

// ============================================================================
// 8. DATA: REAL TRANSFORMATION STORIES (Directly From Attached Interviews)
// ============================================================================
const CUSTOMER_STORIES = [
  {
    name: "Alina K.",
    category: "Remote Relocator from Shymkent",
    quote:
      "I was located in Shymkent, but needed an apartment in Almaty. Searching on Krisha drained hours every day, and landlords hung up because I couldn't view immediately. Local Guarantor called the owner on Zhandosov St, verified the renovation was real, and locked in my viewing for the day my train arrived.",
    result: "Housed upon arrival • 0 Kaspi wire risk",
    photo: "/student-arrival-struggle.jpg",
  },
  {
    name: "Arman & Daria",
    category: "Young Couple (China & Semey Relocators)",
    quote:
      "In our previous apartment, the landlady had no contract and put the flat up for sale, sending realtors every single day without warning. Local Guarantor screened our next Krisha listing, verified the owner's eGov title, and got us a clean bilateral lease with strict privacy guarantees.",
    result: "Protected by legal lease • No surprise visits",
    photo: "/apartment-viewing-tour.jpg",
  },
  {
    name: "Dias & 3 Roommates",
    category: "Group of 4 Friends from Zharkent",
    quote:
      "When 4 guys look for an apartment, landlords assume the worst and reject you in 5 seconds. Proving that we are responsible and keep things clean seemed impossible. The 42-second voucher call broke the stereotype, and the landlady agreed to rent to us for 0 ₸ commission.",
    result: "Overcame 90% refusal bias • 0 ₸ fee",
    photo: "/cozy-student-living.jpg",
  },
];

// ============================================================================
// 9. DATA: 12 QUALITATIVE INTERVIEWS (Empirical Research Transcripts)
// ============================================================================
const INTERVIEW_FINDINGS = [
  {
    tag: "90% REJECTION RATE",
    quote: "I was rejected in 90% of cases because landlords don't want to rent to students or guys. They write 'girls only or married couples'.",
    context: "Newcomers and young people face blanket stereotyping regardless of budget, manners, or ability to pay.",
    metric: "90% initial rejection rate",
  },
  {
    tag: "DISTANCE BARRIER",
    quote: "I was located in Shymkent, but needed to rent in Almaty. Because I wasn't there, I couldn't inspect, and the search dragged on for weeks.",
    context: "Out-of-towners from Shymkent, Semey, Atyrau, or abroad lose apartments to instant local callers.",
    metric: "700+ km remote search friction",
  },
  {
    tag: "SUBLEASE & TITLE SCAMS",
    quote: "The apartment had ideal photos, but looking at the contract, the landlord wasn't the actual owner; it was just a scam.",
    context: "Fake subletters take deposits and disappear. Our eGov title check verifies the actual registered owner.",
    metric: "Strict eGov title check",
  },
  {
    tag: "CONTRACT ABUSE & PRIVACY",
    quote: "We didn't have a contract. The landlady put the flat for sale, and daily realtor visits began without warning us.",
    context: "Tenants without contracts face unexpected evictions and privacy violations. We enforce bilateral lease templates.",
    metric: "Enforced bilateral lease",
  },
  {
    tag: "REALTOR BAIT ADS",
    quote: "Realtors post gorgeous photos at low prices as bait, then redirect you to dilapidated apartments.",
    context: "Predatory brokers drain time and charge 30–50% commission for listings they don't even manage.",
    metric: "0 ₸ commission with direct owner",
  },
  {
    tag: "THE TURNING POINT",
    quote: "He's a reasonable guy — he replied within an hour once trust and local backing were established.",
    context: "Almaty landlords aren't malicious; they fear risk. A 42-second credible call completely changes the dynamic.",
    metric: "0:42 avg call duration",
  },
];

// ============================================================================
// 10. DATA: FAQ (Step 8 - Tie up loose ends)
// ============================================================================
const FAQS = [
  {
    question: "Is Local Guarantor only for students, or can anyone use it?",
    answer:
      "Local Guarantor is for everyone! While we originated as a student initiative at Narxoz University, our service is open to young couples, families, remote relocators from other cities (Shymkent, Semey, Atyrau, Astana) or abroad, and working professionals. Anyone facing rental refusals, fake listings, or distance barriers in Almaty can request our assistance.",
  },
  {
    question: "Can you help if I am currently in another city (Shymkent, Astana, etc.)?",
    answer:
      "Yes! That is one of our most popular use cases. If you're relocating to Almaty and cannot attend viewings in person right now, send us the Krisha.kz link. We verify the property, check the landlord's eGov title deed, place a call to establish trust, and secure your viewing slot so you don't travel in vain.",
  },
  {
    question: "How do you verify if the landlord is the actual legal owner?",
    answer:
      "We request and check the official eGov property registration certificate (Справка о зарегистрированных правах на недвижимое имущество). This confirms that the person offering the lease is the authentic registered owner, preventing sublease scams and advance wire fraud.",
  },
  {
    question: "What exactly happens during the 42-second call to the landlord?",
    answer:
      "An established local peer coordinator calls the landlord. We introduce ourselves, present your background (employment, academic enrollment, or family profile), confirm your character, and request a private viewing slot. Hearing a calm, established local voice dissolves landlord anxiety and breaks the 'automatic refusal' habit.",
  },
  {
    question: "Why is Local Guarantor 100% free? How do you make money?",
    answer:
      "Our pilot is completely free because we believe Almaty's rental market is broken by predatory broker fees and distrust. Developed by Team SUA as a civic tech entrepreneurship initiative at Narxoz University, we never charge students, couples, or relocators a single tenge.",
  },
  {
    question: "How do you protect me from surprise visits or sudden rent hikes?",
    answer:
      "We provide a standardized, legally sound bilateral lease agreement for Kazakhstan rentals. It specifies strict 24-hour notice rules for landlord visits, locks in rental rates for the agreed term, and prevents unannounced showings or arbitrary deposit forfeitures.",
  },
];

// ============================================================================
// 11. PRODUCT-IN-ACTION MOCKUP WITH 3 AUDIENCE MODES (Step 3 Visual)
// ============================================================================
function ProductInActionMockup({ onOpenModal }: { onOpenModal: () => void }) {
  const [activeTab, setActiveTab] = useState<"remote" | "couple" | "student">("remote");

  const tabContent = {
    remote: {
      tag: "REMOTE SEARCH • FROM SHYMKENT",
      listing: "krisha.kz/a/show/69482103 • Almaly District",
      userQuote: "“Searching from 700 km away. Need local verification before traveling.”",
      transcriptPeer: "“Hello! Calling from Local Guarantor in Almaty. We've vetted your listing and are confirming the viewing for Alina who arrives from Shymkent on Friday...”",
      transcriptLandlord: "“Oh, you're verifying her locally? That works. I will hold the viewing slot without asking for any Kaspi prepayment.”",
      outcome: "Remote viewing secured • 0 Kaspi wire risk",
    },
    couple: {
      tag: "YOUNG COUPLE • CONTRACT CHECK",
      listing: "krisha.kz/a/show/71029415 • Bostandyk District",
      userQuote: "“Need eGov title check and bilateral lease so the landlord can't barge in.”",
      transcriptPeer: "“Good afternoon! Calling on behalf of a young working couple. We require official eGov title verification and our standard bilateral privacy lease...”",
      transcriptLandlord: "“Understood. I have the eGov property certificate ready. Let's sign the contract at 19:00 today.”",
      outcome: "Bilateral lease protection • Privacy guaranteed",
    },
    student: {
      tag: "STUDENTS / GUYS • 90% REFUSAL BREAK",
      listing: "krisha.kz/a/show/68903421 • Auezov District",
      userQuote: "“Rejected 8 times because 'no students, married couples only'.”",
      transcriptPeer: "“Hello! Calling from Narxoz student network to vouch for two disciplined freshmen. We guarantee academic standing and peer accountability...”",
      transcriptLandlord: "“If they have local university peer backing, that's fine. Come see the apartment this evening.”",
      outcome: "Automatic refusal reversed • Viewing unlocked",
    },
  };

  const current = tabContent[activeTab];

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
          <span>Local Guarantor • Almaty Dispatch</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <span className="text-[9px] font-mono-tag text-zinc-500 uppercase tracking-widest">
          LIVE PROTOCOL
        </span>
      </div>

      {/* 3 Persona Switcher Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10 mb-4 text-[10px] font-mono-tag">
        <button
          onClick={() => setActiveTab("remote")}
          className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
            activeTab === "remote"
              ? "bg-[#B5472B] text-white font-semibold shadow"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Remote Relocator
        </button>
        <button
          onClick={() => setActiveTab("couple")}
          className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
            activeTab === "couple"
              ? "bg-[#B5472B] text-white font-semibold shadow"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Young Couple
        </button>
        <button
          onClick={() => setActiveTab("student")}
          className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
            activeTab === "student"
              ? "bg-[#B5472B] text-white font-semibold shadow"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Student / Group
        </button>
      </div>

      {/* Krisha listing input preview */}
      <div className="rounded-xl border border-white/10 bg-black/50 p-2.5 mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden text-[11px] text-zinc-300">
          <Building className="h-3.5 w-3.5 text-[#D9A64E] shrink-0" />
          <span className="truncate font-mono-tag text-zinc-400">{current.listing}</span>
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
                <span>Local Guarantor → Landlord</span>
                <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-mono-tag text-emerald-300">
                  CONNECTED
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono-tag">{current.tag}</div>
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
            <strong className="text-emerald-400">Guarantor:</strong> {current.transcriptPeer}
          </p>
          <p>
            <strong className="text-[#D9A64E]">Landlord:</strong> {current.transcriptLandlord}
          </p>
        </div>
      </div>

      {/* Outcome pill + trigger */}
      <div className="mt-3.5 flex items-center justify-between pt-1 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>{current.outcome}</span>
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
// 12. FAQ ACCORDION COMPONENT
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
// 13. SHOWCASE CHAPTER (Parallax Fullscreen Chapter)
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
// MAIN LANDING SECTION (Universal Architecture for All Renters)
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
                Almaty Rental Backing &amp; Verification
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-mono-tag tracking-wider uppercase text-zinc-300">
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
          PART 1: ABOVE THE FOLD (Donald Miller 5-Second Test)
          Universal for: Students • Young Couples • Families • Remote Relocators
      ===================================================================== */}
      <section
        id="hero"
        ref={heroRef}
        className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#0A0C0B] pt-24 pb-8 md:pt-28 text-white"
      >
        {/* Background Atmosphere */}
        <motion.div
          style={{ y: heroBgY, scale: heroBgScale }}
          className="pointer-events-none absolute inset-0 z-0"
        >
          <img
            src="/hero-suburban.jpg"
            alt="Aesthetic modern neighborhood street at twilight"
            className="h-full w-full object-cover object-center brightness-[0.52] contrast-[1.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/40 to-black/90" />
        </motion.div>

        {/* Central Hero Grid */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 mx-auto my-auto w-full max-w-[1440px] px-6 md:px-12 py-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Title, Subtitle, Audiences, CTA */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              {/* Audience Pill */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#B5472B]/40 bg-[#B5472B]/15 px-3.5 py-1 backdrop-blur-md self-start">
                <Sparkles className="h-3 w-3 text-[#D9A64E]" />
                <span className="font-mono-tag text-[10px] tracking-[0.16em] uppercase text-zinc-200">
                  FOR STUDENTS • COUPLES • FAMILIES • REMOTE RELOCATORS
                </span>
              </div>

              {/* 1/ TITLE (Explain value, address biggest objection, own niche) */}
              <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-[4.6rem] xl:text-[5.4rem] font-normal leading-[0.94] tracking-[-0.03em] text-white">
                A trusted local voice,
                <br />
                <span className="italic font-light text-white/95">who vouches for you.</span>
                <br />
                So Almaty landlords say yes.
              </h1>

              {/* 2/ SUBTITLE (Specific explanation of how we create value) */}
              <p className="mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-zinc-300">
                Whether you're moving from another city (Shymkent, Semey, Atyrau, abroad), searching as a couple, a family, or a student: we verify your Krisha.kz listing, check official eGov title deeds, place a credible 42-second call to the landlord on your behalf, and secure private viewings. 0 ₸ broker fee, 0 ₸ commission.
              </p>

              {/* 5/ CTA (Call to Value + Objection Handler) */}
              <div className="mt-8 space-y-3">
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="group relative inline-flex items-center gap-3 rounded-full border border-white/20 bg-[#B5472B] px-7 py-4 text-xs sm:text-sm font-semibold text-white shadow-[0_12px_35px_-5px_rgba(181,71,43,0.7)] transition-all duration-300 hover:bg-[#8F3620] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <span>Get Your Free Local Voucher</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={() => scrollToSection("#audiences")}
                    className="inline-flex items-center gap-2 text-xs font-mono-tag tracking-wider uppercase text-zinc-300 hover:text-white transition-colors cursor-pointer py-3"
                  >
                    <span>Who We Help</span>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Objection Handle Line */}
                <p className="flex items-center gap-2 text-[11px] font-mono-tag text-zinc-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>100% Free • No Kaspi wire • For students, couples &amp; relocators • Zero broker cuts</span>
                </p>
              </div>

              {/* 4/ SOCIAL PROOF (Instant Credibility Above the Fold) */}
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-6">
                <div className="flex -space-x-2.5">
                  <img
                    src="/team-sua.jpg"
                    alt="Team SUA Coordinator"
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
                    <span className="font-bold text-white text-xs">4.9/5 satisfaction rating</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono-tag mt-0.5">
                    Housed tenants from Shymkent, Semey, Atyrau, Zharkent &amp; abroad • 0 scams allowed
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 3/ VISUAL (Product In Action with 3 Persona Tabs) */}
            <div className="lg:col-span-5 flex justify-center">
              <ProductInActionMockup onOpenModal={() => setIsModalOpen(true)} />
            </div>
          </div>
        </motion.div>

        {/* Bottom Metrics Bar */}
        <div className="relative z-10 border-t border-white/15 bg-black/60 backdrop-blur-md">
          <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-4 px-6 py-4 sm:grid-cols-4 md:grid-cols-12 md:px-12 items-center">
            <div className="md:col-span-3">
              <div className="text-2xl md:text-3xl font-light tracking-tight text-white font-editorial">
                90%
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-zinc-300">
                Initial rejection rate for unvouched out-of-towners, guys &amp; students in Almaty
              </p>
            </div>

            <div className="md:col-span-3">
              <div className="text-2xl md:text-3xl font-light tracking-tight text-white font-editorial">
                0 ₸
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-zinc-300">
                Commission or hidden fees: volunteer civic initiative, zero broker deduction
              </p>
            </div>

            <div className="md:col-span-3">
              <div className="text-2xl md:text-3xl font-light tracking-tight text-white font-editorial">
                42 sec
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-zinc-300">
                Average voucher phone call duration that secures an in-person viewing slot
              </p>
            </div>

            <div className="col-span-2 sm:col-span-4 md:col-span-3 flex justify-end">
              <button
                onClick={() => scrollToSection("#audiences")}
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
          AUDIENCES SECTION: WHO WE HELP (Students, Couples, Relocators, Krisha)
      ===================================================================== */}
      <section
        id="audiences"
        className="relative w-full bg-[#EAE6DF] px-6 py-28 md:px-12 md:py-36 text-[#141414]"
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="font-mono-tag text-[10px] tracking-[0.24em] text-[#B5472B] uppercase font-bold">
              ( BUILT FOR EVERY RENTER IN ALMATY )
            </span>
            <h2 className="mt-4 font-editorial text-4xl sm:text-5xl md:text-[3.8rem] font-normal leading-[1.05]">
              Housing in Almaty is broken.
              <br />
              <span className="italic font-light">Here is who we stand beside every day.</span>
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-zinc-700 max-w-xl mx-auto leading-relaxed">
              From our interviews across Almaty, we discovered that whether you're a freshman, a newly married couple, or an out-of-towner relocating for work, the same distrust blocks you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AUDIENCE_CARDS.map((aud, idx) => {
              const Icon = aud.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-black/10 bg-[#FBF9F5] p-7 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono-tag text-[9px] tracking-wider text-[#B5472B] font-bold uppercase">
                        {aud.tag}
                      </span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#141414] text-white">
                        <Icon className="h-4 w-4 text-[#D9A64E]" />
                      </div>
                    </div>

                    <h3 className="font-editorial text-2xl font-medium text-[#141414] leading-snug mb-1">
                      {aud.title}
                    </h3>
                    <div className="text-[10px] font-mono-tag text-zinc-500 mb-4">{aud.cities}</div>

                    <div className="rounded-xl border border-rose-500/20 bg-rose-50/70 p-3 mb-4">
                      <p className="text-[11px] italic text-zinc-800 font-serif leading-relaxed">
                        {aud.friction}
                      </p>
                    </div>

                    <p className="text-xs text-zinc-700 leading-relaxed font-sans">{aud.solution}</p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-mono-tag text-[#B5472B]">
                    <span>Verified Vouch Protocol</span>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          PART 2: BELOW THE FOLD (Step 6: Make the Value Concrete)
          Concrete features addressing the real interview objections + 4 chapters
      ===================================================================== */}
      <section
        id="how-it-works"
        className="relative w-full bg-[#121413] px-6 py-28 md:px-12 md:py-36 text-white border-t border-white/10"
      >
        <div className="mx-auto max-w-[1400px]">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="font-mono-tag text-[10px] tracking-[0.24em] text-[#D9A64E] uppercase font-bold">
              ( STEP 06 • MAKE VALUE CONCRETE )
            </span>
            <h2 className="mt-4 font-editorial text-4xl sm:text-5xl md:text-[3.8rem] font-normal leading-[1.05]">
              How we resolve the 4 biggest frictions
              <br />
              <span className="italic font-light">revealed in our Almaty field interviews.</span>
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
              We took real quotes from renters moving from Shymkent, Semey, Zharkent, and abroad. Here is how our concrete systems protect you.
            </p>
          </div>

          {/* 4 Core Features Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            {CORE_FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-[#161917]/80 p-7 shadow-sm flex flex-col justify-between hover:border-white/20 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono-tag text-[9px] tracking-wider text-[#D9A64E] font-bold uppercase">
                        {feat.tag}
                      </span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white">
                        <Icon className="h-4 w-4 text-[#D9A64E]" />
                      </div>
                    </div>

                    <div className="rounded-xl border border-rose-500/25 bg-rose-950/20 p-3 mb-4">
                      <p className="text-[11px] italic text-rose-200/90 font-serif leading-relaxed">
                        {feat.objection}
                      </p>
                    </div>

                    <h3 className="font-editorial text-2xl font-medium text-white leading-snug mb-3">
                      {feat.featureTitle}
                    </h3>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      {feat.featureDesc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono-tag text-emerald-400">
                    <span>{feat.metric}</span>
                    <Check className="h-3.5 w-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Overlapping Parallax Chapters with User's Storytelling Photos */}
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
          PART 2: BELOW THE FOLD (Step 7: Bring to Life Your Offer)
          Real stories directly from the uploaded interviews + 6 transcript cards
      ===================================================================== */}
      <section
        id="stories"
        className="relative w-full bg-[#0D0F0E] px-6 py-28 md:px-12 md:py-36 text-white border-t border-white/10"
      >
        <div className="mx-auto max-w-[1400px]">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="font-mono-tag text-[10px] tracking-[0.24em] text-[#B5472B] uppercase font-bold">
              ( STEP 07 • BRING TO LIFE YOUR OFFER )
            </span>
            <h2 className="mt-4 font-editorial text-4xl sm:text-5xl md:text-[3.8rem] font-normal leading-[1.05]">
              Real tenants. Real apartments.
              <br />
              <span className="italic font-light">Zero scams. Real keys in hand.</span>
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Above the fold promised credibility. Below the fold shows exactly how out-of-town relocators, couples, and student groups found safe homes in Almaty.
            </p>
          </div>

          {/* 3 Real Customer Transformation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {CUSTOMER_STORIES.map((story, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-[#161917]/80 overflow-hidden backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all"
              >
                <div className="h-52 w-full relative overflow-hidden">
                  <img
                    src={story.photo}
                    alt={story.name}
                    className="h-full w-full object-cover object-center"
                  />
                  <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-[10px] font-mono-tag px-3 py-1 text-emerald-400 rounded-full border border-emerald-500/30">
                    VERIFIED TENANT
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-mono-tag text-[#D9A64E] uppercase mb-1">
                      {story.category}
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
              <span className="font-mono-tag text-[10px] tracking-[0.2em] text-[#D9A64E] uppercase font-bold">
                ( EMPIRICAL FIELD INTERVIEWS • ALMATY DOSSIER )
              </span>
              <h3 className="font-editorial text-3xl sm:text-4xl text-white mt-2">
                Unfiltered quotes from real renters in Almaty
              </h3>
              <p className="text-xs text-zinc-400 mt-2">
                Collected from tenants moving from Shymkent, Zharkent, Semey, Atyrau, and international relocators.
              </p>
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
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
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
          PART 2: BELOW THE FOLD (Step 8: FAQ / Tie Up Loose Ends)
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
              Everything you need to know about our Almaty rental backing and verification pilot.
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
            Don't search alone in Almaty.
            <br />
            <span className="italic font-light">Let a trusted local voice back you up.</span>
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
            Whether you are relocating from another region, moving in as a couple, or searching with friends: avoid fake Krisha listings, rude hang-ups, and predatory broker cuts.
          </p>

          {/* 4 Value Checkmarks */}
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
              <span>Official eGov title deed &amp; lease verification</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/40 p-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Direct Telegram response from Team SUA in 1h</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="group inline-flex items-center gap-3 rounded-full bg-[#B5472B] px-8 py-4 text-sm font-semibold text-white shadow-[0_15px_40px_-5px_rgba(181,71,43,0.8)] hover:bg-[#8F3620] hover:scale-[1.03] transition-all cursor-pointer"
            >
              <span>Get Your Free Local Voucher Now</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="text-[11px] font-mono-tag text-zinc-400">
              ⚡ 100% Free Pilot • No credit card • No Kaspi wire • For students, couples, and all Almaty renters
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          PART 2: BELOW THE FOLD (Step 10: Founder's Note / Make Yourself Memorable)
          1/ Put yourself in their shoes
          2/ Explain their problem
          3/ Take ownership of it
          4/ Show the happy ending
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
                  Claudio, Yersultan Aldanazar &amp; Yerkezhan • Almaty, Kazakhstan
                </p>
              </div>
            </div>

            <div className="pt-8 space-y-5 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
              {/* 1/ Put yourself in their shoes */}
              <p className="font-editorial text-lg text-white font-normal italic">
                “Dear fellow renter,”
              </p>
              <p>
                We still remember what it felt like stepping into Almaty's housing market. Whether arriving on a train from Semey, searching remotely from Shymkent, trying to move in as a young couple, or arriving as a university freshman: you quickly realize how hostile renting in this city can be.
              </p>

              {/* 2/ Explain their problem */}
              <p>
                In 90% of calls, landlords reject you the instant they hear you don't have local family. Shady brokers charge 30,000–50,000 ₸ upfront for fake phone numbers, fake landlords try to sublet apartments they don't own, and couples get trapped in rentals where the owner shows up unannounced with realtors every week. It drains hundreds of hours of emotional energy.
              </p>

              {/* 3/ Take ownership of it */}
              <p>
                Then we noticed something fundamental: anyone who has a trusted, established local relative in Almaty never suffers this discrimination. When an older, credible local voice places the call, landlords smile, drop their suspicion, and unlock the doors. We asked ourselves: <em>why shouldn't every single person moving to or living in Almaty have that exact same credible backing?</em>
              </p>

              {/* 4/ Show the happy ending */}
              <p className="text-white font-medium">
                So we built Local Guarantor. We started with our fellow students and expanded to help young couples, remote relocators, and families. Today, hundreds of safe nights have been unlocked, zero Kaspi prepayment scams have been permitted, and tenants live with clean, honest bilateral contracts. You don't have to face Almaty's housing market alone — we've got your back.
              </p>

              {/* Signatures & Direct Contacts */}
              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <div className="font-editorial text-xl text-[#D9A64E]">
                    Yersultan Aldanazar, Claudio &amp; Yerkezhan
                  </div>
                  <div className="text-[11px] font-mono-tag text-zinc-400">
                    Team SUA • Almaty, Kazakhstan
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
              ( FOR RENTERS )
            </div>
            <ul className="space-y-2 text-zinc-300">
              <li>
                <button onClick={() => setIsModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">
                  Request Free Voucher
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("#audiences")} className="hover:text-white transition-colors cursor-pointer">
                  Who We Help
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("#how-it-works")} className="hover:text-white transition-colors cursor-pointer">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("#stories")} className="hover:text-white transition-colors cursor-pointer">
                  Real Stories
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="font-mono-tag text-[10px] tracking-[0.2em] text-[#B5472B] uppercase font-bold">
              ( FOR LANDLORDS )
            </div>
            <ul className="space-y-2 text-zinc-400">
              <li>Tenant Background Verification</li>
              <li>Respectful Occupancy Standards</li>
              <li>Direct Contact (No Middlemen)</li>
              <li>0 ₸ Commission Protection</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="font-mono-tag text-[10px] tracking-[0.2em] text-[#B5472B] uppercase font-bold">
              ( ABOUT INITIATIVE )
            </div>
            <ul className="space-y-2 text-zinc-300">
              <li>Civic Housing Backing Protocol</li>
              <li>Almaty, Kazakhstan</li>
              <li>Team SUA (Claudio, Yersultan, Yerkezhan)</li>
              <li>
                <span className="text-[10px] text-zinc-500">100% Free Public Pilot</span>
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
          <span>© 2026 Local Guarantor. Almaty Housing Backing Pilot. All rights reserved.</span>
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
                  ALMATY PILOT • 100% FREE
                </span>
                <h3 className="font-editorial text-3xl font-normal text-white mt-1">
                  Request a Local Voucher
                </h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed font-sans">
                  Whether you're a student, a young couple, relocating from another city, or searching with roommates: our coordinator will contact you and call the Almaty landlord on your behalf.
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
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    The notification has been delivered directly to the team Telegram. Yersultan or our coordinator will contact you shortly to review your Krisha.kz listing.
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
                      Your Full Name &amp; Profile (e.g. Student, Couple, Relocating from Shymkent) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arman & Daria, Young Couple from Semey"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#B5472B] focus:bg-white/10 transition-all font-sans"
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
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#B5472B] focus:bg-white/10 transition-all font-sans"
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
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#B5472B] focus:bg-white/10 transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono-tag uppercase text-zinc-400 mb-1.5">
                      Krisha.kz Listing Link or Preferred Area / Requirements
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Paste link to Krisha.kz listing or describe the area and budget you are searching for..."
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#B5472B] focus:bg-white/10 transition-all font-sans"
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
                          <span>Send Request for Voucher — 100% Free</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center pt-2 text-[10px] text-zinc-500 font-sans">
                    By submitting, your request is safely delivered to the Team SUA coordinators in Almaty.
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
