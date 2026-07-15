import { Reveal } from "./Reveal";
import { SectionHeading } from "./Features";

const K = "text-primary-glow";
const F = "text-cyan";
const S = "text-emerald";
const C = "text-muted-foreground";
const V = "text-foreground";

function Line({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex">
      <span className="w-8 shrink-0 select-none pr-4 text-right text-muted-foreground/40">{n}</span>
      <span className="whitespace-pre-wrap">{children}</span>
    </div>
  );
}

export function CodeShowcase() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Developer Experience"
          title="Evaluate a flag in a single call"
          subtitle="Type-safe, async, and blazing fast. Drop it anywhere in your codebase."
        />

        <Reveal className="mt-12">
          <div className="glass overflow-hidden rounded-2xl">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-destructive/70" />
              <span className="h-3 w-3 rounded-full bg-chart-4/70" />
              <span className="h-3 w-3 rounded-full bg-emerald/70" />
              <span className="ml-3 font-mono text-xs text-muted-foreground">dashboard.ts</span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-sm leading-7">
              <code>
                <Line n={1}>
                  <span className={K}>const</span> <span className={V}>enabled</span>{" "}
                  <span className={C}>=</span> <span className={K}>await</span>{" "}
                  <span className={V}>featureFlag</span>.<span className={F}>isEnabled</span>(
                </Line>
                <Line n={2}>
                  {"    "}
                  <span className={S}>"new-dashboard"</span>
                  <span className={C}>,</span>
                </Line>
                <Line n={3}>
                  {"    "}
                  <span className={V}>user</span>
                </Line>
                <Line n={4}>);</Line>
                <Line n={5}>{" "}</Line>
                <Line n={6}>
                  <span className={K}>if</span> (<span className={V}>enabled</span>) {"{"}
                </Line>
                <Line n={7}>
                  {"    "}
                  <span className={F}>renderNewDashboard</span>();
                </Line>
                <Line n={8}>
                  {"}"} <span className={K}>else</span> {"{"}
                </Line>
                <Line n={9}>
                  {"    "}
                  <span className={F}>renderOldDashboard</span>();
                  <span className="cursor-blink ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-primary" />
                </Line>
                <Line n={10}>{"}"}</Line>
              </code>
            </pre>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
