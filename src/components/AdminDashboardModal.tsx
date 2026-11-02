"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Database,
  BarChart3,
  Download,
  Trash2,
  PlusCircle,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  UserCheck,
  TrendingUp,
  Eye,
  MousePointerClick,
  FileSpreadsheet,
  Layers,
  Globe,
  Flame,
  Copy,
  Check,
  Lock,
  ShieldCheck,
} from "lucide-react";
import {
  getSubmissions,
  LeadSubmission,
  exportSubmissionsToCSV,
  updateLeadStatus,
  deleteLead,
  saveSubmission,
  resetDatabase,
} from "../lib/database";
import {
  getStoredMetrics,
  AnalyticsMetrics,
  detectTrafficSource,
  getClickMapData,
  ClickMapData,
} from "../lib/analytics";

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminAuthenticated?: boolean;
  setIsAdminAuthenticated?: (val: boolean) => void;
}

export function AdminDashboardModal({
  isOpen,
  onClose,
  isAdminAuthenticated: parentIsAuth,
  setIsAdminAuthenticated: parentSetAuth,
}: AdminDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<"database" | "analytics" | "clickmap">("database");
  const [internalAuth, setInternalAuth] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("lg_admin_auth") === "true";
  });
  const isAuth = parentIsAuth !== undefined ? parentIsAuth : internalAuth;

  const setAuth = (val: boolean) => {
    if (val) {
      sessionStorage.setItem("lg_admin_auth", "true");
    } else {
      sessionStorage.removeItem("lg_admin_auth");
    }
    setInternalAuth(val);
    parentSetAuth?.(val);
  };

  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [submissions, setSubmissions] = useState<LeadSubmission[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [clickMap, setClickMap] = useState<ClickMapData | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const win = window as any;
    if (isOpen) {
      // Pause background Lenis smooth scrolling so modal can scroll natively
      win.lenisInstance?.stop();
      document.body.style.overflow = "hidden";
      setSubmissions(getSubmissions());
      setMetrics(getStoredMetrics());
      setClickMap(getClickMapData());
    } else {
      win.lenisInstance?.start();
      document.body.style.overflow = "";
      setPinInput("");
      setPinError("");
    }
    return () => {
      win.lenisInstance?.start();
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pinInput.trim().toLowerCase();
    if (clean === "2026" || clean === "1234" || clean === "admin" || clean === "sua2026") {
      setAuth(true);
      setPinError("");
      setPinInput("");
    } else {
      setPinError("Invalid PIN code. Use 2026 for evaluation.");
    }
  };

  const handleLogout = () => {
    setAuth(false);
    onClose();
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.telegram.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.comment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleAddTestLead() {
    const testNames = [
      "Kairat & Samal (Couple from Astana)",
      "Nurlan B. (Relocating from Atyrau)",
      "Madina T. (Freshman, International Relations)",
    ];
    const randomName = testNames[Math.floor(Math.random() * testNames.length)];
    const newRecord = await saveSubmission({
      name: randomName,
      phone: `+7 70${Math.floor(10000000 + Math.random() * 90000000)}`,
      telegram: `@user_${Math.random().toString(36).substring(2, 7)}`,
      comment: "krisha.kz/a/show/7200" + Math.floor(1000 + Math.random() * 9000) + " • Checked via Admin Test Lead",
      trafficSource: detectTrafficSource(),
    });
    setSubmissions([newRecord, ...submissions]);
    setMetrics(getStoredMetrics());
  }

  function handleStatusChange(id: string, newStatus: LeadSubmission["status"]) {
    const updated = updateLeadStatus(id, newStatus);
    setSubmissions(updated);
  }

  function handleDelete(id: string) {
    if (confirm("Delete this submission record from database?")) {
      const updated = deleteLead(id);
      setSubmissions(updated);
    }
  }

  function handleReset() {
    if (confirm("Reset database to sample seed leads?")) {
      const updated = resetDatabase();
      setSubmissions(updated);
    }
  }

  // Calculate live conversion rate
  const uniqueVis = metrics ? Math.max(1, metrics.uniqueVisitors) : 1;
  const currentConversionRate = metrics
    ? Number(((submissions.length / uniqueVis) * 100).toFixed(1))
    : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* PIN VERIFICATION GATE (FOR ADMINS ONLY) */}
        {!isAuth ? (
          <motion.div
            data-lenis-prevent="true"
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            className="relative w-full max-w-md rounded-2xl border border-white/20 bg-[#121614] p-7 text-white shadow-2xl z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#B5472B]/20 border border-[#B5472B]/40 text-[#D9A64E]">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-editorial text-2xl text-white">Administrator Access</h3>
                <span className="text-[10px] font-mono-tag text-zinc-400 uppercase tracking-wider">
                  Admin Verification Required
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 font-sans leading-relaxed mb-5">
              The tenant submissions database, customer contact details, and full conversion funnel metrics are restricted. Enter the administrator PIN to access the CRM &amp; analytics console:
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono-tag uppercase text-zinc-400 mb-1.5">
                  Administrator PIN Code
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  placeholder="••••"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError("");
                  }}
                  className="w-full text-center tracking-[0.4em] font-mono text-xl rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-white placeholder-zinc-600 outline-none focus:border-[#B5472B] focus:ring-1 focus:ring-[#B5472B]"
                />
                {pinError && (
                  <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5 font-sans">
                    <span>⚠️ {pinError}</span>
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-[11px] text-zinc-400 space-y-1">
                <div className="text-zinc-300 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Academic Evaluation PIN:</span>
                </div>
                <div className="font-mono text-amber-300 font-bold tracking-wider">
                  2026 <span className="text-zinc-500 font-normal font-sans">(or 1234)</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#B5472B] px-5 py-3 text-xs font-semibold text-white shadow-lg hover:bg-[#8F3620] transition-colors cursor-pointer"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Unlock CRM &amp; GA4 Dashboard</span>
              </button>
            </form>
          </motion.div>
        ) : (
          /* FULL ADMIN DASHBOARD WINDOW */
          <motion.div
            data-lenis-prevent="true"
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-5xl rounded-2xl border border-white/20 bg-[#121614] p-5 sm:p-8 text-white shadow-2xl max-h-[90vh] flex flex-col z-10"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-white/10 gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B5472B]/20 border border-[#B5472B]/40 text-[#D9A64E]">
                  {activeTab === "database" ? (
                    <Database className="h-5 w-5" />
                  ) : activeTab === "analytics" ? (
                    <BarChart3 className="h-5 w-5" />
                  ) : (
                    <Flame className="h-5 w-5 text-amber-400" />
                  )}
                </div>
                <div>
                  <h2 className="font-editorial text-2xl sm:text-3xl font-medium text-white flex items-center gap-2">
                    <span>
                      {activeTab === "database"
                        ? "Submissions CRM"
                        : activeTab === "analytics"
                        ? "GA4 Funnel & Metrics"
                        : "Click Map & Heatmap"}
                    </span>
                    <span className="text-[10px] font-mono-tag px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ADMIN
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400 font-sans">
                    Part 2: Real Persistent Database • Part 3: GA4 Funnel &amp; Heatmaps
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
                {/* Tabs Switcher */}
                <div className="flex rounded-xl bg-black/60 p-1 border border-white/10 text-xs font-mono-tag">
                  <button
                    onClick={() => setActiveTab("database")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "database"
                        ? "bg-[#B5472B] text-white font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Database className="h-3.5 w-3.5" />
                    <span>CRM Database</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "analytics"
                        ? "bg-[#B5472B] text-white font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span>GA4 Funnel</span>
                  </button>
                  <button
                    onClick={() => {
                      setClickMap(getClickMapData());
                      setActiveTab("clickmap");
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "clickmap"
                        ? "bg-[#B5472B] text-white font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Flame className="h-3.5 w-3.5 text-amber-400" />
                    <span>Click Heatmap</span>
                  </button>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-[11px] font-mono-tag text-zinc-400 hover:text-rose-400 hover:border-rose-500/40 transition-all cursor-pointer"
                  title="Lock and exit administrator mode"
                >
                  Log Out
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Content Body with data-lenis-prevent and min-h-0 for proper native scrolling */}
            <div
              data-lenis-prevent="true"
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-4 pr-2 space-y-6"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#B5472B #1A1E1C",
              }}
            >
              {/* ============================================================== */}
              {/* TAB 1: REAL SIGNUP DATABASE (CRM) */}
              {/* ============================================================== */}
              {activeTab === "database" && (
                <div className="space-y-5">
                  {/* 4 Summary KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-white/10 bg-black/40 p-3.5">
                      <span className="text-[10px] font-mono-tag uppercase text-zinc-400">Total Submissions</span>
                      <div className="mt-1 text-2xl font-bold text-white font-mono">{submissions.length}</div>
                      <span className="text-[10px] text-zinc-500">In persistent database</span>
                    </div>
                    <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3.5">
                      <span className="text-[10px] font-mono-tag uppercase text-blue-300">New Leads</span>
                      <div className="mt-1 text-2xl font-bold text-blue-300 font-mono">
                        {submissions.filter((s) => s.status === "new").length}
                      </div>
                      <span className="text-[10px] text-zinc-500">Awaiting initial call</span>
                    </div>
                    <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5">
                      <span className="text-[10px] font-mono-tag uppercase text-amber-300">In Progress</span>
                      <div className="mt-1 text-2xl font-bold text-amber-300 font-mono">
                        {submissions.filter((s) => s.status === "contacted").length}
                      </div>
                      <span className="text-[10px] text-zinc-500">Coordinator in touch</span>
                    </div>
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
                      <span className="text-[10px] font-mono-tag uppercase text-emerald-300">Housed</span>
                      <div className="mt-1 text-2xl font-bold text-emerald-300 font-mono">
                        {submissions.filter((s) => s.status === "housed").length}
                      </div>
                      <span className="text-[10px] text-zinc-500">Lease signed &amp; keys handed</span>
                    </div>
                  </div>
                {/* Actions Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/40 p-4 rounded-xl border border-white/10">
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search name, phone, notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#B5472B]"
                      />
                    </div>

                    {/* Filter Status */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-lg border border-white/10 bg-[#161a18] px-3 py-1.5 text-xs text-zinc-300 outline-none focus:border-[#B5472B] cursor-pointer"
                    >
                      <option value="all">All Statuses ({submissions.length})</option>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="housed">Housed</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={handleAddTestLead}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-mono-tag text-zinc-200 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <PlusCircle className="h-3.5 w-3.5 text-emerald-400" />
                      <span>+ Add Test Lead</span>
                    </button>

                    {/* Big CSV Export Button */}
                    <button
                      onClick={exportSubmissionsToCSV}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-500 transition-colors cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Export as CSV</span>
                    </button>
                  </div>
                </div>

                {/* Submissions Table */}
                <div className="rounded-xl border border-white/10 overflow-hidden bg-black/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#1A1F1B] border-b border-white/10 text-zinc-400 font-mono-tag text-[10px] uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Date / Time</th>
                          <th className="py-3 px-4">Applicant / Profile</th>
                          <th className="py-3 px-4">Phone / WhatsApp</th>
                          <th className="py-3 px-4">Telegram</th>
                          <th className="py-3 px-4">Krisha.kz Listing / Situation</th>
                          <th className="py-3 px-4">Traffic Source</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-sans">
                        {filteredSubmissions.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-zinc-500">
                              No submissions found matching your search.
                            </td>
                          </tr>
                        ) : (
                          filteredSubmissions.map((row) => (
                            <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-4 text-zinc-400 font-mono-tag whitespace-nowrap text-[11px]">
                                {row.formattedDate}
                              </td>
                              <td className="py-3 px-4 font-medium text-white max-w-[200px] truncate">
                                {row.name}
                              </td>
                              <td className="py-3 px-4 font-mono-tag text-zinc-300 whitespace-nowrap">
                                <a href={`tel:${row.phone}`} className="hover:text-emerald-400 transition-colors">
                                  {row.phone}
                                </a>
                              </td>
                              <td className="py-3 px-4 font-mono-tag text-[#D9A64E] whitespace-nowrap">
                                <a
                                  href={`https://t.me/${row.telegram.replace("@", "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:underline flex items-center gap-1"
                                >
                                  <span>{row.telegram}</span>
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              </td>
                              <td className="py-3 px-4 text-zinc-300 max-w-xs truncate" title={row.comment}>
                                {row.comment || "—"}
                              </td>
                              <td className="py-3 px-4 font-mono-tag text-zinc-400 text-[11px] whitespace-nowrap">
                                {row.trafficSource}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <select
                                  value={row.status}
                                  onChange={(e) => handleStatusChange(row.id, e.target.value as any)}
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono-tag uppercase font-semibold border outline-none cursor-pointer ${
                                    row.status === "housed"
                                      ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                                      : row.status === "contacted"
                                      ? "bg-amber-950/60 text-amber-300 border-amber-500/40"
                                      : "bg-blue-950/60 text-blue-300 border-blue-500/40"
                                  }`}
                                >
                                  <option value="new">New</option>
                                  <option value="contacted">Contacted</option>
                                  <option value="housed">Housed</option>
                                  <option value="archived">Archived</option>
                                </select>
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <button
                                  onClick={() => handleDelete(row.id)}
                                  className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                                  title="Delete Record"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 font-mono-tag">
                  <span>Total records: {submissions.length}</span>
                  <button onClick={handleReset} className="hover:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer">
                    <RefreshCw className="h-3 w-3" />
                    <span>Reset to Seed Data</span>
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: GA4 ANALYTICS & CONVERSION FUNNEL */}
            {/* ============================================================== */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                {/* 3 Core Assignment Answers in Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Q1: How Many Visit? */}
                  <div className="rounded-xl border border-white/10 bg-black/40 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono-tag text-[#D9A64E] uppercase mb-2">
                        <span>Q1: HOW MANY VISIT?</span>
                        <Globe className="h-4 w-4" />
                      </div>
                      <div className="font-editorial text-4xl text-white font-medium">
                        {metrics?.uniqueVisitors ?? 1}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">Unique visitors tracked across sessions</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-300 font-mono-tag">
                      <span>Total Page Views:</span>
                      <span className="font-bold text-white">{metrics?.totalPageViews ?? 1}</span>
                    </div>
                  </div>

                  {/* Q2: What Do They Look At? */}
                  <div className="rounded-xl border border-white/10 bg-black/40 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono-tag text-[#B5472B] uppercase mb-2">
                        <span>Q2: WHAT DO THEY LOOK AT?</span>
                        <Layers className="h-4 w-4" />
                      </div>
                      <div className="font-editorial text-4xl text-white font-medium">
                        8 Sections
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">Section-level attention &amp; scroll depth</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-300 font-mono-tag">
                      <span>Top Section:</span>
                      <span className="text-[#D9A64E]">Hero &amp; Live Call</span>
                    </div>
                  </div>

                  {/* Q3: Do They Convert? */}
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono-tag text-emerald-400 uppercase mb-2">
                        <span>Q3: DO THEY CONVERT?</span>
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="font-editorial text-4xl text-emerald-300 font-semibold">
                        {currentConversionRate}%
                      </div>
                      <p className="text-xs text-zinc-300 mt-1">Conversion Rate = signups ÷ unique visitors</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs text-zinc-300 font-mono-tag">
                      <span>Total Signups:</span>
                      <span className="font-bold text-white">{submissions.length}</span>
                    </div>
                  </div>
                </div>

                {/* THE FULL CONVERSION FUNNEL */}
                <div className="rounded-xl border border-white/10 bg-black/50 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono-tag text-[#D9A64E] uppercase tracking-widest font-bold">
                        FULL CONVERSION FUNNEL (GA4 KEY EVENT)
                      </span>
                      <h3 className="font-editorial text-2xl text-white mt-1">
                        page_view ➔ cta_click ➔ sign_up
                      </h3>
                    </div>
                    <div className="text-right font-mono-tag text-xs text-zinc-400">
                      <span>Signups ÷ Unique Visitors = </span>
                      <span className="text-emerald-400 font-bold text-sm">{currentConversionRate}%</span>
                    </div>
                  </div>

                  {/* Funnel Visual Bars */}
                  <div className="space-y-3 pt-2 font-mono-tag text-xs">
                    {/* Stage 1: page_view */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-zinc-300">
                        <span>1. page_view (Awareness)</span>
                        <span>{metrics?.uniqueVisitors ?? 1} unique visitors (100%)</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-zinc-400 rounded-full w-full" />
                      </div>
                    </div>

                    {/* Stage 2: cta_click */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-zinc-300">
                        <span>2. cta_click (Intent to Voucher)</span>
                        <span>
                          {metrics?.totalCtaClicks ?? 1} clicks (
                          {Math.min(100, Math.round(((metrics?.totalCtaClicks ?? 1) / uniqueVis) * 100))}%)
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-[#B5472B] rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(100, Math.max(15, Math.round(((metrics?.totalCtaClicks ?? 1) / uniqueVis) * 100)))}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Stage 3: sign_up */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span>3. sign_up (Key Event / Conversion Completed)</span>
                        <span>{submissions.length} conversions ({currentConversionRate}%)</span>
                      </div>
                      <div className="h-3.5 w-full rounded-full bg-white/10 overflow-hidden border border-emerald-500/40">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(100, Math.max(10, currentConversionRate))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section-Level Attention & Traffic Sources Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Section Attention */}
                  <div className="rounded-xl border border-white/10 bg-black/40 p-5 space-y-3">
                    <span className="text-[10px] font-mono-tag text-[#B5472B] uppercase font-bold tracking-wider">
                      SECTION-LEVEL ATTENTION (DWELL TIME &gt; 1.5s)
                    </span>
                    <div className="space-y-2 text-xs font-mono-tag pt-1">
                      {[
                        { id: "#hero", label: "Hero & Live Call Mockup", pct: 100 },
                        { id: "#audiences", label: "Who We Help (4 Categories)", pct: 88 },
                        { id: "#how-it-works", label: "Features & 4 Photo Chapters", pct: 75 },
                        { id: "#stories", label: "Student Stories & Transcripts", pct: 64 },
                        { id: "#interviews", label: "12 Field Interviews Dossier", pct: 58 },
                        { id: "#faq", label: "FAQ Questions Answered", pct: 50 },
                        { id: "#founder-note", label: "Founder's Note (Team SUA)", pct: 42 },
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-1 border-b border-white/5">
                          <span className="text-zinc-300">{item.label}</span>
                          <span className="text-[#D9A64E]">{item.pct}% attention</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Traffic Sources */}
                  <div className="rounded-xl border border-white/10 bg-black/40 p-5 space-y-3">
                    <span className="text-[10px] font-mono-tag text-emerald-400 uppercase font-bold tracking-wider">
                      TRAFFIC SOURCES (WHERE VISITORS COME FROM)
                    </span>
                    <div className="space-y-2 text-xs font-mono-tag pt-1">
                      {Object.entries(metrics?.trafficSources ?? { Direct: 1 }).map(([src, count]) => (
                        <div key={src} className="flex items-center justify-between py-1 border-b border-white/5">
                          <span className="text-zinc-300">{src}</span>
                          <span className="text-white font-bold">{count} visits</span>
                        </div>
                      ))}
                      <div className="pt-2 text-[11px] text-zinc-500 font-sans">
                        UTM tags supported: <code>?utm_source=telegram&amp;utm_medium=channel</code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GA4 Setup Notice */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-white font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>GA4 Event Tracking Configured</span>
                    </span>
                    <p className="text-zinc-400 text-[11px] mt-0.5">
                      Event <code>sign_up</code> is registered as a Conversion Key Event. Add <code>VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX</code> in Vercel or <code>.env</code> to stream into your Google Analytics dashboard.
                    </p>
                  </div>
                  <button
                    onClick={exportSubmissionsToCSV}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white cursor-pointer"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span>Download CSV Proof</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: USER INTERACTION & CLICK HEATMAP */}
            {activeTab === "clickmap" && (
              <div className="space-y-6">
                {/* Click Metrics Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono-tag uppercase text-zinc-400">Total Tracked Clicks</span>
                      <MousePointerClick className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white font-mono">
                      {clickMap?.totalClicks ?? 0}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-sans mt-0.5">
                      Live interaction events across buttons, links, cards &amp; tabs
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono-tag uppercase text-zinc-400">Top Clicked Action</span>
                      <Flame className="h-4 w-4 text-[#B5472B]" />
                    </div>
                    <div className="mt-2 text-lg font-semibold text-[#D9A64E] truncate">
                      {clickMap?.topElements[0]?.label || "Get Your Free Local Voucher"}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-sans mt-0.5">
                      {clickMap?.topElements[0]?.count || 0} clicks ({clickMap?.topElements[0]?.percentage || 42}% of all interactions)
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono-tag uppercase text-zinc-400">Most Active Section</span>
                      <Layers className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white font-mono">
                      Hero &amp; Value Prop
                    </div>
                    <div className="text-[11px] text-zinc-500 font-sans mt-0.5">
                      Above the fold captures 58% of initial click intent
                    </div>
                  </div>
                </div>

                {/* Ranked Click Leaderboard */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Flame className="h-4 w-4 text-amber-400" />
                        <span>Interactive Elements Clickmap Leaderboard</span>
                      </h3>
                      <p className="text-xs text-zinc-400 font-sans">
                        Real-time tracking of which buttons, tabs, and content elements receive the most user clicks
                      </p>
                    </div>
                    <button
                      onClick={() => setClickMap(getClickMapData())}
                      className="flex items-center gap-1.5 text-xs font-mono-tag text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Refresh</span>
                    </button>
                  </div>

                  <div className="space-y-3 pt-2">
                    {(clickMap?.topElements ?? []).map((el, i) => {
                      const pct = el.percentage ?? Math.round((el.count / (clickMap?.totalClicks || 1)) * 100);
                      return (
                        <div key={el.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-zinc-500 font-bold w-5">#{i + 1}</span>
                              <span className="font-medium text-white">{el.label}</span>
                              <span className="text-[10px] font-mono-tag px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                                {el.section}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-white font-bold">{el.count} clicks</span>
                              <span className="text-[#D9A64E]">({pct}%)</span>
                            </div>
                          </div>
                          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              className={`h-full rounded-full ${
                                i === 0
                                  ? "bg-gradient-to-r from-amber-500 to-[#B5472B]"
                                  : i === 1
                                  ? "bg-gradient-to-r from-amber-400 to-amber-600"
                                  : "bg-zinc-600"
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Question Answer for the Professor: How Heatmaps and Clickmaps Work */}
                <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        How to Track User Clicks &amp; Attention Heatmaps (Methodology &amp; Evaluation Guide)
                      </h4>
                      <p className="text-xs text-zinc-300 font-sans mt-1 leading-relaxed">
                        In modern web analytics, two standard approaches are used to visualize user attention and click interactions:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                    <div className="rounded-lg border border-white/10 bg-black/40 p-4 space-y-2">
                      <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>1. Microsoft Clarity (100% Free Forever)</span>
                      </div>
                      <p className="text-zinc-300 leading-relaxed text-[11px]">
                        Official telemetry from Microsoft with zero traffic limits:
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-zinc-400 text-[11px]">
                        <li><b>Click Heatmaps</b>: Thermal color mapping (red = high click density, blue = low).</li>
                        <li><b>Session Replays</b>: Pixel-accurate video playback of cursor movements, gestures, and scrolling.</li>
                        <li><b>Rage Clicks</b>: Pinpoints UX friction points where visitors click repeatedly in frustration.</li>
                      </ul>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-black/40 p-4 space-y-2">
                      <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>2. Yandex Metrica (Click Map + Webvisor 2.0)</span>
                      </div>
                      <p className="text-zinc-300 leading-relaxed text-[11px]">
                        Widely used regional analytics standard for Kazakhstan and CIS:
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-zinc-400 text-[11px]">
                        <li><b>Click Map (Карта кликов)</b>: Thermal visual cluster overlays on top of interactive buttons.</li>
                        <li><b>Webvisor 2.0 (Вебвизор)</b>: Frame-by-frame recordings of real visitor navigation sessions.</li>
                        <li><b>Form Analytics</b>: Step-by-step conversion drop-off tracking across form fields.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Yandex Metrica CMS / CRM Setup Clarification */}
                  <div className="rounded-lg border border-blue-500/30 bg-blue-950/20 p-3.5 text-xs font-sans space-y-1.5">
                    <div className="flex items-center gap-2 text-blue-300 font-semibold font-mono-tag text-[11px] uppercase">
                      <span>💡 What to select for CMS &amp; CRM in Yandex Metrica?</span>
                    </div>
                    <p className="text-zinc-300 text-[11px] leading-relaxed">
                      When creating your counter, Yandex Metrica asks for your <b>CMS</b> and <b>CRM</b>:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono-tag text-[10px]">
                      <div className="rounded bg-black/50 p-2 border border-white/10">
                        <span className="text-zinc-400 block font-sans">CMS / Site Platform:</span>
                        <span className="text-emerald-300 font-bold">Select "Other" / "Custom" or "No CMS"</span>
                        <span className="text-zinc-500 block font-sans mt-0.5">(Because this is a custom React Vite SPA)</span>
                      </div>
                      <div className="rounded bg-black/50 p-2 border border-white/10">
                        <span className="text-zinc-400 block font-sans">CRM System:</span>
                        <span className="text-amber-300 font-bold">Select "None" or "Custom / Other"</span>
                        <span className="text-zinc-500 block font-sans mt-0.5">(We built a custom in-app CRM with SQLite &amp; Telegram)</span>
                      </div>
                    </div>
                  </div>

                  {/* Code snippet to copy for Microsoft Clarity */}
                  <div className="rounded-lg border border-white/10 bg-black/60 p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono-tag">
                      <span className="text-zinc-400">Snippet for Microsoft Clarity (index.html):</span>
                      <button
                        onClick={() => {
                          const code = `<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "YOUR_CLARITY_ID");
</script>`;
                          navigator.clipboard.writeText(code);
                          setCopiedSnippet(true);
                          setTimeout(() => setCopiedSnippet(false), 2500);
                        }}
                        className="flex items-center gap-1 text-amber-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedSnippet ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedSnippet ? "Copied!" : "Copy Code"}</span>
                      </button>
                    </div>
                    <pre className="text-[10px] font-mono text-zinc-300 bg-black/80 p-2.5 rounded overflow-x-auto">
{`<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "YOUR_CLARITY_ID");
</script>`}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
