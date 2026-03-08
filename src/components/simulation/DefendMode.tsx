import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSimulationStore } from "@/store/simulation-store";
import type { SimulationEvent, Severity } from "@/lib/simulation-engine";
import { Shield, Crosshair, Ban, Unplug, Skull, Trophy, XCircle, Zap, Heart } from "lucide-react";

type DefenseAction = "kill_process" | "block_ip" | "remove_persistence" | "isolate_machine";

interface DefenseOption {
  id: DefenseAction;
  label: string;
  icon: React.ReactNode;
  description: string;
  // Which event types this action can counter
  counters: string[];
}

const defenseOptions: DefenseOption[] = [
  {
    id: "kill_process", label: "Kill Process", icon: <XCircle size={14} />,
    description: "Terminate a malicious process",
    counters: ["process_spawn", "credential_dump"],
  },
  {
    id: "block_ip", label: "Block IP", icon: <Ban size={14} />,
    description: "Block network communication",
    counters: ["network_connect", "network_exfiltrate", "network_dns", "lateral_movement"],
  },
  {
    id: "remove_persistence", label: "Remove Persistence", icon: <Unplug size={14} />,
    description: "Remove startup entries",
    counters: ["persistence", "registry_modify"],
  },
  {
    id: "isolate_machine", label: "Isolate Machine", icon: <Shield size={14} />,
    description: "Disconnect from network",
    counters: ["lateral_movement", "network_exfiltrate"],
  },
];

interface DefendModeProps {
  onClose: () => void;
}

