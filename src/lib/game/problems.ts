import type { GameMode, Operation, ProblemSpec } from "./types";

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rangeForMode(mode: GameMode, level: number): [number, number] {
  if (mode === "kids") {
    if (level <= 10) return [1, 10];
    if (level <= 20) return [1, 15];
    if (level <= 30) return [1, 20];
    return [2, 25];
  }
  if (mode === "tabuada" || mode === "tabmestre") return [1, 10];
  if (mode === "student") {
    if (level <= 10) return [2, 15];
    if (level <= 25) return [2, 30];
    if (level <= 50) return [3, 60];
    return [5, 120];
  }
  // adult
  if (level <= 10) return [2, 20];
  if (level <= 25) return [3, 50];
  if (level <= 50) return [5, 150];
  return [20, 400];
}

/** Sequential Tabuada: index 0 -> 1x1, 1 -> 1x2, ..., 9 -> 1x10, 10 -> 2x1, ..., 99 -> 10x10 */
export function tabuadaAtIndex(index: number): ProblemSpec {
  const i = Math.max(0, Math.min(99, index));
  const a = Math.floor(i / 10) + 1; // 1..10
  const b = (i % 10) + 1;            // 1..10
  const answer = a * b;
  return { text: `${a} × ${b}`, answer, options: buildOptions(answer) };
}

export function generateProblem(
  mode: GameMode,
  level: number,
  op: Operation,
  tabuadaIndex: number = 0,
): ProblemSpec {
  // Sequential Tabuada mode
  if (mode === "tabuada") return tabuadaAtIndex(tabuadaIndex);

  // Tabuada Mestre: random mixed multiplications 1..10
  if (mode === "tabmestre") {
    const a = rand(1, 10);
    const b = rand(1, 10);
    const answer = a * b;
    return { text: `${a} × ${b}`, answer, options: buildOptions(answer) };
  }

  const [mn, mx] = rangeForMode(mode, level);

  if (op === "tab") {
    const a = rand(1, 10);
    const b = rand(1, 10);
    const answer = a * b;
    return { text: `${a} × ${b}`, answer, options: buildOptions(answer) };
  }

  if (op === "master") {
    const c = rand(20, 200);
    const a1 = rand(50, 400);
    const b1 = rand(20, 200);
    const sign = Math.random() > 0.5 ? 1 : -1;
    const ans = a1 + sign * b1 - c;
    const text = `${a1} ${sign > 0 ? "+" : "−"} ${b1} − ${c}`;
    return { text, answer: ans, options: buildOptions(ans) };
  }

  let actualOp: Operation = op;
  if (op === "mix") {
    const pool: Operation[] = mode === "kids"
      ? ["add", "sub", "tab", "div"]
      : ["add", "sub", "mul", "div"];
    actualOp = pool[rand(0, pool.length - 1)];
  }

  if (actualOp === "tab") {
    const a = rand(1, 10);
    const b = rand(1, 10);
    const answer = a * b;
    return { text: `${a} × ${b}`, answer, options: buildOptions(answer) };
  }

  let a = rand(mn, mx);
  let b = rand(mn, mx);
  let text = "", answer = 0;

  switch (actualOp) {
    case "add":
      text = `${a} + ${b}`; answer = a + b; break;
    case "sub":
      if (b > a) [a, b] = [b, a];
      text = `${a} − ${b}`; answer = a - b; break;
    case "mul": {
      const maxF = mode === "kids" ? 10 : Math.min(12, mx);
      a = rand(2, maxF); b = rand(2, maxF);
      text = `${a} × ${b}`; answer = a * b; break;
    }
    case "div": {
      const maxF = mode === "kids" ? 10 : Math.min(12, mx);
      b = rand(2, maxF);
      answer = rand(2, maxF);
      a = b * answer;
      text = `${a} ÷ ${b}`; break;
    }
  }
  return { text, answer, options: buildOptions(answer) };
}

function buildOptions(answer: number): number[] {
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const spread = Math.max(4, Math.abs(answer) * 0.25);
    const delta = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * spread));
    const candidate = answer + delta;
    if (candidate !== answer && candidate >= 0) set.add(candidate);
  }
  const arr = Array.from(set);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
