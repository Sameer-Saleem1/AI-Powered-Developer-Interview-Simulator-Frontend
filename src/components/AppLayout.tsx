import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  PlayCircle, 
  LogOut, 
  Code2, 
  UserCircle,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const logout = useLogout();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/setup", label: "New Interview", icon: PlayCircle },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border/50 glass-panel sticky top-0 z-50">
        <div className="flex items-center gap-2 text-primary">
          <Code2 className="w-6 h-6" />
          <span className="font-display font-bold text-lg text-foreground">DevSim AI</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-foreground">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 transition-transform duration-300 ease-in-out
        fixed md:sticky top-0 left-0 h-screen w-64 glass-panel border-r border-border/50 z-40
        flex flex-col
      `}>
        <div className="p-6 hidden md:flex items-center gap-3 text-primary">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Code2 className="w-6 h-6" />
          </div>
          <span className="font-display font-bold text-xl text-foreground tracking-wide">DevSim AI</span>
        </div>

        <div className="flex-1 px-4 py-6 md:py-2 flex flex-col gap-2 overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 ml-2">Menu</p>
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <div className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer
                  ${isActive 
                    ? "bg-primary/10 text-primary shadow-sm shadow-primary/5" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }
                `}>
                  <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border/50 mt-auto">
          <div className="flex items-center gap-3 px-2 py-2 mb-4">
            <Avatar className="w-10 h-10 border border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {user?.name?.charAt(0).toUpperCase() || <UserCircle />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold truncate">{user?.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden min-h-screen relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
