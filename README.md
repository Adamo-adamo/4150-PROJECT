# GradMap — 4150 Project

GradMap is a desktop-first career and master's application planning workspace for final-year students. It helps users compare fictional programmes and graduate roles, track deadlines, organise reusable documents, manage tasks, and prepare a shortlist.

This repository contains the working application, the product requirements documentation, and the AI coding execution plan for the 4150 project.

## Run locally

```bash
pnpm install
pnpm dev
```

The development server listens on port 3000 by default. Open the GradMap preview and choose **Open the demo workspace** to explore the fictional planning desk without signing in.

## Main routes

- `/` — marketing landing page
- `/app` — workspace dashboard and fictional demo
- `/app/applications` — application list and detail workspace
- `/app/compare` — side-by-side comparison table
- `/app/tasks` — action list
- `/app/documents` — reusable document library
- `/app/deadlines` — deadline timeline
- `/app/adviser` — read-only fictional adviser review
- `/app/billing` — free, one-season, and adviser/university test plans

## Validation commands

```bash
pnpm check
pnpm test
pnpm build
```

## Repository documents

- `GradMap Product Requirements Document.md` — product requirements document
- `GradMap Product Requirements Document.pdf` — PDF version of the PRD
- `GradMap Tasklist pdf.pdf` — execution task list PDF
- `GradMap AI Coding Agent Execution Plan.md` — coding-agent execution plan
- `TODO.md` — implementation and student testing checklist

All programmes, universities, role names, deadlines, adviser notes, and readiness scores shown in the demo are fictional. GradMap is a planning tool, not an admissions prediction service.

## Technical note

The current implementation uses the initialized React / Express / tRPC / Drizzle WebDev starter with managed authentication and database capabilities. Private keys stay server-side; no secrets are committed to this repository.
