import { motion, AnimatePresence } from "framer-motion";
import { useSimulationStore } from "@/store/simulation-store";
import type { SimulationEvent, Severity } from "@/lib/simulation-engine";
import { Shield, Cpu, HardDrive, Network, Globe, User, Database, Zap } from "lucide-react";
import { useEffect, useState } from "react";

// ── Color helpers ──────────────────────────────────────────
const sevStroke: Record<Severity, string> = {
  normal: "hsl(140,70%,45%)",
  suspicious: "hsl(45,100%,55%)",
  malicious: "hsl(0,100%,60%)",
  user: "hsl(210,100%,60%)",
};
const sevFill: Record<Severity, string> = {
  normal: "hsl(140,70%,45%,0.08)",
  suspicious: "hsl(45,100%,55%,0.08)",
  malicious: "hsl(0,100%,60%,0.1)",
  user: "hsl(210,100%,60%,0.08)",
};
const sevTextClass: Record<Severity, string> = {
  normal: "text-safe",
  suspicious: "text-warning",
  malicious: "text-destructive",
  user: "text-info",
};

// ── Node definitions ──────────────────────────────────────
interface NodeDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  cx: number;
  cy: number;
  r: number;
  ring?: boolean; // outer ring node (internet)
}

const nodeDefs: NodeDef[] = [
  { id: "internet",   label: "Internet",   icon: <Globe size={20} />,    cx: 50, cy: 8,  r: 22, ring: true },
  { id: "network",    label: "Network",    icon: <Network size={18} />,  cx: 50, cy: 28, r: 18 },
  { id: "user",       label: "User",       icon: <User size={18} />,     cx: 16, cy: 44, r: 18 },
  { id: "computer",   label: "Computer",   icon: <Cpu size={22} />,      cx: 50, cy: 50, r: 26 },
  { id: "processes",  label: "Processes",  icon: <Shield size={16} />,   cx: 26, cy: 78, r: 18 },
  { id: "filesystem", label: "Filesystem", icon: <HardDrive size={16} />,cx: 50, cy: 86, r: 18 },
  { id: "registry",   label: "Registry",   icon: <Database size={16} />, cx: 74, cy: 78, r: 18 },
];

const edgeDefs: [string, string][] = [
  ["internet", "network"],
  ["network", "computer"],
  ["user", "computer"],
  ["computer", "processes"],
  ["computer", "filesystem"],
  ["computer", "registry"],
];

// ── Particle along edge ──────────────────────────────────
interface Particle { id: string; from: string; to: string; severity: Severity; }

// ── Derive active state from events ──────────────────────
const getActiveNodes = (events: SimulationEvent[]) => {
  const active = new Set<string>();
  const sev = new Map<string, Severity>();
  const set = (n: string, s: Severity) => {
    active.add(n);
    const cur = sev.get(n);
    if (!cur || s === "malicious" || (s === "suspicious" && cur !== "malicious")) sev.set(n, s);
  };
  events.forEach((e) => {
    if (e.networkInfo) { set("network", e.severity); set("internet", e.severity); }
    if (e.processInfo) set("processes", e.severity);
    if (e.fileInfo) set("filesystem", e.severity);
    if (e.type === "registry_modify" || e.type === "persistence") set("registry", e.severity);
    if (e.type === "user_action") set("user", e.severity);
    set("computer", e.severity);
  });
  return { active, sev };
};

const getActiveEdges = (events: SimulationEvent[]) => {
  const edges = new Set<string>();
  const sev = new Map<string, Severity>();
  const mark = (a: string, b: string, s: Severity) => {
    const key = `${a}-${b}`;
    edges.add(key);
    const cur = sev.get(key);
    if (!cur || s === "malicious") sev.set(key, s);
  };
  events.forEach((e) => {
    if (e.networkInfo) { mark("internet", "network", e.severity); mark("network", "computer", e.severity); }
    if (e.processInfo) mark("computer", "processes", e.severity);
    if (e.fileInfo) mark("computer", "filesystem", e.severity);
    if (e.type === "registry_modify" || e.type === "persistence") mark("computer", "registry", e.severity);
    if (e.type === "user_action") mark("user", "computer", e.severity);
  });
  return { edges, sev };
};

