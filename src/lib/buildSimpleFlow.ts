import type { FlowData } from "./types";

export interface SimpleItem {
  id: string;
  name: string;
  amount: number;
}

// 트리 구조 지출 노드
export interface ExpenseNode {
  id: string;
  name: string;
  // amount: 자식이 없을 때만 직접 입력값. 자식이 있으면 자동 합산.
  amount: number;
  children: ExpenseNode[];
}

export interface SimpleData {
  title: string;
  unit: string;
  incomes: SimpleItem[];
  expenses: ExpenseNode[];
}

export function getExpenseTotal(node: ExpenseNode): number {
  if (node.children.length === 0) return node.amount;
  return node.children.reduce((s, c) => s + getExpenseTotal(c), 0);
}

const INCOME_COLORS = [
  "#22c55e", "#16a34a", "#15803d", "#4ade80", "#059669", "#10b981",
];

// 깊이별 색상 팔레트
const EXPENSE_PALETTES: string[][] = [
  // depth 0 — 대분류 (진한 색)
  ["#dc2626", "#d97706", "#7c3aed", "#0369a1", "#065f46", "#9d174d", "#92400e", "#1e40af"],
  // depth 1 — 중분류 (중간 색)
  ["#ef4444", "#f59e0b", "#8b5cf6", "#0ea5e9", "#10b981", "#ec4899", "#f97316", "#3b82f6"],
  // depth 2+ — 소분류 (밝은 색)
  ["#fca5a5", "#fcd34d", "#c4b5fd", "#7dd3fc", "#6ee7b7", "#f9a8d4", "#fdba74", "#93c5fd"],
];

function getPaletteColor(depth: number, idx: number): string {
  const palette = EXPENSE_PALETTES[Math.min(depth, EXPENSE_PALETTES.length - 1)];
  return palette[idx % palette.length];
}

let _colorIdx: number[] = []; // depth별 인덱스 추적용

function addExpenseNodes(
  node: ExpenseNode,
  parentFlowId: string,
  depth: number,
  nodes: FlowData["nodes"],
  links: FlowData["links"],
) {
  const total = getExpenseTotal(node);
  if (total <= 0) return;

  if (!_colorIdx[depth]) _colorIdx[depth] = 0;
  const color = getPaletteColor(depth, _colorIdx[depth]++);

  const flowId = `exp-${node.id}`;
  nodes.push({ id: flowId, name: node.name, color });
  links.push({ id: `l-${flowId}`, source: parentFlowId, target: flowId, value: total });

  for (const child of node.children) {
    addExpenseNodes(child, flowId, depth + 1, nodes, links);
  }
}

export function buildFlowData(simple: SimpleData): FlowData {
  const nodes: FlowData["nodes"] = [];
  const links: FlowData["links"] = [];
  _colorIdx = [];

  const totalIncome = simple.incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpense = simple.expenses.reduce((s, e) => s + getExpenseTotal(e), 0);

  // income nodes
  simple.incomes.forEach((item, idx) => {
    if (item.amount <= 0) return;
    nodes.push({ id: `inc-${item.id}`, name: item.name, color: INCOME_COLORS[idx % INCOME_COLORS.length] });
    links.push({ id: `linc-${item.id}`, source: `inc-${item.id}`, target: "center", value: item.amount });
  });

  // center node
  nodes.push({ id: "center", name: simple.title, color: "#1e293b" });

  // expense tree
  for (const expNode of simple.expenses) {
    addExpenseNodes(expNode, "center", 0, nodes, links);
  }

  // surplus / deficit
  if (totalIncome > totalExpense && totalExpense > 0) {
    const surplus = totalIncome - totalExpense;
    nodes.push({ id: "surplus", name: "잔여", color: "#3b82f6" });
    links.push({ id: "l-surplus", source: "center", target: "surplus", value: surplus });
  } else if (totalExpense > totalIncome && totalIncome > 0) {
    const deficit = totalExpense - totalIncome;
    nodes.push({ id: "deficit", name: "부족분", color: "#f97316" });
    links.push({ id: "l-deficit", source: "deficit", target: "center", value: deficit });
  }

  return { title: simple.title, unit: simple.unit, nodes, links };
}
