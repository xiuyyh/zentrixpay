'use client';

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ArrowRight, Loader2, LayoutGrid, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useFirestore, useCollection, useUser, useDoc } from "@/firebase"
import { collection, query, where, doc } from "firebase/firestore"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export default function TasksPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  
  const userProfileRef = React.useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile } = useDoc(userProfileRef);

  const tasksQuery = React.useMemo(() => {
    if (!firestore || !profile?.activePlanId) return null;
    // Only show tasks that match the user's active plan
    return query(collection(firestore, 'tasks'), where('planId', '==', profile.activePlanId));
  }, [firestore, profile?.activePlanId]);

  const { data: tasks, loading } = useCollection(tasksQuery);

  const PLAN_NAMES: Record<string, { name: string; description: string }> = {
    "p15k": { name: "₦15,000 Starter", description: "Entry-level earning tier" },
    "p35k": { name: "₦35,000 Basic", description: "Beginner advantage tier" },
    "p70k": { name: "₦70,000 Bronze", description: "Intermediate tier access" },
    "p100k": { name: "₦100,000 Silver", description: "Enhanced rewards tier" },
    "p150k": { name: "₦150,000 Gold", description: "Premium earning status" },
    "p200k": { name: "₦200,000 Platinum", description: "Elite member tier" },
    "p300k": { name: "₦300,000 Diamond", description: "Highest tier access" },
    "p500k": { name: "₦500,000 Executive", description: "VIP exclusive tier" },
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">Available Tasks</h2>
          <p className="text-muted-foreground">Select a company to review and start earning rewards for your feedback.</p>
        </div>
        {!profile?.activePlanId && (
          <Badge variant="destructive" className="animate-pulse">Active Plan Required</Badge>
        )}
      </div>

      {profile?.activePlanId && (
        <Card className="border-accent/40 bg-accent/5">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/20 text-accent">
                <Zap className="size-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Your Current Tier</p>
                <p className="text-xl font-headline font-bold text-foreground">{PLAN_NAMES[profile.activePlanId]?.name || profile.activePlanId}</p>
                <p className="text-xs text-muted-foreground mt-1">{PLAN_NAMES[profile.activePlanId]?.description}</p>
              </div>
            </div>
            <Link href="/plans">
              <Button variant="outline" className="border-accent/40 hover:bg-accent/10 font-semibold">Upgrade Tier</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
           <Loader2 className="size-8 animate-spin text-primary" />
           <p className="text-sm text-muted-foreground">Loading available opportunities...</p>
        </div>
      ) : !profile?.activePlanId ? (
        <Card className="border-dashed border-2 bg-secondary/10">
           <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                 <LayoutGrid className="size-8 text-primary" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-bold">No Active Plan Found</h3>
                 <p className="text-muted-foreground max-w-sm">You must purchase an investment plan to unlock daily review tasks and start earning.</p>
              </div>
              <Link href="/plans">
                <Button className="bg-primary hover:bg-primary/90 font-bold">View Plans</Button>
              </Link>
           </CardContent>
        </Card>
      ) : tasks.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-2">
            <p className="text-muted-foreground">No tasks currently available for your plan tier.</p>
            <p className="text-xs text-muted-foreground">Check back later for new updates.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task: any) => (
            <Card key={task.id} className="group border-border/50 bg-card hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 flex flex-col">
              <CardHeader className="p-6">
                <div className="flex justify-between items-start">
                  <div className="size-14 relative rounded-2xl overflow-hidden border bg-white p-2">
                    <Image 
                      src={PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)].imageUrl} 
                      alt={task.companyName} 
                      fill 
                      className="object-contain"
                    />
                  </div>
                  <Badge className="bg-accent text-accent-foreground font-bold text-sm h-8 rounded-lg">
                    ₦{task.rewardAmount?.toLocaleString()}
                  </Badge>
                </div>
                <div className="mt-4">
                  <CardTitle className="font-headline text-xl group-hover:text-accent transition-colors">
                    {task.companyName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                </div>
              </CardHeader>
              <CardContent className="px-6 flex-grow">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center text-yellow-500">
                    <Star className="size-4 fill-current mr-1" />
                    <span className="font-bold text-foreground">4.5+</span>
                  </div>
                  <div className="text-muted-foreground">Verified Brand</div>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0 mt-auto">
                <Link href={`/tasks/${task.id}`} className="w-full">
                  <Button className="w-full bg-secondary hover:bg-primary text-foreground hover:text-white transition-all font-semibold h-11">
                    View Task Details
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
