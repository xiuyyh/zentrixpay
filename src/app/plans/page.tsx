
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { Check, Zap, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AVAILABLE_PLANS = [
  { id: "p15k", name: "💼 ₦15,000 PLAN", price: 15000, daily: 600, total: 3000, net: 2700, days: 5 },
  { id: "p35k", name: "💼 ₦35,000 PLAN", price: 35000, daily: 1400, total: 7000, net: 6300, days: 5 },
  { id: "p70k", name: "💼 ₦70,000 PLAN", price: 70000, daily: 2800, total: 14000, net: 12600, days: 5 },
  { id: "p100k", name: "💼 ₦100,000 PLAN", price: 100000, daily: 4000, total: 20000, net: 18000, days: 5 },
  { id: "p150k", name: "💼 ₦150,000 PLAN", price: 150000, daily: 6000, total: 30000, net: 27000, days: 5 },
  { id: "p200k", name: "💼 ₦200,000 PLAN", price: 200000, daily: 8000, total: 40000, net: 36000, days: 5 },
  { id: "p300k", name: "💼 ₦300,000 PLAN", price: 300000, daily: 12000, total: 60000, net: 54000, days: 5 },
  { id: "p500k", name: "💼 ₦500,000 PLAN", price: 500000, daily: 20000, total: 100000, net: 90000, days: 5 },
];

export default function PlansPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  const profileRef = React.useMemo(() => user ? doc(db, 'users', user.uid) : null, [user, db]);
  const { data: profile } = useDoc(profileRef);

  async function handlePurchase(plan: typeof AVAILABLE_PLANS[0]) {
    if (!user || !profile || !db) return;
    
    // Check balance
    if (profile.balance < plan.price) {
      toast({
        title: "Insufficient Funds",
        description: "Please deposit more Naira to your wallet to purchase this plan.",
        variant: "destructive"
      });
      return;
    }

    setLoadingId(plan.id);
    try {
      // 1. Deduct balance and set plan
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(-plan.price),
        activePlanId: plan.id,
      });

      // 2. Handle Referral Commission (5%)
      if (profile.referredBy) {
        const commission = plan.price * 0.05;
        const referrerRef = doc(db, 'users', profile.referredBy);
        const referrerSnap = await getDoc(referrerRef);
        
        if (referrerSnap.exists()) {
          await updateDoc(referrerRef, {
            balance: increment(commission),
            lifetimeEarnings: increment(commission)
          });
          
          console.log(`Awarded ₦${commission} commission to referrer ${profile.referredBy}`);
        }
      }

      toast({
        title: "Plan Activated!",
        description: `You are now on the ${plan.name}. Start completing tasks to earn!`,
      });
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-headline font-bold text-foreground">Investment Plans</h2>
        <p className="text-muted-foreground text-lg">Choose a plan that matches your level and start growing steadily.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {AVAILABLE_PLANS.map((plan) => {
          const isActive = profile?.activePlanId === plan.id;
          return (
            <Card key={plan.id} className={`relative overflow-hidden border-2 transition-all ${isActive ? 'border-primary shadow-2xl scale-105 z-10' : 'border-border/50 hover:border-primary/50'}`}>
              {isActive && (
                <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-bl-lg">
                  Active
                </div>
              )}
              <CardHeader>
                <CardTitle className="font-headline text-xl">{plan.name}</CardTitle>
                <CardDescription>5 Day Earning Cycle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold font-headline">
                  <span className="text-muted-foreground text-sm font-normal mr-1">₦</span>
                  {plan.price.toLocaleString()}
                </div>
                <div className="space-y-2 text-sm font-medium">
                  <div className="flex justify-between items-center text-green-500">
                    <span className="flex items-center gap-1.5"><TrendingUp className="size-4" /> Daily Return:</span>
                    <span>₦{plan.daily.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><Zap className="size-4" /> 5 Days Total:</span>
                    <span>₦{plan.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-bold">Net Payout:</span>
                    <span className="text-primary font-bold">₦{plan.net.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full font-bold h-11" 
                  variant={isActive ? "secondary" : "default"}
                  disabled={isActive || !!loadingId}
                  onClick={() => handlePurchase(plan)}
                >
                  {loadingId === plan.id ? <Loader2 className="animate-spin size-4 mr-2" /> : isActive ? <Check className="size-4 mr-2" /> : null}
                  {isActive ? "Currently Active" : "Purchase Plan"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 space-y-4">
            <h4 className="font-headline font-bold text-lg flex items-center gap-2 text-primary">
              <Zap className="size-5" />
              Referral Bonuses
            </h4>
            <p className="text-sm text-muted-foreground">Invite friends and earn instantly when they activate a plan.</p>
            <div className="bg-background rounded-xl p-4 border border-primary/10">
                <p className="text-2xl font-bold text-primary">5% Instant Bonus</p>
                <p className="text-xs text-muted-foreground mt-1">On every direct referral activation.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="p-6 space-y-4">
            <h4 className="font-headline font-bold text-lg flex items-center gap-2 text-accent">
              <AlertCircle className="size-5" />
              Weekly Salary
            </h4>
            <p className="text-sm text-muted-foreground">Top performers qualify for consistent weekly payouts.</p>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-3 bg-background rounded-lg border border-accent/10">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">20 Referrals</p>
                  <p className="text-lg font-bold text-accent">₦10,000 / week</p>
               </div>
               <div className="p-3 bg-background rounded-lg border border-accent/10">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">40 Referrals</p>
                  <p className="text-lg font-bold text-accent">₦30,000 / week</p>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
