/**
 * Sanitasi parameter `next` agar tidak terjadi open redirect.
 * Hanya menerima path internal yang diawali "/" dan bukan "//" maupun "/\\".
 */
export function sanitizeNextPath(
  next: string | undefined,
  fallback = "/dashboard"
): string {
  if (
    next &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.startsWith("/\\")
  ) {
    return next;
  }
  return fallback;
}
