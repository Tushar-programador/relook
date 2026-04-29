import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { api } from "../lib/api";

export function ForgotPasswordPage() {
  const [step, setStep] = useState("request");
  const [form, setForm] = useState({ email: "", otp: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRequestOtp(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await api.forgotPassword({ email: form.email });
      setSuccess(data.message || "If this email exists, a reset code was sent");
      setStep("reset");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await api.resetPassword({
        email: form.email,
        otp: form.otp,
        newPassword: form.newPassword
      });
      setSuccess(data.message || "Password reset successful. You can log in now.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardTitle>Forgot password</CardTitle>
        <CardDescription className="mt-2">
          {step === "request" ? "Enter your email to receive a reset code." : "Enter your reset code and set a new password."}
        </CardDescription>

        {step === "request" ? (
          <form className="mt-8 space-y-4" onSubmit={handleRequestOtp}>
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />

            {error && <p className="text-sm text-rose-600">{error}</p>}
            {success && <p className="text-sm text-emerald-700">{success}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send reset code"}
            </Button>
          </form>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={handleResetPassword}>
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
            <Input
              inputMode="numeric"
              pattern="[0-9]{6}"
              placeholder="6-digit OTP"
              value={form.otp}
              onChange={(event) => setForm((current) => ({ ...current, otp: event.target.value.replace(/\D/g, "").slice(0, 6) }))}
              required
            />
            <Input
              type="password"
              placeholder="New password"
              value={form.newPassword}
              onChange={(event) => setForm((current) => ({ ...current, newPassword: event.target.value }))}
              required
            />

            {error && <p className="text-sm text-rose-600">{error}</p>}
            {success && <p className="text-sm text-emerald-700">{success}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Reset password"}
            </Button>
          </form>
        )}

        <div className="mt-5 text-sm">
          <Link to="/login" className="font-semibold text-primary">
            Back to login
          </Link>
        </div>
      </Card>
    </div>
  );
}