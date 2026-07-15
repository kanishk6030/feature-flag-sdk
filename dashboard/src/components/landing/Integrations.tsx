import { Reveal } from "./Reveal";
import { SectionHeading } from "./Features";

const TECHS = [
  { name: "Node.js", desc: "Server-side flag evaluation.", glyph: "N", color: "text-emerald" },
  { name: "Express", desc: "Middleware for route-level flags.", glyph: "E", color: "text-muted-foreground" },
  { name: "React", desc: "Hooks & context for the client.", glyph: "R", color: "text-cyan" },
  { name: "Next.js", desc: "App Router & RSC support.", glyph: "▲", color: "text-foreground" },
  { name: "NestJS", desc: "Providers & guards integration.", glyph: "Ne", color: "text-destructive" },
  { name: "TypeScript", desc: "Fully typed flag definitions.", glyph: "TS", color: "text-cyan" },
  { name: "REST API", desc: "Manage flags from anywhere.", glyph: "{}", color: "text-primary" },
];

const ENDPOINTS = [
  { m: "POST", path: "/feature-flags", c: "text-emerald border-emerald/40 bg-emerald/10", d: "Create a new flag" },
  { m: "GET", path: "/feature-flags", c: "text-cyan border-cyan/40 bg-cyan/10", d: "List all flags" },
  { m: "PATCH", path: "/feature-flags/:id", c: "text-chart-4 border-chart-4/40 bg-chart-4/10", d: "Update a flag" },
  { m: "DELETE", path: "/feature-flags/:id", c: "text-destructive border-destructive/40 bg-destructive/10", d: "Remove a flag" },
];

export function Integrations() {
  return (
    <>
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="SDK Integration"
            title="Drop in anywhere in your stack"
            subtitle="First-class SDKs and a REST API mean Flagship fits the tools you already use."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {TECHS.map((t, i) => (
              <Reveal key={t.name} delay={(i % 4) * 70}>
                <div className="glass glass-hover flex h-full items-start gap-4 rounded-2xl p-5">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-background/50 font-mono text-sm font-bold">
                    <span className={t.color}>{t.glyph}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{t.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="api" className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="API First"
            title="A clean REST API for everything"
            subtitle="Automate flag management from CI, scripts, or your own internal tooling."
          />

          <div className="mt-14 grid items-start gap-6 lg:grid-cols-2">
            <Reveal>
              <div className="glass overflow-hidden rounded-2xl">
                <div className="border-b border-border px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Endpoints
                </div>
                <div className="divide-y divide-border">
                  {ENDPOINTS.map((e) => (
                    <div key={e.m + e.path} className="flex items-center gap-3 px-5 py-3.5">
                      <span className={`w-16 rounded-md border px-2 py-0.5 text-center font-mono text-xs font-semibold ${e.c}`}>
                        {e.m}
                      </span>
                      <span className="font-mono text-sm">{e.path}</span>
                      <span className="ml-auto hidden text-xs text-muted-foreground sm:block">
                        {e.d}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="glass overflow-hidden rounded-2xl">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-destructive/70" />
                  <span className="h-3 w-3 rounded-full bg-chart-4/70" />
                  <span className="h-3 w-3 rounded-full bg-emerald/70" />
                  <span className="ml-3 font-mono text-xs text-muted-foreground">request.sh</span>
                </div>
                <pre className="overflow-x-auto p-5 font-mono text-sm leading-7">
                  <code>
                    <div>
                      <span className="text-cyan">curl</span> -X{" "}
                      <span className="text-primary-glow">POST</span>{" "}
                      <span className="text-emerald">https://api.flagship.dev/feature-flags</span>{" "}
                      \
                    </div>
                    <div>{"  "}-H <span className="text-emerald">"Authorization: Bearer ff_live_…"</span> \</div>
                    <div>{"  "}-H <span className="text-emerald">"Content-Type: application/json"</span> \</div>
                    <div>{"  "}-d <span className="text-emerald">'{"{"}</span></div>
                    <div>{"    "}<span className="text-cyan">"key"</span>: <span className="text-emerald">"new-dashboard"</span>,</div>
                    <div>{"    "}<span className="text-cyan">"enabled"</span>: <span className="text-primary-glow">true</span>,</div>
                    <div>{"    "}<span className="text-cyan">"rollout"</span>: <span className="text-chart-4">50</span></div>
                    <div>{"  "}<span className="text-emerald">{"}"}'</span></div>
                  </code>
                </pre>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
