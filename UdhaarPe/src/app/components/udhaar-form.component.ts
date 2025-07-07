import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-udhaar-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './udhaar-form.component.html',
  styleUrls: ['./udhaar-form.component.css']
})
export class UdhaarFormComponent {
  @Input() open = false;
  @Input() customerName = '';
  @Output() close = new EventEmitter<void>();
  @Output() submitUdhaar = new EventEmitter<{ amount: number; productName: string; description: string }>();

  amount: number | null = null;
  productName = '';
  description = '';

  onSubmit() {
    if (this.amount && this.productName.trim()) {
      this.submitUdhaar.emit({
        amount: this.amount,
        productName: this.productName.trim(),
        description: this.description.trim()
      });
      this.amount = null;
      this.productName = '';
      this.description = '';
    }
  }

  onClose() {
    this.close.emit();
    this.amount = null;
    this.productName = '';
    this.description = '';
  }
} 