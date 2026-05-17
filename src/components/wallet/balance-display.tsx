
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface BalanceDisplayProps {
  amount: number
  label: string
  className?: string
  accent?: boolean
}

export function BalanceDisplay({ amount, label, className, accent }: BalanceDisplayProps) {
  const [displayAmount, setDisplayAmount] = React.useState(0)
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
    let start = 0
    const end = amount
    if (start === end) {
        setDisplayAmount(end)
        return
    }
    
    const duration = 1000
    const frameDuration = 1000 / 60
    const totalFrames = Math.round(duration / frameDuration)
    let frame = 0

    const timer = setInterval(() => {
      frame++
      const progress = frame / totalFrames
      const current = end * progress

      if (frame === totalFrames) {
        setDisplayAmount(end)
        clearInterval(timer)
      } else {
        setDisplayAmount(current)
      }
    }, frameDuration)

    return () => clearInterval(timer)
  }, [amount])

  const formattedAmount = isMounted 
    ? displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : amount.toFixed(2)

  return (
    <div className={cn("space-y-1 min-w-0 flex flex-col", className)}>
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold truncate">{label}</p>
      <p className={cn(
        "text-xl sm:text-2xl lg:text-3xl font-headline font-bold tracking-tight break-all md:break-normal",
        accent ? "text-primary" : "text-foreground"
      )}>
        <span className="text-muted-foreground/40 font-normal mr-0.5">₦</span>
        {formattedAmount}
      </p>
    </div>
  )
}
