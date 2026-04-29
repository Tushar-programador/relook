import { Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "../ui/button.jsx";

const navigation = [
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" }
];

export function SiteShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen px-4 py-5 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="glass sticky top-5 z-50 rounded-[28px] border border-border/70 px-5 py-4 shadow-panel">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 text-foreground no-underline">
              <div className="rounded-2xl bg-primary p-3 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="font-serif text-2xl font-semibold">FeedSpace</div>
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Proof engine for modern brands</div>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 lg:flex">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm no-underline transition ${
                      isActive ? "bg-primary text-white" : "text-slate-700 hover:bg-white/80"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <Button asChild variant="secondary">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Start free</Link>
              </Button>
            </div>

            <button
              type="button"
              className="inline-flex rounded-2xl border border-border bg-white/80 p-3 text-slate-700 lg:hidden"
              onClick={() => setMenuOpen((current) => !current)}
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {menuOpen && (
            <div className="mt-4 space-y-2 border-t border-border/70 pt-4 lg:hidden">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-2xl px-4 py-3 text-sm no-underline transition ${
                      isActive ? "bg-primary text-white" : "text-slate-700 hover:bg-white/80"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="grid gap-2 pt-2 sm:grid-cols-2">
                <Button asChild variant="secondary">
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    Log in
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/register" onClick={() => setMenuOpen(false)}>
                    Start free
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </header>

        <main className="pt-6">{children}</main>

        <footer className="mt-8 rounded-[32px] border border-border/70 bg-slate-950 px-6 py-10 text-slate-100 md:px-10">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <div>
              <h2 className="font-serif text-3xl font-semibold">Collect stories once. Reuse them everywhere.</h2>
              <p className="mt-4 max-w-xl text-sm text-slate-300">
                FeedSpace is built for D2C brands, freelancers, and SaaS teams that need a reliable proof pipeline from capture to widget.
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Explore</p>
              <div className="mt-4 space-y-3 text-sm">
                {navigation.map((item) => (
                  <Link key={item.to} to={item.to} className="block text-slate-200 no-underline hover:text-white">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Contact</p>
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                <p>hello@feedspace.app</p>
                <p>Built for mobile-first feedback flows and media-heavy testimonials.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}