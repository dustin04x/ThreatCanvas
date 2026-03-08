import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSimulationStore } from "@/store/simulation-store";
import type { Severity } from "@/lib/simulation-engine";
import { Terminal } from "lucide-react";

const sevColor: Record<Severity, string> = {
  normal: "text-safe",
  suspicious: "text-warning",
  malicious: "text-destructive",
  user: "text-info",
};

const sevBadge: Record<Severity, string> = {
  normal: "bg-safe/15 text-safe border-safe/30",
  suspicious: "bg-warning/15 text-warning border-warning/30",
  malicious: "bg-destructive/15 text-destructive border-destructive/30",
  user: "bg-info/15 text-info border-info/30",
};

const typeIcon: Record<string, string> = {
  process_spawn: "⚙️",
  file_create: "📄",
  file_encrypt: "🔒",
  file_delete: "🗑️",
  registry_modify: "📝",
  network_dns: "🌐",
  network_connect: "🔗",
  network_exfiltrate: "📡",
  privilege_escalation: "⬆️",
  persistence: "📌",
  user_action: "👤",
  ransom_note: "💰",
  shadow_copy_delete: "🗃️",
  credential_dump: "🔑",
  lateral_movement: "↔️",
};

const ActivityLog = () => {
  const { visibleEvents } = useSimulationStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleEvents.length]);

  return (
    <div className="h-full flex flex-col bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border flex-shrink-0">
        <Terminal size={12} className="text-primary" />
        <h3 className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">Activity Log</h3>
        <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary/50 border border-border">
          <span className={`w-1.5 h-1.5 rounded-full ${visibleEvents.length > 0 ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
          <span className="text-[9px] font-mono text-muted-foreground">{visibleEvents.length}</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto p-2 space-y-0.5 font-mono text-[11px]">
        <AnimatePresence initial={false}>
          {visibleEvents.length === 0 && (
            <div className="h-full flex items-center justify-center text-muted-foreground/40 text-xs italic">
              Waiting for events...
            </div>
          )}
          {visibleEvents.map((evt) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: -10, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-1.5 py-1 px-1.5 rounded hover:bg-secondary/30 transition-colors group"
            >
              {/* Timestamp */}
              <span className="text-muted-foreground flex-shrink-0 w-10 text-right tabular-nums">
                {evt.time.toFixed(0).padStart(3, " ")}s
              </span>

              {/* Severity dot */}
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${
                evt.severity === "malicious" ? "bg-destructive" :
                evt.severity === "suspicious" ? "bg-warning" :
                evt.severity === "user" ? "bg-info" : "bg-safe"
              }`} />

              {/* Icon */}
              <span className="flex-shrink-0 text-[10px]">{typeIcon[evt.type] || "•"}</span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <span className={`font-medium ${sevColor[evt.severity]}`}>{evt.title}</span>
                <span className="text-muted-foreground/60 ml-1.5 hidden group-hover:inline">
                  {evt.description.slice(0, 60)}
                </span>
              </div>

              {/* MITRE badge */}
              {evt.mitreId && (
                <span className={`flex-shrink-0 px-1.5 py-0.5 rounded border text-[8px] ${sevBadge[evt.severity]}`}>
                  {evt.mitreId}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Blinking cursor */}
        {visibleEvents.length > 0 && (
          <div className="flex items-center gap-1 py-1 px-1.5 text-primary/50">
            <span className="animate-pulse">▌</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
