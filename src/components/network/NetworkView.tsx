import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStorageStore } from "@/store/storage-store";
import { Button } from "@/components/ui/button";
import { Pause, Play, Trash2, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { NetworkLog } from "@/core/adapters/network";

type SortConfig = {
    key: keyof NetworkLog | null;
    direction: 'asc' | 'desc';
};

export function NetworkView() {
  const { 
    networkLogs, 
    isMonitoring, 
    enableNetworkMonitoring, 
    disableNetworkMonitoring, 
    clearNetworkLogs,
    refreshNetworkLogs
  } = useStorageStore();

  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  useEffect(() => {
    enableNetworkMonitoring();
  }, [enableNetworkMonitoring]);

  const handleSort = (key: keyof NetworkLog) => {
      setSortConfig(current => ({
          key,
          direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
      }));
  };

  const sortedLogs = useMemo(() => {
      if (!sortConfig.key) return networkLogs;

      return [...networkLogs].sort((a, b) => {
          const key = sortConfig.key as keyof NetworkLog;
          const aValue = a[key];
          const bValue = b[key];

          if (aValue === bValue) return 0;
          
          // Handle numeric values for size/time if possible or string compare
          // For simplicity we use lexical sort, but better to parse numbers if needed.
          // Assuming string for now based on NetworkLog type.
          
          const comparison = aValue > bValue ? 1 : -1;
          return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
  }, [networkLogs, sortConfig]);

  const renderSortIcon = (key: keyof NetworkLog) => {
      if (sortConfig.key !== key) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
      return sortConfig.direction === 'asc' 
          ? <ArrowUp className="w-3 h-3 ml-1" /> 
          : <ArrowDown className="w-3 h-3 ml-1" />;
  };

  return (
    <div className="flex-1 h-full overflow-hidden flex flex-col">
       <div className="h-16 flex items-center px-6 border-b bg-background/95 backdrop-blur shrink-0 justify-between">
            <h3 className="font-semibold">Network</h3>
            <div className="flex items-center gap-2">
                <Button 
                    variant="ghost" 
                    size="sm"
                    className={cn(isMonitoring && "text-red-500 hover:text-red-600")}
                    onClick={isMonitoring ? disableNetworkMonitoring : enableNetworkMonitoring}
                >
                    {isMonitoring ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isMonitoring ? "Stop" : "Record"}
                </Button>
                 <Button variant="ghost" size="sm" onClick={refreshNetworkLogs}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
                <Button variant="ghost" size="sm" onClick={clearNetworkLogs}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                </Button>
            </div>
       </div>
       
       <div className="flex-1 overflow-auto">
            <Table>
                <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                    <TableRow>
                        <TableHead className="w-[80px] cursor-pointer" onClick={() => handleSort('status')}>
                            <div className="flex items-center">Status {renderSortIcon('status')}</div>
                        </TableHead>
                        <TableHead className="w-[80px] cursor-pointer" onClick={() => handleSort('method')}>
                             <div className="flex items-center">Method {renderSortIcon('method')}</div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('file')}>
                             <div className="flex items-center">Name {renderSortIcon('file')}</div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('domain')}>
                             <div className="flex items-center">Domain {renderSortIcon('domain')}</div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                             <div className="flex items-center">Type {renderSortIcon('type')}</div>
                        </TableHead>
                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('transferred')}>
                             <div className="flex items-center justify-end">Transferred {renderSortIcon('transferred')}</div>
                        </TableHead>
                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('size')}>
                             <div className="flex items-center justify-end">Size {renderSortIcon('size')}</div>
                        </TableHead>
                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('time')}>
                             <div className="flex items-center justify-end">Time {renderSortIcon('time')}</div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedLogs.length === 0 ? (
                         <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                No network activity recorded
                            </TableCell>
                        </TableRow>
                    ) : (
                        sortedLogs.map((log) => (
                            <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                                <TableCell className="font-mono text-xs">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded",
                                        log.status >= 200 && log.status < 300 ? "bg-green-500/10 text-green-500" :
                                        log.status >= 400 ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground"
                                    )}>
                                        {log.status}
                                    </span>
                                </TableCell>
                                <TableCell className="font-mono text-xs">{log.method}</TableCell>
                                <TableCell className="font-mono text-xs max-w-[200px] truncate" title={log.url}>{log.file}</TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">{log.domain}</TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground capitalize">{log.type}</TableCell>
                                <TableCell className="font-mono text-xs text-right">{log.transferred}</TableCell>
                                <TableCell className="font-mono text-xs text-right">{log.size}</TableCell>
                                <TableCell className="font-mono text-xs text-right text-muted-foreground">{log.time}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
       </div>
    </div>
  );
}
