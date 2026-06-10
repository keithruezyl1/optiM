# OptiM — Product Brief Document (PBD)

**One line:** A lightweight operations dashboard, built custom for the JVM Solutions pitch, that turns staffing compliance, contract deadlines, and weekly reporting into one screen and one click.

---

## The Problem

Government contracting firms like JVM Solutions run on three things that punish manual process: credentialed people, hard deadlines, and documentation. A nurse's lapsed BLS certification at a military treatment facility is a Joint Commission compliance issue. A missed contract deliverable is delayed payment or a finding in an audit. A late weekly report is leadership flying blind. Today this is managed across spreadsheets, inboxes, and memory — which works until the company scales, and JVM is scaling.

## The Audience

Primary: JVM Solutions decision makers evaluating whether to invest in monday.com and automation. Secondary: any staffing-heavy federal contractor with the same shape of problem.

## The Insight

JVM is currently thinking in terms of *buying a tool* (monday.com). The brief's job is to reframe the decision as *hiring a builder*. A tool still needs someone to design the workflows, wire the automations, and extend it where it falls short. A builder can configure monday.com when it fits — and replace it with something custom when it doesn't. OptiM is the proof: it does the job they're evaluating monday.com for, was built in days, and already automates itself.

## What OptiM Is

A two-tab web app plus an automation layer:

1. **Staffing & Credential Tracker** — every contractor, credential, expiry date, deployment site, and onboarding status in one color-coded view, with an AI-generated compliance summary on demand.
2. **Contracts** — contracts, deliverables, owners, and due dates, with overdue items impossible to miss.
3. **Weekly Operations Report** — one button produces a branded PDF with an AI-written executive summary, ready to email. The same report generates and sends itself every Monday via n8n, and a daily watchdog emails reminders for credentials expiring within 60 days.

## What OptiM Is Not

Not a finished product, not a monday.com replacement pitch, not a system holding real data. It is a working argument: *this is the shape of what I can build for you, scoped to your actual operations, in a weekend.*

## Key Messages for the Loom

1. **"This is your business on screen."** RNs, case managers, MRI techs, DoD facilities, Joint Commission language — recognition in the first ten seconds.
2. **"Red means act."** Expired credentials and overdue deliverables surface themselves; nobody has to go looking.
3. **"AI that does work, not AI that chats."** The summary button and the PDF's executive section show AI producing operational output a manager would actually send.
4. **"It runs without you."** The daily reminder and Monday-morning report happen on a schedule. The demo button and the automation share the same engine.
5. **"Tool-agnostic."** monday.com, n8n, or fully custom — the deliverable is the working workflow, not loyalty to a platform.

## Success Looks Like

JVM replies to the Loom asking either "can you build this for our real data?" or "can you walk us through this live?" — either response converts the video into a paid conversation.

## Constraints

- Build window: one weekend of focused work, demo-ready
- Stack: Next.js + Supabase + OpenAI + n8n (all tools Keith already ships with)
- Zero real PII; all data fictional but domain-accurate
- No auth; the live link is the demo
