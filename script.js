// HEY! WHY ARE YOU LOOKING IN HERE?? CHEATER!!

const SLOT_COUNT = 10;
const HALF = SLOT_COUNT / 2;
const SHOW_SOLUTION_BUTTONS = false; // Set to false to hide solution and check-all buttons

const GROUP_STATES = {
  p1: "1000100110".split("").map(Number), // 1325 1
  p2: "1101100010".split("").map(Number), // 2545 6
  p3: "1000110000".split("").map(Number), // 1315 5 
  p4: "1011000101".split("").map(Number), // 5325 5
  p5: "0100010011".split("").map(Number), // 1542 2
  p6: "1010001101".split("").map(Number), // 5415 5
};

const GROUP_SOLUTION_CODES = {
  p1: "1325",
  p2: "2545",
  p3: "1315",
  p4: "5325",
  p5: "1542",
  p6: "5415",
};

const ANSWER_TABLE_DATA = [
  ["E", "G", "R", "T", "S", "T", "Y", "O"],
  ["N", "I", "X", "N", "O", "W", "O", "T"],
  ["E", "A", "H", "A", "E", "H", "C", "I"],
  ["F", "D", "E", "B", "M", "F", "A", "S"],
  ["R", "S", "E", "E", "N", "G", "H", "I"],
  ["W", "A", "K", "O", "E", "T", "U", "Z"],
  ["V", "H", "S", "Q", "D", "A", "M", "N"],
  ["O", "T", "J", "R", "I", "E", "E", "P"],
]

let INITIAL_STATE = null;
let currentGroup = null;
// 1101100010 2545
// 0111011001 1315
// 1011000101 5325
// 1010001101
// 1000110000 4245

// 0100010011 1542  THIS HAS ALL UNIQUE MOVES IN SOLUTION 
//uniques
// 1000100110 1325


const homeScreen = document.getElementById("home-screen");
const gameScreen = document.getElementById("game-screen");
const registerEl = document.querySelector(".register");
const statusEl = document.querySelector(".status");
const solutionEl = document.querySelector(".solution");
const historyListEl = document.querySelector(".history-list");
const answerForm = document.getElementById("answer-form");
const answerInput = document.getElementById("answer-input");
const answerStatus = document.getElementById("answer-status");
const answerDetails = document.getElementById("answer-details");
const answerTableEl = document.getElementById("answer-table");
const themeToggle = document.getElementById("theme-toggle");
const wordForm = document.getElementById("word-form");
const wordInput = document.getElementById("word-input");
const wordStatus = document.getElementById("word-status");
const thorLogo = document.getElementById("thor-logo");
const move1Btn = document.getElementById("move-1");
const move2Btn = document.getElementById("move-2");
const move3Btn = document.getElementById("move-3");
const move4Btn = document.getElementById("move-4");
const move5Btn = document.getElementById("move-5");
const solveBtn = document.getElementById("solve");
const undoBtn = document.getElementById("undo");
const resetBtn = document.getElementById("reset");
const checkAllBtn = document.getElementById("check-all");
const allSolutionsEl = document.getElementById("all-solutions");
const groupBtns = document.querySelectorAll(".group-btn");

const moveLabels = {
  1: "Move 1",
  2: "Move 2",
  3: "Move 3",
  4: "Move 4",
  5: "Move 5",
};

let register = createInitialRegister();
console.log("Initial register state:", register.join(""));
let initialRegister = register.slice();
let moveHistory = [];
let stateHistory = [register.slice()];

function createInitialRegister() {
  if (Array.isArray(INITIAL_STATE) && INITIAL_STATE.length === SLOT_COUNT) {
    return INITIAL_STATE.map((value) => (value === 1 ? 1 : 0));
  }
  return createSolvableRegister();
}

function createSolvableRegister() {
  let state = Array.from({ length: SLOT_COUNT }, () => 1);
  const steps = Math.floor(Math.random() * 8) + 6;
  for (let i = 0; i < steps; i += 1) {
    const move = Math.floor(Math.random() * 5) + 1;
    state = applyMove(state, move);
  }
  if (state.every((value) => value === 1)) {
    const move = Math.floor(Math.random() * 5) + 1;
    state = applyMove(state, move);
  }
  return state;
}

