# OptiM Design System

A component library of self-contained preview cards for OptiM's UI, built to be
pushed into a Claude Design project via `/design-sync`. Each `.html` file is a
standalone preview (inlined CSS, fonts via Google Fonts) and carries a first-line
`<!-- @dsCard group="…" name="…" subtitle="…" -->` marker, which is how the Design
System pane indexes it into a card.

These previews mirror the tokens and components used in the live app
(`DESIGN_GUIDELINES.md` + `tailwind.config.ts`); they are the design-facing
counterpart to the React/TSX components under `components/`.

## Contents

| Group | File | Component |
|---|---|---|
| Foundations | `foundations/colors.html` | 10 core color tokens + status usage |
| Foundations | `foundations/typography.html` | Serif display + Plex sans/mono scale (H1/H2/subtitle/body/stat/mono) |
| Components | `components/stat-cards.html` | Glossy gradient stat cards, 5 tones, icon watermark |
| Components | `components/status-pills.html` | Credential / deliverable / onboarding pills |
| Components | `components/avatars.html` | Role-coded initial avatars (9 roles) |
| Components | `components/buttons.html` | Gold primary, navy, outline, text link |
| Components | `components/ai-summary-panel.html` | AI summary: resting / loading / done |
| Components | `components/overdue-banner.html` | Persistent contract overdue alert |
| Navigation | `navigation/sidebar.html` | Icon rail + nested status views |
| Tables | `tables/staff-table.html` | Avatars, dedicated Status column, status-colored dates |
| Tables | `tables/contract-card.html` | Active chip, deliverables table, status-colored dates |

## Previewing locally

Open any `.html` file directly in a browser — each is fully self-contained.

## Syncing to Claude Design

`/design-sync` requires design-system authorization, which is granted through the
interactive `/design-login` flow — it cannot run in a non-interactive session.

From an interactive Claude Code terminal (logged in to claude.ai):

1. Run `/design-sync` (or `/design-login` first if prompted).
2. Point it at this directory (`design-system/`) as the local bundle.
3. Pick or create the target design-system project.
4. Review the plan (paths to write) and approve — it pushes **one component at a
   time**, never a wholesale replace.

Adding a component later: create a new `*.html` with an `@dsCard` marker in the
appropriate group folder, then re-run `/design-sync` — only the new/changed files
are pushed.
