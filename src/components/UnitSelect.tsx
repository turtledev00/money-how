"use client";

import React, { useEffect, useId, useRef, useState } from "react";

const UNIT_DESCRIPTIONS: Record<string, string> = {
  원: "세부 금액",
  만원: "월 예산",
  백만원: "큰 흐름",
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`size-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="m5 13 4 4L19 7" />
    </svg>
  );
}

export default function UnitSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    if (!open) return;

    const closeOnPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
        className="flex min-w-32 items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
      >
        <span className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
            ₩
          </span>
          {value}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl shadow-slate-200/70"
        >
          {options.map((unit) => {
            const selected = unit === value;

            return (
              <button
                key={unit}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(unit);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
                  selected ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                    selected ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  ₩
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{unit}</span>
                  <span className={`block text-xs ${selected ? "text-white/70" : "text-gray-400"}`}>
                    {UNIT_DESCRIPTIONS[unit] ?? "사용자 단위"}
                  </span>
                </span>
                <span className={selected ? "text-white" : "text-transparent"}>
                  <CheckIcon />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
