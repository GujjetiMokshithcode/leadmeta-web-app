import React, { useState, useRef, useEffect, useCallback } from "react";
import { Plus, ChevronDown, ArrowUp, X, FileText, Loader2, Check } from "lucide-react";

/* --- ICONS --- */
export const Icons = {
    Plus: Plus,
    SelectArrow: ChevronDown,
    ArrowUp: ArrowUp,
    X: X,
    FileText: FileText,
    Loader2: Loader2,
    Check: Check,
};

/* --- UTILS --- */
const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/* --- TYPES --- */
interface AttachedFile {
    id: string;
    file: File;
    type: string;
    preview: string | null;
    uploadStatus: string;
}

interface Model {
    id: string;
    name: string;
    description: string;
    badge?: string;
}

interface ClaudeStyleChatInputProps {
    onSubmit: (message: string, files: AttachedFile[]) => void;
    placeholder?: string;
    disabled?: boolean;
    models?: Model[];
    defaultModel?: string;
}

/* --- COMPONENTS --- */

// File Preview Card
interface FilePreviewCardProps {
    file: AttachedFile;
    onRemove: (id: string) => void;
}

const FilePreviewCard: React.FC<FilePreviewCardProps> = ({ file, onRemove }) => {
    const isImage = file.type.startsWith("image/") && file.preview;

    return (
        <div className="relative group flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-white/10 bg-white/5 animate-fade-in transition-all hover:border-white/20">
            {isImage ? (
                <div className="w-full h-full relative">
                    <img src={file.preview!} alt={file.file.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                </div>
            ) : (
                <div className="w-full h-full p-3 flex flex-col justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white/10 rounded">
                            <Icons.FileText className="w-4 h-4 text-white/60" />
                        </div>
                        <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider truncate">
                            {file.file.name.split('.').pop()}
                        </span>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-xs font-medium text-white/80 truncate" title={file.file.name}>
                            {file.file.name}
                        </p>
                        <p className="text-[10px] text-white/40">
                            {formatFileSize(file.file.size)}
                        </p>
                    </div>
                </div>
            )}

            <button
                onClick={() => onRemove(file.id)}
                className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Icons.X className="w-3 h-3" />
            </button>

            {file.uploadStatus === 'uploading' && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Icons.Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
            )}
        </div>
    );
};

// Model Selector
interface ModelSelectorProps {
    models: Model[];
    selectedModel: string;
    onSelect: (modelId: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ models, selectedModel, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentModel = models.find(m => m.id === selectedModel) || models[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center justify-center relative shrink-0 transition-all duration-200 h-8 rounded-xl px-3 text-xs gap-1 border
                ${isOpen
                    ? 'bg-white/10 text-white border-white/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'}`}
            >
                <span className="font-medium">{currentModel.name}</span>
                <Icons.SelectArrow className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="text-xs font-medium text-white/40 px-3 py-2 uppercase tracking-wider">
                        Select Model
                    </div>
                    {models.map((model) => (
                        <button
                            key={model.id}
                            onClick={() => {
                                onSelect(model.id);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors
                            ${selectedModel === model.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                        >
                            <div>
                                <div className="text-sm font-medium text-white">{model.name}</div>
                                <div className="text-xs text-white/40">{model.description}</div>
                            </div>
                            {selectedModel === model.id && (
                                <Icons.Check className="w-4 h-4 text-[#1f3dbc]" />
                            )}
                            {model.badge && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-[#1f3dbc]/20 text-[#1f3dbc] rounded">
                                    {model.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Main Component
export const ClaudeStyleChatInput: React.FC<ClaudeStyleChatInputProps> = ({
    onSubmit,
    placeholder = "Describe the leads you're looking for...",
    disabled = false,
    models = [
        { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model' },
        { id: 'gpt-3.5', name: 'GPT-3.5', description: 'Fast and efficient' },
    ],
    defaultModel = 'gpt-4',
}) => {
    const [message, setMessage] = useState("");
    const [selectedModel, setSelectedModel] = useState(defaultModel);
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [message]);

    const handleSubmit = useCallback(() => {
        if ((!message.trim() && attachedFiles.length === 0) || disabled) return;
        onSubmit(message, attachedFiles);
        setMessage("");
        setAttachedFiles([]);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }, [message, attachedFiles, disabled, onSubmit]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;
        
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            const newFile: AttachedFile = {
                id: Math.random().toString(36).substr(2, 9),
                file,
                type: file.type,
                preview: null,
                uploadStatus: 'pending'
            };

            if (file.type.startsWith('image/')) {
                reader.onload = (e) => {
                    newFile.preview = e.target?.result as string;
                    setAttachedFiles(prev => [...prev, newFile]);
                };
                reader.readAsDataURL(file);
            } else {
                setAttachedFiles(prev => [...prev, newFile]);
            }
        });
    };

    const removeFile = (id: string) => {
        setAttachedFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const hasContent = message.trim().length > 0 || attachedFiles.length > 0;

    return (
        <div 
            className={`relative w-full max-w-3xl mx-auto transition-all duration-200 ${isDragging ? 'scale-[1.02]' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Drag Overlay */}
            {isDragging && (
                <div className="absolute -inset-4 bg-[#1f3dbc]/10 border-2 border-dashed border-[#1f3dbc] rounded-3xl flex items-center justify-center z-50">
                    <span className="text-[#1f3dbc] font-medium">Drop files here</span>
                </div>
            )}

            {/* Main Input Container */}
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                
                {/* File Previews */}
                {attachedFiles.length > 0 && (
                    <div className="flex gap-2 p-3 pb-0 overflow-x-auto scrollbar-hide">
                        {attachedFiles.map(file => (
                            <FilePreviewCard 
                                key={file.id} 
                                file={file} 
                                onRemove={removeFile} 
                            />
                        ))}
                    </div>
                )}

                {/* Text Area */}
                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={1}
                        className="w-full bg-transparent text-white placeholder:text-white/30 px-6 py-5 pr-16 resize-none outline-none min-h-[72px] max-h-[300px] disabled:opacity-50 text-lg"
                    />
                </div>

                {/* Bottom Toolbar */}
                <div className="flex items-center justify-between px-3 pb-3">
                    <div className="flex items-center gap-2">
                        {/* File Upload Button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled}
                            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                        >
                            <Icons.Plus className="w-5 h-5" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={(e) => handleFileSelect(e.target.files)}
                            className="hidden"
                        />

                        {/* Model Selector */}
                        <ModelSelector
                            models={models}
                            selectedModel={selectedModel}
                            onSelect={setSelectedModel}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!hasContent || disabled}
                        className={`p-2 rounded-lg transition-all duration-200
                        ${hasContent && !disabled
                            ? 'bg-[#1f3dbc] text-white hover:bg-[#1f3dbc]/90'
                            : 'bg-white/10 text-white/30 cursor-not-allowed'}`}
                    >
                        <Icons.ArrowUp className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClaudeStyleChatInput;
