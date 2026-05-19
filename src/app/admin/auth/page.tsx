
'use client';

import * as React from 'react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert, Loader2, Lock, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminAuthPage() {
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: authStatusLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  React.useEffect(() => {
    if (!authStatusLoading && user) {
      // Check if user is admin
      const checkAdmin = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().role === 'admin') {
          router.push('/admin/dashboard');
        }
      };
      checkAdmin();
    }
  }, [user, authStatusLoading, router, db]);

  async function handleLogin() {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists() || userSnap.data().role !== 'admin') {
        throw new Error("Unauthorized access. Admin privileges required.");
      }
      
      router.push('/admin/dashboard');
    } catch (error: any) {
      toast({
        title: "Admin Access Denied",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.1),transparent_50%)]" />
      
      <Card className="w-full max-w-md border-red-500/20 bg-zinc-900/50 backdrop-blur-xl relative z-10 shadow-2xl overflow-hidden rounded-2xl">
        <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex aspect-square size-12 items-center justify-center rounded-2xl bg-red-500 text-white shadow-2xl">
                <ShieldAlert className="size-7" />
            </div>
            <div>
                <CardTitle className="text-2xl font-headline font-bold">Zentrix Admin</CardTitle>
                <CardDescription>Restricted System Access</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <div className="relative">
                <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input 
                    id="email" 
                    type="email" 
                    placeholder="admin@zentrix.pay" 
                    className="pl-10 h-11 bg-background"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Security Key</Label>
                <div className="relative">
                <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-11 bg-background"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                </div>
            </div>
            <Button 
                className="w-full h-12 font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20" 
                onClick={handleLogin}
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify Identity"}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center mt-4">
                Unauthorized attempts are logged and monitored.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
