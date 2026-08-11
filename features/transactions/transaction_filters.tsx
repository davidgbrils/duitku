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
      className="bg-card ring-border rounded-xl p-4 ring-1"
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid min-w-52 flex-1 gap-1.5">
          <Label htmlFor="transaction-search">Cari</Label>
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              id="transaction-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari deskripsi transaksi..."
              className="pl-8"
            />
          </div>
        </div>

        <FilterSelect
          label="Tipe"
          value={type || ALL_VALUE}
          onChange={(v) => setType(v && v !== ALL_VALUE ? v : "")}
          options={TYPE_OPTIONS}
        />

        <FilterSelect
          label="Kategori"
          value={category || ALL_VALUE}
          onChange={(v) => setCategory(v && v !== ALL_VALUE ? v : "")}
          options={[
            { value: ALL_VALUE, label: "Semua Kategori" },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />

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
          <Label htmlFor="filter-from">Dari</Label>
          <Input
            id="filter-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-8 w-36"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="filter-to">Sampai</Label>
          <Input
            id="filter-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-8 w-36"
          />
        </div>

        <FilterSelect
          label="Urutkan"
          value={sort}
          onChange={(v) => setSort(v ?? "newest")}
          options={SORT_OPTIONS}
        />

        <div className="flex gap-2">
          <Button type="submit" size="sm">
            <Filter />
            Terapkan
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            disabled={!q && activeFilterCount === 0 && sort === "newest"}
          >
            <RotateCcw />
            Reset
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
  // Base UI hanya menampilkan label bila `items` diberikan ke Root;
  // tanpa ini trigger menampilkan value mentah (mis. "__all", UUID).
  const items = Object.fromEntries(options.map((o) => [o.value, o.label]));
  return (
    <div className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <Select value={value} onValueChange={onChange} items={items}>
        <SelectTrigger className="w-36">
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
