import React, { useState, useRef, useEffect, useCallback } from "react";
import { Plus, ArrowUp, X, FileText, Loader2 } from "lucide-react";

/* --- ICONS --- */
export const Icons = {
    Plus: Plus,
    ArrowUp: ArrowUp,
    X: X,
    FileText: FileText,
    Loader2: Loader2,
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

// Simple Toggle
interface ModelToggleProps {
    models: Model[];
    selectedModel: string;
    onSelect: (modelId: string) => void;
}

const ModelToggle: React.FC<ModelToggleProps> = ({ models, selectedModel, onSelect }) => {
    return (
        <div className="flex items-center gap-1 p-1 rounded-lg">
            {models.map((model) => (
                <button
                    key={model.id}
                    onClick={() => onSelect(model.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border
                    ${selectedModel === model.id 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-transparent border-transparent text-white/40 hover:text-white/70'}`}
                    title={model.description}
                >
                    {model.name}
                </button>
            ))}
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
                        className="w-full bg-transparent text-white placeholder:text-white/30 px-8 py-6 pr-20 resize-none outline-none min-h-[88px] max-h-[400px] disabled:opacity-50 text-xl"
                    />
                </div>

                {/* Bottom Toolbar */}
                <div className="flex items-center justify-between px-3 pb-3">
                    <div className="flex items-center gap-2">
                        {/* File Upload Button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled}
                            className="p-2.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                        >
                            <Icons.Plus className="w-6 h-6" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={(e) => handleFileSelect(e.target.files)}
                            className="hidden"
                        />

                        {/* Model Toggle */}
                        <ModelToggle
                            models={models}
                            selectedModel={selectedModel}
                            onSelect={setSelectedModel}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!hasContent || disabled}
                        className={`p-2.5 rounded-lg transition-all duration-200 border
                        ${hasContent && !disabled
                            ? 'bg-white/10 border-white/20 text-white hover:bg-white/15'
                            : 'bg-transparent border-white/10 text-white/20 cursor-not-allowed'}`}
                    >
                        <Icons.ArrowUp className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClaudeStyleChatInput;
