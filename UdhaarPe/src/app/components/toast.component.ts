import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let toast of toasts" 
        class="toast"
        [class]="toast.type"
      >
        <div class="toast-content">
          <span class="toast-icon">
            {{ getIcon(toast.type) }}
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="removeToast(toast)">×</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .toast {
      min-width: 300px;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      display: flex;
      align-items: center;
    }

    .toast.success {
      background: #4caf50;
      color: white;
    }

    .toast.error {
      background: #f44336;
      color: white;
    }

    .toast.warning {
      background: #ff9800;
      color: white;
    }

    .toast.info {
      background: #2196f3;
      color: white;
    }

    .toast-content {
      display: flex;
      align-items: center;
      width: 100%;
      gap: 12px;
    }

    .toast-icon {
      font-size: 18px;
    }

    .toast-message {
      flex: 1;
      font-size: 14px;
    }

    .toast-close {
      background: none;
      border: none;
      color: inherit;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s;
    }

    .toast-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription.add(
      this.toastService.toast$.subscribe(toast => {
        this.addToast(toast);
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  addToast(toast: ToastMessage) {
    this.toasts.push(toast);
    
    setTimeout(() => {
      this.removeToast(toast);
    }, toast.duration || 3000);
  }

  removeToast(toast: ToastMessage) {
    const index = this.toasts.indexOf(toast);
    if (index > -1) {
      this.toasts.splice(index, 1);
    }
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  }
} 