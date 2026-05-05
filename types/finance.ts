export interface Expense {
  _id?: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory = 
  | 'office'
  | 'software'
  | 'marketing'
  | 'utilities'
  | 'travel'
  | 'salaries'
  | 'rent'
  | 'other';

export interface Sale {
  _id: string;
  source: string;
  client: string;
  amount: number;
  status: 'paid' | 'pending' | 'cancelled';
  date: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean; 
}

export interface FinanceStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  trend?: {
    value: number;
    percentage: number;
  };
  revenueGrowth: number;
  expenseGrowth: number;
}

export interface MonthlyFinanceData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}
