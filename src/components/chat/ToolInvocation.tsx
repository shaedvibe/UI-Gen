"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface ToolInvocationProps {
  tool: any; // the shape coming from ai library
  isLoading?: boolean;
}

/**
 * Display a friendly description for a tool invocation.
 * For `str_replace_editor` we translate the raw name/args into a
 * human readable sentence (eg. "Creating file /foo.js").
 * Other tools fall back to their name.
 */
export function ToolInvocation({ tool, isLoading = false }: ToolInvocationProps) {
  const { toolName, args = {} as Record<string, any>, result } = tool;

  const renderStrReplace = () => {
    const command = args.command as string | undefined;
    const path = args.path as string | undefined;

    switch (command) {
      case "create":
        return `Creating file ${path || "<unknown>"}`;
      case "str_replace":
        return `Editing file ${path || "<unknown>"}`;
      case "insert":
        return `Inserting into file ${path || "<unknown>"}`;
      case "view":
        return `Viewing file ${path || "<unknown>"}`;
      default:
        return `${command || "Performing action"} on ${path || "<unknown>"}`;
    }
  };

  const message =
    toolName === "str_replace_editor" ? renderStrReplace() : toolName;

  return (
    <>
      {isLoading ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{message}</span>
        </>
      ) : (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{message}</span>
        </>
      )}
    </>
  );
}
