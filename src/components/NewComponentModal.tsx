'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import type { SandpackTemplate } from '@/types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const STACKS: { id: SandpackTemplate; label: string; icon: string; color: string; activeRing: string }[] = [
    { id: 'vite-react-ts', label: 'React · TS', icon: '⚛', color: 'text-sky-400', activeRing: 'ring-sky-500/50 border-sky-500/50 bg-sky-500/10' },
    { id: 'vite-react', label: 'React · JS', icon: '⚛', color: 'text-yellow-400', activeRing: 'ring-yellow-500/50 border-yellow-500/50 bg-yellow-500/10' },
    { id: 'vue', label: 'Vue 3', icon: '💚', color: 'text-green-400', activeRing: 'ring-green-500/50 border-green-500/50 bg-green-500/10' },
    { id: 'svelte', label: 'Svelte', icon: '🔶', color: 'text-orange-400', activeRing: 'ring-orange-500/50 border-orange-500/50 bg-orange-500/10' },
    { id: 'angular', label: 'Angular', icon: '🔺', color: 'text-red-400', activeRing: 'ring-red-500/50 border-red-500/50 bg-red-500/10' },
    { id: 'static', label: 'HTML/CSS', icon: '🌐', color: 'text-blue-400', activeRing: 'ring-blue-500/50 border-blue-500/50 bg-blue-500/10' },
    { id: 'vanilla', label: 'Vanilla JS', icon: '🟨', color: 'text-yellow-300', activeRing: 'ring-yellow-400/50 border-yellow-400/50 bg-yellow-400/10' },
];

interface CategoryItem {
    id: string;
    label: string;
    icon: string;
}

interface Props {
    onSuccess?: () => void;
    categories?: CategoryItem[];
    onCategoryCreated?: () => void;
}

