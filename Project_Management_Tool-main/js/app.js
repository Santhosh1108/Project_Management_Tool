let tasks = getTasks();
renderTasks(tasks);

document.getElementById("addTask").addEventListener("click", () => {
  const titleInput = document.getElementById("taskTitle");
  const title = titleInput.value.trim();
  const priority = document.getElementById("priority").value;
  const dueDate = document.getElementById("dueDate").value;

  if (!title) {
    alert("Task title is required");
    return;
  }

  tasks.push({
    id: generateId(),
    title,
    priority,
    dueDate,
    status: "Todo"
  });

  saveTasks(tasks);
  renderTasks(tasks);
  titleInput.value = "";
  titleInput.focus();
});

// Allow Enter key to add a task
document.getElementById("taskTitle").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("addTask").click();
});

function canEdit() {
  return document.getElementById("role").value === "Admin";
}

document.addEventListener("dragstart", e => {
  if (!canEdit()) return;
  if (e.target.classList.contains("task")) {
    e.dataTransfer.setData("text/plain", e.target.dataset.id);
  }
});

document.querySelectorAll(".task-list").forEach(column => {
  column.addEventListener("dragover", e => e.preventDefault());

  column.addEventListener("drop", e => {
    if (!canEdit()) {
      alert("Switch role to Admin to move tasks");
      return;
    }
    const id = e.dataTransfer.getData("text/plain");
    const newStatus = column.parentElement.dataset.status;
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.status = newStatus;
      saveTasks(tasks);
      renderTasks(tasks);
    }
  });
});

// Event delegation for edit/delete buttons (works after re-render)
document.querySelector(".kanban").addEventListener("click", (e) => {
  const delBtn = e.target.closest(".del-btn");
  const editBtn = e.target.closest(".edit-btn");

  if (delBtn) {
    if (!canEdit()) return alert("Switch role to Admin to delete tasks");
    const id = delBtn.dataset.id;
    if (confirm("Delete this task?")) {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks(tasks);
      renderTasks(tasks);
    }
  }

  if (editBtn) {
    if (!canEdit()) return alert("Switch role to Admin to edit tasks");
    const id = editBtn.dataset.id;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newTitle = prompt("Edit task title:", task.title);
    if (newTitle && newTitle.trim()) {
      task.title = newTitle.trim();
      saveTasks(tasks);
      renderTasks(tasks);
    }
  }
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
