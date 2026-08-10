export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <p className="text-primary mb-6 text-xl font-semibold tracking-tight">
        DUITKU
      </p>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
