import { User, GitCommit, UploadCloud, LayoutDashboard, Cpu, Users } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./Features";

const FLOW = [
  { icon: User, label: "Developer", color: "text-cyan" },
  { icon: GitCommit, label: "Push Code", color: "text-primary" },
  { icon: UploadCloud, label: "Deploy", color: "text-emerald" },
  { icon: LayoutDashboard, label: "Flag Dashboard", color: "text-primary" },
  { icon: Cpu, label: "SDK Evaluation", color: "text-cyan" },
  { icon: Users, label: "Users", color: "text-emerald" },
];

export function DeveloperWorkflow() {
  return (
    <section className="relative py-24">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Developer Workflow"
          title="A seamless path from code to users"
          subtitle="Flags plug into the workflow you already have — no friction, no redeploys."
        />

        <Reveal className="mt-14">
          <div className="glass rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-between">
              {FLOW.map((f, i) => (
                <div key={f.label} className="flex items-center gap-3 md:flex-col md:gap-3">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-border bg-background/50 shadow-glow">
                    <f.icon className={`h-6 w-6 ${f.color}`} />
                  </div>
                  <span className="text-sm font-medium md:text-center">{f.label}</span>
                  {i < FLOW.length - 1 && (
                    <>
                      <span className="ml-auto text-muted-foreground/40 md:hidden">↓</span>
                      <span className="hidden text-muted-foreground/40 md:block">→</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
