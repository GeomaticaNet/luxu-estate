const HOME_PATHS = ['/es', '/en', '/pt'];
const PROPERTY_PATHS = ['/es/propiedades/', '/en/properties/', '/pt/propriedades/'];
const ADMIN_USERS_PATHS = ['/es/admin/users', '/en/admin/users', '/pt/admin/users'];
const ADMIN_PROPERTIES_PATHS = ['/es/admin/properties', '/en/admin/properties', '/pt/admin/properties'];

const PAGE_LABELS: Record<string, Record<string, string>> = {
  es: {
    home: 'Home Page',
    property: 'Detalle de propiedad',
    adminUsers: 'Administrando usuarios',
    adminProperties: 'Administrando propiedades',
  },
  en: {
    home: 'Home Page',
    property: 'Property details',
    adminUsers: 'Managing users',
    adminProperties: 'Managing properties',
  },
  pt: {
    home: 'Home Page',
    property: 'Detalhes da propriedade',
    adminUsers: 'Gerenciando usuários',
    adminProperties: 'Gerenciando propriedades',
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

  if (ADMIN_USERS_PATHS.includes(pathname)) {
    return labels.adminUsers;
  }

  if (ADMIN_PROPERTIES_PATHS.includes(pathname)) {
    return labels.adminProperties;
  }

  return pathname;
}
