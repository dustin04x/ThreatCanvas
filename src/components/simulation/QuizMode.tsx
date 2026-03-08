import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSimulationStore } from "@/store/simulation-store";
import { HelpCircle, CheckCircle, XCircle, Trophy, RotateCcw } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  mitreId?: string;
}

const generateQuestions = (scenario: ReturnType<typeof useSimulationStore.getState>["scenario"]): Question[] => {
  if (!scenario) return [];
  const qs: Question[] = [];

  // Q1: Attack vector
  const firstEvent = scenario.events[0];
  if (firstEvent) {
    qs.push({
      question: `How does ${scenario.name} initially gain access to the system?`,
      options: [
        firstEvent.title,
        "Brute force password attack",
        "Physical USB device",
        "Bluetooth exploit",
      ].sort(() => Math.random() - 0.5),
      correctIndex: -1, // Will be set below
      explanation: firstEvent.beginnerExplanation || firstEvent.description,
      mitreId: firstEvent.mitreId,
    });
    qs[0].correctIndex = qs[0].options.indexOf(firstEvent.title);
  }

  // Q2: Identify malicious technique
  const malEvents = scenario.events.filter((e) => e.severity === "malicious" && e.mitreId);
  if (malEvents.length >= 2) {
    const target = malEvents[Math.floor(Math.random() * malEvents.length)];
    qs.push({
      question: `What is the MITRE ATT&CK ID for "${target.title}"?`,
      options: [
        target.mitreId!,
        "T1595",
        "T1078",
        "T1070.004",
      ].sort(() => Math.random() - 0.5),
      correctIndex: -1,
      explanation: `${target.mitreId} — ${target.mitreName}. ${target.technicalExplanation || target.description}`,
      mitreId: target.mitreId,
    });
    qs[1].correctIndex = qs[1].options.indexOf(target.mitreId!);
  }

  // Q3: Purpose question
  const persistEvent = scenario.events.find((e) => e.type === "persistence");
  if (persistEvent) {
    qs.push({
      question: "Why does malware establish persistence?",
      options: [
        "To survive system reboots",
        "To speed up the CPU",
        "To update Windows",
        "To improve network speed",
      ],
      correctIndex: 0,
      explanation: persistEvent.beginnerExplanation || "Persistence ensures the malware remains active even after the computer is restarted.",
    });
  }

  // Q4: What type of attack
  qs.push({
    question: `What category of malware is ${scenario.name}?`,
    options: [
      scenario.category,
      "Adware",
      "Browser Extension",
      "System Optimizer",
    ].sort(() => Math.random() - 0.5),
    correctIndex: -1,
    explanation: `${scenario.name} is classified as ${scenario.category}. ${scenario.description}`,
  });
  qs[qs.length - 1].correctIndex = qs[qs.length - 1].options.indexOf(scenario.category);

  // Q5: Impact
  const impactEvent = scenario.events.find((e) =>
    e.type === "file_encrypt" || e.type === "ransom_note" || e.type === "network_exfiltrate" || e.type === "file_delete"
  );
  if (impactEvent) {
    qs.push({
      question: `What is the final impact of ${scenario.name}?`,
      options: [
        impactEvent.title,
        "System runs faster",
        "Free software installed",
        "Nothing happens",
      ].sort(() => Math.random() - 0.5),
      correctIndex: -1,
      explanation: impactEvent.beginnerExplanation || impactEvent.description,
    });
    qs[qs.length - 1].correctIndex = qs[qs.length - 1].options.indexOf(impactEvent.title);
  }

  return qs.filter((q) => q.correctIndex >= 0).slice(0, 5);
};

interface QuizModeProps {
  onClose: () => void;
}

