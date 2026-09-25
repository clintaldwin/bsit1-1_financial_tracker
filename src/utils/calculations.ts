import {
  Payment,
  PaymentStatus,
  Statement,
  StatementCalculations,
  StatementStudentSpec,
  Student,
  StudentStatementSummary,
} from '../types';

export function calculateStudentStatus(paid: number, required: number): PaymentStatus {
  if (paid <= 0) return 'unpaid';
  if (paid >= required) return 'paid';
  return 'partial';
}

export function calculateStudentSummary(
  student: Student,
  statement: Statement,
  allPaymentsForStatement: Payment[],
  allSpecsForStatement: StatementStudentSpec[]
): StudentStatementSummary {
  const studentPayments = allPaymentsForStatement.filter((p) => p.studentId === student.id);
  const totalPaid = studentPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const roundedPaid = Math.round((totalPaid + Number.EPSILON) * 100) / 100;
  const roundedRequired = Math.round((statement.requiredAmount + Number.EPSILON) * 100) / 100;

  let balance = 0;
  let overpaid = 0;

  if (roundedPaid >= roundedRequired) {
    balance = 0;
    overpaid = Math.round((roundedPaid - roundedRequired + Number.EPSILON) * 100) / 100;
  } else {
    balance = Math.round((roundedRequired - roundedPaid + Number.EPSILON) * 100) / 100;
    overpaid = 0;
  }

  const status = calculateStudentStatus(roundedPaid, roundedRequired);
  const specObj = allSpecsForStatement.find((s) => s.studentId === student.id);

  return {
    student,
    specification: specObj?.specification || '',
    requiredAmount: roundedRequired,
    paidAmount: roundedPaid,
    balance,
    overpaid,
    status,
    payments: studentPayments,
  };
}

export function calculateStatementSummary(
  statement: Statement,
  students: Student[],
  payments: Payment[],
  specs: StatementStudentSpec[]
): {
  studentSummaries: StudentStatementSummary[];
  calculations: StatementCalculations;
} {
  const statementPayments = payments.filter((p) => p.statementId === statement.id);
  const statementSpecs = specs.filter((s) => s.statementId === statement.id);

  const studentSummaries = students.map((student) =>
    calculateStudentSummary(student, statement, statementPayments, statementSpecs)
  );

  let totalCollected = 0;
  let totalBalance = 0;
  let totalOverpaid = 0;
  let paidCount = 0;
  let partialCount = 0;
  let unpaidCount = 0;

  for (const s of studentSummaries) {
    totalCollected += s.paidAmount;
    totalBalance += s.balance;
    totalOverpaid += s.overpaid;

    if (s.status === 'paid') paidCount++;
    else if (s.status === 'partial') partialCount++;
    else unpaidCount++;
  }

  const totalRequired = Math.round((statement.requiredAmount * students.length + Number.EPSILON) * 100) / 100;
  totalCollected = Math.round((totalCollected + Number.EPSILON) * 100) / 100;
  totalBalance = Math.round((totalBalance + Number.EPSILON) * 100) / 100;
  totalOverpaid = Math.round((totalOverpaid + Number.EPSILON) * 100) / 100;

  const percentCollected =
    totalRequired > 0 ? Math.min(100, Math.round((totalCollected / totalRequired) * 1000) / 10) : 0;

  return {
    studentSummaries,
    calculations: {
      totalRequired,
      totalCollected,
      totalBalance,
      totalOverpaid,
      paidCount,
      partialCount,
      unpaidCount,
      percentCollected,
    },
  };
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function getTodayDateInputValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
