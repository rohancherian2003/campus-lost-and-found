import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

fetch('./assets/config.json')
  .then(res => res.json())
  .then(runtimeConfig => {
    console.log('Loaded runtime configuration:', runtimeConfig);
    if (runtimeConfig.apiUrl) {
      environment.apiUrl = runtimeConfig.apiUrl;
    }
    bootstrapApplication(AppComponent, appConfig)
      .catch(err => console.error(err));
  })
  .catch(err => {
    console.warn('Failed to load runtime config, using build-time environment.', err);
    bootstrapApplication(AppComponent, appConfig)
      .catch(err => console.error(err));
  });

