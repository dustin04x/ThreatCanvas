import { motion, AnimatePresence } from "framer-motion";
import { useSimulationStore } from "@/store/simulation-store";
import type { Severity } from "@/lib/simulation-engine";
import { Monitor, Globe, Server, Wifi, Zap } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const sevStroke: Record<Severity, string> = {
  normal: "hsl(140,70%,45%)",
  suspicious: "hsl(45,100%,55%)",
  malicious: "hsl(0,100%,60%)",
  user: "hsl(210,100%,60%)",
};

// Classify node type from name
type NodeType = "victim" | "c2" | "dns" | "server" | "network";
const classifyNode = (name: string): NodeType => {
  const n = name.toLowerCase();
  if (n.includes("victim") || n.includes("10.0")) return "victim";
  if (n.includes("c2") || n.includes("command") || n.includes("185.")) return "c2";
  if (n.includes("dns")) return "dns";
  if (n.includes("mail") || n.includes("smtp")) return "server";
  return "server";
};

const nodeIcon = (type: NodeType) => {
  switch (type) {
    case "victim": return <Monitor size={14} />;
    case "c2": return <Server size={14} />;
    case "dns": return <Globe size={14} />;
    case "server": return <Wifi size={14} />;
    default: return <Server size={14} />;
  }
};

const nodeTypeLabel = (type: NodeType) => {
  switch (type) {
    case "victim": return "LOCAL DEVICE";
    case "c2": return "C2 SERVER";
    case "dns": return "DNS";
    case "server": return "REMOTE";
    default: return "HOST";
  }
};

interface NetNode {
  name: string;
  type: NodeType;
  cx: number;
  cy: number;
  severity: Severity;
  port?: number;
  protocol?: string;
}

interface NetEdge {
  from: string;
  to: string;
  label: string;
  severity: Severity;
  id: string;
  protocol?: string;
  port?: number;
}

