const QUESTIONS = [
  {
    q: "What is the correct way to declare an integer variable in C++?",
    opts: ["int x;", "integer x;", "var x;", "x int;"],
    answer: 0,
    topic: "Variables",
    diff: "Easy",
  },
  {
    q: "Which loop is guaranteed to execute at least once?",
    opts: ["for", "while", "do-while", "none of these"],
    answer: 2,
    topic: "Loops",
    diff: "Easy",
  },
  {
    q: "What is the output of <code>cout &lt;&lt; 5 + 3 * 2;</code>?",
    opts: ["16", "11", "13", "10"],
    answer: 1,
    topic: "Variables",
    diff: "Medium",
  },
  {
    q: "Which symbol is used to define a pointer in C++?",
    opts: ["&amp;", "*", "#", "@"],
    answer: 1,
    topic: "Pointers",
    diff: "Easy",
  },
  {
    q: "What does <code>&amp;</code> before a variable name (in a function parameter) mean?",
    opts: [
      "Multiplication",
      "Address-of",
      "Reference",
      "Both address-of and reference",
    ],
    answer: 3,
    topic: "Pointers",
    diff: "Hard",
  },
  {
    q: "Correct syntax for a function that returns nothing?",
    opts: [
      "void functionName()",
      "null functionName()",
      "empty functionName()",
      "none functionName()",
    ],
    answer: 0,
    topic: "Functions",
    diff: "Easy",
  },
  {
    q: "What does <code>for(int i=0; i&lt;5; i++) cout&lt;&lt;i;</code> print?",
    opts: ["12345", "01234", "0123456789", "54321"],
    answer: 1,
    topic: "Loops",
    diff: "Medium",
  },
  {
    q: "Which of these is NOT a valid C++ data type?",
    opts: ["int", "float", "real", "char"],
    answer: 2,
    topic: "Variables",
    diff: "Easy",
  },
  {
    q: "What does <code>*ptr</code> do if <code>ptr</code> is a pointer?",
    opts: [
      "Declares a pointer",
      "Dereferences it (gets the value)",
      "Deletes the pointer",
      "Multiplies the pointer",
    ],
    answer: 1,
    topic: "Pointers",
    diff: "Medium",
  },
  {
    q: "What is the scope of a variable declared inside a function?",
    opts: ["Global", "Local to that function", "Accessible everywhere", "None"],
    answer: 1,
    topic: "Functions",
    diff: "Medium",
  },
];

const TOPICS = ["Variables", "Loops", "Functions", "Pointers"];

const BADGES = [
  { min: 90, name: "PLATINUM" },
  { min: 70, name: "GOLD" },
  { min: 50, name: "SILVER" },
  { min: 0, name: "BRONZE" },
];

let state = {
  name: "",
  idx: 0,
  points: 0,
  correctCount: 0,
  streak: 0,
  level: 1,
  answered: false,
  startTime: null,
  elapsedSeconds: 0,
  topicStats: {},
};

let leaderboard = [];
let timerInterval = null;

const screens = {
  start: document.getElementById("screen-start"),
  quiz: document.getElementById("screen-quiz"),
  result: document.getElementById("screen-result"),
};

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");
}

function levelFromPoints(pts) {
  return Math.floor(pts / 20) + 1;
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

document.getElementById("startBtn").addEventListener("click", startQuiz);
document.getElementById("nameInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") startQuiz();
});

function startQuiz() {
  const nameVal = document.getElementById("nameInput").value.trim();

  const topicStats = {};
  TOPICS.forEach((t) => (topicStats[t] = { correct: 0, total: 0 }));

  state = {
    name: nameVal || "Player",
    idx: 0,
    points: 0,
    correctCount: 0,
    streak: 0,
    level: 1,
    answered: false,
    startTime: Date.now(),
    elapsedSeconds: 0,
    topicStats: topicStats,
  };

  showScreen("quiz");
  renderQuestion();
  startTimer();
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    state.elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
    document.getElementById("hudTime").textContent = formatTime(
      state.elapsedSeconds,
    );
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function renderQuestion() {
  state.answered = false;
  const q = QUESTIONS[state.idx];
  document.getElementById("qIndex").textContent =
    `QUESTION ${state.idx + 1} / ${QUESTIONS.length}`;
  document.getElementById("qTopic").textContent = q.topic.toUpperCase();
  document.getElementById("qDiff").textContent = q.diff.toUpperCase();
  document.getElementById("qText").innerHTML = q.q;
  document.getElementById("progressFill").style.width =
    `${(state.idx / QUESTIONS.length) * 100}%`;
  document.getElementById("feedback").textContent = "";
  document.getElementById("feedback").className = "feedback";
  document.getElementById("nextBtn").style.display = "none";

  const optsWrap = document.getElementById("qOptions");
  optsWrap.innerHTML = "";
  const letters = ["A", "B", "C", "D"];
  q.opts.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.innerHTML = `<span class="tag">${letters[i]}</span><span>${opt}</span>`;
    btn.addEventListener("click", () => selectAnswer(i, btn));
    optsWrap.appendChild(btn);
  });

  updateHud();
}