export function NewComponentModal({ onSuccess, categories = [], onCategoryCreated }: Props) {
    const { user } = useAuth();
    const session = user ? { user } : null;
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [selectedStack, setSelectedStack] = useState<SandpackTemplate>('vite-react-ts');
    const [selectedCategory, setSelectedCategory] = useState('uncategorized');

    // ── New category inline creation ──────────────────────────────────────────
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [newCatLabel, setNewCatLabel] = useState('');
    const [newCatLoading, setNewCatLoading] = useState(false);
    const [newCatError, setNewCatError] = useState<string | null>(null);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: '',
        pre_requisites: '',
        functional_purpose: '',
        component_constraint: '',
        technical_implementation: '',
        raw_code: '',
        css_code: '',
    });

    const [codeTab, setCodeTab] = useState<'component' | 'css'>('component');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setFieldErrors(prev => ({ ...prev, [e.target.name]: [] }));
    };

    const handleCreateCategory = async () => {
        if (!newCatLabel.trim()) return;
        setNewCatError(null);
        setNewCatLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ label: newCatLabel.trim() }),
            });
            const json = await res.json();
            if (json.success) {
                onCategoryCreated?.();
                setSelectedCategory(json.data.id);
                setNewCatLabel('');
                setCreatingCategory(false);
            } else {
                setNewCatError(json.error ?? 'Failed');
            }
        } catch {
            setNewCatError('API error');
        } finally {
            setNewCatLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});
        setLoading(true);

        let finalCode = form.raw_code;
        if (form.css_code.trim()) {
            finalCode += `\n\n/* styles.css */\n${form.css_code}`;
        }

        let uploadedImageUrl: string | undefined = undefined;
        if (imageFile) {
            try {
                const base64Data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = () => reject(new Error('Could not read image file.'));
                    reader.readAsDataURL(imageFile);
                });

                const uploadRes = await fetch(`${API_URL}/api/upload`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: base64Data, mimeType: imageFile.type }),
                });

                const uploadJson = await uploadRes.json();
                if (uploadRes.ok && uploadJson.success) {
                    uploadedImageUrl = uploadJson.data.url;
                } else {
                    throw new Error(uploadJson.error || 'Failed to upload image');
                }
            } catch (err) {
                console.error('[NewComponentModal] Image upload error:', err);
                setError((err as Error).message || 'Failed to upload image. Please try again.');
                setLoading(false);
                return;
            }
        }

        try {
            const res = await fetch(`${API_URL}/api/components`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.title,
                    pre_requisites: form.pre_requisites,
                    functional_purpose: form.functional_purpose,
                    component_constraint: form.component_constraint,
                    technical_implementation: form.technical_implementation,
                    raw_code: finalCode,
                    stack: selectedStack,
                    category: selectedCategory,
                    author_id: (session?.user as { id?: string })?.id,
                    image_url: uploadedImageUrl,
                }),
            });

            const json = await res.json();

            if (!res.ok || !json.success) {
                if (json.details) {
                    setFieldErrors(json.details);
                } else {
                    setError(json.error ?? 'Something went wrong. Please try again.');
                }
                return;
            }

            if (imagePreview) URL.revokeObjectURL(imagePreview);
            setForm({ title: '', pre_requisites: '', functional_purpose: '', component_constraint: '', technical_implementation: '', raw_code: '', css_code: '' });
            setImageFile(null);
            setImagePreview(null);
            setSelectedStack('vite-react-ts');
            setSelectedCategory('uncategorized');
            setOpen(false);
            onSuccess?.();
        } catch (err) {
            setError('Could not reach the API. Is the backend server running?');
            console.error('[NewComponentModal] Submit error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <StyledWrapper>
                <button
                    onClick={() => setOpen(true)}
                    className="button"
                >
                    <span className="button__icon-wrapper">
                        <svg viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="button__icon-svg" width={10}>
                            <path d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z" fill="currentColor" />
                        </svg>
                        <svg viewBox="0 0 14 15" fill="none" width={10} xmlns="http://www.w3.org/2000/svg" className="button__icon-svg button__icon-svg--copy">
                            <path d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z" fill="currentColor" />
                        </svg>
                    </span>
                    New Component
                </button>
            </StyledWrapper>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6"
                    onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
                >
                    <div className="bg-[#0A0A0C] border border-white/10 ring-1 ring-white/5 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                            <h2 className="text-white text-xl font-semibold tracking-tight">Add Component to Registry</h2>
                            <p className="text-neutral-400 text-sm mt-1">
                                Submit a reusable component to make it searchable by the team.
                            </p>
                        </div>

                        {/* Scrollable Form Body */}
                        <div className="overflow-y-auto px-6 py-6 custom-scrollbar">
                            <form id="component-form" onSubmit={handleSubmit} className="space-y-6">
                                
                                {/* Stack & Category Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Category Picker */}
                                    <div className="flex flex-col">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-medium text-neutral-300">Category</label>
                                            <button
                                                type="button"
                                                onClick={() => setCreatingCategory(!creatingCategory)}
                                                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                            >
                                                {creatingCategory ? 'Cancel' : '+ New Category'}
                                            </button>
                                        </div>

                                        {creatingCategory ? (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex gap-2">
                                                    <input
                                                        value={newCatLabel}
                                                        onChange={e => { setNewCatLabel(e.target.value); setNewCatError(null); }}
                                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCategory(); } }}
                                                        placeholder="e.g. Navigation"
                                                        autoFocus
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2.5 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleCreateCategory}
                                                        disabled={newCatLoading || !newCatLabel.trim()}
                                                        className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-neutral-200 disabled:opacity-50 transition-colors whitespace-nowrap"
                                                    >
                                                        {newCatLoading ? '...' : 'Add'}
                                                    </button>
                                                </div>
                                                {newCatError && <p className="text-red-400 text-xs">{newCatError}</p>}
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <select
                                                    value={selectedCategory}
                                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2.5 text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer"
                                                >
                                                    <option value="uncategorized">Uncategorized</option>
                                                    {categories.map(opt => (
                                                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-neutral-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Component Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">Component Name</label>
                                        <input
                                            name="title"
                                            value={form.title}
                                            onChange={handleChange}
                                            placeholder="e.g. StripePaymentForm"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2.5 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        />
                                        {fieldErrors.title && <p className="text-red-400 text-xs mt-1.5">{fieldErrors.title[0]}</p>}
                                    </div>
                                </div>

                                {/* Stack Picker */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">Framework / Stack</label>
                                    <div className="flex flex-wrap gap-2">
                                        {STACKS.map((s) => {
                                            const isSelected = selectedStack === s.id;
                                            return (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => setSelectedStack(s.id)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                                                        isSelected
                                                            ? s.activeRing + ' text-white shadow-lg'
                                                            : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200'
                                                    }`}
                                                >
                                                    <span className={`text-base ${!isSelected ? s.color : ''}`}>{s.icon}</span>
                                                    <span>{s.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Pre-Requisits */}
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">Pre-Requisits</label>
                                        <textarea
                                            name="pre_requisites"
                                            value={form.pre_requisites}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="What assumes or needs to be set up..."
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2.5 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-y"
                                        />
                                        {fieldErrors.pre_requisites && <p className="text-red-400 text-xs mt-1.5">{fieldErrors.pre_requisites[0]}</p>}
                                    </div>

                                    {/* Functional Purpose */}
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">Functional Purpose</label>
                                        <textarea
                                            name="functional_purpose"
                                            value={form.functional_purpose}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="What does it visually and conceptually do?"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2.5 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-y"
                                        />
                                        {fieldErrors.functional_purpose && <p className="text-red-400 text-xs mt-1.5">{fieldErrors.functional_purpose[0]}</p>}
                                    </div>

                                    {/* Component Constraint */}
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">Component Constraint</label>
                                        <textarea
                                            name="component_constraint"
                                            value={form.component_constraint}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="What shouldn't this be used for? Limitations..."
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2.5 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-y"
                                        />
                                        {fieldErrors.component_constraint && <p className="text-red-400 text-xs mt-1.5">{fieldErrors.component_constraint[0]}</p>}
                                    </div>

                                    {/* Technical Implementation */}
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">Technical Implementation</label>
                                        <textarea
                                            name="technical_implementation"
                                            value={form.technical_implementation}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Notable inner workings, hooks, tricky bits..."
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2.5 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-y"
                                        />
                                        {fieldErrors.technical_implementation && <p className="text-red-400 text-xs mt-1.5">{fieldErrors.technical_implementation[0]}</p>}
                                    </div>
                                </div>

                                {/* Code Editor Area */}
                                <div className="rounded-xl border border-white/10 bg-[#0F0F13] overflow-hidden">
                                    {/* Segmented Control Tabs */}
                                    <div className="flex items-center gap-1 p-1.5 bg-black/40 border-b border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => setCodeTab('component')}
                                            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${codeTab === 'component' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                                        >
                                            Source Code
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCodeTab('css')}
                                            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${codeTab === 'css' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                                        >
                                            CSS <span className="opacity-50 font-normal">(Optional)</span>
                                        </button>
                                    </div>

                                    <div className="p-2">
                                        {codeTab === 'component' ? (
                                            <textarea
                                                name="raw_code"
                                                value={form.raw_code}
                                                onChange={handleChange}
                                                rows={8}
                                                spellCheck={false}
                                                placeholder="// Paste your component source code here..."
                                                className="w-full bg-transparent p-2 text-neutral-300 text-sm font-mono placeholder:text-neutral-600 focus:outline-none resize-y min-h-[150px]"
                                            />
                                        ) : (
                                            <textarea
                                                name="css_code"
                                                value={form.css_code}
                                                onChange={handleChange}
                                                rows={8}
                                                spellCheck={false}
                                                placeholder="/* Add supporting CSS styles here... */"
                                                className="w-full bg-transparent p-2 text-neutral-300 text-sm font-mono placeholder:text-neutral-600 focus:outline-none resize-y min-h-[150px]"
                                            />
                                        )}
                                    </div>
                                    {fieldErrors.raw_code && <div className="px-4 pb-3"><p className="text-red-400 text-xs">{fieldErrors.raw_code[0]}</p></div>}
                                </div>

                                {/* Image Upload Dropzone */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">Preview Image <span className="text-neutral-500 font-normal">(Optional)</span></label>
                                    <label className="relative flex flex-col items-center justify-center w-full h-32 transition-all bg-black/20 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-black/40 hover:border-blue-500/50 focus:outline-none overflow-hidden group">
                                        <input
                                            type="file"
                                            name="image"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                        {imagePreview ? (
                                            <>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-40 transition-opacity duration-300" />
                                                <div className="relative z-10 flex items-center gap-2 bg-black/60 text-white text-sm font-medium px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                                    Replace Image
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-neutral-500 group-hover:text-neutral-300 transition-colors">
                                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                                <span className="text-sm font-medium">Click to browse or drop an image</span>
                                            </div>
                                        )}
                                    </label>
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
                                        <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <p className="text-red-400 text-sm leading-relaxed">{error}</p>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Footer Actions */}
                        <div className="px-6 py-4 border-t border-white/5 bg-black/20 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="text-neutral-400 text-sm font-medium px-4 py-2.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="component-form"
                                disabled={loading}
                                className="bg-white text-black text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                            >
                                {loading ? 'Submitting...' : 'Submit Component'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

const StyledWrapper = styled.div`
  .button {
    line-height: 1;
    text-decoration: none;
    display: inline-flex;
    border: none;
    cursor: pointer;
    align-items: center;
    gap: 0.75rem;
    background-color: #ffffff; /* White button base */
    color: #000000; /* Black text */
    border-radius: 10rem;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    padding-left: 20px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all 0.3s;
    box-shadow: 0 0 20px -5px rgba(255, 255, 255, 0.2);
  }

  .button__icon-wrapper {
    flex-shrink: 0;
    width: 25px;
    height: 25px;
    position: relative;
    color: #ffffff; /* White icon (since background is black) */
    background-color: #000000; /* Black icon circle */
    border-radius: 50%;
    display: grid;
    place-items: center;
    overflow: hidden;
    transition: all 0.3s;
  }

  .button:hover {
    background-color: #000000; /* Black button base on hover */
    color: #ffffff; /* White text on hover */
    box-shadow: 0 0 20px 2px rgba(255, 255, 255, 0.4); /* White glow */
  }

  .button:hover .button__icon-wrapper {
    background-color: #ffffff; /* White icon circle on hover */
    color: #000000; /* Black icon on hover */
  }

  .button__icon-svg--copy {
    position: absolute;
    transform: translate(-150%, 150%);
  }

  .button:hover .button__icon-svg:first-child {
    transition: transform 0.3s ease-in-out;
    transform: translate(150%, -150%);
  }

  .button:hover .button__icon-svg--copy {
    transition: transform 0.3s ease-in-out 0.1s;
    transform: translate(0);
  }`;