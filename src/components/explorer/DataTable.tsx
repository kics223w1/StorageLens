import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStorageStore } from "@/store/storage-store";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DataTable() {
  const { data, selectedCategory, selectRecord } = useStorageStore();

  if (!data || !selectedCategory) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select a storage category to view data
      </div>
    );
  }

  const renderContent = () => {
    switch (selectedCategory) {
      case 'localStorage':
      case 'sessionStorage':
        return (
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[200px]">Key</TableHead>
                <TableHead>Value Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(selectedCategory === 'localStorage' ? data.localStorage : data.sessionStorage).map((record) => (
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
        return (
             <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.cookies.map((record) => (
                <TableRow 
                    key={record.name} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => selectRecord(record)}
                >
                  <TableCell className="font-medium font-mono text-xs">{record.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[400px]">
                    {record.value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'indexedDB':
        return (
             <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[200px]">Database Name</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Object Stores</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.indexedDB.map((record) => (
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
       <ScrollArea className="flex-1 h-full">
         {renderContent()}
       </ScrollArea>
    </div>
  );
}
