function renderTasks(tasks) {
  const board = document.getElementById("taskBoard");
  board.innerHTML = "";

  tasks.forEach((task, index) => {
    const div = document.createElement("div");
    div.className = `task ${task.priority.toLowerCase()}`;

    div.innerHTML = `
      <h3>${task.title}</h3>
      <small>Priority: ${task.priority}</small><br>
      <small>Due: ${task.dueDate || "No deadline"}</small><br>
      <small>Status: ${task.status}</small><br>
      ${task.status !== "Completed" ? `<button onclick="completeTask(${index})">Mark Complete</button>` : ""}
    `;

    board.appendChild(div);
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
