import { CreatePaymentDto } from '@/service/financeService';
import { usePayments } from '@/src/hooks/use-finance';
import React, { useState } from 'react';


export const PaymentsList: React.FC = () => {
    const {
        payments,
        loading,
        error,
        createPayment,
        markAsPaid,
        deletePayment,
    } = usePayments();

    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState<string>('all');

    const [formData, setFormData] = useState<CreatePaymentDto>({
        memberId: '',
        amount: 0,
        purpose: undefined,
        payerType: "MEMBER",
        method: 'Cash',
        status: 'Unpaid',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createPayment(formData);
            setShowForm(false);
            setFormData({
                memberId: '',
                amount: 0,
                purpose: undefined,
                payerType: "MEMBER",
                method: 'Cash',
                status: 'Unpaid',
            });
        } catch (error) {
            console.error('Failed to create payment:', error);
        }
    };

    const handleMarkAsPaid = async (id: string, account?: string) => {
        try {
            await markAsPaid(id);
        } catch (error) {
            console.error('Failed to mark payment as paid:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this payment?')) {
            try {
                await deletePayment(id);
            } catch (error) {
                console.error('Failed to delete payment:', error);
            }
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
                    <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Track member payments and dues
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {showForm ? 'Cancel' : '+ Record Payment'}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium">Total Expected</p>
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
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600 font-medium">Unpaid</p>
                    <p className="text-2xl font-bold text-red-700 mt-1">
                        ${unpaidAmount.toFixed(2)}
                    </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 font-medium">Collection Rate</p>
                    <p className="text-2xl font-bold text-gray-700 mt-1">
                        {totalAmount > 0
                            ? ((paidAmount / totalAmount) * 100).toFixed(1)
                            : 0}
                        %
                    </p>
                </div>
            </div>

            {/* Create Form */}
            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200"
                >
                    <h3 className="text-lg font-semibold mb-4">Record New Payment</h3>
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
                                value={formData.amount}
                                onChange={(e) =>
                                    setFormData({ ...formData, amount: parseFloat(e.target.value) })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Purpose *
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Monthly membership fee"
                                value={formData.purpose}
                                onChange={(e) =>
                                    setFormData({ ...formData, purpose: e.target.value as any })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Method *
                            </label>
                            <select
                                value={formData.method}
                                onChange={(e) =>
                                    setFormData({ ...formData, method: e.target.value as any })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="Cash">Cash</option>
                                <option value="BankTransfer">Bank Transfer</option>
                                <option value="MobileMoney">Mobile Money</option>
                                <option value="Card">Card</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status *
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({ ...formData, status: e.target.value as any })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="Unpaid">Unpaid</option>
                                <option value="Paid">Paid</option>
                                <option value="Partial">Partial</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reference Number
                            </label>
                            <input
                                type="text"
                                placeholder="Optional reference"
                                value={formData.reference || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, reference: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Record Payment
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
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    All ({payments.length})
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
                    onClick={() => setFilter('Unpaid')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'Unpaid'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Unpaid ({statusCounts.Unpaid})
                </button>
                <button
                    onClick={() => setFilter('Partial')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'Partial'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Partial ({statusCounts.Partial})
                </button>
            </div>

            {/* Payments Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Member
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Purpose
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Method
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPayments.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    No payments found. Record your first payment to get started.
                                </td>
                            </tr>
                        ) : (
                            filteredPayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {payment.member?.firstName} {payment.member?.lastName}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {payment.member?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {payment.purpose}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        ${payment.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {payment.method}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={getStatusBadge(payment.status)}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {payment.paidAt
                                            ? new Date(payment.paidAt).toLocaleDateString()
                                            : new Date(payment.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2">
                                            {payment.status !== 'Paid' && (
                                                <button
                                                    onClick={() => handleMarkAsPaid(payment.id)}
                                                    className="text-green-600 hover:text-green-900 font-medium"
                                                >
                                                    Mark Paid
                                                </button>
                                            )}
                                            {payment.status !== 'Paid' && (
                                                <span className="text-gray-300">|</span>
                                            )}
                                            <button
                                                onClick={() => handleDelete(payment.id)}
                                                className="text-red-600 hover:text-red-900 font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
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
