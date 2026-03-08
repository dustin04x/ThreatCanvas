import { motion, AnimatePresence } from "framer-motion";
import { useSimulationStore } from "@/store/simulation-store";
import type { Severity } from "@/lib/simulation-engine";

const chainStepColors: Record<string, string> = {
  active: "bg-primary/20 border-primary/50 text-primary",
  completed: "bg-primary/10 border-primary/30 text-primary/70",
  pending: "bg-secondary border-border text-muted-foreground",
};

const AttackChain = () => {
  const { scenario, visibleEvents } = useSimulationStore();
  if (!scenario) return null;

  const completedSteps = new Set<number>();
  const currentStep = (() => {
    // Map events to chain steps roughly by proportion
    const totalEvents = scenario.events.length;
    const totalSteps = scenario.attackChain.length;
    const visibleCount = visibleEvents.length;
    const currentIdx = Math.floor((visibleCount / totalEvents) * totalSteps);
    for (let i = 0; i < currentIdx; i++) completedSteps.add(i);
    return Math.min(currentIdx, totalSteps - 1);
  })();

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2 px-3">
      {scenario.attackChain.map((step, i) => {
        const isCompleted = completedSteps.has(i);
        const isActive = i === currentStep && visibleEvents.length > 0;
        const status = isActive ? "active" : isCompleted ? "completed" : "pending";
        return (
          <div key={i} className="flex items-center gap-1 flex-shrink-0">
            <motion.div
              className={`px-2 py-1 rounded-md border text-[10px] font-mono whitespace-nowrap ${chainStepColors[status]}`}
              animate={isActive ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {step}
            </motion.div>
            {i < scenario.attackChain.length - 1 && (
              <span className={`text-xs ${isCompleted ? "text-primary/50" : "text-muted-foreground/30"}`}>→</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AttackChain;
