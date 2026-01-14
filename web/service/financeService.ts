import { getCookie } from "@/src/hooks/use-fetcher";
import axios, { AxiosInstance } from "axios";

// Types
export interface FinancialAccount {
  id: string;
  name: string;
  type: "CASH" | "BANK" | "MOBILE_MONEY";
  balance: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  reference?: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  paymentMethod: "Cash" | "BankTransfer" | "MobileMoney" | "Card";
  date: string;
  accountId: string;
  memberId?: string;
  approvedById?: string;
  createdAt: string;
  account?: FinancialAccount;
  member?: any;
  approvedBy?: any;
}

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  purpose: string;
  method: "Cash" | "BankTransfer" | "MobileMoney" | "Card";
  status: "Paid" | "Unpaid" | "Partial";
  reference?: string;
  paidAt?: string;
  createdAt: string;
  member?: any;
  payerType?: string;
  description?: string;
  payer?: payerDto;
}

interface payerDto {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt;
}

export interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: number;
  status: "Draft" | "Submitted" | "Approved" | "Rejected" | "Paid";
  requestedBy: string;
  approvedBy?: string;
  paidAt?: string;
  createdAt: string;
  requester?: any;
  approver?: any;
}

export interface Invoice {
  id: string;
  memberId: string;
  amount: number;
  description: string;
  status: "Pending" | "Paid" | "Cancelled";
  dueDate: string;
  issuedAt: string;
  paidAt?: string;
  member?: any;
}

// DTOs
export interface CreateAccountDto {
  name: string;
  type: "CASH" | "BANK" | "MOBILE_MONEY";
  balance?: number;
  description?: string;
}

export interface CreateTransactionDto {
  reference?: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  paymentMethod: "Cash" | "BankTransfer" | "MobileMoney" | "Card";
  date?: string;
  accountId: string;
  memberId?: string;
  approvedById?: string;
}

export type PaymentPurpose =
  | "MEMBERSHIP_FEE"
  | "SUBSCRIPTION"
  | "DONATION"
  | "EVENT_TICKET"
  | "SERVICE_FEE"
  | "PRODUCT_PURCHASE"
  | "LOAN_REPAYMENT"
  | "LOAN_DISBURSEMENT"
  | "PENALTY"
  | "FINE"
  | "CONTRIBUTION"
  | "INVOICE_PAYMENT"
  | "REGISTRATION_FEE"
  | "SYSTEM_CHARGE"
  | "OTHER";

// export interface CreatePaymentDto {
//   memberId: string;
//   amount: number;
//   purpose: PaymentPurpose;
//   method: "Cash" | "BankTransfer" | "MobileMoney" | "Card";
//   status?: "Paid" | "Unpaid" | "Partial";
//   reference?: string;
//   payerType?: PayerType;
//   description?: string;
//   paidAt?: string;
// }

export interface CreatePaymentDto {
  payerType: PayerType;

  memberId?: string;

  payerName?: string;

  payerEmail?: string;
  payerPhone?: string;

  organizationName?: string;
  organizationRegistrationNo?: string;

  amount: number;
  currency?: "RWF" | "USD";
  purpose: PaymentPurpose;
  description?: string;

  method: "Cash" | "BankTransfer" | "MobileMoney" | "Card";
  status?: "Paid" | "Unpaid" | "Partial";

  reference?: string;
  paidAt?: string;

  invoiceId?: number;
  referenceNumber?: string;
  metadata?: Record<string, any>;
}

export type PayerType = "MEMBER" | "EXTERNAL_USER" | "ORGANIZATION";
export interface CreateExpenseDto {
  title: string;
  description?: string;
  amount: number;
  status?: "Draft" | "Submitted" | "Approved" | "Rejected" | "Paid";
  requestedBy: string;
}

export interface CreateInvoiceDto {
  id?: string;
  memberId: string;
  amount: number;
  description: string;
  status?: "Pending" | "Paid" | "Cancelled";
  dueDate: string;
  issuedAt?: string;
}

class FinanceApiService {
  private api: AxiosInstance;

