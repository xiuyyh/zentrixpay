
'use client';

import * as React from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Banknote, CheckCircle2, XCircle, Loader2, ArrowUpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminWithdrawalsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const withdrawalsQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'withdrawals'), orderBy('submittedAt', 'desc'));
  }, [firestore]);

  const { data: withdrawals, loading } = useCollection(withdrawalsQuery);

  async function handleAction(withdrawal: any, status: 'approved' | 'rejected') {
    if (!firestore || processingId) return;
    setProcessingId(withdrawal.id);

    try {
      const withdrawalRef = doc(firestore, 'withdrawals', withdrawal.id);
      await updateDoc(withdrawalRef, { status });

      if (status === 'rejected') {
        // Refund the user if rejected
        const userRef = doc(firestore, 'users', withdrawal.userId);
        await updateDoc(userRef, {
          balance: increment(withdrawal.amount)
        });
      }

      toast({
        title: status === 'approved' ? "Withdrawal Paid" : "Withdrawal Rejected",
        description: `Request for ${withdrawal.userEmail} has been ${status}.`
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
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl md:text-3xl font-headline font-bold text-white tracking-tight">Payout Management</h2>
        <p className="text-muted-foreground mt-1 text-sm">Audit and process user withdrawal requests to bank accounts.</p>
      </div>

      <Card className="bg-zinc-900 border-white/5 overflow-hidden">
        <CardHeader className="bg-white/5 p-4 md:p-6">
           <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Banknote className="size-4 md:size-5 text-red-500" />
              Pending Withdrawals
           </CardTitle>
           <CardDescription className="text-xs md:text-sm">Active requests requiring disbursement.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-950">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-white">Date</TableHead>
                  <TableHead className="text-white">User Email</TableHead>
                  <TableHead className="text-white">Bank Details</TableHead>
                  <TableHead className="text-white">Amount</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-right text-white">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                     <TableCell colSpan={6} className="h-32 text-center">
                        <Loader2 className="size-6 animate-spin mx-auto text-red-500" />
                     </TableCell>
                  </TableRow>
                ) : withdrawals?.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        No withdrawal requests found.
                     </TableCell>
                  </TableRow>
                ) : (
                  withdrawals?.map((w) => (
                    <TableRow key={w.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="text-[10px] text-muted-foreground">
                          {new Date(w.submittedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-white font-medium text-xs">{w.userEmail}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground max-w-[200px] truncate">
                          {w.bankDetails}
                      </TableCell>
                      <TableCell className="font-bold text-red-500 font-mono">₦{w.amount.toLocaleString()}</TableCell>
                      <TableCell>
                         <Badge className={
                           w.status === 'approved' ? "bg-green-500/20 text-green-500" :
                           w.status === 'rejected' ? "bg-red-500/20 text-red-500" :
                           "bg-yellow-500/20 text-yellow-500 animate-pulse"
                         }>
                           {w.status || 'pending'}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
                              onClick={() => handleAction(w, 'approved')}
                              disabled={w.status !== 'pending' || !!processingId}
                            >
                              {processingId === w.id ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                              onClick={() => handleAction(w, 'rejected')}
                              disabled={w.status !== 'pending' || !!processingId}
                            >
                              {processingId === w.id ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
                            </Button>
                         </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden space-y-3 p-4">
            {loading ? (
              <div className="h-32 flex items-center justify-center">
                <Loader2 className="size-6 animate-spin text-red-500" />
              </div>
            ) : withdrawals?.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                No withdrawal requests found.
              </div>
            ) : (
              withdrawals?.map((w) => (
                <div key={w.id} className="bg-zinc-950 rounded-lg border border-white/5 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white text-sm truncate">{w.userEmail}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{w.bankDetails}</p>
                    </div>
                    <Badge className={
                      w.status === 'approved' ? "bg-green-500/20 text-green-500 text-xs ml-2" :
                      w.status === 'rejected' ? "bg-red-500/20 text-red-500 text-xs ml-2" :
                      "bg-yellow-500/20 text-yellow-500 animate-pulse text-xs ml-2"
                    }>
                      {w.status || 'pending'}
                    </Badge>
                  </div>
                  <div className="mb-3">
                    <p className="font-bold text-red-500 font-mono text-base">₦{w.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{new Date(w.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-green-500 hover:text-green-400 hover:bg-green-500/10 text-xs h-8"
                      onClick={() => handleAction(w, 'approved')}
                      disabled={w.status !== 'pending' || !!processingId}
                    >
                      {processingId === w.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3 mr-1" />}
                      Approve
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 text-xs h-8"
                      onClick={() => handleAction(w, 'rejected')}
                      disabled={w.status !== 'pending' || !!processingId}
                    >
                      {processingId === w.id ? <Loader2 className="size-3 animate-spin" /> : <XCircle className="size-3 mr-1" />}
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
