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
    <div className="max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <Link href="/tasks" className="flex items-center text-sm text-muted-foreground hover:text-accent transition-colors group">
        <ChevronLeft className="size-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Tasks
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="size-24 relative rounded-3xl overflow-hidden border-2 border-border bg-white p-4 shrink-0">
               <Image 
                 src={PlaceHolderImages[0].imageUrl} 
                 alt={task.companyName} 
                 fill 
                 className="object-contain"
               />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <h1 className="text-3xl font-headline font-bold">{task.companyName}</h1>
                 <Badge className="bg-primary/20 text-primary border-primary/20">Verified Partner</Badge>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center text-yellow-500 font-bold">
                  <Star className="size-5 fill-current mr-1" />
                  4.8
                </div>
                <div className="text-muted-foreground text-sm">
                   Trusted on Trustpilot
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
                  <p className="text-xl font-bold text-accent">₦{task.rewardAmount?.toLocaleString()}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Est. Time</p>
                  <p className="text-xl font-bold">5-10 mins</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Approval Rate</p>
                  <p className="text-xl font-bold">99.2%</p>
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
            <Link href={task.trustpilotUrl || "#"} target="_blank" className="flex-1">
                <Button className="w-full h-14 bg-[#00b67a] hover:bg-[#00b67a]/90 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-green-500/10">
                    Review on Trustpilot
                    <ExternalLink className="size-5" />
                </Button>
            </Link>
          </div>

          <ReviewTool companyName={task.companyName} />
        </div>

        <div className="space-y-6">
           <TaskSubmission task={{ id: task.id, company: task.companyName, reward: `₦${task.rewardAmount}` }} />

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
