import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiLock, FiUser } from 'react-icons/fi';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Create Base64 token for Basic Auth
            const token = btoa(`${username}:${password}`);

            // Test the credentials against an endpoint
            await api.get('/accounts', {
                headers: { Authorization: `Basic ${token}` }
            });

            // If successful, save token and redirect
            localStorage.setItem('auth_token', token);
            navigate('/dashboard');
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Invalid username or password');
            } else {
                setError('Cannot connect to the server');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-200">
            <div className="glass p-10 rounded-2xl w-full max-w-md animate-fade-in-up">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-2xl font-bold">
                        BS
                    </div>
                    <h1 className="text-3xl font-extrabold text-secondary">Banking Simulator</h1>
                    <p className="text-slate-500 mt-2">Sign in to your account</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <FiUser />
                        </div>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="pl-10 w-full p-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all outline-none bg-white bg-opacity-80"
                            placeholder="Username"
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <FiLock />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 w-full p-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all outline-none bg-white bg-opacity-80"
                            placeholder="Password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex justify-center"
                    >
                        {loading ? (
                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full block"></span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    Try <span className="font-semibold text-slate-700">user</span> / <span className="font-semibold text-slate-700">password</span>
                </div>
            </div>
        </div>
    );
};

export default Login;
