import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerService } from '../services/customer.service';
import { ToastService } from '../services/toast.service';
import { ModalService } from '../services/modal.service';
import { Customer } from '../models/customer.model';
import { v4 as uuidv4 } from 'uuid';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.css']
})
export class CustomerFormComponent implements OnInit, OnDestroy {
  showModal = false;
  customerForm!: FormGroup;
  private modalSubscription!: Subscription;

  constructor(
    private customerService: CustomerService,
    private toastService: ToastService,
    private modalService: ModalService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.modalSubscription = this.modalService.addCustomerModal$.subscribe(show => {
      console.log('CustomerForm: Modal state changed to:', show);
      this.showModal = show;
      this.cdr.detectChanges();
      if (show) {
        this.resetForm();
      }
    });
  }

  ngOnDestroy() {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
  }

  initForm() {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]]
    });
  }

  resetForm() {
    this.customerForm.reset({
      name: '',
      phone: ''
    });
  }

  onSubmit() {
    if (this.customerForm.valid) {
      const formData = this.customerForm.value;
      
      const newCustomer: Omit<Customer, 'id'> = {
        name: formData.name,
        phone: formData.phone,
        active: true, // Always set to true by default
        totalUdhaar: 0,
        totalReceived: 0,
        outstanding: 0,
        dateAdded: new Date().toISOString()
      };

      this.customerService.addCustomer(newCustomer);
      this.resetForm();
      this.closeModal();
      this.toastService.success('Customer added successfully!');
    } else {
      this.toastService.error('Please fill all required fields correctly');
    }
  }

  closeModal() {
    this.modalService.closeAddCustomerModal();
  }

  onModalBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  get nameError(): string {
    const nameControl = this.customerForm.get('name');
    if (nameControl?.errors && nameControl.touched) {
      if (nameControl.errors['required']) return 'Name is required.';
      if (nameControl.errors['minlength']) return 'Name must be at least 2 characters.';
    }
    return '';
  }

  get phoneError(): string {
    const phoneControl = this.customerForm.get('phone');
    if (phoneControl?.errors && phoneControl.touched) {
      if (phoneControl.errors['required']) return 'Phone number is required.';
      if (phoneControl.errors['pattern']) return 'Please enter a valid phone number (10-11 digits).';
    }
    return '';
  }
} 