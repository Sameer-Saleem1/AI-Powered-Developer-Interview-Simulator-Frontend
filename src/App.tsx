import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";

// Components & Pages
import { AppLayout } from "@/components/AppLayout";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import SetupPage from "@/pages/SetupPage";
import InterviewPage from "@/pages/InterviewPage";
import ResultsPage from "@/pages/ResultsPage";
import NotFound from "@/pages/not-found";

/**
 * Route wrapper that requires authentication
 */
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected Routes inside AppLayout */}
      <Route path="/">
        <AppLayout>
          <ProtectedRoute component={DashboardPage} />
        </AppLayout>
      </Route>
      
      <Route path="/setup">
        <AppLayout>
          <ProtectedRoute component={SetupPage} />
        </AppLayout>
      </Route>

      <Route path="/interview/:id">
        <AppLayout>
          <ProtectedRoute component={InterviewPage} />
        </AppLayout>
      </Route>

      <Route path="/results/:id">
        <AppLayout>
          <ProtectedRoute component={ResultsPage} />
        </AppLayout>
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
