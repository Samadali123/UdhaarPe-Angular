import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../services/customer.service';
import { TransactionService } from '../services/transaction.service';
import { ToastService } from '../services/toast.service';
import { Customer } from '../models/customer.model';
import { Transaction } from '../models/transaction.model';
import { v4 as uuidv4 } from 'uuid';
import { ScrollbarDirective } from '../directives/scrollbar.directive';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ScrollbarDirective],
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.css']
})
export class CustomerDetailComponent implements OnInit {
  customer: Customer | null = null;
  transactions: Transaction[] = [];
  showAddUdhaarModal = false;
  showAddPaymentModal = false;
  
  udhaarForm!: FormGroup;
  paymentForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private transactionService: TransactionService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.initForms();
  }

  ngOnInit() {
    this.loadCustomer();
  }

  initForms() {
    this.udhaarForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      productName: ['', [Validators.required]],
      description: [''],
      date: [new Date().toISOString().split('T')[0], [Validators.required]]
    });

    this.paymentForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      remarks: [''],
      date: [new Date().toISOString().split('T')[0], [Validators.required]]
    });
  }

  loadCustomer() {
    const customerId = this.route.snapshot.paramMap.get('id');
    if (customerId) {
      const foundCustomer = this.customerService.getCustomerWithFinancials(customerId);
      if (foundCustomer) {
        this.customer = foundCustomer;
        this.loadTransactions();
      } else {
        this.toastService.error('Customer not found');
        this.router.navigate(['/customers']);
      }
    }
  }

  loadTransactions() {
    if (this.customer) {
      this.transactionService.getTransactions(this.customer.id).subscribe(transactions => {
        this.transactions = transactions;
        // Update customer financials after loading transactions
        if (this.customer) {
          this.customer = this.customerService.getCustomerWithFinancials(this.customer.id) || this.customer;
        }
      });
    }
  }

  getTotalUdhaar(): number {
    if (!this.customer) return 0;
    return this.customer.totalUdhaar;
  }

  getTotalReceived(): number {
    if (!this.customer) return 0;
    return this.customer.totalReceived;
  }

  getOutstanding(): number {
    if (!this.customer) return 0;
    return this.customer.outstanding;
  }

  openAddUdhaarModal() {
    this.showAddUdhaarModal = true;
    this.udhaarForm.reset({
      date: new Date().toISOString().split('T')[0]
    });
  }

  closeAddUdhaarModal() {
    this.showAddUdhaarModal = false;
    this.udhaarForm.reset();
  }

  openAddPaymentModal() {
    this.showAddPaymentModal = true;
    this.paymentForm.reset({
      date: new Date().toISOString().split('T')[0]
    });
  }

  closeAddPaymentModal() {
    this.showAddPaymentModal = false;
    this.paymentForm.reset();
  }

  addUdhaar() {
    if (this.udhaarForm.valid && this.customer) {
      const formData = this.udhaarForm.value;
      
      const newTransaction: Omit<Transaction, 'id'> = {
        customerId: this.customer.id,
        type: 'udhaar',
        amount: formData.amount,
        productName: formData.productName,
        description: formData.description,
        status: 'pending',
        date: formData.date
      };

      this.transactionService.addTransaction(newTransaction);
      this.closeAddUdhaarModal();
      this.loadTransactions();
      
      // Refresh customer data with updated financials
      if (this.customer) {
        this.customer = this.customerService.getCustomerWithFinancials(this.customer.id) || this.customer;
      }
      
      this.toastService.success('Udhaar added successfully!');
    }
  }

  addPayment() {
    if (this.paymentForm.valid && this.customer) {
      const formData = this.paymentForm.value;
      
      const newTransaction: Omit<Transaction, 'id'> = {
        customerId: this.customer.id,
        type: 'payment',
        amount: formData.amount,
        productName: 'Payment Received',
        description: formData.remarks,
        status: 'fulfilled',
        date: formData.date
      };

      this.transactionService.addTransaction(newTransaction);
      this.closeAddPaymentModal();
      this.loadTransactions();
      
      // Refresh customer data with updated financials
      if (this.customer) {
        this.customer = this.customerService.getCustomerWithFinancials(this.customer.id) || this.customer;
      }
      
      this.toastService.success('Payment recorded successfully!');
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  goBack() {
    this.router.navigate(['/customers']);
  }
} 