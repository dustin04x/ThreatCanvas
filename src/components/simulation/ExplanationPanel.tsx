import { motion, AnimatePresence } from "framer-motion";
import { useSimulationStore } from "@/store/simulation-store";
import { X, ExternalLink, BookOpen, Code } from "lucide-react";

const ExplanationPanel = () => {
  const { selectedEvent, setSelectedEvent, beginnerMode, setBeginnerMode } = useSimulationStore();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Explanation</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBeginnerMode(!beginnerMode)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono transition-colors ${
              beginnerMode ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
            }`}
          >
            {beginnerMode ? <BookOpen size={10} /> : <Code size={10} />}
            {beginnerMode ? "Beginner" : "Technical"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <AnimatePresence mode="wait">
          {selectedEvent ? (
            <motion.div
              key={selectedEvent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-display font-semibold text-sm">{selectedEvent.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{selectedEvent.description}</p>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="p-1 rounded-md hover:bg-secondary text-muted-foreground">
                  <X size={14} />
                </button>
              </div>

              {/* Severity badge */}
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                  selectedEvent.severity === "malicious" ? "bg-destructive/20 text-destructive" :
                  selectedEvent.severity === "suspicious" ? "bg-warning/20 text-warning" :
                  selectedEvent.severity === "user" ? "bg-info/20 text-info" :
                  "bg-safe/20 text-safe"
                }`}>
                  {selectedEvent.severity}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">T+{selectedEvent.time}s</span>
              </div>

              {/* MITRE ATT&CK */}
              {selectedEvent.mitreId && (
                <div className="bg-secondary/50 rounded-md p-3 border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-primary uppercase tracking-wider">MITRE ATT&CK</span>
                  </div>
                  <p className="text-xs font-mono">
                    <span className="text-primary">{selectedEvent.mitreId}</span>
                    <span className="text-muted-foreground"> — </span>
                    {selectedEvent.mitreName}
                  </p>
                  <a
                    href={`https://attack.mitre.org/techniques/${selectedEvent.mitreId?.replace(".", "/")}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-1"
                  >
                    View on MITRE <ExternalLink size={8} />
                  </a>
                </div>
              )}

              {/* Explanation */}
              <div className="bg-card rounded-md p-3 border border-border">
                <h5 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  {beginnerMode ? "🎓 Beginner Explanation" : "🔬 Technical Details"}
                </h5>
                <p className="text-xs leading-relaxed">
                  {beginnerMode
                    ? selectedEvent.beginnerExplanation || selectedEvent.description
                    : selectedEvent.technicalExplanation || selectedEvent.description}
                </p>
              </div>

              {/* Details */}
              {Object.keys(selectedEvent.details).length > 0 && (
                <div className="space-y-1">
                  <h5 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Details</h5>
                  {Object.entries(selectedEvent.details).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-2 text-xs font-mono">
                      <span className="text-muted-foreground flex-shrink-0">{key}:</span>
                      <span className="text-foreground break-all">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center text-muted-foreground"
            >
              <BookOpen size={24} className="mb-2 opacity-40" />
              <p className="text-xs">Click any event to see details</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExplanationPanel;
