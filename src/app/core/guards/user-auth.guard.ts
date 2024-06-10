import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserDataService } from '../services/user-data.service';

export const userAuthGuard: CanActivateFn = (route, state) => {
  const userDataService = inject(UserDataService);
  const router = inject(Router);

  if (userDataService.$currentUser()?.uid) {
    return true;
  } else {
    router.navigateByUrl('/app');
    return false;
  }
};
