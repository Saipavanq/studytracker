// ---------- Study Tracker + Streak ----------

const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

const streakBox = document.getElementById("streakBox");
const streakText = document.getElementById("streakText");
const streakEmoji = document.getElementById("streakEmoji");

const STORAGE_TASKS = "studyTracker_tasks";
const STORAGE_STREAK = "studyTracker_streak";
const STORAGE_CGPA = "studyTracker_cgpa_v1";

let tasks = [];
let streak = { count: 0, lastDate: null };

// ----- Load/save basic data -----
function loadBasicData() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_TASKS));
    const savedStreak = JSON.parse(localStorage.getItem(STORAGE_STREAK));
    if (Array.isArray(savedTasks)) tasks = savedTasks;
    if (savedStreak && typeof savedStreak.count === "number") streak = savedStreak;
  } catch (e) {
    console.error("Error loading basic data", e);
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_TASKS, JSON.stringify(tasks));
}

function saveStreak() {
  localStorage.setItem(STORAGE_STREAK, JSON.stringify(streak));
}

// ----- Streak helpers -----
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

// ----- Tasks UI -----
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

// ---------- CGPA Calculator & semesters ----------

const cgpaRows = document.getElementById("cgpaRows");
const addSubjectBtn = document.getElementById("addSubjectBtn");
const calcCgpaBtn = document.getElementById("calcCgpaBtn");
const cgpaResult = document.getElementById("cgpaResult");
const overallResult = document.getElementById("overallResult");
const semesterSelect = document.getElementById("semesterSelect");

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

let cgpaState = {
  currentSemester: "1",
  semesters: { "1": [] },
};

function loadCgpaState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_CGPA));
    if (saved && saved.semesters) {
      cgpaState = saved;
    }
  } catch (e) {
    console.error("Error loading CGPA data", e);
  }
  if (!cgpaState.semesters) cgpaState.semesters = { "1": [] };
  if (!cgpaState.semesters[cgpaState.currentSemester]) {
    cgpaState.currentSemester = "1";
  }
}

function saveCgpaState() {
  localStorage.setItem(STORAGE_CGPA, JSON.stringify(cgpaState));
}

function getCurrentSubjects() {
  const key = cgpaState.currentSemester;
  if (!cgpaState.semesters[key]) cgpaState.semesters[key] = [];
  return cgpaState.semesters[key];
}

function updateSubjectPoints(subject, span) {
  const gp = gradePoints[subject.grade] ?? 0;
  const pts = subject.credits * gp;
  span.textContent = `${subject.credits} × ${gp} = ${pts}`;
}

function renderSubjectRow(subject) {
  const row = document.createElement("div");
  row.className = "cgpa-row";

  const subjectInput = document.createElement("input");
  subjectInput.type = "text";
  subjectInput.className = "cgpa-subject-input";
  subjectInput.placeholder = "Subject name (e.g., DSA)";
  subjectInput.value = subject.name || "";

  subjectInput.addEventListener("input", () => {
    subject.name = subjectInput.value;
    saveCgpaState();
  });

  const creditGroup = document.createElement("div");
  creditGroup.className = "credit-toggle-group";

  [2, 3, 4].forEach((c) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "credit-toggle";
    btn.textContent = `${c} cr`;
    btn.dataset.credit = String(c);
    if (c === subject.credits) btn.classList.add("active");

    btn.addEventListener("click", () => {
      creditGroup
        .querySelectorAll(".credit-toggle")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      subject.credits = c;
      saveCgpaState();
      updateSubjectPoints(subject, pointsSpan);
      calculateCgpa(false);
    });

    creditGroup.appendChild(btn);
  });

  const gradeSelect = document.createElement("select");
  gradeSelect.className = "cgpa-select cgpa-grade";
  ["S", "A", "B", "C", "D", "E", "F"].forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    if (g === subject.grade) opt.selected = true;
    gradeSelect.appendChild(opt);
  });

  gradeSelect.addEventListener("change", () => {
    subject.grade = gradeSelect.value;
    saveCgpaState();
    updateSubjectPoints(subject, pointsSpan);
    calculateCgpa(false);
  });

  const pointsSpan = document.createElement("span");
  pointsSpan.className = "cgpa-points";
  updateSubjectPoints(subject, pointsSpan);

  const delBtn = document.createElement("button");
  delBtn.className = "cgpa-delete";
  delBtn.textContent = "✖";
  delBtn.addEventListener("click", () => {
    const subjects = getCurrentSubjects();
    const idx = subjects.findIndex((s) => s.id === subject.id);
    if (idx !== -1) {
      subjects.splice(idx, 1);
      saveCgpaState();
      renderCgpaRows();
      calculateCgpa(false);
    }
  });

  row.appendChild(subjectInput);
  row.appendChild(creditGroup);
  row.appendChild(gradeSelect);
  row.appendChild(pointsSpan);
  row.appendChild(delBtn);

  cgpaRows.appendChild(row);
  return row;
}

