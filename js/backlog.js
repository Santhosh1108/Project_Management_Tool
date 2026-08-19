/* ==========================================================================
   backlog.js — sortable backlog table view
   ========================================================================== */
function renderBacklog(container) {
  const issues = visibleIssues();
  let rows = `
    <div class="backlog-row backlog-head">
      <div>Key</div><div></div><div>Title</div><div>Type</div><div>Priority</div><div>Status</div><div>Due</div><div>Assignee</div>
    </div>`;
  if (issues.length === 0) {
    rows += `<div class="empty"><span class="empty-icon">🔍</span>No issues match your filters</div>`;
  }
  issues.forEach((issue) => {
    const p = personById(issue.assignee);
    const overdue = isOverdue(issue);
    rows += `
      <div class="backlog-row" data-id="${issue.id}">
        <div style="color:var(--muted); font-weight:600;">${issue.key}</div>
        <div class="issue-type" style="background:${TYPE_COLOR[issue.type]}">${TYPE_ICON[issue.type]}</div>
        <div>${escapeHtml(issue.title)}</div>
        <div>${issue.type}</div>
        <div class="pill" style="background:${PRIORITY_COLOR[issue.priority]}22; color:${PRIORITY_COLOR[issue.priority]}">${issue.priority}</div>
        <div class="pill" style="background:${STATUS_COLOR[issue.status]}22; color:${STATUS_COLOR[issue.status]}">${issue.status}</div>
        <div class="due-cell ${overdue ? "overdue" : ""}">${issue.dueDate ? formatDate(issue.dueDate) : "—"}</div>
        <div class="avatar" style="background:${p.color}" title="${p.name}">${initials(p.name)}</div>
      </div>`;
  });

  container.innerHTML = `
    <div class="backlog-toolbar">
      <span class="count-chip">${issues.length} issue${issues.length === 1 ? "" : "s"}</span>
      <button class="btn ghost" id="exportCsvBtn">⬇ Export CSV</button>
    </div>
    <div class="card">${rows}</div>
  `;
  container.querySelectorAll(".backlog-row[data-id]").forEach((row) => {
    row.onclick = () => openModal(row.dataset.id);
  });
  const exportBtn = document.getElementById("exportCsvBtn");
  if (exportBtn) exportBtn.onclick = exportCSV;
}
