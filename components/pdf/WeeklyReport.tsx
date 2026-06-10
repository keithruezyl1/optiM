import path from "path";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { ReportData } from "@/lib/reportData";
import { formatShortDate } from "@/lib/status";

// @react-pdf can't use next/font; register the bundled TTFs from /public/fonts.
const FONT_DIR = path.join(process.cwd(), "public", "fonts");

Font.register({
  family: "IBM Plex Sans",
  fonts: [
    { src: path.join(FONT_DIR, "IBMPlexSans-Regular.ttf"), fontWeight: 400 },
    { src: path.join(FONT_DIR, "IBMPlexSans-Medium.ttf"), fontWeight: 500 },
    { src: path.join(FONT_DIR, "IBMPlexSans-SemiBold.ttf"), fontWeight: 600 },
    { src: path.join(FONT_DIR, "IBMPlexSans-Bold.ttf"), fontWeight: 700 },
  ],
});
Font.register({
  family: "IBM Plex Sans Condensed",
  fonts: [
    { src: path.join(FONT_DIR, "IBMPlexSansCond-Medium.ttf"), fontWeight: 500 },
    { src: path.join(FONT_DIR, "IBMPlexSansCond-SemiBold.ttf"), fontWeight: 600 },
    { src: path.join(FONT_DIR, "IBMPlexSansCond-Bold.ttf"), fontWeight: 700 },
  ],
});
Font.register({
  family: "IBM Plex Mono",
  fonts: [
    { src: path.join(FONT_DIR, "IBMPlexMono-Regular.ttf"), fontWeight: 400 },
    { src: path.join(FONT_DIR, "IBMPlexMono-Medium.ttf"), fontWeight: 500 },
  ],
});
// Avoid awkward mid-word breaks in the justified body.
Font.registerHyphenationCallback((word) => [word]);

const C = {
  navy: "#0B1F3A",
  steel: "#5B6B82",
  ink: "#1A2433",
  gold: "#B9962E",
  red: "#C0392B",
  amber: "#C77D1F",
  green: "#1F7A4D",
  border: "#E3E8EF",
  white: "#FFFFFF",
};

const s = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 56,
    paddingHorizontal: 0,
    fontFamily: "IBM Plex Sans",
    fontSize: 9,
    color: C.ink,
  },
  // Header band
  header: { backgroundColor: C.navy, paddingHorizontal: 48, paddingVertical: 24 },
  wordmark: { fontFamily: "IBM Plex Sans Condensed", fontWeight: 700, fontSize: 22, color: C.white },
  wordmarkM: { color: C.gold },
  reportTitle: {
    fontFamily: "IBM Plex Sans Condensed",
    fontWeight: 600,
    fontSize: 13,
    letterSpacing: 1.5,
    color: C.white,
    marginTop: 10,
  },
  headerMeta: { fontSize: 9, color: "#AEBACC", marginTop: 4 },

  body: { paddingHorizontal: 48, paddingTop: 22 },

  // Executive summary
  execWrap: {
    borderLeftWidth: 3,
    borderLeftColor: C.gold,
    paddingLeft: 12,
    marginBottom: 22,
  },
  execLabel: { fontSize: 8, letterSpacing: 1, color: C.steel, marginBottom: 5, textTransform: "uppercase" },
  execText: { fontSize: 11, lineHeight: 1.5, color: C.ink },

  // Section
  section: { marginBottom: 20 },
  sectionHead: {
    fontFamily: "IBM Plex Sans Condensed",
    fontWeight: 600,
    fontSize: 13,
    color: C.navy,
    borderBottomWidth: 1,
    borderBottomColor: C.gold,
    paddingBottom: 4,
    marginBottom: 10,
  },

  // Stat row
  statRow: { flexDirection: "row", marginBottom: 12, gap: 28 },
  stat: { flexDirection: "column" },
  statNum: { fontFamily: "IBM Plex Sans Condensed", fontWeight: 700, fontSize: 18 },
  statLabel: { fontSize: 7.5, letterSpacing: 0.6, color: C.steel, marginTop: 2, textTransform: "uppercase" },

  // Tables
  subHead: { fontSize: 8.5, fontWeight: 600, color: C.steel, marginTop: 6, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 },
  tHead: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.border, paddingBottom: 4, marginBottom: 2 },
  tHeadCell: { fontSize: 7.5, color: C.steel, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 },
  tRow: { flexDirection: "row", paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: C.border },
  cell: { fontSize: 9, color: C.ink, paddingRight: 6 },
  cellMono: { fontFamily: "IBM Plex Mono", fontSize: 8.5, color: C.ink },
  statusText: { fontSize: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 },
  empty: { fontSize: 9, color: C.steel, fontStyle: "normal", paddingVertical: 4 },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
    fontSize: 8,
    color: C.steel,
  },
});

