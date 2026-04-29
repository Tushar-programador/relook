import { LoaderCircle } from "lucide-react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/auth-context.jsx";
import { AuthPage } from "./pages/auth-page.jsx";
import { DashboardPage } from "./pages/dashboard-page.jsx";
import { HomePage } from "./pages/home-page.jsx";
import { ProjectPage } from "./pages/project-page.jsx";
import { PublicFeedbackPage } from "./pages/public-feedback-page.jsx";
import { WidgetPage } from "./pages/widget-page.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <ProjectPage />
          </ProtectedRoute>
        }
      />
      <Route path="/feedback/:slug" element={<PublicFeedbackPage />} />
      <Route path="/widget/:slug" element={<WidgetPage />} />
    </Routes>
  );
}