  constructor(
    baseURL: string = process.env.BACKEND_URL || "http://localhost:8000/api"
  ) {
    this.api = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = getCookie("Authorization_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getAccounts(type?: string): Promise<FinancialAccount[]> {
    const params = type ? { type } : {};
    const response = await this.api.get("/finance/accounts", { params });
    return response.data;
  }

  async getAccount(id: string): Promise<FinancialAccount> {
    const response = await this.api.get(`/finance/accounts/${id}`);
    return response.data;
  }

  async createAccount(data: CreateAccountDto): Promise<FinancialAccount> {
    const response = await this.api.post("/finance/accounts", data);
    return response.data;
  }

  async updateAccount(
    id: string,
    data: Partial<CreateAccountDto>
  ): Promise<FinancialAccount> {
    const response = await this.api.put(`/finance/accounts/${id}`, data);
    return response.data;
  }

  async deleteAccount(id: string): Promise<void> {
    await this.api.delete(`/finance/accounts/${id}`);
  }

  async getAccountBalance(
    id: string
  ): Promise<{ id: string; name: string; balance: number; type: string }> {
    const response = await this.api.get(`/finance/accounts/${id}/balance`);
    return response.data;
  }

  async getAccountsSummary(): Promise<{
    totalBalance: number;
    accountsByType: Record<string, number>;
    accountCount: number;
  }> {
    const response = await this.api.get("/finance/accounts/summary");
    return response.data;
  }

  // ============ TRANSACTIONS ============
  async getTransactions(filters?: {
    type?: string;
    accountId?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> {
    const response = await this.api.get("/finance/transactions", {
      params: filters,
    });
    return response.data;
  }

  async getTransaction(id: string): Promise<Transaction> {
    const response = await this.api.get(`/finance/transactions/${id}`);
    return response.data;
  }

  async createTransaction(data: CreateTransactionDto): Promise<Transaction> {
    const response = await this.api.post("/finance/transactions", data);
    return response.data;
  }

  async updateTransaction(
    id: string,
    data: Partial<CreateTransactionDto>
  ): Promise<Transaction> {
    const response = await this.api.put(`/finance/transactions/${id}`, data);
    return response.data;
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.api.delete(`/finance/transactions/${id}`);
  }

  async getTransactionsSummary(
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    transactionCount: number;
  }> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await this.api.get("/finance/transactions/summary", {
      params,
    });
    return response.data;
  }

  async getTransactionsByCategory(
    startDate?: string,
    endDate?: string
  ): Promise<
    Record<
      string,
      {
        income: number;
        expense: number;
        total: number;
      }
    >
  > {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await this.api.get("/finance/transactions/by-category", {
      params,
    });
    return response.data;
  }

  // ============ PAYMENTS ============
  async getPayments(filters?: {
    memberId?: string;
    status?: string;
    purpose?: string;
  }): Promise<Payment[]> {
    const response = await this.api.get("/finance/payments", {
      params: filters,
    });
    return response.data;
  }

  async getPayment(id: string): Promise<Payment> {
    const response = await this.api.get(`/finance/payments/${id}`);
    return response.data;
  }

  async getPaymentsByMember(memberId: string): Promise<Payment[]> {
    const response = await this.api.get(`/finance/payments/member/${memberId}`);
    return response.data;
  }

  async createPayment(data: CreatePaymentDto): Promise<Payment> {
    const response = await this.api.post("/finance/payments", data);
    return response.data;
  }

  async updatePayment(
    id: string,
    data: Partial<CreatePaymentDto>
  ): Promise<Payment> {
    const response = await this.api.put(`/finance/payments/${id}`, data);
    return response.data;
  }

  async markPaymentAsPaid(id: string, accountId?: string): Promise<Payment> {
    const response = await this.api.patch(
      `/finance/payments/${id}/mark-paid?accountId=${accountId}`
    );
    return response.data;
  }

  async deletePayment(id: string): Promise<void> {
    await this.api.delete(`/finance/payments/${id}`);
  }

  async getPaymentsSummary(): Promise<{
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    partialAmount: number;
    byStatus: Record<string, number>;
    totalCount: number;
  }> {
    const response = await this.api.get("/finance/payments/summary");
    return response.data;
  }

  // ============ EXPENSES ============
  async getExpenses(filters?: {
    status?: string;
    requestedBy?: string;
  }): Promise<Expense[]> {
    const response = await this.api.get("/finance/expenses", {
      params: filters,
    });
    return response.data;
  }

  async getExpense(id: string): Promise<Expense> {
    const response = await this.api.get(`/finance/expenses/${id}`);
    return response.data;
  }

  async getPendingExpenses(): Promise<Expense[]> {
    const response = await this.api.get("/finance/expenses/pending");
    return response.data;
  }

  async createExpense(data: CreateExpenseDto): Promise<Expense> {
    const response = await this.api.post("/finance/expenses", data);
    return response.data;
  }

  async updateExpense(
    id: string,
    data: Partial<CreateExpenseDto>
  ): Promise<Expense> {
    const response = await this.api.put(`/finance/expenses/${id}`, data);
    return response.data;
  }

  async submitExpense(id: string): Promise<Expense> {
    const response = await this.api.patch(`/finance/expenses/${id}/submit`);
    return response.data;
  }

  async approveExpense(id: string, approvedBy: string): Promise<Expense> {
    const response = await this.api.patch(`/finance/expenses/${id}/approve`, {
      approvedBy,
    });
    return response.data;
  }

  async rejectExpense(id: string, approvedBy: string): Promise<Expense> {
    const response = await this.api.patch(`/finance/expenses/${id}/reject`, {
      approvedBy,
    });
    return response.data;
  }

  async markExpenseAsPaid(id: string, accountId?: string): Promise<Expense> {
    const response = await this.api.patch(
      `/finance/expenses/${id}/mark-paid?accountId=${accountId}`
    );
    return response.data;
  }

  async deleteExpense(id: string): Promise<void> {
    await this.api.delete(`/finance/expenses/${id}`);
  }

  async getExpensesSummary(): Promise<{
    totalAmount: number;
    approvedAmount: number;
    paidAmount: number;
    pendingAmount: number;
    byStatus: Record<string, number>;
    totalCount: number;
  }> {
    const response = await this.api.get("/finance/expenses/summary");
    return response.data;
  }

  // ============ INVOICES ============
  async getInvoices(filters?: {
    memberId?: string;
    status?: string;
  }): Promise<Invoice[]> {
    const response = await this.api.get("/finance/invoices", {
      params: filters,
    });
    return response.data;
  }

  async getInvoice(id: string): Promise<Invoice> {
    const response = await this.api.get(`/finance/invoices/${id}`);
    return response.data;
  }

  async getInvoicesByMember(memberId: string): Promise<Invoice[]> {
    const response = await this.api.get(`/finance/invoices/member/${memberId}`);
    return response.data;
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    const response = await this.api.get("/finance/invoices/overdue");
    return response.data;
  }

  async createInvoice(data: CreateInvoiceDto): Promise<Invoice> {
    const response = await this.api.post("/finance/invoices", data);
    return response.data;
  }

  async updateInvoice(
    id: string,
    data: Partial<CreateInvoiceDto>
  ): Promise<Invoice> {
    const response = await this.api.put(`/finance/invoices/${id}`, data);
    return response.data;
  }

  async markInvoiceAsPaid(id: string): Promise<Invoice> {
    const response = await this.api.patch(`/finance/invoices/${id}/mark-paid`);
    return response.data;
  }

  async cancelInvoice(id: string): Promise<Invoice> {
    const response = await this.api.patch(`/finance/invoices/${id}/cancel`);
    return response.data;
  }

  async deleteInvoice(id: string): Promise<void> {
    await this.api.delete(`/finance/invoices/${id}`);
  }

  async getInvoicesSummary(): Promise<{
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    byStatus: Record<string, number>;
    overdueCount: number;
    totalCount: number;
  }> {
    const response = await this.api.get("/finance/invoices/summary");
    return response.data;
  }
  async exportTransactions(): Promise<Blob> {
    const response = await this.api.get("finance/export/transactions/pdf", {
      responseType: "blob",
    });
    return response.data;
  }
}

// Export singleton instance
const financeApi = new FinanceApiService();
export default financeApi;
