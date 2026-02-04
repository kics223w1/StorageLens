
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { StorageSnapshot } from "@/core/snapshot";
import { Download } from "lucide-react";

interface TimeMachineSidebarProps {
  snapshots: StorageSnapshot[];
  selectedSnapshotId: string | null;
  onSelectSnapshot: (id: string) => void;
  onTakeSnapshot: () => void;
  onDownloadSnapshot: (snapshot: StorageSnapshot) => void;
}

export function TimeMachineSidebar({
  snapshots,
  selectedSnapshotId,
  onSelectSnapshot,
  onTakeSnapshot,
  onDownloadSnapshot,
}: TimeMachineSidebarProps) {
  return (
    <div className="flex flex-col h-full border-r bg-muted/10 w-full">
      <div className="p-4 border-b">
        <h2 className="mb-2 text-lg font-semibold tracking-tight">Time Machine</h2>
        <Button onClick={onTakeSnapshot} className="w-full" size="sm">
          Take Snapshot
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {snapshots.length === 0 && (
            <div className="text-sm text-center text-muted-foreground p-4">
              No snapshots yet.
            </div>
          )}
          {snapshots.map((snapshot) => (
            <Button
              key={snapshot.id}
              variant={selectedSnapshotId === snapshot.id ? "secondary" : "ghost"}
              className="w-full justify-start text-left h-auto py-3 flex flex-col items-start gap-1 relative group pr-8"
              onClick={() => onSelectSnapshot(snapshot.id)}
            >
              <span className="font-medium text-sm">
                {format(snapshot.timestamp, "MMM d, HH:mm:ss")}
              </span>
              <span className="text-xs text-muted-foreground">
                {Object.keys(snapshot.localStorage).length + Object.keys(snapshot.sessionStorage).length} items
              </span>
              
              <div 
                role="button"
                tabIndex={0}
                onClick={(e) => {
                    e.stopPropagation();
                    onDownloadSnapshot(snapshot);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-background/80 rounded-md transition-all text-muted-foreground hover:text-foreground"
                title="Download Snapshot"
              >
                  <Download className="w-4 h-4" />
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
