import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../services/customer.service';
import { TransactionService } from '../services/transaction.service';
import { ToastService } from '../services/toast.service';
import { ModalService } from '../services/modal.service';
import { Customer } from '../models/customer.model';
import { Transaction } from '../models/transaction.model';
import { Subscription } from 'rxjs';
import { ScrollbarDirective } from '../directives/scrollbar.directive';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ScrollbarDirective],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit, OnDestroy {
  customers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  showEditModal = false;
  showDeleteModal = false;
  showTransactionsModal = false;
  customerTransactions: Transaction[] = [];
  searchTerm = '';
  editForm!: FormGroup;
  addForm!: FormGroup;
  showAddModal = false;
  private customersSubscription!: Subscription;
  private transactionsSubscription!: Subscription;

  constructor(
    private customerService: CustomerService,
    private transactionService: TransactionService,
    private toastService: ToastService,
    private modalService: ModalService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.initForms();
  }

  private initForms() {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]]
    });

    this.addForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]]
    });
  }

  ngOnInit() {
    console.log('CustomersComponent: ngOnInit called');
    
    // Subscribe to customer updates for real-time changes
    this.customersSubscription = this.customerService.getCustomers().subscribe(customers => {
      console.log('CustomersComponent: Received customers:', customers);
      this.customers = customers;
      this.cdr.detectChanges();
    });

    // Subscribe to transaction updates for real-time changes
    this.transactionsSubscription = this.transactionService.getTransactions().subscribe(transactions => {
      console.log('CustomersComponent: Received transactions:', transactions);
      this.customerTransactions = transactions;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.customersSubscription) {
      this.customersSubscription.unsubscribe();
    }
    if (this.transactionsSubscription) {
      this.transactionsSubscription.unsubscribe();
    }
  }

  get filteredCustomers() {
    if (!this.searchTerm.trim()) return this.customers;

    const searchQuery = this.searchTerm.toLowerCase().trim();
    
    // Filter customers whose name contains the search string
    const filtered = this.customers.filter(customer =>
      customer.name.toLowerCase().includes(searchQuery)
    );

    // Sort: names that start with the search string come first
    const sorted = filtered.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aStarts = aName.startsWith(searchQuery);
      const bStarts = bName.startsWith(searchQuery);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });
    
    return sorted;
  }

  // Get customers with dynamic financial data
  get customersWithFinancials() {
    return this.customerService.getCustomersWithFinancials();
  }

  // Get filtered customers with dynamic financial data
  get filteredCustomersWithFinancials() {
    const customersWithFinancials = this.customersWithFinancials;
    
    if (!this.searchTerm.trim()) return customersWithFinancials;

    const searchQuery = this.searchTerm.toLowerCase().trim();
    
    // Filter customers whose name contains the search string
    const filtered = customersWithFinancials.filter(customer =>
      customer.name.toLowerCase().includes(searchQuery)
    );

    // Sort: names that start with the search string come first
    const sorted = filtered.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aStarts = aName.startsWith(searchQuery);
      const bStarts = bName.startsWith(searchQuery);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });
    
    return sorted;
  }

  // Add Customer Methods
  openAddCustomer() {
    this.showAddModal = true;
    this.addForm.reset();
    this.cdr.detectChanges();
  }

  addCustomer() {
    if (this.addForm.valid) {
      const formData = this.addForm.value;
      
      const newCustomer: Omit<Customer, 'id'> = {
        name: formData.name.trim(),
        phone: formData.phone,
        active: true,
        totalUdhaar: 0,
        totalReceived: 0,
        outstanding: 0,
        dateAdded: new Date().toISOString()
      };

      this.customerService.addCustomer(newCustomer);
      this.closeAddModal();
      this.toastService.success('Customer added successfully!');
    } else {
      this.markFormGroupTouched(this.addForm);
      this.toastService.error('Please fix the form errors before submitting.');
    }
  }

  closeAddModal() {
    this.showAddModal = false;
    this.addForm.reset();
    this.cdr.detectChanges();
  }

  // Edit Customer Methods
  editCustomer(customer: Customer) {
    this.selectedCustomer = { ...customer };
    
    // Reset form and set values properly
    this.editForm.reset();
    
    // Use setTimeout to ensure form is reset before setting values
    setTimeout(() => {
      this.editForm.patchValue({
        name: customer.name,
        phone: customer.phone
      });
      
      this.showEditModal = true;
      this.cdr.detectChanges();
    }, 0);
  }

  saveCustomer() {
    if (this.editForm.invalid) {
      this.markFormGroupTouched(this.editForm);
      this.toastService.error('Please fix the form errors before submitting.');
      return;
    }

    const formValue = this.editForm.value;
    
    // Check if phone number already exists for another customer
    if (this.selectedCustomer && this.isPhoneNumberDuplicate(formValue.phone, this.selectedCustomer.id)) {
      this.toastService.error('Phone number already in use.');
      return;
    }

    if (this.selectedCustomer) {
      const updatedCustomer: Customer = {
        ...this.selectedCustomer,
        name: formValue.name.trim(),
        phone: formValue.phone
      };

      this.customerService.updateCustomer(updatedCustomer);
      this.closeEditModal();
      this.toastService.success('Customer updated successfully!');
    }
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedCustomer = null;
    this.editForm.reset();
    this.cdr.detectChanges();
  }

  // Delete Customer Methods
  deleteCustomer(customer: Customer) {
    this.selectedCustomer = customer;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  confirmDelete() {
    if (this.selectedCustomer) {
      this.customerService.deleteCustomer(this.selectedCustomer.id);
      this.closeDeleteModal();
      this.toastService.success(`Customer "${this.selectedCustomer.name}" and all related transactions have been deleted successfully!`);
    }
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedCustomer = null;
    this.cdr.detectChanges();
  }

  // Utility Methods
  private isPhoneNumberDuplicate(phone: string, currentCustomerId: string): boolean {
    return this.customers.some(customer => 
      customer.phone === phone && customer.id !== currentCustomerId
    );
  }

  private markFormGroupTouched(form: FormGroup) {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(form: FormGroup, controlName: string): string {
    const control = form.get(controlName);
    
    if (control?.hasError('required')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
    }
    
    if (controlName === 'name' && control?.hasError('minlength')) {
      return 'Name must be at least 2 characters long';
    }
    
    if (controlName === 'phone') {
      if (control?.hasError('pattern')) {
        return 'Phone number must be 10-11 digits';
      }
    }
    
    return '';
  }

  // Other Methods
  viewCustomer(customer: Customer) {
    this.router.navigate(['/customer', customer.id]);
  }

  closeModals() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.showTransactionsModal = false;
    this.selectedCustomer = null;
    this.addForm.reset();
    this.editForm.reset();
    this.cdr.detectChanges();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
} 