function renderCgpaRows() {
  cgpaRows.innerHTML = "";
  const subjects = getCurrentSubjects();
  subjects.forEach((sub) => renderSubjectRow(sub));
}

function calculateCgpa(showErrors = true) {
  const subjectsCurrent = getCurrentSubjects();
  const rows = cgpaRows.querySelectorAll(".cgpa-row");

  cgpaResult.classList.remove("error");

  rows.forEach((r) => r.classList.remove("row-error"));

  if (!subjectsCurrent.length) {
    cgpaResult.textContent =
      "Enter at least one subject in this semester to calculate.";
    overallResult.textContent = "";
    return;
  }

  let hadError = false;
  let currentCredits = 0;
  let currentPoints = 0;

  subjectsCurrent.forEach((sub, index) => {
    const gp = gradePoints[sub.grade] ?? 0;

    if (showErrors && (!sub.name || !sub.name.trim())) {
      hadError = true;
      const rowEl = rows[index];
      if (rowEl) rowEl.classList.add("row-error");
    }

    currentCredits += sub.credits;
    currentPoints += sub.credits * gp;
  });

  if (showErrors && hadError) {
    cgpaResult.textContent = "Fill subject names before calculating.";
    cgpaResult.classList.add("error");
    overallResult.textContent = "";
    return;
  }

  if (!currentCredits) {
    cgpaResult.textContent = "Total credits in this semester cannot be zero.";
    cgpaResult.classList.add("error");
  } else {
    const sgpa = currentPoints / currentCredits;
    cgpaResult.textContent = `Semester ${cgpaState.currentSemester} SGPA: ${sgpa.toFixed(
      2
    )}`;
  }

  // overall CGPA across all semesters
  let overallCredits = 0;
  let overallPoints = 0;

  Object.values(cgpaState.semesters).forEach((subjects) => {
    subjects.forEach((sub) => {
      const gp = gradePoints[sub.grade] ?? 0;
      overallCredits += sub.credits;
      overallPoints += sub.credits * gp;
    });
  });

  if (overallCredits > 0) {
    const overall = overallPoints / overallCredits;
    overallResult.textContent = `Overall CGPA (all semesters): ${overall.toFixed(
      2
    )}`;
  } else {
    overallResult.textContent = "";
  }
}

addSubjectBtn.addEventListener("click", () => {
  const subjects = getCurrentSubjects();
  subjects.push({
    id: Date.now() + Math.random(),
    name: "",
    credits: 3,
    grade: "S",
  });
  saveCgpaState();
  renderCgpaRows();
  calculateCgpa(false);
});

calcCgpaBtn.addEventListener("click", () => calculateCgpa(true));

