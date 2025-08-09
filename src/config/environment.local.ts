// Configuração temporária para testes locais
export interface EnvironmentConfig {
  apiUrl: string;
  environment: string;
  port: number;
  logLevel: string;
  urlBase: string;
  urlExterna: string;
  feedBackSiteUrl: string;
  cloudFunctionsUrl: string;
  recaptchaKey: string;
  operatorId: string;
  smartCodePrefix: string;
}

// Configuração para teste local
const environment = 'local-test';
const API_URL = 'http://localhost:5000/'; // API mock local

export const config: EnvironmentConfig = {
  apiUrl: API_URL,
  environment: environment,
  port: parseInt(process.env.PORT || '3000'),
  logLevel: 'debug',
  urlBase: 'https://entre.filazero.app/',
  urlExterna: 'https://filazero.net/',
  feedBackSiteUrl: 'https://filazero.net/',
  cloudFunctionsUrl: 'https://us-central1-filazero-6db8c.cloudfunctions.net/',
  recaptchaKey: '6LfccPMpAAAAAIEhlhoMJsdxym18sXbzRZ4AI9bs',
  operatorId: 'c444a882-cc9c-441a-bea9-e77a242fcc22',
  smartCodePrefix: 'SC'
};

// Providers para teste local
export const PROVIDERS = {
  artesano: 906,
  boticario: 730,
  nike: 769,
  phoneNoel: 777,
  queueNoel: 776,
  local: 11  // Provider do mock local
} as const;

// Configurações do reCAPTCHA para teste local
export const RECAPTCHA_CONFIG = {
  siteKey: '6LfccPMpAAAAAIEhlhoMJsdxym18sXbzRZ4AI9bs',
  secretKey: '6LfccPMpAAAAAMdzEiVxE7mIMODCwV2WIBD6-_zb',
  useProductionService: true, // Forçar uso do bypass
  enableHeadlessBrowser: false,
  bypassValidation: true // Habilitar bypass para teste local
} as const;

// Lojas Nike (mantido para compatibilidade)
export const NIKE_STORES = {
  'c5f79269a0564b9a9abcc37a96f6306f': 'nikeguarulhos',
  '247d85935d83416781692646bf858467': 'nikeitaquera'
} as const;

export function getProvider(company: string): number {
  return PROVIDERS[company as keyof typeof PROVIDERS] || 0;
}

export function getNikeStore(storeId: string): string | undefined {
  return NIKE_STORES[storeId as keyof typeof NIKE_STORES];
}

export default config;