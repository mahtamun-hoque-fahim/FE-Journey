"use client";

import { useState, useRef } from "react";

interface Tab {
    id: string;
    label: string;
    content: React.ReactNode;
}

interface TabsProps {
    tabs: Tab[];
}

export function Tabs({ tabs }: TabsProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        let next = index;

        if (e.key === "ArrowRight") {
            next = (index + 1) % tabs.length;
        } else if (e.key === "ArrowLeft") {
            next = (index - 1 + tabs.length) % tabs.length;
        } else if (e.key === "Home") {
            next = 0;
        } else if (e.key === "End") {
            next = tabs.length - 1;
        } else {
            return;
        }

        e.preventDefault();
        setActiveIndex(next);
        tabRefs.current[next]?.focus();
    };

    return (
        <div>
            {/* Tab list */}
            <div role="tablist" aria-label="Component tabs" className="flex gap-1 border-b border-border">
                {tabs.map((tab, index) => (
                    <button
                        key={tab.id}
                        ref={(el) => { tabRefs.current[index] = el; }}
                        role="tab"
                        id={`tab-${tab.id}`}
                        aria-selected={activeIndex === index}
                        aria-controls={`panel-${tab.id}`}
                        tabIndex={activeIndex === index ? 0 : -1}
                        onClick={() => setActiveIndex(index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeIndex === index
                                ? "border-accent text-accent"
                                : "border-transparent text-muted hover:text-foreground"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab panels */}
            {tabs.map((tab, index) => (
                <div
                    key={tab.id}
                    role="tabpanel"
                    id={`panel-${tab.id}`}
                    aria-labelledby={`tab-${tab.id}`}
                    hidden={activeIndex !== index}
                    tabIndex={0}
                    className="py-4 text-sm text-muted focus:outline-none"
                >
                    {tab.content}
                </div>
            ))}
        </div>
    );
}