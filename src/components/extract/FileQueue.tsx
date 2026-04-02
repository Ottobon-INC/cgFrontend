import { motion, AnimatePresence } from 'framer-motion';
import { FileCode2, Play, Check, Loader2, AlertCircle, X, Zap } from 'lucide-react';
import type { ExtractionFile } from '@/types/extraction';

interface FileQueueProps {
    files: ExtractionFile[];
    activeFileId: string | null;
    onProcess: (id: string) => void;
    onProcessAll: () => void;
    onSelect: (id: string) => void;
    onRemove: (id: string) => void;
}

const STATUS_CONFIG = {
    ready: {
        icon: FileCode2,
        badge: 'Ready',
        badgeBg: 'var(--ae-border)',
        badgeColor: 'var(--ae-muted)',
    },
    processing: {
        icon: Loader2,
        badge: 'Processing',
        badgeBg: 'rgba(37, 99, 235, 0.12)',
        badgeColor: 'var(--ae-accent)',
    },
    done: {
        icon: Check,
        badge: 'Deconstructed',
        badgeBg: 'rgba(22, 163, 74, 0.12)',
        badgeColor: 'var(--ae-success)',
    },
    error: {
        icon: AlertCircle,
        badge: 'Error',
        badgeBg: 'rgba(220, 38, 38, 0.12)',
        badgeColor: 'var(--ae-error)',
    },
};

export default function FileQueue({
    files,
    activeFileId,
    onProcess,
    onProcessAll,
    onSelect,
    onRemove,
}: FileQueueProps) {
    const readyCount = files.filter((f) => f.status === 'ready').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Process All Button */}
            {files.length > 0 && (
                <button
                    onClick={onProcessAll}
                    disabled={readyCount === 0}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        fontFamily: 'Inter, system-ui, sans-serif',
                        color: readyCount > 0 ? '#fff' : 'var(--ae-muted)',
                        backgroundColor: readyCount > 0 ? 'var(--ae-ink)' : 'var(--ae-border)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: readyCount > 0 ? 'pointer' : 'not-allowed',
                        transition: 'all 0.15s ease',
                        letterSpacing: '0.02em',
                    }}
                >
                    <Zap size={13} />
                    Process All ({readyCount})
                </button>
            )}

            {/* File List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <AnimatePresence mode="popLayout">
                    {files.map((file) => {
                        const config = STATUS_CONFIG[file.status];
                        const Icon = config.icon;
                        const isActive = file.id === activeFileId;
                        const isClickable = file.status === 'done';

                        return (
                            <motion.div
                                key={file.id}
                                layout
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8, height: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => isClickable && onSelect(file.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 10px',
                                    borderRadius: '8px',
                                    cursor: isClickable ? 'pointer' : 'default',
                                    backgroundColor: isActive
                                        ? 'rgba(37, 99, 235, 0.08)'
                                        : 'transparent',
                                    border: isActive
                                        ? '1px solid rgba(37, 99, 235, 0.2)'
                                        : '1px solid transparent',
                                    transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive)
                                        e.currentTarget.style.backgroundColor =
                                            'rgba(0,0,0,0.03)';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive)
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                {/* Status Icon */}
                                <Icon
                                    size={15}
                                    style={{
                                        color: config.badgeColor,
                                        flexShrink: 0,
                                        ...(file.status === 'processing'
                                            ? { animation: 'spin 1s linear infinite' }
                                            : {}),
                                    }}
                                />

                                {/* Filename */}
                                <span
                                    style={{
                                        flex: 1,
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        color: 'var(--ae-ink)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        fontFamily: "'JetBrains Mono', monospace",
                                    }}
                                >
                                    {file.name}
                                </span>

                                {/* Status Badge */}
                                <span
                                    style={{
                                        fontSize: '10px',
                                        fontWeight: 600,
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        backgroundColor: config.badgeBg,
                                        color: config.badgeColor,
                                        letterSpacing: '0.02em',
                                        flexShrink: 0,
                                    }}
                                >
                                    {config.badge}
                                </span>

                                {/* Action Buttons */}
                                {file.status === 'ready' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onProcess(file.id);
                                        }}
                                        title="Process this file"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '3px',
                                            borderRadius: '4px',
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            cursor: 'pointer',
                                            color: 'var(--ae-accent)',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Play size={13} fill="currentColor" />
                                    </button>
                                )}

                                {/* Remove Button */}
                                {file.status !== 'processing' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemove(file.id);
                                        }}
                                        title="Remove file"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '3px',
                                            borderRadius: '4px',
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            cursor: 'pointer',
                                            color: 'var(--ae-muted)',
                                            opacity: 0.5,
                                            flexShrink: 0,
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.opacity = '1';
                                            e.currentTarget.style.color = 'var(--ae-error)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.opacity = '0.5';
                                            e.currentTarget.style.color = 'var(--ae-muted)';
                                        }}
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {files.length === 0 && (
                <p
                    style={{
                        fontSize: '11px',
                        color: 'var(--ae-muted)',
                        textAlign: 'center',
                        padding: '12px 0',
                        margin: 0,
                    }}
                >
                    No files in queue
                </p>
            )}
        </div>
    );
}
