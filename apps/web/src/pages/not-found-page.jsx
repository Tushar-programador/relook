import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteShell } from "../components/marketing/site-shell.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";

export function NotFoundPage() {
  return (
    <SiteShell>
      <Card className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">404</p>
        <CardTitle className="mt-4 text-5xl">This page does not exist.</CardTitle>
        <CardDescription className="mt-4">
          The route you opened is not part of the FeedSpace website. Use the homepage or dashboard entry points instead.
        </CardDescription>
        <div className="mt-8">
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to homepage
            </Link>
          </Button>
        </div>
      </Card>
    </SiteShell>
  );
}