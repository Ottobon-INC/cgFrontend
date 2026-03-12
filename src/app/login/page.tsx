'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const json = await res.json();

            if (!res.ok || !json.success) {
                setError(json.error || 'Invalid credentials');
                setLoading(false);
            } else {
                login(json.data); // Update AuthContext and LocalStorage
                navigate('/'); // Use React Router
            }
        } catch (err) {
            setError('Network error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4 selection:bg-white/10 selection:text-white">
            <div className="max-w-[420px] w-full bg-[#111113] border border-white/5 rounded-2xl p-8 shadow-2xl ring-1 ring-white/[0.02]">
                <div className="mb-10 text-center flex flex-col items-center">
                    <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            ottobon<span className="text-neutral-500 font-medium">hub</span>
                        </h1>
                    </div>
                    <p className="text-neutral-400 text-sm">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3.5 rounded-lg flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest pl-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                            placeholder="you@company.com"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between pl-1">
                            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                                Password
                            </label>
                            <Link to="/forgot-password" className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black hover:bg-neutral-200 transition-all font-bold py-3 text-sm flex items-center justify-center mt-8 rounded-xl ring-1 ring-inset ring-black/10 shadow-lg disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                    </button>

                    <p className="text-center text-sm font-medium text-neutral-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors ml-1">
                            Request Access
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
