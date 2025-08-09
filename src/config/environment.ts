// Configuração de ambiente
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

// Configuração dinâmica baseada em variáveis de ambiente
const environment = process.env.NODE_ENV || 'production';

// Definir URL da API baseada no ambiente ou variável específica
function getApiUrl(): string {
  // Prioridade: 1) FILAZERO_API_URL, 2) Por ambiente, 3) Default produção
  if (process.env.FILAZERO_API_URL) {
    return process.env.FILAZERO_API_URL;
  }
  
  switch (environment) {
    case 'development':
    case 'dev':
      return 'https://api.dev.filazero.net/';
    case 'staging':
    case 'homologation':
      return 'https://api.staging.filazero.net/';
    case 'production':
    case 'prod':
    default:
      return 'https://api.filazero.net/';
  }
}

const API_URL = getApiUrl();

export const config: EnvironmentConfig = {
  apiUrl: API_URL,
  environment: environment,
  port: parseInt(process.env.PORT || '3000'),
  logLevel: process.env.LOG_LEVEL || 'debug',
  urlBase: 'https://entre.filazero.app/',
  urlExterna: 'https://filazero.net/',
  feedBackSiteUrl: 'https://filazero.net/',
  cloudFunctionsUrl: 'https://us-central1-filazero-6db8c.cloudfunctions.net/',
  recaptchaKey: '6LfccPMpAAAAAIEhlhoMJsdxym18sXbzRZ4AI9bs',
  operatorId: 'c444a882-cc9c-441a-bea9-e77a242fcc22',
  smartCodePrefix: 'SC'
};

// Configurações específicas do reCAPTCHA por ambiente
export const RECAPTCHA_CONFIG = {
  siteKey: '6LfccPMpAAAAAIEhlhoMJsdxym18sXbzRZ4AI9bs',
  secretKey: '6LfccPMpAAAAAMdzEiVxE7mIMODCwV2WIBD6-_zb',
  useProductionService: process.env.USE_PRODUCTION_RECAPTCHA === 'true' || process.env.NODE_ENV === 'production',
  enableHeadlessBrowser: process.env.ENABLE_HEADLESS_RECAPTCHA === 'true',
  // Habilitar bypass automaticamente em staging/desenvolvimento ou se explicitamente configurado
  bypassValidation: process.env.BYPASS_RECAPTCHA === 'true' || 
                   environment === 'staging' || 
                   environment === 'development' ||
                   environment === 'dev'
} as const;

// Providers por ambiente
function getProviders() {
  switch (environment) {
    case 'development':
    case 'dev':
      return {
        artesano: 460,
        boticario: 358,
        nike: 356,
        phoneNoel: 357,
        queueNoel: 357,
        filazero: 11  // Provider de teste
      };
    case 'staging':
    case 'homologation':
      return {
        artesano: 460,  // IDs de desenvolvimento/staging
        boticario: 358,
        nike: 356,
        phoneNoel: 357,
        queueNoel: 357,
        filazero: 11
      };
    case 'production':
    case 'prod':
    default:
      return {
        artesano: 906,
        boticario: 730,
        nike: 769,
        phoneNoel: 777,
        queueNoel: 776
      };
  }
}

export const PROVIDERS = getProviders();

// Configuração das lojas Nike
export const NIKE_STORES = {
  'c5f79269a0564b9a9abcc37a96f6306f': 'nikeguarulhos',
  '247d85935d83416781692646bf858467': 'nikeitaquera',
  'd5e98fbdc74b4a858d48dd1b3d762b9f': 'nikevilavelha',
  '3047c636e9304b858117800b96905562': 'nikesantoandre',
  '3b4ce03373894c85adc8dadae1069b1c': 'nikeribeirao',
  '3b353f5fee9b4b289dca90d011ea96e9': 'nikesjcampos',
  '643815cb9351417ca8aa80ccee8c39a8': 'nikesaogoncalo',
  '2be1c66b5a484a5790b6ce4f349435ef': 'nikesaobernardo',
  'dacfb19f2cc245f99c901bb35ad27418': 'nikesalvador',
  '0a7d327b9d2c410dbf3434849ef892d9': 'nikepremiumsp',
  'e39628bde5774c2d86bf3ea4bd2145d7': 'nikepremiumrj',
  '743aebf6cd07476aa2f03bfeacca59b7': 'nikeosasco',
  'fdf3bbd44fdd4ce5b3c65e86d4bd1187': 'nikenovohamburgo',
  '03ee0f6f3287411ab72feb578c7a20ab': 'nikenovaamerica',
  '7fd738a52978415ba88f16c3f6f42cd3': 'nikefortaleza',
  'd30a8d6e3afd495daa7ba4d642d1c63c': 'nike curitiba',
  '7cb9be6532c54e66a0aea4ad299bb854': 'nikecontagem',
  'da00633032914eb1b9febd9a195db454': 'nikecatarina',
  '39ea59a828fb497bad563116914bad06': 'nikepremiumbrasilia',
  '2638ecd4140b4811a9a57b1556efd607': 'nikelight',
  'a8ae8116f5904d15b7b8fe7d088c1645': 'nikegoiania',
  '0b956ac312b942a080ec4c5992c09cdf': 'nikepremiumgrandesp'
} as const;

export function getProvider(company: string): number {
  return PROVIDERS[company as keyof typeof PROVIDERS] || 0;
}

export function getNikeStore(storeId: string): string | undefined {
  return NIKE_STORES[storeId as keyof typeof NIKE_STORES];
}

export default config;