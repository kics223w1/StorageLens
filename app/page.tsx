
"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DataTable } from "@/components/explorer/DataTable";
import { ContentEditor } from "@/components/explorer/ContentEditor";
import { TimeMachineView } from "@/components/explorer/TimeMachineView";
import { useStorageStore } from "@/store/storage-store";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Home() {
  const { scan, view } = useStorageStore();

  useEffect(() => {
    scan();
  }, [scan]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {view === 'inspector' ? (
             <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={50} minSize={30}>
                    <div className="h-full flex flex-col">
                         <DataTable />
                    </div>
                </ResizablePanel>
                
                <ResizableHandle withHandle />
                
                <ResizablePanel defaultSize={50} minSize={20}>
                    <div className="h-full">
                        <ContentEditor />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        ) : (
            <TimeMachineView />
        )}
      </main>
    </div>
  );
}
