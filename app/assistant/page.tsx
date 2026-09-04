"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart } from "ai";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ChefHat,
  Send,
  Square,
  ArrowDown,
  Loader,
  TriangleAlert,
  RefreshCw,
} from "lucide-react";
import { Streamdown } from "streamdown";
import { RecipeToolResult } from "@/components/recipe-tool-result";
import type { SearchRecipesResult } from "@/lib/tools";

// ── ai@7 (AI SDK v4) tool part shape for searchRecipes ───────────────────────
// ToolUIPart<TOOLS> has type: `tool-${NAME}` with state/input/output/errorText
// directly on the part — there is no nested `toolInvocation` wrapper.
type SearchRecipesPart =
  | { type: "tool-searchRecipes"; state: "input-streaming"; input?: { query?: string } }
  | { type: "tool-searchRecipes"; state: "input-available"; input: { query: string } }
  | { type: "tool-searchRecipes"; state: "output-available"; input: { query: string }; output: SearchRecipesResult }
  | { type: "tool-searchRecipes"; state: "output-error"; input: { query: string }; errorText: string };

// ── Prompt chips shown in the first-run empty state ──────────────────────────
// Clicking a chip fills the input — they're conversation starters, not
// canned replies. The user can edit before sending.
const PROMPT_CHIPS = [
  "What can I make with chicken and rice?",
  "Quick vegetarian dinner ideas",
  "Easy pasta recipes",
  "Desserts using bananas",
];

// ── Tool-lifecycle sub-components ─────────────────────────────────────────────

// States 1 & 2: args streaming in, or args ready but execute() not yet done
function ToolSearching({ query }: { query?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3">
      <Loader className="h-3.5 w-3.5 shrink-0 animate-spin text-accent" />
      <span className="text-xs text-muted">
        {query ? (
          <>
            Searching for{" "}
            <span className="text-foreground">&ldquo;{query}&rdquo;</span>
            &hellip;
          </>
        ) : (
          "Preparing search…"
        )}
      </span>
    </div>
  );
}

// State 4: execute() threw (output-error) or our controlled error (output.error)
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

