# Flowboard — Project Management Tool

A Jira-style project tracker: multi-project sprint board, backlog, delivery-funnel dashboard, and CSV export. Built with vanilla JavaScript in a modular architecture — no framework, no build step, no dependencies.

**[Live Demo →](#)** *((https://project-management-tool-kappa-fawn.vercel.app/))*

<img width="1891" height="916" alt="image" src="https://github.com/user-attachments/assets/57779e9e-2752-498c-9973-8a00eb0478dd" />


## Features

- **Dashboard** — total/in-progress/completed/overdue stats, a delivery funnel across Backlog → To Do → In Progress → In Review → Done, priority breakdown, per-project completion, and a recent-activity feed
- **Sprint Board** — drag-and-drop Kanban across 5 statuses, with move-undo via toast
- **Backlog** — full sortable table view with CSV export
- **Issue detail modal** — title, description, type (Story/Bug/Task/Epic), priority, assignee, status, project, due date; inline validation instead of browser alerts
- **Overdue tracking** — automatic overdue badges on cards and in the backlog table
- **Multi-project workspace** — filter every view by project from the sidebar
- **Search & filter** — live text search plus a priority filter
- **Light/dark theme**, keyboard shortcuts (`C` to create an issue, `/` to focus search), and undo on delete/move
- **Fully responsive** — collapsible sidebar drawer on mobile, adaptive grids down to 360px
- Zero dependencies, persisted via `localStorage`

## Architecture

```
index.html          → markup shell, loads modules in dependency order
style.css            → design tokens + all component styles
js/data.js           → state, persistence, seed data, shared helpers, CSV export, toasts, theme
js/dashboard.js      → dashboard view (stats, funnel, breakdowns, activity)
js/board.js          → sprint board view (drag-and-drop kanban)
js/backlog.js        → backlog table view
js/modal.js          → create/edit/delete issue modal
js/app.js            → navigation, filters, keyboard shortcuts, sidebar, render dispatch
```

Each file owns one concern, loaded as classic scripts sharing a single top-level scope (`data.js` first, `app.js` last) — no bundler required, but the boundaries are the same ones a webpack/Vite migration would draw.

## Design decisions worth mentioning in an interview

- **Stable IDs over array index**: every issue is keyed by a generated ID, not its position in an array, so search/filter never desyncs from drag-and-drop, edit, or delete.
- **Non-blocking UX over `alert()`/`confirm()`**: destructive and state-changing actions (delete, move) surface as dismissible toasts with an **Undo** action, instead of native browser dialogs that block the thread and can't be styled.
- **Inline validation over blocking alerts**: the issue form flags an empty title in place, focuses the field, and never interrupts with a modal-on-modal.
- **XSS-safe rendering**: all user-entered text is escaped before being injected into the DOM.
- **Single shared script scope, module boundaries by file**: keeps the mental model of "one file, one job" without needing a build step — the same decomposition a real bundler-based app would use.

## Run locally

No build step required:

```bash
git clone https://github.com/Santhosh1108/Project_Management_Tool.git
cd Project_Management_Tool
python3 -m http.server 5500
# open http://localhost:5500
```

## Roadmap (what this would need to be production-grade)

This is intentionally a client-only project. If extended toward a real multi-user product, in priority order:

1. **Backend API** (Node/Express or Java/Spring) replacing localStorage with a REST/GraphQL interface
2. **Database** (PostgreSQL) — `users`, `projects`, `issues`, `issue_history` tables
3. **Real auth** — JWT sessions with server-enforced roles, not a client-side dropdown
4. **Real-time sync** — WebSockets so concurrent users see board updates live
5. **Automated tests** — Jest for logic, Playwright for drag-and-drop flows
6. **CI/CD** — GitHub Actions running lint/test on PR, auto-deploy on merge
7. **Containerization** — Dockerfile + docker-compose for local/prod parity
8. **Observability** — structured logging and error tracking once there's a backend to monitor

## Tech Stack

`HTML5` `CSS3` `JavaScript (ES6+)` `Web Storage API` `Drag and Drop API`
