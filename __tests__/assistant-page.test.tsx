/**
 * AssistantPage — component tests
 *
 * useChat is mocked: we never hit the real API.
 * next/image and streamdown are also stubbed so jsdom can render the page.
 *
 * These tests cover:
 *   - The first-run empty state (prompt chips are conversation starters)
 *   - Chip click fills the textarea
 *   - The chat-level error state renders with a working retry button
 *   - The thinking indicator appears while status === 'submitted'
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Module mocks ─────────────────────────────────────────────────────────────

// next/image → plain <img>
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...rest
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} {...rest} />,
}));

// streamdown → plain <span> so markdown rendering doesn't complicate assertions
vi.mock("streamdown", () => ({
  Streamdown: ({ children }: { children: string }) => <span>{children}</span>,
}));

// @ai-sdk/react — useChat is mocked; we control every field.
const mockSendMessage = vi.fn();
const mockStop = vi.fn();
const mockRegenerate = vi.fn();
const mockClearError = vi.fn();

const defaultUseChat = {
  // typed as unknown[] so individual tests can push mock message objects
  // without fighting the SDK's generic UIMessage<TOOLS> constraint.
  messages: [] as unknown[],
  sendMessage: mockSendMessage,
  status: "idle" as string,
  stop: mockStop,
  error: undefined as Error | undefined,
  regenerate: mockRegenerate,
  clearError: mockClearError,
};

vi.mock("@ai-sdk/react", () => ({
  useChat: () => mockUseChatState,
}));

// Mutable state that individual tests can override.
let mockUseChatState = { ...defaultUseChat };

// ── Component under test ─────────────────────────────────────────────────────
// Import after mocks are established.
import AssistantPage from "@/app/assistant/page";

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockUseChatState = { ...defaultUseChat };
  vi.clearAllMocks();
});

describe("AssistantPage", () => {
  describe("first-run empty state", () => {
    it("shows the welcome tagline when there are no messages", () => {
      render(<AssistantPage />);

      expect(
        screen.getByText(/what.s in your fridge/i)
      ).toBeInTheDocument();
    });

    it("renders all four prompt chips", () => {
      render(<AssistantPage />);

      const chips = screen.getAllByRole("button", {
        name: /chicken|vegetarian|pasta|bananas/i,
      });
      expect(chips.length).toBeGreaterThanOrEqual(4);
    });

    it("clicking a chip copies its text into the input field", async () => {
      const user = userEvent.setup();
      render(<AssistantPage />);

      const chipText = "Easy pasta recipes";
      await user.click(screen.getByRole("button", { name: chipText }));

      const input = screen.getByRole("textbox");
      expect(input).toHaveValue(chipText);
    });

    it("hides prompt chips once messages exist", () => {
      mockUseChatState = {
        ...defaultUseChat,
        messages: [
          {
            id: "msg-1",
            role: "user" as const,
            parts: [{ type: "text" as const, text: "Hello" }],
          },
        ],
      };
      render(<AssistantPage />);

      expect(
        screen.queryByText(/what.s in your fridge/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("thinking indicator", () => {
    it("renders the thinking dots when status is 'submitted'", () => {
      mockUseChatState = { ...defaultUseChat, status: "submitted" };
      render(<AssistantPage />);

      // The three animated spans have motion-reduce:animate-none so they're
      // always present in the DOM when thinking.
      const scrollArea = document.querySelector(
        "[class*='overflow-y-auto']"
      ) as HTMLElement;

      // Look for the animated bounce dots inside the scroll area.
      const bounceDots = scrollArea.querySelectorAll(
        "[class*='animate-bounce']"
      );
      expect(bounceDots.length).toBe(3);
    });
  });

  describe("chat-level error state", () => {
    it("shows the 'Response failed' error panel when error is set", () => {
      mockUseChatState = {
        ...defaultUseChat,
        error: new Error("Rate limited"),
      };
      render(<AssistantPage />);

      expect(screen.getByText("Response failed")).toBeInTheDocument();
    });

    it("shows a Retry button in the error state", () => {
      mockUseChatState = {
        ...defaultUseChat,
        error: new Error("Rate limited"),
      };
      render(<AssistantPage />);

      expect(
        screen.getByRole("button", { name: /retry/i })
      ).toBeInTheDocument();
    });

    it("clicking Retry calls clearError then regenerate", async () => {
      mockUseChatState = {
        ...defaultUseChat,
        error: new Error("Rate limited"),
      };
      const user = userEvent.setup();
      render(<AssistantPage />);

      await user.click(screen.getByRole("button", { name: /retry/i }));

      expect(mockClearError).toHaveBeenCalledOnce();
      expect(mockRegenerate).toHaveBeenCalledOnce();
    });
  });

  describe("send / stop controls", () => {
    it("renders the Send button when idle", () => {
      render(<AssistantPage />);

      expect(
        screen.getByRole("button", { name: "Send message" })
      ).toBeInTheDocument();
    });

    it("Send button is disabled when input is empty", () => {
      render(<AssistantPage />);

      expect(
        screen.getByRole("button", { name: "Send message" })
      ).toBeDisabled();
    });

    it("renders the Stop button while streaming", () => {
      mockUseChatState = { ...defaultUseChat, status: "streaming" };
      render(<AssistantPage />);

      expect(
        screen.getByRole("button", { name: "Stop generating" })
      ).toBeInTheDocument();
    });
  });
});
