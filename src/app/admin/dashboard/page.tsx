
'use client';

import * as React from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, limit, doc, updateDoc, increment } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, Wallet, Loader2, UserCog, PlusCircle, MinusCircle, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PLAN_NAMES: Record<string, string> = {
  "p15k": "₦15,000 Starter",
  "p35k": "₦35,000 Basic",
  "p70k": "₦70,000 Bronze",
  "p100k": "₦100,000 Silver",
  "p150k": "₦150,000 Gold",
  "p200k": "₦200,000 Platinum",
  "p300k": "₦300,000 Diamond",
  "p500k": "₦500,000 Executive",
};

export default function AdminDashboardPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const usersQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), limit(100));
  }, [firestore]);

  const { data: users, loading } = useCollection(usersQuery);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Manage modal state
  const [selectedUser, setSelectedUser] = React.useState<any>(null);
  const [isManageOpen, setIsManageOpen] = React.useState(false);
  const [adjustAmount, setAdjustAmount] = React.useState('');
  const [adjustType, setAdjustType] = React.useState<'add' | 'subtract'>('add');
  const [assignPlan, setAssignPlan] = React.useState('');
  const [newRole, setNewRole] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  const filteredUsers = users?.filter(u =>
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.uid?.includes(searchTerm)
  );

  function openManage(user: any) {
    setSelectedUser(user);
    setAdjustAmount('');
    setAdjustType('add');
    setAssignPlan(user.activePlanId || '');
    setNewRole(user.role || 'user');
    setIsManageOpen(true);
  }

  async function handleSaveChanges() {
    if (!firestore || !selectedUser || isSaving) return;
    setIsSaving(true);

    try {
      const userRef = doc(firestore, 'users', selectedUser.uid);
      const updates: Record<string, any> = {};

      // Balance adjustment
      if (adjustAmount && !isNaN(Number(adjustAmount)) && Number(adjustAmount) > 0) {
        const delta = adjustType === 'add' ? Number(adjustAmount) : -Number(adjustAmount);
        updates.balance = increment(delta);
        if (adjustType === 'add') {
          updates.lifetimeEarnings = increment(delta);
        }
      }

      // Plan assignment
      const resolvedPlan = assignPlan === 'none' ? null : (assignPlan || null);
      if (resolvedPlan !== (selectedUser.activePlanId || null)) {
        updates.activePlanId = resolvedPlan;
      }

      // Role change
      if (newRole && newRole !== selectedUser.role) {
        updates.role = newRole;
      }

      if (Object.keys(updates).length === 0) {
        toast({ title: "No Changes", description: "Nothing to save." });
        setIsSaving(false);
        return;
      }

      await updateDoc(userRef, updates);

      toast({
        title: "User Updated",
        description: `Changes applied to ${selectedUser.displayName || selectedUser.email}.`,
      });
      setIsManageOpen(false);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 px-0">
      <div>
        <h2 className="text-2xl md:text-3xl font-headline font-bold text-white tracking-tight">System Users</h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage platform accounts and financial balances.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-zinc-900 border-white/5">
          <CardContent className="p-3 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">Total Users</p>
              <p className="text-xl md:text-2xl font-headline font-bold text-white mt-1">{users?.length || 0}</p>
            </div>
            <div className="p-2 md:p-3 rounded-xl bg-red-500/10 text-red-500 flex-shrink-0">
              <Users className="size-4 md:size-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-white/5">
          <CardContent className="p-3 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">System Liquidity</p>
              <p className="text-lg md:text-2xl font-headline font-bold text-white mt-1 truncate">
                ₦{(users?.reduce((acc, curr) => acc + (curr.balance || 0), 0) || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-2 md:p-3 rounded-xl bg-green-500/10 text-green-500 flex-shrink-0">
              <Wallet className="size-4 md:size-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-white/5">
          <CardContent className="p-3 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">Active Plans</p>
              <p className="text-xl md:text-2xl font-headline font-bold text-white mt-1">
                {users?.filter(u => u.activePlanId).length || 0}
              </p>
            </div>
            <div className="p-2 md:p-3 rounded-xl bg-blue-500/10 text-blue-500 flex-shrink-0">
              <ShieldCheck className="size-4 md:size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-white/5 overflow-hidden">
        <CardHeader className="bg-white/5 p-3 md:p-6">
          <div className="flex flex-col gap-3">
            <div>
              <CardTitle className="text-base md:text-lg">User Directory</CardTitle>
              <CardDescription className="text-xs md:text-sm">Live database view of all registered members.</CardDescription>
            </div>
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, or UID..."
                className="pl-10 bg-zinc-950 border-white/10 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-950">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-white">Member</TableHead>
                  <TableHead className="text-white">Role</TableHead>
                  <TableHead className="text-white">Plan</TableHead>
                  <TableHead className="text-white">Balance</TableHead>
                  <TableHead className="text-white">Lifetime</TableHead>
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
                ) : filteredUsers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No users found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers?.map((user) => (
                    <TableRow key={user.uid} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{user.displayName || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={user.role === 'admin' ? "border-red-500/50 text-red-500 bg-red-500/5" : "border-white/10 text-muted-foreground"}>
                          {user.role || 'user'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.activePlanId ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">
                            {PLAN_NAMES[user.activePlanId] || user.activePlanId}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">No Plan</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono font-bold text-green-500">
                        ₦{(user.balance || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        ₦{(user.lifetimeEarnings || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-red-500 hover:text-red-400 hover:bg-red-500/10 gap-1.5"
                          onClick={() => openManage(user)}
                        >
                          <UserCog className="size-3.5" />
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3 p-4">
            {loading ? (
              <div className="h-32 flex items-center justify-center">
                <Loader2 className="size-6 animate-spin text-red-500" />
              </div>
            ) : filteredUsers?.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                No users found matching your search.
              </div>
            ) : (
              filteredUsers?.map((user) => (
                <div key={user.uid} className="bg-zinc-950 rounded-lg border border-white/5 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white truncate">{user.displayName || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Badge variant="outline" className={user.role === 'admin' ? "border-red-500/50 text-red-500 bg-red-500/5 text-[10px]" : "border-white/10 text-muted-foreground text-[10px]"}>
                      {user.role || 'user'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-zinc-500 uppercase tracking-wider font-bold mb-1">Balance</p>
                      <p className="font-mono font-bold text-green-500">₦{(user.balance || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 uppercase tracking-wider font-bold mb-1">Lifetime</p>
                      <p className="font-mono text-muted-foreground">₦{(user.lifetimeEarnings || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  {user.activePlanId && (
                    <div>
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] w-full flex justify-center">
                        {PLAN_NAMES[user.activePlanId] || user.activePlanId}
                      </Badge>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-red-500 hover:text-red-400 hover:bg-red-500/10 gap-1.5"
                    onClick={() => openManage(user)}
                  >
                    <UserCog className="size-3.5" />
                    Manage User
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manage User Dialog */}
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent className="sm:max-w-lg bg-zinc-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline text-lg md:text-xl flex items-center gap-2">
              <UserCog className="size-5 text-red-500" />
              Manage User
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs md:text-sm">
              {selectedUser?.displayName} — <span className="font-mono text-xs">{selectedUser?.email}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 md:space-y-6 py-2">
            {/* Current Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-zinc-950 rounded-lg p-3 md:p-4 border border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Current Balance</p>
                <p className="text-lg md:text-xl font-bold text-green-500 font-mono mt-1 truncate">₦{(selectedUser?.balance || 0).toLocaleString()}</p>
              </div>
              <div className="bg-zinc-950 rounded-lg p-3 md:p-4 border border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Lifetime Earned</p>
                <p className="text-lg md:text-xl font-bold text-white font-mono mt-1 truncate">₦{(selectedUser?.lifetimeEarnings || 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Balance Adjustment */}
            <div className="space-y-3 border border-white/5 rounded-lg p-3 md:p-4 bg-zinc-950/50">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Balance Adjustment</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={adjustType === 'add' ? 'default' : 'outline'}
                  className={adjustType === 'add' ? 'bg-green-600 hover:bg-green-700 text-white text-xs' : 'border-white/10 text-zinc-400 text-xs'}
                  onClick={() => setAdjustType('add')}
                >
                  <PlusCircle className="size-3.5 mr-1" /> Credit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={adjustType === 'subtract' ? 'default' : 'outline'}
                  className={adjustType === 'subtract' ? 'bg-red-600 hover:bg-red-700 text-white text-xs' : 'border-white/10 text-zinc-400 text-xs'}
                  onClick={() => setAdjustType('subtract')}
                >
                  <MinusCircle className="size-3.5 mr-1" /> Debit
                </Button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-zinc-400 font-bold">₦</span>
                <Input
                  type="number"
                  placeholder="Enter amount..."
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="pl-8 bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 text-sm"
                />
              </div>
            </div>

            {/* Plan Assignment */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Assign Investment Plan</Label>
              <Select value={assignPlan} onValueChange={setAssignPlan}>
                <SelectTrigger className="bg-zinc-950 border-white/10 text-white text-sm">
                  <SelectValue placeholder="Select a plan..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="none" className="text-zinc-400">No Plan (Remove)</SelectItem>
                  {Object.entries(PLAN_NAMES).map(([id, name]) => (
                    <SelectItem key={id} value={id} className="text-white text-sm">{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Assignment */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-zinc-400">User Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="bg-zinc-950 border-white/10 text-white text-sm">
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="user" className="text-white text-sm">User</SelectItem>
                  <SelectItem value="admin" className="text-red-400 text-sm">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col-reverse sm:flex-row">
            <Button variant="outline" className="border-white/10 text-zinc-400 hover:text-white text-sm w-full sm:w-auto" onClick={() => setIsManageOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white text-sm w-full sm:w-auto"
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 mr-1 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
