import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUp } from "lucide-react";

/* --- ICONS --- */
export const Icons = {
    ArrowUp: ArrowUp,
};

/* --- TYPES --- */
interface Model {
    id: string;
    name: string;
    description: string;
    badge?: string;
}

interface ClaudeStyleChatInputProps {
    onSubmit: (message: string) => void;
    placeholder?: string;
    disabled?: boolean;
    models?: Model[];
    defaultModel?: string;
}

/* --- COMPONENTS --- */

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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [message]);

    const handleSubmit = useCallback(() => {
        if (!message.trim() || disabled) return;
        onSubmit(message);
        setMessage("");
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }, [message, disabled, onSubmit]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const hasContent = message.trim().length > 0;

    return (
        <div className="relative w-full max-w-3xl mx-auto">
            {/* Main Input Container */}
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
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
                    <ModelToggle
                        models={models}
                        selectedModel={selectedModel}
                        onSelect={setSelectedModel}
                    />

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
