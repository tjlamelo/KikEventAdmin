/**
 * Développement — même API que la prod (exigence : pas d’URL locale pour le backend).
 * Seul le flag `production` change (logs, build Angular).
 */
export const environment = {
  production: false,
  baseUrl: 'https://api.vps.jbis.cm',
  apiUrl: 'https://api.vps.jbis.cm/api/v1',
  swaggerUiUrl: 'https://api.vps.jbis.cm/swagger-ui/index.html',
  openApiJsonUrl: 'https://api.vps.jbis.cm/v3/api-docs',

  appName: 'KikEvent Admin',
  version: '1.0.0-dev'
};
