/* Editorial Control Room: one persistent shell, explicit routes, and no navigation dead ends. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Occupancy from "./pages/Occupancy";
import Policies from "./pages/Policies";
import NotFound from "./pages/NotFound";

function Router() {
  return <Switch>
    <Route path="/" component={Dashboard} />
    <Route path="/employees" component={Employees} />
    <Route path="/attendance" component={Attendance} />
    <Route path="/leave" component={Leave} />
    <Route path="/occupancy" component={Occupancy} />
    <Route path="/policies" component={Policies} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

function App() {
  return <ErrorBoundary>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </ThemeProvider>
  </ErrorBoundary>;
}

export default App;

