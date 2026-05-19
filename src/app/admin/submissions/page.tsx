
'use client';

import * as React from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, CheckCircle2, XCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSubmissionsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const submissionsQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'submissions'), orderBy('submittedAt', 'desc'));
  }, [firestore]);

  const { data: submissions, loading } = useCollection(submissionsQuery);

  async function handleVerify(submission: any, status: 'verified' | 'rejected') {
    if (!firestore || processingId) return;
    setProcessingId(submission.id);

    try {
      const submissionRef = doc(firestore, 'submissions', submission.id);
      await updateDoc(submissionRef, { status });

      if (status === 'verified') {
        const userRef = doc(firestore, 'users', submission.userId);
        await updateDoc(userRef, {
          balance: increment(submission.rewardAmount),
          lifetimeEarnings: increment(submission.rewardAmount),
          pendingBalance: increment(-submission.rewardAmount)
        });
      }

      toast({
        title: status === 'verified' ? "Submission Approved" : "Submission Rejected",
        description: `Task for ${submission.companyName} has been processed.`
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
        <h2 className="text-3xl font-headline font-bold text-white tracking-tight">Review Verification</h2>
        <p className="text-muted-foreground mt-1">Audit and approve user review tasks for reward distribution.</p>
      </div>

      <Card className="bg-zinc-900 border-white/5 overflow-hidden">
        <CardHeader className="bg-white/5">
           <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardCheck className="size-5 text-red-500" />
              Incoming Proofs
           </CardTitle>
           <CardDescription>Submissions requiring manual verification.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-950">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white">Company</TableHead>
                <TableHead className="text-white">User ID</TableHead>
                <TableHead className="text-white">Review ID</TableHead>
                <TableHead className="text-white">Reward</TableHead>
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
              ) : submissions?.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No review submissions available for audit.
                   </TableCell>
                </TableRow>
              ) : (
                submissions?.map((sub) => (
                  <TableRow key={sub.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell>
                        <span className="font-bold text-white">{sub.companyName}</span>
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">{sub.userId}</TableCell>
                    <TableCell className="font-mono text-xs text-white underline decoration-white/20 underline-offset-4">{sub.reviewId}</TableCell>
                    <TableCell className="font-bold text-red-500">₦{(sub.rewardAmount || 0).toLocaleString()}</TableCell>
                    <TableCell>
                       <Badge className={
                         sub.status === 'verified' ? "bg-green-500/20 text-green-500" :
                         sub.status === 'rejected' ? "bg-red-500/20 text-red-500" :
                         "bg-blue-500/20 text-blue-500 animate-pulse"
                       }>
                         {sub.status || 'pending'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
                            onClick={() => handleVerify(sub, 'verified')}
                            disabled={sub.status !== 'pending' || !!processingId}
                          >
                            {processingId === sub.id ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => handleVerify(sub, 'rejected')}
                            disabled={sub.status !== 'pending' || !!processingId}
                          >
                            {processingId === sub.id ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
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
