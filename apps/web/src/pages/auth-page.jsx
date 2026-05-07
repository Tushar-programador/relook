import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";

export function AuthPage({ mode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const redirectTarget = location.state?.from;
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    if (mode === "register" && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setSubmitting(false);
      return;
    }

    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
        navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
      } else {
        await register({ name: form.name, email: form.email, password: form.password, confirmPassword: form.confirmPassword });
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`, { replace: true });
      }
    } catch (err) {
      const isUnverified =
        err.message?.toLowerCase().includes("verify your email") ||
        err.message?.toLowerCase().includes("email not verified");
      if (mode === "login" && isUnverified) {
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`, { replace: true });
        return;
      }
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      {/* Floating background orbs */}
      <div className="orb orb-1" style={{ top: "-80px", left: "-100px" }} />
      <div className="orb orb-2" style={{ bottom: "-60px", right: "-80px" }} />
      <div className="orb orb-3" style={{ top: "40%", left: "55%" }} />

      {/* Left branding panel — hidden on mobile */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-14 overflow-hidden">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white text-sm font-bold">R</span>
          <span className="font-serif text-xl font-semibold text-foreground">Re-look</span>
        </Link>

        <div>
          <h1 className="font-serif text-5xl font-bold leading-tight text-foreground">
            {mode === "login" ? (
              <>Welcome<br />back.</>
            ) : (
              <>Start collecting<br />social proof.</>
            )}
          </h1>
          <p className="mt-5 max-w-sm text-base text-slate-500 leading-relaxed">
            {mode === "login"
              ? "Sign in to manage your projects, review testimonials, and grow your brand."
              : "Create your free workspace and start turning customer feedback into revenue."}
          </p>

          {/* Testimonial quote */}
          <div className="mt-12 glass rounded-2xl border border-border/60 p-6 max-w-sm">
            <p className="text-sm text-slate-700 leading-relaxed">
              "Re-look helped us collect 40+ video testimonials in the first week. Our conversion rate jumped 23%."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent" />
              <div>
                <p className="text-sm font-semibold text-foreground">Sarah K.</p>
                <p className="text-xs text-slate-500">Head of Growth, Novara</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400">© {new Date().getFullYear()} Re-look. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="relative flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        {/* Mobile logo */}
        <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white text-xs font-bold">R</span>
          <span className="font-serif text-lg font-semibold text-foreground">Re-look</span>
        </Link>

        <div className="w-full max-w-md">
          {/* Card */}
          <div className="glass rounded-[28px] border border-border/70 p-8 shadow-panel">
            <div className="mb-8">
              <h2 className="font-serif text-3xl font-semibold text-foreground">
                {mode === "login" ? "Sign in" : "Create account"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {mode === "login"
                  ? "Enter your credentials to access your workspace."
                  : "Fill in the details below to get started for free."}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === "register" && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Full name</label>
                  <Input
                    type="text"
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                    required
                    minLength={2}
                    maxLength={50}
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Password</label>
                <Input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
                  required
                  minLength={8}
                />
              </div>

              {mode === "register" && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Confirm password</label>
                  <Input
                    type="password"
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm((c) => ({ ...c, confirmPassword: e.target.value }))}
                    required
                    minLength={8}
                  />
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                  <p className="text-sm text-rose-600">{error}</p>
                </div>
              )}

              {mode === "login" && (
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    state={redirectTarget ? { from: redirectTarget } : undefined}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button type="submit" className="w-full mt-2" disabled={submitting}>
                {submitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-slate-400">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <p className="text-center text-sm text-slate-500">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <Link
                to={mode === "login" ? "/register" : "/login"}
                state={redirectTarget ? { from: redirectTarget } : undefined}
                className="font-semibold text-primary hover:underline"
              >
                {mode === "login" ? "Register free" : "Sign in"}
              </Link>
            </p>

            {/* {mode === "register" && (
              <p className="mt-3 text-center text-sm text-slate-500">
                Signed up but not verified?{" "}
                <Link to="/verify-email" className="font-semibold text-primary hover:underline">
                  Verify email
                </Link>
              </p>
            )} */}
          </div>

          {mode === "register" && (
            <p className="mt-5 text-center text-xs text-slate-400">
              By creating an account you agree to our{" "}
              <Link to="/terms" className="underline hover:text-slate-600">Terms</Link>
              {" & "}
              <Link to="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
