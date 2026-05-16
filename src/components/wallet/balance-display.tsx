
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

  React.useEffect(() => {
    let start = 0
    const end = amount
    if (start === end) return
    
    let totalDuration = 1000
    let increment = end / (totalDuration / 16)
    
    let timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayAmount(end)
        clearInterval(timer)
      } else {
        setDisplayAmount(start)
      }
    }, 16)

    return () => clearInterval(timer)
  }, [amount])

  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
      <p className={cn(
        "text-3xl font-headline font-bold tracking-tight",
        accent ? "text-accent" : "text-foreground"
      )}>
        ${displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  )
}
