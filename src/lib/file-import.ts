/**
 * Utility to read files from disk using FileReader API
 * and prepare them for import into the virtual file system
 */

export interface ImportedFile {
  path: string;
  content: string;
  extension: string;
}

/**
 * Validates if a file should be imported based on extension
 */
function isValidFileType(fileName: string): boolean {
  const validExtensions = ['.jsx', '.tsx', '.js', '.ts', '.css'];
  return validExtensions.some((ext) => fileName.endsWith(ext));
}

/**
 * Normalizes the file path - removes leading slashes and preserves structure
 * If user uploads /path/to/file.jsx, store as path/to/file.jsx in root
 */
export function normalizePath(fullPath: string): string {
  // Remove leading forward or backward slashes
  let normalized = fullPath.replace(/^[\/]+/, '');
  
  // Prepend / for virtual file system (e.g., 'path/to/file.jsx' -> '/path/to/file.jsx')
  return '/' + normalized;
}

/**
 * Reads files from FileList (from input or drag-drop) and converts to ImportedFile array
 * @param files FileList from input element or drag-drop event
 * @returns Promise<ImportedFile[]> Array of files with content and validated paths
 */
export async function readFilesFromDisk(files: FileList): Promise<ImportedFile[]> {
  const importedFiles: ImportedFile[] = [];
  const errors: string[] = [];

  // Convert FileList to Array and filter for valid types
  const validFiles = Array.from(files).filter((file) => {
    if (!isValidFileType(file.name)) {
      errors.push(`Skipped ${file.name}: Only .jsx, .tsx, .js, .ts, and .css files are supported`);
      return false;
    }
    return true;
  });

  // Read each file asynchronously
  const readPromises = validFiles.map((file) => {
    return new Promise<ImportedFile>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const path = normalizePath(file.webkitRelativePath || file.name);
          const extension = file.name.split('.').pop() || '';

          resolve({
            path,
            content,
            extension,
          });
        } catch (error) {
          reject(new Error(`Failed to read ${file.name}: ${error}`));
        }
      };

      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${file.name}`));
      };

      reader.readAsText(file);
    });
  });

  try {
    const results = await Promise.all(readPromises);
    importedFiles.push(...results);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error reading files');
  }

  if (errors.length > 0) {
    console.warn('File import warnings:', errors);
  }

  return importedFiles;
}

/**
 * Finds entry point candidates (App.jsx, App.tsx, index.jsx, index.tsx)
 * from a list of imported files
 */
export function findEntryPointCandidates(files: ImportedFile[]): string[] {
  const candidates: string[] = [];
  const possibleNames = ['App.jsx', 'App.tsx', 'index.jsx', 'index.tsx', 'main.jsx', 'main.tsx'];

  for (const file of files) {
    const fileName = file.path.split('/').pop();
    if (fileName && possibleNames.includes(fileName)) {
      candidates.push(file.path);
    }
  }

  // Also return all .jsx/.tsx files sorted, in case user wants to choose
  const allReactFiles = files
    .filter((f) => f.extension === 'jsx' || f.extension === 'tsx')
    .map((f) => f.path)
    .sort();

  return candidates.length > 0 ? candidates : allReactFiles;
}
