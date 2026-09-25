export const environment = {
  production: false,
  defaultauth: 'fackbackend',
  directoryPath: '/root/iwf',
  CUT_SHORT_COMMON_IP_PORT: (window as any)['env']?.[
    'CUT_SHORT_COMMON_IP_PORT'
  ],
  CUT_SHORT_API_KEY: (window as any)['env']?.['CUT_SHORT_API_KEY'],

  /* Cloudinary — public client-safe config only (unsigned upload flow).
     The API key + secret must never be shipped to the browser; they are
     only needed for signed uploads and belong on a backend. */
  CLOUDINARY_CLOUD_NAME:
    (window as any)['env']?.['CLOUDINARY_CLOUD_NAME'] ?? 'Root',
  CLOUDINARY_UPLOAD_PRESET:
    (window as any)['env']?.['CLOUDINARY_UPLOAD_PRESET'] ?? 'cutroom_unsigned',

  SOURCE_USERNAME: 'admin',
  SOURCE_PASSWORD: 'admin@123',
  CATALOG_ID: true,
};
