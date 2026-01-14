import React, { useState } from 'react';
import { CreateInvoiceDto } from '@/service/financeService';
import { useInvoices } from '@/src/hooks/use-finance';

export const InvoicesList: React.FC = () => {
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage member invoices and payments
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {showForm ? 'Cancel' : '+ Create Invoice'}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1">
                        ${totalAmount.toFixed(2)}
                    </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-medium">Paid</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">
                        ${paidAmount.toFixed(2)}
                    </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-600 font-medium">Pending</p>
                    <p className="text-2xl font-bold text-yellow-700 mt-1">
                        ${pendingAmount.toFixed(2)}
                    </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600 font-medium">Overdue</p>
                    <p className="text-2xl font-bold text-red-700 mt-1">
                        {statusCounts.Overdue}
                    </p>
                </div>
            </div>

            {/* Create Form */}
            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200"
                >
                    <h3 className="text-lg font-semibold mb-4">New Invoice</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Member ID *
                            </label>
                            <input
                                type="text"
                                placeholder="Enter member ID"
                                value={formData.memberId}
                                onChange={(e) =>
                                    setFormData({ ...formData, memberId: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.amount || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, amount: parseFloat(e.target.value) })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description *
                            </label>
                            <textarea
                                placeholder="Invoice description..."
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date *
                            </label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, dueDate: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Create Invoice
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    All ({invoices.length})
                </button>
                <button
                    onClick={() => setFilter('Pending')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'Pending'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Pending ({statusCounts.Pending})
                </button>
                <button
                    onClick={() => setFilter('Paid')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'Paid'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Paid ({statusCounts.Paid})
                </button>
                <button
                    onClick={() => setFilter('overdue')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'overdue'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Overdue ({statusCounts.Overdue})
                </button>
            </div>

            {/* Invoices Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Invoice #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Member
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Due Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredInvoices.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    No invoices found. Create your first invoice to get started.
                                </td>
                            </tr>
                        ) : (
                            filteredInvoices.map((invoice) => (
                                <tr
                                    key={invoice.id}
                                    className={`hover:bg-gray-50 ${isOverdue(invoice) ? 'bg-red-50' : ''
                                        }`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                        #{invoice.id.slice(0, 8)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {invoice.member?.firstName} {invoice.member?.lastName}
                                        <br />
                                        <span className="text-xs text-gray-500">
                                            {invoice.member?.email}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {invoice.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        ${invoice.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="text-gray-900">
                                            {new Date(invoice.dueDate).toLocaleDateString()}
                                        </div>
                                        {isOverdue(invoice) && (
                                            <span className="text-xs text-red-600 font-medium">
                                                Overdue
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                                                invoice.status,
                                                invoice.dueDate
                                            )}`}
                                        >
                                            {isOverdue(invoice) ? 'Overdue' : invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {invoice.status === 'Pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAction(invoice.id, 'paid')}
                                                    className="text-green-600 hover:text-green-900 font-medium"
                                                >
                                                    Mark Paid
                                                </button>
                                                <span className="text-gray-300">|</span>
                                                <button
                                                    onClick={() => handleAction(invoice.id, 'cancel')}
                                                    className="text-red-600 hover:text-red-900 font-medium"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                        {invoice.status === 'Cancelled' && (
                                            <button
                                                onClick={() => handleAction(invoice.id, 'delete')}
                                                className="text-red-600 hover:text-red-900 font-medium"
                                            >
                                                Delete
                                            </button>
                                        )}
                                        {invoice.status === 'Paid' && (
                                            <span className="text-gray-400">No actions</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};