import { Check } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./Features";

const PLANS = [
  {
    name: "Community",
    price: "Free",
    tagline: "Open Source",
    features: ["Unlimited Local Development", "Documentation", "Basic Dashboard", "Community Support"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Starter",
    price: "$29",
    per: "/mo",
    tagline: "For Teams",
    features: ["Advanced Rollouts", "Environment Management", "Analytics", "Priority Support"],
    cta: "Start trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    tagline: "For Scale",
    features: ["Unlimited Projects", "SSO", "Audit Logs", "Dedicated Support", "Private Deployments"],
    cta: "Contact sales",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[500px] bg-[image:var(--gradient-hero)] opacity-60" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple pricing that scales with you"
          subtitle="Start free and open source. Upgrade when your team is ready."
        />

        <div className="mt-14 grid items-stretch gap-6 md:grid-cols-3">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 90}>
              <div
                className={`glass relative flex h-full flex-col rounded-2xl p-7 ${
                  p.featured ? "border-primary/50 shadow-glow" : ""
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-primary-glow px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most popular
                  </span>
                )}
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {p.name}
                </h3>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-4xl font-bold">{p.price}</span>
                  {p.per && <span className="mb-1 text-muted-foreground">{p.per}</span>}
                </div>
                <p className="mt-1 text-sm text-cyan">{p.tagline}</p>

                <ul className="mt-6 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-emerald" /> {f}
                    </li>
                  ))}
                </ul>

                <button
                  className={`ripple mt-7 rounded-xl px-4 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02] ${
                    p.featured
                      ? "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-glow"
                      : "border border-border hover:bg-muted"
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
