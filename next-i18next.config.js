module.exports = {
  debug: false,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt', 'fr', 'es'],
  },
  localePath: 'public/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  ns: [
    'navigation',
    'footer',
    'categories',
    'hero',
    'about',
    'projects',
    'contact',
    'projects/ui-components',
    'projects/sonora',
    'projects/agentic-hub',
    'projects/cash-register',
    'projects/o-guardanapo',
  ],
  defaultNS: 'projects',
  fallbackLng: 'en',
  returnEmptyString: false,
};

