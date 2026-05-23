const HOME_PATHS = ['/es', '/en', '/pt'];
const PROPERTY_PATHS = ['/es/propiedades/', '/en/properties/', '/pt/propriedades/'];

const PAGE_LABELS: Record<string, Record<string, string>> = {
  es: {
    home: 'Home Page',
    property: 'Detalle de propiedad',
  },
  en: {
    home: 'Home Page',
    property: 'Property details',
  },
  pt: {
    home: 'Home Page',
    property: 'Detalhes da propriedade',
  },
};

export function getPageLabel(pathname: string, locale: string = 'es'): string {
  const labels = PAGE_LABELS[locale] || PAGE_LABELS.es;

  if (HOME_PATHS.includes(pathname)) {
    return labels.home;
  }

  if (PROPERTY_PATHS.some(prefix => pathname.startsWith(prefix))) {
    return labels.property;
  }

  return pathname;
}
