import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ChevronDown, ChevronRight, Database, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
    component: { bg: 'rgba(37, 99, 235, 0.1)', color: '#2563EB' },
    hook: { bg: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED' },
    utility: { bg: 'rgba(217, 119, 6, 0.1)', color: '#D97706' },
    layout: { bg: 'rgba(22, 163, 74, 0.1)', color: '#16A34A' },
    'styled html': { bg: 'rgba(219, 39, 119, 0.1)', color: '#DB2777' },
};

interface ExtractionCardProps {
    name: string;
    type: string;
    dependencies: string;
    description: string;
    code: string;
    language: string;
    index: number;
}

export default function ExtractionCard({
    name,
    type,
    dependencies,
    description,
    code,
    language,
    index,
}: ExtractionCardProps) {
    const [copied, setCopied] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const { user } = useAuth();

    const typeKey = type.toLowerCase();
    const typeColor = TYPE_COLORS[typeKey] ?? { bg: 'rgba(0,0,0,0.06)', color: 'var(--ae-muted)' };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
            const ta = document.createElement('textarea');
            ta.value = code;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleSave = async () => {
        if (!user) {
            alert('You must be logged in to save this component.');
            return;
        }

        setSaving(true);
        try {
            const finalDescription = dependencies && dependencies.toLowerCase() !== 'none'
                ? `${description || `Extracted atomic ${type}`}\n\n**Dependencies:** ${dependencies}`
                : (description || `Extracted atomic ${type}`);

            const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
            const res = await fetch(`${API_URL}/api/components`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: name,
                    description: finalDescription,
                    raw_code: code,
                    author_id: user.id,
                    stack: 'vite-react-ts',
                    category: typeKey,
                }),
            });

            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to save component');
            }

            setSaved(true);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            style={{
                backgroundColor: 'var(--ae-surface)',
                border: '1px solid var(--ae-border)',
                borderRadius: '10px',
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderBottom: collapsed ? 'none' : '1px solid var(--ae-border)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    {/* Collapse Toggle */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                            color: 'var(--ae-muted)',
                            flexShrink: 0,
                        }}
                    >
                        {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {/* Name */}
                    <span
                        style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'var(--ae-ink)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {name}
                    </span>

                    {/* Type Badge */}
                    <span
                        style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            padding: '3px 8px',
                            borderRadius: '5px',
                            backgroundColor: typeColor.bg,
                            color: typeColor.color,
                            flexShrink: 0,
                        }}
                    >
                        {type}
                    </span>

                    {/* Dependencies */}
                    {dependencies && dependencies.toLowerCase() !== 'none' && (
                        <span
                            style={{
                                fontSize: '10px',
                                color: 'var(--ae-muted)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {dependencies}
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving || saved}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 500,
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--ae-border)',
                            backgroundColor: saved ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                            color: saved ? 'var(--ae-accent)' : 'var(--ae-muted)',
                            cursor: (saving || saved) ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s ease',
                            flexShrink: 0,
                            fontFamily: 'Inter, system-ui, sans-serif',
                        }}
                    >
                        {saving ? (
                            <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                        ) : saved ? (
                            <Check size={12} />
                        ) : (
                            <Database size={12} />
                        )}
                        {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
                    </button>

                    {/* Copy Button */}
                    <button
                        onClick={handleCopy}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 500,
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--ae-border)',
                            backgroundColor: copied ? 'rgba(22, 163, 74, 0.08)' : 'transparent',
                            color: copied ? 'var(--ae-success)' : 'var(--ae-muted)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            flexShrink: 0,
                            fontFamily: 'Inter, system-ui, sans-serif',
                        }}
                    >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
            </div>

            {/* Body */}
            {!collapsed && (
                <div>
                    {/* Description */}
                    <p
                        style={{
                            fontSize: '12px',
                            color: 'var(--ae-muted)',
                            padding: '10px 16px 0',
                            margin: 0,
                            lineHeight: 1.5,
                        }}
                    >
                        {description}
                    </p>

                    {/* Code Block */}
                    <div style={{ padding: '10px 12px 12px', fontSize: '12px' }}>
                        <SyntaxHighlighter
                            language={language || 'tsx'}
                            style={oneLight}
                            customStyle={{
                                margin: 0,
                                borderRadius: '8px',
                                border: '1px solid var(--ae-border)',
                                fontSize: '12px',
                                lineHeight: '1.6',
                            }}
                            showLineNumbers
                            lineNumberStyle={{
                                color: '#ccc',
                                fontSize: '10px',
                                paddingRight: '12px',
                                minWidth: '2.5em',
                            }}
                        >
                            {code}
                        </SyntaxHighlighter>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
