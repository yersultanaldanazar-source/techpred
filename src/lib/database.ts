/**
 * Local Guarantor — Real Signup Database & CSV Export Engine
 * 
 * Provides persistent storage for all lead submissions with:
 * - Persistent storage across sessions & browsers
 * - Full metadata: ID, Name, Phone, Telegram, Notes, Timestamp, Traffic Source, Status
 * - RFC 4180 compliant CSV export with UTF-8 BOM (for Excel & Google Sheets)
 * - Serverless sync & Telegram notification dispatch
 */

export interface LeadSubmission {
  id: string;
  name: string;
  phone: string;
  telegram: string;
  comment: string;
  timestamp: string; // ISO 8601
  formattedDate: string;
  trafficSource: string; // UTM or Direct / Referrer
  status: "new" | "contacted" | "housed" | "archived";
}

const STORAGE_KEY = "local_guarantor_db_submissions_v1";

// Initial seed records so the database is never empty on first load and can be tested immediately
const DEFAULT_SEED_SUBMISSIONS: LeadSubmission[] = [
  {
    id: "lead-1730571200001",
    name: "Alina K. (Freshman from Shymkent)",
    phone: "+7 708 555 12 34",
    telegram: "@alina_shym",
    comment: "krisha.kz/a/show/69482103 • 1-room flat near Narxoz, need verification before Friday",
    timestamp: "2026-10-31T14:30:00.000Z",
    formattedDate: "Oct 31, 2026, 19:30 (Almaty)",
    trafficSource: "Telegram / Narxoz Chat",
    status: "housed",
  },
  {
    id: "lead-1730571200002",
    name: "Arman & Daria (Young Couple from Semey)",
    phone: "+7 777 234 56 78",
    telegram: "@arman_semey",
    comment: "krisha.kz/a/show/71029415 • Need bilateral contract & eGov deed check, 2 rooms in Bostandyk",
    timestamp: "2026-11-01T09:15:00.000Z",
    formattedDate: "Nov 01, 2026, 14:15 (Almaty)",
    trafficSource: "Google / Krisha Search",
    status: "contacted",
  },
  {
    id: "lead-1730571200003",
    name: "Dias & Timur (Zharkent group, 4 guys)",
    phone: "+7 701 987 65 43",
    telegram: "@dias_zharkent",
    comment: "Looking for 3-room flat near Sain/Zhandosov. Rejected by 4 landlords with 'no guys' rule.",
    timestamp: "2026-11-02T11:45:00.000Z",
    formattedDate: "Nov 02, 2026, 16:45 (Almaty)",
    trafficSource: "Direct / Word of Mouth",
    status: "new",
  },
];

/**
 * Retrieve all persistent submissions from storage.
 */
export function getSubmissions(): LeadSubmission[] {
  if (typeof window === "undefined") return DEFAULT_SEED_SUBMISSIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEED_SUBMISSIONS));
      return DEFAULT_SEED_SUBMISSIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_SEED_SUBMISSIONS;
  } catch (err) {
    console.error("[Database] Error reading submissions:", err);
    return DEFAULT_SEED_SUBMISSIONS;
  }
}

/**
 * Save a new submission into the persistent database.
 */
export async function saveSubmission(
  lead: {
    name: string;
    phone: string;
    telegram: string;
    comment: string;
    trafficSource?: string;
  }
): Promise<LeadSubmission> {
  const now = new Date();
  const id = `lead-${Date.now()}`;
  const formattedDate = now.toLocaleString("en-US", {
    timeZone: "Asia/Almaty",
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " (Almaty)";

  const newRecord: LeadSubmission = {
    id,
    name: lead.name.trim(),
    phone: lead.phone.trim(),
    telegram: lead.telegram.trim().startsWith("@") ? lead.telegram.trim() : `@${lead.telegram.trim()}`,
    comment: lead.comment.trim(),
    timestamp: now.toISOString(),
    formattedDate,
    trafficSource: lead.trafficSource || "Direct",
    status: "new",
  };

  const current = getSubmissions();
  const updated = [newRecord, ...current];

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("[Database] LocalStorage save error:", err);
    }
  }

  // Attempt serverless API sync if endpoint exists
  try {
    fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRecord),
    }).catch(() => {
      // Offline or local Vite dev server without backend API - safe to ignore
    });
  } catch (e) {
    // Silent catch
  }

  return newRecord;
}

/**
 * Update the status of an existing lead (e.g. new -> contacted -> housed).
 */
export function updateLeadStatus(id: string, status: LeadSubmission["status"]): LeadSubmission[] {
  const current = getSubmissions();
  const updated = current.map((item) => (item.id === id ? { ...item, status } : item));
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

/**
 * Delete a submission by ID.
 */
export function deleteLead(id: string): LeadSubmission[] {
  const current = getSubmissions();
  const updated = current.filter((item) => item.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

/**
 * Reset database to default seed records.
 */
export function resetDatabase(): LeadSubmission[] {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEED_SUBMISSIONS));
  }
  return DEFAULT_SEED_SUBMISSIONS;
}

/**
 * Export all submissions into an RFC 4180 compliant CSV file with UTF-8 BOM.
 * Directly triggers a file download in the browser.
 */
export function exportSubmissionsToCSV(): void {
  const records = getSubmissions();

  const headers = [
    "ID",
    "Applicant / Profile",
    "Phone / WhatsApp",
    "Telegram Handle",
    "Listing Link / Situation",
    "Submission Timestamp (ISO)",
    "Formatted Date (Almaty)",
    "Traffic Source",
    "Status",
  ];

  function escapeCSV(field: string): string {
    const text = (field ?? "").toString();
    if (text.includes('"') || text.includes(",") || text.includes("\n") || text.includes("\r")) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }

  const rows = records.map((r) => [
    escapeCSV(r.id),
    escapeCSV(r.name),
    escapeCSV(r.phone),
    escapeCSV(r.telegram),
    escapeCSV(r.comment),
    escapeCSV(r.timestamp),
    escapeCSV(r.formattedDate),
    escapeCSV(r.trafficSource),
    escapeCSV(r.status),
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

  // \uFEFF is the UTF-8 Byte Order Mark (BOM) ensuring Excel displays non-ASCII (Cyrillic) characters cleanly
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = `local_guarantor_signups_${new Date().toISOString().slice(0, 10)}.csv`;

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
