import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';
import { CustomersComponent } from './pages/customers.component';
import { HomeComponent } from './pages/home.component';
import { TransactionsComponent } from './pages/transactions.component';
import { CustomerDetailComponent } from './pages/customer-detail.component';
import { TestCustomerComponent } from './components/test-customer.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'customers', component: CustomersComponent },
  { path: 'customer/:id', component: CustomerDetailComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'test', component: TestCustomerComponent },
  { path: '**', redirectTo: '' }
]; 