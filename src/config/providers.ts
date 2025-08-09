// Provider IDs by environment - migrated from .NET appsettings
export const PROVIDERS = {
  development: {
    artesano: 460,
    boticario: 358,
    nike: 356,
    noel: 357
  },
  staging: {
    artesano: 460,
    boticario: 358,
    nike: 356,
    noel: 357
  },
  production: {
    artesano: 906,
    boticario: 730,
    nike: 769,
    noel: 777
  }
} as const;

export function getProvider(environment: string, company: string): number {
  const env = environment as keyof typeof PROVIDERS;
  const providers = PROVIDERS[env] || PROVIDERS.development;
  return providers[company as keyof typeof providers] || 0;
}

export function getAllProviders(environment: string): Record<string, number> {
  const env = environment as keyof typeof PROVIDERS;
  return PROVIDERS[env] || PROVIDERS.development;
}