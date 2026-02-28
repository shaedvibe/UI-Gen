import { test, expect } from "vitest";
import { readFilesFromDisk, normalizePath, findEntryPointCandidates, ImportedFile } from "../file-import";

// utilities

test("normalizePath removes leading slashes and adds root slash", () => {
  expect(normalizePath("foo.jsx")).toBe("/foo.jsx");
  expect(normalizePath("/foo/bar.tsx")).toBe("/foo/bar.tsx");
});

test("findEntryPointCandidates picks common entry files", () => {
  const files: ImportedFile[] = [
    { path: "/App.jsx", content: "", extension: "jsx" },
    { path: "/src/Button.tsx", content: "", extension: "tsx" },
  ];
  expect(findEntryPointCandidates(files)).toEqual(["/App.jsx"]);

  const files2: ImportedFile[] = [
    { path: "/Component.jsx", content: "", extension: "jsx" },
    { path: "/Other.tsx", content: "", extension: "tsx" },
  ];
  expect(findEntryPointCandidates(files2)).toEqual(["/Component.jsx", "/Other.tsx"]);
});