semesterSelect.addEventListener("change", () => {
  const value = semesterSelect.value;
  cgpaState.currentSemester = value;
  if (!cgpaState.semesters[value]) cgpaState.semesters[value] = [];
  saveCgpaState();
  renderCgpaRows();
  calculateCgpa(false);
});

// ---------- Target CGPA helper ----------

const currentCgpaInput = document.getElementById("currentCgpa");
const completedCreditsInput = document.getElementById("completedCredits");
const targetCgpaInput = document.getElementById("targetCgpa");
const remainingCreditsInput = document.getElementById("remainingCredits");
const calcTargetBtn = document.getElementById("calcTargetBtn");
const targetResult = document.getElementById("targetResult");

function closestGradeFromPoints(gp) {
  if (gp >= 9.5) return "S (10)";
  if (gp >= 8.5) return "A (9)";
  if (gp >= 7.5) return "B (8)";
  if (gp >= 6.5) return "C (7)";
  if (gp >= 5.5) return "D (6)";
  if (gp >= 4.5) return "E (5)";
  return "F (4)";
}

function calculateTarget() {
  const currentCgpa = parseFloat(currentCgpaInput.value);
  const completedCredits = parseFloat(completedCreditsInput.value);
  const targetCgpa = parseFloat(targetCgpaInput.value);
  const remainingCredits = parseFloat(remainingCreditsInput.value);

  if (
    isNaN(currentCgpa) ||
    isNaN(completedCredits) ||
    isNaN(targetCgpa) ||
    isNaN(remainingCredits)
  ) {
    targetResult.textContent =
      "Fill all four fields to calculate the required grade.";
    return;
  }

  if (remainingCredits <= 0) {
    targetResult.textContent = "Remaining credits must be greater than zero.";
    return;
  }

  const totalCredits = completedCredits + remainingCredits;
  if (totalCredits <= 0) {
    targetResult.textContent = "Total credits must be positive.";
    return;
  }

  const targetTotalPoints = targetCgpa * totalCredits;
  const currentPoints = currentCgpa * completedCredits;
  const remainingPoints = targetTotalPoints - currentPoints;
  const requiredAvg = remainingPoints / remainingCredits;

  if (requiredAvg > 10) {
    targetResult.textContent =
      "Even all S grades (10) are not enough to reach this target CGPA.";
    return;
  }

  if (requiredAvg <= 4) {
    targetResult.textContent =
      "You can hit your target even with an average around F grade (4). Just don't fail anything badly.";
    return;
  }

  const gradeText = closestGradeFromPoints(requiredAvg);
  targetResult.textContent = `You need an average of about ${requiredAvg.toFixed(
    2
  )} grade points in the remaining credits → roughly ${gradeText}.`;
}

calcTargetBtn.addEventListener("click", calculateTarget);

// ---------- Screenshot mode + shortcuts ----------

const screenshotBtn = document.getElementById("screenshotBtn");
const appRoot = document.querySelector(".app");

screenshotBtn.addEventListener("click", () => {
  appRoot.classList.toggle("screenshot-mode");
});

document.addEventListener("keydown", (e) => {
  const tag = e.target.tagName;
  const isInput = tag === "INPUT" || tag === "TEXTAREA";

  // "/" focuses study input
  if (e.key === "/" && !isInput) {
    e.preventDefault();
    taskInput.focus();
  }

  // Ctrl+Enter = calculate CGPA
  if (e.key === "Enter" && e.ctrlKey) {
    e.preventDefault();
    calculateCgpa(true);
  }
});

// ---------- Initial load ----------
loadBasicData();
loadCgpaState();

renderTasks();
renderStreak();

semesterSelect.value = cgpaState.currentSemester;
renderCgpaRows();
calculateCgpa(false);

if (!getCurrentSubjects().length) {
  const subjects = getCurrentSubjects();
  subjects.push({
    id: Date.now() + Math.random(),
    name: "",
    credits: 3,
    grade: "S",
  });
  saveCgpaState();
  renderCgpaRows();
}
