
'use client';

import * as React from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { doc } from "firebase/firestore";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

  // Redirect unauthenticated users away from protected admin pages
  React.useEffect(() => {
    if (!authLoading && !user && !isAuthPage) {
      router.push('/admin/auth');
    }
  }, [user, authLoading, router, isAuthPage]);

  const userProfileRef = React.useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, loading: profileLoading, error: profileError } = useDoc(userProfileRef);

  // Redirect non-admins to user dashboard once profile is confirmed loaded
  React.useEffect(() => {
    if (!profileLoading && profile && profile.role !== 'admin' && !isAuthPage) {
      router.push('/dashboard');
    }
  }, [profile, profileLoading, router, isAuthPage]);

  // Show auth pages without the admin shell
  if (isAuthPage) return <>{children}</>;

  // Show spinner while auth or profile is loading
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

  // Show a clear error if Firestore denied the profile read (permissions not published yet)
  if (profileError) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-6 bg-zinc-950 p-8 text-center">
        <div className="flex aspect-square size-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
          <ShieldAlert className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-headline font-bold text-white">Firestore Permission Denied</h2>
          <p className="text-sm text-zinc-400 max-w-md">
            The security rules have not been published yet. Copy the contents of{" "}
            <code className="text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded text-xs">firestore.rules</code>{" "}
            and paste them into the{" "}
            <strong className="text-white">Firebase Console → Firestore → Rules</strong> tab, then click{" "}
            <strong className="text-white">Publish</strong>.
          </p>
          <p className="text-xs text-zinc-600 font-mono mt-2 break-all">{profileError.message}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-white/10 text-zinc-400 hover:text-white"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
          <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
            <Link href="/admin/auth">Back to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Show permission denied if authenticated user is not admin
  if (!user || (profile && profile.role !== 'admin')) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-6 bg-zinc-950 p-8 text-center">
        <div className="flex aspect-square size-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
          <ShieldAlert className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-headline font-bold text-white">Access Denied</h2>
          <p className="text-sm text-zinc-400">You do not have admin privileges to access this area.</p>
        </div>
        <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  // If profile hasn't loaded yet but user exists, keep showing spinner
  if (!profile) return null;

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
