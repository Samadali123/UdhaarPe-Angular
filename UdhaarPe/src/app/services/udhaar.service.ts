import { Injectable } from '@angular/core';
import { Udhaar } from '../models/udhaar.model';
import { BehaviorSubject, Observable } from 'rxjs';

const STORAGE_KEY = 'udhaarpe_udhaars';

@Injectable({ providedIn: 'root' })
export class UdhaarService {
  private udhaars$ = new BehaviorSubject<Udhaar[]>(this.loadFromStorage());

  getUdhaars(): Observable<Udhaar[]> {
    return this.udhaars$.asObservable();
  }

  addUdhaar(udhaar: Udhaar) {
    const udhaars = [...this.udhaars$.value, udhaar];
    this.udhaars$.next(udhaars);
    this.saveToStorage(udhaars);
  }

  updateUdhaar(updatedUdhaar: Udhaar) {
    const udhaars = this.udhaars$.value.map(udhaar => 
      udhaar.id === updatedUdhaar.id ? updatedUdhaar : udhaar
    );
    this.udhaars$.next(udhaars);
    this.saveToStorage(udhaars);
  }

  deleteUdhaar(udhaarId: string) {
    const udhaars = this.udhaars$.value.filter(udhaar => udhaar.id !== udhaarId);
    this.udhaars$.next(udhaars);
    this.saveToStorage(udhaars);
  }

  // Method to refresh udhaars from localStorage (useful after customer deletion)
  refreshFromStorage() {
    const udhaars = this.loadFromStorage();
    this.udhaars$.next(udhaars);
  }

  getUdhaarById(id: string): Udhaar | undefined {
    return this.udhaars$.value.find(udhaar => udhaar.id === id);
  }

  private loadFromStorage(): Udhaar[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage(udhaars: Udhaar[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(udhaars));
  }

  // Add more CRUD methods as needed
} 