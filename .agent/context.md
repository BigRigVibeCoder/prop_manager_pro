# Agent Context — PropManage Pro

> Any AI agent entering this project should read this file first.

## What Is This Project?

**PropManage Pro** is an enterprise-grade property management platform for small-to-midsize property owners and management firms in Winston-Salem, NC. It replaces fragmented spreadsheets and legacy software with a unified, real-time, agentic-driven platform.

**Stack**: React 18 + Tailwind CSS · Firebase Firestore (NoSQL) · Firebase Auth · Serverless Edge Hosting

### Core Modules

| Module | Description |
|:-------|:------------|
| Dashboard & Intelligence Center | Real-time KPIs, smart overdue alerts, quick action matrix |
| Portfolio & Asset Management | Full CRUD for property assets with status tracking |
| Financial & Rent Tracking | Rent lifecycle ledger with automated late fee engine |
| Document Management System | Legal document generation (leases, notices, PAY OR QUIT) |
| Public Marketing Portal | Auto-published vacancy listings with lead capture |

## Where Is The Knowledge?

All project documentation lives in `CODEX/`. Do NOT create docs outside this structure.

```
CODEX/
├── 00_INDEX/          ← Start here. MANIFEST.yaml is your map.
├── 10_GOVERNANCE/     ← Standards and rules you MUST follow
├── 20_BLUEPRINTS/     ← Specs and designs you build FROM
├── 30_RUNBOOKS/       ← Step-by-step procedures
├── 40_VERIFICATION/   ← Test specs and QA standards
├── 50_DEFECTS/        ← Bug reports and root cause analysis
├── 60_EVOLUTION/      ← Feature specs and roadmaps
├── 70_RESEARCH/       ← Whitepapers and investigations
└── 90_ARCHIVE/        ← Deprecated docs (do not use)
```

## How To Find Docs

1. **Parse** `CODEX/00_INDEX/MANIFEST.yaml`
2. **Filter** by `tags`, `type`, `status`, or `agents` field
3. **Read** only the docs that match your current task

## Rules

1. **Read `10_GOVERNANCE/` first** — these are the laws. Follow them.
2. **Always update MANIFEST.yaml** when creating or modifying docs.
3. **Use frontmatter** on every `.md` file (see `GOV-001` for the schema).
4. **Stay under 10KB per doc** — split large docs into focused pieces.
5. **Use templates** from `CODEX/_templates/` when creating new docs.
6. **Use controlled tags** from `CODEX/00_INDEX/TAG_TAXONOMY.yaml` — do not invent new tags without adding them to the taxonomy first.

## Key Context

- **Target Market**: Small-to-midsize property owners & management firms
- **Primary Locale**: Winston-Salem, NC (North Carolina legal workflows)
- **Primary Differentiator**: Agentic development speed — single-developer equivalent of a 3-person team
- **Future Roadmap**: Stripe ACH/CC payments, maintenance work orders w/ photo uploads, AI chatbot for tenant FAQs
