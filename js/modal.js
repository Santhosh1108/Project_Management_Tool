/* ==========================================================================
   modal.js — create / edit / delete issue modal
   ========================================================================== */
function populateSelects() {
  const asg = document.getElementById("f-assignee");
  asg.innerHTML = PEOPLE.map((p) => `<option value="${p.id}">${p.name}</option>`).join("");
  const proj = document.getElementById("f-project");
  proj.innerHTML = state.projects.map((p) => `<option value="${p.id}">${p.name}</option>`).join("");
}

function openModal(id, presetStatus) {
  editingId = id;
  populateSelects();
  clearValidation();
  const delBtn = document.getElementById("deleteIssueBtn");

  if (id) {
    const issue = state.issues.find((i) => i.id === id);
    document.getElementById("modalTitle").textContent = issue.key + " — Edit Issue";
    document.getElementById("f-title").value = issue.title;
    document.getElementById("f-desc").value = issue.desc || "";
    document.getElementById("f-type").value = issue.type;
    document.getElementById("f-priority").value = issue.priority;
    document.getElementById("f-assignee").value = issue.assignee;
    document.getElementById("f-status").value = issue.status;
    document.getElementById("f-project").value = issue.project;
    document.getElementById("f-dueDate").value = issue.dueDate || "";
    delBtn.style.display = "inline-flex";
  } else {
    document.getElementById("modalTitle").textContent = "New Issue";
    document.getElementById("f-title").value = "";
    document.getElementById("f-desc").value = "";
    document.getElementById("f-type").value = "Story";
    document.getElementById("f-priority").value = "Medium";
    document.getElementById("f-assignee").value = PEOPLE[0].id;
    document.getElementById("f-status").value = presetStatus || "Backlog";
    document.getElementById("f-project").value = currentProject !== "all" ? currentProject : state.projects[0].id;
    document.getElementById("f-dueDate").value = "";
    delBtn.style.display = "none";
  }
  document.getElementById("overlay").classList.add("show");
  document.getElementById("f-title").focus();
}

function closeModal() {
  document.getElementById("overlay").classList.remove("show");
  editingId = null;
}

function clearValidation() {
  const titleField = document.getElementById("f-title").closest(".field");
  titleField.classList.remove("invalid");
}

document.getElementById("newIssueBtn").addEventListener("click", () => openModal(null));
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("cancelModal").addEventListener("click", closeModal);
document.getElementById("overlay").addEventListener("click", (e) => { if (e.target.id === "overlay") closeModal(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.getElementById("overlay").classList.contains("show")) closeModal();
});

document.getElementById("saveIssue").addEventListener("click", () => {
  const titleInput = document.getElementById("f-title");
  const title = titleInput.value.trim();
  if (!title) {
    titleInput.closest(".field").classList.add("invalid");
    titleInput.focus();
    return;
  }

  const data = {
    title,
    desc: document.getElementById("f-desc").value.trim(),
    type: document.getElementById("f-type").value,
    priority: document.getElementById("f-priority").value,
    assignee: document.getElementById("f-assignee").value,
    status: document.getElementById("f-status").value,
    project: document.getElementById("f-project").value,
    dueDate: document.getElementById("f-dueDate").value,
  };

  if (editingId) {
    Object.assign(state.issues.find((i) => i.id === editingId), data);
    showToast(`Saved "${title}"`, "green");
  } else {
    const proj = projById(data.project);
    const count = state.issues.filter((i) => i.project === data.project).length;
    data.createdAt = Date.now();
    state.issues.push({ id: "iss_" + Date.now(), key: proj.key + "-" + (101 + count), ...data });
    showToast(`Created "${title}"`, "green");
  }
  saveState();
  closeModal();
  render();
});

document.getElementById("deleteIssueBtn").addEventListener("click", () => {
  if (!editingId) return;
  const issue = state.issues.find((i) => i.id === editingId);
  if (!issue) return;
  state.issues = state.issues.filter((i) => i.id !== editingId);
  saveState();
  closeModal();
  render();
  showToast(`Deleted "${issue.title}"`, "red", "Undo", () => {
    state.issues.push(issue);
    saveState();
    render();
  });
});
