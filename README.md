# Study Tracker & CGPA Dashboard

A minimal student dashboard to track daily study progress, calculate CGPA semester-wise, and plan targets for future semesters.

Built with **vanilla HTML, CSS and JavaScript** and deployed on **Netlify**.

---

## ✨ Features

### 📝 Study Tracker
- Add daily topics you studied (e.g., `DSA – Hashing`, `CN – OSI layers`).
- Mark items as completed.
- Data is persisted using `localStorage` – your list survives refresh.
- 🔥 **Streak system**:
  - Tracks how many continuous days you added at least one topic.
  - Shows a badge like _“You’re on a 4-day study streak”_.

---

### 🎓 CGPA Calculator
- Per-semester CGPA (SGPA) calculator.
- Supports credits: **2, 3, 4**.
- Grade mapping (fixed as in many Indian universities):

  | Grade | Points |
  |-------|--------|
  | S     | 10     |
  | A     | 9      |
  | B     | 8      |
  | C     | 7      |
  | D     | 6      |
  | E     | 5      |
  | F     | 4      |

- For each subject you can:
  - Enter **subject name**.
  - Toggle credit (**2 / 3 / 4**) with a pill-style switch.
  - Choose grade (**S–F**).
- Shows per-subject breakdown:
  - `3 × 9 = 27` (credits × grade points).
- Calculates:
  - **Semester SGPA** (current sem).
  - **Overall CGPA** across all semesters.
- All subjects for all semesters are stored in `localStorage`.

---

### 🎯 Target CGPA Helper
Reverse calculator that answers:

> “What average grade do I need in the remaining credits to reach my target CGPA?”

You enter:
- Current CGPA  
- Completed credits  
- Target CGPA  
- Remaining credits  

The app outputs:
- Required average grade points
- Approximate grade range (e.g. **“roughly A (9)”** or **“B (8)”**)

---

### 🧭 Simple Tabbed UI
The app is split into three tabs:

- **Study** – study tracker + streak  
- **CGPA** – grade/credits calculator  
- **Target** – target CGPA helper  

Only one panel is visible at a time, so the UI stays clean and non-cluttered.

---

### 📸 Screenshot Mode
One-click **“Screenshot mode”** for sharing marks or progress:

- Hides buttons and extra controls.
- Shows a clean summary layout ready for screenshot.
- Toggle:
  - Click the button again to exit, or
  - Press **Esc** on the keyboard.

---

### ⌨️ Keyboard Shortcuts

- `/` → Focus the study-tracker input from anywhere.
- `Ctrl + Enter` (in CGPA tab) → Calculate CGPA.
- `Esc` → Exit screenshot mode.

---

## 🛠 Tech Stack

- **Frontend:** HTML, CSS, JavaScript (no frameworks)
- **Storage:** `localStorage` for tasks, streaks, and CGPA data
- **Deployment:** Netlify (connected to GitHub)

---

## 🚀 Live Demo

> 🔗 _Add your Netlify URL here_  
> Example: `https://studytrackker.netlify.app`

---

## 💻 Running Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/<your-username>/<your-repo>.git
   cd <your-repo>
