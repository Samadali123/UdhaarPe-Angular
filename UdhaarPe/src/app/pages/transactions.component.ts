import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from '../services/transaction.service';
import { CustomerService } from '../services/customer.service';
import { ToastService } from '../services/toast.service';
import { Transaction } from '../models/transaction.model';
import { Customer } from '../models/customer.model';
import { ScrollbarDirective } from '../directives/scrollbar.directive';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollbarDirective],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  customers: Customer[] = [];
  filteredTransactions: Transaction[] = [];
  
  // Filters
  selectedCustomer = '';
  selectedType = '';
  selectedStatus = '';
  selectedDateRange = '';
  
  // Import
  showImportModal = false;
  importFile: File | null = null;

  constructor(
    private transactionService: TransactionService,
    private customerService: CustomerService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
    
    // Check for customer ID in route params
    this.route.queryParams.subscribe(params => {
      if (params['customerId']) {
        this.selectedCustomer = params['customerId'];
        this.applyFilters();
      }
    });
  }

  loadData() {
    // Load all transactions (not filtered by customer)
    this.transactionService.getTransactions().subscribe(transactions => {
      this.transactions = transactions;
      this.applyFilters();
    });

    this.customerService.getCustomers().subscribe(customers => {
      this.customers = customers;
      // Re-apply filters after customers are loaded to ensure valid customer filtering
      this.applyFilters();
    });
  }

  applyFilters() {
    const filters: any = {};

    if (this.selectedCustomer) {
      filters.customerId = this.selectedCustomer;
    }

    if (this.selectedType) {
      filters.type = this.selectedType as 'udhaar' | 'payment';
    }

    if (this.selectedStatus) {
      filters.status = this.selectedStatus as 'pending' | 'fulfilled';
    }

    if (this.selectedDateRange) {
      filters.dateRange = parseInt(this.selectedDateRange);
    }

    // Get filtered transactions
    let filteredTransactions = this.transactionService.filterTransactions(filters);
    
    // Always filter out transactions with invalid customers (unknown/dummy customers)
    filteredTransactions = filteredTransactions.filter(transaction => 
      this.customers.some(customer => customer.id === transaction.customerId)
    );

    this.filteredTransactions = filteredTransactions;
  }

  getCustomerName(customerId: string): string {
    const customer = this.customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  }

  clearFilters() {
    this.selectedCustomer = '';
    this.selectedType = '';
    this.selectedStatus = '';
    this.selectedDateRange = '';
    this.applyFilters();
    this.toastService.info('Filters cleared');
  }

  openImportModal() {
    this.showImportModal = true;
  }

  closeImportModal() {
    this.showImportModal = false;
    this.importFile = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.importFile = file;
    }
  }

  importTransactions() {
    if (this.importFile) {
      // Here you would implement the actual import logic
      console.log('Importing file:', this.importFile.name);
      this.toastService.success('Transactions imported successfully!');
      this.closeImportModal();
    }
  }

  getTotalAmount(): number {
    return this.filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  }

  getFulfilledCount(): number {
    return this.filteredTransactions.filter(t => t.status === 'fulfilled').length;
  }

  getPendingCount(): number {
    return this.filteredTransactions.filter(t => t.status === 'pending').length;
  }

  getTotalUdhaar(): number {
    return this.filteredTransactions
      .filter(t => t.type === 'udhaar')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalPayments(): number {
    return this.filteredTransactions
      .filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  editTransaction(transaction: Transaction) {
    // Implement edit functionality
    console.log('Edit transaction:', transaction);
    this.toastService.info('Edit functionality coming soon!');
  }

  toggleStatus(transaction: Transaction) {
    const updatedTransaction = { 
      ...transaction, 
      status: transaction.status === 'fulfilled' ? 'pending' as const : 'fulfilled' as const
    };
    this.transactionService.updateTransaction(updatedTransaction);
    this.applyFilters(); // Refresh the list
    this.toastService.success(`Transaction marked as ${updatedTransaction.status}`);
  }

  deleteTransaction(transaction: Transaction) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.deleteTransaction(transaction.id);
      this.applyFilters(); // Refresh the list
      this.toastService.success('Transaction deleted successfully!');
    }
  }

  viewCustomer(customerId: string) {
    this.router.navigate(['/customer', customerId]);
  }
} 