import { useEffect, useRef, useState } from "react";
import { Flag, Zap, Cpu, CheckCircle2, Clock, History, TrendingUp, Layers } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./Features";

import type { FlagRecord } from "@/lib/dashboard-api";
import { formatFlagLabel } from "@/lib/dashboard-api";

function useCountUp(target: number, run: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    const start = performance.now();
    const dur = 1200;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return val;
}

interface AnalyticsProps {
  flags: FlagRecord[];
}

function getStats(flags: FlagRecord[]) {
  const total = Math.max(flags.length, 1);
  const active = flags.filter((flag) => flag.enabled).length;
  const percentage = flags.filter((flag) => flag.type === "percentage").length;
  const segmentRules = flags.reduce((sum, flag) => sum + flag.rules.length, 0);
  const avgRollout = Math.round(
    flags.reduce((sum, flag) => sum + (flag.enabled ? flag.rolloutPercentage : 0), 0) / total,
  );

  return [
    { icon: Flag, label: "Active Flags", value: active, suffix: "", color: "text-primary" },
    {
      icon: Zap,
      label: "Percentage Flags",
      value: percentage,
      suffix: "",
      color: "text-cyan",
      fmt: true,
    },
    {
      icon: Cpu,
      label: "Segment Rules",
      value: segmentRules,
      suffix: "",
      color: "text-emerald",
      fmt: true,
    },
    {
      icon: CheckCircle2,
      label: "Average Rollout",
      value: avgRollout,
      suffix: "%",
      color: "text-emerald",
    },
  ];
}

function StatCard({ s, run }: { s: ReturnType<typeof getStats>[number]; run: boolean }) {
  const v = useCountUp(s.value, run);
  const display = s.fmt
    ? v >= 1000000
      ? `${(v / 1000000).toFixed(1)}M`
      : v.toLocaleString()
    : v.toLocaleString();
  return (
    <div className="glass glass-hover rounded-2xl p-5">
      <s.icon className={`h-5 w-5 ${s.color}`} />
      <div className="mt-4 text-2xl font-bold tabular-nums">
        {display}
        {s.suffix}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
    </div>
  );
}

export function Analytics({ flags }: AnalyticsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);
  const stats = getStats(flags);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setRun(true), io.disconnect()),
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="relative py-24">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Analytics Dashboard"
          title="See exactly how every feature performs"
          subtitle="Real-time counts, rollout coverage and the latest changes pulled from the backend collection."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Reveal key={s.label}>
              <StatCard s={s} run={run} />
            </Reveal>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="glass h-full rounded-2xl p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="h-4 w-4 text-cyan" /> Feature Evaluations
              </div>
              <div className="mt-6 flex h-40 items-end gap-2">
                {flags.slice(0, 14).map((flag, i) => (
                  <div
                    key={flag._id}
                    className="flex-1 rounded-t bg-linear-to-t from-primary/30 via-primary/60 to-cyan"
                    style={{
                      height: run
                        ? `${Math.max(flag.rolloutPercentage, flag.enabled ? 36 : 10)}%`
                        : "0%",
                      transition: `height 0.8s ${i * 50}ms ease`,
                    }}
                  />
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="glass h-full rounded-2xl p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Layers className="h-4 w-4 text-primary" /> Environment Usage
              </div>
              <div className="mt-6 space-y-4">
                {[
                  {
                    l: "Boolean",
                    v: Math.round(
                      (flags.filter((flag) => flag.type === "boolean").length /
                        Math.max(flags.length, 1)) *
                        100,
                    ),
                    c: "from-primary to-primary-glow",
                  },
                  {
                    l: "Percentage",
                    v: Math.round(
                      (flags.filter((flag) => flag.type === "percentage").length /
                        Math.max(flags.length, 1)) *
                        100,
                    ),
                    c: "from-cyan to-cyan",
                  },
                  {
                    l: "Segment",
                    v: Math.round(
                      (flags.filter((flag) => flag.type === "segment").length /
                        Math.max(flags.length, 1)) *
                        100,
                    ),
                    c: "from-emerald to-emerald",
                  },
                  {
                    l: "No rules",
                    v: Math.round(
                      (flags.filter((flag) => flag.rules.length === 0).length /
                        Math.max(flags.length, 1)) *
                        100,
                    ),
                    c: "from-chart-4 to-chart-4",
                  },
                ].map((e) => (
                  <div key={e.l}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">{e.l}</span>
                      <span className="font-mono">{e.v}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full bg-linear-to-r ${e.c}`}
                        style={{ width: run ? `${e.v}%` : "0%", transition: "width 0.9s ease" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Reveal>
            <div className="glass h-full rounded-2xl p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <History className="h-4 w-4 text-emerald" /> Recent Changes
              </div>
              <ul className="mt-4 space-y-3 text-sm">
                {flags
                  .slice()
                  .sort(
                    (left, right) =>
                      new Date(right.updatedAt ?? 0).getTime() -
                      new Date(left.updatedAt ?? 0).getTime(),
                  )
                  .slice(0, 3)
                  .map((flag) => (
                    <li key={flag._id} className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs">{formatFlagLabel(flag.name)}</span>
                      <span className="text-cyan">
                        {flag.enabled ? `${flag.rolloutPercentage}%` : "disabled"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {flag.updatedAt ? new Date(flag.updatedAt).toLocaleDateString() : "now"}
                      </span>
                    </li>
                  ))}
                {flags.length === 0 && (
                  <li className="text-xs text-muted-foreground">No backend changes yet.</li>
                )}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="glass h-full rounded-2xl p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4 text-cyan" /> Deployment History
              </div>
              <div className="mt-4 space-y-3">
                {["v3.2.1", "v3.2.0", "v3.1.4"].map((v, i) => (
                  <div key={v} className="flex items-center gap-3 text-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald" />
                    <span className="font-mono">{v}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {["today", "2d ago", "1w ago"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div className="glass h-full rounded-2xl p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Flag className="h-4 w-4 text-primary" /> Top Enabled Features
              </div>
              <div className="mt-4 space-y-3">
                {flags
                  .slice()
                  .sort((left, right) => right.rolloutPercentage - left.rolloutPercentage)
                  .slice(0, 3)
                  .map((flag) => (
                    <div key={flag._id}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="font-mono">{formatFlagLabel(flag.name)}</span>
                        <span>{flag.rolloutPercentage}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-primary to-emerald"
                          style={{ width: `${flag.rolloutPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                {flags.length === 0 && (
                  <div className="text-xs text-muted-foreground">No flags to rank yet.</div>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
