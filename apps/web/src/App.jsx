import { LoaderCircle } from "lucide-react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/auth-context.jsx";
import { AboutPage } from "./pages/about-page.jsx";
import { AuthPage } from "./pages/auth-page.jsx";
import { DashboardPage } from "./pages/dashboard-page.jsx";
import { FeaturesPage } from "./pages/features-page.jsx";
import { HomePage } from "./pages/home-page.jsx";
import { ContactPage } from "./pages/contact-page.jsx";
import { ForgotPasswordPage } from "./pages/forgot-password-page.jsx";
import { NotFoundPage } from "./pages/not-found-page.jsx";
import { PricingPage } from "./pages/pricing-page.jsx";
import { ProjectPage } from "./pages/project-page.jsx";
import { PublicFeedbackPage } from "./pages/public-feedback-page.jsx";
import { VerifyEmailPage } from "./pages/verify-email-page.jsx";
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
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}