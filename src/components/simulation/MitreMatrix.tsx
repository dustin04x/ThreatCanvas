import { motion } from "framer-motion";
import { useSimulationStore } from "@/store/simulation-store";
import { Grid3X3 } from "lucide-react";

// Simplified MITRE ATT&CK tactics
const tactics = [
  { id: "TA0001", name: "Initial Access", short: "Access" },
  { id: "TA0002", name: "Execution", short: "Exec" },
  { id: "TA0003", name: "Persistence", short: "Persist" },
  { id: "TA0004", name: "Priv Escalation", short: "PrivEsc" },
  { id: "TA0005", name: "Defense Evasion", short: "Evasion" },
  { id: "TA0006", name: "Credential Access", short: "Creds" },
  { id: "TA0007", name: "Discovery", short: "Discover" },
  { id: "TA0008", name: "Lateral Movement", short: "Lateral" },
  { id: "TA0009", name: "Collection", short: "Collect" },
  { id: "TA0010", name: "Exfiltration", short: "Exfil" },
  { id: "TA0040", name: "Impact", short: "Impact" },
];

// Map MITRE technique IDs to tactics
const techniqueToTactic: Record<string, string[]> = {
  "T1210": ["TA0001", "TA0008"],
  "T1059": ["TA0002"],
  "T1059.001": ["TA0002"],
  "T1046": ["TA0007"],
  "T1486": ["TA0040"],
  "T1543.003": ["TA0003", "TA0004"],
  "T1490": ["TA0040"],
  "T1491": ["TA0040"],
  "T1566.001": ["TA0001"],
  "T1105": ["TA0002"],
  "T1218.011": ["TA0005"],
  "T1547.001": ["TA0003"],
  "T1555": ["TA0006"],
  "T1555.003": ["TA0006"],
  "T1041": ["TA0010"],
  "T1534": ["TA0008"],
  "T1195.002": ["TA0001"],
  "T1003.001": ["TA0006"],
  "T1561.002": ["TA0040"],
  "T1204.002": ["TA0002"],
  "T1497": ["TA0005"],
  "T1005": ["TA0009"],
  "T1560.001": ["TA0009"],
  "T1567.002": ["TA0010"],
};

const MitreMatrix = () => {
  const { visibleEvents, scenario, setSelectedEvent } = useSimulationStore();

  // Collect active techniques
  const activeTechniques = new Map<string, { id: string; name: string; severity: string }>();
  visibleEvents.forEach((evt) => {
    if (evt.mitreId) {
      activeTechniques.set(evt.mitreId, { id: evt.mitreId, name: evt.mitreName || "", severity: evt.severity });
    }
  });

  // Map to tactics
  const activeTactics = new Map<string, { techniques: { id: string; name: string; severity: string }[] }>();
  activeTechniques.forEach((tech) => {
    const tacticIds = techniqueToTactic[tech.id] || [];
    tacticIds.forEach((tid) => {
      if (!activeTactics.has(tid)) activeTactics.set(tid, { techniques: [] });
      activeTactics.get(tid)!.techniques.push(tech);
    });
  });

  const totalTechniques = scenario?.events.filter((e) => e.mitreId).length || 0;
  const coveredTactics = activeTactics.size;

  return (
    <div className="h-full flex flex-col bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border flex-shrink-0">
        <Grid3X3 size={12} className="text-primary" />
        <h3 className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">MITRE ATT&CK</h3>
        <div className="ml-auto text-[9px] font-mono text-muted-foreground">
          {coveredTactics}/{tactics.length} tactics
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1">
          {tactics.map((tactic) => {
            const data = activeTactics.get(tactic.id);
            const isActive = !!data;
            const hasMalicious = data?.techniques.some((t) => t.severity === "malicious");

            return (
              <motion.div
                key={tactic.id}
                initial={{ opacity: 0.4 }}
                animate={{
                  opacity: isActive ? 1 : 0.35,
                  scale: isActive ? 1 : 0.95,
                }}
                transition={{ duration: 0.3 }}
                className={`rounded-md border p-1.5 transition-all ${
                  hasMalicious ? "border-destructive/50 bg-destructive/10 neon-glow-red" :
                  isActive ? "border-primary/40 bg-primary/5 neon-glow" :
                  "border-border/50 bg-secondary/20"
                }`}
              >
                {/* Tactic name */}
                <div className={`text-[8px] font-mono uppercase tracking-wider mb-1 ${
                  hasMalicious ? "text-destructive" : isActive ? "text-primary" : "text-muted-foreground/50"
                }`}>
                  {tactic.short}
                </div>

                {/* Techniques */}
                <div className="space-y-0.5">
                  {data?.techniques.map((tech) => (
                    <button
                      key={tech.id}
                      onClick={() => {
                        const evt = visibleEvents.find((e) => e.mitreId === tech.id);
                        if (evt) setSelectedEvent(evt);
                      }}
                      className={`block w-full text-left px-1 py-0.5 rounded text-[7px] font-mono transition-colors hover:brightness-125 ${
                        tech.severity === "malicious" ? "bg-destructive/20 text-destructive" :
                        tech.severity === "suspicious" ? "bg-warning/20 text-warning" :
                        "bg-primary/15 text-primary"
                      }`}
                    >
                      {tech.id}
                    </button>
                  ))}
                  {!data && (
                    <div className="text-[7px] text-muted-foreground/30 font-mono">—</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-3 px-1">
          <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground mb-1">
            <span>Attack Coverage</span>
            <span>{activeTechniques.size} techniques detected</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-destructive rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${totalTechniques > 0 ? (activeTechniques.size / totalTechniques) * 100 : 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MitreMatrix;
