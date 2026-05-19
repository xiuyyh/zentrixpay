
'use client';

import * as React from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Wallet, ShieldCheck, Loader2, BarChart3 } from 'lucide-react';

const PLANS = [
  { id: "p15k", name: "₦15,000 PLAN", price: 15000 },
  { id: "p35k", name: "₦35,000 PLAN", price: 35000 },
  { id: "p70k", name: "₦70,000 PLAN", price: 70000 },
  { id: "p100k", name: "₦100,000 PLAN", price: 100000 },
  { id: "p150k", name: "₦150,000 PLAN", price: 150000 },
  { id: "p200k", name: "₦200,000 PLAN", price: 200000 },
  { id: "p300k", name: "₦300,000 PLAN", price: 300000 },
  { id: "p500k", name: "₦500,000 PLAN", price: 500000 },
];

export default function AdminPlansPage() {
  const db = useFirestore();
  const [counts, setCounts] = React.useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCounts() {
      if (!db) return;
      const newCounts: Record<string, number> = {};
      
      try {
        for (const plan of PLANS) {
          const q = query(collection(db, 'users'), where('activePlanId', '==', plan.id));
          const snapshot = await getCountFromServer(q);
          newCounts[plan.id] = snapshot.data().count;
        }
        setCounts(newCounts);
      } catch (e) {
        console.error("Error fetching plan counts", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCounts();
  }, [db]);

  const totalUsers = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalInvoiced = PLANS.reduce((acc, plan) => acc + (plan.price * (counts[plan.id] || 0)), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-headline font-bold text-white tracking-tight">Investment Analytics</h2>
        <p className="text-muted-foreground mt-1">Overview of plan distribution and system liquidity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card className="bg-zinc-900 border-white/5">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Subscribed Users</p>
                    <p className="text-2xl font-headline font-bold text-white mt-1">{totalUsers}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                    <Users className="size-5" />
                </div>
            </CardContent>
         </Card>
         <Card className="bg-zinc-900 border-white/5">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Plan Volume</p>
                    <p className="text-2xl font-headline font-bold text-white mt-1">₦{totalInvoiced.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                    <TrendingUp className="size-5" />
                </div>
            </CardContent>
         </Card>
         <Card className="bg-zinc-900 border-white/5">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Retention Rate</p>
                    <p className="text-2xl font-headline font-bold text-white mt-1">94.2%</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                    <BarChart3 className="size-5" />
                </div>
            </CardContent>
         </Card>
      </div>

      <Card className="bg-zinc-900 border-white/5 overflow-hidden">
        <CardHeader className="bg-white/5">
           <CardTitle className="text-lg">Tier Distribution</CardTitle>
           <CardDescription>Live breakdown of active investment tiers.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-950">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white">Investment Plan</TableHead>
                <TableHead className="text-white">Price</TableHead>
                <TableHead className="text-white">Active Users</TableHead>
                <TableHead className="text-white">Projected Payouts</TableHead>
                <TableHead className="text-right text-white">Yield %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                   <TableCell colSpan={5} className="h-32 text-center">
                      <Loader2 className="size-6 animate-spin mx-auto text-red-500" />
                   </TableCell>
                </TableRow>
              ) : (
                PLANS.map((plan) => (
                  <TableRow key={plan.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell>
                      <span className="font-bold text-white">{plan.name}</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">₦{plan.price.toLocaleString()}</TableCell>
                    <TableCell>
                       <Badge variant="outline" className="border-white/10 text-white bg-white/5">
                         {counts[plan.id] || 0} Members
                       </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                        ₦{((plan.price * 1.2) * (counts[plan.id] || 0)).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-green-500 font-bold">
                       +20%
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
