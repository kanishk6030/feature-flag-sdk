import { Rocket, FlaskConical, ShieldAlert, Lock, Users2, KeyRound, ScrollText, Server, ShieldCheck } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./Features";

const SECURITY = [
  { icon: Users2, title: "Role Based Access", desc: "Granular permissions per team and project." },
  { icon: Server, title: "Environment Isolation", desc: "Strict separation between every environment." },
  { icon: KeyRound, title: "Encrypted API Keys", desc: "Keys encrypted at rest and in transit." },
  { icon: ScrollText, title: "Audit Logs", desc: "Every change tracked and attributable." },
  { icon: ShieldCheck, title: "Secure SDK Evaluation", desc: "Local evaluation, no data leaves your app." },
  { icon: Lock, title: "Production Ready", desc: "Hardened for scale and reliability." },
];

const USE_CASES = [
  { emoji: "🚀", icon: Rocket, title: "Progressive Rollouts", desc: "Safely release to a percentage of users.", color: "text-primary" },
  { emoji: "🧪", icon: FlaskConical, title: "A/B Testing", desc: "Experiment without risk.", color: "text-cyan" },
  { emoji: "⚠️", icon: ShieldAlert, title: "Kill Switch", desc: "Disable broken functionality instantly.", color: "text-destructive" },
];

export function Security() {
  return (
    <>
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Enterprise Security"
            title="Secure by design, from SDK to dashboard"
            subtitle="Everything you need to run feature flags in regulated, high-scale environments."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SECURITY.map((s, i) => (
              <Reveal key={s.title} delay={(i % 3) * 80}>
                <div className="glass glass-hover flex h-full items-start gap-4 rounded-2xl p-5">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-emerald/30 bg-emerald/10">
                    <s.icon className="h-5 w-5 text-emerald" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Use Cases" title="Built for how teams actually ship" />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {USE_CASES.map((u, i) => (
              <Reveal key={u.title} delay={i * 100}>
                <div className="glass glass-hover relative h-full overflow-hidden rounded-2xl p-6">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-2xl" />
                  <div className="text-4xl">{u.emoji}</div>
                  <h3 className="mt-4 text-lg font-semibold">{u.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{u.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
