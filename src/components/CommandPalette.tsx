'use client';

import { useEffect, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import type { SearchResult } from '@/types';
import { api } from '@/lib/api';

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault(); 
                setOpen((o) => !o);
            }
            if (e.key === 'Escape') setOpen(false);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const search = useCallback(async (q: string) => {
        if (q.trim().length < 2) { 
            setResults([]); 
            return; 
        }
        setLoading(true);
        try {
            const res = await api.components.search(q, 8);
            setResults(res.results);
        } catch { 
            setResults([]); 
        } finally { 
            setLoading(false); 
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => search(query), 300);
        return () => clearTimeout(t);
    }, [query, search]);

    const handleSelect = (id: string) => {
        setOpen(false); 
        setQuery(''); 
        setResults([]);
        navigate(`/components/${id}`);
    };

    if (!open) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 animate-fade-in" 
            onClick={() => setOpen(false)}
        >
            {/* Dark, subtle backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Premium Monochrome Modal */}
            <div 
                className="relative w-full max-w-2xl bg-[#111111] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <Command className="flex flex-col w-full outline-none" shouldFilter={false}>
                    
                    {/* Sleek Header & Input */}
                    <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
                        <svg className="w-5 h-5 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <Command.Input
                            value={query}
                            onValueChange={setQuery}
                            placeholder="Search components by concept, name, or use case..."
                            className="flex-1 bg-transparent text-white text-base placeholder:text-neutral-500 outline-none w-full"
                            autoFocus
                        />
                        {loading && (
                            <span className="text-xs text-neutral-500 animate-pulse font-medium">Searching...</span>
                        )}
                        <kbd className="hidden sm:inline-flex items-center justify-center h-6 px-2 text-[10px] font-medium text-neutral-400 bg-white/5 border border-white/10 rounded">
                            ESC
                        </kbd>
                    </div>

                    {/* Results Container */}
                    <Command.List className="max-h-[50vh] overflow-y-auto p-2">
                        {results.length === 0 && query.length >= 2 && !loading && (
                            <Command.Empty className="py-12 text-center text-neutral-500 text-sm">
                                No components found for <span className="text-neutral-300 font-medium">"{query}"</span>
                            </Command.Empty>
                        )}

                        {results.length > 0 && (
                            <Command.Group 
                                heading={
                                    <span className="px-3 py-2 text-[10px] font-medium text-neutral-500 uppercase tracking-widest block">
                                        Results
                                    </span>
                                }
                            >
                                {results.map((r) => (
                                    <Command.Item
                                        key={r.id}
                                        value={r.id}
                                        onSelect={() => handleSelect(r.id)}
                                        className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer text-neutral-400 hover:bg-white/5 hover:text-white data-[selected]:bg-white/5 data-[selected]:text-white transition-all group outline-none"
                                    >
                                        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-white/5 border border-white/5 group-data-[selected]:border-white/10 shrink-0">
                                            <svg className="w-4 h-4 text-neutral-500 group-data-[selected]:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <p className="text-sm font-medium text-neutral-200 truncate group-data-[selected]:text-white">
                                                {r.title}
                                            </p>
                                            <p className="text-xs text-neutral-500 truncate mt-0.5 group-data-[selected]:text-neutral-400">
                                                {r.description}
                                            </p>
                                        </div>
                                        <div className="shrink-0 pl-2">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-neutral-400 border border-white/5">
                                                {Math.round(r.similarity * 100)}% match
                                            </span>
                                        </div>
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}

                        {query.length === 0 && (
                            <div className="py-12 text-center text-neutral-600 text-sm">
                                Type to semantically search across all components
                            </div>
                        )}
                    </Command.List>

                    {/* Minimalist Footer */}
                    <div className="flex items-center justify-between px-4 py-3 bg-black/20 border-t border-white/5">
                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                            <span className="flex items-center gap-1.5">
                                <kbd className="inline-flex items-center justify-center w-5 h-5 text-[10px] bg-white/5 border border-white/10 rounded">↵</kbd>
                                open
                            </span>
                            <span className="flex items-center gap-1.5">
                                <kbd className="inline-flex items-center justify-center w-5 h-5 text-[10px] bg-white/5 border border-white/10 rounded">↑</kbd>
                                <kbd className="inline-flex items-center justify-center w-5 h-5 text-[10px] bg-white/5 border border-white/10 rounded -ml-0.5">↓</kbd>
                                navigate
                            </span>
                        </div>
                    </div>
                    
                </Command>
            </div>
        </div>
    );
}