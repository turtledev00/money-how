"use client";

import React from "react";
import type { SimpleItem, SimpleData, ExpenseNode } from "@/lib/buildSimpleFlow";
import { getExpenseTotal } from "@/lib/buildSimpleFlow";
import UnitSelect from "@/components/UnitSelect";

let _seq = 300;
const uid = () => String(++_seq);
const UNIT_OPTIONS = ["원", "만원", "백만원"];

function RowActionButton({
  label,
  tone,
  onClick,
  children,
}: {
  label: string;
  tone: "green" | "red";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "green"
      ? "border-green-200 bg-green-50 text-green-700 hover:border-green-300 hover:bg-green-100 focus:ring-green-200"
      : "border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100 focus:ring-red-200";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid size-8 shrink-0 place-items-center rounded-lg border transition-colors focus:outline-none focus:ring-2 ${toneClass}`}
    >
      {children}
    </button>
  );
}

function PlusIcon() {
  return (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M12 5v14m7-7H5" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M6 12h12" />
    </svg>
  );
}

// ── 수입 행 ────────────────────────────────────────────────
function IncomeRow({
  item,
  onUpdate,
  onDelete,
}: {
  item: SimpleItem;
  onUpdate: (v: SimpleItem) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1 h-8 rounded-full shrink-0 bg-green-400" />
      <input
        type="text"
        value={item.name}
        onChange={(e) => onUpdate({ ...item, name: e.target.value })}
        placeholder="항목명"
        className="flex-1 min-w-0 px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-200 transition-shadow"
      />
      <input
        type="number"
        value={item.amount || ""}
        onChange={(e) => onUpdate({ ...item, amount: Math.max(0, Number(e.target.value) || 0) })}
        placeholder="0"
        className="w-24 shrink-0 px-2.5 py-1.5 text-sm text-right border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-200 transition-shadow tabular-nums"
      />
      <RowActionButton label="수입 항목 삭제" tone="red" onClick={onDelete}>
        <MinusIcon />
      </RowActionButton>
    </div>
  );
}

// ── 지출 트리 행 (재귀) ───────────────────────────────────
function ExpenseTreeRow({
  node,
  depth,
  unit,
  onUpdate,
  onDelete,
}: {
  node: ExpenseNode;
  depth: number;
  unit: string;
  onUpdate: (v: ExpenseNode) => void;
  onDelete: () => void;
}) {
  const hasChildren = node.children.length > 0;
  const total = getExpenseTotal(node);

  const addChild = () => {
    onUpdate({
      ...node,
      amount: 0, // 자식 있으면 직접 금액 무시
      children: [...node.children, { id: uid(), name: "", amount: 0, children: [] }],
    });
  };

  const updateChild = (idx: number, child: ExpenseNode) => {
    const next = [...node.children];
    next[idx] = child;
    onUpdate({ ...node, children: next });
  };

  const deleteChild = (idx: number) => {
    onUpdate({ ...node, children: node.children.filter((_, i) => i !== idx) });
  };

  // 들여쓰기 색상: depth 0=빨강, 1=주황, 2+=노랑
  const accentColors = ["#dc2626", "#f97316", "#eab308", "#94a3b8"];
  const accent = accentColors[Math.min(depth, accentColors.length - 1)];
  const indent = depth * 20;

  return (
    <div>
      {/* 이 노드 행 */}
      <div className="flex items-center gap-2" style={{ paddingLeft: indent }}>
        {/* 들여쓰기 인디케이터 */}
        {depth > 0 && (
          <div className="flex items-center shrink-0" style={{ marginLeft: -12 }}>
            <div className="w-3 h-px bg-gray-200" />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          </div>
        )}
        <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: accent }} />
        <input
          type="text"
          value={node.name}
          onChange={(e) => onUpdate({ ...node, name: e.target.value })}
          placeholder={depth === 0 ? "대분류 (예: 고정지출)" : "항목명"}
          className="flex-1 min-w-0 px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-100 transition-shadow"
        />

        {/* 금액: 자식이 없으면 직접 입력, 있으면 합산 표시 */}
        {hasChildren ? (
          <div className="w-24 shrink-0 px-2.5 py-1.5 text-sm text-right text-gray-400 tabular-nums bg-gray-50 border border-gray-100 rounded-lg">
            {total.toLocaleString()}
            <span className="text-xs ml-0.5">{unit}</span>
          </div>
        ) : (
          <input
            type="number"
            value={node.amount || ""}
            onChange={(e) => onUpdate({ ...node, amount: Math.max(0, Number(e.target.value) || 0) })}
            placeholder="0"
            className="w-24 shrink-0 px-2.5 py-1.5 text-sm text-right border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-100 transition-shadow tabular-nums"
          />
        )}

        {/* 하위 항목 추가 버튼 */}
        <RowActionButton label={`${node.name || "항목"} 하위 항목 추가`} tone="green" onClick={addChild}>
          <PlusIcon />
        </RowActionButton>

        {/* 삭제 버튼 */}
        <RowActionButton label={`${node.name || "항목"} 삭제`} tone="red" onClick={onDelete}>
          <MinusIcon />
        </RowActionButton>
      </div>

      {/* 자식 노드들 */}
      {node.children.map((child, i) => (
        <ExpenseTreeRow
          key={child.id}
          node={child}
          depth={depth + 1}
          unit={unit}
          onUpdate={(v) => updateChild(i, v)}
          onDelete={() => deleteChild(i)}
        />
      ))}
    </div>
  );
}

// ── SimpleEditor ─────────────────────────────────────────
interface Props {
  data: SimpleData;
  onChange: (d: SimpleData) => void;
}

export default function SimpleEditor({ data, onChange }: Props) {
  const availableUnitOptions = UNIT_OPTIONS.includes(data.unit) ? UNIT_OPTIONS : [data.unit, ...UNIT_OPTIONS];
  const totalIncome = data.incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpense = data.expenses.reduce((s, e) => s + getExpenseTotal(e), 0);
  const diff = totalIncome - totalExpense;

  // 수입
  const updateIncome = (idx: number, item: SimpleItem) => {
    const next = [...data.incomes];
    next[idx] = item;
    onChange({ ...data, incomes: next });
  };
  const deleteIncome = (idx: number) => onChange({ ...data, incomes: data.incomes.filter((_, i) => i !== idx) });
  const addIncome = () => onChange({ ...data, incomes: [...data.incomes, { id: uid(), name: "", amount: 0 }] });

  // 지출
  const updateExpense = (idx: number, node: ExpenseNode) => {
    const next = [...data.expenses];
    next[idx] = node;
    onChange({ ...data, expenses: next });
  };
  const deleteExpense = (idx: number) => onChange({ ...data, expenses: data.expenses.filter((_, i) => i !== idx) });
  const addExpense = () =>
    onChange({ ...data, expenses: [...data.expenses, { id: uid(), name: "", amount: 0, children: [] }] });

  return (
    <div className="space-y-6">
      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-500 shrink-0">단위</label>
          <UnitSelect
            value={data.unit}
            options={availableUnitOptions}
            onChange={(unit) => onChange({ ...data, unit })}
          />
        </div>
      </div>

      {/* 잔여 진행 바 */}
      {totalIncome > 0 && (
        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="text-gray-500">수입 대비 사용</span>
            <span className={`font-semibold tabular-nums ${
              diff > 0 ? "text-blue-600" : diff < 0 ? "text-red-500" : "text-green-600"
            }`}>
              {diff > 0
                ? `잔여 +${diff.toLocaleString()}${data.unit}`
                : diff < 0
                ? `초과 ${diff.toLocaleString()}${data.unit}`
                : "딱 맞음"}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                totalExpense > totalIncome ? "bg-red-400" : "bg-blue-400"
              }`}
              style={{ width: `${Math.min(100, totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-gray-400 tabular-nums">
            <span>0</span>
            <span>{totalIncome.toLocaleString()}{data.unit}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 수입 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-green-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              수입
            </h3>
            <span className="text-xs text-gray-400 tabular-nums">합계 {totalIncome.toLocaleString()}{data.unit}</span>
          </div>
          <div className="space-y-2">
            {data.incomes.map((item, i) => (
              <IncomeRow
                key={item.id}
                item={item}
                onUpdate={(v) => updateIncome(i, v)}
                onDelete={() => deleteIncome(i)}
              />
            ))}
          </div>
          <button
            onClick={addIncome}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-green-300 bg-green-50/60 py-2 text-sm font-medium text-green-700 transition-colors hover:border-green-400 hover:bg-green-100"
          >
            <PlusIcon />
            수입 항목 추가
          </button>
        </div>

        {/* 지출 트리 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-red-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              지출
            </h3>
            <span className="text-xs text-gray-400 tabular-nums">합계 {totalExpense.toLocaleString()}{data.unit}</span>
          </div>

          <div className="space-y-1.5">
            {data.expenses.map((node, i) => (
              <ExpenseTreeRow
                key={node.id}
                node={node}
                depth={0}
                unit={data.unit}
                onUpdate={(v) => updateExpense(i, v)}
                onDelete={() => deleteExpense(i)}
              />
            ))}
          </div>
          <button
            onClick={addExpense}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-red-300 bg-red-50/60 py-2 text-sm font-medium text-red-600 transition-colors hover:border-red-400 hover:bg-red-100"
          >
            <PlusIcon />
            지출 항목 추가
          </button>

          <p className="mt-3 text-xs text-gray-400 leading-relaxed">
            초록 + 버튼으로 하위 항목을 추가할 수 있습니다. 상위 항목의 금액은 하위 합산으로 자동 계산됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
