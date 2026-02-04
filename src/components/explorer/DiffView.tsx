
import React, { useMemo, useState } from 'react';
import { StorageSnapshot, snapshotManager } from "@/core/snapshot";
import { flattenDelta, DiffResult } from "@/core/diff-helper";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiffEditor } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

interface DiffViewProps {
  currentSnapshot: StorageSnapshot;
  previousSnapshot: StorageSnapshot | undefined;
}

export function DiffView({ currentSnapshot, previousSnapshot }: DiffViewProps) {
  const { theme } = useTheme();
  // State to track selected key to show in diff editor
  // Store separate selection for each tab? Or global? Global is simpler for now but resetting on tab change is better.
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("local");

  const diffs = useMemo(() => {
     if (!previousSnapshot) {
         return {
             local: Object.entries(currentSnapshot.localStorage).map(([key, val]) => ({ key, status: 'added' as const, oldValue: undefined, newValue: val })),
             session: Object.entries(currentSnapshot.sessionStorage).map(([key, val]) => ({ key, status: 'added' as const, oldValue: undefined, newValue: val })),
             indexedDB: [], 
         }
     }

     const localDelta = snapshotManager.diffObjects(previousSnapshot.localStorage, currentSnapshot.localStorage);
     const sessionDelta = snapshotManager.diffObjects(previousSnapshot.sessionStorage, currentSnapshot.sessionStorage);
     const idbDelta = snapshotManager.diffObjects(previousSnapshot.indexedDB, currentSnapshot.indexedDB);

     return {
         local: flattenDelta(localDelta, previousSnapshot.localStorage, currentSnapshot.localStorage),
         session: flattenDelta(sessionDelta, previousSnapshot.sessionStorage, currentSnapshot.sessionStorage),
         indexedDB: flattenDelta(idbDelta, previousSnapshot.indexedDB, currentSnapshot.indexedDB),
     };
  }, [currentSnapshot, previousSnapshot]);

  const formatValue = (value: any): string => {
      if (value === undefined || value === null) return "";
      if (typeof value === 'object') {
          return JSON.stringify(value, null, 2);
      }
      if (typeof value === 'string') {
          try {
              const parsed = JSON.parse(value);
              return JSON.stringify(parsed, null, 2);
          } catch {
              return value;
          }
      }
      return String(value);
  };

  // Reset selection when snapshot changes
  React.useEffect(() => {
      setSelectedKey(null);
  }, [currentSnapshot.id]);

  const activeDiffs = useMemo(() => {
      if (activeTab === 'local') return diffs.local;
      if (activeTab === 'session') return diffs.session;
      if (activeTab === 'idb') return diffs.indexedDB;
      return [];
  }, [activeTab, diffs]);

  const selectedDiffItem = useMemo(() => {
      if (!selectedKey) return null;
      return activeDiffs.find(d => d.key === selectedKey);
  }, [selectedKey, activeDiffs]);

  const renderDiffList = (items: DiffResult[]) => {
      if (items.length === 0) return <div className="p-4 text-center text-muted-foreground text-sm">No changes detected.</div>;

      return (
          <div className="flex flex-col">
              {items.map((item) => {
                  let badgeColor = "bg-gray-100 text-gray-800";
                  let statusText = "Unchanged";
                  
                  switch(item.status) {
                      case 'added': 
                        badgeColor = "bg-green-100 text-green-800 border-green-200"; 
                        statusText = "Created";
                        break;
                      case 'removed': 
                        badgeColor = "bg-red-100 text-red-800 border-red-200";
                        statusText = "Deleted";
                        break;
                      case 'modified': 
                        badgeColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
                        statusText = "Updated";
                        break;
                  }

                  return (
                      <button
                          key={item.key}
                          onClick={() => setSelectedKey(item.key)}
                          className={`flex items-center justify-between p-3 text-sm border-b hover:bg-muted/50 transition-colors text-left ${selectedKey === item.key ? 'bg-muted' : ''}`}
                      >
                          <span className="font-mono truncate mr-2" title={item.key}>{item.key}</span>
                          <Badge variant="outline" className={`text-[10px] px-1 py-0 ${badgeColor}`}>{statusText}</Badge>
                      </button>
                  );
              })}
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full bg-background no-doc-scroll"> 
        <div className="p-3 border-b bg-background flex items-center justify-between shrink-0">
             <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Compare:</span>
                <span className="text-sm font-semibold">
                    {new Date(currentSnapshot.timestamp).toLocaleTimeString()} 
                </span>
                <span className="text-xs text-muted-foreground">vs</span>
                <span className="text-sm font-semibold">
                     {previousSnapshot ? new Date(previousSnapshot.timestamp).toLocaleTimeString() : 'Initial'}
                </span>
            </div>
            
             <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelectedKey(null); }} className="h-8">
                <TabsList className="h-8">
                    <TabsTrigger value="local" className="text-xs h-7">Local ({diffs.local.length})</TabsTrigger>
                    <TabsTrigger value="session" className="text-xs h-7">Session ({diffs.session.length})</TabsTrigger>
                    <TabsTrigger value="idb" className="text-xs h-7">DB ({diffs.indexedDB.length})</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>

        <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
            <ResizablePanel defaultSize={30} minSize={20}>
                <ScrollArea className="h-full">
                    {renderDiffList(activeDiffs)}
                </ScrollArea>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={70}>
                {selectedDiffItem ? (
                     <div className="h-full w-full">
                         <DiffEditor
                            height="100%"
                            language="json"
                            theme={theme === 'dark' ? "vs-dark" : "light"}
                            original={formatValue(selectedDiffItem.oldValue)}
                            modified={formatValue(selectedDiffItem.newValue)}
                            options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                fontSize: 12,
                                lineNumbers: "on",
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                renderSideBySide: true,
                            }}
                         />
                     </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/50">
                        <p>Select a key to view differences</p>
                    </div>
                )}
            </ResizablePanel>
        </ResizablePanelGroup>
    </div>
  );
}
