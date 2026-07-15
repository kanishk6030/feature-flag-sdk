import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./Features";

const FAQS = [
  {
    q: "What are Feature Flags?",
    a: "Feature flags are switches in your code that let you turn features on or off at runtime — without redeploying. You control who sees what, when, and how much, all from the dashboard.",
  },
  {
    q: "How do Percentage Rollouts work?",
    a: "You assign a rollout percentage to a flag (e.g. 10%). The SDK deterministically buckets users so a consistent slice receives the feature. Increase gradually to 25%, 50%, then 100% as you gain confidence.",
  },
  {
    q: "Can I manage multiple environments?",
    a: "Yes. Development, Testing, Staging and Production each hold independent flag values. Configure a feature once and control it separately per environment.",
  },
  {
    q: "Is the SDK lightweight?",
    a: "Extremely. The SDK has a tiny footprint, evaluates flags locally for speed, and adds negligible overhead to your application.",
  },
  {
    q: "Does it work with React and Next.js?",
    a: "Absolutely — plus Node.js, Express, NestJS and any environment via the REST API. TypeScript types are included out of the box.",
  },
  {
    q: "Can I self-host?",
    a: "Yes. Flagship is open source and can be self-hosted on your own infrastructure, or run on the managed cloud.",
  },
  {
    q: "Is it open source?",
    a: "Yes, Flagship is MIT licensed. Read the source, contribute, and self-host freely.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 40}>
                <div className="glass overflow-hidden rounded-2xl">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-medium">{f.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
