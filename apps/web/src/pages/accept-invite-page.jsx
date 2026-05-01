import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, LoaderCircle } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/layout/app-shell.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";
import { api } from "../lib/api";

export function AcceptInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | accepted | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .acceptTeamInvite(token)
      .then((data) => {
        if (data.alreadyAccepted) {
          setMessage("This invitation was already accepted. You can find the project in your dashboard.");
        } else {
          setMessage("You now have access to the project. Head to your dashboard to get started.");
        }
        setStatus("accepted");
      })
      .catch((err) => {
        setMessage(err.message);
        setStatus("error");
      });
  }, [token]);

  return (
    <AppShell>
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          {status === "loading" && (
            <>
              <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-primary" />
              <CardTitle className="mt-4">Accepting invitation…</CardTitle>
            </>
          )}

          {status === "accepted" && (
            <>
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <CardTitle className="mt-4">Invitation accepted!</CardTitle>
              <CardDescription className="mt-2">{message}</CardDescription>
              <Button asChild className="mt-6">
                <Link to="/dashboard">Go to dashboard</Link>
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="mx-auto h-10 w-10 text-rose-600" />
              <CardTitle className="mt-4">Could not accept invitation</CardTitle>
              <CardDescription className="mt-2 text-rose-600">{message}</CardDescription>
              <Button asChild variant="secondary" className="mt-6">
                <Link to="/dashboard">Back to dashboard</Link>
              </Button>
            </>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
