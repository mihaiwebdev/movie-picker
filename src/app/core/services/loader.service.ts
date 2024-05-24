import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private readonly state = {
    $isLoading: signal(false),
  };
  public readonly $isLoading = this.state.$isLoading.asReadonly();

  public setIsLoading(value: boolean) {
    this.state.$isLoading.set(value);
  }
}
