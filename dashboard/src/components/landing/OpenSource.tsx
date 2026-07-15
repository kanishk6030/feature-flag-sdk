import { Github, BookOpen, Bug, HeartHandshake, Terminal, Rocket, FilePlus2, Cpu } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./Features";

const OSS = [
  { icon: Github, title: "Open Source", desc: "MIT licensed and free forever." },
  { icon: HeartHandshake, title: "Community Driven", desc: "Roadmap shaped by contributors." },
  { icon: BookOpen, title: "Complete Documentation", desc: "Guides, references and examples." },
  { icon: Bug, title: "Issue Tracking", desc: "Transparent, public issue tracker." },
  { icon: Github, title: "Contribution Friendly", desc: "Good first issues and clear guides." },
];

const STEPS = [
  { icon: Terminal, title: "Install the SDK", code: "npm install feature-flag-sdk" },
  { icon: Cpu, title: "Initialize SDK", code: "const ff = createClient(apiKey)" },
  { icon: FilePlus2, title: "Create a Feature Flag", code: 'ff.create("new-dashboard")' },
  { icon: BookOpen, title: "Evaluate the Flag", code: 'await ff.isEnabled("new-dashboard", user)' },
  { icon: Rocket, title: "Deploy", code: "git push origin main" },
];

export function OpenSource() {
  return (
    <>
      <section id="open-source" className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan">Open Source</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Built in the open, for developers
              </h2>
              <p className="mt-4 text-muted-foreground">
                Flagship is fully open source. Self-host it, read every line, and help
                shape where it goes next.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#api"
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted"
                >
                  <BookOpen className="h-4 w-4" /> Read the docs
                </a>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="grid gap-4 sm:grid-cols-2">
                {OSS.map((o) => (
                  <div key={o.title} className="glass glass-hover rounded-2xl p-5">
                    <o.icon className="h-5 w-5 text-primary" />
                    <h3 className="mt-3 font-semibold">{o.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{o.desc}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Developer Experience"
            title="From install to production in minutes"
          />
          <div className="mt-14 space-y-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 70}>
                <div className="glass glass-hover flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background/50">
                      <s.icon className="h-5 w-5 text-cyan" />
                    </div>
                    <h3 className="font-semibold">{s.title}</h3>
                  </div>
                  <code className="ml-auto rounded-lg border border-border bg-background/50 px-3 py-1.5 font-mono text-xs text-emerald">
                    {s.code}
                  </code>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
