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
import { Zap } from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <div className="p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Verified Fintech Partner</p>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
