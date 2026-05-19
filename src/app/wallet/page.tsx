
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BalanceDisplay } from "@/components/wallet/balance-display"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Download, History, PiggyBank, Smartphone, TrendingUp, Plus, ArrowUpRight, Loader2 } from "lucide-react"
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase"
import { doc, collection, query, where, orderBy, limit } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function WalletPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [isDepositOpen, setIsDepositOpen] = React.useState(false);
  const [depositAmount, setDepositAmount] = React.useState("");

  const profileRef = React.useMemo(() => user ? doc(db, 'users', user.uid) : null, [user, db]);
  const { data: profile } = useDoc(profileRef);

  const depositsQuery = React.useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'deposits'),
      where('userId', '==', user.uid),
      orderBy('submittedAt', 'desc'),
      limit(10)
    );
  }, [db, user]);

  const { data: deposits, loading: depositsLoading } = useCollection(depositsQuery);

  function handleDepositInit() {
    if (!depositAmount || isNaN(Number(depositAmount))) return;
    router.push(`/wallet/deposit?amount=${depositAmount}`);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">Reward Wallet</h2>
          <p className="text-muted-foreground">Manage your earnings and fund your investment plans.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex gap-2" onClick={() => {}}>
               <Download className="size-4" />
               Statement
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 font-bold" onClick={() => setIsDepositOpen(true)}>
               <Plus className="size-4 mr-1" />
               Deposit Funds
            </Button>
        </div>
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
           <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 p-8">
              <BalanceDisplay amount={profile?.balance || 0} label="Available Balance" accent />
              <BalanceDisplay amount={profile?.pendingBalance || 0} label="Pending Rewards" />
              <BalanceDisplay amount={profile?.lifetimeEarnings || 0} label="Total Earned" />
           </CardContent>
           <div className="p-8 pt-0 flex flex-wrap gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 font-bold" onClick={() => setIsDepositOpen(true)}>
                <Plus className="mr-2 size-5" />
                Deposit
              </Button>
              <Button size="lg" variant="secondary" className="px-8 font-bold">
                <CreditCard className="mr-2 size-5" />
                Transfer to Bank
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
                    <p className="text-xs text-muted-foreground">Active Plan</p>
                    <p className="text-lg font-bold">{profile?.activePlanId ? "Premium Tier" : "None"}</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <PiggyBank className="size-5" />
                 </div>
                 <div>
                    <p className="text-xs text-muted-foreground">Referral Bonus</p>
                    <p className="text-lg font-bold">5% Instant</p>
                 </div>
              </div>
              <div className="pt-4 border-t border-border">
                 <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">Preferred Method</p>
                 <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2">
                       <div className="size-6 bg-blue-600 rounded flex items-center justify-center text-[10px] text-white font-bold">B</div>
                       <span className="text-xs font-semibold">Bank Transfer</span>
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
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {depositsLoading ? (
                 <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : deposits?.length === 0 ? (
                 <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No recent transactions.</TableCell></TableRow>
              ) : (
                deposits?.map((tx) => (
                  <TableRow key={tx.id} className="border-border hover:bg-secondary/20">
                    <TableCell className="text-muted-foreground">{new Date(tx.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">Wallet Deposit Request</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest bg-blue-500/5 text-blue-500">
                         DEPOSIT
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`size-1.5 rounded-full ${tx.status === 'approved' ? 'bg-green-500' : tx.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`} />
                        <span className="text-xs font-medium capitalize">{tx.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold font-headline text-accent">
                      +₦{tx.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Fund Your Wallet</DialogTitle>
            <DialogDescription>
              Enter the amount you wish to deposit to your Zentrix Pay account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Deposit Amount (₦)</Label>
              <Input 
                id="amount" 
                placeholder="e.g. 15000" 
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="h-12 text-lg font-bold"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Min deposit: ₦1,000. Max deposit: ₦1,000,000.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDepositOpen(false)}>Cancel</Button>
            <Button onClick={handleDepositInit} className="bg-primary text-white font-bold h-10 px-6">
               Proceed to Payment
               <ArrowUpRight className="ml-2 size-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
