import { MotionProvider } from "@/components/animations/motion_provider";
import { MobileNav } from "@/components/shared/mobile_nav";
import { DashboardTopNav } from "@/components/shared/dashboard_topnav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MotionProvider>
      <div className="bg-background flex min-h-svh flex-col">
        <DashboardTopNav />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 pb-24 md:pb-24">
          {children}
        </main>
      </div>
      <MobileNav />
    </MotionProvider>
  );
}
