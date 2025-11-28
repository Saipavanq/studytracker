// ---------- Study Tracker + Streak ----------

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

// ----- streak helpers -----
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

  if (streak.lastDate === todayStr) return;

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

// ----- tasks UI -----
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

// ---------- CGPA Calculator ----------

const cgpaRows = document.getElementById("cgpaRows");
const addSubjectBtn = document.getElementById("addSubjectBtn");
const calcCgpaBtn = document.getElementById("calcCgpaBtn");
const cgpaResult = document.getElementById("cgpaResult");

// grade -> points
const gradePoints = {
  S: 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  E: 5,
  F: 4,
};

function createCgpaRow(initialCredits = 3, initialGrade = "S", initialName = "") {
  const row = document.createElement("div");
  row.className = "cgpa-row";

  // subject name
  const subjectInput = document.createElement("input");
  subjectInput.type = "text";
  subjectInput.className = "cgpa-subject-input";
  subjectInput.placeholder = "Subject name (e.g., DSA)";
  subjectInput.value = initialName;

  // credits toggle
  const creditGroup = document.createElement("div");
  creditGroup.className = "credit-toggle-group";

  [2, 3, 4].forEach((c) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "credit-toggle";
    btn.textContent = `${c} cr`;
    btn.dataset.credit = String(c);
    if (c === initialCredits) btn.classList.add("active");

    btn.addEventListener("click", () => {
      creditGroup
        .querySelectorAll(".credit-toggle")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });

    creditGroup.appendChild(btn);
  });

  // grade select
  const gradeSelect = document.createElement("select");
  gradeSelect.className = "cgpa-select cgpa-grade";
  ["S", "A", "B", "C", "D", "E", "F"].forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    if (g === initialGrade) opt.selected = true;
    gradeSelect.appendChild(opt);
  });

  // delete button
  const delBtn = document.createElement("button");
  delBtn.className = "cgpa-delete";
  delBtn.textContent = "✖";
  delBtn.addEventListener("click", () => row.remove());

  row.appendChild(subjectInput);
  row.appendChild(creditGroup);
  row.appendChild(gradeSelect);
  row.appendChild(delBtn);

  cgpaRows.appendChild(row);
  return row;
}

function calculateCgpa() {
  const rows = document.querySelectorAll(".cgpa-row");
  if (!rows.length) {
    cgpaResult.textContent = "Add at least one subject first.";
    return;
  }

  let totalCredits = 0;
  let totalPoints = 0;

  rows.forEach((row) => {
    const activeCreditBtn = row.querySelector(".credit-toggle.active");
    const credit = activeCreditBtn
      ? Number(activeCreditBtn.dataset.credit)
      : 0;

    const grade = row.querySelector(".cgpa-grade").value;
    const gp = gradePoints[grade] ?? 0;

    totalCredits += credit;
    totalPoints += credit * gp;
  });

  if (!totalCredits) {
    cgpaResult.textContent = "Total credits cannot be zero.";
    return;
  }

  const cgpa = totalPoints / totalCredits;
  cgpaResult.textContent = `Your CGPA is ${cgpa.toFixed(2)}`;
}

addSubjectBtn.addEventListener("click", () => createCgpaRow());
calcCgpaBtn.addEventListener("click", calculateCgpa);

// ---------- initial load ----------
loadData();
renderTasks();
renderStreak();
createCgpaRow(); // one default row
