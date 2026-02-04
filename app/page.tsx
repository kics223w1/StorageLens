
"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DataTable } from "@/components/explorer/DataTable";
import { Inspector } from "@/components/explorer/Inspector";
import { useStorageStore } from "@/store/storage-store";

export default function Home() {
  const { scan } = useStorageStore();

  useEffect(() => {
    scan();
  }, [scan]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
         <DataTable />
      </main>
      <Inspector />
    </div>
  );
}
