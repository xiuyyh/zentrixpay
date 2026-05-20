'use client';

import * as React from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Loader2, LayoutGrid, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PLANS = [
  { id: "p15k", name: "₦15,000 PLAN" },
  { id: "p35k", name: "₦35,000 PLAN" },
  { id: "p70k", name: "₦70,000 PLAN" },
  { id: "p100k", name: "₦100,000 PLAN" },
  { id: "p150k", name: "₦150,000 PLAN" },
  { id: "p200k", name: "₦200,000 PLAN" },
  { id: "p300k", name: "₦300,000 PLAN" },
  { id: "p500k", name: "₦500,000 PLAN" },
];

export default function AdminTasksPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [companyName, setCompanyName] = React.useState('');
  const [rewardAmount, setRewardAmount] = React.useState('');
  const [planId, setPlanId] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [trustpilotUrl, setTrustpilotUrl] = React.useState('');

  const tasksQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'tasks'), orderBy('companyName', 'asc'));
  }, [firestore]);

  const { data: tasks, loading: tasksLoading } = useCollection(tasksQuery);

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!firestore || isSubmitting) return;

    if (!companyName || !rewardAmount || !planId || !description || !trustpilotUrl) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, 'tasks'), {
        companyName,
        rewardAmount: Number(rewardAmount),
        planId,
        description,
        trustpilotUrl,
        createdAt: new Date().toISOString()
      });

      toast({ title: "Task Created", description: `Assigned to ${planId.toUpperCase()} tier.` });
      
      // Reset form
      setCompanyName('');
      setRewardAmount('');
      setPlanId('');
      setDescription('');
      setTrustpilotUrl('');
    } catch (error: any) {
      toast({ title: "Failed to Create Task", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'tasks', taskId));
      toast({ title: "Task Removed", description: "The task has been permanently deleted." });
    } catch (error: any) {
      toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-headline font-bold text-white tracking-tight">Task Manager</h2>
        <p className="text-muted-foreground mt-1">Deploy and manage feedback tasks for specific investment tiers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 bg-zinc-900 border-white/5 h-fit sticky top-20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="size-5 text-red-500" />
              Create New Task
            </CardTitle>
            <CardDescription>Configure a new brand review assignment.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. SwiftPay Solutions" className="bg-zinc-950 border-white/10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Reward (₦)</Label>
                  <Input type="number" value={rewardAmount} onChange={(e) => setRewardAmount(e.target.value)} placeholder="5000" className="bg-zinc-950 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Tier</Label>
                  <Select value={planId} onValueChange={setPlanId}>
                    <SelectTrigger className="bg-zinc-950 border-white/10">
                      <SelectValue placeholder="Select Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANS.map(plan => (
                        <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Trustpilot URL</Label>
                <Input value={trustpilotUrl} onChange={(e) => setTrustpilotUrl(e.target.value)} placeholder="https://trustpilot.com/review/..." className="bg-zinc-950 border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter task brief..." className="bg-zinc-950 border-white/10 min-h-[100px]" />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-11">
                {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : <LayoutGrid className="size-4 mr-2" />}
                Publish Task
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-zinc-900 border-white/5 overflow-hidden">
          <CardHeader className="bg-white/5">
            <CardTitle className="text-lg">Active Inventory</CardTitle>
            <CardDescription>Live list of deployed tasks across all plans.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-zinc-950">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-white">Company</TableHead>
                  <TableHead className="text-white">Tier</TableHead>
                  <TableHead className="text-white">Reward</TableHead>
                  <TableHead className="text-right text-white">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasksLoading ? (
                  <TableRow><TableCell colSpan={4} className="h-32 text-center"><Loader2 className="size-6 animate-spin mx-auto text-red-500" /></TableCell></TableRow>
                ) : tasks?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                         <AlertCircle className="size-5" />
                         <p>No tasks deployed yet. Create your first task to start.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks?.map((task) => (
                    <TableRow key={task.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-bold text-white">{task.companyName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground uppercase">{task.planId}</TableCell>
                      <TableCell className="font-mono text-green-500 font-bold">₦{task.rewardAmount?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
