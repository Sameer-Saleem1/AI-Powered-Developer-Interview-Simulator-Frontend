import { useAuth } from "@/hooks/use-auth";
import { useSessions } from "@/hooks/use-interviews";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from "recharts";
import { PlayCircle, Target, TrendingUp, Clock, AlertCircle, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: sessions, isLoading } = useSessions();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-muted rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-xl"></div>)}
        </div>
        <div className="h-64 bg-muted rounded-xl"></div>
      </div>
    );
  }

  const completedSessions = sessions?.filter((s: any) => s.totalScore !== null) || [];
  const averageScore = completedSessions.length > 0 
    ? Math.round(completedSessions.reduce((acc: number, curr: any) => acc + curr.totalScore, 0) / completedSessions.length) 
    : 0;
  
  const bestScore = completedSessions.length > 0 
    ? Math.max(...completedSessions.map((s: any) => s.totalScore)) 
    : 0;

  // Prepare data for chart
  const chartData = completedSessions.slice(-10).map((s: any, idx: number) => ({
    name: `Int ${idx + 1}`,
    score: s.totalScore,
    role: s.role
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1 variants={itemVariants} className="text-3xl font-display font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </motion.h1>
          <motion.p variants={itemVariants} className="text-muted-foreground mt-1">
            Here's a summary of your interview performance.
          </motion.p>
        </div>
        <motion.div variants={itemVariants}>
          <Link href="/setup">
            <Button className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200 rounded-xl px-6">
              <PlayCircle className="w-4 h-4 mr-2" />
              New Interview
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="glass-panel overflow-hidden relative">
            <div className="absolute right-0 top-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Interviews</CardTitle>
              <Target className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedSessions.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Sessions completed</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-panel overflow-hidden relative">
             <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{averageScore}<span className="text-lg text-muted-foreground font-normal">/100</span></div>
              <p className="text-xs text-muted-foreground mt-1">Across all roles</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-panel overflow-hidden relative">
            <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Best Score</CardTitle>
              <Trophy className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{bestScore}<span className="text-lg text-muted-foreground font-normal">/100</span></div>
              <p className="text-xs text-muted-foreground mt-1">Personal record</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-panel h-full">
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
              <CardDescription>Your scores over the last 10 interviews</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <RechartsTooltip 
                      cursor={{fill: 'var(--muted)'}}
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                    />
                    <Bar dataKey="score" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                  <p>Not enough data yet.</p>
                  <p className="text-sm">Complete an interview to see trends.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent History */}
        <motion.div variants={itemVariants}>
          <Card className="glass-panel h-full flex flex-col">
            <CardHeader>
              <CardTitle>Recent Interviews</CardTitle>
              <CardDescription>Your latest practice sessions</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {sessions?.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No sessions yet.
                  </div>
                ) : (
                  sessions?.slice().reverse().slice(0, 5).map((session: any) => (
                    <Link key={session.id} href={session.totalScore === null ? `/interview/${session.id}` : `/results/${session.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm group-hover:text-primary transition-colors">{session.role}</span>
                            <Badge variant="outline" className="text-[10px] h-5">{session.level}</Badge>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {format(new Date(session.createdAt || new Date()), "MMM d, yyyy")}
                          </div>
                        </div>
                        <div className="flex items-center">
                          {session.totalScore !== null ? (
                            <div className={`font-bold ${session.totalScore >= 70 ? 'text-emerald-500' : session.totalScore >= 50 ? 'text-amber-500' : 'text-destructive'}`}>
                              {session.totalScore}
                            </div>
                          ) : (
                            <Badge className="bg-primary/20 text-primary hover:bg-primary/30">In Progress</Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
