"use client";

import { useState } from "react";
import { useFileSystem } from "@/lib/contexts/file-system-context";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, FileCode } from "lucide-react";

export function EntryPointSelector() {
  const { getAllFiles, entryPoint, setEntryPoint } = useFileSystem();
  const [isOpen, setIsOpen] = useState(false);

  // Get all JSX/TSX files
  const allFiles = getAllFiles();
  const reactFiles = Array.from(allFiles.keys())
    .filter((path) => path.endsWith(".jsx") || path.endsWith(".tsx"))
    .sort();

  if (reactFiles.length === 0) {
    return null;
  }

  // Get the display name for current entry point
  const currentEntryName = entryPoint ? entryPoint.split("/").pop() || entryPoint : "No entry point";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between"
          disabled={reactFiles.length === 0}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileCode className="h-4 w-4 shrink-0" />
            <span className="text-xs truncate">Entry: {currentEntryName}</span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search entry point..."
            className="border-none"
          />
          <CommandList>
            <CommandEmpty>No React files found</CommandEmpty>
            <CommandGroup heading="React Components">
              {reactFiles.map((path) => {
                const fileName = path.split("/").pop() || path;
                return (
                  <CommandItem
                    key={path}
                    value={path}
                    onSelect={(value) => {
                      setEntryPoint(value);
                      setIsOpen(false);
                    }}
                    className="text-xs cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        entryPoint === path ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileCode className="h-3 w-3 shrink-0" />
                      <span className="truncate">{fileName}</span>
                    </div>
                    <span className="text-xs text-gray-500 ml-1 shrink-0">
                      {path}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
