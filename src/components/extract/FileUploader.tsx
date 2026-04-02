import { useCallback, useState, useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ALLOWED_EXTENSIONS = ['.tsx', '.jsx', '.ts', '.js', '.html', '.css', '.vue', '.svelte'];
const MAX_SIZE = 1 * 1024 * 1024; // 1MB

interface FileUploaderProps {
    onFilesAdded: (files: File[]) => void;
}

export default function FileUploader({ onFilesAdded }: FileUploaderProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateAndAdd = useCallback(
        (fileList: FileList | File[]) => {
            const valid: File[] = [];
            const files = Array.from(fileList);

            for (const file of files) {
                const ext = '.' + file.name.split('.').pop()?.toLowerCase();
                if (!ALLOWED_EXTENSIONS.includes(ext)) {
                    setError(`Unsupported: ${file.name} (${ext})`);
                    setTimeout(() => setError(null), 3000);
                    continue;
                }
                if (file.size > MAX_SIZE) {
                    setError(`Too large: ${file.name} (max 1MB)`);
                    setTimeout(() => setError(null), 3000);
                    continue;
                }
                valid.push(file);
            }

            if (valid.length > 0) {
                onFilesAdded(valid);
            }
        },
        [onFilesAdded]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files.length > 0) {
                validateAndAdd(e.dataTransfer.files);
            }
        },
        [validateAndAdd]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleClick = () => inputRef.current?.click();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndAdd(e.target.files);
            e.target.value = '';
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <motion.div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                animate={{
                    borderColor: isDragOver ? 'var(--ae-accent)' : 'var(--ae-border)',
                    backgroundColor: isDragOver ? 'rgba(37, 99, 235, 0.06)' : 'var(--ae-surface)',
                    scale: isDragOver ? 1.01 : 1,
                }}
                transition={{ duration: 0.15 }}
                style={{
                    border: '2px dashed var(--ae-border)',
                    borderRadius: '10px',
                    padding: '24px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'center',
                }}
            >
                <Upload
                    size={28}
                    strokeWidth={1.5}
                    style={{ color: isDragOver ? 'var(--ae-accent)' : 'var(--ae-muted)' }}
                />
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ae-ink)', margin: 0 }}>
                    Drop files here
                </p>
                <p style={{ fontSize: '11px', color: 'var(--ae-muted)', margin: 0 }}>
                    or click to browse · .tsx .jsx .ts .js .html .css
                </p>
            </motion.div>

            <input
                ref={inputRef}
                type="file"
                multiple
                accept={ALLOWED_EXTENSIONS.join(',')}
                onChange={handleInputChange}
                style={{ display: 'none' }}
            />

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        style={{
                            position: 'absolute',
                            bottom: '-32px',
                            left: 0,
                            right: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11px',
                            color: 'var(--ae-error)',
                            fontWeight: 500,
                        }}
                    >
                        <AlertCircle size={13} />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
