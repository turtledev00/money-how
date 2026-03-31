"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { sankey as sankeyGenerator, sankeyLeft } from "d3-sankey";
import type { FlowData } from "@/lib/types";

function bandPath(link: {
  source: { x1: number };
  target: { x0: number };
  y0: number;
  y1: number;
  width: number;
}): string {
  const sx = link.source.x1;
  const tx = link.target.x0;
  const sy0 = link.y0 - link.width / 2;
  const sy1 = link.y0 + link.width / 2;
  const ty0 = link.y1 - link.width / 2;
  const ty1 = link.y1 + link.width / 2;
  const xi = (tx - sx) * 0.5;
  return [
    `M${sx},${sy0}`,
    `C${sx + xi},${sy0} ${tx - xi},${ty0} ${tx},${ty0}`,
    `L${tx},${ty1}`,
    `C${tx - xi},${ty1} ${sx + xi},${sy1} ${sx},${sy1}`,
    "Z",
  ].join(" ");
}

interface Props {
  data: FlowData;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SNode = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SLink = any;

export default function SankeyDiagram({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 900, height: 540 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      const h = Math.max(400, Math.min(700, w * 0.58));
      setDims({ width: w, height: h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const graph = useMemo(() => {
    if (!data.nodes.length || !data.links.length) return null;

    const nodeCount = data.nodes.length;
    const pad = Math.max(6, Math.min(16, (dims.height * 0.7) / nodeCount));
    const margin = { top: 24, right: 160, bottom: 24, left: 160 };

    const layout = sankeyGenerator<SNode, SLink>()
      .nodeId((d: SNode) => d.id)
      .nodeWidth(14)
      .nodePadding(pad)
      .nodeAlign(sankeyLeft)
      .extent([
        [margin.left, margin.top],
        [dims.width - margin.right, dims.height - margin.bottom],
      ]);

    const nodes = data.nodes.map((n) => ({ ...n }));
    const links = data.links.map((l) => ({ ...l }));

    try {
      return layout({ nodes, links });
    } catch {
      return null;
    }
  }, [data, dims]);

  if (!graph) {
    return (
      <div
        ref={containerRef}
        className="w-full h-64 flex items-center justify-center text-gray-400 text-sm"
      >
        데이터를 입력하거나 노드/링크를 추가해주세요
      </div>
    );
  }

  // connected node ids for a given hovered node/link
  const getConnectedIds = (id: string): Set<string> => {
    const ids = new Set<string>();
    ids.add(id);
    for (const link of graph.links) {
      const src = link.source as SNode;
      const tgt = link.target as SNode;
      if (src.id === id || tgt.id === id) {
        ids.add(src.id);
        ids.add(tgt.id);
        ids.add(`link-${link.index}`);
      }
    }
    return ids;
  };

  const connectedIds = hoveredId ? getConnectedIds(hoveredId) : null;

  const isActive = (key: string) => {
    if (!connectedIds) return true;
    return connectedIds.has(key);
  };

  return (
    <div ref={containerRef} className="w-full overflow-x-auto">
      <svg
        id="sankey-svg"
        width={dims.width}
        height={dims.height}
        className="select-none"
        style={{ minWidth: 480 }}
      >
        <defs>
          {graph.links.map((link: SLink, i: number) => {
            const src = link.source as SNode;
            const tgt = link.target as SNode;
            return (
              <linearGradient
                key={i}
                id={`lg-${i}`}
                gradientUnits="userSpaceOnUse"
                x1={src.x1}
                y1={0}
                x2={tgt.x0}
                y2={0}
              >
                <stop offset="0%" stopColor={src.color ?? "#94a3b8"} />
                <stop offset="100%" stopColor={tgt.color ?? "#94a3b8"} />
              </linearGradient>
            );
          })}
        </defs>

        {/* Links */}
        <g>
          {graph.links.map((link: SLink, i: number) => {
            const key = `link-${link.index ?? i}`;
            const active = isActive(key);
            return (
              <path
                key={i}
                d={bandPath(link)}
                fill={`url(#lg-${i})`}
                fillOpacity={active ? 0.65 : 0.12}
                stroke="none"
                onMouseEnter={() => setHoveredId(key)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ transition: "fill-opacity 0.18s", cursor: "default" }}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {graph.nodes.map((node: SNode) => {
            const h = Math.max(3, node.y1 - node.y0);
            const cx = (node.x0 + node.x1) / 2;
            const cy = (node.y0 + node.y1) / 2;
            const active = isActive(node.id);
            const nodeColor = node.color ?? "#94a3b8";

            // determine if last column (no outgoing links)
            const hasOut = graph.links.some(
              (l: SLink) => (l.source as SNode).id === node.id
            );
            const hasIn = graph.links.some(
              (l: SLink) => (l.target as SNode).id === node.id
            );
            const isFirst = !hasIn;
            const isLast = !hasOut;

            // total value for this node
            const nodeValue = isFirst
              ? graph.links
                  .filter((l: SLink) => (l.source as SNode).id === node.id)
                  .reduce((s: number, l: SLink) => s + l.value, 0)
              : graph.links
                  .filter((l: SLink) => (l.target as SNode).id === node.id)
                  .reduce((s: number, l: SLink) => s + l.value, 0);

            const nameParts = node.name.split("\n");

            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ cursor: "default" }}
                opacity={active ? 1 : 0.2}
              >
                <rect
                  x={node.x0}
                  y={node.y0}
                  width={node.x1 - node.x0}
                  height={h}
                  fill={nodeColor}
                  rx={3}
                />

                {/* Left-side labels (first column) */}
                {isFirst && (
                  <g>
                    <text
                      x={node.x0 - 10}
                      y={cy - (nameParts.length > 1 ? 10 : 6)}
                      textAnchor="end"
                      fontSize={12}
                      fontWeight={700}
                      fill="#1e293b"
                    >
                      {nameParts[0]}
                    </text>
                    {nameParts[1] && (
                      <text
                        x={node.x0 - 10}
                        y={cy + 4}
                        textAnchor="end"
                        fontSize={12}
                        fontWeight={700}
                        fill="#1e293b"
                      >
                        {nameParts[1]}
                      </text>
                    )}
                    <text
                      x={node.x0 - 10}
                      y={cy + (nameParts.length > 1 ? 18 : 8)}
                      textAnchor="end"
                      fontSize={11}
                      fill="#64748b"
                    >
                      {nodeValue.toLocaleString()}{data.unit}
                    </text>
                  </g>
                )}

                {/* Right-side labels (last column) */}
                {isLast && (
                  <g>
                    <text
                      x={node.x1 + 10}
                      y={cy - (nameParts.length > 1 ? 10 : 6)}
                      textAnchor="start"
                      fontSize={12}
                      fontWeight={700}
                      fill="#1e293b"
                    >
                      {nameParts[0]}
                    </text>
                    {nameParts[1] && (
                      <text
                        x={node.x1 + 10}
                        y={cy + 4}
                        textAnchor="start"
                        fontSize={12}
                        fontWeight={700}
                        fill="#1e293b"
                      >
                        {nameParts[1]}
                      </text>
                    )}
                    <text
                      x={node.x1 + 10}
                      y={cy + (nameParts.length > 1 ? 18 : 8)}
                      textAnchor="start"
                      fontSize={11}
                      fill="#64748b"
                    >
                      {nodeValue.toLocaleString()}{data.unit}
                    </text>
                  </g>
                )}

                {/* Middle nodes */}
                {!isFirst && !isLast && (
                  <g>
                    <text
                      x={cx}
                      y={node.y0 - 14}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight={700}
                      fill="#1e293b"
                    >
                      {nameParts[0]}
                    </text>
                    {nameParts[1] && (
                      <text
                        x={cx}
                        y={node.y0 - 3}
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight={700}
                        fill="#1e293b"
                      >
                        {nameParts[1]}
                      </text>
                    )}
                    <text
                      x={cx}
                      y={node.y1 + 13}
                      textAnchor="middle"
                      fontSize={10}
                      fill="#94a3b8"
                    >
                      {nodeValue.toLocaleString()}{data.unit}
                    </text>
                  </g>
                )}

              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
