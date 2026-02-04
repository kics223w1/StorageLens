import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStorageStore } from "@/store/storage-store";
import { useState, useMemo, useEffect } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

type SortConfig = {
  key: string | null;
  direction: 'asc' | 'desc';
};

export function DataTable() {
  const { data, selectedCategory, selectRecord } = useStorageStore();
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  // Map of ID/Key -> boolean
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Reset selection when category changes
  useEffect(() => {
    setRowSelection({});
  }, [selectedCategory]);

  // Handle Copy
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        if (selectedCategory === 'cookies' && data?.cookies) {
          const selectedCookies = data.cookies.filter(c => rowSelection[c.name]);
          if (selectedCookies.length > 0) {
            const text = JSON.stringify(selectedCookies, null, 2);
            navigator.clipboard.writeText(text);
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCategory, data, rowSelection]);

  if (!data || !selectedCategory) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select a storage category to view data
      </div>
    );
  }

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="w-3 h-3 ml-1" />
      : <ArrowDown className="w-3 h-3 ml-1" />;
  };

  const sortData = (items: any[]) => {
    if (!sortConfig.key) return items;

    return [...items].sort((a, b) => {
      const key = sortConfig.key!;
      const aValue = a[key];
      const bValue = b[key];

      if (aValue === bValue) return 0;

      // Basic comparison, extend if needed for specific types
      const comparison = aValue > bValue ? 1 : -1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  };

  const toggleSelectAll = (items: any[], idKey: string) => {
    const allSelected = items.every(item => rowSelection[item[idKey]]);
    const newSelection: Record<string, boolean> = {};
    if (!allSelected) {
      items.forEach(item => {
        newSelection[item[idKey]] = true;
      });
    }
    setRowSelection(newSelection);
  };

  const toggleSelectRow = (id: string) => {
    setRowSelection(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };



  const renderContent = () => {
    switch (selectedCategory) {
      case 'localStorage':
      case 'sessionStorage':
        const storageItems = selectedCategory === 'localStorage' ? data.localStorage : data.sessionStorage;
        const sortedStorage = sortData(storageItems);
        return (
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
              <TableRow>
                <TableHead className="w-[200px] cursor-pointer" onClick={() => handleSort('key')}>
                  <div className="flex items-center">Key {renderSortIcon('key')}</div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('value')}>
                  <div className="flex items-center">Value Preview {renderSortIcon('value')}</div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStorage.map((record) => (
                <TableRow
                  key={record.key}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => selectRecord(record)}
                >
                  <TableCell className="font-medium font-mono text-xs">{record.key}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[400px]">
                    {record.value.substring(0, 100)}...
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'cookies':
        const sortedCookies = sortData(data.cookies);
        const allCookiesSelected = sortedCookies.length > 0 && sortedCookies.every(c => rowSelection[c.name]);

        return (
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
              <TableRow>
                <TableHead className="w-[150px] cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center">Name {renderSortIcon('name')}</div>
                </TableHead>
                <TableHead className="max-w-[200px] cursor-pointer" onClick={() => handleSort('value')}>
                  <div className="flex items-center">Value {renderSortIcon('value')}</div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('domain')}>
                  <div className="flex items-center">Domain {renderSortIcon('domain')}</div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('path')}>
                  <div className="flex items-center">Path {renderSortIcon('path')}</div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('expires')}>
                  <div className="flex items-center">Expires / Max-Age {renderSortIcon('expires')}</div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('size')}>
                  <div className="flex items-center">Size {renderSortIcon('size')}</div>
                </TableHead>
                <TableHead className="w-[60px] cursor-pointer" onClick={() => handleSort('httpOnly')}>
                  <div className="flex items-center">HttpOnly {renderSortIcon('httpOnly')}</div>
                </TableHead>
                <TableHead className="w-[60px] cursor-pointer" onClick={() => handleSort('secure')}>
                  <div className="flex items-center">Secure {renderSortIcon('secure')}</div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('sameSite')}>
                  <div className="flex items-center">SameSite {renderSortIcon('sameSite')}</div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCookies.map((record) => (
                <TableRow
                  key={record.name}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={(e) => {
                    selectRecord(record);
                  }}
                >
                  <TableCell className="font-medium font-mono text-xs">{record.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[200px]" title={record.value}>
                    {record.value}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{record.domain}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{record.path}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {typeof record.expires === 'number'
                      ? new Date(record.expires).toLocaleString()
                      : record.expires}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{record.size}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{record.httpOnly ? '✓' : ''}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{record.secure ? '✓' : ''}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{record.sameSite}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'indexedDB':
        const sortedDBs = sortData(data.indexedDB);
        return (
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
              <TableRow>
                <TableHead className="w-[200px] cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center">Database Name {renderSortIcon('name')}</div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('version')}>
                  <div className="flex items-center">Version {renderSortIcon('version')}</div>
                </TableHead>
                <TableHead>Object Stores</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDBs.map((record) => (
                <TableRow
                  key={record.name}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => selectRecord(record)}
                >
                  <TableCell className="font-medium font-mono text-xs">{record.name}</TableCell>
                  <TableCell className="font-mono text-xs">{record.version}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {record.objectStoreNames.join(', ')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 h-full overflow-hidden flex flex-col">
      <div className="h-16 flex items-center px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <h3 className="font-semibold capitalize">{selectedCategory} Data</h3>
      </div>
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}
