
"use client"

import {
  LayoutDashboard,
  LayoutGrid,
  Wallet,
  Settings,
  History,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Users
} from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useDoc, useUser, useFirestore } from "@/firebase"
import { doc } from "firebase/firestore"
import * as React from "react"

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Investment Plans",
    url: "/plans",
    icon: Zap,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: LayoutGrid,
  },
  {
    title: "Referrals",
    url: "/referrals",
    icon: Users,
  },
  {
    title: "Wallet",
    url: "/wallet",
    icon: Wallet,
  },
]

const accountItems = [
  {
    title: "History",
    url: "/history",
    icon: History,
  },
  {
    title: "Verification",
    url: "/verification",
    icon: ShieldCheck,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function NavMain() {
  const pathname = usePathname()
  const { user } = useUser()
  const firestore = useFirestore()

  const userProfileRef = React.useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile } = useDoc(userProfileRef);
  const isAdmin = profile?.role === 'admin';

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.url)}
                tooltip={item.title}
              >
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
      
      {isAdmin && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-red-500 font-bold">Admin Panel</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/admin')}
                tooltip="Admin Console"
                className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
              >
                <Link href="/admin/dashboard">
                  <ShieldAlert />
                  <span>Admin Console</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      )}

      <SidebarGroup>
        <SidebarGroupLabel>Account</SidebarGroupLabel>
        <SidebarMenu>
          {accountItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.url)}
                tooltip={item.title}
              >
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}
