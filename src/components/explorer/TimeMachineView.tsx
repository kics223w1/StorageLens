
import React, { useEffect, useState, useCallback } from 'react';
import { TimeMachineSidebar } from './TimeMachineSidebar';
import { DiffView } from './DiffView';
import { snapshotManager, StorageSnapshot } from '@/core/snapshot';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

export function TimeMachineView() {
    const [snapshots, setSnapshots] = useState<StorageSnapshot[]>([]);
    const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);

    const loadHistory = useCallback(async () => {
        const history = await snapshotManager.getHistory();
        setSnapshots(history);
        if (!selectedSnapshotId && history.length > 0) {
            setSelectedSnapshotId(history[0].id);
        }
    }, [selectedSnapshotId]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const handleTakeSnapshot = async () => {
        await snapshotManager.capture();
        await loadHistory();
    };

    const handleDownloadSnapshot = (snapshot: StorageSnapshot) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `snapshot-${snapshot.timestamp}.json`);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const selectedSnapshot = snapshots.find(s => s.id === selectedSnapshotId);
    // Previous snapshot is the one immediately after the selected one in the sorted list (since sorted descending)
    const selectedIndex = snapshots.findIndex(s => s.id === selectedSnapshotId);
    const previousSnapshot = selectedIndex !== -1 && selectedIndex < snapshots.length - 1 
        ? snapshots[selectedIndex + 1] 
        : undefined;

    if (!selectedSnapshot && snapshots.length > 0) {
         // Should not happen if logic is correct, but safe fallback
         return <div>Loading...</div>; 
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
             <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={20} minSize={15}>
                    <TimeMachineSidebar 
                        snapshots={snapshots}
                        selectedSnapshotId={selectedSnapshotId}
                        onSelectSnapshot={setSelectedSnapshotId}
                        onTakeSnapshot={handleTakeSnapshot}
                        onDownloadSnapshot={handleDownloadSnapshot}
                    />
                </ResizablePanel>
                
                <ResizableHandle withHandle />
                
                <ResizablePanel defaultSize={80}>
                    {selectedSnapshot ? (
                        <DiffView 
                            currentSnapshot={selectedSnapshot}
                            previousSnapshot={previousSnapshot} 
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground flex-col gap-4">
                            <p>No snapshots recorded.</p>
                            <button 
                                onClick={handleTakeSnapshot}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                            >
                                Take First Snapshot
                            </button>
                        </div>
                    )}
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
