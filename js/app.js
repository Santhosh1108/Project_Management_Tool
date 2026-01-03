let tasks = getTasks();
renderTasks(tasks);

document.getElementById("addTask").addEventListener("click", () => {
  const title = document.getElementById("taskTitle").value;
  const priority = document.getElementById("priority").value;
  const dueDate = document.getElementById("dueDate").value;

  if (!title) return alert("Task title required");

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

function completeTask(index) {
  tasks[index].status = "Completed";
  saveTasks(tasks);
  renderTasks(tasks);
}
