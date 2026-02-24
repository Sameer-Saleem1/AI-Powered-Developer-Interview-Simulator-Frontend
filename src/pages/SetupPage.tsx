import { useState } from "react";
import { useCreateSession } from "@/hooks/use-interviews";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CheckCircle2, PlayCircle, Code2, Database, Layout } from "lucide-react";

const ROLES = [
  { id: "Frontend", icon: Layout, desc: "React, Vue, CSS, Browser API" },
  { id: "Backend", icon: Database, desc: "Node, Python, DBs, System Design" },
  { id: "Full Stack", icon: Code2, desc: "End-to-end architecture & coding" },
];

const LEVELS = ["Junior", "Mid", "Senior"];

const TECH_STACK_OPTIONS = [
  "React", "Vue", "Angular", "Next.js", 
  "Node.js", "Python", "Django", "Go", "Java", "Spring",
  "PostgreSQL", "MongoDB", "Redis",
  "AWS", "Docker", "Kubernetes",
  "TypeScript", "GraphQL", "REST APIs"
];

export default function SetupPage() {
  const [role, setRole] = useState("Frontend");
  const [level, setLevel] = useState("Mid");
  const [techStack, setTechStack] = useState<string[]>(["React", "TypeScript"]);
  
  const createMutation = useCreateSession();

  const toggleTech = (tech: string) => {
    setTechStack(prev => 
      prev.includes(tech) 
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  const handleStart = () => {
    if (techStack.length === 0) return;
    createMutation.mutate({ role, level, techStack });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-display font-bold tracking-tight"
        >
          Configure Interview
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-muted-foreground mt-1"
        >
          Customize the AI interviewer to match your target position.
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      >
        <Card className="glass-panel overflow-hidden border-primary/20">
          <CardHeader className="bg-primary/5 border-b border-border/50 pb-6">
            <CardTitle>1. Select Role</CardTitle>
            <CardDescription>What type of engineering role are you interviewing for?</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ROLES.map((r) => {
                const isSelected = role === r.id;
                return (
                  <div 
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`
                      relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                      flex flex-col items-center text-center gap-3
                      ${isSelected 
                        ? "border-primary bg-primary/10 shadow-md shadow-primary/10" 
                        : "border-border hover:border-primary/50 hover:bg-white/5"
                      }
                    `}
                  >
                    {isSelected && <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-primary" />}
                    <div className={`p-3 rounded-full ${isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                      <r.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{r.id}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      >
        <Card className="glass-panel">
          <CardHeader className="pb-4">
            <CardTitle>2. Experience Level</CardTitle>
            <CardDescription>Questions scale in complexity based on level.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={level} onValueChange={setLevel} className="flex flex-col md:flex-row gap-4">
              {LEVELS.map((l) => (
                <div key={l} className="flex items-center space-x-2 border border-border/50 rounded-lg p-4 flex-1 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setLevel(l)}>
                  <RadioGroupItem value={l} id={`level-${l}`} />
                  <Label htmlFor={`level-${l}`} className="flex-1 cursor-pointer font-medium">{l}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      >
        <Card className="glass-panel">
          <CardHeader className="pb-4">
            <CardTitle>3. Tech Stack</CardTitle>
            <CardDescription>Select the specific technologies you want to be tested on.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {TECH_STACK_OPTIONS.map((tech) => {
                const isSelected = techStack.includes(tech);
                return (
                  <Badge 
                    key={tech}
                    variant={isSelected ? "default" : "outline"}
                    className={`
                      cursor-pointer px-3 py-1.5 text-sm transition-all duration-200
                      ${isSelected 
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20" 
                        : "hover:border-primary/50 hover:bg-white/5 text-muted-foreground"
                      }
                    `}
                    onClick={() => toggleTech(tech)}
                  >
                    {tech}
                  </Badge>
                );
              })}
            </div>
            {techStack.length === 0 && (
              <p className="text-sm text-destructive mt-3">Please select at least one technology.</p>
            )}
          </CardContent>
          <CardFooter className="bg-muted/30 border-t border-border/50 pt-6 mt-4 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Interview will consist of 5 technical questions.
            </div>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200 rounded-xl px-8"
              onClick={handleStart}
              disabled={techStack.length === 0 || createMutation.isPending}
            >
              {createMutation.isPending ? "Preparing..." : "Start Interview"}
              {!createMutation.isPending && <PlayCircle className="w-5 h-5 ml-2" />}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
