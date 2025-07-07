import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar.component';
import { ToastComponent } from './components/toast.component';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {

  constructor(
    private toastService: ToastService
  ) {}

  ngOnInit() {
    // Component initialization
  }

  onToggleTheme() {
    // Theme toggle functionality
    console.log('Theme toggled');
  }
} 