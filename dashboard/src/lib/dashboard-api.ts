import { formatDistanceToNowStrict } from "date-fns";

export type DashboardAuthMode = "bearer" | "apiKey";

export interface DashboardConfig {
  apiBaseUrl: string;
  authMode: DashboardAuthMode;
  authValue: string;
}

export interface FlagRule {
  attribute: string;
  value: string;
}

export interface FlagRecord {
  _id: string;
  name: string;
  type: "boolean" | "percentage" | "segment";
  enabled: boolean;
  rolloutPercentage: number;
  rules: FlagRule[];
  createdAt?: string;
  updatedAt?: string;
  ownerId?: string;
}

export interface FlagPayload {
  name: string;
  type?: FlagRecord["type"];
  enabled?: boolean;
  rolloutPercentage?: number;
  rules?: FlagRule[];
}

const STORAGE_KEY = "flagship.dashboard.config";

export function normalizeApiBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export function getDefaultApiBaseUrl() {
  return normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001");
}

function isFlagRule(value: unknown): value is FlagRule {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as FlagRule).attribute === "string" &&
    typeof (value as FlagRule).value === "string"
  );
}

export function loadDashboardConfig(): DashboardConfig | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DashboardConfig>;
    if (typeof parsed.authValue !== "string" || !parsed.authValue.trim()) {
      return null;
    }

    return {
      apiBaseUrl: normalizeApiBaseUrl(parsed.apiBaseUrl || getDefaultApiBaseUrl()),
      authMode: parsed.authMode === "apiKey" ? "apiKey" : "bearer",
      authValue: parsed.authValue.trim(),
    };
  } catch {
    return null;
  }
}

export function saveDashboardConfig(config: DashboardConfig) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      apiBaseUrl: normalizeApiBaseUrl(config.apiBaseUrl),
      authMode: config.authMode,
      authValue: config.authValue.trim(),
    }),
  );
}

export function clearDashboardConfig() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function formatFlagLabel(name: string) {
  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function formatRelativeTimestamp(value?: string) {
  if (!value) {
    return "just now";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "just now";
  }

  return formatDistanceToNowStrict(parsed, { addSuffix: true });
}

export function parseRulesInput(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [attribute, ...rest] = line.split("=");
      return {
        attribute: attribute?.trim() ?? "",
        value: rest.join("=").trim(),
      };
    })
    .filter(isFlagRule);
}

export function stringifyRules(rules: FlagRule[]) {
  return rules.map((rule) => `${rule.attribute}=${rule.value}`).join("\n");
}

function buildHeaders(config: DashboardConfig, initHeaders?: HeadersInit) {
  const headers = new Headers(initHeaders);
  headers.set("Accept", "application/json");
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (config.authMode === "apiKey") {
    headers.set("X-API-Key", config.authValue);
  } else {
    headers.set("Authorization", `Bearer ${config.authValue}`);
  }

  return headers;
}

async function requestJson<T>(config: DashboardConfig, path: string, init: RequestInit = {}) {
  const response = await fetch(`${normalizeApiBaseUrl(config.apiBaseUrl)}${path}`, {
    ...init,
    headers: buildHeaders(config, init.headers),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      typeof body?.error === "string"
        ? body.error
        : typeof body?.message === "string"
          ? body.message
          : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const flagApi = {
  list(config: DashboardConfig) {
    return requestJson<FlagRecord[]>(config, "/flags");
  },
  create(config: DashboardConfig, payload: FlagPayload) {
    return requestJson<FlagRecord>(config, "/flags", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(config: DashboardConfig, name: string, payload: Partial<FlagPayload>) {
    return requestJson<FlagRecord>(config, `/flags/${encodeURIComponent(name)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  toggle(config: DashboardConfig, name: string) {
    return requestJson<FlagRecord>(config, `/flags/${encodeURIComponent(name)}/toggle`, {
      method: "PATCH",
    });
  },
  rollout(config: DashboardConfig, name: string, percentage: number) {
    return requestJson<FlagRecord>(config, `/flags/${encodeURIComponent(name)}/rollout`, {
      method: "PATCH",
      body: JSON.stringify({ percentage }),
    });
  },
  remove(config: DashboardConfig, name: string) {
    return requestJson<{ message: string }>(config, `/flags/${encodeURIComponent(name)}`, {
      method: "DELETE",
    });
  },
};
