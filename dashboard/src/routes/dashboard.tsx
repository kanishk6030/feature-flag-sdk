import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Nav } from "@/components/landing/Nav";
import { Dashboard } from "@/components/landing/Dashboard";
import { FeatureDetails } from "@/components/landing/FeatureDetails";
import { Environments } from "@/components/landing/Environments";
import { Analytics } from "@/components/landing/Analytics";
import { Footer } from "@/components/landing/Footer";
import {
  clearDashboardConfig,
  flagApi,
  getDefaultApiBaseUrl,
  loadDashboardConfig,
  type DashboardConfig,
  type FlagRecord,
} from "@/lib/dashboard-api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Flagship Feature Flag Management" },
      {
        name: "description",
        content:
          "A control room for every feature. Search, filter, toggle, target segments, and monitor live evaluations across every environment from one glassy dashboard.",
      },
      { property: "og:title", content: "Dashboard — Flagship" },
      {
        property: "og:description",
        content:
          "Manage progressive rollouts, user targeting, environments, and real-time analytics from the Flagship dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [flags, setFlags] = useState<FlagRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlagName, setSelectedFlagName] = useState<string | null>(null);
  const [savingFlag, setSavingFlag] = useState<string | null>(null);
  const [deletingFlag, setDeletingFlag] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadDashboardConfig();
    setConfig(
      stored ?? {
        apiBaseUrl: getDefaultApiBaseUrl(),
        authMode: "bearer",
        authValue: "",
      },
    );
  }, []);

  useEffect(() => {
    if (!config) {
      return;
    }

    if (!config.authValue) {
      setFlags([]);
      setSelectedFlagName(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    flagApi
      .list(config)
      .then((data) => {
        if (cancelled) {
          return;
        }
        setFlags(data);
        setSelectedFlagName((current) => current ?? data[0]?.name ?? null);
      })
      .catch((fetchError) => {
        if (cancelled) {
          return;
        }
        const message = fetchError instanceof Error ? fetchError.message : "Unable to load flags";
        setError(message);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [config]);

  const selectedFlag = useMemo(
    () => flags.find((flag) => flag.name === selectedFlagName) ?? null,
    [flags, selectedFlagName],
  );

  const activeConfig = config ?? {
    apiBaseUrl: getDefaultApiBaseUrl(),
    authMode: "bearer",
    authValue: "",
  };

  const refreshFlags = async () => {
    if (!activeConfig.authValue) {
      toast.error("Sign in or sign up first to connect the backend.");
      return;
    }

    setIsRefreshing(true);
    try {
      const data = await flagApi.list(activeConfig);
      setFlags(data);
      setSelectedFlagName((current) => current ?? data[0]?.name ?? null);
      toast.success("Dashboard refreshed.");
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Unable to refresh flags";
      setError(message);
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateFlag = async () => {
    if (!activeConfig.authValue) {
      toast.error("Sign in or sign up first to connect the backend.");
      return;
    }

    const rawName = window.prompt("Flag name", "new-dashboard");
    const name = rawName?.trim();
    if (!name) {
      return;
    }

    try {
      const created = await flagApi.create(activeConfig, {
        name,
        type: "boolean",
        enabled: false,
        rolloutPercentage: 0,
        rules: [],
      });
      setFlags((current) => [created, ...current]);
      setSelectedFlagName(created.name);
      toast.success(`Created ${created.name}.`);
    } catch (createError) {
      toast.error(createError instanceof Error ? createError.message : "Unable to create flag");
    }
  };

  const handleToggleFlag = async (name: string) => {
    if (!activeConfig.authValue) {
      toast.error("Sign in or sign up first to connect the backend.");
      return;
    }

    try {
      const updated = await flagApi.toggle(activeConfig, name);
      setFlags((current) => current.map((flag) => (flag.name === name ? updated : flag)));
      if (selectedFlagName === name) {
        setSelectedFlagName(updated.name);
      }
      toast.success(`${updated.name} toggled.`);
    } catch (toggleError) {
      toast.error(toggleError instanceof Error ? toggleError.message : "Unable to toggle flag");
    }
  };

  const handleSaveFlag = async (
    name: string,
    payload: {
      type: FlagRecord["type"];
      enabled: boolean;
      rolloutPercentage: number;
      rules: FlagRecord["rules"];
    },
  ) => {
    if (!activeConfig.authValue) {
      toast.error("Sign in or sign up first to connect the backend.");
      return;
    }

    setSavingFlag(name);
    try {
      const updated = await flagApi.update(activeConfig, name, payload);
      setFlags((current) => current.map((flag) => (flag.name === name ? updated : flag)));
      setSelectedFlagName(updated.name);
      toast.success(`${updated.name} saved.`);
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Unable to save flag");
    } finally {
      setSavingFlag(null);
    }
  };

  const handleDeleteFlag = async (name: string) => {
    if (!activeConfig.authValue) {
      toast.error("Sign in or sign up first to connect the backend.");
      return;
    }

    if (!window.confirm(`Delete ${name}?`)) {
      return;
    }

    setDeletingFlag(name);
    try {
      await flagApi.remove(activeConfig, name);
      setFlags((current) => current.filter((flag) => flag.name !== name));
      setSelectedFlagName((current) => (current === name ? null : current));
      toast.success(`${name} deleted.`);
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : "Unable to delete flag");
    } finally {
      setDeletingFlag(null);
    }
  };

  const handleSignOut = () => {
    clearDashboardConfig();
    setConfig({
      apiBaseUrl: getDefaultApiBaseUrl(),
      authMode: "bearer",
      authValue: "",
    });
    setFlags([]);
    setSelectedFlagName(null);
    toast.success("Signed out of the dashboard backend.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="pt-16">
        {!activeConfig.authValue && (
          <section className="relative py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                Sign in or sign up to connect this dashboard to the backend. The current backend URL
                is <span className="font-mono text-foreground">{activeConfig.apiBaseUrl}</span>.
              </div>
            </div>
          </section>
        )}
        <Dashboard
          config={activeConfig}
          flags={flags}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          error={error}
          selectedFlagName={selectedFlagName}
          onSelectFlag={setSelectedFlagName}
          onCreateFlag={handleCreateFlag}
          onToggleFlag={handleToggleFlag}
          onRefresh={refreshFlags}
          onSignOut={handleSignOut}
        />
        <FeatureDetails
          flag={selectedFlag}
          onToggle={handleToggleFlag}
          onSave={handleSaveFlag}
          onDelete={handleDeleteFlag}
          isSaving={savingFlag === selectedFlag?.name}
          isDeleting={deletingFlag === selectedFlag?.name}
        />
        <Environments flags={flags} />
        <Analytics flags={flags} />
      </main>
      <Footer />
    </div>
  );
}
