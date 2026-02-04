
"use client";

import { useMemo } from "react";
import Editor from "@monaco-editor/react";
import { useStorageStore } from "@/store/storage-store";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContentEditor() {
  const { selectedRecord } = useStorageStore();
  const { theme, setTheme } = useTheme();

  const { content, language, label } = useMemo(() => {
    if (!selectedRecord) {
      return { content: "", language: "json", label: "Editor" };
    }

    let rawValue = "";
    let displayLabel = "Editor";

    // Handle different record types
    if ('value' in selectedRecord) {
        // LocalStorage, SessionStorage (StorageRecord) or Cookie (CookieRecord)
        rawValue = selectedRecord.value; 
        
        if ('key' in selectedRecord) displayLabel = selectedRecord.key;
        else if ('name' in selectedRecord) displayLabel = selectedRecord.name;
    } else {
        // IndexedDB (IndexedDBRecord)
        rawValue = JSON.stringify(selectedRecord, null, 2);
        if ('name' in selectedRecord) displayLabel = selectedRecord.name;
    }

    try {
      // Check if the string value is actually a JSON string
      const parsed = JSON.parse(rawValue);
      return {
          content: JSON.stringify(parsed, null, 2),
          language: "json",
          label: displayLabel
      };
    } catch {
      // Not a JSON string, just display raw
      return {
          content: rawValue,
          language: "plaintext",
          label: displayLabel
      };
    }
  }, [selectedRecord]);

  if (!selectedRecord) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/10">
        <p>Select a row to view details</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border-t">
       <div className="h-10 flex items-center px-4 border-b bg-muted/40 shrink-0 gap-2">
            <span className="text-xs font-semibold text-muted-foreground truncate max-w-[200px]" title={label}>{label}</span>
            <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-muted-foreground uppercase">{language}</span>
                <div className="h-4 w-px bg-border mx-1" />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                    <Sun className="h-3 w-3 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-3 w-3 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>
       </div>
       <div className="flex-1 min-h-0 relative">
          <Editor
            height="100%"
            defaultLanguage="json"
            language={language}
            value={content}
            theme={theme === 'dark' ? "vs-dark" : "light"}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 12,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 10 }
            }}
          />
       </div>
    </div>
  );
}
