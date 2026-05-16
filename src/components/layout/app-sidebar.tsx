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
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { Zap, LogOut, User as UserIcon } from "lucide-react"
import { useUser, useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const auth = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/auth')
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Zap className="size-4" fill="currentColor" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-headline font-bold text-lg tracking-tighter text-foreground">ZENTRIX<span className="text-primary">PAY</span></span>
                <span className="truncate text-[10px] uppercase tracking-widest opacity-60 font-semibold">Premium Rewards</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="hover:bg-sidebar-accent group">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <UserIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-xs">{user.displayName || user.email?.split('@')[0]}</span>
                  <span className="truncate text-[10px] opacity-60">{user.email}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="size-4" />
              <span className="font-bold">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="p-4 text-center border-t border-sidebar-border mt-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Verified Partner</p>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
