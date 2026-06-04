'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { Copy, Users, Zap, Gift, Smartphone, TrendingUp, CheckCircle2, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ReferralsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const profileRef = React.useMemo(() => user ? doc(db, 'users', user.uid) : null, [user, db]);
  const { data: profile } = useDoc(profileRef);

  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/auth?ref=${user?.uid}` 
    : '';

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link Copied!",
      description: "Share this link with your friends to earn rewards.",
    });
  }

  const salaryTiers = [
    { count: 20, salary: "₦10,000", status: (profile?.referralCount || 0) >= 20 },
    { count: 40, salary: "₦30,000", status: (profile?.referralCount || 0) >= 40 },
  ];

  const bonusBreakdown = [
    { plan: "₦15,000", bonus: "₦750" },
    { plan: "₦35,000", bonus: "₦1,750" },
    { plan: "₦70,000", bonus: "₦3,500" },
    { plan: "₦100,000", bonus: "₦5,000" },
    { plan: "₦150,000", bonus: "₦7,500" },
    { plan: "₦200,000", bonus: "₦10,000" },
    { plan: "₦300,000", bonus: "₦15,000" },
    { plan: "₦500,000", bonus: "₦25,000" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-headline font-bold text-foreground tracking-tight">Referral Program</h2>
          <p className="text-muted-foreground mt-2 font-medium italic">Grow the Zentrix community and get paid for every active recruit.</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 px-6 py-3 rounded-2xl flex items-center gap-3">
           <Gift className="size-6 text-primary" />
           <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Instant Commission</p>
              <p className="text-xl font-bold text-primary">5% Per Activation</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-primary/20 bg-card overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="font-headline flex items-center gap-2">
                 <Smartphone className="size-5 text-primary" />
                 Your Invitation Link
              </CardTitle>
              <CardDescription>Share this unique link to track your referrals and earnings.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
               <div className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    readOnly 
                    value={referralLink} 
                    className="bg-secondary/50 border-primary/20 h-12 font-mono text-sm"
                  />
                  <Button onClick={copyLink} className="bg-primary hover:bg-primary/90 h-12 px-8 font-bold text-white shrink-0">
                     <Copy className="size-4 mr-2" />
                     Copy Link
                  </Button>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  <div className="p-6 rounded-2xl bg-secondary/30 border border-border flex items-center gap-4">
                     <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Users className="size-6" />
                     </div>
                     <div>
                        <p className="text-xs text-muted-foreground font-bold uppercase">Active Referrals</p>
                        <p className="text-2xl font-headline font-bold">{profile?.referralCount || 0}</p>
                     </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/30 border border-border flex items-center gap-4">
                     <div className="size-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
                        <TrendingUp className="size-6" />
                     </div>
                     <div>
                        <p className="text-xs text-muted-foreground font-bold uppercase">Commission Total</p>
                        <p className="text-2xl font-headline font-bold text-green-500">₦{(profile?.lifetimeEarnings || 0).toLocaleString()}</p>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-secondary/5">
             <CardHeader>
                <CardTitle className="text-lg font-headline flex items-center gap-2">
                   <DollarSign className="size-5 text-green-500" />
                   Bonus Breakdown
                </CardTitle>
                <CardDescription>Earnings based on 5% of your referral's selected investment plan.</CardDescription>
             </CardHeader>
             <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {bonusBreakdown.map((item) => (
                   <div key={item.plan} className="p-3 rounded-xl bg-background border border-border text-center space-y-1">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">{item.plan} Tier</p>
                      <p className="text-sm font-bold text-green-500">{item.bonus}</p>
                   </div>
                ))}
             </CardContent>
          </Card>
        </div>

        <Card className="border-accent/20 bg-accent/5 overflow-hidden h-fit">
          <CardHeader className="bg-accent/10 border-b border-accent/10">
             <CardTitle className="font-headline text-lg flex items-center gap-2">
                <Zap className="size-5 text-accent" />
                Weekly Salary
             </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
             <p className="text-xs text-muted-foreground leading-relaxed">
                Maintain active referrals (users who have purchased a plan) to qualify for weekly payouts.
             </p>
             <div className="space-y-4">
                {salaryTiers.map((tier) => (
                   <div key={tier.count} className={`p-4 rounded-xl border flex justify-between items-center transition-all ${tier.status ? 'bg-accent/20 border-accent/30 shadow-lg' : 'bg-background border-border/50 opacity-60'}`}>
                      <div>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Level: {tier.count} Actives</p>
                         <p className="text-lg font-bold text-accent">{tier.salary} / week</p>
                      </div>
                      {tier.status ? <CheckCircle2 className="size-6 text-accent" /> : <div className="size-6 rounded-full border-2 border-border" />}
                   </div>
                ))}
             </div>
             <p className="text-[10px] text-center text-muted-foreground italic">Referrals are counted when your link users activate any earning plan.</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-secondary/20 p-8 rounded-3xl border border-border mt-12">
         <h4 className="font-headline font-bold text-xl mb-6">Referral Workflow</h4>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
               { step: 1, title: "Share Your Link", desc: "Invite friends via social media or WhatsApp using your unique link." },
               { step: 2, title: "Wait for Activation", desc: "A referral is counted as 'Active' once they purchase an investment plan." },
               { step: 3, title: "Collect Rewards", desc: "Receive 5% commission instantly and qualify for the Weekly Salary program." }
            ].map(item => (
               <div key={item.step} className="space-y-2 relative">
                  <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mb-4">{item.step}</div>
                  <h5 className="font-bold text-lg">{item.title}</h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
