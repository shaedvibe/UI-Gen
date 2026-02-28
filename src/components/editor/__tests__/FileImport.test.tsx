import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { FileImport } from "@/components/editor/FileImport";
import { useFileSystem } from "@/lib/contexts/file-system-context";
import * as fileImportUtil from "@/lib/file-import";

vi.mock("@/lib/contexts/file-system-context");
vi.mock("@/lib/contexts/chat-context", () => ({
  useChat: () => ({
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

test("imports files and sets entry point", async () => {
  const createFile = vi.fn();
  const setEntryPoint = vi.fn();

  // mock context
  const mockUse = useFileSystem as unknown as vi.Mock;
  mockUse.mockReturnValue({ createFile, setEntryPoint });

  // stub utility to return two files with candidate
  const fakeFiles = [
    { path: "/App.jsx", content: "x", extension: "jsx" },
    { path: "/styles.css", content: "body{}", extension: "css" },
  ];
  vi.spyOn(fileImportUtil, "readFilesFromDisk").mockResolvedValue(fakeFiles as any);

  render(<FileImport />);

  const input = screen.getByTestId("file-input") as HTMLInputElement | null;
  expect(input).toBeTruthy();

  // simulate file selection by firing change event with dummy File
  const file = new File([""], "App.jsx", { type: "text/jsx" });
  fireEvent.change(input, { target: { files: [file] } });

  // wait for success message to appear (imports complete)
  await screen.findByText(/Successfully imported/);

  expect(fileImportUtil.readFilesFromDisk).toHaveBeenCalled();
  expect(createFile).toHaveBeenCalledWith("/App.jsx", "x");
  expect(createFile).toHaveBeenCalledWith("/styles.css", "body{}");
  expect(setEntryPoint).toHaveBeenCalledWith("/App.jsx");
});