function updateHud() {
  document.getElementById("hudLevel").textContent = state.level;
  document.getElementById("hudPoints").textContent = state.points;
  document.getElementById("hudStreak").textContent = state.streak;
}

function selectAnswer(i, btnEl) {
  if (state.answered) return;
  state.answered = true;
  const q = QUESTIONS[state.idx];
  const allOptions = document.querySelectorAll("#qOptions .option");
  allOptions.forEach((b) => (b.disabled = true));

  const feedback = document.getElementById("feedback");
  state.topicStats[q.topic].total++;

  if (i === q.answer) {
    btnEl.classList.add("correct");
    state.correctCount++;
    state.streak++;
    state.topicStats[q.topic].correct++;
    let gained = 10;
    let streakMsg = "";
    if (state.streak > 0 && state.streak % 3 === 0) {
      gained += 5;
      streakMsg = " + streak bonus (+5)";
    }
    state.points += gained;
    const newLevel = levelFromPoints(state.points);
    let levelMsg = "";
    if (newLevel > state.level) {
      levelMsg = ` — level up! now LVL ${newLevel}`;
    }
    state.level = newLevel;
    feedback.textContent = `Correct. +${gained} pts${streakMsg}${levelMsg}`;
    feedback.className = "feedback ok";
  } else {
    btnEl.classList.add("wrong");
    allOptions[q.answer].classList.add("correct");
    state.streak = 0;
    feedback.textContent = `Not quite — correct answer highlighted above.`;
    feedback.className = "feedback bad";
  }

  updateHud();
  document.getElementById("nextBtn").style.display = "inline-block";
}

document.getElementById("nextBtn").addEventListener("click", () => {
  state.idx++;
  if (state.idx >= QUESTIONS.length) {
    finishQuiz();
  } else {
    renderQuestion();
  }
});

function getBadge(accuracyPct) {
  return BADGES.find((b) => accuracyPct >= b.min);
}

function finishQuiz() {
  stopTimer();
  document.getElementById("progressFill").style.width = `100%`;

  const accuracy = Math.round((state.correctCount / QUESTIONS.length) * 100);
  const badge = getBadge(accuracy);

  leaderboard.push({
    name: state.name,
    score: state.points,
    time: state.elapsedSeconds,
  });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 10);

  document.getElementById("finalScore").textContent = state.points;
  document.getElementById("finalCorrect").textContent = state.correctCount;
  document.getElementById("finalAccuracy").textContent = accuracy;
  document.getElementById("finalLevel").textContent = `LEVEL ${state.level}`;
  document.getElementById("finalBadge").textContent = badge.name;
  document.getElementById("finalTime").textContent = formatTime(
    state.elapsedSeconds,
  );

  renderTopicBreakdown();
  renderLeaderboard();
  showScreen("result");
}

function renderTopicBreakdown() {
  const wrap = document.getElementById("topicBreakdown");
  wrap.innerHTML = "";
  TOPICS.forEach((topic) => {
    const stat = state.topicStats[topic];
    const pct =
      stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
    const row = document.createElement("div");
    row.className = "topic-row";
    row.innerHTML = `
      <span class="t-name">${topic}</span>
      <span class="t-track"><span class="t-fill" style="width:${pct}%"></span></span>
      <span class="t-score">${stat.correct}/${stat.total}</span>
    `;
    wrap.appendChild(row);
  });
}

function renderLeaderboard() {
  const wrap = document.getElementById("boardList");
  wrap.innerHTML = "";
  leaderboard.forEach((entry, i) => {
    const row = document.createElement("div");
    row.className =
      "board-row" +
      (entry.name === state.name && entry.score === state.points ? " me" : "");
    row.innerHTML = `<span class="board-rank">#${i + 1}</span><span class="board-name">${escapeHtml(entry.name)}</span><span class="board-score">${entry.score} pts</span>`;
    wrap.appendChild(row);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.getElementById("retryBtn").addEventListener("click", () => {
  document.getElementById("nameInput").value = state.name;
  showScreen("start");
});
