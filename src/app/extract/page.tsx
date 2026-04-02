import { Atom } from 'lucide-react';
import { useExtraction } from '@/hooks/useExtraction';
import FileUploader from '@/components/extract/FileUploader';
import FileQueue from '@/components/extract/FileQueue';
import ExtractionWorkspace from '@/components/extract/ExtractionWorkspace';
import './extract.css';

export default function ExtractPage() {
    const {
        files,
        activeFileId,
        activeFile,
        addFiles,
        removeFile,
        processFile,
        processAll,
        setActiveFile,
    } = useExtraction();

    return (
        <div className="extract-engine">
            {/* Header */}
            <div className="ae-header">
                <div
                    style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(37, 99, 235, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <Atom size={18} strokeWidth={1.8} style={{ color: 'var(--ae-accent)' }} />
                </div>
                <div>
                    <h1>Atomic Extraction Engine</h1>
                    <p className="ae-subtitle">
                        Deconstruct monolithic code into reusable atomic units
                    </p>
                </div>
            </div>

            {/* Layout */}
            <div
                className="ae-layout"
                style={{
                    display: 'flex',
                    height: 'calc(100vh - 65px)',
                }}
            >
                {/* Sidebar */}
                <div className="ae-sidebar">
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--ae-border)' }}>
                        <FileUploader onFilesAdded={addFiles} />
                    </div>
                    <div style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
                        <p
                            style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                color: 'var(--ae-muted)',
                                margin: '0 0 8px 4px',
                            }}
                        >
                            File Queue
                        </p>
                        <FileQueue
                            files={files}
                            activeFileId={activeFileId}
                            onProcess={processFile}
                            onProcessAll={processAll}
                            onSelect={setActiveFile}
                            onRemove={removeFile}
                        />
                    </div>
                </div>

                {/* Workspace */}
                <div className="ae-workspace">
                    <ExtractionWorkspace activeFile={activeFile} />
                </div>
            </div>
        </div>
    );
}
