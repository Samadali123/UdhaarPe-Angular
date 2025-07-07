export interface Transaction {
  id: string;
  customerId: string;
  type: 'udhaar' | 'payment';
  amount: number;
  productName: string;
  description?: string;
  status: 'pending' | 'fulfilled';
  date: string;
} 