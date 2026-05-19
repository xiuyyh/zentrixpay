
'use client';

import * as React from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Users, TrendingUp, Wallet, ShieldCheck, Loader2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const firestore = useFirestore();
  const usersQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), limit(50));
  }, [firestore]);

  const { data: users, loading } = useCollection(usersQuery);
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredUsers = users?.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.uid?.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-headline font-bold text-white tracking-tight">System Users</h2>
        <p className="text-muted-foreground mt-1">Manage platform accounts and financial balances.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="bg-zinc-900 border-white/5">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Users</p>
                    <p className="text-2xl font-headline font-bold text-white mt-1">{users?.length || 0}</p>
                </div>
                <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
                    <Users className="size-5" />
                </div>
            </CardContent>
         </Card>
         <Card className="bg-zinc-900 border-white/5">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">System Liquidity</p>
                    <p className="text-2xl font-headline font-bold text-white mt-1">
                        ₦{(users?.reduce((acc, curr) => acc + (curr.balance || 0), 0) || 0).toLocaleString()}
                    </p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                    <Wallet className="size-5" />
                </div>
            </CardContent>
         </Card>
      </div>

      <Card className="bg-zinc-900 border-white/5 overflow-hidden">
        <CardHeader className="bg-white/5">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-lg">User Directory</CardTitle>
                <CardDescription>Live database view of all registered members.</CardDescription>
              </div>
              <div className="relative w-full md:w-72">
                 <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                 <Input 
                   placeholder="Search name, email, or UID..." 
                   className="pl-10 bg-zinc-950 border-white/10"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-950">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white">Member</TableHead>
                <TableHead className="text-white">Role</TableHead>
                <TableHead className="text-white">Balance</TableHead>
                <TableHead className="text-white">Lifetime</TableHead>
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
              ) : filteredUsers?.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
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
                    <TableCell className="font-mono font-bold text-green-500">
                        ₦{(user.balance || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                        ₦{(user.lifetimeEarnings || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-400 hover:bg-red-500/10">Manage</Button>
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
