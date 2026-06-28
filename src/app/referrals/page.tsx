
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, collection, query, where, updateDoc, increment } from "firebase/firestore";
import { Copy, Users, Zap, Gift, Smartphone, TrendingUp, CheckCircle2, UserCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ReferralsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [claimingId, setClaimingId] = React.useState<string | null>(null);
  
  const profileRef = React.useMemo(() => user ? doc(db, 'users', user.uid) : null, [user, db]);
  const { data: profile } = useDoc(profileRef);

  // Query to find users referred by the current user - Removed the limit to show all
  const referralsQuery = React.useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users'),
      where('referredBy', '==', user.uid)
    );
  }, [db, user]);

  const { data: referredUsers, loading: referralsLoading } = useCollection(referralsQuery);

  const activeReferralsCount = React.useMemo(() => {
    return referredUsers?.filter((u: any) => u.activePlanId).length || 0;
  }, [referredUsers]);

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

  async function handleClaimReward(refUser: any) {
    if (!db || !user || !refUser.availableReferralReward || refUser.availableReferralReward <= 0) return;
    
    setClaimingId(refUser.id);
    try {
      const rewardAmount = refUser.availableReferralReward;
      
      // 1. Credit the referrer's balance
      const referrerRef = doc(db, 'users', user.uid);
      await updateDoc(referrerRef, {
        balance: increment(rewardAmount),
        lifetimeEarnings: increment(rewardAmount)
      });
      
      // 2. Clear the available reward on the referred user's doc
      const refUserRef = doc(db, 'users', refUser.id);
      await updateDoc(refUserRef, {
        availableReferralReward: 0
      });
      
      toast({
        title: "Reward Claimed!",
        description: `₦${rewardAmount.toLocaleString()} has been added to your balance.`,
      });
    } catch (e: any) {
      toast({
        title: "Claim Failed",
        description: e.message,
        variant: "destructive"
      });
    } finally {
      setClaimingId(null);
    }
  }

  const salaryTiers = [
    { count: 20, salary: "₦10,000", status: activeReferralsCount >= 20 },
    { count: 40, salary: "₦30,000", status: activeReferralsCount >= 40 },
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
               
               <div className="grid grid-cols-1 pt-4">
                  <div className="p-6 rounded-2xl bg-secondary/30 border border-border flex flex-col gap-2">
                     <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <UserCheck className="size-5" />
                     </div>
                     <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Active Referrals (Paid)</p>
                        <p className="text-2xl font-headline font-bold">{activeReferralsCount}</p>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card overflow-hidden">
            <CardHeader className="bg-secondary/10 border-b">
               <CardTitle className="text-lg font-headline">My Referrals</CardTitle>
               <CardDescription>Live tracking of your network registrations.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Member Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Activation</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referralsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        <Loader2 className="size-5 animate-spin mx-auto text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : !referredUsers || referredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground text-xs">
                        No referrals recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    referredUsers.map((refUser: any) => (
                      <TableRow key={refUser.id} className="border-border">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-xs">{refUser.displayName || 'Anonymous'}</span>
                            <span className="text-[10px] text-muted-foreground">{refUser.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {refUser.activePlanId ? (
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-[10px]">
                          {refUser.activePlanId ? refUser.activePlanId.toUpperCase() : '---'}
                        </TableCell>
                        <TableCell className="text-right">
                           {refUser.availableReferralReward > 0 ? (
                              <Button 
                                size="sm" 
                                className="h-7 text-[10px] bg-green-600 hover:bg-green-700 text-white font-bold"
                                onClick={() => handleClaimReward(refUser)}
                                disabled={claimingId === refUser.id}
                              >
                                {claimingId === refUser.id ? <Loader2 className="size-3 animate-spin" /> : `Claim ₦${refUser.availableReferralReward.toLocaleString()}`}
                              </Button>
                           ) : refUser.activePlanId ? (
                              <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/20">Reward Claimed</Badge>
                           ) : (
                              <span className="text-[10px] text-muted-foreground italic">No reward</span>
                           )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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
    </div>
  );
}
