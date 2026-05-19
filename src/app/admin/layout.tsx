
'use client';

import * as React from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Users, ClipboardCheck, LayoutDashboard } from "lucide-react";
import { doc } from "firebase/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const pathname = usePathname();

  // Redirect if not authenticated as admin
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/auth');
    }
  }, [user, authLoading, router]);

  const userProfileRef = React.useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, loading: profileLoading } = useDoc(userProfileRef);

  React.useEffect(() => {
    if (!profileLoading && profile && profile.role !== 'admin' && pathname !== '/admin/auth') {
      router.push('/dashboard');
    }
  }, [profile, profileLoading, router, pathname]);

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="size-8 animate-spin text-red-500" />
        <p className="text-xs font-headline font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
          Elevating System Privileges
        </p>
      </div>
    );
  }

  if (pathname === '/admin/auth') return <>{children}</>;
  if (!user || profile?.role !== 'admin') return null;

  return (
    <div className="flex min-h-screen w-full flex-col bg-zinc-950">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-white/5 bg-zinc-950/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-red-600 text-white shadow-lg shadow-red-500/20">
                <ShieldCheck className="size-4" />
            </div>
            <h1 className="font-headline font-bold text-lg tracking-tighter">
                ZENTRIX<span className="text-red-500">ADMIN</span>
            </h1>
        </div>
        <Separator orientation="vertical" className="mx-2 h-4 bg-white/10" />
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link 
            href="/admin/dashboard" 
            className={`flex items-center gap-2 transition-colors hover:text-red-500 ${pathname === '/admin/dashboard' ? 'text-red-500' : 'text-muted-foreground'}`}
          >
            <Users className="size-4" />
            Users
          </Link>
          <Link 
            href="/admin/submissions" 
            className={`flex items-center gap-2 transition-colors hover:text-red-500 ${pathname === '/admin/submissions' ? 'text-red-500' : 'text-muted-foreground'}`}
          >
            <ClipboardCheck className="size-4" />
            Submissions
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
             <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Root Console</span>
             <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="h-8 text-xs font-bold border-white/10">User View</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
