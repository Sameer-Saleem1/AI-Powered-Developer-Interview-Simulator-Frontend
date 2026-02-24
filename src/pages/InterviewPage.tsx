import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useSession, useSubmitAnswer } from "@/hooks/use-interviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Send,
  ArrowRight,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InterviewPage() {
  const params = useParams();
  const sessionId = Number(params.id);
  const [, setLocation] = useLocation();

  const { data, isLoading, error, refetch } = useSession(sessionId);
  const submitMutation = useSubmitAnswer();

  const [answerDraft, setAnswerDraft] = useState("");
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const hasInitialized = useRef(false);

  // Debug: Log session ID and loading state
  useEffect(() => {
    console.log(
      "[InterviewPage] Session ID:",
      sessionId,
      "Loading:",
      isLoading,
      "Error:",
      error?.message,
      "Data:",
      data,
      "Active Index:",
      activeQuestionIdx,
    );
    // Warn if session ID is invalid
    if (!sessionId || isNaN(sessionId)) {
      console.error("[InterviewPage] Invalid session ID:", params.id);
    }
  }, [sessionId, isLoading, error, data, params.id, activeQuestionIdx]);

  // Initialize to first unanswered question ONCE on initial load only
  useEffect(() => {
    if (data?.questions && !hasInitialized.current) {
      hasInitialized.current = true;

      // Find first unanswered question
      const unansweredIdx = data.questions.findIndex((q: any) => !q.answerText);

      if (unansweredIdx === -1) {
        // All questions answered, redirect to results
        if (data.session.totalScore !== null) {
          setLocation(`/results/${sessionId}`);
        }
      } else if (unansweredIdx > 0) {
        // Start from first unanswered question if not at beginning
        setActiveQuestionIdx(unansweredIdx);
      }
    }
  }, [data?.questions, sessionId, setLocation]);

  // Reset answerDraft when the active question changes
  useEffect(() => {
    setAnswerDraft("");
  }, [activeQuestionIdx]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          Loading interview context...
        </p>
        <p className="text-xs text-muted-foreground">Session ID: {sessionId}</p>
      </div>
    );
  }

  if (error || !data) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const apiUrl = (import.meta.env.VITE_API_URL as string) || "Not configured";

    console.error("[InterviewPage] Full error state:", {
      error,
      data,
      sessionId,
      errorMessage,
      apiUrl,
    });

    return (
      <div className="max-w-2xl mx-auto pt-8 space-y-4">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Error Loading Interview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-background rounded-lg border border-destructive/20 font-mono text-xs space-y-2">
              <p className="text-destructive/90">
                <strong>Error:</strong> {errorMessage}
              </p>
              <p className="text-muted-foreground">
                <strong>Session ID:</strong> {sessionId || "Not found"}
              </p>
              <p className="text-muted-foreground break-all">
                <strong>API URL:</strong> {apiUrl}
              </p>
              <p className="text-muted-foreground">
                <strong>Endpoint:</strong> {apiUrl}/api/sessions/{sessionId}
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Troubleshooting tips:
              </p>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li>Check browser DevTools Console for detailed API logs</li>
                <li>Check Network tab - verify the request is being made</li>
                <li>Verify backend is running at the API URL</li>
                <li>Check if CORS is enabled on the backend</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => refetch()} className="flex-1">
                Retry
              </Button>
              <Button
                onClick={() => setLocation("/")}
                variant="outline"
                className="flex-1"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { session, questions } = data;
  const currentQuestion = questions[activeQuestionIdx];
  const totalQuestions = questions.length || 5;

  // Calculate progress based on answered questions, not current index
  const answeredCount = questions.filter((q: any) => q.answerText).length;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  console.log(
    `[Progress] ${answeredCount}/${totalQuestions} answered (${progressPercent.toFixed(0)}%)`,
  );

  const isAnswered = !!currentQuestion?.answerText;

  const handleSubmit = () => {
    if (!answerDraft.trim() || !currentQuestion) return;
    submitMutation.mutate(
      {
        questionId: currentQuestion.id,
        answerText: answerDraft,
      },
      {
        onSuccess: () => {
          // Clear the draft after successful submission
          setAnswerDraft("");
        },
      },
    );
  };

  const handleNext = () => {
    if (activeQuestionIdx === totalQuestions - 1) {
      setLocation(`/results/${sessionId}`);
    } else {
      setActiveQuestionIdx((prev) => prev + 1);
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Header / Progress */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold">
              {session.role} Interview
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {session.level}
              </Badge>
              <span className="text-muted-foreground text-sm">
                Question {activeQuestionIdx + 1} of {totalQuestions}
              </span>
              <span className="text-muted-foreground text-xs">
                • {answeredCount} answered
              </span>
            </div>
          </div>
        </div>
        <Progress value={progressPercent} className="h-2 bg-muted/50" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="glass-panel border-primary/20 shadow-2xl">
            <CardHeader className="bg-primary/5 border-b border-border/50 pb-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-xl text-primary shrink-0">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl leading-relaxed text-foreground">
                    {currentQuestion.questionText}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {!isAnswered ? (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Type your detailed answer here. Focus on clarity, architecture, and tradeoffs..."
                    className="min-h-[250px] resize-y bg-background/50 border-border focus:border-primary focus:ring-primary/20 p-4 text-base leading-relaxed"
                    value={answerDraft}
                    onChange={(e) => setAnswerDraft(e.target.value)}
                    disabled={submitMutation.isPending}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmit}
                      disabled={!answerDraft.trim() || submitMutation.isPending}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 px-8 rounded-xl"
                    >
                      {submitMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" /> Submit Answer
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="p-4 rounded-xl bg-muted/30 border border-border">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Your Answer
                    </h4>
                    <p className="whitespace-pre-wrap text-foreground/90">
                      {currentQuestion.answerText}
                    </p>
                  </div>

                  <div
                    className={`p-5 rounded-xl border relative overflow-hidden ${
                      currentQuestion.score && currentQuestion.score >= 15
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : currentQuestion.score && currentQuestion.score >= 10
                          ? "bg-amber-500/10 border-amber-500/30"
                          : "bg-destructive/10 border-destructive/30"
                    }`}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Sparkles className="w-24 h-24" />
                    </div>

                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                        <Brain className="w-4 h-4" /> AI Feedback
                      </h4>
                      <Badge
                        variant="outline"
                        className={`font-bold text-lg px-3 py-1 ${
                          currentQuestion.score && currentQuestion.score >= 15
                            ? "text-emerald-500 border-emerald-500/50"
                            : currentQuestion.score &&
                                currentQuestion.score >= 10
                              ? "text-amber-500 border-amber-500/50"
                              : "text-destructive border-destructive/50"
                        }`}
                      >
                        {currentQuestion.score} / 20
                      </Badge>
                    </div>
                    <p className="whitespace-pre-wrap text-foreground relative z-10 leading-relaxed">
                      {currentQuestion.aiFeedback}
                    </p>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleNext}
                      className="bg-foreground text-background hover:bg-foreground/90 px-8 rounded-xl"
                    >
                      {activeQuestionIdx === totalQuestions - 1
                        ? "Finish Interview"
                        : "Next Question"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
