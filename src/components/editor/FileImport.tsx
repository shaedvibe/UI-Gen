"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readFilesFromDisk, findEntryPointCandidates, ImportedFile } from "@/lib/file-import";
import { useFileSystem } from "@/lib/contexts/file-system-context";
import { cn } from "@/lib/utils";

export function FileImport() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
    count?: number;
  }>({ type: null, message: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createFile, setEntryPoint } = useFileSystem();

  const handleImportFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const importedFiles = await readFilesFromDisk(files);

      if (importedFiles.length === 0) {
        setStatus({
          type: "error",
          message: "No valid JSX/TSX/CSS files found. Please select supported file types.",
        });
        setIsLoading(false);
        return;
      }

      // Create all files in the file system
      for (const file of importedFiles) {
        createFile(file.path, file.content);
      }

      // Find entry point candidates
      const candidates = findEntryPointCandidates(importedFiles);
      if (candidates.length > 0) {
        // Automatically set the first candidate as entry point
        setEntryPoint(candidates[0]);
      }

      setStatus({
        type: "success",
        message: `Successfully imported ${importedFiles.length} file${importedFiles.length !== 1 ? "s" : ""}`,
        count: importedFiles.length,
      });

      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatus({ type: null, message: "" });
      }, 3000);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to import files",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    handleImportFiles(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImportFiles(e.target.files);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-4 transition-colors",
        isDragActive
          ? "border-blue-400 bg-blue-50"
          : "border-gray-300 hover:border-gray-400 bg-white",
        isLoading && "opacity-60 pointer-events-none"
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        data-testid="file-input"
        ref={fileInputRef}
        type="file"
        multiple
        accept=".jsx,.tsx,.js,.ts,.css"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          ) : (
            <Upload className="h-5 w-5 text-gray-400" />
          )}
          <p className="text-sm font-medium text-gray-700">
            {isLoading ? "Importing files..." : "Import JSX/TSX/CSS files"}
          </p>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Drag and drop files here or{" "}
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={handleButtonClick}
            disabled={isLoading}
          >
            click to browse
          </Button>
        </p>

        {status.type && (
          <div
            className={cn(
              "flex items-center gap-2 mt-2 p-2 rounded text-xs",
              status.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            )}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{status.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