function renderRegister() {
  registerEl.innerHTML = "";
  register.forEach((value, index) => {
    const slot = document.createElement("div");
    slot.className = index < 5 ? "slot slot-first-half" : "slot slot-second-half";
    slot.dataset.value = value;
    slot.setAttribute("role", "gridcell");
    slot.setAttribute("aria-label", `Slot ${index + 1} value ${value}`);
    slot.textContent = value;
    registerEl.appendChild(slot);
  });
  updateStatus();
  clearSolution();
}

function flipRange(start, end) {
  for (let i = start; i < end; i += 1) {
    register[i] = register[i] === 1 ? 0 : 1;
  }
}

function rightShiftCycle() {
  const last = register[register.length - 1];
  register = [last, ...register.slice(0, register.length - 1)];
}

function leftShiftCycle() {
  const first = register[0];
  register = [...register.slice(1), first];
}

function flipFirstTwoLastTwo() {
  const indices = [0, 1, register.length - 2, register.length - 1];
  indices.forEach((index) => {
    register[index] = register[index] === 1 ? 0 : 1;
  });
}

function isWin() {
  return register.every((value) => value === 1);
}

function updateStatus() {
  const won = isWin();
  statusEl.textContent = won
    ? "You win! All slots are 1."
    : "";
  [move1Btn, move2Btn, move3Btn, move4Btn, move5Btn].forEach((button) => {
    button.disabled = won;
  });
  solveBtn.disabled = won;
}

function clearSolution() {
  solutionEl.textContent = "";
}

function renderHistory() {
  historyListEl.innerHTML = "";
  if (moveHistory.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No moves yet.";
    historyListEl.appendChild(empty);
    return;
  }
  // Display all moves (up to 5)
  moveHistory.forEach((move, index) => {
    const item = document.createElement("li");
    item.textContent = `${moveLabels[move]}`;
    historyListEl.appendChild(item);
  });
}

function addMoveToHistory(move) {
  moveHistory.push(move);
  if (moveHistory.length > 5) {
    moveHistory = moveHistory.slice(-5);
  }
  renderHistory();
}

function resetHistory() {
  moveHistory = [];
  stateHistory = [register.slice()];
  renderHistory();
}

function sendBump() {
  try {
    const socket = new WebSocket`("ws://10.4.8.233:8787");`
    socket.addEventListener("open", () => {
      socket.send("bump");
      socket.close();
    });
  } catch (error) {
    // Ignore connection failures in environments without a websocket server.
  }
}

function setAnswerStatus(isCorrect) {
  answerStatus.textContent = isCorrect ? "✓" : "✕";
  answerStatus.classList.toggle("correct", isCorrect);
  answerStatus.classList.toggle("wrong", !isCorrect);
}

function clearAnswerStatus() {
  answerStatus.textContent = "";
  answerStatus.classList.remove("correct", "wrong");
  answerDetails.textContent = "";
  answerTableEl.innerHTML = "";
  wordStatus.textContent = "";
  wordStatus.classList.remove("correct", "wrong");
  wordInput.value = "";
  thorLogo.innerHTML = "";
  wordForm.classList.add("hidden");
}

