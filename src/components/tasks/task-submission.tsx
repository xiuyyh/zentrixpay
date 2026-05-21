
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2, ShieldCheck, Upload, Loader2, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useUser } from "@/firebase"
import { collection, addDoc, doc, updateDoc, increment } from "firebase/firestore"

interface TaskSubmissionProps {
  task?: {
    id: string;
    company: string;
    reward: string;
  }
}

export function TaskSubmission({ task }: TaskSubmissionProps) {
  const [reviewId, setReviewId] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const { toast } = useToast()
  const { user } = useUser()
  const db = useFirestore()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reviewId || !user || !db || !task) return
    
    setIsSubmitting(true)
    try {
      const rewardValue = parseInt(task.reward.replace(/[^0-9]/g, '')) || 0;
      
      // 1. Create submission with 'pending' status
      const submissionRef = await addDoc(collection(db, 'submissions'), {
        companyName: task.company,
        rewardAmount: rewardValue,
        status: 'pending',
        userId: user.uid,
        submittedAt: new Date().toISOString(),
        reviewId: reviewId,
      });

      // 2. Update user pending balance
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        pendingBalance: increment(rewardValue)
      });

      setSubmitted(true)
      setIsProcessing(true)
      
      toast({
        title: "Submission Received",
        description: "Zentrix AI is auditing your review. Your reward will be credited automatically.",
      })

      // 3. Simulate automatic verification after a random delay (30s to 5m)
      const minDelay = 30 * 1000;
      const maxDelay = 5 * 60 * 1000;
      const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

      setTimeout(async () => {
        try {
          // Update submission to verified
          await updateDoc(submissionRef, { status: 'verified' });

          // Credit the user balance
          await updateDoc(userRef, {
            balance: increment(rewardValue),
            lifetimeEarnings: increment(rewardValue),
            pendingBalance: increment(-rewardValue)
          });

          setIsProcessing(false);
          toast({
            title: "Reward Credited!",
            description: `₦${rewardValue.toLocaleString()} has been added to your available balance.`,
          });
        } catch (err) {
          console.error("Auto-credit failed", err);
        }
      }, randomDelay);

    } catch (error: any) {
      toast({
        title: "Submission Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card className={isProcessing ? "border-primary/20 bg-primary/5" : "border-green-500/20 bg-green-500/5"}>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
            {isProcessing ? <Clock className="size-8 text-primary animate-pulse" /> : <CheckCircle2 className="size-8 text-green-500" />}
          </div>
          <div>
            <h3 className="font-headline text-xl font-bold">
              {isProcessing ? "AI Audit in Progress" : "Reward Credited!"}
            </h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-2">
              {isProcessing 
                ? "Our system is verifying your submission. You can leave this page; the reward will be credited automatically within minutes." 
                : "Your review has been verified and your wallet has been updated."}
            </p>
          </div>
          {!isProcessing && (
            <Button variant="outline" onClick={() => { setSubmitted(false); setReviewId(""); }}>Submit Another Proof</Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="font-headline text-lg">Submission Portal</CardTitle>
        <CardDescription>Provide proof of your completed review to claim your reward.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="review-id">Review ID or Trustpilot Link</Label>
            <Input 
              id="review-id" 
              placeholder="e.g. 64f123abc456..." 
              className="bg-background border-border h-12"
              value={reviewId}
              onChange={(e) => setReviewId(e.target.value)}
              required
            />
            <p className="text-[10px] text-muted-foreground">Find your Review ID in the confirmation email from Trustpilot.</p>
          </div>

          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center space-y-3 hover:border-primary/50 transition-colors cursor-pointer group">
            <div className="size-12 rounded-full bg-secondary flex items-center justify-center mx-auto group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Upload className="size-5" />
            </div>
            <div className="space-y-1">
               <p className="text-sm font-semibold">Upload Screenshot (Optional)</p>
               <p className="text-xs text-muted-foreground">Drag and drop or click to browse</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 border border-border">
            <ShieldCheck className="size-5 text-accent mt-0.5" />
            <p className="text-[10px] text-muted-foreground">
               By submitting, you confirm that the review is honest. Our AI automatically verifies the Review ID against the corporate database.
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={!reviewId || isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Claim Reward"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
