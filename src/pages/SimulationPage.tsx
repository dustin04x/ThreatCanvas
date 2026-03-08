import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSimulationStore } from "@/store/simulation-store";
import { getScenario } from "@/lib/simulation-engine";
import SystemMap from "@/components/simulation/SystemMap";
import ProcessTree from "@/components/simulation/ProcessTree";
import NetworkGraph from "@/components/simulation/NetworkGraph";
import Timeline from "@/components/simulation/Timeline";
import ExplanationPanel from "@/components/simulation/ExplanationPanel";
import AttackChain from "@/components/simulation/AttackChain";
import ActivityLog from "@/components/simulation/ActivityLog";
import MitreMatrix from "@/components/simulation/MitreMatrix";
import DefendMode from "@/components/simulation/DefendMode";
import QuizMode from "@/components/simulation/QuizMode";
import { FullscreenProvider, useFullscreen, FullscreenToggle } from "@/components/simulation/FullscreenPanel";
import { ArrowLeft, Shield, Crosshair, HelpCircle, Terminal, Grid3X3, BookOpen, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

type RightTab = "explain" | "log" | "mitre" | "defend" | "quiz";

const tabItems: { id: RightTab; label: string; icon: React.ReactNode }[] = [
  { id: "explain", label: "Info", icon: <BookOpen size={12} /> },
  { id: "log", label: "Log", icon: <Terminal size={12} /> },
  { id: "mitre", label: "MITRE", icon: <Grid3X3 size={12} /> },
  { id: "defend", label: "Defend", icon: <Crosshair size={12} /> },
  { id: "quiz", label: "Quiz", icon: <HelpCircle size={12} /> },
];

// Wrapper with fullscreen toggle button
const PanelWrapper = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => {
  const { fullscreenPanel, setFullscreen } = useFullscreen();
  const isFs = fullscreenPanel === id;
  const isHidden = fullscreenPanel !== null && fullscreenPanel !== id;

  if (isHidden) return <div className="h-full bg-card" />;

  const content = (
    <div className={`h-full relative group ${isFs ? "fixed inset-0 z-40" : ""}`}>
      {children}
      <button
        onClick={() => setFullscreen(isFs ? null : id)}
        className="absolute top-2 right-2 z-20 p-1.5 rounded-md bg-card/90 border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-all opacity-40 group-hover:opacity-100"
        title={isFs ? "Exit fullscreen" : `Fullscreen ${label}`}
      >
        {isFs ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
      </button>
    </div>
  );

  return content;
};

const SimulationContent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { scenario, setScenario, reset } = useSimulationStore();
  const [rightTab, setRightTab] = useState<RightTab>("explain");
  const { fullscreenPanel } = useFullscreen();

  useEffect(() => {
    if (id) {
      const s = getScenario(id);
      if (s) setScenario(s);
      else navigate("/");
    }
    return () => reset();
  }, [id]);

  if (!scenario) return null;

  const renderRightPanel = () => {
    switch (rightTab) {
      case "log": return <ActivityLog />;
      case "mitre": return <MitreMatrix />;
      case "defend": return <DefendMode onClose={() => setRightTab("explain")} />;
      case "quiz": return <QuizMode onClose={() => setRightTab("explain")} />;
      default: return <ExplanationPanel />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="fixed inset-0 scanline pointer-events-none z-50 opacity-20" />

      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card/50 backdrop-blur flex-shrink-0 z-10">
        <button onClick={() => navigate("/")} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-primary" />
          <span className="font-display font-semibold text-sm">
            <span className="text-foreground">Threat</span>
            <span className="text-primary">Canvas</span>
          </span>
        </div>
        <div className="h-4 w-px bg-border" />
        <span className="text-lg">{scenario.icon}</span>
        <div>
          <h1 className="font-display font-semibold text-sm">{scenario.name}</h1>
          <p className="text-[10px] font-mono text-muted-foreground">{scenario.category} • {scenario.events.length} events</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => setRightTab("defend")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono transition-all border ${rightTab === "defend" ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-secondary/50 text-muted-foreground border-border hover:text-foreground hover:border-destructive/30"}`}>
            <Crosshair size={11} /> Defend
          </button>
          <button onClick={() => setRightTab("quiz")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono transition-all border ${rightTab === "quiz" ? "bg-primary/15 text-primary border-primary/30" : "bg-secondary/50 text-muted-foreground border-border hover:text-foreground hover:border-primary/30"}`}>
            <HelpCircle size={11} /> Quiz
          </button>
        </div>
      </header>

      {/* Attack chain */}
      {!fullscreenPanel && (
        <div className="border-b border-border bg-card/30 flex-shrink-0">
          <AttackChain />
        </div>
      )}

      {/* Resizable panels */}
      <div className="flex-1 min-h-0">
        {fullscreenPanel ? (
          // Render only the fullscreened panel
          <div className="h-full">
            {fullscreenPanel === "systemmap" && <PanelWrapper id="systemmap" label="System Map"><SystemMap /></PanelWrapper>}
            {fullscreenPanel === "network" && <PanelWrapper id="network" label="Network"><NetworkGraph /></PanelWrapper>}
            {fullscreenPanel === "process" && <PanelWrapper id="process" label="Processes"><ProcessTree /></PanelWrapper>}
            {fullscreenPanel === "timeline" && <PanelWrapper id="timeline" label="Timeline"><Timeline /></PanelWrapper>}
            {fullscreenPanel === "right" && (
              <PanelWrapper id="right" label="Panel">
                <div className="h-full flex flex-col bg-card">
                  <div className="flex items-center border-b border-border flex-shrink-0">
                    {tabItems.map((tab) => (
                      <button key={tab.id} onClick={() => setRightTab(tab.id)}
                        className={`flex items-center gap-1 px-3 py-2 text-[10px] font-mono uppercase tracking-wider transition-all border-b-2 ${rightTab === tab.id ? "text-primary border-primary bg-primary/5" : "text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/30"}`}>
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">{renderRightPanel()}</div>
                </div>
              </PanelWrapper>
            )}
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={38} minSize={25}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={60} minSize={30}>
                  <PanelWrapper id="systemmap" label="System Map">
                    <div className="h-full bg-card border-r border-border"><SystemMap /></div>
                  </PanelWrapper>
                </ResizablePanel>
                <ResizableHandle withHandle className="bg-border hover:bg-primary/30 transition-colors" />
                <ResizablePanel defaultSize={40} minSize={20}>
                  <PanelWrapper id="process" label="Processes">
                    <div className="h-full bg-card border-r border-border overflow-hidden"><ProcessTree /></div>
                  </PanelWrapper>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle withHandle className="bg-border hover:bg-primary/30 transition-colors" />
            <ResizablePanel defaultSize={34} minSize={22}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={55} minSize={25}>
                  <PanelWrapper id="network" label="Network">
                    <div className="h-full bg-card overflow-hidden"><NetworkGraph /></div>
                  </PanelWrapper>
                </ResizablePanel>
                <ResizableHandle withHandle className="bg-border hover:bg-primary/30 transition-colors" />
                <ResizablePanel defaultSize={45} minSize={25}>
                  <PanelWrapper id="timeline" label="Timeline">
                    <div className="h-full bg-card overflow-hidden"><Timeline /></div>
                  </PanelWrapper>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle withHandle className="bg-border hover:bg-primary/30 transition-colors" />
            <ResizablePanel defaultSize={28} minSize={18}>
              <PanelWrapper id="right" label="Panel">
                <div className="h-full flex flex-col bg-card overflow-hidden">
                  <div className="flex items-center border-b border-border flex-shrink-0 bg-card">
                    {tabItems.map((tab) => (
                      <button key={tab.id} onClick={() => setRightTab(tab.id)}
                        className={`flex items-center gap-1 px-2.5 py-2 text-[9px] font-mono uppercase tracking-wider transition-all border-b-2 ${rightTab === tab.id ? "text-primary border-primary bg-primary/5" : "text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/30"}`}>
                        {tab.icon} <span className="hidden xl:inline">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 min-h-0 relative overflow-hidden">{renderRightPanel()}</div>
                </div>
              </PanelWrapper>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
};

const SimulationPage = () => (
  <FullscreenProvider>
    <SimulationContent />
  </FullscreenProvider>
);

export default SimulationPage;
