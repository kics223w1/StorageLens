
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useStorageStore } from "@/store/storage-store";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Inspector() {
  const { selectedRecord, selectRecord } = useStorageStore();

  const isOpen = !!selectedRecord;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && selectRecord(null)}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Record Details</SheetTitle>
          <SheetDescription>
            Inspect the raw value of the selected record.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 h-full pb-20">
            <ScrollArea className="h-full rounded-md border p-4 bg-muted/50">
                <pre className="font-mono text-xs whitespace-pre-wrap break-all">
                    {selectedRecord && JSON.stringify(selectedRecord, null, 2)}
                </pre>
            </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
