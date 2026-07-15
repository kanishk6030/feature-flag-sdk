import { FilePlus2, SlidersHorizontal, UploadCloud, Cpu, Users } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./Features";

const STEPS = [
  { icon: FilePlus2, title: "Create Feature Flag", desc: "Define a flag in the dashboard in seconds.", color: "text-primary" },
  { icon: SlidersHorizontal, title: "Configure Rules", desc: "Set targeting, environments and rollout %.", color: "text-cyan" },
  { icon: UploadCloud, title: "Deploy Application", desc: "Ship your code once — no redeploys to toggle.", color: "text-emerald" },
  { icon: Cpu, title: "SDK Evaluates Flag", desc: "Fast, secure local evaluation at runtime.", color: "text-primary" },
  { icon: Users, title: "Users Receive Correct Experience", desc: "The right feature reaches the right users.", color: "text-cyan" },
];

export function HowItWorks() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How It Works"
          title="From flag to experience in five steps"
        />

        <div className="relative mt-16">
          <div className="absolute left-6 top-0 hidden h-full w-px bg-gradient-to-b from-primary via-cyan to-emerald sm:block" />
          <div className="space-y-5">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 70}>
                <div className="glass glass-hover relative flex items-start gap-5 rounded-2xl p-5 sm:ml-0 sm:pl-16">
                  <div className="absolute left-1 top-5 hidden grid h-11 w-11 place-items-center rounded-xl border border-border bg-card shadow-glow sm:grid">
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-card sm:hidden">
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        0{i + 1}
                      </span>
                      <h3 className="font-semibold">{s.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
