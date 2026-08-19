/* ==========================================================================
   data.js — persistence, seed data, shared state & helpers
   ========================================================================== */
const STORE_KEY = "flowboard_v1";
const THEME_KEY = "flowboard_theme";

const STATUSES = ["Backlog", "To Do", "In Progress", "In Review", "Done"];
const STATUS_COLOR = { Backlog: "#64748b", "To Do": "#3b82f6", "In Progress": "#f59e0b", "In Review": "#a78bfa", Done: "#22c55e" };
const PRIORITY_COLOR = { Highest: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" };
const TYPE_COLOR = { Story: "#22c55e", Bug: "#ef4444", Task: "#3b82f6", Epic: "#a78bfa" };
const TYPE_ICON = { Story: "S", Bug: "B", Task: "T", Epic: "E" };

const PEOPLE = [
  { id: "u1", name: "Aditi Rao", color: "#60a5fa" },
  { id: "u2", name: "Marcus Lee", color: "#f59e0b" },
  { id: "u3", name: "Priya Nair", color: "#22c55e" },
  { id: "u4", name: "Diego Cruz", color: "#a78bfa" },
];

function seedData() {
  const projects = [
    { id: "p1", key: "WEB", name: "Web Platform", color: "#3b82f6" },
    { id: "p2", key: "MOB", name: "Mobile App", color: "#a78bfa" },
    { id: "p3", key: "INF", name: "Infrastructure", color: "#22c55e" },
  ];
  const today = new Date();
  const d = (offsetDays) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + offsetDays);
    return dt.toISOString().slice(0, 10);
  };
  const rows = [
    ["Design new onboarding flow", "Story", "Highest", "In Progress", "p1", d(5)],
    ["Fix payment retry race condition", "Bug", "Highest", "To Do", "p1", d(-2)],
    ["Set up CI pipeline for mobile builds", "Task", "Medium", "Backlog", "p2", d(10)],
    ["Migrate DB to managed Postgres", "Epic", "Highest", "In Progress", "p3", d(-1)],
    ["Add dark mode toggle", "Story", "Low", "To Do", "p1", d(14)],
    ["Crash on iOS 18 push notification", "Bug", "Highest", "In Review", "p2", d(-4)],
    ["Write API rate-limit docs", "Task", "Low", "Backlog", "p1", ""],
    ["Auto-scale worker pool", "Task", "Medium", "In Progress", "p3", d(3)],
    ["Search results pagination bug", "Bug", "Medium", "To Do", "p1", d(1)],
    ["Biometric login for mobile", "Story", "Medium", "Backlog", "p2", d(21)],
    ["Set up centralized logging", "Task", "Medium", "Done", "p3", d(-10)],
    ["Redesign settings page", "Story", "Low", "Done", "p1", d(-6)],
    ["Memory leak in image cache", "Bug", "Highest", "In Review", "p2", d(-1)],
    ["Terraform module for VPC", "Epic", "Medium", "Done", "p3", d(-15)],
    ["Add CSV export to reports", "Story", "Medium", "To Do", "p1", d(7)],
  ];
  const issues = rows.map((t, i) => ({
    id: "iss_" + i,
    key: projects.find((p) => p.id === t[4]).key + "-" + (101 + i),
    title: t[0], type: t[1], priority: t[2], status: t[3], project: t[4],
    dueDate: t[5], assignee: PEOPLE[i % PEOPLE.length].id, desc: "",
    createdAt: Date.now() - (rows.length - i) * 3600_000,
  }));
  return { projects, issues };
}

function loadState() {
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) { const seed = seedData(); localStorage.setItem(STORE_KEY, JSON.stringify(seed)); return seed; }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.projects || !parsed.issues) throw new Error("shape mismatch");
    return parsed;
  } catch (e) {
    console.error("Corrupt Flowboard data, reseeding.", e);
    const seed = seedData();
    localStorage.setItem(STORE_KEY, JSON.stringify(seed));
    return seed;
  }
}
function saveState() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }

/* ---- Global mutable state (shared across modules) ---- */
let state = loadState();
let currentView = "dashboard";
let currentProject = "all";
let searchText = "";
let priorityFilter = "";
let editingId = null;

/* ---- Shared helpers ---- */
function personById(id) { return PEOPLE.find((p) => p.id === id) || PEOPLE[0]; }
function projById(id) { return state.projects.find((p) => p.id === id); }
function initials(name) { return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(); }
function escapeHtml(str) { const d = document.createElement("div"); d.textContent = str ?? ""; return d.innerHTML; }

function isOverdue(issue) {
  if (!issue.dueDate || issue.status === "Done") return false;
  return new Date(issue.dueDate) < new Date(new Date().toDateString());
}
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function visibleIssues() {
  return state.issues.filter((i) => {
    if (currentProject !== "all" && i.project !== currentProject) return false;
    if (priorityFilter && i.priority !== priorityFilter) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      if (!i.title.toLowerCase().includes(q) && !i.key.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

/* ---- CSV export ---- */
function exportCSV() {
  const rows = visibleIssues();
  const header = ["Key", "Title", "Type", "Priority", "Status", "Project", "Assignee", "Due Date"];
  const lines = [header.join(",")];
  rows.forEach((i) => {
    const proj = projById(i.project);
    const person = personById(i.assignee);
    const vals = [i.key, i.title, i.type, i.priority, i.status, proj ? proj.name : "", person.name, i.dueDate || ""];
    lines.push(vals.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "flowboard-issues.csv";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Exported ${rows.length} issue${rows.length === 1 ? "" : "s"} to CSV`, "green");
}

/* ---- Theme ---- */
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "dark";
  document.documentElement.setAttribute("data-theme", saved);
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", cur);
  localStorage.setItem(THEME_KEY, cur);
  const btn = document.getElementById("themeToggle");
  if (btn) btn.textContent = cur === "light" ? "🌙 Dark" : "☀️ Light";
}

/* ---- Toasts (replaces alert/confirm for non-blocking flows) ---- */
function showToast(message, color = "blue", actionLabel, actionFn) {
  const stack = document.getElementById("toastStack");
  if (!stack) return;
  const colors = { blue: "var(--accent2)", green: "var(--green)", red: "var(--red)", amber: "var(--amber)" };
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<span class="dot" style="background:${colors[color] || colors.blue}"></span><span>${escapeHtml(message)}</span>`;
  if (actionLabel && actionFn) {
    const btn = document.createElement("button");
    btn.textContent = actionLabel;
    btn.onclick = () => { actionFn(); el.remove(); };
    el.appendChild(btn);
  }
  stack.appendChild(el);
  setTimeout(() => { el.style.transition = "opacity .25s"; el.style.opacity = "0"; setTimeout(() => el.remove(), 250); }, 4000);
}
