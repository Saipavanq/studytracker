const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

function createTaskElement(text) {
  const li = document.createElement("li");
  li.className = "task-item";

  const left = document.createElement("div");
  left.className = "task-left";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  const span = document.createElement("span");
  span.className = "task-text";
  span.textContent = text;

  checkbox.addEventListener("change", () => {
    span.classList.toggle("done", checkbox.checked);
  });

  left.appendChild(checkbox);
  left.appendChild(span);

  const del = document.createElement("button");
  del.className = "delete-btn";
  del.textContent = "✖";

  del.addEventListener("click", () => {
    taskList.removeChild(li);
  });

  li.appendChild(left);
  li.appendChild(del);

  return li;
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const item = createTaskElement(text);
  taskList.appendChild(item);
  taskInput.value = "";
}

addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});
