import { useEffect, useState } from "react";
import { CircleHelp, LayoutDashboard, LogOut, Mail, Rocket, Sparkles, Trophy, X, ShieldCheck } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/auth-context.jsx";
import { api } from "../../lib/api";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";

function EmailVerificationModal({ email, onClose, onVerified }) {
  const { verifyEmail } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleVerify(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await verifyEmail({ email, otp });
      onVerified();
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
      const data = await api.resendVerification({ email });
      setSuccess(data.message || "Verification code resent to your inbox.");
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary p-2 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Verify your email</h2>
              <p className="text-sm text-slate-500">Enter the 6-digit code sent to</p>
              <p className="text-sm font-medium text-slate-700">{email}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleVerify}>
          <Input
            inputMode="numeric"
            pattern="[0-9]{6}"
            placeholder="6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
          />

          {error && <p className="text-sm text-rose-600">{error}</p>}
          {success && <p className="text-sm text-emerald-700">{success}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify email"}
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            className="font-semibold text-primary hover:underline disabled:opacity-50"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? "Resending..." : "Resend code"}
          </button>
          <button type="button" className="text-slate-500 hover:underline" onClick={onClose}>
            Do it later
          </button>
        </div>
      </div>
    </div>
  );
}

function EmailVerificationBanner({ email }) {
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { user } = useAuth();

  if (dismissed || user?.isEmailVerified) return null;

  return (
    <>
      <div
        className="flex w-full cursor-pointer items-center justify-between gap-3 bg-amber-500 px-4 py-2.5 text-white"
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <Mail className="h-4 w-4 shrink-0" />
          <span>
            Please verify your email to create a portal. <span className="underline">Click here to verify.</span>
          </span>
        </div>
        <button
          className="shrink-0 rounded p-0.5 hover:bg-amber-400"
          onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {showModal && (
        <EmailVerificationModal
          email={email}
          onClose={() => setShowModal(false)}
          onVerified={() => setShowModal(false)}
        />
      )}
    </>
  );
}

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard
  },
  {
    to: "/send-portal-link",
    label: "Send Portal Link",
    icon: Mail
  }
];

export function AppShell({ children }) {
  const { user, logout } = useAuth();
  const [portalLink, setPortalLink] = useState("/dashboard");
  const [wallLink, setWallLink] = useState("/dashboard");

  useEffect(() => {
    let active = true;

    api
      .getProjects()
      .then((projects) => {
        if (!active) {
          return;
        }

        const firstProjectSlug = projects?.[0]?.slug;
        setPortalLink(firstProjectSlug ? `/feedback/${firstProjectSlug}` : "/dashboard");
        setWallLink(firstProjectSlug ? `/wall/${firstProjectSlug}` : "/dashboard");
      })
      .catch(() => {
        if (active) {
          setPortalLink("/dashboard");
          setWallLink("/dashboard");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      {!user?.isEmailVerified && <EmailVerificationBanner email={user?.email} />}
    <div className="px-4 py-6 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <aside className="glass app-grid rounded-[32px] border border-border/70 p-6 lg:w-80">
          <Link to="/" className="flex items-center gap-3 text-foreground no-underline">
            <div className="rounded-2xl bg-primary p-3 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="font-serif text-2xl font-semibold">FeedSpace</div>
              <div className="text-sm text-slate-600">Media-first testimonial engine</div>
            </div>
          </Link>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm no-underline transition ${
                      isActive ? "bg-primary text-white" : "text-slate-700 hover:bg-white/80"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
            <NavLink
              to={wallLink}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm no-underline transition ${
                  isActive ? "bg-primary text-white" : "text-slate-700 hover:bg-white/80"
                }`
              }
            >
              <Trophy className="h-4 w-4" />
              Decade Wall of Fame
            </NavLink>
          </nav>

          <div className="mt-6 rounded-3xl bg-white/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Quick links</p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link to={portalLink} className="rounded-xl px-3 py-2 text-slate-700 no-underline transition hover:bg-white">
                Your portal page
              </Link>
              <Link to="/help" className="rounded-xl px-3 py-2 text-slate-700 no-underline transition hover:bg-white">
                Help center
              </Link>
            </div>
          </div>

          <div className="mt-10 rounded-3xl bg-white/85 p-5">
            <p className="text-sm text-slate-500">Signed in as</p>
            <p className="mt-2 text-base font-semibold">{user?.email}</p>
          </div>

          <Button variant="ghost" className="mt-4 w-full justify-start gap-2" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </aside>

        <main className="flex-1">{children}</main>
      </div>
    </div>
    </div>
  );
}