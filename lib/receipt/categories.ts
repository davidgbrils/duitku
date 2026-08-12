/**
 * Deteksi kategori belanja dari nama item struk, dicocokkan ke kategori
 * expense milik user. Murni heuristik keyword → label → kategori user.
 */

type KeywordGroup = {
  label: string;
  keywords: string[];
};

const GROUPS: KeywordGroup[] = [
  {
    label: "Makanan",
    keywords: [
      "mie", "roti", "nasi", "telur", "ayam", "sapi", "ikan", "tahu",
      "tempe", "sayur", "buah", "beras", "gula", "minyak", "tepung",
      "bumbu", "kecap", "sambal", "snack", "biskuit", "keripik", "coklat",
      "permen", "indomie", "sosis", "bakso", "keju", "mentega", "santan",
      "garam", "bawang", "cabai", "kentang", "pisang", "apel", "jeruk",
      "mangga", "kopi bubuk", "mie instan", "chitato", "tango", "roma",
      "oreo", "silverqueen", "cadbury", "beng beng", "kinder",
    ],
  },
  {
    label: "Minuman",
    keywords: [
      "aqua", "le mineral", "air mineral", "teh", "kopi", "susu", "soda",
      "jus", "sprite", "cola", "fanta", "pocari", "milo", "energen",
      "ultra", "frisian", "bear brand", "good day", "kapal api", "torabika",
      "air", "oatside", "hydro coco", "pokka", "teh botol", "teh pucuk",
      "frestea", "nescafe", "goldda", "floridina", "cimory", "walls",
    ],
  },
  {
    label: "Kebersihan",
    keywords: [
      "sabun", "shampoo", "sampo", "pasta gigi", "sikat gigi", "deterjen",
      "rinso", "downy", "pelembut", "pembersih", "tisu", "pampers", "popok",
      "deodoran", "parfum", "losion", "pembalut", "sabun cuci", "giv",
      "rxna", "rexona", "biore", "dettol", "lifebuoy", "lux", "dove",
      "pepsodent", "closeup", "soklin", "attack", "molto", "sensodyne",
      "wardah", "kahf", "garnier", "vaseline", "nivea", "gatsby",
    ],
  },
  {
    label: "Kebutuhan Rumah",
    keywords: [
      "lampu", "baterai", "kantong", "plastik", "spon", "lap", "sapu",
      "pel", "ember", "gayung", "pengharum",
    ],
  },
  {
    label: "Transportasi",
    keywords: [
      "bensin", "pertamax", "premium", "solar", "grab", "gojek", "maxim",
      "taksi", "ojek", "parkir", "tol", "bahan bakar", "bbm", "pertalite",
    ],
  },
  {
    label: "Elektronik & Pulsa",
    keywords: [
      "pulsa", "token", "listrik", "kuota", "voucher", "sim card",
    ],
  },
];

export type CategoryMatch = {
  categoryId: string | null;
  categoryName: string | null;
  /** Skor 0–1; rendah artinya user perlu memilih kategori manual. */
  confidence: number;
};

type CategoryLike = {
  id: string;
  name: string;
  type: string;
};

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
}

/**
 * @param itemNames Nama item hasil OCR (mis. ["AQUA", "ROTI", "MIE"]).
 * @param categories Kategori user (income + expense).
 */
export function detectCategory(
  itemNames: string[],
  categories: CategoryLike[]
): CategoryMatch {
  const expenseCategories = categories.filter(
    (category) => category.type === "expense"
  );
  if (expenseCategories.length === 0) {
    return { categoryId: null, categoryName: null, confidence: 0.5 };
  }

  const text = itemNames.join(" ").toLowerCase();
  let best: { group: KeywordGroup; hits: number } | null = null;
  for (const group of GROUPS) {
    const hits = group.keywords.filter((keyword) =>
      text.includes(keyword.toLowerCase())
    ).length;
    if (hits > 0 && (!best || hits > best.hits)) {
      best = { group, hits };
    }
  }

  if (!best) {
    // Tidak ada keyword — utamakan kategori "Lainnya", lalu fallback umum.
    const fallback =
      expenseCategories.find((category) => /lain/i.test(category.name)) ??
      expenseCategories.find((category) =>
        /makan|belanja|kebutuhan/i.test(category.name)
      );
    return {
      categoryId: fallback?.id ?? null,
      categoryName: fallback?.name ?? null,
      confidence: fallback ? 0.6 : 0.5,
    };
  }

  const target = normalize(best.group.label);
  const match = expenseCategories.find((category) => {
    const name = normalize(category.name);
    return (
      name === target ||
      name.includes(target) ||
      target.includes(name)
    );
  });

  const confidence = best.hits >= 2 ? 0.85 : 0.75;
  return {
    categoryId: match?.id ?? null,
    categoryName: match?.name ?? null,
    confidence: match ? confidence : 0.55,
  };
}
