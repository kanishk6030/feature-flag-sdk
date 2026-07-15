import { createFileRoute } from "@tanstack/react-router";

import { Nav } from "@/components/landing/Nav";
import { CodeShowcase } from "@/components/landing/CodeShowcase";
import { DeveloperWorkflow } from "@/components/landing/DeveloperWorkflow";
import { Integrations } from "@/components/landing/Integrations";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — Flagship Feature Flag SDK & REST API" },
      {
        name: "description",
        content:
          "Drop the lightweight Flagship SDK into any stack. Explore code samples, developer workflows, first-class SDKs, and a clean REST API for managing feature flags anywhere.",
      },
      { property: "og:title", content: "Docs — Flagship" },
      {
        property: "og:description",
        content:
          "SDK integration guides, developer workflows, and a REST API reference for the Flagship feature flag platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DocsPage,
});

function DocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="pt-16">
        <CodeShowcase />
        <DeveloperWorkflow />
        <Integrations />
      </main>
      <Footer />
    </div>
  );
}
