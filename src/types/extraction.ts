export type FileStatus = 'ready' | 'processing' | 'done' | 'error';

export interface ExtractionFile {
    id: string;
    name: string;
    content: string;
    status: FileStatus;
    result?: string;
    error?: string;
}
