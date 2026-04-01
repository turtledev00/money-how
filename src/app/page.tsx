"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import SankeyDiagram from "@/components/SankeyDiagram";
import SimpleEditor from "@/components/SimpleEditor";
import { buildFlowData } from "@/lib/buildSimpleFlow";
import { downloadDiagramAsPng } from "@/lib/downloadDiagram";
import type { FlowData } from "@/lib/types";
import type { SimpleData } from "@/lib/buildSimpleFlow";

const EMPTY_SIMPLE: SimpleData = {
  title: "나의 흐름도",
  unit: "만원",
  incomes: [
    { id: "i1", name: "급여", amount: 0 },
  ],
  expenses: [
    {
      id: "e1", name: "고정지출", amount: 0, children: [
        { id: "e1a", name: "주거비", amount: 0, children: [] },
        { id: "e1b", name: "보험", amount: 0, children: [] },
      ],
    },
    { id: "e2", name: "생활비", amount: 0, children: [] },
    { id: "e3", name: "저축", amount: 0, children: [] },
  ],
};

function getTopicParticle(name: string) {
  const lastChar = name.trim().slice(-1);
  if (!lastChar) return "는";
  const code = lastChar.charCodeAt(0);
  const HANGUL_START = 0xac00;
  const HANGUL_END = 0xd7a3;
  if (code < HANGUL_START || code > HANGUL_END) return "는";
  const hasBatchim = (code - HANGUL_START) % 28 !== 0;
  return hasBatchim ? "은" : "는";
}

export default function Home() {
  const [simpleData, setSimpleData] = useState<SimpleData>(EMPTY_SIMPLE);
  const [downloading, setDownloading] = useState(false);
  const [subjectName, setSubjectName] = useState("나");
  const subjectParticle = getTopicParticle(subjectName);

  const pageTitle = `${subjectName}${subjectParticle} 어떻게 벌고 쓸까`;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadDiagramAsPng(pageTitle);
    } finally {
      setDownloading(false);
    }
  };

  // 최종적으로 Sankey에 넘길 데이터
  const data: FlowData = useMemo(() => buildFlowData(simpleData), [simpleData]);

  const totalIn = data.nodes
    .filter((n) => !data.links.some((l) => l.target === n.id))
    .reduce(
      (s, n) => s + data.links.filter((l) => l.source === n.id).reduce((ss, l) => ss + l.value, 0),
      0
    );

  const totalOut = data.nodes
    .filter((n) => !data.links.some((l) => l.source === n.id))
    .reduce(
      (s, n) => s + data.links.filter((l) => l.target === n.id).reduce((ss, l) => ss + l.value, 0),
      0
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <h1 className="text-lg font-bold text-slate-800 tracking-tight shrink-0">
            <span className="inline-flex items-center gap-2">
              <Image
                src="/ssseregi_logo.png"
                alt="SSSEREGI logo"
                width={18}
                height={18}
                className="rounded-sm"
              />
              <span>@SSSEREGI</span>
            </span>
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center justify-center gap-1 flex-wrap">
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setSubjectName(e.currentTarget.textContent?.trim() || "나")}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } }}
              className="min-w-8 px-1 rounded-md outline-none border-b-2 border-dashed border-slate-300 focus:border-slate-500 text-slate-700 transition-colors cursor-text"
              title="클릭해서 이름 편집"
            >
              {subjectName}
            </span>
            <span className="text-slate-900">
              {subjectParticle}
            </span>
            <span className="text-slate-900">어떻게 벌고 쓸까</span>
          </h2>
          <p className="mt-1.5 text-sm text-gray-400">이름을 클릭해서 바꿔보세요</p>
        </div>

        {/* Diagram Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-4 sm:p-6">
            <SankeyDiagram data={data} />
          </div>

          {/* Summary bar */}
          <div className="border-t border-gray-100 px-4 sm:px-6 py-3 flex flex-wrap gap-4 sm:gap-8 justify-center items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-gray-500">유입 합계</span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {totalIn.toLocaleString()}{data.unit}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-gray-500">유출 합계</span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {totalOut.toLocaleString()}{data.unit}
              </span>
            </div>
            {totalIn !== totalOut && totalIn > 0 && (
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${totalIn > totalOut ? "bg-blue-500" : "bg-orange-500"}`} />
                <span className="text-gray-500">{totalIn > totalOut ? "잔여" : "부족"}</span>
                <span className={`font-semibold tabular-nums ${totalIn > totalOut ? "text-blue-600" : "text-orange-600"}`}>
                  {totalIn > totalOut ? "+" : ""}
                  {(totalIn - totalOut).toLocaleString()}{data.unit}
                </span>
              </div>
            )}

            {/* 다운로드 버튼 */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="PNG로 저장"
            >
              {downloading ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              {downloading ? "저장 중…" : "PNG 저장"}
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 animate-in">
          <SimpleEditor data={simpleData} onChange={setSimpleData} />
        </div>
      </main>

      <footer className="mt-auto py-6 text-center text-xs text-gray-400">
        돈의 흐름을 한눈에 — 머니하우
      </footer>
    </div>
  );
}
