import { useEffect, useState } from "react";
import { Copy, Save, Trash2, RotateCcw, KeyRound } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./Features";
import type { FlagRecord } from "@/lib/dashboard-api";
import { formatFlagLabel, parseRulesInput, stringifyRules } from "@/lib/dashboard-api";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
        on ? "bg-emerald" : "bg-muted"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`}
      />
    </button>
  );
}

const AVATARS = ["A", "P", "M", "L", "S", "K", "T", "R", "J", "N"];

interface FeatureDetailsProps {
  flag: FlagRecord | null;
  onToggle: (name: string) => void;
  onSave: (
    name: string,
    payload: {
      type: FlagRecord["type"];
      enabled: boolean;
      rolloutPercentage: number;
      rules: FlagRecord["rules"];
    },
  ) => void;
  onDelete: (name: string) => void;
  isSaving: boolean;
  isDeleting: boolean;
}

export function FeatureDetails({
  flag,
  onToggle,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
}: FeatureDetailsProps) {
  const [on, setOn] = useState(flag?.enabled ?? false);
  const [rollout, setRollout] = useState(flag?.rolloutPercentage ?? 0);
  const [type, setType] = useState<FlagRecord["type"]>(flag?.type ?? "boolean");
  const [rulesText, setRulesText] = useState(flag ? stringifyRules(flag.rules) : "");

  useEffect(() => {
    setOn(flag?.enabled ?? false);
    setRollout(flag?.rolloutPercentage ?? 0);
    setType(flag?.type ?? "boolean");
    setRulesText(flag ? stringifyRules(flag.rules) : "");
  }, [flag]);

  const enabledCount = Math.round((rollout / 100) * AVATARS.length);

  if (!flag) {
    return (
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Flag Configuration"
            title="Fine-grained control for every flag"
            subtitle="Select a flag from the list to inspect rollout, type and targeting rules."
          />
          <div className="mt-14 rounded-2xl border border-border bg-muted/30 p-8 text-sm text-muted-foreground">
            No flag is selected yet.
          </div>
        </div>
      </section>
    );
  }

  const handleSave = () => {
    onSave(flag.name, {
      type,
      enabled: on,
      rolloutPercentage: rollout,
      rules: parseRulesInput(rulesText),
    });
  };

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Flag Configuration"
          title="Fine-grained control for every flag"
          subtitle="Open any flag to configure targeting, environments and progressive rollouts — release confidently without exposing everyone at once."
        />

        <div className="mt-14 grid items-start gap-6 lg:grid-cols-2">
          {/* details card */}
          <Reveal>
            <div className="glass rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{formatFlagLabel(flag.name)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{flag.name}</p>
                </div>
                <Toggle
                  on={on}
                  onClick={() => {
                    setOn((value) => !value);
                    onToggle(flag.name);
                  }}
                />
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Feature Name</label>
                  <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 font-mono text-sm">
                    <span className="flex-1">{flag.name}</span>
                    <Copy className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Flag Type</label>
                  <div className="mt-1 flex gap-2">
                    {(["boolean", "percentage", "segment"] as const).map((value) => (
                      <button
                        key={value}
                        onClick={() => setType(value)}
                        className={`flex-1 rounded-lg border px-3 py-2 text-xs transition-colors ${
                          type === value
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Targeting Rules
                  </label>
                  <textarea
                    value={rulesText}
                    onChange={(event) => setRulesText(event.target.value)}
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:border-foreground/40"
                    placeholder="plan=premium\nregion=eu"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Rollout</label>
                    <span className="font-mono text-sm text-cyan">{rollout}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={rollout}
                    onChange={(e) => setRollout(Number(e.target.value))}
                    className="mt-2 w-full accent-primary"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <KeyRound className="h-3.5 w-3.5" /> API Key
                  </label>
                  <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 font-mono text-xs">
                    <span className="flex-1 truncate">{flag._id}</span>
                    <Copy className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="ripple flex items-center gap-2 rounded-lg bg-linear-to-r from-primary to-primary-glow px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setRollout(0)}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
                >
                  <RotateCcw className="h-4 w-4" /> Reset Rollout
                </button>
                <button
                  onClick={() => onDelete(flag.name)}
                  disabled={isDeleting}
                  className="flex items-center gap-2 rounded-lg border border-destructive/40 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Trash2 className="h-4 w-4" /> {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Updated{" "}
                <span className="font-mono text-foreground">
                  {flag.updatedAt ? new Date(flag.updatedAt).toLocaleString() : "just now"}
                </span>
              </p>
            </div>
          </Reveal>

          {/* progressive rollout visualization */}
          <Reveal delay={120}>
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold">Progressive Rollout</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Release confidently without exposing everyone at once.
              </p>

              <div className="mt-6 flex items-center justify-between">
                {[0, 10, 25, 50, 100].map((p) => (
                  <button
                    key={p}
                    onClick={() => setRollout(p)}
                    className={`rounded-lg border px-2.5 py-1 font-mono text-xs transition-colors ${
                      rollout >= p
                        ? "border-cyan/50 bg-cyan/10 text-cyan"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-5 gap-3">
                {AVATARS.map((a, i) => {
                  const active = i < enabledCount;
                  return (
                    <div
                      key={i}
                      className={`grid aspect-square place-items-center rounded-xl border text-sm font-semibold transition-all duration-300 ${
                        active
                          ? "border-emerald/50 bg-linear-to-br from-primary/30 to-emerald/30 text-foreground"
                          : "border-border bg-background/40 text-muted-foreground/40"
                      }`}
                    >
                      {a}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-xl border border-border bg-background/40 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Users receiving feature</span>
                  <span className="font-mono text-emerald">
                    {enabledCount} / {AVATARS.length}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-primary via-cyan to-emerald transition-all duration-300"
                    style={{ width: `${rollout}%` }}
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
