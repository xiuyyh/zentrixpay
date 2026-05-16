
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BalanceDisplay } from "@/components/wallet/balance-display"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, CheckCircle2, Clock, Zap, Wallet as WalletIcon } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const stats = [
    { label: "Tasks Completed", value: "12", icon: CheckCircle2, color: "text-green-500" },
    { label: "Pending Reviews", value: "3", icon: Clock, color: "text-yellow-500" },
    { label: "Earnings Potential", value: "$450.00", icon: Zap, color: "text-accent" },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-headline font-bold text-foreground">Welcome back, John!</h2>
          <p className="text-muted-foreground mt-2">You have 3 tasks available to earn <span className="text-accent font-bold">$15.00</span> today.</p>
        </div>
        <Link href="/tasks">
          <Button className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-full px-8 h-12 shadow-lg shadow-primary/20 group">
            Find New Tasks
            <ArrowUpRight className="ml-2 size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-primary/20 bg-card shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <WalletIcon className="size-32" />
          </div>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Wallet Summary</CardTitle>
            <CardDescription>Track your earnings and pending rewards.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            <BalanceDisplay amount={124.50} label="Available Balance" accent />
            <BalanceDisplay amount={35.00} label="Pending Clearance" />
            <BalanceDisplay amount={842.10} label="Total Lifetime Earnings" />
          </CardContent>
          <div className="bg-secondary/30 p-4 border-t flex justify-end gap-3">
            <Link href="/wallet">
              <Button variant="outline" size="sm">History</Button>
            </Link>
            <Link href="/wallet">
              <Button variant="default" size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Withdraw Funds</Button>
            </Link>
          </div>
        </Card>

        <div className="space-y-6">
            {stats.map((stat) => (
                <Card key={stat.label} className="border-border/50 bg-card hover:border-primary/40 transition-colors">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-headline font-bold mt-1">{stat.value}</p>
                        </div>
                        <div className={cn("p-3 rounded-xl bg-secondary", stat.color)}>
                            <stat.icon className="size-6" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Top Earning Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {[
                 { cat: "Fintech", amount: "$320", percent: 75 },
                 { cat: "Software", amount: "$150", percent: 45 },
                 { cat: "E-commerce", amount: "$90", percent: 30 }
               ].map(item => (
                 <div key={item.cat} className="space-y-2">
                   <div className="flex justify-between text-sm">
                     <span>{item.cat}</span>
                     <span className="font-bold">{item.amount}</span>
                   </div>
                   <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                     <div className="h-full bg-primary" style={{ width: `${item.percent}%` }} />
                   </div>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card">
          <CardHeader>
             <CardTitle className="font-headline text-lg">Platform Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm font-semibold text-primary">New Bonus Program</p>
                <p className="text-xs text-muted-foreground mt-1">Complete 10 software reviews this month for an extra $20.00 bonus.</p>
             </div>
             <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                <p className="text-sm font-semibold">Instant Payouts Enabled</p>
                <p className="text-xs text-muted-foreground mt-1">You can now withdraw via PayPal instantly for balances over $50.</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
