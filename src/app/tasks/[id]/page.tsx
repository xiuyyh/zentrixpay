
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Star, ChevronLeft, Info, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ReviewTool } from "@/components/tasks/review-tool"
import { TaskSubmission } from "@/components/tasks/task-submission"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { notFound } from "next/navigation"

const tasks = [
  {
    id: "1",
    company: "SwiftPay Solutions",
    reward: "$5.00",
    category: "Fintech",
    rating: 4.8,
    reviews: 1240,
    difficulty: "Low",
    image: PlaceHolderImages[2].imageUrl,
    description: "SwiftPay Solutions provides fast and secure cross-border payment processing for startups and enterprises. We are looking for genuine feedback regarding our transaction speed and onboarding process.",
    trustpilotUrl: "https://www.trustpilot.com/review/swiftpaysolutions.com"
  },
  {
    id: "2",
    company: "EcoSphere Systems",
    reward: "$7.50",
    category: "Software",
    rating: 4.2,
    reviews: 850,
    difficulty: "Medium",
    image: PlaceHolderImages[1].imageUrl,
    description: "EcoSphere Systems is an all-in-one sustainability management platform. Share your experience with our dashboard and carbon footprint calculation accuracy.",
    trustpilotUrl: "https://www.trustpilot.com/review/ecospheresystems.io"
  },
  {
      id: "3",
      company: "HealthCore AI",
      reward: "$4.00",
      category: "HealthTech",
      rating: 4.5,
      reviews: 2100,
      difficulty: "Low",
      image: PlaceHolderImages[3].imageUrl,
      description: "HealthCore AI provides AI-powered medical transcription and scheduling. Let us know how our tool has improved your clinic's workflow.",
      trustpilotUrl: "https://www.trustpilot.com/review/healthcore.ai"
  },
  {
      id: "4",
      company: "Logix Global",
      reward: "$12.00",
      category: "Logistics",
      rating: 3.9,
      reviews: 4500,
      difficulty: "High",
      image: PlaceHolderImages[0].imageUrl,
      description: "Logix Global is a leading supply chain logistics provider. We value feedback on our international shipping reliability and container tracking system.",
      trustpilotUrl: "https://www.trustpilot.com/review/logixglobal.com"
  }
]

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const task = tasks.find(t => t.id === id)

  if (!task) {
    return notFound()
  }

  return (
    <div className="max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <Link href="/tasks" className="flex items-center text-sm text-muted-foreground hover:text-accent transition-colors group">
        <ChevronLeft className="size-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="size-24 relative rounded-3xl overflow-hidden border-2 border-border bg-white p-4 shrink-0">
               <Image 
                 src={task.image} 
                 alt={task.company} 
                 fill 
                 className="object-contain"
               />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <h1 className="text-3xl font-headline font-bold">{task.company}</h1>
                 <Badge className="bg-primary/20 text-primary border-primary/20">{task.category}</Badge>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center text-yellow-500 font-bold">
                  <Star className="size-5 fill-current mr-1" />
                  {task.rating}
                </div>
                <div className="text-muted-foreground text-sm">
                   {task.reviews.toLocaleString()} reviews on Trustpilot
                </div>
              </div>
            </div>
          </div>

          <div className="bg-secondary/30 rounded-2xl p-6 border border-border">
            <h3 className="font-headline font-semibold flex items-center gap-2 mb-4">
               <Info className="size-5 text-accent" />
               Task Overview
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {task.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-6">
               <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Reward</p>
                  <p className="text-xl font-bold text-accent">{task.reward}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Est. Time</p>
                  <p className="text-xl font-bold">5-10 mins</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Approval Rate</p>
                  <p className="text-xl font-bold">98%</p>
               </div>
            </div>
          </div>

          <div className="space-y-4">
             <h3 className="font-headline text-xl font-bold">Steps to Earn</h3>
             <div className="space-y-4">
                {[
                  { step: 1, text: "Click 'Review on Trustpilot' below to open their page." },
                  { step: 2, text: "Sign in and write your honest experience using our AI tool for help." },
                  { step: 3, text: "Submit your review and copy the Review ID from the confirmation." },
                  { step: 4, text: "Enter the ID in our portal to claim your reward." }
                ].map(item => (
                  <div key={item.step} className="flex gap-4 items-center">
                    <div className="size-8 rounded-full bg-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {item.step}
                    </div>
                    <p className="text-sm font-medium">{item.text}</p>
                  </div>
                ))}
             </div>
          </div>

          <div className="flex gap-4">
            <Link href={task.trustpilotUrl} target="_blank" className="flex-1">
                <Button className="w-full h-14 bg-[#00b67a] hover:bg-[#00b67a]/90 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-green-500/10">
                    Review on Trustpilot
                    <ExternalLink className="size-5" />
                </Button>
            </Link>
          </div>

          <ReviewTool companyName={task.company} />
        </div>

        <div className="space-y-6">
           <TaskSubmission />

           <div className="p-6 rounded-2xl bg-secondary/20 border border-border space-y-4">
              <h4 className="font-headline font-semibold text-sm">Security & Trust</h4>
              <div className="space-y-3">
                 {[
                   "Secure payment processing",
                   "Verified corporate partners",
                   "Manual review audit",
                   "Fraud protection"
                 ].map(text => (
                   <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="size-3 text-accent" />
                      {text}
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
