import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import {
  getDefaultApiBaseUrl,
  normalizeApiBaseUrl,
  saveDashboardConfig,
} from "@/lib/dashboard-api";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Flagship" },
      {
        name: "description",
        content:
          "Create a free Flagship account and start shipping features safely with feature flags in minutes.",
      },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Use configured default API base URL (from VITE_API_BASE_URL)
  // The UI does not prompt for it anymore.
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const base = getDefaultApiBaseUrl();
      const response = await fetch(`${normalizeApiBaseUrl(base)}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = (await response.json().catch(() => ({}))) as { apiKey?: string; error?: string };
      if (!response.ok || !body.apiKey) {
        throw new Error(body.error || "Unable to create account");
      }

      saveDashboardConfig({
        apiBaseUrl: normalizeApiBaseUrl(base),
        authMode: "apiKey",
        authValue: body.apiKey,
      });

      toast.success("Account created and dashboard connected with your API key.");
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 pt-24 pb-16">
        <div className="glass w-full rounded-2xl p-8">
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Start shipping features safely — free forever.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40"
                placeholder="At least 8 characters"
              />
            </div>
            <button
              disabled={loading}
              className="ripple w-full rounded-lg bg-linear-to-r from-primary to-primary-glow px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/signin" className="text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
