const SLOT_COUNT = 10;
const HALF = SLOT_COUNT / 2;

const GROUP_STATES = {
  p1: "1000100110".split("").map(Number), // 1325
  p2: "1101100010".split("").map(Number), // 2545
  p3: "0111011001".split("").map(Number), // 1315
  p4: "1011000101".split("").map(Number), // 5325
  p5: "0100010011".split("").map(Number), // 1542
};

let INITIAL_STATE = null;
// 1101100010 2545
// 0111011001 1315
// 1011000101 5325

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
const move1Btn = document.getElementById("move-1");
const move2Btn = document.getElementById("move-2");
const move3Btn = document.getElementById("move-3");
const move4Btn = document.getElementById("move-4");
const move5Btn = document.getElementById("move-5");
const solveBtn = document.getElementById("solve");
const resetBtn = document.getElementById("reset");
const groupBtns = document.querySelectorAll(".group-btn");

const moveLabels = {
  1: "Move 1",
  2: "Move 2",
  3: "Move 3",
  4: "Move 4",
  5: "Move 5",
};

let register = createInitialRegister();
let moveHistory = [];

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
    slot.className = "slot";
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
    : "Goal: Turn all slots into 1.";
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
  renderHistory();
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
  renderRegister();
});

move2Btn.addEventListener("click", () => {
  flipRange(HALF, SLOT_COUNT);
  addMoveToHistory(2);
  renderRegister();
});

move3Btn.addEventListener("click", () => {
  rightShiftCycle();
  addMoveToHistory(3);
  renderRegister();
});

move4Btn.addEventListener("click", () => {
  leftShiftCycle();
  addMoveToHistory(4);
  renderRegister();
});

move5Btn.addEventListener("click", () => {
  flipFirstTwoLastTwo();
  addMoveToHistory(5);
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
  
  // Apply the moves to a copy of the current register
  let testState = [...register];
  for (const move of moveSequence) {
    testState = applyMove(testState, move);
  }
  
  // Check if the result is all 1s (win state)
  const isCorrect = testState.every(value => value === 1);
  
  if (isCorrect) {
    setAnswerStatus(true);
    answerForm.classList.remove("shake");
    answerDetails.textContent = "";
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

resetBtn.addEventListener("click", () => {
  register = createInitialRegister();
  resetHistory();
  clearAnswerStatus();
  renderRegister();
});

groupBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const group = btn.dataset.group;
    INITIAL_STATE = GROUP_STATES[group];
    register = createInitialRegister();
    homeScreen.style.display = "none";
    gameScreen.style.display = "grid";
    renderRegister();
    renderHistory();
  });
});
