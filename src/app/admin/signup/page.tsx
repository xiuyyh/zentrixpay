'use client';

import * as React from 'react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldPlus, Loader2, Lock, Mail, User as UserIcon, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';

export default function AdminSignupPage() {
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: authStatusLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');

  React.useEffect(() => {
    if (!authStatusLoading && user) {
      router.push('/admin/dashboard');
    }
  }, [user, authStatusLoading, router]);

  async function handleSignup() {
    if (isLoading) return;
    setAuthError(null);

    if (!displayName || !email || !password) {
      toast({
        title: "Validation Error",
        description: "All fields are required.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(userRef, {
        uid: result.user.uid,
        email: result.user.email,
        displayName: displayName,
        balance: 0,
        pendingBalance: 0,
        lifetimeEarnings: 0,
        payoutMethod: 'Bank Transfer',
        role: 'admin'
      });
      
      toast({
        title: "Admin Created",
        description: "New administrative account initialized successfully.",
      });
      
      router.push('/admin/dashboard');
    } catch (error: any) {
      console.error("Admin Signup Error:", error);
      let message = error.message;

      if (error.code === 'auth/operation-not-allowed') {
        message = "Email/Password sign-in is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.";
      }

      setAuthError(message);
      toast({
        title: "Registration Failed",
        description: message,
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
                <ShieldPlus className="size-7" />
            </div>
            <div>
                <CardTitle className="text-2xl font-headline font-bold text-white">Initialize Admin</CardTitle>
                <CardDescription className="text-zinc-400">Establish new system credentials.</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            {authError && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Action Required</AlertTitle>
                <AlertDescription className="text-xs">{authError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-300">Admin Name</Label>
                <div className="relative">
                <UserIcon className="absolute left-3 top-3 size-4 text-zinc-500" />
                <Input 
                    id="name" 
                    placeholder="Root Administrator" 
                    className="pl-10 h-11 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Admin Email</Label>
                <div className="relative">
                <Mail className="absolute left-3 top-3 size-4 text-zinc-500" />
                <Input 
                    id="email" 
                    type="email" 
                    placeholder="admin@zentrix.pay" 
                    className="pl-10 h-11 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">Security Key</Label>
                <div className="relative">
                <Lock className="absolute left-3 top-3 size-4 text-zinc-500" />
                <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-11 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                </div>
            </div>
            <Button 
                className="w-full h-12 font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 mt-2" 
                onClick={handleSignup}
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Authorize Credentials"}
            </Button>
            
            <div className="text-center mt-4">
              <Link href="/admin/auth" className="text-xs text-zinc-500 hover:text-red-500 transition-colors">
                Return to Login
              </Link>
            </div>

            <p className="text-[10px] text-zinc-600 text-center mt-4">
                Creation of administrative accounts is logged for security audits.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}