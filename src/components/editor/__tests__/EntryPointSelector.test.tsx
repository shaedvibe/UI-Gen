import { test, expect, vi, afterEach, beforeAll } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { EntryPointSelector } from "@/components/editor/EntryPointSelector";
import { useFileSystem } from "@/lib/contexts/file-system-context";

beforeAll(() => {
  // provide simple ResizeObserver mock for components that depend on it
  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (global as any).ResizeObserver = MockResizeObserver;
  // mock scrollIntoView used by cmdk list
  HTMLElement.prototype.scrollIntoView = function() {};
});

// mock the context
vi.mock("@/lib/contexts/file-system-context");

// mock icons to reduce noise
vi.mock("lucide-react", () => ({
  FileCode: ({ className }: { className?: string }) => <div className={className}>icon</div>,
  Check: ({ className }: { className?: string }) => <div className={className}>check</div>,
  ChevronDown: ({ className }: { className?: string }) => <div className={className}>down</div>,
  Search: ({ className }: { className?: string }) => <div className={className}>search</div>,
  SearchIcon: ({ className }: { className?: string }) => <div className={className}>search</div>,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

test("renders nothing when no react files exist", () => {
  const mockUse = useFileSystem as unknown as vi.Mock;
  mockUse.mockReturnValue({
    getAllFiles: () => new Map(),
    entryPoint: null,
    setEntryPoint: vi.fn(),
  });

  const { container } = render(<EntryPointSelector />);
  expect(container.firstChild).toBeNull();
});

test("shows current entry point and allows selection", async () => {
  const files = new Map([
    ["/App.jsx", "content"],
    ["/Other.jsx", "content"],
    ["/component.tsx", "content"],
  ]);
  const mockSet = vi.fn();
  const mockUse = useFileSystem as unknown as vi.Mock;
  mockUse.mockReturnValue({
    getAllFiles: () => files,
    entryPoint: "/App.jsx",
    setEntryPoint: mockSet,
  });

  render(<EntryPointSelector />);

  // button should show "Entry: App.jsx"
  const btn = screen.getByText(/Entry:/);
  expect(btn.textContent).toContain("App.jsx");

  // open dropdown
  fireEvent.click(screen.getByRole("button"));
  // options should appear
  expect(screen.getByText("App.jsx")).toBeDefined();
  expect(screen.getByText("Other.jsx")).toBeDefined();

  // select a different entry point
  fireEvent.click(screen.getByText("Other.jsx"));
  expect(mockSet).toHaveBeenCalledWith("/Other.jsx");
});
