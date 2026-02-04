import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStorageStore } from "@/store/storage-store";
import { Database, FileJson, Cookie, HardDrive, History } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
    const { data, selectCategory, selectedCategory, view, setView } = useStorageStore();

    if (!data) return <div className="p-4 text-muted-foreground">Loading storage...</div>;

    const sections = [
        {
            id: 'localStorage',
            label: 'Local Storage',
            icon: HardDrive,
            count: data.localStorage.length
        },
        {
            id: 'sessionStorage',
            label: 'Session Storage',
            icon: FileJson,
            count: data.sessionStorage.length
        },
        {
            id: 'cookies',
            label: 'Cookies',
            icon: Cookie,
            count: data.cookies.length
        },
        {
            id: 'indexedDB',
            label: 'IndexedDB',
            icon: Database,
            count: data.indexedDB.length
        }
    ] as const;

    return (
        <div className="w-64 border-r bg-sidebar h-screen flex flex-col">
            <div className="h-16 flex items-center px-6 border-b shrink-0">
                <div>
                    <h2 className="font-bold text-lg tracking-tight">StorageLens</h2>
                    <p className="text-xs text-muted-foreground">Inspector</p>
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => selectCategory(section.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                selectedCategory === section.id 
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                                    : "hover:bg-sidebar-accent/50 text-muted-foreground"
                            )}
                        >
                            <section.icon className="w-4 h-4" />
                            <span className="flex-1 text-left">{section.label}</span>
                            {section.count > 0 && (
                                <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full text-xs font-mono">
                                    {section.count}
                                </span>
                            )}
                        </button>
                    ))}
                    
                    {/* Indexed DB Sub-list could go here */}

                    <div className="pt-4 mt-4 border-t">
                        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Tools
                        </h3>
                        <button
                             onClick={() => setView('time-machine')}
                             className={cn(
                                 "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                 view === 'time-machine'
                                     ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                                     : "hover:bg-sidebar-accent/50 text-muted-foreground"
                             )}
                        >
                            <History className="w-4 h-4" />
                            <span className="flex-1 text-left">Time Machine</span>
                        </button>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
