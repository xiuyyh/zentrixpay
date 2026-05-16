
"use client"

import * as React from "react"
import { generateReviewDraft } from "@/ai/flows/generate-review-draft"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, Loader2, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Slider } from "@/components/ui/slider"

interface ReviewToolProps {
  companyName: string
}

export function ReviewTool({ companyName }: ReviewToolProps) {
  const [experience, setExperience] = React.useState("")
  const [rating, setRating] = React.useState(5)
  const [draft, setDraft] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const { toast } = useToast()

  async function handleGenerate() {
    if (!experience) {
      toast({
        title: "Input Required",
        description: "Please describe your experience first.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await generateReviewDraft({
        companyName,
        userExperience: experience,
        rating,
        keyPoints: ["Professionalism", "Ease of use", "Support"]
      })
      setDraft(result.reviewDraft)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate draft. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
        title: "Copied!",
        description: "Review draft copied to clipboard."
    })
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-accent" />
          <CardTitle className="font-headline text-lg text-accent">AI Review Assistant</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          Describe your genuine experience and we'll help you structure it into a professional review.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="experience">Your honest experience</Label>
          <Textarea 
            id="experience" 
            placeholder="Tell us what you liked or disliked about their service..." 
            className="min-h-[120px] bg-background border-border"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <Label>Rating: {rating} Stars</Label>
          </div>
          <Slider 
            value={[rating]} 
            min={1} 
            max={5} 
            step={1} 
            onValueChange={(val) => setRating(val[0])}
            className="py-2"
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={isLoading}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold"
        >
          {isLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 size-4" />
          )}
          Generate Review Draft
        </Button>

        {draft && (
          <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center">
              <Label className="text-accent">Generated Draft</Label>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 px-2 text-muted-foreground hover:text-accent">
                {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                <span className="ml-2 text-xs">{copied ? "Copied" : "Copy Draft"}</span>
              </Button>
            </div>
            <div className="p-4 rounded-lg bg-background border border-accent/20 text-sm leading-relaxed text-foreground whitespace-pre-wrap italic">
              {draft}
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
               Important: Honest reviews only. AI helps with grammar and structure.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
