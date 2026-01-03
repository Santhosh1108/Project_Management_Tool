let tasks = getTasks();
renderTasks(tasks);

document.getElementById("addTask").addEventListener("click", () => {
  const title = document.getElementById("taskTitle").value;
  const priority = document.getElementById("priority").value;
  const dueDate = document.getElementById("dueDate").value;

  if (!title) {
    alert("Task title is required");
    return;
  }

  tasks.push({
    title,
    priority,
    dueDate,
    status: "Todo"
  });

  saveTasks(tasks);
  renderTasks(tasks);

  document.getElementById("taskTitle").value = "";
});

function canEdit() {
  return document.getElementById("role").value === "Admin";
}

document.addEventListener("dragstart", e => {
  if (!canEdit()) return;
  if (e.target.classList.contains("task")) {
    e.dataTransfer.setData("text/plain", e.target.dataset.index);
  }
});

document.querySelectorAll(".task-list").forEach(column => {
  column.addEventListener("dragover", e => e.preventDefault());

  column.addEventListener("drop", e => {
    if (!canEdit()) return;

    const index = e.dataTransfer.getData("text/plain");
    const newStatus = column.parentElement.dataset.status;

    tasks[index].status = newStatus;
    saveTasks(tasks);
    renderTasks(tasks);
  });
});

document.getElementById("search").addEventListener("input", applyFilters);
document.getElementById("filterPriority").addEventListener("change", applyFilters);

function applyFilters() {
  const text = document.getElementById("search").value.toLowerCase();
  const priority = document.getElementById("filterPriority").value;

  const filtered = tasks.filter(task =>
    task.title.toLowerCase().includes(text) &&
    (priority === "" || task.priority === priority)
  );

  renderTasks(filtered);
}
