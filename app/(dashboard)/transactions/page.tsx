import { redirect } from "next/navigation";

import { Reveal } from "@/components/animations/reveal";
import { ReceiptScannerDialog } from "@/components/receipts/receipt_scanner";
import { TransactionItem } from "@/components/transactions/transaction_item";
import { Pagination } from "@/components/shared/pagination";
import { CreateTransactionDialog } from "@/features/transactions/transaction_form";
import { TransactionFilters } from "@/features/transactions/transaction_filters";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils/money";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const VALID_TYPES = new Set(["income", "expense"]);
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type TransactionsSearchParams = {
  q?: string | string[];
  type?: string | string[];
  category?: string | string[];
  wallet?: string | string[];
  from?: string | string[];
  to?: string | string[];
  sort?: string | string[];
  page?: string | string[];
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<TransactionsSearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // ---- Parse & sanitasi query params (input dari user — jangan dipercaya mentah) ----
  const q = firstParam(params.q)?.trim().slice(0, 100);
  const type = VALID_TYPES.has(firstParam(params.type) ?? "")
    ? (firstParam(params.type) as "income" | "expense" | undefined)
    : undefined;
  const categoryId = UUID_RE.test(firstParam(params.category) ?? "")
    ? firstParam(params.category)
    : undefined;
  const walletId = UUID_RE.test(firstParam(params.wallet) ?? "")
    ? firstParam(params.wallet)
    : undefined;
  const from = firstParam(params.from)?.match(/^\d{4}-\d{2}-\d{2}$/)?.[0];
  const to = firstParam(params.to)?.match(/^\d{4}-\d{2}-\d{2}$/)?.[0];
  const sort = firstParam(params.sort) === "oldest" ? "oldest" : "newest";
  const page = Math.max(1, Number(firstParam(params.page)) || 1);

  // ---- Data pendukung: wallet & kategori (untuk form + filter) ----
  const [{ data: wallets }, { data: categories }] = await Promise.all([
    supabase.from("wallets").select("*"),
    supabase.from("categories").select("*"),
  ]);
  const walletList = wallets ?? [];
  const categoryList = categories ?? [];

  // ---- Query utama dengan filter ----
  let query = supabase
    .from("transactions")
    .select("*, wallets(name), categories(name)", { count: "exact" });

  if (q) {
    query = query.ilike("description", `%${q}%`);
  }
  if (type) {
    query = query.eq("type", type);
  }
  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }
  if (walletId) {
    query = query.eq("wallet_id", walletId);
  }
  if (from) {
    query = query.gte("transaction_date", from);
  }
  if (to) {
    query = query.lte("transaction_date", to);
  }

  if (sort === "newest") {
    query = query
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    query = query
      .order("transaction_date", { ascending: true })
      .order("created_at", { ascending: true });
  }

  const fromIndex = (page - 1) * PAGE_SIZE;
  const { data: transactions, count } = await query.range(
    fromIndex,
    fromIndex + PAGE_SIZE - 1
  );

  const transactionList = transactions ?? [];
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Ringkasan total pemasukan/pengeluaran pada hasil filter saat ini.
  const totalIncome = transactionList
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = transactionList
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transaksi</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Riwayat pemasukan dan pengeluaranmu
          </p>
        </div>
        <div className="flex gap-2">
          <ReceiptScannerDialog
            wallets={walletList}
            categories={categoryList}
          />
          <CreateTransactionDialog
            wallets={walletList}
            categories={categoryList}
          />
        </div>
      </div>
      <TransactionFilters categories={categoryList} wallets={walletList} />
      {totalCount > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <p className="text-muted-foreground text-sm">
            {totalCount} transaksi
          </p>
          <p className="text-success text-sm font-medium">
            + {formatRupiah(totalIncome)}
          </p>
          <p className="text-destructive text-sm font-medium">
            - {formatRupiah(totalExpense)}
          </p>
        </div>
      )}
      {transactionList.length === 0 ? (
        <div className="bg-card ring-border flex flex-col items-center gap-3 rounded-xl px-6 py-14 text-center ring-1">
          <p className="text-base font-medium">Belum ada Transaksi</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            {totalCount === 0
              ? "Catat pemasukan atau pengeluaran pertamamu untuk mulai menggunakan Duitku."
              : "Tidak ada transaksi yang cocok dengan filter yang dipilih."}
          </p>
          <div className="mt-2">
            <CreateTransactionDialog
              wallets={walletList}
              categories={categoryList}
            />
          </div>
        </div>
      ) : (
        <Reveal>
          <ul className="flex flex-col gap-3">
            {transactionList.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                walletName={transaction.wallets?.name ?? "Wallet"}
                categoryName={transaction.categories?.name ?? null}
              />
            ))}
          </ul>
        </Reveal>
      )}{" "}
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} />
      )}
    </div>
  );
}
