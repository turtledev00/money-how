"use client";

import React from "react";
import type { Category, FinancialData } from "@/lib/types";

interface Props {
  data: FinancialData;
  onChange: (data: FinancialData) => void;
}

const UNIT_OPTIONS = ["원", "만원", "백만원"];

function CategoryRow({
  category,
  onUpdate,
  onDelete,
  accentColor,
}: {
  category: Category;
  onUpdate: (c: Category) => void;
  onDelete: () => void;
  accentColor: string;
}) {
  return (
    <div className="flex items-center gap-2 group">
      <div
        className="w-1 h-8 rounded-full shrink-0"
        style={{ backgroundColor: accentColor }}
      />
      <input
        type="text"
        value={category.name}
        onChange={(e) => onUpdate({ ...category, name: e.target.value })}
        placeholder="항목명"
        className="flex-1 min-w-0 px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent transition-shadow"
      />
      <div className="relative shrink-0">
        <input
          type="number"
          value={category.amount || ""}
          onChange={(e) =>
            onUpdate({
              ...category,
              amount: Math.max(0, Number(e.target.value) || 0),
            })
          }
          placeholder="0"
          className="w-24 px-2.5 py-1.5 text-sm text-right border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent transition-shadow tabular-nums"
        />
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all shrink-0"
        title="삭제"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

let nextId = 100;
function genId() {
  return String(++nextId);
}

export default function DataEditor({ data, onChange }: Props) {
  const availableUnitOptions = UNIT_OPTIONS.includes(data.unit) ? UNIT_OPTIONS : [data.unit, ...UNIT_OPTIONS];

  const totalIncome = data.incomes.reduce((s, c) => s + c.amount, 0);
  const totalExpense = data.expenses.reduce((s, c) => s + c.amount, 0);

  const updateIncome = (idx: number, c: Category) => {
    const next = [...data.incomes];
    next[idx] = c;
    onChange({ ...data, incomes: next });
  };

  const deleteIncome = (idx: number) => {
    onChange({ ...data, incomes: data.incomes.filter((_, i) => i !== idx) });
  };

  const addIncome = () => {
    onChange({
      ...data,
      incomes: [...data.incomes, { id: genId(), name: "", amount: 0 }],
    });
  };

  const updateExpense = (idx: number, c: Category) => {
    const next = [...data.expenses];
    next[idx] = c;
    onChange({ ...data, expenses: next });
  };

  const deleteExpense = (idx: number) => {
    onChange({ ...data, expenses: data.expenses.filter((_, i) => i !== idx) });
  };

  const addExpense = () => {
    onChange({
      ...data,
      expenses: [...data.expenses, { id: genId(), name: "", amount: 0 }],
    });
  };

  const diff = totalIncome - totalExpense;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Meta */}
      <div className="md:col-span-2 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-500">단위</label>
          <select
            value={data.unit}
            onChange={(e) => onChange({ ...data, unit: e.target.value })}
            className="w-28 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 transition-shadow"
          >
            {availableUnitOptions.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto text-sm">
          {diff > 0 && (
            <span className="text-blue-600 font-medium">
              잔여 +{diff.toLocaleString()}
              {data.unit}
            </span>
          )}
          {diff < 0 && (
            <span className="text-red-500 font-medium">
              부족 {diff.toLocaleString()}
              {data.unit}
            </span>
          )}
          {diff === 0 && totalIncome > 0 && (
            <span className="text-green-600 font-medium">균형</span>
          )}
        </div>
      </div>

      {/* Income Column */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-green-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            수입
          </h3>
          <span className="text-xs text-gray-400 tabular-nums">
            합계 {totalIncome.toLocaleString()}
            {data.unit}
          </span>
        </div>
        <div className="space-y-2">
          {data.incomes.map((inc, i) => (
            <CategoryRow
              key={inc.id}
              category={inc}
              onUpdate={(c) => updateIncome(i, c)}
              onDelete={() => deleteIncome(i)}
              accentColor="#22c55e"
            />
          ))}
        </div>
        <button
          onClick={addIncome}
          className="mt-3 w-full py-2 text-sm text-green-600 border border-dashed border-green-300 rounded-lg hover:bg-green-50 transition-colors"
        >
          + 수입 항목 추가
        </button>
      </div>

      {/* Expense Column */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-red-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            지출
          </h3>
          <span className="text-xs text-gray-400 tabular-nums">
            합계 {totalExpense.toLocaleString()}
            {data.unit}
          </span>
        </div>
        <div className="space-y-2">
          {data.expenses.map((exp, i) => (
            <CategoryRow
              key={exp.id}
              category={exp}
              onUpdate={(c) => updateExpense(i, c)}
              onDelete={() => deleteExpense(i)}
              accentColor="#ef4444"
            />
          ))}
        </div>
        <button
          onClick={addExpense}
          className="mt-3 w-full py-2 text-sm text-red-500 border border-dashed border-red-300 rounded-lg hover:bg-red-50 transition-colors"
        >
          + 지출 항목 추가
        </button>
      </div>
    </div>
  );
}
