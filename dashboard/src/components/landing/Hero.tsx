import { useState } from "react";
import { ArrowRight, BookOpen, Check, Copy, GitBranch } from "lucide-react";
import { Reveal } from "./Reveal";

function MiniToggle({ on }: { on: boolean }) {
  return (
    <span
      className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
        on ? "bg-emerald" : "bg-muted"
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </span>
  );
}

function HeroIllustration() {
  const flags = [
    { name: "new-dashboard", env: "Production", pct: 100, on: true },
    { name: "checkout-v2", env: "Staging", pct: 50, on: true },
    { name: "dark-theme", env: "Testing", pct: 25, on: true },
    { name: "beta-search", env: "Development", pct: 10, on: false },
  ];
  return (
    <div className="glass relative rounded-2xl p-4 sm:p-5">
      <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/10 to-transparent" />
      {/* window chrome */}
      <div className="relative flex items-center gap-2 pb-4">
        <span className="h-3 w-3 rounded-full bg-destructive/70" />
        <span className="h-3 w-3 rounded-full bg-chart-4/70" />
        <span className="h-3 w-3 rounded-full bg-emerald/70" />
        <span className="ml-3 font-mono text-xs text-muted-foreground">app.flagship.dev / flags</span>
      </div>

      <div className="relative space-y-2.5">
        {flags.map((f, i) => (
          <div
            key={f.name}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/40 px-3 py-2.5"
            style={{ animation: `reveal-up 0.6s ${0.15 * i + 0.2}s both` }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${f.on ? "bg-emerald" : "bg-muted-foreground/50"}`}
              />
              <span className="truncate font-mono text-xs sm:text-sm">{f.name}</span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden rounded-md border border-border px-2 py-0.5 text-[10px] text-muted-foreground sm:inline">
                {f.env}
              </span>
              <div className="hidden w-16 items-center gap-1.5 md:flex">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-cyan"
                    style={{ width: `${f.pct}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-[10px] text-muted-foreground">
                  {f.pct}%
                </span>
              </div>
              <MiniToggle on={f.on} />
            </div>
          </div>
        ))}
      </div>

      {/* environment pipeline */}
      <div className="relative mt-4 flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2.5 text-[10px] sm:text-xs">
        {["Dev", "Test", "Staging", "Prod"].map((e, i) => (
          <div key={e} className="flex items-center gap-1.5 text-muted-foreground">
            <GitBranch className="h-3 w-3 text-cyan" />
            <span>{e}</span>
            {i < 3 && <ArrowRight className="ml-1 h-3 w-3 text-muted-foreground/50" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText("npm install feature-flag-sdk");
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[image:var(--gradient-hero)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <Reveal>
            <a
              href="#open-source"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
            >
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald" />
              Open source · v3.0 now available
              <ArrowRight className="h-3 w-3" />
            </a>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Ship Features Faster.
              <br />
              <span className="text-gradient">Release with Confidence.</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Safely control feature releases without redeploying your applications.
              Gradually roll out features, target specific users, manage multiple
              environments, and instantly disable problematic releases using a lightweight
              Feature Flag SDK and a powerful management dashboard.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#pricing"
                className="ripple inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#api"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/40 px-6 py-3 text-sm font-semibold transition-colors hover:bg-card"
              >
                <BookOpen className="h-4 w-4" /> View Documentation
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={copy}
                className="group flex items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-2.5 font-mono text-sm"
              >
                <span className="text-cyan">$</span>
                <span>npm install feature-flag-sdk</span>
                {copied ? (
                  <Check className="h-4 w-4 text-emerald" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                )}
              </button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200} className="lg:pl-6">
          <HeroIllustration />
        </Reveal>
      </div>
    </section>
  );
}
