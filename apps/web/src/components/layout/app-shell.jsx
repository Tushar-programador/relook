import { LayoutDashboard, LogOut, Sparkles } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/auth-context.jsx";
import { Button } from "../ui/button.jsx";

export function AppShell({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
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
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm no-underline transition ${
                  isActive ? "bg-primary text-white" : "text-slate-700 hover:bg-white/80"
                }`
              }
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
          </nav>

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
  );
}