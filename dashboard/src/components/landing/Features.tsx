import {
  Flag,
  Layers,
  Target,
  Percent,
  Undo2,
  FlaskConical,
  ShieldCheck,
  Feather,
  Puzzle,
  Code2,
  Rocket,
} from "lucide-react";
import { Reveal } from "./Reveal";

const FEATURES = [
  { icon: Flag, title: "Feature Flags", desc: "Instantly enable or disable features.", color: "text-primary" },
  { icon: Layers, title: "Environment Management", desc: "Manage Development, Testing, Staging and Production independently.", color: "text-cyan" },
  { icon: Target, title: "User Targeting", desc: "Release features only to selected users.", color: "text-emerald" },
  { icon: Percent, title: "Percentage Rollouts", desc: "Release to 5%, 10%, 25%, 50% or 100%.", color: "text-primary" },
  { icon: Undo2, title: "Instant Rollbacks", desc: "Disable broken features immediately.", color: "text-destructive" },
  { icon: FlaskConical, title: "A/B Testing Ready", desc: "Experiment safely.", color: "text-cyan" },
  { icon: ShieldCheck, title: "Secure SDK Evaluation", desc: "Fast local evaluation.", color: "text-emerald" },
  { icon: Feather, title: "Lightweight SDK", desc: "Tiny installation footprint.", color: "text-primary" },
  { icon: Puzzle, title: "Simple Integration", desc: "Works with Node.js, Express, React and Next.js.", color: "text-cyan" },
  { icon: Code2, title: "REST API Support", desc: "Manage feature flags programmatically.", color: "text-emerald" },
  { icon: Rocket, title: "Production Ready", desc: "Built for scalable applications.", color: "text-primary" },
];

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
    </Reveal>
  );
}

export function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Core Features"
          title="Everything you need to ship safely"
          subtitle="A complete feature management toolkit — from local SDK evaluation to enterprise-grade rollout controls."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 80}>
              <div className="glass glass-hover group h-full rounded-2xl p-6">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl border border-border bg-background/50">
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
