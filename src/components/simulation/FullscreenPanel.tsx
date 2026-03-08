import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize2 } from "lucide-react";

interface FullscreenContextType {
  fullscreenPanel: string | null;
  setFullscreen: (id: string | null) => void;
}

const FullscreenContext = createContext<FullscreenContextType>({
  fullscreenPanel: null,
  setFullscreen: () => {},
});

export const FullscreenProvider = ({ children }: { children: ReactNode }) => {
  const [fullscreenPanel, setFullscreen] = useState<string | null>(null);
  return (
    <FullscreenContext.Provider value={{ fullscreenPanel, setFullscreen }}>
      {children}
    </FullscreenContext.Provider>
  );
};

export const useFullscreen = () => useContext(FullscreenContext);

interface FullscreenPanelProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export const FullscreenPanel = ({ id, children, className = "" }: FullscreenPanelProps) => {
  const { fullscreenPanel, setFullscreen } = useFullscreen();
  const isFullscreen = fullscreenPanel === id;
  const isHidden = fullscreenPanel !== null && fullscreenPanel !== id;

  const toggle = useCallback(() => {
    setFullscreen(isFullscreen ? null : id);
  }, [id, isFullscreen, setFullscreen]);

  if (isHidden) return null;

  return (
    <div className={`relative h-full ${isFullscreen ? "fixed inset-0 z-40 bg-card" : ""} ${className}`}>
      {children}
      <button
        onClick={toggle}
        className="absolute top-2 right-2 z-20 p-1 rounded-md bg-secondary/80 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
        style={{ opacity: undefined }}
        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
      </button>
    </div>
  );
};

// Simpler button that can be placed anywhere
export const FullscreenToggle = ({ panelId }: { panelId: string }) => {
  const { fullscreenPanel, setFullscreen } = useFullscreen();
  const isFullscreen = fullscreenPanel === panelId;

  return (
    <button
      onClick={() => setFullscreen(isFullscreen ? null : panelId)}
      className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
      title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
    >
      {isFullscreen ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
    </button>
  );
};
