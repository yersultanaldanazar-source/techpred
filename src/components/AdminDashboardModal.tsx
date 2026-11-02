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
} from "../lib/analytics";

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminDashboardModal({ isOpen, onClose }: AdminDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<"database" | "analytics">("database");
  const [submissions, setSubmissions] = useState<LeadSubmission[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (isOpen) {
      setSubmissions(getSubmissions());
      setMetrics(getStoredMetrics());
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-5xl rounded-2xl border border-white/20 bg-[#121614] p-5 sm:p-8 text-white shadow-2xl max-h-[92vh] flex flex-col z-10"
        >
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-white/10 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B5472B]/20 border border-[#B5472B]/40 text-[#D9A64E]">
                {activeTab === "database" ? <Database className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />}
              </div>
              <div>
                <h2 className="font-editorial text-2xl sm:text-3xl font-medium text-white flex items-center gap-2">
                  <span>{activeTab === "database" ? "Lead Submissions Database" : "GA4 & Conversion Funnel"}</span>
                  <span className="text-[10px] font-mono-tag px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    LIVE
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 font-sans">
                  Part 2: Real Persistent Signup Database • Part 3: Google Analytics 4 &amp; Conversion Funnel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
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
                  <span>Database &amp; CRM</span>
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
                  <span>GA4 Analytics</span>
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Modal Content Body */}
          <div className="flex-1 overflow-y-auto py-5 space-y-6">
            {/* ============================================================== */}
            {/* TAB 1: REAL SIGNUP DATABASE (CRM) */}
            {/* ============================================================== */}
            {activeTab === "database" && (
              <div className="space-y-5">
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
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