// ── SVG-based System Map ──────────────────────────────────
const SystemMap = () => {
  const { visibleEvents, selectedEvent, setSelectedEvent } = useSimulationStore();
  const { active, sev } = getActiveNodes(visibleEvents);
  const { edges: activeEdges, sev: edgeSev } = getActiveEdges(visibleEvents);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Spawn particles when new events arrive
  useEffect(() => {
    if (visibleEvents.length === 0) { setParticles([]); return; }
    const latest = visibleEvents[visibleEvents.length - 1];
    const newP: Particle[] = [];
    if (latest.networkInfo) {
      newP.push({ id: `p-${latest.id}-1`, from: "internet", to: "network", severity: latest.severity });
      newP.push({ id: `p-${latest.id}-2`, from: "network", to: "computer", severity: latest.severity });
    }
    if (latest.processInfo) newP.push({ id: `p-${latest.id}-3`, from: "computer", to: "processes", severity: latest.severity });
    if (latest.fileInfo) newP.push({ id: `p-${latest.id}-4`, from: "computer", to: "filesystem", severity: latest.severity });
    if (latest.type === "persistence" || latest.type === "registry_modify")
      newP.push({ id: `p-${latest.id}-5`, from: "computer", to: "registry", severity: latest.severity });
    if (latest.type === "user_action") newP.push({ id: `p-${latest.id}-6`, from: "user", to: "computer", severity: latest.severity });

    if (newP.length) {
      setParticles((prev) => [...prev.slice(-12), ...newP]);
      setTimeout(() => setParticles((prev) => prev.filter((p) => !newP.find((n) => n.id === p.id))), 2000);
    }
  }, [visibleEvents.length]);

  const nodeMap = new Map(nodeDefs.map((n) => [n.id, n]));

  const isNodeActive = (id: string) => active.has(id);
  const nodeSev = (id: string): Severity => sev.get(id) || "normal";
  const isEdgeActive = (a: string, b: string) => activeEdges.has(`${a}-${b}`) || activeEdges.has(`${b}-${a}`);
  const getEdgeSev = (a: string, b: string): Severity => edgeSev.get(`${a}-${b}`) || edgeSev.get(`${b}-${a}`) || "normal";

  return (
    <div className="relative w-full h-full min-h-[360px] overflow-hidden bg-card">
      {/* Title */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <Zap size={12} className="text-primary" />
        <h3 className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">System Map</h3>
      </div>

      {/* Live event count */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/50 border border-border">
        <span className={`w-1.5 h-1.5 rounded-full ${visibleEvents.length > 0 ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
        <span className="text-[9px] font-mono text-muted-foreground">{visibleEvents.length} events</span>
      </div>

      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Glow filters per severity */}
          {(["normal", "suspicious", "malicious", "user"] as Severity[]).map((s) => (
            <filter key={s} id={`glow-${s}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
              <feFlood floodColor={sevStroke[s]} floodOpacity="0.6" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="shadow" />
              <feMerge>
                <feMergeNode in="shadow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          {/* Grid pattern */}
          <pattern id="sysmap-grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <line x1="5" y1="0" x2="5" y2="5" stroke="hsl(220,15%,14%)" strokeWidth="0.15" />
            <line x1="0" y1="5" x2="5" y2="5" stroke="hsl(220,15%,14%)" strokeWidth="0.15" />
          </pattern>
        </defs>

        {/* Background grid */}
        <rect width="100" height="100" fill="url(#sysmap-grid)" opacity="0.6" />

        {/* Edges */}
        {edgeDefs.map(([a, b]) => {
          const na = nodeMap.get(a)!;
          const nb = nodeMap.get(b)!;
          const edgeActive = isEdgeActive(a, b);
          const es = getEdgeSev(a, b);
          return (
            <g key={`${a}-${b}`}>
              {/* Shadow line */}
              {edgeActive && (
                <line
                  x1={na.cx} y1={na.cy} x2={nb.cx} y2={nb.cy}
                  stroke={sevStroke[es]} strokeWidth="1.5" opacity="0.15"
                  filter={`url(#glow-${es})`}
                />
              )}
              {/* Main line */}
              <line
                x1={na.cx} y1={na.cy} x2={nb.cx} y2={nb.cy}
                stroke={edgeActive ? sevStroke[es] : "hsl(220,15%,16%)"}
                strokeWidth={edgeActive ? "0.5" : "0.2"}
                strokeDasharray={edgeActive ? "2 1.5" : "1 2"}
                opacity={edgeActive ? 0.9 : 0.3}
              >
                {edgeActive && (
                  <animate attributeName="stroke-dashoffset" from="7" to="0" dur="0.8s" repeatCount="indefinite" />
                )}
              </line>
            </g>
          );
        })}

        {/* Particles traveling along edges */}
        {particles.map((p) => {
          const na = nodeMap.get(p.from);
          const nb = nodeMap.get(p.to);
          if (!na || !nb) return null;
          return (
            <g key={p.id}>
              <circle r="0.8" fill={sevStroke[p.severity]} opacity="0.9" filter={`url(#glow-${p.severity})`}>
                <animateMotion dur="1.2s" fill="freeze" path={`M${na.cx},${na.cy} L${nb.cx},${nb.cy}`} />
                <animate attributeName="opacity" from="1" to="0" dur="1.2s" fill="freeze" />
              </circle>
              {/* Trail */}
              <circle r="2" fill={sevStroke[p.severity]} opacity="0.15">
                <animateMotion dur="1.2s" fill="freeze" path={`M${na.cx},${na.cy} L${nb.cx},${nb.cy}`} />
                <animate attributeName="opacity" from="0.2" to="0" dur="1.2s" fill="freeze" />
                <animate attributeName="r" from="1" to="3" dur="1.2s" fill="freeze" />
              </circle>
            </g>
          );
        })}

        {/* Nodes */}
        {nodeDefs.map((node) => {
          const nodeActive = isNodeActive(node.id);
          const ns = nodeSev(node.id);
          const isComputer = node.id === "computer";
          const baseR = isComputer ? 8 : 5.5;

          return (
            <g key={node.id}>
              {/* Outer ring pulse for active nodes */}
              {nodeActive && (
                <circle cx={node.cx} cy={node.cy} r={baseR + 2} fill="none"
                  stroke={sevStroke[ns]} strokeWidth="0.3" opacity="0.3">
                  <animate attributeName="r" from={baseR + 1} to={baseR + 4} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Hex-like background */}
              <circle
                cx={node.cx} cy={node.cy} r={baseR}
                fill={nodeActive ? sevFill[ns] : "hsl(220,18%,8%)"}
                stroke={nodeActive ? sevStroke[ns] : "hsl(220,15%,18%)"}
                strokeWidth={nodeActive ? "0.5" : "0.25"}
                filter={nodeActive ? `url(#glow-${ns})` : undefined}
                opacity={nodeActive ? 1 : 0.5}
              />

              {/* Inner decoration ring */}
              <circle
                cx={node.cx} cy={node.cy} r={baseR - 1.5}
                fill="none"
                stroke={nodeActive ? sevStroke[ns] : "hsl(220,15%,16%)"}
                strokeWidth="0.15"
                strokeDasharray="1 1"
                opacity={nodeActive ? 0.5 : 0.2}
              />

              {/* Label */}
              <text
                x={node.cx} y={node.cy + baseR + 3}
                textAnchor="middle" fontSize="2.8"
                fill={nodeActive ? sevStroke[ns] : "hsl(220,10%,40%)"}
                fontFamily="'JetBrains Mono', monospace"
                letterSpacing="0.1"
              >
                {node.label.toUpperCase()}
              </text>
            </g>
          );
        })}

        {/* Icon overlays (foreignObject for Lucide icons) */}
        {nodeDefs.map((node) => {
          const nodeActive = isNodeActive(node.id);
          const isComputer = node.id === "computer";
          const size = isComputer ? 5 : 3.5;
          return (
            <foreignObject
              key={`icon-${node.id}`}
              x={node.cx - size / 2} y={node.cy - size / 2}
              width={size} height={size}
              className={`pointer-events-none ${nodeActive ? sevTextClass[nodeSev(node.id)] : "text-muted-foreground/40"}`}
            >
              <div className="w-full h-full flex items-center justify-center">
                {node.icon}
              </div>
            </foreignObject>
          );
        })}

        {/* Latest event flash effect on computer node */}
        {visibleEvents.length > 0 && (
          <circle cx={50} cy={50} r="10" fill="none" stroke={sevStroke[visibleEvents[visibleEvents.length - 1].severity]} strokeWidth="0.3" opacity="0">
            <animate attributeName="r" from="8" to="16" dur="1.5s" repeatCount="1" />
            <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="1" />
          </circle>
        )}
      </svg>

      {/* Ambient corner decorations */}
      <div className="absolute bottom-0 left-0 w-20 h-20 border-l border-b border-primary/10 rounded-none pointer-events-none" />
      <div className="absolute top-0 right-0 w-20 h-20 border-r border-t border-primary/10 rounded-none pointer-events-none" />
    </div>
  );
};

export default SystemMap;
