import { Injectable } from '@angular/core';
import { Transaction } from '../models/transaction.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'udhaarpe_transactions';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private transactions$ = new BehaviorSubject<Transaction[]>(this.loadFromStorage());

  getTransactions(customerId?: string): Observable<Transaction[]> {
    if (customerId) {
      return new Observable(observer => {
        const transactions = this.transactions$.value.filter(t => t.customerId === customerId);
        observer.next(transactions);
        observer.complete();
      });
    }
    return this.transactions$.asObservable();
  }

  addTransaction(transaction: Omit<Transaction, 'id'>) {
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4()
    };
    const transactions = [...this.transactions$.value, newTransaction];
    this.transactions$.next(transactions);
    this.saveToStorage(transactions);
    
    return newTransaction;
  }

  updateTransaction(updatedTransaction: Transaction) {
    const transactions = this.transactions$.value.map(transaction => 
      transaction.id === updatedTransaction.id ? updatedTransaction : transaction
    );
    this.transactions$.next(transactions);
    this.saveToStorage(transactions);
  }

  deleteTransaction(transactionId: string) {
    const transaction = this.transactions$.value.find(t => t.id === transactionId);
    const transactions = this.transactions$.value.filter(transaction => transaction.id !== transactionId);
    this.transactions$.next(transactions);
    this.saveToStorage(transactions);
  }

  // Method to refresh transactions from localStorage (useful after customer deletion)
  refreshFromStorage() {
    const transactions = this.loadFromStorage();
    this.transactions$.next(transactions);
  }

  filterTransactions(filters: {
    customerId?: string;
    type?: 'udhaar' | 'payment';
    status?: 'pending' | 'fulfilled';
    dateRange?: number; // days ago
    search?: string;
  }): Transaction[] {
    let filtered = [...this.transactions$.value];

    if (filters.customerId) {
      filtered = filtered.filter(t => t.customerId === filters.customerId);
    }

    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    if (filters.dateRange) {
      const now = new Date();
      const cutoffDate = new Date(now.getTime() - (filters.dateRange * 24 * 60 * 60 * 1000));
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= cutoffDate;
      });
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.productName.toLowerCase().includes(searchTerm) ||
        t.description?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }

  private loadFromStorage(): Transaction[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage(transactions: Transaction[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }
} 