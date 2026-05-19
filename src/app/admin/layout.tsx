
'use client';

import * as React from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { doc } from "firebase/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const pathname = usePathname();

  const isAuthPage = pathname === '/admin/auth' || pathname === '/admin/signup';

  // Redirect if not authenticated as admin
  React.useEffect(() => {
    if (!authLoading && !user && !isAuthPage) {
      router.push('/admin/auth');
    }
  }, [user, authLoading, router, isAuthPage]);

  const userProfileRef = React.useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, loading: profileLoading } = useDoc(userProfileRef);

  React.useEffect(() => {
    if (!profileLoading && profile && profile.role !== 'admin' && !isAuthPage) {
      router.push('/dashboard');
    }
  }, [profile, profileLoading, router, isAuthPage]);

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-zinc-950">
        <Loader2 className="size-8 animate-spin text-red-500" />
        <p className="text-xs font-headline font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
          Elevating System Privileges
        </p>
      </div>
    );
  }

  if (isAuthPage) return <>{children}</>;
  if (!user || profile?.role !== 'admin') return null;

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-zinc-950">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/5 px-4 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
          <SidebarTrigger className="-ml-1 text-zinc-400 hover:text-white" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
          <div className="flex-1">
             <h1 className="text-[10px] font-bold uppercase tracking-widest text-red-500">Root Management Console</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</p>
                <div className="flex items-center gap-1.5 justify-end">
                    <div className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-xs font-bold text-white">Encrypted Session</p>
                </div>
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col p-6 overflow-x-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