const NetworkGraph = () => {
  const { visibleEvents, setSelectedEvent } = useSimulationStore();
  const networkEvents = visibleEvents.filter((e) => e.networkInfo);

  // Deterministic layout
  const nodes = new Map<string, NetNode>();
  const edges: NetEdge[] = [];

  // Always show victim on the left
  nodes.set("Victim PC", { name: "Victim PC", type: "victim", cx: 18, cy: 50, severity: "normal" });

  const remotePositions = [
    { cx: 78, cy: 22 },
    { cx: 82, cy: 50 },
    { cx: 78, cy: 78 },
    { cx: 55, cy: 15 },
    { cx: 55, cy: 85 },
  ];
  let remoteIdx = 0;

  networkEvents.forEach((evt) => {
    const ni = evt.networkInfo!;
    const src = ni.source.includes("Victim") || ni.source.includes("10.0") ? "Victim PC" : ni.source;
    const dst = ni.destination;

    if (!nodes.has(src) && src !== "Victim PC") {
      const pos = remotePositions[remoteIdx % remotePositions.length];
      remoteIdx++;
      nodes.set(src, { name: src, type: classifyNode(src), cx: pos.cx, cy: pos.cy, severity: evt.severity, port: ni.port, protocol: ni.protocol });
    }
    if (!nodes.has(dst)) {
      const pos = remotePositions[remoteIdx % remotePositions.length];
      remoteIdx++;
      nodes.set(dst, { name: dst, type: classifyNode(dst), cx: pos.cx, cy: pos.cy, severity: evt.severity, port: ni.port, protocol: ni.protocol });
    }

    // Update severity
    const srcNode = nodes.get(src);
    if (srcNode && evt.severity === "malicious") srcNode.severity = "malicious";
    const dstNode = nodes.get(dst);
    if (dstNode && evt.severity === "malicious") dstNode.severity = "malicious";

    const edgeKey = `${src}->${dst}`;
    if (!edges.find((e) => e.id === edgeKey)) {
      edges.push({ from: src, to: dst, label: `${ni.protocol || "TCP"}:${ni.port || "?"}`, severity: evt.severity, id: edgeKey, protocol: ni.protocol, port: ni.port });
    }
  });

  return (
    <div className="h-full relative overflow-hidden bg-card">
      {/* Header */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <Wifi size={12} className="text-primary" />
        <h3 className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">Network Graph</h3>
      </div>
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/50 border border-border">
        <span className={`w-1.5 h-1.5 rounded-full ${networkEvents.length > 0 ? "bg-destructive animate-pulse" : "bg-muted-foreground"}`} />
        <span className="text-[9px] font-mono text-muted-foreground">{edges.length} connections</span>
      </div>

      <svg viewBox="0 0 100 100" className="w-full h-full pt-6" preserveAspectRatio="xMidYMid slice">
        <defs>
          {(["normal", "suspicious", "malicious", "user"] as Severity[]).map((s) => (
            <filter key={s} id={`net-glow-${s}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
              <feFlood floodColor={sevStroke[s]} floodOpacity="0.5" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="shadow" />
              <feMerge>
                <feMergeNode in="shadow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          <pattern id="net-grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <line x1="5" y1="0" x2="5" y2="5" stroke="hsl(220,15%,14%)" strokeWidth="0.12" />
            <line x1="0" y1="5" x2="5" y2="5" stroke="hsl(220,15%,14%)" strokeWidth="0.12" />
          </pattern>
        </defs>

        <rect width="100" height="100" fill="url(#net-grid)" opacity="0.5" />

        {/* Edges */}
        {edges.map((edge, i) => {
          const from = nodes.get(edge.from);
          const to = nodes.get(edge.to);
          if (!from || !to) return null;
          const color = sevStroke[edge.severity];
          const midX = (from.cx + to.cx) / 2;
          const midY = (from.cy + to.cy) / 2;
          // Slight curve offset
          const dx = to.cx - from.cx;
          const dy = to.cy - from.cy;
          const curveX = midX - dy * 0.08;
          const curveY = midY + dx * 0.08;
          const path = `M${from.cx},${from.cy} Q${curveX},${curveY} ${to.cx},${to.cy}`;

          return (
            <g key={edge.id}>
              {/* Glow line */}
              <path d={path} fill="none" stroke={color} strokeWidth="1" opacity="0.1" filter={`url(#net-glow-${edge.severity})`} />
              {/* Main line */}
              <path d={path} fill="none" stroke={color} strokeWidth="0.35" strokeDasharray="2 1.5" opacity="0.7">
                <animate attributeName="stroke-dashoffset" from="7" to="0" dur="1s" repeatCount="indefinite" />
              </path>

              {/* Protocol + Port label */}
              <g>
                <rect
                  x={curveX - 7} y={curveY - 2.5}
                  width="14" height="5" rx="1"
                  fill="hsl(220,18%,8%)" stroke={color} strokeWidth="0.2" opacity="0.9"
                />
                <text x={curveX} y={curveY - 0.2} textAnchor="middle" fontSize="2" fill={color} fontFamily="'JetBrains Mono', monospace" fontWeight="500">
                  {edge.protocol || "TCP"}
                </text>
                <text x={curveX} y={curveY + 2} textAnchor="middle" fontSize="1.8" fill="hsl(220,10%,55%)" fontFamily="'JetBrains Mono', monospace">
                  PORT {edge.port || "?"}
                </text>
              </g>

              {/* Animated packet */}
              <circle r="0.7" fill={color} opacity="0.9" filter={`url(#net-glow-${edge.severity})`}>
                <animateMotion dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" path={path} />
              </circle>
              <circle r="1.8" fill={color} opacity="0.1">
                <animateMotion dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" path={path} />
              </circle>
            </g>
          );
        })}

        {/* Nodes */}
        {Array.from(nodes.entries()).map(([name, node]) => {
          const color = sevStroke[node.severity];
          const isVictim = node.type === "victim";
          const r = isVictim ? 8 : 6.5;

          return (
            <g key={name}>
              {/* Pulse ring */}
              <circle cx={node.cx} cy={node.cy} r={r} fill="none" stroke={color} strokeWidth="0.25" opacity="0">
                <animate attributeName="r" from={r} to={r + 4} dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.4" to="0" dur="2.5s" repeatCount="indefinite" />
              </circle>

              {/* Outer ring */}
              <circle cx={node.cx} cy={node.cy} r={r} fill={`${color.replace(")", ",0.06)")}`}
                stroke={color} strokeWidth="0.4" filter={`url(#net-glow-${node.severity})`} />

              {/* Inner ring */}
              <circle cx={node.cx} cy={node.cy} r={r - 1.8}
                fill="hsl(220,18%,8%)" stroke={color} strokeWidth="0.15" strokeDasharray="1 0.8" opacity="0.6" />

              {/* Type label above */}
              <text x={node.cx} y={node.cy - r - 2.5} textAnchor="middle" fontSize="1.8"
                fill={color} fontFamily="'JetBrains Mono', monospace" fontWeight="600" letterSpacing="0.15" opacity="0.8">
                {nodeTypeLabel(node.type)}
              </text>

              {/* Name below */}
              <text x={node.cx} y={node.cy + r + 3.5} textAnchor="middle" fontSize="2.4"
                fill="hsl(180,10%,85%)" fontFamily="'JetBrains Mono', monospace" fontWeight="500">
                {name.length > 18 ? name.slice(0, 18) + "…" : name}
              </text>

              {/* IP / detail line */}
              {node.type !== "victim" && (
                <text x={node.cx} y={node.cy + r + 6} textAnchor="middle" fontSize="1.8"
                  fill="hsl(220,10%,45%)" fontFamily="'JetBrains Mono', monospace">
                  {node.port ? `Port ${node.port}` : ""}
                </text>
              )}
            </g>
          );
        })}

        {/* Icons via foreignObject */}
        {Array.from(nodes.entries()).map(([name, node]) => {
          const sevClass = node.severity === "malicious" ? "text-destructive" : node.severity === "suspicious" ? "text-warning" : node.type === "victim" ? "text-info" : "text-foreground/70";
          return (
            <foreignObject key={`icon-${name}`}
              x={node.cx - 2.5} y={node.cy - 2.5} width="5" height="5"
              className={`pointer-events-none ${sevClass}`}>
              <div className="w-full h-full flex items-center justify-center">
                {nodeIcon(node.type)}
              </div>
            </foreignObject>
          );
        })}
      </svg>

      {networkEvents.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/50 gap-2">
          <Wifi size={20} className="opacity-30" />
          <p className="text-xs font-mono italic">No network activity yet...</p>
        </div>
      )}

      {/* Corner accents */}
      <div className="absolute bottom-0 right-0 w-16 h-16 border-r border-b border-primary/10 pointer-events-none" />
      <div className="absolute top-0 left-0 w-16 h-16 border-l border-t border-primary/10 pointer-events-none" />
    </div>
  );
};

export default NetworkGraph;
