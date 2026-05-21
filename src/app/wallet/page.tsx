
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BalanceDisplay } from "@/components/wallet/balance-display"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Download, History, PiggyBank, Smartphone, TrendingUp, Plus, ArrowUpRight, Loader2, ArrowDownLeft, Zap } from "lucide-react"
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
  const [isWithdrawOpen, setIsWithdrawOpen] = React.useState(false);
  const [depositAmount, setDepositAmount] = React.useState("");
  const [withdrawAmount, setWithdrawAmount] = React.useState("");

  const profileRef = React.useMemo(() => user ? doc(db, 'users', user.uid) : null, [user, db]);
  const { data: profile } = useDoc(profileRef);

  const transactionsQuery = React.useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'deposits'),
      where('userId', '==', user.uid),
      orderBy('submittedAt', 'desc'),
      limit(20)
    );
  }, [db, user]);

  const withdrawalsQuery = React.useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'withdrawals'),
      where('userId', '==', user.uid),
      orderBy('submittedAt', 'desc'),
      limit(20)
    );
  }, [db, user]);

  const submissionsQuery = React.useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'submissions'),
      where('userId', '==', user.uid),
      where('status', '==', 'verified'),
      orderBy('submittedAt', 'desc'),
      limit(20)
    );
  }, [db, user]);

  const { data: deposits, loading: depositsLoading } = useCollection(transactionsQuery);
  const { data: withdrawals, loading: withdrawalsLoading } = useCollection(withdrawalsQuery);
  const { data: earnings, loading: earningsLoading } = useCollection(submissionsQuery);

  const combinedTransactions = React.useMemo(() => {
    const all = [
      ...(deposits || []).map(d => ({ ...d, type: 'DEPOSIT', amount: d.amount, date: d.submittedAt })),
      ...(withdrawals || []).map(w => ({ ...w, type: 'WITHDRAWAL', amount: w.amount, date: w.submittedAt })),
      ...(earnings || []).map(e => ({ ...e, type: 'EARNING', amount: e.rewardAmount, date: e.submittedAt, name: e.companyName }))
    ];
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);
  }, [deposits, withdrawals, earnings]);

  function handleDepositInit() {
    const amt = Number(depositAmount);
    if (!depositAmount || isNaN(amt) || amt < 1000) return;
    router.push(`/wallet/deposit?amount=${depositAmount}`);
  }

  function handleWithdrawInit() {
    const amt = Number(withdrawAmount);
    if (!withdrawAmount || isNaN(amt) || amt < 1000) return;
    if (amt > (profile?.balance || 0)) return;
    router.push(`/wallet/withdraw?amount=${withdrawAmount}`);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">Reward Wallet</h2>
          <p className="text-muted-foreground">Manage your earnings and fund your investment plans.</p>
        </div>
        <div className="flex gap-2">
            <Button size="sm" variant="outline" className="font-bold border-primary text-primary hover:bg-primary/5" onClick={() => setIsWithdrawOpen(true)}>
               <ArrowDownLeft className="size-4 mr-1" />
               Withdraw
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 font-bold" onClick={() => setIsDepositOpen(true)}>
               <Plus className="size-4 mr-1" />
               Deposit
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 border-primary/20 bg-card overflow-hidden">
           <CardHeader className="border-b bg-secondary/10">
              <div className="flex justify-between items-center">
                 <div>
                    <CardTitle className="font-headline">Account Balances</CardTitle>
                    <CardDescription>Payouts are processed daily by our security team.</CardDescription>
                 </div>
                 <Smartphone className="size-8 text-accent opacity-20" />
              </div>
           </CardHeader>
           <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 p-8">
              <BalanceDisplay amount={profile?.balance || 0} label="Available Balance" accent />
              <BalanceDisplay amount={profile?.pendingBalance || 0} label="Processing (Tasks)" />
              <BalanceDisplay amount={profile?.lifetimeEarnings || 0} label="Total Earned" />
           </CardContent>
           <div className="p-8 pt-0 flex flex-wrap gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 font-bold" onClick={() => setIsDepositOpen(true)}>
                <Plus className="mr-2 size-5" />
                Deposit
              </Button>
              <Button size="lg" variant="secondary" className="px-8 font-bold border border-primary/20" onClick={() => setIsWithdrawOpen(true)}>
                <CreditCard className="mr-2 size-5" />
                Withdraw
              </Button>
           </div>
        </Card>

        <Card className="border-border bg-card">
           <CardHeader>
              <CardTitle className="font-headline text-lg">Platform Growth</CardTitle>
           </CardHeader>
           <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="size-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <TrendingUp className="size-5" />
                 </div>
                 <div>
                    <p className="text-xs text-muted-foreground">Plan Status</p>
                    <p className="text-lg font-bold">{profile?.activePlanId ? "Active Tier" : "Inactive"}</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <PiggyBank className="size-5" />
                 </div>
                 <div>
                    <p className="text-xs text-muted-foreground">Commission</p>
                    <p className="text-lg font-bold">5% Referral</p>
                 </div>
              </div>
              <div className="pt-4 border-t border-border">
                 <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">Payout Method</p>
                 <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2">
                       <div className="size-6 bg-blue-600 rounded flex items-center justify-center text-[10px] text-white font-bold">B</div>
                       <span className="text-xs font-semibold">Bank Payout</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] text-accent">Edit</Button>
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="size-5 text-muted-foreground" />
            <CardTitle className="font-headline text-xl">Combined History</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {depositsLoading || withdrawalsLoading || earningsLoading ? (
                 <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : combinedTransactions.length === 0 ? (
                 <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No recent activity.</TableCell></TableRow>
              ) : (
                combinedTransactions.map((tx: any) => (
                  <TableRow key={tx.id} className="border-border hover:bg-secondary/20">
                    <TableCell className="text-muted-foreground text-xs">{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {tx.type === 'EARNING' ? <Zap className="size-3 text-yellow-500" /> : <CreditCard className="size-3 text-muted-foreground" />}
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-widest ${tx.type === 'DEPOSIT' || tx.type === 'EARNING' ? 'bg-green-500/5 text-green-500' : 'bg-red-500/5 text-red-500'}`}>
                          {tx.type} {tx.name ? `(${tx.name})` : ''}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`size-1.5 rounded-full ${tx.status === 'approved' || tx.status === 'verified' ? 'bg-green-500' : tx.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`} />
                        <span className="text-xs font-medium capitalize">{tx.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className={`text-right font-bold font-headline ${tx.type === 'DEPOSIT' || tx.type === 'EARNING' ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.type === 'DEPOSIT' || tx.type === 'EARNING' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Deposit Dialog */}
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Top Up Wallet</DialogTitle>
            <DialogDescription>
              Enter an amount to deposit via manual bank transfer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dep-amount">Amount (₦)</Label>
              <Input 
                id="dep-amount" 
                placeholder="Minimum 1,000" 
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="h-12 text-lg font-bold"
              />
            </div>
            <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
               <span className="text-primary font-bold">*</span> Minimum deposit required is ₦1,000.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDepositOpen(false)}>Cancel</Button>
            <Button onClick={handleDepositInit} disabled={!depositAmount || Number(depositAmount) < 1000} className="bg-primary text-white font-bold h-10 px-6">
               Continue
               <ArrowUpRight className="ml-2 size-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Dialog */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Submit Payout</DialogTitle>
            <DialogDescription>
              Request a withdrawal from your available balance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="with-amount">Amount (₦)</Label>
              <Input 
                id="with-amount" 
                placeholder="Minimum 1,000" 
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="h-12 text-lg font-bold"
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
               <span>Available</span>
               <span className="text-primary">₦{(profile?.balance || 0).toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
               <span className="text-primary font-bold">*</span> Minimum withdrawal is ₦1,000.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWithdrawOpen(false)}>Cancel</Button>
            <Button 
                onClick={handleWithdrawInit} 
                disabled={!withdrawAmount || Number(withdrawAmount) < 1000 || Number(withdrawAmount) > (profile?.balance || 0)} 
                className="bg-accent text-white font-bold h-10 px-6 hover:bg-accent/90"
            >
               Request Payout
               <CreditCard className="ml-2 size-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
