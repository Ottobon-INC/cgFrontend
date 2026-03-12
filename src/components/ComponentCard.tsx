'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import type { Component } from '@/types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const INTENT_DELAY = 400;
const EXPANDED_WIDTH = 640;
const EXPANDED_HEIGHT = 320;
const CODE_PREVIEW_LINES = 14;

interface ComponentCardProps {
    component: Component;
}

const SPRING = { type: 'spring', stiffness: 320, damping: 30, mass: 0.7 } as const;

// ─── Avatar Gradient Helper ───────────────────────────────────────────────────

const AVATAR_GRADIENTS = [
    'from-rose-500 to-orange-400',
    'from-blue-500 to-cyan-400',
    'from-emerald-500 to-teal-400',
    'from-purple-500 to-indigo-400',
    'from-pink-500 to-rose-400',
    'from-amber-500 to-yellow-400',
];

const getAvatarGradient = (name: string) => {
    if (!name) return AVATAR_GRADIENTS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const HeartIcon = ({ filled }: { filled: boolean }) => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
);

const CopyIcon = () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const ArrowIcon = () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

// ─── Syntax Highlighter ───────────────────────────────────────────────────────

function highlight(line: string): React.ReactNode[] {
    const segments: React.ReactNode[] = [];
    let remaining = line;
    let k = 0;

    const eat = (re: RegExp, cls: string) => {
        const m = remaining.match(re);
        if (!m || m.index === undefined) return false;
        if (m.index > 0) segments.push(<span key={k++}>{remaining.slice(0, m.index)}</span>);
        segments.push(<span key={k++} className={cls}>{m[0]}</span>);
        remaining = remaining.slice(m.index + m[0].length);
        return true;
    };

    while (remaining.length > 0) {
        if (/^\/\//.test(remaining)) { segments.push(<span key={k++} className="text-[#6a9955]">{remaining}</span>); break; }
        if (eat(/^<\/?[A-Z][A-Za-z0-9]*|^<\/?[a-z][a-z0-9-]*/, 'text-[#4ec9b0]')) continue;
        if (eat(/^(['"])(?:(?!\1).|\\.)*\1/, 'text-[#ce9178]')) continue;
        if (eat(/^`[^`]*`/, 'text-[#ce9178]')) continue;
        if (eat(/^\b(import|export|from|const|let|var|function|return|if|else|async|await|type|interface|extends|default|class|new|true|false|null|undefined|void|=>)\b/, 'text-[#569cd6]')) continue;
        if (eat(/^\b(React|useState|useEffect|useRef|useCallback|useMemo|Props)\b/, 'text-[#9cdcfe]')) continue;
        if (eat(/^\b\d+(\.\d+)?\b/, 'text-[#b5cea8]')) continue;
        if (eat(/^[{};:,()[\]<>=+!&|?./%]/, 'text-[#808080]')) continue;
        segments.push(<span key={k++}>{remaining[0]}</span>);
        remaining = remaining.slice(1);
    }
    return segments;
}

function CodePreview({ code }: { code: string }) {
    const lines = code.split('\n');

    return (
        <div 
            className="flex flex-col h-full rounded-lg overflow-hidden ring-1 ring-inset ring-white/[0.08] bg-black/40 backdrop-blur-md cursor-auto"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.02] border-b border-white/[0.06] shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                <span className="ml-2 text-[10px] text-neutral-500 font-mono">Component.tsx</span>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-auto relative">
                <pre className="h-full text-[10.5px] leading-[1.65] pb-4"
                    style={{ fontFamily: "'JetBrains Mono','Fira Code','Consolas',monospace" }}>
                    <table className="w-full border-collapse">
                        <tbody>
                            {lines.map((line, i) => (
                                <tr key={i} className="group hover:bg-white/[0.05]">
                                    <td className="select-none text-right pr-3 pl-2 text-neutral-600 group-hover:text-neutral-400 transition-colors"
                                        style={{ minWidth: '32px', verticalAlign: 'top', paddingTop: '1px' }}>
                                        {i + 1}
                                    </td>
                                    <td className="pr-3 text-neutral-300 whitespace-pre"
                                        style={{ verticalAlign: 'top', paddingTop: '1px' }}>
                                        {highlight(line)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </pre>
            </div>
        </div>
    );
}

// ─── Right panel: component metadata ─────────────────────────────────────────
function RightPanel({ component }: { component: Component }) {
    return (
        <div 
            className="flex flex-col gap-3 shrink-0 pr-0.5 cursor-auto"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Description */}
            {component.description && (
                <div>
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1">About</p>
                    <p className="text-[11px] text-neutral-200 leading-relaxed line-clamp-4">
                        {component.description}
                    </p>
                </div>
            )}

            {/* Stack */}
            <div>
                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Stack</p>
                <span className="inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-300 text-[10px] font-medium uppercase tracking-wide">
                    {component.stack ?? 'React · TS'}
                </span>
            </div>

            {/* Author */}
            {component.author_name && (
                <div>
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Author</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${getAvatarGradient(component.author_name)} flex items-center justify-center text-[9px] font-bold text-white shrink-0 shadow-sm border border-white/10`}>
                            {component.author_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[11px] text-neutral-200 font-medium truncate">{component.author_name}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Wide expanded overlay ────────────────────────────────────────────────────
function ExpandedCard({
    component, likes, liked, copied, expandUp,
    onLike, onCopy, onNavigate, rect, originX, onMouseEnter, onMouseLeave,
}: {
    component: Component; likes: number; liked: boolean; copied: boolean; expandUp: boolean;
    onLike: (e: React.MouseEvent) => void; onCopy: (e: React.MouseEvent) => void; onNavigate: () => void;
    rect: DOMRect; originX: number; onMouseEnter: () => void; onMouseLeave: () => void;
}) {
    const topStyle = expandUp
        ? rect.top + window.scrollY - EXPANDED_HEIGHT + rect.height + 8
        : rect.top + window.scrollY - 8;
    const yFrom = expandUp ? -6 : 6;

    const [likers, setLikers] = useState<string[]>([]);
    const [tipVisible, setTipVisible] = useState(false);
    const [tipLoading, setTipLoading] = useState(false);
    const tipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleLikeMouseEnter = () => {
        tipTimer.current = setTimeout(async () => {
            setTipVisible(true);
            if (likes === 0) return;
            setTipLoading(true);
            try {
                const res = await fetch(`${API_URL}/api/components/${component.id}/likers`);
                const json = await res.json();
                if (json.success) setLikers(json.data);
            } catch { /* ignore */ }
            finally { setTipLoading(false); }
        }, 300);
    };

    const handleLikeMouseLeave = () => {
        if (tipTimer.current) clearTimeout(tipTimer.current);
        setTipVisible(false);
        setLikers([]);
    };

    return (
        <motion.div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onNavigate}
            className="fixed z-[9999] rounded-2xl ring-1 ring-inset ring-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5),0_32px_80px_rgba(0,0,0,0.8)] w-[calc(100vw-32px)] md:w-[640px] group/expanded bg-[#111] cursor-pointer"
            style={{ top: topStyle, left: originX + window.scrollX }}
            initial={{ opacity: 0, scale: 0.95, y: yFrom }}
            animate={{ opacity: 1, scale: 1.02, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: yFrom, transition: { duration: 0.14 } }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
            <div className="relative z-10 flex flex-col h-full rounded-2xl">
                {/* Top bar */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-white/5 rounded-t-2xl">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-white tracking-tight truncate drop-shadow-md">
                            {component.title}
                        </h3>
                        {component.category && component.category !== 'uncategorized' && (
                            <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-300 text-[10px] font-medium capitalize tracking-wide">
                                {component.category.replace('-', ' ')}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="relative" onMouseEnter={handleLikeMouseEnter} onMouseLeave={handleLikeMouseLeave}>
                            <button onClick={onLike}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border transition-all duration-200 shadow-lg ${liked ? 'text-rose-400 bg-rose-500/20 border-rose-500/40'
                                    : 'text-neutral-300 bg-black/40 border-white/10 hover:border-white/30 hover:bg-black/60'
                                    }`}>
                                <HeartIcon filled={liked} /><span>{likes}</span>
                            </button>

                            <AnimatePresence>
                                {tipVisible && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, x: '-50%' }}
                                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                                        exit={{ opacity: 0, y: 5, x: '-50%' }}
                                        className="absolute bottom-full left-1/2 mb-3 z-[10001]"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="bg-[#111] border border-white/10 rounded-xl shadow-2xl px-4 py-3 min-w-[160px] backdrop-blur-xl relative">
                                            {tipLoading ? (
                                                <div className="flex items-center justify-center py-1">
                                                    <svg className="w-4 h-4 animate-spin text-neutral-400" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                </div>
                                            ) : likers.length === 0 ? (
                                                <p className="text-neutral-500 text-[11px] text-center font-medium">No likes yet</p>
                                            ) : (
                                                <>
                                                    <p className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2.5">Liked by</p>
                                                    <ul className="space-y-2">
                                                        {likers.slice(0, 5).map((name, i) => (
                                                            <li key={i} className="flex items-center gap-2.5">
                                                                <div className={`w-5 h-5 shrink-0 rounded-full bg-gradient-to-tr ${getAvatarGradient(name)} flex items-center justify-center text-[10px] font-black text-white`}>
                                                                    {name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="text-[12px] text-neutral-200 font-medium truncate">{name}</span>
                                                            </li>
                                                        ))}
                                                        {likers.length > 5 && (
                                                            <li className="text-[10px] text-neutral-500 pl-7 font-medium">+{likers.length - 5} others</li>
                                                        )}
                                                    </ul>
                                                </>
                                            )}
                                        </div>
                                        <svg className="absolute left-1/2 -translate-x-1/2 top-full w-3 h-1.5 text-white/10" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 6L0 0H12L6 6Z" fill="#111" />
                                            <path d="M6 6L0 0H12L6 6Z" stroke="currentColor" strokeWidth="1" />
                                        </svg>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button onClick={onCopy}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border transition-all duration-200 shadow-lg ${copied ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40'
                                : 'text-neutral-300 bg-black/40 border-white/10 hover:border-white/30 hover:bg-black/60'
                                }`}>
                            {copied ? <CheckIcon /> : <CopyIcon />}<span>{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onNavigate(); }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black bg-white text-black hover:bg-neutral-200 transition-all duration-200 shadow-lg shadow-white/10">
                            View <ArrowIcon />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="relative flex flex-col md:flex-row md:h-[280px]">
                    {/* Code Preview - Left Side */}
                    <div className="flex-1 min-w-0 p-4 md:pr-2 h-[210px] md:h-auto">
                        <CodePreview code={component.raw_code} />
                    </div>
                    
                    <div className="hidden md:block w-px bg-white/10 shrink-0 my-4" />
                    
                    {/* Image & Metadata - Right Side */}
                    <div className="md:w-[42%] shrink-0 p-4 md:pl-3 max-h-[200px] md:max-h-none overflow-y-auto flex flex-col gap-4 rounded-br-2xl custom-scrollbar">
                        {component.image_url && (
                            <div className="w-full h-36 shrink-0 rounded-lg overflow-hidden border border-white/5 bg-black/50 shadow-inner flex items-center justify-center p-2 cursor-auto" onClick={(e) => e.stopPropagation()}>
                                <img src={component.image_url} alt={component.title} className="max-w-full max-h-full object-contain drop-shadow-lg" />
                            </div>
                        )}
                        <RightPanel component={component} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Normal card ─────────────────────────────────────────────────────────────
function CardBody({ component, liked, likes, copied, onCopy }: { component: Component; liked: boolean; likes: number; copied: boolean; onCopy: (e: React.MouseEvent) => void }) {
    return (
        <div className="group rounded-2xl overflow-hidden flex flex-col bg-[#111] bg-gradient-to-b from-white/[0.02] to-transparent ring-1 ring-inset ring-white/10 transition-all duration-300 hover:ring-white/20 hover:shadow-2xl hover:shadow-neutral-900/50 hover:-translate-y-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
            {/* Thumbnail */}
            <div className="h-44 w-full bg-[#0a0a0a] flex items-center justify-center border-b border-white/5 overflow-hidden relative">
                {component.image_url ? (
                    <>
                        <img src={component.image_url} alt={component.title} draggable={false}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 opacity-20">
                        <svg className="w-10 h-10 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M12 2L2 12l10 10 10-10L12 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start gap-3 mb-2 flex-wrap sm:flex-nowrap">
                    <h3 className="text-[15px] font-bold text-white tracking-tight truncate max-w-full group-hover:text-neutral-200 transition-colors">
                        {component.title}
                    </h3>
                    {component.category && component.category !== 'uncategorized' && (
                        <span className="shrink-0 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-300 text-[9px] font-semibold uppercase tracking-wider shadow-sm">
                            {component.category.replace('-', ' ')}
                        </span>
                    )}
                </div>

                <p className="text-[13px] text-neutral-300 leading-relaxed line-clamp-2 mb-6 font-medium">
                    {component.description}
                </p>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-y-2 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-4 text-neutral-400 text-xs font-bold shrink-0">
                        <button className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-rose-400' : 'hover:text-white'}`}>
                            <HeartIcon filled={liked} />
                            <span className="tabular-nums">{likes}</span>
                        </button>
                        <button onClick={onCopy} className={`flex items-center gap-1.5 transition-colors ${copied ? 'text-emerald-400' : 'hover:text-white'}`}>
                            {copied ? <CheckIcon /> : <CopyIcon />}
                            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                    </div>
                    
                    {/* Premium Author Tag with Dynamic Avatar */}
                    <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 shrink-0 rounded-full bg-gradient-to-tr ${getAvatarGradient(component.author_name || '')} flex items-center justify-center text-[9px] font-black text-white shadow-sm ring-1 ring-inset ring-black/20`}>
                            {(component.author_name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[11px] text-neutral-200 font-medium truncate max-w-[90px]">
                            {component.author_name ?? 'Community'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main ComponentCard ───────────────────────────────────────────────────────
export function ComponentCard({ component }: ComponentCardProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const session = user ? { user } : null;
    const userId = (session?.user as { id?: string })?.id;

    const [likes, setLikes] = useState(component.likes);
    const [liked, setLiked] = useState(!!component.user_liked);
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const [originX, setOriginX] = useState(0);
    const [expandUp, setExpandUp] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const startExpand = useCallback(() => {
        if (!wrapperRef.current) return;
        const r = wrapperRef.current.getBoundingClientRect();
        setRect(r);

        const isMobile = window.innerWidth < 768;
        const width = isMobile ? window.innerWidth - 32 : EXPANDED_WIDTH;
        const heightAssumed = isMobile ? 420 : 300;

        const ideal = r.left + r.width / 2 - width / 2;
        setOriginX(Math.min(Math.max(ideal, 16), window.innerWidth - width - 16));

        const spaceBelow = window.innerHeight - r.bottom;
        setExpandUp(spaceBelow < heightAssumed && r.top > heightAssumed);

        setIsExpanded(true);
    }, []);

    const handleMouseEnter = useCallback(() => {
        timerRef.current = setTimeout(startExpand, INTENT_DELAY);
    }, [startExpand]);

    const handleMouseLeave = useCallback(() => {
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
        setIsExpanded(false);
    }, []);

    useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (!userId) return;
        const wasLiked = liked;
        setLiked(!wasLiked);
        setLikes(p => wasLiked ? p - 1 : p + 1);
        try {
            const res = await fetch(`${API_URL}/api/components/${component.id}/like`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId }),
            });
            const json = await res.json();
            if (json.success) { setLiked(json.data.liked); setLikes(json.data.likes); }
            else { setLiked(wasLiked); setLikes(p => wasLiked ? p + 1 : p - 1); }
        } catch { setLiked(wasLiked); setLikes(p => wasLiked ? p + 1 : p - 1); }
    };

    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(component.raw_code);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = component.raw_code;
                textArea.style.position = "absolute";
                textArea.style.left = "-999999px";
                document.body.prepend(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                } catch (error) {
                    console.error('Fallback copy failed', error);
                } finally {
                    textArea.remove();
                }
            }
            setCopied(true); setTimeout(() => setCopied(false), 2000);
        } catch { /* ignore */ }
    };

    return (
        <>
            <Link
                to={`/components/${component.id}`}
                className={`block transition-all duration-300 ${isExpanded ? 'opacity-40 scale-[0.98]' : 'opacity-100 scale-100'}`}
                tabIndex={isExpanded ? -1 : 0}
            >
                <div ref={wrapperRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <CardBody component={component} liked={liked} likes={likes} copied={copied} onCopy={handleCopy} />
                </div>
            </Link>

            <AnimatePresence>
                {isExpanded && rect && (
                    <ExpandedCard
                        component={component} likes={likes} liked={liked} copied={copied} expandUp={expandUp}
                        onLike={handleLike} onCopy={handleCopy}
                        onNavigate={() => navigate(`/components/${component.id}`)}
                        rect={rect} originX={originX}
                        onMouseEnter={() => { if (timerRef.current) clearTimeout(timerRef.current); setIsExpanded(true); }}
                        onMouseLeave={handleMouseLeave}
                    />
                )}
            </AnimatePresence>
        </>
    );
}