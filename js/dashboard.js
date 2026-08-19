/* ==========================================================================
   dashboard.js — overview stats, delivery funnel, breakdowns
   ========================================================================== */
function renderDashboard(container) {
  const issues = visibleIssues();
  const counts = {}; STATUSES.forEach((s) => (counts[s] = 0));
  issues.forEach((i) => counts[i.status]++);
  const max = Math.max(1, ...Object.values(counts));

  const prioCounts = { Highest: 0, Medium: 0, Low: 0 };
  issues.forEach((i) => prioCounts[i.priority]++);

  const byProject = {};
  state.projects.forEach((p) => (byProject[p.id] = { total: 0, done: 0 }));
  issues.forEach((i) => { if (byProject[i.project]) { byProject[i.project].total++; if (i.status === "Done") byProject[i.project].done++; } });

  const done = counts["Done"];
  const total = issues.length || 1;
  const overdueCount = issues.filter(isOverdue).length;

  const recent = [...issues].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 5);

  container.innerHTML = `
    <div class="stat-grid">
      <div class="stat"><div class="num">${issues.length}</div><div class="lbl">Total issues</div></div>
      <div class="stat"><div class="num">${counts["In Progress"]}</div><div class="lbl">In progress</div></div>
      <div class="stat"><div class="num">${counts["Done"]}</div><div class="lbl">Completed</div></div>
      <div class="stat"><div class="num" style="${overdueCount ? "color:var(--red)" : ""}">${overdueCount}</div><div class="lbl">Overdue</div></div>
    </div>
    <div class="dash-grid">
      <div class="card">
        <h3><span>Delivery Funnel</span><span style="font-weight:600; color:var(--text);">${Math.round((done / total) * 100)}% complete</span></h3>
        <div class="funnel">
          ${STATUSES.map((s) => `
            <div class="funnel-row">
              <div class="funnel-name">${s}</div>
              <div class="funnel-track"><div class="funnel-fill" style="width:${(counts[s] / max) * 100 || 0}%; background:${STATUS_COLOR[s]}"></div></div>
              <div class="funnel-count">${counts[s]}</div>
            </div>`).join("")}
        </div>
      </div>
      <div class="card">
        <h3>Priority Breakdown</h3>
        <div class="mini-list">
          ${Object.entries(prioCounts).map(([k, v]) => `
            <div>
              <div class="mini-item"><span class="k">${k}</span><span>${v}</span></div>
              <div class="barbg"><div class="barfg" style="width:${(v / total) * 100}%; background:${PRIORITY_COLOR[k]}"></div></div>
            </div>`).join("")}
        </div>
        <h3 style="margin-top:20px;">By Project</h3>
        <div class="mini-list">
          ${state.projects.map((p) => {
            const d = byProject[p.id];
            const pct = d.total ? Math.round((d.done / d.total) * 100) : 0;
            return `<div>
              <div class="mini-item"><span class="k">${p.name}</span><span>${d.done}/${d.total}</span></div>
              <div class="barbg"><div class="barfg" style="width:${pct}%; background:${p.color}"></div></div>
            </div>`;
          }).join("")}
        </div>
      </div>
    </div>
    <div class="card">
      <h3>Recently Created</h3>
      ${recent.length === 0 ? `<div class="empty">No issues yet</div>` : `
      <div class="activity-list">
        ${recent.map((i) => {
          const p = personById(i.assignee);
          return `<div class="activity-row">
            <span class="activity-dot" style="background:${TYPE_COLOR[i.type]}"></span>
            <span class="activity-text"><b>${escapeHtml(i.title)}</b> — ${i.type} · ${i.key} · assigned to ${p.name}</span>
          </div>`;
        }).join("")}
      </div>`}
    </div>
  `;
}
