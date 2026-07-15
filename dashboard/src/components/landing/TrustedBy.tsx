const LOGOS = [
  "GitHub",
  "Node.js",
  "Express",
  "React",
  "Next.js",
  "TypeScript",
  "Docker",
  "MongoDB",
];

export function TrustedBy() {
  const row = [...LOGOS, ...LOGOS];
  return (
    <section className="border-y border-border/60 py-10">
      <p className="mb-6 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Trusted across the modern developer ecosystem
      </p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max animate-marquee items-center gap-14">
          {row.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="whitespace-nowrap text-lg font-semibold text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
