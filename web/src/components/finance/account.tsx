import React, { useState } from 'react';
import { CreateAccountDto } from '@/service/financeService';
import { useAccounts } from '@/src/hooks/use-finance';
import {Expense} from '@/service/financeService';
export const AccountsList: React.FC = () => {
    const {
        accounts,
        loading,
        error,
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

    const getAccountIcon = (type: string) => {
        switch (type) {
            case 'CASH':
                return '💵';
            case 'BANK':
                return '🏦';
            case 'MOBILE_MONEY':
                return '📱';
            default:
                return '💰';
        }
    };

    const getAccountTypeLabel = (type: string) => {
        switch (type) {
            case 'CASH':
                return 'Cash';
            case 'BANK':
                return 'Bank Account';
            case 'MOBILE_MONEY':
                return 'Mobile Money';
            default:
                return type;
        }
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
                    <h2 className="text-2xl font-bold text-gray-900">Financial Accounts</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage your organization's financial accounts
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {showForm ? 'Cancel' : '+ Add Account'}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 shadow-md">
                    <p className="text-sm opacity-90 font-medium">Total Balance</p>
                    <p className="text-3xl font-bold mt-2">${totalBalance.toFixed(2)}</p>
                    <p className="text-xs opacity-75 mt-1">{accounts.length} accounts</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4 shadow-md">
                    <p className="text-sm opacity-90 font-medium">💵 Cash</p>
                    <p className="text-3xl font-bold mt-2">
                        ${(accountsByType.CASH || 0).toFixed(2)}
                    </p>
                    <p className="text-xs opacity-75 mt-1">
                        {accounts.filter((a) => a.type === 'CASH').length} accounts
                    </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4 shadow-md">
                    <p className="text-sm opacity-90 font-medium">🏦 Bank</p>
                    <p className="text-3xl font-bold mt-2">
                        ${(accountsByType.BANK || 0).toFixed(2)}
                    </p>
                    <p className="text-xs opacity-75 mt-1">
                        {accounts.filter((a) => a.type === 'BANK').length} accounts
                    </p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-4 shadow-md">
                    <p className="text-sm opacity-90 font-medium">📱 Mobile Money</p>
                    <p className="text-3xl font-bold mt-2">
                        ${(accountsByType.MOBILE_MONEY || 0).toFixed(2)}
                    </p>
                    <p className="text-xs opacity-75 mt-1">
                        {accounts.filter((a) => a.type === 'MOBILE_MONEY').length} accounts
                    </p>
                </div>
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-blue-200"
                >
                    <h3 className="text-lg font-semibold mb-4">
                        {editingId ? 'Edit Account' : 'New Account'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Account Name *
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Main Cash Account"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Account Type *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="CASH">💵 Cash</option>
                                <option value="BANK">🏦 Bank Account</option>
                                <option value="MOBILE_MONEY">📱 Mobile Money</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {editingId ? 'Current Balance' : 'Initial Balance'} *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.balance || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, balance: parseFloat(e.target.value) })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <input
                                type="text"
                                placeholder="Optional description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
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
                            {editingId ? 'Update Account' : 'Create Account'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
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
                    All ({accounts.length})
                </button>
                <button
                    onClick={() => setFilter('CASH')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'CASH'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    💵 Cash ({accounts.filter((a) => a.type === 'CASH').length})
                </button>
                <button
                    onClick={() => setFilter('BANK')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'BANK'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    🏦 Bank ({accounts.filter((a) => a.type === 'BANK').length})
                </button>
                <button
                    onClick={() => setFilter('MOBILE_MONEY')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'MOBILE_MONEY'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    📱 Mobile ({accounts.filter((a) => a.type === 'MOBILE_MONEY').length})
                </button>
            </div>

            {/* Accounts Grid */}
            {filteredAccounts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-6xl mb-4">💰</div>
                    <p className="text-gray-500 text-lg font-medium">No accounts found</p>
                    <p className="text-gray-400 text-sm mt-2">
                        Create your first financial account to get started
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAccounts.map((account) => (
                        <div
                            key={account.id}
                            className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{getAccountIcon(account.type)}</span>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900">
                                            {account.name}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {getAccountTypeLabel(account.type)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    ${account.balance.toFixed(2)}
                                </p>
                            </div>

                            {account.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                    {account.description}
                                </p>
                            )}

                            <div className="text-xs text-gray-400 mb-3">
                                <p>Created: {new Date(account.createdAt).toLocaleDateString()}</p>
                                <p>Updated: {new Date(account.updatedAt).toLocaleDateString()}</p>
                            </div>

                            <div className="flex gap-2 pt-3 border-t border-gray-200">
                                <button
                                    onClick={() => handleEdit(account)}
                                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(account.id)}
                                    className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Additional Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Account Management Tips</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Keep separate accounts for different funding sources</li>
                            <li>• Regularly reconcile bank accounts with statements</li>
                            <li>• Use descriptive names to easily identify accounts</li>
                            <li>• Update balances when making manual adjustments</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};