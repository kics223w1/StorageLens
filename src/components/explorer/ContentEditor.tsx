
import React, { useMemo } from "react";
import Editor from "@monaco-editor/react";
import { useStorageStore } from "@/store/storage-store";

export function ContentEditor() {
  const { selectedRecord } = useStorageStore();

  const { content, language } = useMemo(() => {
    if (!selectedRecord) {
      return { content: "", language: "json" };
    }

    let rawValue = "";
    // Handle different record types
    if ('value' in selectedRecord) {
        rawValue = selectedRecord.value; // LocalStorage, SessionStorage, Cookie
    } else {
        // IndexedDB or generic object
        rawValue = JSON.stringify(selectedRecord, null, 2);
    }

    try {
      // Check if the string value is actually a JSON string
      const parsed = JSON.parse(rawValue);
      return {
          content: JSON.stringify(parsed, null, 2),
          language: "json"
      };
    } catch {
      // Not a JSON string, just display raw
      return {
          content: rawValue,
          language: "plaintext"
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
            <span className="text-xs font-semibold text-muted-foreground">Editor</span>
            <span className="text-xs text-muted-foreground ml-auto uppercase">{language}</span>
       </div>
       <div className="flex-1 min-h-0 relative">
          <Editor
            height="100%"
            defaultLanguage="json"
            language={language}
            value={content}
            theme="vs-dark" // Deepmind styling preference
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
