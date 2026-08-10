export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-10">
      <p className="mb-6 text-xl font-semibold tracking-tight text-primary">
        DUITKU
      </p>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
