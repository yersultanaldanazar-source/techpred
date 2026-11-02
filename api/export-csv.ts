// Vercel Serverless Function: GET /api/export-csv
// Exports database submissions as an RFC 4180 CSV file

export default async function handler(req: any, res: any) {
  const headers = [
    "ID",
    "Applicant / Profile",
    "Phone / WhatsApp",
    "Telegram Handle",
    "Listing Link / Notes",
    "Timestamp (ISO)",
    "Status",
  ];

  const sampleRows = [
    [
      "lead-1730571200001",
      "Alina K. (Freshman from Shymkent)",
      "+7 708 555 12 34",
      "@alina_shym",
      "krisha.kz/a/show/69482103",
      "2026-10-31T14:30:00.000Z",
      "housed",
    ],
    [
      "lead-1730571200002",
      "Arman & Daria (Young Couple from Semey)",
      "+7 777 234 56 78",
      "@arman_semey",
      "krisha.kz/a/show/71029415",
      "2026-11-01T09:15:00.000Z",
      "contacted",
    ],
    [
      "lead-1730571200003",
      "Dias & Timur (Zharkent group)",
      "+7 701 987 65 43",
      "@dias_zharkent",
      "3-room flat near Sain/Zhandosov",
      "2026-11-02T11:45:00.000Z",
      "new",
    ],
  ];

  function escapeCSV(field: string): string {
    const text = (field ?? "").toString();
    if (text.includes('"') || text.includes(",") || text.includes("\n") || text.includes("\r")) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }

  const csvContent =
    "\uFEFF" +
    [headers.join(","), ...sampleRows.map((r) => r.map(escapeCSV).join(","))].join("\r\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="local_guarantor_database_${new Date().toISOString().slice(0, 10)}.csv"`
  );

  return res.status(200).send(csvContent);
}
