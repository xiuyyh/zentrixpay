'use client';

"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { ShieldCheck, Users, ClipboardCheck, LayoutDashboard, LogOut, User as UserIcon, ArrowLeft, Zap, ArrowDownCircle, LayoutGrid } from "lucide-react"
import { useUser, useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/admin/auth')
  }

  const navItems = [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "User Directory",
      url: "/admin/dashboard",
      icon: Users,
    },
    {
      title: "Manage Tasks",
      url: "/admin/tasks",
      icon: LayoutGrid,
    },
    {
      title: "Plan Distribution",
      url: "/admin/plans",
      icon: Zap,
    },
    {
      title: "Task Verification",
      url: "/admin/submissions",
      icon: ClipboardCheck,
    },
    {
      title: "Deposit Requests",
      url: "/admin/deposits",
      icon: ArrowDownCircle,
    },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5" {...props}>
      <SidebarHeader className="bg-zinc-950">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-red-600 text-white shadow-lg shadow-red-500/20">
                <ShieldCheck className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-headline font-bold text-lg tracking-tighter text-white">
                    ZENTRIX<span className="text-red-500">ADMIN</span>
                </span>
                <span className="truncate text-[10px] uppercase tracking-widest text-red-500/60 font-bold">System Root</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-zinc-950">
        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="data-[active=true]:bg-red-500/10 data-[active=true]:text-red-500 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
           <SidebarGroupContent>
              <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                        <Link href="/dashboard">
                           <ArrowLeft className="size-4" />
                           <span>Exit to User App</span>
                        </Link>
                    </SidebarMenuButton>
                 </SidebarMenuItem>
              </SidebarMenu>
           </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-zinc-950 border-t border-white/5">
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <div className="flex items-center gap-3 p-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-zinc-900 border border-white/10 text-zinc-400">
                  <UserIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-xs text-white">{user.displayName || 'Admin'}</span>
                  <span className="truncate text-[10px] text-zinc-500">{user.email}</span>
                </div>
              </div>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout} 
              className="text-red-500 hover:text-red-400 hover:bg-red-500/10 font-bold"
            >
              <LogOut className="size-4" />
              <span>Terminate Session</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
