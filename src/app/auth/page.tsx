'use client';

import * as React from 'react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Loader2, AlertCircle, Mail, Lock, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function AuthPage() {
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: authStatusLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');

  const referralCode = searchParams.get('ref');

  React.useEffect(() => {
    if (!authStatusLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authStatusLoading, router]);

  async function handleAuth(mode: 'login' | 'signup') {
    if (isLoading) return;
    setIsLoading(true);
    setAuthError(null);

    try {
      await setPersistence(auth, browserLocalPersistence);
      
      if (mode === 'signup') {
        if (!displayName) throw new Error("Please enter your name.");
        
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName });
        
        const userRef = doc(db, 'users', result.user.uid);
        
        // Initial setup for new users (starting balance 1500 as bonus)
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          displayName: displayName,
          balance: 1500,
          pendingBalance: 0,
          lifetimeEarnings: 1500,
          payoutMethod: 'Bank Transfer',
          referralCount: 0,
          referredBy: referralCode || null,
          role: 'user',
          activePlanId: null,
          hasActivatedFirstPlan: false // Flag to track when they become an "active referral"
        });

        toast({
          title: "Welcome to Zentrix Pay",
          description: "₦1,500 Welcome Bonus has been added to your wallet!",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Auth Error:", error);
      let message = error.message;

      if (error.code === 'auth/operation-not-allowed') {
        message = "Email/Password sign-in is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.";
      } else if (error.code === 'auth/user-not-found') {
        message = "No account found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        message = "Incorrect password.";
      } else if (error.code === 'auth/email-already-in-use') {
        message = "An account already exists with this email.";
      }

      setAuthError(message);
      toast({
        title: mode === 'login' ? "Login Failed" : "Registration Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (authStatusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 lg:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.05),transparent_50%)]" />
      
      <Card className="w-full max-w-5xl border-primary/20 bg-card/50 backdrop-blur-xl relative z-10 shadow-2xl overflow-hidden rounded-3xl">
        <div className="flex flex-col md:flex-row min-h-[600px]">
          <div className="md:w-1/2 bg-gradient-to-br from-primary via-primary/80 to-black p-8 lg:p-12 flex flex-col justify-between relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/seed/zentrix/800/800')] opacity-10 mix-blend-overlay" />
            
            <div className="relative z-10">
              <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-white text-primary shadow-2xl">
                <Zap className="size-7" fill="currentColor" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-headline font-bold tracking-tighter text-white mt-6">
                ZENTRIX<span className="text-black">PAY</span>
              </h1>
              <p className="text-white/80 mt-4 text-lg font-medium max-w-sm">
                Unlock high-payout rewards for your professional brand feedback.
              </p>
            </div>

            <div className="relative z-10 space-y-6">
              {[
                "₦1,500 Instant Signup Bonus",
                "Instant Payouts in Naira",
                "AI-Powered Review Assistance",
                "Secure & Verified Partnerships"
              ].map((text) => (
                <div key={text} className="flex items-center gap-3 text-white/90 font-semibold">
                  <CheckCircle2 className="size-5 text-black" />
                  {text}
                </div>
              ))}
            </div>

            <div className="relative z-10 pt-8 border-t border-white/10">
              <p className="text-xs text-white/60 font-medium italic">
                Join 50,000+ reviewers earning daily.
              </p>
            </div>
          </div>

          <div className="md:w-1/2 p-8 lg:p-12 bg-card/80 flex flex-col justify-center">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-2xl font-headline font-bold tracking-tight">Access Console</h2>
              <p className="text-sm text-muted-foreground mt-1">Manage your feedback tasks and wallet.</p>
              {referralCode && (
                <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary border-primary/20">
                  Referral code active: {referralCode}
                </Badge>
              )}
            </div>

            {authError && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="text-xs">{authError}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary/50 p-1">
                <TabsTrigger value="login" className="font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Login</TabsTrigger>
                <TabsTrigger value="signup" className="font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Join Now</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input 
                      id="email-login" 
                      type="email" 
                      placeholder="name@example.com" 
                      className="pl-10 h-11 bg-background"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input 
                      id="password-login" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 h-11 bg-background"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  className="w-full h-12 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20" 
                  onClick={() => handleAuth('login')}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In to Console"}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="name-signup">Full Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input 
                      id="name-signup" 
                      placeholder="John Doe" 
                      className="pl-10 h-11 bg-background"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input 
                      id="email-signup" 
                      type="email" 
                      placeholder="name@example.com" 
                      className="pl-10 h-11 bg-background"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Create Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input 
                      id="password-signup" 
                      type="password" 
                      placeholder="Min. 6 characters" 
                      className="pl-10 h-11 bg-background"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  className="w-full h-12 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20" 
                  onClick={() => handleAuth('signup')}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Start Earning Rewards"}
                </Button>
              </TabsContent>
            </Tabs>

            <p className="text-[10px] text-muted-foreground text-center mt-8">
              By continuing, you agree to the <span className="text-primary hover:underline cursor-pointer">Zentrix Terms</span> and <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </Card>
      
      <div className="absolute -bottom-24 -right-24 size-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -top-24 -left-24 size-64 bg-accent/5 rounded-full blur-3xl" />
    </div>
  );
}
