'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const { toast } = useToast()
  return (
    <div className="min-h-full flex items-center justify-center">
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight lg:text-6xl text-primary">
          Welcome to your Kanban Board!
        </h1>
        <p className="mt-6 text-xl text-muted-foreground max-w-[600px] mx-auto">
          Start organizing your tasks and projects with ease.
        </p>
      </section>
    </div>
  )
}


