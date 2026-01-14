import financeApi from '@/service/financeService';
import React, { useState, useEffect } from 'react';
import { PaymentsList } from '@/src/components/finance/PaymentsList';
import { AccountsList } from '@/src/components/finance/account';
import { TransactionsList } from '@/src/components/finance/TransactionsList';
import { ExpensesList } from '@/src/components/finance/expenseList';
import { InvoicesList } from '@/src/components/finance/invoice';


type TabType = 'overview' | 'accounts' | 'transactions' | 'expenses' | 'invoices' | 'payments';

export const FinanceDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [summary, setSummary] = useState({
        accounts: { totalBalance: 0, count: 0 },
        transactions: { income: 0, expense: 0, net: 0 },
        payments: { total: 0, paid: 0, unpaid: 0 },
        expenses: { total: 0, pending: 0, approved: 0 },
        invoices: { total: 0, paid: 0, pending: 0, overdue: 0 },
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSummary();
    }, []);

    const loadSummary = async () => {
        try {
            setLoading(true);
            const [accounts, transactions, payments, expenses, invoices] = await Promise.all([
                financeApi.getAccountsSummary(),
                financeApi.getTransactionsSummary(),
                financeApi.getPaymentsSummary(),
                financeApi.getExpensesSummary(),
                financeApi.getInvoicesSummary(),
            ]);

            setSummary({
                accounts: {
                    totalBalance: accounts.totalBalance,
                    count: accounts.accountCount,
                },
                transactions: {
                    income: transactions.totalIncome,
                    expense: transactions.totalExpense,
                    net: transactions.netBalance,
                },
                payments: {
                    total: payments.totalAmount,
                    paid: payments.paidAmount,
                    unpaid: payments.unpaidAmount,
                },
                expenses: {
                    total: expenses.totalAmount,
                    pending: expenses.pendingAmount,
                    approved: expenses.approvedAmount,
                },
                invoices: {
                    total: invoices.totalAmount,
                    paid: invoices.paidAmount,
                    pending: invoices.pendingAmount,
                    overdue: invoices.overdueCount,
                },
            });
        } catch (error) {
            console.error('Failed to load summary:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'accounts', label: 'Accounts', icon: '💰' },
        { id: 'transactions', label: 'Transactions', icon: '💳' },
        { id: 'expenses', label: 'Expenses', icon: '📝' },
        { id: 'invoices', label: 'Invoices', icon: '📄' },
        { id: 'payments', label: 'Payments', icon: '💵' },
    ];

    const renderOverview = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Overview</h2>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-md">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm opacity-90">Total Balance</p>
                                    <span className="text-2xl">💰</span>
                                </div>
                                <p className="text-3xl font-bold">${summary.accounts.totalBalance.toFixed(2)}</p>
                                <p className="text-xs opacity-75 mt-2">{summary.accounts.count} accounts</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-md">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm opacity-90">Net Income</p>
                                    <span className="text-2xl">📈</span>
                                </div>
                                <p className="text-3xl font-bold">${summary.transactions.net.toFixed(2)}</p>
                                <p className="text-xs opacity-75 mt-2">
                                    +${summary.transactions.income.toFixed(2)} / -${summary.transactions.expense.toFixed(2)}
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-md">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm opacity-90">Payment Collection</p>
                                    <span className="text-2xl">💵</span>
                                </div>
                                <p className="text-3xl font-bold">
                                    {summary.payments.total > 0
                                        ? ((summary.payments.paid / summary.payments.total) * 100).toFixed(1)
                                        : 0}%
                                </p>
                                <p className="text-xs opacity-75 mt-2">
                                    ${summary.payments.paid.toFixed(2)} / ${summary.payments.total.toFixed(2)}
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-md">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm opacity-90">Pending Items</p>
                                    <span className="text-2xl">⏳</span>
                                </div>
                                <p className="text-3xl font-bold">
                                    {summary.invoices.overdue + (summary.invoices.pending - summary.invoices.overdue)}
                                </p>
                                <p className="text-xs opacity-75 mt-2">
                                    {summary.invoices.overdue} overdue invoices
                                </p>
                            </div>
                        </div>

                        {/* Detailed Sections */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Expenses Status */}
                            <div className="border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span>📝</span> Expense Requests
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Total Amount</span>
                                        <span className="font-semibold text-gray-900">
                                            ${summary.expenses.total.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Pending Approval</span>
                                        <span className="font-semibold text-yellow-600">
                                            ${summary.expenses.pending.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Approved</span>
                                        <span className="font-semibold text-green-600">
                                            ${summary.expenses.approved.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveTab('expenses')}
                                    className="mt-4 w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                >
                                    View All Expenses
                                </button>
                            </div>

                            {/* Invoices Status */}
                            <div className="border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span>📄</span> Invoices
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Total Amount</span>
                                        <span className="font-semibold text-gray-900">
                                            ${summary.invoices.total.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Paid</span>
                                        <span className="font-semibold text-green-600">
                                            ${summary.invoices.paid.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Pending</span>
                                        <span className="font-semibold text-yellow-600">
                                            ${summary.invoices.pending.toFixed(2)}
                                        </span>
                                    </div>
                                    {summary.invoices.overdue > 0 && (
                                        <div className="flex justify-between items-center pt-2 border-t border-red-200">
                                            <span className="text-red-600 font-medium">Overdue Invoices</span>
                                            <span className="font-semibold text-red-600">
                                                {summary.invoices.overdue}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setActiveTab('invoices')}
                                    className="mt-4 w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                >
                                    View All Invoices
                                </button>
                            </div>

                            {/* Transactions Summary */}
                            <div className="border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span>💳</span> Transactions
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Total Income</span>
                                        <span className="font-semibold text-green-600">
                                            +${summary.transactions.income.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Total Expenses</span>
                                        <span className="font-semibold text-red-600">
                                            -${summary.transactions.expense.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                        <span className="text-gray-900 font-medium">Net Balance</span>
                                        <span className={`font-bold ${summary.transactions.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ${summary.transactions.net.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveTab('transactions')}
                                    className="mt-4 w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                >
                                    View All Transactions
                                </button>
                            </div>

                            {/* Payments Summary */}
                            <div className="border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span>💵</span> Member Payments
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Expected</span>
                                        <span className="font-semibold text-gray-900">
                                            ${summary.payments.total.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Collected</span>
                                        <span className="font-semibold text-green-600">
                                            ${summary.payments.paid.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Outstanding</span>
                                        <span className="font-semibold text-red-600">
                                            ${summary.payments.unpaid.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveTab('payments')}
                                    className="mt-4 w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                >
                                    View All Payments
                                </button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                <button
                                    onClick={() => setActiveTab('accounts')}
                                    className="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all text-center"
                                >
                                    <div className="text-2xl mb-1">💰</div>
                                    <div className="text-xs font-medium text-gray-700">Add Account</div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('transactions')}
                                    className="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all text-center"
                                >
                                    <div className="text-2xl mb-1">💳</div>
                                    <div className="text-xs font-medium text-gray-700">New Transaction</div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('expenses')}
                                    className="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all text-center"
                                >
                                    <div className="text-2xl mb-1">📝</div>
                                    <div className="text-xs font-medium text-gray-700">Request Expense</div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('invoices')}
                                    className="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all text-center"
                                >
                                    <div className="text-2xl mb-1">📄</div>
                                    <div className="text-xs font-medium text-gray-700">Create Invoice</div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('payments')}
                                    className="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all text-center"
                                >
                                    <div className="text-2xl mb-1">💵</div>
                                    <div className="text-xs font-medium text-gray-700">Record Payment</div>
                                </button>
                                <button
                                    onClick={loadSummary}
                                    className="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all text-center"
                                >
                                    <div className="text-2xl mb-1">🔄</div>
                                    <div className="text-xs font-medium text-gray-700">Refresh Data</div>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Finance Management</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Manage accounts, transactions, expenses, and payments
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-4 overflow-x-auto py-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'accounts' && <AccountsList />}
                {activeTab === 'transactions' && <TransactionsList />}
                {activeTab === 'expenses' && <ExpensesList />}
                {activeTab === 'invoices' && <InvoicesList />}
                {activeTab === 'payments' && <PaymentsList />}
            </div>
        </div>
    );
};