function renderAnswerTable() {
  const table = document.createElement("table");
  const headerRow = document.createElement("tr");
  const corner = document.createElement("th");
  corner.textContent = "";
  headerRow.appendChild(corner);

  for (let col = 1; col <= 8; col += 1) {
    const th = document.createElement("th");
    th.textContent = col;
    headerRow.appendChild(th);
  }
  table.appendChild(headerRow);

  for (let row = 1; row <= 8; row += 1) {
    const tr = document.createElement("tr");
    const rowHeader = document.createElement("th");
    rowHeader.textContent = row;
    tr.appendChild(rowHeader);
    for (let col = 1; col <= 8; col += 1) {
      const td = document.createElement("td");
      const value = ANSWER_TABLE_DATA[row - 1]?.[col - 1] ?? "";
      td.textContent = value;
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }

  answerTableEl.innerHTML = "";
  answerTableEl.appendChild(table);
}

function applyMove(state, move) {
  const next = state.slice();
  if (move === 1) {
    for (let i = 0; i < HALF; i += 1) {
      next[i] = next[i] === 1 ? 0 : 1;
    }
    return next;
  }
  if (move === 2) {
    for (let i = HALF; i < SLOT_COUNT; i += 1) {
      next[i] = next[i] === 1 ? 0 : 1;
    }
    return next;
  }
  if (move === 3) {
    const last = next[next.length - 1];
    return [last, ...next.slice(0, next.length - 1)];
  }
  if (move === 4) {
    const first = next[0];
    return [...next.slice(1), first];
  }
  const indices = [0, 1, next.length - 2, next.length - 1];
  indices.forEach((index) => {
    next[index] = next[index] === 1 ? 0 : 1;
  });
  return next;
}

function findSolution(startState) {
  const startKey = startState.join("");
  const targetKey = "1".repeat(SLOT_COUNT);
  if (startKey === targetKey) {
    return [];
  }

  const queue = [startState];
  const visited = new Map();
  visited.set(startKey, { prev: null, move: null });

  while (queue.length > 0) {
    const current = queue.shift();
    const currentKey = current.join("");

    for (let move = 1; move <= 5; move += 1) {
      const next = applyMove(current, move);
      const nextKey = next.join("");
      if (visited.has(nextKey)) {
        continue;
      }
      visited.set(nextKey, { prev: currentKey, move });
      if (nextKey === targetKey) {
        return reconstructPath(visited, nextKey);
      }
      queue.push(next);
    }
  }

  return null;
}

function reconstructPath(visited, endKey) {
  const moves = [];
  let cursor = endKey;
  while (cursor) {
    const node = visited.get(cursor);
    if (!node || node.move === null) {
      break;
    }
    moves.push(node.move);
    cursor = node.prev;
  }
  return moves.reverse();
}

move1Btn.addEventListener("click", () => {
  flipRange(0, HALF);
  addMoveToHistory(1);
  stateHistory.push(register.slice());
  renderRegister();
});

move2Btn.addEventListener("click", () => {
  flipRange(HALF, SLOT_COUNT);
  addMoveToHistory(2);
  stateHistory.push(register.slice());
  renderRegister();
});

move3Btn.addEventListener("click", () => {
  rightShiftCycle();
  addMoveToHistory(3);
  stateHistory.push(register.slice());
  renderRegister();
});

move4Btn.addEventListener("click", () => {
  leftShiftCycle();
  addMoveToHistory(4);
  stateHistory.push(register.slice());
  renderRegister();
});

move5Btn.addEventListener("click", () => {
  flipFirstTwoLastTwo();
  addMoveToHistory(5);
  stateHistory.push(register.slice());
  renderRegister();
});

solveBtn.addEventListener("click", () => {
  const solution = findSolution(register);
  if (solution === null) {
    solutionEl.textContent = "No solution found.";
    return;
  }
  if (solution.length === 0) {
    solutionEl.textContent = "Already solved!";
    return;
  }
  const steps = solution.map((move) => moveLabels[move]).join(" → ");
  solutionEl.textContent = `Solution (${solution.length} moves): ${steps}`;
});

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = answerInput.value.trim();
  
  // Parse the input as a sequence of moves
  const moveSequence = value.split("").map(Number).filter(n => n >= 1 && n <= 5);
  
  if (moveSequence.length === 0) {
    setAnswerStatus(false);
    answerForm.classList.add("shake");
    window.setTimeout(() => {
      answerForm.classList.remove("shake");
    }, 400);
    return;
  }
  
  // Apply the moves to a copy of the initial register
  let testState = [...initialRegister];
  for (const move of moveSequence) {
    testState = applyMove(testState, move);
  }
  
  // Check if the result is all 1s (win state)
  const isCorrect = testState.every(value => value === 1);
  
  if (isCorrect) {
    setAnswerStatus(true);
    answerForm.classList.remove("shake");
    const digitSum = moveSequence.reduce((sum, digit) => sum + digit, 0);
    const digitsDisplay = moveSequence.join(" + ");
    const modResult = digitSum % 10;
    answerDetails.innerHTML = `
      <center><h2 class="answer-details-title">${digitsDisplay} = ${digitSum} (mod 10) = ${modResult} </h2> <h2>Answer: ${modResult}</h2>
      <ul class="answer-details-list"> </center>
      <br/>
        <li>Use (Row, Column) to find each letter in the table.</li>
        <li>Row = your solution; Column = next player's solution (P1 uses P2, P6 uses P1).</li>
        <li>Each player gets one letter. Combine the letters from P1 to P6 to form the final solution.</li>
        <li>Example: If P1's solution is 1 and P2's is 2, check cell (1,2) in the table to get the letter 'G'.</li>
      </ul>
    `;
    renderAnswerTable();
    wordForm.classList.remove("hidden");
    return;
  }
  
  setAnswerStatus(false);
  answerForm.classList.add("shake");
  window.setTimeout(() => {
    answerForm.classList.remove("shake");
  }, 400);
});

