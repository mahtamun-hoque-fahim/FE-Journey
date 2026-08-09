"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ChefHat, Send, Square, ArrowDown } from "lucide-react";

export default function AssistantPage() {
    const [input, setInput] = useState("");
    const [autoScroll, setAutoScroll] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, status, stop, error } = useChat({
        transport: new DefaultChatTransport({ api: "/api/chat" }),
    });

    const isBusy = status === "submitted" || status === "streaming";
    const lastMessage = messages[messages.length - 1];

    const isThinking =
        status === "submitted" ||
        (status === "streaming" &&
            lastMessage?.role === "assistant" &&
            !lastMessage.parts.some(
                (part) => part.type === "text" && part.text.trim().length > 0
            ));

    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, autoScroll]);

    function handleScroll() {
        const el = scrollRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setAutoScroll(distanceFromBottom < 80);
    }

    function jumpToLatest() {
        setAutoScroll(true);
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const text = input.trim();
        if (!text || isBusy) return;
        setInput("");
        sendMessage({ text });
    }

    return (
        <main className="mx-auto flex h-dvh w-full max-w-2xl flex-col px-4">
            <header className="flex items-center gap-2 border-b border-white/10 py-4">
                <ChefHat className="h-5 w-5" />
                <h1 className="text-lg font-semibold">Recipe Assistant</h1>
            </header>

            <div className="relative flex-1 overflow-hidden">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex h-full flex-col gap-4 overflow-y-auto py-6"
                >
                    {messages.length === 0 && (
                        <p className="text-sm text-white/50">
                            Ask about a recipe, an ingredient swap, or a cooking technique.
                        </p>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={
                                message.role === "user"
                                    ? "ml-auto max-w-[85%] rounded-2xl bg-white/10 px-4 py-2"
                                    : "mr-auto max-w-[85%] rounded-2xl bg-white/5 px-4 py-2"
                            }
                        >
                            {message.parts.map((part, index) =>
                                part.type === "text" ? (
                                    <p key={`${message.id}-${index}`} className="whitespace-pre-wrap text-sm">
                                        {part.text}
                                    </p>
                                ) : null
                            )}
                        </div>
                    ))}

                    {isThinking && (
                        <div className="mr-auto flex items-center gap-1 rounded-2xl bg-white/5 px-4 py-3">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:-0.3s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:-0.15s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" />
                        </div>
                    )}

                    {error && (
                        <p className="mr-auto text-sm text-red-400">
                            Something went wrong. Try sending that again.
                        </p>
                    )}
                </div>

                {!autoScroll && (
                    <button
                        type="button"
                        onClick={jumpToLatest}
                        className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    >
                        <ArrowDown className="h-3 w-3" />
                        Jump to latest
                    </button>
                )}
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 border-t border-white/10 py-4"
            >
                <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask about a recipe..."
                    disabled={isBusy}
                    className="min-w-0 flex-1 rounded-full bg-white/10 px-4 py-2 text-base text-white outline-none transition-colors placeholder:text-white/40 focus-visible:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-50"
                />
                {isBusy ? (
                    <button
                        type="button"
                        onClick={stop}
                        aria-label="Stop generating"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:scale-95"
                    >
                        <Square className="h-4 w-4" />
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        aria-label="Send message"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:scale-95 disabled:opacity-40 disabled:hover:bg-white/10"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                )}
            </form>
        </main>
    );
}