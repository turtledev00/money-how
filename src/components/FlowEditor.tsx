"use client";

import React, { useState } from "react";
import type { FlowData, FlowNode, FlowLink } from "@/lib/types";

const PRESET_COLORS = [
  "#22c55e", "#16a34a", "#3b82f6", "#6366f1", "#f97316",
  "#ef4444", "#dc2626", "#b91c1c", "#eab308", "#0ea5e9",
  "#8b5cf6", "#ec4899", "#14b8a6", "#64748b", "#78716c",
];

const UNIT_OPTIONS = ["원", "만원", "백만원"];

let _seq = 200;
const uid = () => String(++_seq);

function ColorDot({
  color,
  onChange,
}: {
  color: string;
  onChange: (c: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-5 h-5 rounded-full border-2 border-white shadow-sm shrink-0"
        style={{ backgroundColor: color }}
        title="색상 선택"
      />
      {open && (
        <div className="absolute z-20 top-7 left-0 bg-white rounded-xl shadow-lg border border-gray-100 p-2 grid grid-cols-5 gap-1.5 w-36">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { onChange(c); setOpen(false); }}
              className="w-5 h-5 rounded-full hover:scale-110 transition-transform"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  data: FlowData;
  onChange: (d: FlowData) => void;
}

export default function FlowEditor({ data, onChange }: Props) {
  const availableUnitOptions = UNIT_OPTIONS.includes(data.unit) ? UNIT_OPTIONS : [data.unit, ...UNIT_OPTIONS];

  const updateNode = (idx: number, node: FlowNode) => {
    const next = [...data.nodes];
    next[idx] = node;
    onChange({ ...data, nodes: next });
  };

  const deleteNode = (id: string) => {
    onChange({
      ...data,
      nodes: data.nodes.filter((n) => n.id !== id),
      links: data.links.filter((l) => l.source !== id && l.target !== id),
    });
  };

  const addNode = () => {
    const id = `node-${uid()}`;
    onChange({
      ...data,
      nodes: [
        ...data.nodes,
        { id, name: "새 항목", color: PRESET_COLORS[data.nodes.length % PRESET_COLORS.length] },
      ],
    });
  };

  const updateLink = (idx: number, link: FlowLink) => {
    const next = [...data.links];
    next[idx] = link;
    onChange({ ...data, links: next });
  };

  const deleteLink = (id: string) => {
    onChange({ ...data, links: data.links.filter((l) => l.id !== id) });
  };

  const addLink = () => {
    if (data.nodes.length < 2) return;
    onChange({
      ...data,
      links: [
        ...data.links,
        {
          id: `link-${uid()}`,
          source: data.nodes[0].id,
          target: data.nodes[1].id,
          value: 0,
        },
      ],
    });
  };

  const nodeMap = Object.fromEntries(data.nodes.map((n) => [n.id, n.name]));

  return (
    <div className="space-y-8">
      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nodes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">노드 (항목)</h3>
            <span className="text-xs text-gray-400">{data.nodes.length}개</span>
          </div>

          <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
            {data.nodes.map((node, i) => (
              <div key={node.id} className="flex items-center gap-2 group">
                <ColorDot
                  color={node.color ?? "#94a3b8"}
                  onChange={(c) => updateNode(i, { ...node, color: c })}
                />
                <input
                  type="text"
                  value={node.name}
                  onChange={(e) => updateNode(i, { ...node, name: e.target.value })}
                  placeholder="노드명"
                  className="flex-1 min-w-0 px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 transition-shadow"
                />
                <span className="text-xs text-gray-300 font-mono hidden sm:block shrink-0 w-20 truncate">
                  {node.id}
                </span>
                <button
                  onClick={() => deleteNode(node.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addNode}
            className="mt-3 w-full py-2 text-sm text-slate-600 border border-dashed border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            + 노드 추가
          </button>
        </div>

        {/* Links */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">링크 (흐름)</h3>
            <span className="text-xs text-gray-400">{data.links.length}개</span>
          </div>

          <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
            {data.links.map((link, i) => (
              <div key={link.id} className="flex items-center gap-1.5 group">
                <select
                  value={link.source}
                  onChange={(e) => updateLink(i, { ...link, source: e.target.value })}
                  className="flex-1 min-w-0 px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 transition-shadow"
                >
                  {data.nodes.map((n) => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
                <span className="text-gray-300 text-xs shrink-0">→</span>
                <select
                  value={link.target}
                  onChange={(e) => updateLink(i, { ...link, target: e.target.value })}
                  className="flex-1 min-w-0 px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 transition-shadow"
                >
                  {data.nodes.map((n) => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={link.value || ""}
                  onChange={(e) =>
                    updateLink(i, { ...link, value: Math.max(0, Number(e.target.value) || 0) })
                  }
                  placeholder="0"
                  className="w-20 shrink-0 px-2 py-1.5 text-xs text-right border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 transition-shadow tabular-nums"
                />
                <button
                  onClick={() => deleteLink(link.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addLink}
            disabled={data.nodes.length < 2}
            className="mt-3 w-full py-2 text-sm text-slate-600 border border-dashed border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + 링크 추가
          </button>
        </div>
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-400 leading-relaxed">
        <span className="font-medium text-gray-500">노드</span>는 항목(급여, 식비 등),{" "}
        <span className="font-medium text-gray-500">링크</span>는 노드 간 흐름입니다.
        순환 링크(A→B→A)는 지원하지 않습니다. 링크의 <span className="font-medium text-gray-500">출처(source)</span>가
        왼쪽, <span className="font-medium text-gray-500">목적지(target)</span>가 오른쪽에 배치됩니다.
        노드명에 줄바꿈을 넣으려면 {" "}
        <code className="bg-gray-100 px-1 rounded text-xs">{"\\n"}</code> 대신 실제 개행을 넣거나
        데이터를 직접 수정하세요.
        현재 편집 중인 링크의 노드: {Object.values(nodeMap).join(", ")}
      </p>
    </div>
  );
}
