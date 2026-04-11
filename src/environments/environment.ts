/**
 * Production — uniquement l’API en ligne (pas de backend local).
 * Contrat & liste des routes : https://api.vps.jbis.cm/swagger-ui/index.html
 * + README backend (sections API / admin).
 */
export const environment = {
  production: true,
  /** Origine serveur (sans /api/v1) */
  baseUrl: 'https://api.vps.jbis.cm',
  /** Préfixe API versionnée */
  apiUrl: 'https://api.vps.jbis.cm/api/v1',
  swaggerUiUrl: 'https://api.vps.jbis.cm/swagger-ui/index.html',
  openApiJsonUrl: 'https://api.vps.jbis.cm/v3/api-docs',

  appName: 'KikEvent Admin',
  version: '1.0.0'
};
