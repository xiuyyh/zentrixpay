import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
            <div className="text-right">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Balance</p>
                <p className="text-sm font-bold text-primary">$124.50</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">JD</span>
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col p-6 overflow-x-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
