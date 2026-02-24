import { useState, useEffect } from "react";
import { useLogin, useRegister, useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, BrainCircuit, Target, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate({ email: formData.email, password: formData.password });
    } else {
      registerMutation.mutate(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left side - Visual/Marketing */}
      <div className="hidden md:flex flex-1 relative overflow-hidden bg-slate-950 items-center justify-center p-12">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        {/* landing page hero coding workspace */}
        <img
          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1920&h=1080&fit=crop"
          alt="Coding environment"
          className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay"
        />

        <div className="relative z-10 max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="p-3 bg-primary/20 rounded-2xl border border-primary/30 backdrop-blur-sm">
              <Code2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-display font-bold text-white tracking-tight">DevSim AI</h1>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl font-display font-bold text-white leading-tight mb-6"
          >
            Master your next <br/>
            <span className="text-gradient">technical interview.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-slate-300 mb-12"
          >
            Practice with an AI-powered simulator that adapts to your role, level, and tech stack. Get instant, actionable feedback.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 gap-6"
          >
            {[
              { icon: BrainCircuit, title: "Smart Questions", desc: "Tailored to your exact stack" },
              { icon: Target, title: "Real-time Feedback", desc: "Identify gaps immediately" },
              { icon: Trophy, title: "Score Tracking", desc: "Measure your improvement" }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center justify-center gap-2 mb-8 text-primary">
            <Code2 className="w-8 h-8" />
            <span className="font-display font-bold text-2xl text-foreground">DevSim AI</span>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="glass-panel border-border/50 shadow-2xl">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold text-center">
                  {isLogin ? "Welcome back" : "Create an account"}
                </CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                  {isLogin 
                    ? "Enter your credentials to access your dashboard" 
                    : "Sign up to start practicing interviews"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        placeholder="John Doe" 
                        required 
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-background/50 border-border focus:border-primary focus:ring-primary/20 transition-all"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="john@example.com" 
                      required 
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-background/50 border-border focus:border-primary focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {isLogin && <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>}
                    </div>
                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      required 
                      value={formData.password}
                      onChange={handleChange}
                      className="bg-background/50 border-border focus:border-primary focus:ring-primary/20 transition-all"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-6 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5"
                    disabled={loginMutation.isPending || registerMutation.isPending}
                  >
                    {loginMutation.isPending || registerMutation.isPending 
                      ? "Processing..." 
                      : isLogin ? "Sign In" : "Create Account"}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                  </span>
                  <button 
                    onClick={() => setIsLogin(!isLogin)} 
                    className="text-primary font-medium hover:underline transition-all"
                  >
                    {isLogin ? "Sign up" : "Log in"}
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
