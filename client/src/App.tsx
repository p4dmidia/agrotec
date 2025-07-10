import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/sidebar";

// Pages
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/auth/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Chat from "@/pages/chat";
import ImmersiveLearning from "@/pages/immersive-learning";
import EnhancedCalendar from "@/pages/calendar-enhanced";
import Weather from "@/pages/weather";
import WeatherSimple from "@/pages/weather-simple";
import Store from "@/pages/store";
import Settings from "@/pages/settings";
import Plans from "@/pages/plans";
import FarmRegister from "@/pages/farm-register";
import Admin from "@/pages/admin";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        {children}
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route>
          <NotFound />
        </Route>
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/">
        <AuthenticatedLayout>
          <Dashboard />
        </AuthenticatedLayout>
      </Route>
      <Route path="/dashboard">
        <AuthenticatedLayout>
          <Dashboard />
        </AuthenticatedLayout>
      </Route>
      <Route path="/chat">
        <AuthenticatedLayout>
          <Chat />
        </AuthenticatedLayout>
      </Route>
      <Route path="/learning">
        <AuthenticatedLayout>
          <ImmersiveLearning />
        </AuthenticatedLayout>
      </Route>
      <Route path="/calendar">
        <AuthenticatedLayout>
          <EnhancedCalendar />
        </AuthenticatedLayout>
      </Route>
      <Route path="/calendario">
        <AuthenticatedLayout>
          <EnhancedCalendar />
        </AuthenticatedLayout>
      </Route>
      <Route path="/weather">
        <AuthenticatedLayout>
          <WeatherSimple />
        </AuthenticatedLayout>
      </Route>
      <Route path="/weather-simple">
        <AuthenticatedLayout>
          <WeatherSimple />
        </AuthenticatedLayout>
      </Route>
      <Route path="/store">
        <AuthenticatedLayout>
          <Store />
        </AuthenticatedLayout>
      </Route>
      <Route path="/settings">
        <AuthenticatedLayout>
          <Settings />
        </AuthenticatedLayout>
      </Route>
      <Route path="/plans">
        <AuthenticatedLayout>
          <Plans />
        </AuthenticatedLayout>
      </Route>
      <Route path="/farm-register">
        <AuthenticatedLayout>
          <FarmRegister />
        </AuthenticatedLayout>
      </Route>
      <Route path="/admin">
        <AuthenticatedLayout>
          <Admin />
        </AuthenticatedLayout>
      </Route>
      <Route>
        <AuthenticatedLayout>
          <NotFound />
        </AuthenticatedLayout>
      </Route>
    </Switch>
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
