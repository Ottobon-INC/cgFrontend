import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Atom, FileCode2, Loader2, AlertTriangle } from 'lucide-react';
import ExtractionCard from './ExtractionCard';
import type { ExtractionFile } from '@/types/extraction';

interface ExtractionWorkspaceProps {
    activeFile: ExtractionFile | null;
}

interface ParsedCard {
    name: string;
    type: string;
    dependencies: string;
    description: string;
    code: string;
    language: string;
}

function parseMarkdownToCards(markdown: string): ParsedCard[] {
    // Split on horizontal rules (---) to get individual card blocks
    const blocks = markdown.split(/\n---\n/).filter((b) => b.trim().length > 0);
    const cards: ParsedCard[] = [];

    for (const block of blocks) {
        const lines = block.trim().split('\n');

        let name = '';
        let type = '';
        let dependencies = '';
        let description = '';
        let code = '';
        let language = 'tsx';
        let inCodeBlock = false;
        const codeLines: string[] = [];

        for (const line of lines) {
            if (line.startsWith('### ') && !inCodeBlock) {
                name = line.replace('### ', '').trim();
            } else if (line.startsWith('**Type:**') && !inCodeBlock) {
                type = line.replace('**Type:**', '').trim();
            } else if (line.startsWith('**Dependencies:**') && !inCodeBlock) {
                dependencies = line.replace('**Dependencies:**', '').trim();
            } else if (line.startsWith('**Description:**') && !inCodeBlock) {
                description = line.replace('**Description:**', '').trim();
            } else if (line.startsWith('```') && !inCodeBlock) {
                inCodeBlock = true;
                const lang = line.replace('```', '').trim();
                if (lang) language = lang;
            } else if (line.startsWith('```') && inCodeBlock) {
                inCodeBlock = false;
            } else if (inCodeBlock) {
                codeLines.push(line);
            }
        }

        code = codeLines.join('\n');

        if (name && code) {
            cards.push({ name, type, dependencies, description, code, language });
        }
    }

    return cards;
}

export default function ExtractionWorkspace({ activeFile }: ExtractionWorkspaceProps) {
    const cards = useMemo(() => {
        if (!activeFile?.result) return [];
        return parseMarkdownToCards(activeFile.result);
    }, [activeFile?.result]);

    // Empty state - no file selected
    if (!activeFile) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: '16px',
                    padding: '48px',
                }}
            >
                <div
                    style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(37, 99, 235, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Atom size={28} strokeWidth={1.5} style={{ color: 'var(--ae-accent)' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p
                        style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: 'var(--ae-ink)',
                            margin: '0 0 6px',
                        }}
                    >
                        Atomic Extraction Workspace
                    </p>
                    <p
                        style={{
                            fontSize: '13px',
                            color: 'var(--ae-muted)',
                            margin: 0,
                            lineHeight: 1.5,
                            maxWidth: '320px',
                        }}
                    >
                        Upload source files and process them to see their atomic deconstruction here.
                    </p>
                </div>
            </div>
        );
    }

    // Processing state
    if (activeFile.status === 'processing') {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: '16px',
                    padding: '48px',
                }}
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                >
                    <Loader2 size={32} strokeWidth={1.5} style={{ color: 'var(--ae-accent)' }} />
                </motion.div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ae-ink)', margin: '0 0 4px' }}>
                        Deconstructing...
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--ae-muted)', margin: 0 }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {activeFile.name}
                        </span>{' '}
                        is being analyzed by the AI engine
                    </p>
                </div>

                {/* Skeleton cards */}
                <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            style={{
                                height: '80px',
                                borderRadius: '10px',
                                backgroundColor: 'var(--ae-border)',
                            }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (activeFile.status === 'error') {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: '12px',
                    padding: '48px',
                }}
            >
                <AlertTriangle size={32} strokeWidth={1.5} style={{ color: 'var(--ae-error)' }} />
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ae-ink)', margin: 0 }}>
                    Extraction Failed
                </p>
                <p
                    style={{
                        fontSize: '12px',
                        color: 'var(--ae-error)',
                        margin: 0,
                        fontFamily: "'JetBrains Mono', monospace",
                        backgroundColor: 'rgba(220, 38, 38, 0.06)',
                        padding: '8px 14px',
                        borderRadius: '6px',
                    }}
                >
                    {activeFile.error || 'Unknown error occurred'}
                </p>
            </div>
        );
    }

    // Ready state - not processed yet
    if (activeFile.status === 'ready') {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: '12px',
                    padding: '48px',
                }}
            >
                <FileCode2 size={32} strokeWidth={1.5} style={{ color: 'var(--ae-muted)' }} />
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ae-ink)', margin: 0 }}>
                    Ready to Process
                </p>
                <p style={{ fontSize: '12px', color: 'var(--ae-muted)', margin: 0 }}>
                    Click the play button on{' '}
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
                        {activeFile.name}
                    </span>{' '}
                    to start extraction
                </p>
            </div>
        );
    }

    // Done state — render cards
    return (
        <div style={{ padding: '20px 24px', overflowY: 'auto', height: '100%' }}>
            {/* Results Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                }}
            >
                <div>
                    <h2
                        style={{
                            fontSize: '16px',
                            fontWeight: 700,
                            color: 'var(--ae-ink)',
                            margin: '0 0 2px',
                            fontFamily: 'Georgia, serif',
                        }}
                    >
                        {activeFile.name}
                    </h2>
                    <p style={{ fontSize: '12px', color: 'var(--ae-muted)', margin: 0 }}>
                        {cards.length} atomic unit{cards.length !== 1 ? 's' : ''} extracted
                    </p>
                </div>
            </div>

            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {cards.map((card, i) => (
                    <ExtractionCard
                        key={`${card.name}-${i}`}
                        name={card.name}
                        type={card.type}
                        dependencies={card.dependencies}
                        description={card.description}
                        code={card.code}
                        language={card.language}
                        index={i}
                    />
                ))}
            </div>

            {cards.length === 0 && activeFile.result && (
                <div
                    style={{
                        padding: '24px',
                        textAlign: 'center',
                        color: 'var(--ae-muted)',
                        fontSize: '13px',
                    }}
                >
                    No atomic units could be parsed from the AI response.
                    <pre
                        style={{
                            marginTop: '16px',
                            textAlign: 'left',
                            fontSize: '11px',
                            padding: '16px',
                            backgroundColor: 'var(--ae-surface)',
                            borderRadius: '8px',
                            border: '1px solid var(--ae-border)',
                            overflow: 'auto',
                            maxHeight: '400px',
                            whiteSpace: 'pre-wrap',
                        }}
                    >
                        {activeFile.result}
                    </pre>
                </div>
            )}
        </div>
    );
}
