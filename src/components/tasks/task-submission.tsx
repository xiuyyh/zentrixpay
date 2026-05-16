
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2, ShieldCheck, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function TaskSubmission() {
  const [reviewId, setReviewId] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const { toast } = useToast()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reviewId) return
    
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      toast({
        title: "Submission Received",
        description: "Your review is now being verified. This usually takes 24-48 hours.",
      })
    }, 1500)
  }

  if (submitted) {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
          <div className="size-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="size-8 text-green-500" />
          </div>
          <div>
            <h3 className="font-headline text-xl font-bold">Review Submitted!</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-2">
              Our team is verifying your review. Once approved, the reward will be added to your pending balance.
            </p>
          </div>
          <Button variant="outline" onClick={() => setSubmitted(false)}>Submit Another Proof</Button>
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
               By submitting, you confirm that the review is honest and complies with Trustpilot's terms. 
               Fabricated reviews may lead to account suspension and forfeiture of rewards.
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={!reviewId || isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12"
          >
            {isSubmitting ? "Verifying..." : "Claim Reward"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
