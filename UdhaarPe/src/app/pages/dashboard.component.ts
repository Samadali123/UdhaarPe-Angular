import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CustomerService } from '../services/customer.service';
import { TransactionService } from '../services/transaction.service';
import { Customer } from '../models/customer.model';
import { Transaction } from '../models/transaction.model';
import { ScrollbarDirective } from '../directives/scrollbar.directive';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ScrollbarDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  customers: Customer[] = [];
  transactions: Transaction[] = [];
  
  // Dashboard stats
  totalCustomers = 0;
  activeCustomers = 0;
  totalUdhaar = 0;
  totalPayments = 0;
  outstandingAmount = 0;
  totalTransactions = 0;
  
  // Recent data
  recentCustomers: Customer[] = [];
  recentTransactions: Transaction[] = [];

  constructor(
    private customerService: CustomerService,
    private transactionService: TransactionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Load customers
    this.customerService.getCustomers().subscribe(customers => {
      this.customers = customers;
      this.calculateCustomerStats();
    });

    // Load transactions
    this.transactionService.getTransactions().subscribe(transactions => {
      this.transactions = transactions;
      this.calculateTransactionStats();
    });
  }

  calculateCustomerStats() {
    this.totalCustomers = this.customers.length;
    this.activeCustomers = this.customers.filter(c => c.active).length;
    this.recentCustomers = this.customers
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      .slice(0, 5);
  }

  calculateTransactionStats() {
    this.totalTransactions = this.transactions.length;
    
    // Calculate udhaar and payment totals
    this.totalUdhaar = this.transactions
      .filter(t => t.type === 'udhaar')
      .reduce((sum, t) => sum + t.amount, 0);
    
    this.totalPayments = this.transactions
      .filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0);
    
    this.outstandingAmount = this.totalUdhaar - this.totalPayments;
    
    // Get recent transactions (last 7 days) with valid customers only
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    this.recentTransactions = this.transactions
      .filter(t => {
        // Filter by date (recent transactions only)
        const transactionDate = new Date(t.date);
        const isValidDate = transactionDate >= sevenDaysAgo;
        
        // Filter by valid customer (customer exists)
        const hasValidCustomer = this.customers.some(c => c.id === t.customerId);
        
        return isValidDate && hasValidCustomer;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }

  getCustomerName(customerId: string): string {
    const customer = this.customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  navigateToCustomers() {
    this.router.navigate(['/customers']);
  }

  navigateToTransactions() {
    this.router.navigate(['/transactions']);
  }

  navigateToCustomer(customerId: string) {
    this.router.navigate(['/customer', customerId]);
  }
} 