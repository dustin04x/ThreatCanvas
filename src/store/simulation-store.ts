import { create } from "zustand";
import type { AttackScenario, SimulationEvent } from "@/lib/simulation-engine";

interface SimulationState {
  scenario: AttackScenario | null;
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  selectedEvent: SimulationEvent | null;
  visibleEvents: SimulationEvent[];
  beginnerMode: boolean;

  setScenario: (scenario: AttackScenario) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setSelectedEvent: (event: SimulationEvent | null) => void;
  setBeginnerMode: (mode: boolean) => void;
  tick: () => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  scenario: null,
  currentTime: -1,
  isPlaying: false,
  playbackSpeed: 1,
  selectedEvent: null,
  visibleEvents: [],
  beginnerMode: true,

  setScenario: (scenario) =>
    set({ scenario, currentTime: -1, isPlaying: false, visibleEvents: [], selectedEvent: null }),

  setCurrentTime: (time) => {
    const { scenario } = get();
    if (!scenario) return;
    const visible = scenario.events.filter((e) => e.time <= time);
    set({ currentTime: time, visibleEvents: visible });
  },

  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  setBeginnerMode: (mode) => set({ beginnerMode: mode }),

  tick: () => {
    const { currentTime, scenario, playbackSpeed } = get();
    if (!scenario) return;
    const maxTime = Math.max(...scenario.events.map((e) => e.time)) + 2;
    const newTime = Math.min(currentTime + 0.1 * playbackSpeed, maxTime);
    const visible = scenario.events.filter((e) => e.time <= newTime);
    if (newTime >= maxTime) {
      set({ currentTime: newTime, visibleEvents: visible, isPlaying: false });
    } else {
      set({ currentTime: newTime, visibleEvents: visible });
    }
  },

  reset: () => set({ currentTime: -1, isPlaying: false, visibleEvents: [], selectedEvent: null }),
}));
