"use client";

import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={signOutAction}>
      <Button
        type="submit"
        variant="outline"
        className={cn(
          "rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
          className
        )}
      >
        Keluar
      </Button>
    </form>
  );
}
