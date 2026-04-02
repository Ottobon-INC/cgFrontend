import { useState, useCallback } from 'react';
import type { ExtractionFile } from '@/types/extraction';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function useExtraction() {
    const [files, setFiles] = useState<ExtractionFile[]>([]);
    const [activeFileId, setActiveFileId] = useState<string | null>(null);

    const activeFile = files.find((f) => f.id === activeFileId) ?? null;

    const addFiles = useCallback((fileList: File[]) => {
        fileList.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                const newFile: ExtractionFile = {
                    id: crypto.randomUUID(),
                    name: file.name,
                    content,
                    status: 'ready',
                };
                setFiles((prev) => [...prev, newFile]);
            };
            reader.readAsText(file);
        });
    }, []);

    const removeFile = useCallback((id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        setActiveFileId((prev) => (prev === id ? null : prev));
    }, []);

    const processFile = useCallback(async (id: string) => {
        setFiles((prev) =>
            prev.map((f) => (f.id === id ? { ...f, status: 'processing' as const } : f))
        );

        const file = files.find((f) => f.id === id);
        if (!file) return;

        try {
            const res = await fetch(`${API_URL}/api/extract`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: file.name, content: file.content }),
            });

            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Extraction failed');
            }

            setFiles((prev) =>
                prev.map((f) =>
                    f.id === id
                        ? { ...f, status: 'done' as const, result: json.data.markdown }
                        : f
                )
            );
            setActiveFileId(id);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === id ? { ...f, status: 'error' as const, error: message } : f
                )
            );
        }
    }, [files]);

    const processAll = useCallback(async () => {
        const readyFiles = files.filter((f) => f.status === 'ready');
        for (const file of readyFiles) {
            await processFile(file.id);
        }
    }, [files, processFile]);

    return {
        files,
        activeFileId,
        activeFile,
        addFiles,
        removeFile,
        processFile,
        processAll,
        setActiveFile: setActiveFileId,
    };
}
