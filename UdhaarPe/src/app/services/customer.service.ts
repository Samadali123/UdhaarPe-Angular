import { Injectable } from '@angular/core';
import { Customer } from '../models/customer.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { TransactionService } from './transaction.service';
import { UdhaarService } from './udhaar.service';

const STORAGE_KEY = 'udhaarpe_customers';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private customers$ = new BehaviorSubject<Customer[]>(this.loadFromStorage());

  constructor(
    private transactionService: TransactionService,
    private udhaarService: UdhaarService
  ) {}

  getCustomers(): Observable<Customer[]> {
    return this.customers$.asObservable();
  }

  addCustomer(customer: Omit<Customer, 'id' | 'dateAdded'>) {
    const newCustomer: Customer = {
      ...customer,
      id: uuidv4(),
      dateAdded: new Date().toISOString(),
      active: true,
      totalUdhaar: 0,
      totalReceived: 0,
      outstanding: 0
    };
    const customers = [...this.customers$.value, newCustomer];
    this.customers$.next(customers);
    this.saveToStorage(customers);
    return newCustomer;
  }

  updateCustomer(updatedCustomer: Customer) {
    const customers = this.customers$.value.map(customer => 
      customer.id === updatedCustomer.id ? updatedCustomer : customer
    );
    this.customers$.next(customers);
    this.saveToStorage(customers);
  }

  deleteCustomer(customerId: string) {
    // Delete customer
    const customers = this.customers$.value.filter(customer => customer.id !== customerId);
    this.customers$.next(customers);
    this.saveToStorage(customers);
    
    // Delete all related transactions
    this.deleteCustomerTransactions(customerId);
    
    // Delete all related udhaars
    this.deleteCustomerUdhaars(customerId);
    
    // Refresh other services to reflect the changes
    this.transactionService.refreshFromStorage();
    this.udhaarService.refreshFromStorage();
  }

  getCustomerById(id: string): Customer | undefined {
    return this.customers$.value.find(customer => customer.id === id);
  }

  findCustomerByPhone(phone: string): Customer | undefined {
    return this.customers$.value.find(customer => customer.phone === phone);
  }

  searchCustomers(query: string): Customer[] {
    const lowerQuery = query.toLowerCase();
    return this.customers$.value.filter(customer => 
      customer.name.toLowerCase().includes(lowerQuery) ||
      customer.phone.includes(lowerQuery)
    );
  }

  // Calculate customer financial data dynamically
  calculateCustomerFinancials(customerId: string): { totalUdhaar: number; totalReceived: number; outstanding: number } {
    const TRANSACTION_STORAGE_KEY = 'udhaarpe_transactions';
    const transactionData = localStorage.getItem(TRANSACTION_STORAGE_KEY);
    
    if (!transactionData) {
      return { totalUdhaar: 0, totalReceived: 0, outstanding: 0 };
    }

    const transactions = JSON.parse(transactionData);
    const customerTransactions = transactions.filter((transaction: any) => transaction.customerId === customerId);

    const totalUdhaar = customerTransactions
      .filter((t: any) => t.type === 'udhaar')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const totalReceived = customerTransactions
      .filter((t: any) => t.type === 'payment')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const outstanding = totalUdhaar - totalReceived;

    return { totalUdhaar, totalReceived, outstanding };
  }

  // Get customer with calculated financial data
  getCustomerWithFinancials(customerId: string): Customer | undefined {
    const customer = this.getCustomerById(customerId);
    if (!customer) return undefined;

    const financials = this.calculateCustomerFinancials(customerId);
    return {
      ...customer,
      totalUdhaar: financials.totalUdhaar,
      totalReceived: financials.totalReceived,
      outstanding: financials.outstanding
    };
  }

  // Get all customers with calculated financial data
  getCustomersWithFinancials(): Customer[] {
    return this.customers$.value.map(customer => {
      const financials = this.calculateCustomerFinancials(customer.id);
      return {
        ...customer,
        totalUdhaar: financials.totalUdhaar,
        totalReceived: financials.totalReceived,
        outstanding: financials.outstanding
      };
    });
  }

  // Update customer financial data when transactions change
  updateCustomerFinancials(customerId: string) {
    const customers = this.customers$.value.map(customer => {
      if (customer.id === customerId) {
        const financials = this.calculateCustomerFinancials(customerId);
        return {
          ...customer,
          totalUdhaar: financials.totalUdhaar,
          totalReceived: financials.totalReceived,
          outstanding: financials.outstanding
        };
      }
      return customer;
    });
    this.customers$.next(customers);
    this.saveToStorage(customers);
  }

  private loadFromStorage(): Customer[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage(customers: Customer[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  }

  private deleteCustomerTransactions(customerId: string) {
    const TRANSACTION_STORAGE_KEY = 'udhaarpe_transactions';
    const transactionData = localStorage.getItem(TRANSACTION_STORAGE_KEY);
    if (transactionData) {
      const transactions = JSON.parse(transactionData);
      const filteredTransactions = transactions.filter((transaction: any) => transaction.customerId !== customerId);
      localStorage.setItem(TRANSACTION_STORAGE_KEY, JSON.stringify(filteredTransactions));
    }
  }

  private deleteCustomerUdhaars(customerId: string) {
    const UDHAAR_STORAGE_KEY = 'udhaarpe_udhaars';
    const udhaarData = localStorage.getItem(UDHAAR_STORAGE_KEY);
    if (udhaarData) {
      const udhaars = JSON.parse(udhaarData);
      const filteredUdhaars = udhaars.filter((udhaar: any) => udhaar.customerId !== customerId);
      localStorage.setItem(UDHAAR_STORAGE_KEY, JSON.stringify(filteredUdhaars));
    }
  }

  // Add more CRUD methods as needed
} 