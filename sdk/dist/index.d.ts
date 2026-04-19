export interface SegmentRule {
  attribute: string;
  value: string;
}

export interface FeatureFlag {
  name: string;
  type: 'boolean' | 'percentage' | 'segment';
  enabled: boolean;
  rolloutPercentage?: number;
  rules?: SegmentRule[];
}

export interface FeatureFlagClientOptions {
  baseUrl: string;
  socketUrl?: string;
  apiKey?: string;
  onUpdate?: (payload: unknown) => void;
}

export class FeatureFlagClient {
  constructor(options: FeatureFlagClientOptions);
  init(): Promise<void>;
  isEnabled(flagName: string, userId?: string, attributes?: Record<string, unknown>): boolean;
  getFlag(flagName: string): FeatureFlag | null;
  close(): void;
}
