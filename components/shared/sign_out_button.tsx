"use client";

import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="outline" className={className}>
        <LogOut className="size-4" />
        Keluar
      </Button>
    </form>
  );
}
