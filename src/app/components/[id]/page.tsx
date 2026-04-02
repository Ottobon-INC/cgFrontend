import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { LivePlayground } from '@/components/LivePlayground';
import { CopyCodeButton } from '@/components/CopyCodeButton';
import { LikeButton } from '@/components/LikeButton';
import type { Component } from '@/types';

const STACK_LABELS: Record<string, string> = {
    'vite-react-ts': 'React · TS',
    'vite-react': 'React · JS',
    'vue': 'Vue 3',
    'svelte': 'Svelte',
    'angular': 'Angular',
    'static': 'HTML / CSS',
    'vanilla': 'Vanilla JS',
};

export default function ComponentPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [component, setComponent] = useState<Component | null>(null);
    const [loading, setLoading] = useState(true);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchComponent = async () => {
            try {
                const data = await api.components.get(id);
                setComponent(data);
            } catch (err) {
                console.error(err);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchComponent();
    }, [id, navigate]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-neutral-500">Loading...</div>;
    }

    if (!component) return null;

    const stackLabel = STACK_LABELS[component.stack] ?? component.stack;

    return (
        <div className="min-h-screen">
            {/* ── Slim top bar ─────────────────────────────────────────── */}
            <div className="border-b border-white/[0.06] bg-neutral-950/60 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-[1600px] mx-auto px-4 md:px-10 h-12 flex items-center justify-between">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs font-medium">
                        <a href="/" className="text-neutral-500 hover:text-white transition-colors">Components</a>
                        <span className="text-neutral-700">/</span>
                        <span className="text-neutral-200">{component.title}</span>
                    </div>
                    {/* Right pills */}
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 text-[11px] font-semibold ring-1 ring-inset ring-white/10 hidden sm:inline-block">
                            {stackLabel}
                        </span>
                        {component.category && component.category !== 'uncategorized' && (
                            <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[11px] font-semibold ring-1 ring-inset ring-indigo-500/20 capitalize">
                                {component.category.replace('-', ' ')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Main two-column body ──────────────────────────────────── */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-10 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">

                    {/* ── LEFT: Code editor ──────────────────────────────── */}
                    <div className="min-w-0 order-2 lg:order-1">
                        {/* Section label + copy button */}
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">Source</span>
                            <div className="flex-1 h-px bg-white/[0.05]" />
                            <CopyCodeButton code={component.raw_code} />
                        </div>
                        <LivePlayground component={component} />
                    </div>

                    {/* ── RIGHT: Meta + image ─────────────────────────────── */}
                    <div className="flex flex-col gap-6 order-1 lg:order-2">

                        {/* Title / details card */}
                        <div className="rounded-xl bg-neutral-900/50 ring-1 ring-inset ring-white/[0.08] p-5 space-y-5">
                            <div>
                                <h1 className="text-white text-xl font-bold tracking-tight mb-5">{component.title}</h1>
                                
                                <div className="space-y-4">
                                    {component.functional_purpose && (
                                        <div>
                                            <h3 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Functional Purpose</h3>
                                            <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">{component.functional_purpose}</p>
                                        </div>
                                    )}

                                    {component.pre_requisites && (
                                        <div>
                                            <h3 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Pre-Requisits</h3>
                                            <p className="text-neutral-400 text-[13px] leading-relaxed whitespace-pre-wrap">{component.pre_requisites}</p>
                                        </div>
                                    )}

                                    {component.component_constraint && (
                                        <div>
                                            <h3 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Constraints</h3>
                                            <p className="text-neutral-400 text-[13px] leading-relaxed whitespace-pre-wrap">{component.component_constraint}</p>
                                        </div>
                                    )}

                                    {component.technical_implementation && (
                                        <div>
                                            <h3 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Implementation</h3>
                                            <p className="text-neutral-400 text-[13px] leading-relaxed whitespace-pre-wrap">{component.technical_implementation}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Author + likes */}
                            <div className="flex items-center gap-4 pt-4 border-t border-white/[0.06]">
                                <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                                    </svg>
                                    {component.author_name ?? 'Unknown'}
                                </span>
                                <LikeButton componentId={component.id} initialLikes={component.likes} />
                            </div>
                        </div>

                        {/* Image preview card — only when image exists */}
                        {component.image_url && (
                            <div className="rounded-xl overflow-hidden ring-1 ring-inset ring-white/[0.08] bg-neutral-900/50 group cursor-pointer" onClick={() => setIsImageModalOpen(true)}>
                                <div className="px-4 py-2.5 border-b border-white/[0.05] flex items-center justify-between">
                                    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Preview</span>
                                    <svg className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                </div>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={component.image_url}
                                    alt={`Preview of ${component.title}`}
                                    className="w-full object-cover transition-opacity hover:opacity-90"
                                    style={{ maxHeight: '320px', objectFit: 'contain', background: '#0a0a0a' }}
                                />
                            </div>
                        )}

                        {/* No image placeholder */}
                        {!component.image_url && (
                            <div className="rounded-xl ring-1 ring-inset ring-white/[0.06] bg-neutral-900/30 flex flex-col items-center justify-center gap-2 py-12">
                                <svg className="w-8 h-8 text-neutral-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                                </svg>
                                <p className="text-neutral-600 text-xs font-medium">No preview image</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for Image Popout */}
            <AnimatePresence>
                {isImageModalOpen && component.image_url && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsImageModalOpen(false)}
                        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                    >
                        <motion.button
                            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
                            onClick={(e) => { e.stopPropagation(); setIsImageModalOpen(false); }}
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </motion.button>
                        <motion.img
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                            src={component.image_url}
                            alt={`Preview of ${component.title}`}
                            className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl ring-1 ring-white/10 object-contain"
                            style={{ background: '#0a0a0a' }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
