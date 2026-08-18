function isOverdue(task) {
  if (!task.dueDate || task.status === "Completed") return false;
  return new Date(task.dueDate) < new Date(new Date().toDateString());
}

function renderTasks(tasks) {
  document.getElementById("todo").innerHTML = "";
  document.getElementById("inprogress").innerHTML = "";
  document.getElementById("completed").innerHTML = "";

  tasks.forEach((task) => {
    const div = document.createElement("div");
    div.className = `task ${task.priority.toLowerCase()} ${isOverdue(task) ? "overdue" : ""}`;
    div.draggable = true;
    div.dataset.id = task.id;

    div.innerHTML = `
      <div class="task-row">
        <strong>${escapeHtml(task.title)}</strong>
        <div class="task-actions">
          <button class="icon-btn edit-btn" data-id="${task.id}" title="Edit">✎</button>
          <button class="icon-btn del-btn" data-id="${task.id}" title="Delete">✕</button>
        </div>
      </div>
      <small>${task.priority} • ${task.dueDate ? formatDate(task.dueDate) : "No deadline"}${isOverdue(task) ? " • OVERDUE" : ""}</small>
    `;

    const column =
      task.status === "Todo" ? "todo" :
      task.status === "In Progress" ? "inprogress" : "completed";
    document.getElementById(column).appendChild(div);
  });

  updateStats(tasks);
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function updateStats(tasks) {
  const completed = tasks.filter(t => t.status === "Completed").length;
  document.getElementById("totalTasks").innerText = tasks.length;
  document.getElementById("completedTasks").innerText = completed;
  document.getElementById("progress").innerText =
    tasks.length ? Math.round((completed / tasks.length) * 100) + "%" : "0%";
}
