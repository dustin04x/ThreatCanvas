import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { scenarios } from "@/lib/simulation-engine";
import { Shield, Play, Zap, BookOpen, Github, Linkedin } from "lucide-react";

const difficultyColors = {
  Beginner: "text-safe bg-safe/10 border-safe/30",
  Intermediate: "text-warning bg-warning/10 border-warning/30",
  Advanced: "text-destructive bg-destructive/10 border-destructive/30",
};

const categoryColors: Record<string, string> = {
  Ransomware: "text-destructive",
  "Info Stealer": "text-warning",
  Wiper: "text-destructive",
  Botnet: "text-warning",
  Cryptominer: "text-info",
  APT: "text-accent",
  "Social Engineering": "text-info",
  "Cyber Weapon": "text-destructive",
};

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="fixed inset-0 scanline pointer-events-none z-50 opacity-30" />

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-6 pt-16 pb-12 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono mb-6">
              <Shield size={14} />
              <span>Educational Cybersecurity Simulator</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-4">
              <span className="text-foreground">Threat</span>
              <span className="text-primary neon-glow-text">Canvas</span>
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-8 leading-relaxed">
              Watch how cyber attacks unfold inside a system. Animated simulations. Zero real malware.
            </p>

            <div className="flex items-center justify-center gap-3 text-xs font-mono text-muted-foreground mb-6">
              <span className="flex items-center gap-1"><Zap size={12} className="text-primary" /> No real malware</span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1"><BookOpen size={12} className="text-primary" /> Beginner friendly</span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1"><Shield size={12} className="text-primary" /> MITRE ATT&CK mapped</span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <a href="https://github.com/dustin04x" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-border bg-card hover:bg-secondary hover:text-primary transition-colors text-muted-foreground">
                <Github size={18} />
              </a>
              <a href="https://www.linkedin.com/in/skander-wali-901040391/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-border bg-card hover:bg-secondary hover:text-primary transition-colors text-muted-foreground">
                <Linkedin size={18} />
              </a>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Scenarios */}
      <main className="container mx-auto px-6 pb-20">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6 text-center"
        >
          Choose an Attack Scenario — {scenarios.length} Available
        </motion.h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-6xl mx-auto">
          {scenarios.map((scenario, i) => (
            <motion.button
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
              onClick={() => navigate(`/simulate/${scenario.id}`)}
              className="group relative text-left p-4 rounded-lg border border-border bg-card hover:neon-border transition-all duration-300"
            >
              <div className="flex items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <h3 className="font-display font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
                      {scenario.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className={`text-[9px] font-mono ${categoryColors[scenario.category] || "text-muted-foreground"}`}>
                      {scenario.category}
                    </span>
                    <span className="text-border">·</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono border ${difficultyColors[scenario.difficulty]}`}>
                      {scenario.difficulty}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                    {scenario.description}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                      {scenario.events.length} events
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                      {scenario.attackChain.length} phases
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom run indicator */}
              <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between">
                <div className="flex gap-0.5">
                  {scenario.attackChain.slice(0, 5).map((_, j) => (
                    <div key={j} className="w-4 h-1 rounded-full bg-border group-hover:bg-primary/40 transition-colors" style={{ transitionDelay: `${j * 40}ms` }} />
                  ))}
                  {scenario.attackChain.length > 5 && <span className="text-[8px] text-muted-foreground ml-0.5">+{scenario.attackChain.length - 5}</span>}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground group-hover:text-primary transition-colors">
                  <Play size={10} /> Run
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-6 mt-10 text-[10px] font-mono"
        >
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-safe" /> Normal</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning" /> Suspicious</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-destructive" /> Malicious</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-info" /> User Action</span>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
