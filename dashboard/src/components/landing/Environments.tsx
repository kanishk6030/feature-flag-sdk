import { ArrowRight, GitBranch } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./Features";
import type { FlagRecord } from "@/lib/dashboard-api";
import { formatFlagLabel } from "@/lib/dashboard-api";

interface EnvironmentsProps {
  flags: FlagRecord[];
}

function Dot({ on }: { on: boolean }) {
  return (
    <span
      className={`h-2 w-2 rounded-full ${on ? "bg-emerald shadow-[0_0_8px_var(--emerald)]" : "bg-muted-foreground/40"}`}
    />
  );
}

export function Environments({ flags }: EnvironmentsProps) {
  const groups = [
    {
      name: "Boolean",
      color: "text-cyan",
      ring: "border-cyan/40",
      flags: flags.filter((flag) => flag.type === "boolean"),
    },
    {
      name: "Percentage",
      color: "text-chart-4",
      ring: "border-chart-4/40",
      flags: flags.filter((flag) => flag.type === "percentage"),
    },
    {
      name: "Segment",
      color: "text-primary",
      ring: "border-primary/40",
      flags: flags.filter((flag) => flag.type === "segment"),
    },
    {
      name: "All flags",
      color: "text-emerald",
      ring: "border-emerald/40",
      flags,
    },
  ];

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Flag Types"
          title={
            <>
              Model every flag
              <br className="sm:hidden" /> with the backend schema.
            </>
          }
          subtitle="The backend stores boolean, percentage and segment flags, so the dashboard reflects the actual data model instead of a mock environment matrix."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group, i) => (
            <Reveal key={group.name} delay={i * 90}>
              <div
                className={`glass glass-hover relative h-full rounded-2xl border p-5 ${group.ring}`}
              >
                <div className="flex items-center gap-2">
                  <GitBranch className={`h-4 w-4 ${group.color}`} />
                  <h3 className="font-semibold">{group.name}</h3>
                </div>
                <div className="mt-4 space-y-2.5">
                  {group.flags.slice(0, 3).map((flag) => (
                    <div
                      key={flag._id}
                      className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2"
                    >
                      <span className="font-mono text-xs">{formatFlagLabel(flag.name)}</span>
                      <Dot on={flag.enabled} />
                    </div>
                  ))}
                  {group.flags.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border bg-background/40 px-3 py-2 text-xs text-muted-foreground">
                      No flags in this group yet.
                    </div>
                  )}
                </div>
                {i < groups.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-muted-foreground/40 lg:block" />
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
