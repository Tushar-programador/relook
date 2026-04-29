import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";

export function AuthPage({ mode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (mode === "login") {
        await login(form);
        navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
      } else {
        await register(form);
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardTitle>{mode === "login" ? "Welcome back" : "Create your workspace"}</CardTitle>
        <CardDescription className="mt-2">
          {mode === "login" ? "Sign in to manage projects and testimonials." : "Start collecting customer proof in minutes."}
        </CardDescription>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required
          />

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
          </Button>
        </form>

        {mode === "login" && (
          <div className="mt-3 text-sm">
            <Link to="/forgot-password" className="font-semibold text-primary">
              Forgot password?
            </Link>
          </div>
        )}

        <p className="mt-6 text-sm text-slate-600">
          {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
          <Link to={mode === "login" ? "/register" : "/login"} className="font-semibold text-primary">
            {mode === "login" ? "Register" : "Log in"}
          </Link>
        </p>

        {mode === "register" && (
          <p className="mt-3 text-sm text-slate-600">
            Signed up but not verified?{" "}
            <Link to="/verify-email" className="font-semibold text-primary">
              Verify email
            </Link>
          </p>
        )}
      </Card>
    </div>
  );
}