import { useEffect, useState } from "react";
import { CircleHelp, LayoutDashboard, LogOut, Mail, Rocket, Sparkles, Trophy } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/auth-context.jsx";
import { api } from "../../lib/api";
import { Button } from "../ui/button.jsx";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard
  },
  {
    to: "/features",
    label: "Features",
    icon: Rocket
  },
  {
    to: "/pricing",
    label: "Pricing",
    icon: CircleHelp
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
  );
}