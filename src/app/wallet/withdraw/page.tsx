'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUser, useFirestore, useDoc } from "@/firebase"
import { collection, addDoc, doc, updateDoc, increment } from "firebase/firestore"
import { CheckCircle2, CreditCard, ArrowLeft, Loader2, ShieldCheck, AlertCircle, Banknote, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function WithdrawalPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const amountStr = searchParams.get('amount');
  const amount = Number(amountStr);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  
  const [bankName, setBankName] = React.useState("");
  const [accountName, setAccountName] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");

  const profileRef = React.useMemo(() => user ? doc(db, 'users', user.uid) : null, [user, db]);
  const { data: profile } = useDoc(profileRef);

  React.useEffect(() => {
    if (!amountStr || isNaN(amount) || amount < 1000) {
      router.push('/wallet');
    }
    if (profile && !profile.activePlanId) {
        toast({
            title: "Access Denied",
            description: "An active investment plan is required for withdrawals.",
            variant: "destructive"
        });
        router.push('/wallet');
    }
  }, [amountStr, amount, router, profile, toast]);

  async function handleSubmit() {
    if (!user || !db || !amount || !bankName || !accountName || !accountNumber) {
      toast({ title: "Validation Error", description: "All bank details are required.", variant: "destructive" });
      return;
    }
    
    if (!profile?.activePlanId) {
        toast({ title: "Security Halt", description: "You must purchase a plan before withdrawing.", variant: "destructive" });
        return;
    }

    if (amount > (profile?.balance || 0)) {
        toast({ title: "Insufficient Funds", description: "Amount exceeds available balance.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    try {
      // 1. Deduct from balance immediately to prevent double withdrawal
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(-amount)
      });

      // 2. Create withdrawal request
      await addDoc(collection(db, 'withdrawals'), {
        userId: user.uid,
        userEmail: user.email,
        amount: amount,
        bankDetails: `${bankName} | ${accountName} | ${accountNumber}`,
        status: 'pending',
        submittedAt: new Date().toISOString()
      });

      setIsConfirmed(true);
      toast({
        title: "Payout Requested",
        description: "Your withdrawal request is being processed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isConfirmed) {
    return (
      <div className="max-w-2xl mx-auto w-full py-12">
        <Card className="text-center p-8 space-y-6 border-primary/20 bg-primary/5">
           <div className="size-20 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-10" />
           </div>
           <div className="space-y-2">
              <h2 className="text-3xl font-headline font-bold">Request Received</h2>
              <p className="text-muted-foreground">Your payout of <span className="text-foreground font-bold font-mono">₦{amount.toLocaleString()}</span> has been queued. Funds are typically disbursed within 24 hours.</p>
           </div>
           <Button className="w-full h-12 font-bold bg-primary text-white" onClick={() => router.push('/wallet')}>Return to Wallet</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href="/wallet" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="size-4 mr-1" />
        Back to Wallet
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-6">
           <Card className="border-primary/20 bg-card overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                 <CardTitle className="font-headline text-xl">Payout Credentials</CardTitle>
                 <CardDescription>Enter the bank account where you want to receive your ₦{amount.toLocaleString()}.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <Label>Recipient Bank</Label>
                       <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Zenith Bank, Kuda, GTBank" className="bg-zinc-950 border-white/10" />
                    </div>
                    <div className="space-y-2">
                       <Label>Account Number</Label>
                       <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="10 Digits" className="bg-zinc-950 border-white/10" />
                    </div>
                    <div className="space-y-2">
                       <Label>Account Name</Label>
                       <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="As it appears on your app" className="bg-zinc-950 border-white/10" />
                    </div>
                 </div>

                 <div className="p-4 rounded-xl border border-dashed border-primary/20 bg-secondary/20 space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest text-center">Net Withdrawal Amount</p>
                    <p className="text-3xl font-headline font-bold text-primary text-center">₦{amount.toLocaleString()}</p>
                 </div>
              </CardContent>
           </Card>

           <div className="p-6 rounded-2xl bg-secondary/10 border border-border flex gap-4 items-start">
              <ShieldCheck className="size-6 text-accent shrink-0" />
              <div className="space-y-1">
                 <p className="text-sm font-bold">Secure Disbursal</p>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   Payouts are processed daily. Ensure your account details are correct; Zentrix Pay is not responsible for transfers to incorrect accounts.
                 </p>
              </div>
           </div>
        </div>

        <div className="md:col-span-2 space-y-6">
           <Card className="border-accent/20 bg-accent/5">
              <CardHeader>
                 <CardTitle className="text-lg font-headline">Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 {!profile?.activePlanId ? (
                    <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20 mb-4">
                       <AlertTriangle className="size-4 text-red-500 shrink-0 mt-0.5" />
                       <p className="text-[10px] text-red-500 leading-tight">You must purchase a plan before confirming this payout.</p>
                    </div>
                 ) : (
                    <p className="text-xs text-muted-foreground italic">
                        By clicking the button below, you authorize the deduction of ₦{amount.toLocaleString()} from your wallet for immediate payout.
                    </p>
                 )}

                 <Button 
                   className="w-full h-14 bg-accent hover:bg-accent/90 text-white font-bold text-lg rounded-xl shadow-xl shadow-accent/20" 
                   onClick={handleSubmit}
                   disabled={isSubmitting || !bankName || !accountNumber || !accountName || !profile?.activePlanId}
                 >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2 size-5" /> : <Banknote className="mr-2 size-5" />}
                    Confirm Payout
                 </Button>
                 
                 <div className="flex items-start gap-2 p-3 bg-red-500/5 rounded-lg border border-red-500/10 mt-4">
                    <AlertCircle className="size-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-red-500 leading-tight">Minimum withdrawal is ₦1,000. Requests are final once submitted.</p>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
