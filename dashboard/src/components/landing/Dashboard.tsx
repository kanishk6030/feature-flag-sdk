import { useMemo, useState } from "react";
import { Activity, LogOut, MoreHorizontal, Plus, RefreshCw, Search, Users } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./Features";
import type { DashboardConfig, FlagRecord } from "@/lib/dashboard-api";
import { formatFlagLabel, formatRelativeTimestamp } from "@/lib/dashboard-api";

type Filter = "All" | FlagRecord["type"] | "Enabled" | "Disabled";

const FILTERS: Filter[] = ["All", "boolean", "percentage", "segment", "Enabled", "Disabled"];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Toggle flag"
      className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
        on ? "bg-emerald" : "bg-muted"
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function TypeBadge({ type }: { type: FlagRecord["type"] }) {
  const map: Record<FlagRecord["type"], string> = {
    boolean: "border-primary/40 text-primary bg-primary/10",
    percentage: "border-cyan/40 text-cyan bg-cyan/10",
    segment: "border-chart-4/40 text-chart-4 bg-chart-4/10",
  };
  return (
    <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${map[type]}`}>
      {type}
    </span>
  );
}

interface DashboardProps {
  config: DashboardConfig;
  flags: FlagRecord[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  selectedFlagName: string | null;
  onSelectFlag: (name: string) => void;
  onCreateFlag: () => void;
  onToggleFlag: (name: string) => void;
  onRefresh: () => void;
  onSignOut: () => void;
}

export function Dashboard({
  config,
  flags,
  isLoading,
  isRefreshing,
  error,
  selectedFlagName,
  onSelectFlag,
  onCreateFlag,
  onToggleFlag,
  onRefresh,
  onSignOut,
}: DashboardProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [page, setPage] = useState(1);
  const perPage = 4;

  const filtered = useMemo(() => {
    return flags.filter((r) => {
      const q = query.toLowerCase();
      const matchQ =
        r.name.toLowerCase().includes(q) || formatFlagLabel(r.name).toLowerCase().includes(q);
      const matchF =
        filter === "All"
          ? true
          : filter === "Enabled"
            ? r.enabled
            : filter === "Disabled"
              ? !r.enabled
              : r.type === filter;
      return matchQ && matchF;
    });
  }, [flags, query, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * perPage, current * perPage);

  const evaluationsPerDay = Math.max(flags.length * 18000, 24000).toLocaleString();

  return (
    <section id="dashboard" className="relative py-24">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Management Dashboard"
          title="A control room for every feature"
          subtitle="Inspired by Linear, Supabase and Clerk — search, filter, toggle and roll out flags directly against the backend."
        />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
          <div>
            <span className="font-mono text-foreground">
              {config.authMode === "apiKey" ? "API key" : "JWT"}
            </span>
            <span className="ml-2">connected to {config.apiBaseUrl}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-foreground hover:bg-background"
            >
              <RefreshCw className="h-3.5 w-3.5" /> {isRefreshing ? "Refreshing" : "Refresh"}
            </button>
            <button
              onClick={onSignOut}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-foreground hover:bg-background"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mt-14 grid items-start gap-6 lg:grid-cols-[1.7fr_1fr]">
          <Reveal>
            <div className="glass overflow-hidden rounded-2xl">
              {/* toolbar */}
              <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
                <div className="relative flex-1 min-w-48">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search feature flags..."
                    className="w-full rounded-lg border border-border bg-background/50 py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
                <button
                  onClick={onCreateFlag}
                  className="ripple flex items-center gap-2 rounded-lg bg-linear-to-r from-primary to-primary-glow px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-glow"
                >
                  <Plus className="h-4 w-4" /> Create Feature Flag
                </button>
              </div>

              {/* filters */}
              <div className="flex flex-wrap gap-2 border-b border-border p-3">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFilter(f);
                      setPage(1);
                    }}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      filter === f
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Feature</th>
                      <th className="hidden px-4 py-3 font-medium md:table-cell">Type</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="hidden px-4 py-3 font-medium lg:table-cell">Rollout</th>
                      <th className="hidden px-4 py-3 font-medium xl:table-cell">Rules</th>
                      <th className="hidden px-4 py-3 font-medium sm:table-cell">Updated</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((r) => (
                      <tr
                        key={r._id}
                        onClick={() => onSelectFlag(r.name)}
                        className={`cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30 ${
                          selectedFlagName === r.name ? "bg-muted/40" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium">{formatFlagLabel(r.name)}</div>
                          <div className="font-mono text-xs text-muted-foreground">{r.name}</div>
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          <TypeBadge type={r.type} />
                        </td>
                        <td className="px-4 py-3">
                          <Toggle on={r.enabled} onClick={() => onToggleFlag(r.name)} />
                        </td>
                        <td className="hidden px-4 py-3 lg:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-linear-to-r from-primary to-cyan transition-all"
                                style={{ width: `${r.enabled ? r.rolloutPercentage : 0}%` }}
                              />
                            </div>
                            <span className="w-8 font-mono text-xs text-muted-foreground">
                              {r.enabled ? r.rolloutPercentage : 0}%
                            </span>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground xl:table-cell">
                          {r.rules.length
                            ? `${r.rules.length} rule${r.rules.length === 1 ? "" : "s"}`
                            : "No rules"}
                        </td>
                        <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                          {formatRelativeTimestamp(r.updatedAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {paged.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-sm text-muted-foreground"
                        >
                          {isLoading
                            ? "Loading feature flags from the backend..."
                            : "No feature flags match your filters."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* pagination */}
              <div className="flex items-center justify-between border-t border-border p-3 text-xs text-muted-foreground">
                <span>
                  {filtered.length} flag{filtered.length !== 1 && "s"}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={current === 1}
                    className="rounded-md border border-border px-2.5 py-1 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`h-7 w-7 rounded-md border ${
                        current === i + 1
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={current === totalPages}
                    className="rounded-md border border-border px-2.5 py-1 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          {/* side stats illustration */}
          <Reveal delay={120}>
            <div className="space-y-4">
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Activity className="h-4 w-4 text-emerald" /> Live evaluations
                </div>
                <div className="mt-4 flex items-end gap-1.5">
                  {flags.slice(0, 12).map((flag, i) => (
                    <div
                      key={flag._id}
                      className="flex-1 rounded-t bg-linear-to-t from-primary/40 to-cyan"
                      style={{
                        height: `${Math.max(28, flag.rolloutPercentage || (flag.enabled ? 48 : 18))}px`,
                        animation: `reveal-up 0.5s ${i * 40}ms both`,
                      }}
                    />
                  ))}
                </div>
                <p className="mt-3 font-mono text-xs text-muted-foreground">
                  <span className="text-foreground">{evaluationsPerDay}</span> evaluations / day
                </p>
              </div>

              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="h-4 w-4 text-cyan" /> Targeted segments
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    {
                      label: "Boolean flags",
                      pct: Math.round(
                        (flags.filter((flag) => flag.type === "boolean").length /
                          Math.max(flags.length, 1)) *
                          100,
                      ),
                    },
                    {
                      label: "Percentage rollouts",
                      pct: Math.round(
                        (flags.filter((flag) => flag.type === "percentage").length /
                          Math.max(flags.length, 1)) *
                          100,
                      ),
                    },
                    {
                      label: "Segment rules",
                      pct: Math.round(
                        (flags.filter((flag) => flag.type === "segment").length /
                          Math.max(flags.length, 1)) *
                          100,
                      ),
                    },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="font-mono">{s.pct}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-primary to-emerald"
                          style={{ width: `${s.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
