---
id: DEF-001
title: "Governance Compliance Gap Analysis"
type: reference
status: CLOSED
owner: "Architect"
agents: [all]
tags: [governance, compliance, audit, defects]
related: [GOV-001, GOV-002, GOV-003, GOV-004, GOV-005, GOV-006]
created: "2026-03-04"
updated: "2026-03-04"
version: "1.0.0"
---

> **BLUF:** A comprehensive audit of the PropManage Pro codebase against the CODEX governance standards (GOV-001 through GOV-006) reveals multiple compliance drifts primarily concerning static analysis limits, commit message ontology, and test coverage for UI error boundaries. Immediate remediation is required to maintain JPL-grade code safety.

# Governance Compliance Gap Analysis

## 1. Static Analysis Drifts (GOV-003)

**Status:** RED (Non-Compliant)
**Root Cause:** Initial Next.js scaffolding missed the explicit JPL/NASA Power of 10 constraints mandated by GOV-003.

### 1.1 ESLint Profile (GOV-003 §8.4 / §12.3)
**Requirement:** ESLint must enforce maximum lines per function (60), maximum cyclomatic complexity (10), and strict type checking to intercept "Power of 10" violations.
**Current State:** `src/eslint.config.mjs` only enforces `no-console`.
**Gap:** The following rules are missing and must be added:
- `@typescript-eslint/no-explicit-any`: "error"
- `@typescript-eslint/no-unused-vars`: "error"
- `max-lines-per-function`: ["warn", 60]
- `complexity`: ["error", 10]

### 1.2 TypeScript Configuration (GOV-003 §8.1)
**Requirement:** `tsconfig.json` must enforce strict null checks and unused locals.
**Current State:** `"strict": true` is present, but explicit overrides are missing.
**Gap:** Explicitly add the following to `tsconfig.json`:
- `"strictNullChecks": true`
- `"noImplicitAny": true`
- `"noUnusedLocals": true`
- `"noUnusedParameters": true`

---

## 2. Agentic Lifecycle Drifts (GOV-005)

**Status:** YELLOW (Degraded)
**Root Cause:** Rapid prototyping during Sprints 1 and 2 bypassed strict Git workflows.

### 2.1 Branching Strategy (GOV-005 §5.1)
**Requirement:** All work must occur on single-purpose branches prefixed with `feat/`, `fix/`, `research/`, or `test/`.
**Current State:** Work has been committed directly to the `main` branch.
**Gap:** Establish branch protection on `main` and strictly enforce the `feat/SPR-NNN` branching model.

### 2.2 Commit Message Format (GOV-005 §5.2)
**Requirement:** Commit messages must strictly follow the Agentic Development format:
```
type(scope): short description
Why: [reason]
What: [what was changed]
Agent: [agent]
Refs: [CODEX IDs]
```
**Current State:** Recent commits (e.g., `"feat(core): implement Sprint 2 Firebase SDK and Data Models"`) omit the `Why`, `What`, `Agent`, and `Refs` structural blocks.
**Gap:** Enforce the GOV-005 commit ontology for all future commits.

---

## 3. Coverage Drifts (GOV-002)

**Status:** YELLOW (Degraded)
**Root Cause:** GOV-004 boundary files were merged without attached UI testing suites.

### 3.1 React Boundary Testing (GOV-002 §4)
**Requirement:** 100% line coverage for all TypeScript files in `src/`.
**Current State:** `src/lib/` has 100% coverage. However, `src/app/error.tsx` and `src/app/global-error.tsx` (the GOV-004 fallback boundaries) currently lack corresponding unit tests.
**Gap:** We must write `vitest` implementations for the `error.tsx` rendering cycle to verify the Pino logger is invoked mathematically upon UI crash.

---

## 4. Remediation Plan (Bug Fix Sprint)

A dedicated **Bug Fix Sprint** should be immediately scheduled (on a `fix/DEF-001-compliance-audit` branch) to execute the following:
1. Revise `eslint.config.mjs` and `tsconfig.json` to hardcode GOV-003 thresholds.
2. Implement unit tests for `<ErrorBoundary />` and `<GlobalError />` components.
3. Validate the Vitest coverage report hits 100% globally across all `/src` modules.
4. Execute the commit using the strict GOV-005 multi-line ontology.
