"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface Tab {
    id: string;
    label: string;
}

interface AnimatedTabsProps {
    tabs: Tab[];
    defaultTab?: string;
    activeTab?: string;
    onChange?: (tabId: string) => void;
}

export function AnimatedTabs({
    tabs,
    defaultTab,
    activeTab: controlledActiveTab,
    onChange
}: AnimatedTabsProps) {
    const [activeTab, setActiveTab] = useState(controlledActiveTab || defaultTab || tabs[0].id);

    useEffect(() => {
        if (controlledActiveTab !== undefined) {
            setActiveTab(controlledActiveTab);
        }
    }, [controlledActiveTab]);

    const handleTabChange = (tabId: string) => {
        if (controlledActiveTab === undefined) {
            setActiveTab(tabId);
        }
        onChange?.(tabId);
    };

    return (
        <div className="flex space-x-1 px-1">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
            relative rounded-lg px-4 py-1.5 text-sm font-medium transition-colors duration-300
            ${activeTab === tab.id ? "text-white drop-shadow-md" : "text-white/40 hover:text-white/70"}
          `}
                    style={{
                        WebkitTapHighlightColor: "transparent",
                    }}
                >
                    {activeTab === tab.id && (
                        <motion.span
                            layoutId="bubble"
                            className="absolute inset-0 z-0 bg-white/10"
                            style={{ borderRadius: "0.5rem" }}
                            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                        />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                </button>
            ))}
        </div>
    );
}
