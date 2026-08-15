"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ChefHat, Send, Square, ArrowDown, Loader, TriangleAlert } from "lucide-react";
import { Streamdown } from "streamdown";
import { RecipeToolResult } from "@/components/recipe-tool-result";
import type { SearchRecipesResult } from "@/lib/tools";

// ── Tool-part sub-components ──────────────────────────────────────────────────

// State 1 & 2: input is streaming in or fully available but not yet executed
function ToolSearching({ query }: { query?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3">
      <Loader className="h-3.5 w-3.5 shrink-0 animate-spin text-accent" />
      <span className="text-xs text-muted">
        {query ? <>Searching for <span className="text-foreground">&ldquo;{query}&rdquo;</span>…</> : "Preparing search…"}
      </span>
    </div>
  );
}

// State 4: tool threw or returned an error inside the result object
function ToolError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
      <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-red-400">Search failed</span>
        <span className="text-xs text-red-400/70">{message}</span>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AssistantPage() {
  const [input, setInput] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isBusy = status === "submitted" || status === "streaming";
  const lastMessage = messages[messages.length - 1];

  // Thinking indicator and the first streamed token are a handoff, not a
  // swap: keep the indicator up until the assistant message actually has
  // visible text, so there's no blank flicker between the two.
  const isThinking =
    status === "submitted" ||
    (status === "streaming" &&
      lastMessage?.role === "assistant" &&
      !lastMessage.parts.some(
        (part) => part.type === "text" && part.text.trim().length > 0
      ));

  // Pin to bottom only while the user is already at the bottom.
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
    <div className="mx-auto flex w-full max-w-2xl flex-1 min-h-0 flex-col px-4">
      <header className="flex items-center gap-2 border-b border-border py-4">
        <ChefHat className="h-5 w-5 text-accent" />
        <h1 className="text-lg font-semibold text-foreground">Recipe Assistant</h1>
      </header>

      <div className="relative flex-1 min-h-0 overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex h-full flex-col gap-5 overflow-y-auto py-6"
        >
          {messages.length === 0 && (
            <p className="text-sm text-muted">
              What&apos;s in your fridge? I&apos;ll figure out dinner.
            </p>
          )}

          {messages.map((message) =>
            message.role === "user" ? (
              <div
                key={message.id}
                className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-surface px-4 py-2"
              >
                {message.parts.map((part, index) =>
                  part.type === "text" ? (
                    <p
                      key={`${message.id}-${index}`}
                      className="whitespace-pre-wrap text-sm text-foreground"
                    >
                      {part.text}
                    </p>
                  ) : null
                )}
              </div>
            ) : (
              <div key={message.id} className="flex items-start gap-2">
                <ChefHat className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <div className="min-w-0 flex-1 flex flex-col gap-3 text-sm text-foreground [&_a]:text-accent [&_h1]:mt-0 [&_h2]:mt-0 [&_h3]:mt-0">
                  {message.parts.map((part, index) => {
                    // Text part — streamed markdown
                    if (part.type === "text") {
                      return (
                        <Streamdown key={`${message.id}-${index}`}>
                          {part.text}
                        </Streamdown>
                      );
                    }

                    // Tool-invocation part — four distinct states
                    if (part.type === "tool-invocation") {
                      const inv = part.toolInvocation;

                      // State 1: args still streaming in
                      if (inv.state === "partial-call") {
                        return (
                          <ToolSearching
                            key={`${message.id}-${index}`}
                          />
                        );
                      }

                      // State 2: args complete, waiting for execute()
                      if (inv.state === "call") {
                        return (
                          <ToolSearching
                            key={`${message.id}-${index}`}
                            query={(inv.args as { query?: string })?.query}
                          />
                        );
                      }

                      // State 3 & 4: execute() returned — success or error
                      if (inv.state === "result") {
                        const res = inv.result as SearchRecipesResult | undefined;
                        if (!res) return null;
                        if (res.error) {
                          return (
                            <ToolError
                              key={`${message.id}-${index}`}
                              message={res.error}
                            />
                          );
                        }
                        return (
                          <RecipeToolResult
                            key={`${message.id}-${index}`}
                            result={res}
                          />
                        );
                      }
                    }

                    return null;
                  })}
                </div>
              </div>
            )
          )}

          {isThinking && (
            <div className="flex items-center gap-2">
              <ChefHat className="h-4 w-4 shrink-0 text-accent" />
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/70 [animation-delay:-0.3s] motion-reduce:animate-none" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/70 [animation-delay:-0.15s] motion-reduce:animate-none" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/70 motion-reduce:animate-none" />
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400">
              Something went wrong. Try sending that again.
            </p>
          )}
        </div>

        {!autoScroll && (
          <button
            type="button"
            onClick={jumpToLatest}
            className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-foreground shadow-lg backdrop-blur transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowDown className="h-3 w-3" />
            Jump to latest
          </button>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border py-4"
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about a recipe..."
          disabled={isBusy}
          className="min-w-0 flex-1 rounded-full border border-border bg-surface px-4 py-2 text-base text-foreground outline-none transition-colors placeholder:text-muted focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
        />
        {isBusy ? (
          <button
            type="button"
            onClick={stop}
            aria-label="Stop generating"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95"
          >
            <Square className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-background transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95 disabled:pointer-events-none disabled:bg-surface disabled:text-muted"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </form>
    </div>
  );
}
