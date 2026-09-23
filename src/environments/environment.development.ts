export const environment = {
  production: false,
  defaultauth: 'fackbackend',
  directoryPath: '/root/iwf',
  CUT_SHORT_COMMON_IP_PORT: (window as any)['env']?.[
    'CUT_SHORT_COMMON_IP_PORT'
  ],
  CUT_SHORT_API_KEY: (window as any)['env']?.['CUT_SHORT_API_KEY'],
  SOURCE_USERNAME: 'admin',
  SOURCE_PASSWORD: 'admin@123',
  CATALOG_ID: true,
};
