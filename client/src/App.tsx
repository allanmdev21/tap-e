import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Walk from "@/pages/Walk";
import Ranking from "@/pages/Ranking";
import Dashboards from "@/pages/Dashboards";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import Friends from "@/pages/Friends";
import BottomNav from "@/components/BottomNav";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/walk" component={Walk} />
      <Route path="/ranking" component={Ranking} />
      <Route path="/friends" component={Friends} />
      <Route path="/profile" component={Profile} />
      <Route path="/dashboards" component={Dashboards} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="relative min-h-screen bg-background text-foreground">
            <Router />
            <BottomNav />
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
