
'use client';

import * as React from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { doc } from "firebase/firestore";

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const userProfileRef = React.useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, loading: profileLoading } = useDoc(userProfileRef);

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="flex aspect-square size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-2xl shadow-primary/20 animate-bounce">
          <Loader2 className="size-6 animate-spin" />
        </div>
        <p className="text-sm font-headline font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
          Retrieving Zentrix History
        </p>
      </div>
    );
  }

  if (!user) return null;

  const initials = user.displayName 
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email ? user.email[0].toUpperCase() : '??';

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
             <h1 className="text-xs font-headline font-bold uppercase tracking-widest text-muted-foreground">Secure Console</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Balance</p>
                <p className="text-sm font-bold text-primary">₦{(profile?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">{initials}</span>
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
