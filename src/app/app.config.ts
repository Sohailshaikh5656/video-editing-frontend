import { ApplicationConfig } from '@angular/core';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
} from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { CloudinaryService } from './services/upload/cloudinary.service';
import { UPLOAD_PROVIDER } from './services/upload/upload-provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withEnabledBlockingInitialNavigation()),
    provideHttpClient(withInterceptors([authInterceptor])),

    // Upload stack — UI code only depends on the UPLOAD_PROVIDER contract.
    // Migrating to Cloudflare R2 = implement UploadProvider and swap this line.
    { provide: UPLOAD_PROVIDER, useExisting: CloudinaryService },
  ],
};
