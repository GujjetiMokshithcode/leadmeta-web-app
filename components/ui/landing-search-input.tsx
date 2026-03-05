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
                        
                        {/* Target Count Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setShowTargetSelector(!showTargetSelector)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                            >
                                <Target className="h-3.5 w-3.5" />
                                <span>{targetCount}</span>
                            </button>
                            
                            {showTargetSelector && (
                                <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-50 p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-white/60">Target Leads</span>
                                            <span className="text-sm font-medium text-white">{targetCount}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="10"
                                            max="500"
                                            step="10"
                                            value={targetCount}
                                            onChange={(e) => setTargetCount(parseInt(e.target.value))}
                                            className="w-full accent-white"
                                        />
                                        <div className="flex justify-between text-xs text-white/40">
                                            <span>10</span>
                                            <span>250</span>
                                            <span>500</span>
                                        </div>
                                        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                                            <input
                                                type="number"
                                                min="10"
                                                max="500"
                                                value={targetCount}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 50;
                                                    setTargetCount(Math.min(Math.max(val, 10), 500));
                                                }}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm text-center focus:outline-none focus:border-white/30"
                                            />
                                            <button
                                                onClick={() => setShowTargetSelector(false)}
                                                className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90"
                                            >
                                                Done
                                            </button>
                                        </div>
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
