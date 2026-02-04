
"use client";

import { useMemo } from "react";
import Editor from "@monaco-editor/react";
import { useStorageStore } from "@/store/storage-store";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CookieRecord } from "@/core/adapters/cookies";
import { cn } from "@/lib/utils";

export function ContentEditor() {
  const { selectedRecord, selectedCategory } = useStorageStore();
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

  if (selectedCategory === 'cookies' && selectedRecord && 'name' in selectedRecord) {
    const cookie = selectedRecord as CookieRecord;
    return (
      <div className="h-full flex flex-col border-t bg-background">
        <div className="h-8 flex items-center px-4 border-b bg-muted/40 shrink-0">
          <span className="text-xs font-semibold text-muted-foreground">Data</span>
        </div>
        <div className="flex-1 overflow-auto p-4 font-mono text-xs">
          <div className="grid gap-1">
            <div className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-medium">{cookie.name}:</span>
              <span className="text-red-600 dark:text-orange-400">"{cookie.value}"</span>
            </div>

            <div className="pl-4 border-l-2 border-border/50 ml-1 mt-1 space-y-1">
              <DetailRow label="Created" value={new Date().toUTCString()} />
              <DetailRow label="Domain" value={`"${cookie.domain}"`} />
              <DetailRow label="Expires / Max-Age" value={typeof cookie.expires === 'number' ? `"${new Date(cookie.expires).toUTCString()}"` : `"${cookie.expires}"`} />
              <DetailRow label="HostOnly" value={!cookie.domain.startsWith('.') ? "true" : "false"} isBoolean />
              <DetailRow label="HttpOnly" value={String(cookie.httpOnly)} isBoolean />
              <DetailRow label="Last Accessed" value={new Date().toUTCString()} />
              <DetailRow label="Path" value={`"${cookie.path}"`} />
              <DetailRow label="SameSite" value={`"${cookie.sameSite}"`} />
              <DetailRow label="Secure" value={String(cookie.secure)} isBoolean />
              <DetailRow label="Size" value={String(cookie.size)} />
              <DetailRow label="Updated" value={new Date().toUTCString()} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for other types using Monaco Editor
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

function DetailRow({ label, value, isBoolean = false }: { label: string, value: string, isBoolean?: boolean }) {
  return (
    <div className="flex gap-2">
      <span className="text-blue-600 dark:text-blue-400">{label}:</span>
      <span className={cn(
        "break-all",
        isBoolean ? "text-purple-600 dark:text-purple-400" : "text-foreground"
      )}>{value}</span>
    </div>
  );
}
