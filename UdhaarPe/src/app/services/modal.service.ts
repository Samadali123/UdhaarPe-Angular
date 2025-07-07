import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private addCustomerModalSubject = new BehaviorSubject<boolean>(false);
  addCustomerModal$ = this.addCustomerModalSubject.asObservable();

  openAddCustomerModal() {
    console.log('ModalService: Opening add customer modal');
    this.addCustomerModalSubject.next(true);
  }

  closeAddCustomerModal() {
    console.log('ModalService: Closing add customer modal');
    this.addCustomerModalSubject.next(false);
  }

  getCurrentModalState(): boolean {
    return this.addCustomerModalSubject.value;
  }
} 