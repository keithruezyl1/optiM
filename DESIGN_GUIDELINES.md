# OptiM — Design Guidelines

The design problem: make a demo app feel like internal software a federal contractor already trusts, while staying visually sharper than the SharePoint-gray tools they're used to. The register is **"defense-sector operations console"** — disciplined, navy-anchored, data-forward. Not a startup landing page, not a generic admin template.

---

## 1. Brand Direction

JVM Solutions' identity is federal, veteran-owned, healthcare-adjacent: navy blues, white space, institutional credibility. OptiM borrows that gravity but modernizes it. The one aesthetic risk we take: a **status-led interface** where compliance color is the loudest thing on every screen — everything else stays quiet so red and amber mean something.

**Signature element:** the **Readiness Strip** — a full-width horizontal band directly under the header showing the five live counts (Total Staff · Compliant · Expiring ≤60d · Expired · Onboarding) as large numerals with small uppercase labels, each numeral tinted by its status color. It reads like a military readiness board and is the first thing the camera sees. On the Contracts tab the same strip shows contract counts. One component, both tabs, instantly scannable.

## 2. Color Palette

| Token | Hex | Use |
|---|---|---|
| `navy-900` | `#0B1F3A` | Header bar, sidebar/tab rail, PDF header |
| `navy-700` | `#16365C` | Active tab, primary button hover |
| `slate-100` | `#F3F5F8` | App background |
| `white` | `#FFFFFF` | Cards, table surfaces |
| `ink` | `#1A2433` | Primary text |
| `steel` | `#5B6B82` | Secondary text, labels |
| `signal-red` | `#C0392B` | Expired / Overdue (text + left border accent, never full-row fill) |
| `amber` | `#C77D1F` | Expiring ≤60d / Due ≤14d |
| `ops-green` | `#1F7A4D` | Compliant / On track |
| `gold` | `#B9962E` | Single accent: primary "Generate Weekly Report" button, active filter chips. Echoes federal/military gold braid. Use nowhere else. |

Rules: status colors appear only where status is being communicated. Red/amber rows get a 3px left border + tinted status pill, not a full background fill — keeps the table readable on camera. The gold button must be the only gold object on screen, so the eye lands on it when Keith says "and one click generates the report."

## 3. Typography

- **Display / numerals:** `IBM Plex Sans Condensed`, weights 600–700. Used for the Readiness Strip numerals, page titles, and PDF headings. Its engineering character fits the ops-console register without feeling decorative.
- **Body / UI:** `IBM Plex Sans`, 400/500/600. One family system, institutional but modern, free via Google Fonts/next-font.
- **Data / mono accents:** `IBM Plex Mono` for contract numbers, dates, and credential IDs — small touch that makes data look like data.

Scale: 13px table body, 14px UI default, 16px section heads, 24px page title, 40–48px Readiness Strip numerals. Labels in 11px uppercase tracking-wide `steel`.

## 4. Layout

- Top header bar in `navy-900`: OptiM wordmark left ("Opti" regular, "M" in gold, 600 weight), gold **Generate Weekly Report** button right.
- Below header: horizontal tab rail — **Staffing** | **Contracts**. Active tab underlined in gold.
- Readiness Strip spans full width under the tabs.
- Content area: white cards on `slate-100`, 8px radius, 1px `#E3E8EF` borders, no drop-shadow heavier than `0 1px 2px rgba(11,31,58,.06)`. Density medium-high: this is a tool, not a brochure.
- Overdue banner (Contracts): full-width, `signal-red` left border, pale red `#FBEAE8` fill, bold count, sits above the strip. Must be readable in a 720p Loom.

## 5. Components

- **Status pill:** 11px uppercase, tinted background at ~12% opacity of its status color, solid status-color text. Labels: EXPIRED / EXPIRES IN {n}D / CURRENT / OVERDUE / DUE {date} / ON TRACK / ONBOARDING.
- **AI Summary panel:** card with a thin gold top border and an "AI OPERATIONS SUMMARY" eyebrow label; body text 15px, line-height 1.6. Loading state: subtle pulse + "Analyzing 15 staff records…" — narratable on camera.
- **Add Staff modal:** plain, labeled fields, gold submit ("Add staff member"), success toast "Staff member added."
- **Tables:** sticky header row, zebra-free (status borders carry the rhythm), right-aligned dates in mono.

## 6. Motion

Minimal and purposeful: 150ms ease on hover/tab transitions, the Readiness Strip numerals count up once on first load (600ms, respects `prefers-reduced-motion`), AI panel fades in. Nothing else moves. Restraint reads as enterprise-grade.

## 7. Copy Voice

Plain operational English, sentence case, active verbs. Buttons say what happens: "Generate weekly report," "Add staff member," "Run AI summary." Empty/edge states give direction: "No credentials expiring in this window." Errors are specific: "Report generation failed — OpenAI request timed out. Try again." Never marketing language inside the app; the app's confidence *is* the marketing.

## 8. PDF Design (Weekly Operations Report)

- Header band in `navy-900`: OptiM wordmark, "WEEKLY OPERATIONS REPORT" in Plex Sans Condensed, "Prepared for JVM Solutions" + reporting period in white/`steel`.
- Executive Summary first, set at 11pt with a gold left rule.
- Section heads in navy with thin gold underline; tables mirror the app's pill colors (printed as colored text, not fills, to stay ink-friendly).
- Footer: "Generated automatically by OptiM · {timestamp}" in 8pt `steel`.
- Letter size, generous margins — it should look at home printed in a government office.

## 9. Quality Floor

Responsive down to ~1024px without breakage (Loom is desktop), visible keyboard focus rings (gold, 2px), WCAG AA contrast on all status colors against white, reduced-motion respected, favicon + page title set ("OptiM — Operations Dashboard") so the browser tab looks finished on camera.
