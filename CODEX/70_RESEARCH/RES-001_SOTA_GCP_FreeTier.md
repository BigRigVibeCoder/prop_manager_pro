---
id: RES-001
title: "Architecture Analysis: SOTA, Missing Features, & GCP Free Tier Strategy"
type: research
status: APPROVED
owner: "Architect"
agents: [all]
tags: [architecture, research, performance, deployment, integration]
related: [BLU-001, BLU-002]
created: "2026-03-04"
updated: "2026-03-04"
version: "1.0.0"
---

> **BLUF:** This analysis evaluates the BLU-001 architecture and BLU-002 backlog. It identifies State-of-the-Art (SOTA) stack upgrades, critical missing enterprise features for property management, and outlines a specific engineering strategy to maximize the Google Cloud/Firebase Free Tier for a production deployment.

## 1. SOTA (State-of-the-Art) Architecture Updates

While the stack proposed in BLU-001 (React 18 + Tailwind + Firebase) is solid, upgrading to current SOTA patterns will drastically improve development velocity, SEO, and user experience.

### 1.1 Frontend Framework & UI
- **Move to Next.js 14/15 (App Router)**: Instead of Vite, Next.js provides superior Server-Side Rendering (SSR). This is **mandatory** for the Public Marketing Portal (Module 2.5) to achieve high SEO rankings for property listings. 
- **Component Library**: Instead of writing raw Tailwind from scratch, adopt **shadcn/ui** or **Radix UI Primitives**. It provides enterprise-grade, accessible components (data tables, date pickers for rent, modals) while maintaining full Tailwind customization.

### 1.2 State Management & Networking
- **TanStack Query v5 (React Query)**: For data fetching, TanStack Query is SOTA. It provides advanced caching, deduplication, and optimistic updates. This is structurally critical for surviving on the Firebase Free Tier (see Section 3).

### 1.3 AI Integration (Agentic Assistant)
- **Vercel AI SDK**: For the future AI chatbot, integrating the Vercel AI SDK directly with the `GOOGLE_AI_API_KEY` or `OPENROUTER_API_KEY` is the SOTA pattern for Edge-rendered streaming responses, avoiding heavy server cold starts.

---

## 2. Missing Enterprise Features (Property Management)

Based on industry standards (AppFolio, Buildium, Yardi), the following features are missing from the BLU-001 specification but are vital for "Enterprise" operations:

### 2.1 E-Signatures & Lease Execution
- **Gap**: BLU-001 mentions PDF generation ("Ready-to-print or email"), but enterprise software must close the loop entirely in-app.
- **Requirement**: Integration with a native or 3rd-party E-Signature API (like DocuSign or HelloSign) to turn generated PDFs into legally binding electronic envelopes.

### 2.2 Vendor & Work Order Management
- **Gap**: Module 2.1 mentions "Open Maintenance Requests", but lacks the capability to dispatch work.
- **Requirement**: A sub-module for assigning work orders to external vendors (plumbers, electricians), tracking estimates, and attaching vendor invoices directly to the property ledger.

### 2.3 Double-Entry Accounting Sync
- **Gap**: Relies on a simpler "Ledger" tracking rent state.
- **Requirement**: Enterprise firms require mapping these transactions to a Chart of Accounts, and usually require a QuickBooks Online (QBO) or native bank-feed sync API to reconcile the property bank accounts.

### 2.4 Application Screening Pipeline
- **Gap**: "Apply Now" (Module 2.5) is just a CTA.
- **Requirement**: A secure portal for prospective tenants to pay an application fee and trigger an automated background, eviction, and credit check (e.g., via TransUnion SmartMove API).

---

## 3. Deployment Strategy: Maximizing GCP / Firebase Free Tier

The Firebase "Spark" (Free) Plan is incredibly generous, but poor architecture will exhaust it in days. The strategy centers on **Read Reduction** and **Client-Side Processing**.

### 3.1 Firestore Free Tier Limits (The Bottleneck)
- **Daily Limits**: 50,000 Reads, 20,000 Writes, 20,000 Deletes.
- **The Danger**: If the Dashboard (Module 2.1) calculates "Total Revenue" by reading 500 individual `ledgers` documents every time the user logs in, 100 logins will exhaust the daily quota.

### 3.2 Strategy 1: Data Aggregation & Denormalization
- **Implementation**: Do NOT compute KPIs on the fly. Create a Firestore Cloud Function trigger on `ledgers` writes. 
- **Action**: When a ledger is marked `PAID`, the function increments a single `portfolio_stats` document.
- **Result**: Loading the dashboard costs **1 read** instead of 500 reads.

### 3.3 Strategy 2: Aggressive Client Caching
- **Implementation**: Use TanStack Query with a high `staleTime` (e.g., 5-10 minutes) for property lists.
- **Action**: If a user navigates from Dashboard -> Properties -> Dashboard, the data is pulled from memory, costing 0 additional Firebase reads.

### 3.4 Strategy 3: Client-Side Media Compression
- **Storage Limit**: GCP Free Tier provides 5GB storage.
- **Danger**: Tenants uploading uncompressed 8MB iPhone photos for maintenance requests will burn through 5GB instantly.
- **Implementation**: Use a library like `browser-image-compression` to crunch maintenance photos down to < 500KB *before* hitting Firebase Storage.

### 3.5 Strategy 4: Bring Your Own AI Keys (BYOK)
- By utilizing the environment's `GOOGLE_AI_API_KEY` (Gemini Free Tier) and `OPENROUTER_API_KEY`, the application can completely bypass Google Cloud Vertex AI billing.
- Cloud Functions can make standard HTTP calls out to the Gemini/OpenRouter public APIs, keeping LLM intelligence costs at $0.00 while proving the MVP.
