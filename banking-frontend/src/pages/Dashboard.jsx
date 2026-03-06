import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiLogOut, FiPlus, FiArrowDown, FiArrowUp, FiRefreshCw, FiUser } from 'react-icons/fi';

const Dashboard = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({ totalAccounts: 0, totalBalance: 0 });
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            setLoading(true);
            const [accountsRes, summaryRes] = await Promise.all([
                api.get('/accounts'),
                api.get('/accounts/summary')
            ]);
            setAccounts(accountsRes.data);
            setSummary(summaryRes.data);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                handleLogout();
            }
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        navigate('/');
    };

    const handleAction = async (type, account) => {
        // In a real app, this would open a modal for amounts
        // For simluation, we'll prompt
        const amountStr = prompt(`Enter amount for ${type}:`);
        if (!amountStr || isNaN(amountStr)) return;

        const amount = parseFloat(amountStr);

        try {
            await api.post(`/transactions/${type}`, {
                accountNumber: account.accountNumber,
                amount: amount,
                description: `Manual ${type} from Dashboard`
            });
            fetchData(); // Refresh data
        } catch (err) {
            alert(err.response?.data?.message || err.response?.data?.error || `Failed to ${type}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center font-bold">
                        BS
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-800">Banking Simulator</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-slate-600 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100"
                >
                    <FiLogOut />
                    <span className="font-medium text-sm">Sign Out</span>
                </button>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
                {/* Top Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between border-l-4 border-l-primary">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Total Holdings</p>
                            <h2 className="text-4xl font-bold text-slate-800">${summary.totalBalance?.toFixed(2) || '0.00'}</h2>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center text-xl">
                            <FiArrowUp />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between border-l-4 border-l-slate-400">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Active Accounts</p>
                            <h2 className="text-4xl font-bold text-slate-800">{summary.totalAccounts || 0}</h2>
                        </div>
                        <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center text-xl">
                            <FiUser />
                        </div>
                    </div>
                </div>

                {/* Accounts List */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-lg font-bold text-slate-800">Your Accounts</h3>
                        <div className="flex space-x-2">
                            <button onClick={fetchData} className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-slate-100 rounded-md">
                                <FiRefreshCw className={loading ? "animate-spin" : ""} />
                            </button>
                            <button className="flex items-center space-x-1 bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                                <FiPlus />
                                <span>New Account</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                    <th className="px-6 py-4">Account Holder</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Account Number</th>
                                    <th className="px-6 py-4 text-right">Balance</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Quick Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading && accounts.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                            Loading accounts...
                                        </td>
                                    </tr>
                                ) : accounts.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                            No accounts found. Create one to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    accounts.map((account) => (
                                        <tr key={account.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-800">{account.holderName}</div>
                                                <div className="text-xs text-slate-500">{account.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium">
                                                    {account.accountType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm text-slate-600">
                                                {account.accountNumber}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-800">
                                                ${account.balance.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${account.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {account.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleAction('deposit', account)}
                                                    className="px-3 py-1 bg-green-50 text-green-600 rounded text-xs font-semibold hover:bg-green-100 transition-colors"
                                                >
                                                    Deposit
                                                </button>
                                                <button
                                                    onClick={() => handleAction('withdraw', account)}
                                                    className="px-3 py-1 bg-orange-50 text-orange-600 rounded text-xs font-semibold hover:bg-orange-100 transition-colors"
                                                >
                                                    Withdraw
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
