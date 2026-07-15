import { Check, X } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./Features";

const OURS = [
  "Lightweight SDK",
  "Beautiful Dashboard",
  "TypeScript Support",
  "Multiple Environments",
  "Percentage Rollouts",
  "User Targeting",
  "REST APIs",
  "Production Ready",
  "Secure Evaluation",
  "Open Source",
];

const THEIRS = ["Complex setup", "Heavy SDK", "Limited flexibility", "Difficult management"];

const TESTIMONIALS = [
  { name: "Daniel Rivera", role: "Backend Engineer", init: "DR", quote: "The SDK is genuinely tiny and evaluation is instant. We removed three deploys a week." },
  { name: "Aisha Khan", role: "DevOps Engineer", init: "AK", quote: "Environment isolation and audit logs made our security team happy on day one." },
  { name: "Marco Bianchi", role: "Platform Engineer", init: "MB", quote: "The dashboard feels like Linear. Rolling out to 5% then 100% is a single slider." },
  { name: "Sofia Lindqvist", role: "Startup CTO", init: "SL", quote: "We shipped our biggest feature with a kill switch ready. Zero-stress launch." },
  { name: "Tomás Reyes", role: "Full Stack Developer", init: "TR", quote: "One line to check a flag, works the same in Next.js and Node. Best DX I've had." },
  { name: "Nina Petrova", role: "Platform Engineer", init: "NP", quote: "Progressive rollouts caught a bug at 10% before it ever hit everyone. Lifesaver." },
];

const GRADS = [
  "from-primary to-cyan",
  "from-cyan to-emerald",
  "from-emerald to-primary",
  "from-primary-glow to-primary",
  "from-cyan to-primary",
  "from-emerald to-cyan",
];

export function WhyChoose() {
  return (
    <>
      <section className="relative py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why Choose Flagship"
            title="A modern platform, not legacy tooling"
          />
          <Reveal className="mt-14">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="glass rounded-2xl border-primary/30 p-6">
                <h3 className="mb-4 text-lg font-semibold text-gradient">Our Platform</h3>
                <ul className="space-y-3">
                  {OURS.map((o) => (
                    <li key={o} className="flex items-center gap-3 text-sm">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald/15">
                        <Check className="h-3 w-3 text-emerald" />
                      </span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass rounded-2xl p-6 opacity-90">
                <h3 className="mb-4 text-lg font-semibold text-muted-foreground">
                  Traditional Solutions
                </h3>
                <ul className="space-y-3">
                  {THEIRS.map((t) => (
                    <li key={t} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-destructive/15">
                        <X className="h-3 w-3 text-destructive" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Testimonials"
            title="Loved by engineers and platform teams"
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={(i % 3) * 80}>
                <figure className="glass glass-hover flex h-full flex-col rounded-2xl p-6">
                  <blockquote className="flex-1 text-sm leading-relaxed text-foreground/90">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${GRADS[i]} text-sm font-semibold text-primary-foreground`}
                    >
                      {t.init}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{t.name}</span>
                      <span className="block text-xs text-muted-foreground">{t.role}</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
