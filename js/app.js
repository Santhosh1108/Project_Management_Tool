/* ==========================================================================
   app.js — navigation, filters, sidebar, keyboard shortcuts, bootstrapping
   ========================================================================== */

/* ---- Sidebar / project list ---- */
function renderSidebar() {
  const list = document.getElementById("projectList");
  list.innerHTML = "";

  const allRow = document.createElement("div");
  allRow.className = "project-item" + (currentProject === "all" ? " active" : "");
  allRow.innerHTML = `<div class="project-swatch" style="background:#475569">∗</div> All Projects`;
  allRow.onclick = () => { currentProject = "all"; renderSidebar(); render(); closeMobileSidebar(); };
  list.appendChild(allRow);

  state.projects.forEach((p) => {
    const row = document.createElement("div");
    row.className = "project-item" + (currentProject === p.id ? " active" : "");
    row.innerHTML = `<div class="project-swatch" style="background:${p.color}">${p.key.slice(0, 2)}</div> ${p.name}`;
    row.onclick = () => { currentProject = p.id; renderSidebar(); render(); closeMobileSidebar(); };
    list.appendChild(row);
  });
}

/* ---- View / tab navigation ---- */
const VIEW_META = {
  dashboard: ["Dashboard", "Overview across the active project"],
  board: ["Sprint Board", "Drag issues across the pipeline"],
  backlog: ["Backlog", "All issues in one sortable list"],
};

function setView(view) {
  currentView = view;
  document.querySelectorAll(".nav-item[data-view]").forEach((n) => n.classList.toggle("active", n.dataset.view === view));
  document.querySelectorAll(".tab[data-view]").forEach((n) => n.classList.toggle("active", n.dataset.view === view));
  document.getElementById("pageTitle").textContent = VIEW_META[view][0];
  document.getElementById("pageSub").textContent = VIEW_META[view][1];
  render();
}

document.querySelectorAll(".nav-item[data-view], .tab[data-view]").forEach((el) => {
  el.addEventListener("click", () => setView(el.dataset.view));
});

/* ---- Search / filter ---- */
document.getElementById("searchBox").addEventListener("input", (e) => { searchText = e.target.value; render(); });

const PRIOS = ["", "Highest", "Medium", "Low"];
let prioIdx = 0;
document.getElementById("filterBtn").addEventListener("click", () => {
  prioIdx = (prioIdx + 1) % PRIOS.length;
  priorityFilter = PRIOS[prioIdx];
  document.getElementById("filterBtn").textContent = "Priority: " + (priorityFilter || "All");
  render();
});

/* ---- Theme toggle ---- */
document.getElementById("themeToggle").addEventListener("click", toggleTheme);

/* ---- Keyboard shortcuts ---- */
document.addEventListener("keydown", (e) => {
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return;
  if (e.key === "c" || e.key === "C") openModal(null);
  if (e.key === "/") { e.preventDefault(); document.getElementById("searchBox").focus(); }
});

/* ---- Mobile sidebar ---- */
const sidebarEl = document.getElementById("sidebar");
const scrimEl = document.getElementById("sidebarScrim");
document.getElementById("menuToggle").addEventListener("click", () => {
  sidebarEl.classList.add("open");
  scrimEl.classList.add("show");
});
scrimEl.addEventListener("click", closeMobileSidebar);
function closeMobileSidebar() {
  sidebarEl.classList.remove("open");
  scrimEl.classList.remove("show");
}

/* ---- Render dispatch ---- */
function render() {
  const container = document.getElementById("content");
  container.classList.remove("view-fade");
  void container.offsetWidth; // restart animation
  container.classList.add("view-fade");
  if (currentView === "dashboard") renderDashboard(container);
  else if (currentView === "board") renderBoard(container);
  else renderBacklog(container);
}

/* ---- Boot ---- */
initTheme();
document.getElementById("themeToggle").textContent =
  document.documentElement.getAttribute("data-theme") === "light" ? "🌙 Dark" : "☀️ Light";
renderSidebar();
render();
