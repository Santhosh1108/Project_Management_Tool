/* ==========================================================================
   board.js — kanban sprint board, drag & drop
   ========================================================================== */
function renderBoard(container) {
  const issues = visibleIssues();
  container.innerHTML = `<div class="board" id="boardEl"></div>`;
  const board = document.getElementById("boardEl");

  STATUSES.forEach((status) => {
    const colIssues = issues.filter((i) => i.status === status);
    const col = document.createElement("div");
    col.className = "col";
    col.innerHTML = `
      <div class="col-head">
        <div class="col-title"><span style="width:8px;height:8px;border-radius:50%;background:${STATUS_COLOR[status]};display:inline-block;"></span>${status}</div>
        <div class="col-count">${colIssues.length}</div>
      </div>
      <div class="col-body" data-status="${status}"></div>
      <button class="add-issue" data-status="${status}">+ Add issue</button>
    `;
    const body = col.querySelector(".col-body");
    if (colIssues.length === 0) {
      body.innerHTML = `<div class="empty"><span class="empty-icon">📭</span>Nothing here yet</div>`;
    }
    colIssues.forEach((issue) => body.appendChild(issueCard(issue)));

    body.addEventListener("dragover", (e) => { e.preventDefault(); body.classList.add("dragover"); });
    body.addEventListener("dragleave", () => body.classList.remove("dragover"));
    body.addEventListener("drop", (e) => {
      e.preventDefault();
      body.classList.remove("dragover");
      const id = e.dataTransfer.getData("text/plain");
      const issue = state.issues.find((i) => i.id === id);
      if (issue && issue.status !== status) {
        const from = issue.status;
        issue.status = status;
        saveState();
        render();
        showToast(`Moved "${issue.title}" to ${status}`, "blue", "Undo", () => {
          issue.status = from; saveState(); render();
        });
      }
    });

    col.querySelector(".add-issue").onclick = () => openModal(null, status);
    board.appendChild(col);
  });
}

function issueCard(issue) {
  const p = personById(issue.assignee);
  const overdue = isOverdue(issue);
  const div = document.createElement("div");
  div.className = "issue";
  div.draggable = true;
  div.ondragstart = (e) => { e.dataTransfer.setData("text/plain", issue.id); div.classList.add("dragging"); };
  div.ondragend = () => div.classList.remove("dragging");
  div.onclick = () => openModal(issue.id);
  div.innerHTML = `
    <div class="issue-top">
      <div style="display:flex;gap:7px;align-items:flex-start;">
        <div class="issue-type" style="background:${TYPE_COLOR[issue.type]}" title="${issue.type}">${TYPE_ICON[issue.type]}</div>
        <div class="issue-title">${escapeHtml(issue.title)}</div>
      </div>
    </div>
    <div class="issue-meta">
      <div class="issue-key">${issue.key}</div>
      <div class="badges">
        <div class="prio" style="background:${PRIORITY_COLOR[issue.priority]}22; color:${PRIORITY_COLOR[issue.priority]}" title="${issue.priority} priority">${issue.priority[0]}</div>
        <div class="avatar" title="${p.name}" style="background:${p.color}">${initials(p.name)}</div>
      </div>
    </div>
    ${issue.dueDate ? `<div class="issue-due ${overdue ? "overdue" : ""}">${overdue ? "⚠ Overdue —" : "Due"} ${formatDate(issue.dueDate)}</div>` : ""}
  `;
  return div;
}
