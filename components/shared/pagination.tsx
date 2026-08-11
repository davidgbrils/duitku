"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Pagination berbasis query param (TASK-0903). Semua search param yang
 * ada dipertahankan; hanya nilai `page` yang diganti.
 */
export function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  };

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav
      className="flex items-center justify-center gap-1"
      aria-label="Paginasi"
    >
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage <= 1}
        className="border-border hover:bg-muted flex size-8 items-center justify-center rounded-lg border aria-disabled:pointer-events-none aria-disabled:opacity-40"
      >
        <ChevronLeft className="size-4" />
        <span className="sr-only">Sebelumnya</span>
      </Link>
      {pages.map((page, index) =>
        page === "..." ? (
          <span key={`gap-${index}`} className="text-muted-foreground px-1">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={buildHref(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={
              page === currentPage
                ? "bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg text-sm font-medium"
                : "border-border hover:bg-muted flex size-8 items-center justify-center rounded-lg border text-sm"
            }
          >
            {page}
          </Link>
        )
      )}
      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage >= totalPages}
        className="border-border hover:bg-muted flex size-8 items-center justify-center rounded-lg border aria-disabled:pointer-events-none aria-disabled:opacity-40"
      >
        <ChevronRight className="size-4" />
        <span className="sr-only">Berikutnya</span>
      </Link>
    </nav>
  );
}
