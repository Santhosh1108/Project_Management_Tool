function renderTasks(tasks) {
  document.getElementById("todo").innerHTML = "";
  document.getElementById("inprogress").innerHTML = "";
  document.getElementById("completed").innerHTML = "";

  tasks.forEach((task, index) => {
    const div = document.createElement("div");
    div.className = `task ${task.priority.toLowerCase()}`;
    div.draggable = true;
    div.dataset.index = index;

    div.innerHTML = `
      <strong>${task.title}</strong><br>
      <small>${task.priority} • ${task.dueDate || "No deadline"}</small>
    `;

    if (task.status === "Todo") document.getElementById("todo").appendChild(div);
    if (task.status === "In Progress") document.getElementById("inprogress").appendChild(div);
    if (task.status === "Completed") document.getElementById("completed").appendChild(div);
  });

  updateStats(tasks);
}

function updateStats(tasks) {
  const completed = tasks.filter(t => t.status === "Completed").length;
  document.getElementById("totalTasks").innerText = tasks.length;
  document.getElementById("completedTasks").innerText = completed;
  document.getElementById("progress").innerText =
    tasks.length ? Math.round((completed / tasks.length) * 100) + "%" : "0%";
}
