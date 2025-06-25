import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

// Firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth, connectAuthEmulator } from '@angular/fire/auth';
import { getFirestore, provideFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';
import { environment } from '../environments/environment';

// FontAwesome (opcional)
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFacebook, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),

    // FontAwesome
    importProvidersFrom(FontAwesomeModule),
    {
      provide: FaIconLibrary,
      useFactory: () => {
        const library = new FaIconLibrary();
        library.addIcons(faFacebook, faInstagram, faTwitter);
        return library;
      }
    },

    // Firebase App
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),

    // Firebase Auth con emulador si está activo
    provideAuth(() => {
      const auth = getAuth();
      if (environment.useEmulators) {
        //connectAuthEmulator(auth, 'http://localhost:9099');
      }
      return auth;
    }),

    // Firebase Firestore con emulador si está activo
    provideFirestore(() => {
      const firestore = getFirestore();
      if (environment.useEmulators) {
        //connectFirestoreEmulator(firestore, 'localhost', 8080);
      }
      return firestore;
    }),

    // Firebase Analytics
    provideAnalytics(() => getAnalytics())
  ]
};
