
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BalanceDisplay } from "@/components/wallet/balance-display"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, CheckCircle2, Clock, Zap, Wallet as WalletIcon, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useUser, useFirestore, useDoc } from "@/firebase"
import { doc } from "firebase/firestore"
import * as React from "react"

const PLAN_NAMES: Record<string, string> = {
  "p15k": "₦15,000 Starter",
  "p35k": "₦35,000 Basic",
  "p70k": "₦70,000 Bronze",
  "p100k": "₦100,000 Silver",
  "p150k": "₦150,000 Gold",
  "p200k": "₦200,000 Platinum",
  "p300k": "₦300,000 Diamond",
  "p500k": "₦500,000 Executive",
};

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const userProfileRef = React.useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile } = useDoc(userProfileRef);

  const stats = [
    { label: "Tasks Completed", value: "12", icon: CheckCircle2, color: "text-red-500" },
    { label: "Active Plan", value: profile?.activePlanId ? PLAN_NAMES[profile.activePlanId] : "No Active Plan", icon: Zap, color: "text-accent" },
    { label: "Referrals", value: profile?.referralCount || "0", icon: TrendingUp, color: "text-green-500" },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-headline font-bold text-foreground tracking-tight">Welcome back, {user?.displayName?.split(' ')[0] || 'Member'}.</h2>
          {!profile?.activePlanId && (
            <p className="text-accent mt-2 font-bold animate-pulse flex items-center gap-2">
              <AlertTriangle className="size-4" />
              Activate a plan to start earning rewards.
            </p>
          )}
          {profile?.activePlanId && (
            <p className="text-muted-foreground mt-2 font-medium">Your current tier is <span className="text-primary font-bold">{PLAN_NAMES[profile.activePlanId]}</span>.</p>
          )}
        </div>
        {!profile?.activePlanId ? (
          <Link href="/plans">
            <Button className="bg-accent hover:bg-accent/90 text-white font-bold rounded-xl px-8 h-12 shadow-lg shadow-accent/20">
              Activate Plan
            </Button>
          </Link>
        ) : (
          <Link href="/tasks">
            <Button className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-8 h-12 shadow-lg shadow-primary/20 group">
              Browse Tasks
              <ArrowUpRight className="ml-2 size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-primary/10 bg-card shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <TrendingUp className="size-48" />
          </div>
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
                <WalletIcon className="size-5 text-primary" />
                Wallet Overview
            </CardTitle>
            <CardDescription>Consolidated view of your Zentrix Pay earnings.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pt-4">
            <BalanceDisplay amount={profile?.balance || 0} label="Available" accent />
            <BalanceDisplay amount={profile?.pendingBalance || 0} label="Processing" />
            <BalanceDisplay amount={profile?.lifetimeEarnings || 0} label="Lifetime Total" />
          </CardContent>
          <div className="bg-secondary/20 p-4 border-t border-border/50 flex justify-end gap-3">
            <Link href="/wallet">
              <Button variant="ghost" size="sm" className="font-bold">History</Button>
            </Link>
            <Link href="/wallet">
              <Button variant="default" size="sm" className="bg-primary text-white hover:bg-primary/90 font-bold">Withdraw Now</Button>
            </Link>
          </div>
        </Card>

        <div className="space-y-4">
            {stats.map((stat) => (
                <Card key={stat.label} className="border-border/40 bg-card hover:bg-secondary/20 transition-all cursor-default">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                            <p className="text-xl font-headline font-bold mt-1">{stat.value}</p>
                        </div>
                        <div className={cn("p-3 rounded-xl bg-secondary/50", stat.color)}>
                            <stat.icon className="size-5" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </div>
  )
}
