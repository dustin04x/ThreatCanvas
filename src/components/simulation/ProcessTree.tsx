import { motion, AnimatePresence } from "framer-motion";
import { useSimulationStore } from "@/store/simulation-store";
import type { Severity } from "@/lib/simulation-engine";

const severityBg: Record<Severity, string> = {
  normal: "bg-safe/20 border-safe/40",
  suspicious: "bg-warning/20 border-warning/40",
  malicious: "bg-destructive/20 border-destructive/40",
  user: "bg-info/20 border-info/40",
};

const severityDot: Record<Severity, string> = {
  normal: "bg-safe",
  suspicious: "bg-warning",
  malicious: "bg-destructive",
  user: "bg-info",
};

interface TreeNode {
  name: string;
  pid?: number;
  severity: Severity;
  children: TreeNode[];
}

const ProcessTree = () => {
  const { visibleEvents, setSelectedEvent } = useSimulationStore();

  // Build process tree from events
  const processEvents = visibleEvents.filter((e) => e.processInfo);
  const nodeMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  processEvents.forEach((evt) => {
    const pi = evt.processInfo!;
    if (!nodeMap.has(pi.name)) {
      nodeMap.set(pi.name, { name: pi.name, pid: pi.pid, severity: evt.severity, children: [] });
    } else {
      const existing = nodeMap.get(pi.name)!;
      if (evt.severity === "malicious") existing.severity = "malicious";
    }
  });

  processEvents.forEach((evt) => {
    const pi = evt.processInfo!;
    const node = nodeMap.get(pi.name)!;
    if (pi.parent && nodeMap.has(pi.parent)) {
      const parent = nodeMap.get(pi.parent)!;
      if (!parent.children.find((c) => c.name === node.name)) {
        parent.children.push(node);
      }
    } else if (!roots.find((r) => r.name === node.name)) {
      roots.push(node);
    }
  });

  const renderNode = (node: TreeNode, depth: number) => {
    const evt = processEvents.find((e) => e.processInfo?.name === node.name);
    return (
      <motion.div
        key={node.name}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: depth * 0.1 }}
        style={{ marginLeft: depth * 20 }}
      >
        <button
          onClick={() => evt && setSelectedEvent(evt)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono mb-1 w-full text-left transition-all hover:brightness-125 ${severityBg[node.severity]}`}
        >
          <span className={`w-2 h-2 rounded-full ${severityDot[node.severity]} ${node.severity === "malicious" ? "animate-pulse-neon" : ""}`} />
          <span>{node.name}</span>
          {node.pid && <span className="text-muted-foreground ml-auto">PID {node.pid}</span>}
        </button>
        {node.children.map((child) => renderNode(child, depth + 1))}
      </motion.div>
    );
  };

  return (
    <div className="h-full overflow-auto p-3 space-y-1">
      <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Process Tree</h3>
      <AnimatePresence>
        {roots.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No processes spawned yet...</p>
        ) : (
          roots.map((root) => renderNode(root, 0))
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProcessTree;
