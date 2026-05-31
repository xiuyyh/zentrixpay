'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Star, ChevronLeft, Info, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ReviewTool } from "@/components/tasks/review-tool"
import { TaskSubmission } from "@/components/tasks/task-submission"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { useFirestore, useDoc } from "@/firebase"
import { doc } from "firebase/firestore"
import { useParams } from "next/navigation"

export default function TaskDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  
  const taskRef = React.useMemo(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'tasks', id);
  }, [firestore, id]);

  const { data: task, loading, error } = useDoc(taskRef);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Retrieving task parameters...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-bold">Task Not Found</h2>
        <p className="text-muted-foreground">The task you are looking for does not exist or has been removed.</p>
        <Link href="/tasks">
          <Button variant="outline">Back to Tasks</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 md:space-y-8 animate-in fade-in duration-500 px-4 md:px-0">
      <Link href="/tasks" className="flex items-center text-xs md:text-sm text-muted-foreground hover:text-accent transition-colors group">
        <ChevronLeft className="size-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Tasks
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 items-start">
            <div className="size-20 sm:size-24 relative rounded-2xl md:rounded-3xl overflow-hidden border-2 border-border bg-white p-3 md:p-4 shrink-0">
               <Image 
                 src={PlaceHolderImages[0].imageUrl} 
                 alt={task.companyName} 
                 fill 
                 className="object-contain"
               />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                 <h1 className="text-xl sm:text-2xl md:text-3xl font-headline font-bold leading-tight">{task.companyName}</h1>
                 <Badge className="bg-primary/20 text-primary border-primary/20 w-fit text-xs md:text-sm">Verified Partner</Badge>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <div className="flex items-center text-yellow-500 font-bold text-sm md:text-base">
                  <Star className="size-4 md:size-5 fill-current mr-1" />
                  4.8
                </div>
                <div className="text-muted-foreground text-xs md:text-sm">
                   Trusted on Trustpilot
                </div>
              </div>
            </div>
          </div>

          <div className="bg-secondary/30 rounded-xl md:rounded-2xl p-4 md:p-6 border border-border">
            <h3 className="font-headline font-semibold flex items-center gap-2 mb-4 text-sm md:text-base">
               <Info className="size-4 md:size-5 text-accent shrink-0" />
               Task Overview
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
              {task.description}
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 md:gap-6">
               <div className="space-y-1">
                  <p className="text-[8px] md:text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Reward</p>
                  <p className="text-lg md:text-xl font-bold text-accent truncate">₦{task.rewardAmount?.toLocaleString()}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[8px] md:text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Est. Time</p>
                  <p className="text-lg md:text-xl font-bold">5-10 min</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[8px] md:text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Approval</p>
                  <p className="text-lg md:text-xl font-bold">99.2%</p>
               </div>
            </div>
          </div>

          <div className="space-y-4">
             <h3 className="font-headline text-base md:text-xl font-bold">Steps to Earn</h3>
             <div className="space-y-3 md:space-y-4">
                {[
                  { step: 1, text: "Click 'Review on Trustpilot' below to open their page." },
                  { step: 2, text: "Sign in and write your honest experience using our AI tool for help." },
                  { step: 3, text: "Submit your review and copy the Review ID from the confirmation." },
                  { step: 4, text: "Enter the ID in our portal to claim your reward." }
                ].map(item => (
                  <div key={item.step} className="flex gap-3 md:gap-4 items-start">
                    <div className="size-7 md:size-8 rounded-full bg-primary flex items-center justify-center font-bold text-xs shrink-0 flex-shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <p className="text-xs md:text-sm font-medium leading-relaxed pt-0.5">{item.text}</p>
                  </div>
                ))}
             </div>
          </div>

          <div className="flex gap-3 md:gap-4">
            <Link href={task.trustpilotUrl || "#"} target="_blank" className="flex-1">
                <Button className="w-full h-11 md:h-14 bg-[#00b67a] hover:bg-[#00b67a]/90 text-white font-bold text-sm md:text-lg rounded-lg md:rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-green-500/10">
                    Review on Trustpilot
                    <ExternalLink className="size-4 md:size-5" />
                </Button>
            </Link>
          </div>

          <ReviewTool companyName={task.companyName} />
        </div>

        <div className="space-y-4 md:space-y-6">
           <TaskSubmission task={{ id: task.id, company: task.companyName, reward: `₦${task.rewardAmount}` }} />

           <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-secondary/20 border border-border space-y-4">
              <h4 className="font-headline font-semibold text-xs md:text-sm">Security & Trust</h4>
              <div className="space-y-2 md:space-y-3">
                 {[
                   "Secure payment processing",
                   "Verified corporate partners",
                   "Manual review audit",
                   "Fraud protection"
                 ].map(text => (
                   <div key={text} className="flex items-center gap-2 text-[11px] md:text-xs text-muted-foreground">
                      <CheckCircle2 className="size-3 text-accent shrink-0" />
                      <span>{text}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