const QuizMode = ({ onClose }: QuizModeProps) => {
  const { scenario } = useSimulationStore();
  const questions = useMemo(() => generateQuestions(scenario), [scenario]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(boolean | null)[]>(new Array(questions.length).fill(null));
  const [showResult, setShowResult] = useState(false);

  const question = questions[currentQ];
  const isAnswered = selected !== null;
  const isCorrect = selected === question?.correctIndex;
  const totalCorrect = answers.filter((a) => a === true).length;
  const isDone = showResult;

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelected(idx);
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx === question.correctIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelected(null);
    setAnswers(new Array(questions.length).fill(null));
    setShowResult(false);
  };

  if (!scenario || questions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-muted-foreground p-4">
        Play a simulation first to unlock the quiz.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border flex-shrink-0">
        <HelpCircle size={12} className="text-primary" />
        <h3 className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">Knowledge Quiz</h3>
        <button onClick={onClose} className="ml-auto text-[9px] font-mono text-muted-foreground hover:text-foreground px-2 py-0.5 rounded bg-secondary/50 border border-border">
          EXIT
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <AnimatePresence mode="wait">
          {isDone ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center py-6"
            >
              <Trophy size={32} className={totalCorrect >= questions.length * 0.7 ? "text-primary" : "text-warning"} />
              <h4 className="font-display font-bold text-lg mt-3">
                {totalCorrect}/{questions.length} Correct
              </h4>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                {totalCorrect === questions.length ? "Perfect score! You're a threat analyst!" :
                 totalCorrect >= questions.length * 0.7 ? "Great job! You understand the attack well." :
                 "Keep learning! Review the simulation again."}
              </p>
              <div className="flex gap-2">
                <button onClick={handleRestart} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-mono border border-primary/30 hover:bg-primary/20 transition-colors">
                  <RotateCcw size={12} /> Retry
                </button>
                <button onClick={onClose} className="px-3 py-1.5 rounded-md bg-secondary text-foreground text-xs font-mono border border-border hover:bg-secondary/80 transition-colors">
                  Done
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {/* Progress */}
              <div className="flex items-center gap-1.5">
                {questions.map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                    answers[i] === true ? "bg-safe" :
                    answers[i] === false ? "bg-destructive" :
                    i === currentQ ? "bg-primary" : "bg-secondary"
                  }`} />
                ))}
              </div>

              <div className="text-[9px] font-mono text-muted-foreground">
                Question {currentQ + 1} of {questions.length}
              </div>

              <h4 className="font-display font-semibold text-sm leading-snug">
                {question.question}
              </h4>

              {/* Options */}
              <div className="space-y-1.5">
                {question.options.map((opt, i) => {
                  const isThis = selected === i;
                  const isRight = i === question.correctIndex;
                  let style = "border-border bg-secondary/30 hover:border-primary/40 hover:bg-primary/5";
                  if (isAnswered) {
                    if (isRight) style = "border-safe/50 bg-safe/10";
                    else if (isThis && !isCorrect) style = "border-destructive/50 bg-destructive/10";
                    else style = "border-border/50 bg-secondary/10 opacity-50";
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(i)}
                      disabled={isAnswered}
                      className={`w-full flex items-center gap-2 p-2 rounded-md border text-xs font-mono text-left transition-all ${style}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center flex-shrink-0 text-[9px]">
                        {isAnswered && isRight ? <CheckCircle size={12} className="text-safe" /> :
                         isAnswered && isThis ? <XCircle size={12} className="text-destructive" /> :
                         String.fromCharCode(65 + i)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-2.5 rounded-md border text-[10px] leading-relaxed ${
                    isCorrect ? "bg-safe/5 border-safe/30 text-safe/90" : "bg-destructive/5 border-destructive/30 text-foreground/80"
                  }`}
                >
                  <p className="font-medium mb-1">{isCorrect ? "✓ Correct!" : "✗ Incorrect"}</p>
                  <p>{question.explanation}</p>
                  {question.mitreId && (
                    <a href={`https://attack.mitre.org/techniques/${question.mitreId.replace(".", "/")}/`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-block mt-1 text-primary hover:underline text-[9px]">
                      View {question.mitreId} on MITRE →
                    </a>
                  )}
                </motion.div>
              )}

              {isAnswered && (
                <button
                  onClick={handleNext}
                  className="w-full py-2 rounded-md bg-primary/10 text-primary text-xs font-mono border border-primary/30 hover:bg-primary/20 transition-colors"
                >
                  {currentQ < questions.length - 1 ? "Next Question →" : "See Results"}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizMode;
