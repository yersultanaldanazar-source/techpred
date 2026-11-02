/**
 * Local Guarantor — Analytics Engine (Part 3: Measure What Matters)
 * 
 * Configured for Google Analytics 4 (GA4) & Local Analytics Dashboard to answer:
 * 1. How many people visit? — page views, unique visitors, traffic sources
 * 2. What do they look at? — section-level engagement & scroll depth
 * 3. Do they convert? — full funnel: page_view -> cta_click -> sign_up (Key Conversion Event)
 * 
 * Reports Conversion Rate = (Signups ÷ Unique Visitors) × 100%
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

const VISITOR_KEY = "lg_analytics_visitor_id_v1";
const SESSIONS_KEY = "lg_analytics_sessions_v1";
const METRICS_KEY = "lg_analytics_realtime_metrics_v1";

export interface AnalyticsMetrics {
  totalPageViews: number;
  uniqueVisitors: number;
  totalCtaClicks: number;
  totalSignUps: number;
  conversionRate: number; // Percentage
  trafficSources: Record<string, number>;
  sectionViews: Record<string, number>;
  scrollDepthReached: Record<string, number>;
}

/**
 * Returns or initializes a persistent unique visitor ID.
 */
export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "server-render";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = `vis-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

/**
 * Detects traffic source from UTM parameters or document.referrer.
 */
export function detectTrafficSource(): string {
  if (typeof window === "undefined") return "Direct";
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");

  if (utmSource) {
    return `${utmSource}${utmMedium ? ` / ${utmMedium}` : ""}${utmCampaign ? ` (${utmCampaign})` : ""}`;
  }

  const referrer = document.referrer;
  if (!referrer) return "Direct";

  try {
    const refUrl = new URL(referrer);
    const host = refUrl.hostname.toLowerCase();
    if (host.includes("google")) return "Google Search";
    if (host.includes("yandex")) return "Yandex Search";
    if (host.includes("t.me") || host.includes("telegram")) return "Telegram";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("krisha")) return "Krisha.kz";
    if (host.includes("narxoz")) return "Narxoz Portal";
    return refUrl.hostname;
  } catch {
    return "Referral";
  }
}

/**
 * Retrieves the local analytics storage.
 */
export function getStoredMetrics(): AnalyticsMetrics {
  const defaultMetrics: AnalyticsMetrics = {
    totalPageViews: 1,
    uniqueVisitors: 1,
    totalCtaClicks: 0,
    totalSignUps: 0,
    conversionRate: 0,
    trafficSources: { Direct: 1 },
    sectionViews: {
      "#hero": 1,
      "#audiences": 0,
      "#how-it-works": 0,
      "#stories": 0,
      "#interviews": 0,
      "#faq": 0,
      "#cta-repeat": 0,
      "#founder-note": 0,
    },
    scrollDepthReached: { "25%": 1, "50%": 0, "75%": 0, "100%": 0 },
  };

  if (typeof window === "undefined") return defaultMetrics;

  try {
    const raw = localStorage.getItem(METRICS_KEY);
    if (!raw) {
      localStorage.setItem(METRICS_KEY, JSON.stringify(defaultMetrics));
      return defaultMetrics;
    }
    const parsed = JSON.parse(raw);
    return { ...defaultMetrics, ...parsed };
  } catch {
    return defaultMetrics;
  }
}

function updateMetrics(updater: (prev: AnalyticsMetrics) => AnalyticsMetrics) {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredMetrics();
    const next = updater(current);
    // Recalculate conversion rate = (signups / unique visitors) * 100
    const visitors = Math.max(1, next.uniqueVisitors);
    next.conversionRate = Number(((next.totalSignUps / visitors) * 100).toFixed(1));
    localStorage.setItem(METRICS_KEY, JSON.stringify(next));
  } catch (err) {
    console.error("[Analytics] Error updating metrics:", err);
  }
}

/**
 * Initializes Google Analytics 4 (GA4) script if MEASUREMENT_ID is provided.
 */
export function initGA4() {
  if (typeof window === "undefined") return;

  const gaId =
    import.meta.env.VITE_GA_MEASUREMENT_ID ||
    (window as any).VITE_GA_MEASUREMENT_ID ||
    "G-LOCALGUARANTOR";

  // Check if GA4 is already loaded
  if (!window.gtag) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());

    if (gaId && gaId.startsWith("G-") && gaId !== "G-LOCALGUARANTOR") {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      window.gtag("config", gaId, {
        send_page_view: true,
        cookie_flags: "SameSite=None;Secure",
      });
      console.log(`[GA4] Initialized with ID: ${gaId}`);
    } else {
      console.log("[GA4] Local Guarantor analytics active in simulation & reporting mode.");
    }
  }

  // Record Unique Visitor & Traffic Source in metrics
  const visitorId = getOrCreateVisitorId();
  const source = detectTrafficSource();
  const sessionKey = `lg_sess_${new Date().toDateString()}`;
  const isNewSession = !sessionStorage.getItem(sessionKey);

  if (isNewSession) {
    sessionStorage.setItem(sessionKey, "true");
    updateMetrics((prev) => {
      const isFirstVisitEver = !localStorage.getItem(SESSIONS_KEY);
      localStorage.setItem(SESSIONS_KEY, "true");

      const sources = { ...prev.trafficSources };
      sources[source] = (sources[source] || 0) + 1;

      return {
        ...prev,
        totalPageViews: prev.totalPageViews + 1,
        uniqueVisitors: isFirstVisitEver ? prev.uniqueVisitors + 1 : prev.uniqueVisitors,
        trafficSources: sources,
      };
    });
  }
}

/**
 * Track Page View event in GA4 & Local Engine.
 */
export function trackPageView(pageTitle = "Local Guarantor Landing") {
  const visitorId = getOrCreateVisitorId();
  const source = detectTrafficSource();

  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "page_view", {
      page_title: pageTitle,
      page_location: window.location.href,
      page_path: window.location.pathname,
      traffic_source: source,
      visitor_id: visitorId,
    });
  }

  updateMetrics((prev) => ({
    ...prev,
    totalPageViews: prev.totalPageViews + 1,
  }));
}

/**
 * Track CTA Click event (Step 2 of conversion funnel: page_view -> cta_click -> sign_up).
 */
export function trackCtaClick(location: string, label: string) {
  const source = detectTrafficSource();

  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "cta_click", {
      event_category: "Engagement",
      event_label: label,
      cta_location: location,
      traffic_source: source,
    });
  }

  console.log(`[Analytics: Funnel Step 2] cta_click at ${location} ("${label}")`);

  updateMetrics((prev) => ({
    ...prev,
    totalCtaClicks: prev.totalCtaClicks + 1,
  }));
}

/**
 * Track Sign Up Conversion (Step 3: Key Conversion Event in GA4).
 */
export function trackSignUp(leadData: { name: string; phone: string; trafficSource?: string }) {
  const source = leadData.trafficSource || detectTrafficSource();

  // Send standard GA4 sign_up conversion event
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "sign_up", {
      event_category: "Conversion",
      method: "Local Guarantor Lead Form",
      traffic_source: source,
      value: 0,
      currency: "KZT",
      // GA4 key event marker
      is_key_event: true,
    });
  }

  console.log(`[Analytics: Funnel Step 3 / KEY EVENT] sign_up completed by ${leadData.name}`);

  updateMetrics((prev) => ({
    ...prev,
    totalSignUps: prev.totalSignUps + 1,
  }));
}

/**
 * Track Section Engagement (Q2: What do they look at?).
 */
export function trackSectionView(sectionId: string, durationMs = 1500) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "section_view", {
      section_id: sectionId,
      dwell_time_ms: durationMs,
    });
  }

  updateMetrics((prev) => {
    const views = { ...prev.sectionViews };
    views[sectionId] = (views[sectionId] || 0) + 1;
    return { ...prev, sectionViews: views };
  });
}

/**
 * Track Scroll Depth milestones (25%, 50%, 75%, 100%).
 */
export function trackScrollDepth(percent: 25 | 50 | 75 | 100) {
  const label = `${percent}%`;

  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "scroll_depth", {
      depth_percent: percent,
    });
  }

  updateMetrics((prev) => {
    const reached = { ...prev.scrollDepthReached };
    reached[label] = (reached[label] || 0) + 1;
    return { ...prev, scrollDepthReached: reached };
  });
}
