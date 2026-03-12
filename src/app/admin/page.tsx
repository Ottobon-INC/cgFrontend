'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Check, User, Loader2, Trash2, ShieldAlert, UserCheck, Clock, Shield } from 'lucide-react';

interface PendingUser {
    id: string;
    email: string;
    created_at: string;
}

interface UserData {
    id: string;
    email: string;
    is_approved: boolean;
    is_admin: boolean;
    created_at: string;
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const session = user ? { user } : null;
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [allUsers, setAllUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const fetchPendingUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/api/auth/users/pending`);
            const json = await res.json();
            if (json.success) {
                setPendingUsers(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch pending users:', error);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/api/auth/users`);
            const json = await res.json();
            if (json.success) {
                setAllUsers(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch all users:', error);
        }
    };

    useEffect(() => {
        if (session?.user?.is_admin) {
            Promise.all([fetchPendingUsers(), fetchAllUsers()]).finally(() => {
                setLoading(false);
            });
        }
    }, [session]);

    const handleApprove = async (userId: string) => {
        setApprovingId(userId);
        try {
            const res = await fetch(`${API_URL}/api/auth/users/${userId}/approve`, {
                method: 'POST',
            });
            const json = await res.json();
            if (json.success) {
                setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
                fetchAllUsers();
            }
        } catch (error) {
            console.error('Failed to approve user:', error);
        } finally {
            setApprovingId(null);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!window.confirm("Are you sure you want to revoke this user's access?")) return;

        setDeletingId(userId);
        try {
            const res = await fetch(`${API_URL}/api/auth/users/${userId}`, {
                method: 'DELETE',
            });
            const json = await res.json();
            if (json.success) {
                setAllUsers((prev) => prev.filter((u) => u.id !== userId));
                setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
            } else {
                alert(json.error || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('An error occurred while deleting the user.');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (!session?.user?.is_admin) {
        return (
            <div className="flex-1 p-8 flex items-center justify-center min-h-screen bg-[#0a0a0c]">
                <div className="flex flex-col items-center gap-3 text-neutral-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">Verifying access...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-neutral-200 p-6 md:p-10 selection:bg-white/10 selection:text-white">
            <div className="max-w-5xl mx-auto space-y-10">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/5">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1.5">Platform Administration</h1>
                        <p className="text-sm text-neutral-400">Manage user access and registry boundaries.</p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-white/5 border border-white/10 text-neutral-300 rounded-md text-[10px] font-semibold uppercase tracking-wider self-start md:self-auto shadow-sm">
                        <Shield className="w-3 h-3 text-neutral-400" />
                        Admin Privileges Active
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-10">

                    {/* Pending Approvals Section */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <Clock className="w-4 h-4 text-neutral-400" />
                            <h2 className="text-sm font-medium text-neutral-300">Pending Approvals</h2>
                            {pendingUsers.length > 0 && (
                                <span className="ml-1.5 px-2 py-0.5 bg-white/10 text-white text-[10px] font-medium rounded-full">
                                    {pendingUsers.length}
                                </span>
                            )}
                        </div>

                        <div className="bg-[#111113] ring-1 ring-white/5 rounded-xl overflow-hidden shadow-sm">
                            {loading ? (
                                <div className="p-6 text-center flex items-center justify-center gap-3 text-neutral-500">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Loading requests...</span>
                                </div>
                            ) : pendingUsers.length === 0 ? (
                                <div className="p-6 flex items-center gap-3 text-neutral-400">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                        <Check className="w-4 h-4 text-neutral-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-300">All caught up</p>
                                        <p className="text-xs text-neutral-500">No pending access requests in the queue.</p>
                                    </div>
                                </div>
                            ) : (
                                <ul className="divide-y divide-white/5">
                                    {pendingUsers.map((user) => (
                                        <li key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors group">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-white/5 to-white/10 border border-white/10 flex items-center justify-center shrink-0 shadow-sm">
                                                    <span className="text-neutral-300 font-medium text-xs uppercase tracking-wider">
                                                        {user.email.substring(0, 2)}
                                                    </span>
                                                </div>
                                                <div className="truncate">
                                                    <p className="font-medium text-neutral-200 text-sm truncate">{user.email}</p>
                                                    <p className="text-xs text-neutral-500 mt-0.5">Requested on {formatDate(user.created_at)}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleApprove(user.id)}
                                                disabled={approvingId === user.id}
                                                className="shrink-0 flex items-center justify-center gap-2 px-3 py-1.5 bg-white text-black font-medium text-xs rounded-md hover:bg-neutral-200 hover:shadow-md transition-all disabled:opacity-50"
                                            >
                                                {approvingId === user.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <UserCheck className="w-3.5 h-3.5" />
                                                )}
                                                Approve
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>

                    {/* All Users Section */}
                    <section className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-neutral-400" />
                                <h2 className="text-sm font-medium text-neutral-300">Registered Users</h2>
                            </div>
                            <span className="text-xs text-neutral-500 font-medium">
                                Total: {allUsers.length}
                            </span>
                        </div>

                        <div className="bg-[#111113] ring-1 ring-white/5 rounded-xl overflow-hidden shadow-sm">
                            {loading ? (
                                <div className="p-6 text-center flex items-center justify-center gap-3 text-neutral-500">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Loading users...</span>
                                </div>
                            ) : allUsers.length === 0 ? (
                                <div className="p-6 text-center text-neutral-500 text-sm">
                                    No registered users found.
                                </div>
                            ) : (
                                <ul className="divide-y divide-white/5">
                                    {allUsers.map((u) => (
                                        <li key={u.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-white/5 to-white/10 border border-white/10 flex items-center justify-center shrink-0 shadow-sm">
                                                    <span className="text-neutral-300 font-medium text-xs uppercase tracking-wider">
                                                        {u.email.substring(0, 2)}
                                                    </span>
                                                </div>
                                                <div className="truncate">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <p className="font-medium text-neutral-200 text-sm truncate">{u.email}</p>
                                                        {u.is_admin && (
                                                            <span className="px-1.5 py-0.5 bg-white/10 border border-white/20 text-white rounded text-[9px] font-medium uppercase tracking-wider shrink-0">
                                                                Admin
                                                            </span>
                                                        )}
                                                        {!u.is_approved && (
                                                            <span className="px-1.5 py-0.5 bg-neutral-500/10 border border-neutral-500/20 text-neutral-400 rounded text-[9px] font-medium uppercase tracking-wider shrink-0">
                                                                Pending
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-neutral-500">Joined {formatDate(u.created_at)}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center pl-4">
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    disabled={deletingId === u.id || u.id === session?.user?.id}
                                                    title={u.id === session?.user?.id ? "You cannot remove yourself" : "Revoke Access"}
                                                    className="p-1.5 text-neutral-500 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-500 focus:outline-none"
                                                >
                                                    {deletingId === u.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : u.id === session?.user?.id ? (
                                                        <ShieldAlert className="w-4 h-4 opacity-30" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}