
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BalanceDisplay } from "@/components/wallet/balance-display"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, CheckCircle2, Clock, Zap, Wallet as WalletIcon, TrendingUp } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const stats = [
    { label: "Tasks Completed", value: "12", icon: CheckCircle2, color: "text-red-500" },
    { label: "Pending Reviews", value: "3", icon: Clock, color: "text-muted-foreground" },
    { label: "Earnings Potential", value: "₦450,000.00", icon: Zap, color: "text-accent" },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-headline font-bold text-foreground tracking-tight">Welcome back, John.</h2>
          <p className="text-muted-foreground mt-2 font-medium">Earn up to <span className="text-primary font-bold">₦15,000.00</span> today with available tasks.</p>
        </div>
        <Link href="/tasks">
          <Button className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-8 h-12 shadow-lg shadow-primary/20 group">
            Marketplace
            <ArrowUpRight className="ml-2 size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Button>
        </Link>
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
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            <BalanceDisplay amount={124500.00} label="Available" accent />
            <BalanceDisplay amount={35000.00} label="Processing" />
            <BalanceDisplay amount={842100.00} label="Lifetime Total" />
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
                            <p className="text-2xl font-headline font-bold mt-1">{stat.value}</p>
                        </div>
                        <div className={cn("p-3 rounded-xl bg-secondary/50", stat.color)}>
                            <stat.icon className="size-5" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/40 bg-card">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Top Performing Sectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
               {[
                 { cat: "Fintech", amount: "₦320k", percent: 75, color: "bg-primary" },
                 { cat: "AI & Software", amount: "₦150k", percent: 45, color: "bg-accent" },
                 { cat: "E-commerce", amount: "₦90k", percent: 30, color: "bg-muted-foreground" }
               ].map(item => (
                 <div key={item.cat} className="space-y-2">
                   <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                     <span className="text-muted-foreground">{item.cat}</span>
                     <span className="text-foreground">{item.amount}</span>
                   </div>
                   <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                     <div className={cn("h-full transition-all duration-1000", item.color)} style={{ width: `${item.percent}%` }} />
                   </div>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card">
          <CardHeader>
             <CardTitle className="font-headline text-lg">Platform Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 group cursor-pointer hover:bg-primary/10 transition-colors">
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Rewards Program</p>
                <p className="text-sm font-semibold mt-1">Tier 2 Bonuses Active</p>
                <p className="text-xs text-muted-foreground mt-1">Complete 5 tasks today for a 10% bonus multiplier.</p>
             </div>
             <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">System Status</p>
                <p className="text-sm font-semibold mt-1">Instant Payouts Live</p>
                <p className="text-xs text-muted-foreground mt-1">Withdrawals via Crypto and Bank Transfer are now instant.</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
