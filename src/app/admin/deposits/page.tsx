
'use client';

import * as React from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, CheckCircle2, XCircle, Loader2, ArrowDownCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminDepositsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const depositsQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'deposits'), orderBy('submittedAt', 'desc'));
  }, [firestore]);

  const { data: deposits, loading } = useCollection(depositsQuery);

  async function handleAction(deposit: any, status: 'approved' | 'rejected') {
    if (!firestore || processingId) return;
    setProcessingId(deposit.id);

    try {
      const depositRef = doc(firestore, 'deposits', deposit.id);
      await updateDoc(depositRef, { status });

      if (status === 'approved') {
        const userRef = doc(firestore, 'users', deposit.userId);
        await updateDoc(userRef, {
          balance: increment(deposit.amount)
        });
      }

      toast({
        title: status === 'approved' ? "Deposit Approved" : "Deposit Rejected",
        description: `Wallet of ${deposit.userEmail} has been processed.`
      });
    } catch (error: any) {
      toast({
        title: "Process Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-headline font-bold text-white tracking-tight">Deposit Audit</h2>
        <p className="text-muted-foreground mt-1">Verify incoming wallet funding requests and update balances.</p>
      </div>

      <Card className="bg-zinc-900 border-white/5 overflow-hidden">
        <CardHeader className="bg-white/5">
           <CardTitle className="text-lg flex items-center gap-2">
              <ArrowDownCircle className="size-5 text-red-500" />
              Pending Deposits
           </CardTitle>
           <CardDescription>Incoming manual transfer confirmations.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-950">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white">Date</TableHead>
                <TableHead className="text-white">User Email</TableHead>
                <TableHead className="text-white">Amount</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-right text-white">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                   <TableCell colSpan={5} className="h-32 text-center">
                      <Loader2 className="size-6 animate-spin mx-auto text-red-500" />
                   </TableCell>
                </TableRow>
              ) : deposits?.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No deposit requests found.
                   </TableCell>
                </TableRow>
              ) : (
                deposits?.map((dep) => (
                  <TableRow key={dep.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="text-xs text-muted-foreground">
                        {new Date(dep.submittedAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-white font-medium">{dep.userEmail}</TableCell>
                    <TableCell className="font-bold text-green-500 font-mono">₦{(dep.amount || 0).toLocaleString()}</TableCell>
                    <TableCell>
                       <Badge className={
                         dep.status === 'approved' ? "bg-green-500/20 text-green-500" :
                         dep.status === 'rejected' ? "bg-red-500/20 text-red-500" :
                         "bg-blue-500/20 text-blue-500 animate-pulse"
                       }>
                         {dep.status || 'pending'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
                            onClick={() => handleAction(dep, 'approved')}
                            disabled={dep.status !== 'pending' || !!processingId}
                          >
                            {processingId === dep.id ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => handleAction(dep, 'rejected')}
                            disabled={dep.status !== 'pending' || !!processingId}
                          >
                            {processingId === dep.id ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
                          </Button>
                       </div>
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
