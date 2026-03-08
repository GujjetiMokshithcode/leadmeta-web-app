import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUp, Target } from "lucide-react";

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

interface LandingSearchInputProps {
    onSubmit: (message: string, targetCount: number) => void;
    placeholder?: string;
    disabled?: boolean;
    models?: Model[];
    defaultModel?: string;
    defaultTarget?: number;
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
        <div className="flex items-center gap-2 px-1">
            {models.map((model) => {
                const isActive = selectedModel === model.id;
                return (
                    <button
                        key={model.id}
                        onClick={() => onSelect(model.id)}
                        className={`relative px-3 py-1.5 text-sm font-medium transition-all duration-300 ease-out group
                        ${isActive ? 'text-white drop-shadow-md' : 'text-white/40 hover:text-white/70'}`}
                        title={model.description}
                    >
                        {model.name}
                        {/* Clean Underline Animation */}
                        <span
                            className={`absolute left-1/2 -translate-x-1/2 -bottom-1 h-[2px] rounded-full transition-all duration-300 ease-out
                            ${isActive
                                    ? 'bg-white w-full opacity-100 shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                                    : 'bg-white/20 w-0 opacity-0 group-hover:w-full group-hover:opacity-100'}`}
                        />
                    </button>
                );
            })}
        </div>
    );
};

// Main Component
export const LandingSearchInput: React.FC<LandingSearchInputProps> = ({
    onSubmit,
    placeholder = "Describe the leads you're looking for...",
    disabled = false,
    models = [
        { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model' },
        { id: 'gpt-3.5', name: 'GPT-3.5', description: 'Fast and efficient' },
    ],
    defaultModel = 'gpt-4',
    defaultTarget = 50,
}) => {
    const [message, setMessage] = useState("");
    const [selectedModel, setSelectedModel] = useState(defaultModel);
    const [targetCount, setTargetCount] = useState(defaultTarget);
    const [showTargetSelector, setShowTargetSelector] = useState(false);
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
        onSubmit(message, targetCount);
        setMessage("");
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }, [message, disabled, onSubmit, targetCount]);

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
                    <div className="flex items-center gap-2">
                        <ModelToggle
                            models={models}
                            selectedModel={selectedModel}
                            onSelect={setSelectedModel}
                        />

                        <div className="relative">
                            <button
                                onClick={() => setShowTargetSelector(!showTargetSelector)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 border
                                ${showTargetSelector
                                        ? 'bg-white/10 border-white/20 text-white shadow-sm'
                                        : 'bg-transparent border-transparent text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                                title="Target Leads"
                            >
                                <Target className={`h-4 w-4 ${showTargetSelector ? 'text-amber-200 drop-shadow-md' : ''}`} />
                                <span>{targetCount}</span>
                            </button>

                            {showTargetSelector && (
                                <div className="absolute bottom-full left-0 mb-3 w-64 bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 p-3 overflow-hidden">
                                    <div className="flex items-center gap-2 mb-3 px-1 text-white/40 text-xs font-semibold uppercase tracking-wider">
                                        <Target className="w-3.5 h-3.5" />
                                        Target Leads
                                    </div>

                                    {/* Quick Select Grid */}
                                    <div className="grid grid-cols-4 gap-1.5 mb-3">
                                        {[25, 50, 100, 250].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => { setTargetCount(val); setShowTargetSelector(false); }}
                                                className={`py-2 rounded-xl text-xs font-semibold transition-all duration-300 ease-out
                                                ${targetCount === val
                                                        ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                                                        : 'bg-white/5 text-white/60 hover:bg-white/15 hover:text-white'}`}
                                            >
                                                {val}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom Input */}
                                    <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1 focus-within:border-white/30 focus-within:bg-white/[0.05] transition-all duration-300">
                                        <span className="text-white/40 text-xs font-medium mr-2">Custom:</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max="1000"
                                            value={targetCount}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 50;
                                                setTargetCount(val);
                                            }}
                                            className="flex-1 bg-transparent w-full text-white text-sm font-medium py-1.5 focus:outline-none"
                                            placeholder="50"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
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

export default LandingSearchInput;
