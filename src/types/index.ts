export interface Student {
  id: string;
  studentNumber: number;
  name: string;
}

export interface Statement {
  id: string;
  name: string;
  requiredAmount: number;
  createdAt: string;
  updatedAt: string;
  headerTitle?: string;
  description?: string;
}

export interface StatementStudentSpec {
  statementId: string;
  studentId: string;
  specification: string;
}

export interface Payment {
  id: string;
  statementId: string;
  studentId: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}

export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface StudentStatementSummary {
  student: Student;
  specification: string;
  requiredAmount: number;
  paidAmount: number;
  balance: number;
  overpaid: number;
  status: PaymentStatus;
  payments: Payment[];
}

export interface StatementCalculations {
  totalRequired: number;
  totalCollected: number;
  totalBalance: number;
  totalOverpaid: number;
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
  percentCollected: number;
}

export interface AppBackupData {
  version: number;
  exportedAt: string;
  students: Student[];
  statements: Statement[];
  specifications: StatementStudentSpec[];
  payments: Payment[];
}
