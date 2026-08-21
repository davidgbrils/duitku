"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/types/database";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type Wallet = Database["public"]["Tables"]["wallets"]["Row"];

/** Base UI Select tidak menerima value kosong — pakai sentinel untuk "Semua". */
const ALL_VALUE = "__all";

const TYPE_OPTIONS = [
  { value: ALL_VALUE, label: "Semua Tipe" },
  { value: "income", label: "Pemasukan" },
  { value: "expense", label: "Pengeluaran" },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
] as const;

/**
 * Filter bar untuk halaman riwayat transaksi (TASK-0901/0902).
 * Semua filter dikirim sebagai query params sehingga hasil bisa
 * di-bookmark / dibagikan, dan halaman tetap server-rendered.
 */
export function TransactionFilters({
  categories,
  wallets,
}: {
  categories: Category[];
  wallets: Wallet[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [wallet, setWallet] = useState(searchParams.get("wallet") ?? "");
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "newest");

  const activeFilterCount = [type, category, wallet, from, to].filter(
    Boolean
  ).length;

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (type) params.set("type", type);
    if (category) params.set("category", category);
    if (wallet) params.set("wallet", wallet);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (sort !== "newest") params.set("sort", sort);
    router.push(`/transactions${params.toString() ? `?${params}` : ""}`);
  }

  function resetFilters() {
    setQ("");
    setType("");
    setCategory("");
    setWallet("");
    setFrom("");
    setTo("");
    setSort("newest");
    router.push("/transactions");
  }

  return (
    <form
      onSubmit={applyFilters}
      className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Row 1: Search, Type, Category */}
        <div className="grid gap-1.5">
          <Label htmlFor="transaction-search" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Cari
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="transaction-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari..."
              className="pl-9 rounded-xl bg-slate-50/50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
            />
          </div>
        </div>

        <FilterSelect
          label="Type"
          value={type || ALL_VALUE}
          onChange={(v) => setType(v && v !== ALL_VALUE ? v : "")}
          options={TYPE_OPTIONS}
        />

        <FilterSelect
          label="Category"
          value={category || ALL_VALUE}
          onChange={(v) => setCategory(v && v !== ALL_VALUE ? v : "")}
          options={[
            { value: ALL_VALUE, label: "Semua Kategori" },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />

        {/* Row 2: Wallet, From Date, To Date */}
        <FilterSelect
          label="Wallet"
          value={wallet || ALL_VALUE}
          onChange={(v) => setWallet(v && v !== ALL_VALUE ? v : "")}
          options={[
            { value: ALL_VALUE, label: "Semua Wallet" },
            ...wallets.map((w) => ({ value: w.id, label: w.name })),
          ]}
        />

        <div className="grid gap-1.5">
          <Label htmlFor="filter-from" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            From Date
          </Label>
          <Input
            id="filter-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-xl bg-slate-50/50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="filter-to" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            To Date
          </Label>
          <Input
            id="filter-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-xl bg-slate-50/50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="w-48">
          <FilterSelect
            label="Sort"
            value={sort}
            onChange={(v) => setSort(v ?? "newest")}
            options={SORT_OPTIONS}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            disabled={!q && activeFilterCount === 0 && sort === "newest"}
            className="rounded-full text-xs font-medium"
          >
            <RotateCcw className="size-3.5 mr-1" />
            Reset
          </Button>
          <Button
            type="submit"
            size="sm"
            className="rounded-full bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-medium px-4"
          >
            <Filter className="size-3.5 mr-1" />
            Terapkan Filter
          </Button>
        </div>
      </div>
    </form>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string | null) => void;
  options: readonly { value: string; label: string }[];
}) {
  const items = Object.fromEntries(options.map((o) => [o.value, o.label]));
  return (
    <div className="grid gap-1.5">
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
      <Select value={value} onValueChange={onChange} items={items}>
        <SelectTrigger className="w-full rounded-xl bg-slate-50/50 border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
