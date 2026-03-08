import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useSimulationStore } from "@/store/simulation-store";
import { Play, Pause, RotateCcw, SkipForward, Gauge } from "lucide-react";
import type { Severity } from "@/lib/simulation-engine";

const severityDot: Record<Severity, string> = {
  normal: "bg-safe",
  suspicious: "bg-warning",
  malicious: "bg-destructive",
  user: "bg-info",
};

const Timeline = () => {
  const {
    scenario, currentTime, isPlaying, playbackSpeed,
    setIsPlaying, setPlaybackSpeed, setCurrentTime,
    setSelectedEvent, visibleEvents, reset, tick,
  } = useSimulationStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(tick, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, tick]);

  const handlePlay = useCallback(() => {
    if (currentTime < 0) setCurrentTime(0);
    setIsPlaying(!isPlaying);
  }, [currentTime, isPlaying, setCurrentTime, setIsPlaying]);

  const handleStepForward = useCallback(() => {
    if (!scenario) return;
    const nextEvent = scenario.events.find((e) => e.time > currentTime);
    if (nextEvent) setCurrentTime(nextEvent.time);
  }, [scenario, currentTime, setCurrentTime]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  const cycleSpeed = useCallback(() => {
    const speeds = [0.5, 1, 2, 4];
    const idx = speeds.indexOf(playbackSpeed);
    setPlaybackSpeed(speeds[(idx + 1) % speeds.length]);
  }, [playbackSpeed, setPlaybackSpeed]);

  if (!scenario) return null;

  const maxTime = Math.max(...scenario.events.map((e) => e.time)) + 2;
  const progress = currentTime >= 0 ? (currentTime / maxTime) * 100 : 0;

  return (
    <div className="h-full flex flex-col p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Timeline</h3>
        <div className="flex items-center gap-1">
          <button onClick={handleReset} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <RotateCcw size={14} />
          </button>
          <button onClick={handlePlay} className="p-1.5 rounded-md bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button onClick={handleStepForward} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <SkipForward size={14} />
          </button>
          <button onClick={cycleSpeed} className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors text-[10px] font-mono">
            <Gauge size={12} />
            {playbackSpeed}x
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-secondary rounded-full mb-3 cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          setCurrentTime(pct * maxTime);
        }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary rounded-full"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
        {scenario.events.map((evt) => (
          <div
            key={evt.id}
            className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-background ${severityDot[evt.severity]} cursor-pointer hover:scale-150 transition-transform`}
            style={{ left: `${(evt.time / maxTime) * 100}%`, transform: "translate(-50%, -50%)" }}
            onClick={(e) => { e.stopPropagation(); setCurrentTime(evt.time); setSelectedEvent(evt); }}
            title={evt.title}
          />
        ))}
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-auto space-y-1">
        {scenario.events.map((evt) => {
          const isVisible = visibleEvents.includes(evt);
          return (
            <button
              key={evt.id}
              onClick={() => { setCurrentTime(evt.time); setSelectedEvent(evt); }}
              className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-xs font-mono transition-all ${
                isVisible ? "bg-secondary/50 text-foreground" : "text-muted-foreground/40"
              } hover:bg-secondary`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isVisible ? severityDot[evt.severity] : "bg-muted"}`} />
              <span className="text-muted-foreground w-8 flex-shrink-0">{evt.time}s</span>
              <span className="truncate">{evt.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
