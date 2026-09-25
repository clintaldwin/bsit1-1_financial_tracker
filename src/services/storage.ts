import { INITIAL_STUDENTS } from '../data/initialRoster';
import { AppBackupData, Payment, Statement, StatementStudentSpec, Student } from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'bsit11_students_v1',
  STATEMENTS: 'bsit11_statements_v1',
  SPECIFICATIONS: 'bsit11_specifications_v1',
  PAYMENTS: 'bsit11_payments_v1',
  INITIALIZED: 'bsit11_initialized_v1',
};

// Safe JSON parse helper
function safeParse<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch (err) {
    console.error('Error parsing localStorage key:', err);
    return fallback;
  }
}

// Ensure initial 45 students are populated on first launch without overwriting existing data
export function initializeStorage(): void {
  try {
    const existingStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!existingStudents) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STATEMENTS)) {
      localStorage.setItem(STORAGE_KEYS.STATEMENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SPECIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.SPECIFICATIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
    }
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  } catch (e) {
    console.error('Failed to initialize localStorage:', e);
  }
}

export function getStudents(): Student[] {
  const students = safeParse<Student[]>(localStorage.getItem(STORAGE_KEYS.STUDENTS), []);
  if (students.length === 0) {
    // If somehow empty, fall back to initial roster
    return INITIAL_STUDENTS;
  }
  return students;
}

export function getStatements(): Statement[] {
  return safeParse<Statement[]>(localStorage.getItem(STORAGE_KEYS.STATEMENTS), []);
}

export function getSpecifications(): StatementStudentSpec[] {
  return safeParse<StatementStudentSpec[]>(localStorage.getItem(STORAGE_KEYS.SPECIFICATIONS), []);
}

export function getPayments(): Payment[] {
  return safeParse<Payment[]>(localStorage.getItem(STORAGE_KEYS.PAYMENTS), []);
}

