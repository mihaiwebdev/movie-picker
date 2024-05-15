import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  public setToLocalStorage(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  public getFromLocalStorage(key: string) {
    const itemFromLs = localStorage.getItem(key);

    return itemFromLs ? JSON.parse(itemFromLs) : null;
  }
}
