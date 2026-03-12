'use client';

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Plus, Menu, X, LayoutGrid, Search, Shield, Folder, Command } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface CategoryItem {
    id: string;
    label: string;
    icon?: string;
}

const BROWSE_ITEMS = [
    { label: 'All Components', id: 'all', icon: LayoutGrid },
];

interface SidebarProps {
    activeCategory?: string;
    onCategoryChange?: (cat: string) => void;
    categories?: CategoryItem[];
    onCategoriesChanged?: () => void;
}

export function Sidebar({
    activeCategory = 'all',
    onCategoryChange,
    categories = [],
    onCategoriesChanged,
}: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location.pathname;
    const { user, logout } = useAuth();
    const session = user ? { user } : null;

    const [addingCategory, setAddingCategory] = useState(false);
    const [newCategoryLabel, setNewCategoryLabel] = useState('');
    const [addError, setAddError] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleCategoryClick = (id: string) => {
        onCategoryChange?.(id);
        setMobileOpen(false);
    };

    const handleAddCategory = async () => {
        if (!newCategoryLabel.trim()) return;
        setAddError(null);
        setAdding(true);

        try {
            const res = await fetch(`${API_URL}/api/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ label: newCategoryLabel.trim() }),
            });
            const json = await res.json();
            if (json.success) {
                setNewCategoryLabel('');
                setAddingCategory(false);
                onCategoriesChanged?.();
            } else {
                setAddError(json.error ?? 'Failed to create category');
            }
        } catch {
            setAddError('Could not reach the API');
        } finally {
            setAdding(false);
        }
    };

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between h-14 px-4 bg-[#0a0a0c] border-b border-white/5 sticky top-0 z-40">
                <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-white text-sm font-semibold tracking-tight">
                        ottobon<span className="text-neutral-500 font-medium">hub</span>
                    </span>
                </div>
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            {/* Mobile Overlay Backdrop */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar off-canvas container */}
            <aside
                className={`w-64 flex-shrink-0 bg-[#0a0a0c] border-r border-white/5 flex flex-col h-screen fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:translate-x-0 ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-white text-base font-semibold tracking-tight">
                            ottobon<span className="text-neutral-500 font-medium">hub</span>
                        </span>
                    </div>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="md:hidden p-1.5 rounded-md text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Global Search Hint */}
                <div className="px-3 pb-4">
                    <button
                        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all group"
                    >
                        <div className="flex items-center gap-2.5 text-neutral-400 group-hover:text-neutral-300 transition-colors">
                            <Search className="w-4 h-4" />
                            <span className="text-sm">Search...</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-60">
                            <Command className="w-3 h-3 text-neutral-400" />
                            <span className="text-xs font-medium text-neutral-400">K</span>
                        </div>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 space-y-6 custom-scrollbar pb-6">
                    
                    {/* Browse */}
                    <div>
                        <div className="space-y-0.5">
                            {BROWSE_ITEMS.map((item) => {
                                const isActive = activeCategory === item.id;
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleCategoryClick(item.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left ${
                                            isActive
                                                ? 'bg-white/10 text-white font-medium'
                                                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Dynamic Categories */}
                    <div>
                        <div className="flex items-center justify-between px-3 mb-2 group">
                            <h3 className="text-xs font-semibold text-neutral-500">
                                Categories
                            </h3>
                            <button
                                onClick={() => { setAddingCategory(!addingCategory); setAddError(null); }}
                                className="text-neutral-500 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Add Category Form */}
                        {addingCategory && (
                            <div className="mb-2 space-y-2 px-1">
                                <input
                                    value={newCategoryLabel}
                                    onChange={(e) => { setNewCategoryLabel(e.target.value); setAddError(null); }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddCategory();
                                        if (e.key === 'Escape') setAddingCategory(false);
                                    }}
                                    placeholder="Category name..."
                                    autoFocus
                                    className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-all"
                                />
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleAddCategory}
                                        disabled={adding || !newCategoryLabel.trim()}
                                        className="flex-1 bg-white/10 text-white text-xs font-medium py-1.5 rounded-md hover:bg-white/20 disabled:opacity-50 transition-colors"
                                    >
                                        {adding ? 'Adding...' : 'Add'}
                                    </button>
                                    <button
                                        onClick={() => setAddingCategory(false)}
                                        className="flex-1 text-neutral-400 text-xs font-medium py-1.5 rounded-md hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                                {addError && <p className="text-red-400 text-xs mt-1">{addError}</p>}
                            </div>
                        )}

                        <div className="space-y-0.5">
                            {categories.map((item) => {
                                const isActive = activeCategory === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleCategoryClick(item.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left ${
                                            isActive
                                                ? 'bg-white/10 text-white font-medium'
                                                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                                        }`}
                                    >
                                        <span className={`flex items-center justify-center w-4 h-4 text-xs ${isActive ? 'text-white' : 'text-neutral-500'}`}>
                                            {item.icon ? item.icon : <Folder className="w-4 h-4" />}
                                        </span>
                                        <span className="truncate">{item.label}</span>
                                    </button>
                                );
                            })}
                            {categories.length === 0 && !addingCategory && (
                                <p className="text-neutral-600 text-xs px-3 py-2 italic">No categories yet</p>
                            )}
                        </div>
                    </div>

                    {/* Secure Admin Route */}
                    {session?.user?.is_admin && (
                        <div>
                            <h3 className="text-xs font-semibold text-neutral-500 px-3 mb-2">
                                Secure
                            </h3>
                            <button
                                onClick={() => window.location.href = '/admin'}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left ${
                                    pathname.startsWith('/admin')
                                        ? 'bg-red-500/10 text-red-400 font-medium'
                                        : 'text-neutral-400 hover:text-red-400 hover:bg-red-500/5'
                                }`}
                            >
                                <Shield className={`w-4 h-4 ${pathname.startsWith('/admin') ? 'text-red-400' : 'text-neutral-500'}`} />
                                Admin Dashboard
                            </button>
                        </div>
                    )}
                </nav>

                {/* Footer / User */}
                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-xs font-medium text-neutral-300 shrink-0">
                                {(session?.user as { name?: string })?.name?.charAt(0)?.toUpperCase()
                                    ?? session?.user?.email?.substring(0, 1)?.toUpperCase()
                                    ?? 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-200 truncate">
                                    {(session?.user as { name?: string })?.name ?? session?.user?.email?.split('@')[0] ?? 'User'}
                                </p>
                                <p className="text-xs text-neutral-500 truncate">
                                    {session?.user?.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => { logout(); navigate('/login'); }}
                            title="Sign out"
                            className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-md opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}