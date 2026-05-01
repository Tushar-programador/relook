import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { api } from "../lib/api.js";
import { useAuth } from "../context/auth-context.jsx";

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultEmail = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const [form, setForm] = useState({ email: defaultEmail, otp: "" });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleVerify(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await verifyEmail(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError("");
    setSuccess("");

    try {
      const data = await api.resendVerification({ email: form.email });
      setSuccess(data.message || "Verification code resent");
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardTitle>Verify your email</CardTitle>
        <CardDescription className="mt-2">Enter the 6-digit code we sent to your inbox.</CardDescription>

        <form className="mt-8 space-y-4" onSubmit={handleVerify}>
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

          {error && <p className="text-sm text-rose-600">{error}</p>}
          {success && <p className="text-sm text-emerald-700">{success}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify email"}
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <button type="button" className="font-semibold text-primary" onClick={handleResend} disabled={resending || !form.email}>
            {resending ? "Resending..." : "Resend code"}
          </button>
          <Link to="/login" className="font-semibold text-primary">
            Back to login
          </Link>
        </div>
      </Card>
    </div>
  );
}