const DefendMode = ({ onClose }: DefendModeProps) => {
  const { scenario, visibleEvents, currentTime, isPlaying, setIsPlaying } = useSimulationStore();
  const [health, setHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [blockedEvents, setBlockedEvents] = useState<Set<string>>(new Set());
  const [lastAction, setLastAction] = useState<{ action: string; success: boolean; message: string } | null>(null);
  const [gameOver, setGameOver] = useState<"win" | "lose" | null>(null);
  const [actionCooldown, setActionCooldown] = useState(false);

  // Auto-play in defend mode
  useEffect(() => {
    if (!isPlaying && !gameOver && currentTime >= 0) {
      setIsPlaying(true);
    }
  }, []);

  // Track damage from unblocked malicious events
  useEffect(() => {
    const unblocked = visibleEvents.filter(
      (e) => e.severity === "malicious" && !blockedEvents.has(e.id)
    );
    const damage = unblocked.length * 12;
    const newHealth = Math.max(0, 100 - damage);
    setHealth(newHealth);
    if (newHealth <= 0 && !gameOver) {
      setGameOver("lose");
      setIsPlaying(false);
    }
  }, [visibleEvents, blockedEvents]);

  // Check win condition
  useEffect(() => {
    if (!scenario || gameOver) return;
    const maxTime = Math.max(...scenario.events.map((e) => e.time)) + 2;
    if (currentTime >= maxTime && health > 0) {
      setGameOver("win");
    }
  }, [currentTime, health, scenario, gameOver]);

  const handleDefend = useCallback((action: DefenseOption) => {
    if (actionCooldown || gameOver) return;

    // Find the latest unblocked event that this action can counter
    const target = [...visibleEvents].reverse().find(
      (e) => !blockedEvents.has(e.id) && action.counters.includes(e.type)
    );

    if (target) {
      setBlockedEvents((prev) => new Set(prev).add(target.id));
      setScore((s) => s + 25);
      setLastAction({ action: action.label, success: true, message: `Blocked: ${target.title}` });
    } else {
      setScore((s) => Math.max(0, s - 5));
      setLastAction({ action: action.label, success: false, message: "No matching threat found!" });
    }

    setActionCooldown(true);
    setTimeout(() => setActionCooldown(false), 800);
    setTimeout(() => setLastAction(null), 2000);
  }, [visibleEvents, blockedEvents, actionCooldown, gameOver]);

  if (!scenario) return null;

  return (
    <div className="h-full flex flex-col bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border flex-shrink-0">
        <Crosshair size={12} className="text-destructive" />
        <h3 className="text-[10px] font-mono uppercase tracking-[0.25em] text-destructive">Defend Mode</h3>
        <button onClick={onClose} className="ml-auto text-[9px] font-mono text-muted-foreground hover:text-foreground px-2 py-0.5 rounded bg-secondary/50 border border-border">
          EXIT
        </button>
      </div>

      {/* Game Over overlay */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`text-center p-6 rounded-lg border ${
                gameOver === "win" ? "border-primary/50 bg-primary/10" : "border-destructive/50 bg-destructive/10"
              }`}
            >
              {gameOver === "win" ? (
                <>
                  <Trophy size={36} className="text-primary mx-auto mb-3" />
                  <h4 className="font-display font-bold text-lg text-primary mb-1">System Defended!</h4>
                  <p className="text-xs text-muted-foreground">Score: {score} pts • Health: {health}%</p>
                </>
              ) : (
                <>
                  <Skull size={36} className="text-destructive mx-auto mb-3" />
                  <h4 className="font-display font-bold text-lg text-destructive mb-1">System Compromised</h4>
                  <p className="text-xs text-muted-foreground">Score: {score} pts • Threats blocked: {blockedEvents.size}</p>
                </>
              )}
              <button onClick={onClose} className="mt-4 px-4 py-1.5 rounded-md bg-secondary text-foreground text-xs font-mono hover:bg-secondary/80 transition-colors">
                Back to Simulation
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-auto p-3 space-y-3">
        {/* Health bar */}
        <div>
          <div className="flex items-center justify-between text-[9px] font-mono mb-1">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Heart size={10} className={health > 50 ? "text-safe" : health > 25 ? "text-warning" : "text-destructive"} />
              System Health
            </span>
            <span className={health > 50 ? "text-safe" : health > 25 ? "text-warning" : "text-destructive"}>
              {health}%
            </span>
          </div>
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-colors ${
                health > 50 ? "bg-safe" : health > 25 ? "bg-warning" : "bg-destructive"
              }`}
              animate={{ width: `${health}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-secondary/30 border border-border">
          <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1">
            <Zap size={10} className="text-primary" /> Score
          </span>
          <span className="text-sm font-display font-bold text-primary">{score}</span>
        </div>

        {/* Action feedback */}
        <AnimatePresence>
          {lastAction && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-[10px] font-mono px-2 py-1.5 rounded-md border ${
                lastAction.success
                  ? "bg-safe/10 border-safe/30 text-safe"
                  : "bg-destructive/10 border-destructive/30 text-destructive"
              }`}
            >
              {lastAction.success ? "✓" : "✗"} {lastAction.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Defense actions */}
        <div className="space-y-1.5">
          <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Actions</span>
          {defenseOptions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleDefend(action)}
              disabled={actionCooldown || !!gameOver}
              className={`w-full flex items-center gap-2.5 p-2 rounded-md border text-left transition-all ${
                actionCooldown || gameOver
                  ? "border-border/50 bg-secondary/20 text-muted-foreground/40 cursor-not-allowed"
                  : "border-border bg-secondary/30 text-foreground hover:border-primary/40 hover:bg-primary/5 hover:neon-glow active:scale-[0.98]"
              }`}
            >
              <div className={`p-1.5 rounded-md ${actionCooldown ? "bg-secondary" : "bg-primary/10 text-primary"}`}>
                {action.icon}
              </div>
              <div>
                <div className="text-xs font-mono font-medium">{action.label}</div>
                <div className="text-[9px] text-muted-foreground">{action.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Blocked events */}
        {blockedEvents.size > 0 && (
          <div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
              Blocked ({blockedEvents.size})
            </span>
            <div className="mt-1 space-y-0.5">
              {visibleEvents
                .filter((e) => blockedEvents.has(e.id))
                .map((e) => (
                  <div key={e.id} className="text-[9px] font-mono text-safe/70 flex items-center gap-1 px-1">
                    <span>✓</span> {e.title}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DefendMode;
