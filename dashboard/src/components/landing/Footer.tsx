import { Flag, Github, Twitter, Linkedin, MessageCircle } from "lucide-react";

const COLS = [
  {
    title: "Product",
    links: ["Documentation", "API Reference", "Examples", "Roadmap"],
  },
  {
    title: "Resources",
    links: ["GitHub", "Blog", "License", "Changelog"],
  },
  {
    title: "Community",
    links: ["Discord", "X (Twitter)", "LinkedIn", "Contribute"],
  },
];

const SOCIAL = [
  { icon: Github, label: "GitHub" },
  { icon: MessageCircle, label: "Discord" },
  { icon: Twitter, label: "X" },
  { icon: Linkedin, label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-cyan shadow-glow">
                <Flag className="h-4 w-4 text-primary-foreground" />
              </span>
              <span className="text-lg">Flagship</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Ship features faster and release with confidence — a lightweight Feature
              Flag SDK and a powerful management dashboard.
            </p>
            <div className="mt-5 flex gap-2">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLS.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-semibold">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Flagship. MIT Licensed. Open source.</span>
          <span className="font-mono">npm install feature-flag-sdk</span>
        </div>
      </div>
    </footer>
  );
}
