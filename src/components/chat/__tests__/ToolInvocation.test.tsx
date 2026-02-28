import { test, expect, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolInvocation } from "../ToolInvocation";

describe("ToolInvocation component", () => {
  test("shows friendly text when str_replace_editor create command completes", () => {
    const tool = {
      toolName: "str_replace_editor",
      args: { command: "create", path: "/foo.js" },
      state: "result",
      result: "File created",
    };

    render(<ToolInvocation tool={tool} />);
    expect(screen.getByText("Creating file /foo.js")).toBeDefined();
    expect(screen.getByText((content) => content.startsWith("Creating"))).toBeDefined();
  });

  test("shows friendly text when str_replace_editor insert command is loading", () => {
    const tool = {
      toolName: "str_replace_editor",
      args: { command: "insert", path: "/bar.ts" },
      state: "pending",
    };

    render(<ToolInvocation tool={tool} isLoading={true} />);
    expect(screen.getByText("Inserting into file /bar.ts")).toBeDefined();
  });

  test("falls back to tool name for unknown tools", () => {
    const tool = {
      toolName: "mystery_tool",
      args: {},
      state: "result",
      result: "whatever",
    };

    render(<ToolInvocation tool={tool} />);
    expect(screen.getByText("mystery_tool")).toBeDefined();
  });
});