export function createStatement(name: string, requiredAmount: number, headerTitle?: string): Statement {
  const statements = getStatements();
  const newStatement: Statement = {
    id: `stmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    requiredAmount: Math.max(0, Math.round((requiredAmount + Number.EPSILON) * 100) / 100),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    headerTitle: headerTitle?.trim() || 'BSIT 1-1 — INTRAMS FINANCIAL DATA',
  };

  const updated = [newStatement, ...statements];
  localStorage.setItem(STORAGE_KEYS.STATEMENTS, JSON.stringify(updated));
  return newStatement;
}

export function updateStatement(id: string, updates: Partial<Pick<Statement, 'name' | 'requiredAmount' | 'headerTitle'>>): Statement | null {
  const statements = getStatements();
  const index = statements.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const current = statements[index];
  const updated: Statement = {
    ...current,
    ...updates,
    requiredAmount:
      updates.requiredAmount !== undefined
        ? Math.max(0, Math.round((updates.requiredAmount + Number.EPSILON) * 100) / 100)
        : current.requiredAmount,
    updatedAt: new Date().toISOString(),
  };

  statements[index] = updated;
  localStorage.setItem(STORAGE_KEYS.STATEMENTS, JSON.stringify(statements));
  return updated;
}

export function deleteStatement(id: string): void {
  // Remove statement
  const statements = getStatements().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.STATEMENTS, JSON.stringify(statements));

  // Remove associated specs
  const specs = getSpecifications().filter((sp) => sp.statementId !== id);
  localStorage.setItem(STORAGE_KEYS.SPECIFICATIONS, JSON.stringify(specs));

  // Remove associated payments
  const payments = getPayments().filter((p) => p.statementId !== id);
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
}

export function saveSpecification(statementId: string, studentId: string, specification: string): void {
  const specs = getSpecifications();
  const existingIndex = specs.findIndex(
    (s) => s.statementId === statementId && s.studentId === studentId
  );

  const cleanSpec = specification.trim();

  if (existingIndex > -1) {
    if (cleanSpec === '') {
      specs.splice(existingIndex, 1);
    } else {
      specs[existingIndex].specification = cleanSpec;
    }
  } else if (cleanSpec !== '') {
    specs.push({
      statementId,
      studentId,
      specification: cleanSpec,
    });
  }

  localStorage.setItem(STORAGE_KEYS.SPECIFICATIONS, JSON.stringify(specs));
}

export function addPayment(data: {
  statementId: string;
  studentId: string;
  amount: number;
  date: string;
  note?: string;
}): Payment {
  const payments = getPayments();
  const newPayment: Payment = {
    id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    statementId: data.statementId,
    studentId: data.studentId,
    amount: Math.max(0, Math.round((data.amount + Number.EPSILON) * 100) / 100),
    date: data.date || new Date().toISOString().split('T')[0],
    note: data.note?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  payments.unshift(newPayment);
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

  // Also touch statement updatedAt
  touchStatementUpdated(data.statementId);

  return newPayment;
}

export function deletePayment(paymentId: string): Payment | null {
  const payments = getPayments();
  const target = payments.find((p) => p.id === paymentId);
  if (!target) return null;

  const filtered = payments.filter((p) => p.id !== paymentId);
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(filtered));

  touchStatementUpdated(target.statementId);
  return target;
}

function touchStatementUpdated(statementId: string) {
  const statements = getStatements();
  const stmt = statements.find((s) => s.id === statementId);
  if (stmt) {
    stmt.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.STATEMENTS, JSON.stringify(statements));
  }
}

// Backup & Restore
export function exportBackupData(): AppBackupData {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    students: getStudents(),
    statements: getStatements(),
    specifications: getSpecifications(),
    payments: getPayments(),
  };
}

export function downloadBackupJson(): void {
  const data = exportBackupData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BSIT-1-1-financial-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importBackupData(jsonString: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Invalid backup file format.' };
    }

    if (!Array.isArray(parsed.students) || !Array.isArray(parsed.statements)) {
      return { success: false, message: 'Backup file is missing required student or statement records.' };
    }

    // Persist imported data
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(parsed.students));
    localStorage.setItem(STORAGE_KEYS.STATEMENTS, JSON.stringify(parsed.statements));
    localStorage.setItem(STORAGE_KEYS.SPECIFICATIONS, JSON.stringify(parsed.specifications || []));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(parsed.payments || []));

    return { success: true, message: 'Backup restored successfully!' };
  } catch (err) {
    console.error('Failed to import backup:', err);
    return { success: false, message: 'Could not read or parse JSON file.' };
  }
}

export function resetToCleanRoster(): void {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  localStorage.setItem(STORAGE_KEYS.STATEMENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.SPECIFICATIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
}

// Load Demo Data for rapid testing / demonstration
export function loadDemoData(): void {
  const students = INITIAL_STUDENTS;
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const stmt1: Statement = {
    id: `stmt_demo_tshirt`,
    name: 'T-Shirt',
    requiredAmount: 600,
    headerTitle: 'BSIT 1-1 — INTRAMS FINANCIAL DATA',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
    description: 'BSIT 1-1 Official Intramurals Class Jersey & T-Shirt',
  };

  const stmt2: Statement = {
    id: `stmt_demo_fund`,
    name: 'Class Fund 1st Sem',
    requiredAmount: 150,
    headerTitle: 'BSIT 1-1 — CLASS FUND FINANCIAL STATEMENT',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
    description: 'First Semester General Class Fund for cleaning supplies, water, and events',
  };

  const sampleSpecs: StatementStudentSpec[] = [
    { statementId: stmt1.id, studentId: students[0].id, specification: 'Medium' },
    { statementId: stmt1.id, studentId: students[1].id, specification: 'Small' },
    { statementId: stmt1.id, studentId: students[2].id, specification: 'Medium' },
    { statementId: stmt1.id, studentId: students[3].id, specification: 'Large' },
    { statementId: stmt1.id, studentId: students[4].id, specification: 'XL' },
    { statementId: stmt1.id, studentId: students[5].id, specification: 'Large' },
    { statementId: stmt1.id, studentId: students[6].id, specification: 'Small' },
    { statementId: stmt1.id, studentId: students[7].id, specification: '2XL' },
    { statementId: stmt1.id, studentId: students[18].id, specification: 'Medium' },
    { statementId: stmt1.id, studentId: students[33].id, specification: 'Large' },
    { statementId: stmt1.id, studentId: students[44].id, specification: 'XL' },
  ];

  const samplePayments: Payment[] = [
    // Full payments
    {
      id: 'pay_demo_1',
      statementId: stmt1.id,
      studentId: students[44].id, // Yanmar Villanueva
      amount: 600,
      date: todayStr,
      note: 'Full payment via GCash',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pay_demo_2',
      statementId: stmt1.id,
      studentId: students[4].id, // Archiluz Genayas E.
      amount: 400,
      date: todayStr,
      note: 'Downpayment',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pay_demo_3',
      statementId: stmt1.id,
      studentId: students[4].id, // Archiluz Genayas E. (second payment)
      amount: 200,
      date: todayStr,
      note: 'Final balance settlement',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pay_demo_4',
      statementId: stmt1.id,
      studentId: students[0].id, // Abalo, Berly Marie N
      amount: 300,
      date: todayStr,
      note: '1st installment',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pay_demo_5',
      statementId: stmt1.id,
      studentId: students[1].id, // Alcazar, Princess Mae
      amount: 600,
      date: todayStr,
      note: 'Cash payment',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pay_demo_6',
      statementId: stmt1.id,
      studentId: students[2].id, // Aliganga Samantha
      amount: 350,
      date: todayStr,
      note: 'Partial payment',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pay_demo_7',
      statementId: stmt1.id,
      studentId: students[3].id, // Alindao, Charles Angelo
      amount: 600,
      date: todayStr,
      note: 'Paid in full',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pay_demo_8',
      statementId: stmt1.id,
      studentId: students[33].id, // Clint Aldwin Maurin
      amount: 600,
      date: todayStr,
      note: 'Paid in full',
      createdAt: new Date().toISOString(),
    },
    // Class fund payments
    {
      id: 'pay_demo_9',
      statementId: stmt2.id,
      studentId: students[0].id,
      amount: 150,
      date: todayStr,
      note: 'Paid for 1st sem',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pay_demo_10',
      statementId: stmt2.id,
      studentId: students[1].id,
      amount: 150,
      date: todayStr,
      note: 'Paid',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pay_demo_11',
      statementId: stmt2.id,
      studentId: students[2].id,
      amount: 100,
      date: todayStr,
      note: 'Partial ₱100',
      createdAt: new Date().toISOString(),
    },
  ];

  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  localStorage.setItem(STORAGE_KEYS.STATEMENTS, JSON.stringify([stmt1, stmt2]));
  localStorage.setItem(STORAGE_KEYS.SPECIFICATIONS, JSON.stringify(sampleSpecs));
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(samplePayments));
}
