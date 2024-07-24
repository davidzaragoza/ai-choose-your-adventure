/**
* This code was generated by v0 by Vercel.
* @see https://v0.dev/t/My5Q9Wdtach
* Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
*/

/** Add fonts into your Next.js project:

import { Inter } from 'next/font/google'

inter({
  subsets: ['latin'],
  display: 'swap',
})

To read more about using these font, please visit the Next.js documentation:
- App Directory: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Pages Directory: https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
**/
"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"

interface Props {
  title: string
  message: string
}

export function LoadingComponent({ title, message }: Props) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => (prevProgress + 10) % 100)
    }, 200)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-background">
      <div className="bg-card p-8 rounded-lg shadow-lg">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-2xl font-bold text-primary">{title}</div>
          <Progress value={progress} className="w-64" />
          <div className="text-muted-foreground">{message}</div>
        </div>
      </div>
    </div>
  )
}
