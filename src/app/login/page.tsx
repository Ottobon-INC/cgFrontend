'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowRight, Command } from 'lucide-react';

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
                login(json.data);
                navigate('/');
            }
        } catch (err) {
            setError('Network error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#080808] flex flex-col items-center justify-center p-6 transition-colors duration-500">
            {/* Subtle Grid Pattern for Texture */}
            <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h1v1H0z' fill='%23000' fill-opacity='.5'/%3E%3C/svg%3E")` }}>
            </div>

            <div className="w-full max-w-[400px] z-10">
                {/* Minimalist Logo */}
                <div className="flex justify-center mb-12">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-black dark:bg-white rounded-lg transition-colors">
                            <Command className="w-5 h-5 text-white dark:text-black" />
                        </div>
                        <span className="text-xl font-bold tracking-tighter text-black dark:text-white">
                            ottobon<span className="opacity-40">hub</span>
                        </span>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">Sign in</h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Access your enterprise workspace.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest ml-1">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-neutral-400 dark:focus:border-neutral-600 transition-all"
                                placeholder="name@company.com"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                                    Password
                                </label>
                                <Link to="/forgot-password" university-colors className="text-[11px] font-bold text-neutral-400 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest">
                                    Reset
                                </Link>
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-neutral-400 dark:focus:border-neutral-600 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-all font-semibold py-3.5 text-sm rounded-xl flex items-center justify-center mt-4 group"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span>Continue</span>
                                    <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-neutral-500">
                        Don't have access?{' '}
                        <Link to="/register" className="text-black dark:text-white font-semibold hover:underline decoration-neutral-500 underline-offset-4">
                            Contact your administrator
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}