function Stat({ num, label, color }: { num: number; label: string; color?: string }) {
  return (
    <View style={s.stat}>
      <Text style={[s.statNum, { color: color ?? C.ink }]}>{num}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function fullDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function WeeklyReport({
  data,
  execSummary,
}: {
  data: ReportData;
  execSummary: string;
}) {
  const { staffing, contracts, period } = data;
  return (
    <Document title="OptiM Weekly Operations Report" author="OptiM">
      <Page size="LETTER" style={s.page}>
        {/* Header band */}
        <View style={s.header} fixed>
          <Text style={s.wordmark}>
            Opti<Text style={s.wordmarkM}>M</Text>
          </Text>
          <Text style={s.reportTitle}>WEEKLY OPERATIONS REPORT</Text>
          <Text style={s.headerMeta}>Prepared for JVM Solutions</Text>
          <Text style={s.headerMeta}>Reporting period: {period}</Text>
        </View>

        <View style={s.body}>
          {/* Executive summary */}
          <View style={s.execWrap}>
            <Text style={s.execLabel}>Executive Summary</Text>
            <Text style={s.execText}>{execSummary}</Text>
          </View>

          {/* Staffing compliance */}
          <View style={s.section}>
            <Text style={s.sectionHead}>Staffing Compliance</Text>
            <View style={s.statRow}>
              <Stat num={staffing.stats.total} label="Total Staff" />
              <Stat num={staffing.stats.compliant} label="Compliant" color={C.green} />
              <Stat num={staffing.stats.expiring} label="Expiring ≤60d" color={C.amber} />
              <Stat num={staffing.stats.expired} label="Expired" color={C.red} />
              <Stat num={staffing.stats.onboarding} label="Onboarding" color={C.steel} />
            </View>

            <Text style={s.subHead}>Expired credentials</Text>
            <CredentialTable rows={staffing.expired} emptyText="No expired credentials." />

            <Text style={s.subHead}>Expiring within 60 days</Text>
            <CredentialTable rows={staffing.expiring} emptyText="No credentials expiring in this window." />
          </View>

          {/* Contract status */}
          <View style={s.section}>
            <Text style={s.sectionHead}>Contract Status</Text>
            <View style={s.statRow}>
              <Stat num={contracts.stats.activeContracts} label="Active Contracts" />
              <Stat num={contracts.stats.totalDeliverables} label="Deliverables" />
              <Stat num={contracts.stats.overdue} label="Overdue" color={C.red} />
              <Stat num={contracts.stats.dueThisMonth} label="Due This Month" color={C.amber} />
            </View>

            <Text style={s.subHead}>Overdue deliverables</Text>
            <DeliverableTable rows={contracts.overdue} tone={C.red} emptyText="No overdue deliverables." />

            <Text style={s.subHead}>Due within 14 days</Text>
            <DeliverableTable rows={contracts.dueSoon} tone={C.amber} emptyText="No deliverables due in this window." />
          </View>
        </View>

        <Text
          style={s.footer}
          fixed
          render={() => `Generated automatically by OptiM · ${fullDate(data.generatedAt)}`}
        />
      </Page>
    </Document>
  );
}

function CredentialTable({
  rows,
  emptyText,
}: {
  rows: ReportData["staffing"]["expired"];
  emptyText: string;
}) {
  if (rows.length === 0) return <Text style={s.empty}>{emptyText}</Text>;
  return (
    <View>
      <View style={s.tHead}>
        <Text style={[s.tHeadCell, { width: "24%" }]}>Name</Text>
        <Text style={[s.tHeadCell, { width: "22%" }]}>Role</Text>
        <Text style={[s.tHeadCell, { width: "18%" }]}>Credential</Text>
        <Text style={[s.tHeadCell, { width: "22%" }]}>Facility</Text>
        <Text style={[s.tHeadCell, { width: "14%", textAlign: "right" }]}>Expires</Text>
      </View>
      {rows.map((r, i) => {
        const expired = r.days_remaining < 0;
        const label = expired
          ? `EXPIRED ${Math.abs(r.days_remaining)}D AGO`
          : `IN ${r.days_remaining}D`;
        return (
          <View style={s.tRow} key={i} wrap={false}>
            <Text style={[s.cell, { width: "24%" }]}>{r.full_name}</Text>
            <Text style={[s.cell, { width: "22%" }]}>{r.role}</Text>
            <Text style={[s.cell, { width: "18%" }]}>{r.credential_name}</Text>
            <Text style={[s.cell, { width: "22%" }]}>{r.facility}</Text>
            <View style={{ width: "14%", alignItems: "flex-end" }}>
              <Text style={s.cellMono}>{formatShortDate(r.expires_on)}</Text>
              <Text style={[s.statusText, { color: expired ? C.red : C.amber }]}>{label}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function DeliverableTable({
  rows,
  tone,
  emptyText,
}: {
  rows: ReportData["contracts"]["overdue"];
  tone: string;
  emptyText: string;
}) {
  if (rows.length === 0) return <Text style={s.empty}>{emptyText}</Text>;
  return (
    <View>
      <View style={s.tHead}>
        <Text style={[s.tHeadCell, { width: "20%" }]}>Contract</Text>
        <Text style={[s.tHeadCell, { width: "34%" }]}>Deliverable</Text>
        <Text style={[s.tHeadCell, { width: "20%" }]}>Owner</Text>
        <Text style={[s.tHeadCell, { width: "26%", textAlign: "right" }]}>Due</Text>
      </View>
      {rows.map((r, i) => {
        const overdue = r.days_remaining < 0;
        const label = overdue ? `OVERDUE ${Math.abs(r.days_remaining)}D` : `DUE IN ${r.days_remaining}D`;
        return (
          <View style={s.tRow} key={i} wrap={false}>
            <Text style={[s.cellMono, { width: "20%" }]}>{r.contract_number}</Text>
            <Text style={[s.cell, { width: "34%" }]}>{r.title}</Text>
            <Text style={[s.cell, { width: "20%" }]}>{r.owner}</Text>
            <View style={{ width: "26%", alignItems: "flex-end" }}>
              <Text style={s.cellMono}>{formatShortDate(r.due_on)}</Text>
              <Text style={[s.statusText, { color: tone }]}>{label}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
