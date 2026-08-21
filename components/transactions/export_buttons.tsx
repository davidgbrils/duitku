"use client";

import { useTransition } from "react";
import { Download, Loader2, Printer } from "lucide-react";

import {
  exportTransactionsCsvAction,
  type ExportTransactionsFilter,
} from "@/actions/export";
import { Button } from "@/components/ui/button";

export function ExportButtons({ filter }: { filter: ExportTransactionsFilter }) {
  const [isExporting, startTransition] = useTransition();

  function handleDownloadCsv() {
    startTransition(async () => {
      const res = await exportTransactionsCsvAction(filter);
      if (res.error) {
        alert(res.error);
        return;
      }
      if (res.csv && res.filename) {
        const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", res.filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  }

  function handlePrintPdf() {
    window.print();
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadCsv}
        disabled={isExporting}
        className="gap-1.5 text-xs shadow-sm"
      >
        {isExporting ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Download className="size-3.5 text-primary" />
        )}
        Ekspor CSV
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handlePrintPdf}
        className="gap-1.5 text-xs shadow-sm hidden sm:inline-flex"
      >
        <Printer className="size-3.5 text-primary" />
        Cetak PDF
      </Button>
    </div>
  );
}
