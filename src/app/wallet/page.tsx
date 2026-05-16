
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BalanceDisplay } from "@/components/wallet/balance-display"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Download, History, PiggyBank, Smartphone, TrendingUp } from "lucide-react"

const history = [
  { id: "TX-9281", date: "2024-03-24", company: "SwiftPay Solutions", type: "Task", amount: "+$5.00", status: "Completed" },
  { id: "TX-9275", date: "2024-03-22", company: "EcoSphere Systems", type: "Task", amount: "+$7.50", status: "Pending" },
  { id: "TX-9240", date: "2024-03-20", company: "Payout: Bank Transfer", type: "Withdrawal", amount: "-$100.00", status: "Completed" },
  { id: "TX-9233", date: "2024-03-18", company: "HealthCore AI", type: "Task", amount: "+$4.00", status: "Completed" },
  { id: "TX-9210", date: "2024-03-15", company: "Logix Global", type: "Task", amount: "+$12.00", status: "Completed" },
]

export default function WalletPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">Reward Wallet</h2>
          <p className="text-muted-foreground">Manage your earnings and withdraw to your bank account.</p>
        </div>
        <Button variant="outline" size="sm" className="hidden md:flex gap-2">
           <Download className="size-4" />
           Export Statement
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 border-primary/20 bg-card overflow-hidden">
           <CardHeader className="border-b bg-secondary/10">
              <div className="flex justify-between items-center">
                 <div>
                    <CardTitle className="font-headline">Account Balances</CardTitle>
                    <CardDescription>Withdrawals are processed every 24 hours.</CardDescription>
                 </div>
                 <Smartphone className="size-8 text-accent opacity-20" />
              </div>
           </CardHeader>
           <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
              <BalanceDisplay amount={124.50} label="Available to Withdraw" accent />
              <BalanceDisplay amount={35.00} label="Pending Reviews" />
              <BalanceDisplay amount={842.10} label="Total Earned" />
           </CardContent>
           <div className="p-8 pt-0 flex flex-wrap gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 font-bold">
                <CreditCard className="mr-2 size-5" />
                Transfer to Bank
              </Button>
              <Button size="lg" variant="secondary" className="px-8 font-bold">
                <Smartphone className="mr-2 size-5" />
                PayPal Payout
              </Button>
           </div>
        </Card>

        <Card className="border-border bg-card">
           <CardHeader>
              <CardTitle className="font-headline text-lg">Earnings Growth</CardTitle>
           </CardHeader>
           <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="size-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <TrendingUp className="size-5" />
                 </div>
                 <div>
                    <p className="text-xs text-muted-foreground">This Month</p>
                    <p className="text-lg font-bold">+$245.50</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <PiggyBank className="size-5" />
                 </div>
                 <div>
                    <p className="text-xs text-muted-foreground">Referral Bonus</p>
                    <p className="text-lg font-bold">+$42.00</p>
                 </div>
              </div>
              <div className="pt-4 border-t border-border">
                 <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">Payout Method</p>
                 <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2">
                       <div className="size-6 bg-blue-600 rounded flex items-center justify-center text-[10px] text-white font-bold">V</div>
                       <span className="text-xs font-semibold">Visa .... 4242</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] text-accent">Change</Button>
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="size-5 text-muted-foreground" />
            <CardTitle className="font-headline text-xl">Transaction History</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((tx) => (
                <TableRow key={tx.id} className="border-border hover:bg-secondary/20">
                  <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                  <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                  <TableCell className="font-medium">{tx.company}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest">
                       {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`size-1.5 rounded-full ${tx.status === 'Completed' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                      <span className="text-xs font-medium">{tx.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className={`text-right font-bold font-headline ${tx.amount.startsWith('+') ? 'text-accent' : 'text-foreground'}`}>
                    {tx.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
