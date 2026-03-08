import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUp, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

import { AnimatedTabs } from "@/components/ui/animated-tabs";

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
                        <AnimatedTabs
                            tabs={models.map(m => ({ id: m.id, label: m.name }))}
                            activeTab={selectedModel}
                            onChange={setSelectedModel}
                        />

                        {/* Target Count Input */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-transparent hover:bg-white/[0.03] focus-within:bg-white/[0.05] focus-within:border-white/10 transition-all duration-300 group">
                            <Target className="h-4 w-4 text-white/40 group-focus-within:text-amber-200 group-focus-within:drop-shadow-md transition-colors duration-300" />
                            <input
                                type="number"
                                min="1"
                                max="1000"
                                value={targetCount || ''}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setTargetCount(isNaN(val) ? 0 : Math.min(val, 1000));
                                }}
                                onBlur={() => {
                                    if (!targetCount || targetCount < 1) setTargetCount(50);
                                }}
                                className="w-10 bg-transparent text-white text-sm font-medium focus:outline-none placeholder:text-white/20 text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="50"
                                title="Target Leads"
                            />
                            <span className="text-white/30 text-xs font-semibold uppercase tracking-wider select-none">Leads</span>
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
