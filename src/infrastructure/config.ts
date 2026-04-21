/**
 * Configuración centralizada de la aplicación
 * Valida variables de entorno críticas en tiempo de ejecución
 */

interface AppConfig {
  readonly googleSheets: {
    readonly spreadsheetId: string;
    readonly webAppUrl: string;
  };
  readonly whatsapp: {
    readonly adminPhone: string;
  };
  readonly database: {
    readonly url: string;
  };
  readonly app: {
    readonly env: 'development' | 'production' | 'test';
    readonly isDevelopment: boolean;
    readonly isProduction: boolean;
  };
}

function validateEnvVar(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Variable de entorno requerida no encontrada: ${key}`);
  }
  return value;
}

export const config: AppConfig = {
  googleSheets: {
    spreadsheetId: '12bnYLbUbs-nEccL3hrfVA1zKS4k0n_1zfP72ej07KF8',
    webAppUrl: validateEnvVar(
      'GOOGLE_SHEETS_WEB_APP_URL',
      process.env.GOOGLE_SHEETS_WEB_APP_URL
    ),
  },
  whatsapp: {
    adminPhone: process.env.NEXT_PUBLIC_ADMIN_PHONE || '573001234567',
  },
  database: {
    url: validateEnvVar('DATABASE_URL', process.env.DATABASE_URL),
  },
  app: {
    env: (process.env.NODE_ENV as any) || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },
} as const;

// Validación en tiempo de carga del módulo
if (typeof window === 'undefined') {
  console.log('✓ Configuración validada correctamente');
}