answerInput.addEventListener("input", () => {
  clearAnswerStatus();
  answerForm.classList.remove("shake");
});

wordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const normalized = wordInput.value.replace(/\s+/g, "").toLowerCase();
  if (normalized === "tensor") {
    wordStatus.textContent = "✓";
    wordStatus.classList.add("correct");
    wordStatus.classList.remove("wrong");
    thorLogo.innerHTML = 'Great job!! Now look at the monitor!';
    sendBump();
  } else {
    wordStatus.textContent = "✕";
    wordStatus.classList.add("wrong");
    wordStatus.classList.remove("correct");
    thorLogo.innerHTML = "";
  }
});

undoBtn.addEventListener("click", () => {
  if (stateHistory.length > 1) {
    stateHistory.pop();
    register = stateHistory[stateHistory.length - 1].slice();
    if (moveHistory.length > 0) {
      moveHistory.pop();
    }
    renderHistory();
    renderRegister();
  }
});

resetBtn.addEventListener("click", () => {
  initialRegister = createInitialRegister();
  register = initialRegister.slice();
  resetHistory();
  clearAnswerStatus();
  allSolutionsEl.innerHTML = "";
  renderRegister();
});

checkAllBtn.addEventListener("click", () => {
  allSolutionsEl.innerHTML = "<p>Checking all combinations from 1111 to 9999...</p>";
  
  // Use setTimeout to allow UI to update before processing
  setTimeout(() => {
    const workingSolutions = [];
    
    for (let num = 1111; num <= 9999; num++) {
      const numStr = num.toString();
      const moveSequence = numStr.split("").map(Number).filter(n => n >= 1 && n <= 5);
      
      // Skip if any digit is 0, 6, 7, 8, or 9
      if (moveSequence.length !== 4) continue;
      
      // Apply the moves to a copy of the current register
      let testState = [...register];
      for (const move of moveSequence) {
        testState = applyMove(testState, move);
      }
      
      // Check if the result is all 1s (win state)
      if (testState.every(value => value === 1)) {
        workingSolutions.push(numStr);
      }
    }
    
    // Display results
    if (workingSolutions.length === 0) {
      allSolutionsEl.innerHTML = "<p>No solutions found in range 1111-9999.</p>";
    } else {
      let html = `<h3>Found ${workingSolutions.length} working solution(s):</h3>`;
      html += '<div class="solutions-list">';
      workingSolutions.forEach(sol => {
        html += `<span class="solution-item">${sol}</span>`;
      });
      html += '</div>';
      allSolutionsEl.innerHTML = html;
    }
  }, 100);
});

groupBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const group = btn.dataset.group;
    currentGroup = group;
    INITIAL_STATE = GROUP_STATES[group];
    initialRegister = createInitialRegister();
    register = initialRegister.slice();
    stateHistory = [register.slice()];
    moveHistory = [];
    homeScreen.style.display = "none";
    gameScreen.style.display = "grid";
    
    // Show/hide solution buttons based on config
    if (SHOW_SOLUTION_BUTTONS) {
      solveBtn.style.display = "";
      checkAllBtn.style.display = "";
    } else {
      solveBtn.style.display = "none";
      checkAllBtn.style.display = "none";
    }
    
    renderRegister();
    renderHistory();
  });
});

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    themeToggle.textContent = isLight ? "Dark mode" : "Light mode";
  });
}
