
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { History, CheckCircle2, Clock, XCircle, Loader2, ArrowRight } from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import Link from "next/link";

export default function HistoryPage() {
  const { user } = useUser();
  const db = useFirestore();

  const submissionsQuery = React.useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'submissions'),
      where('userId', '==', user.uid),
      orderBy('submittedAt', 'desc')
    );
  }, [db, user]);

  const { data: submissions, loading } = useCollection(submissionsQuery);

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight">Earning History</h2>
        <p className="text-muted-foreground mt-1">Audit of your completed tasks and distributed rewards.</p>
      </div>

      <Card className="border-border bg-card overflow-hidden">
        <CardHeader className="bg-secondary/10 border-b">
           <div className="flex items-center gap-2">
              <History className="size-5 text-primary" />
              <CardTitle className="text-lg">Recent Activities</CardTitle>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-background">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-[180px]">Date</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                   <TableCell colSpan={5} className="h-32 text-center">
                      <Loader2 className="size-6 animate-spin mx-auto text-primary" />
                   </TableCell>
                </TableRow>
              ) : !submissions || submissions.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No task history found. Complete your first task to see it here.
                   </TableCell>
                </TableRow>
              ) : (
                submissions.map((sub: any) => (
                  <TableRow key={sub.id} className="border-border hover:bg-secondary/20 transition-colors">
                    <TableCell className="text-xs text-muted-foreground">
                        {new Date(sub.submittedAt).toLocaleDateString()} at {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell>
                        <span className="font-bold text-white">{sub.companyName}</span>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-accent">
                        ₦{(sub.rewardAmount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          {sub.status === 'verified' ? (
                            <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                              <CheckCircle2 className="size-3 mr-1" />
                              Verified
                            </Badge>
                          ) : sub.status === 'pending' ? (
                            <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 animate-pulse">
                              <Clock className="size-3 mr-1" />
                              Auditing
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
                              <XCircle className="size-3 mr-1" />
                              Rejected
                            </Badge>
                          )}
                       </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <Link href="/tasks">
                          <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">
                            Next Task <ArrowRight className="size-3 ml-1" />
                          </Badge>
                       </Link>
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
