const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

const streakBox = document.getElementById("streakBox");
const streakText = document.getElementById("streakText");
const streakEmoji = document.getElementById("streakEmoji");

const STORAGE_TASKS = "studyTracker_tasks";
const STORAGE_STREAK = "studyTracker_streak";

let tasks = [];
let streak = { count: 0, lastDate: null };

// -------- LocalStorage helpers ----------
function loadData() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_TASKS));
    const savedStreak = JSON.parse(localStorage.getItem(STORAGE_STREAK));
    if (Array.isArray(savedTasks)) tasks = savedTasks;
    if (savedStreak && typeof savedStreak.count === "number") streak = savedStreak;
  } catch (e) {
    console.error("Error loading data", e);
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_TASKS, JSON.stringify(tasks));
}

function saveStreak() {
  localStorage.setItem(STORAGE_STREAK, JSON.stringify(streak));
}

// -------- Streak logic ----------
function dateString(d) {
  return d.toISOString().slice(0, 10);
}

function isYesterday(prevStr, todayStr) {
  if (!prevStr) return false;
  const prev = new Date(prevStr);
  const today = new Date(todayStr);
  const diffMs = today - prev;
  const oneDay = 24 * 60 * 60 * 1000;
  return diffMs > 0 && diffMs <= oneDay * 1.5;
}

function updateStreakOnAdd() {
  const todayStr = dateString(new Date());

  if (streak.lastDate === todayStr) {
    return; // already counted today
  }

  if (isYesterday(streak.lastDate, todayStr)) {
    streak.count += 1;
  } else {
    streak.count = 1;
  }

  streak.lastDate = todayStr;
  saveStreak();
  renderStreak();
}

function renderStreak() {
  if (!streak.count || streak.count <= 0) {
    streakBox.classList.remove("hot");
    streakEmoji.textContent = "💤";
    streakText.textContent = "No streak yet. Add a topic to start!";
    return;
  }

  streakBox.classList.add("hot");
  streakEmoji.textContent = streak.count >= 5 ? "🔥" : "⚡";
  streakText.textContent =
    streak.count === 1
      ? "Nice! You're on a 1-day study streak."
      : `🔥 You're on a ${streak.count}-day study streak!`;
}

// -------- Tasks UI ----------
function createTaskElement(task, index) {
  const li = document.createElement("li");
  li.className = "task-item";
  li.dataset.index = index;

  const left = document.createElement("div");
  left.className = "task-left";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.done;

  const span = document.createElement("span");
  span.className = "task-text";
  span.textContent = task.text;
  if (task.done) span.classList.add("done");

  checkbox.addEventListener("change", () => {
    const i = Number(li.dataset.index);
    tasks[i].done = checkbox.checked;
    if (checkbox.checked) span.classList.add("done");
    else span.classList.remove("done");
    saveTasks();
  });

  left.appendChild(checkbox);
  left.appendChild(span);

  const del = document.createElement("button");
  del.className = "delete-btn";
  del.textContent = "✖";

  del.addEventListener("click", () => {
    li.classList.add("removing");
    li.addEventListener("animationend", () => {
      const i = Number(li.dataset.index);
      tasks.splice(i, 1);
      saveTasks();
      renderTasks();
    });
  });

  li.appendChild(left);
  li.appendChild(del);
  return li;
}

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const item = createTaskElement(task, index);
    taskList.appendChild(item);
  });
}

// -------- Add task ----------
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({ text, done: false });
  saveTasks();
  updateStreakOnAdd();
  renderTasks();
  taskInput.value = "";
}

addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

// -------- Initial load ----------
loadData();
renderTasks();
renderStreak();
