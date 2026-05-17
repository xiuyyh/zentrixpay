
'use client';

import * as React from 'react';
import { useAuth } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AuthPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);

  async function handleGoogleSignIn() {
    // Prevent multiple simultaneous sign-in attempts which can trigger cancellation errors
    if (isLoading) return;
    
    setIsLoading(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    
    // Force account selection to ensure the popup has active content immediately
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Auth Error:", error);
      
      let message = error.message;
      
      // Handle common Firebase Auth error codes with user-friendly explanations
      if (error.code === 'auth/popup-closed-by-user') {
        message = "The sign-in popup was closed before completion. This can happen if you close the window, or if a browser extension blocked it. Please try again.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        message = "A previous sign-in request was still pending. Please wait a moment and try again.";
      } else if (error.code === 'auth/popup-blocked') {
        message = "The sign-in popup was blocked by your browser. Please allow popups for this site and try again.";
      }

      setAuthError(message);
      
      toast({
        title: "Authentication Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.05),transparent_50%)]" />
      
      <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-xl relative z-10 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="flex aspect-square size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/40 animate-pulse">
              <Zap className="size-8" fill="currentColor" />
            </div>
          </div>
          <CardTitle className="text-4xl font-headline font-bold tracking-tighter">
            ZENTRIX<span className="text-primary">PAY</span>
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground/80">
            Securely access your rewards dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-8 space-y-6">
          {authError && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Failed</AlertTitle>
              <AlertDescription className="text-xs">
                {authError}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Button 
              className="w-full h-14 font-bold text-lg bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all active:scale-95" 
              onClick={handleGoogleSignIn} 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <>
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="currentColor"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="currentColor"
                      opacity="0.8"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="currentColor"
                      opacity="0.6"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="currentColor"
                      opacity="0.9"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground font-medium px-4">
              Access your earnings, marketplace tasks, and instant payouts.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t border-border/50 pt-6">
          <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
            By signing in, you agree to our <span className="text-primary hover:underline cursor-pointer">Terms of Service</span> and <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
          </p>
        </CardFooter>
      </Card>
      
      {/* Decorative background elements */}
      <div className="absolute -bottom-24 -right-24 size-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -top-24 -left-24 size-64 bg-accent/5 rounded-full blur-3xl" />
    </div>
  );
}
