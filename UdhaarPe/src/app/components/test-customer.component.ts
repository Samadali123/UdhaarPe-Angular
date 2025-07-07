import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../services/customer.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-test-customer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px;">
      <h2>Test Customer Functionality</h2>
      <button (click)="testAddCustomer()">Test Add Customer</button>
      <button (click)="testToast()">Test Toast</button>
      <div *ngFor="let customer of customers">
        <p>{{ customer.name }} - {{ customer.phone }}</p>
      </div>
    </div>
  `
})
export class TestCustomerComponent {
  customers: any[] = [];

  constructor(
    private customerService: CustomerService,
    private toastService: ToastService
  ) {
    this.loadCustomers();
  }

  loadCustomers() {
    this.customerService.getCustomers().subscribe(customers => {
      this.customers = customers;
    });
  }

  testAddCustomer() {
    try {
      this.customerService.addCustomer({
        name: 'Test Customer',
        phone: '1234567890',
        active: true,
        totalUdhaar: 0,
        totalReceived: 0,
        outstanding: 0
      });
      this.toastService.success('Test customer added!');
      this.loadCustomers();
    } catch (error) {
      this.toastService.error('Failed to add test customer');
    }
  }

  testToast() {
    this.toastService.success('Success toast test!');
    this.toastService.error('Error toast test!');
    this.toastService.warning('Warning toast test!');
    this.toastService.info('Info toast test!');
  }
} 