import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Scale, BookOpen, Plus, Home, BarChart } from "lucide-react";
import StudyPage from "@/pages/study";
import CustomQuestionsPage from "@/pages/custom-questions";
import StudyAnalyticsPage from "@/pages/study-analytics";
import NotFound from "@/pages/not-found";

function Navigation() {
  const [location] = useLocation();
  
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Scale className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">FO3 TheLawIsExplicit</h1>
              <p className="text-sm text-secondary">Philippine Bar Exam Review</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button
                variant={location === "/" ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Study</span>
              </Button>
            </Link>
            <Link href="/custom-questions">
              <Button
                variant={location === "/custom-questions" ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Custom Q&A</span>
              </Button>
            </Link>
            <Link href="/analytics">
              <Button
                variant={location === "/analytics" ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-2"
              >
                <BarChart className="w-4 h-4" />
                <span>Analytics</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <>
      <Navigation />
      <Switch>
        <Route path="/" component={StudyPage} />
        <Route path="/custom-questions" component={CustomQuestionsPage} />
        <Route path="/analytics" component={StudyAnalyticsPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
