import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

// Firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';
import { environment } from '../environments/environment';

// FontAwesome (opcional)
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFacebook, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';

export const appConfig: ApplicationConfig = {
  providers: [
    // Angular básico
    provideRouter(routes),
    provideHttpClient(),

    // FontAwesome (opcional)
    importProvidersFrom(FontAwesomeModule),
    {
      provide: FaIconLibrary,
      useFactory: () => {
        const library = new FaIconLibrary();
        library.addIcons(faFacebook, faInstagram, faTwitter);
        return library;
      }
    },

    // Firebase
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideAnalytics(() => getAnalytics()), provideFirebaseApp(() => initializeApp({ projectId: "tecweb-proyectofinal-2025", appId: "1:891151412097:web:f01e4bdb0c7c14b73cd680", storageBucket: "tecweb-proyectofinal-2025.firebasestorage.app", apiKey: "AIzaSyD1GdEEnLBoChteMMl7VMvTbbhy2NfpWRg", authDomain: "tecweb-proyectofinal-2025.firebaseapp.com", messagingSenderId: "891151412097", measurementId: "G-E64BR5P5FZ" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())

    // Agrega más servicios Firebase según necesites:
    // provideStorage(() => getStorage()),
    // provideFunctions(() => getFunctions())
  ]
};