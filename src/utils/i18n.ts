// src/utils/i18n.ts

const translations = new Map<string, Map<string, string>>([
  ['en', new Map([
    ['noActiveItem', 'No active item selected'],
    ['noRouteMapping', 'No route mapping found for content type: "{contentType}"'],
    ['noScreenConfig', 'No screen configuration found for Page ID: "{pageId}"'],
    ['noPageBlocks', 'This screen has no page blocks config.'],
  ])],
  ['es', new Map([
    ['noActiveItem', 'Ningún elemento activo seleccionado'],
    ['noRouteMapping', 'No se encontró asignación de ruta para el tipo de contenido: "{contentType}"'],
    ['noScreenConfig', 'No se encontró configuración de pantalla para la ID de página: "{pageId}"'],
    ['noPageBlocks', 'Esta pantalla no tiene configuración de bloques de página.'],
  ])]
]);

let currentLocale = 'en';

export function setLocale(locale: string) {
  if (locale && translations.has(locale)) {
    currentLocale = locale;
  }
}

export function t(key: string, variables?: Record<string, string>): string {
  const localeMap = translations.get(currentLocale) || translations.get('en');
  if (!localeMap) return key;

  let text = localeMap.get(key) || key;

  if (variables) {
    Object.entries(variables).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
  }

  return text;
}
