
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUser, useFirestore } from "@/firebase"
import { collection, addDoc } from "firebase/firestore"
import { CheckCircle2, Copy, Smartphone, Wallet as WalletIcon, ArrowLeft, Loader2, ShieldCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function DepositConfirmationPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const amount = searchParams.get('amount');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isConfirmed, setIsConfirmed] = React.useState(false);

  const bankDetails = {
    accountNumber: "1922371706",
    bankName: "Carbon Microfinance Bank",
    accountName: "Peter John Bassey"
  };

  async function handleConfirmTransfer() {
    if (!user || !db || !amount) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'deposits'), {
        userId: user.uid,
        userEmail: user.email,
        amount: Number(amount),
        status: 'pending',
        submittedAt: new Date().toISOString()
      });

      setIsConfirmed(true);
      toast({
        title: "Deposit Submitted",
        description: "Your payment request has been sent for verification.",
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

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`
    });
  }

  if (isConfirmed) {
    return (
      <div className="max-w-2xl mx-auto w-full py-12">
        <Card className="text-center p-8 space-y-6 border-green-500/20 bg-green-500/5">
           <div className="size-20 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-10" />
           </div>
           <div className="space-y-2">
              <h2 className="text-3xl font-headline font-bold">Payment Logged</h2>
              <p className="text-muted-foreground">We are verifying your transfer of <span className="text-foreground font-bold font-mono">₦{Number(amount).toLocaleString()}</span>. This usually takes 5-30 minutes.</p>
           </div>
           <Button className="w-full h-12 font-bold" onClick={() => router.push('/wallet')}>Return to Wallet</Button>
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
                 <CardTitle className="font-headline text-xl">Payment Details</CardTitle>
                 <CardDescription>Transfer the exact amount to the account below.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                 <div className="text-center space-y-1 py-4 bg-secondary/20 rounded-2xl border border-dashed border-primary/20">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Amount to Pay</p>
                    <p className="text-4xl font-headline font-bold text-primary">₦{Number(amount).toLocaleString()}</p>
                 </div>

                 <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-border bg-background space-y-1 relative group">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Account Number</p>
                        <p className="text-xl font-mono font-bold tracking-tighter">{bankDetails.accountNumber}</p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(bankDetails.accountNumber, "Account number")}
                        >
                           <Copy className="size-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-border bg-background space-y-1">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Bank Name</p>
                            <p className="text-sm font-bold">{bankDetails.bankName}</p>
                        </div>
                        <div className="p-4 rounded-xl border border-border bg-background space-y-1">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Account Name</p>
                            <p className="text-sm font-bold">{bankDetails.accountName}</p>
                        </div>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <div className="p-6 rounded-2xl bg-secondary/10 border border-border flex gap-4 items-start">
              <ShieldCheck className="size-6 text-accent shrink-0" />
              <div className="space-y-1">
                 <p className="text-sm font-bold">Payment Security</p>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   Zentrix Pay uses manual verification to ensure maximum safety. Your funds are protected and will be credited immediately after our audit.
                 </p>
              </div>
           </div>
        </div>

        <div className="md:col-span-2 space-y-6">
           <Card className="border-accent/20 bg-accent/5">
              <CardHeader>
                 <CardTitle className="text-lg font-headline">Steps to Complete</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="space-y-4">
                    {[
                      { step: 1, text: "Open your banking app" },
                      { step: 2, text: `Transfer ₦${Number(amount).toLocaleString()}` },
                      { step: 3, text: "Click the confirmation button below" },
                      { step: 4, text: "Wait for admin approval" }
                    ].map(item => (
                      <div key={item.step} className="flex gap-3 items-center">
                         <div className="size-6 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            {item.step}
                         </div>
                         <p className="text-xs font-medium">{item.text}</p>
                      </div>
                    ))}
                 </div>

                 <Button 
                   className="w-full h-14 bg-accent hover:bg-accent/90 text-white font-bold text-lg rounded-xl shadow-xl shadow-accent/20" 
                   onClick={handleConfirmTransfer}
                   disabled={isSubmitting}
                 >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2 size-5" /> : null}
                    I've Made Transfer
                 </Button>
              </CardContent>
           </Card>

           <div className="text-center p-4">
              <p className="text-[10px] text-muted-foreground">Having issues? <span className="text-primary hover:underline cursor-pointer font-bold">Contact Support</span></p>
           </div>
        </div>
      </div>
    </div>
  );
}