// ── Status announcer — AI-specific a11y ──────────────────────────────────────
// Announces response completion to AT via a visually-hidden live region.
// This fires once when streaming ends, not on every streamed character,
// so the AT queue doesn't flood. role="status" implies aria-live="polite".
function StatusAnnouncer({
  status,
  messages,
  isBusy,
}: {
  status: string;
  messages: ReturnType<typeof useChat>["messages"];
  isBusy: boolean;
}) {
  const [announcement, setAnnouncement] = useState("");
  const prevBusy = useRef(false);

  useEffect(() => {
    if (prevBusy.current && !isBusy && status === "idle") {
      const lastAssistant = [...messages]
        .reverse()
        .find((m) => m.role === "assistant");
      if (lastAssistant) {
        const text = lastAssistant.parts
          .filter(isTextUIPart)
          .map((p) => p.text)
          .join(" ")
          .slice(0, 160);
        setAnnouncement(text || "Response received.");
      }
    }
    prevBusy.current = isBusy;
  }, [isBusy, status, messages]);

  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {announcement}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AssistantPage() {
  const [input, setInput] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ai@7 renames `reload` → `regenerate` and adds `clearError`.
  // regenerate() re-sends the last request without adding a new user message.
  // clearError() wipes the error state so the UI can re-enable the input.
  const { messages, sendMessage, status, stop, error, regenerate, clearError } =
    useChat({
      transport: new DefaultChatTransport({ api: "/api/chat" }),
    });

  const isBusy = status === "submitted" || status === "streaming";
  const lastMessage = messages[messages.length - 1];

  // Keep the thinking indicator up until the first text token arrives so
  // there is no blank frame between the dots and the streamed response.
  const isThinking =
    status === "submitted" ||
    (status === "streaming" &&
      lastMessage?.role === "assistant" &&
      !lastMessage.parts.some(
        (part) => isTextUIPart(part) && part.text.trim().length > 0
      ));

  const [slowResponse, setSlowResponse] = useState(false);

  // Show a "taking longer than usual" note after 8 s of thinking.
  // Clears as soon as a response arrives.
  useEffect(() => {
    if (!isThinking) { setSlowResponse(false); return; }
    const t = setTimeout(() => setSlowResponse(true), 8000);
    return () => clearTimeout(t);
  }, [isThinking]);
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
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

  // Retry: clear the error flag, then regenerate re-issues the last
  // request without adding a duplicate user message to the thread.
  function handleRetry() {
    clearError();
    regenerate();
  }

  // Chip click fills the textarea so the user can review before sending.
  function handleChipClick(chip: string) {
    setInput(chip);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 min-h-0 flex-col px-4">
      <header className="flex items-center gap-2 border-b border-border py-4">
        <ChefHat className="h-5 w-5 text-accent" aria-hidden="true" />
        <h1 className="text-lg font-semibold text-foreground">
          Recipe Assistant
        </h1>
      </header>

      {/* Visually-hidden live region announces streaming status to AT
          without exposing every streamed character. Updated once per
          response cycle via the useEffect below. */}
      <StatusAnnouncer status={status} messages={messages} isBusy={isBusy} />

      {/* role="log" implies aria-live="polite" + aria-relevant="additions".
          New message bubbles are announced when added; streaming character
          changes inside an existing bubble are not re-announced, which
          avoids flooding the AT output queue. */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        role="log"
        aria-label="Conversation history"
        aria-busy={isBusy}
        className="relative flex-1 min-h-0 flex flex-col gap-5 overflow-y-auto overscroll-y-contain py-6"
      >
          {messages.length === 0 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted">
                What&apos;s in your fridge? I&apos;ll figure out dinner.
              </p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested prompts">
                {PROMPT_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent/50 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) =>
            message.role === "user" ? (
              <div
                key={message.id}
                className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-surface px-4 py-2"
              >
                {message.parts.map((part, index) =>
                  isTextUIPart(part) ? (
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
                <ChefHat className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <div className="min-w-0 flex-1 flex flex-col gap-3 text-sm text-foreground [&_a]:text-accent [&_h1]:mt-0 [&_h2]:mt-0 [&_h3]:mt-0">
                  {message.parts.map((part, index) => {
                    const key = `${message.id}-${index}`;

                    if (isTextUIPart(part)) {
                      return <Streamdown key={key}>{part.text}</Streamdown>;
                    }

                    if (part.type === "tool-searchRecipes") {
                      const tp = part as unknown as SearchRecipesPart;

                      if (tp.state === "input-streaming") {
                        return <ToolSearching key={key} />;
                      }

                      if (tp.state === "input-available") {
                        return (
                          <ToolSearching key={key} query={tp.input.query} />
                        );
                      }

                      if (tp.state === "output-available") {
                        const res = tp.output;
                        if (res.error) {
                          return <ToolError key={key} message={res.error} />;
                        }
                        return <RecipeToolResult key={key} result={res} />;
                      }

                      if (tp.state === "output-error") {
                        return (
                          <ToolError
                            key={key}
                            message={tp.errorText ?? "Search failed"}
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

          {/* role="status" + aria-live="polite" announces the thinking state
              once without repeating per-frame. motion-reduce disables the
              animation but keeps the indicator visible. */}
          {isThinking && (
            <div className="flex flex-col gap-1">
              <div
                className="flex items-center gap-2"
                role="status"
                aria-label="Flavorly is thinking"
              >
                <ChefHat className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <div className="flex items-center gap-1" aria-hidden="true">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/70 [animation-delay:-0.3s] motion-reduce:animate-none" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/70 [animation-delay:-0.15s] motion-reduce:animate-none" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/70 motion-reduce:animate-none" />
                </div>
              </div>
              {slowResponse && (
                <p className="pl-6 text-xs text-muted">
                  Taking a little longer than usual — still working on it&hellip;
                </p>
              )}
            </div>
          )}

          {/* role="alert" causes immediate announcement regardless of
              aria-live polite queue — errors are urgent information. */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
            >
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-sm font-medium text-red-400">
                    Response failed
                  </p>
                  <p className="text-xs text-red-400/70">
                    {error?.message && !error.message.includes("undefined")
                      ? error.message
                      : "Connection interrupted or the model timed out."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="flex w-fit items-center gap-1.5 rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  <RefreshCw className="h-3 w-3" aria-hidden="true" />
                  Retry
                </button>
              </div>
            </div>
          )}
        {!autoScroll && (
          <div className="sticky bottom-0 flex justify-center pb-2 pt-1">
            <button
              type="button"
              onClick={jumpToLatest}
              className="flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-foreground shadow-lg backdrop-blur transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ArrowDown className="h-3 w-3" aria-hidden="true" />
              Jump to latest
            </button>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border py-4"
      >
        {/* aria-label is the accessible name; placeholder is only a hint
            and is not read reliably by all screen reader / browser combos. */}
        <label htmlFor="chat-input" className="sr-only">
          Ask about a recipe
        </label>
        <input
          id="chat-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about a recipe…"
          disabled={isBusy}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-full border border-border bg-surface px-4 py-2 text-base text-foreground outline-none transition-colors placeholder:text-muted focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
        />
        {isBusy ? (
          <button
            type="button"
            onClick={stop}
            aria-label="Stop generating"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95"
          >
            <Square className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-background transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95 disabled:pointer-events-none disabled:bg-surface disabled:text-muted"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </form>
    </div>
  );
}
