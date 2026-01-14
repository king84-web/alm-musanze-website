import React, { useState } from 'react';
import { CreateExpenseDto, Expense } from '@/service/financeService';
import { useAccounts, useExpenses } from '@/src/hooks/use-finance';
import { useAlmStore } from '@/store/useAppStore';
import { Button, Input, Loader } from '../Common';
import { formatCurrency } from '@/src/libs/utils';
import { AccountSelectDialog, ConfirmDialog } from './FinanceComponents';
import { set } from 'zod';

export const ExpensesList: React.FC = () => {
    const {
        expenses,
        loading,
        createExpense,
        submitExpense,
        approveExpense,
        rejectExpense,
        markAsPaid,
        deleteExpense,
    } = useExpenses();

    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState<string>('all');
    const { currentUser } = useAlmStore()
    const currentUserId = currentUser.id
    const [formData, setFormData] = useState<CreateExpenseDto>({
        title: '',
        description: '',
        amount: 0,
        requestedBy: currentUserId,
    });
    const { accounts } = useAccounts()
    const [selectedId, setSelectItemId] = useState<string>('');
    const [selectedAction, setSelectedAction] = useState<"delete" | "paid" | null>(null);

    const handleMarkingAsPaid = async (id: string, accountId?: string) => {
        try {
            await markAsPaid(id, accountId);
            setSelectItemId('')
        } catch (error) {
            console.error('Failed to mark payment as paid:', error);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createExpense(formData);
            setShowForm(false);
            setFormData({
                title: '',
                description: '',
                amount: 0,
                requestedBy: currentUserId,
            });
        } catch (error) {
            console.error('Failed to create expense:', error);
        }
    };

    const handleAction = async (
        id: string,
        action: 'submit' | 'approve' | 'reject' | 'paid' | 'delete'
    ) => {
        try {
            switch (action) {
                case 'submit':
                    await submitExpense(id);
                    break;
                case 'approve':
                    await approveExpense(id, currentUserId);
                    break;
                case 'reject':
                    await rejectExpense(id, currentUserId);
                    break;
                case 'paid':
                    setSelectItemId(id);
                    break;
                case 'delete':
                    setSelectItemId(id)
                    setSelectedAction('delete')
                    break;
            }
        } catch (error) {
            console.error(`Failed to ${action} expense:`, error);
        }
    };

    const filteredExpenses = expenses.filter((expense) => {
        if (filter === 'all') return true;
        return expense.status === filter;
    });

    const statusCounts = {
        Draft: expenses.filter((e) => e.status === 'Draft').length,
        Submitted: expenses.filter((e) => e.status === 'Submitted').length,
        Approved: expenses.filter((e) => e.status === 'Approved').length,
        Rejected: expenses.filter((e) => e.status === 'Rejected').length,
        Paid: expenses.filter((e) => e.status === 'Paid').length,
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            Draft: 'bg-gray-100 text-gray-800',
            Submitted: 'bg-yellow-100 text-yellow-800',
            Approved: 'bg-green-100 text-green-800',
            Rejected: 'bg-red-100 text-red-800',
            Paid: 'bg-blue-100 text-blue-800',
        };
        return `px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'
            }`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader />
            </div>
        );
    }


    return (
        <div className="bg-white dark:bg-card-dark rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Requests</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage expense requests and approvals
                    </p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ New Expense'}
                </Button>
            </div>

            {/* Create Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-6 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
                    <h3 className="text-lg font-semibold mb-4">New Expense Request</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Title" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        <Input label="Amount" type="number" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea className="w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark p-2"
                                rows={3} value={formData.description} placeholder='Provide details about this expense...' onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="primary" type="submit">Create Request</Button>
                    </div>
                </form>
            )}
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
                <Button
                    onClick={() => setFilter('all')}
                    variant={filter === 'all' ? 'primary' : 'outline'}

                >
                    All ({expenses.length})
                </Button>
                {Object.keys(statusCounts).map((status) => (
                    <Button
                        key={status}
                        onClick={() => setFilter(status)}
                        variant={filter === status ? 'primary' : 'outline'}

                    // className={`px-4 py-2 rounded-lg transition-colors ${filter === status
                    //     ? 'bg-blue-600 text-white'
                    //     : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    //     }`}
                    >
                        {status} ({statusCounts[status as keyof typeof statusCounts]})
                    </Button>
                ))}
            </div>



            <div className="space-y-4">
                {filteredExpenses.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-card-dark rounded-lg">
                        <p className="text-gray-500">
                            No expenses found. Create your first expense request to get started.
                        </p>
                    </div>
                ) : filteredExpenses.map((expense: Expense) => (
                    <div key={expense.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-card-dark hover:shadow-md transition-all">
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-lg">{expense.title}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-${getStatusBadge(expense.status)} text-${getStatusBadge(expense.status)} `}>{expense.status}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Requested by {expense.requester?.firstName} • {new Date(expense.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold">{formatCurrency(expense.amount, 'RWF', 'rw-RW')}</p>
                        </div>
                        <div className="flex gap-2">
                            {expense.status === 'Draft' && (
                                <Button size="sm" variant="primary" onClick={() => handleAction(expense.id, "submit")}>Submit</Button>
                            )}

                            {expense.status === 'Submitted' && (
                                <>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction(expense.id, 'approve')}>Approve</Button>
                                    <Button size="sm" variant="danger" onClick={() => handleAction(expense.id, "reject")}>Reject</Button>
                                </>
                            )}
                            {expense.status === 'Approved' && (
                                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => handleAction(expense.id, "paid")}>Mark Paid</Button>
                            )}
                            <Button size="sm" variant="ghost" icon="delete" className="text-red-500" onClick={() => handleAction(expense.id, 'delete')} />
                        </div>
                    </div>
                ))}
            </div>
            <AccountSelectDialog isOpen={!!selectedId && selectedAction === "paid"}
                onClose={() => setSelectItemId("")}
                onConfirm={accountId => handleMarkingAsPaid(selectedId, accountId)}
                accounts={accounts} amount={expenses.find(expense => expense.id === selectedId)?.amount || 0} />
            <ConfirmDialog isOpen={selectedId && selectedAction === "delete"}
                onClose={() => setSelectItemId('')}
                onConfirm={async () => {
                    await deleteExpense(selectedId);
                }}
                title={'Delete Expense'}
                message={`Are you sure you want to delete this expense?
                    Deleting it may affect related financial reports or balances.
                    This action cannot be undone.`} />
        </div>
    );
};