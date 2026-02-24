import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { useSession } from "@/hooks/use-interviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Home,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function ResultsPage() {
  const params = useParams();
  const sessionId = Number(params.id);
  const { data, isLoading } = useSession(sessionId);
  const [hasFiredConfetti, setHasFiredConfetti] = useState(false);

  useEffect(() => {
    if (
      data?.session?.totalScore !== null &&
      data?.session?.totalScore >= 70 &&
      !hasFiredConfetti
    ) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#818cf8", "#c084fc", "#34d399"],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#818cf8", "#c084fc", "#34d399"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
      setHasFiredConfetti(true);
    }
  }, [data, hasFiredConfetti]);

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { session, questions } = data;
  const score = session.totalScore || 0;

  let performanceTier = {
    label: "Needs Improvement",
    color: "text-destructive",
    bg: "bg-destructive/10",
  };
  if (score >= 80)
    performanceTier = {
      label: "Excellent",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    };
  else if (score >= 60)
    performanceTier = {
      label: "Good",
      color: "text-primary",
      bg: "bg-primary/10",
    };
  else if (score >= 40)
    performanceTier = {
      label: "Fair",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-panel overflow-hidden relative border-primary/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>

          <CardContent className="pt-10 pb-10 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <Badge
                variant="outline"
                className="bg-background/50 backdrop-blur-md mb-2"
              >
                {session.role} • {session.level}
              </Badge>
              <h1 className="text-4xl font-display font-bold text-foreground">
                Interview Results
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto md:mx-0 text-lg">
                You've completed the {session.role} practice interview. Here is
                your comprehensive performance breakdown.
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-4">
                {session.techStack?.map((tech: string) => (
                  <Badge key={tech} variant="secondary" className="bg-white/5">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-center justify-center p-8 bg-background/40 backdrop-blur-md rounded-full border border-border shadow-2xl relative w-48 h-48">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  className="stroke-muted fill-none stroke-[8]"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  className={`fill-none stroke-[8] ${performanceTier.color.replace("text-", "stroke-")} transition-all duration-1000 ease-out`}
                  strokeDasharray="553"
                  strokeDashoffset={553 - (553 * score) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex flex-col items-center justify-center absolute inset-0">
                <span className="text-5xl font-display font-bold text-foreground">
                  {score}
                </span>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-1">
                  out of 100
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> AI Overall
              Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`p-4 rounded-xl border ${performanceTier.bg.replace("bg-", "border-").replace("/10", "/30")} ${performanceTier.bg}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-bold ${performanceTier.color}`}>
                  {performanceTier.label} Performance
                </span>
              </div>
              <p className="text-foreground leading-relaxed">
                {session.summary ||
                  "You demonstrated a solid understanding of basic concepts, but there are areas where deeper architectural knowledge would improve your answers. Review the question-by-question breakdown below to see specific feedback on code structure, edge cases, and best practices."}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Question Breakdown */}
      <div className="space-y-6">
        <h3 className="text-2xl font-display font-bold mt-8 mb-4">
          Question Breakdown
        </h3>

        {questions.map((q: any, i: number) => {
          const qScore = q.score || 0;
          const isGood = qScore >= 14;
          const isWarning = qScore >= 8 && qScore < 14;

          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <Card className="glass-panel overflow-hidden border-border/50">
                <div
                  className={`h-1 w-full ${isGood ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-destructive"}`}
                ></div>
                <CardHeader className="pb-2 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Question {i + 1}
                    </div>
                    <CardTitle className="text-lg leading-snug">
                      {q.questionText}
                    </CardTitle>
                  </div>
                  <div className="shrink-0 flex flex-col items-end">
                    <Badge
                      variant="outline"
                      className={`text-base px-3 py-1 font-bold ${
                        isGood
                          ? "text-emerald-500 border-emerald-500/50"
                          : isWarning
                            ? "text-amber-500 border-amber-500/50"
                            : "text-destructive border-destructive/50"
                      }`}
                    >
                      {qScore} / 20
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground/80 line-clamp-3 hover:line-clamp-none transition-all">
                    <span className="font-semibold text-muted-foreground block mb-1">
                      Your Answer:
                    </span>
                    {q.answerText}
                  </div>
                  <div className="flex items-start gap-3 mt-4">
                    {isGood ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : isWarning ? (
                      <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm leading-relaxed text-foreground/90">
                      <span className="font-semibold block mb-1">
                        Feedback:
                      </span>
                      {q.aiFeedback}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-center pt-8 pb-12">
        <Link href="/">
          <Button
            size="lg"
            className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-8 shadow-xl"
          >
            <Home className="w-4 h-4 mr-2" /> Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
