"use client";

import { useState } from "react";
import { Maximize2, X, FileImage } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export function ReceiptPreview({
  url,
  label = "Foto Struk",
}: {
  url: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 max-w-full"
        onClick={() => setOpen(true)}
      >
        <FileImage className="size-4 shrink-0" />
        <span className="truncate">{label}</span>
        <Maximize2 className="size-3.5 shrink-0 text-muted-foreground" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl w-[94vw] p-3 rounded-2xl">
          <div className="flex items-center justify-between px-1 pb-2">
            <DialogTitle className="text-sm font-semibold">{label}</DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
          <div className="max-h-[75dvh] overflow-auto bg-black/5 rounded-xl flex items-start justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={label}
              className="max-w-full object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}