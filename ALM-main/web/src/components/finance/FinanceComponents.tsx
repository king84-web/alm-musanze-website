
import React, { useState, useEffect, use } from 'react';

import financeApi, { FinancialAccount, Expense, Invoice, Payment, Transaction, CreateAccountDto, CreateExpenseDto, CreateInvoiceDto, CreateTransactionDto, CreatePaymentDto, PayerType } from '@/service/financeService';
import { Button, Card, CustomDatePicker, CustomSelect, Icon, Input, Loader, StatsCard, Textarea } from '../Common';
import { useAccounts, useExpenses, useInvoices, usePayments, useTransactions } from '@/src/hooks/use-finance'
import { Member } from '@/types';
import { ExpensesList } from './expenseList';
import { useAlmStore } from '@/store/useAppStore';
import { formatCurrency, PAYMENT_PURPOSE_OPTIONS } from '@/src/libs/utils';

// Confirmation Dialog Component
export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', confirmVariant = 'danger' }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    title: string;
    message: string;
    confirmText?: string;
    confirmVariant?: 'danger' | 'primary';
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
            <div className="bg-white dark:bg-card-dark rounded-xl shadow-2xl max-w-md w-full mx-4 animate-scale-in">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 h-12 w-12 flex justify-center items-center rounded-full ${confirmVariant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            <Icon name={confirmVariant === 'danger' ? 'warning' : 'info'} className="text-2xl" />
                        </div>
                        <h3 className="text-xl font-bold">{title}</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                    <div className="flex gap-3 justify-end">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button variant={confirmVariant} onClick={() => { onConfirm(); onClose(); }}>
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Account Selection Dialog for Mark as Paid
export const AccountSelectDialog = ({ isOpen, onClose, onConfirm, accounts, amount }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (accountId: string) => void;
    accounts: FinancialAccount[];
    amount: number;
}) => {
    const [selectedAccount, setSelectedAccount] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (selectedAccount) {
            onConfirm(selectedAccount);
            onClose();
            setSelectedAccount('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
            <div className="bg-white dark:bg-card-dark rounded-xl shadow-2xl max-w-md w-full mx-4 animate-scale-in">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                            <Icon name="account_balance_wallet" className="text-2xl" />
                        </div>
                        <h3 className="text-xl font-bold">Select Account</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Select which account to deduct <span className="font-bold text-green-600">{formatCurrency(amount)}</span> from:
                    </p>
                    <CustomSelect
                        label="Account"
                        options={accounts.map(a => ({
                            label: `${a.name} (${a.type}) - ${formatCurrency(a.balance)}`,
                            value: a.id
                        }))}
                        value={selectedAccount}
                        onChange={setSelectedAccount}
                    />
                    <div className="flex gap-3 justify-end mt-6">
                        <Button variant="ghost" onClick={() => { onClose(); setSelectedAccount(''); }}>Cancel</Button>
                        <Button variant="primary" onClick={handleConfirm} disabled={!selectedAccount}>
                            Mark as Paid
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const AccountsList = () => {
    const [editingAccount, setEditingAccount] = useState<FinancialAccount | null>(null);
    const {
        loading,
        error,
        accounts,
        createAccount,
        updateAccount,
        deleteAccount,
    } = useAccounts();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('all');

    const [formData, setFormData] = useState<CreateAccountDto>({
        name: '',
        type: 'CASH',
        balance: 0,
        description: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateAccount(editingId, formData);
                setEditingId(null);
            } else {
                await createAccount(formData);
            }
            setShowForm(false);
            resetForm();
        } catch (error) {
            console.error('Failed to save account:', error);
        }
    };

    const handleEdit = (account: any) => {
        setFormData({
            name: account.name,
            type: account.type,
            balance: account.balance,
            description: account.description || '',
        });
        setEditingId(account.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
            try {
                await deleteAccount(id);
            } catch (error) {
                console.error('Failed to delete account:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'CASH',
            balance: 0,
            description: '',
        });
        setEditingId(null);
    };

    const handleCancel = () => {
        setShowForm(false);
        resetForm();
    };

    const filteredAccounts = accounts.filter((account) => {
        if (filter === 'all') return true;
        return account.type === filter;
    });

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const accountsByType = accounts.reduce((acc, account) => {
        acc[account.type] = (acc[account.type] || 0) + account.balance;
        return acc;
    }, {} as Record<string, number>);

    const getIcon = (type: string) => {
        switch (type) {
            case 'CASH': return 'payments';
            case 'BANK': return 'account_balance';
            case 'MOBILE_MONEY': return 'smartphone';
            default: return 'savings';
        }
    };

    if (loading) {
        return (
            <Loader />
        );
    }

    return (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Financial Accounts</h2>
                    <p className="text-sm text-gray-500">Manage organization's financial accounts</p>
                </div>
                <Button variant="primary" onClick={() => setShowForm(!showForm)} icon={showForm ? 'close' : 'add'}>
                    {showForm ? 'Cancel' : 'Add Account'}
                </Button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-600 text-white rounded-lg p-4 shadow-md">
                    <p className="text-sm opacity-90 font-medium">Total Balance</p>
                    <p className="text-3xl font-bold mt-2">RWF {totalBalance.toLocaleString()}</p>
                    <p className="text-xs opacity-75 mt-1">{accounts.length} accounts</p>
                </div>
                {['CASH', 'BANK', 'MOBILE_MONEY'].map(type => {
                    const sum = accounts.filter((a: any) => a.type === type).reduce((s: number, a: any) => s + a.balance, 0);
                    const colors: any = { CASH: 'bg-green-600', BANK: 'bg-purple-600', MOBILE_MONEY: 'bg-orange-600' };
                    return (
                        <div key={type} className={`${colors[type]} text-white rounded-lg p-4 shadow-md`}>
                            <p className="text-sm opacity-90 font-medium flex items-center gap-1">
                                <Icon name={getIcon(type)} className="text-base" /> {type.replace('_', ' ')}
                            </p>
                            <p className="text-2xl font-bold mt-2">{formatCurrency(sum)}</p>
                        </div>
                    );
                })}
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-6 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
                    <h3 className="text-lg font-semibold mb-4">{editingAccount ? 'Edit Account' : 'New Account'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Account Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Main Cash" />
                        <CustomSelect
                            label="Type"
                            options={['CASH', 'BANK', 'MOBILE_MONEY'].map(t => ({ label: t.replace('_', ' '), value: t }))}
                            value={formData.type as string}
                            onChange={v => setFormData({ ...formData, type: v as any })}
                        />
                        <Input label="Balance" type="number" required value={formData.balance} onChange={e => setFormData({ ...formData, balance: parseFloat(e.target.value) })} />
                        <Input label="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="ghost" type="button" onClick={resetForm}>Cancel</Button>
                        <Button variant="primary" type="submit">{editingAccount ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            )}

            {/* List */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {['all', 'CASH', 'BANK', 'MOBILE_MONEY'].map(f => (
                    <Button
                        key={f}
                        onClick={() => setFilter(f)}
                        variant={filter === f ? 'primary' : 'ghost'}
                        className={`outline-none focus:ring-offset-0`}
                    // className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === f ?
                    //      'bg-primary text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'}`}
                    >
                        {f === 'all' ? 'All Accounts' : f.replace('_', ' ')}
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAccounts.map((acc: FinancialAccount) => (
                    <div key={acc.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-lg transition-all bg-white dark:bg-card-dark group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-3 h-10 w-10 rounded-full flex justify-center items-center bg-gray-100 dark:bg-white/10 text-primary">
                                    <Icon name={getIcon(acc.type)} className="text-2xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{acc.name}</h3>
                                    <p className="text-xs text-gray-500">{acc.type.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 uppercase">Balance</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(acc.balance)}</p>
                        </div>
                        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(acc)}>Edit</Button>
                            <Button size="sm" variant="danger" className="flex-1" onClick={() => { if (window.confirm('Delete account?')) deleteAccount(acc.id) }}>Delete</Button>
                        </div>
                    </div>
                ))}
            </div>

        </Card>
    );
};

const InvoicesList = () => {
    const { members } = useAlmStore();
    const {
        invoices,
        loading,
        error,
        createInvoice,
        markAsPaid,
        cancelInvoice,
        deleteInvoice,
    } = useInvoices();

    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState<string>('all');

    const [formData, setFormData] = useState<CreateInvoiceDto>({
        memberId: '',
        amount: 0,
        description: '',
        dueDate: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createInvoice(formData);
            setShowForm(false);
            setFormData({
                memberId: '',
                amount: 0,
                description: '',
                dueDate: '',
            });
        } catch (error) {
            console.error('Failed to create invoice:', error);
        }
    };

    const handleAction = async (
        id: string,
        action: 'paid' | 'cancel' | 'delete'
    ) => {
        try {
            switch (action) {
                case 'paid':
                    await markAsPaid(id);
                    break;
                case 'cancel':
                    if (window.confirm('Are you sure you want to cancel this invoice?')) {
                        await cancelInvoice(id);
                    }
                    break;
                case 'delete':
                    if (window.confirm('Are you sure you want to delete this invoice?')) {
                        await deleteInvoice(id);
                    }
                    break;
            }
        } catch (error) {
            console.error(`Failed to ${action} invoice:`, error);
        }
    };

    const filteredInvoices = invoices.filter((invoice) => {
        if (filter === 'all') return true;
        if (filter === 'overdue') {
            return (
                invoice.status === 'Pending' && new Date(invoice.dueDate) < new Date()
            );
        }
        return invoice.status === filter;
    });

    const statusCounts = {
        Pending: invoices.filter((i) => i.status === 'Pending').length,
        Paid: invoices.filter((i) => i.status === 'Paid').length,
        Cancelled: invoices.filter((i) => i.status === 'Cancelled').length,
        Overdue: invoices.filter(
            (i) => i.status === 'Pending' && new Date(i.dueDate) < new Date()
        ).length,
    };

    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paidAmount = invoices
        .filter((i) => i.status === 'Paid')
        .reduce((sum, inv) => sum + inv.amount, 0);
    const pendingAmount = invoices
        .filter((i) => i.status === 'Pending')
        .reduce((sum, inv) => sum + inv.amount, 0);

    const getStatusBadge = (status: string, dueDate?: string) => {
        if (status === 'Pending' && dueDate && new Date(dueDate) < new Date()) {
            return 'bg-red-100 text-red-800';
        }
        const styles: Record<string, string> = {
            Pending: 'bg-yellow-100 text-yellow-800',
            Paid: 'bg-green-100 text-green-800',
            Cancelled: 'bg-gray-100 text-gray-800',
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const isOverdue = (invoice: any) => {
        return (
            invoice.status === 'Pending' && new Date(invoice.dueDate) < new Date()
        );
    };

    return (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Invoices</h2>
                    <p className="text-sm text-gray-500">Manage member invoices</p>
                </div>
                <Button variant="primary" onClick={() => setShowForm(!showForm)} icon={showForm ? 'close' : 'add'}>
                    {showForm ? 'Cancel' : 'Create Invoice'}
                </Button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-6 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CustomSelect
                            label="Member"
                            options={members.map((m: Member) => ({ label: `${m.firstName} ${m.lastName} (${m.email})`, value: m.id }))}
                            value={formData.memberId || ''}
                            onChange={v => setFormData({ ...formData, memberId: v })}
                        />
                        <Input label="Amount" type="number" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
                        <CustomDatePicker label="Due Date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e as Invoice['dueDate'] })} />
                        <Input label="Description" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button variant="primary" type="submit">Create</Button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Invoice #</th>
                            <th className="px-6 py-4">Member</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Due Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {invoices.map((inv: Invoice) => (
                            <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td className="px-6 py-4 font-mono">{inv.id}</td>
                                <td className="px-6 py-4">
                                    <p className="font-medium">{inv.member?.firstName} {inv.member?.lastName}</p>
                                    <p className="text-xs text-gray-500">{inv.member?.email}</p>
                                </td>
                                <td className="px-6 py-4">{inv.description}</td>
                                <td className="px-6 py-4 font-bold">${inv.amount.toFixed(2)}</td>
                                <td className="px-6 py-4">{new Date(inv.dueDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                        inv.status === 'Pending' && new Date(inv.dueDate) < new Date() ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {inv.status === 'Pending' && new Date(inv.dueDate) < new Date() ? 'Overdue' : inv.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    {inv.status !== 'Paid' && (
                                        <Button size="sm" variant="ghost" className="text-green-600" onClick={() => markAsPaid(inv.id)}>Mark Paid</Button>
                                    )}
                                    <Button size="sm" variant="ghost" icon="delete" className="text-red-500" onClick={() => deleteInvoice(inv.id)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const PaymentsList = () => {
    const {
        payments,
        loading,
        error,
        createPayment,
        markAsPaid,
        deletePayment,
    } = usePayments();
    const { members } = useAlmStore()
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState<string>('all');
    const { accounts } = useAccounts()
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [CurrentAction, setCurrentAction] = useState<"delete" | "markpaid" | null>(null)
    const [SelectAction, setSelectedAction] = useState<{ id: string, action: "delete" | "markpaid" | null }>(null)
    const initialFormData: CreatePaymentDto = {
        memberId: '',
        amount: 0,
        purpose: undefined,
        method: 'Cash',
        status: 'Unpaid',
        payerType: "MEMBER"
    };

    const [formData, setFormData] = useState<CreatePaymentDto>(initialFormData);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createPayment(formData);
            setShowForm(false);
            setFormData({
                memberId: '',
                amount: 0,
                purpose: undefined,
                method: 'Cash',
                status: 'Unpaid',
                payerType: "MEMBER"
            });
        } catch (error) {
            console.error('Failed to create payment:', error);
        }
    };

    const [SelectId, setSelectPaymentId] = useState<string>('')
    const HandleAction = (id: string, method: Payment['member'], action?: "delete" | "markpaid") => {
        setSelectPaymentId(id)
        setCurrentAction(action)
    }

    const handleMarkAsPaid = async (id: string, accountId: string) => {
        try {
            await markAsPaid(id, accountId);
            setSelectPaymentId('')
        } catch (error) {
            console.error('Failed to mark payment as paid:', error);
        }
    };


    const handleDelete = async (id: string) => {
        try {
            await deletePayment(id);
        } catch (error) {
            console.error('Failed to delete payment:', error);
        }
    };

    const filteredPayments = payments.filter((payment) => {
        if (filter === 'all') return true;
        return payment.status === filter;
    });

    const statusCounts = {
        Paid: payments.filter((p) => p.status === 'Paid').length,
        Unpaid: payments.filter((p) => p.status === 'Unpaid').length,
        Partial: payments.filter((p) => p.status === 'Partial').length,
    };

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = payments
        .filter((p) => p.status === 'Paid')
        .reduce((sum, p) => sum + p.amount, 0);
    const unpaidAmount = payments
        .filter((p) => p.status === 'Unpaid')
        .reduce((sum, p) => sum + p.amount, 0);

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            Paid: 'bg-green-100 text-green-800',
            Unpaid: 'bg-red-100 text-red-800',
            Partial: 'bg-yellow-100 text-yellow-800',
        };
        return `px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'
            }`;
    };

    if (loading) {
        return (
            <Loader />
        );
    }
    return (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Payments</h2>
                    <p className="text-sm text-gray-500">Track member payments</p>
                </div>
                <Button variant="primary" onClick={() => setShowForm(!showForm)} icon={showForm ? 'close' : 'add'}>
                    {showForm ? 'Cancel' : 'Record Payment'}
                </Button>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md transition-opacity duration-300">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 animate-fade-in overflow-y-auto max-h-[90vh]"
                    >
                        {/* Header with Icon */}
                        <div className="mb-8 text-center">
                            <div className="flex items-center justify-center mb-2">
                                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    Record Payment
                                </h2>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Capture payment details accurately for reporting and audit purposes.
                            </p>
                        </div>

                        {/* Form Sections */}
                        <div className="space-y-8">
                            {/* Payer Information Section */}
                            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Payer Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Payer Type */}
                                    <div className="md:col-span-2">
                                        <CustomSelect
                                            label="Payer Type"
                                            options={[
                                                { label: 'Member', value: 'MEMBER' },
                                                { label: 'Guest / Donor', value: "EXTERNAL_USER" },
                                                { label: "Organization", value: "ORGANIZATION" }
                                            ]}
                                            value={formData.payerType}
                                            onChange={v => setFormData({ ...formData, payerType: v as PayerType })}
                                        // required
                                        />
                                    </div>

                                    {/* Conditional Fields with Fade */}
                                    {formData.payerType === 'MEMBER' && (
                                        <div className="animate-fade-in">
                                            <CustomSelect
                                                label="Select Member"
                                                options={members.map((m: Member) => ({
                                                    label: `${m.firstName} ${m.lastName}`,
                                                    value: m.id,
                                                }))}
                                                value={formData.memberId || ''}
                                                onChange={v => setFormData({ ...formData, memberId: v })}
                                            // required
                                            />
                                        </div>
                                    )}
                                    {(["EXTERNAL_USER", "ORGANIZATION"].includes(formData.payerType)) && (
                                        <div className="animate-fade-in md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                label={`${formData.payerType === "EXTERNAL_USER" ? "Person Name" : "Organization Name"}`}
                                                placeholder={`${formData.payerType === "EXTERNAL_USER" ? "John Doe" : "Organization Name"}`}
                                                required
                                                value={formData.payerName || ''}
                                                onChange={e => setFormData({ ...formData, payerName: e.target.value })}
                                            />
                                            <Input label={`${formData.payerType === "EXTERNAL_USER" ? "Person Email" : "Organization Email"}`} placeholder='Enter Email' type="email" required value={formData.payerEmail} onChange={e => setFormData({ ...formData, payerEmail: e.target.value })} />

                                            <Input
                                                label={`${formData.payerType === "EXTERNAL_USER" ? "Person Phone Number" : "Organization Phone"}`}
                                                placeholder="+2507xxxxxxxx"
                                                type="tel"
                                                value={formData.payerPhone || ''}
                                                onChange={e => setFormData({ ...formData, payerPhone: e.target.value })}
                                            />
                                        </div>
                                    )}

                                </div>
                            </div>

                            {/* Payment Details Section */}
                            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                    Payment Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Amount */}
                                    <Input
                                        label="Amount"
                                        type='number'
                                        step="0.01"
                                        placeholder="0.00"
                                        required
                                        value={formData.amount || ''}
                                        onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                    />

                                    {/* Purpose */}
                                    <CustomSelect
                                        label="Payment Purpose"
                                        options={PAYMENT_PURPOSE_OPTIONS}
                                        value={formData.purpose}
                                        onChange={v => setFormData({ ...formData, purpose: v as CreatePaymentDto['purpose'] })}
                                    // required
                                    />

                                    {/* Payment Method */}
                                    <CustomSelect
                                        label="Payment Method"
                                        options={[
                                            { label: 'Cash', value: 'Cash' },
                                            { label: 'Bank Transfer', value: 'BankTransfer' },
                                            { label: 'Mobile Money', value: 'MobileMoney' },
                                            { label: 'Card', value: 'Card' },
                                        ]}
                                        value={formData.method}
                                        onChange={v => setFormData({ ...formData, method: v as CreatePaymentDto['method'] })}
                                    // required
                                    />

                                    {/* Reference */}
                                    <Input
                                        label="Reference (Optional)"
                                        placeholder="e.g., Transaction ID"
                                        value={formData.reference || ''}
                                        onChange={e => setFormData({ ...formData, reference: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Additional Details Section */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Additional Details
                                </h3>
                                <Textarea
                                    label="Purpose Description (Optional)"
                                    placeholder="Provide any additional context or notes"
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    // as="textarea"
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowForm(false)}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setFormData(initialFormData)} // Assuming you have an initial state
                                    className="w-full sm:w-auto"
                                >
                                    Clear Form
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={isSubmitting} // Assuming you have this state
                                    className="w-full sm:w-auto flex items-center justify-center"
                                >
                                    {/* {isSubmitting ? (
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : null} */}
                                    Record Payment
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            )}



            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Payer Name</th>
                            <th className="px-6 py-4">Purpose</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Method</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredPayments.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    No payments found. Record your first payment to get started.
                                </td>
                            </tr>
                        ) : payments.map((p: Payment) => (
                            <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td className="px-6 py-4 font-medium">
                                    <p className="text-gray-900 font-semibold dark:text-white">{`${p.payerType !== "MEMBER" ? p.payer.name : p.member?.firstName + " " + p.member?.lastName}`}</p>
                                    {/* <br /> */}
                                    <span className='text-xs text-text-secondary'>{p.payerType === "MEMBER" ? "Member" : p.payerType === "ORGANIZATION" ? "organization or company" : "External User"}</span>
                                </td>
                                <td className="px-6 py-4">{PAYMENT_PURPOSE_OPTIONS.find(o => o.value === p.purpose)?.label}</td>
                                <td className="px-6 py-4 font-bold text-green-600">{formatCurrency(p.amount)}</td>
                                <td className="px-6 py-4">{p.method}</td>
                                <td className="px-6 py-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className={getStatusBadge(p.status)}>{p.status}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex gap-2">
                                        {p.status !== 'Paid' && (
                                            <Button
                                                onClick={() => HandleAction(p.id, p.method, 'markpaid')}
                                                variant="primary"
                                            >
                                                Mark Paid
                                            </Button>
                                        )}
                                        {/* {p.status !== 'Paid' && (
                                            <span className="text-gray-300">|</span>
                                        )} */}
                                        <Button
                                            onClick={() => HandleAction(p.id, p.member, "delete")}
                                            icon="delete"
                                            variant='danger'
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <AccountSelectDialog isOpen={!!SelectId && CurrentAction === "markpaid"}
                    onClose={() => setSelectPaymentId('')}
                    onConfirm={(accountId) => {
                        handleMarkAsPaid(SelectId, accountId)
                    }} accounts={accounts} amount={payments.find(p => p.id === SelectId)?.amount} />
                <ConfirmDialog
                    isOpen={!!SelectId && CurrentAction === "delete"}
                    onClose={() => setSelectPaymentId('')}
                    onConfirm={async () => await handleDelete(SelectId)} title={'Delete Payment'}
                    message={`Are you sure you want to delete this payment?
                        Deleting this payment may update the related transaction status and invoice balance.
                        This action cannot be undone.`} />
            </div>
        </Card>
    );
};

const TransactionsList = () => {
    const { showToast } = useAlmStore()
    const { transactions, loading, error: transError, createTransaction, deleteTransaction } = useTransactions();
    const { accounts } = useAccounts();
    const [exportPDF, setexportPDF] = useState<boolean>(false)
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [SelectedAction, setSelectedAction] = useState<{ id: string, action: "delete" | "markpaid" | null }>({
        id: '',
        action: null
    })

    const [formData, setFormData] = useState<CreateTransactionDto>({
        description: '',
        amount: 0,
        type: 'income',
        category: '',
        paymentMethod: 'Cash',
        accountId: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createTransaction(formData);
            setShowForm(false);
            setFormData({
                description: '',
                amount: 0,
                type: 'income',
                category: '',
                paymentMethod: 'Cash',
                accountId: '',
            });
        } catch (error) {
            console.error('Failed to create transaction:', error);
        }
    };


    useEffect(() => {
        if (transError) {
            showToast(transError || "Failed to fetch transactions", "error");
        }
    }, [transError])

    const handleDelete = async (id: string) => {
        try {
            await deleteTransaction(id);
        } catch (error) {
            console.error('Failed to delete transaction:', error);
        }

    };

    const filteredTransactions = transactions.filter((t) => {
        if (filter === 'all') return true;
        return t.type === filter;
    });

    const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const handleExport = async () => {
        setexportPDF(true)
        try {
            const res = await financeApi.exportTransactions();
            let blob: Blob;
            if (res instanceof Blob) {
                blob = res;
            } else if (res && typeof (res as any).blob === 'function') {
                blob = await (res as any).blob();
            } else {
                throw new Error('Unexpected response when exporting transactions');
            }
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `transactions-${Date.now()}.pdf`;
            a.click();
        } catch (error) {
            console.error('Failed to export transactions:', error);
            showToast('Failed to export transactions', 'error')
        } finally {
            setexportPDF(false)
        }
    }
    return (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Transactions</h2>
                    <p className="text-sm text-gray-500">General Ledger</p>
                </div>
                <div className='flex gap-4 items-center'>
                    <Button variant="primary" onClick={() => setShowForm(!showForm)} icon={showForm ? 'close' : 'add'}>
                        {showForm ? 'Cancel' : 'Add Transaction'}
                    </Button>
                    <Button disabled={exportPDF} variant='outline' icon="download" onClick={handleExport}>Export</Button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <p className="text-green-600 font-medium">Total Income</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <p className="text-red-600 font-medium">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-700">{formatCurrency(totalExpense)}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-blue-600 font-medium">Net Balance</p>
                    <p className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                        {formatCurrency(totalIncome - totalExpense)}
                    </p>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-6 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Description" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        <Input label="Amount" type="number" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
                        <CustomSelect
                            label="Type"
                            options={[{ label: 'Income', value: 'income' }, { label: 'Expense', value: 'expense' }]}
                            value={formData.type || 'income'}
                            onChange={v => setFormData({ ...formData, type: v as any })}
                        />
                        <Input label="Category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                        <CustomSelect
                            label="Account"
                            options={accounts.map((a: FinancialAccount) => ({ label: a.name, value: a.id }))}
                            value={formData.accountId || ''}
                            onChange={v => setFormData({ ...formData, accountId: v })}
                        />
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button variant="primary" type="submit">Add</Button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Account</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {transactions.map((t: Transaction) => (
                            <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td className="px-6 py-4">{new Date(t.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">{t.description || 'N/A'}</td>
                                <td className="px-6 py-4">{t.category || '-'}</td>
                                <td className="px-6 py-4">{accounts.find((a: any) => a.id === t.accountId)?.name || 'General'}</td>
                                <td className="px-6 py-4 font-bold">
                                    <span className={t.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                        {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <Button size="sm" variant="ghost" icon="delete" className="text-red-500" onClick={() => setSelectedAction({
                                        id: t.id,
                                        action: 'delete'
                                    })} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ConfirmDialog
                isOpen={SelectedAction.id && SelectedAction.action === 'delete'}
                onClose={() => setSelectedAction({ id: '', action: null })}
                onConfirm={async () => await handleDelete(SelectedAction.id ? SelectedAction.id : '')} title={'Delete Transaction'}
                message={`Are you sure you want to delete this transaction?
                    This action is permanent and may affect related payments,
                     invoices, and financial reports.
                    This cannot be undone`} />
        </Card>
    );
};

// --- Main Finance Dashboard ---
type TabType = 'overview' | 'accounts' | 'transactions' | 'expenses' | 'invoices' | 'payments';

export const FinanceDashboard = ({ members, initialTransactions }: { members: Member[], initialTransactions: Transaction[] }) => {

    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [summary, setSummary] = useState({
        accounts: { totalBalance: 0, count: 0 },
        transactions: { income: 0, expense: 0, net: 0 },
        payments: { total: 0, paid: 0, unpaid: 0 },
        expenses: { total: 0, pending: 0, approved: 0 },
        invoices: { total: 0, paid: 0, pending: 0, overdue: 0 },
    });
    const { fetchMembers } = useAlmStore()
    const [loading, setLoading] = useState(true);
    const { transactions } = useTransactions();
    useEffect(() => {
        loadSummary();
        fetchMembers()
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
        { id: 'overview', label: 'Overview', icon: 'analytics' },
        { id: 'accounts', label: 'Accounts', icon: 'wallet' },
        { id: 'transactions', label: 'Transactions', icon: 'receipt_long' },
        { id: 'expenses', label: 'Expenses', icon: 'request_quote' },
        { id: 'invoices', label: 'Invoices', icon: 'description' },
        { id: 'payments', label: 'Payments', icon: 'payments' },
    ];

    if (loading) {
        return (
            <div className='flex justify-center items-center min-h-[90vh]'>
                <Loader />
            </div>
        )
    }
    const renderOverview = () => {
        const totalBalance = summary.accounts.totalBalance
        const netIncome = summary.transactions.net
        const pendingExpenses = summary.expenses.pending
        const outstandingInvoices = summary.invoices.pending;

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-blue-100 font-medium">Total Balance</span>
                            <Icon name="account_balance_wallet" className="text-2xl opacity-80" />
                        </div>
                        <p className="text-4xl font-bold">RWF{totalBalance.toLocaleString()}</p>
                        <p className="text-sm text-blue-100 mt-2">{summary.accounts.count} active accounts</p>
                    </Card> */}
                    <StatsCard title={"Total Balance"} className='bg-gradient-to-br from-blue-600 to-blue-700 text-white' value={formatCurrency(totalBalance)} description={`${summary.accounts.count} active accounts`} />
                    <StatsCard title={"Net Income"} value={formatCurrency(netIncome)} description={`All Time`} />
                    <StatsCard title={"Pending Expenses"} className='bg-gradient-to-br from-yellow-500 to-orange-600 text-white' value={formatCurrency(pendingExpenses)} description={`Needs approval`} />
                    <StatsCard title={"Unpaid Invoices"} className=' bg-gradient-to-br from-purple-600 to-purple-700 text-white' value={formatCurrency(outstandingInvoices)} description={`Accounts receivable`} />

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <button onClick={() => setActiveTab('accounts')} className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 transition-colors text-center">
                                <Icon name="savings" className="text-3xl text-primary mb-2" />
                                <p className="text-sm font-bold">Add Account</p>
                            </button>
                            <button onClick={() => setActiveTab('transactions')} className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 transition-colors text-center">
                                <Icon name="receipt_long" className="text-3xl text-primary mb-2" />
                                <p className="text-sm font-bold">Add Transaction</p>
                            </button>
                            <button onClick={() => setActiveTab('invoices')} className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 transition-colors text-center">
                                <Icon name="description" className="text-3xl text-primary mb-2" />
                                <p className="text-sm font-bold">Create Invoice</p>
                            </button>
                            <button onClick={() => setActiveTab('expenses')} className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 transition-colors text-center">
                                <Icon name="request_quote" className="text-3xl text-primary mb-2" />
                                <p className="text-sm font-bold">Request Expense</p>
                            </button>
                            <button onClick={() => setActiveTab('payments')} className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 transition-colors text-center">
                                <Icon name="payments" className="text-3xl text-primary mb-2" />
                                <p className="text-sm font-bold">Record Payment</p>
                            </button>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {transactions.slice(0, 5).map(t => (
                                <div key={t.id} className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                    <div>
                                        <p className="font-semibold text-text-primary dark:text-gray-400 text-sm">{t.description || 'Transaction'}</p>
                                        <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`font-bold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">Finance Management</h1>
                <p className="text-gray-500">Manage accounts, budgets, and financial records.</p>
            </header>

            {/* Navigation */}
            <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-1 flex gap-2 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-primary text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                            }`}
                    >
                        <Icon name={tab.icon} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'accounts' && (
                    <AccountsList
                    />
                )}
                {activeTab === 'transactions' && (
                    <TransactionsList />
                )}
                {activeTab === 'expenses' && (
                    <ExpensesList />
                )}
                {activeTab === 'invoices' && (
                    <InvoicesList />
                )}
                {activeTab === 'payments' && (
                    <PaymentsList />
                )}
            </div>
        </div>
    );
};
