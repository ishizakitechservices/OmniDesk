/**
 * School AI — Centralized AI Provider & Capability Configuration
 * 
 * Invariant: Model IDs come EXCLUSIVELY from environment/deployment configuration.
 * The application logic NEVER hardcodes specific model IDs or dependencies.
 */

export interface CapabilityModelMapping {
  fast: string;
  reasoning: string;
  vision: string;
  embedding: string;
  transcription: string;
  tts: string;
}

export interface ProviderConfig {
  providerId: 'gemini' | 'xai' | 'custom';
  displayName: string;
  enabled: boolean;
  apiKeyEnvVar: string;
  baseUrl?: string;
  capabilities: CapabilityModelMapping;
}

export interface SystemAIConfig {
  activeProviderId: 'gemini' | 'xai' | 'custom';
  fallbackProviderId?: 'gemini' | 'xai' | 'custom';
  providers: Record<string, ProviderConfig>;
  timeoutMs: number;
  maxRetryAttempts: number;
}

/**
 * Loads capability configuration dynamically from process.env or fallback defaults.
 * Model names are placeholders in configuration only and can be replaced at runtime
 * without requiring any architectural changes.
 */
export function getAIConfig(): SystemAIConfig {
  // Read active provider from env
  const activeProvider = (process.env.AI_PROVIDER as 'gemini' | 'xai' | 'custom') || 'gemini';

  return {
    activeProviderId: activeProvider,
    fallbackProviderId: process.env.XAI_API_KEY ? 'xai' : undefined,
    timeoutMs: 30000,
    maxRetryAttempts: 2,
    providers: {
      gemini: {
        providerId: 'gemini',
        displayName: 'Google Gemini Engine',
        enabled: Boolean(process.env.GEMINI_API_KEY),
        apiKeyEnvVar: 'GEMINI_API_KEY',
        capabilities: {
          fast: process.env.AI_MODEL_FAST || 'gemini-flash-latest',
          reasoning: process.env.AI_MODEL_REASONING || 'gemini-flash-latest',
          vision: process.env.AI_MODEL_VISION || 'gemini-flash-latest',
          embedding: process.env.AI_MODEL_EMBEDDING || 'text-embedding-004',
          transcription: process.env.AI_MODEL_TRANSCRIPTION || 'gemini-3.5-transcribe',
          tts: process.env.AI_MODEL_TTS || 'gemini-3.8-flash-lite-tts',
        },
      },
      xai: {
        providerId: 'xai',
        displayName: 'xAI Grok Adapter',
        enabled: Boolean(process.env.XAI_API_KEY),
        apiKeyEnvVar: 'XAI_API_KEY',
        baseUrl: 'https://api.x.ai/v1',
        capabilities: {
          fast: process.env.AI_MODEL_FAST_GROK || 'grok-2',
          reasoning: process.env.AI_MODEL_REASONING_GROK || 'grok-2',
          vision: process.env.AI_MODEL_VISION_GROK || 'grok-2-vision',
          embedding: process.env.AI_MODEL_EMBEDDING_GROK || 'embedding-default',
          transcription: 'transcription-default',
          tts: 'tts-default',
        },
      },
    },
  };
}

/**
 * Resolves the appropriate model ID for a requested capability slot
 * based on the active provider.
 */
export function resolveModelForCapability(
  capability: keyof CapabilityModelMapping,
  preferredProviderId?: string
): { providerId: string; modelId: string } {
  const config = getAIConfig();
  const providerId = preferredProviderId || config.activeProviderId;
  const provider = config.providers[providerId];

  if (!provider || !provider.enabled) {
    // Attempt fallback provider if primary is disabled
    if (config.fallbackProviderId && config.providers[config.fallbackProviderId]?.enabled) {
      const fallback = config.providers[config.fallbackProviderId];
      return {
        providerId: fallback.providerId,
        modelId: fallback.capabilities[capability],
      };
    }
  }

  const activeProviderConfig = provider || config.providers.gemini;
  return {
    providerId: activeProviderConfig.providerId,
    modelId: activeProviderConfig.capabilities[capability],
  };
}
