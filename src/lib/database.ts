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
const SHEETS_URL_KEY = "lg_google_sheets_url";

/**
 * Returns the configured Google Sheets Web App URL.
 */
export function getGoogleSheetsUrl(): string {
  if (typeof window === "undefined") return "";
  return (
    import.meta.env.VITE_GOOGLE_SHEETS_URL ||
    localStorage.getItem(SHEETS_URL_KEY) ||
    ""
  );
}

/**
 * Persists the Google Sheets Web App URL.
 */
export function setGoogleSheetsUrl(url: string): void {
  if (typeof window === "undefined") return;
  const clean = url.trim();
  if (clean) {
    localStorage.setItem(SHEETS_URL_KEY, clean);
  } else {
    localStorage.removeItem(SHEETS_URL_KEY);
  }
}

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

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `// Local Guarantor — Cloud Database Engine for Google Sheets
// Paste into: Google Sheets -> Extensions -> Apps Script

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var r = data[i];
      if (!r[0] && !r[3]) continue;
      rows.push({
        id: String(r[0] || ("lead-" + i)),
        timestamp: String(r[1] || ""),
        formattedDate: String(r[2] || ""),
        name: String(r[3] || ""),
        phone: String(r[4] || ""),
        telegram: String(r[5] || ""),
        comment: String(r[6] || ""),
        trafficSource: String(r[7] || "Direct"),
        status: String(r[8] || "new")
      });
    }
    return ContentService.createTextOutput(JSON.stringify(rows))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "ID",
        "Timestamp (ISO)",
        "Formatted Date (Almaty)",
        "Applicant Name",
        "Phone / WhatsApp",
        "Telegram",
        "Listing / Notes",
        "Traffic Source",
        "Status"
      ]);
    }
    var body = {};
    if (e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (pErr) {
        body = e.parameter || {};
      }
    } else if (e.parameter) {
      body = e.parameter;
    }
    var id = body.id || ("lead-" + new Date().getTime());
    var timestamp = body.timestamp || new Date().toISOString();
    var formattedDate = body.formattedDate || new Date().toLocaleString();
    var name = body.name || "Anonymous";
    var phone = body.phone || "";
    var telegram = body.telegram || "";
    var comment = body.comment || "";
    var trafficSource = body.trafficSource || "Direct";
    var status = body.status || "new";

    sheet.appendRow([
      id,
      timestamp,
      formattedDate,
      name,
      phone,
      telegram,
      comment,
      trafficSource,
      status
    ]);

    return ContentService.createTextOutput(JSON.stringify({ result: "success", id: id }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

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
 * Fetch fresh submissions directly from Google Sheets cloud Web App.
 * Automatically merges cloud data with local records to ensure zero data loss.
 */
export async function syncFromCloud(): Promise<{ leads: LeadSubmission[]; count: number; error?: string }> {
  const url = getGoogleSheetsUrl();
  const localLeads = getSubmissions();
  if (!url) {
    return { leads: localLeads, count: localLeads.length };
  }

  try {
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      throw new Error(`Google Sheets responded with HTTP ${res.status}`);
    }
    const data = await res.json();
    if (Array.isArray(data)) {
      const map = new Map<string, LeadSubmission>();

      // Index local leads first
      localLeads.forEach((item) => map.set(item.id, item));

      // Overwrite or append leads from Google Sheets
      data.forEach((item: any) => {
        if (item && (item.id || item.phone || item.name)) {
          const key = item.id || `lead-${item.phone}-${item.timestamp}`;
          map.set(key, {
            id: String(item.id || key),
            name: String(item.name || "Lead"),
            phone: String(item.phone || ""),
            telegram: String(item.telegram || ""),
            comment: String(item.comment || ""),
            timestamp: String(item.timestamp || new Date().toISOString()),
            formattedDate: String(item.formattedDate || "Recent"),
            trafficSource: String(item.trafficSource || "Direct"),
            status:
              item.status === "contacted" || item.status === "housed" || item.status === "archived"
                ? item.status
                : "new",
          });
        }
      });

      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
      return { leads: merged, count: data.length };
    }
    return { leads: localLeads, count: localLeads.length };
  } catch (err: any) {
    console.warn("[Database] Cloud fetch warning:", err);
    return {
      leads: localLeads,
      count: localLeads.length,
      error: err?.message || "Failed to reach Google Sheets",
    };
  }
}

/**
 * Validates a Google Sheets Web App URL by performing a test GET request.
 */
export async function testGoogleSheetsConnection(
  url: string
): Promise<{ ok: boolean; count?: number; error?: string }> {
  try {
    const clean = url.trim();
    if (!clean.startsWith("https://script.google.com/macros/s/")) {
      return {
        ok: false,
        error: "URL must start with https://script.google.com/macros/s/...",
      };
    }
    const res = await fetch(clean, { method: "GET" });
    if (!res.ok) {
      return { ok: false, error: `Google Sheets responded with HTTP ${res.status}` };
    }
    const json = await res.json();
    if (Array.isArray(json)) {
      return { ok: true, count: json.length };
    }
    return { ok: true, count: 0 };
  } catch (err: any) {
    return {
      ok: false,
      error:
        err?.message ||
        "Could not connect to Google Apps Script. Ensure deployment is set to 'Anyone'.",
    };
  }
}

/**
 * Save a new submission into the persistent database and automatically sync to Google Sheets.
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
  const formattedDate =
    now.toLocaleString("en-US", {
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

  // Real-Time Google Sheets Cloud Sync: Dispatches lead to Google Sheets Web App
  const sheetsUrl = getGoogleSheetsUrl();
  if (sheetsUrl) {
    try {
      // Using no-cors and text/plain ensures no CORS preflight blocks across mobile & desktop browsers
      fetch(sheetsUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(newRecord),
      }).catch((e) => {
        console.warn("[Database] Google Sheets background dispatch warning:", e);
      });
      console.log("[Database] Lead dispatched to Google Sheets cloud database:", id);
    } catch (e) {
      console.warn("[Database] Google Sheets dispatch error:", e);
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
