import { Suspense } from "react";
import { Navigate, Route, Routes, useRoutes } from "react-router-dom";
import routes from "tempo-routes";

// Authentication components
import LoginForm from "./components/auth/LoginForm";
import SignUpForm from "./components/auth/SignUpForm";

// Page components
import Dashboard from "./components/pages/dashboard";
import Sessions from "./components/pages/sessions";
import Feedback from "./components/pages/feedback";
import Success from "./components/pages/success";
import Home from "./components/pages/home";
import Supervisors from "./components/pages/supervisors";
import SupervisorDetail from "./components/pages/supervisor-detail";
import AdminDashboard from "./components/pages/admin/AdminDashboard";
import Profile from "./components/pages/profile";
import Settings from "./components/pages/settings";
import Notifications from "./components/pages/notifications";
import SearchPage from "./components/pages/search";

// Providers and UI components
import { AuthProvider, useAuth } from "../supabase/auth";
import { Toaster } from "./components/ui/toaster";
import { SidebarProvider } from "./context/SidebarContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";

/**
 * PrivateRoute Component
 * 
 * This component controls access to protected routes.
 * If a user is not logged in, they will be redirected to the home page.
 * If authentication is still loading, a loading indicator is shown.
 * 
 * @param {React.ReactNode} children - The components to render if authenticated
 * @returns The children if authenticated, otherwise redirects to home
 */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Show loading indicator while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect to home if not authenticated
  if (!user) {
    return <Navigate to="/" />;
  }

  // User is authenticated, render the protected route
  return <>{children}</>;
}

/**
 * RedirectToDashboard Component
 * 
 * This component handles the root path routing logic.
 * If a user is logged in, they are redirected to the dashboard.
 * Otherwise, they see the home page.
 * 
 * @returns Appropriate component based on authentication status
 */
function RedirectToDashboard() {
  const { user, loading } = useAuth();

  // Show loading indicator while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect to dashboard if authenticated
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  // User is not authenticated, show the home page
  return <Home />;
}

/**
 * AppRoutes Component
 * 
 * This component defines all the application routes.
 * It uses the PrivateRoute component to protect authenticated routes.
 * 
 * @returns The application's routing configuration
 */
function AppRoutes() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<RedirectToDashboard />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/success" element={<Success />} />
        
        {/* Protected routes - only accessible when logged in */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/sessions"
          element={
            <PrivateRoute>
              <Sessions />
            </PrivateRoute>
          }
        />
        <Route
          path="/supervisors"
          element={
            <PrivateRoute>
              <Supervisors />
            </PrivateRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <PrivateRoute>
              <Feedback />
            </PrivateRoute>
          }
        />
        <Route
          path="/supervisors/:id"
          element={
            <PrivateRoute>
              <SupervisorDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          }
        />
        <Route
          path="/search"
          element={
            <PrivateRoute>
              <SearchPage />
            </PrivateRoute>
          }
        />
      </Routes>
      
      {/* Development routes for Tempo - only available in development mode */}
      {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
    </>
  );
}

/**
 * App Component
 * 
 * The main application component that sets up all required providers.
 * The providers are nested in a specific order to ensure proper functionality.
 * 
 * Provider hierarchy:
 * 1. AuthProvider - Manages user authentication state
 * 2. ThemeProvider - Manages light/dark theme preferences
 * 3. LanguageProvider - Manages language/localization settings
 * 4. SidebarProvider - Manages sidebar state (open/closed)
 * 
 * @returns The fully configured application with all providers
 */
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <SidebarProvider>
            <Suspense fallback={<p>Loading...</p>}>
              <AppRoutes />
            </Suspense>
            <Toaster />
          </SidebarProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
