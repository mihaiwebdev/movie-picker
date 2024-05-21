import { Injectable, inject } from '@angular/core';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { PrimeNGConfig } from 'primeng/api';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  private readonly primengConfig = inject(PrimeNGConfig);
  // Firebase Config
  private readonly firebaseConfig = environment.firebaseConfig;
  private readonly firebaseApp = initializeApp(this.firebaseConfig);
  // private readonly analytics = getAnalytics(this.firebaseApp)
  public readonly db = getFirestore(this.firebaseApp);
  public readonly auth = getAuth(this.firebaseApp);

  constructor() {
    this.primengConfig.ripple = true;
  }
}
