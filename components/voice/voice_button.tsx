"use client";

import { Mic } from "lucide-react";

import { Button } from "@/components/ui/button";
import { VoiceRecordDialog } from "@/components/voice/voice_record_dialog";
import type { Database } from "@/types/database";

type Wallet = Database["public"]["Tables"]["wallets"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

export function VoiceButton({
  wallets,
  categories,
}: {
  wallets: Wallet[];
  categories: Category[];
}) {
  return (
    <VoiceRecordDialog
      wallets={wallets}
      categories={categories}
      trigger={
        <Button variant="outline" className="gap-2" aria-label="Catat via suara">
          <Mic className="size-4" />
          Catat Suara
        </Button>
      }
    />
  );
}