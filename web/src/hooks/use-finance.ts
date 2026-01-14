import { useState, useEffect, useCallback } from "react";
import financeApi, {
  FinancialAccount,
  Transaction,
  Payment,
  Expense,
  Invoice,
  CreateAccountDto,
  CreateTransactionDto,
  CreatePaymentDto,
  CreateExpenseDto,
  CreateInvoiceDto,
} from "@/service/financeService";
import { useAlmStore } from "@/store/useAppStore";

export const useAccounts = (type?: string) => {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.getAccounts(type);
      setAccounts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const createAccount = async (data: CreateAccountDto) => {
    try {
      setLoading(true);
      const newAccount = await financeApi.createAccount(data);
      setAccounts((prev) => [newAccount, ...prev]);
      return newAccount;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create account");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAccount = async (id: string, data: Partial<CreateAccountDto>) => {
    try {
      setLoading(true);
      const updated = await financeApi.updateAccount(id, data);
      setAccounts((prev) => prev.map((acc) => (acc.id === id ? updated : acc)));
      return updated;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update account");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      setLoading(true);
      await financeApi.deleteAccount(id);
      setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete account");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  };
};

export const useAccount = (id: string) => {
  const [account, setAccount] = useState<FinancialAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccount = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await financeApi.getAccount(id);
        setAccount(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch account");
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, [id]);

  return { account, loading, error };
};

// ============ TRANSACTIONS HOOKS ============
export const useTransactions = (filters?: {
  type?: string;
  accountId?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.getTransactions(filters);
      setTransactions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const createTransaction = async (data: CreateTransactionDto) => {
    try {
      setLoading(true);
      const newTransaction = await financeApi.createTransaction(data);
      setTransactions((prev) => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create transaction");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      setLoading(true);
      await financeApi.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete transaction");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    createTransaction,
    deleteTransaction,
  };
};

// ============ PAYMENTS HOOKS ============
export const usePayments = (filters?: {
  memberId?: string;
  status?: string;
  purpose?: string;
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useAlmStore();
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.getPayments(filters);
      setPayments(data);
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to fetch payments",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const createPayment = async (data: CreatePaymentDto) => {
    try {
      setLoading(true);
      const newPayment = await financeApi.createPayment(data);
      setPayments((prev) => [newPayment, ...prev]);
      return newPayment;
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to create payment",
        "error"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id: string, accountId?: string) => {
    try {
      setLoading(true);
      const updated = await financeApi.markPaymentAsPaid(id, accountId);
      setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to mark payment as paid",
        "error"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePayment = async (id: string) => {
    try {
      setLoading(true);
      await financeApi.deletePayment(id);
      setPayments((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to delete payment",
        "error"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    payments,
    loading,
    error,
    fetchPayments,
    createPayment,
    markAsPaid,
    deletePayment,
  };
};

// ============ EXPENSES HOOKS ============
export const useExpenses = (filters?: {
  status?: string;
  requestedBy?: string;
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useAlmStore();

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await financeApi.getExpenses(filters);
      setExpenses(data);
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to fetch expenses",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const createExpense = async (data: CreateExpenseDto) => {
    try {
      setLoading(true);
      const newExpense = await financeApi.createExpense(data);
      setExpenses((prev) => [newExpense, ...prev]);
      return newExpense;
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to create expense",
        "error"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitExpense = async (id: string) => {
    try {
      setLoading(true);
      const updated = await financeApi.submitExpense(id);
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
      return updated;
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to submit expense",
        "error"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveExpense = async (id: string, approvedBy: string) => {
    try {
      setLoading(true);
      const updated = await financeApi.approveExpense(id, approvedBy);
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
      return updated;
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to approve expense",
        "error"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectExpense = async (id: string, approvedBy: string) => {
    try {
      setLoading(true);
      const updated = await financeApi.rejectExpense(id, approvedBy);
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
      return updated;
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to reject expense",
        "error"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id: string, accountId?: string) => {
    try {
      setLoading(true);
      const updated = await financeApi.markExpenseAsPaid(id, accountId);
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
      return updated;
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to mark expense as paid",
        "error"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      setLoading(true);
      await financeApi.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to delete expense",
        "error"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    expenses,
    loading,
    fetchExpenses,
    createExpense,
    submitExpense,
    approveExpense,
    rejectExpense,
    markAsPaid,
    deleteExpense,
  };
};

// ============ INVOICES HOOKS ============
export const useInvoices = (filters?: {
  memberId?: string;
  status?: string;
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast: setToast } = useAlmStore();
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.getInvoices(filters);
      setInvoices(data);
    } catch (err: any) {
      setToast(
        err.response?.data?.message || "Failed to fetch invoices",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const createInvoice = async (data: CreateInvoiceDto) => {
    try {
      setLoading(true);
      const newInvoice = await financeApi.createInvoice(data);
      setInvoices((prev) => [newInvoice, ...prev]);
      return newInvoice;
    } catch (err: any) {
      setToast(
        err.response?.data?.message || "Failed to create invoice",
        "error"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id: string) => {
    try {
      setLoading(true);
      const updated = await financeApi.markInvoiceAsPaid(id);
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? updated : inv)));
      return updated;
    } catch (err: any) {
      setToast(
        err.response?.data?.message || "Failed to mark invoice as paid",
        "error"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelInvoice = async (id: string) => {
    try {
      setLoading(true);
      const updated = await financeApi.cancelInvoice(id);
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? updated : inv)));
      return updated;
    } catch (err: any) {
      setToast(
        err.response?.data?.message || "Failed to cancel invoice",
        "error"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      setLoading(true);
      await financeApi.deleteInvoice(id);
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err: any) {
      setToast(
        err.response?.data?.message || "Failed to delete invoice",
        "error"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    createInvoice,
    markAsPaid,
    cancelInvoice,
    deleteInvoice,
  };
};
